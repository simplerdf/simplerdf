var rdf = require('rdf-ext')()

module.exports = SimpleRDF

function defineProperty (uri, graph, path, prop, type) {
  Object.defineProperty(this, prop, {
    get: function () {
      var values = graph.match(uri, path)
      return values.toArray().map(function (t) {
        return t.object.toString()
      })
    },
    set: function (value) {
      // This replaces
      graph.removeMatches(
        rdf.NamedNode(uri),
        rdf.NamedNode(path))

      graph.add(rdf.Triple(
        rdf.NamedNode(uri),
        rdf.NamedNode(path),
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
    defineProperty.call(self, uri, graph, base + prop, prop, type)
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
    defineProperty.call(self, self.uri, self.graph, base + prop, base + prop, type)
  })

  return this
}

SimpleRDF.prototype.context = function (context) {
  var self = this

  Object.keys(context).forEach(function (key) {
    if (typeof context[key] === 'string') {
      defineProperty.call(self, self.uri, self.graph, context[key], context[key], 'Literal')
      defineProperty.call(self, self.uri, self.graph, context[key], key, 'Literal')
    } else {
      if (context[key]['@iri'] &&
          context[key]['@type'] && context[key]['@type'] === '@id') {
        defineProperty.call(self, self.uri, self.graph, context[key]['@iri'], context[key]['@iri'], 'NamedNode')
        defineProperty.call(self, self.uri, self.graph, context[key]['@iri'], key, 'NamedNode')
      }
    }
  })

  return this
}

SimpleRDF.prototype.toString = function () {
  return this.graph.toString()
}
