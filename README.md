# SimpleRDF

#### Attention: this is only for brave people that want to build the future
#### Please, read [_Towards the future RDF Library_](http://nicola.io/future-rdf/2015/)

The idea is that RDF should be as easy as playing with JSON objects.
In other words, getting or setting the `foaf#name` of a graph should not be painful, one should just do the following (all of them work)

```javascript
// using an existing graph
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
// by defining the context
me.name = 'Nicola'
```

## Install

```javascript
npm install --save simplerdf
```

To generate a browser-ready version:
```
$ git clone https://github.com/nicola/simplerdf
$ cd simplerdf
$ npm install
$ npm run build
```

This will generate `simplerdf.js` that you can load in your web application

## Usage

### 1) Create a SimpleRDF object

```javascript
var me = SimpleRDF(/*context, [uri, graph] */)
```

### 2) (Optional) Load a context

Make sure to specify `Literal` or `NamedNode`, this will be important to differentiate between `""` and `<>`.

```javascript
me.context({
  'name': 'http://xmlns.com/foaf/0.1/name',
  'knows': {
    '@id': 'http://xmlns.com/foaf/0.1/knows',
    '@type': '@id',
    '@array': true  // Please send a PR if you have a better way to do this
  }
})
```

### 3) Use it!

Now we can do any kind of action

```javascript
// You can directly set properties defined in your context
me.name = 'Nicola'
console.log(me.name)
// 'Nicola'

// Or you can set the property with a particular type pointer
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
console.log(me['http://xmlns.com/foaf/0.1/name'])
// 'Nicola'

// These are interchangable
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
console.log(me.name)
```

## Undocumented features (`.get` and `.save`)

```javascript
// This gets the iri specified in the constructor
SimpleRDF(context, iri).get(function(err, g) {
  console.log(g.name)
})

// This saves the graph in the iri specified in the constructor
var g = SimpleRDF(context, iri)
g.name = "Nicola"
g.save()

// Hint for the brave:
// You can also do this
SimpleRDF(context).get(iri1, function (err, g) {
  g.save(iri2, ..)
})
```

### Bonus: Full working example

See other [working examples](https://github.com/nicola/simplerdf/tree/master/examples)

```javascript
var context = {
  'name': 'http://xmlns.com/foaf/0.1/name',
  'homepage': {
    '@id': 'http://xmlns.com/foaf/0.1/homepage',
    '@type': '@id'
  }
}
var me = SimpleRDF(context, 'https://nicolagreco.com')
me.name = 'Nicola'
me.homepage = 'http://nicolagreco.com'

console.log(me.name)
console.log(me['http://xmlns.com/foaf/0.1/name'])
console.log(me.toString())
```

## Limitations

- Only subject-centric queries (e.g. `graph.match(you_know_this[, predicate, object])`)
- Schemas must be typed

**Note**: If you want to use any of these two properties, then you want a proper low-level library like [rdf-ext](http://npm.im/rdf-ext) or [rdflib](http://npm.im/rdflib), or send a PR!

## License

MIT
