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
      this.graph.add(rdf.quad(newSubject, triple.predicate, triple.object))
    })
  }

  updateObject (newObject) {
    this.graph.match(null, null, this.iri).forEach((triple) => {
      this.graph.remove(triple)
      this.graph.add(rdf.quad(triple.subject, triple.predicate, newObject))
    })
  }

  addValues (predicate, options, values) {
    if (!Array.isArray(values)) {
      values = [values]
    }

    values.forEach((value) => {
      if (typeof value === 'string') {
        if (options.namedNode) {
          this.graph.add(rdf.quad(this.iri, predicate, rdf.namedNode(value)))
        } else {
          this.graph.add(rdf.quad(this.iri, predicate, rdf.literal(value)))
        }
      } else if (typeof value === 'object') {
        if (value.termType) {
          this.graph.add(rdf.quad(this.iri, predicate, value))
        } else {
          this.graph.add(rdf.quad(this.iri, predicate, value._core.iri))

          // don't cache array values, because we cache the complete array
          if (!options.array) {
            this.objects[predicate] = value
          }
        }
      } else if (typeof value === 'boolean') {
        this.graph.add(rdf.quad(
          this.iri,
          predicate,
          rdf.literal(value, rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))))
      } else if (typeof value === 'number') {
        this.graph.add(rdf.quad(
          this.iri,
          predicate,
          rdf.literal(value, rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))))
      } else {
        console.warn('unsupported type: ' + typeof value)
      }
    })
  }

  getValuesArray (predicate, options) {
    return this.graph.match(this.iri, predicate).map((triple) => {
      if (triple.object.termType !== 'Literal') {
        if (options.namedNode) {
          return triple.object.value
        } else {
          return this.object.child(triple.object)
        }
      } else {
        if (triple.object.datatype) {
          if (triple.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean') {
            return triple.object.value === 'true'
          } else if (triple.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#double') {
            return Number.parseFloat(triple.object.value)
          }
        }

        return triple.object.value
      }
    }).toArray()
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
      return rdf.namedNode(iri)
    } else {
      return iri || rdf.blankNode()
    }
  }
}

module.exports = SimpleCore
