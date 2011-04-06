// ECMAScript-262 5th

(function() {

var _toString = Object.prototype.toString,
    _trimSpace = /^\s+|\s+$/g;

// inner - mixin
function mixin(src,    // @param Hash:
               dest) { // @param Hash:
    for (var key in dest) {
        if (!(key in src)) {
            src[key] = dest[key];
        }
    }
}

// Array.isArray - fallback impl.
function ArrayIsArray(search) { // @param Mix: search
                                // @return Boolean:
    return _toString.call(search) === "[object Array]";
}

//{@mb
// Array.prototype.indexOf
function ArrayIndexOf(search,      // @param Mix: search element
                      fromIndex) { // @param Number(= 0): from index
                                   // @return Number: found index or -1
    var iz = this.length, i = fromIndex || 0;

    i = (i < 0) ? i + iz : i;
    for (; i < iz; ++i) {
        if (i in this) {
            if (this[i] === search) {
                return i;
            }
        }
    }
    return -1;
}
//}@mb

//{@mb
// Array.prototype.lastIndexOf
function ArrayLastIndexOf(search,      // @param Mix: search element
                          fromIndex) { // @param Number(= this.length): from index
                                       // @return Number: found index or -1
    var iz = this.length, i = fromIndex;

    i = (i < 0) ? i + iz + 1 : iz;
    while (--i >= 0) {
        if (i in this) {
            if (this[i] === search) {
                return i;
            }
        }
    }
    return -1;
}
//}@mb

//{@mb
// Array.prototype.every
function ArrayEvery(evaluator, // @param Function: evaluator
                    that) {    // @param this(= void): evaluator this
                               // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this) {
            if (!evaluator.call(that, this[i], i, this)) {
                return false;
            }
        }
    }
    return true;
}
//}@mb

//{@mb
// Array.prototype.filter
function ArrayFilter(evaluator, // @param Function: evaluator
                     that) {    // @param this(= void): evaluator this
                                // @return Array: [element, ... ]
    for (var rv = [], ri = 0, v, i = 0, iz = this.length; i < iz; ++i) {
        if (i in this) {
            if (evaluator.call(that, v = this[i], i, this)) {
                rv[ri++] = v;
            }
        }
    }
    return rv;
}
//}@mb

// Array.prototype.map
function ArrayMap(evaluator, // @param Function: evaluator
                  that) {    // @param this(= void): evaluator this
                             // @return Array: [element, ... ]
    for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
        if (i in this) {
            rv[i] = evaluator.call(that, this[i], i, this);
        }
    }
    return rv;
}

// Array.prototype.some
function ArraySome(evaluator, // @param Function: evaluator
                   that) {    // @param this(= void): evaluator this
                              // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this) {
            if (evaluator.call(that, this[i], i, this)) {
                return true;
            }
        }
    }
    return false;
}

// Array.prototype.forEach
function ArrayForEach(evaluator, // @param Function: evaluator
                      that) {    // @param this(= void): evaluator this
    var i = 0, iz = this.length;

    if (that) {
        for (; i < iz; ++i) {
            if (i in this) {
                evaluator.call(that, this[i], i, this);
            }
        }
    } else {
        for (; i < iz; ++i) {
            if (i in this) {
                evaluator(this[i], i, this);
            }
        }
    }
}

// Array.prototype.reduce
function ArrayReduce(evaluator,    // @param Function: evaluator
                     initialValue, // @param Mix(= void): initial value
                     __right__) {  // @hidden Number(= 0): 1 is right
                                   // @return Mix:
    var that = this, rv, undef,
        back = !!__right__,
        usedInitialValue = 0,
        iz = that.length, i = back ? --iz : 0;

    if (initialValue === undef) {
        rv = initialValue;
        ++usedInitialValue;
    }

    for (; (back ? i >= 0 : i < iz); (back ? --i : ++i)) {
        if (i in that) {
            if (usedInitialValue) {
                rv = evaluator(rv, that[i], i, that);
            } else {
                rv = that[i];
                ++usedInitialValue;
            }
        }
    }
    if (!usedInitialValue) {
        throw new Error("BAD_PARAM");
    }
    return rv;
}

// Array.prototype.reduceRight
function ArrayReduceRight(evaluator,      // @param Function: evaluator
                          initialValue) { // @param Mix(= void): initial value
                                          // @return Mix:
    return ArrayReduce.call(this, evaluator, initialValue, 1);
}

// Date.prototype.toISOString - to ISO8601 string
function DateToISOString() { // @return String:
    return this.toJSON ? this.toJSON() : implDateToJSON(this);
}

// Date.prototype.toJSON
function DateToJSON() { // @return String:
    return implDateToJSON(this);
}

function implDateToJSON(date) { // @param DateObject:
                                // @return String: "2000-01-01T00:00:00.000Z"
    var z = "0",
        m = date.getUTCMonth() + 1,
        d = date.getUTCDate(),
        h = date.getUTCHours(),
        min = date.getUTCMinutes(),
        sec = date.getUTCSeconds();

    return date.getUTCFullYear() + "-" +
           (m < 10 ? z + m : m) + "-" +
           (d < 10 ? z + d : d) + "T" +
           (h < 10 ? z + h : h) + ":" +
           (min < 10 ? z + min : min) + ":" +
           (sec < 10 ? z + sec : sec) + "." +
           ("00" + date.getUTCMilliseconds()).slice(-3) + "Z";
}

// Date.now
function DateNow() { // @return Number:
    return +new Date();
}

// Boolean.prototype.toJSON
// Number.prototype.toJSON
// String.prototype.toJSON
function ObjectToJson() { // @return Mix:
    return this.valueOf();
}

// String.prototype.trim
function StringTrim() { // @return String: "has  space"
    return this.replace(_trimSpace, "");
}

// Function.prototype.bind
function FunctionBind(context                 // @param this: context
                      /*, var_args, ... */) { // @param Mix: arguments
                                              // @return Function:
    var rv, that = this, array = Array.prototype,
        args = array.slice.call(arguments, 1), // IE safe
        clean = function() {};

    rv = function() {
        return that.apply(this instanceof clean ? this : context,
            array.concat.call(args, array.slice.call(arguments, 0)));
    };
    clean.prototype = that.prototype;
    rv.prototype = new clean();
    return rv;
}

// Object.keys
function ObjectKeys(object) { // @param Object:
                              // @return Array:
    var rv = [], key, ri = 0;

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            rv[ri++] = object[key];
        }
    }
    return rv;
}

// --- extends ---
mixin(Array.prototype, {
//{@mb
    every:          ArrayEvery,     // Array#every(evaluator:Function, that:this = void):Boolean
    filter:         ArrayFilter,    // Array#filter(evaluator:Function, that:this = void):Array
    indexOf:        ArrayIndexOf,   // Array#indexOf(search:Mix, fromIndex:Number = 0):Number
    lastIndexOf:                    // Array#lastIndexOf(search:Mix, fromIndex:Number = this.length):Number
                    ArrayLastIndexOf,
//}@mb
    map:            ArrayMap,       // Array#map(evaluator:Function, that:this = void):Array
    some:           ArraySome,      // Array#some(evaluator:Function, that:this = void):Boolean
    forEach:        ArrayForEach,   // Array#forEach(evaluator:Function, that:this = void)
    reduce:         ArrayReduce,    // Array#reduce(evaluator:Function, initialValue:Mix = void):Mix
    reduceRight:                    // Array#reduceRight(evaluator:Function, initialValue:Mix = void):Mix
                    ArrayReduceRight
});

// Array.isArray
// supports: IE9+, Opera, WebKit528+(Safari4+), Firefox,
//           Node.js, iOS4+, Android1.5+, Titanium, ES5+
(Array.isArray || (Array.isArray = ArrayIsArray));

mixin(Boolean.prototype, {
    toJSON:         ObjectToJson    // Boolean#toJSON
});

mixin(Date.prototype, {
    toJSON:         DateToJSON,     // String#toJSON
    toISOString:    DateToISOString // String#toISOString
});
(Date.now || (Date.now = DateNow)); // Date.now()

mixin(Number.prototype, {
    toJSON:         ObjectToJson    // Number#toJSON
});

mixin(String.prototype, {
    trim:           StringTrim,     // String#trim
    toJSON:         ObjectToJson    // String#toJSON
});

mixin(Function.prototype, {
    bind:           FunctionBind    // Function#bind
});

(Object.keys || (Object.keys = ObjectKeys)); // Object.keys

})();
