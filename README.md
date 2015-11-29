# SimpleRDF

#### Attention: this is only for brave people that want to build the future
#### Please, read [_Towards the future RDF Library_](http://nicola.io/future-rdf/2015/)

The idea is that RDF should be as easy as playing with JSON objects. In other words, getting or setting the `foaf#name` of a graph should not be painful, one should just do the following (all of them work)

```javascript
// using an existing graph
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
// by defining the context
me.name = 'Nicola'
```

Have a look at the [spec attempt](https://github.com/nicola/simplerdf/blob/master/SPEC.md)

## Install

```javascript
npm install --save simplerdf
```

## Usage

### 1) Create a SimpleRDF object

```javascript
var me = simple(/*context, uri, graph */)
```

### 2) (Optional) Load a context

Make sure to specify `Literal` or `NamedNode`, this will be important to differentiate between `""` and `<>`.

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
me.name = 'Nicola'
console.log(me.foaf.name)
// 'Nicola'

me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
console.log(me['http://xmlns.com/foaf/0.1/name'])
// 'Nicola'

// These are interchangable
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
console.log(me.name)
```

### Bonus: Using JSON-LD context

```javascript
var context = {
  'name': 'http://xmlns.com/foaf/0.1/name',
  'homepage': {
    '@id': 'http://xmlns.com/foaf/0.1/homepage',
    '@type': '@id'
  }
}
var me = simple(context, 'https://nicolagreco.com')
me.name = 'Nicola'
me.homepage = 'http://nicolagreco.com'

console.log(me.name)
console.log(me['http://xmlns.com/foaf/0.1/name'])
console.log(me.toString())
```
