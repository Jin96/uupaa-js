
// === Core ===

// * WebKit based Cording-Style ( doc/cording-style.txt )
//
// * User configrations ( doc/user-configrations.txt )
//
//  - uu.config = { aria, debug, right, altcss, storage, visited }
//
// * User callback functions ( doc/user-callback-functions.txt )
//
//  - window.xboot(uu:Function)
//  - window.xwin(uu:Function)
//  - window.xcanvas(uu:Function, canvasNodeArray:NodeArray)
//  - window.xstorage(uu:Function, storage:StorageObject)
//
// * Predefined types ( doc/predefined-types.txt )
//
//  - ColorHash, RGBAHash, HSLAHash, HSVAHash, W3CNamedColor
//  - EventObjectEx, DateHash, AjaxOptionHash, AjaxResultHash
//  - JSONPOptionHash, FlashOptionHash
//
// * Version and plugin detection ( doc/version-detection.txt )
//
//  - uu.ver = { library, browser, render, silverlight, flash, as3,
//               ie, ie6, ie7, ie8, ie9, ie67, ie678, ie89,
//               opera, gecko, webkit, chrome, safari, iphone,
//               quirks, xml, win, mac, unix, advanced, major, jit }

var uu; // window.uu - uupaa.js library namespace

uu || (function(win, doc) {

// --- LIBRARY STRUCTURE ---
uu = uumix(uufactory, {             // uu(expression:Jam/Node/NodeArray/String/window, arg1:Jam/Node/Mix = void, arg2:Mix = void, arg3:Mix = void, arg4:Mix = void):Jam/Instance
                                    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Clas.MyClass(arg1, arg2)
                                    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> Jam
    ver:            _version(0.7),  // uu.ver - Hash: detected version and plugin informations
    plugin:         uuplugin,       // uu.plugin():Array
    require:        uurequire,      // uu.require(url:String):AjaxResultHash
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
        REGEXP:     0x800,          // uu.type.REGEXP       - RegExp
        CSS:        0x1000          // uu.type.CSS          - CSSProperties (getComputedStyle result)
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
        has:        uuhas,          //     uu.hash.has(source:Hash, search:Array):Boolean
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
    attr:     uumix(uuattr, {       // uu.attr(node:Node, key:Hash/String, value:String = void):String/Hash/Node
                                    //  [1][get one  attr ] uu.attr(node, "attr") -> "value"
                                    //  [2][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
                                    //  [3][set one  attr ] uu.attr(node, "attr", "val") -> node
                                    //  [4][set some attrs] uu.attr(node, { attr: "val" }) -> node
        get:        uuattrget,      // uu.attr.get(node:Node, attrs:String):String/Hash
                                    //  [1][get one  attr ] uu.attr.get(node, "attr") -> String
                                    //  [2][get some attrs] uu.attr.get(node, "attr,...") -> Hash
        set:        uuattrset,      // uu.attr.set(node:Node, key:String/Hash, value:String = void):Node
                                    //  [1][set one  attr ] uu.attr.set(node, key, val ) -> node
                                    //  [2][set some attrs] uu.attr.set(node, { key: val, ... }) -> node
        getAll:     uuattrgetall    // uu.attr.getAll(node:Node, filter:Boolean = false):Hash
                                    //  [1][get all]        uu.attr(node) -> { all: attrs }
                                    //  [2][use filter]     uu.attr(node, true) -> { many: attrs }
    }),
    // --- CSS ---
    css:      uumix(uucss, {        // uu.css(node:Node, key:Hash/String, value:String = void):String/Hash/Node
                                    //  [1][get one  style ] uu.css(node, "color") -> "red"
                                    //  [2][get some styles] uu.css(node, "color,width") -> { color: "red", width: "20px" }
                                    //  [3][set one  style ] uu.css(node, "color", "red") -> node
                                    //  [4][set some styles] uu.css(node, { color: "red" }) -> node
        get:        uucssget,       // uu.css.get(node:Node, styles:String):String/Hash
                                    //  [1][get one  style ] uu.css.get(node, "color") -> "red"
                                    //  [2][get some styles] uu.css.get(node, "color,text-align") -> {color:"red", textAlign:"left"}
        set:        uucssset,       // uu.css.set(node:Node, key:String/Hash, value:String = void):Node
                                    //  [1][set one  style ] uu.css.set(node, "color", "red") -> node
                                    //  [2][set some styles] uu.css.set(node, { color: "red" }) -> node
        opacity:
              uumix(uucssopacity, { // uu.css.opacity(node:Node, opacity:Number = void, isRelativeValue:Boolean = false):Number/node
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
    // --- QUERY ---
    id:             uuid,           //    uu.id(expression:String, context:Node = document):Node/null
    tag:            uutag,          //   uu.tag(expression:String, context:Node = document):NodeArray
    query:          uuquery,        // uu.query(expression:String, context:NodeArray/Node = document):NodeArray
    // --- Node.className ---
    klass:    uumix(uuklass, {      // uu.klass(expression:String, context:Node = document):NodeArray
        has:        uuklasshas,     //    uu.klass.has(node:Node, classNames:String):Boolean
        add:        uuklassadd,     //    uu.klass.add(node:Node, classNames:String):Node
        sub:        uuklasssub,     //    uu.klass.sub(node:Node, classNames:String):Node
        toggle:     uuklasstoggle   // uu.klass.toggle(node:Node, classNames:String):Node
    }),
    // --- OOP ---
    Class:    uumix(uuclass, {      // uu.Class(className:String, proto:Hash = void)
                                    //  [1][base]    uu.Class("A",   { proto: ... })
                                    //  [2][inherit] uu.Class("B:A", { proto: ... })
        guid:       uuclassguid,    // uu.Class.guid():Number
        singleton:  uuclasssingleton// uu.Class.singleton(className:String, proto:Hash = void)
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
        root:       doc.documentElement || doc.html,
                                    // root node, documentElement or <html>(in IE quirks)
        bulk:       uunodebulk,     // uu.node.bulk(source:Node/HTMLFragment, context:Node/TagString = "div"):DocumentFragment
        swap:       uunodeswap,     // uu.node.swap(swapin:Node, swapout:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        build:      uunodebuild,    // uu.node.build(node:Node/String, args:Mix):Node
                                    //  [1][add node]           uu.div(uu.div())
                                    //  [2][add text node]      uu.div("hello")
                                    //  [3][add text node]      uu.div(uu.text("hello"))
                                    //  [4][id callback]        uu.div("@buildid") - window.xnode(uu, <div>, {{"buildid"}}, nodeid)
                                    //  [5][number callback]    uu.div(1)          - window.xnode(uu, <div>, {{1}}, nodeid)
                                    //  [6][set attr by string] uu.div("title,hello")      - first String is uu.attr("title,hello")
                                    //  [7][set attr by hash]   uu.div({ title: "hello" }) - first Hash is uu.attr({ title: "hello" })
                                    //  [8][set css by string]  uu.div("", "color,red")      - second String is uu.css("color,red")
                                    //  [9][set css by hash]    uu.div("", { color: "red" }) - second Hash is uu.css({ color: "red" })
        clear:      uunodeclear,    // uu.node.clear(context:Node):Node
        clone:      uunodebulk,     // [alias]
        remove:     uunoderemove    // uu.node.remove(node:Node):Node
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
    format:         uuformat,       // uu.format(format:String, var_args, ...):String
                                    // [1][placeholder] uu.format("? dogs and ?", 101, "cats") -> "101 dogs and cats"
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
        clear:      uutraceclear    // uu.trace.clear()
    }),
    // --- READY EVENT ---
    ready:    uumix(uuready, {      // uu.ready(evaluator:Function = void, order:Number = 0)
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
    // --- LAZY EVALUATION ---
    lazy:     uumix(uulazy, {       // uu.lazy(id:String, evaluator:Function, order:Number = 0)
        fire:       uulazyfire      // uu.lazy.fire(id:String)
    }),
    // --- OTHER ---
    js:             uujs,           // uu.js(javascriptExpression:String):Mix
    win: {
        size:       uuwinsize       // uu.win.size():Hash { innerWidth, innerHeight, pageXOffset, pageYOffset }
    },
    nop:            function() {},  // uu.nop()
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    guid:           uuguid          // uu.guid():Number
});

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
Array.isArray || (Array.isArray = uuisarray);

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
    aria:       false,
    debug:      false,
    right:      false,
    altcss:     0,
    storage:    0,
    visited:    false,
    baseDir:    uutag("script").pop().src.replace(/[^\/]+$/, "")
});

doc.html || (doc.html = uutag("html")[0]); // document.html = <html>
doc.head || (doc.head = uutag("head")[0]); // document.head = <head>

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
        xhr = win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
              win.XMLHttpRequest ? new XMLHttpRequest() : 0;

        xhr.open("GET", url, false); // sync
        xhr.send(null);
        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
            ok = true;
            status = xhr.status || 200;
        }
    } catch (err) {
        xhr = xhr || { responseText: "", responseXML: "", status: 400 };
    }
    return {
        ok:     ok,
        url:    url,
        xhr:    xhr,
        guid:   uuguid(),
        status: status,
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
    case uutype.DATE:       return uudate(lhs).ISO() ===
                                   uudate(rhs).ISO();
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
    "undefined":        uutype.VOID,
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
                value) { // @param Mix(= void): value
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
function uunth(source,  // @param Hash/Array: source
               index) { // @param Number: index
                        // @return Array: [key, value]
                        //                or [void, void] (not found)
    var i, j = 0;

    if (Array.isArray(source)) {
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
                value) { // @param String(= void): value
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
                   value) { // @param String(= void): value
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
               value) { // @param String(= void): value
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
                  value) { // @param String(= void):
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
                      opacity,           // @param Number(= void): opacity 0.0 - 1.0
                      isRelativeValue) { // @param Boolean(= false): true is relative value
                                         // @return Number/Node:
    return (opacity === void 0 ? uucssopacityget
                               : uucssopacityset)(node, opacity, isRelativeValue);
}

// uu.css.opacity.get - get opacity value(from 0.0 to 1.0)
function uucssopacityget(node) { // @param Node:
                                 // @return Number: float(from 0.0 to 1.0)
    if (uu.ie) {
        var v = node.uucssopacity; // void or 1.0 ~ 2.0

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

// --- oop ---
// uu.Class - create a generic class
function uuclass(className, // @param String: "Class"
                            //             or "Class:SuperClass"
                            //             or "Class<SuperClass"
                 proto) {   // @param Hash(= void): prototype object
    // http://d.hatena.ne.jp/uupaa/20100129
    var ary = className.split(/\s*[\x3a-\x40]\s*/), tmp, i,
        Class = ary[0], Super = ary[1] || "";

    uuclass[Class] = function uuClass() {
        var that = this,
            Super = that.superClass || 0,
            SuperSuper = Super ? Super.superClass : 0;

        // register MessagePump
        uuclassguid(that);
        that.msgbox || (that.msgbox = uu.nop);
        uu.msg.register(that);

        // constructor(order: SuperSuper -> Super -> that)
        if (SuperSuper && SuperSuper.init) {
            SuperSuper.init.apply(that, arguments);
        }
        if (Super && Super.init) {
            Super.init.apply(that, arguments);
        }
        if (that.init) {
            that.init.apply(that, arguments);
        }

        // setup destructor(order: ~that -> ~Super -> ~SuperSuper)
        that["~fin"] = that.fin || uu.nop;
        if (that.fin) {
            uu.event.attach(win, "unload", function() {
                that.fin && that.fin();
            });
        }
        that.fin = function wrapper() {
            that["~fin"]();
            Super && Super.fin && Super.fin.call(that);
            SuperSuper && SuperSuper.fin && SuperSuper.fin.call(that);

            // destroy them all
            for (var i in that) {
                that[i] = null;
            }
        };
    };
    uuclass[Class].prototype = proto || {};

    if (Super) { // [2]
        tmp = function() {};
        tmp.prototype = uu.Class[Super].prototype;
        uuclass[Class].prototype = new tmp;

        for (i in proto) {
            uuclass[Class].prototype[i] = proto[i];
        }
        uuclass[Class].prototype.constructor = uuclass[Class];
        uuclass[Class].prototype.superClass = uu.Class[Super].prototype;
        uuclass[Class].prototype.superMethod = superMethod;
    }

    // call superClass method
    function superMethod(from,             // @param Function: caller
                         method            // @param String: method name
                         /* var_args */) { // @param Mix: args
        var obj = this.superClass;

        // recurtion guard
        if (from === obj[method] || superMethod.caller === obj[method]) {
            obj = obj.superClass;
        }
        return obj[method].apply(this, uu.array(arguments).slice(2));
    }
}

// uu.Class.guid - get instance id
function uuclassguid(instance) { // @param Instance:
                                 // @return Number: instance id, from 1
    return instance.uuguid || (instance.uuguid = uu.guid());
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(className, // @param String: class name
                          proto) {   // @param Hash(= void): prototype object
                                     // @return Object: singleton class instance
    uuclass[className] = function() {
        var that = this, arg = arguments, self = arg.callee;

        if (self.instance) {
            that.stable && that.stable.apply(that, arg); // after the second
        } else {
            uuclassguid(that);
            that.init && that.init.apply(that, arg);
            that.fin  && uu.event.attach(win, "unload", function() {
                that.fin();
            });
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
    this._addressMap = {}; // AddressMap { guid: instance, ... }
    this._broadcast = [];  // Broadcast AddressMap [guid, ...]
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
        ary = address ? uu.array(address) : this._broadcast;

    while ( (to = ary[++i]) ) {
        obj = this._addressMap[to.uuguid || to || 0];
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
        that.send(address ? uu.array(address) : that._broadcast, message, param);
    }, 0);
}

// MessagePump.register - register the destination of the message
function uumsgregister(instance) { // @param Instance: class instance
    this._addressMap[uuclassguid(instance)] = instance;
    this._broadcast = uu.keys(this._addressMap);
}

// MessagePump.unregister
function uumsgunregister(instance) { // @param Instance: class instance
    delete this.db[uuclassguid(instance)];
    this._broadcast = uu.keys(this._addressMap);
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

    // --- setup event database ---
    if (!("uuEventTypeExString" in node)) {
        node.uuEventTypeExString  = ",";
        node.uuEventEvaluatorHash = {};
    }

    var eventTypeExArray = eventTypeEx.split(","),
        ex, token,
        bound,
        evaluatorArray,
        ns, eventType, capture, closure, handler, i = -1, pos,
        isInstance = false, EVENT_CODE = uuevent._CODE; // for closure

    if (unbind) {
        closure = evaluator.uueventclosure || evaluator;
    } else {
        handler = uuisfunction(evaluator)
                ? evaluator
                : (isInstance = true, evaluator.handleEvent);
        closure = evaluator.uueventclosure = _uueventclosure;
    }

    while ( (ex = eventTypeExArray[++i]) ) { // ex = "namespace.click+"

        // split token
        //      "namespace.click+"
        //              v
        //      ["namespace.click+", "namespace", "click", "+"]
        token = uuevent._PARSE.exec(ex);
        ns        = token[1]; // "namespace"
        eventType = token[2]; // "click"
        capture   = token[3]; // "+"

        // IE mouse capture
        if (uu.ie678) {
            if (capture && eventType === "mousemove") {
                uuevent(node, "losecapture", closure, unbind);
            }
        }

        bound = node.uuEventTypeExString.indexOf("," + ex + ",") >= 0;

        // IE mouse capture
        if (uu.ie678) {
            if (eventType === "losecapture") {
                if (node.setCapture) {
                    bound ? node.setCapture()
                          : node.releaseCapture();
                }
            }
        }

        if (unbind) {
            if (bound) {
                evaluatorArray = node.uuEventEvaluatorHash[ex];

                pos = evaluatorArray.indexOf(ex);
                if (pos >= 0) {
                    evaluatorArray.splice(pos, 1); // remove evaluator
                    if (!evaluatorArray.length) {
                        // ",dblclick," <- ",namespace.click+,dblclick,".replace(",namespace.click+,", ",")
                        node.uuEventTypeExString =
                                node.uuEventTypeExString.replace("," + ex + ",", ",");
                    }
                    uueventdetach(node, eventType, closure, capture);
                }
            }
        } else {
            // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
            if (!bound) {
                node.uuEventTypeExString += ex + ",";
                node.uuEventEvaluatorHash[ex] = []; // init evaluatorArray
            }
            node.uuEventEvaluatorHash[ex].push(closure); // evaluatorArray.push()

            uueventattach(node, eventType, closure, capture);
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
function uueventhas(node,          // @param Node: target node
                    eventTypeEx) { // @param EventTypeExString: namespace and event types, "click", "namespace.mousemove+"
                                   // @return Boolean:
    return (node.uuEventTypeExString || "").indexOf("," + eventTypeEx + ",") >= 0;
}

// uu.event.fire - fire event / fire custom event(none capture event only)
function uueventfire(node,      // @param Node: target node
                     eventType, // @param String: "click", "custom"
                     param) {   // @param Mix(= void): param
                                // @return Node:
    if (uu.event.has(node, eventType)) {

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

        node.uuEventEvaluatorHash[eventType].forEach(function(evaluator) {
            evaluator.call(node, fakeEventObjectEx, true); // fromCustomEvent = true
        });
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
function uueventunbind(node,          // @param Node: target node
                       eventTypeEx) { // @param EventTypeExString(= void): namespace and event types, "click,click+,..."
                                      // @return Node:
    function _unbindall(ex) { // @param EventTypeExString: "MyNamespace.mousemove+"
        // closure vars: node, ns

        if (!ex.indexOf(ns)) {
            node.uuEventEvaluatorHash[ex].forEach(function(evaluator) {
                uuevent(node, ex, evaluator, true); // unbind mode
            });
        }
    }

    if (eventTypeEx === void 0) { // [1]
        eventTypeEx = node.uuEventTypeExString; // ",click,MyNamespace.mousemove+,"
    }

    var ns, ary = uusplitcomma(eventTypeEx), ex, i = -1;

    while ( (ex = ary[++i]) ) {
        if (ex.lastIndexOf(".*") > 1) { // [3] "namespace.*"
            ns = ex.slice(0, -1);       // "namespace.*" -> "namespace."
            uusplitcomma(eventTypeEx).forEach(_unbindall);
        } else { // [2][4]
            if (eventTypeEx.indexOf("," + ex + ",") >= 0) {

                node.uuEventEvaluatorHash[ex].forEach(function(evaluator) {
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
function uuready(evaluator, // @param Function(= void): callback function
                 order) {   // @param Number(= 0): 0=low, 1=mid, 2=high(system)
    if (evaluator !== void 0 && !uuready.gone.blackout) {
        uuready.gone.dom ? evaluator(uu) // fired -> callback
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
                                  // @return Node/void:
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

// uu.node.build - node builder
// [1][add node]           uu.div(uu.div())
// [2][add text node]      uu.div("hello")
// [3][add text node]      uu.div(uu.text("hello"))
// [4][id callback]        uu.div("@buildid") - window.xnode(uu, <div>, {{"buildid"}}, nodeid)
// [5][number callback]    uu.div(1)          - window.xnode(uu, <div>, {{1}}, nodeid)
// [6][set attr by string] uu.div("title,hello")      - first String is uu.attr("title,hello")
// [7][set attr by hash]   uu.div({ title: "hello" }) - first Hash is uu.attr({ title: "hello" })
// [8][set css by string]  uu.div("", "color,red")      - second String is uu.css("color,red")
// [9][set css by hash]    uu.div("", { color: "red" }) - second Hash is uu.css({ color: "red" })
function uunodebuild(node,   // @param Node/String:
                     args) { // @param Mix: arguments(nodes, attr/css)
                             // @return Node:
    node.nodeType || (node = uu.node(node)); // "div" -> <div>

    var arg, isString, w, i = 0, j = 0, iz = args.length,
        xnode = uuisfunction(win.xnode) ? win.xnode : uu.nop;

    for (; i < iz; ++i) {
        w = 1;
        arg = args[i];
        isString = typeof arg === "string";

        if (arg) {
            if (isString) { // [2][4][6][8]
                if (arg.indexOf(",") < 0 && w--) { // [2]
                    node.appendChild(doc.createTextNode(arg));
                } else if (arg.charAt(0) === "@" && w--) { // [4]
                    xnode(uu, node, arg.slice(1), uu.nodeid(node));
                }
            } else if (arg.nodeType && w--) {
                node.appendChild(arg); // [1][3]
            } else if (typeof arg === "number" && w--) { // [5]
                xnode(uu, node, arg, uu.nodeid(node));
            }
        }
        if (w) {
            if (++j === 1) {
                arg && uu.attr.set(node, isString ? uu.split.toHash(arg) : arg); // [6][7]
            } else if (j === 2) {
                arg && uu.css.set(node, isString ? uu.split.toHash(arg) : arg); // [8][9]
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

// uu.node.remove - remove node
function uunoderemove(node) { // @param Node:
                              // @return Node: node
    if (node && node.parentNode) {
        uunodeidremove(node);
        return node.parentNode.removeChild(node);
    }
    return node;
}

// uu.html
function uuhtml(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <html> node
    return uunodebuild(doc.html, arguments);
}

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
    return uunodebuild(doc.head, arguments);
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
    return uunodebuild(doc.body, arguments);
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
    uunodeadd(doc.createTextNode(Array.isArray(text) ? text.join("") : text),
              uunodeclear(node));
    return node;
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
// [2][without title]   uu.trace(mix)        -> <p>{mix}</p>

// uu.trace - add trace
function uutrace(titleOrSource,  // @param String/Mix: title or source
                 source) {       // @param Mix(= void): source (with title)
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
                callback) {    // @param Function(= void): error callback
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
    case uutype.VOID:       return "undefined";
    case uutype.DATE:       return uudate(mix).ISO();
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
//      if (mix.hasOwnProperty("toString")) {
//          return _str2json(mix.toString(), 1);
//      }
        for (i in mix) {
            ary[++ai] = _str2json(i, 1) + ":" + _jsoninspect(mix[i], fn);
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
    return source === void 0  ? _date2hash(new Date())        // [1] uu.date()
         : uuisdate(source)   ? _date2hash(source)            // [3] uu.date(new Date())
         : uuisnumber(source) ? _date2hash(new Date(source))  // [4] uu.date(1234567)
         : source.GMT         ? uuclone(source)               // [2] uu.date(DateHash)
         : _date2hash(_str2date(source) || new Date(source)); // [5][6][7]
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

    var m = _str2date._PARSE.exec(str);

    if (m) {
        return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3],      // yyyy-mm-dd
                                 +m[4], +m[5], +m[6], +m[7])); // hh:mm:ss.ms
    }
    if (uu.ie && str.indexOf("GMT") > 0) {
        str = str.replace(/GMT/, "UTC");
    }
    return new Date(str.replace(",", "").
                        replace(_str2date._DATE, _toDate));
}
_str2date._PARSE = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/;
_str2date._DATE = /^([\w]+) (\w+) (\w+)/;

// DateHash.ISO - encode DateHash To ISO8601String
function datehashiso() { // @return ISO8601DateString: "2000-01-01T00:00:00.000Z"
    var padZero = (this.ms < 10) ? "00" : (this.ms < 100) ? "0" : "",
        dd = uuhash._num2dd;

    return uuformat("?-?-?T?:?:?.?Z", this.Y, dd[this.M], dd[this.D],
                                      dd[this.h], dd[this.m], dd[this.s],
                                      padZero + this.ms);
}

// DateHash.RFC - encode DateHash To RFC1123String
function datehashrfc() { // @return RFC1123DateString: "Wed, 16 Sep 2009 16:18:14 GMT"
    var rv = (new Date(this.time)).toUTCString();

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
             pageXOffset: win.pageXOffset,   // [WebKit][Alias] document.body.scrollLeft
             pageYOffset: win.pageYOffset }; // [WebKit][Alias] document.body.scrollTop
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
        throw new Error(arrayreduce._MSG);
    }
    return rv;
}
arrayreduce._MSG = "reduce of empty array with no initial value";

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
        throw new Error(arrayreduce._MSG);
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
uuevent._LIST.forEach(function(eventType) {
    uu[eventType] = function bindEvent(node, fn) { // uu.click(node, fn) -> node
        return uuevent(node, eventType, fn); // attach
    };
    uu["un" + eventType] = function unbindEvent(node) { // uu.unclick(node) -> node
        return uuevent(node, eventType, 0, true); // detach
    };
});

// inner - setup node builder - uu.div(), uu.a(), ...
uutag.HTML4.forEach(function(v) {
    // skip "img", "canvas", "audio"
    if (v === "img" || v === "canvas") {
        return;
    }

    uu[v] = function html4NodeBuilder() { // @param Mix: var_args
        return uunodebuild(v, arguments);
    };
});
uutag.HTML5.forEach(function(v) {
    uu.ie && doc.createElement(v); // [IE]

    uu[v] = function html5NodeBuilder() { // @param Mix: var_args
        return uunodebuild(v, arguments);
    };
});

// Internet Explorer 6 flicker fix
try {
    uu.ver.ie6 && doc.execCommand("BackgroundImageCache", false, true);
} catch(err) {} // ignore error(IETester / stand alone IE too)

// --- window.onload handler ---
function _WindowwOnLoad() {
    uuready.gone.win = 1;
    _DOMContentLoaded();
    win.xwin && win.xwin(uu); // window.xwin(uu) callback
    uulazyfire("canvas");
    uulazyfire("audio");
    uulazyfire("video");
}
uueventattach(win, "load", _WindowwOnLoad);

// --- DOMContentLoaded handler ---
function _DOMContentLoaded() {
    if (!uuready.gone.blackout && !uuready.gone.dom++) {

        uulazyfire("boot");
        win.xboot && win.xboot(uu); // window.xboot(uu) callback
    }
}
// inner - hook DOMContentLoaded for IE6 IE7 IE8
function _IEDOMContentLoaded() {
    try {
        // trick -> http://d.hatena.ne.jp/uupaa/20100410/1270882150
        new Image.doScroll();
        _DOMContentLoaded();
    } catch(err) {
        setTimeout(_IEDOMContentLoaded, 64);
    }
}
uu.ver.ie678 ? _IEDOMContentLoaded()
             : uueventattach(doc, "DOMContentLoaded", _DOMContentLoaded);

// --- finalize ---
//{{{!mb

// inner - [IE] fix mem leak
function _WindowOnUnload() {
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
    win.detachEvent("onload", _WindowwOnLoad);
    win.detachEvent("onunload", _WindowOnUnload);
}
uu.ie && win.attachEvent("onunload", _WindowOnUnload);
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

