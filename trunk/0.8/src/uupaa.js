/*!{id:"uupaa.js",ver:0.8,license:"MIT",author:"uupaa.js@gmail.com"}*/

// === Core ===

// * Manual http://code.google.com/p/uupaa-js/w/list

var uu; // window.uu - uupaa.js library namespace

uu || (function(win, // @param GlobalObject: as window
                doc, // @param DocumentObject: as document
                parseInt, parseFloat, getComputedStyle, JSON) { // minify

var _prototype = "prototype",
    _toString = Object[_prototype].toString,
    _isArray = Array.isArray || (Array.isArray = ArrayIsArray), // ES5 spec
    _slice = Array[_prototype].slice,
    // --- HTML5: EMBEDDING CUSTOM NON-VISIBLE DATA ---
//{{{!fx
    _uufx = "data-uufx",
//}}}!fx
//{{{!image
    _uuimage = "data-uuimage",
//}}}!image
    _uuevent = "data-uuevent",
    _uutrans = "data-uutrans", // for uu.css.transform
    _uunodeid = "data-uunodeid",
    // --- minify ---
    _addEventListener = "addEventListener",
    _documentElement = "documentElement",
    _createTextNode = "createTextNode",
    _createElement = "createElement",
    _getAttribute = "getAttribute",
    _setAttribute = "setAttribute",
    _toLowerCase = "toLowerCase",
    _appendChild = "appendChild",
    _nextSibling = "nextSibling",
    _removeChild = "removeChild",
    _parentNode = "parentNode",
    _firstChild = "firstChild",
    _visibility = "visibility",
    _lastChild = "lastChild",
    _className = "className",
    _nodeArray = "nodeArray",
    _nodeType = "nodeType",
    _replace = "replace",
    _indexOf = "indexOf",
    _display = "display",
    _tagName = "tagName",
    _concat = "concat",
    _number = "number",
    _string = "string",
    _height = "height",
    _before = "before",
    _after = "after",
    _width = "width",
    _false = !1,
    _true = !0,
    _types = { "undefined": 8 },
    _trimSpace = /^\s+|\s+$/g,
    _rootNode = doc[_documentElement],
    _dd2num = {},               // uu.hash.dd2num = {  "00":    0 , ...  "99":   99  }
    _num2dd = {},               // uu.hash.num2dd = {    0 :  "00", ...   99 :  "99" }
    _bb2num = {},               // uu.hash.bb2num = { "\00":    0 , ... "\ff":  255  }
    _num2bb = {},               // uu.hash.num2bb = {    0 : "\00", ...  255 : "\ff" }
    _hh2num = {},               // uu.hash.hh2num = {  "00":    0 , ...  "ff":  255  }
    _num2hh = { 256: "00" },    // uu.hash.num2hh = {    0 :  "00", ...  255 :  "ff", 256: "00" }
    _guidnum = 0,       // guid counter
    _nodeiddb = {},     // { nodeid: node, ... }
    _nodeidnum = 0,     // nodeid counter
//{{{!mb
    _tokenCache = {},   // { css-selector-expression: token, ... }
//}}}!mb
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
uu = uumix(uufactory, {             // uu(expr:NodeSet/Node/NodeArray/ClassNameString/window,
                                    //    arg1:NodeSet/Node/Expression/Mix = void,
                                    //    arg2:Mix = void,
                                    //    arg3:Mix = void,
                                    //    arg4:Mix = void):Instance/NodeSet
                                    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Class.MyClass(arg1, arg2)
                                    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> NodeSet
    config:   uuarg(win.uuconfig, { // uu.config - Hash: user configurations
        log:        "log"           //  uu.log - target node
    }),
    // --- VERSION DETECTION ---
    ver:            _ver,           // uu.ver - Hash: detected version and plugin informations
    ie:             _ie,
    gecko:          _gecko,
    opera:          _opera,
    webkit:         _webkit,
    // --- CODE SNIPPET ---
//{{{!snippet
    snippet:        uusnippet,      // uu.snippet(id:String, arg:Hash/Array):String/Mix
//}}}!snippet
    // --- AJAX / JSONP ---
//{{{!ajax
    ajax:     uumix(uuajax, {       // uu.ajax(url:String, option:Hash, callback:Function)
                                    //  [1][load aync] uu.ajax("http://...", { method: "POST", data: ... }, callback)
        binary:     uuajaxbinary,   // uu.ajax.binary(url:String, option:Hash, callback:Function)
        clear:      uuajaxclear     // uu.ajax.clear() - cache clear
    }),
    require:        uurequire,      // uu.require(url:String, option:Hash = {}):Hash - { data, option, status, ok }
                                    //  [1][load sync] uu.require("http://...") -> { data, option, status, ok }
    jsonp:          uujsonp,        // uu.jsonp(url:String, option:Hash, callback:Function)
                                    //  [1][load aync] uu.jsonp("http://...callback=??", { method: "mycallback" }, callback)
//}}}!ajax
    // --- TYPE MATCH / TYPE DETECTION ---
    like:           uulike,         // uu.like(lhs:Date/Hash/Fake/Array, rhs:Date/Hash/Fake/Array):Boolean
    type:           uutype,         // uu.type(mix:Mix):Number
                                    //  uu.type.BOOLEAN      -  1: Boolean
                                    //  uu.type.NUMBER       -  2: Number
                                    //  uu.type.STRING       -  3: String
                                    //  uu.type.FUNCTION     -  4: Function
                                    //  uu.type.ARRAY        -  5: Array
                                    //  uu.type.DATE         -  6: Date
                                    //  uu.type.REGEXP       -  7: RegExp
                                    //  uu.type.UNDEFINED    -  8: undefined
                                    //  uu.type.NULL         -  9: null
                                    //  uu.type.HASH         - 10: Hash (Object)
                                    //  uu.type.NODE         - 11: Node (HTMLElement)
                                    //  uu.type.FAKEARRAY    - 12: FakeArray (Arguments, NodeList, ...)
    isNumber:       isNumber,       // uu.isNumber(search:Mix):Boolean
    isString:       isString,       // uu.isString(search:Mix):Boolean
    isFunction:     isFunction,     // uu.isFunction(search:Mix):Boolean
    // --- HASH / ARRAY ---
    arg:            uuarg,          // uu.arg(arg1:Hash/Function = {}, arg2:Hash, arg3:Hash = void):Hash/Function
    mix:            uumix,          // uu.mix(base:Hash/Function, flavor:Hash, aroma:Hash = void,
                                    //        override:Boolean = true):Hash/Function
    each:           uueach,         // uu.each(source:Hash/Array, evaluator:Function, arg:Mix = void)
    keys:           uukeys,         // uu.keys(source:Hash/Array):Array
    values:         uuvalues,       // uu.values(source:Hash/Array):Array
    hash:     uumix(uuhash, {       // uu.hash(key:Hash/String, value:Mix = void):Hash
                                    //  [1][through Hash]                 uu.hash({ key: "val" })  -> { key: "val" }
                                    //  [2][key/value pair to hash]       uu.hash("key", mix)      -> { key: mix }
                                    //  [3][hash from comma joint string] uu.hash("key1,a,key2,b") -> { key1: "a", key2: "b" }
        has:        uuhas,          // uu.hash.has(source:Hash, search:Hash):Boolean
        nth:        uunth,          // uu.hash.nth(source:Hash, index:Number):Array
        size:       uusize,         // uu.hash.size(source:Hash):Number
        clone:      uuclone,        // uu.hash.clone(source:Hash):Hash - shallow copy
        indexOf:    uuindexof       // uu.hash.indexOf(source:Hash, searchValue:Mix):String/void
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
        dump:       uuarraydump,    // uu.array.dump(source:ByteArray, type:String = "HEX"):String
                                    //  [1][ByteArray dump] uu.array.dump([1, 2, 3]) -> "010203"
                                    //  [2][ByteArray dump] uu.array.dump([1, 2, 3], "0x", ", 0x") -> "0x01, 0x02, 0x03"
        size:       uusize,         // uu.array.size(source:Array):Number
        sort:       uuarraysort,    // uu.array.sort(source:Array, method:String/Function = "A-Z"):Array
        clean:      uuclean,        // uu.array.clean(source:Array):Array
        clone:      uuclone,        // uu.array.clone(source:Array):Array - shallow copy
        toHash:     uutohash        // uu.array.toHash(key:Array, value:Array/Mix, toNumber:Boolean = false):Hash
    }),
    // --- ATTRIBUTE ---
    attr:           uuattr,         // uu.attr(node:Node, key:String/Hash = void,
                                    //                    value:String = void):String/Hash/Node
                                    //  [1][get all pair]   uu.attr(node) -> { key: value, ... }
                                    //  [2][get value]      uu.attr(node, key) -> "value"
                                    //  [3][set pair]       uu.attr(node, key, "value") -> node
                                    //  [4][set pair]       uu.attr(node, { key: "value", ... }) -> node
    // --- DATASET ---
    data:     uumix(uudata, {       // uu.data(node:Node, key:String/Hash = void,
                                    //                    value:Mix: = void):Hash/Mix/Node/undefined
                                    //  [1][get all pair]   uu.data(node) -> { key: value, ... }
                                    //  [2][get value]      uu.data(node, key) -> value
                                    //  [3][set pair]       uu.data(node, key, value) -> node
                                    //  [4][set pair]       uu.data(node, { key: value, ... }) -> node
        clear:      uudataclear     // uu.data.clear(node:Node, key:String = void):Node
                                    //  [1][clear all pair] uu.data.clear(node) -> node
                                    //  [2][clear pair]     uu.data.clear(node, key) -> node
//      bind:       uudatabind,     // uu.data.bind(key:String, callback:Function)
//      unbind:     undataunbind    // uu.data.unbind(key:String)
    }),
    // --- CSS / STYLE / STYLESHEET / VIEW PORT ---
    css:      uumix(uucss, {        // uu.css(expr:Node/StyleSheetIDString/ReserveWordString,
                                    //        key:Boolean/String/Hash = void,
                                    //        value:String = void):Hash/String/Node/StyleSheet
                                    //  [1][getComputedStyle(or currentStyle)] uu.css(node)       -> { key: value, ... }
                                    //  [2][getComputedStyle(+ px unitize)   ] uu.css(node, true) -> { key: value, ... }
                                    //  [3][get node.style value]              uu.css(node, key)  -> value
                                    //  [4][set node.style pair]               uu.css(node, key, value) -> node
                                    //  [5][set node.style pair]               uu.css(node, { key: value, ... }) -> node
                                    //  [6][get StyleSheet object]             uu.css("myStyleSheet") -> StyleSheet
//{{{!fx
        show:       uucssshow,      // uu.css.show(node:Node, duration:Number = 0, displayValue:String= "block"):Node
        hide:       uucsshide,      // uu.css.hide(node:Node, duration:Number = 0):Node
//}}}!fx
        unit:       uucssunit,      // uu.css.unit(node:Node, value:Number/CSSUnitString,
                                    //                    quick:Boolean = false,
                                    //                    prop:String = "left"):Number
                                    //  [1][convert pixel]  uu.css.unit(<div>, 123) -> 123
                                    //  [2][convert pixel]  uu.css.unit(<div>, "12px") -> 12
                                    //  [3][convert pixel]  uu.css.unit(<div>, "12em") -> 192
                                    //  [4][convert pixel]  uu.css.unit(<div>, "12pt") -> 16
                                    //  [5][convert pixel]  uu.css.unit(<div>, "auto") -> 100
                                    //  [6][convert pixel]  uu.css.unit(<div>, "auto", 0, "borderTopWidth") -> 0
        isShow:     uucssisshow,    // uu.css.isShow(node:Node/CSSProperties):Boolean
        opacity:    uucssopacity,   // uu.css.opacity(node:Node, value:Number/String):Number/Node
                                    //  [1][get opacity] uu.css.opacity(node) -> 0.5
                                    //  [2][set opacity] uu.css.opacity(node, 0.5) -> node
        transform:  uucsstransform, // uu.css.transform(node:Node):Node/NumberArray
                                    //  [1][get transform] uu.css.transform(node) -> [scaleX, scaleY, rotate, translateX, translateY ]
                                    //  [2][set transform] uu.css.transform(node, 1, 1, 0, 0, 0) -> node
        selectable: uucssselectable // uu.css.selectable(node:Node, allow:Boolean = false):Node
    }),
    viewport:       uuviewport,     // uu.viewport():Hash - { innerWidth, innerHeight, pageXOffset, pageYOffset, orientation }
    // --- EFFECT / ANIMATION ---
//{{{!fx
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
        skip:       uufxskip,       // uu.fx.skip(node:Node = null, skipAll:Boolean = false):Node/NodeArray
        isBusy:     uufxisbusy      // uu.fx.isBusy(node:Node):Boolean
    }),
//}}}!fx
    // --- QUERY ---
    id:             uuid,           // uu.id(expr:String, context:Node = document):Node/null
    tag:            uutag,          // uu.tag(expr:String, context:Node = document):NodeArray
    match:          uumatch,        // uu.match(expr:CSSSelectorExpressionString, context:Node = document):Boolean
    query:          uuquery,        // uu.query(expr:CSSSelectorExpressionString, context:NodeArray/Node = document):NodeArray
    // --- CLASSNAME ---
    klass:    uumix(uuklass, {      // uu.klass(expr:String, context:Node = document):NodeArray
        has:        uuklasshas,     // uu.klass.has(node:Node, classNames:String):Boolean
        add:        uuklassadd,     // uu.klass.add(node:Node, classNames:String):Node
        remove:     uuklassremove,  // uu.klass.remove(node:Node, classNames:String):Node
        toggle:     uuklasstoggle   // uu.klass.toggle(node:Node, classNames:String):Node
    }),
    // --- OOP ---
    Class:    uumix(uuclass, {      // uu.Class(className:String, proto:Hash/Function = void)
                                    //  [1][base]    uu.Class("A",   { proto: ... })
                                    //  [2][inherit] uu.Class("B:A", { proto: ... })
        singleton:  uuclasssingleton// uu.Class.singleton(className:String, proto:Hash/Function = void)
    }),
    // --- EVENT ---
    event:    uumix(uuevent, {      // uu.event(node:Node, eventTypeEx:EventTypeExString,
                                    //                     evaluator:Function/Instance):Node
                                    //  [1][bind a event]            uu.event(node, "click", fn)             -> node
                                    //  [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
                                    //  [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
                                    //  [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node
        has:        uuhas,          // uu.event.has(node:Node, eventTypeEx:EventTypeExString):Boolean
        key:        uueventkey,     // uu.event.key(event:EventObjectEx):Hash - { key, code }
        edge:       uueventedge,    // uu.event.edge(event:EventObjectEx):Hash - { x, y }
        fire:       uueventfire,    // uu.event.fire(node:Node, eventType:String, param:Mix = void):Node
        stop:       uueventstop,    // uu.event.stop(event:EventObjectEx)
        hover:      uueventhover,   // uu.event.hover(node:Node, expr:Function/ClassNameString):Node
                                    //  [1][enter/leave callback] uu.event.hover(node, function(enter){}) -> node
                                    //  [2][toggle className]     uu.event.hover(node, "hoverAction") -> node
        cyclic:     uueventcyclic,  // uu.event.cyclic(node:Node, eventTypeEx:EventTypeExString,
                                    //                 cyclic:Number, callback:Function):Node
        unbind:     uueventunbind,  // uu.event.unbind(node:Node, eventTypeEx:EventTypeExString = void):Node
        attach:     uueventattach,  // uu.event.attach(node:Node, eventType:String, evaluator:Function,
                                    //                                              useCapture:Boolean = false)
        detach:     uueventdetach   // uu.event.detach(node:Node, eventType:String, evaluator:Function,
                                    //                                              useCapture:Boolean = false)
    }),
    bind:           uuevent,        // uu.bind() as uu.event()
    unbind:         uueventunbind,  // uu.unbind() as uu.event.unbind()
    // --- RESIZE EVENT ---
//{{{!resize
    resize:         uuresize,       // uu.resize(evaluator)
    unresize:       uuunresize,     // uu.unresize()
//}}}!resize
    // --- LIVE EVENT ---
//{{{!live
    live:     uumix(uulive, {       // uu.live(expr:CSSSelectorExpressionString, eventTypeEx:EventTypeExString,
                                    //         evaluator:Function/Instance)
                                    //  [1][bind] uu.live("css > selector", "namespace.click", callback)
        has:        uulivehas       // uu.live.has(expr:CSSSelectorExpressionString, eventTypeEx:EventTypeExString):Boolean
    }),
    unlive:         uuunlive,       // uu.unlive(expr:CSSSelectorExpressionString = void, eventTypeEx:EventTypeExString = void)
                                    //  [1][unbind all]           uu.unlive()
                                    //  [2][unbind all]           uu.unlive("selector")
                                    //  [3][unbind one]           uu.unlive("selector", "click")
                                    //  [4][unbind namespace all] uu.unlive("selector", "namespace.*")
                                    //  [5][unbind namespace one] uu.unlive("selector", "namespace.click")
//}}}!live
    // --- NODE / NodeList / NodeID ---
    node:     uumix(uunode, {       // uu.node(tag:TagNameString = "div",
                                    //         args:Array/Argeumtns = void,
                                    //         typical:StringArray = void,
                                    //         callback:Function = void):Node
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
        sort:       uunodesort,     // uu.node.sort(ary:NodeArray, context:Node = <body>):Array - sort by document order
        swap:       uunodeswap,     // uu.node.swap(swapin:Node, swapout:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        clear:      uunodeclear,    // uu.node.clear(parent:Node):Node
        clone:      uunodeclone,    // uu.node.clone(parent:Node, quick:Boolean = false):Node
        remove:     uunoderemove,   // uu.node.remove(node:Node):Node
        indexOf:    uunodeindexof,  // uu.node.indexOf(node:Node):Number
        children:   uunodechildren, // uu.node.children(parent:Node):NodeArray
        normalize:  uunodenormalize // uu.node.normalize(parent:Node = <body>, depth:Number = 0):Number
    }),
    nodeid:   uumix(uunodeid, {     // uu.nodeid(node:Node):Number (nodeid)
        toNode:     uunodeidtonode, // uu.nodeid.toNode(nodeid:Number):Node
        remove:     uunodeidremove  // uu.nodeid.remove(node:Node):Node (removed node)
    }),
    // --- NODE BUILDER ---
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
    // --- FORM.VALUE ---
//{{{!form
    value:          uuvalue,        // uu.value(node:Node, value:String = void):StringArray/Node
                                    //  [1][get] uu.value(node) -> value or [value, ...]
                                    //  [2][set] uu.value(node, "value") -> node
                                    //  [3][get <textarea>]       uu.value(node) -> "innerText"
                                    //  [4][get <button>]         uu.value(node) -> "<button value>"
                                    //  [5][get <option>]         uu.value(node) -> "<option value>" or
                                    //                                              "<option>value</option>"
                                    //  [6][get <selet>]          uu.value(node) -> selected option value
                                    //  [7][get <selet multiple>] uu.value(node) -> ["value", ...]
                                    //  [8][get <input checkbox>] uu.value(node) -> ["value", ...]
                                    //  [9][get <input radio>]    uu.value(node) -> "value"
//}}}!form
    // --- JSON ---
    json:     uumix(uujson, {       // uu.json(source:Mix, alt:Boolean = false):JSONString
        decode:     uujsondecode    // uu.json.decode(jsonString:JSONString, alt:Boolean = false):Mix/Boolean
    }),
    // --- STRING ---
    fix:            uufix,          // uu.fix(source:String):String
                                    //  [1][css-prop to js-css-prop] uu.fix("background-color") -> "backgroundColor"
                                    //  [2][std-name to ie-name]     uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
                                    //  [3][html-attr to js-attr]    uu.fix("for")              -> "htmlFor"
                                    //  [4][through]                 uu.fix("-webkit-shadow")   -> "-webkit-shadow"
    trim:     uumix(uutrim, {       // uu.trim(source:String, replacement:String = " "):String
                                    //  [1][trim and inner space] uu.trim("  has  space  ") -> "has  space"
        tag:        uutrimtag,      // uu.trim.tag("  <h1>A</h1>  B  <p>C</p>  ") -> "A B C"
                                    //  [1][trim tags]            uu.trim.tag("  <h1>A</h1>  B  <p>C</p>  ") -> "A B C"
        func:       uutrimfunc,     // uu.trim.func('  url("http://...")  ') -> "http://..."
                                    //  [1][trim function]        uu.trim.func(' url("http://...") ') -> "http://..."
                                    //  [2][trim function]        uu.trim.func(' rgb(1, 2, 3) ')      -> "1, 2, 3"
        quote:      uutrimquote     // uu.trim.quote(' "quote string" ') -> 'quote string'
                                    //  [1][trim double and single quotes] uu.trim.quote(' "quote string" ') -> 'quote string'
    }),
    f:              uuf,            // uu.f(format:FormatString, var_args, ...):String
                                    //  [1][placeholder] uu.format("?? dogs and ??", 101, "cats") -> "101 dogs and cats"
    format:         uuf,            // uu.format(...) as uu.f
    // --- DATE ---
    date:           uudate,         // uu.date(source:DateHash/Date/Number/String= void):DateHash
                                    //  [1][get now]                 uu.date() -> DateHash
                                    //  [2][DateHash]                uu.date(DateHash) -> cloned DateHash
                                    //  [2][date to hash]            uu.date(Date) -> DateHash
                                    //  [3][time to hash]            uu.date(milliseconds) -> DateHash
                                    //  [4][DateString to hash]      uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
                                    //  [5][ISO8601String to hash]   uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
                                    //  [6][RFC1123String to hash]   uu.date("Wed, 16 Sep 2009 16:18:14 GMT") -> DateHash
    // --- NUMBER ---
    guid:           uuguid,         // uu.guid():Number - build GUID
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
    // --- COLOR ---
//{{{!color
    color:    uumix(uucolor, {      // uu.color(expr:Color/RGBAHash/HSLAHash/String):Color
                                    //  [1][Color]                     uu.color(Color)               -> Color
                                    //  [2][RGBAHash/HSLAHash to hash] uu.color({ h:0,s:0,l:0,a:1 }) -> Color
                                    //  [3][W3CNamedColor to hash]     uu.color("black")             -> Color
                                    //  [4]["#000..." to hash]         uu.color("#000")              -> Color
                                    //  [5]["rgba(,,,,)" to hash]      uu.color("rgba(0,0,0,1)")     -> Color
                                    //  [6]["hsla(,,,,) to hash]       uu.color("hsla(360,1%,1%,1)") -> Color
        add:        uucoloradd,     // uu.color.add(source:String)
        random:     uucolorrandom   // uu.color.random():Color
    }),
//}}}!color
    // --- IMAGE ---
//{{{!image
    image:    uumix(uuimage, {      // uu.image(url:String, callback:Function)
        size:       uuimagesize     // uu.image.size(node:HTMLImageElement):Hash - { w, h }
    }),
//}}}!image
    // --- SVG ---
//{{{!svg
    svg:      uumix(uusvg, {        // uu.svg(x:Number, y:Number, width:Number, height:Number,
                                    //        *attr:Hash, *css:Hash):<svg:svg>
        attr:       uuattr,         // uu.svg.attr(node:SVGNode, key:String/Hash = void,
                                    //             value:String = void):String/Hash/Node
                                    //  [1][get all pair]   uu.svg.attr(node) -> { key: value, ... }
                                    //  [2][get value]      uu.svg.attr(node, key) -> "value"
                                    //  [3][set pair]       uu.svg.attr(node, key, "value") -> node
                                    //  [4][set pair]       uu.svg.attr(node, { key: "value", ... }) -> node
                                    //  [5][remove attr]    uu.svg.attr(node, key, null) -> node
        css:        uucss,          // uu.svg.css(...)
        bind:       uuevent,        // uu.svg.bind(...)
        unbind:     uueventunbind   // uu.svg.unbind(...)
    }),
//}}}!svg
    // --- CANVAS ---
//{{{!canvas
    canvas:         uucanvas,       // uu.canvas(width:Number = 300, height:Number = 150,
                                    //           *attr:Hash, *css:Hash):<canvas>
//}}}!canvas
    // --- FLASH ---
//{{{!flash
//{{{!mb
    flash:          uuflash,        // uu.flash(url:String, option:FlashOptionHash):Node/null/void
//}}}!mb
//}}}!flash
    // --- DEBUG ---
    puff:           uupuff,         // uu.puff(source:Mix/FormatString, var_args:Mix, ...)
    log:            uulog,          // uu.log(log:Mix, var_args:Mix, ...)
    // --- UNIT TEST ---
//{{{!unittest
    ok:             uuok,           // uu.ok(lhs:Mix, operator:String, rhs:Mix = void, more:String = void)
                                    //  [1][test]           uu.ok("title", 1, "===", 1, "more info")
                                    //  [2][add separater]  uu.ok("separater comment")
                                    //  [3][get/show score] uu.ok() -> { ok, ng, total, ms }
//}}}!unittest
    // --- OTHER ---
    ui:             {},             // uu.ui - ui namespace
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    nop:            nop             // uu.nop - none operation
});

// uu.nop - none operation
function nop() {
}

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
    init:           StyleSheetInit, // uu("StyleSheet", id:String)
    add:            StyleSheetAdd,  // styleSheet.add(expr:Hash/String, decl:String = void)
                                    //  [1] styleSheet.add({ "div>p": "color:red;font-weight:bold", ... })
    clear:          StyleSheetClear // styleSheet.clear()
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
    toJSON:         ObjectToJson    //      toJSON():Boolean
}, 0, 0);

uumix(Date[_prototype], {
    toISOString:    DateToISOString,// toISOString():String
    toJSON:         DateToJSON      //      toJSON():String
}, 0, 0);

uumix(Number[_prototype], {
    toJSON:         ObjectToJson    //      toJSON():Number
}, 0, 0);

uumix(String[_prototype], {
    trim:           StringTrim,     //        trim():String
    toJSON:         ObjectToJson    //      toJSON():String
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

// --- CREATE HASH TABLES ---
uueach(("BOOLEAN,NUMBER,STRING,FUNCTION,ARRAY,DATE," +
        "REGEXP,UNDEFINED,NULL,HASH,NODE,FAKEARRAY").split(","), function(v, i) {
    uutype[v] = i + 1;
});

uueach([_true, 0, "", nop, [], new Date, /0/], function(v, i) {
    ++i < 4 && (_types[typeof v] = i);
    _types[_toString.call(v)] = i;
});

(function(i, n, v) {
    for (; i < 0x200; ++i) {
        n = i - 0x100;
        _num2hh[n] = v = i.toString(16).slice(1);
        _hh2num[v] = n;
        _num2bb[n] = v = String.fromCharCode(n);
        _bb2num[v] = n;
    }
    for (i = 100; i < 200; ++i) {
        n = i - 100;
        _num2dd[n] = v = i.toString().slice(1);
        _dd2num[v] = n;
    }
    uumix(uuhash, {
        dd2num:     _dd2num,        // uu.hash.dd2num - { "00":   0 , ... "99":  99  }
        num2dd:     _num2dd,        // uu.hash.num2dd - {    0: "00", ...   99: "99" }
        bb2num:     _bb2num,        // uu.hash.bb2num - { "\00": 0, ... "\ff": 255 }
        num2bb:     _num2bb,        // uu.hash.num2bb - { 0: "\00", ... 255: "\ff" }
        hh2num:     _hh2num,        // uu.hash.hh2num - { "00": 0, ... "ff": 255 }
        num2hh:     _num2hh         // uu.hash.num2hh - { 0: "00", ... 255: "ff" }
    });
})(0x100);

// ===================================================================

// [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Class.MyClass(arg1, arg2)
// [2][NodeSet factory] uu("div>ul>li", <body>) -> NodeSet

// uu - factory
function uufactory(expr,   // @param NodeSet/Node/NodeArray/ClassNameString/window: ClassName or Expression
                   arg1,   // @param NodeSet/Node/Expression/Mix(= void): ClassName.init arg1 or Expression.context
                   arg2,   // @param Mix(= void): ClassName.init arg2
                   arg3,   // @param Mix(= void): ClassName.init arg3
                   arg4) { // @param Mix(= void): ClassName.init arg4
                           // @return Instance/NodeSet:
    // class factory
    if (typeof expr === _string && uuclass[expr]) {
        return new uuclass[expr](arg1, arg2, arg3, arg4);
    }
//{{{!nodeset
    // NodeSet factory
    return new NodeSet(expr, arg1, arg2, arg3, arg4);
//}}}!nodeset
}

// --- SNIPPET ---
//{{{!snippet
// uusnippet - evaluate snippet
function uusnippet(id,    // @param String: snippet id. <script id="...">
                   arg) { // @param Mix(= void): arg
                          // @return String/Mix:
    function toBrace(all, ident) {
        return ident[_indexOf]("arg.") ? '{(' + ident + ')}'  // "{{ident}}"     -> "{(ident)}"
                                       : '"+' + ident + '+"'; // "{{arg.ident}}" -> "+ident+"
    }

    function each(all, match) {
        match = match[_replace](/^\s+|\s+$/gm, "")
                [_replace](/("|')/g, "\\$1")
                [_replace](/\n/g, "\\n")
                [_replace](eachBlock, toEachBlock)
                [_replace](dualBrace, toBrace);
        return 'uu.node.bulk("' + match + '");';
    }

    function toEachBlock(all, hash, block) {
        return '"+uu.snippet.each(' + hash + ',"' +
                                      block[_replace](dualBrace, toBrace) + '")+"';
    }

    var js = uusnippet.js[id] || "", node, // {
        dualBrace = /\{\{([^\}]+)\}\}/g,
        eachBlock = /<each ([^>]+)>([\s\S]*?)<\/each>/;

    if (!js) {
        node = uuid(id);
        if (node) {
            uusnippet.js[id] = js = node.text[_replace](/\r\n|\r|\n/g, "\n")
                    [_replace](/<>\n([\s\S]*?)^<\/>$/gm, each)           // <>...</>
                    [_replace](/^\s*\n|\n$/g, "");
        }
    }
    return js ? (new Function("arg", js))(arg) : "";
}
uusnippet.js = {}; // { id: JavaScriptExpression, ... }
uusnippet.each = function(hash, fragment) { // (
    var i = 0, iz = hash.length, block = [], eachBrace = /\{\(([^\)]+)\)\}/g;

    for (; i < iz; ++i) {
        block.push(fragment[_replace](eachBrace, function(all, ident) {
            return hash[ident][i];
        }));
    }
    return block.join("");
};
//}}}!snippet

// --- AJAX ---
// uu.ajax
//{{{!ajax
function uuajax(url,        // @param String: url
                option,     // @param Hash: { data, ifmod, method, timeout,
                            //                header, binary, before, after }
                            //    option.data    - Mix: upload data
                            //    option.ifmod   - Boolean: true is "If-Modified-Since" header
                            //    option.method  - String: "GET", "POST", "PUT"
                            //    option.timeout - Number(= 10): timeout sec
                            //    option.header  - Hash(= {}): { key: "value", ... }
                            //    option.binary  - Function: binary data evaluator, binary(xhr)
                            //    option.before  - Function: before(xhr, option)
                            //    option.after   - Function: after(xhr, option, { status, ok })
                callback) { // @param Function: callback(data, option, { status, ok })
                            //    data   - String: xhr.responseText
                            //    option - Hash:
                            //    status - Number: xhr.status
                            //    ok     - Boolean:
    function readyStateChange() {
        if (xhr.readyState === 4) {
            var data, status = xhr.status, lastMod,
                rv = { status: status, ok: status >= 200 && status < 300 };

            if (!run++) {
                if (rv.ok) {
                    data = binary ? binary(xhr) : (xhr.responseText || "");
                    // --- "Last-Modified" ---
                    if (ifmod) {
                        lastMod = xhr.getResponseHeader("Last-Modified");
                        if (lastMod) {
                            cache[url] = uudate(Date.parse(lastMod)).GMT(); // add cache
                        }
                    }
                }
                option[_after] && option[_after](xhr, option, rv);
                callback(data, option, rv);
                gc();
            }
        }
    }

    function ng(abort, status) {
        if (!run++) {
            var rv = { status: status || 400, ok: _false };

            option[_after] && option[_after](xhr, option, rv);
            callback(null, option, rv);
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
        header = option.header || {},
        binary = option.binary,
        ifmod = option.ifmod,
        cache = uuajax.cache,
        data = option.data || null,
        xhr = uuajax.xhr(),
        run = 0, i,
        overrideMimeType = "overrideMimeType",
        setRequestHeader = "setRequestHeader",
        getbinary = method === "GET" && binary;

    try {
        xhr.onreadystatechange = readyStateChange;
        xhr.open(method, url, _true); // ASync

        option[_before] && option[_before](xhr, option);

        getbinary && xhr[overrideMimeType] &&
            xhr[overrideMimeType]("text/plain; charset=x-user-defined");
        // Content-Type:       "application/x-www-form-urlencoded"
        data &&
            xhr[setRequestHeader]("Content-Type",
                                  "application/x-www-form-urlencoded");
        // If-Modified-Since:  "Wed, 16 Sep 2009 16:18:14 GMT"
        ifmod && cache[url] &&
            xhr[setRequestHeader]("If-Modified-Since", cache[url]);

        for (i in header) {
            xhr[setRequestHeader](i, header[i]);
        }
//{{{!mb
        uueventattach(win, "beforeunload", ng); // [Gecko]
//}}}!mb
        xhr.send(data);
        watchdog = setTimeout(function() {
            ng(1, 408); // 408: Request Time-out
        }, (option.timeout || 10) * 1000);
    } catch (err) {
        ng(); // 400: Bad Request
    }
}
uuajax.cache = {}; // { "url": DateHash(lastModified), ... }

// inner - create XMLHttpRequest object
uuajax.xhr = function() { // @return XMLHttpRequest:
    var xhr = win["XMLHttpRequest"];

    return xhr ? new xhr
//{{{!mb
               : win["ActiveXObject"] ? new ActiveXObject("Msxml2.XMLHTTP")
//}}}!mb
               : null;
};

// uu.ajax.binary - upload / download binary data
function uuajaxbinary(url, option, callback) {
    option.method = option.data ? "PUT" : "GET";
    option.binary =
//{{{!mb
                    _ie ? toByteArrayIE(xhr) :
//}}}!mb
                          toByteArray(xhr);

    uuajax(url, option, callback);
}

// inner - BinaryString To ByteArray
function toByteArray(xhr) { // @param XMLHttpRequest:
                            // @return ByteArray: [0x00, 0x01]
    var rv = [], bb2num = _bb2num, remain,
        ary = xhr.responseText.split(""), // "\00\01"
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

// uu.ajax.clear - clear "If-Modified-Since" request cache
function uuajaxclear() {
    uuajax.cache = {};
}

// uu.require - require
function uurequire(url,      // @param String: url
                   option) { // @param Hash(= {}): { before, after }
                             //     option.before - Function: before(xhr, option)
                             //     option.after  - Function: after(xhr, option, { status, ok })
                             // @return Hash: { data, option, status, ok }
    option = option || {};

    var rv = { ok: _false, status: 400 },
        xhr = uuajax.xhr(), data, status;

    try {
        xhr.open("GET", url, _false); // sync
        option[_before] && option[_before](xhr, option);
        xhr.send(null);

        status = xhr.status;
        data = xhr.responseText;
        option[_after] && option[_after](xhr, option,
                                         rv = { ok: status >= 200 && status < 300,
                                                status: status });
        xhr = null;
    } catch (err) {
    }
    rv.data = data;
    rv.option = option;
    return rv;
}

// uu.jsonp - Async JSONP request
function uujsonp(url,        // @param String: "http://example.com?callback=??"
                 option,     // @param Hash: { timeout, method }
                             //     timeout - Number(= 10):
                             //     method  - String(= "callback")
                 callback) { // @param Function: callback(JSONPResultHash)
    var timeout = option.timeout || 10,
        method = option.method || "callback",
        guid = uuguid(),
        tag = uunode("script", [{ type: "text/javascript", charset: "utf-8",
                                  run: 0 }]);

    url = uuf(url, method);
    uujsonp.db[guid] = method;

    // build callback global function
    win[method] = function(data, rv) { // @param Mix: json data
        if (!tag.run++) {
            rv = { ok: !!data, status: data ? 200 : 408 };

            option[_after] && option[_after](tag, option, rv);
            callback(data, option, rv);

            setTimeout(function() {
                uunoderemove(tag);
                win[method] = null;
                delete uujsonp.db[guid];
            }, (timeout + 10) * 1000);
        }
    };

    uunodeadd(tag, doc.head);

    option[_before] && option[_before](tag, option);

    tag[_setAttribute]("src", url);

    setTimeout(function() {
        uujsonp.db[guid](); // 408 "Request Time-out"
    }, timeout * 1000);
}
uujsonp.db = {}; // { guid: callbackMethod, ... }
//}}}!ajax

// --- TYPE ---

// [1][literal like literal]    uu.like("abcdef", "abcdef")              -> true
// [2][Date like Date]          uu.like(new Date(123), new Date(123))    -> true
// [3][Hash like Hash]          uu.like({ a: { b: 1 }}, { a: { b: 1 }})  -> true
// [4][Array like Array]        uu.like([1, [2, 3]], [1, [2, 3]])        -> true
// [5][FakeArray like FakeArray] uu.like(document.links, document.links) -> true

// uu.like - like and deep matching
function uulike(lhs,   // @param Date/Hash/Fake/Array: lhs
                rhs) { // @param Date/Hash/Fake/Array: rhs
                       // @return Boolean:
    var type = uutype(lhs);

    if (type !== uutype(rhs)) {
        return _false;
    }
    switch (type) {
    case uutype.FUNCTION:   return _false;
    case uutype.DATE:       return uudate(lhs).ISO() === uudate(rhs).ISO();
    case uutype.HASH:       return (uusize(lhs) === uusize(rhs) && uuhas(lhs, rhs));
    case uutype.FAKEARRAY:  // http://d.hatena.ne.jp/uupaa/20091223
    case uutype.ARRAY:      return uuarray(lhs) + "" == uuarray(rhs);
    }
    return lhs === rhs;
}

// [1][typeof]                  uu.type("str") -> uu.type.STRING

// uu.type - type detection
function uutype(mix) { // @param Mix: search literal/object
                          // @return Number: uu.types
    return _types[typeof mix] ||
           _types[_toString.call(mix)] ||
           (!mix ? uutype.NULL
                 : mix[_nodeType] ? uutype.NODE
                                  : "length" in mix ? uutype.FAKEARRAY
                                                    : uutype.HASH);
}

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
    function each(v, i) {
        evaluator(v, i, arg);
    }

    if (_isArray(source)) {
        source.forEach(arg ? each : evaluator);
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

//  [1][through Hash]                 uu.hash({ key: "val" })  -> { key: "val" }
//  [2][key/value pair to hash]       uu.hash("key", mix)      -> { key: mix }
//  [3][hash from comma joint string] uu.hash("key1,a,key2,b") -> { key1: "a", key2: "b" }

// uu.hash - to hash, convert hash from key value pair
function uuhash(key,     // @param Hash/String: key
                value) { // @param Mix(= void): value
                         // @return Hash: { key: value, ... }
    var rv = {}, ary, i, iz;

    if (arguments.length === 1) { // [1]
        if (typeof key === _string && key[_indexOf](",") > 0) { // [3] "a,b" -> { a: "b" }
            ary = key.split(",");
            for (i = 0, iz = ary.length; i < iz; i += 2) {
                rv[ary[i]] = ary[i + 1];
            }
            return rv;
        }
        return key;  // [1] hash -> through
    }
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
function uuhas(source,   // @param Hash/Array/Node: context, parentNode
               search) { // @param Hash/Array/Node/String: search element, childNode
                         // @return Boolean:
    if (source && search) {
        var i = 0, iz;

        if (source[_nodeType]) {
            if (isString(search)) { // [3]
                i = source[_uuevent];
                return (i ? i.types : "")[_indexOf]("," + search + ",") >= 0;
            }
            for (i = search; i && i !== source; i = i[_parentNode]) { // [4]
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
                        && uujsonencode(source[i]) !== uujsonencode(search[i]))) {
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

// inner - clone hash, clone array - shallow copy
function uuclone(source) { // @param Hash/Array: source
                           // @return Hash/Array: cloned hash/array
    return _isArray(source) ? source[_concat]() : uumix({}, source);
}

// [1][Hash.indexOf]            uu.hash.indexOf({ a: 1, b: 2, c: 2 }, 2) -> "b"

// uu.hash.indexOf - find first key from value
function uuindexof(source,        // @param Hash: source
                   searchValue) { // @param Mix: search value
                                  // @return String/void: "found-key" or undefined
    for (var key in source) {
        if (source[key] === searchValue && source.hasOwnProperty(key)) {
            return key; // String
        }
    }
//{{{!mb
    return void 0;
//}}}!mb
}

// [1][ascii sort a-z]   uu.array.sort(["a","z"], "A-Z") -> ["a", "z"]
// [2][ascii sort a-z]   uu.array.sort(["a","z"], "Z-A") -> ["z", "a"]
// [3][numeric sort 0-9] uu.array.sort([0,1,2], "0-9")   -> [0, 1, 2]
// [4][numeric sort 9-0] uu.array.sort([0,1,2], "9-0")   -> [2, 1, 0]

// inner - sort array
function uuarraysort(source,   // @param Array: source
                     method) { // @param String/Function(= "A-Z"): method
                               //                   sort method or callback-function
                               // @return Array: source
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

// inner - array compaction, trim null and undefined elements
function uuclean(source) { // @param Array: source
                           // @return Array: clean Array
    var rv = [], i = 0, iz = source.length;

    for (; i < iz; ++i) {
        i in source && source[i] != null // skip null or undefined
                    && rv.push(source[i]);
    }
    return rv;
}

//  [1][ByteArray dump] uu.array.dump([1, 2, 3]) -> "010203"
//  [2][ByteArray dump] uu.array.dump([1, 2, 3], "0x", ", 0x") -> "0x01, 0x02, 0x03"

// uu.array.dump - dump ByteArray
function uuarraydump(source,     // @param ByteArray: [0x00, ... 0xff]
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
    var rv = {}, i = 0, iz = key.length, val, num = !!toNumber;

    if (_isArray(value)) { // [1]
        for (; i < iz; ++i) {
            rv[key[i]] = num ? +(value[i]) : value[i];
        }
    } else { // [2]
        val = num ? +(value) : value;
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

// uu.attr - attribute accessor
function uuattr(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param String(= void): "value"
                         // @return String/Hash/Node:
    var rv = {}, ary, i = 0, attr, fix = uuattr.fix;

    // [IE6][IE7] key=for -> key=htmlFor, key=class -> key=className
    // [OTHER]    key=htmlFor -> key=for, key=className -> key=class
    if (key === attr) { // [1] uu.attr(node)
        ary = node.attributes;
        while ( (attr = ary[i++]) ) {
            rv[attr.name] = attr.value;
        }
        return rv; // Hash
    }
    if (arguments.length > 2) {     // [3] uu.attr(node, key, value)
        key = uuhash(key, value);
    } else if (isString(key)) {     // [2] uu.attr(node, key)
        rv = node[_getAttribute](fix[key] || key, 2) || "";
//{{{!mb
        _ie && (rv += ""); // [IE6] tagindex, colspan is number
//}}}!mb
        return rv; // String
    }

    for (attr in key) {
        node[_setAttribute](fix[attr] || attr, key[attr]); // [4]
    }
    return node; // Node
}

// [SVG] w=width,h=height, [DOM] cn=class
uuattr.fix = uuhash(
//{{{!mb
                    !uuready[_getAttribute] ? "for,htmlFor,class,className,cn,className" : // [IE6][IE7]
//}}}!mb
                    _className + ",class,cn,class,htmlFor,for,w,width,h,height");

//  [1][get all pair]   uu.data(node) -> { key: value, ... }
//  [2][get value]      uu.data(node, key) -> value
//  [3][set pair]       uu.data(node, key, value) -> node
//  [4][set pair]       uu.data(node, { key: value, ... }) -> node

// uu.data - node data accessor [HTML5 spec - Embedding custom non-visible data]
function uudata(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param Mix(= void): value
                         // @return Hash/Mix/Node/undefined:
    var rv, i, prefix = "data-", undef;

    if (key === undef) { // [1] uu.data(node)
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
uudata.handler = {}; // { "data-uu***": callback }

//  [1][clear all pair] uu.data.clear(node) -> node
//  [2][clear pair]     uu.data.clear(node, key) -> node

// uu.data.clear - clear/remove node data
function uudataclear(node,  // @param Node:
                     key) { // @param String(= void): key
                            // @return Node:
    return uudata(node, key || "*", null);
}

// uu.data.bind - bind data handler
//function uudatabind(key,        // @param String: "data-uu..."
//                    callback) { // @param Function: callback function
//    uudata.handler[key] = callback;
//}

// uu.data.unbind - unbind data handler
//function undataunbind(key) { // @param String: "data-uu..."
//    delete uudata.handler[key];
//}

// --- css ---
//  [1][getComputedStyle(or currentStyle)] uu.css(node)       -> { key: value, ... }
//  [2][getComputedStyle(+ px unitize)   ] uu.css(node, true) -> { key: value, ... }
//  [3][get node.style value]              uu.css(node, key)  -> value
//  [4][set node.style pair]               uu.css(node, key, value) -> node
//  [5][set node.style pair]               uu.css(node, { key: value, ... }) -> node
//  [6][get StyleSheet object]             uu.css("myStyleSheet") -> StyleSheet

// uu.css - css and StyleSheet accessor
function uucss(expr,    // @param Node/StyleSheetIDString/ReserveWordString:
               key,     // @param Boolean/String/Hash(= void): key
               value) { // @param String(= void): value
                        // @return Hash/String/Node/StyleSheet:
    var rv, style, informal, formal, fix, care, undef;

    if (typeof expr === _string) {
        rv = uucss.db[expr];
        return rv || (uucss.db[expr] = uu("StyleSheet", expr)); // [6] StyleSheet object
    }

    if (key === _true || key === undef) { // [1][2] uu.css(node), uu.css(node, true)
//{{{!mb
        if (getComputedStyle) {
//}}}!mb
            return getComputedStyle(expr, 0);
//{{{!mb
        }
        return key ? getComputedStyleIE(expr) : expr.currentStyle;
//}}}!mb
    }

    fix = uufix.db;
    if (arguments.length > 2) { // [4] uu.css(node, key, value)
        key = uuhash(key, value);
    } else if (typeof key === _string) { // [3] uu.css(node, key)
//{{{!mb
        if (getComputedStyle) {
//}}}!mb
            return getComputedStyle(expr, 0)[fix[key] || key] || "";
//{{{!mb
        }
        return (expr.currentStyle || {})[fix[key] || key] || "";
//}}}!mb
    }
    // [5]
    care = uucss.care;
    style = expr.style;

    for (informal in key) { // informal = "text-align" or "textAlign"
        value = key[informal];
        formal = fix[informal] || informal; // formal = "textAlign"

        if (typeof value === _number) {
            if (formal === "opacity") {
                uucssopacity(expr, value);
                continue;
            }
            care[formal] || (value += "px"); // number -> pixel value
        }
        style[formal] = value;
    }
    return expr;
}
uucss.db = {}; // { id: styleSheetObject }
uucss.care = {
//{{{!mb
    zoom: 1, fontSizeAdjust: 1, // [CSS3]
//}}}!mb
    lineHeight: 1, fontWeight: 1, zIndex: 1
};

// uu.viewport
function uuviewport() { // @return Hash: { innerWidth, innerHeight,
                        //                 pageXOffset, pageYOffset,
                        //                 orientation }
                        //      innerWidth  - Number:
                        //      innerHeight - Number:
                        //      pageXOffset - Number:
                        //      pageYOffset - Number:
                        //      orientation - Number: last orientation
                        //            0 is Portrait
                        //          -90 is Landscape
                        //           90 is Landscape
                        //          180 is Portrait
//{{{!mb
    if (!win.innerWidth) { // [IE6][IE7][IE8] CSSOM View Module
        return { innerWidth:  _rootNode.clientWidth,    // [IE9] supported
                 innerHeight: _rootNode.clientHeight,   // [IE9] supported
                 pageXOffset: _rootNode.scrollLeft,     // [IE9] supported
                 pageYOffset: _rootNode.scrollTop,      // [IE9] supported
                 orientation: 0 };                      // [IPHONE] only
    }
//}}}!mb
    return win;
}

//  [1][abs]              uu.fx(node, 500, { o: 0.5, x: 200 })
//  [2][rel]              uu.fx(node, 500, { h: "+100", o: "+0.5" })
//  [3][with "px" unit]   uu.fx(node, 500, { h: "-100px" })
//  [4][with easing fn]   uu.fx(node, 500, { h: [200, "easeInOutQuad"] })
//  [5][set fps]          uu.fx(node, 500, { fps: 30, w: 40 })
//  [6][after callback]   uu.fx(node, 500, { o: 1, after: afterCallback })
//  [7][before callback]  uu.fx(node, 500, { o: 1, before: beforeCallback })
//  [8][chain]            uu.fx(node, 500, { o: 1, chain: 1 })
//  [9][reverse chain]    uu.fx(node, 500, { o: 1, reverse: 1 })
//  [10][delay or sleep]  uu.fx(node, 500, callback)
//  [11][deny]            uu.fx(node, 500, { deny: 1 })

// uu.fx - add effect queue
//{{{!fx
function uufx(node,     // @param Node: animation target node
              duration, // @param Number: duration (unit ms)
              option) { // @param Hash/Function: { key: endValue, key: [endValue, easing], key: callback, ... }
                        //     key      - CSSPropertyString/String: "color", "opacity", "before", "after", ...
                        //     endValue - String/Number: end value, "red", "+0.5", "+100px"
                        //     easing   - String: easing function name, "easeInOutQuad"
                        //     callback - Function: before or after callback function
                        // @return Node:
    function loop() {
        var data = node[_uufx], q = data.q[0], // fetch current queue
            option = q.option, back = !!option.back, tm, finished;

        if (q.tm) {
            tm = +new Date;
        } else {
            option.init && (option.init(node, option, back), option.init = 0);
            option[_before] && option[_before](node, option, back);
            q.js = isFunction(option) ? option
                                      : uufxbuild(node, data, q, option);
            q.tm = tm = +new Date;
        }
        finished = q.fin || (tm >= q.tm + q.dur);

        q.js(node, back, finished, tm - q.tm, q.dur); // js(node, back, finished, gain, duration)
        if (finished) { // finished
            option[_after] && option[_after](node, option, back);
            data.q.shift(); // remove current queue

            if (!option.back && option.reverse && data.rq.length) {
                data.q = data.rq.reverse()[_concat](data.q); // insert reverse queue
                data.rq = []; // clear
            }
            if (!data.q.length) {
                clearInterval(data.id);
                data.id = 0;
            }
        }
    }

    node.style.overflow = "hidden";
    option = option || {};

    var data = node[_uufx] || (node[_uufx] = { q: [], rq: [], id: 0 }), // init fx queue
        fps = ((1000 / option.fps) | 0) || +_ie; // [IE] setInterval(0) is Error

    if (data.q[0] && data.q[0].option.deny) {
        return node;
    }

    // append queue data
    data.q.push({
        tm:       0,
        dur:      Math.max(duration, 1),
        fin:      0,      // true/1 is finished
        guid:     uuguid(),
        option:   option
    });
    data.id || (data.id = setInterval(loop, fps));
    return node;
}
uufx.props = { opacity: 1, color: 2, backgroundColor: 2,
               width: 3, height: 3, left: 4, top: 5 };
//{{{!mb
uufx.alpha = /^alpha\([^\x29]+\) ?/;
//}}}!mb

function uufxbuild(node, data, queue, option) {
    function ezfn(v0, v1, ez) {
        return ez ? uuf('Math.??(g,??,??,d)', ez, v0, v1 - v0)
                  : uuf('(t=g,b=??,c=??,(t/=d2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b)',
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

    var rv = 'var s=n.style,t,b,c,d2=d/2,w,o,gd,h,fo;', // fo = filterObject
        reverseOption = { before: option[_before],
                          after: option[_after],
                          back: 1 },
        i, startValue, endValue, ez, w, n,
        fixdb = uufix.db, cs = option.css || uucss(node, _true);

    for (i in option) {
        w = fixdb[i] || i;

        if (w in cs) {
            ez = 0;
            _isArray(option[i]) ? (endValue = option[i][0], ez = option[i][1]) // val, easing
                                : (endValue = option[i]); // option.val

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
                    rv += uuf('o=??;o=(o>0.999)?1:(o<0.001)?0:o;',
                              ezfn(startValue, endValue, ez));
//{{{!mb
                    if (!uuready.opacity) { // [IE6][IE7][IE8]
                        rv += uuf('fo=n.filters.item("DXImageTransform.Microsoft.Alpha");' +
                                  'fo.Enabled=true;fo.Opacity=(o*100)|0;' +
                                  'f&&uu.css.opacity(n,??);',
                                  endValue);
                    } else {
//}}}!mb
                        rv += uuf('s.??=f? ??:o;', w, endValue);
//{{{!mb
                    }
//}}}!mb
                    break;
                case 2: // color, backgroundColor
                    startValue = uucolor(cs[w]);
                    endValue   = uucolor(endValue);
                    rv += uuf('gd=g/d;h=uu.hash.num2hh;s.??="#"+' +
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
                    rv += uuf('w=f? ??:??;w=w<0?0:w;s.??=(w|0)+"px";',
                              endValue, ezfn(startValue, endValue, ez), w);
                    break;
                default: // top, left, other...
                    startValue = n ? (n > 4 ? node.offsetTop  - parseInt(cs.marginTop)
                                            : node.offsetLeft - parseInt(cs.marginLeft))
                                   : parseInt(cs[w]) || 0;
                    endValue   = unitNormalize(startValue, endValue, parseInt);
                    rv += uuf('s.??=((f? ??:??)|0)+"px";',
                              w, endValue, ezfn(startValue, endValue, ez));
                }
                reverseOption[w] = ez ? [startValue, ez] : startValue;
            }
        }
    }

    // add reverse queue
    if (option.chain || option.reverse) {
        data.rq.push({
            tm: 0,
            dur: queue.dur,
            fin: 0,
            guid: queue.guid, // copy guid
            option: reverseOption
        });
    }

    return new Function("n,r,f,g,d", rv); // node, reverse, finished, gain, duration
}

// uu.fx.skip
function uufxskip(node,      // @param Node(= null): null is all node
                  skipAll) { // @param Boolean(= false): true is skip all
                             // @return Node/NodeArray:
    var nodeArray = node ? [node] : uutag("*", doc.body),
        v, i = -1, j, k, jz, kz, data, guid, option, q, rq;

    while ( (v = nodeArray[++i]) ) {
        data = v[_uufx];
        if (data && data.id) {

            q = data.q;
            rq = data.rq;
            guid = [];
            for (j = 0, jz = skipAll ? q.length : 1; j < jz; ++j) {
                q[j].fin = 1;
                option = q[j].option;
                (option.chain || option.reverse) && guid.push(option.guid);
            }
            for (j = 0, jz = guid.length; j < jz; ++j) {
                for (k = 0, kz = rq.length; k < kz; ++k) {
                    if (rq[k].option.guid === guid[j]) {
                        rq[k].fin = 1;
                        q.push(rq.splice(k, 1)[0]); // data.q <- data.rq
                    }
                }
            }

            // avoid flicker
            if (q.length > 2 && skipAll) {
                q.push({
                    tm: 0, guid: 0, fin: 1, dur: 0,
                    option: function(node) {
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
//}}}!fx

// uu.css.opacity
function uucssopacity(node,      // @param Node:
                      opacity) { // @param Number/String(= void): Number(0.0 - 1.0) absolute
                                 //                               String("+0.5", "-0.5") relative
                                 // @return Number/Node:
    var style = node.style, undef;

    if (opacity === undef) {
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

//{{{!mb
    if (!uuready.opacity) {
        if (!node["data-uuopacity"]) {
            // init opacity
            node.style.filter +=
                    " progid:DXImageTransform.Microsoft.Alpha()";
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
if (0) {
        style[_visibility] = opacity ? "visible" : "hidden";
        style.filter = ((opacity > 0 && opacity < 1)
                     ? "alpha(opacity=" + (opacity * 100) + ") " : "")
                     + style.filter[_replace](uucssopacity.alpha, "");

} else {
//        style[_visibility] = opacity ? "visible" : "hidden";
        var filter = node.filters.item("DXImageTransform.Microsoft.Alpha");

        if (opacity > 0 && opacity < 1) {
            filter.Enabled = _true;
            filter.Opacity = (opacity * 100) | 0;
        } else {
            filter.Enabled = _false;
        }
        style[_visibility] = opacity ? "visible" : "hidden";
}
    }
//}}}!mb
    return node;
}
//{{{!mb
uucssopacity.alpha = /^alpha\([^\x29]+\) ?/;
//}}}!mb

//  [1][get transform] uu.css.transform(node) -> [scaleX, scaleY, rotate, translateX, translateY ]
//  [2][set transform] uu.css.transform(node, 1, 1, 0, 0, 0) -> node

// uu.css.transform
function uucsstransform(node,    // @param Node:
                        param) { // @param NumberArray(= void): [scaleX, scaleY,
                                 //                              rotate(degree),
                                 //                              translateX, translateY]
                                 // @return Node/NumberArray:
    if (!param) {
        return node[_uutrans] || [1, 1, 0, 0, 0];
    }

//{{{!mb
    if (_ie) {
        var ident = "DXImageTransform.Microsoft.Matrix",
            data = "data-uutransie",
            rotate = param[2] * Math.PI / 180, // deg2rad
            cos = Math.cos(-rotate),
            sin = Math.sin(-rotate),
            // scale * rotate * translate
            mtx = [ cos * param[0], sin * param[0], 0,
                   -sin * param[1], cos * param[1], 0,
                          param[3],       param[4], 1],
            filter, rect, cx, cy;

        if (!node[_uutrans]) {
            // init - get center position
            rect = node.getBoundingClientRect();
            cx = (rect.right  - rect.left) / 2; // center x
            cy = (rect.bottom - rect.top)  / 2; // center y

            node.style.filter += " progid:" + ident + "(sizingMethod='auto expand')";
            node[data] = { cx: cx, cy: cy };
        }
        filter = node.filters.item(ident),

        filter.M11 = mtx[0];
        filter.M12 = mtx[1];
        filter.M21 = mtx[3];
        filter.M22 = mtx[4];
        filter.Dx  = mtx[6];
        filter.Dy  = mtx[7];

        // recalc center
        rect = node.getBoundingClientRect();
        cx = (rect.right  - rect.left) / 2;
        cy = (rect.bottom - rect.top)  / 2;

        node.style.marginLeft = node[data].cx - cx + "px";
        node.style.marginTop  = node[data].cy - cy + "px";
    } else {
//}}}!mb

    //  node.style.webkitTransformOrigin = ""
        node.style[_webkit ? "webkitTransform" :
//{{{!mb
                   _gecko  ? "MozTransform" :
                   _opera  ? "OTransform" :
//                 _ie     ? "msTransform" :
//}}}!mb
                   ""] =
            "scale(" + param[0] + "," + param[1] + ") rotate("
                     + param[2] + "deg) translate("
                     + param[3] + "," + param[4] + ")";
//{{{!mb
    }
//}}}!mb
    node[_uutrans] = param[_concat]();
    return node;
}

// uu.css.show - show node
//{{{!fx
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
//}}}!fx

// uu.css.hide - hide node
//{{{!fx
function uucsshide(node,       // @param Node:
                   duration) { // @param Number(= 0): fadeout effect duration
                               // @return Node:
    uucssisshow(node) || (node.style[_display] = "none");
    return uufx(node, duration || 0, { w: 0, h: 0, o: 0 });
}
//}}}!fx

// uu.css.isShow - is shown
function uucssisshow(node) { // @param Node/CSSProperties:
                             // @return Boolean:
    var style = node[_nodeType] ? uucss(node) : node;

    return style[_display] !== "none" && style[_visibility] !== "hidden";
}

// uu.css.selectable - text selectable
function uucssselectable(node,    // @param Node:
                         allow) { // @param Boolean(= false):
                                  // @return Node:
    node.style.userSelect = allow ? "" : "none"; // CSS3
//{{{!mb
    if (_webkit) {
//}}}!mb
        node.style.WebkitUserSelect = allow ? "" : "none";
//{{{!mb
    } else if (_gecko) {
        node.style.MozUserSelect = allow ? "" : "none";
    } else if (_ie || _opera) {
        node.unselectable  = allow ? "" : "on";
        node.onselectstart = allow ? "" : "return false";
//      node = node.parentNode;
    }
//}}}!mb
    return node;
}

// StyleSheet.init
function StyleSheetInit(id) { // @param String: style sheet id
    var node = uunode("style", [{ id: id }]);

    _webkit && node[_appendChild](doc[_createTextNode](""));
    uuhead(node);

    this.ss = node.sheet
//{{{!mb
                         || node.styleSheet;
//}}}!mb
    this.rules = {};
}

// StyleSheet.add
function StyleSheetAdd(expr,   // @param Hash/String: { selector: declaration, ... } or a "selector"
                       decl) { // @param Hash(= void): "declaration"
    var ss = this.ss,
//{{{!mb
        ary, i, iz,
//}}}!mb
        selector, declaration;

    clearAllRules(this);

    for (selector in uumix(this.rules, isString(expr) ? uuhash(expr, decl)
                                                      : expr)) {
        declaration = this.rules[selector];

//{{{!mb
        if (ss.insertRule) {
//}}}!mb
            ss.insertRule(selector + "{" + declaration + "}",
                          ss.cssRules.length);
//{{{!mb
        } else { // [IE]
            ary = selector.split(",");
            for (i = 0, iz = ary.length; i < iz; ++i) {
                ss.addRule(ary[i], declaration.trim());
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

// uu.css.unit - convert to pixel unit
function uucssunit(node,   // @param Node: context
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
    if (uucssunit.px.test(value)) {
        return parseInt(value) || 0;
    }
    if (value === "auto") {
        if (!prop[_indexOf]("bor") || !prop[_indexOf]("pad")) { // /^border|^padding/g
            return 0;
        }
    }
    if (!quick) {
        return uucssunit.calc(node, prop, value);
    }
    if (uucssunit.pt.test(value)) {
        return (_float(value) * 4 / 3) | 0; // 12pt * 1.333 = 16px
    } else if (uucssunit.em.test(value)) {
        fontSize = uucss(node).fontSize;
        ratio = uucssunit.pt.test(fontSize) ? 4 / 3 : 1;
        return (_float(value) * _float(fontSize) * ratio) | 0;
    }
    return parseInt(value) || 0;
}
uumix(uucssunit, { px: /px$/, pt: /pt$/, em: /em$/, calc: _calcPixel });

// inner - convert CSS unit
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
// inner - convert CSS unit
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
    uucssunit.calc = _calcPixelIE;
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
        em = parseFloat(fontSize) * (uucssunit.pt.test(fontSize) ? 4 / 3 : 1),
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
// uu.klass - as document.getElementsByClassName
function uuklass(expr,      // @param String: "class", "class1, ..."
                 context) { // @param Node(= document): query context
                            // @return NodeArray: [Node, ...]
//{{{!mb
    if (doc.getElementsByClassName) {
//}}}!mb
        return _slice.call((context || doc).getElementsByClassName(expr));
//{{{!mb
    }

    var rv = [], ri = -1, i = 0, iz, m, v, w,
        ary = uutrim(expr).split(" "), az = ary.length,
        rex = _matcher(ary),
        nodeList = (context || doc).getElementsByTagName("*");

    for (i = 0, iz = nodeList.length; i < iz; ++i) {
        v = nodeList[i];
        (w = v[_className]) && ((m = w.match(rex)) && m.length >= az)
                            && (rv[++ri] = v);
    }
    return rv;
//}}}!mb
}

// uu.klass.has - has className
function uuklasshas(node,         // @param Node:
                    classNames) { // @param String: "class1 class2 ..." (joint space)
                                  // @return Boolean:
    var m, w = node[_className], ary = uutrim(classNames).split(" ");

    return w ? ((m = w.match(_matcher(ary))) && (m.length >= ary.length))
             : _false;
}

// [1][add className] uu.klass.add(node, "class1 class2") -> node

// uu.klass.add - add className
function uuklassadd(node,         // @param Node:
                    classNames) { // @param String: "class1 class2 ..."
                                  // @return Node:
    node[_className] += " " + classNames; // [OPTIMIZED] // uutriminner()
    return node;
}

// [1][remove className] uu.klass.remove(node, "class1 class2") -> node

// uu.klass.remove - remove className
function uuklassremove(node,         // @param Node:
                       classNames) { // @param String(= ""): "class1 class2 ..."
                                     // @return Node:
    node[_className] = uutrim(
        node[_className][_replace](_matcher(uutrim(classNames).split(" ")), ""));
    return node;
}

// uu.klass.toggle - toggle(add / remove) className property
function uuklasstoggle(node,         // @param Node:
                       classNames) { // @param String: "class1 class2 ..."
                                     // @return Node:
    return (uuklasshas(node, classNames) ? uuklassremove
                                         : uuklassadd)(node, classNames);
}

// inner - className matcher
function _matcher(ary) {
    return RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
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
        that.msgbox || (that.msgbox = nop);
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
            that.msgbox || (that.msgbox = nop);
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
            var fullcode = uuevent.codes[event.type] || 0,
                target = event.target
//{{{!mb
                                      || event.srcElement || doc;
//}}}!mb

            event.node = node;
            event.code = fullcode & 0xff; // half code
            event.touch = fullcode & 0x0200;
            event.gesture = fullcode & 0x0400;
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
                               event.detail ? event.detail :
//}}}!mb
                                              (event.wheelDelta / -120)) | 0;
            }
        }
        // callback(event, node)
        (instance ? handler.call(evaluator, event)
                  : evaluator(event)) === _false && uueventstop(event);
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
        owner = (node.ownerDocument || doc)[_documentElement],
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
        if (_ie && !node[_addEventListener]) {
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
    // Cross Browser Event
    losecapture:    0x102, // as mouseup    [IE]
    DOMMouseScroll: 0x104, // as mousewheel [GECKO]
//}}}!mb
    // DOM Level2 Events    iPhone Touch Events         iPhone Gesture Events
    mousedown:      1,      touchstart:     0x201,      gesturestart:   0x401,
    mouseup:        2,      touchend:       0x202,      gestureend:     0x402,
    mousemove:      3,      touchmove:      0x203,      gesturechange:  0x403,
    mousewheel:     4,
    click:          10,
    dblclick:       11,
    keydown:        12,
    keypress:       13,
    keyup:          14,
    mouseenter:     15,
    mouseleave:     16,
    mouseover:      17,
    mouseout:       18,
    contextmenu:    19,
    focus:          20,
    blur:           21,
    resize:         22,
    scroll:         23,
    change:         24,
    submit:         25,
    // HTML5 Events
    online:         50,
    offline:        51,
    message:        52
};
uuevent.shortcut =
    ("mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown," +
     "keypress,keyup,change,submit,focus,blur,contextmenu").split(",");

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

        uueach(node[_uuevent][eventType], function(evaluator) {
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
    var eventData = node[_uuevent], ns, ary, ex, i = -1, c = ",";

    if (eventData) {
        eventTypeEx = eventTypeEx ? c + eventTypeEx + c     // [2] ",click,"
                                  : node[_uuevent].types;   // [1] ",click,MyNamespace.mousemove+,"
        ary = eventTypeEx[_replace](/^,|,$/g, "").split(c);

        while ( (ex = ary[++i]) ) {
            if (ex.lastIndexOf(".*") > 1) { // [3] "namespace.*"
                ns = ex.slice(0, -1);       // "namespace.*" -> "namespace."
                uueach(ary, function(ex) {
                    if (!ex[_indexOf](ns)) {
                        uueach(eventData[ex], function(evaluator) {
                            uuevent(node, ex, evaluator, _true); // unbind
                        });
                    }
                });
            } else { // [2][4]
                if (eventTypeEx[_indexOf](c + ex + c) >= 0) {
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
    if (node[_addEventListener]) {
//}}}!mb
        node[__detach__ ? "removeEventListener"
                        : _addEventListener](eventType, evaluator, !!useCapture);
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

// uu.event.key - get key and keyCode (cross browse keyCode)
function uueventkey(event) { // @param EventObjectEx:
                             // @return Hash: { key, code }
                             //     key  - String: "UP", "1", "A"
                             //     code - Number:   38,  49,  65
    var code = event.keyCode || event.charCode || 0;

    return { key: uueventkey.ident[code] || "", code: code };
}

// ::event.keyCode
//    http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents

uueventkey.ident = uuhash( // virtual keycode -> "KEY IDENTIFIER"
    "8,BS,9,TAB,13,ENTER,16,SHIFT,17,CTRL,18,ALT,27,ESC," +
    "32,SP,33,PGUP,34,PGDN,35,END,36,HOME,37,LEFT,38,UP,39,RIGHT,40,DOWN," +
    "45,INS,46,DEL,48,0,49,1,50,2,51,3,52,4,53,5,54,6,55,7,56,8,57,9," +
    "65,A,66,B,67,C,68,D,69,E,70,F,71,G,72,H,73,I,74,J,75,K,76,L,77,M," +
    "78,N,79,O,80,P,81,Q,82,R,83,S,84,T,85,U,86,V,87,W,88,X,89,Y,90,Z");

// uu.event.edge - get padding edge (cross browse offsetX/Y)
function uueventedge(event) { // @param EventObjectEx:
                              // @return Hash: { x, y }
                              //     x - Number: fixed offsetX
                              //     y - Number: fixed offsetY
    // http://d.hatena.ne.jp/uupaa/20100430/1272561922
    var style =
//{{{!mb
                _ie ? null :
//}}}!mb
                             getComputedStyle(event.at, 0),
        x = event.offsetX || 0,
        y = event.offsetY || 0;

//{{{!mb
    if (_webkit) {
//}}}!mb
        x -= parseInt(style.borderTopWidth)  || 0; // "auto" -> 0
        y -= parseInt(style.borderLeftWidth) || 0;
//{{{!mb
    } else if (_opera) {
        x += parseInt(style.paddingTop)  || 0;
        y += parseInt(style.paddingLeft) || 0;
    } else if (_gecko || event.layer !== void 0) {
        x = (event.layerX || 0) - (parseInt(style.borderTopWidth)  || 0);
        y = (event.layerY || 0) - (parseInt(style.borderLeftWidth) || 0);
    }
//}}}!mb
    return { x: x, y: y };
}

// uu.event.hover - enter / leave event handler
function uueventhover(node,   // @param Node:
                      expr) { // @param Function/ClassNameString: enter/leave-callback or toggle-className
                              // @return Node:
    function callback(evt, rel) {
        toggle ? uuklasstoggle(node, expr)
//{{{!mb
               : _ie ? expr(evt, evt.code === uuevent.codes.mouseenter)
//}}}!mb
                       // ignode mouse transit(mouseover, mouseout) in child node
                     : node !== (rel = evt.relatedTarget) && !uuhas(node, rel)
                            && expr(evt, evt.code === uuevent.codes.mouseover);
        uueventstop(evt);
    }

    var toggle = isString(expr);

    return uuevent(node,
//{{{!mb
                   _ie ? "mouseenter,mouseleave" :
//}}}!mb
                         "mouseover+,mouseout+", callback);
}

// uu.event.cyclic - cyclic events
function uueventcyclic(node,         // @param Node: target node
                       eventTypeEx,  // @param EventTypeExString: "click,..."
                       callback,     // @param Function: callback(evt, times)
                       cyclic,       // @param Number: cyclic count
                       loop) {       // @param Number(= 0): loops, zero is infinity
                                     // @return Node:
    function wrapper(evt, rv) {
        //  function callback() {
        //     :
        //     return true; // cancel cyclic and stopPropagation
        //  }
        //
        //  function callback() {
        //     :
        //     return false; // stopPropagation
        //  }
        rv = callback(evt, count);

        if (++count >= cyclic) {
            count = 0;
            loop && !--loop && (rv = _true);
        }
        rv === _true && (uueventstop(evt),
                         uueventunbind(node, eventTypeEx, wrapper)); // cancel & stop
        return rv;
    }

    var count = 0;

    return uuevent(node, eventTypeEx, wrapper);
}

// --- RESIZE EVENT ---
//{{{!resize

// uu.resize
function uuresize(evaluator) { // @param Function: callback function
    var db = uuresize.db;

    if (!db.fn.length) { // init
//{{{!mb
        uuresize.unsafe ? (db.vp = uuviewport(),
                           db.tm = setInterval(onresizeagent, db.delay)) : // [IE6][IE7][IE8]
//}}}!mb
                          uueventattach(win, "resize", onresize);          // [W3C]
    }
    db.fn.push(evaluator);
}
uuresize.unsafe = _ie && _ver < 9; // [IE6][IE7][IE8]
uuresize.db = {
    fn:     [],
    tm:     0,  // setInterval timer id
    lock:   0,
    delay:  uuresize.unsafe ? 100 : 40  // 100ms(unsafe) or 40ms(safe)
};

// uu.unresize
function uuunresize() {
    var db = uuresize.db;

    db.fn = [];
//{{{!mb
    uuresize.unsafe ? (db.tm && (clearInterval(db.tm), db.tm = 0)) : // [IE6][IE7][IE8]
//}}}!mb
                      uueventdetach(win, "resize", onresize);        // [W3C]
    db.lock = 0;
}

// inner - resize event handler
function onresize(event) {
    var db = uuresize.db,
        evt = uumix(event, { node: win, code: uuevent.codes.resize, at: win });

    if (!db.lock++) {
        setTimeout(function() {
            for (var i = 0, iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](evt); // callback(event)
            }
            setTimeout(function() { // [lazy] unlock
                db.lock = 0;
            }, 0);
        }, db.delay); // event-intensive
    }
}

// inner - resize handler(resize agent) for unsafe browser
//{{{!mb
function onresizeagent() {
    var db = uuresize.db, i = 0, iz, vp,
        evt = { node: win, code: uuevent.codes.resize, at: win };

    if (!db.lock++) {
        //
        // peek innerWidth and innerHeight
        //
        vp = uuviewport();
        if (db.vp.innerWidth !== vp.innerWidth
            || db.vp.innerHeight !== vp.innerHeight) { // resized?

            db.vp = vp; // store
            for (iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](evt); // callback(event)
            }
        }
        setTimeout(function() { // [lazy] unlock
            db.lock = 0;
        }, 0);
    }
}
//}}}!mb
//}}}!resize

// --- LIVE EVENT ---
//{{{!live

// uu.event.live
function uulive(expr,        // @param CSSSelectorExpressionString "css > selector"
                eventTypeEx, // @param EventTypeExString: "namespace.click"
                evaluator,   // @param Function/Instance: callback function
                __data__) {  // @hidden Hash: data for recursive call
    function _liveClosure(event) { // @param EventObject:
        var fullcode = uuevent.codes[event.type] || 0,
            target = event.target
//{{{!mb
                                  || event.srcElement || doc;
//}}}!mb

        event.at = (target[_nodeType] === 3) ? target[_parentNode]
                                             : target;

        if (uumatch(expr, event.at)) {
            event.code = fullcode & 0xff; // half code
//{{{!mb
            if (_ie) {
                if (!event.target) { // [IE6][IE7][IE8]
                    event.currentTarget = doc;
                }
                if (event.pageX === void 0) { // [IE6][IE7][IE8][IE9]
                    event.pageX = event.clientX + (doc.html.scrollLeft || 0);
                    event.pageY = event.clientY + (doc.html.scrollTop  || 0);
                }
            }
//}}}!mb
            instance ? handler.call(evaluator, event)
                     : evaluator(event);
        }
    }

    var instance = 0,
        handler = isFunction(evaluator) ? evaluator
                                        : (instance = 1, evaluator.handleEvent),
        // split token (ignore capture[+])
        //      "namespace.click+"
        //              v
        //      ["namespace.click+", "namespace", "click", "+"]
        token     = uuevent.parse.exec(eventTypeEx),
        ns        = token[1], // "namespace"
        eventType = token[2], // "click"
        capture   = 0,
        fixEventType = uulive.fix[eventType] || eventType;

    evaluator.liveClosure = _liveClosure;

    __data__ || (__data__ = live.db[expr + "\v" + eventTypeEx] = {
        s: expr,
        ns: ns,
        ex: eventTypeEx,
        unbind: []
    });

//{{{!mb
    if (_gecko) {
        if (eventType === "focus" || eventType === "blur") {
            capture = 1;
        }
    }
//}}}!mb

    __data__.unbind.push(function() {
        uueventdetach(doc, fixEventType, _liveClosure, capture);
    });
    uueventattach(doc, fixEventType, _liveClosure, capture);

//{{{!mb
    if (_ie) {
        if (/submit$/.test(eventType)) {
            uulive(expr + " input[type=submit]," +
                   expr + " input[type=image]",
                   eventTypeEx.replace(/submit$/, "click"), evaluator, __data__);

        } else if (/change$/.test(eventType)) { // "change"
            uulive(expr,
                   eventTypeEx.replace(/change$/, "focus"), function(event) {
                       uuevent(event.srcElement, "uulive.change", evaluator);
                   }, __data__);

            uulive(expr,
                   eventTypeEx.replace(/change$/, "blur"), function(event) {
                       uueventunbind(event.srcElement, "uulive.change");
                   }, __data__);
        }
    }
//}}}!mb
}
uulive.db = {}; // { "expr\vnamespace.click": {...}, ... }
uulive.fix =
//{{{!mb
            _ie ? { focus: "focusin", blur: "focusout" } :
//}}}!mb
            _webkit ? { focus: "DOMFocusIn", blur: "DOMFocusOut" } : {};

// uu.live.has
function uulivehas(expr,          // @param CSSSelectorExpressionString: "css > selector"
                   eventTypeEx) { // @param EventTypeExString: "namespace.click"
    var db = uulive.db[expr + "\v" + eventTypeEx];

    return db && expr === db.s && eventTypeEx === db.ex;
}

// uu.unlive
function uuunlive(expr,          // @param CSSSelectorExpressionString(= void 0): "css > selector"
                  eventTypeEx) { // @param String(= void 0): "namespace.click"
    function run(fn) {
        fn();
    }
    var db = uulive.db,
        ns, data, i, unbind,
        mode = !expr    ? 1 : // [1]
               !eventTypeEx ? 2 : // [2]
               eventTypeEx.indexOf("*") < 0 ? 3 :  // [3][5]
               (ns = eventTypeEx.slice(0, -2), 4); // [4] "namespace.*" -> "namespace"

    for (i in db) { // i = "expr\vnamespace.click"
        data = db[i]; // data = { s:expr, ns:ns, ex:eventTypeEx, unbind:[closure] }
        unbind = 1;
        switch (mode) {
        case 2: unbind = expr === data.s; break; // [2]
        case 3: unbind = expr === data.s && eventTypeEx === data.ex; break; // [3][5]
        case 4: unbind = expr === data.s && ns === data.ns; // [4]
        }
        if (unbind) {
            uueach(data.unbind, run);
            delete db[i];
        }
    }
}
//}}}!live

// --- READY ---
// uu.ready - hook event
function uuready(/* readyEventType, */  // @param String(= "dom"): readyEventType
                 /* callback, ... */) { // @param Function: callback functions
    var args = arguments, v, i = 0, iz = args.length, db = uuready.uudb,
        m, type = "dom", order = 0, rex = /^([^\:]+)(\:[0-2])?$/; // "dom", "dom:1", "dom:2"

    for (; !uuready.reload && i < iz; ++i) {
        isString(v = args[i])
                ? ((m = rex.exec(v)) && (type = m[1][_toLowerCase](),
                                         order = +m[2] || 0))
                : uuready[type] ? v(uu) // callback(uu)
                                : (db[type] || (db[type] = [[], [], []]),
                                   db[type][order].push(v));
    }
}
uuready.uudb = {}; // { readyEventType: [[low order], [mid order], [high order]], ... }

// uu.ready.fire
function uureadyfire(readyEventType, // @param String: readyEventType
                     param) {        // @param Mix(= void): callback(uu, param)
    var db = uuready.uudb[readyEventType], ary, callback, i = -1;

    if (db) {
        ary = db[2][_concat](db[1], db[0]); // join
        uuready.uudb[readyEventType] = null; // pre clear

        while ( (callback = ary[++i]) ) {
            callback(uu, param);
        }
    }
}

// --- node ---

//  [1][add node]       uu.node("div")                         -> <div>
//  [2][add text node]  uu.node("div", [uu.text("hello")])     -> <div>hello</div>
//  [3][set attr]       uu.node("div", [{ title: "hello" }])   -> <div title="hello">
//  [4][set css]        uu.node("div", [{}, { color: "red" }]) -> <div style="color: red">
//  [5][short cut]      uu.node("img", [100, 100], ["x", "y"], callback) -> <img x="100" y="100">

// uu.node - node builder
function uunode(node,       // @param Node/TagNameString(= "div"): "div" or "svg:svg"
                args,       // @param Array/Arguments(= void): [Node/String/Number/Hash, ...]
                typical,    // @param StringArray(= void): ["x", "y"]
                callback) { // @param Function(= void):
                            // @return Node:
    node || (node = "div");
    node[_nodeType] || (node = node[_indexOf]("svg:")
                            ? doc[_createElement](node) // "div" -> <div>
                            : doc.createElementNS("http://www.w3.org/2000/svg",
                                                  node.slice(4))); // "svg:g" -> <svg:g>

    if (args) {
        var arg, i = 0, iz = args.length, token = 0, type,
            ai = 0, hash = {};

        for (; i < iz; ++i) {
            arg = args[i];
            if (arg != null) { // null or undefined
                type = typeof arg;

                if (type === _number || type === _string) {
                    typical && (hash[typical[ai++]] = arg); // [!] raise Error("MISSMATCH TYPICAL LENGTH")
                } else if (arg[_nodeType]) { // [1][2]
                    node[_appendChild](arg);
                } else if (++token < 2) {
                    uuattr(node, arg);
                } else if (token < 3) {
                    uucss(node, arg);
                }
            }
        }
        callback && ai && callback(node, hash);
    }
    return node;
}
// HTML4(a ~ ul) exclude <html><head><body>
uutag.html4 = "a,b,br,dd,div,dl,dt,form,h1,h2,h3,h4,h5,h6,i,img,iframe," +
              "input,li,ol,option,p,pre,select,span,table,tbody,tr," +
              "td,th,tfoot,textarea,u,ul";
// HTML5(abbr ~ video)
uutag.html5 = "abbr,article,aside,audio,canvas,datalist," +
              "details,eventsource,figure,footer,header,hgroup," +
              "mark,menu,meter,nav,output,progress,section,time,video";

// inner - setup node builder - uu.div(), uu.a(), ...
uueach((uutag.html4 + "," + uutag.html5).split(","), function(tag) {
    uu[tag] || (uu[tag] = function() { // @param Mix: var_args
        return uunode(tag, arguments, ["t"], function(node, hash) {
            node[_appendChild](uutext(hash.t));
        });
    });
});

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
    return uunode(doc.head, arguments);
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
    return uunode(doc.body, arguments, ["t"], function(node, hash) {
        node[_appendChild](uutext(hash.t));
    });
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
        iters = uunodefind.iters[num > 4 ? num - 4 : num];

//{{{!mb
    if ("firstElementChild" in parent) {
//}}}!mb
        rv = (num === 1 || num === 4) ? parent[_parentNode][iters[0]]
                                      : parent[iters[0]];
//{{{!mb
    } else {
        var iter = iters[1];

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
    var nodeid;

    return node[_uunodeid] || (_nodeiddb[nodeid = ++_nodeidnum] = node,
                               node[_uunodeid] = nodeid);
}

// uu.nodeid.toNode - get node by nodeid
function uunodeidtonode(nodeid) { // @param String: nodeid
                                  // @return Node/void:
    return _nodeiddb[nodeid];
}

// uu.nodeid.remove - remove from node db
function uunodeidremove(node) { // @param Node:
                                // @return Node: removed node
    var nodeid = node[_uunodeid];

    nodeid && (_nodeiddb[nodeid] = node[_uunodeid] = 0);
    return node;
}

// [1][clone]           uu.node.bulk(Node) -> DocumentFragment
// [2][build]           uu.node.bulk("<p>html</p>") -> DocumentFragment

// uu.node.bulk - convert HTMLString into DocumentFragment
function uunodebulk(source,    // @param Node/HTMLFragment: source
                    context) { // @param Node(= <div>): context
                               // @return DocumentFragment:
    var rv = doc.createDocumentFragment(),
        placeholder = uunode((context || {})[_tagName]);

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
        if (uunodepath.vip.test(n[_tagName])) {
            rv.push(n[_tagName]);
            break;
        } else {
            idx = "";
            if (n[_parentNode]) {
                idx = (uunodechildren(n[_parentNode]).length < 2
                              ? ""
                              : ":nth-child(" + (uunodeindexof(n) + 1) + ")");
            }
            rv.push(n[_tagName] + idx);
        }
        n = n[_parentNode];
    }
    return rv.reverse().join(">")[_toLowerCase]();
}
uunodepath.vip = /^(?:html|head|body)$/i;

// uu.node.sort - sort by document order, detect duplicate
function uunodesort(ary,       // @param NodeArray:
                    context) { // @hidden Node(= <body>): search context
                               // @return Array: [SortedNodeArray, DuplicatedNodeArray]
    var rv = [], ri = -1, i = 0, iz = ary.length, hash = { length: iz },
        idx, min = 0xfffffff, max = 0, node, dups = [], di = -1,
        all =
//{{{!mb
              _ie ? 0 :
//}}}!mb
                        uu.tag("*", context || doc.body);

    for (; i < iz; ++i) {
        node = ary[i];
        idx =
//{{{!mb
              _ie ? node.sourceIndex :
//}}}!mb
                                       all[_indexOf](node);
        min > idx && (min = idx);
        max < idx && (max = idx);
        hash[idx] ? (dups[++di] = node) : (hash[idx] = node); // judge duplicate
    }
    for (i = min; i <= max; ++i) {
        (node = hash[i]) && (rv[++ri] = node);
    }
    return [rv, dups];
}

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
        parent[_removeChild](parent[_lastChild]);
    }
    return parent;
}

// uu.node.clone - clone node, clone Attribute, HTML5 DATA-SET, DOM Events
function uunodeclone(parent,  // @param Node: parent node (ElementNode)
                     quick) { // @param Boolean(= false): true is quick clone
                              // @return Node: cloned node
    function cloneData(source,   // @param Node: source node
                       cloned) { // @param Node: cloned node
        var key, i, iz, data = source[_uuevent], handler = uudata.handler,
            checked = "checked", selected = "selected";

        // new nodeid
//{{{!mb
        ready.data && (cloned[_uunodeid] = 0); // reset
//}}}!mb
        uunodeid(cloned);

        // bind event
        for (key in data) {
            if (key !== "types") { // skip node["data-uuevent"].types
                for (i = 0, iz = data[key].length; i < iz; ++i) {
                    uuevent(cloned, key, data[key][i]);
                }
            }
        }
        // clone UI state (node.checked)
        checked in source && source[checked] && (cloned[checked] = source[checked]);
        selected in source && (cloned[selected] = source[selected]);

        // extras data handler
        for (key in handler) {
            source[key] && handler[key](source, key, cloneNode, { clonedNode: cloned });
        }
    }

//{{{!mb
    function reverseFetch(nodeArray) { // [IE]
        var i = 0, nodeid, cloned;

        while ( (cloned = nodeArray[i++]) ) {
            (nodeid = cloned[_uunodeid]) &&
                cloneData(source = uunodeidtonode(nodeid), cloned);
        }
    }
//}}}!mb

    function drillDown(node, cloned) { // recursive
        for (; node; node = node[_nextSibling], cloned = cloned[_nextSibling]) {
            if (node[_nodeType] === 1) { // 1: ELEMENT_NODE
                cloneData(node, cloned);
                drillDown(node[_firstChild], cloned[_firstChild]);
            }
        }
    }

    var cloneNode = "cloneNode",
//{{{!mb
        ready = uuready[cloneNode],
//}}}!mb
        rv;

//{{{!mb
    if (parent[_nodeType] === 1) { // 1: ELEMENT_NODE
        if (ready.event || ready.data) { // [IE] cloneNode bugfix
            rv = doc[_createElement]("div");
            rv.innerHTML = parent[cloneNode](_true).outerHTML;
            quick ? (rv = rv[_firstChild]) : reverseFetch(uutag("*", rv));
        } else {
//}}}!mb
            rv = parent[cloneNode](_true);
            if (!quick) {
                cloneData(parent, rv);
                drillDown(parent[_firstChild], rv[_firstChild]);
            }
//{{{!mb
        }
    }
//}}}!mb
    return rv;
}

// uu.node.remove - remove node, remove nodeid, remove data, remove events
function uunoderemove(node) { // @param Node:
                              // @return Node: node
    uueventunbind(node);
    uunodeidremove(node);

    // extras data handler
    var data, handler = uudata.handler;

    for (data in handler) {
        node[data] && handler[data](node, data, "removeNode");
    }
    node[_parentNode] && node[_parentNode][_removeChild](node);
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

// uu.node.normalize - removes CRLF/blank-text/white-space/comment node
function uunodenormalize(parent, // @param Node(= <body>): parent node
                         max) {  // @param Number(= 0): max depth, 0 is infinity
                                 // @return Number: removed node count
    // markup blank and comment nodes
    function markup(node, dig, n) {
        for (n = node[_firstChild]; n; n = n[_nextSibling]) {
            switch (n[_nodeType]) {
            case 1: (dig + 1 < max) && markup(n, dig + 1); break; // recursive
            case 3: if (KEEP.test(n.nodeValue)) { // text node
                        break;
                    }
            case 8: nodeArray.push(n); // comment node
            }
        }
    }

    max = max || 9999;
    var nodeArray = [], node, i = 0, KEEP = /\S/;

    markup(parent || doc.body, 0);
    while ( ( node = nodeArray[i++]) ) {
        node[_parentNode][_removeChild](node); // remove
    }
    return nodeArray.length;
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
    var args = arguments, az = args.length, undef;

    if (isString(data)) {
        return doc[_createTextNode](az < 2 ? data // [1]
                                           : uuf.apply(this, args)); // [2]
    }
    if (text === undef) { // [3]
//{{{!mb
        if (_ie) {
            return data.innerText;
        }
//}}}!mb
        return data.textContent;
    }
    uunodeadd(doc[_createTextNode](az < 3 ? text // [4]
                                          : uuf.apply(this, uuarray(args, 1))), // [5]
              uunodeclear(data));
    return data;
}

//  [1][get] uu.value(node) -> value or [value, ...]
//  [2][set] uu.value(node, "value") -> node
//  [3][get <textarea>]       uu.value(node) -> "innerText"
//  [4][get <button>]         uu.value(node) -> "<button value>"
//  [5][get <option>]         uu.value(node) -> "<option value>" or
//                                              "<option>value</option>"
//  [6][get <selet>]          uu.value(node) -> selected option value
//  [7][get <selet multiple>] uu.value(node) -> ["value", ...]
//  [8][get <input checkbox>] uu.value(node) -> ["value", ...]
//  [9][get <input radio>]    uu.value(node) -> "value"

//{{{!form
// uu.value - value accessor
function uuvalue(node,    // @param Node:
                 value) { // @param String(= void 0):
                          // @return String/Node:
    // 0: <textarea> <input type="button"> <input type="image"> ...
    // 2: <select>
    // 3: <select multiple>
    // 4: <input type="radio">
    // 5: <input type="checkbox">
    var type = { select: node.multiple ? 3 : 2,
                 input: { radio: 4, checkbox: 5 }[node.type] || 0
               }[node[_tagName][_toLowerCase]()] || 0;

    return (value ? setNodeValue : getNodeValue)(node, type,
                type & 2 ? node.options
                         : uuarray(node.name ? doc.getElementsByName(node.name)
                                             : node), value);
}

// inner - get node.value
function getNodeValue(node,  // @param Node:
                      type,  // @param Number: nodeType
                      ary) { // @param NodeArray: [node, ...]
                             // @return StringArray/String:
    var rv = [], v, i = 0, multi = type & 1;

    if (type) {
        if (type & 2) { // 2:<select>, 3:<select multiple>
            i = node.selectedIndex;
            if (i >= 0) {
                while ( (v = ary[i++]) ) {
                    v.selected && rv.push(v.value || v.text);
                    if (!multi) { // <select>
                        break;
                    }
                }
            }
        } else if (type & 4) { // 4:<input type="radio">, 5:<input type="checkbox">
            while ( (v = ary[i++]) ) {
                v.checked && rv.push(v.value);
            }
        }
        rv = multi ? rv : (rv[0] || "");
    } else {
        rv = node.value; // <textarea> <button> <option>
    }
    return rv;
}

// inner - set node.value
function setNodeValue(node,    // @param Node:
                      type,    // @param Number: nodeType
                      ary,     // @param NodeArray: [node, ...]
                      value) { // @param StringArray/Array:
                               // @return Node:
    var v, i = 0, j, k = 0,
        prop = type & 2 ? "selected" : "checked",
        valary = uuarray(value), jz = valary.length;

    if (type) {
        // 2: <select>, 3: <select multiple>
        // 4: <input type="radio">, 5: <input type="checkbox">
        if (ary) {
            if (type & 1) { // 3: <select multiple>, 5: <input type="checkbox">
                while ( (v = ary[k++]) ) {
                    v[prop] = _false; // reset current state
                }
            }
            while ( (v = ary[i++]) ) {
                for (j = 0; j < jz; ++j) {
                    (v.value || v.text) == valary[j] // 0 == "0"
                        && (v[prop] = _true);
                }
            }
        }
    } else {
        node.value = valary.join(""); // <textarea> <button> <option>
    }
    return node;
}
//}}}!form

// --- QUERY ---
// uu.query - as document.querySelectorAll
function uuquery(expr,      // @param CSSSelectorExpressionString: "css > selector"
                 context) { // @param Node(= document): query context
                            // @return NodeArray: [Node, ...]
    context = context || doc;

//{{{!mb
    if (context.querySelectorAll) {
        if (!_ie || (_ver.ie8 && expr[_indexOf](":") < 0)
                 || (_ver.ie8 && uuquery.ie8ready.test(expr))) { // IE8 unsupported CSS3 pseudo-class
            if (!uuquery.ngword.test(expr)) {
//}}}!mb
                return fakeToArray(context.querySelectorAll(expr));
//{{{!mb
            }
        }
    }

    var token = _tokenCache[expr] || (_tokenCache[expr] = uuquery.tokenizer(expr));

    return token.err ? [] : uuquery.selector(token, context);
//}}}!mb
}
//{{{!mb
uuquery.ngword = /\!\=|\:con/;
uuquery.ie8ready = /:(?:focus|hover|link|visited)/;
//}}}!mb

// uu.id - as document.getElementById
function uuid(expr,      // @param String: id
              context) { // @param Node(= document): query context
                         // @return Node/null:
    return (context || doc).getElementById(expr);
}

// uu.tag - as document.getElementsByTaName
function uutag(expr,      // @param String: "*" or "tag"
               context) { // @param Node(= document): query context
                          // @return NodeArray: [Node, ...]
//{{{!mb
    if (!_ie) {
//}}}!mb
        return _slice.call((context || doc).getElementsByTagName(expr));
//{{{!mb
    }

    var rv = [], ri = -1, v, i = 0, skip = expr === "*",
        nodeList = (context || doc).getElementsByTagName(expr),
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

// uu.match - as document.matchesSelector
function uumatch(expr,      // @param CSSSelectorExpressionString: "css > selector"
                 context) { // @param Node(= document): match context
                            // @return Boolean:
    context = context || doc;
//{{{!mb
    if (context.matchesSelector) {
        return context.matchesSelector(expr);
    }
    if (context.webkitMatchesSelector) {
//}}}!mb
        return context.webkitMatchesSelector(expr);
//{{{!mb
    }
    if (context.mozMatchesSelector) {
        return context.mozMatchesSelector(expr);
    }
    if (context.msMatchesSelector) {
        return context.msMatchesSelector(expr);
    }

    var node, i = -1, nodeArray = uuquery(expr, doc);

    while ( (node = nodeArray[++i]) ) {
        if (node === context) {
            return _true;
        }
    }
    return _false;
//}}}!mb
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

// uu.trim - trim both side and inner whitespace
function uutrim(source,        // @param String: " a   b  c "
                replacement) { // @param String(= " "): replacement
                               // @return String: "a b c"
    return source.trim()[_replace](/\s+/g,
                                   replacement === void 0 ? " " : replacement);
}

// uu.trim.tag - uu.trim() + strip tags
function uutrimtag(source) { // @param String:  "  <h1>A</h1>  B  <p>C</p>  "
                             // @return String: "A B C"
    return uutrim(source[_replace](/<\/?[^>]+>/g, ""));
}

// uu.trim.func - uu.trim() + strip "function-name(" ... ")"
function uutrimfunc(source) { // @param String:   '  url("http://...")  '
                              // @return String:  '"http://..."'
    return source[_replace](/^[^\(]+\(|\)\s*$/g, ""); // )
}

// uu.trim.quote - String.trim() + strip double and single quotes
function uutrimquote(source) { // @param String:  ' "quote string" '
                               // @return String: 'quote string'
    return source[_replace](/^\s*["']?|["']?\s*$/g, "");
}

// [1][placeholder] uu.format("?? dogs and ??", 101, "cats") -> "101 dogs and cats"

// uu.f - placeholder( "??" ) replacement
function uuf(format) { // @param FormatString: formatted string with "??" placeholder
                       // @return String: "formatted string"
    var i = 0, args = arguments;

    return format[_replace](uuf.q, function() {
        return args[++i];
    });
}
uuf.q = /\?\?/g;

// --- debug ---
// uu.puff - uu.puff(mix) -> alert( uu.json(mix) )
function uupuff(source                   // @param Mix/FormatString: source object
                                         //                          or "format ?? string"
                /* , var_args, ... */) { // @param Mix: var_args
    var args = arguments;

    alert(args.length > 1 || isString(source) ? uuf.apply(this, args)
                                              : uujsonencode(source));
}

// uu.log - add log
function uulog(log                      // @param Mix: log data
               /* , var_args, ... */) { // @param Mix: var_args
    var args = arguments,
        id = uu.config.log, context = uuid(id),
        txt = args.length > 1 || isString(log) ? uuf.apply(this, args)
                                               : uujsonencode(log);

    context || uunodeadd(context = uu.ol({ id: id }));

    uulog.max < uutag("*", context).length && (context.innerHTML = "");

    uunodeadd(uu[/OL|UL/.test(context[_tagName]) ? "li"
                                                 : "p"](doc[_createTextNode](txt)),
              context);
}
uulog.max = 30; // max items

//  [1][test]           uu.ok("title", 1, "===", 1, "more info")
//  [2][add separater]  uu.ok("separater comment")
//  [3][get/show score] uu.ok() -> { ok, ng, total, ms }

// uu.ok - unit test
//{{{!unittest
function uuok(title,    // @param String: title
              lhs,      // @param Mix: left handset
              operator, // @param String: operator
              rhs,      // @param Mix(= void): right handset
              more) {   // @param String(= void): more info
                        // @throws Error from judge()
    var rv, r, tm, db = uuok.db, ary, i, iz, v, ol;

    if (operator) {
        tm = +new Date;
        r = judge(lhs, operator, rhs);
        tm = ((+new Date) - tm);
        ++db[r ? "ok" : "ng"];
        ++db.total;
        db.ms += tm;
        db.row.push([title, r, uuf("{ ?? ?? ?? }( ??ms )",
                                   uujson(lhs, _true), operator,
                                   rhs ? uujson(rhs, _true) : "", tm),
                               more || ""]);
    } else if (isString(title)) {
        db.row.push([title, 2, "", ""]);
    } else {
        rv = uuclone(db);
        db.ng && uucss(doc.body, { bgc: uuok.bgc[0] });
        ol = uuid("uuok") || doc.body[_appendChild](uu.ol({ id: "uuok" }));

        for (ary = db.row, i = 0, iz = ary.length; i < iz; ++i) {
            v = ary[i];
            uunodeadd(
                uu.li({}, { bgc: uuok.bgc[v[1] + ((i % 2) * 4)] },
                    uu.span({}, { "font-weight": "bold" }, uutext(v[0] + ":")),
                    uutext(v[2] + " " + v[3])), ol);
        }
        uuok.db = { ok: 0, ng: 0, total: 0, ms: 0, row: [] }; // reset
        return rv;
    }
}
uuok.db = { ok: 0, ng: 0, total: 0, ms: 0, row: [] };
uuok.bgc = { 0: "#fcd", 1: "#dfc", 2: "#80c65a", 4: "#fac", 5: "#cfa", 6: "#72bf47" };

// inner -
function judge(lhs,      // @param Mix: left hand set
               operator, // @param String: operator
               rhs) {    // @param Mix(= void): right hand set
                         // @return Number: 0 is false, 1 is true
                         // @throws Error("BAD_OPERATOR")
    var rv, ope = uutrim(operator.toUpperCase(), "");

    if (ope === "===") {
        rv = lhs.valueOf() == rhs.valueOf();
    } else if (ope === "!==") {
        rv = lhs.valueOf() != rhs.valueOf();
    } else {
        switch (ope) {
        case "IS":
        case "==":  rv =  uulike(lhs, rhs); break;
        case "!=":  rv = !uulike(lhs, rhs); break;
        case ">":   rv = lhs >  rhs; break;
        case ">=":  rv = lhs >= rhs; break;
        case "<":   rv = lhs <  rhs; break;
        case "<=":  rv = lhs <= rhs; break;
        case "&&":  rv = !!(lhs && rhs); break;
        case "||":  rv = !!(lhs || rhs); break;
        case "HAS": rv = isString(lhs) ? lhs.indexOf(rhs) > 0
                                       : uuhas(lhs, rhs); break;
        case "ISNAN":     rv = isNaN(lhs); break;
        case "ISTRUE":    rv = !!lhs; break;
        case "ISFALSE":   rv =  !lhs; break;
        case "ISERROR":   try { fn(), rv = 0; } catch(err) { rv = 1; } break;
        case "ISINFINITY":rv = !isFinite(lhs); break;
        case "INSTANCEOF":rv = lhs instanceof rhs; break;
        default:
            ope = ope[_replace](/IS/, "");
            rv = isFunction(uutype[ope]) ? uutype[ope](lhs, ope) // extend types
               : uutype[ope] ? uutype(lhs) === uutype[ope] : 2;
            if (rv === 2) {
                throw new Error("BAD_OPERATOR " + operator);
            }
        }
    }
    return +rv;
}
//}}}!unittest

// --- JSON ---
// uu.json - mix to JSONString
function uujson(source, // @param Mix:
                alt) {  // @param Boolean(= false): false is JSON.stringify
                        //                          true is js impl(uu.json.encode)
                        // @return JSONString:
    return (alt || !JSON) ? uujsonencode(source, 1)
                          : JSON.stringify(source) || "";
}
uujson.x = [
    /[^,:{}\[\]0-9\.\-+Eaeflnr-u \n\r\t]/,                      // x[0] NGWORDS
    /"(\\.|[^"\\])*"/g,                                         // x[1] UNESCAPE
    /(?:\"|\\[bfnrt\\])/g,                                      // x[2] ESCAPE
    uuhash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\'), // x[3] SWAP ENTITY
    /[\x00-\x1f]/g];                                            // x[4] NON-ASCII TO UNICODE ENTITY

// uu.json.decode - decode JSONString
function uujsondecode(jsonString, // @param JSONString:
                      alt) {      // @param Boolean(= false): false is JSON.parse
                                  //                          true is js impl(uu.json.decode)
                                  // @return Mix/Boolean: false is error
    var str = jsonString.trim(), x = uujson.x;

    return (alt || !JSON) ? (x[0].test(str[_replace](x[1], ""))
                                ? _false
                                : (new Function("return " + str))())
                          : JSON.parse(str);
}

// inner - json inspect
function uujsonencode(mix, esc) {
    var ary, type = uutype(mix), w, ai = -1, i, iz, q = '"', x, prefix = "";

    if (mix === win) {
        return '"window"'; // window -> String("window")
    }
    switch (type) {
    case uutype.FUNCTION:  // Function -> "FunctionName():": { ... }
                            w =
//{{{!mb
                                _ie ? (w = mix + "").slice(9, w[_indexOf]("(")) : // )
//}}}!mb
                                      mix.name;
                            prefix = q + w + "()" + q + ": ";
    case uutype.HASH:       ary = []; break;
    case uutype.NULL:
    case uutype.BOOLEAN:    return mix + "";
    case uutype.NODE:       return q + uunodepath(mix) + q; // node path
    case uutype.DATE:       return mix.toJSON();
    case uutype.NUMBER:     return isFinite(mix) ? mix + "" : "null";
    case uutype.STRING:
        x = uujson.x;
        return q + mix.replace(x[2], function(m) {
                       return x[3][m] || m;
                   }).replace(x[4], function(s) {
                       return "\\u00" + _num2hh[s.charCodeAt(0)];
                   }) + q;
    case uutype.ARRAY:
    case uutype.FAKEARRAY:
        for (ary = [], i = 0, iz = mix.length; i < iz; ++i) {
            ary[++ai] = uujsonencode(mix[i], esc);
        }
        return "[" + ary + "]";
    default: // UNDEFINED
        return "";
    }
    if (mix.msgbox) { // is Class Instance
        return q + mix.name + q;
    }
    if (_toString.call(type).slice(-3) === "on]") { // [object CSSStyleDeclaration]
        w = _webkit;
        for (i in mix) {
            if (typeof mix[i] === _string && (w || i != (+i + ""))) { // isFinite(i)
                w && (i = mix.item(i));
                ary[++ai] = q + i + q + ':' + q + mix[i] + q;
            }
        }
    } else { // is Hash
        for (i in mix) {
            ary[++ai] = q + i + q + ":" + uujsonencode(mix[i], esc);
        }
    }
    return prefix + "{" + ary + "}";
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
    return source === void 0              ? _date2hash(new Date())       // [1] uu.date()
         : uutype(source) === uutype.DATE ? _date2hash(source)           // [3] uu.date(new Date())
         : isNumber(source)               ? _date2hash(new Date(source)) // [4] uu.date(1234567)
         : source.ISO                     ? uuclone(source)              // [2] uu.date(DateHash)
         : _date2hash(_str2date(source) || new Date(source));            // [5][6][7]
}
uudate.x = [
    /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/, // x[0] PARSE
    /^([\w]+) (\w+) (\w+)/];                                     // x[1] DATE FORMAT

// inner - convert Date to DateHash
function _date2hash(date) { // @param Date:
                            // @return Hash: { Y: 2010, M: 1~12, D: 1~31,
                            //                 h: 0~23, m: 0~59, s: 0~59, ms: 0~999,
                            //                 time: unix_time, ISO(), GMT() }
    return {
        Y:      date.getUTCFullYear(),      M:      date.getUTCMonth() + 1,
        D:      date.getUTCDate(),          h:      date.getUTCHours(),
        m:      date.getUTCMinutes(),       s:      date.getUTCSeconds(),
        ms:     date.getUTCMilliseconds(),  time:   date.getTime(),
        ISO:    datehashiso,                GMT:    datehashgmt
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

    var x = uudate.x, m = x[0].exec(str);

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
                       [_replace](x[1], _toDate));
}

// DateHash.ISO - encode DateHash To ISO8601String
function datehashiso() { // @return ISO8601DateString: "2000-01-01T00:00:00.000Z"
    var that = this;

    return uuf("??-??-??T??:??:??.??Z",
               that.Y, _num2dd[that.M], _num2dd[that.D],
               _num2dd[that.h], _num2dd[that.m],
               _num2dd[that.s], ("00" + that.ms).slice(-3) + that.ms);
}

// DateHash.GMT - encode DateHash To RFC1123String
function datehashgmt() { // @return RFC1123DateString: "Wed, 16 Sep 2009 16:18:14 GMT"
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

// --- COLOR ---
//{{{!color
// uu.Class.Color
function Color(r, g, b, a) {
    this.r = r = (r < 0 ? 0 : r > 255 ? 255 : r) | 0;
    this.g = g = (g < 0 ? 0 : g > 255 ? 255 : g) | 0;
    this.b = b = (b < 0 ? 0 : b > 255 ? 255 : b) | 0;
    this.a = a =  a < 0 ? 0 : a >   1 ?   1 : a;
    this.hex = "#" + _num2hh[r] + _num2hh[g] + _num2hh[b];
    this.rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
Color[_prototype] = {
    toString:   function() { // @return String: "#000000" or "rgba(0,0,0,0)"
                    return uuready.color.rgba ? this.rgba : this.hex;
                },
    hsla:       function() { // @return Hash: { h, s, l, a }
                    return rgba2hsla(this.r, this.g, this.b, this.a);
                },
    gray:       function() { // @return Color:
                    return new Color(this.g, this.g, this.g, this.a);
                },
    sepia:      function() { // @return Color:
                    var y = 0.2990 * this.r + 0.5870 * this.g + 0.1140 * this.b,
                        u = -0.091, v = 0.056;

                    return new Color((y + 1.4026 * v) * 1.2,
                                      y - 0.3444 * u - 0.7114 * v,
                                     (y + 1.7330 * u) * 0.8, this.a);
                },
    comple:     function() { // @return Color:
                    return new Color(this.r ^ 255, this.g ^ 255,
                                     this.b ^ 255, this.a);
                },
    arrange:    // Color.arrange - arrangemented color(Hue, Saturation and Lightness)
                //    Hue is absolure value,
                //    Saturation and Lightness is relative value.
                function(h,   // @param Number(= 0): Hue (-360~360)
                         s,   // @param Number(= 0): Saturation (-100~100)
                         l) { // @param Number(= 0): Lightness (-100~100)
                              // @return Color:
                    var rv = rgba2hsla(this.r, this.g, this.b, this.a);

                    rv.h += h;
                    rv.h = (rv.h > 360) ? rv.h - 360 : (rv.h < 0) ? rv.h + 360 : rv.h;
                    rv.s += s;
                    rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
                    rv.l += l;
                    rv.l = (rv.l > 100) ? 100 : (rv.l < 0) ? 0 : rv.l;
                    return hsla2color(rv.h, rv.s, rv.l, rv.a);
                }
};
uuclass.Color = Color; // uu.Class.Color

//  [1][Color]                     uu.color(Color)               -> Color
//  [2][RGBAHash/HSLAHash to hash] uu.color({ h:0,s:0,l:0,a:1 }) -> Color
//  [3][W3CNamedColor to hash]     uu.color("black")             -> Color
//  [4]["#000..." to hash]         uu.color("#000")              -> Color
//  [5]["rgba(,,,,)" to hash]      uu.color("rgba(0,0,0,1)")     -> Color
//  [6]["hsla(,,,,) to hash]       uu.color("hsla(360,1%,1%,1)") -> Color

// uu.color - parse color
function uucolor(expr) { // @parem Color/HSLAHash/RGBAHash/String: "black", "#fff", "rgba(0,0,0,0)"
                         // @return Color:
    var rv, m, n, r, g, b, a = 1;

    if (expr instanceof Color) {
        return expr;
    }
    if (typeof expr !== _string) {
        return "l" in expr ? hsla2color(expr.h, expr.s, expr.l, expr.a) // HSLAHash
                           : new Color(expr.r, expr.g, expr.b, expr.a); // RGBAHash
    }
    expr = expr[_toLowerCase]();
    if ( (rv = uucolor.db[expr] || uucolor.cache[expr]) ) {
        return rv;
    }
    if (expr.length < 8 && (m = uucolor.rex.hex.exec(expr)) ) { // #fff or #ffffff
        n = expr.length > 4 ? parseInt(m[1], 16)
                            : (m = m[1].split(""),
                               parseInt(m[0]+m[0] + m[1]+m[1] + m[2]+m[2], 16));
        r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    } else if ( (m = uucolor.rex.rgba.exec(uutrim(expr, "")) ) ) {
        n = m[1] === "rgb" ? 2.555 : 1;
        r = m[3] ? m[2] * n : m[2];
        g = m[5] ? m[4] * n : m[4];
        b = m[7] ? m[6] * n : m[6];
        a = m[8] ? parseFloat(m[8]) : 1;
        if (n === 1) {
            return hsla2color(r, g, b, a);
        }
    }
    return uucolor.cache[expr] = new Color(r, g, b, a);
}
uucolor.db = { transparent: new Color(0, 0, 0, 0) };
uucolor.cache = {}; // { "#123": Color, ... }
uucolor.rex = {
//  hex: /^#([\da-f]{3}(?:[\da-f]{3})?)$/, // #fff or #ffffff
    hex: /^#([\da-f]{3}([\da-f]{3})?)$/, // #fff or #ffffff [OPERA10+] bugfix
    rgba: /^(rgb|hsl)a?\(([\d\.]+)(%)?,([\d\.]+)(%)?,([\d\.]+)(%)?(?:,([\d\.]+))?\)$/,
    trim: /\s+/g
};

// uu.color.random - create random color
function uucolorrandom(a) { // @param Number(= 1): alpha
                            // @return Color:
    var n = (Math.random() * 0xffffff) | 0;

    return new Color(n >> 16, (n >> 8) & 255, n & 255, a === 0 ? 0 : (a || 1));
}

// uu.color.add
function uucoloradd(src) { // @param String: "000000black,..."
    var ary = src.split(","), i = 0, iz = ary.length, v, n;

    for (; i < iz; ++i) {
        v = ary[i];
        n = parseInt(v.slice(0, 6), 16);
        uucolor.db[v.slice(6)] = new Color(n >> 16, (n >> 8) & 255, n & 255, 1);
    }
}

// inner - RGBA to HSLAHash
function rgba2hsla(r, g, b, a) { // @return Hash: { h, s, l, a }
    r = r / 255, g = g / 255, b = b / 255;

    var max = (r > g && r > b) ? r : g > b ? g : b,
        min = (r < g && r < b) ? r : g < b ? g : b,
        diff = max - min,
        h = 0, s = 0, l = (min + max) * 0.5;

    if (l > 0 && l < 1) {
        s = diff / (l < 0.5 ? l * 2 : 2 - (l * 2));
    }
    if (diff > 0) {
        if (max === r && max !== g) {
            h += (g - b) / diff;
        } else if (max === g && max !== b) {
            h += (b - r) / diff + 2;
        } else if (max === b && max !== r) {
            h += (r - g) / diff + 4;
        }
        h *= 60;
    }
    return { h: h, s: (s * 100 + 0.5) | 0, l: (l * 100 + 0.5) | 0, a: a };
}

// inner - HSLA to Color - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function hsla2color(h, s, l, a) { // @return Color:
    h = (h === 360) ? 0 : h, s = s / 100, l = l / 100;

    var r = 0, g = 0, b = 0, s1, s2, l1, l2;

    if (h < 120) {
        r = (120 - h) / 60, g = h / 60;
    } else if (h < 240) {
        g = (240 - h) / 60, b = (h - 120) / 60;
    } else {
        r = (h - 240) / 60, b = (360 - h) / 60;
    }
    s1 = 1 - s;
    s2 = s * 2;

    r = s2 * (r > 1 ? 1 : r) + s1;
    g = s2 * (g > 1 ? 1 : g) + s1;
    b = s2 * (b > 1 ? 1 : b) + s1;

    if (l < 0.5) {
        r *= l, g *= l, b *= l;
    } else {
        l1 = 1 - l;
        l2 = l * 2 - 1;
        r = l1 * r + l2;
        g = l1 * g + l2;
        b = l1 * b + l2;
    }
    return new Color(r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5, a);
}

// --- initialize ---
//{{{!colordict
// add W3C Named Color
uucoloradd("000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,ffff00" +
"yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,ff00ffmage" +
"nta,880000maroon,888800olive,008800green,008888teal,000088navy,880088purple" +
",696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,d3d3d3lightgrey,dcdcd" +
"cgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,778899lightslategray" +
",b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,4b0082indigo,483d8bda" +
"rkslateblue,6a5acdslateblue,7b68eemediumslateblue,9370dbmediumpurple,f8f8ff" +
"ghostwhite,00008bdarkblue,0000cdmediumblue,4169e1royalblue,1e90ffdodgerblue" +
",6495edcornflowerblue,87cefalightskyblue,add8e6lightblue,f0f8ffaliceblue,19" +
"1970midnightblue,00bfffdeepskyblue,87ceebskyblue,b0e0e6powderblue,2f4f4fdar" +
"kslategray,00ced1darkturquoise,afeeeepaleturquoise,f0ffffazure,008b8bdarkcy" +
"an,20b2aalightseagreen,48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamari" +
"ne,e0fffflightcyan,00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgree" +
"n,7fff00chartreuse,adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66" +
"cdaamediumaquamarine,98fb98palegreen,f5fffamintcream,006400darkgreen,228b22" +
"forestgreen,32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolive" +
"green,6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet" +
",8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorch" +
"id,ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,c71585medium" +
"violetred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,ffe4e1mistyrose,ff1493de" +
"eppink,db7093palevioletred,e9967adarksalmon,ffb6c1lightpink,fff0f5lavenderb" +
"lush,cd5c5cindianred,f08080lightcoral,f4a460sandybrown,fff5eeseashell,dc143" +
"ccrimson,ff6347tomato,ff7f50coral,fa8072salmon,ffa07alightsalmon,ffdab9peac" +
"hpuff,ffffe0lightyellow,b22222firebrick,ff4500orangered,ff8c00darkorange,ff" +
"a500orange,ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown," +
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhak" +
"i,fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,e" +
"ee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,ffe4c4bisqu" +
"e,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,f5deb3wheat,faebd7an" +
"tiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,fffff0ivory,a9a9a9da" +
"rkgrey,2f4f4fdarkslategrey,696969dimgrey,808080grey,d3d3d3lightgrey,778899l" +
"ightslategrey,708090slategrey,8b4513saddlebrown");
//}}}!colordict
//}}}!color

// --- IMAGE ---
// uu.image - image loader
//{{{!image
function uuimage(url,        // @param String:
                 callback) { // @param Function: callback(img, ok)
                             //     img - Node: <img>
                             //     ok  - Boolean: true is success
    function after(ok) {
        while ( (fn = uuimage.fn[url].shift()) ) {
            fn(img, ok);
        }
    }

    var img = uuimage.db[url];

    if (img) { // cached or scheduled
        uuimage.fn[url].push(callback);
        img.ok && after(_true);
    } else {
        uuimage.db[url] = img = new Image();
        uuimage.fn[url] = [callback]; // init
        img.ok = _false;
        img.onerror = function() {
            img[_width] = img[_height] = 0;
            after(img.ok = _false);
            img.onerror = img.onload = null;
        };
        img.onload = function() {
            // [IE8+] readyState === "complete"
            (img.complete || img.readyState === "complete") && after(img.ok = _true);
            img.onerror = img.onload = null;
        };
        img[_setAttribute]("src", url);
    }
}
uuimage.db = {}; // { url: Image, ... }
uuimage.fn = {}; // { url: [callback, ...] }

// uu.image.size - get image natural dimension
function uuimagesize(node) { // @param HTMLImageElement:
                             // @return Hash: { w, h }
//{{{!mb
    if ("naturalWidth" in node) { // [HTML5][GECKO][WEBKIT]
//}}}!mb
        return { w: node.naturalWidth, h: node.naturalHeight };
//{{{!mb
    }
    // http://d.hatena.ne.jp/uupaa/20090602
    var rs, rw, rh, w, h, hide;

    if (node.src) { // HTMLImageElement
        if (node[_uuimage] && node[_uuimage].src === node.src) {
            return node[_uuimage];
        }
        if (_ie) { // [IE]
            if (node.currentStyle) {
                hide = node.currentStyle[_display] === "none";
                hide && (node.style[_display] = "block");
            }
            rs = node.runtimeStyle;
            // keep runtimeStyle
            w = rs[_width];
            h = rs[_height];
            // override
            rs[_width] = rs[_height] = "auto";
            rw = node[_width];
            rh = node[_height];
            // restore
            rs[_width]  = w;
            rs[_height] = h;

            hide && (node.style[_display] = "none");
        } else { // [OPERA]
            // keep current style
            w = node[_width];
            h = node[_height];

            node.removeAttribute(_width);
            node.removeAttribute(_height);

            rw = node[_width];
            rh = node[_height];
            // restore
            node[_width]  = w;
            node[_height] = h;
        }
        return node[_uuimage] = { w: rw, h: rh, src: node.src }; // bond
    }
    return { w: node[_width], h: node[_height] };
//}}}!mb
}
//}}}!image

// --- SVG ---
// uu.svg - <svg:svg>
//{{{!svg
function uusvg(x,        // @param Number: Has no meaning or effect on outermost 'svg' elements
               y,        // @param Number: Has no meaning or effect on outermost 'svg' elements
               width,    // @param Number: For outermost 'svg' elements, the intrinsic
                         //                 width of the SVG document fragment.
                         //                For embedded 'svg' elements, the width of
                         //                 the rectangular region into which the 'svg' element is placed.
               height) { // @param Number: For outermost 'svg' elements, the intrinsic
                         //                 height of the SVG document fragment.
                         //                For embedded 'svg' elements, the height of
                         //                 the rectangular region into which the 'svg' element is placed.
                         // @return SVGNode: <svg:svg>
    return uunode("svg:svg", arguments, ["x", "y", "w", "h"], uuattr);
}
//}}}!svg

// --- CANVAS ---
// uu.canvas - <canvas>
//{{{!canvas
function uucanvas(width,    // @param Number(= 300):
                  height) { // @param Number(= 150):
                            // @return Node: <canvas>
    return uunode("canvas", arguments, ["w", "h"], uuattr);
}
//}}}!canvas

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
//{{{!flash
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
        paramArray.push(uuf(_ie ? '<param name="??" value="??" />'
                                : '??="??"', i, param[i]));
    }
    fragment = uuf(
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
//}}}!flash

// --- OTHER ---
// uu.guid - get unique number
function uuguid() { // @return Number: unique number, from 1
    return ++_guidnum;
}

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
    return this.toJSON ? this.toJSON() : uudate(this).ISO();
}

// Date.prototype.toJSON
function DateToJSON() { // @return String:
    return uudate(this).ISO();
}

// Boolean.prototype.toJSON
// Number.prototype.toJSON
// String.prototype.toJSON
function ObjectToJson() { // @return Mix:
    return this.valueOf();
}

// String.prototype.trim
function StringTrim() { // @return String: "has  space"
    return this[_replace](_trimSpace, "");
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
        this[_removeChild](this[_lastChild]);
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
    p || that[_parentNode][_removeChild](that);
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
//{{{!nodeset
function NodeSet(expr,      // @param NodeSet/Node/NodeArray/String/window:
                 context) { // @param NodeSet/Node(= void 0): context
    this.stack = [[]]; // [NodeSet, ...]

    this[_nodeArray] = !expr ? [] // empty nodeArray
        : (expr === win || expr[_nodeType]) ? [expr] // window / node
        : typeof expr === _string ?
            (!expr[_indexOf]("<")
                ? [uunodebulk(expr)]  // <div> -> fragment
                : uuquery(expr, context &&
                                context[_nodeArray] ? context[_nodeArray][_concat]()
                                                    : context)) // query
        : _isArray(expr) ? expr[_concat]() // clone NodeArray
        : (expr instanceof NodeSet) ? expr[_nodeArray][_concat]() // copy constructor
        : []; // bad expr
}

NodeSet[_prototype] = {
    // --- STACK ---
    back:           NodeSetBack,        // NodeSet.back():NodeSet
    find:           NodeSetFind,        // NodeSet.find(expr:String):NodeSet
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
    // --- LIVE EVENT ---
//  live:           NodeSetLive,        // NodeSet.live(CSSSelectorExpressionString:String,
//                                      //              eventTypeEx:EventTypeExString,
//                                      //              evaluator:Function/Instance):NodeSet
//  unlive:         NodeSetUnlive,      // NodeSet.unlive(CSSSelectorExpressionString:String = void,
//                                      //                eventTypeEx:EventTypeExString = void):NodeSet
    // --- ATTRIBUTE, CSS, Node.className ---
//  attr:           NodeSetAttr,        // NodeSet.attr(key:String/Hash = void,
                                        //              value:String = void):NodeSet/Array
//  css:            NodeSetCSS,         // NodeSet.css(key:String/Hash = void,
                                        //             value:String = void):NodeSet/Array
    klass:          NodeSetKlass,       // NodeSet.klass(expr:String = ""):NodeSet
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
    this[_nodeArray] = this.stack.pop() || [];
    return this;
}

// NodeSet.find
function NodeSetFind(expr) { // @param String: expression, "css > expr"
                             // @return NodeSet:
    this.stack.push(this[_nodeArray]); // add stack

    var rv = [], ary = this[_nodeArray], i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        rv = rv[_concat](uuquery(expr, ary[i]));
    }
    this[_nodeArray] = rv;
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
    var rv = this[_nodeArray][indexer < 0 ? indexer + this[_nodeArray].length
                                          : indexer || 0];

    return evaluator ? (evaluator(rv, indexer), this) : rv;
}

// NodeSet.each
function NodeSetEach(evaluator) { // @param Function: evaluator
                                  // @return NodeSet:
    this[_nodeArray].forEach(evaluator);
    return this;
}

// NodeSet.size - get nodeSet.length
function NodeSetSize() { // @return Number:
    return this[_nodeArray].length;
}

// NodeSet.clone - clone nodeSet Array
function NodeSetClone() { // @return Array: nodeSet
    return this[_nodeArray][_concat]();
}

// NodeSet.indexOf - NodeSet.indexOf(node)
function NodeSetIndexOf(node) { // @param Node:
                                // @return Number: found index or -1
    return this[_nodeArray][_indexOf](node);
}

// NodeSet.add - add node or fragment
function NodeSetAdd(source,     // @param Node/DocumentFragment/HTMLFragment/TagName(= "div"):
                    position) { // @param String(= ".$"): insert position
                                // @return NodeSet:
    var ary = this[_nodeArray], context, i = -1;

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
function NodeSetKlass(expr) { // @param String(= ""):
                              // @return NodeSet:
    return NodeSetIter(1,
                       this,
                       { "+": uuklassadd,       // [add]    "+class"
                         "-": uuklassremove,    // [remove] "-class"
                         "!": uuklasstoggle     // [toggle] "!class"
                       }[expr.charAt(0)] || uuklassadd, expr.slice(1)); // + - !
}

// NodeSet.iter - NodeSet iterator
function NodeSetIter(iterType,  // @param Number: 0 is forEach, 1 is map
                     that,      // @param NodeSet:
                     evaluator, // @param Function: evaluator
                     param1,    // @param Mix: param
                     param2,    // @param Mix: param
                     param3,    // @param Mix: param
                     param4) {  // @param Mix: param
                                // @return NodeSet:
    var node, ary = that[_nodeArray], i = 0, iz = ary.length,
        rv = [], r, arrayResult = 0;

    for (; i < iz; ++i) {
        node = ary[i];
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
//{{{!live
            live:       uulive,
            unlive:     uuunlive,
//}}}!live
            hover:      uueventhover,
            cyclic:     uueventcyclic,
            fx:         uufx,
            skip:       uufxskip,
            remove:     uunoderemove,
            show:       uucssshow,
            hide:       uucsshide       }, function(fn, name) {

    NodeSet[_prototype][name] = function(a, b, c) {
        return NodeSetIter(0, this, fn, a, b, c);
    };
});

// map(iter = 1)
uueach( {
//{{{!form
            value: uuvalue,
//}}}!form
            attr: uuattr, css: uucss,
            html: uuhtml, text: uutext }, function(fn, name) {

    NodeSet[_prototype][name] = function(a, b) {
        return NodeSetIter(1, this, fn, a, b);
    };
});
//}}}!nodeset

// --- initialize ---

// inner - build DOM Lv2 event handler - uu.click(), ...
uueach(uuevent.shortcut, function(eventType) {
    uu[eventType] = function(node, fn) { // uu.click(node, fn) -> node
        return uuevent(node, eventType, fn);
    };
//{{{!nodeset
    NodeSet[_prototype][eventType] = function(fn) { // uu("li").click(fn) -> NodeSet
        return NodeSetIter(0, this, uuevent, eventType, fn);
    };
//}}}!nodeset
});

//{{{!mb
// [IE6][IE7][IE8]
_ie && _ver < 9 && uueach(uutag.html5.split(","), doc[_createElement]);

try {
    // [IE6] flicker fix
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

    for (nodeid in _nodeiddb) {
        try {
            node = _nodeiddb[nodeid];
            ary = node.attributes;
            i = -1;
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
uuready("dom:2", function() {
    var nodeList = uutag("*", _rootNode), v, i = -1,
        styleFix = uuhash((
//{{{!mb
                !uuready[_getAttribute] ? "float,styleFloat,cssFloat,styleFloat" :
//}}}!mb
                                          "float,cssFloat"
            ) + ",d,display,w,width,h,height,x,left,y,top,l,left,t,top," +
                "c,color,bg,background,bgc,backgroundColor,bgi,backgroundImage," +
                "o,opacity,z,zIndex,fs,fontSize," +
                "pos,position,m,margin,b,border,p,padding");

    uumix(_camelhash(uufix.db, _webkit ? getComputedStyle(_rootNode, 0)
                                       : _rootNode.style), styleFix, uuattr.fix);
    uunodeid(_rootNode);
    while ( (v = nodeList[++i]) ) {
        uunodeid(v);
    }
});

// inner - make camelized hash( { "text-align": "TextAlign", ...}) from getComputedStyle
function _camelhash(rv, props) {
    var
//{{{!mb
        DECAMELIZE = /([a-z])([A-Z])/g,
//}}}!mb
        k, v;

    for (k in props) {
        if (typeof props[k] === _string) {
//{{{!mb
            if (_webkit) {
//}}}!mb
                v = k = props.item(k); // k = "-webkit-...", "z-index"
                k[_indexOf]("-") >= 0 && (v = k[_replace](/-[a-z]/g, function(m) {
                    return m[1].toUpperCase();
                }));
                (k !== v) && (rv[k] = v);
//{{{!mb
            } else {
                v = ((_gecko && !k[_indexOf]("Moz")) ? "-moz" + k.slice(3) :
                     (_ie    && !k[_indexOf]("ms"))  ? "-ms"  + k.slice(2) :
                     (_opera && !k[_indexOf]("O"))   ? "-o"   + k.slice(1) : k)
                    [_replace](DECAMELIZE, function(m, c, C) {
                        return c + "-" + C[_toLowerCase]();
                    });
                (k !== v) && (rv[v] = k);
            }
//}}}!mb
        }
    }
    return rv;
}

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
               touch: _true, flash: 0, silverlight: 0 },
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
    rv.touch        = rv.iphone || rv.android;
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
        return _slice.call(fakeArray);
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
            StringIndexer: _true,   // String[indexer] ready
            cloneNode: {            // cloneNode:
                attr: _false,       //  ref attribute [GECKO][WEBKIT][OPERA][IE] is false
                data: _false,       //  ref node["data-*"] [IE6-IE8][IE9pp3] is true
                event: _false       //  ref DOM Event      [IE6-IE8][IE9pp3] is true
            }
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
        _slice.call(doc.getElementsByTagName("head"));
    } catch(err) { rv.ArraySlice = _false; }
    rv[_getAttribute] = child[_getAttribute]("class") === "a" &&
                        child[_getAttribute]("href") === "/a";
    rv.StringIndexer = !!"0"[0];

    // revise
    if (_ie) {
        _ver < 9 && (rv.color[transparent] = _false);
        _ver < 7 && (rv.border[transparent] = _false);
    }
//}}}!mb
    return rv;
}

//{{{!mb
uuready("dom:2", function() {
    var cloned, evt, fired = 0, attr = "uuz", data = "data-uuz",
        body = doc.body, cloneNode = uuready.cloneNode, div = uunode(),
        onfire = function() {
            fired += 1;
        };

    div[_setAttribute](attr, "1"); // node.setAttribute("uuz", "1")
    div[data] = { ref: 1 };      // node["data-uuz"] = { ref: 1 }
    if (div[_addEventListener]) { // [GECKO][WEBKIT][OPERA][IE9]
        div[_addEventListener]("click", onfire, _false);
        cloned = div.cloneNode(_false);
        (evt = doc.createEvent("MouseEvents")).initEvent("click", _false, _true);
        cloned.dispatchEvent(evt); // fire
    } else if (div.attachEvent) { // [IE]
        body[_appendChild](div).attachEvent("onclick", onfire);
        body[_appendChild](cloned = div.cloneNode(_false)).fireEvent("onclick");
        body[_removeChild](cloned);
        body[_removeChild](div);
    }
    cloned[_setAttribute](attr, "2"); // clonedNode.setAttribute("uuz", "2")
    cloned[data] && (cloned[data].ref = 2); // clonedNode["data-uuz"].ref = 2

    cloneNode.attr  = div[_getAttribute](attr) === cloned[_getAttribute](attr);
    cloneNode.data  = (!!cloned[data] && (div[data].ref === cloned[data].ref));
    cloneNode.event = !!fired;
});
//}}}!mb

})(this, document, parseInt, parseFloat, this.getComputedStyle, this.JSON);

// === query.tokenizer, query.selector ===
// - query.selector() function limits
// -- unsupported Impossible rules ( :root:first-child, etc ) in W3C Test Suite - css3_id27a
// -- unsupported Impossible rules ( * html, * :root )        in W3C Test Suite - css3_id27b
// -- unsupported Case sensitivity '.cs P'                    in W3C Test Suite - css3_id181
// -- unsupported :not(), :not(*)                             in WebKit querySelectorAll()

//{{{!mb
uu.query.tokenizer || (function(doc, uu, _ie) {

uu.query.tokenizer = tokenizer;
uu.query.selector  = selector;

var _A_TAG          = 1,  // E               [_A_TAG,         "DIV"]
    _A_COMBINATOR   = 2,  // E > F           [_A_COMBINATOR,  ">", _A_TAG, "DIV"]
    _A_ID           = 3,  // #ID             [_A_ID,          "ID"]
    _A_CLASS        = 4,  // .CLASS          [_A_CLASS,       "CLASS"]
    _A_ATTR         = 5,  // [ATTR]          [_A_ATTR,        "ATTR"]
    _A_ATTR_VALUE   = 6,  // [ATTR="VALUE"]  [_A_ATTR_VALUE,  "ATTR", 1~6, "VALUE"]
    _A_PSEUDO       = 7,  // :target         [_A_PSEUDO,      1~29]
    _A_PSEUDO_NTH   = 8,  // :nth-child(...) [_A_PSEUDO_FUNC, 31~34, { a,b,k }]
    _A_PSEUDO_FUNC  = 9,  // :lang(...)      [_A_PSEUDO_FUNC, 35~99, arg]
    _A_PSEUDO_NOT   = 10, // :not(...)       [_A_PSEUDO_NOT,  _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ...]
    _A_GROUP        = 11, // E,F             [_A_GROUP]
    _A_QUICK_ID     = 12, // #ID             [_A_QUICK_ID,    true or false, "ID" or "CLASS"]
    _A_QUICK_EFG    = 13, // E,F or E,F,G    [_A_QUICK_EFG,   ["E", "F"] or ["E", "F", "G"]]
    _TOKEN_COMB     = /^\s*(?:([>+~])\s*)?(\*|\w*)/, // "E > F"  "E + F"  "E ~ F"  "E"  "E F" "*"
    _TOKEN_ATTR     = /^\[\s*(?:([^~\^$*|=!\s]+)\s*([~\^$*|!]?\=)\s*((["'])?.*?\4)|([^\]\s]+))\s*\]/,
    _TOKEN_NTH      = /^(?:(even|odd)|(1n\+0|n\+0|n)|(\d+)|(?:(-?\d*)n([+\-]?\d*)))$/,
    _TOKEN_OPERATOR = { "=": 1, "*=": 2, "^=": 3, "$=": 4, "~=": 5, "|=": 6, "!=": 7 },
    _TOKEN_KIND     = { "#": 1, ".": 2, "[": 3, ":": 4 }, // ]
    _TOKEN_NTH_1    = { a: 0, b: 1, k: 1 }, // nth-child(1)
    _TOKEN_GROUP    = /^\s*,\s*/, // (((
    _TOKEN_ERROR    = /^[>+~]|[>+~*]{2}|[>+~]$/,
    _TOKEN_IDENT    = /^[#\.]([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)/i, // #ID or .CLASS
    _TOKEN_PSEUDO   = { E: /^(\w+|\*)\s*\)/, END: /^\s*\)/, FUNC: /^\s*([\+\-\w]+)\s*\)/,
                        FIND: /^:([\w\-]+\(?)/, STR: /^\s*(["'])?(.*?)\1\)/ },
    _TOKEN_PSEUDO_LIST = {
        // pseudo
        "first-child":      1, "last-child":       2, "only-child":       3, // childFilter
        "first-of-type":    4, "last-of-type":     5, "only-of-type":     6, // nthTypeFilter
        hover:              7, focus:              8, active:             0, // actionFilter
        enabled:           10, disabled:          11, checked:           12, // formFilter
        link:              13, visited:           14,                        // otherFilter
        empty:             15, root:              16, target:            17, // otherFilter
        // pseudo functions
        "not(":            30,
        "nth-child(":      31, "nth-last-child(": 32,                        // nthFilter
        "nth-of-type(":    33, "nth-last-of-type(": 34,                      // nthTypeFilter
        "lang(":           35, "contains(":       36                         // otherFunctionFilter )))))))
    },
    _QUICK          = { E: /^\w+$/, ID: /^([#\.])([a-z_\-][\w\-]*)$/i, // #ID or .CLASS
                        EFG: /^(\w+)\s*,\s*(\w+)(?:\s*,\s*(\w+))?$/ }, // E,F[,G]
    _QUERY_COMB     = { ">": 1, "+": 2, "~": 3 },
    _QUERY_FORM     = /^(input|button|select|option|textarea)$/i,
    _QUERY_CASESENS = { title: 0, id: 0, name: 0, "class": 0, "for": 0 },
    _uuqid          = "data-uuqueryid",
    _uudoctype      = "data-uudoctype", // 1: XMLDocument, 2: HTMLDocument
    _nodeCount      = 0,
    _textContent    = _ie ? "innerText" : "textContent";

// uu.query.tokenizer
function tokenizer(expr) { // @param CSSSelectorExpressionString: "E > F"
                           // @return QueryTokenHash: { data, group, err, msg, expr }
                           //   data  - Array:   [_A_TOKEN, data, ...]
                           //   group - Number:  groups from 1
                           //   err   - Boolean: true is error
                           //   msg   - String:  error message
                           //   expr  - String:  expression
    var rv = { data: [], group: 1, err: false, msg: "", expr: expr = expr.trim() },
        data = rv.data, m, outer, inner;

    // --- QUICK PHASE ---
    (m = _QUICK.E.exec(expr))  ? (data.push(_A_TAG, m[0])) :
    (m = _QUICK.ID.exec(expr)) ? (data.push(_A_QUICK_ID, m[1] === "#", m[2])) :
    ((m = _QUICK.EFG.exec(expr)) && m[1] !== m[2] && m[1] !== m[3] && m[2] !== m[3])
                               ? (data.push(_A_QUICK_EFG, m[3] ? [m[1], m[2], m[3]]
                                                               : [m[1], m[2]])) :
    _TOKEN_ERROR.test(expr)    ? (rv.msg = expr) : 0;

    // --- GENERIC PHASE ---
    if (!data.length) {
        while (!rv.msg && expr && outer !== expr) { // outer loop
            m = _TOKEN_COMB.exec(outer = expr);
            if (m) {
                m[1] && data.push(_A_COMBINATOR, m[1]); // >+~
                        data.push(_A_TAG, m[2] || "*"); // "DIV" or "*"
                expr = expr.slice(m[0].length);
            }
            while (!rv.msg && expr && inner !== expr) { // inner loop
                expr = innerLoop(inner = expr, rv);
            }
            m = _TOKEN_GROUP.exec(expr);
            if (m) {
                ++rv.group;
                data.push(_A_GROUP);
                expr = expr.slice(m[0].length);
            }
        }
        expr && (rv.msg = expr); // remain
    }
    rv.msg && (rv.err = true);
    return rv;
}

// inner -
function innerLoop(expr, rv, not) {
    var data = rv.data, m, num, mm, anb, a, b, c;

    switch (_TOKEN_KIND[expr.charAt(0)] || 0) {
    case 1: (m = _TOKEN_IDENT.exec(expr)) && data.push(_A_ID,    m[1]); break;
    case 2: (m = _TOKEN_IDENT.exec(expr)) && data.push(_A_CLASS, m[1]); break;
    case 3: m = _TOKEN_ATTR.exec(expr); // [1]ATTR, [2]OPERATOR, [3]"VALUE" [5]ATTR
            if (m) {
                m[5] ? data.push(_A_ATTR, m[5])
                     : data.push(_A_ATTR_VALUE,
                                    m[1], num = _TOKEN_OPERATOR[m[2]], m[3]);
                m[5] || num || (rv.msg = m[0]);
                // [FIX] Attribute multivalue selector. css3_id7b.html
                //  <p title="hello world"></p> -> query('[title~="hello world"]') -> unmatch
                num === 5 && m[3].indexOf(" ") >= 0 && (rv.msg = m[0]);
            }
            break;
    case 4: m = _TOKEN_PSEUDO.FIND.exec(expr);
            if (m) {
                num = _TOKEN_PSEUDO_LIST[m[1]] || 0;
                if (!num) {
                    rv.msg || (rv.msg = m[0]);
                } else if (num < 30) {   // pseudo (30 is magic number)
                    // 4:first-of-type -> 33:nth-of-type(1)
                    // 5:last-of-type  -> 34:nth-last-of-type(1)
                    // 6:only-of-type  -> 33:nth-of-type(1) + 34:nth-last-of-type(1)
                    num === 4 ? data.push(_A_PSEUDO_NTH, 33, _TOKEN_NTH_1) :
                    num === 5 ? data.push(_A_PSEUDO_NTH, 34, _TOKEN_NTH_1) :
                    num === 6 ? data.push(_A_PSEUDO_NTH, 33, _TOKEN_NTH_1,
                                          _A_PSEUDO_NTH, 34, _TOKEN_NTH_1) :
                                data.push(_A_PSEUDO, num);
                } else if (num === 30) { // :not   (30 is magic number)
                    (not || expr === ":not()"
                         || expr === ":not(*)") && (rv.msg = ":not()");

                    if (!rv.msg) {
                        data.push(_A_PSEUDO_NOT);
                        expr = expr.slice(m[0].length);
                        m = _TOKEN_PSEUDO.E.exec(expr);
                        if (m) {
                            data.push(_A_TAG, m[1].toUpperCase()); // "DIV"
                        } else {
                            expr = innerLoop(expr, rv, 1); // :not(simple selector)
                            m = _TOKEN_PSEUDO.END.exec(expr);
                            m || rv.msg || (rv.msg = ":not()");
                        }
                    }
                } else { // pseudo nth-functions
                    data.push(num < 35 ? _A_PSEUDO_NTH : _A_PSEUDO_FUNC, num);
                    expr = expr.slice(m[0].length);
                    m = _TOKEN_PSEUDO.FUNC.exec(expr);
                    if (m) {
                        if (num < 35) {
                            mm = _TOKEN_NTH.exec(m[1]);
                            if (mm) {
                                if (mm[1]) { // :nth(even) or :nth(odd)
                                    anb = { a: 2, b: mm[1] === "odd" ? 1 : 0, k: 3 };
                                } else if (mm[2]) {
                                    anb = { a: 0, b: 0, k: 2, all: 1 }; // nth(1n+0), nth(n+0), nth(n)
                                } else if (mm[3]) {
                                    anb = { a: 0, b: parseInt(mm[3], 10), k: 1 }; // nth(1)
                                } else {
                                    a = (mm[4] === "-" ? -1 : mm[4] || 1) - 0;
                                    b = (mm[5] || 0) - 0;
                                    c = a < 2;
                                    anb = { a: c ? 0 : a, b: b, k: c ? a + 1 : 3 };
                                }
                            }
                            anb ? data.push(anb)  // pseudo function arg
                                : rv.msg ? 0 : (rv.msg = m[0]);
                        } else { // :lang
                            m ? data.push(m[1]) // pseudo function arg
                              : rv.msg ? 0 : (rv.msg = m[0]);
                        }
                    } else { // :contains
                        m = _TOKEN_PSEUDO.STR.exec(expr);
                        m ? data.push(m[2]) // pseudo function arg
                          : rv.msg ? 0 : (rv.msg = m[0]);
                    }
                }
            }
    }
    m && (expr = expr.slice(m[0].length));
    return expr;
}

// uu.query.selector
function selector(token,     // @param Hash: QueryTokenHash
                  context) { // @param Node: context
                             // @return NodeArray: [node, ...]
    var node = context.ownerDocument || doc, // owner node
        xmldoc = !((node[_uudoctype] ||
                   (node[_uudoctype] = (node.createElement("a").tagName ===
                                        node.createElement("A").tagName) ? 2 : 1)) - 1),
        ctx = [context], result = [], ary,
        lock, word, match, negate = 0, data = token.data,
        i = 0, iz = data.length, j, jz = 1, k, kz, r, ri,
        ident, nid, type, attr, ope, val, rex;

    for (; i < iz && jz; jz = ctx.length, ++i) {
        r = [], ri = -1, j = type = 0;

        switch (data[i]) {
        case _A_QUICK_ID:       // [_A_QUICK_ID, true or false, "ID" or "CLASS"]
            if (data[++i]) { // ID
                node = doc.getElementById(data[++i]);
                return node ? [node] : [];
            } // CLASS
            ary = context.getElementsByTagName("*");
            ident = " " + data[++i] + " ";
            for (jz = ary.length; j < jz; ++j) {
                node = ary[j];
                ((word = node.className) && ((" " + word + " ").indexOf(ident) >= 0))
                                         && (r[++ri] = node);
            }
            return r;
        case _A_QUICK_EFG:      // [_A_QUICK_EFG, ["E", "F"] or ["E", "F", "G"]]
            ary = data[++i];
            return uu.node.sort(
                        uu.tag(ary[0], context).concat(
                            uu.tag(ary[1], context),
                            ary[2] ? uu.tag(ary[2], context) : []))[0];
        case _A_COMBINATOR:     // [_A_COMBINATOR, ">", _A_TAG, "DIV"]
            type = _QUERY_COMB[data[++i]];
            ++i;
        case _A_TAG:            // [_A_TAG, "DIV"]
            ident = data[++i]; // "DIV" or "*"
            match = ident === "*";
            xmldoc || (ident = ident.toUpperCase());

            if (!type) { // TAG
                if (negate) {
                    for (; j < jz; ++j) {
                        node = ctx[j];
                        (node.tagName !== ident) && (r[++ri] = node);
                    }
                    ctx = r;
                    break;
                }
                for (lock = {}; j < jz; ++j) {
                    ary = ctx[j].getElementsByTagName(ident); // NodeList

                    for (k = 0, kz = ary.length; k < kz; ++k) {
                        node = ary[k];
                        if ((match && node.nodeType === 1) || node.tagName === ident) {
                            nid = node[_uuqid] || (node[_uuqid] = ++_nodeCount);
                            lock[nid] || (r[++ri] = node, lock[nid] = 1);
                        }
                    }
                }
            } else { // >+~
                for (lock = {}; j < jz; ++j) {
                    node = ctx[j][type < 2 ? "firstChild" : "nextSibling"];
                    for (; node; node = node.nextSibling) {
                        if (node.nodeType === 1) {
                            if (_ie && !node.tagName.indexOf("/")) { continue; } // fix #25
                            if (match || node.tagName === ident) {
                                if (type > 2) {
                                    nid = node[_uuqid] || (node[_uuqid] = ++_nodeCount);
                                    if (lock[nid]) { break; }
                                    lock[nid] = 1;
                                }
                                r[++ri] = node;
                            }
                            if (type === 2) { break; }
                        }
                    }
                }
            }
            ctx = r;
            break;
        case _A_ID:             // [_A_ID, "ID"]
            type = 1;
        case _A_CLASS:          // [_A_CLASS, "CLASS"]
            ident = type ? data[++i] : (" " + data[++i] + " "); // "ID" or " CLASS "
            for (; j < jz; ++j) {
                node = ctx[j];
                if (type) { // ID
                    word  = xmldoc ? node.id : (node.id || node.name); // XHTML is id only
                    match = word && word === ident;
                } else {    // CLASS
                    word  = node.className;
                    match = word && ((" " + word + " ").indexOf(ident) >= 0);
                }
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR:           // [_A_ATTR, "ATTR"]
            for (attr = data[++i]; j < jz; ++j) {
                node = ctx[j];
                match = _ie ? ((word = node.getAttributeNode(attr)) && word.specified)
                            : node.hasAttribute(attr);
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR_VALUE:     // [_A_ATTR_VALUE, "ATTR", "OPERATOR", "VALUE"]
            attr = data[++i];
            ope  = data[++i];
            val  = uu.trim.quote(data[++i]);
            uu.ready.getAttribute || (attr = uu.attr.fix[attr] || attr);
            switch (ope) {
            case 1: val = "^" + val + "$"; break;                 // [attr  = value]
            case 3: val = "^" + val;       break;                 // [attr ^= value]
            case 4: val =       val + "$"; break;                 // [attr $= value]
            case 5: val = "(?:^| )" + val + "(?:$| )"; break;     // [attr ~= value]
            case 6: val = "^" + val + "\\-|^" + val + "$"; break; // [attr |= value]
            case 7: negate = +!negate;                            // [attr != value]
            }
            rex = RegExp(val, attr in _QUERY_CASESENS ? "" : "i"); // ignore case
            for (; j < jz; ++j) {
                node = ctx[j];
                word = node.getAttribute(attr, 2);
                ((word && rex.test(word)) ^ negate) && (r[++ri] = node);
            }
            ope === 7 && (negate = +!negate); // restore
            ctx = r;
            break;
        case _A_PSEUDO:         // [_A_PSEUDO, 1~29]
            type = data[++i];
            ctx = (type < 4  ? childFilter
                 : type < 10 ? actionFilter
                 : type < 13 ? formFilter
                             : otherFilter)(ctx, j, jz, negate, type, xmldoc);
            break;
        case _A_PSEUDO_NTH:     // [_A_PSEUDO_FUNC, 31~34, { a,b,k }]
            type = data[++i];
            ctx = (type < 33 ? nthFilter
                             : nthTypeFilter)(ctx, j, jz, negate, type, data[++i], xmldoc);
            break;
        case _A_PSEUDO_FUNC:    // [_A_PSEUDO_FUNC, 31~99, arg]
            type = data[++i];
            ctx = otherFunctionFilter(ctx, j, jz, negate, type, data[++i]);
            break;
        case _A_PSEUDO_NOT:     // [_A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ...]
            negate = 2;
            break;
        case _A_GROUP:
            result.push(ctx);
            ctx = [context];
        }
        negate && --negate;
    }
    // --- mixin group ---
    iz = result.length;
    if (iz) {
        result.push(ctx);
        for (r = [], ri = -1, lock = {}, i = 0, ++iz; i < iz; ++i) {
            ctx = result[i];
            for (j = 0, jz = ctx.length; j < jz; ++j) {
                node = ctx[j];
                nid = node[_uuqid] || (node[_uuqid] = ++_nodeCount);
                lock[nid] || (r[++ri] = node, lock[nid] = 1);
            }
        }
        return uu.node.sort(r)[0]; // to document order
    }
    return ctx;
}

// inner - 1:first-child  2:last-child  3:only-child
function childFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, cn, found = 0;

    for (; j < jz; found = 0, ++j) {
        cn = node = ctx[j];
        if (ps & 1) { // first-child and only-child
            while (!found && (cn = cn.previousSibling)) {
                cn.nodeType === 1 && ++found;
            }
        }
        if (ps & 2) { // last-child and only-child
            cn = node;
            while (!found && (cn = cn.nextSibling)) {
                cn.nodeType === 1 && ++found;
            }
        }
        ((!found) ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 7:hover  8:focus  x:active
function actionFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, ok, cs,
        decl = _ie ? "ruby-align:center" : "outline:0 solid #000",
        ss = uu.css("uuquery2"); // get StyleSheet object

    // http://d.hatena.ne.jp/uupaa/20080928
    ss.add(ps < 8 ? ":hover" : ":focus", decl);

    for (; j < jz; ++j) {
        node = ctx[j];
        ok = _ie ? node.currentStyle.rubyAlign === "center" :
                   (cs = uu.css(node),
                    (cs.outlineWidth + cs.outlineStyle) === "0pxsolid");
        (ok ^ negate) && (rv[++ri] = node);
    }
    ss.clear();
    return rv;
}

// inner - 10:enabled  11:disabled  12:checked
function formFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, ok;

    for (; j < jz; ++j) {
        node = ctx[j];
        ok = (ps === 10) ? !node.disabled
           : (ps === 11) ? !!node.disabled : !!node.checked;
        _QUERY_FORM.test(node.tagName) ? ((ok ^ negate) && (rv[++ri] = node))
                                       : (negate && (rv[++ri] = node));
    }
    return rv;
}

// inner - 13:link  14:visited  15:empty  16:root  17:target
function otherFilter(ctx, j, jz, negate, ps, xmldoc) {
    var rv = [], ri = -1, node, cn, ok = 0, found, word, rex;

    switch (ps) {
    case 13: rex = /^(?:a|area)$/i; break;
    case 14: jz = 0; break;
    case 16: negate || (jz = 0, rv = [doc.html]); break;
    case 17: (word = location.hash.slice(1)) || (jz = 0);
    }

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 13: ok = rex.test(node.tagName) && !!node.href; break;
        case 15: found = 0;
                 for (cn = node.firstChild; !found && cn; cn = cn.nextSibling) {
                    cn.nodeType === 1 && ++found;
                 }
                 ok = !found && !node[_textContent]; break;
        case 16: ok = node !== doc.html; break;
        case 17: ok = xmldoc ? (node.id === word)
                             : ((node.id || node.name) === word);
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 31:nth-child  32:nth-last-child
function nthFilter(ctx, j, jz, negate, ps, anb, xmldoc) {
    if (anb.all) {
        return negate ? [] : ctx;
    }

    var rv = [], ri = -1, nid, lock = {},
        parent, cn, idx, ok, a = anb.a, b = anb.b, k = anb.k,
        iter1 = (ps === 32) ? "lastChild" : "firstChild",
        iter2 = (ps === 32) ? "previousSibling" : "nextSibling",
        tag = ctx[0].tagName;

    xmldoc || (tag = tag.toUpperCase());

    for (; j < jz; ++j) {
        parent = ctx[j].parentNode;
        nid = parent[_uuqid] || (parent[_uuqid] = ++_nodeCount);
        if (!lock[nid]) {
            lock[nid] = 1;
            for (idx = 0, cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === 1) {
                    ++idx;
                    ok = k === 1 ? (idx === b)
                       : k === 2 ? (idx >=  b)
                       : k === 3 ? (!((idx - b) % a) && (idx - b) / a >= 0)
                                 : (idx <=  b);
                    (ok ^ negate) && cn.tagName === tag && (rv[++ri] = cn);
                }
            }
        }
    }
    return rv;
}

// inner - 33:nth-of-type  34:nth-last-of-type
function nthTypeFilter(ctx, j, jz, negate, ps, anb) {
    (ps === 34) && ctx.reverse();

    var rv = [], ri = -1, node, tag, parent, parentnid, nid,
        idx, ok = 0, a = anb.a, b = anb.b, k = anb.k,
        tagdb = createTagDB(ctx, 0, jz, ps === 34);

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        tag = node.tagName;
        parent = node.parentNode;
        parentnid = parent[_uuqid] || (parent[_uuqid] = ++_nodeCount);
              nid =   node[_uuqid] || (  node[_uuqid] = ++_nodeCount);

        if (tagdb[parentnid][nid].tag === tag) {
            idx = tagdb[parentnid][nid].pos;
            ok = k === 1 ? (idx === b)
               : k === 2 ? (idx >=  b)
               : k === 3 ? (!((idx - b) % a) && (idx - b) / a >= 0)
                         : (idx <=  b);
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    (ps === 34) && rv.reverse(); // to document order
    return rv;
}

// tagdb = { parent-nodeid: { child-nodeid: { tag: "DIV", pos: 1 }, ... },
//           parent-nodeid: { child-nodeid: { tag: "DIV", pos: 1 }, ... }, ... }
// inner -
function createTagDB(ctx, j, jz, reverse) { // @param NodeArray:
                                            // @return Hash: tagdb
    var rv = {}, node, parent, parentnid, cn, nid, tagcount, tag, pos,
        iter1 = reverse ? "lastChild" : "firstChild",
        iter2 = reverse ? "previousSibling" : "nextSibling";

    for (; j < jz; ++j) {
        node = ctx[j];
        parent = ctx[j].parentNode;
        parentnid = parent[_uuqid] || (parent[_uuqid] = ++_nodeCount);

        if (!rv[parentnid]) {
            rv[parentnid] = {};
            tagcount = {}; // { "DIV": count }
            for (cn = parent[iter1]; cn; cn = cn[iter2]) {
                if (cn.nodeType === 1) {
                    tag = cn.tagName;
                    pos = tagcount[tag] ? ++tagcount[tag] : (tagcount[tag] = 1);

                    nid = cn[_uuqid] || (cn[_uuqid] = ++_nodeCount);
                    rv[parentnid][nid] = { tag: tag, pos: pos };
                }
            }
        }
    }
    return rv;
}

// inner - 35:lang  36:contains
function otherFunctionFilter(ctx, j, jz, negate, ps, arg) {
    var rv = [], ri = -1, ok = 0, node,
        rex = ps === 35 ? RegExp("^(" + arg + "$|" + arg + "-)", "i") : 0;

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 35: while (!node.getAttribute("lang") && (node = node.parentNode)) {}
                 ok = node && rex.test(node.getAttribute("lang")); break;
        case 36: ok = node[_textContent].indexOf(arg) >= 0;
        }
        (ok ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

})(document, uu, uu.ie);
//}}}!mb

