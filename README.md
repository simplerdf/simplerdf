# SimpleRDF

#### Attention: this is only for brave people that want to build the future

The idea is that RDF should be as easy as playing with JSON objects. In other words, retrieving the `foaf#name` of a graph should not be painful, one should just do the following:

```javascript
me.foaf.name = 'Nicola'

me.toString()
// <https://nicolagreco.com> <http://xmlns.com/foaf/0.1/name> "Nicola" .

```

## Install

```javascript
npm install --save simplerdf
```

## Usage

### 1) Create a SimpleRDF object

```javascript
var me = new SimpleRDF(/* uri, graph */)
```

### 2) Register a NameSpace

Make sure to put `Literal:` or `NamedNode:` in front of the attribute, this will be important to differentiate between `""` and `<>`.

```javascript
me.register('foaf',
  [
    'Literal:name',
    'NamedNode:knows'
  ],
  'http://xmlns.com/foaf/0.1/')
```

### 3) Use it!

Now we can do any kind of action:

```javascript
me.foaf.name = 'Nicola'
console.log(me.foaf.name)
// ['Nicola']
```

### Bonus: Loading an existing graph with rdf-ext
```javascript
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
```