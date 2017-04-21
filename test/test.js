'use strict'

/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const simple = require('..')
const DatasetStore = require('rdf-store-dataset')

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

describe('SimpleRdf', () => {
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
