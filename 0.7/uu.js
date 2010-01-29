// === Core ===
//
// --- user configurations ---
//
//  window.xconfig = {
//      aria: 0,        // Number(= 0): 1 is enable WAI-ARIA
//      debug: 0,       // Number(= 0): 1 is debug mode, 0 is normal mode
//      light: 1,       // Number(= 1): 1 is light weight mode //ja 1 で速度優先モードを有効にする
//      altcss: 0,      // Number/Function(= 0): AltCSS mode, 0 is auto, func is callback function
//ja                                             関数を指定すると AltCSS の微調整が可能に
//      imgdir: ".",    // String(= "."): image dir, //ja uupaa.js 用の画像ディレクトリを指定する
//      cssexpr: 0,     // Number(= 0): 1 is enable CSS Expression(in IE)
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
//  window.xcanvas(uu, CanvasNodeList) - canvas ready callback handler
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

// window.uup - plugin namespace, enum plugins
//ja            プラグインネームスペース及びプラグラインの列挙
function uup() { // @return Array: ["plugin-name", ...]
    return uu.hash.keys(uup);
}

// window.uue - document.createElement wrapper
function uue(tag) { // @param String(= "div"): tag name, "a", "p"
                    // @return Node: <div>
    return document.createElement(tag || "div");
}

// window.uunop - nop function
function uunop() { // @return undefined:
}

// --- main ---
uu ? ++uu.agein : (function(win, doc) {
var _cfg    = uuarg(window.xconfig || {}, {
                    aria: 0, debug: 0, light: 1, altcss: 1, imgdir: ".",
                    cssexpr: 0, visited: 0, innerText: 0 }),
    _ver    = _vers(), // ja ブラウザ,プラグイン,Versionの特定
    _ie     = _ver.ie,
    _gecko  = _ver.gecko,
    _opera  = _ver.opera,
    _webkit = _ver.webkit,
    _html   = doc.getElementsByTagName("html")[0], // <html> alias
    _head   = doc.getElementsByTagName("head")[0], // <head> alias
    _TRIM   = /^\s+|\s+$/g,
    _QUOTE  = /^\s*["']?|["']?\s*$/g,
    _SPACES = /\s\s+/g,
    _TYPEOF = { "undefined":        0x020,
                "boolean":          0x040,
                "number":           0x100,
                "string":           0x200,
                "[object Function]":0x080,
                "[object RegExp]":  0x800,
                "[object Array]":   0x400,
                "[object Date]":    0x008,
                "[object CSSStyleDeclaration]":         0x1000,   // [WebKit][Opera]
                "[object ComputedCSSStyleDeclaration]": 0x1000 }; // [Gecko]

// path normalization // ja imgdirパスの正規化(末尾の/を補完)
_cfg.imgdir = _cfg.imgdir.replace(/\/+$/, "") + "/"; // ("img" -> "img/")

// --- library structure ---
uu = uumix(jamfactory, {            // uu(expr, ctx) -> Instance(jam)
    agein:          0,              // uu.agein - library reloaded
    ver:      uumix(_ver, {         // uu.ver - version and plugin detection
        lib:        0.7             // uu.ver.lib    - Number: Library version
    }),                             // uu.ver.ua     - Number: User Agent version
                                    // uu.ver.re     - Number: Rendering Engine version
                                    //                 (Firefox2: 1.81, Firefox3: 1.9, Firefox3.5: 1.91,
                                    //                  Safari3.1: 525, Safari4: 528)
                                    // uu.ver.sl     - Number: Silverlight version(3 later)
                                    // uu.ver.fl     - Number: Flash version(7 later)
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
    config:         _cfg,           // uu.config - { aria, debug, light, ... }
    // --- ajax / jsonp ---
    ajax:     uumix(uuajax, {       // uu.ajax(url, option = {}, fn = void 0, ngfn = void 0)
        get:        uuajaxget,      // uu.ajax.get(url, option = {}, fn, ngfn = void 0) -> guid
        post:       uuajaxpost,     // uu.ajax.post(url, data, option = {}, fn, ngfn = void 0) -> guid
        sync:       uuajaxsync,     // uu.ajax.sync(url) -> "response text"
        ifmod:      uuajaxifmod,    // uu.ajax.ifmod(url, option = {}, fn, ngfn = void 0)
        queue:      uuajaxqueue,    // uu.ajax.queue("0+1>2>3", [url, ...], [option, ...], [fn, ...], lastfn, ngfn)
        create:     uuajaxcreate,   // uu.ajax.create() -> XMLHttpRequestObject
        expire:     uuajaxexpire    // uu.ajax.expire()
    }),
    jsonp:    uumix(uujsonp, {      // uu.jsonp(url, option = {}, fn = void 0, ngfn = void 0) -> guid
        queue:      uujsonpqueue    // uu.jsonp.queue("0+1>2>3", [url, ...], [option, ...], [fn, ...], lastfn, ngfn)
    }),
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
        has:        uuaryhas,       // [1][has array] uu.ary.has([1, 2], [1, 2, 3], dence = 1) -> true
                                    // [2][has node]  uu.ary.has(<body>, [<head>, <body>]) -> true
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
        has:        uuhashhas,      // uu.hash.has({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 }) -> true
        nth:        uuhashnth,      // uu.hash.nth({ a: 1, b: 2 }, 1) -> ["b", 2]
        each:       uuhasheach,     // uu.hash.each(hash, fn)
        size:       uuhashsize,     // uu.hash.size(mix) -> Number(hash length)
        keys:       uuhashkeys,     // uu.hash.keys(mix) -> [key1, key2, ...]
        css2kb:     uuhashcss2kb,   // uu.hash.css2kb([className, ...]) -> Hash
        values:     uuhashvalues,   // uu.hash.values(mix) -> [value1, value2, ...]
        indexOf:    uuhashindexof,  // uu.hash.indexOf({a: 1, b: 2, c: 2}, 2) -> "b"
        combine:    uuhashcombine,  // [1][ary x ary] uu.hash.combine(["a","b"], [1,2]) -> { a: 1, b: 2 }
                                    // [2][ary x val] uu.hash.combine(["a","b"], 1)     -> { a: 1, b: 1 }
        hasValue:   uuhashhasvalue  // uu.hash.hasValue({ a: 1, b: 2 }, 2) -> true
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
    cs:       uumix(uucs, {         // uu.cs(node, mode = 0) -> Hash(window.getComputedStyle or currentStyle)
        quick:      uucsquick       // uu.cs.quick(node) -> Hash(window.getComputedStyle or currentStyle)
    }),
    // --- query ---
    query:    uumix(uuquery, {      // uu.query(expr, ctx = document) -> [node, ...]
        ui:         uuqueryui       // [1][query all ui instance]  uu.query.ui("", ctx) -> { name, [instance, ...] }
                                    // [2][query some ui instance] uu.query.ui("slider", ctx) -> [instance, ...]
    }),
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
            canvas:     0,          // 1 is <canvas> ready event fired
            storage:    0,          // 1 is localStorage ready event fired 
            blackout:   0           // 1 is blackout (css3 cache reload)
        }
    }),
    // --- form ---
    // [1][node] uu.text("text") -> createTextNode("text")
    // [2][get]  uu.text(node) -> text or [text, ...]
    // [3][set]  uu.text(node, "text") -> node
    text:     uumix(uutext, {
        get:        uutextget,      // uu.text.get(node) -> text or [text, ...]
        set:        uutextset       // uu.text.set(node, text) -> node
    }),
    // [1][get] uu.val(node) -> val or [val, ...]
    // [2][set] uu.val(node, "val") -> node
    val:      uumix(uuval, {
        get:        uuvalget,       // uu.val.get(node) -> val or [val, ...]
        set:        uuvalset        // uu.val.set(node, val) -> node
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
    fmt:            uufmt,          // uu.fmt("%s-%d", var_args, ...) -> "formatted string"
    puff:           uupuff,         // uu.puff("%s-%d", ...) -> alert(uu.fmt("%s-%d", ...))
    rep:            uurep,          // uu.rep("str", n = 0) -> "strstrstr..."
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
    mix2json:       uumix2json,     // uu.mix2json(mix, fn = void 0, usejs = 0) -> String
    json2mix:       uujson2mix,     // uu.json2mix(str, usejs = 0) -> Mix
    // --- type ---
    has:            uuhas,          // [1] uu.has("a", "abc") -> true
                                    // [2] uu.has([1], [1, 2]) -> uu.ary.has
                                    // [3] uu.has({ a:1 }, { a:1, b:2 }) -> uu.hash.has
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
    ui:             uuui,           // [create instance] uu.ui(widget, placeholder, option) -> instance
    win: {
        size:       uuwinsize       // uu.win.size() -> { iw, ih, sw, sh }
    },
    date: {
        hash:       uudatehash      // uu.date.hash(new Date) -> { Y, M, D, h, m, s, ms }
    },
    guid:           uuguid,         // uu.guid() -> Number(unique)
    lazy:     uumix(uulazy, {       // uu.lazy(id, fn, order = 0)
                                    //         order: 0 is low, 1 is mid, 2 is high(system)
        fire:       uulazyfire      // uu.lazy.fire(id)
    })
});

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

//{mb
uumix(Array.prototype, {
    indexOf:        arrayindexof,
    lastIndexOf:    arraylastindexof,
    every:          arrayevery,
    some:           arraysome,
    forEach:        arrayforeach,
    map:            arraymap,
    filter:         arrayfilter
}, 0, 0);
//}mb

uumix(Array.prototype, {
    reduce:         arrayreduce,
    reduceRight:    arrayreduceright
}, 0, 0);

uumix(Boolean.prototype, {
    toJSON:         numbertojson
}, 0, 0);

uumix(Date.prototype, {
    toISOString:    datetoisostring,
    toJSON:         datetoisostring
}, 0, 0);

uumix(Number.prototype, {
    toJSON:         numbertojson
}, 0, 0);

uumix(String.prototype, {
    trim:           stringtrim,
    toJSON:         stringtojson
}, 0, 0);

//{mb
_gecko && _cfg.innerText && !win.HTMLElement.prototype.innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innertextgetter);
    proto.__defineSetter__("innerText", innertextsetter);
    proto.__defineGetter__("outerHTML", outerhtmlgetter);
    proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(win.HTMLElement.prototype);
//}mb

// --- uu.jam class ---
uumix(uujam.prototype, {
    // --- stack ---
    back:           jamback,        // jam.back() -> jam
    find:           jamfind,        // jam.find(expr) -> jam
    // --- nodeset ---
    nth:            jamnth,         // jam.nth(= 0) -> Node / void 0
    each:           jameach,        // jam.each(fn) -> jam
    size:           jamsize,        // jam.size() -> Number(nodeset.length)
    clone:          jamclone,       // jam.clone() -> Array(nodeset)
    indexOf:        jamindexOf,     // jam.indexOf(node) -> Number(index or -1)
    // --- node ---
    //first, prev, next, last, firstChild, lastChild, add
    remove:         jamremove,      // jam.remove() -> jam
    // [1][get] jam.attr("attr") -> ["value", ...]
    // [2][get] jam.attr("attr1,attr2") -> [{ attr1: "value", attr2: "value" }, ...]
    // [3][set] jam.attr("attr", "value") -> jam
    // [4][set] jam.attr({ attr: "value", ... }) -> jam
    attr:           jamattr,
    // [1][get] jam.css("color") -> ["red", ...]
    // [2][get] jam.css("color,width") -> [{ color: "red", width: "20px" }, ...]
    // [3][set] jam.css("color", "red") -> jam
    // [4][set] jam.css({ color: "red" }) -> jam
    css:            jamcss,
    // [1][add]    jam.klass("+className") -> jam
    // [2][sub]    jam.klass("-className") -> jam
    // [3][toggle] jam.klass("!className") -> jam
    // [4][clear]  jam.klass() -> jam
    klass:          jamklass,
    bind:           jambind,        // jam.bind("click", fn) -> jam
    unbind:         jamunbind,      // jam.unbind("click") -> jam
    tween:          jamtween,       // jam.tween(ms, param, fn) -> jam
    show:           jamshow,        // jam.show(fadein = false) -> jam
    hide:           jamhide,        // jam.hide(fadeout = false) -> jam
    //mousedown, mouseup, mousemove, mousewheel, click, dblclick, keydown,
    //keypress, keyup, change, submit, focus, blur, contextmenu
    hover:          jamhover,       // jam.hover(enter, leave) -> jam
    // [1][get] jam.html() -> ["innerHTML", ...]
    // [2][set] jam.html("<p>html</p>") -> jam
    html:           jamhtml,
    // [1][get] jam.text() -> ["innerText", ...]
    // [2][set] jam.text("html") -> jam
    text:           jamtext,
    // [1][get] jam.val() -> ["value", ...]
    // [2][set] jam.val("value") -> jam
    val:            jamval
});

// --- uu.jam (nodeset interface) ---
// uu - uu.jam factory
function jamfactory(expr, ctx) {
    return new uujam(expr, ctx);
}

function uujam(expr,  // @param Node/NodeArray/String/Instance/window/document:
               ctx) { // @param Node/jam(= void 0): context
    this._stack = [[]]; // [nodeset, ...]
    this._ns = !expr ? [] // empty nodeset
        : (expr === win || expr.nodeType) ? [expr] // window / node
        : typeof expr === "string" ?
            (!expr.indexOf("<") ? [uunodebulk(expr)]  // <div> -> fragment
                                : uuquery(expr, ctx && ctx._ns ? ctx._ns.concat()
                                                               : ctx)) // query
        : Array.isArray(expr) ? expr.concat() // clone NodeArray
        : (expr instanceof uujam) ? expr._ns.concat() // copy constructor
        : []; // bad expr
}

// --- ajax / jsonp ---
// uu.ajax - async "GET", "POST", "PUT", "DELETE" and "HEAD" request
// uu.ajax("http://...", {}, function(hash) { alert(hash.rv); });
// uu.ajax("http://...", {}, function(hash) { uu.puff(hash.rv); },
//                           function(hash) { uu.puff("! %s !", hash.url) });
function uuajax(url,    // @param URLString: request url
                option, // @param Hash(= {}): { data, header, timeout, method }
                        //    option.data    - Mix(= null): request data(auto "POST")
                        //    option.header  - Array(= []): [(key, value), ...]
                        //    option.method  - String(= "GET" or "POST"):
                        //    option.timeout - Number(= 10):  unit sec
                        //    option.nocache - Number(= 0): 1 is no cache
                        //    option.ignore  - Number(= 0): 1 is ignore response data
                fn,     // @param Function(= void 0): fn({ rv, url, code, guid, type })
                        //    rv   - String: responseText or responseXML or ""(fail)
                        //    url  - String: request url (absolute)
                        //    code - Number: status code (0, 2xx, 3xx, 4xx, 5xx)
                        //    guid - Number: request id (atom)
                        //    type - String: Content-Type( "text/css" or ""(fail) )
                ngfn) { // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
                        // @return Number: guid(request atom)
    return _uuajax(url, option, fn, ngfn);
}
uuajax._cache  = {}; // { "url": Number(lastModified), ... }
uuajax._scheme = /^(?:file|https?):/; // judge absolute url

function _uuajax(url, option, fn, ngfn, _fn2) {
    function _ajaxstatechange() {
        var rv, type, code, lastmod, hash;

        if (xhr.readyState === 4) {
            code = xhr.status || 0;

            if ((code >= 200 && code < 300)
                || (!code && !url.indexOf("file:"))) {

                if (fn && !run++) {
                    type = xhr.getResponseHeader("Content-Type") || "";
                    ignore || (rv = type.indexOf("xml") < 0 ? xhr.responseText
                                                            : xhr.responseXML);
                    fn(hash = { code: code, rv: rv || "", url: url,
                                guid: guid, type: type, id: opt.id });
                    _fn2 && _fn2(hash); // callback uu.ajax.queue
                }
                if (opt.ifmod) { // parse "Last-Modified" value
                    lastmod = xhr.getResponseHeader("Last-Modified");
                    uuajax._cache[url] = lastmod ? Date.parse(lastmod) : 0; // add cache
                }
            } else {
                _ajaxng(code || ((_opera && opt.ifmod) ? 304 : 400)); // [Opera]
            }
            _ajaxgc();
        }
    }
    function _ajaxng(code) {
        ngfn && !run++ &&
            ngfn({ code: code, rv: "", url: url,
                   guid: guid, type: "", id: opt.id });
    }
    function _ajaxgc() {
        befn && uuevdetach(win, "beforeunload", befn);
        xhr && (xhr.onreadystatechange = uunop, xhr = null); // [IE] mem leak
    }
    function _ajaxwatchdog() {
        _ajaxabort();
        _ajaxng(408); // 408 "Request Time-out"
        _ajaxgc();
    }
    function _ajaxabort() {
        try {
            xhr && xhr.abort();
        } catch(err) {}
    }
    var opt = option || {}, xhr = opt.xhr || uuajaxcreate(),
        method = opt.method || (opt.data ? "POST" : "GET"),
        ignore = opt.ignore || (method === "HEAD" ? 1 : 0),
        header = opt.header || [],
        guid = uuguid(), run = 0, v, i = -1, befn, div;

    // relative url -> absolute url
    if (!uuajax._scheme.test(url)) {
        div = uue();
        div.innerHTML = '<a href="' + url + '" />';
        url = div.firstChild ? div.firstChild.href
                             : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    }
    opt.nocache && (url += (url.indexOf("?") < 0 ? "?" :
                            url.indexOf("&") < 0 ? ";" : "&") + "uuguid=" + guid);
    if (xhr) {
        try {
            // [Gecko] beforeunload event -> gc
            _gecko && uuevattach(win, "beforeunload", befn = _ajaxabort);

            // initialize
            xhr.open(method, url, true); // GET / POST / PUT / DELETE / HEAD, Async
            xhr.onreadystatechange = _ajaxstatechange;

            // set header
            header.push("X-Requested-With", "XMLHttpRequest");
            opt.ifmod && uuajax._cache[url] &&
                header.push("If-Modified-Since",
                            uudate2str(uuajax._cache[url], 1)); // GMT
            opt.data &&
                header.push("Content-Type", "application/x-www-form-urlencoded");

            while ( (v = header[++i]) ) {
                xhr.setRequestHeader(v, header[++i]);
            }

            // request
            xhr.send(opt.data || null);
            setTimeout(_ajaxwatchdog, (option.timeout || 10) * 1000);
            return guid;
        } catch (err) {}
    }
    // create object or request error
    setTimeout(function() { _ajaxng(400), _ajaxgc(); }, 0); // [delay]
    return guid;
}

// uu.ajax.get - async "GET" request
function uuajaxget(url, option, fn, ngfn) { // @see uu.ajax
    return _uuajax(url, uuarg(option, { data: null }), fn, ngfn);
}

// uu.ajax.post - async "POST" request
function uuajaxpost(url, data, option, fn, ngfn) { // @see uu.ajax
    return _uuajax(url, uuarg(option, { data: data }), fn, ngfn);
}

// uu.ajax.sync - sync "GET" request
function uuajaxsync(url) { // @param String:
                           // @return String: responseText
    try {
        var xhr = uuajaxsync._xhr || (uuajaxsync._xhr = uuajaxcreate());

        xhr.open("GET", url, false); // sync
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(null);
        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
            return xhr.responseText;
        }
    } catch(err) {
        _cfg.debug &&
            alert("uu.ajax.sync error. " + err.message + url);
    }
    return "";
}
uuajaxsync._xhr = 0; // static xhr object

// uu.ajax.ifmod - async request with "If-Modified-Since" header
function uuajaxifmod(url, option, fn, ngfn) { // @see uu.ajax
    return _uuajax(url, uuarg(option, { ifmod: 1 }), fn, ngfn);
}

// uu.ajax.queue - request queue
// uu.ajax.queue("a+b>c", [url, ...], [option, ...], [fn], lastfn, ngfn)
function uuajaxqueue(cmd,    // @param String: "0>1", "0+1", "0+1>2>3"
                     urlary, // @param Array: [url, ...]
                     optary, // @param Array: [option, ...]
                     fnary,  // @param Array: [fn, ...]
                     lastfn, // @param Function(= void 0): lastfn([{ rv, url, code, guid, type }, ... ])
                     ngfn) { // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
    _uuajaxq(1, cmd, urlary, optary, fnary, lastfn || uunop, ngfn || uunop, []);
}

// inner - uu.ajax.queue impl. http://d.hatena.ne.jp/uupaa/20091221
function _uuajaxq(ajax, cmd, url, opt, fn, lastfn, ngfn, rv) {
    function _nextq(r) {
        _uuajaxq(ajax, cmd, url, opt, fn, lastfn, ngfn, rv.concat(r)); // recursive
    }
    if (!cmd) {
        lastfn(rv); // finish
        return;
    }
    var c = cmd.split(""), ary = [], v;

    cmd = "";
    while ( (v = c.shift()) ) { // v = "a"
        ary.push(url.shift(), uumix(opt.shift() || {}, { id: v }), fn.shift());
        if (c.shift() === ">") {
            cmd = c.join(""); // rebuild command, "0+1>2>3" -> "2>3"
            break;
        }
    }
    _uuajaxparallel(ajax, ary, _nextq, ngfn);
}

// inner - ajax/jsonp parallel load
function _uuajaxparallel(ajax, ary, lastfn, ngfn) {
    function _nextp(hash) {
        var idx = uuaryindexof(atom, hash.guid); // = Array.indexOf

        rv[idx] = hash;
        ++n >= iz / 3 && !run++ && lastfn(rv); // fn([{...}, ..])
    }
    function _error(hash) {
        !run++ && ngfn(hash);
    }
    var rv = [], atom = [], i = 0, iz = ary.length, n = 0, run = 0;

    for (; i < iz; i += 3) {
        atom.push((ajax ? _uuajax : _uujsonp)(ary[i], ary[i + 1],
                                              ary[i + 2], _error, _nextp));
    }
}

// uu.ajax.create - create XMLHttpRequest object
function uuajaxcreate() { // @return XMLHttpRequest/0:
    return win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
           win.XMLHttpRequest ? new XMLHttpRequest() : 0;
}

// uu.ajax.expire - expire Modified Since request cache and sync xhr object
function uuajaxexpire() {
    _uuajax._cache = {}; // expire If-Modified-Since cache
    uuajaxsync._xhr = null;
}

// uu.jsonp - Async JSONP request
// uu.jsonp("http://example.com/a.php", {}, function(result) {});
function uujsonp(url,    // @param URLString: request url
                 option, // @param Hash(= {}): { method, timeout }
                         //   option.mehtod  - String(= "callback"):
                         //   option.timeout - Number(= 10): unit sec
                 fn,     // @param Function: fn({ rv, url, code, guid, type })
                 ngfn) { // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
                         // @return Number: guid(request atom)
    return _uujsonp(url, option, fn, ngfn);
}
uujsonp._db = {}; // { jobid: fn, ... } jsonp job db

function _uujsonp(url, option, fn, ngfn, _fn2) {
    function _jsonpwatchdog() {
        uujsonp._db[jobid]("", 408); // 408 "Request Time-out"
    }
    function _jsonpjob(rv, code, hash) {
        if (!node.uujsonprun++) {
            if (rv) {
                fn && fn(hash = { code: 200, rv: rv, url: url, guid: guid,
                                  type: type, id: opt.id });
                _fn2 && _fn2(hash);
            } else {
                ngfn && ngfn({ code: code || 404, rv: "", url: url, guid: guid,
                               type: "", id: opt.id });
            }
            setTimeout(_jsonpgc, (timeout + 10) * 1000);
        }
    }
    function _jsonpgc() {
        _head.removeChild(node);
        delete uujsonp._db[jobid];
    }
    var opt = option || {},
        guid = uuguid(), type = "text/javascript",
        timeout = opt.timeout || 10,
        method = opt.method || "callback",
        jobid = "j" + uuguid(),
        node = uue("script"),
        src = url + (url.indexOf("?") < 0 ? "?" :
                     url.indexOf("&") < 0 ? ";" : "&") +
                    method + "=uu.jsonp._db." + jobid; // uu.jsonp._db = _jobid

    uujsonp._db[jobid] = _jsonpjob;
    uumix(node, { type: type, charset: "utf-8", uujsonprun: 0 });
    _head.appendChild(node);
    node.setAttribute("src", src);
    setTimeout(_jsonpwatchdog, timeout * 1000);
    return guid;
}


// uu.jsonp.queue - request queue
function uujsonpqueue(cmd, urlary, optary, fnary, lastfn, ngfn) { // @see uu.ajax.queue
    _uuajaxq(0, cmd, urlary, optary, fnary, lastfn || uunop, ngfn || uunop, []);
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
// [1][has array] uu.ary.has([1, 2], [1, 2, 3]) -> true
// [2][has node]  uu.ary.has(<body>, [<head>, <body>]) -> true
function uuaryhas(ary,     // @param Array/Mix: search element(s)
                  ctx,     // @param Array: context
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
uuhash._dec2 = _numary("0123456789");       // ["00", ...  99: "99"]
uuhash._hex2 = _numary("0123456789abcdef"); // ["00", ... 255: "ff"]

// uu.hash.has - has Hash
function uuhashhas(find,   // @param Hash: find { key, value, ... }
                   hash) { // @param Hash:
                           // @return Boolean:
    var v, w, i;

    for (i in find) {
        v = find[i], w = hash[i];
        if (!(i in hash) // key not found
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
        if (Object.keys) {
            return Object.keys(mix);
        }
        for (i in mix) {
            mix.hasOwnProperty(i) && (rv[++ri] = _val ? mix[i] : i);
        }
    }
    return rv;
}

// uu.hash.css2kb - hash from CSS implemented data
// .hoge { list-style: url(?key=val) }
// uu.hash.css2kb("hoge") -> { key: val }
function uuhashcss2kb(name) { // @param String/Array: className or [className, ...]
                              // @return Hash: { key: value, ... }
    function _qsparse(m, key, val, v) {
        v = fn(val);
        return rv[fn(key)] = isNaN(v) ? v : parseFloat(v);
    }
    // http://d.hatena.ne.jp/uupaa/20091125
    var rv = {}, cs, url, ary = uuary(name), i = 0, iz = ary.length,
        div = doc.body.appendChild(uue()),
        fn = decodeURIComponent, _kv = uuhashcss2kb._kv; // alias

    for (; i < iz; ++i) {
        div.className = ary[i];
        cs = _ie ? div.currentStyle : win.getComputedStyle(div, null);
        url = uutrimurl(cs.listStyleImage);
        if (url && url.indexOf("?") > 0) {
            url.slice(url.indexOf("?") + 1).replace(_kv, _qsparse);
        }
    }
    doc.body.removeChild(div);
    return rv;
}
uuhashcss2kb._kv = /(?:([^\=]+)\=([^\;]+);?)/g; // key = value

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
        return uucs(node, a || 0); // [1][2][3]
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

// uu.cs - getComputedStyle, currentStyle wrapper
function uucs(node,   // @param Node:
              mode) { // @param Number(= 0):
                      //   0: enum full properties
                      //   1: enum more properties
                      //   2: enum some properties
                      //   4: currentStyle (IE6,IE7,IE8 only)
                      // @return Hash: { prop: "val", ... }
//{mb
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
            dig = uucs, box = dig._hash.box, unit = dig._unit, mod = dig._mod,
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
//}mb
    return win.getComputedStyle(node, null);
}
//{mb
uucs._pt = /pt$/;
uucs._mod = { top: 1, left: 2, width: 3, height: 4 };
uucs._unit = { m: 1, t: 2, "%": 3, o: 3 }; // em, pt, %, auto
uucs._hash = uu.ie678 ? _builduucshash() : {};
uucs._thick = uu.ie8 ? "5px" : "6px";
//}mb

// uu.cs.quick - getComputedStyle or currentStyle
function uucsquick(node) { // @param Node:
                           // @return Hash: { prop: "val", ... }
    return uucs(node, 4);
}

//{mb inner - build uucss hash
function _builduucshash() {
    // http://d.hatena.ne.jp/uupaa/20091212
    var rv = { full: [], more: [], box: [] },
        ary = [" "], i, w, trim = /^\s+|\s+$/g,
        cs = document.getElementsByTagName("html")[0].currentStyle;

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
//}mb

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
        lv3.__fin__ = lv3.fin || uunop;
        lv3.fin && uuevattach(win, "unload", function() {
            lv3.fin && lv3.fin();
        });
        lv3.fin = function wrapper() {
            lv3.__fin__();
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
                         to                // @param String:
                         /* var_args */) { // @param Mix: args
        var obj = this.superClass;

        // recurtion guard
        if (from === obj[to] || superMethod.caller === obj[to]) {
            obj = obj.superClass;
        }
        return obj[to].apply(this, uu.ary(arguments).slice(2));
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
        case 1:
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
                (rv = { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: a });
            break;
        case 2:
            ++rgb; // [THROUGH]
        case 3:
            m = (rgb ? dig._rgba
                     : dig._hsla).exec(v.replace(dig._sp, "").
                                         replace(dig._percent, _uucolorp2n));
            if (m) {
                r = m[1] | 0, g = m[2] | 0, b = m[3] | 0;
                a = m[4] ? parseFloat(m[4]) : 1;
                rv = rgb ? { r: r, g: g, b: b, a: a }
                         : uu.color.hsla2rgba({ h: r, s: g, l: b, a: a }); // depend uu.color.js
            }
        }
    }
    add && rv && (dig._cache[str] = uucolorfix(rv)); // add cache
    return rv || 0; // ColorHash or 0
}
uucolor._db = { transparent:{ r: 0, g: 0, b: 0, a: 0, argb: "#00000000",
                              hex: "#000000", rgba: "rgba(0,0,0,0)" }};
uucolor._sp = /\s+/g; // many space
uucolor._hex = /^#(?:[\da-f]{3,8})$/; // #fff or #ffffff or #ffffffff
uucolor._hsla = /^hsla?\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/; // hsla(,,,)
uucolor._rgba = /^rgba?\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/; // rgba(,,,)
uucolor._cache = {};
uucolor._percent = /[\d\.]+%/g;

// inner - percent(0.0~1.0) to number(0~255)
function _uucolorp2n(n) { // @param Number: 0.0~1.0
                          // @return Number: 0~255
    n = ((parseFloat(n) || 0) * 2.56) | 0;
    return n > 255 ? 255 : n;
}

// uu.color.add
function uucoloradd(str) { // @param JointString: "000000black,..."
    var dig = uucolor,
        ary = str.split(","), i = -1, v, w, n, r, g, b;

    while ( (v = ary[++i]) ) {
        w = v.slice(0, 6);
        n = parseInt(w, 16);
        r = n >> 16;
        g = (n >> 8) & 0xFF;
        b = n & 0xFF;
        dig._db[v.slice(6)] = { hex: "#" + w, r: r, g: g, b: b, a: 1,
                                argb: "#ff" + w,
                                rgba: "rgba(" + r + "," + g + "," + b + ",1)" };
    }
}

// uu.color.fix - fix ColorHash
function uucolorfix(c) { // @param ColorHash/RGBAHash:
                         // @return ColorHash:
    var hex2 = uuhash._hex2;

    c.hex  || (c.hex  = "#" + hex2[c.r] + hex2[c.g] + hex2[c.b]);
    c.argb || (c.argb = "#" + hex2[_uucolorp2n(c.a * 100)] +
                              hex2[c.r] + hex2[c.g] + hex2[c.b]);
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
            var src = evt.srcElement || evt.target;

            src = (_webkit && src.nodeType === 3) ? src.parentNode : src;
            evt.node = node;
            evt.code = (_code[evt.type] || 0) & 255;
            evt.src = src;
            evt.px = _ie ? evt.clientX + uu.iebody.scrollLeft : evt.pageX;
            evt.py = _ie ? evt.clientY + uu.iebody.scrollTop  : evt.pageY;
            evt.ox = evt.offsetX || evt.layerX || 0; // [offsetX] IE, Opera, WebKit
            evt.oy = evt.offsetY || evt.layerY || 0; // [layerX]  Gecko, WebKit
        }
        handler.call(fn, evt, node, src);
    }
    mode = mode || 1;
    var types = node.uuevtypes || (node.uuevfn = {}, node.uuevtypes = ","),
        nstype = nstypes.split(","), v, i = -1, m,
        type, capt, closure, handler, _code = uuev._code;

    if (mode === 1) {
        handler = uuisfunc(fn) ? fn : fn.handleEvent;
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
                    _ie && (type === "losecapture") && node.releaseCapture();

                    // ",dblclick," <- ",namespace.click+,dblclick,".replace(",namespace.click+,", ",")
                    node.uuevtypes = node.uuevtypes.replace("," + v + ",", ",");
                    node.uuevfn[v] = void 0;
                    uuevdetach(node, type, closure, capt);
                }
            } else if (mode === 1) { // attach event
                _ie && (type === "losecapture") && node.setCapture();

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

// --- form ---
// uu.text - text element creator, innerText accessor
// [1][node] uu.text("text") -> createTextNode("text")
// [2][get]  uu.text(node) -> text or [text, ...]
// [3][set]  uu.text(node, "text") -> node
function uutext(node,   // @param Node/String:
                text) { // @param String(= void 0):
                        // @return Array/String/Node:
    return uuisstr(node) ? doc.createTextNode(node) : // [1]
           ((text === void 0) ? uutextget : uutextset)(node, text); // [2][3]
}

// uu.text.get
function uutextget(node) { // @param Node:
                           // @return String: innerText
    return node[_gecko ? "textContent" : "innerText"];
}

// uu.text.set
function uutextset(node,   // @param Node:
                   text) { // @param Array/String: innerText
                           // @return Node: node
    uunode(doc.createTextNode(Array.isArray(text) ? text.join("") : text),
           uunodeclear(node));
    return node;
}

// uu.val - value
// [1][get] uu.val(node) -> value
// [2][set] uu.val(node, "value") -> node
function uuval(node,  // @param Node:
               val) { // @param String(= void 0):
                      // @return String/Node:
    return ((val === void 0) ? uuvalget : uuvalset)(node, val);
}

// uu.val.get - get value
// [1][<textarea>]       uu.val.get(node) -> "innerText"
// [2][<button>]         uu.val.get(node) -> "<button value>"
// [3][<option>]         uu.val.get(node) -> "<option value>" or
//                                           "<option>value</option>"
// [4][<selet>]          uu.val.get(node) -> selected option value
// [5][<selet multiple>] uu.val.get(node) -> ["value", ...]
// [6][<input checkbox>] uu.val.get(node) -> ["value", ...]
// [7][<input radio>]    uu.val.get(node) -> "value"
function uuvalget(node) { // @param Node:
                          // @return Array/String:
    var rv = [], v, i = -1, ary, multi = 0;

    if (node.tagName.toLowerCase() === "select") {
        i = node.selectedIndex;
        multi = node.multiple;
        if (i >= 0) {
            while ( (v = node.options[++i]) ) {
                v.selected && rv.push(v.value || v.text);
                if (!multi) { break; }
            }
        }
        rv = multi ? rv : (rv[0] || "");
    } else if (node.type === "radio" || node.type === "checkbox") {
        ary = node.name ? uuary(doc.getElementsByName(node.name)) : [node];
        while ( (v = ary[++i]) ) {
            v.checked && rv.push(v.value);
        }
        rv = (node.type !== "radio") ? rv : (rv[0] || "");
    } else {
        rv = node.value; // <textarea> <button> <option>
    }
    return rv;
}

// uu.val.set - set value
// uu.val.set(node, value) -> node
function uuvalset(node,  // @param Node:
                  val) { // @param String/Array:
                         // @return Node:
    var v, i = -1, j, jz, prop, ary, vals = Array.isArray(val) ? val : [val];

    if (node.tagName.toLowerCase() === "select") {
        ary = node.options, prop = "selected";
    } else if ({ checkbox: 1, radio: 1 }[node.type || ""]) {
        ary = node.name ? uuary(doc.getElementsByName(node.name)) : [node];
    }
    if (ary) {
        prop || (prop = "checked"); // prop is "selected" or "checked"
        while ( (v = ary[++i]) ) {
            v[prop] = false; // reset current state
        }
        i = -1, jz = vals.length;
        while ( (v = ary[++i]) ) {
            for (j = 0; j < jz; ++j) {
                ((v.value || v.text) == vals[j]) && (v[prop] = true); // 0 [==] "0"
            }
        }
    } else {
        node.value = vals.join(""); // <textarea> <button> <option>
    }
    return node;
}

// --- node ---
// uu.node - add node
function uunode(data,  // @param Node/DocumentFragment/HTMLString:
                ctx,   // @param Node(= <body>): context
                pos) { // @param Number(= 6): insert position
                       //        1: first sibling, 2: prev sibling
                       //        3: next sibling,  4: last sibling
                       //        5: first child,   6: last child
                       // @return Node: node or first node
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
// uu.query - document.querySelectorAll like function
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

// [1][query all ui instance]  uu.query.ui("", ctx) -> { name, [instance, ...] }
// [2][query some ui instance] uu.query.ui("slider", ctx) -> [instance, ...]
function uuqueryui(widget, // @param String(= ""): widget name
                   ctx) {  // @param String(= document.body): context
                           // @param Array/Hash: [instance, ...]
                           //                    { name, [instance, ...], ... }
    var rv, ary = uuquery(":ui" + (widget || ""), ctx || doc.body),
        v, i = 0, iz = ary.length;

    if (widget) {
        for (rv = []; i < iz; ++i) {
            rv.push(ary[i].uuui.instance);
        }
    } else {
        for (rv = {}; i < iz; ++i) {
            v = ary[i];
            rv[v.uuui.name] || (rv[v.uuui.name] = []);
            rv[v.uuui.name].push(v.uuui.instance);
        }
    }
    return rv;
}

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

// uu.fmt - sprintf (PHP::sprintf like function)
// uu.fmt("%s-%d", var_args, ...) -> "formatted string"
function uufmt(format            // @param String: sprintf format string
               /* var_args */) { // @param Mix: sprintf var_args
                                 // @return String: "formatted string"
    // http://d.hatena.ne.jp/uupaa/20091214
    function _uufmtparse(m, argidx, flag, width, prec, size, types) {
        if (types === "%") {
            return types;
        }
        idx = argidx ? parseInt(argidx) : next++;

        var w = uufmt._bits[types], ovf, pad,
            v = (av[idx] === void 0) ? "" : av[idx];

        w & 3 && (v = w & 1 ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
        w & 4 && (v = ((types === "s" ? v : types) || "").toString());
        w & 0x20  && (v = v >= 0 ? v : v % 0x100000000 + 0x100000000);
        w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
        w & 0x40  && flag === "#" && (v = (w & 0x100 ? "0" : "0x") + v);
        w & 0x80  && prec && (v = w & 2 ? v.toFixed(prec) : v.slice(0, prec));
        w & 0x400 && (v = _jsoninspect(v)); // "%j"
        w & 0x6000 && (ovf = (typeof v !== "number" || v < 0));
        w & 0x2000 && (v = ovf ? "" : String.fromCharCode(v));
        w & 0x8000 && (flag = flag === "0" ? "" : flag);
        v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();
        // padding
        if (!(w & 0x800 || width === void 0 || v.length >= width)) {
            pad = uurep((!flag || flag === "#") ? " " : flag, width - v.length);
            v = ((w & 0x10 && flag === "0") && !v.indexOf("-")) ?
                ("-" + pad + v.slice(1)) : (pad + v);
        }
        return v;
    }
    var next = 1, idx = 0, av = arguments;

    return format.replace(uufmt._fmt, _uufmtparse);
}
uufmt._fmt = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcsj])/g;
uufmt._bits = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261,
                X: 0x9261, f: 0x92, c: 0x2800, s: 0x84, j: 0xC00 };

// uu.puff - alert + uu.fmt + JSON.stringify
// [1][json]   uu.puff(mix)
// [2][format] uu.puff("%j...", mix, ...);
function uupuff(format            // @param String: sprintf format string
                /* var_args */) { // @param Mix: sprintf var_args
                                  // @return String: formated string
    alert((arguments.length === 1) ? uufmt("%j", format)
                                   : uufmt.apply(this, arguments));
}

// uu.rep - repeat string
function uurep(str, // @param String: "str"
               n) { // @param Number(= 0): times
                    // @return String: "strstrstr..."
    return Array(n + 1).join(str);
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

    return "\\u" + uuhash._hex2[(c >> 8) & 255] + uuhash._hex2[c & 255];
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
    var rv = "", h, dec2 = uuhash._dec2;

    if (type) { // GMT(RFC1123) [3][4]
        rv = date.toUTCString();
        if (_ie && rv.indexOf("UTC") > 0) { // http://d.hatena.ne.jp/uupaa/20080515
            rv = rv.replace(/UTC/, "GMT");
            (rv.length < 29) && (rv = rv.replace(/, /, ", 0")); // [IE] fix format
        }
    } else { // [1][2]
        h = uudatehash(date);
        rv = h.Y + '-' + dec2[h.M] + '-' + dec2[h.D] + 'T' +
                         dec2[h.h] + ':' + dec2[h.m] + ':' + dec2[h.s] + '.' +
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

// uu.mix2json
function uumix2json(mix,  // @param Mix:
                    fn,   // @param Function(= void 0): callback
                    js) { // @param Number(= 0): 0 is native JSON, 1 is use js
                          // @return JSONString:
    return (!js && win.JSON) ? win.JSON.stringify(mix) || ""
                             : _jsoninspect(mix, fn);
}

// uu.json2mix
function uujson2mix(str,  // @param JSONString:
                    js) { // @param Number(= 0): 0 is native JSON, 1 is use js
                          // @return Mix/Boolean:
    var dig = uujson2mix;

    return (!js && win.JSON) ? win.JSON.parse(str) :
           dig._ng.test(str.replace(dig._esc, "")) ? false
                                                   : uujs("return " + str + ";");
}
uujson2mix._ng  = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/; // NG word
uujson2mix._esc = /"(\\.|[^"\\])*"/g; // unescape

// uu.str2json
function uustr2json(str,        // @param String:
                    addQuote) { // @param Number(= 0): 1 is add quote(")
                                // @return String:
    function _swap(m) {
        return div._swap[m];
    }
    function _ucs2(str, c) {
        c = str.charCodeAt(0);
        return "\\u" + uuhash._hex2[(c >> 8) & 255] + uuhash._hex2[c & 255];
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
function uuhas(mix,   // @param Hash/Array/String: find
               ctx) { // @param Hash/Array/String: context
                      // @return Boolean:
    switch (uutype(mix)) {
    case 0x001: return uuhashhas(mix, ctx);     // uu.type.HASH
    case 0x004:
    case 0x400: return uuaryhas(mix, ctx);      // uu.type.ARY & FAKE
    case 0x200: return mix.indexOf(ctx) >= 0;   // uu.type.STR
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
             (!mix ? 0x010 : mix.nodeType ? 0x002 : // uu.type.NODE or NODE
             "length" in mix ? 0x004 : 0x001);      // uu.type.FAKE or uu.type.HASH

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

// uu.ui - create instance
function uuui(widget,      // @param Node/String: widget name
              placeholder, // @param Node(= void 0): place holder node
                           //                        void 0 is add body
              option) {    // @param Hash(= {}): option
                           // @return Instance:
    return uuui[widget](placeholder, option);
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
//{mb Array.prototype.indexOf
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
//}mb

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
//{mb
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
//}mb

// --- uu.jam ---
// jam.back
function jamback() { // @return jam:
    this._ns = this._stack.pop() || [];
    return this;
}

// jam.find
function jamfind(expr) { // @return jam:
    this._stack.push(this._ns); // add stack
    this._ns = uuquery("! " + expr, this._ns); // ":scope expr"
    return this;
}

// jam.nth - nodeset[nth]
function jamnth(nth) { // @param Number(= 0): 0 is first element
                       //                   : -1 is last element
                       //                   : nth < 0 is negative index
                       // @return Node:
    return this._ns[nth < 0 ? nth + this._ns.length : nth || 0];
}

// jam.clone - nodeset[nth]
function jamclone() { // @return Array: nodeset
    return this._ns.concat();
}

// jam.each
function jameach(fn) { // @return jam:
    uuaryeach(this._ns, fn);
    return this;
}

// jam.size - nodeset.length
function jamsize() { // @return Number:
    return this._ns.length;
}

// jam.indexOf - nodeset.indexOf(node)
function jamindexOf(node) { // @param Node:
                            // @return Number: found index or -1
    return uuaryindexof(this._ns.indexOf, node);
}

// jam.add
// jam.first
// jam.prev
// jam.next
// jam.last
// jam.firstChild
// jam.lastChild
uuhasheach({ first: 1, prev: 2, next: 3, last: 4,
             firstChild: 5, lastChild: 6, add: 6 }, function(pos, method) {

    // jam.add(node or "<p>html</p>") -> jam
    uujam.prototype[method] = function(node) { // @param Node/HTMLString:
                                               // @return jam:
        var ary = this._ns, w, i = -1;

        if (ary.length === 1) {
            uunode(node, ary[0], pos);
        } else {
            while ( (w = ary[++i]) ) {
                uunode(uunodebulk(node), w, pos); // clone node
            }
        }
        return this;
    };
});

// jam.remove
function jamremove() { // @return jam:
    return _jameach(this, uunoderemove);
}

// jam.attr
function jamattr(a, b) { // @return jam:
    return _jammap(this, uuattr, a, b);
}

// jam.css
function jamcss(a, b) { // @return jam:
    return _jammap(this, uucss, a, b);
}

// jam.klass
function jamklass(a) { // @return jam:
    function _clear(v) {
        v.className = "";
    }
    var method = jamklass._cmd[a.charAt(0)];

    return method ? _jammap(this, method, a.substring(1))
                  : _jammap(this, a ? uuklassadd : _clear, a);
}
jamklass._cmd = { "+": uuklassadd,      // "+class" add class
                  "-": uuklasssub,      // "-class" sub class
                  "!": uuklasstoggle }; // "!class" toggle class

// jam.bind
function jambind(type, fn) { // @return jam:
    return _jameach(this, uuev, type, fn);
}

// jam.tween
function jamtween(ms, param, fn) { // @return jam
    return _jameach(this, uu.tween, ms, param, fn);
}

// jam.unbind
function jamunbind(type) { // @return jam:
    return _jameach(this, uuevunbind, type);
}

// jam.show
function jamshow(a) { // @return jam:
    return _jammap(this, uu.css.show, a);
}

// jam.hide
function jamhide(a) { // @return jam:
    return _jammap(this, uu.css.hide, a);
}

// jam.hover
function jamhover(enter, leave) { // @return jam:
    return _jameach(this, uuev.hover, enter, leave);
}

// jam.html
function jamhtml(a) { // @return jam:
    function _jamhtml(node, value) {
        return (value === void 0) ? node.innerHTML
                                  : (uunode(node, uunodeclear(node)), node);
    }
    return _jammap(this, _jamhtml, a);
}

// jam.text
function jamtext(a) { // @return jam:
    return _jammap(this, uutext, a);
}

// jam.val
function jamval(a) { // @return jam:
    return _jammap(this, uuval, a);
}

// inner - node iterator
function _jameach(jam, fn, p1, p2, p3, p4) {
    var v, ary = jam._ns, i = -1;

    while ( (v = ary[++i]) ) {
        if (v && v.nodeType === 11) { // 11: DocumentFragment
            v = v.firstChild || v;
        }
        fn(v, p1, p2, p3, p4);
    }
    return jam;
}

// inner - node iterator
function _jammap(jam, fn, p1, p2, p3, p4) {
    var rv = [], ary = jam._ns, w, v, i = -1, r = 0;

    while ( (v = ary[++i]) ) {
        if (v && v.nodeType === 11) { // 11: DocumentFragment
            v = v.firstChild || v;
        }
        rv[i] = w = fn(v, p1, p2, p3, p4);
        r || (r = (v === w) ? 1 : 2); // 1: r is node
    }
    return (r < 2) ? jam : rv; // return jam or [result, ...]
}

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
    uujam.prototype[v] = function jambind(fn) { // uu("li").click(fn) -> jam
        return _jameach(this, uuev, v, fn);
    };
    uujam.prototype["un" + v] = function jamunbind() { // uu("li").unclick() -> jam
        return _jameach(this, uuevunbind, v);
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

//{mb [IE] fix mem leak
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
//}mb

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

    uumix(_camelhash(uufix._db, _webkit ? uu.cs(_html) : _html.style),
                     styles, uuattr._hash);
    uunodeid(_html);
    while ( (v = nodeList[++i]) ) {
        v.nodeType === 1 && uunodeid(v); // 1: ELEMENT_NODE
    }
}, 2); // 2: high(system) order

// inner -
function _camelhash(rv, props) {
    function _camelize(m, c) {
        return c.toUpperCase();
    }
    function _decamelize(m, c, C) {
        return c + "-" + C.toLowerCase();
    }
    var i, v, CAMELIZE = /-([a-z])/g, DECAMELIZE = /([a-z])([A-Z])/g;

    for (i in props) {
        if (typeof props[i] === "string") {
            _webkit && (i = props.item(i)); // i = "text-align"
            if (i.indexOf("-")) { // -webkit-xxx
                v = _webkit ? i.replace(CAMELIZE, _camelize)
                            : i.replace(DECAMELIZE, _decamelize);
                _gecko && !v.indexOf("Moz") && (v = "-moz" + v.slice(3));
                // { text-align: "textAlign", ... }
                (i !== v) && (_webkit ? (rv[i] = v) : (rv[v] = i));
            }
        }
    }
    return rv;
}

// inner - make numbering array from string
function _numary(s) {
    var r = [], k = -1, i = 0, j, a = s.split(""), z = a.length;

    for (; i < z; ++i) {
        for (j = 0; j < z; ++j) {
            r[++k] = a[i] + a[j];
        }
    }
    return r;
}

// inner - make className matcher from array
function _matcher(a) {
    return RegExp("(?:^| )(" + a.join("|") + ")(?:$|(?= ))", "g");
}

// inner - collect versions and meta informations
function _vers(slupper) { // @param Number(= 4): Silverlight upper version
                          // @return Hash: { ua, re, sl, fl, ie, ie6, ie7, ie8,
                          //    ie67, opera, webkit, chrome, safari, iphone,
                          //    quirks, xml, win, mac, unix, adv, major }
    // http://d.hatena.ne.jp/uupaa/20090603
    var sl = slupper || 4, ax, v, i = -1, doc = document,
        nu = navigator.userAgent,
        ie = !!doc.uniqueID, opera = window.opera || false,
        ua = opera ? +(opera.version().replace(/\d$/, ""))
                   : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                                exec(nu) || [,0])[1]),
        re = parseFloat(((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.
                exec(nu) || [,0])[1]).toString().replace(/[^\d\.]/g, "").
                replace(/^(\d+\.\d+)(\.(\d+))?$/,"$1$3")),
        gecko = nu.indexOf("Gecko/") > 0,
        webkit = nu.indexOf("WebKit") > 0,
        chrome = nu.indexOf("Chrome") > 0,
        html = doc.getElementsByTagName("html")[0],
        ary = [html.className.replace(/ifnojs|addua|addos/g, ""), "ifjs"],
        id = "adv,major", cn = html.className,
        rv = { ua: ua, re: re, sl: 0, fl: 0,
               ie: ie, ie6: ie && ua === 6, ie7: ie && ua === 7,
               ie8: ie && (doc.documentMode || 0) === 8,
               opera: !!opera, gecko: gecko,
               webkit: webkit, chrome: chrome, 
               safari: !chrome && nu.indexOf("Safari") > 0,
               iphone: webkit && /iPod|iPhone/.test(nu),
               quirks: (doc.compatMode || "") !== "CSS1Compat",
               xml: uue().tagName === uue("DIV").tagName,
               win: nu.indexOf("Win") > 0, mac: nu.indexOf("Mac") > 0, 
               unix: /X11|Linux/.test(nu) };

  //{mb Flash version (version 7.0 ~ later)
    try {
        ax = ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                : navigator.plugins["Shockwave Flash"];
        v = /\d+\.\d+/.exec(ie ? ax.GetVariable("$version").replace(/,/g, ".")
                               : ax.description);
        rv.fl = v ? parseFloat(v[0], 10) : 0;
    } catch(err) {}
  //}mb

  //{mb Silverlight version (version 3.0 ~ later)
    if (sl >= 3) {
        try {
            ax = ie ? new ActiveXObject("AgControl.AgControl")
                    : parseInt(/\d+\.\d+/.exec(navigator.plugins["Silverlight Plug-In"].
                                               description)[0]);
            for (; sl >= 3 && !rv.sl; --sl) {
                (ie ? ax.IsVersionSupported(sl + ".0") : ax >= sl) && (rv.sl = sl);
            }
        } catch(err) {}
    }
  //}mb

    rv.ie67  = rv.ie6 || rv.ie7;
    rv.ie678 = rv.ie6 || rv.ie7 || rv.ie8;
    rv.adv   = (gecko  && re >  1.9) || // Firefox 3.5+(1.91)
               (webkit && re >= 528) || // Safari 4+, Google Chrome 2+
               (opera  && ua >= 10.5);  // Opera10.50+
    rv.major = (ie     && ua >= 6)   || // IE 6+
               (opera  && ua >= 9.5) || // Opera 9.5+
               (gecko  && re >= 1.9) || // Firefox 3+
               (webkit && re >  524);   // Safari 3.1+, Google Chrome 1+

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

