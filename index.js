var rdf = require('rdf-ext')

module.exports = SimpleRDF

function defineProperty (uri, graph, path, prop, type) {
  console.log('setting up ' + prop + ' with path ' + path)
  Object.defineProperty(this, prop, {
    configurable: true,
    get: function () {
      var self = this
      var values = graph.match(uri, path)
      var arr = values.toArray().map(function (t) {
        if (t.object.interfaceName === 'BlankNode') {
          return self.clone(t.object)
        } else {
          return t.object.toString()
        }
      })

      if (arr.length === 1 && !Array.isArray(type)) {
        return arr[0]
      } else {
        return arr
      }
    },
    set: function (value) {
      // This replaces
      graph.removeMatches(
        uri,
        rdf.createNamedNode(path))

      graph.add(rdf.createTriple(
        uri,
        rdf.createNamedNode(path),
        rdf['create' + (Array.isArray(type) ? type[0] : type)](value.toString())))
    }
  })
}

function Vocab (uri, graph, values, base) {
  var self = this
  Object.keys(values).forEach(function (key) {
    var prop = key
    var type = values[key]
    defineProperty.call(self, uri, graph, base + prop, prop, type)
  })
}

function SimpleRDF (uri, graph) {
  var self = this
  self.uri = typeof uri === 'string' ? rdf.createNamedNode(uri) : uri
  self.graph = graph || rdf.createGraph()

  graph
    .match(uri)
    .forEach(function (t) {
      var type = t.object.interfaceName
      defineProperty.call(self, uri, graph, t.predicate.toString(), t.predicate.toString(), type)
    })
}

SimpleRDF.prototype.clone = function (uri) {
  var self = this

  var clone = new SimpleRDF(uri, self.graph)

  clone.context(self._context)

  return clone
}

SimpleRDF.prototype.register = function (name, values, base) {
  var self = this
  self[name] = new Vocab(self.uri, self.graph, values, base)

  Object.keys(values).forEach(function (key) {
    var prop = key
    var type = values[key]
    defineProperty.call(self, self.uri, self.graph, base + prop, base + prop, type)
  })

  return this
}

SimpleRDF.prototype.context = function (context) {
  var self = this

  self._context = context

  Object.keys(context).forEach(function (key) {
    if (typeof context[key] === 'string') {
      defineProperty.call(self, self.uri, self.graph, context[key], context[key], 'Literal')
      defineProperty.call(self, self.uri, self.graph, context[key], key, 'Literal')
    } else {
      if (context[key]['@id'] &&
          context[key]['@type'] && context[key]['@type'] === '@id') {
        defineProperty.call(self, self.uri, self.graph, context[key]['@id'], context[key]['@id'], 'NamedNode')
        defineProperty.call(self, self.uri, self.graph, context[key]['@id'], key, 'NamedNode')
      }
    }
  })

  return this
}

SimpleRDF.prototype.toString = function () {
  return this.graph.toString()
}
