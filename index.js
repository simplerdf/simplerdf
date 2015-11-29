var rdf = require('rdf-ext')
var LdpStore = require('rdf-store-ldp')

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
      self._graph.add(rdf.createTriple(self._iri, predicate, rdf.createLiteral(value)))
    } else if (typeof value === 'object') {
      self._graph.add(rdf.createTriple(self._iri, predicate, value._iri))
    } else {
      console.warn('unsupported type: ' + typeof value)
    }
  })
}

function getValues (self, predicate, options) {
  var values = self._graph.match(self._iri, predicate).map(function (triple) {
    if (triple.object.interfaceName === 'BlankNode') {
      return self.child(triple.object)
    } else {
      return triple.object.toString()
    }
  })

  if (!options.array) {
    values = values.shift()
  } else {
    // TODO: support all array access methods
    values.push = function (item) {
      addValues(self, predicate, options, item)
    }
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

function SimpleRDF (context, iri, graph, store) {
  if (!(this instanceof SimpleRDF)) {
    return new SimpleRDF(context, iri, graph, store)
  }

  this._iri = buildIri(iri)
  this._store = store || new LdpStore()

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
  return new SimpleRDF(this._context, iri, this._graph, this._store)
}

SimpleRDF.prototype.get = function () {
  var self = this

  return self._store.graph(self._iri.toString()).then(function (graph) {
    self.graph(graph)

    return self
  })
}

SimpleRDF.prototype.save = function () {
  var self = this

  return self._store.add(self._iri.toString(), self._graph).then(function () {
    return self
  })
}

module.exports = SimpleRDF
