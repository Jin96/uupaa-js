
// === Core ===

// * WebKit based Cording-Style ( doc/cording-style.txt )
//
// * User configrations ( doc/user-configrations.txt )
//
//  - uu.config = { aria, debug, right, trace, altcss, storage }
//
// * User callback functions ( doc/user-callback-functions.txt )
//
//  - window.xboot(uu:Function)
//  - window.xwin(uu:Function)
//  - window.xcanvas(uu:Function, canvasNodeArray:NodeArray)
//  - window.xaudio(uu:Function, audioNodeArray:NodeArray)
//  - window.xvideo(uu:Function, videoNodeArray:NodeArray)
//  - window.xstorage(uu:Function, storage:StorageObject)
//  - window.xbuild(uu:Function, node:Node, buildid:Number)
//
// * Predefined types ( doc/predefined-types.txt )
//
//  - ColorHash, RGBAHash, HSLAHash, HSVAHash, W3CNamedColor
//  - EventObjectEx, DateHash, AjaxOptionHash, AjaxResultHash
//  - JSONPOptionHash, FlashOptionHash
//
// * Version and plugin detection ( doc/version-detection.txt )
//
//  - uu.ver = { library, silverlight, flash, browser, render, ie,
//               ie6, ie7, ie8, ie9, ie67, ie678, ie89,
//               opera, gecko, webkit, chrome, safari, iphone,
//               android, mobile, os, jit }

var uu; // window.uu - uupaa.js library namespace

uu || (function(win, doc, toString, isArray, getComputedStyle) {

var _versions = detectVersions(0.7),
    _habits   = detectHabits();

// --- EXTEND ---
doc.html || (doc.html = doc.documentElement); // document.html = <html>
doc.head || (doc.head = uutag("head")[0]);    // document.head = <head>

// --- LIBRARY STRUCTURE ---
uu = uumix(uufactory, {             // uu(expression:Jam/Node/NodeArray/String/window, arg1:Jam/Node/Mix = void, arg2:Mix = void, arg3:Mix = void, arg4:Mix = void):Jam/Instance
                                    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Clas.MyClass(arg1, arg2)
                                    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> Jam
    plugin:         uuplugin,       // uu.plugin():Array
    require:        uurequire,      // uu.require(url:String):AjaxResultHash
    habits:         _habits,        // uu.habits - Hash: detected browser habits informations
    ver:            _versions,      // uu.ver - Hash: detected version and plugin informations
    ie:             _versions.ie,
    opera:          _versions.opera,
    gecko:          _versions.gecko,
    webkit:         _versions.webkit,
    // --- TYPE ---
    like:           uulike,         // uu.like(lhs:Date/Hash/Fake/Array, rhs:Date/Hash/Fake/Array):Boolean
    type:     uumix(uutype, {       // uu.type(search:Mix, match:Number = 0):Boolean/Number
        HASH:       0x001,          // uu.type.HASH         - Hash (Object)
        NODE:       0x002,          // uu.type.NODE         - Node (HTMLElement)
        FAKEARRAY:  0x004,          // uu.type.FAKEARRAY    - FakeArray (Arguments, NodeList, ...)
        DATE:       0x008,          // uu.type.DATE         - Date
        NULL:       0x010,          // uu.type.NULL         - null
        VOID:       0x020,          // uu.type.VOID         - undefined / void
        UNDEFINED:  0x020,          // uu.type.UNDEFINED    - undefined / void
        BOOLEAN:    0x040,          // uu.type.BOOLEAN      - Boolean
        FUNCTION:   0x080,          // uu.type.FUNCTION     - Function
        NUMBER:     0x100,          // uu.type.NUMBER       - Number
        STRING:     0x200,          // uu.type.STRING       - String
        ARRAY:      0x400,          // uu.type.ARRAY        - Array
        REGEXP:     0x800           // uu.type.REGEXP       - RegExp
    }),
    isNumber:       uuisnumber,     //   uu.isNumber(search:Mix):Boolean
    isString:       uuisstring,     //   uu.isString(search:Mix):Boolean
    isFunction:     uuisfunction,   // uu.isFunction(search:Mix):Boolean
    // --- HASH / ARRAY ---
    arg:            uuarg,          // uu.arg(arg1:Hash = {}, arg2:Hash, arg3:Hash = void):Hash
    mix:            uumix,          // uu.mix(base:Hash, flavor:Hash, aroma:Hash = void, override:Boolean = true):Hash
    each:           uueach,         // uu.each(source:Hash/Array, callback:Function)
    keys:           uukeys,         // uu.keys(source:Hash/Array):Array
    values:         uuvalues,       // uu.values(source:Hash/Array):Array
    hash:     uumix(uuhash, {       // uu.hash(key:Hash/String, value:Mix = void):Hash
        has:        uuhas,          //     uu.hash.has(source:Hash, search:Hash):Boolean
        nth:        uunth,          //     uu.hash.nth(source:Hash, index:Number):Array
        size:       uusize,         //    uu.hash.size(source:Hash):Number
        clone:      uuclone,        //   uu.hash.clone(source:Hash):Hash
        indexOf:    uuindexof       // uu.hash.indexOf(source:Hash, search:Mix):String/void
    }),
    array:    uumix(uuarray, {      // uu.array(source:Array/Mix/NodeList/Arguments):Array
        has:        uuhas,          //    uu.array.has(source:Array, search:Array):Boolean
        nth:        uunth,          //    uu.array.nth(source:Array, index:Number):Array
        size:       uusize,         //   uu.array.size(source:Array):Number
        sort:       uusort,         //   uu.array.sort(source:Array, method:String/Function = "0-9"):Array
        clean:      uuclean,        //  uu.array.clean(source:Array):Array
        clone:      uuclone,        //  uu.array.clone(source:Array):Array
        toHash:     uutohash,       // uu.array.toHash(key:Array, value:Array/Mix, toNumber:Boolean = false):Hash
        unique:     uuunique        // uu.array.unique(source:Array, literalOnly:Boolean = false):Array
    }),
    // --- ATTRIBUTE ---
    attr:           uuattr,         // uu.attr(node:Node, key:String/Hash = void, value:String = void):Hash/Mix/Node
                                    //  [1][get all pair]   uu.attr(node) -> { key: value, ... }
                                    //  [2][get value]      uu.attr(node, key) -> value
                                    //  [3][set pair]       uu.attr(node, key, value) -> node
                                    //  [4][set pair]       uu.attr(node, { key: value, ... }) -> node
                                    //  [5][remove attr]    uu.attr(node, key, null) -> node
    data:     uumix(uudata, {       // uu.data(node:Node, key:String/Hash = void, value:Mix: = void):Hash/Mix/Node/undefined
                                    //  [1][get all pair]   uu.data(node) -> { key: value, ... }
                                    //  [2][get value]      uu.data(node, key) -> value
                                    //  [3][set pair]       uu.data(node, key, value) -> node
                                    //  [4][set pair]       uu.data(node, { key: value, ... }) -> node
        clear:      uudataclear     // uu.data.clear(node:Node, key:String = void):Node
                                    //  [1][clear all pair] uu.data.clear(node) -> node
                                    //  [2][clear pair]     uu.data.clear(node, key) -> node
    }),

    // --- CSS / STYLE ---
    css:      uumix(uucss, {        // uu.css(node:Node, key:String/Hash, value:String = void):Hash/String/Node
                                    //  [1][current style]  uu.css(node) -> { key: value, ... }
                                    //  [2][get value]      uu.css(node, key) -> value
                                    //  [3][set pair]       uu.css(node, key, value) -> node
                                    //  [4][set pair]       uu.css(node, { key: value, ... }) -> node
        getOpacity: getOpacity,     // uu.css.getOpacity(node:Node):Number
        setOpacity: setOpacity      // uu.css.setOpacity(node:Node, value:Number/String):Node
    }),
    toPixel:        uutopixel,      // uu.toPixel(node:Node, value:Number/CSSUnitString, quick:Boolean = false):Number
                                    //  [1][convert pixel]   uu.toPixel(<div>, 123) -> 123
                                    //  [2][convert pixel]   uu.toPixel(<div>, "12px") -> 12
                                    //  [3][convert pixel]   uu.toPixel(<div>, "12em") -> 192
                                    //  [4][convert pixel]   uu.toPixel(<div>, "12pt") -> 16
                                    //  [5][convert pixel]   uu.toPixel(<div>, "auto") -> 100
    style:          uustyle,        // uu.style(node:Node, pseudo:String):Hash
    // --- QUERY ---
    id:             uuid,           //    uu.id(expression:String, context:Node = document):Node/null
    tag:            uutag,          //   uu.tag(expression:String, context:Node = document):NodeArray
    query:          uuquery,        // uu.query(expression:String, context:NodeArray/Node = document):NodeArray
    // --- Node.className ---
    klass:    uumix(uuklass, {      // uu.klass(expression:String, context:Node = document):NodeArray
        has:        uuklasshas,     //    uu.klass.has(node:Node, classNames:String):Boolean
        add:        uuklassadd,     //    uu.klass.add(node:Node, classNames:String):Node
        remove:     uuklassremove,  // uu.klass.remove(node:Node, classNames:String):Node
        toggle:     uuklasstoggle   // uu.klass.toggle(node:Node, classNames:String):Node
    }),
    // --- OOP ---
    Class:    uumix(uuclass, {      // uu.Class(className:String, proto:Hash = void)
                                    //  [1][base]    uu.Class("A",   { proto: ... })
                                    //  [2][inherit] uu.Class("B:A", { proto: ... })
        singleton:                  // uu.Class.singleton(className:String, proto:Hash = void)
                    uuclasssingleton
    }),
    // --- EVENT ---
    event:    uumix(uuevent, {      // uu.event(node:Node, eventTypeEx:String, evaluator:Function, detach:Boolean = false):Node
                                    //  [1][bind a event]            uu.event(node, "click", fn)             -> node
                                    //  [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
                                    //  [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
                                    //  [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node
        has:        uueventhas,     // uu.event.has(node:Node, eventTypeEx:String):Boolean
        fire:       uueventfire,    // uu.event.fire(node:Node, eventType:String, param:Mix = void):Node
        stop:       uueventstop,    // uu.event.stop(eventObject:EventObject):EventObject
        unbind:     uueventunbind,  // uu.event.unbind(node:Node, eventTypeEx:String = void):Node
        attach:     uueventattach,  // uu.event.attach(node:Node, eventType:String, evaluator:Function, capture:Boolean = false)
        detach:     uueventdetach   // uu.event.detach(node:Node, eventType:String, evaluator:Function, capture:Boolean = false)
    }),
    // --- Node / NodeList ---
    node:     uumix(uunode, {       // uu.node(tagName:String = "div", attr:Hash = void):Node
        add:        uunodeadd,      // uu.node.add(source:Node/DocumentFragment/HTMLFragment/TagName = "div", context:Node = <body>, position:Number = 6):Node
                                    //  [1][add div node]          uu.node.add()         -> <body><div /></body>
                                    //  [2][from tagName]          uu.node.add("p")      -> <body><p /></body>
                                    //  [3][from node]             uu.node.add(uu.div()) -> <body><div /></body>
                                    //  [4][from HTMLFragment]     uu.node.add("<div><p>txt</p></div>") -> <body><div><p>txt</p></div></body>
                                    //  [5][from DocumentFragment] uu.node.add(DocumentFragment)        -> <body>{{fragment}}</body>
        has:        uunodehas,      // uu.node.has(node:Node, context:Node):Boolean
        bulk:       uunodebulk,     // uu.node.bulk(source:Node/HTMLFragment, context:Node/TagString = "div"):DocumentFragment
        path:       uunodepath,     // uu.node.path(node:Node):String
        swap:       uunodeswap,     // uu.node.swap(swapin:Node, swapout:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        clear:      uunodeclear,    // uu.node.clear(context:Node):Node
        clone:      uunodeclone,    // uu.node.clone(node:Node):Node
        remove:     uunoderemove,   // uu.node.remove(node:Node):Node
        // --- FIND NODE ---
        first:      uunodefirst,    // uu.node.first(context:Node):Node/null
        next:       uunodenext,     // uu.node.next(context:Node):Node/null
        prev:       uunodeprev,     // uu.node.prev(context:Node):Node/null
        last:       uunodelast,     // uu.node.last(context:Node):Node/null
        indexOf:    uunodeindexof   // uu.node.indexOf(node:Node):Number
    }),
    nodeid:   uumix(uunodeid, {     // uu.nodeid(node:Node):Number (nodeid)
        toNode:     uunodeidtonode, // uu.nodeid.toNode(nodeid:Number):Node
        remove:     uunodeidremove  // uu.nodeid.remove(node:Node):Node (removed node)
    }),
    html:           uuhtml,         // uu.html(node, attr, style, buildid) -> <html>
    head:           uuhead,         // uu.head(node, attr, style, buildid) -> <head>
    body:           uubody,         // uu.body(node, attr, style, buildid) -> <body>
    text:           uutext,         // uu.text(node:Node/String, text:String(= void)):Array/String/Node
                                    //  [1][create node] uu.text("text")       -> createTextNode("text")
                                    //  [2][get text]    uu.text(node)         -> text or [text, ...]
                                    //  [3][set text]    uu.text(node, "text") -> node
    // --- STRING ---
    fix:            uufix,          // uu.fix(source:String):String
                                    //  [1][css-prop to js-css-prop] uu.fix("background-color") -> "backgroundColor"
                                    //  [2][std-name to ie-name]     uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
                                    //  [3][html-attr to js-attr]    uu.fix("for")              -> "htmlFor"
                                    //  [4][through]                 uu.fix("-webkit-shadow")   -> "-webkit-shadow"
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
    format:         uuformat,       // uu.format(format:String, var_args, ...):String
                                    // [1][placeholder] uu.format("? dogs and ?", 101, "cats") -> "101 dogs and cats"
    entity:   uumix(uuentity, {     // uu.entity(str:String):String
        decode:     uuentitydecode  // uu.entity.decode(str:String):String
    }),
    // --- JSON ---
    json:     uumix(uujson, {       // uu.json(source:Mix, useNativeJSON:Boolean = false, callback:Function = void):JSONString
        decode:     uujsondecode    // uu.json.decode(jsonString:JSONString, useNativeJSON:Boolean = false):Mix/Boolean
    }),
    // --- DATE ---
    date:           uudate,         // uu.date(source:DateHash/Date/Number/String= void):DateHash
                                    //  [1][get now]                 uu.date() -> DateHash
                                    //  [2][DateHash]                uu.date(DateHash) -> cloned DateHash
                                    //  [2][date to hash]            uu.date(Date) -> DateHash
                                    //  [3][time to hash]            uu.date(milliseconds) -> DateHash
                                    //  [4][DateString to hash]      uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
                                    //  [5][ISO8601String to hash]   uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
                                    //  [6][RFC1123String to hash]   uu.date("Wed, 16 Sep 2009 16:18:14 GMT") -> DateHash
    // --- DEBUG ---
    puff:           uupuff,         // uu.puff(source:Mix)
    trace:    uumix(uutrace, {      // uu.trace(titleOrSource:String/Mix, source:Mix = void)
                                    //  [1][var dump]         uu.trace(mix)
                                    //  [2][title + var dump] uu.trace("title", mix)
        clear:      uutraceclear    // uu.trace.clear()
    }),
    // --- EVALUATION ---
    evaljs:         uuevaljs,       // uu.evaljs(javascriptExpression:String):Mix
    ready:          uuready,        // uu.ready(evaluator:Function = void, order:Number = 0)
    lazy:     uumix(uulazy, {       // uu.lazy(id:String, evaluator:Function, order:Number = 0)
        fire:       uulazyfire      // uu.lazy.fire(id:String)
    }),
    // --- STATE ---
    state: {
        DOMReady:       false,      // true is DOMContentLoaded event fired
        WindowReady:    false,      // true is window.onload event fired
        AudioReady:     false,      // true is <audio> ready event fired
        VideoReady:     false,      // true is <video> ready event fired
        CanvasReady:    false,      // true is <canvas> ready event fired
        StorageReady:   false,      // true is window.localStorage ready event fired
        Blackout:       false       // true is blackout (css3 cache reload)
    },
    // --- OTHER ---
    guid:           uuguid,         // uu.guid():Number - build GUID
    page: {
        size:       uupagesize      // uu.page.size():Hash { innerWidth, innerHeight, pageXOffset, pageYOffset }
    },
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    nop:            function() {}   // uu.nop() - none operation
});

// --- CONSTRUCTION ---
uu.config = uuarg(win.xconfig, {    // uu.config - Hash: user configurations
    aria:       false,
    debug:      false,
    right:      false,
    trace:      "xtrace",
    altcss:     0,
    storage:    0,
    baseDir:    ""
});

uu.config.baseDir|| (uu.config.baseDir =
    uutag("script").pop().src.replace(/[^\/]+$/, function(file) {
        return file === "uupaa.js" ? "../" : "";
    }));

// --- MessagePump class ---
MessagePump.prototype = {
    send:           uumsgsend,      // MessagePump.send(address:Array/Mix, message:String, param:Mix = void):Array/Mix
                                    //  [1][multicast] MessagePump.send([instance, ...], "hello") -> ["world!", ...]
                                    //  [2][unicast  ] MessagePump.send(instance, "hello") -> ["world!"]
                                    //  [3][broadcast] MessagePump.send(null, "hello") -> ["world!", ...]
    post:           uumsgpost,      // MessagePump.post(address:Array/Mix, message:String, param:Mix = void)
                                    //  [1][multicast] MessagePump.post([instance, ...], "hello")
                                    //  [2][unicast  ] MessagePump.post(instance, "hello")
                                    //  [3][broadcast] MessagePump.post(null, "hello")
    register:       uumsgregister,  // MessagePump.register(instance:Instance)
    unregister:     uumsgunregister // MessagePump.unregister(instance:Instance)
};

uu.msg = new MessagePump();         // uu.msg - MessagePump instance

// --- ECMAScript-262 5th ---
isArray || (Array.isArray = isArray = _isArray);

//{{{!mb
uumix(Array.prototype, {
    map:            arraymap,       //         map(evaluator:Function, that:this = void):Array
    some:           arraysome,      //        some(evaluator:Function, that:this = void):Boolean
    every:          arrayevery,     //       every(evaluator:Function, that:this = void):Boolean
    filter:         arrayfilter,    //      filter(evaluator:Function, that:this = void):Array
    forEach:        arrayforeach,   //     forEach(evaluator:Function, that:this = void)
    indexOf:        arrayindexof,   //     indexOf(search:Mix, fromIndex:Number = 0):Number
    lastIndexOf:    arraylastindexof// lastIndexOf(search:Mix, fromIndex:Number = this.length):Number
}, 0, 0);
//}}}!mb

uumix(Array.prototype, {
    reduce:         arrayreduce,    //      reduce(evaluator:Function, initialValue:Mix = void):Mix
    reduceRight:    arrayreduceright// reduceRight(evaluator:Function, initialValue:Mix = void):Mix
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
uu.ver.gecko && !win.HTMLElement.prototype.innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innertextgetter);
    proto.__defineSetter__("innerText", innertextsetter);
    proto.__defineGetter__("outerHTML", outerhtmlgetter);
    proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(win.HTMLElement.prototype);
//}}}!mb

// ===================================================================

// [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Clas.MyClass(arg1, arg2)
// [2][NodeSet factory] uu("div>ul>li", <body>) -> Jam

// uu - factory
function uufactory(expression, // @param Jam/Node/NodeArray/String/window: expression or ClassName
                   arg1,       // @param Jam/Node/Mix(= void): context or ClassName.init arg1
                   arg2,       // @param Mix(= void): ClassName.init arg2
                   arg3,       // @param Mix(= void): ClassName.init arg3
                   arg4) {     // @param Mix(= void): ClassName.init arg4
                               // @return Jam/Instance:
    // class factory
    if (typeof expression === "string" && uuclass[expression]) {
        return new uuclass[expression](arg1, arg2, arg3, arg4);
    }
    // jam factory
    return new uu.jam(expression, arg1, arg2, arg3, arg4); // depend: uu.jam
}

// --- plugin / plugin name space ---
// uu.plugin - enum plugins
function uuplugin() { // @return Array: ["plugin-name", ...]
    return uukeys(uuplugin);
}

// uu.require - require file
function uurequire(url) { // @param String: url
                          // @return AjaxResultHash:
    var xhr, status = 400, ok = false;

    try {
//{{{!mb
        xhr = win.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : 0;
//}}}!mb
        xhr || (xhr = new XMLHttpRequest());

        xhr.open("GET", url, false); // sync
        xhr.send(null);

        status = xhr.status || 200;
        ok = status >= 200 && status < 300;
    } catch (err) {}

    return {
        ok: ok, url: url, xhr: xhr || {}, guid: uuguid(), status: status,
        isXMLContent: function() {
            return /xml/i.test(this.xhr.getResponseHeader("Content-Type") || "");
        }
    };
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
    case uutype.DATE:       return uudate(lhs).ISO() === uudate(rhs).ISO();
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
    var types = uutype.types,
        rv = types[typeof search] ||
             types[toString.call(search)] ||
             (!search ? uutype.NULL : search.nodeType ? uutype.NODE :
             "length" in search ? uutype.FAKEARRAY : uutype.HASH);

    return match ? !!(match & rv) : rv;
}
uutype.types = {
    "undefined":        uutype.VOID,
    "[object Boolean]": uutype.BOOLEAN,     "boolean":   uutype.BOOLEAN,
    "[object Number]":  uutype.NUMBER,      "number":    uutype.NUMBER,
    "[object String]":  uutype.STRING,      "string":    uutype.STRING,
    "[object Function]":uutype.FUNCTION, // "function":  uutype.FUNCTION,
    "[object NodeList]":uutype.FAKEARRAY, // [Safari]
    "[object RegExp]":  uutype.REGEXP,
    "[object Array]":   uutype.ARRAY,
    "[object Date]":    uutype.DATE
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

// uu.isFunction - is function
function uuisfunction(search) { // @param Mix: search
                                // @return Boolean:
    return toString.call(search) === "[object Function]";
}

// Array.isArray
function _isArray(search) { // @param Mix: search
                            // @return Boolean:
    return toString.call(search) === "[object Array]";
}

// --- hash / array ---

// [1][supply args]         uu.arg({ a: 1 }, { b: 2 }) -> { a: 1, b: 2 }

// uu.arg - supply default arguments
function uuarg(arg1,   // @param Hash(= {}): arg1
               arg2,   // @param Hash: arg2
               arg3) { // @param Hash(= void): arg3
                       // @return Hash: new Hash(mixed arg)
    return uumix(uumix({}, arg1 || {}), arg2, arg3, 0);
}

// [1][override value]      uu.mix({a:9, b:9}, {a:1}, {b:2})    -> { a: 1, b: 2 }
// [2][stable value]        uu.mix({a:9, b:9}, {a:1}, {b:2}, 0) -> { a: 9, b: 9 }

// uu.mix - mixin
function uumix(base,       // @param Hash: mixin base
               flavor,     // @param Hash: add flavor
               aroma,      // @param Hash(= void): add aroma
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
    if (isArray(source)) {
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

    if (isArray(source)) {
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
                value) { // @param Mix(= void): value
                         // @return Hash: { key: value, ... }
    if (arguments.length === 1) { // [1]
        return key;
    }
    var rv = {};

    rv[key] = value; // [2]
    return rv;
}
// uu.hash.dd2num = { "00":   0 , ... "99":  99  }; Zero-filled dec string -> Number
// uu.hash.num2dd = {    0: "00", ...   99: "99" }; Number -> Zero-filled dec string
_makeMapping("0123456789",       uuhash.dd2num = {}, uuhash.num2dd = {});

// uu.hash.hh2num = { "00":   0 , ... "ff": 255  }; Zero-filled hex string -> Number
// uu.hash.num2hh = {    0: "00", ...  255: "ff" }; Number -> Zero-filled hex string
_makeMapping("0123456789abcdef", uuhash.hh2num = {}, uuhash.num2hh = {});

// [1][ary to ary (through)]    uu.ary([1, 2])    -> [1, 2]
// [2][mix to ary]              uu.ary(mix)       -> [mix]
// [3][NodeList to ary]         uu.ary(NodeList)  -> [node, ...]
// [4][arguments to ary]        uu.ary(arguments) -> [arg, ...]

// uu.array - to array, convert array
function uuarray(source) { // @param Array/Mix/NodeList/Arguments: source
                           // @return Array:
    var type = uutype(source);

    return (type === uutype.FAKEARRAY) ? fakeToArray(source) // [3][4]
         : (type === uutype.ARRAY)     ? source : [source];  // [1][2]
}

// [1][Hash has Hash]       uu.has({ a: 1, b: 2 }, { a: 1 }) -> true
// [2][Array has Array]     uu.has([1, 2], [1]) -> true

// uu.has - has
function uuhas(source,   // @param Hash/Array: source
               search) { // @param Hash/Array: search element
                         // @return Boolean:
    if (source && search) {
        var i, iz;

        if (isArray(source)) {
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
                && _jsoninspect(source[i], 0, 1) !== _jsoninspect(search[i], 0, 1)) {
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
function uunth(source,  // @param Hash/Array: source
               index) { // @param Number: index
                        // @return Array: [key, value]
                        //                or [void, void] (not found)
    var i, j = 0;

    if (isArray(source)) {
        if (i in source) {
            return [i, source[i]];
        }
    } else {
        for (i in source) {
            if (j++ === index) {
                return [i, source[i]];
            }
        }
    }
    return [void 0, void 0];
}

// [1][Hash.length]         uu.size({ a: 1, b: 2 }) -> 2
// [2][Array.length]        uu.size([1,2]) -> [1,2]

// uu.size - get length
function uusize(source) { // @param Hash/Array: source
                          // @return Number:
    return isArray(source) ? source.length : uukeys(source).length;
}

// [1][Hash.clone]          uu.clone({ a: 1, b: 2 }) -> { a: 1, b: 2 }
// [2][Array.clone]         uu.clone([1,2]) -> [1,2]

// uu.clone - clone hash, clone array
function uuclone(source) { // @param Hash/Array: source
                           // @return Hash/Array: cloned hash/array
    return isArray(source) ? source.concat() : uumix({}, source);
}

// [1][Hash.indexOf]            uu.hash.indexOf({ a: 1, b: 2, c: 2 }, 2) -> "b"

// uu.hash.indexOf - find first key from value
function uuindexof(source,   // @param Hash: source
                   search) { // @param Mix: search value
                             // @return String/void: "found-key" or void
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

// uu.sort - sort array
function uusort(source,   // @param Array: source
                method) { // @param String/Function(= "0-9"): method
                          //                   sort method or callback-function
                          // @return Array:
    // 0x1 = numeric sort
    // 0x2 = reverse
    var r = { "0-9": 1, "9-0": 3, "A-Z": 0, "Z-A": 2 }[method || "0-9"];

    (r & 1) ? source.sort(function(a, b) { return a - b; })
            : source.sort();
    return (r & 2) ? source.reverse() : source;
}

// [1][Array.clean]         uu.clone([,,1,2,,]) -> [1,2]

// uu.clean - array compaction, trim null and undefined elements
function uuclean(source) { // @param Array: source
                           // @return Array: clean Array
    if (isArray(source)) {
        var rv = [], i = 0, iz = source.length;

        for (; i < iz; ++i) {
            if (i in source && source[i] != null) { // skip null or undefined
                rv.push(source[i]);
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

    if (isArray(source)) {
        var rv = [], ri = -1, v, i = 0, j, iz = source.length,
            found,
            unique = {};

        for (; i < iz; ++i) {
            v = source[i];
            if (v != null) { // skip null or undefined
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

    if (isArray(value)) { // [1]
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
//  [1][get all pair]   uu.attr(node) -> { key: value, ... }
//  [2][get value]      uu.attr(node, key) -> value
//  [3][set pair]       uu.attr(node, key, value) -> node
//  [4][set pair]       uu.attr(node, { key: value, ... }) -> node
//  [5][remove attr]    uu.attr(node, key, null) -> node

// uu.attr - attribute accessor
function uuattr(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param String(= void): value
                         // @return String/Hash/Node:
    var rv, ary, v, i = -1,
        fix = uuattr.fix; // [IE6][IE7] for -> htmlFor, className -> class
                          // [OTHER]    for -> htmlFor, class -> className

    if (key === void 0) { // [1] uu.attr(node)
        rv = {};
        ary = node.attributes;

        while ( (v = ary[++i]) ) {
            rv[v.name] = v.value;
        }
        return rv; // Hash
    }
    if (arguments.length === 3) { // [3] uu.attr(node, key, value)
        key = uuhash(key, value);
    } else if (typeof key === "string") { // [2] uu.attr(node, key)
        return node.getAttribute(fix[key] || key, 2) || "";
    }
    for (i in key) {
        key[i] === null ? node.removeAttribute(fix[i] || i)       // [5]
                        : node.setAttribute(fix[i] || i, key[i]); // [4]
    }
    return node;
}
uuattr.fix = uusplittohash(
//{{{!mb
    uu.ver.ie67 ? "for,htmlFor,className,class" :
//}}}!mb
    "class,className,for,htmlFor,colspan,colSpan,accesskey,accessKey,rowspan,rowSpan,tabindex,tabIndex"
);

//  [1][get all pair]   uu.data(node) -> { key: value, ... }
//  [2][get value]      uu.data(node, key) -> value
//  [3][set pair]       uu.data(node, key, value) -> node
//  [4][set pair]       uu.data(node, { key: value, ... }) -> node

// uu.data - node data accessor [HTML5 spec - Embedding custom non-visible data]
function uudata(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param Mix(= void): value
                         // @return Hash/Mix/Node/undefined:
    var rv, i;

    if (key === void 0) { // [1] uu.data(node)
        rv = {};
        for (key in node) {
            key.indexOf("data-") || (rv[key.slice(5)] = node[key]);
        }
        return rv; // Hash
    }
    if (arguments.length === 3) { // [3] uu.data(node, key or "*", value)
        if (key === "*") {
            for (key in uudata(node)) {
                node["data-" + key] = value;
            }
        } else {
            node["data-" + key] = value;
        }
    } else if (typeof key === "string") { // [2]
        return node["data-" + key]; // Mix or undefined
    } else {
        for (i in key) {
            node["data-" + i] = key[i]; // [4]
        }
    }
    return node;
}

//  [1][clear all pair] uu.data.clear(node) -> node
//  [2][clear pair]     uu.data.clear(node, key) -> node

// uu.data.clear - clear/remove node data
function uudataclear(node,  // @param Node:
                     key) { // @param String(= void): key
                            // @return Node:
    return uudata(node, key || "*", null);
}

// --- css ---
//  [1][current style]  uu.css(node) -> { key: value, ... }
//  [2][get value]      uu.css(node, key) -> value
//  [3][set pair]       uu.css(node, key, value) -> node
//  [4][set pair]       uu.css(node, { key: value, ... }) -> node

// uu.css - css accessor
function uucss(node,    // @param Node:
               key,     // @param String/Hash: key
               value) { // @param String(= void): value
                        // @return Hash/String/Node:
    var style, informal, formal, fix, care;

    if (key === void 0) { // [1] uu.css(node)
        return getComputedStyle ? getComputedStyle(node, null)
                                : (node.currentStyle || {});
    }
    if (arguments.length === 3) { // [3] uu.css(node, key, value)
        key = uuhash(key, value);
    } else if (typeof key === "string") { // [2] uu.css(node, key)
        style = getComputedStyle ? getComputedStyle(node, null)
                                 : (node.currentStyle || {});
        return style[uufix.db[key] || key] || "";
    }
    // [4]
    fix = uufix.db;
    care = uucss.care;
    style = node.style;

    for (informal in key) { // informal = "text-align" or "textAlign"
        value = key[informal];
        formal = fix[informal] || informal; // formal = "textAlign"

        if (typeof value === "number") {
            if (formal === "opacity") {
                setOpacity(node, value);
                continue;
            }
            !care[formal] && (value += "px"); // number -> pixel value
        }
        style[formal] = value;
    }
    return node;
}
uucss.care = { lineHeight: 1, fontWeight: 1,
               fontSizeAdjust: 1, zIndex: 1, zoom: 1 };

// uu.css.getOpacity
function getOpacity(node) { // @param Node:
                            // @return Number: opacity (from 0.0 to 1.0)
//{{{!mb
    if (uu.ver.ie678) {
        var opacity = node["data-uuopacity"]; // undefined or 1.0 ~ 2.0

        return opacity ? (opacity - 1): 1;
    }
//}}}!mb
    return parseFloat(node.style.opacity ||
                      getComputedStyle(node, null).opacity);
}

// uu.css.setOpacity
function setOpacity(node,      // @param Node:
                    opacity) { // @param Number/String: Number(0.0 - 1.0) absolute
                               //                       String("+0.5", "-0.5") relative
                               // @return Node:
    var style = node.style;

//{{{!mb
    if (uu.ver.ie678) {
        if (!node["data-uuopacity"]) {

            // at first time
            if (uu.ver.ie67) { // [FIX][IE6][IE7]
                if ((node.currentStyle || {}).width === "auto") {
                    style.zoom = 1;
                }
            }
        }
    }
//}}}!mb

    // relative
    if (typeof opacity === "string") {
        opacity = getOpacity(node) + parseFloat(opacity);
    }

    // normalize
    opacity = (opacity > 0.999) ? 1
            : (opacity < 0.001) ? 0 : opacity;
    style.opacity = opacity;

//{{{!mb
    if (uu.ver.ie678) {
        node["data-uuopacity"] = opacity + 1; // (1.0 ~ 2.0)
        style.visibility = opacity ? "" : "hidden";
        style.filter = ((opacity > 0 && opacity < 1)
                     ? "alpha(opacity=" + (opacity * 100) + ") " : "")
                     + style.filter.replace(setOpacity.alpha, "");
    }
//}}}!mb
    return node;
}
//{{{!mb
setOpacity.alpha = /^alpha\([^\x29]+\) ?/;
//}}}!mb

// uu.toPixel - convert to pixel unit
function uutopixel(node,    // @param Node: context
                   value,   // @param Number/CSSUnitString: 123, "123", "123px",
                            //                              "123em", "123pt", "auto"
                   quick) { // @param Boolean(= false): true is quick mode
    var fontSize, ratio, judge = uutopixel.judge;

    if (typeof value === "number") {
        return value;
    }

    // "123p" -> 123
    if (judge.px.test(value)) {
        return parseInt(value) || 0;
    }
    if (!quick) {
        return uutopixel.calc(node, value);
    }
    if (judge.pt.test(value)) {
        return (parseFloat(value) * 4 / 3) | 0; // 12pt * 1.333 = 16px
    } else if (judge.em.test(value)) {
        fontSize = uucss(node).fontSize;
        ratio = judge.pt.test(fontSize) ? 4 / 3 : 1;
        return (parseFloat(value) * parseFloat(fontSize) * ratio) | 0;
    }
    return parseInt(value) || 0;
}
uutopixel.calc = _calcPixel;
uutopixel.judge = { px: /px$/, pt: /pt$/, em: /em$/ };

// inner - convert unit
function _calcPixel(node,    // @param Node:
                    value) { // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                             // @return Number: pixel value
    var style = node.style, mem = [style.left, 0, 0]; // [left, position, display]

    if (uu.webkit) {
        mem[1] = style.getPropertyValue("position");
        mem[2] = style.getPropertyValue("display");
        style.setProperty("position", "absolute", "important");
        style.setProperty("display",  "block",    "important");
    }
    style.setProperty("left", value, "important");
    // get pixel
    value = parseInt(getComputedStyle(node, null).left);
    // restore
    style.removeProperty("left");
    style.setProperty("left", mem[0], "");
    if (uu.webkit) {
        style.removeProperty("position");
        style.removeProperty("display");
        style.setProperty("position", mem[1], "");
        style.setProperty("display",  mem[2], "");
    }
    return value || 0;
}

//{{{!mb
// inner - convert unit
function _calcPixelIE(node,    // @param Node:
                      value) { // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                               // @return Number: pixel value
    var style = node.style,
        runtimeStyle = node.runtimeStyle,
        mem = [style.left, runtimeStyle.left]; // keep !important value

    // overwrite
    runtimeStyle.left = node.currentStyle.left;
    style.left = value;
    // get pixel
    value = style.pixelLeft;
    // restore
    style.left = mem[0];
    runtimeStyle.left = mem[1];

    return value || 0;
}

if (!getComputedStyle) {
    uutopixel.calc = _calcPixelIE;
    uu.style = uustyleie;
}
//}}}!mb

// uu.style -
function uustyle(node,     // @param Node:
                 pseudo) { // @param String(= null):
                           // @return Hash: { width: "123px", ... }
    return getComputedStyle(node, pseudo || null);
}

//{{{!mb
// uu.style - getComputedStyle emulator [IE6][IE7][IE8]
function uustyleie(node             // @param Node:
                   /*, pseudo */) { // @param String(= null):
                                    // @return Hash: { width: "123px", ... }
    // http://d.hatena.ne.jp/uupaa/20091212
    if (!node.currentStyle) {
        return {};
    }
    var rv, rect, ut, v, w, x, i = -1, mem,
        style = node.style,
        currentStyle = node.currentStyle,
        runtimeStyle = node.runtimeStyle,
        UNITS = { m: 1, t: 2, "%": 3, o: 3 }, // em, pt, %, auto,
        RECTANGLE = { top: 1, left: 2, width: 3, height: 4 },
        fontSize = currentStyle.fontSize,
        em = parseFloat(fontSize) * (/pt$/.test(fontSize) ? 4 / 3 : 1),
        boxProperties = uustyle.boxs,
        cache = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                  thin: "1px", medium: "3px",
                  thick: uu.ver.ie89 ? "5px" : "6px" };

    rv = uustyle.getProps(currentStyle);

    // calc: border***Width, padding***, margin***
    while ( (w = boxProperties[++i]) ) {
        v = currentStyle[w];
        if (!(v in cache)) {
            x = v;
            switch (ut = UNITS[v.slice(-1)]) {
            case 1: x = parseFloat(v) * em; break;    // "12em"
            case 2: x = parseFloat(v) * 4 / 3; break; // "12pt"
            case 3: // %, auto
                    mem = [style.left, runtimeStyle.left];
                    runtimeStyle.left = currentStyle.left;
                    style.left = v;
                    x = style.pixelLeft;
                    style.left = mem[0];
                    runtimeStyle.left = mem[1];
            }
            cache[v] = ut ? (x + "px") : x;
        }
        rv[w] = cache[v];
    }
    // calc: top, left, width, height
    for (w in RECTANGLE) {
        v = currentStyle[w];
        switch (ut = UNITS[v.slice(-1)]) {
        case 1: v = parseFloat(v) * em; break;    // "12em"
        case 2: v = parseFloat(v) * 4 / 3; break; // "12pt"
        case 3: // %, auto
            switch (RECTANGLE[w]) {
            case 1: v = node.offsetTop; break;  // style.top
            case 2: v = node.offsetLeft; break; // style.left
            case 3: rect || (rect = node.getBoundingClientRect());
                    v = (node.offsetWidth  || rect.right - rect.left) // style.width
                      - parseInt(rv.borderLeftWidth)
                      - parseInt(rv.borderRightWidth)
                      - parseInt(rv.paddingLeft)
                      - parseInt(rv.paddingRight);
                    v = v > 0 ? v : 0;
                    break;
            case 4: rect || (rect = node.getBoundingClientRect());
                    v = (node.offsetHeight || rect.bottom - rect.top) // style.height
                      - parseInt(rv.borderTopWidth)
                      - parseInt(rv.borderBottomWidth)
                      - parseInt(rv.paddingTop)
                      - parseInt(rv.paddingBottom);
                    v = v > 0 ? v : 0;
            }
        }
        rv[w] = ut ? (v + "px") : v;
    }
    rv.opacity = getOpacity(node);
    rv.fontSize = em + "px";
    rv.cssFloat = currentStyle.styleFloat; // compat
    return rv;
}
uustyle.boxs = // boxProperties
    ("borderBottomWidth,borderLeftWidth,borderRightWidth,borderTopWidth," +
     "marginBottom,marginLeft,marginRight,marginTop," +
     "paddingBottom,paddingLeft,paddingRight,paddingTop").split(",");

uustyle.getProps = (function(props) {
    var js = [], i = 0, prop;

    while ( (prop = props[i++]) ) {
        js.push(prop + ":style." + prop); // "{{prop}}: style.{{prop}}"
    }
    return new Function("style", "return {" + js.join(",") + "}");
})( ("borderBottomColor,borderBottomStyle,borderLeftColor,borderLeftStyle," +
     "borderRightColor,borderRightStyle,borderTopColor,borderTopStyle," +
     "bottom,clear,clipBottom,clipLeft,clipRight,clipTop,color,cursor," +
     "direction,display,fontFamily,fontSize,fontStyle,fontWeight," +
     "letterSpacing,lineBreak,lineHeight,listStyleImage,listStylePosition," +
     "listStyleType,maxHeight,maxWidth,minHeight,minWidth,position," +
     "right,textAlign,textIndent,textOverflow,verticalAlign,visibility," +
     "whiteSpace,wordBreak,wordSpacing,wordWrap,zIndex,zoom").split(","));
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

// [1][remove className] uu.klass.remove(node, "class1 class2") -> node

// uu.klass.remove - remove className
function uuklassremove(node,         // @param Node:
                       classNames) { // @param String(= ""): "class1 class2 ..."
                                     // @return Node:
    node.className = uutriminner(
            node.className.replace(_classNameMatcher(uusplit(classNames)), ""));
    return node;
}

// uu.klass.toggle - toggle(add / remove) className property
function uuklasstoggle(node,         // @param Node:
                       classNames) { // @param String: "class1 class2 ..."
                                     // @return Node:
    return (uuklasshas(node, classNames) ? uuklassremove
                                         : uuklassadd)(node, classNames);
}

// --- oop ---
// uu.Class - create a generic class
function uuclass(className, // @param String: "Class"
                            //             or "Class : SuperClass"  (inherit)
                            //             or "Class < SuperClass"  (inherit)
                 proto) {   // @param Hash(= void): prototype object
    var ary = className.split(/\s*[\x3a-\x40]\s*/), tmp, i, classPrototype,
        Class = ary[0], Super = ary[1] || "";

    uuclass[Class] = function() {
        var that = this,
            Super = that.superClass || 0;

        // register MessagePump
        that.uuguid = uu.guid();
        that.msgbox || (that.msgbox = uu.nop);
        uu.msg.register(that);

        // constructor(Super -> that)
        Super && Super.init && Super.init.apply(that, arguments);
                  that.init &&  that.init.apply(that, arguments);
    };
    uuclass[Class].prototype = proto || {};

    if (Super) { // [2]
        tmp = function() {};
        tmp.prototype = uu.Class[Super].prototype;
        classPrototype = uuclass[Class].prototype = new tmp;

        for (i in proto) {
            classPrototype[i] = proto[i];
        }
        classPrototype.constructor = uuclass[Class];
        classPrototype.superClass = uu.Class[Super].prototype;
        classPrototype.superMethod = superMethod;
    }

    function superMethod(method              // @param String: method name
                         /*, var_args */ ) { // @param Mix: args
        return this.superClass[method].apply(this, uuarray(arguments).slice(1));
    }
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(className, // @param String: class name
                          proto) {   // @param Hash(= void): prototype object
                                     // @return Object: singleton class instance
    uuclass[className] = function() {
        var that = this, arg = arguments, self = arg.callee;

        if (!self.instance) {
            that.uuguid = uu.guid();
            that.init && that.init.apply(that, arg);
            that.msgbox || (that.msgbox = uu.nop);
            uu.msg.register(that);
        }
        return self.instance || (self.instance = that);
    };
    uuclass[className].prototype = proto || {};
}

// --- message pump ---
// MessagePump
function MessagePump() {
    this.addr = {}; // AddressMap { guid: instance, ... }
    this.cast = []; // Broadcast AddressMap [guid, ...]
}

// [1][multicast] MessagePump.send([instance, ...], "hello") -> ["world!", ...]
// [2][unicast  ] MessagePump.send(instance, "hello") -> ["world!"]
// [3][broadcast] MessagePump.send(null, "hello") -> ["world!", ...]

// MessagePump.send - send a message synchronously
function uumsgsend(address, // @param Array/Mix: address or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           null is broadcast
                   message, // @param String: message
                   param) { // @param Mix(= void):
                            // @return Arra: [result, ...]
    var rv = [], ri = -1, to, obj, i = -1,
        ary = address ? uuarray(address) : this.cast;

    while ( (to = ary[++i]) ) {
        obj = this.addr[to.uuguid || to || 0];
        obj && (rv[++ri] = obj.msgbox(message, param));
    }
    return rv;
}

// [1][multicast] MessagePump.post([instance, ...], "hello")
// [2][unicast  ] MessagePump.post(instance, "hello")
// [3][broadcast] MessagePump.post(null, "hello")

// MessagePump.post - send a message asynchronously
function uumsgpost(address, // @param Array/Mix: address or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           null is broadcast
                   message, // @param String: message
                   param) { // @param Mix(= void): param
    var that = this;

    setTimeout(function() {
        that.send(address ? uuarray(address) : that.cast, message, param);
    }, 0);
}

// MessagePump.register - register the destination of the message
function uumsgregister(instance) { // @param Instance: class instance
    this.addr[instance.uuguid] = instance;
    this.cast = uukeys(this.addr);
}

// MessagePump.unregister
function uumsgunregister(instance) { // @param Instance: class instance
    delete this.db[instance.uuguid];
    this.cast = uukeys(this.addr);
}

// --- event ---
// [1][bind a event]            uu.event(node, "click", fn)             -> node
// [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
// [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
// [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node

// uu.event - bind event
function uuevent(node,        // @param Node:
                 eventTypeEx, // @param EventTypeExString: some EventTypeEx, "click,click+,..."
                 evaluator,   // @param Function/Instance: callback function
                 unbind) {    // @param Boolean(= false): true is unbind, false is bind
                              // @return Node:
    function _eventClosure(evt, fromCustomEvent) {
        evt = evt || win.event;

        if (!fromCustomEvent && !evt.code) {
            var src = evt.srcElement || evt.target; // [IE] srcElement

            // make EventObjectEx { code, node, src, px, py, ox, oy }
            src = (uu.webkit && src.nodeType === 3) ? src.parentNode : src;
            evt.code = (eventCode[evt.type] || 0) & 255;
            evt.node = node;
            evt.src = src;
//{{{!mb
            if (!uu.ie) {
//}}}!mb
                evt.px = evt.pageX;
                evt.py = evt.pageY;
//{{{!mb
            } else {
                evt.px = evt.clientX + doc.html.scrollLeft;
                evt.py = evt.clientY + doc.html.scrollTop;
            }
//}}}!mb
            evt.ox = evt.offsetX || evt.layerX || 0; // [IE][Opera][WebKit] offsetX
            evt.oy = evt.offsetY || evt.layerY || 0; // [Gecko][WebKit] layerX
        }
        isInstance ? handler.call(evaluator, evt, node, src)
                   : evaluator(evt, node, src);
    } // [OPTIMIZED]

    // --- setup event database ---
    if (!("data-uuevent" in node)) {
        node["data-uuevent"] = { types: "," };
    }

    var eventTypeExArray = eventTypeEx.split(","),
        eventData = node["data-uuevent"],
        ex, token, bound,
        eventType, capture, closure, handler, i = -1, pos,
        isInstance = false, eventCode = uuevent.code; // for closure

    if (unbind) {
        closure = evaluator.eventClosure || evaluator;
    } else {
        handler = uuisfunction(evaluator)
                ? evaluator
                : (isInstance = true, evaluator.handleEvent);
        closure = evaluator.eventClosure = _eventClosure;
    }

    while ( (ex = eventTypeExArray[++i]) ) { // ex = "namespace.click+"

        // split token
        //      "namespace.click+"
        //              v
        //      ["namespace.click+", "namespace", "click", "+"]
        token = uuevent.parse.exec(ex);
        eventType = token[2]; // "click"
        capture   = token[3]; // "+"
        bound     = eventData["types"].indexOf("," + ex + ",") >= 0;

//{{{!mb
        // IE mouse capture [IE6][IE7][IE8]
        if (uu.ver.ie678) {
            if (eventType === "mousemove") {
                capture && uuevent(node, "losecapture", closure, unbind);
            } else if (eventType === "losecapture") {
                if (node.setCapture) {
                    bound ? node.setCapture()
                          : node.releaseCapture();
                }
            }
        }
//}}}!mb
        if (unbind) {
            if (bound) {

                pos = eventData[ex].indexOf(evaluator);
                if (pos >= 0) {

                    eventData[ex].splice(pos, 1); // remove evaluator
                    if (!eventData[ex].length) {

                        // ",dblclick," <- ",namespace.click+,dblclick,".
                        //                      replace(",namespace.click+,", ",")
                        eventData["types"] =
                            eventData["types"].replace("," + ex + ",", ",");
                    }
                    uueventdetach(node, eventType, closure, capture);
                }
            }
        } else {
            // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
            if (!bound) {
                eventData["types"] += ex + ",";
                eventData[ex] = [];
            }
            eventData[ex].push(closure);

            uueventattach(node, eventType, closure, capture);
        }
    }
    return node;
}
uuevent.parse = /^(?:(\w+)\.)?(\w+)(\+)?$/; // ^[NameSpace.]EvntType[Capture]$
uuevent.code = {
    mousedown: 1, mouseup: 2, mousemove: 3, mousewheel: 4, click: 5,
    dblclick: 6, keydown: 7, keypress: 8, keyup: 9, mouseenter: 10,
    mouseleave: 11, mouseover: 12, mouseout: 13, contextmenu: 14,
    focus: 15, blur: 16, resize: 17,
    losecapture: 0x102, DOMMouseScroll: 0x104
};

// uu.event.has - has event
function uueventhas(node,          // @param Node: target node
                    eventTypeEx) { // @param EventTypeExString: namespace and event types, "click", "namespace.mousemove+"
                                   // @return Boolean:
    var types = node["data-uuevent"] ? node["data-uuevent"]["types"] : 0;

    return (types || "").indexOf("," + eventTypeEx + ",") >= 0;
}

// uu.event.fire - fire event / fire custom event(none capture event only)
function uueventfire(node,      // @param Node: target node
                     eventType, // @param String: "click", "custom"
                     param) {   // @param Mix(= void): param
                                // @return Node:
    if (uueventhas(node, eventType)) {

        var fakeEventObjectEx = {
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
            };

        node["data-uuevent"][eventType].forEach(function(evaluator) {
            evaluator.call(node, fakeEventObjectEx, true); // fromCustomEvent = true
        });
    }
    return node;
}

// uu.event.stop - stop stopPropagation and preventDefault
function uueventstop(eventObject) { // @param EventObject:
                                    // @return EventObject:
//{{{!mb
    if (eventObject.stopPropagation) {
//}}}!mb
        eventObject.stopPropagation();
        eventObject.preventDefault();
//{{{!mb
    } else {
        eventObject.cancelBubble = true; // [IE]
        eventObject.returnValue = false; // [IE]
    }
//}}}!mb
    return eventObject;
}

// [1][unbind all]              uu.event.unbind(node) -> node
// [2][unbind some]             uu.event.unbind(node, "click+,dblclick") -> node
// [3][unbind namespace all]    uu.event.unbind(node, "namespace.*") -> node
// [4][unbind namespace some]   uu.event.unbind(node, "namespace.click+,namespace.dblclick") -> node

// uu.event.unbind - unbind event
function uueventunbind(node,          // @param Node: target node
                       eventTypeEx) { // @param EventTypeExString(= void): namespace and event types, "click,click+,..."
                                      // @return Node:
    function _unbindall(ex) { // @param EventTypeExString: "MyNamespace.mousemove+"
        // closure vars: node, ns

        if (!ex.indexOf(ns)) {
            node["data-uuevent"][ex].forEach(function(evaluator) {
                uuevent(node, ex, evaluator, true); // unbind mode
            });
        }
    }

    if (eventTypeEx === void 0) { // [1]
        eventTypeEx = node["data-uuevent"]["types"]; // ",click,MyNamespace.mousemove+,"
    }

    var ns, ary = uusplitcomma(eventTypeEx), ex, i = -1;

    while ( (ex = ary[++i]) ) {
        if (ex.lastIndexOf(".*") > 1) { // [3] "namespace.*"

            ns = ex.slice(0, -1);       // "namespace.*" -> "namespace."
            uusplitcomma(eventTypeEx).forEach(_unbindall);
        } else { // [2][4]
            if (eventTypeEx.indexOf("," + ex + ",") >= 0) {

                node["data-uuevent"][ex].forEach(function(evaluator) {
                    uuevent(node, ex, evaluator, true); // unbind mode
                });
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

//{{{!mb
    if (node.addEventListener) {
//}}}!mb
        node.addEventListener(eventType, evaluator, !!(capture || 0));
//{{{!mb
    } else {
        node.attachEvent("on" + eventType, evaluator); // [IE]
    }
//}}}!mb
}
uueventattach._FIX = uu.gecko ? { mousewheel: "DOMMouseScroll" } :
                     uu.opera ? { contextmenu: "mousedown" } : {};

// uu.event.detach - detach event - Raw Level API wrapper
function uueventdetach(node,      // @param Node:
                       eventType, // @param String: event type
                       evaluator, // @param Function: evaluator
                       capture) { // @param Boolean(= false):
    eventType = uueventattach._FIX[eventType] || eventType;

//{{{!mb
    if (node.removeEventListener) {
//}}}!mb
        node.removeEventListener(eventType, evaluator, !!(capture || 0));
//{{{!mb
    } else {
        node.detachEvent("on" + eventType, evaluator); // [IE]
    }
//}}}!mb
}

// uu.ready - hook DOMContentLoaded event
function uuready(evaluator, // @param Function(= void): callback function
                 order) {   // @param Number(= 0): 0=low, 1=mid, 2=high(system)
    if (evaluator !== void 0 && !uu.state.Blackout) {
        uu.state.DOMReady ? evaluator(uu) // fired -> callback
                          : uulazy("boot", evaluator, order || 0); // [1] stock
    }
}

// --- node ---
// uu.node - createElement wrapper
function uunode(tagName, // @param String(= "div"):
                attr) {  // @param Hash(= void):
                         // @return Node: <node>
    var rv = doc.createElement(tagName || "div");

    return attr === void 0 ? rv : uumix(rv, attr);
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
             : !source.indexOf("<") ? uunodebulk(source, context) // [4] uu.node.add(HTMLFragmentString)
             : doc.createElement(source),                // [2] uu.node.add("p")
        parentNode = context.parentNode, reference = null,
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
    case 1: reference = parentNode.firstChild;                  // first sibling
    case 2: reference || (reference = context);                 // prev sibling
    case 3: reference || (reference = context.nextSibling);     // next sibling
    case 4: parentNode.insertBefore(node, reference); break;    // last sibling
    case 5: reference = context.firstChild;                     // first child
    case 6: context.insertBefore(node, reference);              // last child
    }
    return rv;
}

// uu.nodeid - get nodeid
function uunodeid(node) { // @param Node:
                          // @return Number: nodeid, from 1
    if (!node["data-uuguid"]) {
        uunodeid.db[node["data-uuguid"] = ++uunodeid.num] = node;
    }
    return node["data-uuguid"];
}
uunodeid.num = 0; // node id counter
uunodeid.db = {}; // { nodeid: node, ... }

// uu.nodeid.toNode - get node by nodeid
function uunodeidtonode(nodeid) { // @param String: nodeid
                                  // @return Node/void:
    return uunodeid.db[nodeid];
}

// uu.nodeid.remove - remove from node db
function uunodeidremove(node) { // @param Node:
                                // @return Node: removed node
    node["data-uuguid"] && (uunodeid.db[node["data-uuguid"]] = null,
                                        node["data-uuguid"] = null);
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
function uunodebulk(source,    // @param Node/HTMLFragment: source
                    context) { // @param Node/TagString(= "div"): context
                               // @return DocumentFragment:
    context = context || "div";

    var rv = doc.createDocumentFragment(),
        placeholder = context.nodeType ? context : uunode(context);

    placeholder.innerHTML = source.nodeType ? source.outerHTML // [1] node
                                            : source;          // [2] "<p>html</p>"
    while (placeholder.firstChild) {
        rv.appendChild(placeholder.removeChild(placeholder.firstChild));
    }
    return rv;
}

// uu.nod.path - get node path (xpath)
function uunodepath(node) { // @param Node: ELEMENT_NODE
                            // @return XPathString: "/html[1]/body[1]/div[5]"
                            // @throws Error("NOT_ELEMENT_NODE")
    if (!node.parentNode || node.nodeType !== 1) {
        throw new Error("NOT_ELEMENT_NODE");
    }

    var rv = [], n = node;

    while (n && n.nodeType === 1) {
        rv.push(n.tagName.toLowerCase() +
                "[" + (uunodeindexof(n, n.tagName) + 1) + "]");
        n = n.parentNode;
    }
    return "/" + rv.reverse().join("/");
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

//  [1][add node]       uu.div(uu.div())
//  [2][add text node]  uu.div("hello")
//  [3][add text node]  uu.div(uu.text("hello"))
//  [4][set attr]       uu.div("title,hello")        -> uu.node("div", { title: "hello" })
//  [5][set attr]       uu.div({ title: "hello" })   -> uu.node("div", { title: "hello" })
//  [6][set css]        uu.div("", "color,red")      -> uu.css(uu.node("div"), { color: "red" })
//  [7][set css]        uu.div("", { color: "red" }) -> uu.css(uu.node("div"), { color: "red" })
//  [8][set event]      uu.div(1) -> uu.node("div") + window.xbuild(uu:Function, node:Node, buildid:Number)

// inner - build node
function buildNode(node,   // @param Node/TagString: <div> or "div"
                   args) { // @param Arguments: [Node/String/Number, ...]
                           // @return Node:
    node.nodeType || (node = uu.node(node)); // "div" -> <div>

    var arg, i = 0, token = 0;

    while ( (arg = args[i++]) ) {
        if (arg) {
            if (arg.nodeType) { // [1][3]
                node.appendChild(arg);
            } else if (uuisnumber(arg)) { // [8]
                win.xbuild(uu, node, arg, uu.nodeid(node));
            } else if (uuisstring(arg) && arg.indexOf(",") < 0) { // [2]
                node.appendChild(doc.createTextNode(arg)); // uu.div("hello")
            } else if (++token < 2) {
                uu.attr(node, uuisstring(arg) ? uusplittohash(arg) : arg); // [4][5]
            } else if (token < 3) {
                uu.css(node, uuisstring(arg) ? uusplittohash(arg) : arg); // [6][7]
            }
        }
    }
    return node;
}

// [1][clear children]      uu.node.clear(<body>)

// uu.node.clear - clear all children
function uunodeclear(context) { // @param Node: parent node
                                // @return Node: context
    var rv = uutag("*", context), v, i = -1;

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

// uu.node.clone - clone node and clone attached events
function uunodeclone(node) { // @param Node:
                             // @return Node: cloned node
    // clone  node["data-uu***"]
    function copyNodeData(sourceNode, clonedNode) {
        var nodeArray = sourceNode.attributes, attr, i = -1;

        while ( (attr = nodeArray[++i]) ) {
            if (!attr.name.indexOf("data-uu")) {
                clonedNode[attr.name] = attr.value;
            }
        }
        uunodeid.db[clonedNode["data-uuguid"] = ++uunodeid.num] = clonedNode;
    }

    function drillDown(sourceNode, clonedNode) {
        var source = sourceNode.firstChild,
            cloned = clonedNode.firstChild;

        copyNodeData(sourceNode, clonedNode);

        for (; source; source = source.nextSibling, cloned = cloned.nextSibling) {
            if (sourceNode.nodeType === 1) {
                copyNodeData(source, cloned);
            }
        }
    }

    var cloneNode = node.cloneNode(true);

    drillDown(node, cloneNode);

    return cloneNode;
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

// uu.node.first - find firstSibling node
function uunodefirst(context,    // @param Node:
                     __last__) { // @hidden Number(= 0):
                                 // @return Node/null: found node or null
    context = context.parentNode;
//{{{!mb
    if (_habits.traversal) {
//}}}!mb
        return __last__ ? context.lastElementChild : context.firstElementChild;
//{{{!mb
    }

    var iter = __last__ ? "previousSibling" : "nextSibling",
        rv = __last__ ? context.lastChild : context.firstChild;

    for (; rv; rv = rv[iter]) {
        if (rv.nodeType === 1) { // 1: ELEMENT_NODE only
            break;
        }
    }
    return rv;
//}}}!mb
}

// uu.node.prev - find previousSibling node
function uunodeprev(context) { // @param Node:
                               // @return Node/null: found node or null
    return uunodenext(context, 1);
}

// uu.node.next - find nextSibling node
function uunodenext(context,    // @param Node:
                    __prev__) { // @hidden Number(= 0):
                                // @return Node/null: found node or null
//{{{!mb
    if (_habits.traversal) {
//}}}!mb
        return __prev__ ? context.previousElementSibling
                        : context.nextElementSibling;
//{{{!mb
    }

    var iter = __prev__ ? "previousSibling" : "nextSibling",
        rv = context[iter];

    for (; rv; rv = rv[iter]) {
        if (rv.nodeType === 1) { // 1: ELEMENT_NODE only
            break;
        }
    }
    return rv;
//}}}!mb
}

// uu.node.last - find lastSibling node
function uunodelast(context) { // @param Node:
                               // @return Node/null: found node or null
    return uunodefirst(context, 1);
}

// uu.node.indexOf - find ELEMENT_NODE index
function uunodeindexof(node,          // @param Node: ELEMENT_NODE
                       __tagName__) { // @hidden String: TagName
                                      // @return Number: 0+ or -1(not found)
    var rv = 0, n = node.parentNode.firstChild;

    for (; n; n = n.nextSibling) {
        __tagName__ ? (n.tagName === __tagName__) && ++rv
                    : (n.nodeType === 1) && ++rv; // 1: ELEMENT_NODE
        if (n === node) {
            return rv - 1;
        }
    }
    return -1;
}

// uu.html
function uuhtml(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <html> node
    return buildNode(doc.html, arguments);
}

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
    return buildNode(doc.head, arguments);
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
    return buildNode(doc.body, arguments);
}

// [1][get text] uu.text(node)         -> text or [text, ...]
// [2][set text] uu.text(node, "text") -> node

// uu.text - node.text / node.innerText accessor
function uutext(node,   // @param Node/String: node or text string
                text) { // @param String(= void):
                        // @return Array/String/Node:
    if (uuisstring(node)) {
        return doc.createTextNode(node);
    }
    if (text === void 0) {
        return node[uu.gecko ? "textContent" : "innerText"];
    }
    uunodeadd(doc.createTextNode(isArray(text) ? text.join("") : text),
              uunodeclear(node));
    return node;
}

// --- query ---
// uu.query - querySelectorAll
function uuquery(expression, // @param String: expression, "css > expr"
                 context) {  // @param NodeArray/Node(= document): query context
                             // @return NodeArray: [Node, ...]
    context = context || doc;

    if (context.querySelectorAll && context.nodeType
        && !uuquery.ngword.test(expression)) { // [:scope] guard
        try {
            return fakeToArray(context.querySelectorAll(expression));
        } catch(err) {} // case: extend pseudo class / operators
    }
    return uu.query.selectorAll(expression, context); // depend: uu.query
}
// uu.query(":a***");
// uu.query(":b***");
// uu.query(":co***");
// uu.query(":digit");
// uu.query(":first-line");
// uu.query(":li***");
// uu.query(":mom");
// uu.query(":ne***");
// uu.query(":p***");
// uu.query(":scope");
// uu.query(":t***");
// uu.query(":v");
// uu.query("E[A!=V]");
// uu.query("E[A/=V]");
// uu.query("E[A<=V]");
// uu.query("E[A>=V]");
// uu.query("E[A&=V]");
// uu.query("E{A:V}");
uuquery.ngword = /(:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=|<=|>=|&=|x7b/;

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
//{{{!mb
    if (!_versions.ie) {
//}}}!mb
        return fakeToArray((context || doc).getElementsByTagName(expression));
//{{{!mb
    }

    var rv = [], ri = -1, v, i = 0, skip = expression === "*",
        nodeList = (context || doc).getElementsByTagName(expression),
        iz = nodeList.length;

    // [IE] getElementsByTagName("*") has comment nodes
    for (; i < iz; ++i) {
        v = nodeList[i];
        if (!skip || v.nodeType === 1) { // 1: ELEMENT_NODE
            rv[++ri] = v;
        }
    }
    return rv;
//}}}!mb
}
uutag.html4 = ("a,b,br,dd,div,dl,dt,h1,h2,h3,h4,h5,h6,i,img,iframe," +
               "input,li,ol,option,p,pre,select,span,table,tbody,tr," +
               "td,th,tfoot,textarea,u,ul").split(","); // exclude <html><head><body>
uutag.html5 = ("abbr,article,aside,audio,bb,canvas,datagrid,datalist," +
               "details,dialog,eventsource,figure,footer,header,hgroup," +
               "mark,menu,meter,nav,output,progress,section,time,video").split(",");

// uu.klass - query className
function uuklass(expression, // @param String: "class", "class1, ..."
                 context) {  // @param Node(= document): query context
                             // @return NodeArray: [Node, ...]
///{{{!mb
    if (doc.getElementsByClassName) {
///}}}!mb
        return fakeToArray((context || doc).getElementsByClassName(expression));
///{{{!mb
    }

    var rv = [], ri = -1, v, i = 0, iz, match, cn, nz, rex,
        name = uusplit(expression), // "class1 class2" -> ["class1", "class2"]
        nodeList = (context || doc).getElementsByTagName("*");

    // Legacy browser route
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
    return rv;
///}}}!mb
}

// --- string ---

// [1][css-prop to js-css-prop] uu.fix("background-color") -> "backgroundColor"
// [2][std-name to ie-name]     uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
// [3][html-attr to js-attr]    uu.fix("for")              -> "htmlFor"
// [4][through]                 uu.fix("-webkit-shadow")   -> "-webkit-shadow"

// uu.fix - fix style property, attribute name
function uufix(source) { // @param String: source
                         // @return String:
    return uufix.db[source] || source;
}
uufix.db = {}; // { "background-color": "backgroundColor", ... }

// uu.trim - trim both side whitespace
function uutrim(source) { // @param String:  "  has  space  "
                          // @return String: "has  space"
    return source.replace(uutrim.trim, "");
}
uutrim.tags     = /<\/?[^>]+>/g; // <div> or </div>
uutrim.trim     = /^\s+|\s+$/g;
uutrim.quotes   = /^\s*["']?|["']?\s*$/g;
uutrim.spaces   = /\s\s+/g;

// uu.trim.tag - trim.inner + strip tags
function uutrimtag(source) { // @param String:  "  <h1>A</h1>  B  <p>C</p>  "
                             // @return String: "A B C"
    return source.replace(uutrim.trim, "").
                  replace(uutrim.tags, "").
                  replace(uutrim.spaces, " ");
}

// uu.trim.url - trim.inner + strip "url(" ... ")" + trim.quote
function uutrimurl(source) { // @param String:   '  url("http://...")  '
                             // @return String:  "http://..."
    return (!source.indexOf("url(") && source.indexOf(")") === source.length - 1) ?
            source.slice(4, -1).replace(uutrim.quotes, "") : source;
}

// uu.trim.inner - trim + diet inside multi spaces
function uutriminner(source) { // @param String:  "  diet  inner  space  "
                               // @return String: "diet inner space"
    return source.replace(uutrim.trim, "").replace(uutrim.spaces, " ");
}

// uu.trim.quote - trim + strip "double" 'single' quote
function uutrimquote(source) { // @param String:  ' "quote string" '
                               // @return String: 'quote string'
    return source.replace(uutrim.quotes, "");
}

// uu.trim.bracket - trim + strip brackets () [] {} <>
function uutrimbracket(source) { // @param String:  " <bracket>  (this)  [and]  {this} "
                                 // @return String: "bracket this and this"
    return source.replace(uutrimbracket.brackets, "");
}
uutrimbracket.brackets = /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g; // [br](ac){ke}<ts>

// uu.split - split space
function uusplit(source) { // @param String: " split  space  token "
                           // @return Array: ["split", "space", "token"]
    return source.replace(uutrim.spaces, " ").
                  replace(uutrim.trim, "").split(" ");
}
uusplit.commas     = /,,+/g; // many commas
uusplit.trimCommas = /^[ ,]+|[ ,]+$/g; // trim space and comma

// uu.split.comma - split commas
function uusplitcomma(source) { // @param String: ",,, ,,A,,,B,C,, "
                                // @return Array: ["A", "B", "C"]
    return source.replace(uusplit.commas, ",").
                  replace(uusplit.trimCommas, "").split(",");
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

// uu.entity - encode String to HTML Entity
function uuentity(str) { // @param String:
                         // @return String:
    return str.replace(_entity.to, _entity);
}

// uu.entity.decode - decode String from HTML Entity
function uuentitydecode(str) { // @param String:
                               // @return String:
    return str.replace(_entity.from, _entity);
}

// inner - to/from entity
function _entity(code) {
    return _entity.hash[code];
}
uumix(_entity, {
    to:     /[&<>"]/g,
    from:   /&(?:amp|lt|gt|quot);/g,
    hash:   uusplittohash('&,&amp;,<,&lt;,>,&gt;,",&quot;,&amp;,&,&lt;,<,&gt;,>,&quot;,"')
});

// [1][placeholder]             uu.format("? dogs and ?", 101, "cats") -> "101 dogs and cats"

// uu.format - placeholder( "?" ) replacement
function uuformat(format) { // @param String: formatted string with "?" placeholder
                            // @return String: "formatted string"
    var i = 0, args = arguments;

    return format.replace(uuformat.q, function() {
        return args[++i];
    });
}
uuformat.q = /\?/g;

// --- debug ---
// uu.puff - uu.puff(mix) -> alert( uu.json(mix) )
function uupuff(source) { // @param Mix: source object
    alert(_jsoninspect(source));
}

// <div id="xtrace">msg<div>
// [1][dump] uu.trace(source) -> <p>source</p>

// uu.trace - add trace
function uutrace(source) { // @param Mix(= void): source (with title)
    var output = uuid(uu.config.trace), json;

    if (output) {
        json = _fromUnicode(_jsoninspect(source));

        if (output.tagName.toLowerCase() === "textarea") {
            output.value += title + json;
        } else {
            output.innerHTML += "<p>" + json + "</p>";
        }
    }
}

// uu.trace.clear - clear
function uutraceclear() {
    var output = uuid(uu.config.trace);

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
                callback) {    // @param Function(= void): error callback
                               // @return JSONString:
    return useNativeJSON && win.JSON ? win.JSON.stringify(source) || ""
                                     : _jsoninspect(source, callback, 1);
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
    return uujsondecode.ngword.test(str.replace(uujsondecode.unescape, ""))
                ? false : uuevaljs("return " + str + ";");
}
uujsondecode.ngword = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/;
uujsondecode.unescape = /"(\\.|[^"\\])*"/g;

// inner - convert string to JSON formatted string
function _str2json(str,        // @param String:
                   addQuote) { // @param Boolean(= false): true is add quote(")
                               // @return String: '\u0000' or '"\u0000"'
    var rv = str.replace(_str2json.escape, function(m) {
                return _str2json.swap[m];
            }).replace(_str2json.encode, function(str, c) {
                // String("AB") to UnicodeString("\u0041\u0042")
                c = str.charCodeAt(0);
                return "\\u" + uuhash.num2hh[(c >> 8) & 255]
                             + uuhash.num2hh[c & 255];
            });

    return addQuote ? '"' + rv + '"' : rv;
}
_str2json.swap = uusplittohash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\');
_str2json.escape = /(?:\"|\\[bfnrt\\])/g; // escape
_str2json.encode = /[\x00-\x1F\u0080-\uFFEE]/g;

// inner - UnicodeString("\u0041\u0042") to String("AB")
function _fromUnicode(str) { // @param String: "\u0041\u0042"
                             // @return String: "AB"
    return str.replace(_fromUnicode.uffff, function(m, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}
_fromUnicode.uffff = /\\u([0-9a-f]{4})/g; // \u0000 ~ \uffff

// inner - json inspect
function _jsoninspect(mix, callback) {
    var ary, type = uutype(mix), w, ai = -1, i, iz;

    if (mix === win) {
        return '"window"'; // window -> String("window")
    }

    switch (type) {
    case uutype.HASH:   ary = []; break;
    case uutype.NODE:   return '"uuguid":' + uunodeid(mix);
    case uutype.NULL:   return "null";
    case uutype.VOID:   return "undefined";
    case uutype.DATE:   return uudate(mix).ISO();
    case uutype.BOOLEAN:
    case uutype.FUNCTION:
    case uutype.NUMBER: return mix.toString();
    case uutype.STRING: return _str2json(mix, 1);
    case uutype.ARRAY:
    case uutype.FAKEARRAY:
        for (ary = [], i = 0, iz = mix.length; i < iz; ++i) {
            ary[++ai] = _jsoninspect(mix[i], callback);
        }
        return "[" + ary + "]";
    default:
        return callback ? (callback(mix) || "") : "";
    }
    if (toString.call(type).slice(-3) === "on]") { // [object CSSStyleDeclaration]
        w = uu.webkit;
        for (i in mix) {
            if (typeof mix[i] === "string" && (w || i != (+i + ""))) { // !isNaN(i)
                w && (i = mix.item(i));
                ary[++ai] = '"' + i + '":' + _str2json(mix[i], 1);
            }
        }
    } else { // type === uutype.HASH
        for (i in mix) {
            ary[++ai] = _str2json(i, 1) + ":"
                      + _jsoninspect(mix[i], callback);
        }
    }
    return "{" + ary + "}";
}

// --- date ---
// [1][get now]                 uu.date() -> DateHash
// [2][DateHash]                uu.date(DateHash) -> cloned DateHash
// [2][date to hash]            uu.date(Date) -> DateHash
// [3][time to hash]            uu.date(milliseconds) -> DateHash
// [4][DateString to hash]      uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
// [5][ISO8601String to hash]   uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
// [6][RFC1123String to hash]   uu.date("Wed, 16 Sep 2009 16:18:14 GMT") -> DateHash

// uu.date - date accessor
function uudate(source) { // @param DateHash/Date/Number/String(= void):
                          // @return DateHash:
    return source === void 0           ? _date2hash(new Date())       // [1] uu.date()
         : uutype(source, uutype.DATE) ? _date2hash(source)           // [3] uu.date(new Date())
         : uuisnumber(source)          ? _date2hash(new Date(source)) // [4] uu.date(1234567)
         : source.GMT                  ? uuclone(source)              // [2] uu.date(DateHash)
         : _date2hash(_str2date(source) || new Date(source));         // [5][6][7]
}

// inner - convert Date to DateHash
function _date2hash(date) { // @param Date:
                            // @return Hash: { Y: 2010, M: 12, D: 31,
                            //                 h: 23, m: 59, s: 59, ms: 999,
                            //                 time: xxxxxxx, ISO, RFC, GMT }
    return {
        Y:      date.getUTCFullYear(),      M:      date.getUTCMonth() + 1,
        D:      date.getUTCDate(),          h:      date.getUTCHours(),
        m:      date.getUTCMinutes(),       s:      date.getUTCSeconds(),
        ms:     date.getUTCMilliseconds(),  time:   date.getTime(),
        ISO:    datehashiso,
        RFC:    datehashrfc,
        GMT:    datehashrfc
    };
}

// "2000-01-01T00:00:00[.000]Z"    -> Date
// "Wed, 16 Sep 2009 16:18:14 GMT" -> Date

// inner - DateString to Date
function _str2date(str) { // @param ISO8601DateString/RFC1123DateString:
                          // @return Date:
    function _toDate(_, dayOfWeek, day, month) {
        return dayOfWeek + " " + month + " " + day;
    }

    var m = _str2date.parse.exec(str);

    if (m) {
        return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3],      // yyyy-mm-dd
                                 +m[4], +m[5], +m[6], +m[7])); // hh:mm:ss.ms
    }
//{{{!mb
    if (uu.ie && str.indexOf("GMT") > 0) {
        str = str.replace(/GMT/, "UTC");
    }
//}}}!mb
    return new Date(str.replace(",", "").
                        replace(_str2date.date, _toDate));
}
_str2date.parse = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/;
_str2date.date = /^([\w]+) (\w+) (\w+)/;

// DateHash.ISO - encode DateHash To ISO8601String
function datehashiso() { // @return ISO8601DateString: "2000-01-01T00:00:00.000Z"
    var padZero = (this.ms < 10) ? "00" : (this.ms < 100) ? "0" : "",
        dd = uuhash.num2dd;

    return uuformat("?-?-?T?:?:?.?Z", this.Y, dd[this.M], dd[this.D],
                                      dd[this.h], dd[this.m], dd[this.s],
                                      padZero + this.ms);
}

// DateHash.RFC - encode DateHash To RFC1123String
function datehashrfc() { // @return RFC1123DateString: "Wed, 16 Sep 2009 16:18:14 GMT"
    var rv = (new Date(this.time)).toUTCString();

///{{{!mb
    if (uu.ie && rv.indexOf("UTC") > 0) {
        // http://d.hatena.ne.jp/uupaa/20080515
        rv = rv.replace(/UTC/, "GMT");
        (rv.length < 29) && (rv = rv.replace(/, /, ", 0")); // [IE] fix format
    }
///}}}!mb
    return rv;
}

// --- other ---
// uu.evaljs - JavaScript Expression
function uuevaljs(javascriptExpression) { // @param String:
                                          // @return Mix: new Function(expression) result
    return (new Function(javascriptExpression))();
}

// uu.page.size
function uupagesize() { // @return Hash: { innerWidth, innerHeight,
                        //                 pageXOffset, pageYOffset }
                        //   innerWidth  - Number:
                        //   innerHeight - Number:
                        //   pageXOffset - Number:
                        //   pageYOffset - Number:
//{{{!mb
    if (uu.ie) {
        var iebody = doc.html;

        return { innerWidth:  iebody.clientWidth,
                 innerHeight: iebody.clientHeight,
                 pageXOffset: iebody.scrollLeft,
                 pageYOffset: iebody.scrollTop };
    }
//}}}!mb
    return win; // [WebKit][ALIAS] window.pageXOffset = document.body.scrollLeft
}

// uu.guid - get unique number
function uuguid() { // @return Number: unique number, from 1
    return ++uuguid.num;
}
uuguid.num = 0; // guid counter

// uu.lazy - lazy evaluate
function uulazy(id,        // @param String: id
                evaluator, // @param Function: callback function
                order) {   // @param Number(= 0): 0=low, 1=mid, 2=high(system)
    uulazy.db[id] || (uulazy.db[id] = [[], [], []]);
    uulazy.db[id][order || 0].push(evaluator);
}
uulazy.db = {}; // { id: [[low], [mid], [high]], ... } job db

// uu.lazy.fire
function uulazyfire(id) { // @param String: lazy id
    if (uulazy.db[id]) {
        var fn, i = -1, db = uulazy.db[id],
            ary = db[2].concat(db[1], db[0]); // join

        // pre clear
        uulazy.db[id] = null;

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
                    that) {    // @param this(= void): evaluator this
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
                   that) {    // @param this(= void): evaluator this
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
                      that) {    // @param this(= void): evaluator this
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
                  that) {    // @param this(= void): evaluator this
                             // @return Array: [element, ... ]
    for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
        i in this && (rv[i] = evaluator.call(that, this[i], i, this));
    }
    return rv;
}

// Array.prototype.filter
function arrayfilter(evaluator, // @param Function: evaluator
                     that) {    // @param this(= void): evaluator this
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
                     initialValue) { // @param Mix(= void): initial value
                                     // @return Mix:
    var z, f = 0, rv = initialValue === z ? z : (++f, initialValue),
        i = 0, iz = this.length;

    for (; i < iz; ++i) {
        i in this && (rv = f ? evaluator(rv, this[i], i, this) : (++f, this[i]));
    }
    if (!f) {
        throw new Error(arrayreduce.msg);
    }
    return rv;
}
arrayreduce.msg = "reduce of empty array with no initial value";

// Array.prototype.reduceRight
function arrayreduceright(evaluator,      // @param Function: evaluator
                          initialValue) { // @param Mix(= void): initial value
                                          // @return Mix:
    var z, f = 0, rv = initialValue === z ? z : (++f, initialValue),
        i = this.length;

    while (--i >= 0) {
        i in this && (rv = f ? evaluator(rv, this[i], i, this) : (++f, this[i]));
    }
    if (!f) {
        throw new Error(arrayreduce.msg);
    }
    return rv;
}

// Date.prototype.toISOString - to ISO8601 string
function datetoisostring() { // @return String:
    return uudate(this).ISO();
}

// Number.prototype.toJSON, Boolean.prototype.toJSON
function numbertojson() { // @return String: "123", "true", "false"
    return this.toString();
}

// String.prototype.trim
function stringtrim() { // @return String: "has  space"
    return this.replace(uutrim.trim, "");
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
    var rv, that = this, p = that.parentNode,
        r = doc.createRange(), div = doc.createElement("div");

    p || doc.body.appendChild(that); // orphan
    r.selectNode(that);
    div.appendChild(r.cloneContents());
    rv = div.innerHTML;
    p || that.parentNode.removeChild(that);
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

// inner - build DOM Lv2 event handler - uu.click(), ...
("mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown,keypress,keyup," +
 "change,submit,focus,blur,contextmenu").split(",").forEach(function(eventType) {

    uu[eventType] = function(node, fn) { // uu.click(node, fn) -> node
        return uuevent(node, eventType, fn); // attach
    };

    uu["un" + eventType] = function(node) { // uu.unclick(node) -> node
        return uuevent(node, eventType, 0, true); // detach
    };
});

// inner - setup node builder - uu.div(), uu.a(), ...
uutag.html4.forEach(function(tagName) {
    // skip "img", "canvas"
    if (tagName === "img" || tagName === "canvas") {
        return;
    }

    uu[tagName] = function() { // @param Mix: var_args
        return buildNode(tagName, arguments);
    };
});

uutag.html5.forEach(function(tagName) {
//{{{!mb
    uu.ver.ie678 && doc.createElement(tagName); // [IE]
//}}}!mb

    uu[tagName] = function() { // @param Mix: var_args
        return buildNode(tagName, arguments);
    };
});

//{{{!mb
try {
    // Internet Explorer 6 flicker fix
    uu.ver.ie6 && doc.execCommand("BackgroundImageCache", false, true);
} catch(err) {} // ignore error(IETester / stand alone IE too)
//}}}!mb

// --- window.onload handler ---
function _windowonload() {
    uu.state.WindowReady = true;
    _DOMContentLoaded();
    win.xwin && win.xwin(uu); // window.xwin(uu) callback
    uulazyfire("canvas");
    uulazyfire("audio");
    uulazyfire("video");

}
uueventattach(win, "load", _windowonload);

// --- DOMContentLoaded handler ---
function _DOMContentLoaded() {
    if (!uu.state.Blackout && !uu.state.DOMReady) {
        uu.state.DOMReady = true;

        uulazyfire("boot");
        win.xboot && win.xboot(uu); // window.xboot(uu) callback
    }
}
//{{{!mb
// inner - hook DOMContentLoaded for [IE6][IE7][IE8]
function _IEDOMContentLoaded() {
    try {
        // trick -> http://d.hatena.ne.jp/uupaa/20100410/1270882150
        new Image.doScroll();
        _DOMContentLoaded();
    } catch(err) {
        setTimeout(_IEDOMContentLoaded, 64);
    }
}
uu.ver.ie678 ? _IEDOMContentLoaded() :
//}}}!mb
    uueventattach(doc, "DOMContentLoaded", _DOMContentLoaded);

// --- finalize ---
//{{{!mb

// inner - [IE] fix mem leak
function _windowonunload() {
    var nodeid, node, ary, i, v;

    for (nodeid in uunodeid.db) {
        try {
            node = uunodeid.db[nodeid];
            ary = node.attributes, i = -1;
            while ( (v = ary[++i]) ) {
                !v.name.indexOf("data-uu") && (node[v.name] = null);
            }
        } catch (err) {}
    }
    doc.html = doc.head = null;
    win.detachEvent("onload", _windowonload);
    win.detachEvent("onunload", _windowonunload);
}
uu.ie && win.attachEvent("onunload", _windowonunload);
//}}}!mb

// inner -
// 1. prebuild camelized hash - http://handsout.jp/slide/1894
// 2. prebuild nodeid
uuready(function() {
    var nodeList = uutag("*", doc.html), v, i = -1,
        styles = uusplittohash((uu.ie ? "float,styleFloat,cssFloat,styleFloat"
                                      : "float,cssFloat,styleFloat,cssFloat") +
                ",pos,position,w,width,h,height,x,left,y,top,o,opacity," +
                "bg,background,bgcolor,backgroundColor,bgimg,backgroundImage," +
                "bgrpt,backgroundRepeat,bgpos,backgroundPosition");

    uumix(_camelhash(uufix.db, uu.webkit ? win.getComputedStyle(doc.html, null)
                                         : doc.html.style), styles, uuattr.fix);
    uunodeid(doc.html);
    while ( (v = nodeList[++i]) ) {
        uunodeid(v);
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
//{{{!mb
                     (uu.ie    && !k.indexOf("ms"))  ? "-ms"  + k.slice(2) :
//}}}!mb
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
function _makeMapping(seed,  // @param String: "0123456789" or "0123456789abcdef"
                      s2n,   // @param Hash: String to Number
                      n2s) { // @param Hash: Number to String
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
function detectVersions(libraryVersion) { // @param Number: Library version
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

//{{{!mb
    // detect FlashPlayer version
    function detectFlashPlayerVersion(ie, minimumVersion) {
        var rv = 0, ver, m;

        try {
            ver = ie ? (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")).
                            GetVariable("$version").replace(/,/g, ".")
                     : navigator.plugins["Shockwave Flash"].description;
            m = /\d+\.\d+/.exec(ver);
            rv = m ? parseFloat(m[0]) : 0;
        } catch(err) {}
        return rv < minimumVersion ? 0 : rv;
    }

    // detect Silverlight version
    function detectSilverlightVersion(ie, minimumVersion) {
        var rv = 0, obj, check = minimumVersion;

        try {
            obj = ie ? new ActiveXObject("AgControl.AgControl")
                     : navigator.plugins["Silverlight Plug-In"];
            if (ie) {
                while (obj.IsVersionSupported(check + ".0")) { // "3.0" -> "4.0" -> ...
                    rv = check++;
                }
            } else {
                rv = parseInt(/\d+\.\d+/.exec(obj.description)[0]);
            }
        } catch(err) {}
        return rv < minimumVersion ? 0 : rv;
    }
//}}}!mb

    var rv = { library: libraryVersion, flash: 0, silverlight: 0 },
        ie = !!doc.uniqueID, userAgent = navigator.userAgent;

    rv.render       = detectRenderingEngineVersion(userAgent);
    rv.browser      = detectUserAgentVersion(userAgent);
    rv.ie           = ie;
    rv.ie6          = ie && rv.browser === 6;
    rv.ie7          = ie && rv.browser === 7;
    rv.ie8          = ie && doc.documentMode === 8;
    rv.ie9          = ie && doc.documentMode === 9;
    rv.ie67         = rv.ie6 || rv.ie7;
    rv.ie678        = rv.ie6 || rv.ie7 || rv.ie8;
    rv.ie89         = rv.ie8 || rv.ie9;
    rv.opera        = !!(window.opera || 0);
    rv.gecko        = /Gecko\//.test(userAgent);
    rv.webkit       = /WebKit/.test(userAgent);
    rv.chrome       = /Chrome/.test(userAgent);
    rv.safari       = !rv.chrome && /Safari/.test(userAgent);
    rv.iphone       = /iPad|iPod|iPhone/.test(userAgent);
    rv.android      = /Android/.test(userAgent);
    rv.mobile       = rv.iphone || rv.android || /Opera Mini/.test(userAgent);
    rv.os           = /Win/.test(userAgent) ? "windows"
                    : /Mac/.test(userAgent) ? "mac"
                    : /X11|Linux/.test(userAgent) ? "unix" : "unknown";
    rv.jit          = (ie        && rv.browser >= 9)   || // IE 9+
                      (rv.gecko  && rv.render  >  1.9) || // Firefox 3.5+(1.91)
                      (rv.webkit && rv.render  >= 528) || // Safari 4+, Google Chrome 2+
                      (rv.opera  && rv.browser >= 10.5);  // Opera10.50+
///{{{!mb
    rv.flash        = detectFlashPlayerVersion(ie, 9); // FlashPlayer 9+
    rv.silverlight  = detectSilverlightVersion(ie, 3); // Silverlight 3+
///}}}!mb
    return rv;
}

//{{{!mb
function fakeToArray(fakeArray) { // @param FakeArray: NodeList, Arguments
                                  // @return Array:
    if (_habits.slice) {
        return Array.prototype.slice.call(fakeArray);
    }

    var rv = [], i = 0, iz = fakeArray.length;

    for (; i < iz; ++i) {
        rv[i] = fakeArray[i];
    }
    return rv;
}
//}}}!mb

function detectHabits() {
    var o = true, x = false, rv = { slice: o, indexer: o, traversal: o };

//{{{!mb
    // Array.prototype.slice.call(NodeList) ready?
    try {
        Array.prototype.slice.call(doc.getElementsByTagName("head"));
    } catch(err) { rv.slice = x; }

    // String[indexer] ready ?
    rv.indexer = !!"0"[0];

    // Element Traversal ready ? - http://www.w3.org/TR/ElementTraversal/
    rv.traversal = !!doc.documentElement.firstElementChild;
//}}}!mb

    return rv;
}

})(window, document, Object.prototype.toString, Array.isArray,
   window.getComputedStyle);

