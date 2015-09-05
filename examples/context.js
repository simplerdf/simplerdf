var SimpleRDF = require('../')
var me = new SimpleRDF('https://nicolagreco.com')
me.context({
  'name': 'http://xmlns.com/foaf/0.1/name',
  'homepage': {
    '@iri': 'http://xmlns.com/foaf/0.1/homepage',
    '@type': '@id'
  }
})

me.name = 'Nicola'
me.homepage = 'http://nicolagreco.com'

console.log(me.name)
console.log(me['http://xmlns.com/foaf/0.1/name'])

console.log(me.toString())
