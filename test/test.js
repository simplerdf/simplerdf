'use strict'
/* global before, describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const simple = require('../index')
const SimpleArray = require('../lib/array')

var blogContext = {
  about: 'http://schema.org/about',
  name: 'http://schema.org/name',
  provider: {
    '@id': 'http://schema.org/provider',
    '@type': '@id'
  },
  isFamilyFriendly: 'http://schema.org/isFamilyFriendly',
  post: {
    '@id': 'http://schema.org/post',
    '@array': true
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content',
  version: 'http://schema.org/version',
  sameAs: 'http://schema.org/sameAs'
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

describe('simplerdf', () => {
  before((done) => {
    blogStore.add('http://example.org/blog', blogGraph).then(() => {
      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('constructor should import context', () => {
    let blog = simple(blogContext)

    assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'name'), undefined)
    assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'post'), undefined)
  })

  it('constructor should create BlankNode subject if none was given', () => {
    let blog = simple(blogContext)

    assert.equal(blog._iri.interfaceName, 'BlankNode')
  })

  it('constructor should use existing NamedNode subject if one was given', () => {
    let iri = rdf.createNamedNode(blogIri)
    let blog = simple(blogContext, iri)

    assert(blog._iri.equals(iri))
  })

  it('constructor should use existing BlankNode subject if one was given', () => {
    let iri = rdf.createBlankNode()
    let blog = simple(blogContext, iri)

    assert(blog._iri.equals(iri))
  })

  it('constructor should create a NamedNode subject if a String was given', () => {
    let iri = rdf.createNamedNode(blogIri)
    let blog = simple(blogContext, blogIri)

    assert(blog._iri.equals(iri))
  })

  it('constructor should use an existing graph if one was given', () => {
    let blog = simple(blogContext, blogIri, blogGraph)

    assert(blogGraph.equals(blog._graph))
  })

  it('constructor should create properties for imported graph predicates', () => {
    let blog = simple(null, blogIri, blogGraph)

    assert.equal(blog['http://schema.org/name'], 'simple blog')
  })

  it('.child should create a child object with a BlankNode subject if none was given', () => {
    let blog = simple(blogContext)
    let post = blog.child()

    assert(post instanceof simple.SimpleRDF)
    assert.equal(post._iri.interfaceName, 'BlankNode')
  })

  it('.child should create a child object with a NamedNode subject if a String was given', () => {
    let blog = simple(blogContext)
    let post = blog.child('http://example.org/post-1')

    assert(post._iri.equals('http://example.org/post-1'))
  })

  it('getter should support String values', () => {
    let blog = simple(blogContext, blogIri, blogGraph)
    let name = blog.name

    assert.equal(name, 'simple blog')
  })

  it('getter should support Array values', () => {
    let blog = simple(blogContext, blogIri, blogGraph)
    let posts = blog.post

    assert(simple.isArray(posts))
  })

  it('getter should use Arrays if there are multiple values', () => {
    let graph = blogGraph.clone()

    graph.add(rdf.createTriple(
      rdf.createNamedNode(blogIri),
      rdf.createNamedNode('http://schema.org/name'),
      rdf.createLiteral('simple blog second name')))

    let blog = simple(blogContext, blogIri, graph)

    let names = blog.name

    assert(simple.isArray(names))
  })

  it('getter should cache values', () => {
    let graph = blogGraph.clone()

    let blog = simple(blogContext, blogIri, graph)

    assert(!('http://schema.org/name' in blog._objects))

    let names = blog.name

    assert(('http://schema.org/name' in blog._objects))
  })

  it('setter should support IRI values', () => {
    let blog = simple(blogContext)
    let value = 'http://example.org/provider'

    blog.provider = value

    let node = blog._graph.match(null, 'http://schema.org/provider').toArray().shift().object

    assert.equal(node.interfaceName, 'NamedNode')
    assert.equal(node.toString(), value)
  })

  it('setter should support String values', () => {
    let blog = simple(blogContext)

    blog.name = 'simple blog'

    assert.equal(blog._graph.match(null, 'http://schema.org/name').toArray().shift().object.toString(), 'simple blog')
  })

  it('setter should support Object values', () => {
    let blog = simple(blogContext)
    let project = blog.child()

    blog.about = project

    assert.equal(blog._graph.match(blog._iri, 'http://schema.org/about', project._iri).length, 1)
  })

  it('setter should support Node values', () => {
    let blog = simple(blogContext)
    let project = rdf.createNamedNode('http://example.org/project')

    blog.about = project

    assert.equal(blog._graph.match(blog._iri, 'http://schema.org/about', project).length, 1)
  })

  it('setter should support boolean values', () => {
    let blog = simple(blogContext)

    blog.isFamilyFriendly = true

    let isFamilyFriendly = blog._graph.match(null, 'http://schema.org/isFamilyFriendly').toArray().shift().object

    assert(isFamilyFriendly)
    assert.equal(isFamilyFriendly.nominalValue, true)
    assert(isFamilyFriendly.datatype.equals('http://www.w3.org/2001/XMLSchema#boolean'))
  })

  it('setter should support number values', () => {
    let post = simple(blogContext)

    post.version = 0.1

    let version = post._graph.match(null, 'http://schema.org/version').toArray().shift().object

    assert(version)
    assert.equal(version.nominalValue, 0.1)
    assert(version.datatype.equals('http://www.w3.org/2001/XMLSchema#double'))
  })

  it('setter should support Array values', () => {
    let blog = simple(blogContext)
    let post = blog.child()

    blog.post = [post]

    assert(blog._graph.match(null, 'http://schema.org/post').toArray().shift().object.equals(post._iri))
  })

  it('setter should support Array access', () => {
    let blog = simple(blogContext)
    let post = blog.child()

    blog.post.push(post)

    assert(typeof blog.post.push === 'function')
  })

  it('getter should support Array access', () => {
    let blog = simple(blogContext)
    let post = blog.child()

    blog.post.push(post)

    assert(blog._graph.match(null, 'http://schema.org/post').toArray().shift().object.equals(post._iri))
  })

  it('.iri should do subject update inc. subject and object updates in graph', () => {
    let blog = simple(blogContext, blogIri)
    let post = blog.child()
    let postIri = 'http://example.org/post-1'

    post.headline = 'headline'
    blog.post = [post]
    post.iri(postIri)

    assert(blog._graph.match(null, 'http://schema.org/post').toArray().shift().object.equals(postIri))
    assert(blog._graph.match(null, 'http://schema.org/headline').toArray().shift().subject.equals(postIri))
  })

  it('.toString should return the graph as N-Triples', () => {
    let blog = simple(blogContext, blogIri)
    let postIri = 'http://example.org/post-1'
    let post = blog.child(postIri)

    blog.post = [post]

    assert.equal(blog.toString(), '<http://example.org/blog> <http://schema.org/post> <http://example.org/post-1> .')
  })

  it('should keep assigned objects', () => {
    let blog = simple(blogContext, blogIri)
    let provider = blog.child()

    provider.name = 'test'
    provider.getName = function () {
      return this.name
    }

    blog.provider = provider

    assert.equal(blog.provider.name, 'test')
    assert.equal(blog.provider.getName(), 'test')
  })

  it('should use a SimpleRDF object to handle NamedNodes', () => {
    let blog = simple(blogContext, blogIri)

    blog.sameAs = rdf.createNamedNode(blogIri + '/theSame')

    assert(blog.sameAs instanceof simple.SimpleRDF)
  })

  it('should use a SimpleRDF object to handle BlankNodes', () => {
    let blog = simple(blogContext, blogIri)

    blog.sameAs = rdf.createBlankNode()

    assert(blog.sameAs instanceof simple.SimpleRDF)
  })

  it('.get should fetch an object from the store with Promise API', (done) => {
    simple(blogContext, blogIri, null, blogStore).get().then((blog) => {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.get should be able to pass options to request handler', (done) => {
    simple(blogContext, blogIri, null, blogStore).get({withCredentials: false}).then((blog) => {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.get should fetch an object from the store using the given IRI with Promise API', (done) => {
    simple(blogContext, null, null, blogStore).get(blogIri).then((blog) => {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.save should store an object using the store with Promise API', (done) => {
    let blog = simple(blogContext, blogIri, blogGraph.clone(), blogStore)
    let blogCloneIri = 'http://example.org/blog-clone'

    blog.iri(blogCloneIri)
    blog.save().then((blogClone) => {
      return blogStore.graph(blogCloneIri)
    }).then((graph) => {
      // patch graph ...
      graph.match(blogCloneIri).forEach((triple) => {
        graph.remove(triple)
        graph.add(rdf.createTriple(rdf.createNamedNode(blogIri), triple.predicate, triple.object))
      })

      // ... for compare
      assert(graph.equals(blogGraph))

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.save should store an object using the store with Promise API', (done) => {
    let blog = simple(blogContext, blogIri, blogGraph.clone(), blogStore)
    let blogCloneIri = 'http://example.org/blog-clone'

    blog.save(blogCloneIri).then((blogClone) => {
      return blogStore.graph(blogCloneIri)
    }).then((graph) => {
      // patch graph ...
      graph.match(blogCloneIri).forEach((triple) => {
        graph.remove(triple)
        graph.add(rdf.createTriple(rdf.createNamedNode(blogIri), triple.predicate, triple.object))
      })

      // ... for compare
      assert(graph.equals(blogGraph))

      done()
    }).catch((error) => {
      done(error)
    })
  })
})

describe('simplearray', () => {
  it('constructor should init all member variables', () => {
    let addValue = () => {}
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    assert.equal(array._addValue, addValue)
    assert.equal(array._getValue, getValue)
    assert.equal(array._removeValue, removeValue)
    assert(Array.isArray(array._array))
  })

  it('.at should handle read access for the array', () => {
    let addValue = () => {}
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    array._array = [0, 1, 2]

    assert.equal(array.at(0), 0)
    assert.equal(array.at(1), 1)
    assert.equal(array.at(2), 2)
  })

  it('.at should handle write access for the array', () => {
    let addSequence = [0, 1, 2, 3]
    let removeSequence = [1]

    let addValue = (value) => {
      assert.equal(value, addSequence.shift())
    }
    let getValue = () => {}
    let removeValue = (value) => {
      assert.equal(value, removeSequence.shift())
    }

    let array = new SimpleArray(addValue, getValue, removeValue)

    array.at(0, 0)
    array.at(1, 1)
    array.at(2, 2)
    array.at(1, 3)

    assert.equal(array._array[0], 0)
    assert.equal(array._array[1], 3)
    assert.equal(array._array[2], 2)

    assert.deepEqual(addSequence, [])
    assert.deepEqual(removeSequence, [])
  })

  it('.forEach should be supported', () => {
    let valueSequence = [0, 1, 2]

    let addValue = () => {}
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    array._array = [0, 1, 2]

    array.forEach(function (item) {
      assert.equal(item, valueSequence.shift())
      assert.equal(this, 'context')
    }, 'context')

    assert.deepEqual(valueSequence, [])
  })

  it('.push should be supported', () => {
    let addSequence = [0, 1, 2]

    let addValue = (value) => {
      assert.equal(value, addSequence.shift())
    }
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    array.push(0)
    array.push(1)
    array.push(2)

    assert.deepEqual(array._array, [0, 1, 2])
    assert.deepEqual(addSequence, [])
  })
})
