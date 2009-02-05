// === Hash ================================================
// depend: none
uu.feat.hash = {};

(function() {
function hashImpl(mix, _kind, _miss) {
  var rv = [], ri = -1, v = _miss, i, iz, size = 0;

  if ("length" in mix) {
    for (i = 0, iz = mix.length; i < iz; ++i) {
      if (i in mix) {
        ++size, v = mix[i];
        if (_kind === 1) { break; }
        if (_kind >= 3) {
          rv[++ri] = _kind === 3 ? i : v;
        }
      }
    }
  } else {
    for (i in mix) {
      if (mix.hasOwnProperty(i)) {
        ++size, v = mix[i];
        if (_kind === 1) { break; }
        if (_kind >= 3) {
          rv[++ri] = _kind === 3 ? i : v;
        }
      }
    }
  }
  return !_kind ? size : (_kind >= 3) ? rv : v;
}

uu.mix(uu, {
  // uu.pair - make one pair Hash( { key: value } )
  pair: function(key,     // String/Number: hash-key
                 value) { // Mix: hash-value
    var rv = {};
    rv[key] = value;
    return rv; // return Hash( { key: value } )
  },

  // uu.size - get length
  size: function(mix) { // FakeArray/Array/Hash:
    return hashImpl(mix, 0); // return Number
  },

  // uu.first - get first element value
  first: function(mix,    // FakeArray/Array/Hash:
                  miss) { // Mix(default: undefined): miss value
    return hashImpl(mix, 1, miss); // return FakeArray/Array/Hash value
  },

  // uu.last - get last element value
  last: function(mix,     // FakeArray/Array/Hash:
                 miss) {  // Mix(default: undefined): miss value
    return hashImpl(mix, 2, miss); // return FakeArray/Array/Hash value
  },

  // uu.keys - enum index
  keys: function(mix) { // FakeArray/Array/Hash:
    return hashImpl(mix, 3); // return Array( [key, ... ] )
  },

  // uu.values - enum values
  values: function(mix) { // FakeArray/Array/Hash:
    return hashImpl(mix, 4); // return Array( [key, ... ] )
  }
});
})();
