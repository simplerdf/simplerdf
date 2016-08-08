'use strict'

const rdf = require('rdf-ext')

class DefinePropertyHandler {
  constructor (object, core) {
    this.object = object
    this.core = core
  }

  addProperty (property, predicate, options) {
    options = options || {}

    predicate = rdf.createNamedNode(predicate.toString())

    Object.defineProperty(this.object, property, {
      configurable: true,
      get: () => {
        return this.core.getValues(predicate, options)
      },
      set: (values) => {
        this.core.removeValues(predicate, options)
        this.core.addValues(predicate, options, values)
      }
    })
  }

  hasProperty (property) {
    return Object.getOwnPropertyDescriptor(this.object, property)
  }
}

module.exports = DefinePropertyHandler
