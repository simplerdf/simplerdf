# SimpleRDF

[![Join the chat at https://gitter.im/nicola/simplerdf](https://badges.gitter.im/nicola/simplerdf.svg)](https://gitter.im/nicola/simplerdf?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<img src="https://github.com/simplerdf/simplerdf/blob/master/logo.png" width="200px">

#### Attention: this library is _work in progress_

> The future simplest RDF library ever

RDF should be as easy as playing with JSON objects. Getting and setting should be easy peasy.

Read the original blog post: [_Towards the future RDF Library_](http://nicola.io/future-rdf/2015/)

##### TL;DR example
```javascript
var context = { 'name': 'http://xmlns.com/foaf/0.1/name' }
var me = SimpleRDF(context)
// You can edit using the predicate
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
// or by using the context
me.name = 'Nicola'
```

## Install

As a Node.js library

```javascript
npm install --save simplerdf
```

To generate a browser-ready version:
```
$ git clone https://github.com/nicola/simplerdf
$ cd simplerdf
$ npm install
$ npm run build
# This will generate `simplerdf.js` that you can load in your web application
```

## Usage

### 1) Create a SimpleRDF object

```javascript
// `context` is a JSON-LD context, useful if you want to
//           map predicates to nice property names
// `uri`     is the name of the resource
// `graph`   if you want to load an `rdf-ext` graph
// `store`   see the FAQ!
var me = SimpleRDF(/*[context, uri, graph, store] */)
```

### 2) (Optional) Load a context

You can load the context when creating the object

```javascript
var me = SimpleRDF({
  'name': 'http://xmlns.com/foaf/0.1/name'
})
// now we can use me.name
```

or later on (this overrides the previous context)

```javascript
me.context({
  'name': 'http://xmlns.com/foaf/0.1/name',
  'knows': {
    '@id': 'http://xmlns.com/foaf/0.1/knows',
    '@type': '@id',
    '@array': true  // Please send a PR if you have a better way to do this
  }
})
// now we can use me.knows (this will be an array!)
```

**Note**: If a properties is meant to contain multiple data (hence it is an array), pass `@array: true` in the schema description!

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

## CRUD features (`.get` and `.save`)

SimpleRDF supports some simple .get/.save. These respects the Linked Data Platform standard (have a look at [LDP](https://www.w3.org/TR/ldp/))

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
console.log(me.toString()) // this returns turtle!
```

## Limitations

- Only subject-centric queries (e.g. `graph.match(you_know_this[, predicate, object])`)
- Schemas must be typed

**Note**: If you want to use any of these two properties, then you want a proper low-level library like [rdf-ext](http://npm.im/rdf-ext) or [rdflib](http://npm.im/rdflib), or send a PR!

## FAQ

#### Can I use it without CRUD, parsers and serializers?

Of course, when you require it, use the lite version

```javascript
var simple = require('simplerdf/lite')
```

#### Can I customize the .get and .set?

Of course, there are plenty of rdf-ext stores availabe, here are some:

- [rdf-store-fs](https://github.com/rdf-ext/rdf-store-fs) to use the file system as database
- [rdf-store-inmemory](https://github.com/rdf-ext/rdf-store-inmemory) to use memory - can be handy if you are using multiple graphs

Now, when you create a SimpleRDF object you can do the following:

```javascript
var store = require('rdf-store-fs')
var graph = SimpleRDF(context, iri, graph, store)
```

#### How can I do queries that are not subject-centric?

You mean..

```javascript
var simpleObject = SimpleRDF()
// ... //
simpleObject.graph().match(subj, pred, obj)
```

## Contributors

- [@nicola](https://github.com/nicola)
- [@bergos](https://github.com/bergos)

## License

MIT
