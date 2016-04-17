var util = require('util')
var LdpStore = require('rdf-store-ldp')
var SimpleRDFLite = require('./lite')

function SimpleRDF (context, iri, graph, store) {
  if (!(this instanceof SimpleRDF)) {
    return new SimpleRDF(context, iri, graph, store)
  }

  SimpleRDFLite.call(this, context, iri, graph)

  this._store = SimpleRDF.store || store || new LdpStore()
}

util.inherits(SimpleRDF, SimpleRDFLite)

SimpleRDF.prototype.child = function (iri) {
  return new SimpleRDF(this._context, iri, this._graph, this._store)
}

SimpleRDF.prototype.get = function (iri, options) {
  var self = this

  if (typeof iri !== 'string') {
    options = iri
    iri = null
  }

  if (iri) {
    self.iri(iri)
  }

  return self._store.graph(self._iri.toString(), null, options).then(function (graph) {
    self.graph(graph)

    return self
  })
}

SimpleRDF.prototype.save = function (iri, options) {
  var self = this

  if (typeof iri !== 'string') {
    options = iri
    iri = null
  }

  if (iri) {
    self.iri(iri)
  }

  return self._store.add(self._iri.toString(), self._graph, null, options).then(function () {
    return self
  })
}

SimpleRDF.isArray = SimpleRDFLite.isArray

module.exports = SimpleRDF
