
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

uu || (function(win, doc, toString, isArray) {

var _ver = detectVersions(0.7),
    _bias = detectBias(),
    // --- HTML5: EMBEDDING CUSTOM NON-VISIBLE DATA ---
    DATA_UUGUID = "data-uuguid",
    DATA_UUEVENT = "data-uuevent",
    DATA_UUTWEEN = "data-uutween",
    DATA_UUIMAGE = "data-uuimage",
//{{{!mb
    DATA_UUOPACITY = "data-uuopacity",
//}}}!mb
    // --- short code ---
    PROTOTYPE = "prototype";

// --- ENHANCE ---
doc.head || (doc.head = uutag("head")[0]); // document.head = <head> via WebKit

// --- LIBRARY STRUCTURE ---
uu = uumix(uufactory, {             // uu(expression:Jam/Node/NodeArray/String/window, arg1:Jam/Node/Mix = void, arg2:Mix = void, arg3:Mix = void, arg4:Mix = void):Jam/Instance
                                    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Clas.MyClass(arg1, arg2)
                                    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> Jam
    ver:            _ver,           // uu.ver - Hash: detected version and plugin informations
    bias:           _bias,          // uu.bias - Hash: detected browser bias informations
    ie:             _ver.ie,
    opera:          _ver.opera,
    gecko:          _ver.gecko,
    webkit:         _ver.webkit,
    file:           uufile,         // uu.file(url:String):AjaxResultHash
    snippet:        uusnippet,      // uu.snippet(id:String, arg:Hash/Array):String/Mix
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
    isNumber:       isNumber,       //   uu.isNumber(search:Mix):Boolean
    isString:       isString,       //   uu.isString(search:Mix):Boolean
    isFunction:     isFunction,     // uu.isFunction(search:Mix):Boolean
    // --- HASH / ARRAY ---
    arg:            uuarg,          // uu.arg(arg1:Hash = {}, arg2:Hash, arg3:Hash = void):Hash
    mix:            uumix,          // uu.mix(base:Hash, flavor:Hash, aroma:Hash = void, override:Boolean = true):Hash
    each:           uueach,         // uu.each(source:Hash/Array, callback:Function)
    keys:           uukeys,         // uu.keys(source:Hash/Array):Array
    values:         uuvalues,       // uu.values(source:Hash/Array):Array
    hash:     uumix(uuhash, {       // uu.hash(key:Hash/String, value:Mix = void):Hash
                                    //  [1][through Hash]           uu.hash({ key: "val" }) -> { key: "val" }
                                    //  [2][key/value pair to hash] uu.hash("key", mix)     -> { key: mix }
        has:        uuhas,          //     uu.hash.has(source:Hash, search:Hash):Boolean
        nth:        uunth,          //     uu.hash.nth(source:Hash, index:Number):Array
        size:       uusize,         //    uu.hash.size(source:Hash):Number
        clone:      uuclone,        //   uu.hash.clone(source:Hash):Hash
        indexOf:    uuindexof       // uu.hash.indexOf(source:Hash, search:Mix):String/void
    }),
    array:    uumix(uuarray, {      // uu.array(source:Array/Mix/NodeList/Arguments, sliceStart:Number = void, sliceEnd:Number = void):Array
                                    //  [1][through Array]      uu.array([1, 2])    -> [1, 2]
                                    //  [2][mix to Array]       uu.array(mix)       -> [mix]
                                    //  [3][NodeList to Array]  uu.array(NodeList)  -> [node, ...]
                                    //  [4][arguments to Array] uu.array(arguments) -> [arg, ...]
                                    //  [5][to Array + slice]   uu.array(uu.tag("*"), 1, 3) -> [<head>, <meta>]
        has:        uuhas,          //    uu.array.has(source:Array, search:Array):Boolean
        nth:        uunth,          //    uu.array.nth(source:Array, index:Number):Array
        size:       uusize,         //   uu.array.size(source:Array):Number
        sort:       uusort,         //   uu.array.sort(source:Array, method:String/Function = "A-Z"):Array
        clean:      uuclean,        //  uu.array.clean(source:Array):Array
        clone:      uuclone,        //  uu.array.clone(source:Array):Array
        toHash:     uutohash,       // uu.array.toHash(key:Array, value:Array/Mix, toNumber:Boolean = false):Hash
        unique:     uuunique        // uu.array.unique(source:Array, literalOnly:Boolean = false):Array
    }),
    sequence:       uusequence,     // uu.sequence(start:Number, end:Number, increment:Number = 1):Array
                                    //  [1][++1] uu.sequence( 0,  5,  1) -> [0, 1, 2, 3, 4]
                                    //  [2][--1] uu.sequence(-2, -5, -1) -> [-2, -3, -4]
                                    //  [3][++2] uu.sequence( 5, 10,  2) -> [ 5,  7,  9]
    // --- ATTRIBUTE ---
    attr:           uuattr,         // uu.attr(node:Node, key:String/Hash = void, value:String = void):String/Hash/Node
                                    //  [1][get all pair]   uu.attr(node) -> { key: value, ... }
                                    //  [2][get value]      uu.attr(node, key) -> "value"
                                    //  [3][set pair]       uu.attr(node, key, "value") -> node
                                    //  [4][set pair]       uu.attr(node, { key: "value", ... }) -> node
                                    //  [5][remove attr]    uu.attr(node, key, null) -> node
    data:     uumix(uudata, {       // uu.data(node:Node, key:String/Hash = void, value:Mix: = void):Hash/Mix/Node/undefined
                                    //  [1][get all pair]   uu.data(node) -> { key: value, ... }
                                    //  [2][get value]      uu.data(node, key) -> value
                                    //  [3][set pair]       uu.data(node, key, value) -> node
                                    //  [4][set pair]       uu.data(node, { key: value, ... }) -> node
        clear:      uudataclear,    // uu.data.clear(node:Node, key:String = void):Node
                                    //  [1][clear all pair] uu.data.clear(node) -> node
                                    //  [2][clear pair]     uu.data.clear(node, key) -> node
        registerHandler:            // uu.data.registerHandler(key:String, callback:Function)
                    registerDataHandler,
        unregisterHandler:          // uu.data.unregisterHandler(key:String)
                    unregisterDataHandler
    }),

    // --- CSS / STYLE / VIEW PORT ---
    css:      uumix(uucss, {        // uu.css(node:Node, key:Boolean/String/Hash = void, value:String = void):Hash/String/Node
                                    //  [1][getComputedStyle(or currentStyle)] uu.css(node)       -> { key: value, ... }
                                    //  [2][getComputedStyle(or emulate API) ] uu.css(node, true) -> { key: value, ... }
                                    //  [3][get value]                         uu.css(node, key)  -> value
                                    //  [4][set pair]                          uu.css(node, key, value) -> node
                                    //  [5][set pair]                          uu.css(node, { key: value, ... }) -> node
        getOpacity: getOpacity,     // uu.css.getOpacity(node:Node):Number
        setOpacity: setOpacity      // uu.css.setOpacity(node:Node, value:Number/String):Node
    }),
    toPixel:        uutopixel,      // uu.toPixel(node:Node, value:Number/CSSUnitString, quick:Boolean = false, prop:String = "left"):Number
                                    //  [1][convert pixel]   uu.toPixel(<div>, 123) -> 123
                                    //  [2][convert pixel]   uu.toPixel(<div>, "12px") -> 12
                                    //  [3][convert pixel]   uu.toPixel(<div>, "12em") -> 192
                                    //  [4][convert pixel]   uu.toPixel(<div>, "12pt") -> 16
                                    //  [5][convert pixel]   uu.toPixel(<div>, "auto") -> 100
                                    //  [6][convert pixel]   uu.toPixel(<div>, "auto", 0, "borderTopWidth") -> 0
    tween:    uumix(uutween, {      // uu.tween(node:Node, duration:Number, param:Hash, callback:Function = void):Node
                                    //  [1][abs]            uu.tween(node, 500, { o: 0.5, x: 200 })
                                    //  [2][rel]            uu.tween(node, 500, { o: "=+0.5" })
                                    //  [3][with "px" unit] uu.tween(node, 500, { h: "=-100px" })
                                    //  [4][with easing fn] uu.tween(node, 500, { h: [200, "easing function name"] })
        skip:       uutweenskip,    // uu.tween.skip(node:Node = void, all:Boolean = false):Node/NodeArray
        isRunning:                  // uu.tween.running(node:Node):Boolean
                    uutweenisrunning
    }),
    viewport: {
        size:       uuviewportsize, // uu.viewport.size():Hash { innerWidth, innerHeight, pageXOffset, pageYOffset }
        getOrientation:             // uu.viewport.getOrientation():Number (-90, 0, 90)
                    getOrientation
    },
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
    Class:    uumix(uuclass, {      // uu.Class(className:String, proto:Hash/Function = void)
                                    //  [1][base]    uu.Class("A",   { proto: ... })
                                    //  [2][inherit] uu.Class("B:A", { proto: ... })
        singleton:                  // uu.Class.singleton(className:String, proto:Hash/Function = void)
                    uuclasssingleton
    }),
    // --- EVENT ---
    event:    uumix(uuevent, {      // uu.event(node:Node, eventTypeEx:String, evaluator:Function):Node
                                    //  [1][bind a event]            uu.event(node, "click", fn)             -> node
                                    //  [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
                                    //  [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
                                    //  [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node
        has:        uueventhas,     // uu.event.has(node:Node, eventTypeEx:String):Boolean
        fire:       uueventfire,    // uu.event.fire(node:Node, eventType:String, param:Mix = void):Node
        unbind:     uueventunbind,  // uu.event.unbind(node:Node, eventTypeEx:String = void):Node
        attach:     uueventattach,  // uu.event.attach(node:Node, eventType:String, evaluator:Function, useCapture:Boolean = false)
        detach:     uueventdetach,  // uu.event.detach(node:Node, eventType:String, evaluator:Function, useCapture:Boolean = false)
        getKeyCode: getKeyCode,     // uu.event.getKeyCode(event:EventObjectEx):Hash { key, code }
        getPaddingEdge:             // uu.event.getPaddingEdge(event:EventObjectEx):Hash { x, y }
                    getPaddingEdge
    }),
    // --- Node / NodeList ---
    node:     uumix(uunode, {       // uu.node(tagName:String = "div", attr:Hash = void):Node
        add:        uunodeadd,      // uu.node.add(source:Node/DocumentFragment/HTMLFragment/TagName = "div",
                                    //             context:Node = <body>,
                                    //             position:String = ".$"):Node
                                    //  [1][add div node]          uu.node.add()         -> <body><div /></body>
                                    //  [2][from tagName]          uu.node.add("p")      -> <body><p /></body>
                                    //  [3][from node]             uu.node.add(uu.div()) -> <body><div /></body>
                                    //  [4][from HTMLFragment]     uu.node.add("<div><p>txt</p></div>") -> <body><div><p>txt</p></div></body>
                                    //  [5][from DocumentFragment] uu.node.add(DocumentFragment)        -> <body>{{fragment}}</body>
                                    //   --- uu.node.add / uu.node.find position ---
                                    //    <div id="parentNode">
                                    //        <div id="firstSibling">^</div>
                                    //        <div id="prevSibling">-</div>
                                    //        <div id="contextNode">
                                    //            <div id="firstChild">.^</div>
                                    //            <div>-----</div>
                                    //            <div id="lastChild">.$</div>
                                    //        </div>
                                    //        <div id="nextSibling">+</div>
                                    //        <div id="lastSibling">$</div>
                                    //    </div>
                                    //
        has:        uunodehas,      // uu.node.has(node:Node, parent:Node):Boolean
        bulk:       uunodebulk,     // uu.node.bulk(source:Node/HTMLFragment, context:Node = <div>):DocumentFragment
        find:       uunodefind,     // uu.node.find(parent:Node, position:String = ".$"):Node/null
                                    //  [1][find firstSibling] uu.node.find(document.body, "^") -> <head>
                                    //  [2][find prevSibling]  uu.node.find(document.body, "-") -> <head>
                                    //  [3][find nextSibling]  uu.node.find(document.head, "+") -> <body>
                                    //  [4][find lastSibling]  uu.node.find(document.head, "$") -> <body>
                                    //  [5][find firstChild]   uu.node.find(document.body, ".^") -> <h1> in <body><h1></h1><div></div></body>
                                    //  [6][find lastChild]    uu.node.find(document.body, ".$") -> <div> in <body><h1></h1><div></div></body>
        swap:       uunodeswap,     // uu.node.swap(swapin:Node, swapout:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        clear:      uunodeclear,    // uu.node.clear(parent:Node):Node
        count:      uunodecount,    // uu.node.count(parent:Node):Number, child element count
        xpath:      uunodexpath,    // uu.node.xpath(elementNode:Node):String
        remove:     uunoderemove,   // uu.node.remove(node:Node):Node
        indexOf:    uunodeindexof,  // uu.node.indexOf(node:Node):Number
        // --- nodeType alias ---
        ELEMENT_NODE:   1,          // uu.node.ELEMENT_NODE  = 1
        TEXT_NODE:      3,          // uu.node.TEXT_NODE     = 3
        COMMENT_NODE:   8,          // uu.node.COMMENT_NODE  = 8
        DOCUMENT_NODE:  9           // uu.node.DOCUMENT_NODE = 9
    }),
    nodeid:   uumix(uunodeid, {     // uu.nodeid(node:Node):Number (nodeid)
        toNode:     uunodeidtonode, // uu.nodeid.toNode(nodeid:Number):Node
        remove:     uunodeidremove  // uu.nodeid.remove(node:Node):Node (removed node)
    }),
    html:           uuhtml,         // uu.html(node, attr, style, buildid) -> <html>
    head:           uuhead,         // uu.head(node, attr, style, buildid) -> <head>
    body:           uubody,         // uu.body(node, attr, style, buildid) -> <body>
    text:           uutext,         // uu.text(node:Node/String, text:String(= void)):Array/String/Node
                                    //  [1][create text node] uu.text("text")          -> createTextNode("text")
                                    //  [2][get text]         uu.text(node)            -> "text" or ["text", ...]
                                    //  [3][set text]         uu.text(node, "text")    -> node
                                    //  [4][set text]         uu.text(node, ["a","b"]) -> node
    textf:          uutextf,        // uu.textf(format:String, var_args, ...):TextNode
    // --- STRING ---
    fix:      uumix(uufix, {        // uu.fix(source:String):String
                                    //  [1][css-prop to js-css-prop] uu.fix("background-color") -> "backgroundColor"
                                    //  [2][std-name to ie-name]     uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
                                    //  [3][html-attr to js-attr]    uu.fix("for")              -> "htmlFor"
                                    //  [4][through]                 uu.fix("-webkit-shadow")   -> "-webkit-shadow"
        unicode:    uufixunicode    // uu.fix.unicode(source:String):String
                                    //  [1][UnicodeString to String] uu.fix.unicode("\u0041\u0042") -> "AB"
    }),
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
                                    // [1][placeholder] uu.format("?? dogs and ??", 101, "cats") -> "101 dogs and cats"
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
    // --- IMAGE ---
    image:    uumix(uuimage, {      // uu.image(url:String, callback:Function):Image
        size:       uuimagesize
    }),
    // --- FLASH ---
    flash:          uuflash,        // uu.flash(url:String, option:FlashOptionHash):Node
    // --- NUMBER ---
    guid:           uuguid,         // uu.guid():Number - build GUID
    // --- DEBUG ---
    puff:           uupuff,         // uu.puff(source:Mix)
    log:      uumix(uulog, {        // uu.log(log:Mix)
        clear:      uulogclear      // uu.log.clear()
    }),
    // --- EVALUATION ---
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
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    nop:            function() {}   // uu.nop() - none operation
});

// --- CONSTRUCTION ---
uu.config = uuarg(win.xconfig, {    // uu.config - Hash: user configurations
    log:        "log", // <div id="log"></div>
    aria:       false,
    debug:      false,
    right:      false,
    altcss:     0,
    storage:    0,
    baseDir:    ""
});

uu.config.baseDir|| (uu.config.baseDir =
    uutag("script").pop().src.replace(/[^\/]+$/, function(file) {
        return file === "uupaa.js" ? "../" : "";
    }));

// --- MessagePump class ---
MessagePump[PROTOTYPE] = {
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
isArray || (Array.isArray = isArray = function(search) { // @param Mix: search
                                                         // @return Boolean:
    return toString.call(search) === "[object Array]";
});

uumix(Array[PROTOTYPE], {
//{{{!mb
    map:            arraymap,       //         map(evaluator:Function, that:this = void):Array
    some:           arraysome,      //        some(evaluator:Function, that:this = void):Boolean
    every:          arrayevery,     //       every(evaluator:Function, that:this = void):Boolean
    filter:         arrayfilter,    //      filter(evaluator:Function, that:this = void):Array
    forEach:        arrayforeach,   //     forEach(evaluator:Function, that:this = void)
    indexOf:        arrayindexof,   //     indexOf(search:Mix, fromIndex:Number = 0):Number
    lastIndexOf:                    // lastIndexOf(search:Mix, fromIndex:Number = this.length):Number
                    arraylastindexof,
//}}}!mb
    reduce:         arrayreduce,    //      reduce(evaluator:Function, initialValue:Mix = void):Mix
    reduceRight:                    // reduceRight(evaluator:Function, initialValue:Mix = void):Mix
                    arrayreduceright
}, 0, 0);

uumix(Boolean[PROTOTYPE], {
    toJSON:         numbertojson    //      toJSON():String
}, 0, 0);

uumix(Date[PROTOTYPE], {
    toISOString:    datetoisostring,// toISOString():String
    toJSON:         datetoisostring //      toJSON():String
}, 0, 0);

uumix(Number[PROTOTYPE], {
    toJSON:         numbertojson    //      toJSON():String
}, 0, 0);

uumix(String[PROTOTYPE], {
    trim:           stringtrim,     //        trim():String
    toJSON:         stringtojson    //      toJSON():String
}, 0, 0);

//{{{!mb
uu.ver.gecko && !win.HTMLElement[PROTOTYPE].innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innertextgetter);
    proto.__defineSetter__("innerText", innertextsetter);
    proto.__defineGetter__("outerHTML", outerhtmlgetter);
    proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(win.HTMLElement[PROTOTYPE]);
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

// --- reuqire file ---
// uu.file - load file from Sjax
function uufile(url) { // @param String: url
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
        ok: ok,
        url: url,
        xhr: xhr || {},
        guid: uuguid(),
        status: status,
        isXMLContent: function() {
            return /xml/i.test(this.xhr.getResponseHeader("Content-Type") || "");
        }
    };
}

// --- code snippet ---
// uu.snippet - evaluate snippet
function uusnippet(id,    // @param String: snippet id. <script id="...">
                   arg) { // @param Mix(= void): arg
                          // @return String/Mix:
    function normalize(str) {
        return str.replace(/("|')/g, "\\$1").replace(/\n/g, "\\n");
    }

    function toBrace(all, ident) {
        return ident.indexOf("arg.") ? '{(' + ident + ')}'  // "{{ident}}"     -> "{(ident)}"
                                     : '"+' + ident + '+"'; // "{{arg.ident}}" -> "+ident+"
    }

    function toText(all, match) {
        return '"' + normalize(uutrim(match)).replace(dualBrace, toBrace) + '"';
    }

    function each(all, match) {
        match = normalize(match.replace(/^\s+|\s+$/gm, "")).
                replace(eachBlock, toEachBlock).
                replace(dualBrace, toBrace);
        return 'uu.node.bulk("' + match + '");';
    }

    function toEachBlock(all, hash, block) {
        return '" + uu.snippet.each(' + hash + ',"' +
                    block.replace(dualBrace, toBrace) + '") + "';
    }

    var js = uusnippet.js[id] || "", node, // {
        dualBrace = /\{\{([^\}]+)\}\}/g,
        eachBlock = /<each ([^>]+)>([\s\S]*?)<\/each>/;

    if (!js) {
        node = uu.id(id);
        if (node) {
            uusnippet.js[id] = js = node.text.replace(/\r\n|\r|\n/g, "\n").
                    replace(/<text>\n([\s\S]*?)^<\/text>$/gm, toText). // <text>...</text>
                    replace(/<>\n([\s\S]*?)^<\/>$/gm, each).           // <>...</>
                    replace(/^\s*\n|\n$/g, "");
        }
    }
    return js ? (new Function("arg", js))(arg) : "";
}
uusnippet.js = {}; // { id: JavaScriptExpression, ... }
uusnippet.each = function(hash, fragment) { // (
    var i = 0, iz = hash.length, block = [], eachBrace = /\{\(([^\)]+)\)\}/g;

    for (; i < iz; ++i) {
        block.push(fragment.replace(eachBrace, function(all, ident) {
            return hash[ident][i];
        }));
    }
    return block.join("");
};

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
    return toString.call(search) === "[object Function]";
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

    if (override === i || override) { // [1][3]
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

//  [1][through Hash]           uu.hash({ key: "val" }) -> { key: "val" }
//  [2][key/value pair to hash] uu.hash("key", mix)     -> { key: mix }

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

//  [1][through Array]      uu.array([1, 2])    -> [1, 2]
//  [2][mix to Array]       uu.array(mix)       -> [mix]
//  [3][NodeList to Array]  uu.array(NodeList)  -> [node, ...]
//  [4][arguments to Array] uu.array(arguments) -> [arg, ...]
//  [5][to Array + slice]   uu.array(uu.tag("*"), 1, 3) -> [<head>, <meta>]

// uu.array - to array + slice
function uuarray(source,     // @param Array/Mix/NodeList/Arguments: source
                 sliceStart, // @param Number(= void): Array.slice(start, end)
                 sliceEnd) { // @param Number(= void): Array.slice(start, end)
                             // @return Array:
    var type = uutype(source),
        rv = (type === uutype.FAKEARRAY) ? fakeToArray(source) // [3][4]
           : (type === uutype.ARRAY)     ? source : [source];  // [1][2]

    return sliceStart ? rv.slice(sliceStart, sliceEnd) : rv;
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
                        //                or [undefined, undefined] (not found)
    var i, j = 0, undef;

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
    return [undef, undef];
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

// [1][ascii sort a-z]      uu.sort(["a","z"], "A-Z") -> ["a", "z"]
// [2][ascii sort a-z]      uu.sort(["a","z"], "Z-A") -> ["z", "a"]
// [3][numeric sort 0-9]    uu.sort([0,1,2], "0-9")   -> [0, 1, 2]
// [4][numeric sort 9-0]    uu.sort([0,1,2], "9-0")   -> [2, 1, 0]

// uu.sort - sort array
function uusort(source,   // @param Array: source
                method) { // @param String/Function(= "A-Z"): method
                          //                   sort method or callback-function
                          // @return Array:
    // 0x1 = numeric sort
    // 0x2 = reverse
    var r = { "A-Z": 0, "Z-A": 2, "0-9": 1, "9-0": 3 }[method] || 0;

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

//  [1][++1] uu.sequence( 0,  5,  1) -> [0, 1, 2, 3, 4]
//  [2][--1] uu.sequence(-2, -5, -1) -> [-2, -3, -4]
//  [3][++2] uu.sequence( 5, 10,  2) -> [ 5,  7,  9]

// uu.sequence - create sequence array
function uusequence(start,       // @param Number:
                    end,         // @param Number:
                    increment) { // @param Number(= 1):
                                 // @return Array:
    var rv = [], ri = -1, i = start, inc = increment || 1;

    if (start < end && inc > 0) {
        for (; i < end; i += inc) {
            rv[++ri] = i;
        }
    } else if (start > end && inc < 0) {
        for (; i > end; i += inc) {
            rv[++ri] = i;
        }
    }
    return rv;
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
//  [1][get all pair]   uu.attr(node) -> { key: "value", ... }
//  [2][get value]      uu.attr(node, key) -> "value"
//  [3][set pair]       uu.attr(node, key, "value") -> node
//  [4][set pair]       uu.attr(node, { key: "value", ... }) -> node
//  [5][remove attr]    uu.attr(node, key, null) -> node

// uu.attr - attribute accessor
function uuattr(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param String(= void): "value"
                         // @return String/Hash/Node:
    var rv, ary, v, i = -1,
        fix = uuattr.fix;

    // [IE6][IE7] key=for -> key=htmlFor, key=class -> key=className
    // [OTHER]    key=htmlFor -> key=for, key=className -> key=class

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
        rv = node.getAttribute(fix[key] || key, 2) || "";
        return typeof rv !== "string" ? rv + "" : rv; // [IE6] tagindex, colspan is number
    }
    for (i in key) {
        key[i] === null ? node.removeAttribute(fix[i] || i)       // [5]
                        : node.setAttribute(fix[i] || i, key[i]); // [4]
    }
    return node;
}
uuattr.fix = uusplittohash(
//{{{!mb
    _bias.syntaxSugar ? "for,htmlFor,class,className" : // [IE6][IE7]
//}}}!mb
                        "className,class,htmlFor,for"
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

    if (key === i) { // [1] uu.data(node)
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
uudata.handler = {}; // { key: callback }

//  [1][clear all pair] uu.data.clear(node) -> node
//  [2][clear pair]     uu.data.clear(node, key) -> node

// uu.data.clear - clear/remove node data
function uudataclear(node,  // @param Node:
                     key) { // @param String(= void): key
                            // @return Node:
    return uudata(node, key || "*", null);
}

// uu.data.registerHandler - register data handler
function registerDataHandler(key,        // @param String: "data-uu..."
                             callback) { // @param Function: callback function
    uudata.handler[key] = callback;
}

// uu.data.unregisterHandler - unregister data handler
function unregisterDataHandler(key) { // @param String: "data-uu..."
    delete uudata.handler[key];
}

// --- css ---
//  [1][getComputedStyle(or currentStyle)] uu.css(node)       -> { key: value, ... }
//  [2][getComputedStyle(or emulate API) ] uu.css(node, true) -> { key: value, ... }
//  [3][get value]                         uu.css(node, key)  -> value
//  [4][set pair]                          uu.css(node, key, value) -> node
//  [5][set pair]                          uu.css(node, { key: value, ... }) -> node

// uu.css - css accessor
function uucss(node,    // @param Node:
               key,     // @param Boolean/String/Hash(= void): key
               value) { // @param String(= void): value
                        // @return Hash/String/Node:
    var rv, style, informal, formal, fix, care, getStyle = win.getComputedStyle;

    if (key === care || key === true) { // [1][2] uu.css(node), uu.css(node, true)
//{{{!mb
        if (getStyle) {
//}}}!mb
            return getStyle(node, null);
//{{{!mb
        }
        return key ? _getComputedStyleIE(node) : node.currentStyle;
//}}}!mb
    }

    fix = uufix.db;
    if (arguments.length === 3) { // [4] uu.css(node, key, value)
        key = uuhash(key, value);
    } else if (typeof key === "string") { // [3] uu.css(node, key)
//{{{!mb
        if (getStyle) {
//}}}!mb
            return getStyle(node, null)[fix[key] || key] || "";
//{{{!mb
        }
        return (node.currentStyle || {})[fix[key] || key] || "";
//}}}!mb
    }
    // [5]
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

// uu.tween - add queue
function uutween(node,       // @param Node: animation target node
                 duration,   // @param Number: duration (unit ms)
                 param,      // @param Hash: { cssprop: endValue, ... }
                             //           or { cssprop: [endValue, easing], ... }
                             //           or { fps: 60, cssprop: ... }
                             //    endValue - Number/String: end value,
                             //    easing   - String(= void): easing function name, "easeInOutQuad"
                             //    fps      - Number: fps
                 callback) { // @param Function(= void 0): after callback(node, style)
                             // @return Node:
    function loop() {
        var data = node[DATA_UUTWEEN], q = data.q[0],
            tm = q.tm ? +new Date
                      : (q.js = uutween.build(node, q.param), q.tm = +new Date),
            finished = q.fin || (tm >= q.tm + q.dur);

        q.js(node, node.style, finished, tm - q.tm, q.dur); // js(node, node.style, finished, gain, duration)
        if (finished) { // finished
            q.fn && q.fn(node, node.style); // after callback(node, node.style)
            data.q.shift(); // remove first queue data
            data.q.length || (clearInterval(data.id), data.id = 0);
        }
    }

    var data = node[DATA_UUTWEEN];

    node.style.overflow = "hidden";
    data || (node[DATA_UUTWEEN] = data = { q: [], id: 0 }); // init tween queue

    // append queue data
    data.q.push({ tm: 0, fn: callback, dur: Math.max(duration, 1),
                  param: param, fin: 0 }); // true/1 is finished
    data.id || (data.id = setInterval(loop, ((1000 / param.fps) | 0) || 1));
    return node;
}
uutween.props = { opacity: 1, color: 2, backgroundColor: 2,
                  width: 3, height: 3, left: 4, top: 4 };
uutween.alpha = /^alpha\([^\x29]+\) ?/;
uutween.build = function(node, param) {
    function ezfn(v0, v1, ez) {
        return ez ? uuformat('Math.??(g,??,??,d)', ez, v0, v1 - v0)
                  : uuformat('(t=g,b=??,c=??,(t/=d2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b)',
                             v0, v1 - v0);
    }
    function unitNormalize(curt, end, fn) {
        if (typeof end === "number") {
            return end;
        }
        var operator = end.slice(0, 2);

        return (operator === "+=") ? curt + fn(end.slice(2))
             : (operator === "-=") ? curt - fn(end.slice(2)) : fn(end);
    }

    var rv = 'var t,b,c,d2=d/2,w,o,gd,h;',
        i, v0, v1, ez, w, n, fixdb = uufix.db, cs = uucss(node, true);

    for (i in param) {
        if (i !== "fps") {
            ez = 0;
            Array.isArray(param[i]) ? (v1 = param[i][0], ez = param[i][1]) // val, easing
                                    : (v1 = param[i]); // param.val

            switch (n = uutween.props[w = fixdb[i] || i]) {
            case 1: // opacity
                v0 = getOpacity(node);
//{{{!mb
                // init opacity [IE6][IE7][IE8]
                _bias.opacity || setOpacity(node, v0);
//}}}!mb
                v1 = unitNormalize(v0, v1, parseFloat);
                rv += uuformat('o=??;o=(o>0.999)?1:(o<0.001)?0:o;',
                               ezfn(v0, v1, ez));
//{{{!mb
                if (!_bias.opacity) { // [IE6][IE7][IE8]
                    rv += uuformat('s.filter=((o>0&&o<1)?"alpha(??="+(o*100)+")":"");' +
                                   'f&&uu.css.setOpacity(n,??)&&(s.filter+=" ??");',
                                   w, v1, node.style.filter.replace(uutween.alpha, ""));
                } else {
//}}}!mb
                    rv += uuformat('s.??=f? ??:o;', w, v1);
//{{{!mb
                }
//}}}!mb
                break;
            case 2: // color, backgroundColor
                v0 = uu.color(cs[w]); // depend: uu.color.js
                v1 = uu.color(v1);    // depend: uu.color.js
                rv += uuformat('gd=g/d;h=uu.hash.num2hh;s.??="#"+' +
                               '(h[(f? ??:(??-??)*gd+??)|0]||0)+' +
                               '(h[(f? ??:(??-??)*gd+??)|0]||0)+' +
                               '(h[(f? ??:(??-??)*gd+??)|0]||0);',
                               w, v1.r, v1.r, v0.r, v0.r,
                                  v1.g, v1.g, v0.g, v0.g,
                                  v1.b, v1.b, v0.b, v0.b);
                break;
            case 3: // width, height:
                v0 = parseInt(cs[w]) || 0;
                v1 = unitNormalize(v0, v1, parseInt);
                rv += uuformat('w=f? ??:??;w=w<0?0:w;s.??=w+"px";',
                               v1, ezfn(v0, v1, ez), w);
                break;
            default: // top, left, other...
                if (n === 4) {
                    v0 = (w === "top") ? node.offsetTop : node.offsetLeft;
                } else {
                    v0 = parseInt(cs[w]) || 0;
                }
                v1 = unitNormalize(v0, v1, parseInt);
                rv += uuformat('s.??=(f? ??:??)+"px";',
                               w, v1, ezfn(v0, v1, ez));
            }
        }
    }
    return new Function("n,s,f,g,d", rv); // node, node.style, finished, gain, duration
};

// uu.tween.skip
function uutweenskip(node,  // @param Node(= void 0): void 0 is all node
                     all) { // @param Boolean(= false): true is skip all
                            // @return Node/NodeArray:
    var nodeArray = node ? [node] : uutag("*", doc.body),
        v, i = -1, j, jz, data;

    while( (v = nodeArray[++i]) ) {
        data = v[DATA_UUTWEEN];
        if (data && data.id) {
            for (j = 0, jz = all ? data.q.length : 1; j < jz; ++j) {
                data.q[j].fin = 1; // finished bit
            }
        }
    }
    return node || nodeArray;
}

// uu.tween.isRunning
function uutweenisrunning(node) { // @param Node:
                                  // @return Boolean:
    var data = node[DATA_UUTWEEN];

    return data && data.id;
}

// uu.css.getOpacity
function getOpacity(node) { // @param Node:
                            // @return Number: opacity (from 0.0 to 1.0)
//{{{!mb
    if (!_bias.opacity) {
        var opacity = node[DATA_UUOPACITY]; // undefined or 1.0 ~ 2.0

        return opacity ? (opacity - 1): 1;
    }
//}}}!mb
    return parseFloat(node.style.opacity ||
                      win.getComputedStyle(node, null).opacity);
}

// uu.css.setOpacity
function setOpacity(node,      // @param Node:
                    opacity) { // @param Number/String: Number(0.0 - 1.0) absolute
                               //                       String("+0.5", "-0.5") relative
                               // @return Node:
    var style = node.style;

//{{{!mb
    if (!_bias.opacity) {
        if (!node[DATA_UUOPACITY]) {
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
    if (typeof opacity === "string") { // "+0.1" or "-0.1"
        opacity = getOpacity(node) + parseFloat(opacity);
    }

    // normalize
    style.opacity = opacity = (opacity > 0.999) ? 1
                            : (opacity < 0.001) ? 0 : opacity;

//{{{!mb
    if (!_bias.opacity) {
        node[DATA_UUOPACITY] = opacity + 1; // (1.0 ~ 2.0)
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
function uutopixel(node,   // @param Node: context
                   value,  // @param Number/CSSUnitString: 123, "123", "123px",
                           //                              "123em", "123pt", "auto"
                   quick,  // @param Boolean(= false): true is quick mode
                   prop) { // @param String(= "left"): property
    prop = prop || "left";

    var fontSize, ratio, judge = uutopixel.judge, _float = parseFloat;

    if (typeof value === "number") {
        return value;
    }

    // "123px" -> 123
    if (judge.px.test(value)) {
        return parseInt(value) || 0;
    }
    if (value === "auto") {
        if (!prop.indexOf("bor") || !prop.indexOf("pad")) { // /^border|^padding/g
            return 0;
        }
    }
    if (!quick) {
        return uutopixel.calc(node, prop, value);
    }
    if (judge.pt.test(value)) {
        return (_float(value) * 4 / 3) | 0; // 12pt * 1.333 = 16px
    } else if (judge.em.test(value)) {
        fontSize = uucss(node).fontSize;
        ratio = judge.pt.test(fontSize) ? 4 / 3 : 1;
        return (_float(value) * _float(fontSize) * ratio) | 0;
    }
    return parseInt(value) || 0;
}
uutopixel.calc = _calcPixel;
uutopixel.judge = { px: /px$/, pt: /pt$/, em: /em$/ };

// inner - convert unit
function _calcPixel(node,    // @param Node:
                    prop,    // @param String: property, "left", "width", ...
                    value) { // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                             // @return Number: pixel value
    var style = node.style, mem = [style.left, 0, 0], // [left, position, display]
        display = "display",
        position = "position",
        important = "important",
        setProperty = "setProperty",
        removeProperty = "removeProperty",
        getPropertyValue = "getPropertyValue";

    if (uu.webkit) {
        mem[1] = style[getPropertyValue](position);
        mem[2] = style[getPropertyValue](display);
        style[setProperty](position, "absolute", important);
        style[setProperty](display,  "block",    important);
    }
    style[setProperty](prop, value, important);
    // get pixel
    value = parseInt(win.getComputedStyle(node, null).left);
    // restore
    style[removeProperty](prop);
    style[setProperty](prop, mem[0], "");
    if (uu.webkit) {
        style[removeProperty](position);
        style[removeProperty](display);
        style[setProperty](position, mem[1], "");
        style[setProperty](display,  mem[2], "");
    }
    return value || 0;
}

//{{{!mb
// inner - convert unit
function _calcPixelIE(node,    // @param Node:
                      prop,    // @param String: property, "left", "width", ...
                      value) { // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                               // @return Number: pixel value
    var style = node.style,
        runtimeStyle = node.runtimeStyle,
        mem = [style[prop], runtimeStyle[prop]]; // keep !important value

    // overwrite
    runtimeStyle[prop] = node.currentStyle[prop];
    style[prop] = value;

    // get pixel
    value = style.pixelLeft;

    // restore
    style[prop] = mem[0];
    runtimeStyle[prop] = mem[1];

    return value || 0;
}

if (!win.getComputedStyle) {
    uutopixel.calc = _calcPixelIE;
}

// inner - emulate getComputedStyle [IE6][IE7][IE8]
function _getComputedStyleIE(node) { // @param Node:
                                     // @return Hash: { width: "123px", ... }
    // http://d.hatena.ne.jp/uupaa/20091212
    var rv, rect, ut, v, w, x, i = -1, mem,
        style = node.style,
        _parseInt = parseInt,
        _parseFloat = parseFloat,
        currentStyle = node.currentStyle,
        runtimeStyle = node.runtimeStyle,
        UNITS = { m: 1, t: 2, "%": 3, o: 3 }, // em, pt, %, auto,
        RECTANGLE = { top: 1, left: 2, width: 3, height: 4 },
        fontSize = currentStyle.fontSize,
        em = _parseFloat(fontSize) * (uutopixel.judge.pt.test(fontSize) ? 4 / 3 : 1),
        boxProperties = _getComputedStyleIE.boxs,
        cache = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                  thin: "1px", medium: "3px",
                  thick: uu.ver.ie89 ? "5px" : "6px" };

    rv = _getComputedStyleIE.getProps(currentStyle);

    // calc: border***Width, padding***, margin***
    while ( (w = boxProperties[++i]) ) {
        v = currentStyle[w];
        if (!(v in cache)) {
            x = v;
            switch (ut = UNITS[v.slice(-1)]) {
            case 1: x = _parseFloat(v) * em; break;    // "12em"
            case 2: x = _parseFloat(v) * 4 / 3; break; // "12pt"
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
        case 1: v = _parseFloat(v) * em; break;    // "12em"
        case 2: v = _parseFloat(v) * 4 / 3; break; // "12pt"
        case 3: // %, auto
            switch (RECTANGLE[w]) {
            case 1: v = node.offsetTop; break;  // style.top
            case 2: v = node.offsetLeft; break; // style.left
            case 3: rect || (rect = node.getBoundingClientRect());
                    v = (node.offsetWidth  || rect.right - rect.left) // style.width
                      - _parseInt(rv.borderLeftWidth)
                      - _parseInt(rv.borderRightWidth)
                      - _parseInt(rv.paddingLeft)
                      - _parseInt(rv.paddingRight);
                    v = v > 0 ? v : 0;
                    break;
            case 4: rect || (rect = node.getBoundingClientRect());
                    v = (node.offsetHeight || rect.bottom - rect.top) // style.height
                      - _parseInt(rv.borderTopWidth)
                      - _parseInt(rv.borderBottomWidth)
                      - _parseInt(rv.paddingTop)
                      - _parseInt(rv.paddingBottom);
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
_getComputedStyleIE.boxs = // boxProperties
    ("borderBottomWidth,borderLeftWidth,borderRightWidth,borderTopWidth," +
     "marginBottom,marginLeft,marginRight,marginTop," +
     "paddingBottom,paddingLeft,paddingRight,paddingTop").split(",");

_getComputedStyleIE.getProps = (function(props) {
    var js = [], i = 0, prop;

    while ( (prop = props[i++]) ) {
        js.push(prop + ":style." + prop); // "{{prop}}: style.{{prop}}"
    }
    return new Function("style", "return {" + js.join(",") + "}");
})( ("backgroundColor,backgroundImage,backgroundPosition,backgroundRepeat," +
     "borderBottomColor,borderBottomStyle,borderLeftColor,borderLeftStyle," +
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

// --- OOP ---
// uu.Class - create a generic class
function uuclass(className, // @param String: "Class"
                            //             or "Class : SuperClass"  (inherit)
                            //             or "Class < SuperClass"  (inherit)
                 proto) {   // @param Hash/Function(= void): prototype object
                            //                               or init function
    var ary = className.split(/\s*[\x3a\x3c]\s*/), tmp, i, classPrototype,
        protoIsFunction = proto && isFunction(proto),
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
    uuclass[Class][PROTOTYPE] = protoIsFunction ? { init: proto }
                                                : proto || {};

    if (Super && proto && !protoIsFunction) { // [2]
        tmp = function() {};
        tmp[PROTOTYPE] = uu.Class[Super][PROTOTYPE];
        classPrototype = uuclass[Class][PROTOTYPE] = new tmp;

        for (i in proto) {
            classPrototype[i] = proto[i];
        }
        classPrototype.constructor = uuclass[Class];
        classPrototype.superClass = uu.Class[Super][PROTOTYPE];
        classPrototype.superMethod = superMethod;
    }

    function superMethod(method              // @param String: method name
                         /*, var_args */ ) { // @param Mix: args
        return this.superClass[method].apply(this, uuarray(arguments).slice(1));
    }
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(className, // @param String: class name
                          proto) {   // @param Hash/Function(= void): prototype object
                                     //                               or init function
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
    uuclass[className][PROTOTYPE] = proto && isFunction(proto) ? { init: proto }
                                                               : proto || {};
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
                 unbind) {    // @hidden Boolean(= false): true is unbind, false is bind
                              // @return Node:
    function _eventClosure(event) {
        if (!event.xtarget) {
            var target = event.target || event.srcElement || doc;

            event.xtype = (uuevent.xtypes[event.type] || 0) & 255;
            event.xbutton = event.button || 0;
            event.xtarget = (target.nodeType === uu.node.TEXT_NODE)
                          ? target.parentNode : target;
//{{{!mb
            if (uu.ie) {
                if (uu.ver.ie678) {
                    event.currentTarget = node;

                    switch (event.xtype) {
                    case uuevent.xtypes.mousedown:
                    case uuevent.xtypes.mouseup:
                        event.xbutton = (event.button & 1) ? 0
                                      : (event.button & 2) ? 2 : 1;
                        break;
                    case uuevent.xtypes.contextmenu:
                        event.xbutton = 2;
                        break;
                    case uuevent.xtypes.mouseover:
                    case uuevent.xtypes.mouseout:
                        event.relatedTarget = target === event.fromElement
                                            ? event.toElement
                                            : event.fromElement;
                    }
                    // Event.stopPropagation
                    event.stopPropagation = function() {
                        event.cancelBubble = true;
                    };
                    // Event.preventDefault
                    event.preventDefault = function() {
                        event.returnValue = false;
                    };
                }
                if (event.pageX === void 0) { // [IE6][IE7][IE8][IE9]
                    event.pageX = event.clientX + doc.documentElement.scrollLeft;
                    event.pageY = event.clientY + doc.documentElement.scrollTop;
                }
            }
//}}}!mb
            if (event.xtype === uuevent.xtypes.mousewheel) {
                event.xwheel = (event.detail ? (event.detail / 3)
                                             : (event.wheelDelta / -120)) | 0;
            }

            // EventObjectEx.stop - stopPropagation and preventDefault
            event.stop = function() {
                event.stopPropagation();
                event.preventDefault();
            };
        }
        isInstance ? handler.call(evaluator, event) : evaluator(event);
    }

    // --- setup event database ---
    if (!(DATA_UUEVENT in node)) {
        node[DATA_UUEVENT] = { types: "," };
    }

    var eventTypeExArray = eventTypeEx.split(","),
        eventData = node[DATA_UUEVENT],
        ex, token, bound, types = "types",
        eventType, capture, handler, i = -1, pos,
        isInstance = false;

    if (!unbind) {
        handler = isFunction(evaluator)
                ? evaluator
                : (isInstance = true, evaluator.handleEvent);
        evaluator.eventClosure = _eventClosure;
    }

    while ( (ex = eventTypeExArray[++i]) ) { // ex = "namespace.click+"

        // split token
        //      "namespace.click+"
        //              v
        //      ["namespace.click+", "namespace", "click", "+"]
        token = uuevent.parse.exec(ex);
        eventType = token[2]; // "click"
        capture   = token[3]; // "+"
        bound     = eventData[types].indexOf("," + ex + ",") >= 0;

//{{{!mb
        // IE mouse capture [IE6][IE7][IE8]
        if (uu.ver.ie678) {
            if (eventType === "mousemove") {
                capture && uuevent(node, "losecapture", evaluator, unbind);
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

                    // removed all handlers in a type
                    if (!eventData[ex].length) {

                        // ",dblclick," <- ",namespace.click+,dblclick,".
                        //                      replace(",namespace.click+,", ",")
                        eventData[types] =
                            eventData[types].replace("," + ex + ",", ",");
                    }
                    uueventdetach(node, eventType,
                                  evaluator.eventClosure, capture);
                    evaluator.eventClosure = null;
                }
            }
        } else {
            // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
            if (!bound) {
                eventData[types] += ex + ",";
                eventData[ex] = [];
            }
            eventData[ex].push(evaluator);
            uueventattach(node, eventType,
                          evaluator.eventClosure, capture);
        }
    }
    return node;
}
uuevent.parse = /^(?:(\w+)\.)?(\w+)(\+)?$/; // ^[NameSpace.]EvntType[Capture]$
uuevent.xtypes = {
//{{{!mb
    // Cross Browser Event Bits
    losecapture: 0x102, // [IE]
    DOMMouseScroll: 0x104, // [GECKO]
//}}}!mb

    // DOM Level2 Events
    mousedown: 1, mouseup: 2, mousemove: 3, mousewheel: 4, click: 5,
    dblclick: 6, keydown: 7, keypress: 8, keyup: 9, mouseenter: 10,
    mouseleave: 11, mouseover: 12, mouseout: 13, contextmenu: 14,
    focus: 15, blur: 16, resize: 17, scroll: 18, change: 19, submit: 20,

    // iPhone Events
    touchstart: 32, touchend: 33, touchmove: 34, touchcancel: 35,
    gesturestart: 36, gesturechange: 37, gestureend: 38,
    orientationchange: 39,

    // HTML5 Events
    online: 50, offline: 51, message: 52
};
uuevent.shortcut =
    ("mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown," +
     "keypress,keyup,change,submit,focus,blur,contextmenu").split(",")

// uu.event.getKeyCode - get key and keyCode (cross browse keyCode)
function getKeyCode(event) { // @param EventObjectEx:
                             // @return Hash: { key, code }
                             //     key  - String: "UP", "1", "A"
                             //     code - Number: 38,   49,  65
    var code = event.keyCode || event.charCode || 0;

//{{{!mb
    if (!code && win.event) { // [IE9]
        code = win.event.keyCode || 0;
    }
//}}}!mb
    return { key: getKeyCode.ident[code] || "", code: code };
}
getKeyCode.ident = uusplittohash( // virtual keycode -> "KEY IDENTIFIER"
    "8,BS,9,TAB,13,ENTER,16,SHIFT,17,CTRL,18,ALT,27,ESC," +
    "32,SP,33,PGUP,34,PGDN,35,END,36,HOME,37,LEFT,38,UP,39,RIGHT,40,DOWN," +
    "45,INS,46,DEL,48,0,49,1,50,2,51,3,52,4,53,5,54,6,55,7,56,8,57,9," +
    "65,A,66,B,67,C,68,D,69,E,70,F,71,G,72,H,73,I,74,J,75,K,76,L,77,M," +
    "78,N,79,O,80,P,81,Q,82,R,83,S,84,T,85,U,86,V,87,W,88,X,89,Y,90,Z");

// uu.event.getPaddingEdge - get padding edge (cross browse offsetX/Y)
function getPaddingEdge(event) { // @param EventObjectEx:
                                 // @return Hash: { x, y }
                                 //     x - Number: fixed offsetX
                                 //     y - Number: fixed offsetY
    // http://d.hatena.ne.jp/uupaa/20100430/1272561922
    var style = uu.ie ? null : win.getComputedStyle(event.xtarget, null),
        x = event.offsetX || 0,
        y = event.offsetY || 0;

//{{{!mb
    if (uu.webkit) {
//}}}!mb
        x -= parseInt(style.borderTopWidth)  || 0; // "auto" -> 0
        y -= parseInt(style.borderLeftWidth) || 0;
//{{{!mb
    } else if (uu.opera) {
        x += parseInt(style.paddingTop)  || 0;
        y += parseInt(style.paddingLeft) || 0;
    } else if (uu.gecko || event.layer !== void 0) {
        x = (event.layerX || 0) - (parseInt(style.borderTopWidth)  || 0);
        y = (event.layerY || 0) - (parseInt(style.borderLeftWidth) || 0);
    } else if (uu.ie && uu.ver.browser > 8) { // [IE9+]
        x = win.event.offsetX;
        y = win.event.offsetY;
    }
//}}}!mb
    return { x: x, y: y };
}

// uu.event.has - has event
function uueventhas(node,          // @param Node: target node
                    eventTypeEx) { // @param EventTypeExString: namespace and event types, "click", "namespace.mousemove+"
                                   // @return Boolean:
    var types = node[DATA_UUEVENT] ? node[DATA_UUEVENT]["types"] : 0;

    return (types || "").indexOf("," + eventTypeEx + ",") >= 0;
}

// uu.event.fire - fire event / fire custom event(none capture event only)
function uueventfire(node,      // @param Node: target node
                     eventType, // @param String: "click", "custom"
                     param) {   // @param Mix(= void): param
                                // @return Node:
    if (uueventhas(node, eventType)) {

        var fakeEventObjectEx = {
                type:           eventType,
                pageX:          0,
                pageY:          0,
                param:          param,
                target:         node,
                button:         0,
                detail:         0,
                customEvent:    true,
                currentTarget:  node,
                relatedTarget:  node,
                preventDefault: uu.nop,
                stopPropagation:uu.nop
            };

        node[DATA_UUEVENT][eventType].forEach(function(evaluator) {
            evaluator.call(node, fakeEventObjectEx);
        });
    }
    return node;
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
            node[DATA_UUEVENT][ex].forEach(function(evaluator) {
                uuevent(node, ex, evaluator, true); // unbind
            });
        }
    }

    if (node[DATA_UUEVENT]) {
        eventTypeEx = eventTypeEx ? "," + eventTypeEx + ","   // [2] ",click,"
                                  : node[DATA_UUEVENT].types; // [1] ",click,MyNamespace.mousemove+,"

        var ns, ary = uusplitcomma(eventTypeEx), ex, i = -1;

        while ( (ex = ary[++i]) ) {
            if (ex.lastIndexOf(".*") > 1) { // [3] "namespace.*"

                ns = ex.slice(0, -1);       // "namespace.*" -> "namespace."
                uusplitcomma(eventTypeEx).forEach(_unbindall);
            } else { // [2][4]
                if (eventTypeEx.indexOf("," + ex + ",") >= 0) {

                    node[DATA_UUEVENT][ex].forEach(function(evaluator) {
                        uuevent(node, ex, evaluator, true); // unbind
                    });
                }
            }
        }
    }
    return node;
}

// uu.event.attach - attach event - Raw Level API wrapper
function uueventattach(node,         // @param Node:
                       eventType,    // @param String: event type
                       evaluator,    // @param Function: evaluator
                       useCapture) { // @param Boolean(= false):
    eventType = uueventattach._FIX[eventType] || eventType;

//{{{!mb
    if (node.addEventListener) {
//}}}!mb
        node.addEventListener(eventType, evaluator, !!(useCapture || 0));
//{{{!mb
    } else {
        node.attachEvent("on" + eventType, evaluator); // [IE]
    }
//}}}!mb
}
uueventattach._FIX =
//{{{!mb
    uu.gecko ? { mousewheel: "DOMMouseScroll" } :
    uu.opera ? { contextmenu: "mousedown" } :
//}}}!mb
    {};

// uu.event.detach - detach event - Raw Level API wrapper
function uueventdetach(node,         // @param Node:
                       eventType,    // @param String: event type
                       evaluator,    // @param Function: evaluator
                       useCapture) { // @param Boolean(= false):
    eventType = uueventattach._FIX[eventType] || eventType;

//{{{!mb
    if (node.removeEventListener) {
//}}}!mb
        node.removeEventListener(eventType, evaluator, !!(useCapture || 0));
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

//  [1][add div node]          uu.node.add()         -> <body><div /></body>
//  [2][from tagName]          uu.node.add("p")      -> <body><p /></body>
//  [3][from node]             uu.node.add(uu.div()) -> <body><div /></body>
//  [4][from HTMLFragment]     uu.node.add("<div><p>txt</p></div>") -> <body><div><p>txt</p></div></body>
//  [5][from DocumentFragment] uu.node.add(DocumentFragment)        -> <body>{{fragment}}</body>

// uu.node.add - add/insert node
function uunodeadd(source,     // @param Node/DocumentFragment/HTMLFragment/TagName(= "div"):
                   context,    // @param Node(= <body>): add to context
                   position) { // @param String(= ".$"): insert position
                               // @return Node: node or first node
    context = context || doc.body;

    var node = !source ? doc.createElement("div")        // [1] uu.node.add()
             : source.nodeType ? source                  // [3][5] uu.node.add(Node or DocumentFragment)
             : !source.indexOf("<") ? uunodebulk(source, context) // [4] uu.node.add(HTMLFragmentString)
             : doc.createElement(source),                // [2] uu.node.add("p")
        firstChild = "firstChild",
        reference = null,
        rv = (node.nodeType === 11) ? node[firstChild] : node; // 11: DOCUMENT_FRAGMENT_NODE

    switch (uunodefind.pos[position] || 8) {
    case 1: reference = context.parentNode[firstChild];
    case 2: reference || (reference = context);
    case 3: reference || (reference = context.nextSibling);
    case 4: context.parentNode.insertBefore(node, reference); break;
    case 5: reference = context[firstChild];
    case 8: context.insertBefore(node, reference);
    }
    return rv;
}

// uu.node.find - find node
function uunodefind(parent,     // @param Node: parent node
                    position) { // @param String(= ".$"): position
                                // @return Node: node or null
    parent = parent || doc.body;

    var rv, num = uunodefind.pos[position] || 8,
//{{{!mb
        iter,
//}}}!mb
        iters = uunodefind.iters[num > 4 ? num - 4 : num];

//{{{!mb
    if (_bias.traversal) {
//}}}!mb
        rv = (num === 1 || num === 4) ? parent.parentNode[iters[0]]
                                      : parent[iters[0]];
//{{{!mb
    } else {
        iter = iters[1];
        rv = (num === 2 || num === 3) ? parent[iter] :
             (num > 4) ? parent[iters[2]]
                       : parent.parentNode[iters[2]];
        for (; rv; rv = rv[iter]) {
            if (rv.nodeType === uu.node.ELEMENT_NODE) {
                break;
            }
        }
    }
//}}}!mb
    return rv;
}
uunodefind.pos = { "^": 1, "-": 2, "+": 3, "$": 4, ".^": 5, ".$": 8 };
uunodefind.iters = {
    1: ["firstElementChild",      "nextSibling",     "firstChild"], // FIRST_SIBLING, FIRST_CHILD
    2: ["previousElementSibling", "previousSibling"],               // PREV_SIBLING
    3: ["nextElementSibling",     "nextSibling"],                   // NEXT_SIBLING
    4: ["lastElementChild",       "previousSibling", "lastChild"]   // LAST_SIBLING, LAST_CHILD
};

// uu.nodeid - get nodeid
function uunodeid(node) { // @param Node:
                          // @return Number: nodeid, from 1
    if (!node[DATA_UUGUID]) {
        uunodeid.db[node[DATA_UUGUID] = ++uunodeid.num] = node;
    }
    return node[DATA_UUGUID];
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
    node[DATA_UUGUID] && (uunodeid.db[node[DATA_UUGUID]] = null,
                                      node[DATA_UUGUID] = null);
    return node;
}

// uu.node.has - has child node
function uunodehas(node,     // @param Node: child node
                   parent) { // @param Node: parent node
                             // @return Boolean:
    for (var c = node; c && c !== parent;) {
        c = c.parentNode;
    }
    return node !== parent && c === parent;
}

// [1][clone]           uu.node.bulk(Node) -> DocumentFragment
// [2][build]           uu.node.bulk("<p>html</p>") -> DocumentFragment

// uu.node.bulk - convert HTMLString into DocumentFragment
function uunodebulk(source,    // @param Node/HTMLFragment: source
                    context) { // @param Node(= <div>): context
                               // @return DocumentFragment:
    var rv = doc.createDocumentFragment(),
        placeholder = uunode((context || {}).tagName);

    placeholder.innerHTML = source.nodeType ? source.outerHTML // [1] node
                                            : source;          // [2] "<p>html</p>"
    while (placeholder.firstChild) {
//      rv.appendChild(placeholder.removeChild(placeholder.firstChild));
        rv.appendChild(placeholder.firstChild);
    }
    return rv;
}

// uu.nod.xpath - get node xpath
function uunodexpath(elementNode) { // @param Node: ELEMENT_NODE
                                    // @return XPathString: "/html[1]/body[1]/div[5]"
    var rv = [], n = elementNode;

    while (n && n.nodeType === uu.node.ELEMENT_NODE) {
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
    node.nodeType || (node = uunode(node)); // "div" -> <div>

    var arg, i = 0, token = 0, callback;

    while ( (arg = args[i++]) ) {
        if (arg) {
            if (arg.nodeType) { // [1][3]
                node.appendChild(arg);
            } else if (isNumber(arg)) { // [8]
                callback = arg;
            } else if (isString(arg) && arg.indexOf(",") < 0) { // [2]
                node.appendChild(doc.createTextNode(arg)); // uu.div("hello")
            } else if (++token < 2) {
                uu.attr(node, isString(arg) ? uusplittohash(arg) : arg); // [4][5]
            } else if (token < 3) {
                uu.css(node, isString(arg) ? uusplittohash(arg) : arg); // [6][7]
            }
        }
    }
    if (callback !== void 0) {
        win.xbuild(uu, node, callback, uu.nodeid(node));
    }
    return node;
}

// [1][clear children]      uu.node.clear(<body>)

// uu.node.clear - clear all children
function uunodeclear(parent) { // @param Node: parent node
                               // @return Node: parent
    var rv = uutag("*", parent), v, i = -1;

    while ( (v = rv[++i]) ) {
        uunodeidremove(v);
        uueventunbind(v);
    }
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
    return parent;
}

// uu.node.remove - remove node, remove nodeid, remove data, remove events
function uunoderemove(node) { // @param Node:
                              // @return Node: node
    uueventunbind(node);
    uunodeidremove(node);

    // extras data handler
    var key, handler = uudata.handler;

    for (key in handler) {
        node[key] && handler(key, node, "removeNode");
    }
    node.parentNode && node.parentNode.removeChild(node);
    return node;
}

// uu.node.count - child element count
function uunodecount(parent) { // @param Node: parentNode
                               // @return Number
//{{{!mb
    if (_bias.traversal) {
//}}}!mb
        return parent.childElementCount;
//{{{!mb
    }

    var rv = 0, n = parent.firstChild;

    for (; n; n = n.nextSibling) {
        (n.nodeType === uu.node.ELEMENT_NODE) && ++rv;
    }
    return rv;
//}}}!mb
}

// uu.node.indexOf - find ELEMENT_NODE index
function uunodeindexof(node,          // @param Node: ELEMENT_NODE
                       __tagName__) { // @hidden String: TagName
                                      // @return Number: 0~ or -1(not found)
    var rv = 0, n = node.parentNode.firstChild;

    for (; n; n = n.nextSibling) {
        __tagName__ ? (n.tagName === __tagName__) && ++rv
                    : (n.nodeType === uu.node.ELEMENT_NODE) && ++rv;
        if (n === node) {
            return rv - 1;
        }
    }
    return -1;
}

// uu.html
function uuhtml(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <html> node
    return buildNode(doc.documentElement, arguments);
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

//  [1][create text node] uu.text("text")          -> createTextNode("text")
//  [2][get text]         uu.text(node)            -> "text" or ["text", ...]
//  [3][set text]         uu.text(node, "text")    -> node
//  [4][set text]         uu.text(node, ["a","b"]) -> node

// uu.text - node.text / node.innerText accessor
function uutext(node,   // @param Node/String: node or text string
                text) { // @param String/Array(= void): "textContent" or ["textContent", ...]
                        // @return Array/String/Node:
    if (isString(node)) {
        return doc.createTextNode(node); // [1]
    }
    if (text === void 0) { // [2]
        return node[
//{{{!mb
                    uu.gecko ? "textContent" :
//}}}!mb
                               "innerText"];
    }
    uunodeadd(doc.createTextNode(isArray(text) ? text.join("") : text), // [3]
              uunodeclear(node));
    return node;
}

// uu.textf - uu.text + uu.format
function uutextf(format) { // @param String: formatted string with "??" placeholder
                           // @return TextNode: <text>formatted string</text>
    return uutext(uuformat.apply(this, arguments));
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
uuquery.ngword = /(?:\:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=|<=|>=|&=|x7b/;
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
    if (!_ver.ie) {
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
        if (!skip || v.nodeType === uu.node.ELEMENT_NODE) {
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

// uu.fix.unicode - UnicodeString("\u0041\u0042") to String("AB")
function uufixunicode(str) { // @param String: "\u0041\u0042"
                             // @return String: "AB"
    return str.replace(uufixunicode.uffff, function(m, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}
uufixunicode.uffff = /\\u([0-9a-f]{4})/g; // \u0000 ~ \uffff

// uu.trim - trim both side whitespace
function uutrim(source) { // @param String:  "  has  space  "
                          // @return String: "has  space"
    return source.replace(uutrim.trim, "");
}
uutrim.tags   = /<\/?[^>]+>/g; // <div> or </div>
uutrim.trim   = /^\s+|\s+$/g;
uutrim.quotes = /^\s*["']?|["']?\s*$/g;
uutrim.spaces = /\s\s+/g;

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
_entity.to   = /[&<>"]/g;
_entity.from = /&(?:amp|lt|gt|quot);/g;
_entity.hash = uusplittohash('&,&amp;,<,&lt;,>,&gt;,",&quot;,&amp;,&,&lt;,<,&gt;,>,&quot;,"');

// [1][placeholder]             uu.format("?? dogs and ??", 101, "cats") -> "101 dogs and cats"

// uu.format - placeholder( "??" ) replacement
function uuformat(format) { // @param String: formatted string with "??" placeholder
                            // @return String: "formatted string"
    var i = 0, args = arguments;

    return format.replace(uuformat.q, function() {
        return args[++i];
    });
}
uuformat.q = /\?\?/g;

// --- debug ---
// uu.puff - uu.puff(mix) -> alert( uu.json(mix) )
function uupuff(source) { // @param Mix: source object
    alert(_jsoninspect(source));
}

// uu.log - add log
function uulog(log) { // @param Mix: log data
    var context = uuid(uu.config.log);

    context || uunodeadd(context = uu.ol({ id: uu.config.log }));
    uunodeadd(uu.li(uu.text(uufixunicode(_jsoninspect(log)))), context);
}

// uu.log.clear - clear log
function uulogclear() {
    var context = uuid(uu.config.log);

    if (context) {
        while (context.lastChild) {
            context.removeChild(context.lastChild);
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
    if (uujsondecode.ngword.test(str.replace(uujsondecode.unescape, ""))) {
        return false;
    }
    return (new Function("return " + str + ";"))();
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
         : isNumber(source)            ? _date2hash(new Date(source)) // [4] uu.date(1234567)
         : source.GMT                  ? uuclone(source)              // [2] uu.date(DateHash)
         : _date2hash(_str2date(source) || new Date(source));         // [5][6][7]
}

// inner - convert Date to DateHash
function _date2hash(date) { // @param Date:
                            // @return Hash: { Y: 2010, M: 1~12, D: 1~31,
                            //                 h: 0~23, m: 0~59, s: 0~59, ms: 0~999,
                            //                 time: xxxxxxx, ISO(), RFC(), GMT() }
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
    var padZero = (this.ms < 10) ? "00"
                : (this.ms < 100) ? "0" : "",
        dd = uuhash.num2dd;

    return uuformat("??-??-??T??:??:??.??Z",
                    this.Y, dd[this.M], dd[this.D],
                    dd[this.h], dd[this.m], dd[this.s], padZero + this.ms);
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

// --- IMAGE ---
// uu.image - image loader
function uuimage(url,        // @param String:
                 callback) { // @param Function: callback({ img, ok, url, status, width, height })
                             //     ok     - Boolean: true is success
                             //     img    - Object: image object
                             //     status - Number: status code, 0(loading...),
                             //                                   200(ok), 404(ng)
                             //     width  - Number: width
                             //     height - Number: height
                             // @return Image:
    function after(ok) {
        var v, i = -1, ary = uuimage.fn[url].concat(),
            arg = { img: img, status: ok ? 200 : 404, ok: ok,
                    width: img.width, height: img.height };

        uuimage.fn[url] = []; // pre clear
        while ( (v = ary[++i]) ) {
            v(arg);
        }
    }

    var img = uuimage.db[url];

    if (img) { // cached or scheduled
        uuimage.fn[url].push(callback);
        img.ok && after(true);
    } else {
        uuimage.db[url] = img = new Image();
        uuimage.fn[url] = [callback];
        img.ok = false;
        img.onerror = function() {
            img.width = img.height = 0;
            after(img.ok = false);
            img.onerror = img.onload = null;
        };
        img.onload = function() {
            if (img.complete || img.readyState === "complete") { // [IE8] readyState
                after(img.ok = true);
            }
            img.onerror = img.onload = null;
        };
        img.setAttribute("src", url);
    }
    return img;
}
uuimage.db = {}; // { url: Image, ... }
uuimage.fn = {}; // { url: [callback, ...] }

// uu.image.size - get image actual dimension
function uuimagesize(node) { // @param HTMLImageElement/HTMLCanvasElement:
                             // @return Hash: { width, height }
    if (node.naturalWidth) { // [Gecko][WebKit]
        return { width: node.naturalWidth, height: node.naturalHeight };
    }
//{{{!mb
    // http://d.hatena.ne.jp/uupaa/20090602
    var rs, rw, rh, w, h, hide, width = "width", height = "height";

    if (node.src) { // HTMLImageElement
        if (node[DATA_UUIMAGE] && node[DATA_UUIMAGE].src === node.src) {
            return node[DATA_UUIMAGE];
        }
        if (uu.ie) { // [IE]
            if (node.currentStyle) {
                hide = node.currentStyle.display === "none";
                hide && (node.style.display = "block");
            }
            rs = node.runtimeStyle;
            w = rs[width], h = rs[height]; // keep runtimeStyle
            rs[width] = rs[height] = "auto"; // override
            rw = node[width];
            rh = node[height];
            rs[width] = w, rs[height] = h; // restore
            hide && (node.style.display = "none");
        } else { // [Opera]
            w = node[width], h = node[height]; // keep current style
            node.removeAttribute(width);
            node.removeAttribute(height);
            rw = node[width];
            rh = node[height];
            node[width] = w, node[height] = h; // restore
        }
        return node[DATA_UUIMAGE] = { width: rw, height: rh, src: node.src }; // bond
    }
//}}}!mb
    return node;
}

// --- FLASH ---
//  <object id="external..." width="..." height="..." data="***.swf"
//      type="application/x-shockwave-flash">
//      <param name="allowScriptAccess" value="always" />
//      <param name="movie" value="{{url}}" />
//      <param name="flashVars" value="uuexid={{id}}&key=value&..." />
//      <embed name="external..." src="***.swf" width="..." height="..."
//          type="application/x-shockwave-flash" allowScriptAccess="always">
//      </embed>
//  </object>
// uu.flash - create flash <object> node
function uuflash(url,      // @param String: url
                 option) { // @param FlashOptionHash(= { allowScriptAccess: "always" }):
                           // @return Node: <object>
//{{{!mb
    option = uuarg(option, {
        id: "external" + uuguid(),
        param: [],
        width: "100%",
        height: "100%",
        marker: null,
        flashVars: ""
    });

    var param = option.param, paramArray = [], i, iz, object;

    // add default <param name="allowScriptAccess" value="always" />
    if (param.indexOf("allowScriptAccess") < 0) {
        param.push("allowScriptAccess", "always");
    }

    // add <param name="movie" value="{{url}}" />
    param.push("movie", url);

    // add <param name="flashVars" value="uuexid={{id}}&key=value&..." />
    option.flashVars && (option.flashVars += "&");
    option.flashVars += "uuexid=" + option.id;
    param.push("flashVars", option.flashVars);

    option.marker || (option.marker = uunodeadd()); // <body>...<div/></body>

    for (i = 0, iz = param.length; i < iz; i += 2) {
        paramArray.push(uuformat('<param name="??" value="??" />',
                                 param[i], param[i + 1]));
    }
    object = uuformat(
        '<object id="??" width="??" height="??" data="??" ??>??</object>',
        option.id, option.width, option.height, url,
        uu.ie ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'
              : 'type="application/x-shockwave-flash"', paramArray.join(""));
    uunodeswap(uunodebulk(object), option.marker);
//}}}!mb
    return uuid(option.id) || uu.node("object");
}

// --- OTHER ---
// uu.viewport.size
function uuviewportsize() { // @return Hash: { innerWidth, innerHeight,
                            //                 pageXOffset, pageYOffset }
                            //   innerWidth  - Number:
                            //   innerHeight - Number:
                            //   pageXOffset - Number:
                            //   pageYOffset - Number:
//{{{!mb
    if (uu.ie) {
        var iebody = doc.documentElement;

        return { innerWidth:  iebody.clientWidth,
                 innerHeight: iebody.clientHeight,
                 pageXOffset: iebody.scrollLeft,
                 pageYOffset: iebody.scrollTop };
    }
//}}}!mb
    return win;
}

// uu.viewport.getOrientation - get viewport orientation (for iPhone)
function getOrientation() { // @return Number: 90(<|), 0(|A|), -90(|>), -180(|V|)
    return win.orientation || 0;
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
uuevent.shortcut.forEach(function(eventType) {
    uu[eventType] = function(node, fn) { // uu.click(node, fn) -> node
        return uuevent(node, eventType, fn); // bind
    };

    uu["un" + eventType] = function(node) { // uu.unclick(node) -> node
        return uuevent(node, eventType, 0, true); // unbind
    };
});

// inner - setup node builder - uu.div(), uu.a(), ...
uutag.html4.forEach(function(tagName) {
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
        (new Image).doScroll();
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
    doc.head = null;
    win.detachEvent("onload", _windowonload);
    win.detachEvent("onunload", _windowonunload);
}
uu.ie && win.attachEvent("onunload", _windowonunload);
//}}}!mb

// inner -
// 1. prebuild camelized hash - http://handsout.jp/slide/1894
// 2. prebuild nodeid
uuready(function() {
    var html = doc.documentElement,
        nodeList = uutag("*", html), v, i = -1,
        styles = uusplittohash((
//{{{!mb
                 uu.ie ? "float,styleFloat,cssFloat,styleFloat" :
//}}}!mb
                         "float,cssFloat,styleFloat,cssFloat"
                ) + ",pos,position,w,width,h,height,x,left,y,top,o,opacity," +
                "bg,background,bgcolor,backgroundColor,bgimg,backgroundImage," +
                "bgrpt,backgroundRepeat,bgpos,backgroundPosition");

    uumix(_camelhash(uufix.db, uu.webkit ? win.getComputedStyle(html, null)
                                         : html.style), styles, uuattr.fix);
    uunodeid(html);
    while ( (v = nodeList[++i]) ) {
        uunodeid(v);
    }
}, 2); // 2: high(system) order

// inner - make camelized hash( { "text-align": "TextAlign", ...}) from getComputedStyle
function _camelhash(rv, props) {
    function _camelize(m, c) {
        return c.toUpperCase();
    }

//{{{!mb
    function _decamelize(m, c, C) {
        return c + "-" + C.toLowerCase();
    }
//}}}!mb

    var k, v,
//{{{!mb
        DECAMELIZE = /([a-z])([A-Z])/g,
//}}}!mb
        CAMELIZE = /-([a-z])/g;

    for (k in props) {
        if (typeof props[k] === "string") {
//{{{!mb
            if (uu.webkit) {
//}}}!mb
                v = k = props.item(k); // k = "-webkit-...", "z-index"
                k.indexOf("-") >= 0 && (v = k.replace(CAMELIZE, _camelize));
                (k !== v) && (rv[k] = v);
//{{{!mb
            } else {
                v = ((uu.gecko && !k.indexOf("Moz")) ? "-moz" + k.slice(3) :
                     (uu.ie    && !k.indexOf("ms"))  ? "-ms"  + k.slice(2) :
                     (uu.opera && !k.indexOf("O"))   ? "-o"   + k.slice(1) : k).
                    replace(DECAMELIZE, _decamelize);
                (k !== v) && (rv[v] = k);
            }
//}}}!mb
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
        var opera = win.opera || false;

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

    function test(rex) {
        return rex.test(userAgent);
    }

    var o = true, x = false,
        rv = { library: libraryVersion, flash: 0, silverlight: 0,
               ie: x, ie6: x, ie7: x, ie8: x, ie9: x,
               ie67: x, ie678: x, ie89: x, opera: x, gecko: x,
               webkit: o, chrome: x, safari: o, iphone: o, android: x,
               mobile: o, os: "iphone", jit: o },
        ie = !!doc.uniqueID, documentMode = doc.documentMode,
        userAgent = navigator.userAgent,
        render    = detectRenderingEngineVersion(userAgent),
        browser   = detectUserAgentVersion(userAgent);

    rv.render       = render;
    rv.browser      = browser;
//{{{!mb
    rv.ie           = ie;
    rv.ie6          = ie && browser === 6;
    rv.ie7          = ie && browser === 7;
    rv.ie8          = ie && documentMode === 8;
    rv.ie9          = ie && documentMode === 9;
    rv.ie67         = rv.ie6 || rv.ie7;
    rv.ie678        = rv.ie6 || rv.ie7 || rv.ie8;
    rv.ie89         = rv.ie8 || rv.ie9;
    rv.opera        = !!(win.opera || 0);
    rv.gecko        = test(/Gecko\//);
    rv.webkit       = test(/WebKit/);
    rv.chrome       = test(/Chrome/);
    rv.safari       = !rv.chrome && test(/Safari/);
    rv.iphone       = test(/iPad|iPod|iPhone/);
    rv.android      = test(/Android/);
    rv.mobile       = rv.iphone || rv.android || test(/Opera Mini/);
    rv.os           = rv.iphone ? "iphone"
                    : rv.android ? "android"
                    : test(/Win/) ? "windows"
                    : test(/Mac/) ? "mac"
                    : test(/X11|Linux/) ? "unix"
                    : "unknown";
    rv.jit          = (ie        && browser >= 9)   || // IE 9+
                      (rv.gecko  && render  >  1.9) || // Firefox 3.5+(1.91)
                      (rv.webkit && render  >= 528) || // Safari 4+, Google Chrome 2+
                      (rv.opera  && browser >= 10.5);  // Opera10.50+
    rv.flash        = detectFlashPlayerVersion(ie, 9); // FlashPlayer 9+
    rv.silverlight  = detectSilverlightVersion(ie, 3); // Silverlight 3+
//}}}!mb
//{{{+debug
    if (rv.ie9 && (rv.ie6 || rv.ie7 || rv.ie8)) {
        throw new Error("UNKNOWN_BROWSER_MODE");
    }
//}}}+debug
//{{{+debug // [IE9pp special]
    if (rv.ie9) {
        rv.browser = 9;
    }
//}}}+debug
    return rv;
}

//{{{!mb
function fakeToArray(fakeArray) { // @param FakeArray: NodeList, Arguments
                                  // @return Array:
    if (_bias.slice) {
        return Array[PROTOTYPE].slice.call(fakeArray);
    }

    var rv = [], i = 0, iz = fakeArray.length;

    for (; i < iz; ++i) {
        rv[i] = fakeArray[i];
    }
    return rv;
}
//}}}!mb

function detectBias() {
    var o = true, x = false,
//{{{!mb
        div, node, style,
//}}}!mb
        rv = {
            rgb: o,                 // rgb color ready?
            hsla: o,                // hsla color ready?
            slice: o,               // Array.prototype.slice.call(NodeList) ready?
            indexer: o,             // String[indexer] ready ?
            opacity: x,             // node.style.opacity ready? [IE6][IE7][IE8]
            traversal: o,           // Element Traversal ready? - http://www.w3.org/TR/ElementTraversal/
            tamperedURL: x,         // node.href tampered [IE6][IE7][IE8]
            transparent: o,         // border-color:transparent ready?
            syntaxSugar: x,         // getAttribute("class") syntax sugar [IE6][IE7]
            stripComment: x         // strip comment node [IE6][IE7][IE8]
        };

//{{{!mb
    div = uunode();
    div.innerHTML =
        '<a href="/z" class="a" style="border:0 solid transparent;opacity:.1;' +
        'color:rgb(255,0,0);background:hsla(100,100%,100%,1)"><!-- -->c</a>';
    node = div.firstChild;
    style = node.style;

    rv.rgb  = /rgb\(255|#f/.test(style.color); // ) typical rgb(255, 0, 0)
    rv.hsla = /rgb\(255|#f|hsl\(100/.test(style.backgroundColor); // )) // typical rgb(255, 255, 255)
    try {
        Array.prototype.slice.call(doc.getElementsByTagName("head"));
    } catch(err) { rv.slice = x; }
    rv.indexer = !!"0"[0];
    rv.opacity = style.opacity === "0.1";
    rv.traversal = !!doc.documentElement.firstElementChild;
    rv.tamperedURL = node.getAttribute("href") !== "/z";
    rv.syntaxSugar = node.getAttribute("class") !== "a";
    rv.transparent = /tran|rgba/.test(style.borderTopColor);
    rv.stripComment = node.firstChild.nodeType === 3;
//}}}!mb
    return rv;
}

})(window, document, Object.prototype.toString, Array.isArray);
