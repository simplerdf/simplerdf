var SimpleRDF = require('../')

var me = new SimpleRDF('https://nicolagreco.com')
me.register('foaf',
  [
    'Literal:name',
    'NamedNode:knows'
  ],
  'http://xmlns.com/foaf/0.1/')
me.register('ui',
  [
    'NamedNode:backgroundImage'
  ],
  'http://www.w3.org/ns/ui#')

me.foaf.name = 'Nicola'
me.foaf.knows = ['http://melvincarvalho.com/#me']
me.ui.backgroundImage = 'vangog.png'

console.log(me['http://xmlns.com/foaf/0.1/name'])
console.log(me.foaf.name)

console.log(a.toString())
