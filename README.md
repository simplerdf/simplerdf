# SimpleRDF [![](https://img.shields.io/badge/chat-gitter-FC424C.svg?style=flat-square)](https://gitter.im/simplerdf/simplerdf) [![](https://img.shields.io/badge/project-SimpleRDF-FC424C.svg?style=flat-square)](https://github.com/simplerdf)

<img src="https://github.com/simplerdf/simplerdf/blob/master/logo.png" width="300px">

> The future simplest RDF library ever

--

- [Install](https://github.com/simplerdf/simplerdf#install)
- [Quick tutorial](https://github.com/simplerdf/simplerdf#quick-tutorial)
- [Limitations](https://github.com/simplerdf/simplerdf#limitations)
- [Faq](https://github.com/simplerdf/simplerdf#faq)
- [Roadmap](https://github.com/simplerdf/simplerdf#roadmap)

--

##### TL;DR example

RDF should be as easy as playing with JSON objects.

Read the original blog post: [_Towards the future RDF Library_](http://nicola.io/future-rdf/2015)

```javascript
var simple = require('simplerdf')
var context = { 'name': 'http://xmlns.com/foaf/0.1/name' }
var me = simple(context)
// You can now edit the foaf name simply with
me.name = 'Nicola'
// as well as using the full predicate
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
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
$ npm run build-browser
# This will generate `simplerdf.js` that you can load in your web application
```

## Quick tutorial

### 1) Create a SimpleRDF object (easy peasy)

```javascript
// The constructor takes 4 optional parameters:
// `context` is a JSON-LD context, useful if you want to
//           map predicates to nice property names
// `uri`     is the name of the resource
// `graph`   if you want to load an `rdf-ext` graph
// `store`   see the FAQ!
var simple = require('simplerdf')

var me = simple({
  'name': 'http://xmlns.com/foaf/0.1/name'
})

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

### 2) Using arrays (simple pimple)

You want to enforce an property to be always an array? Pass `'@container': '@set'` in the schema description!

```javascript
me.context({
  'name': 'http://xmlns.com/foaf/0.1/name',
  'knows': {
    '@id': 'http://xmlns.com/foaf/0.1/knows',
    '@type': '@id',
    '@container': '@set'
  }
})
// now we can use me.knows (this will be an array!)

me.knows = ['http://nicola.io/#me']
me.knows.at(0)
me.knows.map(function (object) { return 'hello' + object })
me.knows.length
```

**Note**: You just want to do me.knows[0] ? We are implementing this at the moment, stay tuned!


### 3) Use CRUD features `.get` and `.save` (crifty crafty)

SimpleRDF supports some simple .get/.save. These respects the Linked Data Platform standard (have a look at [LDP](https://www.w3.org/TR/ldp/))

```javascript
// This gets the iri specified in the constructor
simple(context, iri).get(function(err, g) {
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


### 4) Understanding `.child` (master jedi)

Imagine the you set the `iri` of your graph to be `http://amazing-libraries.org` and you now would like to change the subject to let's say `http://amazing-libraries.org/simplerdf`, you can use `.child(iri)`. This will create a new SimpleRDF object.

```
var amazinglibraries = simple(context, 'http://amazing-libraries.org')
var simplerdf = amazinglibraries.child('http://amazing-libraries.org/simplerdf')
// done!
```

### 5) Understanding `.graph()`, `.iri()` (wicky wacky)

Both these functions are setters if passed with a parameter and getters if no parameter is found. `.graph()` will give you access to an rdf-ext graph, `.graph(newGraph)` will replace the current graph with the new graph. `.iri()` will give you the `iri` that is the subject of your simple object. Finally `.iri(newIri)` will replace your subject


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

#### Can I customize the `.get` and `.set`?

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

## Roadmap

Coming soon

- [ ] Support of ES6 Proxy
  - No need to specify context
  - Use uri as context
  - Simple array support (e.g. `me.friends[0]`)
- [ ] Simple query language
  - `me.friends[0].get()`

## Contributors

- [@nicola](https://github.com/nicola)
- [@bergos](https://github.com/bergos)
- [@csarven](https://github.com/csarven)

## License

MIT
