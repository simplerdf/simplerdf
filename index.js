'use strict'

const WebStore = require('rdf-store-web')
const SimpleRDFCore = require('simplerdf-core')
const rdf = require('rdf-ext')

class SimpleRDF extends SimpleRDFCore {
  constructor (context, iri, graph, store) {
    super(context, iri, graph)

    this._store = store || new WebStore()
  }

  child (iri) {
    return new SimpleRDF(this._core.context, iri, this._core.graph, this._store)
  }

  get (iri, options) {
    if (typeof iri !== 'string') {
      options = iri
      iri = null
    }

    if (iri) {
      this.iri(iri)
    }

    return rdf.dataset().import(this._store.match(null, null, null, this._core.iri, options)).then((graph) => {
      this.graph(graph)

      return this
    })
  }

  save (iri, options) {
    if (typeof iri !== 'string') {
      options = iri
      iri = null
    }

    if (iri) {
      this.iri(iri)
    }

    // assign IRI to the graph of all quads
    let dataset = rdf.dataset(this._core.graph, this._core.iri)

    return rdf.waitFor(this._store.import(dataset.toStream()))
  }
}

module.exports = function (context, iri, graph, store) {
  return new SimpleRDF(context, iri, graph, store)
}

module.exports.isArray = SimpleRDFCore.isArray
module.exports.SimpleRDF = SimpleRDF
