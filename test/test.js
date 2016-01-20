/* global before, describe, it */

var assert = require('assert')
var rdf = require('rdf-ext')
var simple = require('../')

var blogContext = {
  name: 'http://schema.org/name',
  provider: {
    '@id': 'http://schema.org/provider',
    '@type': '@id'
  },
  post: {
    '@id': 'http://schema.org/post',
    '@array': true
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content'
}

var blogIri = 'http://example.org/blog'

var blogPostNode = rdf.createBlankNode()

var blogGraph = rdf.createGraph([
  rdf.createTriple(
    rdf.createNamedNode(blogIri),
    rdf.createNamedNode('http://schema.org/name'),
    rdf.createLiteral('simple blog')),
  rdf.createTriple(
    rdf.createNamedNode(blogIri),
    rdf.createNamedNode('http://schema.org/post'),
    blogPostNode),
  rdf.createTriple(
    blogPostNode,
    rdf.createNamedNode('http://schema.org/headline'),
    rdf.createLiteral('first blog post'))
])

var blogStore = rdf.createStore()

describe('simplerdf', function () {
  before(function (done) {
    blogStore.add('http://example.org/blog', blogGraph).then(function () {
      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.get should fetch an object from the store with Promise API', function (done) {
    simple(blogContext, blogIri, null, blogStore).get().then(function (blog) {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.shift().headline, 'first blog post')

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.save should store an object using the store with Promise API', function (done) {
    var blog = simple(blogContext, blogIri, blogGraph.clone(), blogStore)
    var blogCloneIri = 'http://example.org/blog-clone'

    blog.iri(blogCloneIri).save().then(function (blogClone) {
      return blogStore.graph(blogCloneIri)
    }).then(function (graph) {
      // patch graph ...
      graph.match(blogCloneIri).forEach(function (triple) {
        graph.remove(triple)
        graph.add(rdf.createTriple(rdf.createNamedNode(blogIri), triple.predicate, triple.object))
      })

      // ... for compare
      assert(graph.equals(blogGraph))

      done()
    }).catch(function (error) {
      done(error)
    })
  })
})
