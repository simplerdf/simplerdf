# SimpleRDF

#### Attention: this is only for brave people that want to build the future

The idea is that RDF should be as easy as playing with JSON objects. In other words, getting or setting the `foaf#name` of a graph should not be painful, one should just do the following (all of them work)

```javascript
// using an existing graph
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
// by registering the foaf namespace
me.foaf.name = 'Nicola'
// by defining the context
me.name = 'Nicola'
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

### 2) (Optional) Register a NameSpace or load a context

Make sure to specify `Literal` or `NamedNode`, this will be important to differentiate between `""` and `<>`.

```javascript
me.register('foaf',
  {
    name: 'Literal',
    knows: 'NamedNode'
  },
  'http://xmlns.com/foaf/0.1/')
```

##### tip

With this implementation of knows, if only one is provided, it will return it as a string, if multiple, they will be an array. In case you want to force it to alway be an array, you can define it as `['NamedNode']` type.

or load a context:

```javascript
me.context({
  'name': 'http://xmlns.com/foaf/0.1/name',
  'knows': {
    '@id': 'http://xmlns.com/foaf/0.1/knows',
    '@type': '@id'
  }
})
```

### 3) Use it!

Now we can do any kind of action

```javascript
me.foaf.name = 'Nicola'
console.log(me.foaf.name)
// 'Nicola'

me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
console.log(me['http://xmlns.com/foaf/0.1/name'])
// 'Nicola'

// These are interchangable
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
console.log(me.foaf.name)
```

### Bonus: Using JSON-LD context

```javascript
var me = new SimpleRDF('https://nicolagreco.com')
me.context({
  'name': 'http://xmlns.com/foaf/0.1/name',
  'homepage': {
    '@id': 'http://xmlns.com/foaf/0.1/homepage',
    '@type': '@id'
  }
})

me.name = 'Nicola'
me.homepage = 'http://nicolagreco.com'

console.log(me.name)
console.log(me['http://xmlns.com/foaf/0.1/name'])
console.log(me.toString())
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
      {
        name: 'Literal',
        knows: 'NamedNode'
      },
      'http://xmlns.com/foaf/0.1/')

    console.log(me.foaf.name)
    // 'Nicola Greco'
  })

```