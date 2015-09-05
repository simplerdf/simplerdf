var rdf = require('rdf-ext')()

module.exports = SimpleRDF

function defineProperty (uri, graph, values, base, prop, type) {
  Object.defineProperty(this, prop, {
    get: function () {
      var values = graph.match(uri, base + prop)
      return values.toArray().map(function (t) {
        return t.object.toString()
      })
    },
    set: function (value) {
      // This replaces
      graph.removeMatches(
        rdf.NamedNode(uri),
        rdf.NamedNode(base + prop))

      graph.add(rdf.Triple(
        rdf.NamedNode(uri),
        rdf.NamedNode(base + prop),
        rdf[type](value)
        ))
    }
  })
}

function Vocab (uri, graph, values, base) {
  var self = this
  values.forEach(function (obj) {
    var splits = obj.split(':')
    var prop = splits[1]
    var type = splits[0]
    defineProperty.call(self, uri, graph, values, base, prop, type)
  })
}

function SimpleRDF (uri, graph) {
  this.uri = uri || ''
  this.graph = graph || rdf.createGraph()
}

SimpleRDF.prototype.register = function (name, values, base) {
  var self = this
  self[name] = new Vocab(self.uri, self.graph, values, base)

  values.forEach(function (obj) {
    var splits = obj.split(':')
    var prop = splits[1]
    var type = splits[0]
    defineProperty.call(self, self.uri, self.graph, values, '', base + prop, type)
  })
}

SimpleRDF.prototype.toString = function () {
  return this.graph.toString()
}
