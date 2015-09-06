var SimpleRDF = require('../')

var me = new SimpleRDF('https://nicolagreco.com')
me.register('foaf',
  {
    name: 'Literal',
    knows: 'NamedNode'
  },
  'http://xmlns.com/foaf/0.1/')

me.register('ui',
  {
    backgroundImage: 'NamedNode'
  },
  'http://www.w3.org/ns/ui#')

me.foaf.name = 'Nicola'
me.foaf.knows = ['http://melvincarvalho.com/#me']
me.ui.backgroundImage = 'vangog.png'

console.log(me['http://xmlns.com/foaf/0.1/name'])
console.log(me.foaf.name)

console.log(me.toString())
