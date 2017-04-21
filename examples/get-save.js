const rdf = require('rdf-ext')
const simple = require('..')
const DatasetStore = require('rdf-store-dataset')

const blogContext = {
  name: 'http://schema.org/name',
  post: {
    '@id': 'http://schema.org/post',
    '@container': '@set'
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content'
}

const blogIri = rdf.namedNode('http://example.org/blog')
const blogPostNode = rdf.blankNode()

const blogGraph = rdf.dataset([
  rdf.quad(
    blogIri,
    rdf.namedNode('http://schema.org/name'),
    rdf.literal('simple blog')),
  rdf.quad(
    blogIri,
    rdf.namedNode('http://schema.org/post'),
    blogPostNode),
  rdf.quad(
    blogPostNode,
    rdf.namedNode('http://schema.org/headline'),
    rdf.literal('first blog post'))
], blogIri)

let blogStore = new DatasetStore({dataset: blogGraph})

simple(blogContext, blogIri, null, blogStore).get().then((blog) => {
  console.log('fetched blog from: ' + blog.iri())
  console.log(blog.name)
  console.log(blog.post.at(0).headline)

  // move blog to new location
  blog.iri('http://example.org/new-blog')

  return blog.save().then(() => {
    console.log('stored blog at: ' + blog.iri())

    const dataset = blogStore.dataset.match(null, null, null, rdf.namedNode('http://example.org/new-blog'))

    console.log('N-Triples: ' + dataset.toString())
  })
}).catch((err) => {
  console.error(err.stack || err.message)
})
