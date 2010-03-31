
// === Core ===

// * WebKit based Cording-Style ( doc/cording-style.txt )
//
// * User configrations ( doc/user-configrations.txt )
//
//  - uu.config = { aria, debug, right, altcss, visited }
//
// * User callback functions ( doc/user-callback-functions.txt )
//
//  - window.xver(uu.ver:Hash)
//  - window.xboot(uu:Function)
//  - window.xwin(uu:Function)
//  - window.xcanvas(uu:Function, canvasNodeArray:NodeArray)
//  - window.xlocal(uu:Function, backend:Number)
//
// * Predefined types ( doc/predefined-types.txt )
//
//  - ColorHash, RGBAHash, HSLAHash, HSVAHash, W3CNamedColor
//  - ExtendEventHash, DateHash
//
// * Version and plugin detection ( doc/version-detection.txt )
//
//  - uu.ver = { library, browser, render, silverlight, flash, as3,
//               ie, ie6, ie7, ie8, ie9, ie67, ie678, ie89,
//               opera, gecko, webkit, chrome, safari, iphone,
//               quirks, xml, win, mac, unix, advanced, major, jit }

var uu; // window.uu - uupaa.js library namespace

uu || (function(win, doc) {

// --- library structure ---
uu = uumix(uujamfactory, {          //uu(expression:Jam/Node/NodeArray/String/window, context:Jam/Node = undefined):Jam
    ver:            _version(0.7),  // uu.ver - Hash: detected version and plugin informations
    plugin:         uuplugin,       // uu.plugin():Array
    require:        uurequire,      // uu.require(url:String):Boolean
    // --- type ---
    like:           uulike,         // uu.like(lhs:Date/Hash/Fake/Array, rhs:Date/Hash/Fake/Array):Boolean
    type:     uumix(uutype, {       // uu.type(search:Mix, match:Number = 0):Boolean/Number
        HASH:       0x001,          // uu.type.HASH         - Hash (Object)
        NODE:       0x002,          // uu.type.NODE         - Node (HTMLElement)
        FAKEARRAY:  0x004,          // uu.type.FAKEARRAY    - FakeArray (Arguments, NodeList, ...)
        DATE:       0x008,          // uu.type.DATE         - Date
        NULL:       0x010,          // uu.type.NULL         - null
        UNDEFINED:  0x020,          // uu.type.UNDEFINED    - undefined (void 0)
        BOOLEAN:    0x040,          // uu.type.BOOLEAN      - Boolean
        FUNCTION:   0x080,          // uu.type.FUNCTION     - Function
        NUMBER:     0x100,          // uu.type.NUMBER       - Number
        STRING:     0x200,          // uu.type.STRING       - String
        ARRAY:      0x400,          // uu.type.ARRAY        - Array
        REGEXP:     0x800,          // uu.type.REGEXP       - RegExp
        CSS:        0x1000          // uu.type.CSS          - CSSProperties (getComputedStyle result)
    }),
    isNumber:       uuisnumber,     //   uu.isNumber(search:Mix):Boolean
    isString:       uuisstring,     //   uu.isString(search:Mix):Boolean
    isFunction:     uuisfunction,   // uu.isFunction(search:Mix):Boolean
    // --- hash / array ---
    arg:            uuarg,          // uu.arg(arg1:Hash = {}, arg2:Hash, arg3:Hash = undefined):Hash
    mix:            uumix,          // uu.mix(base:Hash, flavor:Hash, aroma:Hash = undefined, override:Boolean = true):Hash
    each:           uueach,         // uu.each(source:Hash/Array, callback:Function)
    keys:           uukeys,         // uu.keys(source:Hash/Array):Array
    values:         uuvalues,       // uu.values(source:Hash/Array):Array
    hash:     uumix(uuhash, {       // uu.hash(key:Hash/String, value:Mix = undefined):Hash
        has:        uuhas,          //     uu.hash.has(source:Hash, search:Array):Boolean
        nth:        uunth,          //     uu.hash.nth(source:Hash, nth:Number):Array
        size:       uusize,         //    uu.hash.size(source:Hash):Number
        clone:      uuclone,        //   uu.hash.clone(source:Hash):Hash
        indexOf:    uuindexof       // uu.hash.indexOf(source:Hash, search:Mix):String/undefined
    }),
    array:    uumix(uuarray, {      // uu.array(source:Array/Mix/NodeList/Arguments):Array
        has:        uuhas,          //    uu.array.has(source:Array, search:Array):Boolean
        nth:        uunth,          //    uu.array.nth(source:Array, nth:Number):Array
        size:       uusize,         //   uu.array.size(source:Array):Number
        sort:       uusort,         //   uu.array.sort(source:Array, method:String/Function = "0-9"):Array
        clean:      uuclean,        //  uu.array.clean(source:Array):Array
        clone:      uuclone,        //  uu.array.clone(source:Array):Array
        toHash:     uutohash,       // uu.array.toHash(key:Array, value:Array/Mix, toNumber:Boolean = false):Hash
        unique:     uuunique        // uu.array.unique(source:Array, literalOnly:Boolean = false):Array
    }),
    // --- attribute ---
    attr:     uumix(uuattr, {       // uu.attr(node:Node, key:Hash/String, value:String = undefined):String/Hash/Node
                                    //  [1][get one  attr ] uu.attr(node, "attr") -> "value"
                                    //  [2][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
                                    //  [3][set one  attr ] uu.attr(node, "attr", "val") -> node
                                    //  [4][set some attrs] uu.attr(node, { attr: "val" }) -> node
        get:        uuattrget,      // uu.attr.get(node:Node, attrs:String):String/Hash
                                    //  [1][get one  attr ] uu.attr.get(node, "attr") -> String
                                    //  [2][get some attrs] uu.attr.get(node, "attr,...") -> Hash
        set:        uuattrset,      // uu.attr.set(node:Node, key:String/Hash, value:String = undefined):Node
                                    //  [1][set one  attr ] uu.attr.set(node, key, val ) -> node
                                    //  [2][set some attrs] uu.attr.set(node, { key: val, ... }) -> node
        getAll:     uuattrgetall    // uu.attr.getAll(node:Node, filter:Boolean = false):Hash
                                    //  [1][get all]    uu.attr(node) -> { all: attrs }
                                    //  [2][use filter] uu.attr(node, true) -> { many: attrs }
    }),
    // --- css ---
    css:      uumix(uucss, {        // uu.css(node:Node, key:Hash/String, value:String = undefined):String/Hash/Node
                                    //  [1][get one  style ] uu.css(node, "color") -> "red"
                                    //  [2][get some styles] uu.css(node, "color,width") -> { color: "red", width: "20px" }
                                    //  [3][set one  style ] uu.css(node, "color", "red") -> node
                                    //  [4][set some styles] uu.css(node, { color: "red" }) -> node
        get:        uucssget,       // uu.css.get(node:Node, styles:String):String/Hash
                                    //  [1][get one  style ] uu.css.get(node, "color") -> "red"
                                    //  [2][get some styles] uu.css.get(node, "color,text-align") -> {color:"red", textAlign:"left"}
        set:        uucssset,       // uu.css.set(node:Node, key:String/Hash, value:String = undefined) -> node
                                    //  [1][set one  style ] uu.css.set(node, "color", "red") -> node
                                    //  [2][set some styles] uu.css.set(node, { color: "red" }) -> node
        opacity:
              uumix(uucssopacity, { // uu.css.opacity(node:Node, opacity:Number = undefined, isRelativeValue:Boolean = false):Number/node
                                    //  [1][get opacity] uu.css.opacity(node) -> Number(0.0~1.0)
                                    //  [2][set opacity] uu.css.opacity(node, opacity, isRelativeValue = false) -> node
            get:    uucssopacityget,// uu.css.opacity.get(node:Node):Number
            set:    uucssopacityset // uu.css.opacity.set(node:Node, opacity:Number, isRelativeValue:Boolean = false):Node
        })
    }),
    // --- getComputedStyle / currentStyle wrapper ---
    style:    uumix(uustyle, {      // uu.style(node:Node, mode:Number = 0):Hash
        quick:      uustylequick    // uu.style.quick(node:Node):Hash
    }),
    // --- query ---
    id:             uuid,           //    uu.id(expression:String, context:Node = document):Node/null
    tag:            uutag,          //   uu.tag(expression:String, context:Node = document):NodeArray
    query:          uuquery,        // uu.query(expression:String, context:NodeArray/Node = document):NodeArray
    // --- className(klass) ---
    klass:    uumix(uuklass, {      // uu.klass(expression:String, context:Node = document):NodeArray
        has:        uuklasshas,     //    uu.klass.has(node:Node, classNames:String):Boolean
        add:        uuklassadd,     //    uu.klass.add(node:Node, classNames:String):Node
        sub:        uuklasssub,     //    uu.klass.sub(node:Node, classNames:String):Node
        toggle:     uuklasstoggle   // uu.klass.toggle(node:Node, classNames:String):Node
    }),
    // --- color ---
    color:    uumix(uucolor, {      // uu.color(source:String):ColorHash/Number
                                    //  [1][W3CNamedColor to hash] uu.color("black")   -> ColorHash
                                    //  [2]["#000" to hash]        uu.color("#000")    -> ColorHash
                                    //  [3]["#000000" to hash]     uu.color("#000000") -> ColorHash
                                    //  [4]["rgba(,,,,) to hash]   uu.color("rgba(0,0,0,1)")         -> ColorHash
                                    //  [5]["hsla(,,,,) to hash]   uu.color("hsla(360,100%,100%,1)") -> ColorHash
        add:        uucoloradd,     // uu.color.add(source:String)
        fix:        uucolorfix,     // uu.color.fix(source:ColorHash/RGBAHash):ColorHash
        expire:     uucolorexpire   // uu.color.expire()
    }),
    // --- event ---
    event:    uumix(uuevent, {      // uu.event(node:Node, namespaceAndEventTypes:String, evaluator:Function, detach:Boolean = false):Node
                                    //  [1][bind a event]            uu.event(node, "click", fn)             -> node
                                    //  [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
                                    //  [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
                                    //  [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node
        has:        uueventhas,     // uu.event.has(node:Node, namespaceAndEventTypes:String):Boolean
        fire:       uueventfire,    // uu.event.fire(node:Node, eventType:String, param:Mix = undefined):Node
        stop:       uueventstop,    // uu.event.stop(eventObject:EventObject):EventObject
        unbind:     uueventunbind,  // uu.event.unbind(node:Node, namespaceAndEventTypes:String = undefined):Node
        attach:     uueventattach,  // uu.event.attach(node:Node, eventType:String, evaluator:Function, capture:Boolean = false)
        detach:     uueventdetach   // uu.event.detach(node:Node, eventType:String, evaluator:Function, capture:Boolean = false)
    }),
    // --- node / node list / tag ---
    node:     uumix(uunode, {       // uu.node(tagName:String = "div"):Node
        add:        uunodeadd,      // uu.node.add(source:Node/DocumentFragment/HTMLFragment/TagName = "div", context:Node = <body>, position:Number = 6):Node
                                    //  [1][add div node]          uu.node.add()         -> <body><div /></body>
                                    //  [2][from tagName]          uu.node.add("p")      -> <body><p /></body>
                                    //  [3][from node]             uu.node.add(uu.div()) -> <body><div /></body>
                                    //  [4][from HTMLFragment]     uu.node.add("<div><p>txt</p></div>") -> <body><div><p>txt</p></div></body>
                                    //  [5][from DocumentFragment] uu.node.add(DocumentFragment)        -> <body>{{fragment}}</body>
        has:        uunodehas,      // uu.node.has(node:Node, context:Node):Boolean
        root:       doc.documentElement || doc.html,
                                    // root node, documentElement or <html>(in IE quirks)
        bulk:       uunodebulk,     // uu.node.bulk(source:Node/HTMLFragment):DocumentFragment
        swap:       uunodeswap,     // uu.node.swap(swapin:Node, swapout:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        clear:      uunodeclear,    // uu.node.clear(context:Node):Node
        clone:      uunodebulk,     // [alias]
        remove:     uunoderemove,   // uu.node.remove(node:Node):Node
        fromPoint:  uunodefrompoint // uu.node.fromPoint(x:Number, y:Number):Node
    }),
    nodeid:   uumix(uunodeid, {     // uu.nodeid(node:Node):Number (nodeid)
        toNode:     uunodeidtonode, // uu.nodeid.toNode(nodeid:Number):Node
        remove:     uunodeidremove  // uu.nodeid.remove(node:Node):Node (removed node)
    }),
    // --- string ---
    fix:            uufix,          // uu.fix(source:String):String
                                    // [1][css-prop to js-css-prop] uu.fix("background-color") -> "backgroundColor"
                                    // [2][std-name to ie-name]     uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
                                    // [3][html-attr to js-attr]    uu.fix("for")              -> "htmlFor"
                                    // [4][through]                 uu.fix("-webkit-shadow")   -> "-webkit-shadow"
    trim:     uumix(uutrim, {       // uu.trim("  has  space  ") -> "has  space"
        tag:        uutrimtag,      // uu.trim.tag("  <h1>A</h1>  B  <p>C</p>  ") -> "A B C"
        url:        uutrimurl,      // uu.trim.url('  url("http://...")  ') -> "http://..."
        inner:      uutriminner,    // uu.trim.inner("  diet  inner  space  ") -> "diet inner space"
        quote:      uutrimquote,    // uu.trim.quote(' "quote string" ') -> 'quote string'
        bracket:    uutrimbracket   // uu.trim.bracket(" <bracket>  (this)  [and]  {this} ") -> "bracket this and this"
    }),
    split:    uumix(uusplit, {      // uu.split(" A  B  C ") -> ["A", "B", "C"]
        comma:      uusplitcomma,   // uu.split.comma(",,, ,,A,,,B,C,, ") -> ["A","B","C"]

        toHash:     uusplittohash   // uu.split.toHash(source:String, splitter:String = ",", toNumber:Boolean = false):Hash
                                    //  [1][hash from string] uu.split.toHash("key,1,key2,1", ",") -> { key: 0, key2: 1 }
    }),
    format:         uuformat,       // uu.format("? dogs", 101) -> "101 dogs"
                                    // [1][placeholder] uu.format("? dogs and ?", 101, "cats") -> "101 dogs and cats"
    // --- JSON ---
    json:     uumix(uujson, {       // uu.json(source:Mix, useNativeJSON:Boolean = false, callback:Function = undefined):JSONString
        decode:     uujsondecode    // uu.json.decode(jsonString:JSONString, useNativeJSON:Boolean = false):Mix/Boolean
    }),
    // --- date ---
    date:     uumix(uudate, {       // uu.date(source:Date/Number/String= undefined) -> DateHash
        toISOString: uudatetoiso,   // uu.date.toISOString(dateHash:DateHash = undefined):ISO8601DateString
        toRFCString: uudatetorfc    // uu.date.toRFCString(dateHash:DateHash = undefined):RFC1123DateString
    }),
    // --- debug ---
    puff:           uupuff,         // uu.puff(source:Mix)
    trace:    uumix(uutrace, {      // uu.trace(titleOrSource:String/Mix, source:Mix = undefined)
        clear:      uutraceclear    // uu.trace.clear()
    }),
    // --- ready event ---
    ready:    uumix(uuready, {      // uu.ready(evaluator:Function = undefined, order:Number = 0)
        gone: {                     // ready event state
            dom:        0,          // 1 is [DOMReady]          DOMContentLoaded event fired
            win:        0,          // 1 is [WindowReady]       window.onload event fired
            audio:      0,          // 1 is [AudioReady]        <audio> ready event fired
            video:      0,          // 1 is [VideoReady]        <video> ready event fired
            canvas:     0,          // 1 is [CanvasReady]       <canvas> ready event fired
            storage:    0,          // 1 is [LocalStroageReady] LocalStorage ready event fired
            blackout:   0           // 1 is [BlackOut]          blackout (css3 cache reload)
        }
    }),
    // --- lazy evaluation ---
    lazy:     uumix(uulazy, {       // uu.lazy(id:String, evaluator:Function, order:Number = 0)
        fire:       uulazyfire      // uu.lazy.fire(id:String)
    }),
    // --- other ---
    js:             uujs,           // uu.js(javascriptExpression:String):Mix
    win: {
        size:       uuwinsize       // uu.win.size():Hash { innerWidth, innerHeight, scrollWidth, scrollHeight }
    },
    nop:            function() {},  // uu.nop():undefined, (no operation)
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    guid:           uuguid          // uu.guid():Number
});

// --- ECMAScript-262 5th ---
Array.isArray || (Array.isArray = uuisarray);

//{{{!mb
uumix(Array.prototype, {
    map:            arraymap,       //         map(evaluator:Function, that:this = undefined):Array
    some:           arraysome,      //        some(evaluator:Function, that:this = undefined):Boolean
    every:          arrayevery,     //       every(evaluator:Function, that:this = undefined):Boolean
    filter:         arrayfilter,    //      filter(evaluator:Function, that:this = undefined):Array
    forEach:        arrayforeach,   //     forEach(evaluator:Function, that:this = undefined)
    indexOf:        arrayindexof,   //     indexOf(search:Mix, fromIndex:Number = 0):Number
    lastIndexOf:    arraylastindexof// lastIndexOf(search:Mix, fromIndex:Number = this.length):Number

}, 0, 0);
//}}}!mb

uumix(Array.prototype, {
    reduce:         arrayreduce,    //      reduce(evaluator:Function, initialValue:Mix = undefined):Mix
    reduceRight:    arrayreduceright// reduceRight(evaluator:Function, initialValue:Mix = undefined):Mix
}, 0, 0);

uumix(Boolean.prototype, {
    toJSON:         numbertojson    //      toJSON():String
}, 0, 0);

uumix(Date.prototype, {
    toISOString:    datetoisostring,// toISOString():String
    toJSON:         datetoisostring //      toJSON():String
}, 0, 0);

uumix(Number.prototype, {
    toJSON:         numbertojson    //      toJSON():String
}, 0, 0);

uumix(String.prototype, {
    trim:           stringtrim,     //        trim():String
    toJSON:         stringtojson    //      toJSON():String
}, 0, 0);

//{{{!mb
uu.ver.gecko && win.HTMLElement && !win.HTMLElement.prototype.innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innertextgetter);
    proto.__defineSetter__("innerText", innertextsetter);
    proto.__defineGetter__("outerHTML", outerhtmlgetter);
    proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(win.HTMLElement.prototype);
//}}}!mb

// --- construction ---
uu.ie       = uu.ver.ie;
uu.opera    = uu.ver.opera;
uu.gecko    = uu.ver.gecko;
uu.webkit   = uu.ver.webkit;

uu.config   = uuarg(win.xconfig, {  // uu.config - Hash: user configurations
    aria:       0,
    debug:      0,
    right:      0,
    altcss:     0,
    visited:    0,
    baseDir:    uutag("script").pop().src.replace(/[^\/]+$/, "")
});

doc.html || (doc.html = uutag("html")[0]); // document.html = <html>
doc.head || (doc.head = uutag("head")[0]); // document.head = <head>

// window.xver(uu.ver) callback
win.xver && win.xver(uu.ver);

// ===================================================================

// --- Jam(NodeSet I/F) ---
// uu - uu.jam factory
function uujamfactory(expression, // @param Jam/Node/NodeArray/String/window:
                      context) {  // @param Jam/Node(= undefined): context
                                  // @return Jam:
    return new uu.jam(expression, context); // depend: uu.jam
}

// --- plugin / plugin name space ---
// uu.plugin - enum plugins
function uuplugin() { // @return Array: ["plugin-name", ...]
    return uukeys(uuplugin);
}

// uu.require - require file
function uurequire(url) { // @param String: url
                          // @return Boolean: true is load successed
    try {
        var xhr = win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
                  win.XMLHttpRequest ? new XMLHttpRequest() : 0;

        xhr.open("GET", url, false); // sync
        xhr.send(null);
        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
            return true;
        }
    } catch (err) {}

    return false;
}

// --- type ---

// [1][literal like literal]    uu.like("abcdef", "abcdef")              -> true
// [2][Date like Date]          uu.like(new Date(123), new Date(123))    -> true
// [3][Hash like Hash]          uu.like({ a: { b: 1 }}, { a: { b: 1 }})  -> true
// [4][Array like Array]        uu.like([1, [2, 3]], [1, [2, 3]])        -> true
// [5][FakeArray like FakeArray] uu.like(document.links, document.links) -> true

// uu.like - like and deep matching
function uulike(lhs,   // @param Date/Hash/Fake/Array: lhs
                rhs) { // @param Date/Hash/Fake/Array: rhs
                       // @return Boolean:
    var type1 = uutype(lhs);

    if (type1 !== uutype(rhs)) {
        return false;
    }
    switch (type1) {
    case uutype.FUNCTION:   return false;
    case uutype.DATE:       return uudatetoiso(uudate(lhs)) ===
                                   uudatetoiso(uudate(rhs));
    case uutype.HASH:       return (uusize(lhs) === uusize(rhs) && uuhas(lhs, rhs));
    case uutype.FAKEARRAY:  // http://d.hatena.ne.jp/uupaa/20091223
    case uutype.ARRAY:      return uuarray(lhs) + "" == uuarray(rhs);
    }
    return lhs === rhs;
}

// [1][typeof]                  uu.type("str") -> 0x100(uu.type.STRING)
// [2][typeof matched bits]     uu.type("str", uu.type.STRING | uu.type.NUMBER) -> true

// uu.type - type detection
function uutype(search,  // @param Mix: search literal/object
                match) { // @param Number(= 0): match types
                         // @return Boolean/Number: true is match,
                         //                         false is unmatch,
                         //                         Number is matched bits
    var rv = uutype._TYPEOF[typeof search] ||
             uutype._TYPEOF[Object.prototype.toString.call(search)] ||
             (!search ? uutype.NULL : search.nodeType ? uutype.NODE :
             "length" in search ? uutype.FAKEARRAY : uutype.HASH);

    return match ? !!(match & rv) : rv;
} // [OPTIMIZED]
uutype._TYPEOF = {
    "undefined":        uutype.UNDEFINED,
    "[object Boolean]": uutype.BOOLEAN,     "boolean":   uutype.BOOLEAN,
    "[object Number]":  uutype.NUMBER,      "number":    uutype.NUMBER,
    "[object String]":  uutype.STRING,      "string":    uutype.STRING,
    "[object Function]":uutype.FUNCTION,    "function":  uutype.FUNCTION,
    "[object RegExp]":  uutype.REGEXP,
    "[object Array]":   uutype.ARRAY,
    "[object Date]":    uutype.DATE,
    "[object CSSStyleDeclaration]":         uutype.CSS, // [WebKit][Opera]
    "[object ComputedCSSStyleDeclaration]": uutype.CSS  // [Gecko]
};

// uu.isNumber - is number
function uuisnumber(search) { // @param Mix: search
                              // @return Boolean:
    return typeof search === "number";
}

// uu.isString - is string
function uuisstring(search) { // @param Mix: search
                              // @return Boolean:
    return typeof search === "string";
}

// inner - is array
function uuisarray(search) { // @param Mix: search
                             // @return Boolean:
    return Object.prototype.toString.call(search) === "[object Array]";
}

// inner - is date
function uuisdate(search) { // @param Mix: search
                            // @return Boolean:
    return Object.prototype.toString.call(search) === "[object Date]";
}

// uu.isFunction - is function
function uuisfunction(search) { // @param Mix: search
                                // @return Boolean:
    return Object.prototype.toString.call(search) === "[object Function]";
}

// --- hash / array ---

// [1][supply args]         uu.arg({ a: 1 }, { b: 2 }) -> { a: 1, b: 2 }

// uu.arg - supply default arguments
function uuarg(arg1,   // @param Hash(= {}): arg1
               arg2,   // @param Hash: arg2
               arg3) { // @param Hash(= undefined): arg3
                       // @return Hash: new Hash(mixed arg)
    return uumix(uumix({}, arg1 || {}), arg2, arg3, 0);
}

// [1][override value]      uu.mix({a:9, b:9}, {a:1}, {b:2})    -> { a: 1, b: 2 }
// [2][stable value]        uu.mix({a:9, b:9}, {a:1}, {b:2}, 0) -> { a: 9, b: 9 }

// uu.mix - mixin
function uumix(base,       // @param Hash: mixin base
               flavor,     // @param Hash: add flavor
               aroma,      // @param Hash(= undefined): add aroma
               override) { // @param Boolean(= true): true is override
                           // @return Hash: base
    var i;

    if (override === void 0 || override) { // [1][3]
        for (i in flavor) {
            base[i] = flavor[i];
        }
    } else { // [2]
        for (i in flavor) {
            i in base || (base[i] = flavor[i]);
        }
    }
    return aroma ? uumix(base, aroma, 0, override) : base;
}

// [1][Array.forEach]       uu.each([1, 2],         function(v, i) {...})
// [2][Hash.forEach ]       uu.each({ a: 1, b: 2 }, function(v, i) {...})

// uu.each - for each
function uueach(source,     // @param Hash/Array: source
                callback) { // @param Function: callback
    if (Array.isArray(source)) {
        source.forEach(callback);
    } else {
        for (var i in source) {
            callback(source[i], i); // callback(value, index)
        }
    }
}

// [1][Hash.keys]           uu.keys({ a: 1, b: 2 }) -> ["a", "b"]
// [2][Array.keys]          uu.keys([1, 2]) -> [0, 1]

// uu.keys - enum keys
function uukeys(source,        // @param Hash/Array: source
                _enumValues) { // @hidden Boolean(= false): true is enum values
                        // @return Array: [key, ... ]
    var rv = [], ri = -1, i, iz;

    if (Array.isArray(source)) {
        for (i = 0, iz = source.length; i < iz; ++i) {
            i in source && (rv[++ri] = _enumValues ? source[i] : i);
        }
    } else {
        if (!_enumValues && Object.keys) {
            return Object.keys(source);
        }
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                rv[++ri] = _enumValues ? source[i] : i;
            }
        }
    }
    return rv;
}

// [1][Hash.values]         uu.keys({ a: 1, b: 2 }) -> [1, 2]
// [2][Array.values]        uu.keys([1, 2]) -> [1, 2]

// uu.values - enum values
function uuvalues(source) { // @param Hash/Array: source
                            // @return Array: [value, ... ]
    return uukeys(source, true);
}

// [1][hash to hash(through)]   uu.hash({ key: "val" }) -> { key: "val" }
// [2][key/value pair to hash]  uu.hash("key", mix)     -> { key: mix }

// uu.hash - to hash, convert hash from key value pair
function uuhash(key,     // @param Hash/String: key
                value) { // @param Mix(= undefined): value
                         // @return Hash: { key: value, ... }
    if (arguments.length === 1) { // [1]
        return key;
    }
    var rv = {};

    rv[key] = value; // [2]
    return rv;
}
// uu.hash._dd2num = { "00":   0 , ... "99":  99  }; Zero-filled dec string -> Number
// uu.hash._num2dd = {    0: "00", ...   99: "99" }; Number -> Zero-filled dec string
_makeMapping("0123456789",       uuhash._dd2num = {}, uuhash._num2dd = {});

// uu.hash._hh2num = { "00":   0 , ... "ff": 255  }; Zero-filled hex string -> Number
// uu.hash._num2hh = {    0: "00", ...  255: "ff" }; Number -> Zero-filled hex string
_makeMapping("0123456789abcdef", uuhash._hh2num = {}, uuhash._num2hh = {});

// [1][ary to ary (through)]    uu.ary([1, 2])    -> [1, 2]
// [2][mix to ary]              uu.ary(mix)       -> [mix]
// [3][NodeList to ary]         uu.ary(NodeList)  -> [node, ...]
// [4][arguments to ary]        uu.ary(arguments) -> [arg, ...]

// uu.array - to array, convert array
function uuarray(source) { // @param Array/Mix/NodeList/Arguments: source
                           // @return Array:
    var type = uutype(source), rv, i, iz;

    if (type === uutype.FAKEARRAY) { // [3][4]
        for (rv = [], i = 0, iz = source.length; i < iz; ++i) {
            rv[i] = source[i];
        }
        return rv;
    }
    return (type === uutype.ARRAY) ? source : [source]; // [1][2]
}

// [1][Hash has Hash]       uu.has({ a: 1, b: 2 }, { a: 1 }) -> true
// [2][Array has Array]     uu.has([1, 2], [1]) -> true

// uu.has - has
function uuhas(source,   // @param Hash/Array: source
               search) { // @param Hash/Array: search element
                         // @return Boolean:
    if (source && search) {
        var i, iz;

        if (Array.isArray(source)) {
            search = uuarray(search);

            for (i = 0, iz = search.length; i < iz; ++i) {
                if (i in search && source.indexOf(search[i]) < 0) {
                    return false;
                }
            }
            return true;
        }
        for (i in search) {
            if (!(i in source)) {
                return false;
            }
            if (source[i] !== search[i]
                && _jsoninspect(source[i]) !== _jsoninspect(search[i])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

// [1][Hash nth ]           uu.nth({ a: 1, b: 2 }, 1) -> ["b", 2]
// [2][Array nth]           uu.nth(["a", 100], 1)     -> [1, 100]

// uu.nth - nth pair
function uunth(source, // @param Hash/Array: source
               nth) {  // @param Number: nth
                       // @return Array: [key, value]
                       //                or [undefined, undefined] (not found)
    var i, j = 0;

    if (Array.isArray(source)) {
        if (nth in source) {
            return [nth, source[nth]];
        }
    } else {
        for (i in source) {
            if (j++ === nth) {
                return [i, source[i]];
            }
        }
    }
    return [,];
}

// [1][Hash.length]         uu.size({ a: 1, b: 2 }) -> 2
// [2][Array.length]        uu.size([1,2]) -> [1,2]

// uu.size - get length
function uusize(source) { // @param Hash/Array: source
                          // @return Number:
    return Array.isArray(source) ? source.length : uukeys(source).length;
}

// [1][Hash.clone]          uu.clone({ a: 1, b: 2 }) -> { a: 1, b: 2 }
// [2][Array.clone]         uu.clone([1,2]) -> [1,2]

// uu.clone - clone hash, clone array
function uuclone(source) { // @param Hash/Array: source
                           // @return Hash/Array: cloned hash/array
    return Array.isArray(source) ? source.concat() : uumix({}, source);
}

// [1][Hash.indexOf]            uu.hash.indexOf({ a: 1, b: 2, c: 2 }, 2) -> "b"

// uu.hash.indexOf - find first key from value
function uuindexof(source,   // @param Hash: source
                   search) { // @param Mix: search value
                             // @return String/undefined: "found-key" or undefined
    for (var i in source) {
        if (source.hasOwnProperty(i) && source[i] === search) {
            return i; // String
        }
    }
    return void 0;
}

// [1][numeric sort 0-9]    uu.sort([0,1,2], "0-9")   -> [0, 1, 2]
// [2][numeric sort 9-0]    uu.sort([0,1,2], "9-0")   -> [2, 1, 0]
// [3][ascii sort a-z]      uu.sort(["a","z"], "A-Z") -> ["a", "z"]
// [4][ascii sort a-z]      uu.sort(["a","z"], "Z-A") -> ["z", "a"]
// [5][callback]            uu.sort(["a","z"], callback) -> ["z", "a"]

// uu.sort - sort array
function uusort(source,   // @param Array: source
                method) { // @param String/Function(= "0-9"): method
                          //                   sort method or callback-function
                          // @return Array:
    function _numericsort(a, b) {
        return a - b;
    }

    if (Array.isArray(source)) {
        switch (method || "0-9") {
        case "0-9": source.sort(_numericsort); break;           // [1]
        case "9-0": source.sort(_numericsort).reverse(); break; // [2]
        case "A-Z": source.sort(); break;                       // [3]
        case "Z-A": source.sort().reverse(); break;             // [4]
        default:    source.sort(method);                        // [5]
        }
    }
    return source;
}

// [1][Array.clean]         uu.clone([,,1,2,,]) -> [1,2]

// uu.clean - array compaction, trim null and undefined elements
function uuclean(source) { // @param Array: source
                           // @return Array: clean Array
    if (Array.isArray(source)) {
        var rv = [], i = 0, iz = source.length;

        for (; i < iz; ++i) {
            if (i in source) {
                if (source[i] != null) { // null and undefined
                    rv.push(source[i]);
                }
            }
        }
        return rv;
    }
    return source;
}

// [1][unique elements]     uu.unique([<body>, <body>]) -> [<body>]
// [2][unique literals]     uu.unique([0,1,2,1,0], true) -> [0,1,2]

// uu.unique - make array from unique element( trim null and undefined elements)
function uuunique(source,        // @param Array: source
                  literalOnly) { // @param Boolean(= false): true is literal only(quickly)
                                 // @return Array:
    literalOnly = literalOnly ? true : false;

    if (Array.isArray(source)) {
        var rv = [], ri = -1, v, i = 0, j, iz = source.length,
            found,
            unique = {};

        for (; i < iz; ++i) {
            v = source[i];
            if (v != null) { // null and undefined
                if (literalOnly) { // [2]
                    unique[v] || (unique[v] = 1, rv[++ri] = v);
                } else { // [1]
                    for (found = 0, j = i - 1; !found && j >= 0; --j) {
                        found = (v === source[j]);
                    }
                    !found && (rv[++ri] = v);
                }
            }
        }
        return rv;
    }
    return source;
}

// [1][Array x 2 = Hash]    uu.array.toHash(["a", "b"], [1, 2]) -> { a: 1, b: 2 }
// [2][Array + Mix = Hash]  uu.array.toHash(["a", "b"], 1)      -> { a: 1, b: 1 }

// uu.array.toHash - make { key: value } pair from array
function uutohash(key,        // @param Array: key array
                  value,      // @param Array/Mix: value array or a mix value
                  toNumber) { // @param Boolean(= false): true is numeric value
                              //                          false is original value
                              // @return Hash: { key: value, ... }
    var rv = {}, i = 0, iz = key.length, val;

    if (Array.isArray(value)) { // [1]
        for (; i < iz; ++i) {
            rv[key[i]] = toNumber ? +(value[i]) : value[i];
        }
    } else { // [2]
        val = toNumber ? +(value) : value;
        for (; i < iz; ++i) {
            rv[key[i]] = val;
        }
    }
    return rv;
}

// --- attribute ---
// [1][get one  attr ]          uu.attr(node, "attr") -> "value"
// [2][get some attrs]          uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
// [3][set one  attr ]          uu.attr(node, "attr", "val") -> node
// [4][set some attrs]          uu.attr(node, { attr: "val" }) -> node

// uu.attr - attribute accessor
function uuattr(node,    // @param Node:
                key,     // @param Hash/String: key
                value) { // @param String(= undefined): value
                         // @return String/Hash/Node:
    return (value === void 0 && uuisstring(key) ? uuattrget // [1][2]
                                                : uuattrset)(node, key, value); // [3][4]
}
uuattr._HASH = uusplittohash(
    uu.ver.ie67 ? "for,htmlFor,className,class"
                : ("class,className,for,htmlFor,colspan,colSpan," +
                   "accesskey,accessKey,rowspan,rowSpan,tabindex,tabIndex")
);

// [1][get one  attr ]          uu.attr.get(node, "attr") -> String
// [2][get some attrs]          uu.attr.get(node, "attr,...") -> Hash

// uu.attr.get - get attribute
function uuattrget(node,    // @param Node:
                   attrs) { // @param String: "attr1,..."
                            // @return String/Hash: "value" (one attr)
                            //                   or { attr1: "value", ... }
    var rv = {}, ary = attrs.split(","), v, w, i = 0, iz = ary.length,
        HASH = uuattr._HASH; // [IE67]  for -> htmlFor, className -> class
                             // [OTHER] for -> htmlFor, class -> className

    for (; i < iz; ++i) {
        v = ary[i];
        w = HASH[v] || v;
        if (uu.ie) {
            if (uu.ver.ie89 || v === "href" || v === "src") {
                // [IE6][IE7][FIX] a[href^="#"] -> full path
                rv[v] = node.getAttribute(v, 2) || "";
            } else {
                rv[v] = node[w] || "";
            }
        } else {
            rv[v] = node.getAttribute(w) || "";
        }
    }
    return (ary.length === 1) ? rv[ary[0]] : rv; // [3][4]
}

// [1][set one  attr ]          uu.attr.set(node, key, val ) -> node
// [2][set some attrs]          uu.attr.set(node, { key: val, ... }) -> node

// uu.attr.set - set attribute
function uuattrset(node,  // @param Node:
                   key,   // @param String/Hash: key
                   value) { // @param String(= undefined): value
                          // @return Node:
    var hash, i, HASH = uuattr._HASH;

    uuisstring(key) ? (hash = {}, hash[key] = value) : (hash = key);
    for (i in hash) {
        node.setAttribute(HASH[i] || i, hash[i]);
    }
    return node;
}

// [1][get all]                 uu.attr(node) -> { all: attrs }
// [2][use filter]              uu.attr(node, true) -> { many: attrs }

// uu.attr.getAll - get all attributes
function uuattrgetall(node,     // @param Node:
                      filter) { // @param Boolean(= false): true is filter
                                //                          (ignore style and uu prefix keywords)
                                // @return Hash:
    filter = filter ? true : false;

    var rv = {}, ary = node.attributes, v, w, i = -1;

    while ( (v = ary[++i]) ) {
        w = v.name;

        if (!filter) { // [1]
            rv[w] = v.value;
        } else if (v.specified && w !== "style" && w.indexOf("uu")) { // [2]
            // ignore: style keywords
            // ignore: uu prefix keywords
            rv[w] = v.value;
        }
    }
    return rv;
}

// --- css / style ---
// [1][get one  style ]         uu.css(node, "color") -> "red"
// [2][get some styles]         uu.css(node, "color,width") -> { color: "red", width: "20px" }
// [3][set one  style ]         uu.css(node, "color", "red") -> node
// [4][set some styles]         uu.css(node, { color: "red" }) -> node

// uu.css - css accessor
function uucss(node,    // @param Node:
               key,     // @param Hash/String: key
               value) { // @param String(= undefined): value
                        // @return String/Hash/Node:
    return (value === void 0 && uuisstring(key) ? uucssget // [1][2]
                                                : uucssset)(node, key, value); // [3][4]
}

// [1][get one  style ]         uu.css.get(node, "color") -> "red"
// [2][get some styles]         uu.css.get(node, "color,text-align") -> {color:"red", textAlign:"left"}

// uu.css.get - get getComputedStyle(node) value
function uucssget(node,     // @param Node:
                  styles) { // @param String: "cssProp,..." or "css-prop,..."
                            // @return String/Hash: "value"
                            //                   or { cssProp: "value", ... }
    var rv = {}, ary = styles.split(","), v, i = -1,
        ns = uustyle(node), fixdb = uufix._db;

    while ( (v = ary[++i]) ) {
        rv[v] = ns[fixdb[v] || v] || "";
    }
    return (ary.length === 1) ? rv[ary[0]] : rv;
}

// [1][set one  style ]         uu.css.set(node, "color", "red") -> node
// [2][set some styles]         uu.css.set(node, { color: "red" }) -> node

// uu.css.set
function uucssset(node,    // @param Node:
                  key,     // @param String/Hash:
                  value) { // @param String(= undefined):
                           // @return Node:
    var hash = uuhash(key, value), // make { cssProp: value }
        ns = node.style, p, v, i, n,
        fixdb = uufix._db, hook = uucssset._hook;

    for (i in hash) {
        v = hash[i];
        p = fixdb[i] || i;

        if (typeof v === "string") {
            ns[p] = v; // backgroundColor = "transparent"
        } else {
            n = hook[p];
            if (n === 2) {
                uucssopacityset(node, v);
            } else {
                ns[p] = n ? v : (v + "px"); // zoom = 1, width = 100 + "px"
            }
        }
    }
    return node;
}
uucssset._hook = { opacity: 2, lineHeight: 1, fontWeight: 1,
                   fontSizeAdjust: 1, zIndex: 1, zoom: 1 };

// [1][get opacity]             uu.css.opacity(node) -> Number(0.0~1.0)
// [2][set opacity]             uu.css.opacity(node, opacity, isRelativeValue = false) -> node

// uu.css.opacity
function uucssopacity(node,              // @param Node:
                      opacity,           // @param Number(= undefined): opacity 0.0 - 1.0
                      isRelativeValue) { // @param Boolean(= false): true is relative value
                                         // @return Number/Node:
    return (opacity === void 0 ? uucssopacityget
                               : uucssopacityset)(node, opacity, isRelativeValue);
}

// uu.css.opacity.get - get opacity value(from 0.0 to 1.0)
function uucssopacityget(node) { // @param Node:
                                 // @return Number: float(from 0.0 to 1.0)
    if (uu.ie) {
        var v = node.uucssopacity; // undefined or 1.0 ~ 2.0

        return v === void 0 ? 1 : (v - 1);
    }
    return parseFloat(node.style.opacity ||
                      win.getComputedStyle(node, null).opacity);
}

// uu.css.opacity.set - set opacity value(from 0.0 to 1.0)
function uucssopacityset(node,              // @param Node:
                         opacity,           // @param Number: opacity, float(from 0.0 to 1.0)
                         isRelativeValue) { // @param Boolean(= false): true is relative value
                                            // @return Node:
    var ns; // node.style alias

    if (uu.ver.ie678) {
        ns = node.style;
        if (node.uucssopacity === void 0) {
            // at first time
            if (uu.ver.ie67) { // [FIX][IE]
                if ((node.currentStyle || {}).width === "auto") {
                    ns.zoom = 1;
                }
            }
        }
    }
    isRelativeValue && (opacity += uucssopacityget(node));

    // normalize
    opacity = (opacity > 0.999) ? 1
            : (opacity < 0.001) ? 0 : opacity;
    node.style.opacity = opacity;

    if (uu.ver.ie678) {
        node.uucssopacity = opacity + 1; // (1.0 ~ 2.0)
        ns.visibility = opacity ? "" : "hidden";
        ns.filter = ((opacity > 0 && opacity < 1)
                  ? "alpha(opacity=" + (opacity * 100) + ") " : "")
                  + ns.filter.replace(uucssopacityset._alpha, "");
    }
    return node;
}
uucssopacityset._alpha = /^alpha\([^\x29]+\) ?/;

// --- getComputedStyle ---

// [1][get all  computedStyle]  uu.style(node)      -> { width: "100px", ... }
// [2][get more computedStyle]  uu.style(node, 0x1) -> { width: "100px", ... }
// [3][get some computedStyle]  uu.style(node, 0x2) -> { width: "100px", ... }

// uu.style - getComputedStyle, currentStyle wrapper
function uustyle(node,   // @param Node:
                 mode) { // @param Number(= 0):
                         //   0: enum full properties
                         //   1: enum more properties
                         //   2: enum some properties
                         //   4: currentStyle (IE6,IE7,IE8 only)
                         // @return Hash: { prop: "val", ... }
//{{{!mb
    // http://d.hatena.ne.jp/uupaa/20091212
    if (uu.ver.ie678) {
        if (mode === 4) {
            return node.currentStyle;
        }
        if (!node.currentStyle) {
            return {};
        }
        var rv = {},
            ns = node.style,
            cs = node.currentStyle,
            rs = node.runtimeStyle,
            box = uustyle._HASH.box, UNITS = uustyle._UNITS,
            RECTANGLE = uustyle._RECTANGLE,
            em, rect, ut, v, w, x, i = -1, j = -1, m1, m2,
            ary = !mode ? uustyle._HASH.full
                        : (mode === 1) ? uustyle._HASH.more
                                       : 0,
            stock = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                      thin: "1px", medium: "3px", thick: uustyle._THICK_FIX };

        if (ary) {
            while ( (w = ary[++j]) ) {
                rv[w] = cs[w];
            }
        }

        em = parseFloat(cs.fontSize) *
                    (uustyle._UNIT_PT.test(cs.fontSize) ? 4 / 3 : 1);
        rect = node.getBoundingClientRect();

        // calc border, padding and margin size
        while ( (w = box[++i]) ) {
            v = cs[w];
            if (!(v in stock)) {
                x = v;
                switch (ut = UNITS[v.slice(-1)]) {
                case 1: x = parseFloat(v) * em; break;    // "12em"
                case 2: x = parseFloat(v) * 4 / 3; break; // "12pt"
                case 3: m1 = ns.left, m2 = rs.left; // %, auto
                        rs.left = cs.left, ns.left = v;
                        x = ns.pixelLeft, ns.left = m1, rs.left = m2;
                }
                stock[v] = ut ? x + "px" : x;
            }
            rv[w] = stock[v];
        }
        for (w in RECTANGLE) {
            v = cs[w];
            switch (ut = UNITS[v.slice(-1)]) {
            case 1: v = parseFloat(v) * em; break;    // "12em"
            case 2: v = parseFloat(v) * 4 / 3; break; // "12pt"
            case 3: // %, auto
                switch (RECTANGLE[w]) {
                case 1: v = node.offsetTop; break;  // style.top
                case 2: v = node.offsetLeft; break; // style.left
                case 3: v = (node.offsetWidth  || rect.right - rect.left) // style.width
                          - parseInt(rv.borderLeftWidth)
                          - parseInt(rv.borderRightWidth)
                          - parseInt(rv.paddingLeft)
                          - parseInt(rv.paddingRight);
                        v = v > 0 ? v : 0;
                        break;
                case 4: v = (node.offsetHeight || rect.bottom - rect.top) // style.height
                          - parseInt(rv.borderTopWidth)
                          - parseInt(rv.borderBottomWidth)
                          - parseInt(rv.paddingTop)
                          - parseInt(rv.paddingBottom);
                        v = v > 0 ? v : 0;
                }
            }
            rv[w] = ut ? v + "px" : v;
        }
        rv.fontSize = em + "px";
        rv.cssFloat = cs.styleFloat; // compat alias
        return rv;
    }
//}}}!mb
    return win.getComputedStyle(node, null);
}
//{{{!mb
uustyle._HASH = uu.ver.ie678 ? _builduustylehash() : {};
uustyle._UNITS = { m: 1, t: 2, "%": 3, o: 3 }; // em, pt, %, auto
uustyle._UNIT_PT = /pt$/;
uustyle._THICK_FIX = uu.ver.ie89 ? "5px" : "6px";
uustyle._RECTANGLE = { top: 1, left: 2, width: 3, height: 4 };
//}}}!mb

// uu.style.quick - getComputedStyle or currentStyle
function uustylequick(node) { // @param Node:
                              // @return Hash: { prop: "val", ... }
    return uustyle(node, 4);
}

//{{{!mb inner - build uu.style hash
function _builduustylehash() {
    // http://d.hatena.ne.jp/uupaa/20091212
    var rv = { full: [], more: [], box: [] },
        ary = [" "], i, w, trim = /^\s+|\s+$/g,
        cs = doc.html.currentStyle;

    for (i in cs) {
        ary.push(i);
    }
    ary.sort();
    w = ary.join(" ").replace(/ (?:accelerator|behavior|hasLayout|zoom)/g, "");
    rv.full = w.replace(trim, "").split(" ");
    rv.more = w.replace(/ (?:lay\w+|rub\w+|text\w+|pageB\w+|ms\w+|scr\w+)/g, "").
        replace(/ (?:blockDirection|orphans|quotes|widows|filter|styleFloat)/g, "").
        replace(/ (?:imeMode|writingMode|unicodeBidi|emptyCells|tableLayout)/g, "").
        replace(/ (?:border(?:Color|Style|Width)|margin|padding|outline) /g, " ").
        replace(/ (border\w+Width|margin\w+|padding\w+)/g, function(_, m) {
          return rv.box.push(m), _;
        }).replace(trim, "").concat(" textAlign textOverflow textIndent").
        split(" ").sort();
    return rv;
}
//}}}!mb

// --- className(klass) ---
// uu.klass.has - has className
function uuklasshas(node,         // @param Node:
                    classNames) { // @param String: "class1 class2 ..." (joint space)
                                  // @return Boolean:
    var m, ary, cn = node.className;

    if (!classNames || !cn) {
        return false;
    }
    if (classNames.indexOf(" ") < 0) {
        return (" " + cn + " ").indexOf(" " + classNames + " ") >= 0; // single
    }
    ary = uusplit(classNames); // multi
    m = cn.match(_classNameMatcher(ary));
    return m && m.length >= ary.length;
}

// [1][add className] uu.klass.add(node, "class1 class2") -> node

// uu.klass.add - add className
function uuklassadd(node,         // @param Node:
                    classNames) { // @param String: "class1 class2 ..."
                                  // @return Node:
    node.className += " " + classNames; // [OPTIMIZED] // uutriminner()
    return node;
}

// [1][sub className] uu.klass.sub(node, "class1 class2") -> node

// uu.klass.sub - remove className
function uuklasssub(node,         // @param Node:
                    classNames) { // @param String(= ""): "class1 class2 ..."
                                  // @return Node:
    node.className = uutriminner(
            node.className.replace(_classNameMatcher(uusplit(classNames)), ""));
    return node;
}

// uu.klass.toggle - toggle(add / sub) className property
function uuklasstoggle(node,         // @param Node:
                       classNames) { // @param String: "class1 class2 ..."
                                     // @return Node:
    (uuklasshas(node, classNames) ? uuklasssub : uuklassadd)(node, classNames);
    return node;
}

// --- color ---
// [1][W3CNamedColor to hash]   uu.color("black")   -> ColorHash
// [2]["#000" to hash]          uu.color("#000")    -> ColorHash
// [3]["#000000" to hash]       uu.color("#000000") -> ColorHash
// [4]["rgba(,,,,) to hash]     uu.color("rgba(0,0,0,1)")         -> ColorHash
// [5]["hsla(,,,,) to hash]     uu.color("hsla(360,100%,100%,1)") -> ColorHash

// uu.color - parse color
function uucolor(source) { // @parem String: "black", "#fff", "rgba(0,0,0,0)" ...
                           // @return ColorHash/Number: 0 is error
    var v, m, n, r, g, b, a = 1, add = 0, rgb = 0,
        rv = uucolor._db[source] || uucolor._cache[source] ||
             uucolor._db[++add, v = source.toLowerCase()];

    if (!rv) {
        switch ({ "#": 1, r: 2, h: 3 }[v.charAt(0)]) {
        case 1: // #fff or #ffffff
            if (!uucolor._HEX_FORMAT.test(v)) {
                return 0; // invalid color, unknown format
            }
            m = v.split("");
            switch (m.length) {
            case 4: n = parseInt(m[1]+m[1] + m[2]+m[2] + m[3]+m[3], 16); break; // #fff
            case 7: n = parseInt(v.slice(1), 16); break; // #ffffff
            case 9: n = parseInt(v.slice(3), 16); // #00ffffff
                    a = ((parseInt(v.slice(1, 3), 16) / 2.55) | 0) / 100;
            }
            n !== void 0 &&
                (rv = { r: n >> 16, g: (n >> 8) & 255,
                        b: n & 255, a: a, num: n });
            break;
        case 2: // rgb(,,) or rgba(,,,)
            ++rgb; // [THROUGH]
        case 3: // hsl(,,) or hsla(,,,)
            m = (rgb ? uucolor._RGBA_FORMAT
                     : uucolor._HSLA_FORMAT).exec(
                        v.indexOf("%") < 0 ? v
                                           : v.replace(uucolor._PERCENT,
                                                       rgb ? _percent255
                                                           : _percent100));
            if (m) {
                r = m[1] | 0, g = m[2] | 0, b = m[3] | 0;
                a = m[4] ? parseFloat(m[4]) : 1;
                rv = rgb ? { r: r > 255 ? 255 : r,
                             g: g > 255 ? 255 : g,
                             b: b > 255 ? 255 : b, a: a }
                         : uu.color.hsla2rgba({ // depend uu.color
                             h: r > 360 ? 360 : r,
                             s: g > 100 ? 100 : g,
                             l: b > 100 ? 100 : b, a: a });
            }
        }
    }
    add && rv && (uucolor._cache[source] = uucolorfix(rv)); // add cache
    return rv || 0; // ColorHash or 0
}
uucolor._db = {
    transparent: { r: 0, g: 0, b: 0, a: 0, argb: "#00000000", num: 0,
                   hex: "#000000", rgba: "rgba(0,0,0,0)" }
};
uucolor._cache = {};
uucolor._HEX_FORMAT = /^#(?:[\da-f]{3,8})$/; // #fff or #ffffff or #ffffffff
uucolor._HSLA_FORMAT = /^hsla?\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(?:,\s*([\d\.]+))?\s*\)/; // hsla(,,,)
uucolor._RGBA_FORMAT = /^rgba?\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(?:,\s*([\d\.]+))?\s*\)/; // rgba(,,,)
uucolor._PERCENT = /([\d\.]+)%/g;

// inner - percent("100%") to number(0~255)
function _percent255(_,   // @param String: "100.0%"
                     n) { // @param String: "100.0"
                          // @return Number: 0~255
    return (n * 2.555) & 255;
}

// inner - percent("100%") to number(0~100)
function _percent100(_,   // @param String: "100.0%"
                     n) { // @param Number: "100.0"
                          // @return Number: 0~100
    n = n | 0;
    return n > 100 ? 100 : n;
}

// uu.color.add
function uucoloradd(source) { // @param String: "000000black,..."
    var ary = source.split(","), i = -1, v, w, n, r, g, b;

    while ( (v = ary[++i]) ) {
        w = v.slice(0, 6);
        n = parseInt(w, 16);
        r = n >> 16;
        g = (n >> 8) & 0xff;
        b = n & 0xff;
        uucolor._db[v.slice(6)] = {
            hex: "#" + w,
            num: n,
            r: r,
            g: g,
            b: b,
            a: 1,
            argb: "#ff" + w,
            rgba: "rgba(" + r + "," + g + "," + b + ",1)"
        };
    }
}

// uu.color.fix - fix ColorHash
function uucolorfix(c) { // @param ColorHash/RGBAHash: source
                         // @return ColorHash:
    var num2hh = uuhash._num2hh;

    c.num  || (c.num  = (c.r << 16) + (c.g << 8) + c.b);
    c.hex  || (c.hex  = "#" + num2hh[c.r] + num2hh[c.g] + num2hh[c.b]);
    c.argb || (c.argb = "#" + num2hh[(c.a * 255) & 0xff] +
                              num2hh[c.r] + num2hh[c.g] + num2hh[c.b]);
    c.rgba || (c.rgba = "rgba(" + c.r + "," + c.g + "," +
                                  c.b + "," + c.a + ")");
    return c;
}

// uu.color.expire - expire color cache
function uucolorexpire() {
    uucolor._cache = {};
}

// --- event ---
// [1][bind a event]            uu.event(node, "click", fn)             -> node
// [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
// [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
// [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node

// uu.event - bind event
function uuevent(node,                   // @param Node:
                 namespaceAndEventTypes, // @param String: namespace and event types "click,click+,..."
                 evaluator,              // @param Function/Instance: callback function
                 detach) {               // @param Boolean(= false): true is detach event, false is attach event
                                         // @return Node:
    function _uueventclosure(evt, fromCustomEvent) {
        evt = evt || win.event;

        if (!fromCustomEvent && !evt.code) {
            var src = evt.srcElement || evt.target, // [IE] srcElement
                iebody;

            // make EventObjectEx { code, node, src, px, py, ox, oy }
            src = (uu.webkit && src.nodeType === 3) ? src.parentNode : src;
            evt.code = (EVENT_CODE[evt.type] || 0) & 255;
            evt.node = node;
            evt.src = src;
            if (uu.ie) {
                iebody = uu.quirks ? doc.body : uu.node.root;
                evt.px = evt.clientX + iebody.scrollLeft;
                evt.py = evt.clientY + iebody.scrollTop;
            } else {
                evt.px = evt.pageX;
                evt.py = evt.pageY;
            }
            evt.ox = evt.offsetX || evt.layerX || 0; // [IE][Opera][WebKit] offsetX
            evt.oy = evt.offsetY || evt.layerY || 0; // [Gecko][WebKit] layerX
        }
        isInstance ? handler.call(evaluator, evt, node, src)
                   : evaluator(evt, node, src);
    } // [OPTIMIZED]

    var types = node.uueventtypes || (node.uueventfn = {},
                                      node.uueventtypes = ","),
        nstype = namespaceAndEventTypes.split(","), v, i = -1, m,
        type, capt, closure, handler,
        isInstance = false, EVENT_CODE = uuevent._CODE;

    if (detach) {
        closure = evaluator.uueventclosure || evaluator;
    } else {
        handler = uuisfunction(evaluator)
                ? evaluator
                : (isInstance = true, evaluator.handleEvent);
        closure = evaluator.uueventclosure = _uueventclosure;
    }
    while ( (v = nstype[++i]) ) { // v = "namespace.click+"
        m = uuevent._PARSE.exec(v); // split ["namespace.click+", "namespace", "click", "+"]
        if (m) {
            type = m[2]; // "click"
            capt = m[3]; // "+"

            // IE mouse capture
            // TODO: IE9
            if (uu.ie) {
                if (capt && type === "mousemove") {
                    uuevent(node, "losecapture", closure, detach);
                }
            }

            if (types.indexOf("," + v + ",") >= 0) { // bound?
                if (detach) { // detach event
                    // IE releaseCapture
                    // TODO: IE9
                    if (uu.ie) {
                        if (type === "losecapture" && node.releaseCapture) {
                            node.releaseCapture();
                        }
                    }

                    // ",dblclick," <- ",namespace.click+,dblclick,".replace(",namespace.click+,", ",")
                    node.uueventtypes =
                            node.uueventtypes.replace("," + v + ",", ",");
                    node.uueventfn[v] = void 0;
                    uueventdetach(node, type, closure, capt);
                }
            } else if (!detach) { // attach event
                uu.ie && type === "losecapture"
                      && node.setCapture
                      && node.setCapture();

                // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
                node.uueventtypes += v + ",";
                node.uueventfn[v] = closure;
                uueventattach(node, type, closure, capt);
            }
        }
    }
    return node;
}
uuevent._PARSE = /^(?:(\w+)\.)?(\w+)(\+)?$/; // ^[NameSpace.]EvntType[Capture]$
uuevent._LIST = ("mousedown,mouseup,mousemove,mousewheel,click,dblclick," +
    "keydown,keypress,keyup,change,submit,focus,blur,contextmenu").split(",");
uuevent._CODE = {
    mousedown: 1, mouseup: 2, mousemove: 3, mousewheel: 4, click: 5,
    dblclick: 6, keydown: 7, keypress: 8, keyup: 9, mouseenter: 10,
    mouseleave: 11, mouseover: 12, mouseout: 13, contextmenu: 14,
    focus: 15, blur: 16, resize: 17,
    losecapture: 0x102, DOMMouseScroll: 0x104
};

// uu.event.has - has event
function uueventhas(node,                     // @param Node: target node
                    namespaceAndEventTypes) { // @param String: namespace and event types, "click", "namespace.mousemove+"
                                              // @return Boolean:
    return (node.uueventtypes || "").indexOf("," + namespaceAndEventTypes + ",") >= 0;
}

// uu.event.fire - fire event / fire custom event(none capture event only)
function uueventfire(node,      // @param Node: target node
                     eventType, // @param String: "click", "custom"
                     param) {   // @param Mix(= undefined): param
                                // @return Node:
    if (uu.event.has(node, eventType)) {
        node.uueventfn[eventType].call(node, {
            stopPropagation: uu.nop,
            preventDefault:  uu.nop,
            node:   node,       // current target
            name:   eventType,  // event name
            code:   0,          // 0: unknown
            src:    node,       // event source
            rel:    node,
            px:     0,
            py:     0,
            ox:     0,
            oy:     0,
            type:   eventType,  // event type
            param:  param
        }, true); // fromCustomEvent = true
    }
    return node;
}

// uu.event.stop - stop stopPropagation and preventDefault
function uueventstop(eventObject) { // @param EventObject:
                                    // @return EventObject:
    uu.ie ? (eventObject.cancelBubble = true) : eventObject.stopPropagation();
    uu.ie ? (eventObject.returnValue = false) : eventObject.preventDefault();
    return eventObject;
}

// [1][unbind all]              uu.event.unbind(node) -> node
// [2][unbind some]             uu.event.unbind(node, "click+,dblclick") -> node
// [3][unbind namespace all]    uu.event.unbind(node, "namespace.*") -> node
// [4][unbind namespace some]   uu.event.unbind(node, "namespace.click+,namespace.dblclick") -> node

// uu.event.unbind - unbind event
function uueventunbind(node,                     // @param Node: target node
                       namespaceAndEventTypes) { // @param String(= undefined): namespace and event types, "click,click+,..."
                                                 // @return Node:
    function _eachnamespace(w) {
        !w.indexOf(ns) && uuevent(node, w, node.uueventfn[w], true); // detach
    }

    // node.uueventtypes = "{{eventtype1}},{{eventtype2}},"
    // node.uueventfn    = { eventtype1: evaluator, ... }
    var types = node.uueventtypes, nstype, v, i = -1, ns;

    if (types && types.length > 1) { // ignore ","
        if (namespaceAndEventTypes) { // [2][3][4]
            nstype = uusplitcomma(namespaceAndEventTypes);

            while ( (v = nstype[++i]) ) {
                if (v.lastIndexOf(".*") > 1) { // [3] "namespace.*"
                      ns = v.slice(0, -1); // "namespace."
                      uusplitcomma(types).forEach(_eachnamespace);
                } else { // [2][4]
                      (types.indexOf("," + v + ",") >= 0) &&
                          uuevent(node, v, node.uueventfn[v], true); // detach
                }
              }
        } else { // [1]
            nstype = uusplitcomma(types);

            while ( (v = nstype[++i]) ) {
                uuevent(node, v, node.uueventfn[v], true); // detach
            }
        }
    }
    return node;
}

// uu.event.attach - attach event - Raw Level API wrapper
function uueventattach(node,      // @param Node:
                       eventType, // @param String: event type
                       evaluator, // @param Function: evaluator
                       capture) { // @param Boolean(= false):
    eventType = uueventattach._FIX[eventType] || eventType;

    if (node.addEventListener) {
        node.addEventListener(eventType, evaluator, !!(capture || 0));
    } else {
        node.attachEvent("on" + eventType, evaluator);
    }
}
uueventattach._FIX = uu.gecko ? { mousewheel: "DOMMouseScroll" } :
                     uu.opera ? { contextmenu: "mousedown" } : {};

// uu.event.detach - detach event - Raw Level API wrapper
function uueventdetach(node,      // @param Node:
                       eventType, // @param String: event type
                       evaluator, // @param Function: evaluator
                       capture) { // @param Boolean(= false):
    eventType = uueventattach._FIX[eventType] || eventType;

    if (node.removeEventListener) {
        node.removeEventListener(eventType, evaluator, !!(capture || 0));
    } else {
        node.detachEvent("on" + eventType, evaluator);
    }
}

// uu.ready - hook DOMContentLoaded event
function uuready(evaluator, // @param Function(= undefined): callback function
                 order) {   // @param Number(= 0): 0=low, 1=mid, 2=high(system)
    if (evaluator !== void 0 && !uuready.gone.blackout) {
        uuready.gone.dom ? evaluator(uu) // fired -> callback
                         : uulazy("boot", evaluator, order || 0); // [1] stock
    }
}

// --- node ---
// uu.node - createElement wrapper
function uunode(tagName) { // @param String(= "div"):
                           // @return Node: <node>
    return doc.createElement(tagName || "div");
}

// [1][add div node]            uu.node.add()         -> <body><div /></body>
// [2][from tagName]            uu.node.add("p")      -> <body><p /></body>
// [3][from node]               uu.node.add(uu.div()) -> <body><div /></body>
// [4][from HTMLFragment]       uu.node.add("<div><p>txt</p></div>") -> <body><div><p>txt</p></div></body>
// [5][from DocumentFragment]   uu.node.add(DocumentFragment)        -> <body>{{fragment}}</body>

// uu.node.add - create element, add node, add node to context
function uunodeadd(source,     // @param Node/DocumentFragment/HTMLFragment/TagName(= "div"):
                   context,    // @param Node(= <body>): add to context
                   position) { // @param Number(= 6): insert position
                               //           1: first sibling
                               //           2: prev sibling
                               //           3: next sibling
                               //           4: last sibling
                               //           5: first child
                               //           6: last child
                               // @return Node: node or first node
    context = context || doc.body;

    var node = !source ? doc.createElement("div")        // [1] uu.node.add()
             : source.nodeType ? source                  // [3][5] uu.node.add(Node or DocumentFragment)
             : !source.indexOf("<") ? uunodebulk(source) // [4] uu.node.add(HTMLFragmentString)
             : doc.createElement(source),                // [2] uu.node.add("p")
        parentNode = context.parentNode,
        rv = (node.nodeType === 11) ? node.firstChild : node; // 11: DocumentFragment

    //  <div id="parent">
    //      <div id="first">(position = 1) first sibling</div>
    //      <div id="prev"> (position = 2) prev sibling</div>
    //      <div id="ctx">context node
    //
    //          <div id="firstChild">(position = 5) first child</div>
    //          <div></div>
    //          <div id="lastChild"> (position = 6) last child</div>
    //
    //      </div>
    //      <div id="next"> (position = 3) next sibling</div>
    //      <div id="last"> (position = 4) last sibling</div>
    //  </div>

    switch (position || 6) {
    case 1: parentNode.insertBefore(node, parentNode.firstChild); break; // first sibling
    case 2: parentNode.insertBefore(node, context); break;               // prev sibling
    case 3: parentNode.insertBefore(node, context.nextSibling); break;   // next sibling
    case 4: parentNode.appendChild(node); break;                         // last sibling
    case 5: context.insertBefore(node, context.firstChild); break;       // first child
    case 6: context.appendChild(node);                                   // last child
    }
    return rv;
}

// uu.nodeid - get nodeid
function uunodeid(node) { // @param Node:
                          // @return Number: nodeid, from 1
    if (!node.uuguid) {
        uunodeid._db[node.uuguid = ++uunodeid._num] = node;
    }
    return node.uuguid;
}
uunodeid._num = 0; // node id counter
uunodeid._db = {}; // { nodeid: node, ... }

// uu.nodeid.toNode - get node by nodeid
function uunodeidtonode(nodeid) { // @param String: nodeid
                                  // @return Node/undefined:
    return uunodeid._db[nodeid];
}

// uu.nodeid.remove - remove from node db
function uunodeidremove(node) { // @param Node:
                                // @return Node: removed node
    node.uuguid && (uunodeid._db[node.uuguid] = null, node.uuguid = null);
    return node;
}

// uu.node.has - has child node
function uunodehas(node,      // @param Node: child node
                   context) { // @param Node: context(parent) node
                              // @return Boolean:
    for (var c = node; c && c !== context;) {
        c = c.parentNode;
    }
    return node !== context && c === context;
}

// [1][clone]           uu.node.bulk(Node) -> DocumentFragment
// [2][build]           uu.node.bulk("<p>html</p>") -> DocumentFragment

// uu.node.bulk - convert HTMLString into DocumentFragment
function uunodebulk(source) { // @param Node/HTMLFragment: source
                              // @return DocumentFragment:
    var rv = doc.createDocumentFragment(),
        placeholder = uunode();

    placeholder.innerHTML = uuisstring(source) ? source            // [2] "<p>html</p>"
                                               : source.outerHTML; // [1] node
    while (placeholder.firstChild) {
        rv.appendChild(placeholder.removeChild(placeholder.firstChild));
    }
    return rv;
}

// uu.node.swap - swap node
function uunodeswap(swapin,    // @param Node: swapin
                    swapout) { // @param Node: swapout
                               // @return Node: swapout
    return swapout.parentNode.replaceChild(swapin, swapout);
}

// [1][wrap] uu.node.wrap(<span>target</span>, <p>)
//           <span>target</span>  ->  <p><span>target</span></p>

// uu.node.wrap - wrapper
function uunodewrap(innerNode,   // @param Node: inner node
                    outerNode) { // @param Node: wrapper, outer node
                                 // @return Node: innerNode
    return outerNode.appendChild(uunodeswap(outerNode, innerNode));
}

// [1][clear children]      uu.node.clear(<body>)

// uu.node.clear - clear all children
function uunodeclear(context) { // @param Node: parent node
                                // @return Node: context
    var rv = uu.tag("*", context), v, i = -1;

    while ( (v = rv[++i]) ) {
        uunodeidremove(v);
        uueventunbind(v);
    }
    rv = []; // gc
    while (context.firstChild) {
        context.removeChild(context.firstChild);
    }
    return context;
}

// uu.node.remove - remove node
function uunoderemove(node) { // @param Node:
                              // @return Node: node
    if (node && node.parentNode) {
        uunodeidremove(node);
        return node.parentNode.removeChild(node);
    }
    return node;
}

// uu.node.fromPoint -
function uunodefrompoint(x,         // @param Number: x
                         y,         // @param Number: y
                         context) { // @param Node: context
                                    // @return Node: Node or null
    // TODO: canvas support
    // TODO: CrossBrowser
    return (context || doc).elementFromPoint(x | 0, y | 0);
}

// --- query ---
// uu.query - querySelectorAll
function uuquery(expression, // @param String: expression, "css > expr"
                 context) {  // @param NodeArray/Node(= document): query context
                             // @return NodeArray: [Node, ...]
    if (context && doc.querySelectorAll && context.nodeType
                && !uuquery._NGWORD.test(expression)) { // [:scope] guard
        try {
            var rv = [],
                nodeList = (context || doc).querySelectorAll(expression),
                i = 0, iz = nodeList.length;

            for (; i < iz; ++i) {
                rv[i] = nodeList[i];
            }
            return rv;
        } catch(err) {} // case: extend pseudo class / operators
    }
    return uuquery.selectorAll(expression, context || doc); // depend: uu.query
}
uuquery._NGWORD = /(:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=|<=|>=|&=|x7b/;

// uu.id - query id
function uuid(expression, // @param String: id
              context) {  // @param Node(= document): query context
                          // @return Node/null:
    return (context || doc).getElementById(expression);
}

// uu.tag - query tagName
function uutag(expression, // @param String: "*" or "tag"
               context) {  // @param Node(= document): query context
                           // @return NodeArray: [Node, ...]
    var nodeList = (context || doc).getElementsByTagName(expression),
        rv = [], ri = -1, v, i = 0, iz = nodeList.length;

    if (uu.ie && expression === "*") { // [IE] getElementsByTagName("*") has comment nodes
        for (; i < iz; ++i) {
            (v = nodeList[i]).nodeType === 1 && (rv[++ri] = v); // 1: ELEMENT_NODE
        }
    } else {
        for (; i < iz; ++i) {
            rv[i] = nodeList[i];
        }
    }
    return rv;
}
uutag.HTML4 = ("a,b,br,dd,div,dl,dt,h1,h2,h3,h4,h5,h6,i,img,iframe," +
               "input,li,ol,option,p,pre,select,span,table,tbody,tr," +
               "td,th,tfoot,textarea,u,ul").split(","); // exclude <html><head><body>
uutag.HTML5 = ("abbr,article,aside,audio,bb,canvas,datagrid,datalist," +
               "details,dialog,eventsource,figure,footer,header,hgroup," +
               "mark,menu,meter,nav,output,progress,section,time,video").split(",");

// uu.klass - query className
function uuklass(expression, // @param String: "class", "class1, ..."
                 context) {  // @param Node(= document): query context
                             // @return NodeArray: [Node, ...]
    context = context || doc;

    var rv = [], ri = -1, i = 0, iz, v,
        nodeList, match, cn, nz, rex, name;

    if (context.getElementsByClassName) {

        // Advanced browser route
        nodeList = context.getElementsByClassName(expression);

        for (iz = nodeList.length; i < iz; ++i) {
            rv[i] = nodeList[i];
        }
    } else {

        // Legacy browser route
        nodeList = context.getElementsByTagName("*");
        name = uusplit(expression); // "class1 class2" -> ["class1", "class2"]
        name.length > 1 && (name = uuunique(name, 1)); // [FIX] W3C TestSuite #170b
        rex = _classNameMatcher(name);

        for (nz = name.length, iz = nodeList.length; i < iz; ++i) {
            v = nodeList[i];
            cn = v.className;
            if (cn) {
                match = cn.match(rex); // [!] KEEP IT
                (match && match.length >= nz) && (rv[++ri] = v);
            }
        }
    }
    return rv;
}

// --- string ---

// [1][css-prop to js-css-prop] uu.fix("background-color") -> "backgroundColor"
// [2][std-name to ie-name]     uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
// [3][html-attr to js-attr]    uu.fix("for")              -> "htmlFor"
// [4][through]                 uu.fix("-webkit-shadow")   -> "-webkit-shadow"

// uu.fix - fix style property, attribute name
function uufix(source) { // @param String: source
                         // @return String:
    return uufix._db[source] || source;
}
uufix._db = {}; // { "background-color": "backgroundColor", ... }

// uu.trim - trim both side whitespace
function uutrim(source) { // @param String:  "  has  space  "
                          // @return String: "has  space"
    return source.replace(uutrim._TRIM, "");
}
uutrim._TAG     = /<\/?[^>]+>/g; // <div> or </div>
uutrim._TRIM    = /^\s+|\s+$/g;
uutrim._QUOTE   = /^\s*["']?|["']?\s*$/g;
uutrim._SPACES  = /\s\s+/g;
uutrim._BRACKET = /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g; // [br](ac){ke}<ts>

// uu.trim.tag - trim.inner + strip tags
function uutrimtag(source) { // @param String:  "  <h1>A</h1>  B  <p>C</p>  "
                             // @return String: "A B C"
    return source.replace(uutrim._TRIM, "").
                  replace(uutrim._TAG, "").
                  replace(uutrim._SPACES, " ");
}

// uu.trim.url - trim.inner + strip "url(" ... ")" + trim.quote
function uutrimurl(source) { // @param String:   '  url("http://...")  '
                             // @return String:  "http://..."
    return (!source.indexOf("url(") && source.indexOf(")") === source.length - 1) ?
            source.slice(4, -1).replace(uutrim._QUOTE, "") : source;
}

// uu.trim.inner - trim + diet inside multi spaces
function uutriminner(source) { // @param String:  "  diet  inner  space  "
                               // @return String: "diet inner space"
    return source.replace(uutrim._TRIM, "").replace(uutrim._SPACES, " ");
}

// uu.trim.quote - trim + strip "double" 'single' quote
function uutrimquote(source) { // @param String:  ' "quote string" '
                               // @return String: 'quote string'
    return source.replace(uutrim._QUOTE, "");
}

// uu.trim.bracket - trim + strip brackets () [] {} <>
function uutrimbracket(source) { // @param String:  " <bracket>  (this)  [and]  {this} "
                                 // @return String: "bracket this and this"
    return source.replace(uutrim._BRACKET, "");
}

// uu.split - split space
function uusplit(source) { // @param String: " split  space  token "
                           // @return Array: ["split", "space", "token"]
    return source.replace(uutrim._SPACES, " ").
                  replace(uutrim._TRIM, "").split(" ");
}
uusplit._MANY_COMMAS           = /,,+/g; // many commas
uusplit._TRIM_SPACE_AND_COMMAS = /^[ ,]+|[ ,]+$/g; // trim space and comma

// uu.split.comma - split commas
function uusplitcomma(source) { // @param String: ",,, ,,A,,,B,C,, "
                                // @return Array: ["A", "B", "C"]
    return source.replace(uusplit._MANY_COMMAS, ",").
                  replace(uusplit._TRIM_SPACE_AND_COMMAS, "").split(",");
}

// [1][hash from string]        uu.split.toHash("key,1,key2,1", ",") -> { key: 0, key2: 1 }

// uu.split.toHash - split to hash
function uusplittohash(source,     // @param String: "key,0,key2,1"
                       splitter,   // @param String(= ","): splitter
                       toNumber) { // @param Boolean(= false): convert value to number
                                   // @return Hash: { key: "0", key2: "1" }
    var rv = {}, ary = source.split(splitter || ","), i = 0, iz = ary.length,
        num = toNumber ? true : false;

    for (; i < iz; i += 2) {
        rv[ary[i]] = num ? +(ary[i + 1]) : ary[i + 1];
    }
    return rv;
}

// [1][placeholder]             uu.format("? dogs and ?", 101, "cats") -> "101 dogs and cats"

// uu.format - placeholder( "?" ) replacement
function uuformat(format) { // @param String: formatted string with "?" placeholder
                            // @return String: "formatted string"
    var i = 0, args = arguments;

    return format.replace(uuformat._PLACEHOLDER, function() {
        return args[++i];
    });
}
uuformat._PLACEHOLDER = /\?/g;

// --- debug ---
// uu.puff - uu.puff(mix) -> alert( uu.json(mix) )
function uupuff(source) { // @param Mix: source object
    alert(_jsoninspect(source));
}

// <div id="trace">msg<div>
// [1][with title]      uu.trace(title, mix) -> <p>title{mix}</p>
// [2][without title]   uu.trace(mix)        -> <p>{mix</p>

// uu.trace - add trace
function uutrace(titleOrSource,  // @param String/Mix: title or source
                 source) {       // @param Mix(= undefined): source (with title)
    var output = uuid("trace"), json, title = "";

    if (output) {
        if (source !== void 0) {
            title = titleOrSource;
            json = _jsoninspect(source);
        } else {
            json = _jsoninspect(titleOrSource);
        }

        if (output.tagName.toLowerCase() === "textarea") {
            output.value += title + json;
        } else {
            output.innerHTML += "<p>" + title + json + "</p>";
        }
    }
}

// uu.trace.clear - clear
function uutraceclear() {
    var output = uuid("trace");

    if (output) {
        if (output.tagName.toLowerCase() === "textarea") {
            output.value = "";
        } else {
            output.innerHTML = "";
        }
    }
}

// --- JSON ---
// uu.json - mix to JSONString
function uujson(source,        // @param Mix:
                useNativeJSON, // @param Boolean(= false): switch native impl or js impl
                               //                          true is use native JSON
                               //                          false is use js JSON
                callback) {    // @param Function(= undefined): error callback
                               // @return JSONString:
    return useNativeJSON && win.JSON ? win.JSON.stringify(source) || ""
                                     : _jsoninspect(source, callback);
}

// uu.json.decode - decode JSONString
function uujsondecode(jsonString,      // @param JSONString:
                      useNativeJSON) { // @param Boolean(= false): switch native impl or js impl
                                       //                          true is use native JSON
                                       //                          false is use js JSON
                                       // @return Mix/Boolean: false is error
    var str = uutrim(jsonString);

    if (useNativeJSON && win.JSON) {
        return win.JSON.parse(str);
    }
    return uujsondecode._NGWORD.test(str.replace(uujsondecode._UNESCAPE, ""))
                ? false : uujs("return " + str + ";");
}
uujsondecode._NGWORD = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/;
uujsondecode._UNESCAPE = /"(\\.|[^"\\])*"/g;

// inner - convert string to JSON formatted string
function _str2json(str,        // @param String:
                   addQuote) { // @param Number(= 0): 1 is add quote(")
                               // @return String: '\u0000' or '"\u0000"'
    function _swap(m) {
        return _str2json._SWAP[m];
    }
    function _ucs2(str, c) {
        c = str.charCodeAt(0);
        // '\uffff'
        return "\\u" + uuhash._num2hh[(c >> 8) & 255] +
                       uuhash._num2hh[ c       & 255];
    }

    var rv = str.replace(_str2json._ESCAPE, _swap).
                 replace(_str2json._ENCODE, _ucs2);

    return addQuote ? '"' + rv + '"' : rv;
}
_str2json._SWAP = uusplittohash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\');
_str2json._ESCAPE = /(?:\"|\\[bfnrt\\])/g; // escape
_str2json._ENCODE = /[\x00-\x1F\u0080-\uFFEE]/g;

// inner - json inspect
function _jsoninspect(mix, fn) {
    var ary, type = uutype(mix), w, ai = -1, i, iz;

    if (mix === win) {
        return '"window"'; // window -> String("window")
    }

    switch (type) {
    case uutype.CSS:
    case uutype.HASH:       ary = []; break;
    case uutype.NODE:       return '"uuguid":' + uunodeid(mix);
    case uutype.NULL:       return "null";
    case uutype.UNDEFINED:  return "undefined";
    case uutype.DATE:       return uudatetoiso(uudate(mix));
    case uutype.BOOLEAN:
    case uutype.FUNCTION:
    case uutype.NUMBER:     return mix.toString();
    case uutype.STRING:     return _str2json(mix, 1);
    case uutype.ARRAY:
    case uutype.FAKEARRAY:
        for (ary = [], i = 0, iz = mix.length; i < iz; ++i) {
            ary[++ai] = _jsoninspect(mix[i], fn);
        }
        return "[" + ary + "]";
    default:
        return fn ? (fn(mix) || "") : "";
    }

    if (type === uutype.CSS) {
        w = uu.webkit;
        for (i in mix) {
            if (typeof mix[i] === "string" && (w || i != (+i + ""))) { // !isNaN(i)
                w && (i = mix.item(i));
                ary[++ai] = '"' + i + '":' + _str2json(mix[i], 1);
            }
        }
    } else { // type === uutype.HASH
        for (i in mix) {
            ary[++ai] = _str2json(i, 1) + ":" + _jsoninspect(mix[i], fn);
        }
    }
    return "{" + ary + "}";
}

// --- date ---
// [1][get now]                 uu.date() -> DateHash
// [2][date to hash]            uu.date(Date) -> DateHash
// [3][time to hash]            uu.date(milliseconds) -> DateHash
// [4][DateString to hash]      uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
// [5][ISO8601String to hash]   uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
// [6][RFC1123String to hash]   uu.date("Wed, 16 Sep 2009 16:18:14 GMT") -> DateHash

// uu.date - date accessor
function uudate(source) { // @param Date/Number/String(= undefined):
                          // @return DateHash:
    return source === void 0  ? _date2hash(new Date())        // [1] uu.date()
         : uuisdate(source)   ? _date2hash(source)            // [2] uu.date(new Date())
         : uuisnumber(source) ? _date2hash(new Date(source))  // [3] uu.date(1234567)
         : _date2hash(_str2date(source) || new Date(source)); // [4][5][6]
}

// inner - convert Date to DateHash
function _date2hash(date) { // @param Date:
                            // @return Hash: { Y: 2010, M: 12, D: 31,
                            //                 h: 23, m: 59, s: 59, ms: 999,
                            //                 time: xxxxxxx }
    return { Y:  date.getUTCFullYear(),     M:    date.getUTCMonth() + 1,
             D:  date.getUTCDate(),         h:    date.getUTCHours(),
             m:  date.getUTCMinutes(),      s:    date.getUTCSeconds(),
             ms: date.getUTCMilliseconds(), time: date.getTime() };
}

// "2000-01-01T00:00:00[.000]Z"    -> Date
// "Wed, 16 Sep 2009 16:18:14 GMT" -> Date

// inner - DateString to Date
function _str2date(str) { // @param ISO8601DateString/RFC1123DateString:
                          // @return Date/0:
    function _toDate(_, dayOfWeek, day, month) {
        return dayOfWeek + " " + month + " " + day;
    }

    var m = _str2date._PARSE.exec(str);

    if (m) {
        return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3],      // yyyy-mm-dd
                                 +m[4], +m[5], +m[6], +m[7])); // hh:mm:ss.ms
    } else {
        if (uu.ie && str.indexOf("GMT") > 0) {
            str = str.replace(/GMT/, "UTC");
        }
        return new Date(str.replace(",", "").
                            replace(_str2date._DATE, _toDate));
    }
    return 0;
}
_str2date._PARSE = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/;
_str2date._DATE = /^([\w]+) (\w+) (\w+)/;

// [1] uu.date.toISOString(DateHash = undefined) -> "2000-01-01T00:00:00.000Z"

// uu.date.toISOString - encode DateHash To ISO8601String
function uudatetoiso(dateHash) { // @param DateHash(= undefined):
                                 // @return ISO8601DateString: "2000-01-01T00:00:00.000Z"
    var v = dateHash === void 0 ? _date2hash(new Date()) : dateHash,
        padZero = (v.ms < 10) ? "00" : (v.ms < 100) ? "0" : "",
        dd = uuhash._num2dd;

    return uuformat("?-?-?T?:?:?.?Z", v.Y, dd[v.M], dd[v.D],
                                      dd[v.h], dd[v.m], dd[v.s], padZero + v.ms);
}

// [1] uu.date.toRFCString(DateHash = undefined) -> "Wed, 16 Sep 2009 16:18:14 GMT"

// uu.date.toRFCString - encode DateHash To RFC1123String
function uudatetorfc(dateHash) { // @param DateHash(= undefined):
                                 // @return RFC1123DateString: "Wed, 16 Sep 2009 16:18:14 GMT"
    var rv;

    if (dateHash === void 0) {
        rv = (new Date()).toUTCString();
    } else {
        rv = (new Date(dateHash.time)).toUTCString();
    }
    if (uu.ie && rv.indexOf("UTC") > 0) {
        // http://d.hatena.ne.jp/uupaa/20080515

        rv = rv.replace(/UTC/, "GMT");
        (rv.length < 29) && (rv = rv.replace(/, /, ", 0")); // [IE] fix format
    }
    return rv;
}

// --- other ---
// uu.js("JavaScript Expression") -> eval result

// uu.js - eval js
function uujs(javascriptExpression) { // @param String:
                                      // @return Mix: new Function(expression) result
    return (new Function(javascriptExpression))();
}

// uu.win.size
function uuwinsize() { // @return Hash: { innerWidth, innerHeight,
                       //                 pageXOffset, pageYOffset }
                       //   innerWidth  - Number:
                       //   innerHeight - Number:
                       //   pageXOffset - Number:
                       //   pageYOffset - Number:
    if (uu.ie) {
        var iebody = uu.quirks ? doc.body : uu.node.root;

        return { innerWidth:  iebody.clientWidth,
                 innerHeight: iebody.clientHeight,
                 pageXOffset: iebody.scrollLeft,
                 pageYOffset: iebody.scrollTop };
    }
    return { innerWidth:  win.innerWidth,
             innerHeight: win.innerHeight,
             pageXOffset: win.pageXOffset,
             pageYOffset: win.pageYOffset };
}

// uu.guid - get unique number
function uuguid() { // @return Number: unique number, from 1
    return ++uuguid._num;
}
uuguid._num = 0; // guid counter

// uu.lazy - lazy evaluate
function uulazy(id,        // @param String: id
                evaluator, // @param Function: callback function
                order) {   // @param Number(= 0): 0=low, 1=mid, 2=high(system)
    uulazy._db[id] || (uulazy._db[id] = [[], [], []]);
    uulazy._db[id][order || 0].push(evaluator);
}
uulazy._db = {}; // { id: [[low], [mid], [high]], ... } job db

// uu.lazy.fire
function uulazyfire(id) { // @param String: lazy id
    if (uulazy._db[id]) {
        var fn, i = -1, db = uulazy._db[id],
            ary = db[2].concat(db[1], db[0]); // join

        // pre clear
        uulazy._db[id] = null;

        // callback
        while ( (fn = ary[++i]) ) {
            fn(uu);
        }
    }
}

// --- ECMAScript-262 5th ---
//{{{!mb

// Array.prototype.indexOf
function arrayindexof(search,      // @param Mix: search element
                      fromIndex) { // @param Number(= 0): from index
                                   // @return Number: found index or -1
    var iz = this.length, i = fromIndex || 0;

    i = (i < 0) ? i + iz : i;
    for (; i < iz; ++i) {
        if (i in this && this[i] === search) {
            return i;
        }
    }
    return -1;
}

// Array.prototype.lastIndexOf
function arraylastindexof(search,      // @param Mix: search element
                          fromIndex) { // @param Number(= this.length): from index
                                       // @return Number: found index or -1
    var iz = this.length, i = fromIndex;

    i = (i < 0) ? i + iz + 1 : iz;
    while (--i >= 0) {
        if (i in this && this[i] === search) {
            return i;
        }
    }
    return -1;
}

// Array.prototype.every
function arrayevery(evaluator, // @param Function: evaluator
                    that) {    // @param this(= undefined): evaluator this
                               // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this && !evaluator.call(that, this[i], i, this)) {
            return false;
        }
    }
    return true;
}

// Array.prototype.some
function arraysome(evaluator, // @param Function: evaluator
                   that) {    // @param this(= undefined): evaluator this
                              // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this && evaluator.call(that, this[i], i, this)) {
            return true;
        }
    }
    return false;
}

// Array.prototype.forEach
function arrayforeach(evaluator, // @param Function: evaluator
                      that) {    // @param this(= undefined): evaluator this
    var i = 0, iz = this.length;

    if (that) {
        for (; i < iz; ++i) {
            i in this && evaluator.call(that, this[i], i, this);
        }
    } else {
        for (; i < iz; ++i) {
            i in this && evaluator(this[i], i, this);
        }
    }
} // [OPTIMIZED]

// Array.prototype.map
function arraymap(evaluator, // @param Function: evaluator
                  that) {    // @param this(= undefined): evaluator this
                             // @return Array: [element, ... ]
    for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
        i in this && (rv[i] = evaluator.call(that, this[i], i, this));
    }
    return rv;
}

// Array.prototype.filter
function arrayfilter(evaluator, // @param Function: evaluator
                     that) {    // @param this(= undefined): evaluator this
                                // @return Array: [element, ... ]
    for (var rv = [], ri = -1, v, i = 0, iz = this.length; i < iz; ++i) {
        i in this && evaluator.call(that, v = this[i], i, this)
                  && (rv[++ri] = v);
    }
    return rv;
}
//}}}!mb

// Array.prototype.reduce
function arrayreduce(evaluator,      // @param Function: evaluator
                     initialValue) { // @param Mix(= undefined): initial value
                                     // @return Mix:
    var z, f = 0, rv = initialValue === z ? z : (++f, initialValue),
        i = 0, iz = this.length;

    for (; i < iz; ++i) {
        i in this && (rv = f ? evaluator(rv, this[i], i, this) : (++f, this[i]));
    }
    if (!f) {
        throw new Error(arrayreduce._MSG);
    }
    return rv;
}
arrayreduce._MSG = "reduce of empty array with no initial value";

// Array.prototype.reduceRight
function arrayreduceright(evaluator,      // @param Function: evaluator
                          initialValue) { // @param Mix(= undefined): initial value
                                          // @return Mix:
    var z, f = 0, rv = initialValue === z ? z : (++f, initialValue),
        i = this.length;

    while (--i >= 0) {
        i in this && (rv = f ? evaluator(rv, this[i], i, this) : (++f, this[i]));
    }
    if (!f) {
        throw new Error(arrayreduce._MSG);
    }
    return rv;
}

// Date.prototype.toISOString - to ISO8601 string
function datetoisostring() { // @return String:
    return uudatetoiso(uudate(this));
}

// Number.prototype.toJSON, Boolean.prototype.toJSON
function numbertojson() { // @return String: "123", "true", "false"
    return this.toString();
}

// String.prototype.trim
function stringtrim() { // @return String: "has  space"
    return this.replace(uutrim._TRIM, "");
}

// String.prototype.toJSON
function stringtojson() { // @return String: "string"
    return _str2json(this);
}

// --- HTMLElement.prototype ---
//{{{!mb

// HTMLElement.prototype.innerText getter
function innertextgetter() {
    return this.textContent;
}

// HTMLElement.prototype.innerText setter
function innertextsetter(text) {
    while (this.hasChildNodes()) {
        this.removeChild(this.lastChild);
    }
    this.appendChild(doc.createTextNode(text));
}

// HTMLElement.prototype.outerHTML getter
function outerhtmlgetter() {
    var rv, me = this, p = me.parentNode,
        r = doc.createRange(), div = doc.createElement("div");

    p || doc.body.appendChild(me); // orphan
    r.selectNode(me);
    div.appendChild(r.cloneContents());
    rv = div.innerHTML;
    p || me.parentNode.removeChild(me);
    return rv;
}

// HTMLElement.prototype.outerHTML setter
function outerhtmlsetter(html) {
    var r = doc.createRange();

    r.setStartBefore(this);
    this.parentNode.replaceChild(r.createContextualFragment(html), this);
}
//}}}!mb

// --- initialize ---

// inner - build DOM Lv2 event handler - uu.click(), jam.click(), ...
uuevent._LIST.forEach(function(eventType) {
    uu.event[eventType] = function bindEvent(node, fn) { // uu.click(node, fn) -> node
        return uuevent(node, eventType, fn); // attach
    };
    uu["un" + eventType] = function unbindEvent(node) { // uu.unclick(node) -> node
        return uuevent(node, eventType, 0, true); // detach
    };
});

// Internet Explorer 6 flicker fix
try {
    uu.ver.ie6 && doc.execCommand("BackgroundImageCache", false, true);
} catch(err) {} // ignore error(IETester / stand alone IE too)

// inner - bootstrap, WindowReadyState and DOMReadyState handler
function _ready() {
    if (!uuready.gone.blackout && !uuready.gone.dom++) {

        uulazyfire("boot");
        uuisfunction(win.xboot || 0) && win.xboot(uu); // window.xboot(uu) callback
    }
}

// inner - window onloaded
function _winload() {
    uuready.gone.win = 1;
    _ready();
    uuisfunction(win.xwin || 0) && win.xwin(uu); // window.xwin(uu) callback
    uulazyfire("canvas");
    uulazyfire("audio");
    uulazyfire("video");
}

// inner - DOMContentLoaded(IE)
function _domreadyie() {
    try {
        doc.firstChild.doScroll("up"), _ready();
    } catch(err) { setTimeout(_domreadyie, 64); }
}

uueventattach(win, "load", _winload);
uu.ie ? _domreadyie() : uueventattach(doc, "DOMContentLoaded", _ready);

// --- finalize ---
//{{{!mb

// inner - [IE] fix mem leak
function _winunload() {
    var nodeid, node, ary, i, v;

    for (nodeid in uunodeid._db) {
        try {
            node = uunodeid._db[nodeid];
            ary = node.attributes, i = -1;
            while ( (v = ary[++i]) ) {
                !v.name.indexOf("uu") && (node[v.name] = null);
            }
        } catch (err) {}
    }
    doc.html = null;
    doc.head = null;
    win.detachEvent("onload", _winload);
    win.detachEvent("onunload", _winunload);
}
uu.ie && win.attachEvent("onunload", _winunload);
//}}}!mb

// inner -
// 1. prebuild camelized hash - http://handsout.jp/slide/1894
// 2. prebuild nodeid
uuready(function() {
    var nodeList = doc.html.getElementsByTagName("*"), v, i = -1,
        styles = uusplittohash((uu.ie ? "float,styleFloat,cssFloat,styleFloat"
                                      : "float,cssFloat,styleFloat,cssFloat") +
                ",pos,position,w,width,h,height,x,left,y,top,o,opacity," +
                "bg,background,bgcolor,backgroundColor,bgimg,backgroundImage," +
                "bgrpt,backgroundRepeat,bgpos,backgroundPosition");

    uumix(_camelhash(uufix._db, uu.webkit ? uustyle(doc.html)
                                          : doc.html.style),
                     styles, uuattr._HASH);
    uunodeid(doc.html);
    while ( (v = nodeList[++i]) ) {
        v.nodeType === 1 && uunodeid(v); // 1: ELEMENT_NODE
    }
}, 2); // 2: high(system) order

// inner - make camelized hash( { "text-align": "TextAlign", ...}) from getComputedStyle
function _camelhash(rv, props) {
    function _camelize(m, c) {
        return c.toUpperCase();
    }
    function _decamelize(m, c, C) {
        return c + "-" + C.toLowerCase();
    }
    var k, v, CAMELIZE = /-([a-z])/g, DECAMELIZE = /([a-z])([A-Z])/g;

    for (k in props) {
        if (typeof props[k] === "string") {
            if (uu.webkit) {
                v = k = props.item(k); // k = "-webkit-...", "z-index"
                k.indexOf("-") >= 0 && (v = k.replace(CAMELIZE, _camelize));
                (k !== v) && (rv[k] = v);
            } else {
                v = ((uu.gecko && !k.indexOf("Moz")) ? "-moz" + k.slice(3) :
                     (uu.ie    && !k.indexOf("ms"))  ? "-ms"  + k.slice(2) :
                     (uu.opera && !k.indexOf("O"))   ? "-o"   + k.slice(1) : k).
                    replace(DECAMELIZE, _decamelize);
                (k !== v) && (rv[v] = k);
            }
        }
    }
    return rv;
}

// inner - make className matcher from array
function _classNameMatcher(ary) {
    return RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
}

// inner - make String <-> Number mapping table
function _makeMapping(seed,   // @param String: "0123456789" or "0123456789abcdef"
                      s2n,    // @param Hash: String to Number
                      n2s) {  // @param Hash: Number to String
    var i = 0, j, k = -1, v, ary = seed.split(""), iz = ary.length;

    for (; i < iz; ++i) {
        for (j = 0; j < iz; ++j) {
            v = ary[i] + ary[j];
            s2n[v] = ++k; // { "00": 0, "01": 1, ... "ff": 255  }
            n2s[k] = v;   // {    0: 0,    1: 1, ...  255: "ff" }
        }
    }
}

// inner - detect versions and meta informations
function _version(libraryVersion) { // @param Number: Library version
                                    // @return VersionHash:
    // http://d.hatena.ne.jp/uupaa/20090603
    function detectRenderingEngineVersion(userAgent) {
        var ver = ((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.exec(userAgent)
                        || [,0])[1]).toString()

        return parseFloat(ver.replace(/[^\d\.]/g, "").
                              replace(/^(\d+\.\d+)(\.(\d+))?$/,"$1$3"));
    }

    function detectUserAgentVersion(userAgent) {
        var opera = window.opera || false;

        return opera ? +(opera.version().replace(/\d$/, ""))
                     : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                                  exec(userAgent) || [,0])[1]);
    }


    // detect Flash version (version 7 ~ later)
    function detectFlashVersion(ie) {
        var rv = 0, obj, ver, m;

//{{{!mb
        try {
            obj = ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                     : navigator.plugins["Shockwave Flash"];
            ver = ie ? obj.GetVariable("$version").replace(/,/g, ".")
                     : obj.description;
            m = /\d+\.\d+/.exec(ver);
            rv = m ? parseFloat(m[0]) : 0;
        } catch(err) {}
//}}}!mb
        return rv < 7 ? 0 : rv;
    }

    // detect Silverlight version (version 3 ~ later)
    function detectSilverlightVersion(ie) {
        var rv = 0, obj, check = 3;

//{{{!mb
        try {
            if (ie) {
                obj = new ActiveXObject("AgControl.AgControl");
                while (obj.IsVersionSupported(check + ".0")) { // "3.0" -> "4.0" -> ...
                    rv = check++;
                }
            } else {
                obj = navigator.plugins["Silverlight Plug-In"];
                rv = parseInt(/\d+\.\d+/.exec(obj.description)[0]);
            }
        } catch(err) {}
//}}}!mb
        return rv < 3 ? 0 : rv;
    }

    var rv = { library: libraryVersion },
        ie = !!doc.uniqueID, userAgent = navigator.userAgent;

    rv.render       = detectRenderingEngineVersion(userAgent);
    rv.browser      = detectUserAgentVersion(userAgent);
    rv.flash        = detectFlashVersion(ie);
    rv.silverlight  = detectSilverlightVersion(ie);
    rv.ie           = ie;
    rv.ie6          = ie && rv.browser === 6;
    rv.ie7          = ie && rv.browser === 7;
    rv.ie8          = ie && (doc.documentMode || 0) === 8;
    rv.ie9          = ie && (doc.documentMode || 0) === 9;
    rv.ie67         = rv.ie6 || rv.ie7;
    rv.ie678        = rv.ie6 || rv.ie7 || rv.ie8;
    rv.ie89         = rv.ie8 || rv.ie9;
    rv.opera        = !!(window.opera || false);
    rv.gecko        = userAgent.indexOf("Gecko/") > 0;
    rv.webkit       = userAgent.indexOf("WebKit") > 0;
    rv.chrome       = userAgent.indexOf("Chrome") > 0;
    rv.safari       = !rv.chrome && userAgent.indexOf("Safari") > 0;
    rv.iphone       = rv.webkit && /iPad|iPod|iPhone/.test(userAgent);
    rv.quirks       = (doc.compatMode || "") !== "CSS1Compat";
    rv.xml          = uunode("div").tagName === uunode("DIV").tagName;
    rv.win          = userAgent.indexOf("Win") > 0;
    rv.mac          = userAgent.indexOf("Mac") > 0;
    rv.unix         = /X11|Linux/.test(userAgent);
    rv.as3          = rv.flash >= 9; // ActionScript 3, FlashPlayer 9+
    rv.advanced     = (ie        && rv.browser >= 9)   || // IE 9+
                      (rv.gecko  && rv.render  >  1.9) || // Firefox 3.5+(1.91)
                      (rv.webkit && rv.render  >= 528) || // Safari 4+, Google Chrome 2+
                      (rv.opera  && rv.browser >= 10.5);  // Opera10.50+
    rv.major        = (ie        && rv.browser >= 6)   || // IE 6+
                      (rv.opera  && rv.browser >= 9.5) || // Opera 9.5+
                      (rv.gecko  && rv.render  >= 1.9) || // Firefox 3+
                      (rv.webkit && rv.render  >  524);   // Safari 3.1+, Google Chrome 1+
    rv.jit          = rv.advanced;
    return rv;
}

})(window, document);

