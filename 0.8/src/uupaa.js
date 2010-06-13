/*!{id:"uupaa.js",ver:0.8,license:"MIT",author:"uupaa.js@gmail.com"}*/

// === Core ===

// * Manual http://code.google.com/p/uupaa-js/w/list

var uu; // window.uu - uupaa.js library namespace

uu || (function(win, // @param GlobalObject: as window
                doc, // @param DocumentObject: as document
                parseInt, parseFloat, getComputedStyle, JSON) { // minify

var _prototype = "prototype",
    _rootNode = doc.documentElement,
    _toString = Object[_prototype].toString,
    _isArray = Array.isArray || (Array.isArray = ArrayIsArray), // ES5 spec
    // --- HTML5: EMBEDDING CUSTOM NON-VISIBLE DATA ---
    _uufx = "data-uufx",
    _uuguid = "data-uuguid",
    _uuevent = "data-uuevent",
    // --- minify ---
    _createTextNode = "createTextNode",
    _createElement = "createElement",
    _getAttribute = "getAttribute",
    _appendChild = "appendChild",
    _nextSibling = "nextSibling",
    _parentNode = "parentNode",
    _firstChild = "firstChild",
    _visibility = "visibility",
    _lastChild = "lastChild",
    _nodeType = "nodeType",
    _replace = "replace",
    _indexOf = "indexOf",
    _display = "display",
    _number = "number",
    _string = "string",
    _height = "height",
    _width = "width",
    _false = !1,
    _true = !0,
    _nop = function() {},
    _dd2num = {},               // dd2num = { "00":   0 , ... "99":  99  }
    _num2dd = {},               // num2dd = {    0: "00", ...   99: "99" }
    _bb2num = {},               // bb2num = { "\00": 0, ... "\ff": 255 }
    _num2bb = {},               // num2bb = { 0: "\00", ... 255: "\ff" }
    _hh2num = {},               // hh2num = { "00": 0, ... "ff": 255 }
    _num2hh = { 256: "00" },    // num2hh = { 0: "00", ... 255: "ff" }
    // --- version detection ---
    _ver = detectVersions(0.8),
    _ie = _ver.ie,
    _gecko = _ver.gecko,
    _opera = _ver.opera,
    _webkit = _ver.webkit;

// --- HTML5 NEXT ---
// http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html
doc.html || (doc.html = _rootNode);        // document.html = <html>
doc.head || (doc.head = uutag("head")[0]); // document.head = <head>

// --- LIBRARY STRUCTURE ---
uu = uumix(uufactory, {             // uu(expression:NodeSet/Node/NodeArray/ClassNameString/window,
                                    //    arg1:NodeSet/Node/Expression/Mix = void,
                                    //    arg2:Mix = void,
                                    //    arg3:Mix = void,
                                    //    arg4:Mix = void):Instance/NodeSet
                                    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Class.MyClass(arg1, arg2)
                                    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> NodeSet
    config:   uuarg(win.uuconfig, { // uu.config - Hash: user configurations
        log:        "log"           //  uu.log() target node
    }),
    ver:            _ver,           // uu.ver - Hash: detected version and plugin informations
    ie:             _ie,
    gecko:          _gecko,
    opera:          _opera,
    webkit:         _webkit,
    // --- AJAX ---
    ajax:     uumix(uuajax, {       // uu.ajax(url:String, option:Hash, callback:Function)
        xhr:        uuajaxxhr,      // uu.ajax.xhr():XMLHttpRequest
        binary:     uuajaxbinary    // uu.ajax.binary(url:String, option:Hash, callback:Function)
    }),
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
        types:      {}
    }),
    isNumber:       isNumber,       //   uu.isNumber(search:Mix):Boolean
    isString:       isString,       //   uu.isString(search:Mix):Boolean
    isFunction:     isFunction,     // uu.isFunction(search:Mix):Boolean
    // --- HASH / ARRAY ---
    arg:            uuarg,          // uu.arg(arg1:Hash/Function = {}, arg2:Hash, arg3:Hash = void):Hash/Function
    mix:            uumix,          // uu.mix(base:Hash/Function, flavor:Hash, aroma:Hash = void,
                                    //        override:Boolean = true):Hash/Function
    each:           uueach,         // uu.each(source:Hash/Array, evaluator:Function, arg:Mix = void)
    keys:           uukeys,         // uu.keys(source:Hash/Array):Array
    values:         uuvalues,       // uu.values(source:Hash/Array):Array
    hash:     uumix(uuhash, {       // uu.hash(key:Hash/String, value:Mix = void):Hash
                                    //  [1][through Hash]           uu.hash({ key: "val" }) -> { key: "val" }
                                    //  [2][key/value pair to hash] uu.hash("key", mix)     -> { key: mix }
        has:        uuhas,          //     uu.hash.has(source:Hash, search:Hash):Boolean
        nth:        uunth,          //     uu.hash.nth(source:Hash, index:Number):Array
        size:       uusize,         //    uu.hash.size(source:Hash):Number
        clone:      uuclone,        //   uu.hash.clone(source:Hash):Hash
        indexOf:    uuindexof,      // uu.hash.indexOf(source:Hash, search:Mix):String/void
        dd2num:     _dd2num,        // uu.hash.dd2num - { "00":   0 , ... "99":  99  }
        num2dd:     _num2dd,        // uu.hash.num2dd - {    0: "00", ...   99: "99" }
        bb2num:     _bb2num,        // uu.hash.bb2num - { "\00": 0, ... "\ff": 255 }
        num2bb:     _num2bb,        // uu.hash.num2bb - { 0: "\00", ... 255: "\ff" }
        hh2num:     _hh2num,        // uu.hash.hh2num - { "00": 0, ... "ff": 255 }
        num2hh:     _num2hh         // uu.hash.num2hh - { 0: "00", ... 255: "ff" }
    }),
    array:    uumix(uuarray, {      // uu.array(source:Array/Mix/NodeList/Arguments,
                                    //          sliceStart:Number = void,
                                    //          sliceEnd:Number = void):Array
                                    //  [1][through Array]      uu.array([1, 2])    -> [1, 2]
                                    //  [2][mix to Array]       uu.array(mix)       -> [mix]
                                    //  [3][NodeList to Array]  uu.array(NodeList)  -> [node, ...]
                                    //  [4][arguments to Array] uu.array(arguments) -> [arg, ...]
                                    //  [5][to Array + slice]   uu.array(uu.tag("*"), 1, 3) -> [<head>, <meta>]
        has:        uuhas,          // uu.array.has(source:Array, search:Array):Boolean
        nth:        uunth,          // uu.array.nth(source:Array, index:Number):Array
        dump:       uudump,         // uu.array.dump(source:ByteArray, type:String = "HEX"):String
                                    //  [1][ByteArray dump] uu.array.dump([1, 2, 3]) -> "010203"
                                    //  [2][ByteArray dump] uu.array.dump([1, 2, 3], "0x", ", 0x") -> "0x01, 0x02, 0x03"
        size:       uusize,         // uu.array.size(source:Array):Number
        sort:       uusort,         // uu.array.sort(source:Array, method:String/Function = "A-Z"):Array
        clean:      uuclean,        // uu.array.clean(source:Array):Array
        clone:      uuclone,        // uu.array.clone(source:Array):Array
        toHash:     uutohash,       // uu.array.toHash(key:Array, value:Array/Mix, toNumber:Boolean = false):Hash
        unique:     uuunique        // uu.array.unique(source:Array, literalOnly:Boolean = false):Array
    }),
    // --- ATTRIBUTE ---
    attr:           uuattr,         // uu.attr(node:Node, key:String/Hash = void,
                                    //                    value:String = void):String/Hash/Node
                                    //  [1][get all pair]   uu.attr(node) -> { key: value, ... }
                                    //  [2][get value]      uu.attr(node, key) -> "value"
                                    //  [3][set pair]       uu.attr(node, key, "value") -> node
                                    //  [4][set pair]       uu.attr(node, { key: "value", ... }) -> node
                                    //  [5][remove attr]    uu.attr(node, key, null) -> node
    // --- DATASET ---
    data:     uumix(uudata, {       // uu.data(node:Node, key:String/Hash = void,
                                    //                    value:Mix: = void):Hash/Mix/Node/undefined
                                    //  [1][get all pair]   uu.data(node) -> { key: value, ... }
                                    //  [2][get value]      uu.data(node, key) -> value
                                    //  [3][set pair]       uu.data(node, key, value) -> node
                                    //  [4][set pair]       uu.data(node, { key: value, ... }) -> node
        clear:      uudataclear,    // uu.data.clear(node:Node, key:String = void):Node
                                    //  [1][clear all pair] uu.data.clear(node) -> node
                                    //  [2][clear pair]     uu.data.clear(node, key) -> node
        bind:       uudatabind,     // uu.data.bind(key:String, callback:Function)
        unbind:     undataunbind    // uu.data.unbind(key:String)
    }),

    // --- CSS / STYLE / STYLESHEET / VIEW PORT ---
    css:      uumix(uucss, {        // uu.css(node:Node, key:Boolean/String/Hash = void,
                                    //                   value:String = void):Hash/String/Node
                                    //  [1][getComputedStyle(or currentStyle)] uu.css(node)       -> { key: value, ... }
                                    //  [2][getComputedStyle(+ px unitize)   ] uu.css(node, true) -> { key: value, ... }
                                    //  [3][get node.style value]              uu.css(node, key)  -> value
                                    //  [4][set node.style pair]               uu.css(node, key, value) -> node
                                    //  [5][set node.style pair]               uu.css(node, { key: value, ... }) -> node
        show:       uucssshow,      // uu.css.show(node:Node, duration:Number = 0, displayValue:String= "block"):Node
        hide:       uucsshide,      // uu.css.hide(node:Node, duration:Number = 0):Node
        isShow:     uucssisshow,    // uu.css.isShow(node:Node/CSSProperties):Boolean
        opacity:    uucssopacity    // uu.css.opacity(node:Node, value:Number/String):Number/Node
                                    //  [1][get opacity] uu.css.opacity(node) -> 0.5
                                    //  [2][set opacity] uu.css.opacity(node, 0.5) -> node
    }),
    style:          uustyle,        // uu.style(id:String):StyleSheet
    unit:           uuunit,         // uu.unit(node:Node, value:Number/CSSUnitString,
                                    //                    quick:Boolean = false,
                                    //                    prop:String = "left"):Number
                                    //  [1][convert pixel]  uu.unit(<div>, 123) -> 123
                                    //  [2][convert pixel]  uu.unit(<div>, "12px") -> 12
                                    //  [3][convert pixel]  uu.unit(<div>, "12em") -> 192
                                    //  [4][convert pixel]  uu.unit(<div>, "12pt") -> 16
                                    //  [5][convert pixel]  uu.unit(<div>, "auto") -> 100
                                    //  [6][convert pixel]  uu.unit(<div>, "auto", 0, "borderTopWidth") -> 0
    fx:       uumix(uufx, {         // uu.fx(node:Node, duration:Number, param:Hash/Function = void):Node
                                    //  [1][abs]             uu.fx(node, 500, { o: 0.5, x: 200 })
                                    //  [2][rel]             uu.fx(node, 500, { h: "+100", o: "+0.5" })
                                    //  [3][with "px" unit]  uu.fx(node, 500, { h: "-100px" })
                                    //  [4][with easing fn]  uu.fx(node, 500, { h: [200, "easeInOutQuad"] })
                                    //  [5][set fps]         uu.fx(node, 500, { fps: 30, w: 40 })
                                    //  [6][standby]         uu.fx(node, 2000)
                                    //  [7][after callback]  uu.fx(node, 500, { o: 1, after: afterCallback })
                                    //  [8][before callback] uu.fx(node, 500, { o: 1, before: beforeCallback })
                                    //  [9][revert]          uu.fx(node, 500, { o: 1, r: 1 })
        skip:       uufxskip,       // uu.fx.skip(node:Node = null, all:Boolean = false):Node/NodeArray
        isBusy:     uufxisbusy      // uu.fx.isBusy(node:Node):Boolean
    }),
    viewport: {
        size:       uuviewportsize  // uu.viewport.size():Hash { innerWidth, innerHeight, pageXOffset, pageYOffset }
    },
    // --- QUERY ---
    id:             uuid,           //    uu.id(expression:String, context:Node = document):Node/null
    tag:            uutag,          //   uu.tag(expression:String, context:Node = document):NodeArray
    match:          uumatch,        // uu.match(cssSelector:String, context:Node = document):Boolean
    query:          uuquery,        // uu.query(cssSelector:CSSQueryString, context:NodeArray/Node = document):NodeArray
    // --- Node.className, Node.classList ---
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
                    uuclasssingleton,
        NodeSet:    NodeSet,
        MsgPump:    MsgPump
    }),
    // --- EVENT ---
    event:    uumix(uuevent, {      // uu.event(node:Node, eventTypeEx:EventTypeExString,
                                    //                     evaluator:Function/Instance):Node
                                    //  [1][bind a event]            uu.event(node, "click", fn)             -> node
                                    //  [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
                                    //  [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
                                    //  [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node
        has:        uuhas,          // uu.event.has(node:Node, eventTypeEx:EventTypeExString):Boolean
        fire:       uueventfire,    // uu.event.fire(node:Node, eventType:String, param:Mix = void):Node
        stop:       uueventstop,    // uu.event.stop(event:EventObjectEx)
        unbind:     uueventunbind,  // uu.event.unbind(node:Node, eventTypeEx:EventTypeExString = void):Node
        attach:     uueventattach,  // uu.event.attach(node:Node, eventType:String, evaluator:Function,
                                    //                                              useCapture:Boolean = false)
        detach:     uueventdetach   // uu.event.detach(node:Node, eventType:String, evaluator:Function,
                                    //                                              useCapture:Boolean = false)
    }),
    // --- NODE / NodeList ---
    svg:            uusvg,          //  uu.svg(tagName:String = "svg", attr:Hash = void):SVGNode
    node:     uumix(uunode, {       // uu.node(tagName:String = "div",
                                    //         var_args:Node/String/Number/Hash = void, ...):Node
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
                                    //        <div id="firstSibling">    ^  </div>
                                    //        <div id="prevSibling">     -  </div>
                                    //        <div id="contextNode">
                                    //            <div id="firstChild">  .^ </div>
                                    //            <div>-----</div>
                                    //            <div id="lastChild">   .$ </div>
                                    //        </div>
                                    //        <div id="nextSibling">     +  </div>
                                    //        <div id="lastSibling">     $  </div>
                                    //    </div>
                                    //
        has:        uuhas,          // uu.node.has(parent:Node, child:Node):Boolean
        bulk:       uunodebulk,     // uu.node.bulk(source:Node/HTMLFragment, context:Node = <div>):DocumentFragment
        find:       uunodefind,     // uu.node.find(parent:Node, position:String = ".$"):Node/null
                                    //  [1][find firstSibling] uu.node.find(document.body, "^") -> <head>
                                    //  [2][find prevSibling]  uu.node.find(document.body, "-") -> <head>
                                    //  [3][find nextSibling]  uu.node.find(document.head, "+") -> <body>
                                    //  [4][find lastSibling]  uu.node.find(document.head, "$") -> <body>
                                    //  [5][find firstChild]   uu.node.find(document.body, ".^") -> <h1>  in <body><h1 /><div /></body>
                                    //  [6][find lastChild]    uu.node.find(document.body, ".$") -> <div> in <body><h1 /><div /></body>
        path:       uunodepath,     // uu.node.path(node:Node):CSSQueryString
                                    //  [1][get CSSQueryString] uu.node.path(<div>) -> "body>div"
        swap:       uunodeswap,     // uu.node.swap(swapin:Node, swapout:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        clear:      uunodeclear,    // uu.node.clear(parent:Node):Node
        remove:     uunoderemove,   // uu.node.remove(node:Node):Node
        builder:    uunodebuilder,  // uu.node.builder(handler:Function)
                                    //  [1][set   handler] uu.node.builder(function(uu, node, ticket, nodeid) {...})
                                    //  [2][clear handler] uu.node.builder(null)
        indexOf:    uunodeindexof,  // uu.node.indexOf(node:Node):Number
        children:   uunodechildren  // uu.node.children(parent:Node):NodeArray
    }),
    // --- NodeID ---
    nodeid:   uumix(uunodeid, {     // uu.nodeid(node:Node):Number (nodeid)
        toNode:     uunodeidtonode, // uu.nodeid.toNode(nodeid:Number):Node
        remove:     uunodeidremove  // uu.nodeid.remove(node:Node):Node (removed node)
    }),
    // --- NodeBuilder ---
    html:           uuhtml,         // uu.html(node:Node, html:HTMLFragmentString = ""):HTMLFragmentString/Node
                                    //  [1][get innerHTML] uu.html(node) -> "<div>...</div>"
                                    //  [2][set innerHTML] uu.html(node, "<div>...</div>") -> node
    head:           uuhead,         // uu.head(/* var_args(node,attr,css,buildid) */):<head>
    body:           uubody,         // uu.body(/* var_args(node,attr,css,buildid) */):<body>
    text:           uutext,         // uu.text(data:String/FormatString/Node,
                                    //         text:String/Mix(= void), var_args:Mix, ...):String/Node
                                    //  [1][create text node]          uu.text("text")            -> createTextNode("text")
                                    //  [2][create formated text node] uu.text("?? ??", "a", "b") -> createTextNode("a b")
                                    //  [3][get text]                  uu.text(node)              -> "text"
                                    //  [4][set text]                  uu.text(node, "text")      -> node
                                    //  [5][set formated text]         uu.text(node, "??", "a")   -> node
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
        comma:      uusplitcomma,   // uu.split.comma(" ,A, B ,C, ") -> ["A","B","C"]
        toHash:     uusplittohash   // uu.split.toHash(source:String, splitter:String = ",", toNumber:Boolean = false):Hash
                                    //  [1][hash from string] uu.split.toHash("key,1,key2,1", ",") -> { key: 0, key2: 1 }
    }),
    format:         uuformat,       // uu.format(format:FormatString, var_args, ...):String
                                    //  [1][placeholder] uu.format("?? dogs and ??", 101, "cats") -> "101 dogs and cats"
    // --- JSON ---
    json:     uumix(uujson, {       // uu.json(source:Mix, useNativeJSON:Boolean = false,
                                    //                     callback:Function = void):JSONString
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
    // --- FLASH ---
//{{{!mb
    flash:          uuflash,        // uu.flash(url:String, option:FlashOptionHash):Node/null/void
//}}}!mb
    // --- NUMBER ---
    guid:           uuguid,         // uu.guid():Number - build GUID
    // --- DEBUG ---
    puff:           uupuff,         // uu.puff(source:Mix/FormatString, var_args:Mix, ...)
    log:      uumix(uulog, {        // uu.log(log:Mix, var_args:Mix, ...)
        clear:      uulogclear      // uu.log.clear()
    }),
    // --- EVALUATION ---
    ready:    uumix(uuready, {      // uu.ready(readyEventType:IgnoreCaseString = "dom", callback:Function, ...)
        fire:       uureadyfire,    // uu.ready.fire(readyEventType:String, param:Mix = void)
        dom:        _false,         // true is DOMContentLoaded event fired
        window:     _false,         // true is window.onload event fired
        audio:      _false,         // true is <audio> ready event fired
        video:      _false,         // true is <video> ready event fired
        canvas:     _false,         // true is <canvas> ready event fired
        storage:    _false,         // true is window.localStorage ready event fired
        reload:     _false          // true is blackout (css3 cache reload)
    }, detectFeatures(_ver)),
    // --- OTHER ---
    ui:             {},             // uu.ui - ui namespace
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    nop:            _nop            // uu.nop() - none operation
});

// --- CONSTRUCTION ---
uu.config.baseDir || (uu.config.baseDir =
    uutag("script").pop().src[_replace](/[^\/]+$/, function(file) {
        return file === "uupaa.js" ? "../" : "";
    }));

// --- MsgPump class ---
MsgPump[_prototype] = {
    send:           uumsgsend,      // MsgPump.send(address:Array/Mix, message:String, param:Mix = void):Array/Mix
                                    //  [1][multicast] MsgPump.send([instance, ...], "hello") -> ["world!", ...]
                                    //  [2][unicast  ] MsgPump.send(instance, "hello") -> ["world!"]
                                    //  [3][broadcast] MsgPump.send(null, "hello") -> ["world!", ...]
    post:           uumsgpost,      // MsgPump.post(address:Array/Mix, message:String, param:Mix = void)
                                    //  [1][multicast] MsgPump.post([instance, ...], "hello")
                                    //  [2][unicast  ] MsgPump.post(instance, "hello")
                                    //  [3][broadcast] MsgPump.post(null, "hello")
    bind:           uumsgbind,      // MsgPump.bind(instance:Instance)
    unbind:         uumsgunbind     // MsgPump.unbind(instance:Instance)
};

uu.msg = new MsgPump();             // uu.msg - MsgPump instance

// --- StyleSheet class ---
uuclass("StyleSheet", {
    init:           StyleSheetInit, //
    add:            StyleSheetAdd,  //
    clear:          StyleSheetClear //
});

// --- ECMAScript-262 5th ---
function ArrayIsArray(search) { // @param Mix: search
                                // @return Boolean:
    return _toString.call(search) === "[object Array]";
}

uumix(Array[_prototype], {
//{{{!mb
    map:            ArrayMap,       //         map(evaluator:Function, that:this = void):Array
    some:           ArraySome,      //        some(evaluator:Function, that:this = void):Boolean
    every:          ArrayEvery,     //       every(evaluator:Function, that:this = void):Boolean
    filter:         ArrayFilter,    //      filter(evaluator:Function, that:this = void):Array
    forEach:        ArrayForEach,   //     forEach(evaluator:Function, that:this = void)
    indexOf:        ArrayIndexOf,   //     indexOf(search:Mix, fromIndex:Number = 0):Number
    lastIndexOf:                    // lastIndexOf(search:Mix, fromIndex:Number = this.length):Number
                    ArrayLastIndexOf,
//}}}!mb
    reduce:         ArrayReduce,    //      reduce(evaluator:Function, initialValue:Mix = void):Mix
    reduceRight:                    // reduceRight(evaluator:Function, initialValue:Mix = void):Mix
                    ArrayReduceRight
}, 0, 0);

uumix(Boolean[_prototype], {
    toJSON:         NumberToJson    //      toJSON():String
}, 0, 0);

uumix(Date[_prototype], {
    toISOString:    DateToISOString,// toISOString():String
    toJSON:         DateToISOString //      toJSON():String
}, 0, 0);

uumix(Number[_prototype], {
    toJSON:         NumberToJson    //      toJSON():String
}, 0, 0);

uumix(String[_prototype], {
    trim:           StringTrim,     //        trim():String
    toJSON:         StringToJson    //      toJSON():String
}, 0, 0);

//{{{!mb
_gecko && !HTMLElement[_prototype].innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innerTextGetter);
    proto.__defineSetter__("innerText", innerTextSetter);
    proto.__defineGetter__("outerHTML", outerHTMLGetter);
    proto.__defineSetter__("outerHTML", outerHTMLSetter);
})(HTMLElement[_prototype]);
//}}}!mb

(function(map, ary1, ary2, n, i, j, v) {
    for (; i < 16; ++i) {
        for (j = 0; j < 16; ++n, ++j) {
            _num2hh[n] = v = ary1[i] + ary1[j];
            _hh2num[v] = n;
            _num2bb[n] = v = String.fromCharCode(n);
            _bb2num[v] = n;
        }
    }
    for (n = i = 0; i < 10; ++i) {
        for (j = 0; j < 10; ++n, ++j) {
            _num2dd[n] = v = ary2[i] + ary2[j];
            _dd2num[v] = n;
        }
    }
})("0123456789abcdef".split(""), "0123456789".split(""), 0, 0);

// ===================================================================

// [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Class.MyClass(arg1, arg2)
// [2][NodeSet factory] uu("div>ul>li", <body>) -> NodeSet

// uu - factory
function uufactory(expression, // @param NodeSet/Node/NodeArray/ClassNameString/window: ClassName or Expression
                   arg1,       // @param NodeSet/Node/Expression/Mix(= void): ClassName.init arg1 or Expression.context
                   arg2,       // @param Mix(= void): ClassName.init arg2
                   arg3,       // @param Mix(= void): ClassName.init arg3
                   arg4) {     // @param Mix(= void): ClassName.init arg4
                               // @return Instance/NodeSet:
    // class factory
    if (typeof expression === _string && uuclass[expression]) {
        return new uuclass[expression](arg1, arg2, arg3, arg4);
    }
    // NodeSet factory
    return new NodeSet(expression, arg1, arg2, arg3, arg4);
}

// --- AJAX ---
// uu.ajax
function uuajax(url,        // @param String: url
                option,     // @param Hash: { timeout, header, data, ifmod, method,
                            //                binary, before, after }
                            //    option.data    - Mix: upload data
                            //    option.method  - String: "GET", "POST", "PUT"
                            //    option.timeout - Number(= 10): timeout sec
                            //    option.binary  - Boolean(= false): true is binary data
                            //    option.before  - Function: before({ option }, xhr)
                            //    option.after   - Function: after({ option, ok }, xhr)
                callback) { // @param Function: callback({ data, option, ok })
                            //    data   - String: xhr.responseText
                            //    option - Hash:
                            //    ok     - Boolean:
    function readyStateChange() {
        if (xhr.readyState === 4) {
            var code = xhr.status, lastModified,
                rv = { data: null, option: option,
                       ok: code >= 200 && code < 300 };

            if (!run++) {
                if (rv.ok) {
                    rv.data = getbinary
                            ? (
//{{{!mb
                               _ie ? toByteArrayIE(xhr) :
//}}}!mb
                                     toByteArray(xhr.responseText))
                            : (xhr.responseText || "");
                    // --- "Last-Modified" ---
                    if (ifmod) {
                        lastModified = xhr.getResponseHeader("Last-Modified");
                        if (lastModified) {
                            cache[url] = uudate(Date.parse(lastModified)).GMT(); // add cache
                        }
                    }
                }
                after && after(rv, xhr);
                callback(rv);
                gc();
            }
        }
    }

    function ng(abort) {
        if (!run++) {
            var rv = { ok: _false, data: null, option: option };

            after && after(rv, xhr);
            callback(rv);
            gc(abort);
        }
    }

    function gc(abort) {
        abort && xhr && xhr.abort && xhr.abort();
        watchdog && (clearTimeout(watchdog), watchdog = 0);
        xhr = null;
//{{{!mb
        uueventdetach(win, "beforeunload", ng); // [Gecko]
//}}}!mb
    }

    var watchdog = 0,
        method = option.method || "GET",
        header = option.header || [],
        before = option.before,
        after = option.after,
        ifmod = option.ifmod,
        cache = uuajax.cache,
        xhr = uuajaxxhr(),
        run = 0, v, i = -1,
        override = xhr.overrideMimeType,
        getbinary = method === "GET" && option.binary;

    try {
        xhr.onreadystatechange = readyStateChange;
        xhr.open(method, url, _true); // ASync

        before && before({ option: option }, xhr);

        if (getbinary && override) {
            override("text/plain; charset=x-user-defined");
        }
        if (ifmod && cache[url]) { // cached
            header.push("If-Modified-Since", cache[url]); // GMT
        }
        if (option.data) {
            header.push("Content-Type", "application/x-www-form-urlencoded");
        }
        while ( (v = header[++i]) ) {
            xhr.setRequestHeader(v, header[++i]);
        }
//{{{!mb
        uueventattach(win, "beforeunload", ng); // [Gecko]
//}}}!mb

        xhr.send(option.data || null);
        watchdog = setTimeout(function() {
            ng(1); // 408: Request Time-out
        }, (option.timeout || 10) * 1000);
    } catch (err) {
        xhr = { status: 400 };
        ng(); // 400: Bad Request
    }
}
uuajax.cache = {}; // { "url": DateHash(lastModified), ... }

// uu.ajax.xhr - create XMLHttpRequest object
function uuajaxxhr() { // @return XMLHttpRequest:
    var xhr = win["XMLHttpRequest"];

    return xhr ? new xhr
//{{{!mb
               : win["ActiveXObject"] ? new ActiveXObject("Msxml2.XMLHTTP")
//}}}!mb
               : null;
}

// uu.ajax.binary - upload / download binary data
function uuajaxbinary(url, option, callback) {
    option.method = option.data ? "GET" : "PUT";
    option.binary = _true;
    uuajax(url, option, callback);
}

// uu.require - require
function uurequire(url,      // @param String: url
                   option) { // @param Hash: { before, after }
                             //     option.before - Function: before({ option }, xhr)
                             //     option.after  - Function: after({ option, ok }, xhr)
                             // @return Hash: { data, option, ok }
    var rv = { data: "", option: option, ok: _true },
        xhr = uuajaxxhr(), code,
        before = option.before,
        after = option.after;

    try {
        xhr.open("GET", url, _false); // sync
        before && before(rv, xhr);
        xhr.send(null);

        code = xhr.status;
        rv.ok = code >= 200 && code < 300;
        rv.data = xhr.responseText;
        after && after(rv, xhr);
        xhr = null;
    } catch (err) {
        rv.ok = _false;
    }
    return rv;
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
    var ltype = uutype(lhs);

    if (ltype !== uutype(rhs)) {
        return _false;
    }
    switch (ltype) {
    case uutype.FUNCTION:   return _false;
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
             types[_toString.call(search)] ||
             (!search ? uutype.NULL
                      : search[_nodeType] ? uutype.NODE
                                          : "length" in search ? uutype.FAKEARRAY
                                                               : uutype.HASH);

    return match ? !!(match & rv) : rv;
}

uueach({ 0x20: void 0, 0x40: _true, 0x100: 0, 0x200: "" }, function(v, i) {
    uutype.types[typeof v] = +i;
});
uueach({ 0x40: _true, 0x80: _nop, 0x100: 0, 0x200: "", 0x400: [],
         0x8: new Date, 0x800: /0/, 0x4: doc.links }, function(v, i) {
    i & 4 || (uutype.types[_toString.call(v)] = +i);
});

// uu.isNumber - is number
function isNumber(search) { // @param Mix: search
                            // @return Boolean:
    return typeof search === _number;
}

// uu.isString - is string
function isString(search) { // @param Mix: search
                            // @return Boolean:
    return typeof search === _string;
}

// uu.isFunction - is function
function isFunction(search) { // @param Mix: search
                              // @return Boolean:
    return _toString.call(search) === "[object Function]";
}

// --- hash / array ---

// [1][supply args]         uu.arg({ a: 1 }, { b: 2 }) -> { a: 1, b: 2 }

// uu.arg - supply default arguments
function uuarg(arg1,   // @param Hash/Function(= {}): arg1
               arg2,   // @param Hash: arg2
               arg3) { // @param Hash(= void): arg3
                       // @return Hash/Function: new Hash(mixed args) or arg1 + args
    return isFunction(arg1) ? uumix(arg1, arg2, arg3)
                            : uumix(uumix({}, arg1 || {}), arg2, arg3, 0);
}

// [1][override value]      uu.mix({a:9, b:9}, {a:1}, {b:2})    -> { a: 1, b: 2 }
// [2][stable value]        uu.mix({a:9, b:9}, {a:1}, {b:2}, 0) -> { a: 9, b: 9 }

// uu.mix - mixin
function uumix(base,       // @param Hash/Function: mixin base
               flavor,     // @param Hash: add flavor
               aroma,      // @param Hash(= void): add aroma
               override) { // @param Boolean(= true): true is override
                           // @return Hash/Function: base
    var i;

    if (override || override === i) { // override === void 0 // [1][3]
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
function uueach(source,    // @param Hash/Array: source
                evaluator, // @param Function: evaluator
                arg) {     // @param Mix(= void):
    if (_isArray(source)) {
        !arg ? source.forEach(evaluator)
             : source.forEach(function(v, i) {
                    evaluator(v, i, arg);
               });
    } else {
        for (var i in source) {
            evaluator(source[i], i, arg); // evaluator(value, index, arg)
        }
    }
}

// [1][Hash.keys]           uu.keys({ a: 1, b: 2 }) -> ["a", "b"]
// [2][Array.keys]          uu.keys([1, 2]) -> [0, 1]

// uu.keys - enum keys
function uukeys(source,           // @param Hash/Array: source
                __enumValues__) { // @hidden Number(= 0): 1 is enum values
                        // @return Array: [key, ... ]
    var rv = [], ri = -1, i, iz, keys = Object.keys;

    if (_isArray(source)) {
        for (i = 0, iz = source.length; i < iz; ++i) {
            i in source && (rv[++ri] = __enumValues__ ? source[i] : i);
        }
    } else {
        if (!__enumValues__ && keys) {
            return keys(source);
        }
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                rv[++ri] = __enumValues__ ? source[i] : i;
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
    return uukeys(source, 1);
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

    return sliceStart ? (sliceEnd ? rv.slice(sliceStart, sliceEnd)
                                  : rv.slice(sliceStart)) : rv;
}

// [1][Array has Array] uuhas([1, 2], [1]) -> true
// [2][Hash has Hash]   uuhas({ a: 1, b: 2 }, { a: 1 }) -> true
// [3][Node has Event]  uuhas(node, "namespace.click") -> true
// [4][Node has Node]   uuhas(parentNode, childNode) -> true
// [5][Array has Mix]   uuhas([1, 2], 1) -> true
// [6][Array has Mix]   uuhas([1, "a"], "a") -> true

// inner - has
function uuhas(source,   // @param Hash/Array/Node: source
               search) { // @param Hash/Array/Node/String: search element
                         // @return Boolean:
    if (source && search) {
        var i = 0, iz;

        if (source[_nodeType]) {
            // [3]
            if (isString(search)) {
                i = source[_uuevent];
                return (i ? i.types : "")[_indexOf]("," + search + ",") >= 0;
            }
            // [4]
            for (i = search; i && i !== source; i = i[_parentNode]) {
            }
            return search !== source && i === source;
        }

        if (_isArray(source)) { // [1]
            search = uuarray(search);

            for (iz = search.length; i < iz; ++i) {
                if (i in search && source[_indexOf](search[i]) < 0) {
                    return _false;
                }
            }
        } else { // [2]
            for (i in search) {
                if (!(i in source)
                    || (source[i] !== search[i]
                        && _json(source[i]) !== _json(search[i]))) {
                    return _false;
                }
            }
        }
        return _true;
    }
    return _false;
}

// [1][Hash nth ]           uunth({ a: 1, b: 2 }, 1) -> ["b", 2]
// [2][Array nth]           uunth(["a", 100], 1)     -> [1, 100]

// inner - nth pair
function uunth(source,  // @param Hash/Array: source
               index) { // @param Number: index
                        // @return Array: [key, value]
                        //                or [undefined, undefined] (not found)
    var i, j = 0, undef;

    if (_isArray(source)) {
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

// [1][Hash.length]         uusize({ a: 1, b: 2 }) -> 2
// [2][Array.length]        uusize([1,2]) -> [1,2]

// inner - get length
function uusize(source) { // @param Hash/Array: source
                          // @return Number:
    return (_isArray(source) ? source : uukeys(source)).length;
}

// [1][Hash.clone]          uuclone({ a: 1, b: 2 }) -> { a: 1, b: 2 }
// [2][Array.clone]         uuclone([1,2]) -> [1,2]

// inner - clone hash, clone array
function uuclone(source) { // @param Hash/Array: source
                           // @return Hash/Array: cloned hash/array
    return _isArray(source) ? source.concat() : uumix({}, source);
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

// [1][ascii sort a-z]      uusort(["a","z"], "A-Z") -> ["a", "z"]
// [2][ascii sort a-z]      uusort(["a","z"], "Z-A") -> ["z", "a"]
// [3][numeric sort 0-9]    uusort([0,1,2], "0-9")   -> [0, 1, 2]
// [4][numeric sort 9-0]    uusort([0,1,2], "9-0")   -> [2, 1, 0]

// inner - sort array
function uusort(source,   // @param Array: source
                method) { // @param String/Function(= "A-Z"): method
                          //                   sort method or callback-function
                          // @return Array:
    // 0x1 = numeric sort
    // 0x2 = reverse
    var r = { "A-Z": 0, "Z-A": 2, "0-9": 1, "9-0": 3 }[method] || 0;

    (r & 1) ? source.sort(function(a, b) {
                            return a - b;
                          })
            : source.sort();
    return (r & 2) ? source.reverse() : source;
}

// [1][Array.clean]         uuclean([,,1,2,,]) -> [1,2]

// inner -array compaction, trim null and undefined elements
function uuclean(source) { // @param Array: source
                           // @return Array: clean Array
    if (_isArray(source)) {
        var rv = [], i = 0, iz = source.length;

        for (; i < iz; ++i) {
            i in source && source[i] != null // skip null or undefined
                        && rv.push(source[i]);
        }
        return rv;
    }
    return source;
}

// [1][unique elements]     uuunique([<body>, <body>]) -> [<body>]
// [2][unique literals]     uuunique([0,1,2,1,0], true) -> [0,1,2]

// inner - make array from unique element(trim null and undefined elements)
function uuunique(source,        // @param Array: source
                  literalOnly) { // @param Boolean(= false): true is literal only(quickly)
                                 // @return Array:
    var rv = [], ri = -1, v, i = 0, j, iz = source.length,
        literal = !!literalOnly,
        found,
        unique = {};

    for (; i < iz; ++i) {
        v = source[i];
        if (v != null) { // v === null or v === undefined
            if (literal) { // [2]
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

//  [1][ByteArray dump] uu.array.dump([1, 2, 3]) -> "010203"
//  [2][ByteArray dump] uu.array.dump([1, 2, 3], "0x", ", 0x") -> "0x01, 0x02, 0x03"

// uu.array.dump - dump ByteArray
function uudump(source,     // @param ByteArray: [0x00, ... 0xff]
                prefix,     // @param String(= ""):
                splitter) { // @param String(= ""):
                            // @return String: "00010203"
    var rv = [], i = 0, iz = source.length, num2hh = _num2hh;

    for (; i < iz; ++i) {
        rv[i] = num2hh[source[i]];
    }
    return iz ? (prefix || "") + rv.join(splitter || "") : "";
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

    if (_isArray(value)) { // [1]
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
    if (arguments.length > 2) {     // [3] uu.attr(node, key, value)
        key = uuhash(key, value);
    } else if (isString(key)) {     // [2] uu.attr(node, key)
        rv = node[_getAttribute](fix[key] || key, 2) || "";
//{{{!mb
        _ver.ie && (rv += ""); // [IE6] tagindex, colspan is number
//}}}!mb
        return rv;
    }
    for (i in key) {
        key[i] === null ? node.removeAttribute(fix[i] || i)       // [5]
                        : node.setAttribute(fix[i] || i, key[i]); // [4]
    }
    return node;
}
uuattr.fix =
//{{{!mb
    !uuready[_getAttribute] ? { "for": "htmlFor", "class": "className" } : // [IE6][IE7]
//}}}!mb
                              { className: "class", htmlFor: "for" };

//  [1][get all pair]   uu.data(node) -> { key: value, ... }
//  [2][get value]      uu.data(node, key) -> value
//  [3][set pair]       uu.data(node, key, value) -> node
//  [4][set pair]       uu.data(node, { key: value, ... }) -> node

// uu.data - node data accessor [HTML5 spec - Embedding custom non-visible data]
function uudata(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param Mix(= void): value
                         // @return Hash/Mix/Node/undefined:
    var rv, i, prefix = "data-";

    if (key === void 0) { // [1] uu.data(node)
        rv = {};
        for (key in node) {
            key[_indexOf](prefix) || (rv[key.slice(5)] = node[key]);
        }
        return rv; // Hash
    }
    if (arguments.length > 2) { // [3] uu.data(node, key or "*", value)
        if (key === "*") {
            for (key in uudata(node)) {
                node[prefix + key] = value;
            }
        } else {
            node[prefix + key] = value;
        }
    } else if (isString(key)) { // [2]
        return node[prefix + key]; // Mix or undefined
    } else {
        for (i in key) {
            node[prefix + i] = key[i]; // [4]
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

// uu.data.bind - bind data handler
function uudatabind(key,        // @param String: "data-uu..."
                    callback) { // @param Function: callback function
    uudata.handler[key] = callback;
}

// uu.data.unbind - unbind data handler
function undataunbind(key) { // @param String: "data-uu..."
    delete uudata.handler[key];
}

// --- css ---
//  [1][getComputedStyle(or currentStyle)] uu.css(node)       -> { key: value, ... }
//  [2][getComputedStyle(+ px unitize)   ] uu.css(node, true) -> { key: value, ... }
//  [3][get node.style value]              uu.css(node, key)  -> value
//  [4][set node.style pair]               uu.css(node, key, value) -> node
//  [5][set node.style pair]               uu.css(node, { key: value, ... }) -> node

// uu.css - css accessor
function uucss(node,    // @param Node:
               key,     // @param Boolean/String/Hash(= void): key
               value) { // @param String(= void): value
                        // @return Hash/String/Node:
    var style, informal, formal, fix, care;

    if (key === _true || key === fix) { // key === void 0 // [1][2] uu.css(node), uu.css(node, true)
//{{{!mb
        if (getComputedStyle) {
//}}}!mb
            return getComputedStyle(node, 0);
//{{{!mb
        }
        return key ? getComputedStyleIE(node) : node.currentStyle;
//}}}!mb
    }

    fix = uufix.db;
    if (arguments.length > 2) { // [4] uu.css(node, key, value)
        key = uuhash(key, value);
    } else if (typeof key === _string) { // [3] uu.css(node, key)
//{{{!mb
        if (getComputedStyle) {
//}}}!mb
            return getComputedStyle(node, 0)[fix[key] || key] || "";
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

        if (typeof value === _number) {
            if (formal === "opacity") {
                uucssopacity(node, value);
                continue;
            }
            !care[formal] && (value += "px"); // number -> pixel value
        }
        style[formal] = value;
    }
    return node;
}
uucss.care = {
//{{{!mb
    zoom: 1, fontSizeAdjust: 1, // [CSS3]
//}}}!mb
    lineHeight: 1, fontWeight: 1, zIndex: 1
};

//  [1][abs]             uu.fx(node, 500, { o: 0.5, x: 200 })
//  [2][rel]             uu.fx(node, 500, { h: "+100", o: "+0.5" })
//  [3][with "px" unit]  uu.fx(node, 500, { h: "-100px" })
//  [4][with easing fn]  uu.fx(node, 500, { h: [200, "easeInOutQuad"] })
//  [5][set fps]         uu.fx(node, 500, { fps: 30, w: 40 })
//  [6][standby]         uu.fx(node, 2000)
//  [7][after callback]  uu.fx(node, 500, { o: 1, after: afterCallback })
//  [8][before callback] uu.fx(node, 500, { o: 1, before: beforeCallback })
//  [9][revert]          uu.fx(node, 500, { o: 1, r: 1 })

// uu.fx - add effect queue
function uufx(node,     // @param Node: animation target node
              duration, // @param Number: duration (unit ms)
              param) {  // @param Hash/Function(= void): { key: endValue, key: [endValue, easing], key: callback, ... }
                        //     key      - CSSPropertyString/String: "color", "opacity", "before", "after", ...
                        //     endValue - String/Number: end value, "red", "+0.5", "+100px"
                        //     easing   - String: easing function name, "easeInOutQuad"
                        //     callback - Function: before or after callback function
                        // @return Node:
    function loop() {
        var data = node[_uufx], q = data.q[0],
            pz = q.pz, reverse = data.r, tm, finished;

        if (q.tm) {
            tm = +new Date;
        } else {
            if (pz) {
                pz.init && pz.init(node, pz);
                pz.init = 0;
                pz.before && pz.before(node, pz, reverse); // before callback(node, param, reverse)
            }
            q.js = isFunction(pz) ? pz
                                  : pz ? uufxbuild(node, data, q)
                                       : _nop;
            tm = q.tm = +new Date;
        }
        finished = q.fin || (tm >= q.tm + q.dur);

        q.js(node, reverse, finished, tm - q.tm, q.dur); // js(node, node.style, reverse, finished, gain, duration)
        if (finished) { // finished
            pz && pz.after && pz.after(node, pz, reverse); // after callback(node, param, reverse)
            data.q.shift(); // remove first queue data

            if (!data.q.length) {
                if (!data.r && data.rq.length) {
                    data.q = data.q.concat(data.rq.reverse()); // data.q <- data.rq
                    data.rq = []; // clear
                    data.r = 1; // reverse
                    return;
                }
                clearInterval(data.id);
                data.id = data.r = 0;
            }
        }
    }

    var data = node[_uufx], p = uuarg(param, { r: 0, fps: 0 });

    node.style.overflow = "hidden";
    data || (node[_uufx] = data = { q: [], rq: [], id: 0, r: 0 }); // init effect queue

    if (data.r || data.rq.length) {
        data.q = data.q.concat(data.rq.reverse()); // data.q <- data.rq
        data.rq = []; // clear
        data.r && (data.r = 0); // reset reverse flag
    }

    // append queue data
    data.q.push({ tm: 0, guid: uuguid(),
                  dur: Math.max(duration, 1),
                  pz: p, fin: 0 }); // true/1 is finished
    data.id || (data.id = setInterval(loop, ((1000 / p.fps) | 0) || +_ie)); // [IE] setInterval(0) is Error
    return node;
}
uufx.props = { opacity: 1, color: 2, backgroundColor: 2,
               width: 3, height: 3, left: 4, top: 5 };
uufx.alpha = /^alpha\([^\x29]+\) ?/;

function uufxbuild(node, data, queue) {
    function ezfn(v0, v1, ez) {
        return ez ? uuformat('Math.??(g,??,??,d)', ez, v0, v1 - v0)
                  : uuformat('(t=g,b=??,c=??,(t/=d2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b)',
                             v0, v1 - v0);
    }
    // 123.4  -> 123.4
    // "+123" -> curt + 123
    // "-123" -> curt - 123
    function unitNormalize(curt, end, fn) {
        if (isNumber(end)) {
            return end;
        }
        var c = end.charCodeAt(0) - 42;

        // 0: "*", 1: "+", 3: "-", 5: "/"
        return !c    ? fn(curt * parseFloat(end.slice(1))) :
               c < 4 ? curt + fn(end[_replace](/^\+/, "")) : //  "+10".replace() ->  "10"
                                                             // "+-10".replace() -> "-10"
                                                             //  "-10".replace() -> "-10"
               c < 6 ? fn(curt / parseFloat(end.slice(1))) : fn(end);
    }

    var rv = 'var s=n.style,t,b,c,d2=d/2,w,o,gd,h;',
        param = queue.pz,
        revertParam = { before: param.before, after: param.after },
        i, startValue, endValue, ez, w, n,
        fixdb = uufix.db, cs = param.css || uucss(node, _true);

    for (i in param) {
        w = fixdb[i] || i;

        if (w in cs) {
            ez = 0;
            _isArray(param[i]) ? (endValue = param[i][0], ez = param[i][1]) // val, easing
                               : (endValue = param[i]); // param.val

            // skip { marginLeft: undefined, marginTop: null }
            if (endValue != null) {

                switch (n = uufx.props[w]) {
                case 1: // opacity
                    startValue = uucssopacity(node);
//{{{!mb
                    // init opacity [IE6][IE7][IE8]
                    uuready.opacity || (uucssopacity(node, startValue),
                                        node.style[_visibility] = "visible"); // BugFix
//}}}!mb
                    endValue = unitNormalize(startValue, endValue, parseFloat);
                    rv += uuformat('o=??;o=(o>0.999)?1:(o<0.001)?0:o;',
                                   ezfn(startValue, endValue, ez));
//{{{!mb
                    if (!uuready.opacity) { // [IE6][IE7][IE8]
                        rv += uuformat('s.visibility=o?"visible":"hidden";' +
                                       's.filter=((o>0&&o<1)?"alpha(??="+(o*100)+")":"");' +
                                       'f&&uu.css.opacity(n,??)&&(s.filter+=" ??");',
                                       w, endValue, node.style.filter[_replace](uufx.alpha, ""));
                    } else {
//}}}!mb
                        rv += uuformat('s.??=f? ??:o;', w, endValue);
//{{{!mb
                    }
//}}}!mb
                    break;
                case 2: // color, backgroundColor
                    startValue = uu.color(cs[w]);    // depend: uu.color.js
                    endValue   = uu.color(endValue); // depend: uu.color.js
                    rv += uuformat('gd=g/d;h=uu.hash.num2hh;s.??="#"+' +
                                   '(h[(f? ??:(??-??)*gd+??)|0]||0)+' +
                                   '(h[(f? ??:(??-??)*gd+??)|0]||0)+' +
                                   '(h[(f? ??:(??-??)*gd+??)|0]||0);',
                                   w, endValue.r, endValue.r, startValue.r, startValue.r,
                                      endValue.g, endValue.g, startValue.g, startValue.g,
                                      endValue.b, endValue.b, startValue.b, startValue.b);
                    break;
                case 3: // width, height:
                    startValue = parseInt(cs[w]) || 0;
                    endValue   = unitNormalize(startValue, endValue, parseInt);
                    rv += uuformat('w=f? ??:??;w=w<0?0:w;s.??=(w|0)+"px";',
                                   endValue, ezfn(startValue, endValue, ez), w);
                    break;
                default: // top, left, other...
                    startValue = n ? (n > 4 ? node.offsetTop  - parseInt(cs.marginTop)
                                            : node.offsetLeft - parseInt(cs.marginLeft))
                                   : parseInt(cs[w]) || 0;
                    endValue   = unitNormalize(startValue, endValue, parseInt);
                    rv += uuformat('s.??=((f? ??:??)|0)+"px";',
                                   w, endValue, ezfn(startValue, endValue, ez));
                }
                revertParam[w] = ez ? [startValue, ez] : startValue;
            }
        }
    }

    // add revert queue data
    if (!data.r && param.r) {
        data.rq.push({ tm: 0, guid: queue.guid, // copy guid
                       dur: queue.dur,
                       pz: revertParam, fin: 0 });
    }

    return new Function("n,r,f,g,d", rv); // node, reverse, finished, gain, duration
}

// uu.fx.skip
function uufxskip(node,           // @param Node(= null): null is all node
                  all,            // @param Boolean(= false): true is skip all
                  avoidFlicker) { // @param Boolean(= false): true is avoid flicker
                                  // @return Node/NodeArray:
    var nodeArray = node ? [node] : uutag("*", doc.body),
        v, i = -1, j, k, jz, kz, data, guid, q, rq;

    while ( (v = nodeArray[++i]) ) {
        data = v[_uufx];
        if (data && data.id) {

            q = data.q;
            rq = data.rq;
            guid = [];
            for (j = 0, jz = all ? q.length : 1; j < jz; ++j) {
                q[j].fin = 1;
                q[j].pz.r && guid.push(q[j].pz.guid);
            }
            for (j = 0, jz = guid.length; j < jz; ++j) {
                for (k = 0, kz = rq.length; k < kz; ++k) {
                    if (rq[k].pz.guid === guid[j]) {
                        rq[k].fin = 1;
                        q.push(rq.splice(k, 1)[0]); // data.q <- data.rq
                    }
                }
            }
            if (q.length > 2 && avoidFlicker) {
                q.push({
                    tm: 0, guid: 0, fin: 1, dur: 0,
                    pz: function(node) {
                        node.style[_visibility] = "visible";
                    }});

                v.style[_visibility] = "hidden";
            }
        }
    }
    return node || nodeArray;
}

// uu.fx.isBusy
function uufxisbusy(node) { // @param Node:
                            // @return Boolean:
    var data = node[_uufx];

    return data && data.id;
}

// uu.css.uucssopacity
function uucssopacity(node,      // @param Node:
                      opacity) { // @param Number/String(= void): Number(0.0 - 1.0) absolute
                                 //                               String("+0.5", "-0.5") relative
                                 // @return Number/Node:
    if (opacity === void 0) {
//{{{!mb
        if (!uuready.opacity) {
            opacity = node["data-uuopacity"]; // undefined or 1.0 ~ 2.0

            return opacity ? (opacity - 1): 1;
        }
        if (getComputedStyle) {
//}}}!mb
            return parseFloat(getComputedStyle(node, 0).opacity);
//{{{!mb
        }
        return 1;
//}}}!mb
    }

    var style = node.style;

//{{{!mb
    if (!uuready.opacity) {
        if (!node["data-uuopacity"]) {
            // at first time
            if (_ver.ie6 || _ver.ie7) { // [FIX][IE6][IE7]
                if ((node.currentStyle || {})[_width] === "auto") {
                    style.zoom = 1;
                }
            }
        }
    }
//}}}!mb

    // relative
    if (typeof opacity === _string) { // "+0.1" or "-0.1"
        opacity = uucssopacity(node) + parseFloat(opacity);
    }

    // normalize
    style.opacity = opacity = (opacity > 0.999) ? 1
                            : (opacity < 0.001) ? 0 : opacity;

//{{{!mb
    if (!uuready.opacity) {
        node["data-uuopacity"] = opacity + 1; // (1.0 ~ 2.0)
        style[_visibility] = opacity ? "visible" : "hidden";
        style.filter = ((opacity > 0 && opacity < 1)
                     ? "alpha(opacity=" + (opacity * 100) + ") " : "")
                     + style.filter[_replace](uucssopacity.alpha, "");
    }
//}}}!mb
    return node;
}
//{{{!mb
uucssopacity.alpha = /^alpha\([^\x29]+\) ?/;
//}}}!mb

// uu.css.show - show node
function uucssshow(node,           // @param Node:
                   duration,       // @param Number(= 0): fadein effect duration
                   displayValue) { // @param String(= "block"): applied at display "none"
                                   // @return Node:
    var cs = uucss(node), disp = displayValue || "block",
        w = cs[_width], h = cs[_height], o = uucssopacity(node) || 1;

//{{{!mb
    // [Opera] getComputedStyle(node).display === "none" -> width and height = "0px"
    if (cs[_display] === "none" && w === "0px" && w === h) { // [Opera] fix
        node.style[_display] = disp;
        cs = uucss(node);
        w = cs[_width];
        h = cs[_height];
        node.style[_display] = "none";
    }
//}}}!mb
    return uufx(node, duration || 0, { w: w, h: h, o: o, before: function(node) {
                var style = node.style;

                uucssopacity(node, 0);
                style[_width] = style[_height] = "0";
                style[_visibility] = "visible";
                if (uucss(node)[_display] === "none") {
                    style[_display] = disp;
                }
            }});
}

// uu.css.hide - hide node
function uucsshide(node,       // @param Node:
                   duration) { // @param Number(= 0): fadeout effect duration
                               // @return Node:
    uucssisshow(node) || (node.style[_display] = "none");
    return uufx(node, duration || 0, { w: 0, h: 0, o: 0 });
}

// uu.css.isShow - is shown
function uucssisshow(node) { // @param Node/CSSProperties:
                             // @return Boolean:
    var style = node[_nodeType] ? uucss(node) : node;

    return style[_display] !== "none" && style[_visibility] !== "hidden";
}

// uu.style - create StyleSheet handler class
function uustyle(id) { // @param String(= ""): style sheet id
                       // @return StyleSheet: uu.Class.StyleSheet instance
    var rv = uustyle.db[id = id || "uustyle"];

    return rv || (uustyle.db[id] = uu("StyleSheet", id));
}
uustyle.db = {}; // { id: styleSheetObject }

// StyleSheet.init
function StyleSheetInit(id) { // @param String:
    var node = uunode("style", "id," + id);

    _webkit && node[_appendChild](doc[_createTextNode](""));
    uuhead(node);

    this.ss = node.sheet
//{{{!mb
                         || node.styleSheet;
//}}}!mb
    this.rules = {};
}

// StyleSheet.add
function StyleSheetAdd(rule) { // @param Hash: { selector: declaration, ... }
    var ss = this.ss,
//{{{!mb
        ary, i, iz,
//}}}!mb
        selector, declaration;

    clearAllRules(this);

    for (selector in uumix(this.rules, rule)) {
        declaration = this.rules[selector];

//{{{!mb
        if (ss.insertRule) {
//}}}!mb
            ss.insertRule(selector + "{" + declaration + "}",
                          ss.cssRules.length);
//{{{!mb
        } else { // [IE]
            ary = uusplitcomma(selector);
            for (i = 0, iz = ary.length; i < iz; ++i) {
                ss.addRule(ary[i], uutrim(declaration));
            }
        }
//}}}!mb
    }
}

// StyleSheet.clear - clear all rules
function StyleSheetClear() {
    this.rules = {};
    clearAllRules(this);
}

// inner - clear all rules
function clearAllRules(that) {
    var ss = that.ss, i;

//{{{!mb
    if (ss.deleteRule) {
//}}}!mb
        i = ss.cssRules.length;
        while (i--) {
            ss.deleteRule(i);
        }
//{{{!mb
    } else {
        i = ss.rules.length;
        while (i--) {
            ss.removeRule(i);
        }
    }
//}}}!mb
}

// uu.unit - convert to pixel unit
function uuunit(node,   // @param Node: context
                value,  // @param Number/CSSUnitString: 123, "123", "123px",
                        //                              "123em", "123pt", "auto"
                quick,  // @param Boolean(= false): true is quick mode
                prop) { // @param String(= "left"): property
    prop = prop || "left";

    var fontSize, ratio, _float = parseFloat;

    if (typeof value === _number) {
        return value;
    }

    // "123px" -> 123
    if (uuunit.px.test(value)) {
        return parseInt(value) || 0;
    }
    if (value === "auto") {
        if (!prop[_indexOf]("bor") || !prop[_indexOf]("pad")) { // /^border|^padding/g
            return 0;
        }
    }
    if (!quick) {
        return uuunit.calc(node, prop, value);
    }
    if (uuunit.pt.test(value)) {
        return (_float(value) * 4 / 3) | 0; // 12pt * 1.333 = 16px
    } else if (uuunit.em.test(value)) {
        fontSize = uucss(node).fontSize;
        ratio = uuunit.pt.test(fontSize) ? 4 / 3 : 1;
        return (_float(value) * _float(fontSize) * ratio) | 0;
    }
    return parseInt(value) || 0;
}
uumix(uuunit, { px: /px$/, pt: /pt$/, em: /em$/, calc: _calcPixel });

// inner - convert unit
function _calcPixel(node,    // @param Node:
                    prop,    // @param String: property, "left", "width", ...
                    value) { // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                             // @return Number: pixel value
    var style = node.style, mem = [style.left, 0, 0], // [left, position, display]
        position = "position",
        important = "important",
        setProperty = "setProperty",
        removeProperty = "removeProperty",
        getPropertyValue = "getPropertyValue";

//{{{!mb
    if (_webkit) {
//}}}!mb
        mem[1] = style[getPropertyValue](position);
        mem[2] = style[getPropertyValue](_display);
        style[setProperty](position, "absolute", important);
        style[setProperty](_display, "block",    important);
//{{{!mb
    }
//}}}!mb
    style[setProperty](prop, value, important);
    // get pixel
    value = parseInt(getComputedStyle(node, 0).left);
    // restore
    style[removeProperty](prop);
    style[setProperty](prop, mem[0], "");
//{{{!mb
    if (_webkit) {
//}}}!mb
        style[removeProperty](position);
        style[removeProperty](_display);
        style[setProperty](position, mem[1], "");
        style[setProperty](_display, mem[2], "");
//{{{!mb
    }
//}}}!mb
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

if (!getComputedStyle) {
    uuunit.calc = _calcPixelIE;
}

// inner - emulate getComputedStyle [IE6][IE7][IE8]
function getComputedStyleIE(node) { // @param Node:
                                    // @return Hash: { width: "123px", ... }
    // http://d.hatena.ne.jp/uupaa/20091212
    var rv, rect, ut, v, w, x, i = -1, mem,
        style = node.style,
        currentStyle = node.currentStyle,
        runtimeStyle = node.runtimeStyle,
        UNITS = { m: 1, t: 2, "%": 3, o: 3 }, // em, pt, %, auto,
        RECTANGLE = { top: 1, left: 2, width: 3, height: 4 },
        fontSize = currentStyle.fontSize,
        em = parseFloat(fontSize) * (uuunit.pt.test(fontSize) ? 4 / 3 : 1),
        boxProperties = getComputedStyleIE.boxs,
        cache = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                  thin: "1px", medium: "3px",
                  thick: _ver.ie8 ? "5px" : "6px" }; // [IE6][IE7] thick = "6px"

    rv = getComputedStyleIE.getProps(currentStyle);

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
    rv.opacity = uucssopacity(node);
    rv.fontSize = em + "px";
    rv.cssFloat = currentStyle.styleFloat; // compat
    return rv;
}
getComputedStyleIE.boxs = // boxProperties
    ("borderBottomWidth,borderLeftWidth,borderRightWidth,borderTopWidth," +
     "marginBottom,marginLeft,marginRight,marginTop," +
     "paddingBottom,paddingLeft,paddingRight,paddingTop").split(",");

getComputedStyleIE.getProps = (function(props) {
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
        return _false;
    }
    if (classNames[_indexOf](" ") < 0) {
        return (" " + cn + " ")[_indexOf](" " + classNames + " ") >= 0; // single
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
            node.className[_replace](_classNameMatcher(uusplit(classNames)), ""));
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
        var that = this, args = arguments,
            Super = that.superClass || 0;

        that.name = Class;
        that.uuguid = uu.guid();
        that.msgbox || (that.msgbox = _nop);
        uu.msg.bind(that); // bind MsgPump

        // constructor(Super -> that)
        Super && Super.init && Super.init.apply(that, args);
                  that.init &&  that.init.apply(that, args);
    };
    uuclass[Class][_prototype] = protoIsFunction ? { init: proto }
                                                 : proto || {};

    if (Super && proto && !protoIsFunction) { // [2]
        tmp = function() {};
        tmp[_prototype] = uu.Class[Super][_prototype];
        classPrototype = uuclass[Class][_prototype] = new tmp;

        for (i in proto) {
            classPrototype[i] = proto[i];
        }
        classPrototype.constructor = uuclass[Class];
        classPrototype.superClass = uu.Class[Super][_prototype];
        classPrototype.superMethod = superMethod;
    }

    function superMethod(method              // @param String: method name
                         /*, var_args */ ) { // @param Mix: args
        return this.superClass[method].apply(this, uuarray(arguments, 1));
    }
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(className, // @param String: class name
                          proto) {   // @param Hash/Function(= void): prototype object
                                     //                               or init function
                                     // @return Object: singleton class instance
    uuclass[className] = function() {
        var that = this, arg = arguments, self = arg.callee,
            instance = "instance";

        if (!self[instance]) {
            that.name = className;
            that.uuguid = uu.guid();
            that.init && that.init.apply(that, arg);
            that.msgbox || (that.msgbox = _nop);
            uu.msg.bind(that); // bind MsgPump
        }
        return self[instance] || (self[instance] = that);
    };
    uuclass[className][_prototype] = proto && isFunction(proto) ? { init: proto }
                                                                : proto || {};
}

// --- MsgPump ---
// MsgPump
function MsgPump() {
    this.addr = {}; // AddressMap { guid: instance, ... }
    this.cast = []; // Broadcast AddressMap [guid, ...]
}

// [1][multicast] MsgPump.send([instance, ...], "hello") -> ["world!", ...]
// [2][unicast  ] MsgPump.send(instance, "hello") -> ["world!"]
// [3][broadcast] MsgPump.send(null, "hello") -> ["world!", ...]

// MsgPump.send - send a message synchronously
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

// [1][multicast] MsgPump.post([instance, ...], "hello")
// [2][unicast  ] MsgPump.post(instance, "hello")
// [3][broadcast] MsgPump.post(null, "hello")

// MsgPump.post - send a message asynchronously
function uumsgpost(address, // @param Array/Mix: address or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           null is broadcast
                   message, // @param String: message
                   param) { // @param Mix(= void): param
    var that = this;

    setTimeout(function() {
        that.send(address ? uuarray(address) : that.cast,
                  message, param);
    }, 0);
}

// MsgPump.bind - register the destination of the message
function uumsgbind(instance) { // @param Instance: class instance
    this.addr[instance.uuguid] = instance;
    this.cast = uukeys(this.addr);
}

// MsgPump.unbind
function uumsgunbind(instance) { // @param Instance: class instance
    delete this.db[instance.uuguid];
    this.cast = uukeys(this.addr);
}

// --- event ---
// [1][bind a event]            uu.event(node, "click", fn)             -> node
// [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
// [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
// [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node

// uu.event - bind event
function uuevent(node,         // @param Node:
                 eventTypeEx,  // @param EventTypeExString: some EventTypeEx, "click,click+,..."
                 evaluator,    // @param Function/Instance: callback function
                 __unbind__) { // @hidden Boolean(= false): true is unbind, false is bind
                               // @return Node:
    function _eventClosure(event) {
        if (!event.node) {
            var target = event.target
//{{{!mb
                                      || event.srcElement || doc;
//}}}!mb

            event.node = node;
            event.code = (uuevent.codes[event.type] || 0) & 255;
            event.mouse = event.button || 0;
            event.at = (target[_nodeType] === 3) // 3: TEXT_NODE
                     ? target[_parentNode] : target;
//{{{!mb
            if (_ie) {
                if (!event.target) { // [IE6][IE7][IE8]
                    event.currentTarget = node;

                    switch (event.code) {
                    case uuevent.codes.mousedown:
                    case uuevent.codes.mouseup:
                        event.mouse = (event.button & 1) ? 0
                                    : (event.button & 2) ? 2 : 1;
                        break;
                    case uuevent.codes.contextmenu:
                        event.mouse = 2;
                        break;
                    case uuevent.codes.mouseover:
                    case uuevent.codes.mouseout:
                        event.relatedTarget = target === event.fromElement
                                            ? event.toElement
                                            : event.fromElement;
                    }
                }
                if (event.pageX === void 0) { // [IE6][IE7][IE8][IE9]
                    event.pageX = event.clientX + (owner.scrollLeft || 0);
                    event.pageY = event.clientY + (owner.scrollTop  || 0);
                }
            }
//}}}!mb
            if (event.code === uuevent.codes.mousewheel) {
                event.wheel = (
//{{{!mb
                               event.detail ? (event.detail / 3) :
//}}}!mb
                                              (event.wheelDelta / -120)) | 0;
            }
        }
        // callback(event, node)
        instance ? handler.call(evaluator, event)
                 : evaluator(event);
    }

    // --- setup event database ---
    if (!(_uuevent in node)) {
        node[_uuevent] = { types: "," };
    }

    var eventTypeExArray = eventTypeEx.split(","),
        eventData = node[_uuevent],
        ex, token, eventType, capture, closure, bound, types = "types",
        handler, i = -1, pos,
//{{{!mb
        owner = node.ownerDocument || doc,
//}}}!mb
        instance = 0;

    if (__unbind__) {
        closure = evaluator;
    } else {
        handler = isFunction(evaluator) ? evaluator
                                        : (instance = 1, evaluator.handleEvent);
        closure = _eventClosure;
    }

    while ( (ex = eventTypeExArray[++i]) ) { // ex = "namespace.click+"

        // split token
        //      "namespace.click+"
        //              v
        //      ["namespace.click+", "namespace", "click", "+"]
        token = uuevent.parse.exec(ex);
        eventType = token[2]; // "click"
        capture   = token[3]; // "+"
        bound     = eventData[types][_indexOf]("," + ex + ",") >= 0;

//{{{!mb
        // IE mouse capture [IE6][IE7][IE8]
        if (_ie && !node.addEventListener) {
            if (eventType === "mousemove") {
                capture && uuevent(node, "losecapture", closure, __unbind__);
            } else if (eventType === "losecapture") {
                if (node.setCapture) {
                    __unbind__ ? node.releaseCapture()
                               : node.setCapture();
                }
            }
        }
//}}}!mb
        if (__unbind__) {
            if (bound) {

                pos = eventData[ex][_indexOf](evaluator);
                if (pos >= 0) {

                    eventData[ex].splice(pos, 1); // remove evaluator

                    // removed all handlers in a type
                    if (!eventData[ex].length) {

                        // ",dblclick," <- ",namespace.click+,dblclick,".
                        //                      replace(",namespace.click+,", ",")
                        eventData[types] =
                            eventData[types][_replace]("," + ex + ",", ",");
                    }
                    uueventattach(node, eventType, closure, capture, _true); // detach
                }
            }
        } else {
            // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
            if (!bound) {
                eventData[types] += ex + ",";
                eventData[ex] = [];
            }
            eventData[ex].push(closure);
            uueventattach(node, eventType, closure, capture);
        }
    }
    return node;
}
uuevent.parse = /^(?:(\w+)\.)?(\w+)(\+)?$/; // ^[NameSpace.]EvntType[Capture]$
uuevent.codes = {
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


// uu.event.fire - fire event / fire custom event(none capture event only)
function uueventfire(node,      // @param Node: target node
                     eventType, // @param String: "click", "custom"
                     param) {   // @param Mix(= void): param
                                // @return Node:
    if (uuhas(node, eventType)) {

        var fakeEventObjectEx = {
                type:           eventType,
                pageX:          0,
                pageY:          0,
                param:          param,
                target:         node,
                button:         0,
                detail:         0,
                customEvent:    _true,
                currentTarget:  node,
                relatedTarget:  node
            };

        node[_uuevent][eventType].forEach(function(evaluator) {
            evaluator.call(node, fakeEventObjectEx);
        });
    }
    return node;
}

// uu.event.stop - stopPropagation and preventDefault
function uueventstop(event) { // @param EventObjectEx:
//{{{!mb
    if (event.stopPropagation) {
//}}}!mb
        event.stopPropagation();
        event.preventDefault();
//{{{!mb
    } else {
        event.cancelBubble = _true;
        event.returnValue = _false;
    }
//}}}!mb
}

// [1][unbind all]              uu.event.unbind(node) -> node
// [2][unbind some]             uu.event.unbind(node, "click+,dblclick") -> node
// [3][unbind namespace all]    uu.event.unbind(node, "namespace.*") -> node
// [4][unbind namespace some]   uu.event.unbind(node, "namespace.click+,namespace.dblclick") -> node

// uu.event.unbind - unbind event
function uueventunbind(node,          // @param Node: target node
                       eventTypeEx) { // @param EventTypeExString(= void): namespace and event types, "click,click+,..."
                                      // @return Node:
    var eventData = node[_uuevent], ns, ary = uusplitcomma(eventTypeEx), ex, i = -1;

    if (eventData) {
        eventTypeEx = eventTypeEx ? "," + eventTypeEx + "," // [2] ",click,"
                                  : eventData.types;        // [1] ",click,MyNamespace.mousemove+,"
        while ( (ex = ary[++i]) ) {
            if (ex.lastIndexOf(".*") > 1) { // [3] "namespace.*"
                ns = ex.slice(0, -1);       // "namespace.*" -> "namespace."
                uueach(uusplitcomma(eventTypeEx), function(ex) { // @param EventTypeExString: "MyNamespace.mousemove+"
                    if (!ex[_indexOf](ns)) {
                        uueach(eventData[ex], function(evaluator) {
                            uuevent(node, ex, evaluator, _true); // unbind
                        });
                    }
                });
            } else { // [2][4]
                if (eventTypeEx[_indexOf]("," + ex + ",") >= 0) {
                    uueach(eventData[ex], function(evaluator) {
                        uuevent(node, ex, evaluator, _true); // unbind
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
                       useCapture,   // @param Boolean(= false):
                       __detach__) { // @hidden Boolean(= false): true is detach
//{{{!mb
    eventType = uueventattach.fix[eventType] || eventType;
//}}}!mb

/* event log
    if (uu.ready.dom) {
        var fnguid;

        if (evaluator.fnguid) {
            fnguid = evaluator.fnguid;
        } else {
            evaluator.fnguid = uuguid();
            fnguid = evaluator.fnguid;
        }
        if (__detach__) {
            uulog("detach(" + eventType + ")" + fnguid);
        } else {
            uulog("attach(" + eventType + ")" + fnguid);
        }
    }
 */

//{{{!mb
    if (node.addEventListener) {
//}}}!mb
        node[__detach__ ? "removeEventListener"
                        : "addEventListener"](eventType, evaluator, !!useCapture);
//{{{!mb
    } else {
        node[__detach__ ? "detachEvent"
                        : "attachEvent"]("on" + eventType, evaluator);
    }
//}}}!mb
}
//{{{!mb
uueventattach.fix = _gecko ? { mousewheel: "DOMMouseScroll" } :
                    _opera ? { contextmenu: "mousedown" } : {};
//}}}!mb

// uu.event.detach - detach event - Raw Level API wrapper
function uueventdetach(node,         // @param Node:
                       eventType,    // @param String: event type
                       evaluator,    // @param Function: evaluator
                       useCapture) { // @param Boolean(= false):
    uueventattach(node, eventType, evaluator, useCapture, 1);
}

// --- READY ---
// uu.ready - hook event
function uuready(/* readyEventType, */  // @param String(= "dom"): readyEventType
                 /* callback, ... */) { // @param Function: callback functions
    if (!uuready.reload) {
        var args = arguments, v, i = 0, iz = args.length,
            type = "dom", order, fired;

        for (; i < iz; ++i) {
            isString(v = args[i]) && (type = v.toLowerCase());
        }
        fired = uuready[type];
        order = { dom: 0, middle: 1, system: 2 }[type] || 0;

        for (i = 0; i < iz; ++i) {
            if (isFunction(v = args[i])) {
                fired ? v(uu) // callback(uu)
                      : (uuready.uudb[type] || (uuready.uudb[type] = [[], [], []]),
                         uuready.uudb[type][order].push(v));
            }
        }
    }
}
uuready.uudb = {}; // { readyEventType: [[low], [middle], [system]], ... } event stock

// uu.ready.fire
function uureadyfire(readyEventType, // @param String: readyEventType
                     param) {        // @param Mix(= void): callback(uu, param)
    var db = uuready.uudb[readyEventType], ary, callback, i = -1;

    if (db) {
        ary = db[2].concat(db[1], db[0]); // join
        uuready.uudb[readyEventType] = null; // pre clear

        while ( (callback = ary[++i]) ) {
            callback(uu, param);
        }
    }
}

// --- node ---
// uu.node - createElement wrapper
function uunode(tagName           // @param String(= "div"):
                /* var_args */) { // @param Node/String/Number/Hash(= void):
                                  // @return Node: <node>
    return arguments.length > 1 ? buildNode(tagName, uuarray(arguments, 1))
                                : doc[_createElement](tagName || "div");
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

    var node = !source ? doc[_createElement]("div")      // [1] uu.node.add()
             : source[_nodeType] ? source                // [3][5] uu.node.add(Node or DocumentFragment)
             : !source[_indexOf]("<") ? uunodebulk(source, context) // [4] uu.node.add(HTMLFragmentString)
             : doc[_createElement](source),              // [2] uu.node.add("p")
        reference = null,
        rv = (node[_nodeType] === 11) ? node[_firstChild] : node; // 11: DOCUMENT_FRAGMENT_NODE

    switch (uunodefind.pos[position] || 8) {
    case 1: reference = context[_parentNode][_firstChild];
    case 2: reference || (reference = context);
    case 3: reference || (reference = context[_nextSibling]);
    case 4: context[_parentNode].insertBefore(node, reference); break;
    case 5: reference = context[_firstChild];
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
    if ("firstElementChild" in parent) {
//}}}!mb
        rv = (num === 1 || num === 4) ? parent[_parentNode][iters[0]]
                                      : parent[iters[0]];
//{{{!mb
    } else {
        iter = iters[1];
        rv = (num === 2 || num === 3) ? parent[iter] :
             (num > 4) ? parent[iters[2]]
                       : parent[_parentNode][iters[2]];
        for (; rv; rv = rv[iter]) {
            if (rv[_nodeType] === 1) { // 1: ELEMENT_NODE
                break;
            }
        }
    }
//}}}!mb
    return rv;
}
uunodefind.pos = { "^": 1, "-": 2, "+": 3, "$": 4, ".^": 5, ".$": 8 };
uunodefind.iters = {
    1: ["firstElementChild"
//{{{!mb
                                , _nextSibling,    _firstChild
//}}}!mb
                                                                ], // FIRST_SIBLING, FIRST_CHILD
    2: ["previousElementSibling"
//{{{!mb
                                , "previousSibling"
//}}}!mb
                                                                ], // PREV_SIBLING
    3: ["nextElementSibling"
//{{{!mb
                                , _nextSibling
//}}}!mb
                                                                ], // NEXT_SIBLING
    4: ["lastElementChild"
//{{{!mb
                                , "previousSibling", _lastChild
//}}}!mb
                                                                ]  // LAST_SIBLING, LAST_CHILD
};

// uu.nodeid - get nodeid
function uunodeid(node) { // @param Node:
                          // @return Number: nodeid, from 1
    if (!node[_uuguid]) {
        uunodeid.db[node[_uuguid] = ++uunodeid.num] = node;
    }
    return node[_uuguid];
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
    node[_uuguid] && (uunodeid.db[node[_uuguid]] = null,
                                  node[_uuguid] = null);
    return node;
}

// [1][clone]           uu.node.bulk(Node) -> DocumentFragment
// [2][build]           uu.node.bulk("<p>html</p>") -> DocumentFragment

// uu.node.bulk - convert HTMLString into DocumentFragment
function uunodebulk(source,    // @param Node/HTMLFragment: source
                    context) { // @param Node(= <div>): context
                               // @return DocumentFragment:
    var rv = doc.createDocumentFragment(),
        placeholder = uunode((context || {}).tagName);

    placeholder.innerHTML = source[_nodeType] ? source.outerHTML // [1] node
                                              : source;          // [2] "<p>html</p>"
    while (placeholder[_firstChild]) {
        rv[_appendChild](placeholder[_firstChild]);
    }
    return rv;
}

// uu.node.path - get CSSQueryString fro node
function uunodepath(node) {  // @param Node: ELEMENT_NODE
                             // @return CSSQueryString: "body>div:nth-child(5)
    var rv = [], n = node, idx;

    while (n && n[_nodeType] === 1) { // 1: ELEMENT_NODE
        if (uunodepath.vip.test(n.tagName)) {
            rv.push(n.tagName);
            break;
        } else {
            idx = "";
            if (n.parentNode) {
                idx = (uunodechildren(n.parentNode).length < 2
                              ? ""
                              : ":nth-child(" + (uunodeindexof(n) + 1) + ")");
            }
            rv.push(n.tagName + idx);
        }
        n = n[_parentNode];
    }
    return rv.reverse().join(">").toLowerCase();
}
uunodepath.vip = /^(?:html|head|body)$/i;

// uu.node.swap - swap node
function uunodeswap(swapin,    // @param Node: swapin
                    swapout) { // @param Node: swapout
                               // @return Node: swapout
    return swapout[_parentNode].replaceChild(swapin, swapout);
}

// [1][wrap] uu.node.wrap(<span>target</span>, <p>)
//           <span>target</span>  ->  <p><span>target</span></p>

// uu.node.wrap - wrapper
function uunodewrap(innerNode,   // @param Node: inner node
                    outerNode) { // @param Node: wrapper, outer node
                                 // @return Node: innerNode
    return outerNode[_appendChild](uunodeswap(outerNode, innerNode));
}

//  [1][add node]       uu.div(uu.div())
//  [2][add text node]  uu.div("hello")
//  [3][add text node]  uu.div(uu.text("hello"))
//  [4][set attr]       uu.div("title,hello")        -> uu.node("div", { title: "hello" })
//  [5][set attr]       uu.div({ title: "hello" })   -> uu.node("div", { title: "hello" })
//  [6][set css]        uu.div("", "color,red")      -> uu.css(uu.node("div"), { color: "red" })
//  [7][set css]        uu.div("", { color: "red" }) -> uu.css(uu.node("div"), { color: "red" })
//  [8][call handler]   uu.node.builder(handler), uu.div(1) -> handler(uu, <div>, 1, nodeid)

// inner - build node
function buildNode(node,   // @param Node/TagString: <div> or "div"
                   args) { // @param Array/Arguments: [Node/String/Number/Hash, ...]
                           // @return Node:
    node[_nodeType] || (node = doc[_createElement](node)); // "div" -> <div>

    var arg, i = 0, token = 0, ticket, isstr;

    while ( (arg = args[i++]) ) {
        if (arg) {
            if (arg[_nodeType]) { // [1][3]
                node[_appendChild](arg);
            } else if (isNumber(arg)) { // [8]
                ticket = arg;
            } else {
                isstr = isString(arg);

                if (isstr && arg[_indexOf](",") < 0) { // [2]
                    node[_appendChild](doc[_createTextNode](arg)); // uu.div("hello")
                } else if (++token < 2) {
                    uuattr(node, isstr ? uusplittohash(arg) : arg); // [4][5]
                } else if (token < 3) {
                    uucss(node,  isstr ? uusplittohash(arg) : arg); // [6][7]
                }
            }
        }
    }
    ticket && uunodebuilder.handler
           && uunodebuilder.handler(uu, node, ticket, uunodeid(node));
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
    while (parent[_lastChild]) {
        parent.removeChild(parent[_lastChild]);
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
    node[_parentNode] && node[_parentNode].removeChild(node);
    return node;
}

// uu.node.children - as childlen (returns a collection of child elements of the given element)
function uunodechildren(parent) { // @param Node: parent node
                                  // @return NodeArray:
    var rv = parent.children; // Element.children [WebKit][Gecko]
//{{{!mb
    if (!rv) {
        var n = parent[_firstChild];

        for (rv = []; n; n = n[_nextSibling]) {
            n[_nodeType] === 1 && rv.push(n); // 1: ELEMENT_NODE
        }
    }
//}}}!mb
    return rv;
}

// uu.node.builder - set node builder handler
function uunodebuilder(handler) { // @param Function: handler
    uunodebuilder.handler = handler;
}

// uu.node.indexOf - find ELEMENT_NODE index
function uunodeindexof(node) { // @param Node: ELEMENT_NODE
                               // @return Number: 0~ or -1(not found)
    var rv = 0, n = node[_parentNode][_firstChild];

    for (; n; n = n[_nextSibling]) {
        if (n[_nodeType] === 1) { // 1: ELEMENT_NODE
            if (n === node) {
                return rv;
            }
            ++rv;
        }
    }
    return -1;
}

// uu.svg - create SVG node wrapper
function uusvg(tagName, // @param String(= "svg"):
               attr) {  // @param Hash(= void):
                        // @return SVGNode: new <svg> element
    var rv = doc.createElementNS("http://www.w3.org/2000/svg", tagName || "svg"),
        key;

    if (attr !== void 0) {
        for (key in attr) {
            rv.setAttribute(key, attr[key]);
        }
    }
    return rv;
}

//  [1][get innerHTML] uu.html(node) -> "<div>...</div>"
//  [2][set innerHTML] uu.html(node, "<div>...</div>") -> node

// uu.html - innerHTML accessor
function uuhtml(node,   // @param Node:
                html) { // @param HTMLFragmentString(= ""): HTMLFragment
                        // @return HTMLFragmentString/Node:
    return html ? (uunodeadd(html, uunodeclear(node)), node)
                : node.innerHTML;
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

//  [1][create text node]          uu.text("text")            -> createTextNode("text")
//  [2][create formated text node] uu.text("?? ??", "a", "b") -> createTextNode("a b")
//  [3][get text]                  uu.text(node)              -> "text"
//  [4][set text]                  uu.text(node, "text")      -> node
//  [5][set formated text]         uu.text(node, "??", "a")   -> node

// uu.text - node.text / node.innerText accessor
function uutext(data,             // @param String/FormatString/Node: "string" or "format ?? string" or node
                text              // @param String/Mix(= void): "textContent"
                /* var_args */) { // @param Mix(= void):
                                  // @return String/Node:
    var args = arguments, az = args.length;

    if (isString(data)) {
        return doc[_createTextNode](
                    az < 2 ? data // [1]
                           : uuformat.apply(this, args)); // [2]
    }
    if (text === void 0) { // [3]
        return data[
//{{{!mb
                    _gecko ? "textContent" :
//}}}!mb
                             "innerText"];
    }
    uunodeadd(doc[_createTextNode](az < 3 ? text // [4]
                                          : uuformat.apply(this, uuarray(args, 1))), // [5]
              uunodeclear(data));
    return data;
}

// --- QUERY ---
// uu.query - as document.querySelectorAll
function uuquery(cssSelector, // @param CSSQueryString: "css > selector"
                 context) {   // @param NodeArray/Node(= document): query context
                              // @return NodeArray: [Node, ...]
    context = context || doc;

    if (context[_nodeType]
//{{{!mb
        && context.querySelectorAll
        && !uuquery.ngword.test(cssSelector)    // [:scope] guard
//}}}!mb
                                            ) {
        try {
            return fakeToArray(context.querySelectorAll(cssSelector));
        } catch(err) {} // case: extend pseudo class / operators
    }
    return uuquery.selectorAll(cssSelector, context); // depend: uu.query.js
}
//{{{!mb
uuquery.ngword = /(?:\:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=/;
//}}}!mb
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

// uu.id - as document.getElementById
function uuid(expression, // @param String: id
              context) {  // @param Node(= document): query context
                          // @return Node/null:
    return (context || doc).getElementById(expression);
}

// uu.tag - as document.getElementsByTaName
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
        if (!skip || v[_nodeType] === 1) { // 1: ELEMENT_NODE
            rv[++ri] = v;
        }
    }
    return rv;
//}}}!mb
}
uutag.html4 = ("a,b,br,dd,div,dl,dt,h1,h2,h3,h4,h5,h6,i,img,iframe," +
               "input,li,ol,option,p,pre,select,span,table,tbody,tr," +
               "td,th,tfoot,textarea,u,ul").split(","); // exclude <html><head><body>
uutag.html5 = ("abbr,article,aside,audio,canvas,datalist," +
               "details,eventsource,figure,footer,header,hgroup," +
               "mark,menu,meter,nav,output,progress,section,time,video").split(",");

// uu.match - as document.matchesSelector
function uumatch(cssSelector, // @param String: "css > selector"
                 context) {   // @param Node(= document): match context
                              // @return Boolean:
//{{{!mb
    if (context.matchesSelector) {
        return context.matchesSelector(cssSelector);
    }
    if (context.webkitMatchesSelector) {
//}}}!mb
        return context.webkitMatchesSelector(cssSelector);
//{{{!mb
    }
    if (context.mozMatchesSelector) {
        return context.mozMatchesSelector(cssSelector);
    }

    var node, i = -1, nodeArray = uuquery(cssSelector, doc);

    while ( (node = nodeArray[++i]) ) {
        if (node === context) {
            return true;
        }
    }
    return false;
//}}}!mb
}

// uu.klass - as document.getElementsByClassName
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

// --- STRING ---

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
    return source[_replace](uutrim.trim, "");
}
uutrim.tags   = /<\/?[^>]+>/g; // <div> or </div>
uutrim.trim   = /^\s+|\s+$/g;
uutrim.quotes = /^\s*["']?|["']?\s*$/g;
uutrim.spaces = /\s\s+/g;

// uu.trim.tag - trim.inner + strip tags
function uutrimtag(source) { // @param String:  "  <h1>A</h1>  B  <p>C</p>  "
                             // @return String: "A B C"
    return source[_replace](uutrim.trim, "")
                 [_replace](uutrim.tags, "")
                 [_replace](uutrim.spaces, " ");
}

// uu.trim.url - trim.inner + strip "url(" ... ")" + trim.quote
function uutrimurl(source) { // @param String:   '  url("http://...")  '
                             // @return String:  "http://..."
    return (!source[_indexOf]("url(") && source[_indexOf](")") === source.length - 1) ?
            source.slice(4, -1)[_replace](uutrim.quotes, "") : source;
}

// uu.trim.inner - trim + diet inside multi spaces
function uutriminner(source) { // @param String:  "  diet  inner  space  "
                               // @return String: "diet inner space"
    return source[_replace](uutrim.trim, "")[_replace](uutrim.spaces, " ");
}

// uu.trim.quote - trim + strip "double" 'single' quote
function uutrimquote(source) { // @param String:  ' "quote string" '
                               // @return String: 'quote string'
    return source[_replace](uutrim.quotes, "");
}

// uu.trim.bracket - trim + strip brackets () [] {} <>
function uutrimbracket(source) { // @param String:  " <bracket>  (this)  [and]  {this} "
                                 // @return String: "bracket this and this"
    return source[_replace](uutrimbracket.brackets, "");
}
uutrimbracket.brackets = /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g; // [br](ac){ke}<ts>

// uu.split - split space
function uusplit(source) { // @param String: " split  space  token "
                           // @return Array: ["split", "space", "token"]
    return source[_replace](uutrim.spaces, " ")
                 [_replace](uutrim.trim, "").split(" ");
}

// uu.split.comma - split commas and inner spaces
function uusplitcomma(source) { // @param String: " ,A, B ,C, "
                                // @return Array: ["A", "B", "C"]
    return source[_replace](uusplitcomma.spcsp, ",")
                 [_replace](uusplitcomma.trim, "").split(",");
}
uusplitcomma.spcsp = / *, */g;
uusplitcomma.trim = /^[ ,]+|[ ,]+$/g; // trim space and comma

// [1][hash from string]        uu.split.toHash("key,1,key2,1", ",") -> { key: 0, key2: 1 }

// uu.split.toHash - split to hash
function uusplittohash(source,     // @param String: "key,0,key2,1"
                       splitter,   // @param String(= ","): splitter
                       toNumber) { // @param Boolean(= false): convert value to number
                                   // @return Hash: { key: "0", key2: "1" }
    var rv = {}, ary = source.split(splitter || ","), i = 0, iz = ary.length,
        num = !!toNumber;

    for (; i < iz; i += 2) {
        rv[ary[i]] = num ? +(ary[i + 1]) : ary[i + 1];
    }
    return rv;
}

// [1][placeholder]             uu.format("?? dogs and ??", 101, "cats") -> "101 dogs and cats"

// uu.format - placeholder( "??" ) replacement
function uuformat(format) { // @param FormatString: formatted string with "??" placeholder
                            // @return String: "formatted string"
    var i = 0, args = arguments;

    return format[_replace](uuformat.q, function() {
        return args[++i];
    });
}
uuformat.q = /\?\?/g;

// --- debug ---
// uu.puff - uu.puff(mix) -> alert( uu.json(mix) )
function uupuff(source                   // @param Mix/FormatString: source object
                                         //                          or "format ?? string"
                /* , var_args, ... */) { // @param Mix: var_args
    alert(arguments.length < 2 ? _json(source)
                               : uuformat.apply(this, arguments));
}

// uu.log - add log
function uulog(log                      // @param Mix: log data
               /* , var_args, ... */) { // @param Mix: var_args
    var id = uu.config.log, context = uuid(id), tag,
        txt = arguments.length < 2 ? _json(log)
                                   : uuformat.apply(this, arguments);

    context || uunodeadd(context = uu.ol({ id: id }));
    tag = /OL|UL/.test(context.tagName) ? "li" : "p";
    uunodeadd(uu[tag](doc[_createTextNode](txt)), context);
}

// uu.log.clear - clear log
function uulogclear() {
    var context = uuid(uu.config.log);

    if (context) {
        while (context[_lastChild]) {
            context.removeChild(context[_lastChild]);
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
    return useNativeJSON && JSON ? JSON.stringify(source) || ""
                                 : _json(source, 1, callback);
}

// uu.json.decode - decode JSONString
function uujsondecode(jsonString,      // @param JSONString:
                      useNativeJSON) { // @param Boolean(= false): switch native impl or js impl
                                       //                          true is use native JSON
                                       //                          false is use js JSON
                                       // @return Mix/Boolean: false is error
    var str = uutrim(jsonString);

    if (useNativeJSON && JSON) {
        return JSON.parse(str);
    }
    if (uujsondecode.ngword.test(str[_replace](uujsondecode.unescape, ""))) {
        return _false;
    }
    return (new Function("return " + str))();
}
uujsondecode.ngword = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/;
uujsondecode.unescape = /"(\\.|[^"\\])*"/g;

// inner - convert string to JSON formatted string
function _str2json(str,        // @param String:
                   addQuote) { // @param Boolean(= false): true is add quote(")
                               // @return String: '\u0000' or '"\u0000"'
    var rv = str[_replace](_str2json.escape, function(m) {
                return _str2json.swap[m];
            })[_replace](_str2json.encode, function(str, c) {
                // String("AB") to UnicodeString("\u0041\u0042")
                c = str.charCodeAt(0);
                return "\\u" + _num2hh[(c >> 8) & 255]
                             + _num2hh[c & 255];
            });

    return addQuote ? '"' + rv + '"' : rv;
}
_str2json.swap = uusplittohash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\');
_str2json.escape = /(?:\"|\\[bfnrt\\])/g; // escape
_str2json.encode = /[\x00-\x1F\u0080-\uFFEE]/g;

// inner - json inspect
function _json(mix, esc, callback) {
    var ary, type = uutype(mix), w, ai = -1, i, iz;

    if (mix === win) {
        return '"window"'; // window -> String("window")
    }

    switch (type) {
    case uutype.HASH:   ary = []; break;
    case uutype.NODE:   return '"' + uunodepath(mix) + '"';
    case uutype.NULL:   return "null";
    case uutype.VOID:   return "undefined";
    case uutype.DATE:   return uudate(mix).ISO();
    case uutype.FUNCTION:
                        return '"' + mix.name + '"';
    case uutype.BOOLEAN:
    case uutype.NUMBER: return mix.toString();
    case uutype.STRING: return esc ? _str2json(mix, 1) : '"' + mix + '"';
    case uutype.ARRAY:
    case uutype.FAKEARRAY:
        for (ary = [], i = 0, iz = mix.length; i < iz; ++i) {
            ary[++ai] = _json(mix[i], esc, callback);
        }
        return "[" + ary + "]";
    default:
        return callback ? (callback(mix) || "") : "";
    }
    if (mix.msgbox) {
        return '"' + mix.name + '"';
    }
    if (_toString.call(type).slice(-3) === "on]") { // [object CSSStyleDeclaration]
        w = _webkit;
        for (i in mix) {
            if (typeof mix[i] === _string && (w || i != (+i + ""))) { // !isNaN(i)
                w && (i = mix.item(i));
                ary[++ai] = '"' + i + '":'
                                + (esc ? _str2json(mix[i], 1)
                                       : '"' + mix[i] + '"');
            }
        }
    } else { // type === uutype.HASH
        for (i in mix) {
            ary[++ai] = (esc ? _str2json(i, 1) : '"' + i + '"') + ":"
                      + _json(mix[i], esc, callback);
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
                            //                 time: unix_time, ISO(), RFC(), GMT() }
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
    if (_ie && str[_indexOf]("GMT") > 0) {
        str = str[_replace](/GMT/, "UTC");
    }
//}}}!mb
    return new Date(str[_replace](",", "")
                       [_replace](_str2date.date, _toDate));
}
_str2date.parse = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/;
_str2date.date = /^([\w]+) (\w+) (\w+)/;

// DateHash.ISO - encode DateHash To ISO8601String
function datehashiso() { // @return ISO8601DateString: "2000-01-01T00:00:00.000Z"
    var that = this,
        padZero = (that.ms < 10) ? "00"
                : (that.ms < 100) ? "0" : "";

    return uuformat("??-??-??T??:??:??.??Z",
                    that.Y, _num2dd[that.M], _num2dd[that.D],
                    _num2dd[that.h], _num2dd[that.m],
                    _num2dd[that.s], padZero + that.ms);
}

// DateHash.RFC - encode DateHash To RFC1123String
function datehashrfc() { // @return RFC1123DateString: "Wed, 16 Sep 2009 16:18:14 GMT"
    var rv = (new Date(this.time)).toUTCString();

///{{{!mb
    if (_ie && rv[_indexOf]("UTC") > 0) {
        // http://d.hatena.ne.jp/uupaa/20080515
        rv = rv[_replace](/UTC/, "GMT");
        (rv.length < 29) && (rv = rv[_replace](/, /, ", 0")); // [IE] fix format
    }
///}}}!mb
    return rv;
}

// --- FLASH ---
//  <object id="external..." width="..." height="..." data="*.swf" classid="...">
//      <param name="allowScriptAccess" value="always" />
//      <param name="movie" value="*.swf" />
//  </object>
//
//  <embed name="external..." src="*.swf" width="..." height="..."
//      type="application/x-shockwave-flash" allowScriptAccess="always">
//  </embed>
//
// uu.flash - create flash <object> node
//{{{!mb
function uuflash(url,      // @param String: url
                 option) { // @param FlashOptionHash(= { param: { allowScriptAccess: "always" } }):
                           // @return Node/null/void: <object>
    var opt = uuarg(option, { width: "100%", height: "100%" }),
        param = opt.param || {}, id = opt.id || ("external" + uuguid()),
        paramArray = [], i, fragment;

    // add <param name="allowScriptAccess" value="always" />
    param.allowScriptAccess || (param.allowScriptAccess = "always");

    // add <param name="movie" value="{{url}}" />
    param.movie = url;

    for (i in param) {
        paramArray.push(uuformat(_ie ? '<param name="??" value="??" />'
                                     : '??="??"', i, param[i]));
    }
    fragment = uuformat(
        _ie ? '<object id="??" width="??" height="??" data="??" ??>??</object>'
            : '<embed name="??" width="??" height="??" src="??" ?? ?? />',
        id,
        opt[_width],
        opt[_height],
        url,
        _ie ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'
            : 'type="application/x-shockwave-flash"',
        paramArray.join(" "));

    uunodeswap(uunodebulk(fragment), opt.marker || uunodeadd());

    return _ie ? uuid(id) : doc.getElementsByName(id)[0];
}
//}}}!mb

// --- OTHER ---
// uu.viewport.size
function uuviewportsize() { // @return Hash: { innerWidth, innerHeight,
                            //                 pageXOffset, pageYOffset }
                            //   innerWidth  - Number:
                            //   innerHeight - Number:
                            //   pageXOffset - Number:
                            //   pageYOffset - Number:
//{{{!mb
    if (_ie) {
        return { innerWidth:  _rootNode.clientWidth,
                 innerHeight: _rootNode.clientHeight,
                 pageXOffset: _rootNode.scrollLeft,
                 pageYOffset: _rootNode.scrollTop };
    }
//}}}!mb
    return win;
}

// uu.guid - get unique number
function uuguid() { // @return Number: unique number, from 1
    return ++uuguid.num;
}
uuguid.num = 0; // guid counter

// --- ECMAScript-262 5th ---
//{{{!mb

// Array.prototype.indexOf
function ArrayIndexOf(search,      // @param Mix: search element
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
function ArrayLastIndexOf(search,      // @param Mix: search element
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
function ArrayEvery(evaluator, // @param Function: evaluator
                    that) {    // @param this(= void): evaluator this
                               // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this && !evaluator.call(that, this[i], i, this)) {
            return _false;
        }
    }
    return _true;
}

// Array.prototype.some
function ArraySome(evaluator, // @param Function: evaluator
                   that) {    // @param this(= void): evaluator this
                              // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this && evaluator.call(that, this[i], i, this)) {
            return _true;
        }
    }
    return _false;
}

// Array.prototype.forEach
function ArrayForEach(evaluator, // @param Function: evaluator
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
function ArrayMap(evaluator, // @param Function: evaluator
                  that) {    // @param this(= void): evaluator this
                             // @return Array: [element, ... ]
    for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
        i in this && (rv[i] = evaluator.call(that, this[i], i, this));
    }
    return rv;
}

// Array.prototype.filter
function ArrayFilter(evaluator, // @param Function: evaluator
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
function ArrayReduce(evaluator,    // @param Function: evaluator
                     initialValue, // @param Mix(= void): initial value
                     __right__) {  // @hidden Number(= 0): 1 is right
                                   // @return Mix:
    var that = this, r = !!__right__, undef, f = 0,
        rv = initialValue === undef ? undef : (++f, initialValue),
        iz = that.length, i = r ? --iz : 0;

    for (; r ? i >= 0 : i < iz; r ? --i : ++i) {
        i in that && (rv = f ? evaluator(rv, that[i], i, that)
                             : (++f, that[i]));
    }
    if (!f) {
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
    return uudate(this).ISO();
}

// Number.prototype.toJSON, Boolean.prototype.toJSON
function NumberToJson() { // @return String: "123", "true", "false"
    return this.toString();
}

// String.prototype.trim
function StringTrim() { // @return String: "has  space"
    return this[_replace](uutrim.trim, "");
}

// String.prototype.toJSON
function StringToJson() { // @return String: "string"
    return _str2json(this);
}

// --- HTMLElement.prototype ---
//{{{!mb

// HTMLElement.prototype.innerText getter
function innerTextGetter() {
    return this.textContent;
}

// HTMLElement.prototype.innerText setter
function innerTextSetter(text) {
    while (this.hasChildNodes()) {
        this.removeChild(this[_lastChild]);
    }
    this[_appendChild](doc[_createTextNode](text));
}

// HTMLElement.prototype.outerHTML getter
function outerHTMLGetter() {
    var rv, that = this, p = that[_parentNode],
        r = doc.createRange(), div = doc[_createElement]("div");

    p || doc.body[_appendChild](that); // orphan
    r.selectNode(that);
    div[_appendChild](r.cloneContents());
    rv = div.innerHTML;
    p || that[_parentNode].removeChild(that);
    return rv;
}

// HTMLElement.prototype.outerHTML setter
function outerHTMLSetter(html) {
    var r = doc.createRange();

    r.setStartBefore(this);
    this[_parentNode].replaceChild(r.createContextualFragment(html), this);
}
//}}}!mb

// --- NodeSet ---
// NodeSet class
function NodeSet(expression, // @param NodeSet/Node/NodeArray/String/window:
                 context) {  // @param NodeSet/Node(= void 0): context
    this.stack = [[]]; // [NodeSet, ...]

    this.nodeArray = !expression ? [] // empty nodeArray
        : (expression === win || expression[_nodeType]) ? [expression] // window / node
        : typeof expression === _string ?
            (!expression[_indexOf]("<") ? [uunodebulk(expression)]  // <div> -> fragment
                                        : uuquery(expression, context &&
                                                  context.nodeArray ? context.nodeArray.concat()
                                                                    : context)) // query
        : _isArray(expression) ? expression.concat() // clone NodeArray
        : (expression instanceof NodeSet) ? expression.nodeArray.concat() // copy constructor
        : []; // bad expr
}

NodeSet[_prototype] = {
    // --- STACK ---
    back:           NodeSetBack,        // NodeSet.back():NodeSet
    find:           NodeSetFind,        // NodeSet.find(expression:String):NodeSet
    // --- NodeSet MANIPULATOR ---
    nth:            NodeSetNth,         // NodeSet.nth(indexer:Number = 0,
                                        //             evaluator:Function = void):Node/NodeSet
    each:           NodeSetEach,        // NodeSet.each(evaluator:Function):NodeSet
    size:           NodeSetSize,        // NodeSet.size():Number
    clone:          NodeSetClone,       // NodeSet.clone():Array
    indexOf:        NodeSetIndexOf,     // NodeSet.indexOf(node):Number(index or -1)
    add:            NodeSetAdd,         // NodeSet.add(source:Node/DocumentFragment/HTMLFragment/TagName = "div",
                                        //             position:String = ".$"):NodeSet
//  remove:         NodeSetRemove,      // NodeSet.remove() -> NodeSet
    // --- ATTRIBUTE, CSS, Node.className ---
//  attr:           NodeSetAttr,        // NodeSet.attr(key:String/Hash = void,
                                        //              value:String = void):NodeSet/Array
//  css:            NodeSetCSS,         // NodeSet.css(key:String/Hash = void,
                                        //             value:String = void):NodeSet/Array
    klass:          NodeSetKlass,       // NodeSet.klass(expression:String = ""):NodeSet
//  html:           NodeSetHTML,        // NodeSet.html(html:HTMLFragment = ""):NodeSet/StringArray
//  text:           NodeSetText,        // NodeSet.text(text:String = ""):NodeSet/StringArray
//  bind:           NodeSetBind,        // NodeSet.bind(eventTypeEx:EventTypeExString,
                                        //              evaluator:Function/Instance):NodeSet
//  unbind:         NodeSetUnbind,      // NodeSet.unbind(eventTypeEx:EventTypeExString):NodeSet
//  fx:             NodeSetFx,          // NodeSet.fx(duration:Number, param:Hash, callback:Function = void):NodeSet
    iter:           NodeSetIter         // [PROTECTED]
};
uu.nodeSet = NodeSet[_prototype];       // uu.nodeSet - uu.Class.NodeSet.prototype alias

// NodeSet.back
function NodeSetBack() { // @return NodeSet:
    this.nodeArray = this.stack.pop() || [];
    return this;
}

// NodeSet.find
function NodeSetFind(expression) { // @param String: expression, "css > expr"
                                   // @return NodeSet:
    this.stack.push(this.nodeArray); // add stack
    this.nodeArray = uuquery("! " + expression, this.nodeArray); // ":scope expr"
    return this;
}

// NodeSet.nth - nodeSet[indexer]
function NodeSetNth(indexer,     // @param Number(= 0): indexer,
                                 //                   :  0 is first element
                                 //                   : -1 is last element
                                 //                   : indexer < 0 is negative index
                    evaluator) { // @param Function(= void): callback function
                                 //                          evaluator(node, index)
                                 // @return Node/NodeSet: evaluator == void is return Node
    var rv = this.nodeArray[indexer < 0 ? indexer + this.nodeArray.length
                                        : indexer || 0];

    return evaluator ? (evaluator(rv, indexer), this) : rv;
}

// NodeSet.each
function NodeSetEach(evaluator) { // @param Function: evaluator
                                  // @return NodeSet:
    this.nodeArray.forEach(evaluator);
    return this;
}

// NodeSet.size - get nodeSet.length
function NodeSetSize() { // @return Number:
    return this.nodeArray.length;
}

// NodeSet.clone - clone nodeSet Array
function NodeSetClone() { // @return Array: nodeSet
    return this.nodeArray.concat();
}

// NodeSet.indexOf - NodeSet.indexOf(node)
function NodeSetIndexOf(node) { // @param Node:
                                // @return Number: found index or -1
    return this.nodeArray[_indexOf](node);
}

// NodeSet.add - add node or fragment
function NodeSetAdd(source,     // @param Node/DocumentFragment/HTMLFragment/TagName(= "div"):
                    position) { // @param String(= ".$"): insert position
                                // @return NodeSet:
    var ary = this.nodeArray, context, i = -1;

    if (ary.length === 1) {
        uunodeadd(source, ary[0], position);
    } else {
        while ( (context = ary[++i]) ) {
            uunodeadd(uunodebulk(source), context, position); // clone node
        }
    }
    return this;
}

// NodeSet.klass
function NodeSetKlass(expression) { // @param String(= ""):
                                    // @return NodeSet:
    var method = NodeSetKlass.cmd[expression.charAt(0)] || uuklassadd;

    return NodeSetIter(1, this, method, expression.slice(1)) // + - !
}
NodeSetKlass.cmd = { "+": uuklassadd,      // [add]    "+class"
                     "-": uuklassremove,   // [remove] "-class"
                     "!": uuklasstoggle }; // [toggle] "!class"

// NodeSet.iter - NodeSet iterator
function NodeSetIter(iterType,  // @param Number: 0 is forEach, 1 is map
                     that,      // @param NodeSet:
                     evaluator, // @param Function: evaluator
                     param1,    // @param Mix: param
                     param2,    // @param Mix: param
                     param3,    // @param Mix: param
                     param4) {  // @param Mix: param
                                    // @return NodeSet:
    var node, ary = that.nodeArray, i = -1,
        rv = [], r, arrayResult = 0;

    while ( (node = ary[++i]) ) {
        if (node && node[_nodeType] === 11) { // 11: DocumentFragment
            node = node[_firstChild] || node;
        }
        r = evaluator(node, param1, param2, param3, param4);
        i || !iterType || r === node || ++arrayResult;
        arrayResult && (rv[i] = r);
    }
    return (iterType && arrayResult) ? rv : that;
}

// forEach(iter = 0)
uueach({    bind:       uuevent,
            unbind:     uueventunbind,
            fx:         uufx,
            skip:       uufxskip,
            remove:     uunoderemove,
            show:       uucssshow,
            hide:       uucsshide       }, function(fn, name) {

    NodeSet[_prototype][name] = function(a, b, c) {
        return NodeSetIter(0, this, fn, a, b, c);
    }
});

// map(iter = 1)
uueach({    attr:   uuattr,
            css:    uucss,
            html:   uuhtml,
            text:   uutext      }, function(fn, name) {
    NodeSet[_prototype][name] = function(a, b) {
        return NodeSetIter(1, this, fn, a, b);
    }
});

// --- initialize ---

// inner - build DOM Lv2 event handler - uu.click(), ...
uueach(uuevent.shortcut, function(eventType) {
    uu[eventType] = function(node, fn) { // uu.click(node, fn) -> node
        return uuevent(node, eventType, fn);
    };

    uu["un" + eventType] = function(node) { // uu.unclick(node) -> node
        return uueventunbind(node, eventType);
    };

    var ns = NodeSet[_prototype];

    ns[eventType] = function(fn) { // uu("li").click(fn) -> NodeSet
        return NodeSetIter(0, this, uuevent, eventType, fn);
    };

    ns["un" + eventType] = function() { // uu("li").unclick() -> NodeSet
        return NodeSetIter(0, this, uueventunbind, eventType);
    };
});

// inner - setup node builder - uu.div(), uu.a(), ...
uueach(uutag.html4, function(tagName) {
    uu[tagName] = function() { // @param Mix: var_args
        return buildNode(tagName, arguments);
    };
});

uueach(uutag.html5, function(tagName) {
//{{{!mb
    _ie && doc[_createElement](tagName); // [IE6][IE7][IE8][IE9]
//}}}!mb

    uu[tagName] = function() { // @param Mix: var_args
        return buildNode(tagName, arguments);
    };
});

//{{{!mb
try {
    // Internet Explorer 6 flicker fix
    _ver.ie6 && doc.execCommand("BackgroundImageCache", _false, _true);
} catch(err) {} // ignore error(IETester / stand alone IE too)
//}}}!mb

// --- window.onload handler ---
function _windowonload() {
    uuready.window = _true;
    _DOMContentLoaded();
    uureadyfire("window");
}
uueventattach(win, "load", _windowonload);

// --- DOMContentLoaded handler ---
function _DOMContentLoaded() {
    if (!uuready.reload && !uuready.dom) {
        uuready.dom = _true;
        uureadyfire("dom");
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
(_ie && _ver < 9) ? _IEDOMContentLoaded() : // [IE6][IE7][IE8]
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
                !v.name[_indexOf]("data-") && (node[v.name] = null);
            }
        } catch (err) {}
    }
    doc.html = doc.head = null;
    uueventdetach(win, "onload", _windowonload);
    uueventdetach(win, "onunload", _windowonunload);
}
_ie && _ver < 9 && uueventdetach(win, "onunload", _windowonunload);
//}}}!mb

// inner -
// 1. prebuild camelized hash - http://handsout.jp/slide/1894
// 2. prebuild nodeid
uuready(function() {
    var nodeList = uutag("*", _rootNode), v, i = -1,
        styles = uusplittohash((
//{{{!mb
                !uuready[_getAttribute] ? "float,styleFloat,cssFloat,styleFloat" :
//}}}!mb
                                          "float,cssFloat"
            ) + ",d,display,w,width,h,height,x,left,y,top,l,left,t,top," +
                "c,color,bg,background,bgc,backgroundColor,bgi,backgroundImage," +
                "o,opacity,z,zIndex,fs,fontSize," +
                "pos,position,m,margin,b,border,p,padding");

    uumix(_camelhash(uufix.db,
                     _webkit ? getComputedStyle(_rootNode, 0)
                             : _rootNode.style), styles, uuattr.fix);
    uunodeid(_rootNode);
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
        if (typeof props[k] === _string) {
//{{{!mb
            if (_webkit) {
//}}}!mb
                v = k = props.item(k); // k = "-webkit-...", "z-index"
                k[_indexOf]("-") >= 0 && (v = k[_replace](CAMELIZE, _camelize));
                (k !== v) && (rv[k] = v);
//{{{!mb
            } else {
                v = ((_gecko && !k[_indexOf]("Moz")) ? "-moz" + k.slice(3) :
                     (_ie    && !k[_indexOf]("ms"))  ? "-ms"  + k.slice(2) :
                     (_opera && !k[_indexOf]("O"))   ? "-o"   + k.slice(1) : k)
                    [_replace](DECAMELIZE, _decamelize);
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

// inner - BinaryString To ByteArray
function toByteArray(data) { // @param BinaryString: "\00\01"
                             // @return ByteArray: [0x00, 0x01]
    var rv = [], bb2num = _bb2num, remain,
        ary = data.split(""),
        i = -1, iz;

    iz = ary.length;
    remain = iz % 8;

    while (remain--) {
        ++i;
        rv[i] = bb2num[ary[i]];
    }
    remain = iz >> 3;
    while (remain--) {
        rv.push(bb2num[ary[++i]], bb2num[ary[++i]],
                bb2num[ary[++i]], bb2num[ary[++i]],
                bb2num[ary[++i]], bb2num[ary[++i]],
                bb2num[ary[++i]], bb2num[ary[++i]]);
    }
    return rv;
}

//{{{!mb
// inner - BinaryString to ByteArray
function toByteArrayIE(xhr) {
    var rv = [], data, remain,
        charCodeAt = "charCodeAt", _0xff = 0xff,
        loop, v0, v1, v2, v3, v4, v5, v6, v7,
        i = -1, iz;

    iz = vblen(xhr);
    data = vbstr(xhr);
    loop = Math.ceil(iz / 2);
    remain = loop % 8;

    while (remain--) {
        v0 = data[charCodeAt](++i); // 0x00,0x01 -> 0x0100
        rv.push(v0 & _0xff, v0 >> 8);
    }
    remain = loop >> 3;
    while (remain--) {
        v0 = data[charCodeAt](++i);
        v1 = data[charCodeAt](++i);
        v2 = data[charCodeAt](++i);
        v3 = data[charCodeAt](++i);
        v4 = data[charCodeAt](++i);
        v5 = data[charCodeAt](++i);
        v6 = data[charCodeAt](++i);
        v7 = data[charCodeAt](++i);
        rv.push(v0 & _0xff, v0 >> 8, v1 & _0xff, v1 >> 8,
                v2 & _0xff, v2 >> 8, v3 & _0xff, v3 >> 8,
                v4 & _0xff, v4 >> 8, v5 & _0xff, v5 >> 8,
                v6 & _0xff, v6 >> 8, v7 & _0xff, v7 >> 8);
    }
    iz % 2 && rv.pop();

    return rv;
}
_ie && document.write('<script type="text/vbscript">\
Function vblen(b)vblen=LenB(b.responseBody)End Function\n\
Function vbstr(b)vbstr=CStr(b.responseBody)+chr(0)End Function</'+'script>');
//}}}!mb

// inner - detect versions and meta informations
function detectVersions(libraryVersion) { // @param Number: Library version
                                          // @return VersionHash:
//{{{!mb
    // detect FlashPlayer version
    function detectFlashPlayerVersion(ie, minimumVersion) {
        var rv = 0, ver, m;

        try {
            ver = ie ? (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")).
                            GetVariable("$version")[_replace](/,/g, ".")
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

    var rv = { library: libraryVersion,
               ie: _false, ie6: _false, ie7: _false, ie8: _false, ie9: _false,
               opera: _false, gecko: _false, webkit: _true,
               chrome: _false, safari: _true, mobile: _true, jit: _true,
               flash: 0, silverlight: 0 },
//{{{!mb
        ie = !!doc.uniqueID, documentMode = doc.documentMode,
//}}}!mb
        opera = win.opera || _false,
        userAgent = navigator.userAgent,
        // http://d.hatena.ne.jp/uupaa/20090603
        rennum = ((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.exec(userAgent)
                   || [,0])[1]).toString(),
        render = parseFloat(rennum[_replace](/[^\d\.]/g, "")
                            [_replace](/^(\d+\.\d+)(\.(\d+))?$/,"$1$3")),
        browser = opera ? +(opera.version()[_replace](/\d$/, ""))
                        : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                                     exec(userAgent) || [,0])[1]);

    rv.render       = render;
    rv.browser      = browser;
    rv.valueOf      = function() {
                          return browser;
                      };
//{{{!mb
    rv.ie           = ie;
    rv.ie6          = ie && browser === 6;
    rv.ie7          = ie && browser === 7;
    rv.ie8          = ie && documentMode === 8;
    rv.ie9          = ie && documentMode === 9;
    rv.opera        = win.opera ? _true : _false;
    rv.gecko        = test(/Gecko\//);
    rv.webkit       = test(/WebKit/);
    rv.chrome       = test(/Chrome/);
    rv.safari       = !rv.chrome && test(/Safari/);
    rv.mobile       = test(/Mobile/) || test(/Opera Mini/);
//}}}!mb
    rv.iphone       = test(/iPad|iPod|iPhone/);
    rv.android      = test(/Android/);
    rv.os           = rv.iphone         ? "iphone"  // iPhone OS    -> "iphone"
                    : rv.android        ? "android" // Android OS   -> "android"
//{{{!mb
                    : test(/CrOS/)      ? "chrome"  // Chrome OS    -> "chrome"
                    : test(/Win/)       ? "windows" // Windows OS   -> "windows"
                    : test(/Mac/)       ? "mac"     // Mac OS       -> "mac"
                    : test(/X11|Linux/) ? "unix"    // Unix Base OS -> "unix"
//}}}!mb
                    : "";                           // Unknown OS   -> ""
//{{{!mb
    rv.jit          = (ie        && browser >= 9)   || // IE 9+
                      (rv.gecko  && render  >  1.9) || // Firefox 3.5+(1.91)
                      (rv.webkit && render  >= 528) || // Safari 4+, Google Chrome(2+)
                      (rv.opera  && browser >= 10.5);  // Opera10.50+
    rv.flash        = detectFlashPlayerVersion(ie, 9); // FlashPlayer 9+
    rv.silverlight  = detectSilverlightVersion(ie, 3); // Silverlight 3+
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
//}}}!mb
    return rv;
}

//{{{!mb
function fakeToArray(fakeArray) { // @param FakeArray: NodeList, Arguments
                                  // @return Array:
    if (uuready.ArraySlice) {
        return Array[_prototype].slice.call(fakeArray);
    }

    var rv = [], i = 0, iz = fakeArray.length;

    for (; i < iz; ++i) {
        rv[i] = fakeArray[i];
    }
    return rv;
}
//}}}!mb

function detectFeatures() {
    var hash = { rgba: _true, hsla: _true, transparent: _true },
//{{{!mb
        transparent = "transparent",
        node = uunode(), child, style = node.style,
//}}}!mb
        rv = {
            opacity: _true,         // opacity ready
            color: uuarg(hash),     // color: rgba, hsla, transparent ready
            border: uuarg(hash),    // border: rgba, hsla, transparent ready
            background: uuarg(hash),// background: rgba, hsla, transparent ready
            ArraySlice: _true,      // Array.prototype.slice.call(FakeArray) ready
            getAttribute: _true,    // getAttribute("href"), getAttribute("class") ready
            StringIndexer: _true    // String[indexer] ready
        };

//{{{!mb
    uueach({ rgba: ["rgba(255,0,0,0.5)", /rgba.2/],
             hsla: ["hsla(100,100%,100%,0.5)", /rgba.2|hsla.1/],
             transparent: [transparent, /tran|rgba/] }, function(v, i) {
        style.cssText = 'color:' + v[0] + ';background:' + v[0] +
                        ';border:0 none ' + v[0];
        rv.color[i] = v[1].test(style.color);
        rv.border[i] = v[1].test(style.borderTopColor);
        rv.background[i] = v[1].test(style.backgroundColor);
    });
    // detect opacity - http://d.hatena.ne.jp/uupaa/20100513
    rv.opacity = style.opacity != void 0;

    node.innerHTML = '<a href="/a" class="a"></a>';
    child = node[_firstChild];
    try {
        Array[_prototype].slice.call(doc.getElementsByTagName("head"));
    } catch(err) { rv.ArraySlice = _false; }
    rv[_getAttribute] = child[_getAttribute]("class") === "a" &&
                        child[_getAttribute]("href") === "/a";
    rv.StringIndexer = !!"0"[0];

    // revise
    if (_ver.ie) {
        _ver < 9 && (rv.color[transparent] = _false);
        _ver < 7 && (rv.border[transparent] = _false);
    }
//}}}!mb
    return rv;
}

})(this, document, parseInt, parseFloat, this.getComputedStyle, this.JSON);
