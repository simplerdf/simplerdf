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

  it('constructor should import context', function () {
    var blog = simple(blogContext)

    assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'name'), undefined)
    assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'post'), undefined)
  })

  it('constructor should create BlankNode subject if none was given', function () {
    var blog = simple(blogContext)

    assert.equal(blog._iri.interfaceName, 'BlankNode')
  })

  it('constructor should use existing NamedNode subject if one was given', function () {
    var iri = rdf.createNamedNode(blogIri)
    var blog = simple(blogContext, iri)

    assert(blog._iri.equals(iri))
  })

  it('constructor should use existing BlankNode subject if one was given', function () {
    var iri = rdf.createBlankNode()
    var blog = simple(blogContext, iri)

    assert(blog._iri.equals(iri))
  })

  it('constructor should create a NamedNode subject if a String was given', function () {
    var iri = rdf.createNamedNode(blogIri)
    var blog = simple(blogContext, blogIri)

    assert(blog._iri.equals(iri))
  })

  it('constructor should use an existing graph if one was given', function () {
    var blog = simple(blogContext, blogIri, blogGraph)

    assert(blogGraph.equals(blog._graph))
  })

  it('constructor should create properties for imported graph predicates', function () {
    var blog = simple(null, blogIri, blogGraph)

    assert.equal(blog['http://schema.org/name'], 'simple blog')
  })

  it('.child should create a child object with a BlankNode subject if none was given', function () {
    var blog = simple(blogContext)
    var post = blog.child()

    assert(post instanceof simple)
    assert.equal(post._iri.interfaceName, 'BlankNode')
  })

  it('.child should create a child object with a NamedNode subject if a String was given', function () {
    var blog = simple(blogContext)
    var post = blog.child('http://example.org/post-1')

    assert(post._iri.equals('http://example.org/post-1'))
  })

  it('getter should support String values', function () {
    var blog = simple(blogContext, blogIri, blogGraph)
    var name = blog.name

    assert.equal(name, 'simple blog')
  })

  it('getter should support Array values', function () {
    var blog = simple(blogContext, blogIri, blogGraph)
    var posts = blog.post

    assert(simple.isArray(posts))
  })

  it('setter should support IRI values', function () {
    var blog = simple(blogContext)
    var value = 'http://example.org/provider'

    blog.provider = value

    var node = blog._graph.match(null, 'http://schema.org/provider').toArray().shift().object

    assert.equal(node.interfaceName, 'NamedNode')
    assert.equal(node.toString(), value)
  })

  it('setter should support String values', function () {
    var blog = simple(blogContext)

    blog.name = 'simple blog'

    assert.equal(blog._graph.match(null, 'http://schema.org/name').toArray().shift().object.toString(), 'simple blog')
  })

  it('setter should support Array values', function () {
    var blog = simple(blogContext)
    var post = blog.child()

    blog.post = [post]

    assert(blog._graph.match(null, 'http://schema.org/post').toArray().shift().object.equals(post._iri))
  })

  it('getter should support Array access', function () {
    var blog = simple(blogContext)
    var post = blog.child()

    blog.post.push(post)

    assert(blog._graph.match(null, 'http://schema.org/post').toArray().shift().object.equals(post._iri))
  })

  it('.iri should do subject update inc. subject and object updates in graph', function () {
    var blog = simple(blogContext, blogIri)
    var post = blog.child()
    var postIri = 'http://example.org/post-1'

    post.headline = 'headline'
    blog.post = [post]
    post.iri(postIri)

    assert(blog._graph.match(null, 'http://schema.org/post').toArray().shift().object.equals(postIri))
    assert(blog._graph.match(null, 'http://schema.org/headline').toArray().shift().subject.equals(postIri))
  })

  it('.toString should return the graph as N-Triples', function () {
    var blog = simple(blogContext, blogIri)
    var postIri = 'http://example.org/post-1'
    var post = blog.child(postIri)

    blog.post = [post]

    assert.equal(blog.toString(), '<http://example.org/blog> <http://schema.org/post> <http://example.org/post-1> .')
  })

  it('.get should fetch an object from the store with Promise API', function (done) {
    simple(blogContext, blogIri, null, blogStore).get().then(function (blog) {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.get should fetch an object from the store using the given IRI with Promise API', function (done) {
    simple(blogContext, null, null, blogStore).get(blogIri).then(function (blog) {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.save should store an object using the store with Promise API', function (done) {
    var blog = simple(blogContext, blogIri, blogGraph.clone(), blogStore)
    var blogCloneIri = 'http://example.org/blog-clone'

    blog.iri(blogCloneIri)
    blog.save().then(function (blogClone) {
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

  it('.save should store an object using the store with Promise API', function (done) {
    var blog = simple(blogContext, blogIri, blogGraph.clone(), blogStore)
    var blogCloneIri = 'http://example.org/blog-clone'

    blog.save(blogCloneIri).then(function (blogClone) {
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
