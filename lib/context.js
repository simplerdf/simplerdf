function Context (json) {
  this._json = json
}

Context.prototype.description = function (property) {
  if (!(property in this._json)) {
    return null
  }

  var json = this._json[property]
  var description = {}

  description.property = property
  description.options = {
    array: false,
    namedNode: false
  }

  if (typeof json === 'string') {
    description.predicate = json
  } else {
    description.predicate = json['@id']
    description.options.array = '@array' in json && json['@array']
    description.options.namedNode = '@type' in json && json['@type'] === '@id'
  }

  return description
}

Context.prototype.descriptions = function () {
  var self = this

  return self.properties().map(function (property) {
    return self.description(property)
  })
}

Context.prototype.properties = function () {
  return Object.keys(this._json)
}

module.exports = Context
