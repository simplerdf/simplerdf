'use strict'

const rdf = require('rdf-ext')
const SimpleArray = require('./lib/array')
const SimpleContext = require('./lib/context')
const SimpleCore = require('./lib/core')
const SimpleHandler = require('./lib/define-property-handler')

class SimpleRDF {
  constructor (context, iri, graph) {
    this._core = new SimpleCore(this)
    this._handler = new SimpleHandler(this, this._core)

    this._core.iri = SimpleCore.buildIri(iri)

    this.context(context)
    this.graph(graph || rdf.dataset())
  }

  toString () {
    return this._core.graph.toString()
  }

  context (context) {
    if (context) {
      this._core.context = context instanceof SimpleContext ? context : new SimpleContext(context)

      this._core.context.descriptions().forEach((description) => {
        // access values with full IRI
        this._handler.addProperty(description.predicate, description.predicate, description.options)

        // access values with short property
        this._handler.addProperty(description.property, description.predicate, description.options)
      })
    }

    return this._core.context
  }

  iri (iri) {
    if (iri) {
      iri = SimpleCore.buildIri(iri)

      if (!iri.equals(this._core.iri)) {
        this._core.updateSubject(iri)
        this._core.updateObject(iri)

        this._core.iri = iri
      }
    }

    return this._core.iri
  }

  graph (graph) {
    if (graph) {
      this._core.graph = graph

      this._core.graph.match(this._core.iri).forEach((triple) => {
        let property = triple.predicate.value

        if (!this._handler.hasProperty(property)) {
          this._handler.addProperty(property, triple.predicate)
        }
      })
    }

    return this._core.graph
  }

  child (iri) {
    return new SimpleRDF(this._core.context, iri, this._core.graph)
  }
}

module.exports = function (context, iri, graph, store) {
  return new SimpleRDF(context, iri, graph, store)
}

module.exports.isArray = (obj) => {
  return obj instanceof SimpleArray
}

module.exports.SimpleRDF = SimpleRDF
