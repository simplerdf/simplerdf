var LdpStore = require('rdf-store-ldp')
var rdf = require('rdf-ext')()
var SimpleRDF = require('../')
var store = new LdpStore(rdf)

store.graph(
  'https://nicola.databox.me/profile/card',
  function (graph) {
    var me = new SimpleRDF('https://nicola.databox.me/profile/card#me', graph)
    me.register('foaf',
      [
        'Literal:name',
        'NamedNode:knows'
      ],
      'http://xmlns.com/foaf/0.1/')

    console.log(me.foaf.name)
    // [ 'Nicola Greco' ]
  })
