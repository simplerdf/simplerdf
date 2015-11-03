var LdpStore = require('rdf-store-ldp')
var SimpleRDF = require('../')

var store = new LdpStore()
var context = {
  exponent: 'http://www.w3.org/ns/auth/cert#exponent',
  homepage: {
    '@id': 'http://xmlns.com/foaf/0.1/homepage',
    '@type': '@id'
  },
  key: 'http://www.w3.org/ns/auth/cert#key',
  knows: {
    '@id': 'http://xmlns.com/foaf/0.1/knows',
    '@type': '@id'
  },
  modulus: 'http://www.w3.org/ns/auth/cert#modulus',
  name: 'http://xmlns.com/foaf/0.1/name',
}

store.graph('https://www.bergnet.org/people/bergi/card#me').then(function (graph) {
  console.log(graph.toString())

  var profile = new SimpleRDF('https://www.bergnet.org/people/bergi/card#me', graph)
  profile.context(context)

  console.log(profile.name)
  console.log(profile.key[0].exponent)
}).catch(function (error) {
  console.error(error.stack || error.message)
})
