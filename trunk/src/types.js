// === Types ===============================================
// depend: none
uu.feat.types = {};

uu.mix(UU, {
  TYPES: { // typeof hash
    "boolean": 0x010, "number": 0x020, "string": 0x040, "function": 0x080
  },
  NULL:  0x001, // null
  UNDEF: 0x002, // undefined
  HASH:  0x004, // Hash / Object / window / document
  ARRAY: 0x008, // Array
  BOOL:  0x010, // Boolean
  NUM:   0x020, // Number
  STR:   0x040, // String
  FUNC:  0x080, // Function
  NODE:  0x100,
  FAKE:  0x200  // FakeArray // "length" has collection (eg: NodeList)
});

uu.mix(uu, {
  // uu.types - type detection
  types: function(mix,     // Mix:
                  match) { // Number(default: 0x0): match types
    var rv = (mix === null)   ? UU.NULL
           : (mix === void 0) ? UU.UNDEF
           : (mix === uudoc)  ? UU.HASH  // fixed
           : (mix === window) ? UU.HASH  // fixed
           : (mix instanceof Array) ? UU.ARRAY
           : (UU.TYPES[typeof mix] || UU.HASH);
    if (rv === UU.HASH) {
      rv = mix.nodeType ? UU.NODE
         : ("length" in mix) ? UU.FAKE : UU.HASH;
    }
    return match ? match & rv : rv;
    // return Number/Boolean
  }
  // fixed: IE6 (document/window instanceof Array) memory leaks
});
