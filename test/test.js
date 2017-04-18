'use strict'

/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const simple = require('../index')
const DatasetStore = require('rdf-store-dataset')
const SimpleArray = require('../lib/array')

let blogContext = {
  about: 'http://schema.org/about',
  name: 'http://schema.org/name',
  provider: {
    '@id': 'http://schema.org/provider',
    '@type': '@id'
  },
  isFamilyFriendly: 'http://schema.org/isFamilyFriendly',
  post: {
    '@id': 'http://schema.org/post',
    '@container': '@set'
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content',
  version: 'http://schema.org/version',
  sameAs: 'http://schema.org/sameAs'
}

let blogIri = 'http://example.org/blog'

let blogPostNode = rdf.blankNode()

let blogDataset = rdf.dataset([
  rdf.quad(
    rdf.namedNode(blogIri),
    rdf.namedNode('http://schema.org/name'),
    rdf.literal('simple blog'),
    rdf.namedNode(blogIri)),
  rdf.quad(
    rdf.namedNode(blogIri),
    rdf.namedNode('http://schema.org/post'),
    blogPostNode,
    rdf.namedNode(blogIri)),
  rdf.quad(
    blogPostNode,
    rdf.namedNode('http://schema.org/headline'),
    rdf.literal('first blog post'),
    rdf.namedNode(blogIri))
])

let blogGraph = rdf.graph(blogDataset)

describe('simplerdf', () => {
  it('constructor should import context', () => {
    let blog = simple(blogContext)

    assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'name'), undefined)
    assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'post'), undefined)
  })

  it('constructor should create BlankNode subject if none was given', () => {
    let blog = simple(blogContext)

    assert.equal(blog._core.iri.termType, 'BlankNode')
  })

  it('constructor should use existing NamedNode subject if one was given', () => {
    let iri = rdf.namedNode(blogIri)
    let blog = simple(blogContext, iri)

    assert(blog._core.iri.equals(iri))
  })

  it('constructor should use existing BlankNode subject if one was given', () => {
    let iri = rdf.blankNode()
    let blog = simple(blogContext, iri)

    assert(blog._core.iri.equals(iri))
  })

  it('constructor should create a NamedNode subject if a String was given', () => {
    let iri = rdf.namedNode(blogIri)
    let blog = simple(blogContext, blogIri)

    assert(blog._core.iri.equals(iri))
  })

  it('constructor should use an existing graph if one was given', () => {
    let blog = simple(blogContext, blogIri, blogGraph)

    assert(blogGraph.equals(blog._core.graph))
  })

  it('constructor should create properties for imported graph predicates', () => {
    let blog = simple(null, blogIri, blogGraph)

    assert.equal(blog['http://schema.org/name'], 'simple blog')
  })

  it('.child should create a child object with a BlankNode subject if none was given', () => {
    let blog = simple(blogContext)
    let post = blog.child()

    assert(post instanceof simple.SimpleRDF)
    assert.equal(post._core.iri.termType, 'BlankNode')
  })

  it('.child should create a child object with a NamedNode subject if a String was given', () => {
    let blog = simple(blogContext)
    let post = blog.child('http://example.org/post-1')

    assert(post._core.iri.equals(rdf.namedNode('http://example.org/post-1')))
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

  it('setter should support IRI values', () => {
    let blog = simple(blogContext)
    let value = 'http://example.org/provider'

    blog.provider = value

    let node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/provider'))
      .toArray()
      .shift()
      .object

    assert.equal(node.termType, 'NamedNode')
    assert.equal(node.value, value)
  })

  it('setter should support String values', () => {
    let blog = simple(blogContext)

    blog.name = 'simple blog'

    let node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/name'))
      .toArray()
      .shift()
      .object
      .value

    assert.equal(node, 'simple blog')
  })

  it('setter should support Object values', () => {
    let blog = simple(blogContext)
    let project = blog.child()

    blog.about = project

    assert.equal(blog._core.graph.match(blog._iri, rdf.namedNode('http://schema.org/about'), project._iri).length, 1)
  })

  it('setter should support Node values', () => {
    let blog = simple(blogContext)
    let project = rdf.namedNode('http://example.org/project')

    blog.about = project

    assert.equal(blog._core.graph.match(blog._iri, rdf.namedNode('http://schema.org/about'), project).length, 1)
  })

  it('setter should support boolean values', () => {
    let blog = simple(blogContext)

    blog.isFamilyFriendly = true

    let isFamilyFriendly = blog._core.graph.match(null, rdf.namedNode('http://schema.org/isFamilyFriendly'))
      .toArray()
      .shift()
      .object

    assert(isFamilyFriendly)
    assert(isFamilyFriendly.datatype.equals(rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean')))
  })

  it('setter should support number values', () => {
    let post = simple(blogContext)

    post.version = 0.1

    let version = post._core.graph.match(null, rdf.namedNode('http://schema.org/version'))
      .toArray()
      .shift()
      .object

    assert(version)
    assert(version.datatype.equals(rdf.namedNode('http://www.w3.org/2001/XMLSchema#double')))
  })

  it('setter should support Array values', () => {
    let blog = simple(blogContext)
    let post = blog.child()

    blog.post = [post]

    let node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/post')).toArray().shift().object

    assert(node.equals(post._core.iri))
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

    let node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/post')).toArray().shift().object

    assert(node.equals(post._core.iri))
  })

  it('getter should support IRI strings', () => {
    let blogGraph = rdf.dataset()
    let blog = simple(blogContext, null, blogGraph)

    blogGraph.add(rdf.quad(
      blog.iri(),
      rdf.namedNode('http://schema.org/provider'),
      rdf.namedNode('http://example.org/provider')
    ))

    assert.equal(blog.provider, 'http://example.org/provider')
  })

  it('getter should support boolean values', () => {
    let blogGraph = rdf.dataset()
    let blog = simple(blogContext, null, blogGraph)

    blogGraph.add(rdf.quad(
      blog.iri(),
      rdf.namedNode('http://schema.org/isFamilyFriendly'),
      rdf.literal('true', rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
    ))

    assert.equal(typeof blog.isFamilyFriendly, 'boolean')
    assert.equal(blog.isFamilyFriendly, true)
  })

  it('getter should support number values', () => {
    let blogGraph = rdf.dataset()
    let blog = simple(blogContext, null, blogGraph)

    blogGraph.add(rdf.quad(
      blog.iri(),
      rdf.namedNode('http://schema.org/version'),
      rdf.literal('0.1', rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))
    ))

    assert.equal(typeof blog.version, 'number')
    assert.equal(blog.version, 0.1)
  })

  it('.iri should do subject update inc. subject and object updates in graph', () => {
    let blog = simple(blogContext, blogIri)
    let post = blog.child()
    let postIri = 'http://example.org/post-1'

    post.headline = 'headline'
    blog.post = [post]
    post.iri(postIri)

    assert(blog._core.graph.match(null, rdf.namedNode('http://schema.org/post')).toArray().shift().object.equals(rdf.namedNode(postIri)))
    assert(blog._core.graph.match(null, rdf.namedNode('http://schema.org/headline')).toArray().shift().subject.equals(rdf.namedNode(postIri)))
  })

  it('.toString should return the graph as N-Triples', () => {
    let blog = simple(blogContext, blogIri)
    let postIri = 'http://example.org/post-1'
    let post = blog.child(postIri)

    blog.post = [post]

    assert.equal(blog.toString().trim(), '<http://example.org/blog> <http://schema.org/post> <http://example.org/post-1> .')
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

    blog.sameAs = rdf.namedNode(blogIri + '/theSame')

    assert(blog.sameAs instanceof simple.SimpleRDF)
  })

  it('should use a SimpleRDF object to handle BlankNodes', () => {
    let blog = simple(blogContext, blogIri)

    blog.sameAs = rdf.blankNode()

    assert(blog.sameAs instanceof simple.SimpleRDF)
  })

  it('.get should fetch an object from the store with Promise API', (done) => {
    let blogStore = new DatasetStore({
      dataset: blogDataset.clone()
    })

    simple(blogContext, blogIri, null, blogStore).get().then((blog) => {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.get should be able to pass options to request handler', (done) => {
    let blogStore = new DatasetStore({
      dataset: blogDataset.clone()
    })

    simple(blogContext, blogIri, null, blogStore).get({withCredentials: false}).then((blog) => {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.get should fetch an object from the store using the given IRI with Promise API', (done) => {
    let blogStore = new DatasetStore({
      dataset: blogDataset.clone()
    })

    simple(blogContext, null, null, blogStore).get(blogIri).then((blog) => {
      assert.equal(blog.name, 'simple blog')
      assert.equal(blog.post.at(0).headline, 'first blog post')

      done()
    }).catch((error) => {
      done(error)
    })
  })

  it('.save should store an object using the store with Promise API', (done) => {
    let blogStore = new DatasetStore()
    let blog = simple(blogContext, blogIri, blogGraph.clone(), blogStore)

    blog.save().then(() => {
      const blogDataset = rdf.dataset(blogGraph, rdf.namedNode(blogIri))

      assert(blogStore.dataset.equals(blogDataset))

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
