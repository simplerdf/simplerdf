'use strict'

const LdpStore = require('rdf-store-ldp')
const lite = require('./lite')

class SimpleRDF extends lite.SimpleRDF {
  constructor (context, iri, graph, store) {
    super(context, iri, graph)

    this._store = store || new LdpStore()
  }

  child (iri) {
    return new SimpleRDF(this._context, iri, this._graph, this._store)
  }

  get (iri, options) {
    if (typeof iri !== 'string') {
      options = iri
      iri = null
    }

    if (iri) {
      this.iri(iri)
    }

    return this._store
      .graph(this._iri.toString(), null, options)
      .then((graph) => {
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

    return this._store
      .add(this._iri.toString(), this._graph, null, options)
      .then(() => {
        return this
      })
  }
}

module.exports = function (context, iri, graph, store) {
  return new SimpleRDF(context, iri, graph, store)
}

module.exports.isArray = lite.isArray
module.exports.SimpleRDF = SimpleRDF
