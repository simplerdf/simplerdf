var rdf = require('rdf-ext')
var SimpleArray = require('./lib/array')

function buildIri (iri) {
  if (typeof iri === 'string') {
    return rdf.createNamedNode(iri)
  } else {
    return iri || rdf.createBlankNode()
  }
}

function updateSubject (graph, oldSubject, newSubject) {
  graph.match(oldSubject).forEach(function (triple) {
    graph.remove(triple)
    graph.add(rdf.createTriple(newSubject, triple.predicate, triple.object))
  })
}

function updateObject (graph, oldObject, newObject) {
  graph.match(null, null, oldObject).forEach(function (triple) {
    graph.remove(triple)
    graph.add(rdf.createTriple(triple.subject, triple.predicate, newObject))
  })
}

function addValues (self, predicate, options, values) {
  if (!Array.isArray(values)) {
    values = [values]
  }

  values.forEach(function (value) {
    if (typeof value === 'string') {
      if (options.namedNode) {
        self._graph.add(rdf.createTriple(self._iri, predicate, rdf.createNamedNode(value)))
      } else {
        self._graph.add(rdf.createTriple(self._iri, predicate, rdf.createLiteral(value)))
      }
    } else if (typeof value === 'object') {
      if (value.interfaceName) {
        self._graph.add(rdf.createTriple(self._iri, predicate, value))
      } else {
        self._graph.add(rdf.createTriple(self._iri, predicate, value._iri))
      }
    } else {
      console.warn('unsupported type: ' + typeof value)
    }
  })
}

function getValuesArray (self, predicate, options) {
  return self._graph.match(self._iri, predicate).map(function (triple) {
    if (triple.object.interfaceName === 'BlankNode') {
      return self.child(triple.object)
    } else {
      return triple.object.toString()
    }
  })
}

function getValues (self, predicate, options) {
  var values = getValuesArray(self, predicate, options)

  if (!options.array) {
    values = values.shift()
  } else {
    values = self._arrays[predicate] || (self._arrays[predicate] = new SimpleArray(
        addValues.bind(null, self, predicate, options),
        getValues.bind(null, self, predicate. options),
        removeValues.bind(null, self, predicate, options),
        getValuesArray(self, predicate, options)
      ))
  }

  return values
}

function removeValues (self, predicate, options) {
  self._graph.removeMatches(self._iri, predicate)
}

function addProperty (property, predicate, options) {
  options = options || {}

  predicate = rdf.createNamedNode(predicate.toString())

  Object.defineProperty(this, property, {
    configurable: true,
    get: function () {
      return getValues(this, predicate, options)
    },
    set: function (values) {
      removeValues(this, predicate, options)
      addValues(this, predicate, options, values)
    }
  })
}

function SimpleRDF (context, iri, graph) {
  if (!(this instanceof SimpleRDF)) {
    return new SimpleRDF(context, iri, graph)
  }

  this._iri = buildIri(iri)
  this._arrays = {}

  this.context(context)
  this.graph(graph || rdf.createGraph())
}

SimpleRDF.prototype.toString = function () {
  return this._graph.toString()
}

SimpleRDF.prototype.context = function (context) {
  var self = this

  self._context = context

  if (!self._context) {
    return self
  }

  Object.keys(context).forEach(function (key) {
    var value = context[key]
    var options = {}

    if (typeof value === 'string') {
      // access values with full IRI
      addProperty.call(self, value, value, options)

      // access values with short property
      addProperty.call(self, key, value, options)
    } else {
      options.array = '@array' in value && value['@array']
      options.namedNode = '@type' in value && value['@type'] === '@id'

      addProperty.call(self, value['@id'], value['@id'], options)
      addProperty.call(self, key, value['@id'], options)
    }
  })

  return self
}

SimpleRDF.prototype.iri = function (iri) {
  iri = buildIri(iri)

  updateSubject(this._graph, this._iri, iri)
  updateObject(this._graph, this._iri, iri)

  this._iri = iri

  return this
}

SimpleRDF.prototype.graph = function (graph) {
  var self = this

  self._graph = graph

  self._graph.match(self._iri).forEach(function (triple) {
    var descriptor = Object.getOwnPropertyDescriptor(self, triple.predicate.toString())

    if (!descriptor) {
      addProperty.call(self, triple.predicate.toString(), triple.predicate.toString())
    }
  })

  return self
}

SimpleRDF.prototype.child = function (iri) {
  return new SimpleRDF(this._context, iri, this._graph)
}

SimpleRDF.isArray = function (obj) {
  return obj instanceof SimpleArray
}

module.exports = SimpleRDF
