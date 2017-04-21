const simple = require('..')

const blogContext = {
  name: 'http://schema.org/name',
  post: {
    '@id': 'http://schema.org/post',
    '@container': '@set'
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content'
}

const blogIri = 'http://example.org/blog'

let blog = simple(blogContext, blogIri)

let blogPostA = blog.child()
blogPostA.headline = 'first post'
blogPostA.content = 'this is my first blog post'
blog.post = blogPostA

let blogPostB = blog.child()
blogPostB.headline = 'second post'
blogPostB.content = 'this is my second blog post'
blog.post.push(blogPostB)

blog.post.forEach((post) => {
  console.log('headline: ' + post.headline)
})

console.log('N-Triples: ' + blog.toString())
