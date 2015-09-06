var LdpStore = require('rdf-store-ldp')
var rdf = require('rdf-ext')()
var SimpleRDF = require('../')
var store = new LdpStore(rdf)

store.graph(
  'https://nicola.databox.me/profile/card',
  function (graph) {
    var me = new SimpleRDF('https://nicola.databox.me/profile/card#me', graph)

    console.log(me['http://xmlns.com/foaf/0.1/knows'])
    // [ 'Nicola Greco' ]
    me['http://xmlns.com/foaf/0.1/knows'] = 'http://a'
  })
