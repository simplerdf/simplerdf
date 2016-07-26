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

var blogPostA = blog.child()
blogPostA.headline = 'first post'
blogPostA.content = 'this is my first blog post'
blog.post = blogPostA

var blogPostB = blog.child()
blogPostB.headline = 'second post'
blogPostB.content = 'this is my second blog post'
blog.post.push(blogPostB)

blog.post.forEach(function (post) {
  console.log('headline: ' + post.headline)
})

console.log('N-Triples: ' + blog.toString())
