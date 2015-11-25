var rdf = require('rdf-ext')
var simple = require('../')

var blogContext = {
  name: 'http://schema.org/name',
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

blogStore.add('http://example.org/blog', blogGraph).then(function () {
  return simple(blogContext, blogIri, null, blogStore).get()
}).then(function (blog) {
  console.log('fetched blog from: ' + blog._iri.toString())
  console.log(blog.name)
  console.log(blog.post.shift().headline)

  // move blog to new location
  blog.iri('http://example.org/new-blog')

  return blog.save()
}).then(function (blog) {
  console.log('stored blog at: ' + blog._iri.toString())

  return blogStore.graph('http://example.org/new-blog')
}).then(function (graph) {
  console.log('N-Triples: ' + graph.toString())
})
