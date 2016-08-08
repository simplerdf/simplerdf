'use strict'

const rdf = require('rdf-ext')
const SimpleArray = require('./array')

class SimpleCore {
  constructor (object) {
    this.object = object
    this.objects = {}
  }

  updateSubject (newSubject) {
    this.graph.match(this.iri).forEach((triple) => {
      this.graph.remove(triple)
      this.graph.add(rdf.createTriple(newSubject, triple.predicate, triple.object))
    })
  }

  updateObject (newObject) {
    this.graph.match(null, null, this.iri).forEach((triple) => {
      this.graph.remove(triple)
      this.graph.add(rdf.createTriple(triple.subject, triple.predicate, newObject))
    })
  }

  addValues (predicate, options, values) {
    if (!Array.isArray(values)) {
      values = [values]
    }

    values.forEach((value) => {
      if (typeof value === 'string') {
        if (options.namedNode) {
          this.graph.add(rdf.createTriple(this.iri, predicate, rdf.createNamedNode(value)))
        } else {
          this.graph.add(rdf.createTriple(this.iri, predicate, rdf.createLiteral(value)))
        }
      } else if (typeof value === 'object') {
        if (value.interfaceName) {
          this.graph.add(rdf.createTriple(this.iri, predicate, value))
        } else {
          this.graph.add(rdf.createTriple(this.iri, predicate, value._core.iri))

          // don't cache array values, because we cache the complete array
          if (!options.array) {
            this.objects[predicate] = value
          }
        }
      } else if (typeof value === 'boolean') {
        this.graph.add(rdf.createTriple(
          this.iri,
          predicate,
          rdf.createLiteral(value, null, 'http://www.w3.org/2001/XMLSchema#boolean')))
      } else if (typeof value === 'number') {
        this.graph.add(rdf.createTriple(
          this.iri,
          predicate,
          rdf.createLiteral(value, null, rdf.createNamedNode('http://www.w3.org/2001/XMLSchema#double'))))
      } else {
        console.warn('unsupported type: ' + typeof value)
      }
    })
  }

  getValuesArray (predicate, options) {
    return this.graph.match(this.iri, predicate).map((triple) => {
      if (triple.object.interfaceName !== 'Literal') {
        if (options.namedNode) {
          return triple.object.toString()
        } else {
          return this.object.child(triple.object)
        }
      } else {
        return triple.object.toString()
      }
    })
  }

  getValues (predicate, options) {
    if (predicate in this.objects) {
      return this.objects[predicate]
    }

    let values = this.getValuesArray(predicate, options)

    if (!options.array) {
      values = values.shift()
    } else {
      values = this.objects[predicate] = new SimpleArray(
        this.addValues.bind(this, predicate, options),
        this.getValues.bind(this, predicate, options),
        this.removeValues.bind(this, predicate, options),
        this.getValuesArray(predicate, options)
      )
    }

    return values
  }

  removeValues (predicate, options) {
    this.graph.removeMatches(this.iri, predicate)
  }

  static buildIri (iri) {
    if (typeof iri === 'string') {
      return rdf.createNamedNode(iri)
    } else {
      return iri || rdf.createBlankNode()
    }
  }
}

module.exports = SimpleCore
