var rdf = require('rdf-ext')()

module.exports = SimpleRDF

function Vocab (uri, graph, values, base) {
  var self = this
  values.forEach(function (obj) {
    var splits = obj.split(':')
    var prop = splits[1]
    var type = splits[0]

    Object.defineProperty(self, prop, {
      get: function () {
        var values = graph.match(uri, base + prop)
        return values.toArray().map(function (t) {
          return t.object.toString()
        })
      },
      set: function (value) {
        graph.add(rdf.Triple(
          rdf.NamedNode(uri),
          rdf.NamedNode(base + prop),
          rdf[type](value)
          ))
      }
    })
  })
}

function SimpleRDF (uri, graph) {
  this.uri = uri || ''
  this.graph = graph || rdf.createGraph()
}

SimpleRDF.prototype.register = function (name, values, base) {
  var self = this
  self[name] = new Vocab(self.uri, self.graph, values, base)

}

SimpleRDF.prototype.toString = function() {
  return this.graph.toString()
}
