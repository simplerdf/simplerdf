'use strict'

const LdpStore = require('rdf-store-ldp')
const lite = require('./lite')

class SimpleRDF extends lite.SimpleRDF {
  constructor (context, iri, graph, store) {
    super(context, iri, graph)

    this._store = store || new LdpStore()
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

    return this._store
      .graph(this._core.iri.toString(), null, options).then((graph) => {
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

    return this._store.add(this._core.iri.toString(), this._core.graph, null, options).then(() => {
      return this
    })
  }
}

module.exports = function (context, iri, graph, store) {
  return new SimpleRDF(context, iri, graph, store)
}

module.exports.isArray = lite.isArray
module.exports.SimpleRDF = SimpleRDF
