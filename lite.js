var rdf = require('rdf-ext')
var SimpleArray = require('./lib/array')
var SimpleContext = require('./lib/context')

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
        self._objects[predicate] = value
      }
    } else if (typeof value === 'boolean') {
      self._graph.add(rdf.createTriple(
        self._iri,
        predicate,
        rdf.createLiteral(value, null, 'http://www.w3.org/2001/XMLSchema#boolean')))
    } else if (typeof value === 'number') {
      self._graph.add(rdf.createTriple(
        self._iri,
        predicate,
        rdf.createLiteral(value, null, rdf.createNamedNode('http://www.w3.org/2001/XMLSchema#double'))))
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
  if (predicate in self._objects) {
    return self._objects[predicate]
  }

  var values = getValuesArray(self, predicate, options)

  if (!options.array) {
    values = values.shift()
  } else {
    values = self._objects[predicate] = new SimpleArray(
        addValues.bind(null, self, predicate, options),
        getValues.bind(null, self, predicate. options),
        removeValues.bind(null, self, predicate, options),
        getValuesArray(self, predicate, options)
      )
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
  this._objects = {}

  this.context(context)
  this.graph(graph || rdf.createGraph())
}

SimpleRDF.prototype.toString = function () {
  return this._graph.toString()
}

SimpleRDF.prototype.context = function (context) {
  var self = this

  if (context) {
    self._context = context instanceof SimpleContext ? context : new SimpleContext(context)

    self._context.descriptions().forEach(function (description) {
      // access values with full IRI
      addProperty.call(self, description.predicate, description.predicate, description.options)

      // access values with short property
      addProperty.call(self, description.property, description.predicate, description.options)
    })
  }

  return self._context
}

SimpleRDF.prototype.iri = function (iri) {
  if (iri) {
    iri = buildIri(iri)

    updateSubject(this._graph, this._iri, iri)
    updateObject(this._graph, this._iri, iri)

    this._iri = iri
  }

  return this._iri
}

SimpleRDF.prototype.graph = function (graph) {
  var self = this

  if (graph) {
    self._graph = graph

    self._graph.match(self._iri).forEach(function (triple) {
      var descriptor = Object.getOwnPropertyDescriptor(self, triple.predicate.toString())

      if (!descriptor) {
        addProperty.call(self, triple.predicate.toString(), triple.predicate.toString())
      }
    })
  }

  return self._graph
}

SimpleRDF.prototype.child = function (iri) {
  return new SimpleRDF(this._context, iri, this._graph)
}

SimpleRDF.isArray = function (obj) {
  return obj instanceof SimpleArray
}

module.exports = SimpleRDF
