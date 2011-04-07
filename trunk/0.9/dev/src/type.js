// Type detection

(function(global, // @param GlobalObject:
          lib) {  // @param LibraryRootObject:

var _toString = Object.prototype.toString,
    _types = {
        "boolean":          1,
        "number":           2,
        "NaN":              2,
        "string":           3,
        "function":         4,
        "[object Boolean]": 1,
        "[object Number]":  2,
        "[object String]":  3,
        "[object Function]":4,
        "[object Array]":   5,
        "[object Date]":    6,
        "[object RegExp]":  7
    },
    _protocol = /^(https?|file|wss?):/,
    //         [1]                      [2]         [3]           [4]
    //                        localhost /dir/f.ext  ?key=value    #hash
    _file = /^(file:)\/{2,3}(?:loc\w+)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i,
    //          [1]         [3]           [4]          [5]    [6]         [7]          [8]
    //          https://    user:pass@    server     : port   /dir/f.ext  ?key=value   #hash
    _http = /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i;

// isMatch - A is B
function isMatch(a,   // @param Mix: value a
                 b) { // @param Mix: value b
                      // @return Boolean:
    var typeA = typeDetection(a), typeB = typeDetection(b), key;

    if (typeA !== typeB) { // type missmatch
        return false;
    }

    switch (typeA) {
    case lib.type.NODE:
    case lib.type.FAKEARRAY:
        return false;
    case lib.type.HASH:
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false;
        }
        for (key in a) {
            if (!isMatch(a[key], b[key])) { // recursive
                return false;
            }
        }
        return true;
    case lib.type.DATE:
        if (a.getMilliseconds() !== b.getMilliseconds()) {
            return false;
        }
    }
    return (a + "") === (b + "");
}

// typeDetection - type detection
function typeDetection(mix) { // @param Mix: search literal/object
                              // @return Number: see lib.types
    //  [1][typeof] typeDetection("str")          -> STRING
    //  [2][typeof] typeDetection(Node)           -> NODE
    //  [3][typeof] typeDetection(document.links) -> FAKEARRAY

    if (mix == null) {
        return mix === null ? typeDetection.NULL : typeDetection.UNDEFINED;
    }
    if (mix === global) {
        return typeDetection.HASH;
    }
    if (mix.nodeType && mix.appendChild) {
        return typeDetection.NODE;
    }
    if (mix.constructor === global.NodeList) { // [fix][Safari5]
        return typeDetection.FAKEARRAY;
    }
    return _types[typeof mix] ||
           _types[_toString.call(mix)] ||
           ((mix.callee || mix.item) ? typeDetection.FAKEARRAY
                                     : typeDetection.HASH);
}

// isURL - is URL
function isURL(search) { // @param Mix: search
                         // @return Boolean:
    if (isString(search) && _protocol.test(search)) {
        return search.slice(0, 4) === "file" ? _file.test(search)
                                             : _http.test(search);
    }
    return false;
}

// isNode - is DOM Node
function isNode(search) { // @param Mix: search
                          // @return Boolean:
    return !!(search && search.nodeType);
}

// isNumber - is number
function isNumber(search) { // @param Mix: search
                            // @return Boolean:
    return typeof search === "number";
}

// isString - is string
function isString(search) { // @param Mix: search
                            // @return Boolean:
    return typeof search === "string";
}

// isFunction - is function
function isFunction(search) { // @param Mix: search
                              // @return Boolean:
    return _toString.call(search) === "[object Function]";
}

// --- export ---
lib.typeDetection = typeDetection;  // typeDetection(mix:Mix):Number
lib.typeDetection.BOOLEAN    = 1;   // typeDetection.BOOLEAN   -  1: Boolean
lib.typeDetection.NUMBER     = 2;   // typeDetection.NUMBER    -  2: Number
lib.typeDetection.STRING     = 3;   // typeDetection.STRING    -  3: String
lib.typeDetection.FUNCTION   = 4;   // typeDetection.FUNCTION  -  4: Function
lib.typeDetection.ARRAY      = 5;   // typeDetection.ARRAY     -  5: Array
lib.typeDetection.DATE       = 6;   // typeDetection.DATE      -  6: Date
lib.typeDetection.REGEXP     = 7;   // typeDetection.REGEXP    -  7: RegExp
lib.typeDetection.UNDEFINED  = 8;   // typeDetection.UNDEFINED -  8: undefined
lib.typeDetection.NULL       = 9;   // typeDetection.NULL      -  9: null
lib.typeDetection.HASH       = 10;  // typeDetection.HASH      - 10: Hash (aka Object)
lib.typeDetection.NODE       = 11;  // typeDetection.NODE      - 11: Node (HTMLElement)
lib.typeDetection.FAKEARRAY  = 12;  // typeDetection.FAKEARRAY - 12: FakeArray
                                    //         (Arguments, NodeList, HTMLCollection)
lib.isURL       = isURL;            // isURL(search:Mix):Boolean
lib.isNode      = isNode;           // isNode(search:Mix):Boolean
lib.isMatch     = isMatch;          // isMatch(search:Mix):Boolean
lib.isNumber    = isNumber;         // isNumber(search:Mix):Boolean
lib.isString    = isString;         // isString(search:Mix):Boolean
lib.isFunction  = isFunction;       // isFunction(search:Mix):Boolean

})(this, this.lib || this);
