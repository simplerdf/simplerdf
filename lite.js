'use strict'

const rdf = require('rdf-ext')
const SimpleArray = require('./lib/array')
const SimpleContext = require('./lib/context')

class SimpleRDF {
  constructor (context, iri, graph) {
    this._iri = buildIri(iri)
    this._objects = {}

    this.context(context)
    this.graph(graph || rdf.createGraph())
  }

  toString () {
    return this._graph.toString()
  }

  context (context) {
    if (context) {
      this._context = context instanceof SimpleContext ? context : new SimpleContext(context)

      this._context.descriptions().forEach((description) => {
        // access values with full IRI
        addProperty.call(
          this,
          description.predicate,
          description.predicate,
          description.options)

        // access values with short property
        addProperty.call(
          this,
          description.property,
          description.predicate,
          description.options)
      })
    }

    return this._context
  }

  iri (iri) {
    if (iri) {
      iri = buildIri(iri)

      updateSubject(this._graph, this._iri, iri)
      updateObject(this._graph, this._iri, iri)

      this._iri = iri
    }

    return this._iri
  }

  graph (graph) {
    if (graph) {
      this._graph = graph

      this._graph.match(this._iri).forEach((triple) => {
        let predicate = triple.predicate.toString()
        let descriptor = Object.getOwnPropertyDescriptor(this, predicate)

        if (!descriptor) {
          addProperty.call(this, triple.predicate.toString(), predicate)
        }
      })
    }

    return this._graph
  }

  child (iri) {
    return new SimpleRDF(this._context, iri, this._graph)
  }
}

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
  graph.match(null, null, oldObject).forEach((triple) => {
    graph.remove(triple)
    graph.add(rdf.createTriple(triple.subject, triple.predicate, newObject))
  })
}

function addValues (self, predicate, options, values) {
  if (!Array.isArray(values)) {
    values = [values]
  }

  values.forEach((value) => {
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

        // don't cache array values, because we cache the complete array
        if (!options.array) {
          self._objects[predicate] = value
        }
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
  return self._graph.match(self._iri, predicate).map((triple) => {
    if (triple.object.interfaceName !== 'Literal') {
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

  let values = getValuesArray(self, predicate, options)

  if (!options.array) {
    values = values.shift()
  } else {
    values = self._objects[predicate] = new SimpleArray(
        addValues.bind(null, self, predicate, options),
        getValues.bind(null, self, predicate, options),
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
    get: () => {
      return getValues(this, predicate, options)
    },
    set: (values) => {
      removeValues(this, predicate, options)
      addValues(this, predicate, options, values)
    }
  })
}

module.exports = function (context, iri, graph, store) {
  return new SimpleRDF(context, iri, graph, store)
}

module.exports.isArray = (obj) => {
  return obj instanceof SimpleArray
}

module.exports.SimpleRDF = SimpleRDF
