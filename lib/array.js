function SimpleArray (addValue, getValue, removeValue, array) {
  this._addValue = addValue
  this._getValue = getValue
  this._removeValue = removeValue
  this._array = array || []
}

SimpleArray.prototype.at = function (index, value) {
  if (value !== undefined) {
    if (this._array[index] !== undefined) {
      this._removeValue(this._array[index])
    }

    this._addValue(this._array[index] = value)
  }

  return this._array[index]
}

SimpleArray.prototype.forEach = function (callback, thisArg) {
  return this._array.forEach(callback, thisArg)
}

SimpleArray.prototype.push = function (value) {
  var index = this._array.push(value)
  this._addValue(value)
  return index
}

module.exports = SimpleArray
