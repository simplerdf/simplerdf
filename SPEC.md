# Mapping

This file aims at designing the spec of the implementation of simplerdf

## Creating a Graph Object

```javascript
var me = r()
```

## Getting Graph properties

By default:

```javascript
me['http://xmlns.com/foaf/0.1/name']
```
(these are extracted from the graph that we pass to `r(graph)`)

By defining context:

```javascript
me.context({
  name: 'http://xmlns.com/foaf/0.1/name'
})
```

By registering a namespace:

```javascript
me.register('foaf', {
  name: 'Literal'
}, 'http://xmlns.com/foaf/0.1/')
```

## Setting Graph properties

By default:

```javascript
me['http://xmlns.com/foaf/0.1/name'] = 'Nicola'
```

By defining context:
```javascript
me.name = 'Nicola'
```

By registering a namespace:
```javascript
me.foaf.name = 'Nicola'
```

## Triples with multiple predicats (mapping to Arrays)

The idea is to implement a mapping between `Array` and RDF Graphs

Getting the n-th object:

```javascript
me.knows[n]
```

Setting multiple objects to the same predicate: 

```javascript
me.knows = ['http://nicola.io/#me', 'http://timbl.com/#me']
```

Adding multiple objects to the same predicate

```javascript
me.knows.push('http://nicola.io/#me')
```

Removing a triple from the graph

```javascript
me.knows.slice(0,1)
// and
delete me.knows[0]
```

Functional programming
```
me.knows.filter
me.knows.map
me.knows.reduce
me.knows.some
// and so on
```

## Extra (but important) functions

From object to graph
```
me.toGraph()
```

From object to turtle

```
me.toString()
// one may define other types
```

## Contribute

Please add what is missing
