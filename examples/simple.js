var SimpleRDF = require('../')

var a = new SimpleRDF('https://nicolagreco.com')
a.register('foaf',
  [
    'Literal:name',
    'NamedNode:knows'
  ],
  'http://xmlns.com/foaf/0.1/')
a.register('ui',
  [
    'NamedNode:backgroundImage'
  ],
  'http://www.w3.org/ns/ui#')

a.foaf.name = 'Nicola'
a.foaf.knows = ['http://melvincarvalho.com/#me']
a.ui.backgroundImage = 'vangog.png'

console.log(a.toString())
