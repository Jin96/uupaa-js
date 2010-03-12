// === Core ===
//
// --- user configurations ---
//
//  window.xconfig = {
//      dir: ".",       // String(= "."): parts dir
//      aria: 0,        // Number(= 0): 1 is enable WAI-ARIA
//      debug: 0,       // Number(= 0): 1 is DebugMode
//      right: 0,       // Number(= 0): 1 is RightMode, 0 is QuickMode
//      altcss: 0,      // Function(= void 0): AltCSSMode callback
//      visited: 0,     // Number(= 0): 1 is enable uu.query(":visited")
//      innerText: 0    // Number(= 0): 1 is enable innerText, outerHTML(in Gecko)
//  };

// --- user callback functions ---
//ja    window以下に定義することで発動するユーザ定義関数の一覧
//
//  window.xwin(uu) - window.onload callback handler
//ja                    window.onloadイベント成立でコールバックする
//
//  window.xboot(uu) - DOMContentLoaded or window.onload callback handler
//ja                    DOMContentLoadedイベント成立でコールバックする
//
//  window.xcanvas(uu, canvasNodeList) - canvas ready callback handler
//ja                    <canvas>が利用可能になるとコールバックする,
//ja                    第二引数には全<canvas>のノードリストが渡される
//
//  window.xlocal(uu, backend) - WebStorage ready callback hander
//ja                    WebStorage相当の機能が利用可能になるとコールバックする,
//ja                    第二引数にはバックエンドを識別用の2～6の値が渡される
//
//  window.xtag(uu, node, buildid, nodeid) - uu.div(buildid) ..  callback handler
//ja                    ノードビルダー(uu.div() や uu.a() など)にビルドIDを指定するとノード生成時にコールバックする,
//ja                    第二引数には生成されたノード, 第三引数にはユーザが指定したビルドID,
//ja                    第四引数には生成されたノードのユニークなノードIDが渡される

// --- add global variable and functions ---
var uu; // window.uu - uupaa.js library namespace
        //ja uupaa.js ライブラリのネームスペース

// window.uue - createElement wrapper
function uue(tag) { // @param String(= "div"): tag name, "a", "p"
                    // @return Node: <div>
    return document.createElement(tag || "div");
}

// window.uunop - nop function
function uunop() { // @return undefined:
}

// --- main ---
uu ? ++uu.agein : (function(win, doc) {
var _cfg    = uuarg(win.xconfig || {}, { dir: ".", aria: 0, debug: 0, right: 0,
                                         visited: 0, innerText: 0 }),
    _ver    = _detectVersion(),
    _ie     = _ver.ie,
    _gecko  = _ver.gecko,
    _opera  = _ver.opera,
    _webkit = _ver.webkit,
    _html   = doc.getElementsByTagName("html")[0], // <html> alias
    _head   = doc.getElementsByTagName("head")[0], // <head> alias
    _TRIM   = /^\s+|\s+$/g,
    _QUOTE  = /^\s*["']?|["']?\s*$/g,
    _SPACES = /\s\s+/g,
    _PLACEH = /\?/g, // placeholder
    _TYPEOF = { "undefined":        0x020,
                "[object Boolean]": 0x040, "boolean":          0x040,
                "[object Number]":  0x100, "number":           0x100,
                "[object String]":  0x200, "string":           0x200,
                "[object Function]":0x080, "function":         0x080,
                "[object RegExp]":  0x800,
                "[object Array]":   0x400,
                "[object Date]":    0x008,
                "[object CSSStyleDeclaration]":         0x1000,   // [WebKit][Opera]
                "[object ComputedCSSStyleDeclaration]": 0x1000 }; // [Gecko]

// parts dir normalization("../img" -> "../img/")
_cfg.dir = _cfg.dir.replace(/\/+$/, "") + "/";

// --- library structure ---
uu = uumix(uujamfactory, {          // uu(expr, ctx) -> Instance(jam)
    agein:          0,              // uu.agein - library reloaded
    ver:      uumix(_ver, {         // uu.ver - version and plugin detection
        lib:        0.7             // uu.ver.lib    - Number: Library version
    }),                             // uu.ver.ua     - Number: User Agent version
                                    // uu.ver.render - Number: Rendering Engine version
                                    //                 (Firefox2: 1.81, Firefox3: 1.9, Firefox3.5: 1.91,
                                    //                  Safari3.1: 525, Safari4: 528)
                                    // uu.ver.silverlight - Number: Silverlight version(3 later)
                                    // uu.ver.flash  - Number: Flash version(7 later)
                                    // uu.ver.ie     - Boolean: true is IE6, IE7, IE8+
                                    // uu.ver.ie6    - Boolean: true is IE6
                                    // uu.ver.ie7    - Boolean: true is IE7
                                    // uu.ver.ie8    - Boolean: true is IE8 (exclude IE9)
                                    // uu.ver.ie67   - Boolean: true is IE67
                                    // uu.ver.ie678  - Boolean: true is IE678
                                    // uu.ver.opera  - Boolean: true is Opera
                                    // uu.ver.gecko  - Boolean: true is Gecko based browsers
                                    // uu.ver.webkit - Boolean: true is Safari, Google Chrome, iPhone, iPod
                                    // uu.ver.chrome - Boolean: true is Google Chrome
                                    // uu.ver.safari - Boolean: true is Safari, iPhone, iPod
                                    // uu.ver.iphone - Boolean: true is iPhone, iPod
                                    // uu.ver.quirks - Boolean: true is quirks mode
                                    // uu.ver.xml    - Boolean: true is XML Document, false is HTML Document
                                    // uu.ver.win    - Boolean: true is Windows OS
                                    // uu.ver.mac    - Boolean: true is Mac, Mac OS X
                                    // uu.ver.unix   - Boolean: true is Unix like OS, Linux, FreeBSD, SunOS
                                    // uu.ver.adv    - Boolean: true is Advanced browsers
                                    //                 (Firefox3.5+, Safari4+, Google Chrome2+, Opera10.50+)
                                    // uu.ver.major  - Boolean: true is Major/Majority browsers
                                    //                 (IE6+, Firefox3+, Safari3.1+, Google Chrome2+, Opera 9.5+)
                                    // uu.ver.jit    - Boolean: true is JIT browsers, Firefox3.5+, Google Chrome,
                                    //                                                Safari4+, Opera10.50+, IE9+
    config:         _cfg,           // uu.config - { aria, debug, right, ... }
    // --- plugin / plugin name space ---
    plugin:         uuplugin,       // uu.plugin() -> ["plugin-name", ...]
    // --- array / hash ---
    // [1][through]           uu.ary([1, 2])     -> [1, 2]
    // [2][literal to ary]    uu.ary(12)         -> [12]
    // [3][string to ary]     uu.ary("12")       -> ["12"]
    // [4][string to ary(no split)]
    //                        uu.ary("12,12", 0) -> ["12,12"]
    // [5][convert NodeList]  uu.ary(NodeList)   -> [elm, ...]
    // [6][convert arguments] uu.ary(arguments)  -> [elm, ...]
    // [7][string split(,)]   uu.ary("word,word") -> ["word", "word"]
    // [8][string split(;)]   uu.ary("word;word", ";") -> ["word", "word"]
    ary:      uumix(uuary, {
        has:        uuaryhas,       // [1][has array] uu.ary.has([1, 2, 3], 1, dence = 1) -> true
                                    // [2][has array] uu.ary.has([1, 2, 3], [1, 2], dence = 1) -> true
                                    // [3][has node]  uu.ary.has([<html>, <head>, <body>], <body>) -> true
                                    // [4][has node]  uu.ary.has([<html>, <head>, <body>], [<html>, <body>]) -> true
        each:       uuaryeach,      // uu.ary.each(ary, function(v, i) { ... }, dence = 1)
        sort:       uuarysort,      // [1][num 0-9]   uu.ary.sort([0,1,2], "0-9")   -> [0, 1, 2]
                                    // [2][num 9-0]   uu.ary.sort([0,1,2], "9-0")   -> [2, 1, 0]
                                    // [3][ascii a-z] uu.ary.sort(["a","z"], "A-Z") -> ["a", "z"]
                                    // [4][ascii a-z] uu.ary.sort(["a","z"], "Z-A") -> ["z", "a"]
                                    // [5][user func] uu.ary.sort(["a","z"], fn)    -> ["z", "a"]
        clean:      uuaryclean,     // uu.ary.clean([,,1,2,,]) -> [1, 2]
        unique:     uuaryunique,    // [1][unique elements] uu.ary.unique([<body>, <body>]) -> [<body>]
                                    // [2][unique literals] uu.ary.uniqye([0,1,2,1,0], 1) -> [0,1,2]
        indexOf:    uuaryindexof    // uu.ary.indexOf(ary, find, index = 0, dence = 1) -> Number
    }),
    // [1][through]      uu.hash({ key: "val" }) -> { key: "val" }
    // [2][pair to hash] uu.hash("key", mix)     -> { key: mix }
    // [3][split(,)]     uu.hash("key,a,key2,b")         -> { key:"a",key2:"b" }
    // [4][split(;)]     uu.hash("key;a;key2;b", ";", 0) -> { key:"a",key2:"b" }
    hash:     uumix(uuhash, {
        has:        uuhashhas,      // uu.hash.has({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 }) -> true
        nth:        uuhashnth,      // uu.hash.nth({ a: 1, b: 2 }, 1) -> ["b", 2]
        each:       uuhasheach,     // uu.hash.each(hash, fn)
        size:       uuhashsize,     // uu.hash.size(mix) -> Number(hash length)
        keys:       uuhashkeys,     // uu.hash.keys(mix) -> [key1, key2, ...]
        values:     uuhashvalues,   // uu.hash.values(mix) -> [value1, value2, ...]
        indexOf:    uuhashindexof,  // uu.hash.indexOf({a: 1, b: 2, c: 2}, 2) -> "b"
        combine:    uuhashcombine,  // [1][ary x ary] uu.hash.combine(["a","b"], [1,2]) -> { a: 1, b: 2 }
                                    // [2][ary x val] uu.hash.combine(["a","b"], 1)     -> { a: 1, b: 1 }
        hasValue:   uuhashhasvalue, // uu.hash.hasValue({ a: 1, b: 2 }, 2) -> true
        quickMap:   uuhashquickmap  // uu.hash.quickMap(seed, prefix = "", s2n, n2s)
    }),
    each:           uueach,         // [1][array.forEach] uu.each(ary, fn)
                                    // [2][hash.forEach]  uu.each(hash, fn)
    mix:            uumix,          // [1][override]     uu.mix({a:9, b:9}, {a:1}, {b:2}) -> base( {a:1, b:2} )
                                    // [2][not override] uu.mix({a:9, b:9}, {a:1}, {a:2}, 0) -> base( {a:9} )
                                    // [3][clone hash]   uu.mix({}, {a:1}) -> base( {a:1} )
    arg:            uuarg,          // [supply args] uu.arg({ a: 1 }, { b: 2 }) -> new Hash( { a: 1, b: 2 } )
    exp:            uuexp,          // [1][short code] uu.exp()      -> window.mix, window.ie
                                    // [2][add prefix] uu.exp("pfx") -> window.pfx_mix, window.pfx_ie
    // --- attribute ---
    // [1][get all  attrs] uu.attr(node) -> { all: attrs }
    // [2][get many attrs] uu.attr(node, 1) -> { many: attrs }
    // [3][get one  attr]  uu.attr(node, "attr") -> "value"
    // [4][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
    // [5][set one  attr]  uu.attr(node, "attr", "val") -> node
    // [6][set some attrs] uu.attr(node, { attr: "val" }) -> node
    attr:     uumix(uuattr, {
        get:        uuattrget,      // [1][get one  attr]  uu.attr.get(node, "attr") -> String
                                    // [2][get some attrs] uu.attr.get(node, "attr,...") -> Hash
        set:        uuattrset       // [1][set one  attr]  uu.attr.set(node, key, val ) -> node
                                    // [2][set some attrs] uu.attr.set(node, { key: val, ... }) -> node
    }),
    // --- css / style ---
    // [1][get all  computed styles] uu.css(node) -> { width: "100px", ... }
    // [2][get more computed styles] uu.css(node, 0x1) -> { width: "100px", ... }
    // [3][get some computed styles] uu.css(node, 0x2) -> { width: "100px", ... }
    // [4][get one  style]           uu.css(node, "color") -> "red"
    // [5][get some styles]          uu.css(node, "color,width") -> { color: "red", width: "20px" }
    // [6][set one  style]           uu.css(node, "color", "red") -> node
    // [7][set some styles]          uu.css(node, { color: "red" }) -> node
    css:      uumix(uucss, {
        get:        uucssget,       // [1][get one  style]  uu.css.get(node, "color") -> "red"
                                    // [2][get some styles] uu.css.get(node, "color,text-align") -> {color:"red", textAlign:"left"}
        set:        uucssset,       // [1][set one  style]  uu.css.set(node, "color", "red") -> node
                                    // [2][set some styles] uu.css.set(node, { color: "red" }) -> node
        opacity: uumix(uucsso, {    // [1][get] uu.css.opacity(node) -> Number(0.0~1.0)
                                    // [2][set] uu.css.opacity(node, opacity, diff = false) -> node
            get:    uucssoget,      // uu.css.opacity.get(node) -> Number(0.0~1.0)
            set:    uucssoset       // uu.css.opacity.set(node, opacity, diff = false) -> node
        })
    }),
    style:    uumix(uustyle, {      // uu.style(node, mode = 0) -> Hash(window.getComputedStyle or currentStyle)
        quick:      uustylequick    // uu.style.quick(node)     -> Hash(window.getComputedStyle or currentStyle)
    }),
    // --- query ---
    query:          uuquery,        // uu.query(expr, ctx = document) -> [node, ...]
    id:             uuid,           // uu.id(expr, ctx = document) -> node or null
    tag:            uutag,          // uu.tag(expr, ctx = document) -> [node, ...]
    // --- className(klass) ---
    klass:    uumix(uuklass, {      // [1][query className] uu.klass(expr, ctx = document) -> [node, ...]
        has:        uuklasshas,     // [1][has className] uu.klass.has(node, "class1 class2") -> Boolean
        add:        uuklassadd,     // [1][add className] uu.klass.add(node, "class1 class2") -> node
        sub:        uuklasssub,     // [1][sub className] uu.klass.sub(node, "class1 class2") -> node
        toggle:     uuklasstoggle   // [1][toggle className] uu.klass.toggle(node, "class1 class2") -> node
    }),
    // --- class(oop) / instance ---
    Class:    uumix(uuclass, {      // [1][no inheit] uu.Class("A",   { proto: ... })
                                    // [2][inherit]   uu.Class("B:A", { proto: ... })
        guid:       uuclassguid,    // uu.Class.guid() -> Number(instance guid)
        singleton:  uuclasssingleton // uu.Class.singleton("myclass", proto)
    }),
    // [1][create instance] uu.factory("my", arg1, ...) -> new uu.Class("my")
    // [2][define and create instance] uu.factory("my2", prototype, arg1, ...)
    //                                                  -> new uu.Class("my2")
    factory:        uufactory,
    // --- color ---
    color:    uumix(uucolor, {      // uu.color("black") -> ColorHash or 0
        add:        uucoloradd,     // uu.color.add("000000black,...")
        fix:        uucolorfix,     // uu.color.fix(ColorHash/RGBAHash) -> ColorHash
        expire:     uucolorexpire   // uu.color.expire()
    }),
    // --- event ---
    ev:       uumix(uuev, {         // uu.ev(node, "namespace.click", fn) -> node
        has:        uuevhas,        // uu.ev.has(node, "namespace.click") -> Boolean
        stop:       uuevstop,       // uu.ev.stop(event) -> event
        unbind:     uuevunbind,     // [1][unbind all]  uu.ev.unbind(node) -> node
                                    // [2][unbind some] uu.ev.unbind(node, "click+,dblclick") -> node
                                    // [3][unbind namespace all]  uu.ev.unbind(node, "namespace.*") -> node
                                    // [4][unbind namespace some] uu.ev.unbind(node, "namespace.click+,namespace.dblclick") -> node
        attach:     uuevattach,     // [protected] raw level api
        detach:     uuevdetach      // [protected] raw level api
    }),
    // --- event.ready ---
    ready:    uumix(uuready, {      // [1][DOM ready] uu.ready(fn, order = 0)
                                    //       order: 0 is low, 1 is mid, 2 is high(system)
        gone: {
            dom:        0,          // 1 is DOMContentLoaded event fired
            win:        0,          // 1 is window.onload event fired
            audio:      0,          // 1 is <audio> ready event fired
            canvas:     0,          // 1 is <canvas> ready event fired
            storage:    0,          // 1 is localStorage ready event fired
            blackout:   0           // 1 is blackout (css3 cache reload)
        }
    }),
    // --- node / node list / tag ---
    // [1][add to body] uu.node(uu.div()) -> <div>
    // [2][add to body] uu.node(uu.div(), doc.body) -> <div>
    // [3][add to context node] uu.node("<div><p>txt</p></div>", ctx) -> <div>
    node:     uumix(uunode, {
        has:        uunodehas,      // uu.node.has(node, ctx) -> Boolean
        bulk:       uunodebulk,     // [1][clone] uu.node.bulk(node) -> DocumentFragment
                                    // [2][build] uu.node.bulk("<p>html</p>") -> DocumentFragment
        swap:       uunodeswap,     // uu.node.swap(swapin, swapout) -> swapout node
        wrap:       uunodewrap,     // uu.node.wrap(node, wrapper) -> node
        clear:      uunodeclear,    // uu.node.clear(ctx) -> ctx
        remove:     uunoderemove    // uu.node.remove(node) -> node
    }),
    nodeid:   uumix(uunodeid, {     // uu.nodeid(node) -> nodeid
        toNode:     uunodeidtonode, // uu.nodeid.toNode(nodeid) -> node
        remove:     uunodeidremove  // uu.nodeid.remove(node) -> node
    }),
    // --- virtual node / node builder ---
    root:           doc.documentElement || _html, // root or <html> (IE quirks)
    html:           uuhtml,         // uu.html(node, attr, style, buildid) -> <html>
    head:           uuhead,         // uu.head(node, attr, style, buildid) -> <head>
    body:           uubody,         // uu.body(node, attr, style, buildid) -> <body>
    iebody:         0,              // [lazy detect] documentElement or <body> (IE quirks)
    // --- string ---
    // [1] uu.fix("-webkit-shadow")   -> "-webkit-shadow"
    // [2] uu.fix("background-color") -> "backgroundColor"
    // [3] uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
    // [4] uu.fix("for")              -> "htmlFor"
    fix:            uufix,
    fmt:            uufmt,          // uu.fmt("?-?", [1, 2]) -> "1-2"
    puff:           uupuff,         // uu.puff(mix) -> alert(...)
    esc:            uuesc,          // uu.esc('<a href="&">') -> '&lt;a href=&quot;&amp;&quot;&gt;'
    ucs2:           uuucs2,         // uu.ucs2("string", 0) -> "\u0073"
    unesc:          uuunesc,        // uu.unesc('&lt;a href=&quot;&amp;&quot;&gt;') -> '<a href="&">'
    unucs2:         uuunucs2,       // uu.unucs2("\\u0073\\u0074\\u0072\\u0069\\u006e\\u0067") -> "string"
    trim:     uumix(uutrim, {       // uu.trim(" A  B  C ") -> "A  B  C"
        tag:        uutrimtag,      // uu.trim.tag(" <h1>A</h1>  B  <p>C</p> ") -> "A B C"
        url:        uutrimurl,      // uu.trim.url('url("http://...")') -> "http://..."
        inner:      uutriminner,    // uu.trim.inner(" A  C  B ") -> "A B C"
        quote:      uutrimquote,    // uu.trim.quote(" 'has  space' ") -> "has  space"
        bracket:    uutrimbracket   // [trim <>, [], (), {}] uu.trim.bracket(" <bracket> ") -> "bracket"
    }),
    split:    uumix(uusplit, {      // uu.split(" A  B  C ") -> ["A", "B", "C"]
        comma:      uusplitcomma    // uu.split.comma(", ,,A,,B,C, ")->["A","B","C"]
    }),
    date2str:       uudate2str,     // [1][ISO8601 now]  uu.date2str()        -> "2000-01-01T00:00:00.000Z"
                                    // [2][ISO8601 date] uu.date2str(date)    -> "2000-01-01T00:00:00.000Z"
                                    // [3][RFC1123 now]  uu.date2str(0, 1)    -> "Wed, 16 Sep 2009 16:18:14 GMT"
                                    // [4][RFC1123 date] uu.date2str(date, 1) -> "Wed, 16 Sep 2009 16:18:14 GMT"
    str2date:       uustr2date,     // uu.str2date("2000-01-01T00:00:00[.000]Z") -> { valid, date }
    str2json:       uustr2json,     // uu.str2json(str, addQuote = 0) -> String
    json:     uumix(uujson, {       // uu.json(mix, nativeJSON = 0, callback = void 0) -> JSONString
        toMix:      uujsontomix     // uu.json.toMix(str, nativeJSON = 0) -> Mix
    }),
    // --- type ---
    has:            uuhas,          // [1] uu.has("abc", "a") -> true
                                    // [2] uu.has([1, 2], [1]) -> uu.ary.has
                                    // [3] uu.has({ a:1, b:2 }, { a:1 }) -> uu.hash.has
    like:           uulike,         // uu.like(mix, mix) -> Boolean
    type:     uumix(uutype, {       // [1] uu.type("str") -> 0x100(uu.type.STR)
                                    // [2] uu.type("str", uu.type.STR | uu.type.NUM) -> true
        HASH:       0x001,          // uu.type.HASH - Hash (Object)
        NODE:       0x002,          // uu.type.NODE - Node (HTMLElement)
        FAKE:       0x004,          // uu.type.FAKE - Fake (Arguments, NodeList, ...)
        DATE:       0x008,          // uu.type.DATE - Date
        NULL:       0x010,          // uu.type.NULL - null
        VOID:       0x020,          // uu.type.VOID - undefined (void 0)
        BOOL:       0x040,          // uu.type.BOOL - Boolean
        FUNC:       0x080,          // uu.type.FUNC - Function
        NUM:        0x100,          // uu.type.NUM  - Number
        STR:        0x200,          // uu.type.STR  - String
        ARY:        0x400,          // uu.type.ARY  - Array
        REX:        0x800           // uu.type.REX  - RegExp
//      CSSPROP:    0x1000          // uu.type.CSSPROP - CSS2Properties (window.getComputedStyle)
    }),
    isnum:          uuisnum,        // uu.isnum(123) -> true
    isstr:          uuisstr,        // uu.isstr("a") -> true
    isary:          uuisary,        // uu.isary([]) -> true
    isfunc:         uuisfunc,       // uu.isfunc(uunop) -> true
    // --- user agent (uu.ver.* alias) ---
    ie:             _ie,            // is IE
    ie6:            _ver.ie6,       // is IE6
    ie7:            _ver.ie7,       // is IE7
    ie8:            _ver.ie8,       // is IE8(ie8 mode)
    ie67:           _ver.ie67,      // is IE6 or IE7
    ie678:          _ver.ie678,     // is IE6 or IE7 or IE8
    opera:          _opera,         // is Opera
    gecko:          _gecko,         // is Gecko
    webkit:         _webkit,        // is WebKit
    // --- other ---
    js:             uujs,           // uu.js("js+expr") -> new Function("js+expr")
    win: {
        size:       uuwinsize       // uu.win.size() -> { iw, ih, sw, sh }
    },
    dmz:            {},             // uu.dmz - DeMilitarized Zone(proxy)
    date: {
        hash:       uudatehash      // uu.date.hash(new Date) -> { Y, M, D, h, m, s, ms }
    },
    guid:           uuguid,         // uu.guid() -> Number(unique)
    lazy:     uumix(uulazy, {       // uu.lazy(id, fn, order = 0)
                                    //         order: 0 is low, 1 is mid, 2 is high(system)
        fire:       uulazyfire      // uu.lazy.fire(id)
    })
});

// uu - uu.jam factory
function uujamfactory(expr, ctx) {
    return new uu.jam(expr, ctx); // depend: uu.jam.js
}

// --- MessagePump class ---
MessagePump.prototype = {
    send:           uumsgsend,      // [1][multicast] MessagePump.send([inst1, inst2], "hello") -> [result1, result2]
                                    // [2][unicast]   MessagePump.send(inst, "hello") -> ["world!"]
                                    // [3][broadcast] MessagePump.send(0, "hello") -> ["world!", ...]
    post:           uumsgpost,      // [1][multicast] MessagePump.post([instance, instance], "hello")
                                    // [2][unicast]   MessagePump.post(instance, "hello")
                                    // [3][broadcast] MessagePump.post(0, "hello")
    register:       uumsgregister,  // MessagePump.register(instance) -> this
    unregister:     uumsgunregister // MessagePump.unregister(instance) -> this
};
// uu.msg - MessagePump instance
uu.msg = new MessagePump();

// --- ECMAScript-262 5th ---
Array.isArray || (Array.isArray = uuisary);

//{{{!mb
uumix(Array.prototype, {
    indexOf:        arrayindexof,       //     indexOf(search, idx = 0) -> Number or -1
    lastIndexOf:    arraylastindexof,   // lastIndexOf(search, idx = 0) -> Number or -1
    every:          arrayevery,         //       every(fn, fn_this = void 0) -> Boolean
    some:           arraysome,          //        some(fn, fn_this = void 0) -> Boolean
    forEach:        arrayforeach,       //     forEach(fn, fn_this = void 0)
    map:            arraymap,           //         map(fn, fn_this = void 0) -> Array
    filter:         arrayfilter         //      filter(fn, fn_this = void 0) -> Array
}, 0, 0);
//}}}!mb

uumix(Array.prototype, {
    reduce:         arrayreduce,        //      reduce(fn, init = void 0) -> Mix
    reduceRight:    arrayreduceright    // reduceRight(fn, init = void 0) -> Mix
}, 0, 0);

uumix(Boolean.prototype, {
    toJSON:         numbertojson        //      toJSON() -> String
}, 0, 0);

uumix(Date.prototype, {
    toISOString:    datetoisostring,    // toISOString() -> String
    toJSON:         datetoisostring     //      toJSON() -> String
}, 0, 0);

uumix(Number.prototype, {
    toJSON:         numbertojson        //      toJSON() -> String
}, 0, 0);

uumix(String.prototype, {
    trim:           stringtrim,         //        trim(" space ") -> "space"
    toJSON:         stringtojson        //      toJSON() -> String
}, 0, 0);

//{{{!mb
_gecko && _cfg.innerText && !win.HTMLElement.prototype.innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innertextgetter);
    proto.__defineSetter__("innerText", innertextsetter);
    proto.__defineGetter__("outerHTML", outerhtmlgetter);
    proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(win.HTMLElement.prototype);
//}}}!mb

// --- plugin / plugin name space ---
// uu.plugin - enum plugins
function uuplugin() { // @return Array: ["plugin-name", ...]
    return uu.hash.keys(uuplugin);
}

// --- array / hash ---
// uu.ary - to array, convert array, split string
// [1][through]           uu.ary([1, 2])     -> [1, 2]
// [2][literal to ary]    uu.ary(12)         -> [12]
// [3][string to ary]     uu.ary("12")       -> ["12"]
// [4][string to ary(no split)]
//                        uu.ary("12,12", 0) -> ["12,12"]
// [5][convert NodeList]  uu.ary(NodeList)   -> [elm, ...]
// [6][convert arguments] uu.ary(arguments)  -> [elm, ...]
// [7][string split(,)]   uu.ary("word,word") -> ["word", "word"]
// [8][string split(;)]   uu.ary("word;word", ";") -> ["word", "word"]
function uuary(mix,     // @param Array/Mix/NodeList/Arguments/String:
               split) { // @param String(= ","): splitter, "" or 0 is no split
                        // @return Array:
    var type = uutype(mix), sp = split === void 0 ? "," : split,
        rv, i, iz;

    if (type === 0x004) { // uu.type.FAKE [5][6]
        for (rv = [], i = 0, iz = mix.length; i < iz; ++i) {
            rv[i] = mix[i];
        }
        return rv;
    }
    return (type === 0x400) ? mix // uu.type.ARY [1]
         : (type === 0x200 && sp) ? mix.split(sp) // uu.type.STR [7][8]
         : [mix]; // [2][3][4]
}

// uu.ary.has - has array
// [1][has array] uu.ary.has([1, 2, 3], 1, dence = 1) -> true
// [2][has array] uu.ary.has([1, 2, 3], [1, 2], dence = 1) -> true
// [3][has node]  uu.ary.has([<html>, <head>, <body>], <body>) -> true
// [4][has node]  uu.ary.has([<html>, <head>, <body>], [<html>, <body>]) -> true
function uuaryhas(ctx,     // @param Array: context
                  ary,     // @param Array/Mix: search element(s)
                  dence) { // @param Number(= 1): 0 is Space Array(slowly)
                           //                     1 is Dence Array(quickly)
                           // @return Boolean:
    if (ary === void 0) { // [IE, Fx2,Fx3] exclude undefined value
        return false;     // http://d.hatena.ne.jp/uupaa/20091022
    }
    dence = dence === void 0 ? 1 : dence;
    var a = uuary(ary), i = 0, iz = a.length;

    for (; i < iz; ++i) {
        if ((dence || i in a) && uuaryindexof(ctx, a[i]) < 0) {
            return false;
        }
    }
    return true;
}

// uu.ary.each - quick Array.prototype.forEach
function uuaryeach(ary,     // @param Array:
                   fn,      // @param Function: callback
                   dence) { // @param Number(= 1): 0 is Space Array(slowly)
                            //                     1 is Dence Array(quickly)
    dence = dence === void 0 ? 1 : dence;
    for (var i = 0, iz = ary.length; i < iz; ++i) {
        (dence || i in ary) && fn(ary[i], i); // fn(value, index)
    }
}

// uu.ary.sort
// [1][num 0-9]   uu.ary.sort([0,1,2], "0-9")   -> [0, 1, 2]
// [2][num 9-0]   uu.ary.sort([0,1,2], "9-0")   -> [2, 1, 0]
// [3][ascii a-z] uu.ary.sort(["a","z"], "A-Z") -> ["a", "z"]
// [4][ascii a-z] uu.ary.sort(["a","z"], "Z-A") -> ["z", "a"]
// [5][user func] uu.ary.sort(["a","z"], fn)    -> ["z", "a"]
function uuarysort(ary,    // @param Array:
                   type) { // @param String/Function(= "0-9"):
                           //                   sort type or callback
    function _numericsort(a, b) {
        return a - b;
    }
    switch (type || "0-9") {
    case "0-9": ary.sort(_numericsort); break;           // [1]
    case "9-0": ary.sort(_numericsort).reverse(); break; // [2]
    case "A-Z": ary.sort(); break;                       // [3]
    case "Z-A": ary.sort().reverse(); break;             // [4]
    default:    ary.sort(type);                          // [5]
    }
    return ary;
}

// uu.ary.clean - array compaction, trim null and void 0 elements
function uuaryclean(ary) { // @param Array: source
                           // @return Array:
    for (var rv = [], i = 0, iz = ary.length; i < iz; ++i) {
        i in ary && ary[i] != null && rv.push(ary[i]); // [!=] !== null && !== void 0
    }
    return rv;
}

// uu.ary.unique - make array from unique element( trim null and void 0 elements)
// [1][unique elements] uu.ary.unique([<body>, <body>]) -> [<body>]
// [2][unique literals] uu.ary.uniqye([0,1,2,1,0], 1) -> [0,1,2]
function uuaryunique(ary,       // @param Array: source
                     literal) { // @param Number(= 0):
                                //          0 is Mix,
                                //          1 is literal(NUM, STR, BOOL) only
                                // @return Array:
    var rv = [], ri = -1, v, i = 0, j, iz = ary.length, f, unq = {};

    for (; i < iz; ++i) {
        v = ary[i];
        if (v != null) { // [!=] !== null && !== void 0
            if (literal) { // [2]
                unq[v] || (unq[v] = 1, rv[++ri] = v);
            } else { // [1]
                for (f = 0, j = i - 1; !f && j >= 0; --j) {
                    f = (v === ary[j]);
                }
                !f && (rv[++ri] = v);
            }
        }
    }
    return rv;
}

// uu.ary.indexOf - tiny Array.prototype.indexOf
function uuaryindexof(ary,     // @param Array:
                      find,    // @param Mix:
                      index,   // @param Number(= 0):
                      dence) { // @param Number(= 1): 0 is Space Array(slowly)
                               //                     1 is Dence Array(quickly)
                               // @return Number: 0~  or  -1(not found)
    dence = dence === void 0 ? 1 : dence;
    var iz = ary.length, i = index || 0;

    i = (i < 0) ? i + iz : i;
    for (; i < iz; ++i) {
        if ((dence || i in ary) && ary[i] === find) { // [OPTIMIZED]
            return i;
        }
    }
    return -1;
}

// uu.hash - make hash from key value pair
// [1][through]      uu.hash({ key: "val" }) -> { key: "val" }
// [2][pair to hash] uu.hash("key", mix)     -> { key: mix }
// [3][split(,)]     uu.hash("key,a,key2,b")         -> { key:"a",key2:"b" }
// [4][split(;)]     uu.hash("key;a;key2;b", ";", 0) -> { key:"a",key2:"b" }
function uuhash(key,    // @param String/Hash: key
                value,  // @param Mix(= void 0 or ","): value or splitter
                type) { // @param Number(= void 0): value type,
                        //                          0 is string, 1 is number
                        // @return Hash: { key: value, ... }
    var rv = {}, i = 0, iz, v, ary, num, split = 0;

    if (type !== v) { // [4]
        ++split;
    } else if (value !== v) { // [2]
        rv[key] = value;
    } else if (typeof key === "string") { // [3]
        ++split;
    } else { // [1]
        rv = key;
    }
    if (split) {
        ary = key.split(value || ","); // default splitter = ","
        num = type === 1;
        for (iz = ary.length; i < iz; i += 2) {
            rv[ary[i]] = num ? +(ary[i + 1]) : ary[i + 1]; // to number
        }
    }
    return rv;
}
// dd2num = { "00":   0 , ... "99":  99  }; Zero-filled dec string -> Number
// num2dd = {    0: "00", ...   99: "99" }; Number -> Zero-filled dec string
uuhashquickmap("0123456789",       "", uuhash._dd2num = {}, uuhash._num2dd = {});

// hh2num = { "00":   0 , ... "ff": 255  }; Zero-filled hex string -> Number
// num2hh = {    0: "00", ...  255: "ff" }; Number -> Zero-filled hex string
uuhashquickmap("0123456789abcdef", "", uuhash._hh2num = {}, uuhash._num2hh = {});

// uu.hash.has - has Hash
function uuhashhas(ctx,    // @param Hash: context
                   find) { // @param Hash: find { key, value, ... }
                           // @return Boolean:
    var v, w, i;

    for (i in find) {
        v = find[i], w = ctx[i];
        if (!(i in ctx) // key not found
            || (v !== w && _jsoninspect(v) !== _jsoninspect(w))) { // match JSON
            return false;
        }
    }
    return true;
}

// uu.hash.nth - nth pair
function uuhashnth(hash,  // @param Hash: { a: 1, b: 2 }
                   nth) { // @param Number: 1
                          // @return Array: ["b", 2], [] (not found)
    var i, j = -1;

    for (i in hash) {
        if (++j === nth) {
            return [i, hash[i]];
        }
    }
    return [];
}

// uu.hash.each - Hash forEach
function uuhasheach(hash, // @param Hash:
                    fn) { // @param Function: callback
    for (var i in hash) {
        fn(hash[i], i); // fn(value, index)
    }
}

// uu.hash.size - get hash length
function uuhashsize(mix) { // @param Array/Hash:
                           // @return Number:
    return (Array.isArray(mix) ? mix : uuhashkeys(mix)).length;
}

// uu.hash.keys - enum hash keys
function uuhashkeys(mix,    // @param Array/Hash:
                    _val) { // @hidden Boolean(= false): true is enum values
                            // @return Array: [key, ... ]
    var rv = [], ri = -1, i, iz;

    if (Array.isArray(mix)) {
        for (i = 0, iz = mix.length; i < iz; ++i) {
            i in mix && (rv[++ri] = _val ? mix[i] : i);
        }
    } else {
        if (!_val && Object.keys) {
            return Object.keys(mix);
        }
        for (i in mix) {
            mix.hasOwnProperty(i) && (rv[++ri] = _val ? mix[i] : i);
        }
    }
    return rv;
}

// uu.hash.values - enum hash values
function uuhashvalues(mix) { // @param Array/Hash:
                             // @return Array: [value, ... ]
    return uuhashkeys(mix, 1);
}

// uu.hash.indexOf - find first key from value
function uuhashindexof(hash,    // @param Hash:
                       value) { // @param Mix: find value
                                // @return String/void 0: "found-key" or void 0
    for (var i in hash){
        if (hash.hasOwnProperty(i) && hash[i] === value) {
            return i;
        }
    }
    return void 0;
}

// uu.hash.combine - make { key: value } pair from array
// [1][ary x ary] uu.hash.combine(["a","b"], [1,2]) -> { a: 1, b: 2 }
// [2][ary x val] uu.hash.combine(["a","b"], 1)     -> { a: 1, b: 1 }
function uuhashcombine(keyary,     // @param Array: key array
                       valary,     // @param Array/Mix: value array or a value
                       toNumber) { // @param Number(= 0): 1 is numeric value
                                   // @return Hash: { key: value, ... }
    var rv = {}, i = 0, iz = keyary.length, val;

    if (Array.isArray(valary)) {
        for (; i < iz; ++i) {
            rv[keyary[i]] = toNumber ? +(valary[i]) : valary[i];
        }
    } else {
        val = toNumber ? +(valary) : valary;
        for (; i < iz; ++i) {
            rv[keyary[i]] = val;
        }
    }
    return rv;
}

// uu.hash.hasValue - has value
function uuhashhasvalue(hash,    // @param Hash:
                        value) { // @param Mix: find value
                                 // @return Boolean:
    return uuhashindexof(hash, value) !== void 0;
}

// uu.hash.quickMap - build String <-> Number mapping table
function uuhashquickmap(seed,   // @param String: "0123456789" or "0123456789abcdef"
                        prefix, // @param String(= ""): prefix
                        s2n,    // @param Hash: String to Number
                        n2s) {  // @param Hash: Number to String
    prefix = prefix || "";

    var i = 0, j, k = -1, v, ary = seed.split(""), iz = ary.length;

    for (; i < iz; ++i) {
        for (j = 0; j < iz; ++j) {
            v = prefix + ary[i] + ary[j];
            s2n[v] = ++k; // { "00": 0, "01": 1, ... "ff": 255  }
            n2s[k] = v;   // {    0: 0,    1: 1, ...  255: "ff" }
        }
    }
}

// uu.each - Hash forEach, tiny Array.prototype.forEach
function uueach(mix,  // @param Hash/Array:
                fn) { // @param Function: callback
    (Array.isArray(mix) ? uuaryeach : uuhasheach)(mix, fn);
}

// uu.mix - mixin
// [1][override]     uu.mix({a:9, b:9}, {a:1}, {b:2}) -> base( {a:1, b:2} )
// [2][not override] uu.mix({a:9, b:9}, {a:1}, {a:2}, 0) -> base( {a:9} )
// [3][clone hash]   uu.mix({}, {a:1}) -> base( {a:1} )
function uumix(base,       // @param Hash: mixin base
               flavor,     // @param Hash: add flavor
               aroma,      // @param Hash(= void 0): add aroma
               override) { // @param Number(= 1): 1 is override
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

// uu.arg - supply default arguments
// uu.arg({ a: 1 }, { b: 2 }) -> new Hash( { a: 1, b: 2 } )
function uuarg(arg1,   // @param Hash: arg1
               arg2,   // @param Hash: arg2
               arg3) { // @param Hash(= void 0): arg3
                       // @return Hash: new Hash(mixed arg)
    return uumix(uumix({}, arg1), arg2, arg3, 0);
}

// uu.exp - create alias, export scope, explosion!
// [1][short code] uu.exp()           -> window.mix, window.ie
// [2][add prefix] uu.exp("pfx")      -> window.pfx_mix, window.pfx_ie
// [3][add suffix] uu.exp("", "_sfx") -> window.mix_sfx, window.ie_sfx
function uuexp(prefix,   // @param String(= ""):
               suffix) { // @param String(= ""):
    prefix = prefix || "";
    suffix = suffix || "";
    var v, p;

    for (p in uu) {
        v = prefix + p + suffix;
        v in win || (win[v] = uu[p]); // not override (eg: window.opera)
    }
}

// --- attribute ---
// uu.attr - attribute accessor
// [1][get all  attrs] uu.attr(node) -> { all: attrs }
// [2][get many attrs] uu.attr(node, 1) -> { many: attrs }
// [3][get one  attr]  uu.attr(node, "attr") -> "value"
// [4][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
// [5][set one  attr]  uu.attr(node, "attr", "val") -> node
// [6][set some attrs] uu.attr(node, { attr: "val" }) -> node
function uuattr(node,   // @param Node:
                mix1,   // @param JointString/Hash/Number(= void 0): key
                mix2) { // @param String(= void 0): value
                        // @return String/Hash/Node:
    if (!mix1 || mix1 === 1) { // [1][2]
        var rv = {}, ary = node.attributes, v, w, i = -1;

        while ( (v = ary[++i]) ) {
            w = v.name;
            if (!mix1) {
                rv[w] = v.value;
            } else if (v.specified && w !== "style" && w.indexOf("uu")) {
                rv[w] = v.value;
            }
        }
        return rv;
    }
    return ((mix2 === void 0 && uuisstr(mix1)) ? uuattrget // [3][4]
                                               : uuattrset)(node, mix1, mix2); // [5][6]
}
uuattr._hash = uuhash(!_ver.ie67 ? "for,htmlFor,className,class" :
                      ("class,className,for,htmlFor,colspan,colSpan," +
                       "accesskey,accessKey,rowspan,rowSpan,tabindex,tabIndex"));

// uu.attr.get - get attribute
// [1][get one  attr]  uu.attr.get(node, "attr") -> String
// [2][get some attrs] uu.attr.get(node, "attr,...") -> Hash
function uuattrget(node,    // @param Node:
                   attrs) { // @param JointString: "attr1,..."
                            // @return String/Hash: "value" (one attr)
                            //                   or { attr1: "value", ... }
    var rv = {}, ary = attrs.split(","), v, w, i = 0, iz = ary.length,
        ie8 = _ver.ie8, hash = uuattr._hash,
        IEFIX = { href: 1, src: 1 }; // [IE6][IE7][FIX] a[href^="#"] -> full path

    for (; i < iz; ++i) {
        v = ary[i];
        w = hash[v] || v;
        rv[v] = (_ie ? ((ie8 || IEFIX[v]) ? node.getAttribute(v, 2) : node[w])
                     : node.getAttribute(w)) || "";
    }
    return (ary.length === 1) ? rv[ary[0]] : rv; // [3][4]
}

// uu.attr.set - set attribute
// [1][set one  attr]  uu.attr.set(node, key, val ) -> node
// [2][set some attrs] uu.attr.set(node, { key: val, ... }) -> node
function uuattrset(node,  // @param Node:
                   key,   // @param String/Hash: key
                   val) { // @param String(= void 0): value
                          // @return Node:
    var hash, i, _hash = uuattr._hash;

    uuisstr(key) ? (hash = {}, hash[key] = val) : (hash = key);
    for (i in hash) {
        node.setAttribute(_hash[i] || i, hash[i]);
    }
    return node;
}

// --- css / style ---
// uu.css - css accessor
// [1][get all  computed styles] uu.css(node) -> { width: "100px", ... }
// [2][get more computed styles] uu.css(node, 0x1) -> { width: "100px", ... }
// [3][get some computed styles] uu.css(node, 0x2) -> { width: "100px", ... }
// [4][get one  style]           uu.css(node, "color") -> "red"
// [5][get some styles]          uu.css(node, "color,width") -> { color: "red", width: "20px" }
// [6][set one  style]           uu.css(node, "color", "red") -> node
// [7][set some styles]          uu.css(node, { color: "red" }) -> node
function uucss(node, a, b) { // @return String/Hash/CSS2Properties/Node:
    if (!a || typeof a === "number") {
        return uustyle(node, a || 0); // [1][2][3]
    }
    return ((b === void 0 && uuisstr(a)) ? uucssget // [4][5]
                                         : uucssset)(node, a, b); // [6][7]
}

// uu.css.get - get getComputedStyle(node) value
// [1][get one  style]  uu.css.get(node, "color") -> "red"
// [2][get some styles] uu.css.get(node, "color,text-align") -> {color:"red", textAlign:"left"}
function uucssget(node,     // @param Node:
                  styles) { // @param JointString: "css-prop,cssProp..."
                            // @return String/Hash: "value"
                            //                   or { cssProp: "value", ... }
    var rv = {}, ary = styles.split(","), v, i = -1,
        ns = uucss(node), fixdb = uufix._db;

    while ( (v = ary[++i]) ) {
        rv[v] = ns[fixdb[v] || v] || "";
    }
    return (ary.length === 1) ? rv[ary[0]] : rv;
}

// uu.css.set
// [1][set one  style]  uu.css.set(node, "color", "red") -> node
// [2][set some styles] uu.css.set(node, { color: "red" }) -> node
function uucssset(node,  // @param Node:
                  key,   // @param String/Hash:
                  val) { // @param String(= void 0):
                         // @return Node:
    var hash = uuhash(key, val), ns = node.style, p, v, i, n,
        fixdb = uufix._db, hook = uucssset._hook;

    for (i in hash) {
        v = hash[i];
        p = fixdb[i] || i;
        if (typeof v === "string") {
            ns[p] = v; // backgroundColor="transparent"
        } else {
            n = hook[p];
            if (n === 2) {
                uucssoset(node, v);
            } else {
                ns[p] = n ? v : (v + "px"); // zoom = 1, width = 100 + "px"
            }
        }
    }
    return node;
}
uucssset._hook = { opacity: 2, lineHeight: 1, fontWeight: 1,
                   fontSizeAdjust: 1, zIndex: 1, zoom: 1 };

// uu.css.opacity
// [1][get] uu.css.opacity(node) -> Number(0.0~1.0)
// [2][set] uu.css.opacity(node, opacity, diff = false) -> node
function uucsso(node,    // @param Node:
                opacity, // @param Number(= void 0): 0.0~1.0
                diff) {  // @param Boolean(= false):
                         // @return Number/Node:
    return (opacity === void 0 ? uucssoget : uucssoset)(node, opacity, diff);
}

// uu.css.opacity.get - get opacity value(from 0.0 to 1.0)
function uucssoget(node) { // @param Node:
                           // @return Number: float(from 0.0 to 1.0)
    if (_ie) {
        var v = node.uucsso; // undefined or 1.0 ~ 2.0

        return v === void 0 ? 1 : (v - 1);
    }
    return parseFloat(node.style.opacity ||
                      win.getComputedStyle(node, null).opacity);
}

// uu.css.opacity.set - set opacity value(from 0.0 to 1.0)
function uucssoset(node,   // @param Node:
                   val,    // @param Number: opacity, float(from 0.0 to 1.0)
                   diff) { // @param Boolean(= false):
                           // @return Node:
    var ns;

    if (uu.ie678) {
        ns = node.style;
        if (node.uucsso === void 0) { // init
            if (uu.ie67) { // [FIX][IE]
                if ((node.currentStyle || {}).width === "auto") {
                    ns.zoom = 1;
                }
            }
        }
    }
    diff && (val += uucssoget(node));

    // normalize
    val = (val > 0.999) ? 1
        : (val < 0.001) ? 0 : val;
    node.style.opacity = val;

    if (uu.ie678) {
        node.uucsso = val + 1; // (1.0 ~ 2.0)
        ns.visibility = val ? "" : "hidden";
        ns.filter = ((val > 0 && val < 1)
                  ? "alpha(val=" + (val * 100) + ") " : "")
                  + ns.filter.replace(uucssoset._alpha, "");
    }
    return node;
}
uucssoset._alpha = /^alpha\([^\x29]+\) ?/;

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
    if (uu.ie678) {
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
            dig = uustyle, box = dig._hash.box, unit = dig._unit, mod = dig._mod,
            em, rect, ut, v, w, x, i = -1, j = -1, m1, m2,
            ary = !mode ? dig._hash.full : (mode === 1) ? dig._hash.more : 0,
            stock = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                      thin: "1px", medium: "3px", thick: dig._thick };

        if (ary) {
            while ( (w = ary[++j]) ) {
                rv[w] = cs[w];
            }
        }

        em = parseFloat(cs.fontSize) * (dig._pt.test(cs.fontSize) ? 4 / 3 : 1);
        rect = node.getBoundingClientRect();

        // calc border, padding and margin size
        while ( (w = box[++i]) ) {
            v = cs[w];
            if (!(v in stock)) {
                x = v;
                switch (ut = unit[v.slice(-1)]) {
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
        for (w in mod) {
            v = cs[w];
            switch (ut = unit[v.slice(-1)]) {
            case 1: v = parseFloat(v) * em; break;    // "12em"
            case 2: v = parseFloat(v) * 4 / 3; break; // "12pt"
            case 3: // %, auto
                switch (mod[w]) {
                case 1: v = node.offsetTop; break;  // style.top
                case 2: v = node.offsetLeft; break; // style.left
                case 3: v = (node.offsetWidth  || rect.right - rect.left) // style.width
                          - parseInt(rv.borderLeftWidth) - parseInt(rv.borderRightWidth)
                          - parseInt(rv.paddingLeft) - parseInt(rv.paddingRight);
                        v = v > 0 ? v : 0;
                        break;
                case 4: v = (node.offsetHeight || rect.bottom - rect.top) // style.height
                          - parseInt(rv.borderTopWidth) - parseInt(rv.borderBottomWidth)
                          - parseInt(rv.paddingTop) - parseInt(rv.paddingBottom);
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
uustyle._pt = /pt$/;
uustyle._mod = { top: 1, left: 2, width: 3, height: 4 };
uustyle._unit = { m: 1, t: 2, "%": 3, o: 3 }; // em, pt, %, auto
uustyle._hash = uu.ie678 ? _builduustylehash() : {};
uustyle._thick = uu.ie8 ? "5px" : "6px";
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
        cs = doc.getElementsByTagName("html")[0].currentStyle;

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
                    classNames) { // @param JointString: "class1 class2 ..."
                                  // @return Boolean:
    var m, ary, cn = node.className;

    if (!classNames || !cn) {
        return false;
    }
    if (classNames.indexOf(" ") < 0) {
        return (" " + cn + " ").indexOf(" " + classNames + " ") >= 0; // single
    }
    ary = uusplit(classNames); // multi
    m = cn.match(_matcher(ary));
    return m && m.length >= ary.length;
}

// uu.klass.add - add className
// [1][add className] uu.klass.add(node, "class1 class2") -> node
function uuklassadd(node,         // @param Node:
                    classNames) { // @param JointString: "class1 class2 ..."
                                  // @return Node:
    node.className += " " + classNames; // [OPTIMIZED] // uutriminner()
    return node;
}

// uu.klass.sub - remove className
// [1][sub className] uu.klass.sub(node, "class1 class2") -> node
function uuklasssub(node,         // @param Node:
                    classNames) { // @param JointString(= ""): "class1 class2 ..."
                                  // @return Node:
    node.className =
        uutriminner(node.className.replace(_matcher(uusplit(classNames)), ""));
    return node;
}

// uu.klass.toggle - toggle(add / sub) className property
function uuklasstoggle(node,         // @param Node:
                       classNames) { // @param JointString: "class1 class2 ..."
                                     // @return Node:
    (uuklasshas(node, classNames) ? uuklasssub : uuklassadd)(node, classNames);
    return node;
}

// --- Class / Instance ---
// uu.Class - create a generic class
// [1][no inheit] uu.Class("A",   { proto: ... })
// [2][inherit]   uu.Class("B:A", { proto: ... })
function uuclass(className, // @param String: "Class"
                            //             or "Class:SuperClass"
                            //             or "Class<SuperClass"
                 proto) {   // @param Hash(= void 0): prototype object
    // http://d.hatena.ne.jp/uupaa/20100129
    var ary = className.split(/\s*[\x3a-\x40]\s*/), tmp, i,
        Class = ary[0], Super = ary[1] || "";

    uuclass[Class] = function uuClass() {
        var lv3 = this,
            lv2 = lv3.superClass || 0,
            lv1 = lv2 ? lv2.superClass : 0;

        uuclassguid(lv3);
        lv3.msgbox || (lv3.msgbox = uunop);
        uu.msg.register(lv3);

        // constructor(lv1 -> lv2 -> lv3)
        lv1 && lv1.init && lv1.init.apply(lv3, arguments);
        lv2 && lv2.init && lv2.init.apply(lv3, arguments);
               lv3.init && lv3.init.apply(lv3, arguments);

        // destructor(~lv3 -> ~lv2 -> ~lv1)
        lv3["~fin"] = lv3.fin || uunop;
        lv3.fin && uuevattach(win, "unload", function() {
            lv3.fin && lv3.fin();
        });
        lv3.fin = function wrapper() {
            lv3["~fin"]();
            lv2 && lv2.fin && lv2.fin.call(lv3);
            lv1 && lv1.fin && lv1.fin.call(lv3);

            // destroy them all
            for (var i in lv3) {
                lv3[i] = null;
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

    function superMethod(from,             // @param Function: caller
                         method            // @param String: method name
                         /* var_args */) { // @param Mix: args
        var obj = this.superClass;

        // recurtion guard
        if (from === obj[method] || superMethod.caller === obj[method]) {
            obj = obj.superClass;
        }
        return obj[method].apply(this, uu.ary(arguments).slice(2));
    }
}

// uu.Class.guid - get instance id
function uuclassguid(instance) { // @param Instance:
                                 // @return Number: instance id, from 1
    return instance.uuguid || (instance.uuguid = uu.guid());
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(className, // @param String: class name
                          proto) {   // @param Hash(= void 0): prototype object
                                     // @return Object: singleton class instance
    uuclass[className] = function() {
        var me = this, arg = arguments, self = arg.callee;

        if (self.instance) {
            me.stable && me.stable.apply(me, arg); // after the second
        } else {
            uuclassguid(me);
            me.init && me.init.apply(me, arg);
            me.fin  && uuevattach(win, "unload", function() {
                me.fin();
            });
            me.msgbox || (me.msgbox = uunop);
            uu.msg.register(me);
        }
        return self.instance || (self.instance = me);
    };
    uuclass[className].prototype = proto || {};
}

// uu.factory - class factory(max args 4)
// [1][create instance] uu.factory("my", arg1, ...) -> new uu.Class("my")
// [2][define and create instance] uu.factory("my2", prototype, arg1, ...)
//                                                  -> new uu.Class("my2")
function uufactory(className, // @param String: class name
                   arg1,      // @param Hash/Mix(= void 0): prototype or arg1
                   arg2,      // @param Mix(= void 0):
                   arg3,      // @param Mix(= void 0):
                   arg4,      // @param Mix(= void 0):
                   arg5) {    // @param Mix(= void 0):
                              // @return Instance: new Class[className](arg, ...)
    if (!uuclass[className]) { // [2]
        uuclass(className, arg1); // define Class
        return new uuclass[className](arg2, arg3, arg4, arg5);
    }
    return new uuclass[className](arg1, arg2, arg3, arg4); // [1]
}

// --- color ---
// uu.color - parse color
function uucolor(str) { // @parem String: "black", "#fff", "rgba(0,0,0,0)" ...
                        // @return ColorHash/0: 0 is error
    var dig = uucolor, v, m, n, r, g, b, a = 1, add = 0, rgb = 0,
        rv = dig._db[str] || dig._cache[str] ||
             dig._db[++add, v = str.toLowerCase()];

    if (!rv) {
        switch ({ "#": 1, r: 2, h: 3 }[v.charAt(0)]) {
        case 1: // #fff or #ffffff
            if (!dig._hex.test(v)) {
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
                (rv = { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: a, num: n });
            break;
        case 2: // rgb(,,) or rgba(,,,)
            ++rgb; // [THROUGH]
        case 3: // hsl(,,) or hsla(,,,)
            m = (rgb ? dig._rgba
                     : dig._hsla).exec(v.indexOf("%") < 0 ? v :
                                       v.replace(dig._percent, rgb ? _percent255
                                                                   : _percent100));
            if (m) {
                r = m[1] | 0, g = m[2] | 0, b = m[3] | 0;
                a = m[4] ? parseFloat(m[4]) : 1;
                rv = rgb ? { r: r > 255 ? 255 : r,
                             g: g > 255 ? 255 : g,
                             b: b > 255 ? 255 : b, a: a }
                         : uu.color.hsla2rgba({ // depend uu.color.js
                             h: r > 360 ? 360 : r,
                             s: g > 100 ? 100 : g,
                             l: b > 100 ? 100 : b, a: a });
            }
        }
    }
    add && rv && (dig._cache[str] = uucolorfix(rv)); // add cache
    return rv || 0; // ColorHash or 0
}
uucolor._db = { transparent:{ r: 0, g: 0, b: 0, a: 0, argb: "#00000000", num: 0,
                              hex: "#000000", rgba: "rgba(0,0,0,0)" }};
uucolor._hex = /^#(?:[\da-f]{3,8})$/; // #fff or #ffffff or #ffffffff
uucolor._hsla = /^hsla?\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(?:,\s*([\d\.]+))?\s*\)/; // hsla(,,,)
uucolor._rgba = /^rgba?\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*(?:,\s*([\d\.]+))?\s*\)/; // rgba(,,,)
uucolor._cache = {};
uucolor._percent = /([\d\.]+)%/g;

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
function uucoloradd(str) { // @param JointString: "000000black,..."
    var dig = uucolor,
        ary = str.split(","), i = -1, v, w, n, r, g, b;

    while ( (v = ary[++i]) ) {
        w = v.slice(0, 6);
        n = parseInt(w, 16);
        r = n >> 16;
        g = (n >> 8) & 0xff;
        b = n & 0xff;
        dig._db[v.slice(6)] = { hex: "#" + w, r: r, g: g, b: b, a: 1,
                                argb: "#ff" + w, num: n,
                                rgba: "rgba(" + r + "," + g + "," + b + ",1)" };
    }
}

// uu.color.fix - fix ColorHash
function uucolorfix(c) { // @param ColorHash/RGBAHash: color
                         // @return ColorHash:
    var num2hh = uuhash._num2hh;

    c.num  || (c.num  = (c.r << 16) + (c.g << 8) + c.b);
    c.hex  || (c.hex  = "#" + num2hh[c.r] + num2hh[c.g] + num2hh[c.b]);
    c.argb || (c.argb = "#" + num2hh[(c.a * 255) & 0xff] +
                              num2hh[c.r] + num2hh[c.g] + num2hh[c.b]);
    c.rgba || (c.rgba = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")");
    return c;
}

// uu.color.expire - expire color cache
function uucolorexpire() {
    uucolor._cache = {};
}

// --- message pump ---
// uu.Class.MessagePump
function MessagePump() {
    this._db = {};   // Address { guid: instance, ... }
    this._guid = []; // guid cache [guid, ...]
}

// MessagePump.send - send a message synchronously
// [1][multicast] MessagePump.send([inst1, inst2], "hello") -> [result1, result2]
// [2][unicast]   MessagePump.send(inst, "hello") -> ["world!"]
// [3][broadcast] MessagePump.send(0, "hello") -> ["world!", ...]
function uumsgsend(to,      // @param Array/0/instance(= 0): addr or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           0 is broadcast
                   msg,     // @param String: msg
                   param) { // @param Mix(= void 0):
                            // @return Arra: [result, ...]
    var rv = [], ri = -1, v, w, i = -1, ary = to ? uuary(to) : this._guid;

    while ( (v = ary[++i]) ) {
        w = this._db[v.uuguid || v || 0];
        w && (rv[++ri] = w.msgbox(msg, param));
    }
    return rv;
}

// MessagePump.post - send a message asynchronously
// [1][multicast] MessagePump.post([instance, instance], "hello")
// [2][unicast]   MessagePump.post(instance, "hello")
// [3][broadcast] MessagePump.post(0, "hello")
function uumsgpost(to,      // @param Array/0/instance(= 0): addr or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           0 is broadcast
                   msg,     // @param String: msg
                   param) { // @param Mix(= void 0): param
    var me = this;

    setTimeout(function() {
        me.send(to ? uuary(to) : me._guid, msg, param);
    }, 0);
}

// MessagePump.register - register the destination of the message
function uumsgregister(inst) { // @param Instance: class instance
    this._db[uuclassguid(inst)] = inst;
    this._guid = uu.hash.keys(this._db);
}

// MessagePump.unregister
function uumsgunregister(inst) { // @param Instance: class instance
    delete this.db[uuclassguid(inst)];
    this._guid = uu.hash.keys(this._db);
}

// --- event ---
// uu.ev - bind event
// uu.ev(node, "namespace.click", fn)
function uuev(node,    // @param Node:
              nstypes, // @param JointString: "click,click+,..."
              fn,      // @param Function/Instance: callback function
              mode) {  // @param Number(= 1): 1 is attach, 2 is detach
                       // @return Node:
    function _uuevclosure(evt, fire) {
        evt = evt || win.event;
        if (!fire && !evt.code) {
            var src = evt.srcElement || evt.target; // [IE] srcElement

            src = (xwebkit && src.nodeType === 3) ? src.parentNode : src;
            evt.node = node;
            evt.code = (xcode[evt.type] || 0) & 255;
            evt.src = src;
            evt.px = xie ? evt.clientX + uu.iebody.scrollLeft : evt.pageX;
            evt.py = xie ? evt.clientY + uu.iebody.scrollTop  : evt.pageY;
            evt.ox = evt.offsetX || evt.layerX || 0; // [IE][Opera][WebKit] offsetX
            evt.oy = evt.offsetY || evt.layerY || 0; // [Gecko][WebKit] layerX
        }
        xpao ? handler.call(fn, evt, node, src) : fn(evt, node, src);
    } // [OPTIMIZED]

    mode = mode || 1;
    var types = node.uuevtypes || (node.uuevfn = {}, node.uuevtypes = ","),
        nstype = nstypes.split(","), v, i = -1, m,
        type, capt, closure, handler,
        xpao = 0, xcode = uuev._code, xie = _ie, xwebkit = _webkit;

    if (mode === 1) {
        handler = uuisfunc(fn) ? fn : (++xpao, fn.handleEvent);
        closure = fn.uuevclosure = _uuevclosure;
    } else if (mode === 2) {
        closure = fn.uuevclosure || fn;
    }
    while ( (v = nstype[++i]) ) { // v = "namespace.click+"
        m = uuev._fmt.exec(v); // split ["namespace.click+", "namespace", "click", "+"]
        if (m) {
            type = m[2]; // "click"
            capt = m[3]; // "+"
            (capt && _ie && type === "mousemove") &&
                  uuev(node, "losecapture", closure, mode); // IE mouse capture

            if (types.indexOf("," + v + ",") >= 0) { // bound?
                if (mode === 2) { // detach event
                    _ie && type === "losecapture" && node.releaseCapture &&
                        node.releaseCapture();

                    // ",dblclick," <- ",namespace.click+,dblclick,".replace(",namespace.click+,", ",")
                    node.uuevtypes = node.uuevtypes.replace("," + v + ",", ",");
                    node.uuevfn[v] = void 0;
                    uuevdetach(node, type, closure, capt);
                }
            } else if (mode === 1) { // attach event
                _ie && type === "losecapture" && node.setCapture &&
                    node.setCapture();

                // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
                node.uuevtypes += v + ",";
                node.uuevfn[v] = closure;
                uuevattach(node, type, closure, capt);
            }
        }
    }
    return node;
}
uuev._fmt = /^(?:(\w+)\.)?(\w+)(\+)?$/; // ^[NameSpace.]EvntType[Capture]$
uuev._list = uuary("mousedown,mouseup,mousemove,mousewheel,click," +
                   "dblclick,keydown,keypress,keyup,change,submit," +
                   "focus,blur,contextmenu");
uuev._code = { mousedown: 1, mouseup: 2, mousemove: 3, mousewheel: 4, click: 5,
               dblclick: 6, keydown: 7, keypress: 8, keyup: 9, mouseenter: 10,
               mouseleave: 11, mouseover: 12, mouseout: 13, contextmenu: 14,
               focus: 15, blur: 16, resize: 17,
               losecapture: 0x102, DOMMouseScroll: 0x104 };

// uu.ev.has - has event
function uuevhas(node,     // @param Node: target node
                 nstype) { // @param String: "click", "namespace.mousemove+"
                           // @return Boolean:
    return (node.uuevtypes || "").indexOf("," + nstype + ",") >= 0;
}

// uu.ev.stop - stop stopPropagation and preventDefault
function uuevstop(evt) { // @param event:
                         // @return event:
    _ie ? (evt.cancelBubble = true) : evt.stopPropagation();
    _ie ? (evt.returnValue = false) : evt.preventDefault();
    return evt;
}

// uu.ev.unbind - unbind event
// [1][unbind all]  uu.ev.unbind(node)
// [2][unbind some] uu.ev.unbind(node, "click+,dblclick")
// [3][unbind namespace all]  uu.ev.unbind(node, "namespace.*")
// [4][unbind namespace some] uu.ev.unbind(node, "namespace.click+,namespace.dblclick")
function uuevunbind(node,      // @param Node: target node
                    nstypes) { // @param JointString(= void 0): "click,click+,..."
                               // @return Node:
    function _eachnamespace(w) {
        !w.indexOf(ns) && uuev(node, w, node.uuevfn[w], 2);
    }
    var types = node.uuevtypes, nstype, v, i = -1, ns;

    if (types && types.length > 1) { // ignore ","
        if (nstypes) { // [2][3][4]
            nstype = uusplitcomma(nstypes);
            while ( (v = nstype[++i]) ) {
                if (v.lastIndexOf(".*") > 1) { // [3] "namespace.*"
                      ns = v.slice(0, -1); // "namespace."
                      uuaryeach(uusplitcomma(types), _eachnamespace);
                } else { // [2][4]
                      (types.indexOf("," + v + ",") >= 0) &&
                          uuev(node, v, node.uuevfn[v], 2);
                }
              }
        } else { // [1]
            nstype = uusplitcomma(types);
            while ( (v = nstype[++i]) ) {
                uuev(node, v, node.uuevfn[v], 2);
            }
        }
    }
    return node;
}

// [protected] uu.ev.attach - attach event - raw level api
function uuevattach(node, type, fn, capture) {
    type = uuevattach._fix[type] || type;

    _ie ? node.attachEvent("on" + type, fn)
        : node.addEventListener(type, fn, !!(capture || 0));
}
uuevattach._fix = _gecko ? { mousewheel: "DOMMouseScroll" } :
                  _opera ? { contextmenu: "mousedown" } : {};

// [protected] uu.ev.detach - detach event - raw level api
function uuevdetach(node, type, fn, capture) {
    type = uuevattach._fix[type] || type;

    _ie ? node.detachEvent("on" + type, fn)
        : node.removeEventListener(type, fn, !!(capture || 0));
}

// uu.ready - hook DOMContentLoaded event
// [1][DOM ready] uu.ready(fn, order = 0)
function uuready(fn,      // @param Function(= void 0): callback function
                 order) { // @param Number(= 0): uu.lazy order
                          //         order: 0 is low, 1 is mid, 2 is high(system)
    if (fn !== void 0 && !uuready.gone.blackout) {
        uuready.gone.dom ? fn(uu)
                         : uulazy("boot", fn, order || 0); // [1] stock
    }
}

// --- node ---
// uu.node - add node
//
//  <div id="parent">
//      <div id="first">(1) first sibling</div>
//      <div id="prev">(2) prev sibling</div>
//      <div id="ctx">context node
//          <div id="firstChild">(5) first child</div>
//          <div>
//              <div id="onlyChild"></div>
//          </div>
//          <div id="lastChild">(6) last child</div>
//      </div>
//      <div id="next">(3) next sibling</div>
//      <div id="last">(4) last sibling</div>
//  </div>
function uunode(data,  // @param Node/DocumentFragment/HTMLString:
                ctx,   // @param Node(= <body>): context
                pos) { // @param Number(= 6): insert position
                       //        1: first sibling, 2: prev sibling
                       //        3: next sibling,  4: last sibling
                       //        5: first child,   6: last child
                       // @return Node: node or first node
/*
    ctx = ctx || doc.body;
    var n = data.nodeType ? data : uunodebulk(data), p = ctx.parentNode,
        ib = "insertBefore", fc = "firstChild",
        rv = (n.nodeType === 11) ? n.firstChild : n; // 11: DocumentFragment

    if (!{ input: 1, INPUT: 1 }[ctx.nodeName]) {
        switch (pos || 6) {
        case 1: ctx = p; // [THROUGH]
        case 5: ctx[fc] ? ctx[ib](n, ctx[fc]) : ctx.appendChild(n); break;
        case 4: ctx = p; // [THROUGH]
        case 6: ctx.appendChild(n); break;
        case 2: p[ib](n, ctx); break;
        case 3: (p.lastChild === ctx) ? p.appendChild(n)
                                      : p[ib](n, ctx.nextSibling);
        }
    }
    return rv;
 */
    ctx = ctx || doc.body;
    var n = data.nodeType ? data : uunodebulk(data), p = ctx.parentNode,
        rv = (n.nodeType === 11) ? n.firstChild : n; // 11: DocumentFragment

    if (!{ input: 1, INPUT: 1 }[ctx.nodeName]) {
        switch (pos || 6) {
        case 1: p.insertBefore(n, p.firstChild); break;
        case 2: p.insertBefore(n, ctx); break;
        case 3: p.insertBefore(n, ctx.nextSibling); break;
        case 4: p.appendChild(n); break;
        case 5: ctx.insertBefore(n, ctx.firstChild); break;
        case 6: ctx.appendChild(n);
        }
    }
    return rv;
}

// uu.node.id - get nodeid
function uunodeid(node) { // @param Node:
                          // @return Number: nodeid, from 1
    if (!node.uuguid) {
        uunodeid._db[node.uuguid = ++uunodeid._num] = node;
    }
    return node.uuguid;
}
uunodeid._num = 0; // node id counter
uunodeid._db = {}; // { nodeid: node, ... } nodeid db for uu.node.id

// uu.node.id.toNode - get node by nodeid
function uunodeidtonode(nodeid) { // @param String: nodeid
                                  // @return Node/void 0:
    return uunodeid._db[nodeid];
}

// uu.node.id.remove - remove from node db
function uunodeidremove(node) { // @param Node:
                                // @return Node:
    node.uuguid && (uunodeid._db[node.uuguid] = null, node.uuguid = null);
    return node;
}

// uu.node.has - has child node
function uunodehas(node,  // @param Node: child node
                   ctx) { // @param Node: context(parent) node
                          // @return Boolean:
    for (var c = node; c && c !== ctx;) {
        c = c.parentNode;
    }
    return node !== ctx && c === ctx;
}

// uu.node.bulk - convert HTMLString into DocumentFragment
// [1][clone] uu.node.bulk(node) -> DocumentFragment
// [2][build] uu.node.bulk("<p>html</p>") -> DocumentFragment
function uunodebulk(node) { // @param Node/HTMLString:
                            // @return DocumentFragment:
    var rv = doc.createDocumentFragment(),
        ph = doc.createElement("div"), // placeholder
        str = uuisstr(node) ? node : node.outerHTML;

    ph.innerHTML = str;
    while (ph.firstChild) {
        rv.appendChild(ph.removeChild(ph.firstChild));
    }
    return rv;
}

// uu.node.swap - swap node
function uunodeswap(swapin,    // @param Node: swapin
                    swapout) { // @param Node: swapout
                               // @return Node: swapout
    return swapout.parentNode.replaceChild(swapin, swapout);
}

// uu.node.wrap - wrapper
function uunodewrap(node,      // @param Node:
                    wrapper) { // @param Node:
                               // @return Node:
    return wrapper.appendChild(uunodeswap(wrapper, node));
}

// uu.node.clear - clear all children
function uunodeclear(ctx) { // @param Node: parent node
                            // @return Node: ctx
    var rv = uu.tag("*", ctx), v, i = -1;

    while ( (v = rv[++i]) ) {
        uunodeidremove(v);
        uuevunbind(v);
    }
    rv = []; // gc
    while (ctx.firstChild) {
        ctx.removeChild(ctx.firstChild);
    }
    return ctx;
}

// uu.node.remove - remove node
function uunoderemove(node) { // @param Node:
                              // @return Node/void 0:
    if (node && node.parentNode) {
        uunodeidremove(node);
        return node.parentNode.removeChild(node);
    }
    return void 0;
}

// uu.html
function uuhtml(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <html> node
    return _buildNode(_html, arguments);
}

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
    return _buildNode(_head, arguments);
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
    return _buildNode(doc.body, arguments);
}

// inner - node builder
// [1] uu.div(uu.div()) - add node
// [2] uu.div(":hello") - add text node
// [3] uu.div(uu.text("hello")) - add text node
// [4] uu.div("@buildid") - window.xtag(uu, <div>, "buildid", nodeid) callback
// [5] uu.div(1) - Number(from 1) is window.xtag(uu, <div>, 1, nodeid) callback
// [6] uu.div("title,hello") - first String is uu.attr("title,hello")
// [7] uu.div({ title: "hello" }) - first Hash is uu.attr({ title: "hello" })
// [8] uu.div("", "color,red") - second String is uu.css("color,red")
// [9] uu.div("", { color: "red" }) - second Hash is uu.css({ color: "red" })
// [10] uu.a("url:http://example.com"), uu.img, uu.iframe - String("url:...")
//                                        is a.href, img.src, iframe.src
function _buildNode(node,   // @param Node/String:
                    args) { // @param Mix: arguments(nodes, attr/css)
                            // @return Node:
    function tohash(mix) {
        return !uuisstr(mix) ? mix :
               !mix.indexOf(" ") ? uuhash(uutrim(mix), " ", 0) // " color red"
                                 : uuhash(mix);                // "color,red"
    }

    node.nodeType || (node = uue(node)); // "div" -> <div>

    var v, w, i = 0, j = 0, iz = args.length;

    for (; i < iz; ++i) {
        v = args[i];
        w = 1;
        if (v) {
            if (v.nodeType && w--) {
                node.appendChild(v); // [1][3]
            } else if (typeof v === "number" && w--) { // [5]
                win.xtag && win.xtag(uu, node, v, uunodeid(node));
            } else if (typeof v === "string") { // [2][4][6][8][10]
                if (v.charAt(0) === ":" && w--) {// [2]
                    node.appendChild(doc.createTextNode(v.slice(1)));
                } else if (v.charAt(0) === "@" && w--) {// [4]
                    win.xtag && win.xtag(uu, node, v.slice(1), uunodeid(node));
                } else if (!v.indexOf("url:") && w--) { // [10]
                    node.setAttribute({a:1,A:1}[node.tagName] ? "href" : "src",
                                      v.slice(4));
                }
            }
        }
        if (w) {
            if (++j === 1) {
                v && uuattrset(node, tohash(v)); // [6][7] set attr
            } else if (j === 2) {
                v && uucssset(node, tohash(v)); // [8][9] set css
            }
        }
    }
    return node;
}

// --- query ---
// uu.query - querySelectorAll
function uuquery(expr,  // @param String: "css > expr"
                 ctx) { // @param NodeArray/Node(= document): query context
                        // @return NodeArray: [Node, ...]
    if (ctx && doc.querySelectorAll && ctx.nodeType
            && !uuquery._ng.test(expr)) { // [:scope] guard
        try {
            var rv = [], nodeList = (ctx || doc).querySelectorAll(expr),
                i = 0, iz = nodeList.length;

            for (; i < iz; ++i) {
                rv[i] = nodeList[i];
            }
            return rv;
        } catch(err) {} // case: extend pseudo class / operators
    }
    return uuquery.selectorAll(expr, ctx || doc); // depend: uu.query.js
}
uuquery._ng = /(:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=|<=|>=|&=|x7b/; // NG word

// uu.id - query id
function uuid(expr,  // @param String: id
              ctx) { // @param Node(= document): query context
                     // @return Node/null:
    return (ctx || doc).getElementById(expr);
}

// uu.tag - query tagName
function uutag(expr,  // @param String: "*" or "tag"
               ctx) { // @param Node(= document): query context
                      // @return NodeArray: [Node, ...]
    var nodeList = (ctx || doc).getElementsByTagName(expr),
        rv = [], ri = -1, v, i = 0, iz = nodeList.length;

    if (_ie && expr === "*") { // [IE] getElementsByTagName("*") has comment nodes
        for (; i < iz; ++i) {
            (v = nodeList[i]).nodeType === 1 && (rv[++ri] = v); // 1: ELEMENT_NODE
        }
    } else {
        for (; i < iz; ++i) {
            rv[i] = nodeList[i]; // quick
        }
    }
    return rv;
}
uutag.HTML4 = uuary("a,b,br,dd,div,dl,dt,h1,h2,h3,h4,h5,h6,i,img,iframe," +
                    "input,li,ol,option,p,pre,select,span,table,tbody,tr," +
                    "td,th,tfoot,textarea,u,ul"); // exclude <html><head><body>
uutag.HTML5 = uuary("abbr,article,aside,audio,bb,canvas,datagrid,datalist," +
                    "details,dialog,eventsource,figure,footer,header,hgroup," +
                    "mark,menu,meter,nav,output,progress,section,time,video");

// uu.klass - query className
function uuklass(expr,  // @param JointString: "class", "class1, ..."
                 ctx) { // @param Node(= document): query context
                        // @return NodeArray: [Node, ...]
    ctx = ctx || doc;
    var rv = [], ri = -1, i = 0, iz, v,
        nodes, match, cn, nz, rex, name;

    if (ctx.getElementsByClassName) {
        nodes = ctx.getElementsByClassName(expr);
        for (iz = nodes.length; i < iz; ++i) {
            rv[i] = nodes[i];
        }
        return rv;
    }
    nodes = ctx.getElementsByTagName("*");
    name = uusplit(expr);
    name.length > 1 && (name = uuaryunique(name, 1)); // [FIX] W3C TestSuite #170b
    rex = _matcher(name);
    nz = name.length;
    for (iz = nodes.length; i < iz; ++i) {
        v = nodes[i];
        cn = v.className;
        if (cn) {
            match = cn.match(rex); // [!] KEEP IT
            (match && match.length >= nz) && (rv[++ri] = v);
        }
    }
    return rv;
}

// --- string ---
// uu.fix - fix style property, attribute name
// [1] uu.fix("-webkit-shadow")   -> "-webkit-shadow"
// [2] uu.fix("background-color") -> "backgroundColor"
// [3] uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
// [4] uu.fix("for")              -> "htmlFor"
function uufix(str) { // @param String:
                      // @return String:
    return uufix._db[str] || str;
}
uufix._db = {}; // fix db

// uu.fmt - placeholder( "?" ) replacement
// uu.fmt("? dogs", [101]) -> "101 dogs"
function uufmt(format, // @param String: formatted string with placeholder
               ary) {  // @param Array: [Mix, ...]
                       // @return String: "formatted string"
    var i = -1;

    return format.replace(_PLACEH, function() { return ary[++i]; });
}

// uu.puff - alert + JSON.stringify
function uupuff(mix) { // @param Mix: object
                       // @return String: formated string
    alert(_jsoninspect(mix));
}

// uu.esc - escape to HTML entity
function uuesc(str) { // @param String: '<a href="&">'
                      // @return String '&lt;a href=&quot;&amp;&quot;&gt;'
    return str.replace(uuesc._word, _uuescentity);
}
uuesc._word = /[&<>"]/g; // entity keyword

// inner - to/from entity
function _uuescentity(code) {
    return _uuescentity._ent[code];
}
_uuescentity._ent =
    uuhash('&,&amp;,<,&lt;,>,&gt;,",&quot;,&amp;,&,&lt;,<,&gt;,>,&quot;,"');

// uu.ucs2 - char to "\u0000"
function uuucs2(str,   // @param String:
                pos) { // @param Number(= 0): position
                       // @return String "\u0000" ~ "\uffff"
    var c = str.charCodeAt(pos || 0);

    return "\\u" + uuhash._num2hh[(c >> 8) & 255] + uuhash._num2hh[c & 255];
}

// uu.unesc - unescape from HTML entity
function uuunesc(str) { // @param String: '&lt;a href=&quot;&amp;&quot;&gt;'
                        // @return String: '<a href="&">'
    return str.replace(uuunesc._word, _uuescentity);
}
uuunesc._word = /&(?:amp|lt|gt|quot);/g; // entity keyword

// uu.unucs2 - "\u0000" to char
function uuunucs2(str) { // @param String:
                         // @return String: "\u0000" ~ "\uffff"
    function _uuunucs2(m, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    }
    return str.replace(uuunucs2._ucs2, _uuunucs2);
}
uuunucs2._ucs2 = /\\u([0-9a-f]{4})/g; // \u0000 ~ \uffff

// uu.trim - trim both side whitespace
function uutrim(str) { // @param String: "  has  space "
                       // @return String: "has  space"
    return str.replace(_TRIM, "");
}

// uu.trim.tag - trim.inner + strip tags
function uutrimtag(str) { // @param String: " <h1>A</h1>  B  <p>C</p> "
                          // @return String: "A B C"
    return str.replace(_TRIM, "").replace(uutrimtag._tag, "").
               replace(_SPACES, " ");
}
uutrimtag._tag = /<\/?[^>]+>/g; // <div> or </div>

// uu.trim.url - trim.inner + strip "url(" ... ")" + trim.quote
function uutrimurl(str) { // @param String: 'url("http://...")'
                          // @return String: "http://..."
    return (!str.indexOf("url(") && str.indexOf(")") === str.length - 1) ?
           str.slice(4, -1).replace(_QUOTE, "") : str;
}

// uu.trim.inner - trim + diet inside multi spaces
function uutriminner(str) { // @param String: "  diet  inner  space  "
                            // @return String: "diet inner space"
    return str.replace(_TRIM, "").replace(_SPACES, " ");
}

// uu.trim.quote - trim + strip "double" 'single' quote
function uutrimquote(str) { // @param String: ' "quote string" '
                            // @return String: 'quote string'
    return str.replace(_QUOTE, "");
}

// uu.trim.bracket - trim + strip brackets () [] {} <>
function uutrimbracket(str) { // @param String: " <bracket> "
                              // @return String: "bracket"
    return str.replace(uutrimbracket._find, "");
}
uutrimbracket._find = /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g; // [br](ac){ke}<ts>

// uu.split - split space
function uusplit(str) { // @param String: " split  space  token "
                        // @return Array: ["split", "space", "token"]
    return str.replace(_SPACES, " ").replace(_TRIM, "").split(" ");
}

// uu.split.comma
// uu.split.comma(",,, ,,A,,,B,C,, ") -> ["A", "B", "C"]
function uusplitcomma(str) { // @param String: " split,comma,token "
                             // @return Array: ["split", "comma", "token"]
    return str.replace(uusplitcomma._many, ",").
               replace(uusplitcomma._trim, "").split(",");
}
uusplitcomma._many = /,,+/g, // many commas
uusplitcomma._trim = /^[ ,]+|[ ,]+$/g; // trim space and comma

// uu.date2str - encode ISO / GMT format time string
// [1][ISO8601 now]  uu.date2str()        -> "2000-01-01T00:00:00.000Z"
// [2][ISO8601 date] uu.date2str(date)    -> "2000-01-01T00:00:00.000Z"
// [3][RFC1123 now]  uu.date2str(0, 1)    -> "Wed, 16 Sep 2009 16:18:14 GMT"
// [4][RFC1123 date] uu.date2str(date, 1) -> "Wed, 16 Sep 2009 16:18:14 GMT"
function uudate2str(date,   // @param Date/Number(= void 0):
                            //        void 0 is current date
                    type) { // @param Number(= 0) 0 is ISO date, 1 is GMT date
                            // @return ISO8601DateString/RFC1123DateString:
    date = !date ? new Date() // void 0 or 0 -> current time [1][3]
                 : typeof date === "number" ? new Date(date) : date;
    var rv = "", h, num2dd = uuhash._num2dd;

    if (type) { // GMT(RFC1123) [3][4]
        rv = date.toUTCString();
        if (_ie && rv.indexOf("UTC") > 0) { // http://d.hatena.ne.jp/uupaa/20080515
            rv = rv.replace(/UTC/, "GMT");
            (rv.length < 29) && (rv = rv.replace(/, /, ", 0")); // [IE] fix format
        }
    } else { // [1][2]
        h = uudatehash(date);
        rv = h.Y + '-' + num2dd[h.M] + '-' + num2dd[h.D] + 'T' +
                         num2dd[h.h] + ':' + num2dd[h.m] + ':' + num2dd[h.s] + '.' +
             ((h.ms < 10) ? "00" : (h.ms < 100) ? "0" : "") + h.ms + 'Z';
    }
    return rv;
}

// uu.str2date - decode format time string(ISO8601 string to Date)
// uu.str2date("2000-01-01T00:00:00[.000]Z") -> { valid, date }
function uustr2date(str,  // @param ISO8601DateString/RFC1123DateString:
                    rv) { // @param Hash(= void 0):
                          // @return Hash: { valid, date }
                          //         Boolean: valid, 0 or 1
                          //         DateObject: date, Date or NaN
    function _uustr2date(_, dow, d, m) {
        return dow + " " + m + " " + d;
    }

    rv || (rv = { valid: 0, date: NaN });
    var m = uustr2date._parse.exec(str);

    if (m) {
        rv.date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3],      // yyyy-mm-dd
                                    +m[4], +m[5], +m[6], +m[7])); // hh:mm:ss.ms
    } else {
        (_ie && str.indexOf("GMT") > 0) && (str = str.replace(/GMT/, "UTC"));
        str = str.replace(",", "").replace(/^([\w]+) (\w+) (\w+)/, _uustr2date);
        rv.date = new Date(str);
    }
    rv.valid = isNaN(rv.date) ? 0 : 1;
    return rv;
}
uustr2date._parse = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/;

// uu.json
function uujson(mix,        // @param Mix:
                nativeJSON, // @param Number(= 0): 1 is Native JSON, 0 is js impl
                callback) { // @param Function(= void 0): callback
                            // @return JSONString:
    return nativeJSON && win.JSON ? win.JSON.stringify(mix) || ""
                                  : _jsoninspect(mix, callback);
}

// uu.json.toMix
function uujsontomix(str,          // @param JSONString:
                     nativeJSON) { // @param Number(= 0): 1 is Native JSON, 1 is js impl
                                   // @return Mix/Boolean:
    var dig = uujsontomix;

    return nativeJSON && win.JSON ? win.JSON.parse(str) :
           dig._ng.test(str.replace(dig._esc, "")) ? false
                                                   : uujs("return " + str + ";");
}
uujsontomix._ng  = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/; // NG word
uujsontomix._esc = /"(\\.|[^"\\])*"/g; // unescape

// uu.str2json
function uustr2json(str,        // @param String:
                    addQuote) { // @param Number(= 0): 1 is add quote(")
                                // @return String:
    function _swap(m) {
        return div._swap[m];
    }
    function _ucs2(str, c) {
        c = str.charCodeAt(0);
        return "\\u" + uuhash._num2hh[(c >> 8) & 255] + uuhash._num2hh[c & 255];
    }
    var div = uustr2json,
        rv = str.replace(div._esc, _swap).replace(div._enc, _ucs2);

    return addQuote ? '"' + rv + '"' : rv;
}
uustr2json._swap = uuhash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\');
uustr2json._esc = /(?:\"|\\[bfnrt\\])/g; // escape
uustr2json._enc = /[\x00-\x1F\u0080-\uFFEE]/g; // encode

// inner - json inspect
function _jsoninspect(mix, fn) {
    var ary, type = uutype(mix), w, ai = -1, i, iz;

    switch (type) {
    case 0x1000:
    case 0x001: ary = []; break;            // uu.type.CSSPROP & HASH
    case 0x002: return '"uuguid":' + uunodeid(mix); // uu.type.NODE
    case 0x010: return "null";              // uu.type.NULL
    case 0x020: return "undefined";         // uu.type.VOID
    case 0x008: return uudate2str(mix);     // uu.type.DATE
    case 0x040:
    case 0x080:
    case 0x100: return mix.toString();      // uu.type.BOOL & FUNC & NUM
    case 0x200: return uustr2json(mix, 1);  // uu.type.STR
    case 0x400: // uu.type.ARY & FAKE
    case 0x004: for (ary = [], i = 0, iz = mix.length; i < iz; ++i) {
                    ary[++ai] = _jsoninspect(mix[i], fn);
                }
                return "[" + ary + "]";
    default:    return fn ? (fn(mix) || "") : "";
    }

    if (type === 0x1000) { // uu.type.CSSPROP
        w = _webkit;
        for (i in mix) {
            if (typeof mix[i] === "string" && (w || i != (+i + ""))) { // !isNaN(i)
                w && (i = mix.item(i));
                ary[++ai] = '"' + i + '":' + uustr2json(mix[i], 1);
            }
        }
    } else {
        for (i in mix) { // uu.type.HASH
            ary[++ai] = uustr2json(i, 1) + ":" + _jsoninspect(mix[i], fn);
        }
    }
    return "{" + ary + "}";
}

// --- type ---
// uu.has - has
function uuhas(ctx,   // @param Hash/Array/String: context
               mix) { // @param Hash/Array/String: find
                      // @return Boolean:
    switch (uutype(mix)) {
    case 0x001: return uuhashhas(ctx, mix);     // uu.type.HASH
    case 0x004:
    case 0x400: return uuaryhas(ctx, mix);      // uu.type.ARY & FAKE
    case 0x200: return ctx.indexOf(mix) >= 0;   // uu.type.STR
    }
    return false;
}

// uu.like - like
function uulike(mix1,   // @param Mix:
                mix2) { // @param Mix:
                        // @return Boolean:
    var type1 = uutype(mix1);

    if (type1 !== uutype(mix2)) {
        return false;
    }
    switch (type1) {
    case 0x080: return false;                                 // uu.type.FUNC
    case 0x008: return uudate2str(mix1) === uudate2str(mix2); // uu.type.DATE
    case 0x001: return (uuhashsize(mix1) === uuhashsize(mix2) // uu.type.HASH
                       && uuhashhas(mix1, mix2));
    case 0x004: // http://d.hatena.ne.jp/uupaa/20091223
    case 0x400: return uuary(mix1) + "" == uuary(mix2); // uu.type.ARY & FAKE
    }
    return mix1 === mix2;
}

// uu.type - type detection
// [1] uu.type("str") -> 0x100(uu.type.STR)
// [2] uu.type("str", uu.type.STR | uu.type.NUM) -> true
function uutype(mix,     // @param Mix:
                match) { // @param Number(= 0): match types
                         // @return Boolean/Number: true is match,
                         //                         false is unmatch,
                         //                         Number is matched bits
    var rv = _TYPEOF[typeof mix] ||
             _TYPEOF[Object.prototype.toString.call(mix)] ||
             (!mix ? 0x010 : mix.nodeType ? 0x002 : // NULL, NODE
             "length" in mix ? 0x004 : 0x001);      // FAKE, HASH

    return match ? !!(match & rv) : rv;
} // [OPTIMIZED]

// uu.isnum - is number
function uuisnum(mix) { // @param Mix: 123 or Number(123)
                        // @return Boolean:
    return typeof mix === "number";
} // [OPTIMIZED]

// uu.isstr - is string
function uuisstr(mix) { // @param Mix: "abc" or String("abc")
                        // @return Boolean:
    return typeof mix === "string";
} // [OPTIMIZED]

// uu.isary - is array
function uuisary(mix) { // @param Mix: [1,2,3]
                        // @return Boolean:
    return Object.prototype.toString.call(mix) === "[object Array]";
} // [OPTIMIZED]

// uu.isfunc - is function
function uuisfunc(mix) { // @param Mix: function(){}
                         // @return Boolean:
    return Object.prototype.toString.call(mix) === "[object Function]";
} // [OPTIMIZED]

// --- other ---
// uu.js - eval js
// uu.js("JavaScript Expression") -> eval result
function uujs(expr) { // @param JavaScriptExpressionString:
                      // @return Mix: new Function(expr) result
    return (new Function(expr))();
}

// uu.win.size
function uuwinsize() { // @return Hash: { iw, ih, sw, sh }
                       //   iw Number: innerWidth
                       //   ih Number: innerHeight
                       //   sw Number: scrollWidth
                       //   sh Number: scrollHeight
    if (_ie) {
        var node = uu.iebody;

        return { iw: node.clientWidth, ih: node.clientHeight,
                 sw: node.scrollLeft,  sh: node.scrollTop };
    }
    return { iw: win.innerWidth,  ih: win.innerHeight,
             sw: win.pageXOffset, sh: win.pageYOffset };
}

// uu.date.hash - get date members
function uudatehash(date) { // @param Date:
                            // @return Hash: { Y: 2010, M: 12, D: 31,
                            //                 h: 23, m: 59, s: 59, ms: 999 }
    return { Y:  date.getUTCFullYear(), M: date.getUTCMonth() + 1,
             D:  date.getUTCDate(),     h: date.getUTCHours(),
             m:  date.getUTCMinutes(),  s: date.getUTCSeconds(),
             ms: date.getUTCMilliseconds() };
}

// uu.guid - get unique number
function uuguid() { // @return Number: unique number, from 1
    return ++uuguid._num;
}
uuguid._num = 0; // guid counter

// uu.lazy - lazy evaluate
function uulazy(id,      // @param String: id
                fn,      // @param Function: callback function
                order) { // @param Number(= 0): 0 is low, 1 is mid, 2 is high(system)
    uulazy._db[id] || (uulazy._db[id] = [[], [], []]);
    uulazy._db[id][order || 0].push(fn);
}
uulazy._db = {}; // { id: [[low], [mid], [high]], ... } job db

// uu.lazy.fire
function uulazyfire(id) { // @param String: id
    if (uulazy._db[id]) {
        var v, i = -1, db = uulazy._db[id], ary = db[2].concat(db[1], db[0]);

        delete uulazy._db[id];
        while ( (v = ary[++i]) ) {
            v(uu);
        }
    }
}

// --- ECMAScript-262 5th ---
//{{{!mb Array.prototype.indexOf
function arrayindexof(search, // @param Mix: search element
                      idx) {  // @param Number(= 0): from index
                              // @return Number: found index or -1
    var iz = this.length, i = idx || 0;

    i = (i < 0) ? i + iz : i;
    for (; i < iz; ++i) {
        if (i in this && this[i] === search) {
            return i;
        }
    }
    return -1;
}

// Array.prototype.lastIndexOf
function arraylastindexof(search, // @param Mix: search element
                          idx) {  // @param Number(= this.length): from index
                                  // @return Number: found index or -1
    var iz = this.length, i = idx;

    i = (i < 0) ? i + iz + 1 : iz;
    while (--i >= 0) {
        if (i in this && this[i] === search) {
            return i;
        }
    }
    return -1;
}

// Array.prototype.every
function arrayevery(fn,        // @param Function: callback evaluator
                    fn_this) { // @param this(= void 0): fn.call(this)
                               // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this && !fn.call(fn_this, this[i], i, this)) {
            return false;
        }
    }
    return true;
}

// Array.prototype.some
function arraysome(fn,        // @param Function: callback evaluator
                   fn_this) { // @param this(= void 0): fn.call(this)
                              // @return Boolean:
    for (var i = 0, iz = this.length; i < iz; ++i) {
        if (i in this && fn.call(fn_this, this[i], i, this)) {
            return true;
        }
    }
    return false;
}

// Array.prototype.forEach
function arrayforeach(fn,        // @param Function: callback evaluator
                      fn_this) { // @param this(= void 0): fn.call(this)
    for (var i = 0, iz = this.length; i < iz; ++i) {
        i in this && fn.call(fn_this, this[i], i, this);
    }
}

// Array.prototype.map
function arraymap(fn,        // @param Function: callback evaluator
                  fn_this) { // @param this(= void 0): fn.call(this)
                             // @return Array: [element, ... ]
    for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
        i in this && (rv[i] = fn.call(fn_this, this[i], i, this));
    }
    return rv;
}

// Array.prototype.filter
function arrayfilter(fn,        // @param Function: callback evaluator
                     fn_this) { // @param this(= void 0): fn.call(this)
                                // @return Array: [element, ... ]
    for (var rv = [], ri = -1, v, i = 0, iz = this.length; i < iz; ++i) {
        i in this && fn.call(fn_this, v = this[i], i, this) && (rv[++ri] = v);
    }
    return rv;
}
//}}}!mb

// Array.prototype.reduce
function arrayreduce(fn,     // @param Function: callback evaluator
                     init) { // @param Mix(= void 0): initial value
                             // @return Mix:
    var z, f = 0, rv = init === z ? z : (++f, init), i = 0, iz = this.length;

    for (; i < iz; ++i) {
        i in this && (rv = f ? fn(rv, this[i], i, this) : (++f, this[i]));
    }
    if (!f) {
        throw new Error("reduce of empty array with no initial value");
    }
    return rv;
}

// Array.prototype.reduceRight
function arrayreduceright(fn,     // @param Function: callback evaluator
                          init) { // @param Mix(= void 0): initial value
                                  // @return Mix:
    var z, f = 0, rv = init === z ? z : (++f, init), i = this.length;

    while (--i >= 0) {
        i in this && (rv = f ? fn(rv, this[i], i, this) : (++f, this[i]));
    }
    if (!f) {
        throw new Error("reduce of empty array with no initial value");
    }
    return rv;
}

// Date.prototype.toISOString - to ISO8601 string
function datetoisostring() { // @return String:
    return uudate2str(this);
}

// Number.prototype.toJSON, Boolean.prototype.toJSON
function numbertojson() { // @return String: "123", "true", "false"
    return this.toString();
}

// String.prototype.trim
function stringtrim() { // @return String: "has  space"
    return this.replace(_TRIM, "");
}

// String.prototype.toJSON
function stringtojson() { // @return String: "string"
    return uustr2json(this);
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
// inner - setup node builder - uu.div(), uu.a(), ...
uuaryeach(uutag.HTML4, function(v) {
    uu[v] = function html4() { // @param Mix: var_args
        return _buildNode(v, arguments);
    };
});
uuaryeach(uutag.HTML5, function(v) {
    uu.ie && doc.createElement(v); // [IE]
    uu[v] = function html5() { // @param Mix: var_args
        return _buildNode(v, arguments);
    };
});

// inner - build DOM Lv2 event handler - uu.click(), jam.click(), ...
uuaryeach(uuev._list, function(v) {
    uu[v] = function bind(node, fn) { // uu.click(node, fn) -> node
        return uuev(node, v, fn);
    };
    uu["un" + v] = function unbind(node) { // uu.unclick(node) -> node
        return uuev(node, v, 0, 2);
    };
});

try {
    uu.ie6 && doc.execCommand("BackgroundImageCache", false, true);
} catch(err) {} // ignore error(IETester / stand alone IE too)

// inner - bootstrap, WindowReadyState and DOMReadyState handler
function _ready() {
    if (!uuready.gone.blackout && !uuready.gone.dom++) {
        _ie && (uu.iebody = _ver.quirks ? doc.body : uu.root); // [IE] lazy detect

        uulazyfire("boot");
        uuisfunc(win.xboot || 0) && win.xboot(uu); // window.xboot(uu) callback
    }
}

// inner - window onloaded
function _winload() {
    uuready.gone.win = 1;
    _ready();
    uuisfunc(win.xwin || 0) && win.xwin(uu); // window.xwin(uu) callback
    uulazyfire("canvas");
}

// inner - DOMContentLoaded(IE)
function _domreadyie() {
    try {
        doc.firstChild.doScroll("up"), _ready();
    } catch(err) { setTimeout(_domreadyie, 64); }
}

uuevattach(win, "load", _winload);
_ie ? _domreadyie() : uuevattach(doc, "DOMContentLoaded", _ready);

//{{{!mb [IE] fix mem leak
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
    win.detachEvent("onload", _winload);
    win.detachEvent("onunload", _winunload);
}
_ie && win.attachEvent("onunload", _winunload);
//}}}!mb

// inner -
// 1. prebuild camelized hash - http://handsout.jp/slide/1894
// 2. prebuild nodeid
uuready(function() {
    var nodeList = _html.getElementsByTagName("*"), v, i = -1,
        styles = uuhash((_ie ? "float,styleFloat,cssFloat,styleFloat"
                             : "float,cssFloat,styleFloat,cssFloat") +
                ",pos,position,w,width,h,height,x,left,y,top,o,opacity," +
                "bg,background,bgcolor,backgroundColor,bgimg,backgroundImage," +
                "bgrpt,backgroundRepeat,bgpos,backgroundPosition");

    uumix(_camelhash(uufix._db, _webkit ? uustyle(_html) : _html.style),
                     styles, uuattr._hash);
    uunodeid(_html);
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
            if (_webkit) {
                v = k = props.item(k); // k = "-webkit-...", "z-index"
                k.indexOf("-") >= 0 && (v = k.replace(CAMELIZE, _camelize));
                (k !== v) && (rv[k] = v);
            } else {
                v = ((_gecko && !k.indexOf("Moz")) ? "-moz" + k.slice(3) :
                     (_ie    && !k.indexOf("ms"))  ? "-ms"  + k.slice(2) :
                     (_opera && !k.indexOf("O"))   ? "-o"   + k.slice(1) : k).
                    replace(DECAMELIZE, _decamelize);
                (k !== v) && (rv[v] = k);
            }
        }
    }
    return rv;
}

// inner - make className matcher from array
function _matcher(ary) {
    return RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
}

// inner - collect versions and meta informations
function _detectVersion() { // @return Hash: { ua, render, silverlight, flash,
                            //    ie, ie6, ie7, ie8, ie67,
                            //    opera, webkit, chrome, safari, iphone,
                            //    quirks, xml, win, mac, unix, adv, major }
    // http://d.hatena.ne.jp/uupaa/20090603
    var ax, v, i = -1, sl = 5,
        nu = navigator.userAgent,
        ie = !!doc.uniqueID, opera = window.opera || false,
        ua = opera ? +(opera.version().replace(/\d$/, ""))
                   : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                                exec(nu) || [,0])[1]),
        render = parseFloat(((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.
                 exec(nu) || [,0])[1]).toString().replace(/[^\d\.]/g, "").
                 replace(/^(\d+\.\d+)(\.(\d+))?$/,"$1$3")),
        gecko = nu.indexOf("Gecko/") > 0,
        webkit = nu.indexOf("WebKit") > 0,
        chrome = nu.indexOf("Chrome") > 0,
        html = doc.getElementsByTagName("html")[0],
        ary = [html.className.replace(/ifnojs|addua|addos/g, ""), "ifjs"],
        id = "adv,major", cn = html.className,
        rv = { ua: ua, render: render, silverlight: 0, flash: 0,
               ie: ie, ie6: ie && ua === 6, ie7: ie && ua === 7,
               ie8: ie && (doc.documentMode || 0) === 8,
               opera: !!opera, gecko: gecko,
               webkit: webkit, chrome: chrome,
               safari: !chrome && nu.indexOf("Safari") > 0,
               iphone: webkit && /iPad|iPod|iPhone/.test(nu),
               quirks: (doc.compatMode || "") !== "CSS1Compat",
               xml: uue().tagName === uue("DIV").tagName,
               win: nu.indexOf("Win") > 0, mac: nu.indexOf("Mac") > 0,
               unix: /X11|Linux/.test(nu) };

  //{{{!mb detect Flash version (version 7 ~ later)
    try {
        ax = ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                : navigator.plugins["Shockwave Flash"];
        v = /\d+\.\d+/.exec(ie ? ax.GetVariable("$version").replace(/,/g, ".")
                               : ax.description);
        rv.flash = v ? parseFloat(v[0], 10) : 0;
    } catch(err) {}
  //}}}!mb

  //{{{!mb detect Silverlight version (version 3 ~ later)
    if (sl >= 3) {
        try {
            ax = ie ? new ActiveXObject("AgControl.AgControl")
                    : parseInt(/\d+\.\d+/.exec(navigator.plugins["Silverlight Plug-In"].
                                               description)[0]);
            for (; sl >= 3 && !rv.silverlight; --sl) {
                if (ie ? ax.IsVersionSupported(sl + ".0") : ax >= sl) {
                    rv.silverlight = sl;
                }
            }
        } catch(err) {}
    }
  //}}}!mb

    rv.ie67  = rv.ie6 || rv.ie7;
    rv.ie678 = rv.ie6 || rv.ie7 || rv.ie8;
    rv.jit   =
    rv.adv   = (ie     && ua     >= 9)   || // IE 9+
               (gecko  && render >  1.9) || // Firefox 3.5+(1.91)
               (webkit && render >= 528) || // Safari 4+, Google Chrome 2+
               (opera  && ua     >= 10.5);  // Opera10.50+
    rv.major = (ie     && ua     >= 6)   || // IE 6+
               (opera  && ua     >= 9.5) || // Opera 9.5+
               (gecko  && render >= 1.9) || // Firefox 3+
               (webkit && render >  524);   // Safari 3.1+, Google Chrome 1+

    // --- conditional selector ---
    // http://d.hatena.ne.jp/uupaa/20100101
    /addua/.test(cn) && (id += ",ie,ie6,ie7,ie8,ie67,ie678,opera,gecko,webkit,iphone");
    /addos/.test(cn) && (id += ",win,mac,unix");
    id = id.split(",");
    while ( (v = id[++i]) ) {
        ary.push((rv[v] ? "if" : "ifno") + v);
    }
    // <html class="..."> modify
    /ifnojs/.test(cn) && (html.className = ary.join(" ").replace(/^\s+/, ""));

    return rv;
}

})(window, document);

