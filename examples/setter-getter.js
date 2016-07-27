var simple = require('../')

var blogContext = {
  name: 'http://schema.org/name',
  post: {
    '@id': 'http://schema.org/post',
    '@container': '@set'
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content'
}

var blogIri = 'http://example.org/blog'

var blog = simple(blogContext, blogIri)

blog.name = 'bergis blog'

console.log('blog.name: ' + blog.name)
console.log('N-Triples: ' + blog.toString())
