// Type detection

(function(global, // @param GlobalObject:
          lib) {  // @param LibraryRootObject:

var _toString = Object.prototype.toString,
    _types = { "NaN": 2 },
    _protocol = /^(https?|file|wss?):/,
    //         [1]                      [2]         [3]           [4]
    //                        localhost /dir/f.ext  ?key=value    #hash
    _file = /^(file:)\/{2,3}(?:loc\w+)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i,
    //          [1]         [3]           [4]          [5]    [6]         [7]          [8]
    //          https://    user:pass@    server     : port   /dir/f.ext  ?key=value   #hash
    _http = /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i;

// uu.isMatch - A is B
function isMatch(a,   // @param Mix: value a
                 b) { // @param Mix: value b
                      // @return Boolean:
    var typeA = uutype(a), typeB = uutype(b), key;

    if (typeA !== typeB) { // type missmatch
        return false;
    }

    switch (typeA) {
    case _types.NODE:
    case _types.FAKEARRAY:
        return false;
    case _types.HASH:
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false;
        }
        for (key in a) {
            if (!isMatch(a[key], b[key])) { // recursive
                return false;
            }
        }
        break;
    case _types.DATE:
        if ((a.getMilliseconds() !== b.getMilliseconds())) {
            return false;
        }
        // break;
    default:
        if (a + "" !== b + "") {
            return false;
        }
    }
    return true;
}

// uu.type - type detection
function uutype(mix) { // @param Mix: search literal/object
                       // @return Number: uu.types
    //  [1][typeof] uu.type("str")          -> uu.type.STRING
    //  [2][typeof] uu.type(Node)           -> uu.type.NODE
    //  [3][typeof] uu.type(document.links) -> uu.type.FAKEARRAY

    if (mix == null) {
        return mix === null ? uutype.NULL : uutype.UNDEFINED;
    }
    if (mix === global) {
        return uutype.HASH;
    }
    if (mix.nodeType && mix.appendChild) {
        return uutype.NODE;
    }
    if (mix.constructor === global.NodeList) { // [fix][Safari5]
        return uutype.FAKEARRAY;
    }
    return _types[typeof mix] ||
           _types[_toString.call(mix)] ||
           ((mix.callee || mix.item) ? uutype.FAKEARRAY
                                     : uutype.HASH);
}

// uu.isURL - is URL
function isURL(search) { // @param Mix: search
                         // @return Boolean:
    if (isString(search) && _protocol.test(search)) {
        return search.slice(0, 4) === "file" ? _parse.file.test(search)
                                             : _parse.http.test(search);
    }
    return false;
}

// uu.isNode - is DOM Node
function isNode(search) { // @param Mix: search
                          // @return Boolean:
    return !!(search && search.nodeType);
}

// uu.isNumber - is number
function isNumber(search) { // @param Mix: search
                            // @return Boolean:
    return typeof search === "number";
}

// uu.isString - is string
function isString(search) { // @param Mix: search
                            // @return Boolean:
    return typeof search === "string";
}

// uu.isFunction - is function
function isFunction(search) { // @param Mix: search
                              // @return Boolean:
    return _toString.call(search) === "[object Function]";
}

// --- type sampling ---
(function() {
    var i = 0, iz = 12,
        types = [
            "BOOLEAN", "NUMBER", "STRING", "FUNCTION",
            "ARRAY", "DATE", "REGEXP", "UNDEFINED",
            "NULL", "HASH", "NODE", "FAKEARRAY"
        ],
        samples = [true, 0, "", detectTypes, [], new Date, /0/];

    for (; i < iz; ++i) {
        lib.type[types[i]] = i + 1; // { BOOLEAN: 1, NUMBER: 2, ... }
        i < 4 && (_types[typeof         samples[i] ] = i + 1);
        i < 7 && (_types[_toString.call(samples[i])] = i + 1);
    }
})();

// --- export ---
lib.type = uutype;          // uu.type(mix:Mix):Number
                            //  uu.type.BOOLEAN   -  1: Boolean
                            //  uu.type.NUMBER    -  2: Number
                            //  uu.type.STRING    -  3: String
                            //  uu.type.FUNCTION  -  4: Function
                            //  uu.type.ARRAY     -  5: Array
                            //  uu.type.DATE      -  6: Date
                            //  uu.type.REGEXP    -  7: RegExp
                            //  uu.type.UNDEFINED -  8: undefined
                            //  uu.type.NULL      -  9: null
                            //  uu.type.HASH      - 10: Hash (aka Object)
                            //  uu.type.NODE      - 11: Node (HTMLElement)
                            //  uu.type.FAKEARRAY - 12: FakeArray
                            //          (Arguments, NodeList, HTMLCollection)
lib.isURL = isURL;          // uu.isURL(search:Mix):Boolean
lib.isNode = isNode;        // uu.isNode(search:Mix):Boolean
lib.isMatch = isMatch;      // uu.isMatch(search:Mix):Boolean
lib.isNumber = isNumber;    // uu.isNumber(search:Mix):Boolean
lib.isString = isString;    // uu.isString(search:Mix):Boolean
lib.isFunction = isFunction;// uu.isFunction(search:Mix):Boolean

})(this, this.uu || this);
