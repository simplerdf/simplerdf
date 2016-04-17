'use strict'

class SimpleArray {
  constructor (addValue, getValue, removeValue, array) {
    this._addValue = addValue
    this._getValue = getValue
    this._removeValue = removeValue
    this._array = array || []
  }

  at (index, value) {
    if (value !== undefined) {
      if (this._array[index] !== undefined) {
        this._removeValue(this._array[index])
      }

      this._addValue(this._array[index] = value)
    }

    return this._array[index]
  }

  indexOf (searchElement, fromIndex) {
    return this._array.indexOf(searchElement, fromIndex)
  }

  forEach (callback, thisArg) {
    return this._array.forEach(callback, thisArg)
  }

  map (callback, thisArg) {
    return this._array.map(callback, thisArg)
  }

  reduce (callback, initialValue) {
    return this._array.reduce(callback, initialValue)
  }

  reduceRight (callback, initialValue) {
    return this._array.reduceRight(callback, initialValue)
  }

  push (value) {
    let index = this._array.push(value)
    this._addValue(value)
    return index
  }

  pop () {
    let popped = this._array.pop()
    this._removeValue(popped)
    return popped
  }
}

module.exports = SimpleArray
