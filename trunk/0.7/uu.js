// === Core ===
// --- user configurations ---
// window.xconfig = {
//   aria: 0,        // @param Number(= 0): 1 is enable WAI-ARIA
//   debug: 0,       // @param Number(= 0): 1 is debug mode, 0 is normal mode
//   light: 1,       // @param Number(= 1): 1 is light weight mode
//   altcss: 0,      // @param Number/Function(= 0): altcss mode
//                   //                     0 is auto, callback function
//   consel: 0,      // @param Number(= 1): 1 is enable conditional selector
//   imgdir: "img",  // @param String(= "img"): image dir
//   cssexpr: 0,     // @param Number(= 0): 1 is enable css-expression, 0 is disable
//   visited: 0,     // @param Number(= 0): 1 is E:visited activate
//   innerText: 0    // @param Number(= 0): 1 is innerText, outerHTML extend for Gecko
// };
// --- user callback functions ---
// window.xboot(uu) - DOMContentLoaded or window.onload callback handler
// window.xwin(uu) - window.onload callback handler
// window.xcanvas(uu) - canvas ready callback handler
// window.xtag(uu, node, tagid) - uu.div(tagid) ..  callback handler

var uu,    // window.uu    - uupaa.js library namespace
    uupub; // window.uupub - public data and methods

// window.uup - plugin namespace, enum plugins
function uup() { // @return Array: ["plugin-name", ...]
  return uu.hash.keys(uup);
}

// window.uuvain - global empty function(memory leak of IE is evaded)
function uuvain() {
}

uu ? ++uu.waste : (function(win, doc, _xconfig, _json) {
var _cfg    = uuarg(_xconfig, {
        aria: 0, debug: 0, light: 1, altcss: 1, consel: 1, imgdir: "img",
        cssexpr: 0, visited: 0, innerText: 0 }),
    _ver    = uuvers(_cfg.consel),
    _ie     = _ver.ie,
    _qtag   = _ie ? (uutaglegacy || 0) : uutag,
    _qklass = doc.getElementsByClassName ? uuklass : (uuklasslegacy || 0),
    _html   = doc.getElementsByTagName("html")[0], // <html>
    _head   = doc.getElementsByTagName("head")[0], // <head>
    _slice  = Array.prototype.slice, // quick toArray
    _tostr  = Object.prototype.toString, // type detector
    _guid   = 0,  // uu.guid() counter
    _colorc = {}, // color cache
    _colordb= { transparent:{ r: 0, g: 0, b: 0, a: 0, // color db
                              hex: "#000000", rgba: "rgba(0,0,0,0)" }},
    _jsondb = {}, // { jobid: fn, ... } jsonp job database
    _lazydb = {}, // { id: [[low], [mid], [high]], ... }
    _ndiddb = {}, // { nodeid: node, ... }
    _ajaxc  = {}, // ajax cache { "url": last modified date time(unit: ms), ...}
    _FIX    = {},
    _DEC2   = _numary("0123456789"),       // ["00", ...  99: "99"]
    _HEX2   = _numary("0123456789abcdef"), // ["00", ... 255: "ff"]
    _HASH   = 1, _NODE = 2, _FAKE = 4, _DATE = 8, _NULL = 16, _VOID = 32,
    _BOOL   = 64, _FUNC = 128, _NUM = 256, _STR = 1024, _ARY = 2048,
    _REX    = 4096, _CSTYLE = 8192,
    _TYPE   = { "undefined": _VOID, "boolean": _BOOL, number: _NUM, string: _STR,
                "[object Function]": _FUNC, "[object Boolean]": _BOOL,
                "[object Number]": _NUM, "[object String]": _STR,
                "[object RegExp]": _REX, "[object Array]": _ARY,
                "[object Date]": _DATE, // http://d.hatena.ne.jp/uupaa/20091006
                "[object CSSStyleDeclaration]": _CSTYLE, // [WebKit][Opera]
                "[object ComputedCSSStyleDeclaration]": _CSTYLE }, // [Gecko]
    _ATTR   = uuhash(!_ver.ie67 ? "for,htmlFor,className,class" :
                ("class,className,for,htmlFor,colspan,colSpan,accesskey," +
                "accessKey,rowspan,rowSpan,tabindex,tabIndex")),
    _STYLE  = uuhash((_ie ? "float,styleFloat,cssFloat,styleFloat"
                          : "float,cssFloat,styleFloat,cssFloat") +
                ",pos,position,w,width,h,height,x,left,y,top,o,opacity," +
                "bg,background,bgcolor,backgroundColor,bgimg,backgroundImage," +
                "bgrpt,backgroundRepeat,bgpos,backgroundPosition"),
    _EV     = "mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown," +
              "keypress,keyup,change,submit,focus,blur,contextmenu",
    _EVFIX  = _ver.gecko ? { mousewheel: "DOMMouseScroll" } :
              _ver.opera ? { contextmenu: "mousedown" } : {},
    _EVCODE = { mousedown: 1, mouseup: 2, mousemove: 3, mousewheel: 4, click: 5,
                dblclick: 6, keydown: 7, keypress: 8, keyup: 9, mouseenter: 10,
                mouseleave: 11, mouseover: 12, mouseout: 13, contextmenu: 14,
                focus: 15, blur: 16, resize: 17,
                losecapture: 0x102, DOMMouseScroll: 0x104 },
    _HTML5  = "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details," +
              "dialog,eventsource,figure,footer,header,hgroup,mark,menu," +
              "meter,nav,output,progress,section,time,video",
    _NGWORD = /(:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=|<=|>=|&=|x7b/,
    _ISO_DATE = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/,
    _FMT_BITS = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261,
                  X: 0x9261, f: 0x92, c: 0x2800, s: 0x84, j: 0xC00 },
    _FMT_PARSE = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcsj])/g,
    _JSON_SWAP = uuhash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\'),
    _JSON_UNESC = /"(\\.|[^"\\])*"/g,
    _JSON_ESCAPE = /(?:\"|\\[bfnrt\\])/g,
    _JSON_ENCODE = /[\x00-\x1F\u0080-\uFFEE]/g,
    _JSON_NGWORD = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/,
    _JAM_KLASS = { "+": uuklassadd, "-": uuklasssub, "!": uuklasstoggle },
    _QUERY_STR = /(?:([^\=]+)\=([^\;]+);?)/g,
    _HSLACOLOR = /^hsla?\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/,
    _RGBACOLOR = /^rgba?\((\d+),(\d+),(\d+)(?:,([\d\.]+))?\)/,
    _HEXCOLOR = /^#(([\da-f])([\da-f])([\da-f])([\da-f]{3})?)$/,
    _FROM_ENT = /&(?:amp|lt|gt|quot);/g,
    _EVPARSE = /^(?:(\w+)\.)?(\w+)(\+)?$/, // ^[NameSpace.]EvntType[Capture]$
    _BRACKET = /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g,
    _SPCOMMA = /^[ ,]+|[ ,]+$/g,
    _PERCENT = /[\d\.]+%/g,
    _COMMAS = /,,+/g,
    _SCHEME = /^(?:file|https?):/,
    _SPACES = /\s\s+/g,
    _TO_ENT = /[&<>"]/g,
    _SPACE = /\s+/g,
    _QUOTE = /^\s*["']?|["']?\s*$/g,
    _TAGS = /<\/?[^>]+>/g,
    _TRIM = /^\s+|\s+$/g,
    _UCS2 = /\\u([0-9a-z]{4})/g,
    _ENT = uuhash('&,&amp;,<,&lt;,>,&gt;,",&quot;,&amp;,&,&lt;,<,&gt;,>,&quot;,"');

uupub = {
  root: doc.documentElement || _html, // root or <html>(IE quirks)
  jsondb: _jsondb, // jsonp job database
  iebody: 0,       // [lazy] documentElement or <body>(IE quirks)
  ndiddb: _ndiddb, // nodeid database
  ndidseed: 0,     // nodeid counter
  DEC2: _DEC2, HEX2: _HEX2, FIX: _FIX, EVCODE: _EVCODE, HTML5TAG: _HTML5
};
_cfg.imgdir = _cfg.imgdir.replace(/\/+$/, "") + "/"; // "img" -> "img/"

// --- structure ---
uu = uumix(_uujamfactory, {     // uu(expr, ctx) -> Instance(jam)
  ver:    uumix(_ver, {         // uu.ver - version and meta infos
    lib:        0.7             //      ua, re, sl, fl, ie, ie6, ie7, ie8, ie67,
  }),                           //      opera, gecko, webkit, chrome, safari,
                                //      iphone, quirks, advanced, majority, xml, lib
  config:       _cfg,           // uu.config - { aria, debug, light, ... }
  // --- ajax / jsonp ---
  ajax:   uumix(uuajax, {       // uu.ajax(url, option = {}, fn = void 0, ngfn = void 0)
    get:        uuajaxget,      // uu.ajax.get(url, option = {}, fn, ngfn = void 0) -> guid
    post:       uuajaxpost,     // uu.ajax.post(url, data, option = {}, fn, ngfn = void 0) -> guid
    sync:       uuajaxsync,     // uu.ajax.sync(url) -> "response text"
    ifmod:      uuajaxifmod,    // uu.ajax.ifmod(url, option = {}, fn, ngfn = void 0)
    queue:      uuajaxqueue,    // uu.ajax.queue("0+1>2>3", [url, ...], [option, ...], [fn, ...], lastfn, ngfn)
    create:     uuajaxcreate,   // uu.ajax.create() -> XMLHttpRequestObject
    expire:     uuajaxexpire    // uu.ajax.expire()
  }),
  jsonp:  uumix(uujsonp, {      // uu.jsonp(url, option = {}, fn = void 0, ngfn = void 0) -> guid
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
  ary:    uumix(uuary, {
    has:        uuaryhas,       // [1][has array] uu.ary.has([1, 2], [1, 2, 3]) -> true
                                // [2][has node]  uu.ary.has(<body>, [<head>, <body>]) -> true
    each:       uuaryeach,      // uu.ary.each(ary, function(v, i) { ... })
    sort:       uuarysort,      // [1][num 0-9]   uu.ary.sort([0,1,2], "0-9")   -> [0, 1, 2]
                                // [2][num 9-0]   uu.ary.sort([0,1,2], "9-0")   -> [2, 1, 0]
                                // [3][ascii a-z] uu.ary.sort(["a","z"], "A-Z") -> ["a", "z"]
                                // [4][ascii a-z] uu.ary.sort(["a","z"], "Z-A") -> ["z", "a"]
                                // [5][user func] uu.ary.sort(["a","z"], fn)    -> ["z", "a"]
    clean:      uuaryclean,     // uu.ary.clean([,,1,2,,]) -> [1, 2]
    clone:      uuaryclone,     // uu.ary.clone([1, 2]) -> new Array(1, 2)
    unique:     uuaryunique,    // [1][unique elements] uu.ary.unique([<body>, <body>]) -> [<body>]
                                // [2][unique literals] uu.ary.uniqye([0,1,2,1,0], 1) -> [0,1,2]
    indexOf:    uuaryindexof    // uu.ary.indexOf(ary, find, index = 0) -> Number
  }),
  // [1][through]      uu.hash({ key: "val" }) -> { key: "val" }
  // [2][pair to hash] uu.hash("key", mix)     -> { key: mix }
  // [3][split(,)]     uu.hash("key,a,key2,b")         -> { key:"a",key2:"b" }
  // [4][split(;)]     uu.hash("key;a;key2;b", ";", 0) -> { key:"a",key2:"b" }
  hash:   uumix(uuhash, {
    has:        uuhashhas,      // uu.hash.has({a:1,b:2}, {a:1,b:2,c:3}) -> true
    each:       uuhasheach,     // uu.hash.each(hash, fn)
    size:       uuhashsize,     // uu.hash.size(mix) -> Number(hash length)
    keys:       uuhashkeys,     // uu.hash.keys(mix) -> [key1, key2, ...]
    css2kb:     uuhashcss2kb,   // uu.hash.css2kb([className, ...]) -> Hash
    values:     uuhashvalues,   // uu.hash.values(mix) -> [value1, value2, ...]
    indexOf:    uuhashindexof,  // uu.hash.indexOf({a: 1, b: 2, c: 2}, 2) -> "b"
    combine:    uuhashcombine,  // uu.hash.combine(keyary, valary) -> { ... }
    hasValue:   uuhashhasvalue  // uu.hash.hasValue({ a: 1, b: 2 }, 2) -> true
  }),
  each:         uueach,         // [1][array.forEach] uu.each(ary, fn)
                                // [2][hash.forEach]  uu.each(hash, fn)
  mix:          uumix,          // [1][override]     uu.mix({a:9, b:9}, {a:1}, {b:2}) -> base( {a:1, b:2} )
                                // [2][not override] uu.mix({a:9, b:9}, {a:1}, {a:2}, 0) -> base( {a:9} )
                                // [3][clone hash]   uu.mix({}, {a:1}) -> base( {a:1} )
  arg:          uuarg,          // [supply args] uu.arg({ a: 1 }, { b: 2 }) -> new Hash( { a: 1, b: 2 } )
  exp:          uuexp,          // [1][short code] uu.exp()      -> window.mix, window.ie
                                // [2][add prefix] uu.exp("pfx") -> window.pfx_mix, window.pfx_ie
  // --- attribute ---
  // [1][get all  attrs] uu.attr(node) -> { all: attrs }
  // [2][get many attrs] uu.attr(node, 1) -> { many: attrs }
  // [3][get one  attr]  uu.attr(node, "attr") -> "value"
  // [4][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
  // [5][set one  attr]  uu.attr(node, "attr", "val") -> node
  // [6][set some attrs] uu.attr(node, { attr: "val" }) -> node
  attr:   uumix(uuattr, {
    get:        uuattrget,      // [1][get one  attr]  uu.attr.get(node, "attr") -> String
                                // [2][get some attrs] uu.attr.get(node, "attr,...") -> Hash
    set:        uuattrset       // [1][set one  attr]  uu.attr.set(node, key, val ) -> node
                                // [2][set some attrs] uu.attr.set(node, { key: val, ... }) -> node
  }),
  // --- query ---
  query:  uumix(uuquery, {      // uu.query(expr, ctx = document) -> [node, ...]
    ui:         uuqueryui       // [1][query all ui instance]  uu.query.ui("", ctx) -> { name, [instance, ...] }
                                // [2][query some ui instance] uu.query.ui("slider", ctx) -> [instance, ...]
  }),
  id:           uuid,           // uu.id(expr, ctx = document) -> node
  tag:          _qtag,          // uu.tag(expr, ctx = document) -> [node, ...]
//klass:        _qklass,        // uu.klass(expr, ctx = document) -> [node, ...]
  // --- className(klass) ---
  klass:  uumix(_qklass, {      // [1][query className] uu.klass(expr, ctx = document) -> [node, ...]
    has:        uuklasshas,     // [1][has className] uu.klass.has(node, "class1 class2") -> Boolean
    add:        uuklassadd,     // [1][add className] uu.klass.add(node, "class1 class2") -> node
    sub:        uuklasssub,     // [1][sub className] uu.klass.sub(node, "class1 class2") -> node
    toggle:     uuklasstoggle   // [1][toggle className] uu.klass.toggle(node, "class1 class2") -> node
  }),
  // --- class(oop) / instance ---
  Class:  uumix(uuclass, {      // uu.Class("myclass", { proto: ... })
    guid:       uuclassguid,    // uu.Class.guid() -> Number(instance guid)
    singleton:  uuclasssingleton // uu.Class.singleton("myclass", proto)
  }),
  // [1][create instance] uu.factory("my", arg1, ...) -> new uu.Class("my")
  // [2][define and create instance] uu.factory("my2", prototype, arg1, ...)
  //                                                  -> new uu.Class("my2")
  factory:      uufactory,
  // --- color ---
  color:  uumix(uucolor, {      // uu.color("black") -> ColorHash or 0
    add:        uucoloradd,     // uu.color.add("000000black,...")
    expire:     uucolorexpire   // uu.color.expire()
  }),
  // --- event ---
  ev:     uumix(uuev, {         // [1][bind] uu.ev(node, "click", fn)
                                // [2][bind] uu.ev(node, "my.click", fn)
    has:        uuevhas,        // uu.ev.has(node, "click") -> Boolean
    stop:       uuevstop,       // uu.ev.stop(event) -> event
    unbind:     uuevunbind,     // [1][unbind all]  uu.ev.unbind(node)
                                // [2][unbind some] uu.ev.unbind(node, "click+,dblclick")
                                // [3][unbind namespace all]  uu.ev.unbind(node, "my.*")
                                // [4][unbind namespace some] uu.ev.unbind(node, "my.click+,my.dblclick")
    attach:     uuevattach,     // [protected] raw level api
    detach:     uuevdetach      // [protected] raw level api
  }),
  // --- event.ready ---
  ready:  uumix(uuready, {      // [1][DOM ready] uu.ready(fn, order = 0)
    gone: {
      dom:      0,              // 1 is DOMContentLoaded event fired
      win:      0,              // 1 is window.onload event fired called
      canvas:   0,              // 1 is <canvas> ready event fired called
      blackout: 0               // 1 is blackout (css3 cache reload)
    }
  }),
  // --- form ---
  // [1][node] uu.text("text") -> createTextNode("text")
  // [2][get]  uu.text(node) -> text or [text, ...]
  // [3][set]  uu.text(node, "text") -> node
  text:   uumix(uutext, {
    get:        uutextget,      // uu.text.get(node) -> text or [text, ...]
    set:        uutextset       // uu.text.set(node, text) -> node
  }),
  // [1][get] uu.val(node) -> val or [val, ...]
  // [2][set] uu.val(node, "val") -> node
  val:    uumix(uuval, {
    get:        uuvalget,       // uu.val.get(node) -> val or [val, ...]
    set:        uuvalset        // uu.val.set(node, val) -> node
  }),
  // --- node / node list / tag ---
  // [1][add to body] uu.node(uu.div()) -> <div>
  // [2][add to body] uu.node(uu.div(), doc.body) -> <div>
  // [3][add to context node] uu.node("<div><p>txt</p></div>", ctx) -> <div>
  node:   uumix(uunode, {
    id:   uumix(uunodeid, {     // uu.node.id(node) -> nodeid
      toNode:   uunodeidtonode, // uu.node.id.toNode(nodeid) -> node
      remove:   uunodeidremove  // uu.node.id.remove(node) -> node
    }),
    has:        uunodehas,      // uu.node.has(node, ctx) -> Boolean
    bulk:       uunodebulk,     // [1][clone] uu.node.bulk(node) -> DocumentFragment
                                // [2][build] uu.node.bulk("<p>html</p>") -> DocumentFragment
    swap:       uunodeswap,     // uu.node.swap(swapin, swapout) -> swapout node
    wrap:       uunodewrap,     // uu.node.wrap(node, wrapper) -> node
    clear:      uunodeclear,    // uu.node.clear(ctx) -> ctx
    remove:     uunoderemove    // uu.node.remove(node) -> node
  }),
  html:         uuhtml,         // uu.html(node, attr, style, tagid) -> <html>
  head:         uuhead,         // uu.head(node, attr, style, tagid) -> <head>
  body:         uubody,         // uu.body(node, attr, style, tagid) -> <body>
  img:          uuimg,          // uu.img(node, attr, style, tagid) -> <img>
  // --- string ---
  // [1] uu.fix("-webkit-shadow")   -> "-webkit-shadow"
  // [2] uu.fix("background-color") -> "backgroundColor"
  // [3] uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
  // [4] uu.fix("for")              -> "htmlFor"
  fix:          uufix,
  fmt:          uufmt,          // uu.fmt("%s-%d", var_args, ...) -> "formatted string"
  puff:         uupuff,         // uu.puff("%s-%d", ...) -> alert(uu.fmt("%s-%d", ...))
  rep:          uurep,          // uu.rep("str", n = 0) -> "strstrstr..."
  esc:          uuesc,          // uu.esc('<a href="&">') -> '&lt;a href=&quot;&amp;&quot;&gt;'
  ucs2:         uuucs2,         // uu.ucs2("string", 0) -> "\u0073"
  unesc:        uuunesc,        // uu.unesc('&lt;a href=&quot;&amp;&quot;&gt;') -> '<a href="&">'
  unucs2:       uuunucs2,       // uu.unucs2("\\u0073\\u0074\\u0072\\u0069\\u006e\\u0067") -> "string"
  trim:   uumix(uutrim, {       // uu.trim(" A  B  C ") -> "A  B  C"
    tag:        uutrimtag,      // uu.trim.tag(" <h1>A</h1>  B  <p>C</p> ") -> "A B C"
    url:        uutrimurl,      // uu.trim.url('url("http://...")') -> "http://..."
    inner:      uutriminner,    // uu.trim.inner(" A  C  B ") -> "A B C"
    quote:      uutrimquote,    // uu.trim.quote(" 'has  space' ") -> "has  space"
    bracket:    uutrimbracket   // [trim <>, [], (), {}] uu.trim.bracket(" <bracket> ") -> "bracket"
  }),
  split:  uumix(uusplit, {      // uu.split(" A  B  C ") -> ["A", "B", "C"]
    comma:      uusplitcomma    // uu.split.comma(", ,,A,,B,C, ")->["A","B","C"]
  }),
  date2str:     uudate2str,     // [1][ISO8601 now]  uu.date2str()        -> "2000-01-01T00:00:00.000Z"
                                // [2][ISO8601 date] uu.date2str(date)    -> "2000-01-01T00:00:00.000Z"
                                // [3][RFC1123 now]  uu.date2str(0, 1)    -> "Wed, 16 Sep 2009 16:18:14 GMT"
                                // [4][RFC1123 date] uu.date2str(date, 1) -> "Wed, 16 Sep 2009 16:18:14 GMT"
  str2date:     uustr2date,     // uu.str2date("2000-01-01T00:00:00[.000]Z") -> { valid, date }
  str2json:     uustr2json,     // uu.str2json(str, quote = false) -> String
  mix2json:     uumix2json,     // uu.mix2json(mix, fn = void 0, usejs = 0) -> String
  json2mix:     uujson2mix,     // uu.json2mix(str, usejs = 0) -> Mix
  // --- type ---
  has:          uuhas,          // [1] uu.has("a", "abc") -> true
                                // [2] uu.has([1], [1, 2]) -> uu.ary.has
                                // [3] uu.has({ a:1 }, { a:1, b:2 }) -> uu.hash.has
  like:         uulike,         // uu.like(mix, mix) -> Boolean
  type:         uutype,         // [1] uu.type("str") -> 0x100(uu.STR)
                                // [2] uu.type("str", uu.STR | uu.NUM) -> true
  isnum:        uuisnum,        // uu.isnum(123) -> true
  isstr:        uuisstr,        // uu.isstr("a") -> true
  isary:        uuisary,        // uu.isary([]) -> true
  isfunc:       uuisfunc,       // uu.isfunc(uuvain) -> true
  HASH:         _HASH,          // uu.HASH   - Object(Hash)
  NODE:         _NODE,          // uu.NODE   - Node
  FAKE:         _FAKE,          // uu.FAKE   - FakeArray, NodeList, arguments
  DATE:         _DATE,          // uu.DATE   - Date
  NULL:         _NULL,          // uu.NULL   - null
  VOID:         _VOID,          // uu.VOID   - undefined
  BOOL:         _BOOL,          // uu.BOOL   - Boolean
  FUNC:         _FUNC,          // uu.FUNC   - Function
  NUM:          _NUM,           // uu.NUM    - Number
  STR:          _STR,           // uu.STR    - String
  ARY:          _ARY,           // uu.ARY    - Array
  REX:          _REX,           // uu.REX    - RegExp
  // --- user agent (uu.ver.* alias) ---
  ie:           _ie,            // is IE
  ie6:          _ver.ie6,       // is IE6
  ie7:          _ver.ie7,       // is IE7
  ie8:          _ver.ie8,       // is IE8(ie8 mode)
  ie67:         _ver.ie67,      // is IE6 or IE7
  opera:        _ver.opera,     // is Opera
  gecko:        _ver.gecko,     // is Gecko
  webkit:       _ver.webkit,    // is WebKit
  // --- other ---
  js:           uujs,           // uu.js("js+expr") -> new Function("js+expr")
  ui:           uuui,           // [create instance] uu.ui(widget, placeholder, option) -> instance
  win: {
    size:       uuwinsize       // uu.win.size() -> { iw, ih, sw, sh }
  },
  guid:         uuguid,         // uu.guid() -> Number(unique)
  lazy:   uumix(uulazy, {       // uu.lazy(id = "", fn, order = 0)
    fire:       uulazyfire      // uu.lazy.fire(id = "")
  }),
  waste:        0               // uu.waste - 1+ is library reloaded, 0 is first time
});

// --- Message Pump ---
MessagePump.prototype = {
  send:         uumsgsend,      // [1][multicast] MessagePump.send([inst1, inst2], "hello") -> [result1, result2]
                                // [2][unicast]   MessagePump.send(inst, "hello") -> ["world!"]
                                // [3][broadcast] MessagePump.send(0, "hello") -> ["world!", ...]
  post:         uumsgpost,      // [1][multicast] MessagePump.post([instance, instance], "hello")
                                // [2][unicast]   MessagePump.post(instance, "hello")
                                // [3][broadcast] MessagePump.post(0, "hello")
  register:     uumsgregister,  // MessagePump.register(instance) -> this
  unregister:   uumsgunregister // MessagePump.unregister(instance) -> this
};
uu.msg = new MessagePump();     // MessagePump instance

// --- ECMAScript-262 5th ---
Array.isArray || (Array.isArray = uuisary);

//{::
uumix(Array.prototype, {
  indexOf:      arrayindexof,
  lastIndexOf:  arraylastindexof,
  every:        arrayevery,
  some:         arraysome,
  forEach:      arrayforeach,
  map:          arraymap,
  filter:       arrayfilter
}, 0, 0);
//::}

uumix(Array.prototype, {
  reduce:       arrayreduce,
  reduceRight:  arrayreduceright
}, 0, 0);

uumix(Boolean.prototype, {
  toJSON:       numbertojson
}, 0, 0);

uumix(Date.prototype, {
  toISOString:  datetoisostring,
  toJSON:       datetoisostring
}, 0, 0);

uumix(Number.prototype, {
  toJSON:       numbertojson
}, 0, 0);

uumix(String.prototype, {
  trim:         stringtrim,
  toJSON:       stringtojson
}, 0, 0);

//{::
_ver.gecko && _cfg.innerText && !win.HTMLElement.prototype.innerText &&
(function(proto) {
  proto.__defineGetter__("innerText", innertextgetter);
  proto.__defineSetter__("innerText", innertextsetter);
  proto.__defineGetter__("outerHTML", outerhtmlgetter);
  proto.__defineSetter__("outerHTML", outerhtmlsetter);
})(win.HTMLElement.prototype);
//::}

// --- uu.jam ---
uumix(uujam.prototype, {
  // --- stack ---
  back:         jamback,        // jam.back() -> jam
  find:         jamfind,        // jam.find(expr) -> jam
  // --- nodeset ---
  nth:          jamnth,         // jam.nth(= 0) -> Node / void 0
  each:         jameach,        // jam.each(fn) -> jam
  size:         jamsize,        // jam.size() -> Number
  indexOf:      jamindexOf,     // jam.indexOf(node) -> Number(-1 is not found)
  // --- node ---
  //first, prev, next, last, firstChild, lastChild, add
  remove:       jamremove,      // jam.remove() -> jam
  // [1][get] jam.attr("attr") -> ["value", ...]
  // [2][get] jam.attr("attr1,attr2") -> [{ attr1: "value", attr2: "value" }, ...]
  // [3][set] jam.attr("attr", "value") -> jam
  // [4][set] jam.attr({ attr: "value", ... }) -> jam
  attr:         jamattr,
  // [1][get] jam.css("color") -> ["red", ...]
  // [2][get] jam.css("color,width") -> [{ color: "red", width: "20px" }, ...]
  // [3][set] jam.css("color", "red") -> jam
  // [4][set] jam.css({ color: "red" }) -> jam
  css:          jamcss,
  // [1][add]    jam.klass("+className") -> jam
  // [2][sub]    jam.klass("-className") -> jam
  // [3][toggle] jam.klass("!className") -> jam
  // [4][clear]  jam.klass() -> jam
  klass:        jamklass,
  bind:         jambind,        // jam.bind("click", fn) -> jam
  unbind:       jamunbind,      // jam.unbind("click") -> jam
  tween:        jamtween,       // jam.tween(ms, param, fn) -> jam
  show:         jamshow,        // jam.show(fadein = false) -> jam
  hide:         jamhide,        // jam.hide(fadeout = false) -> jam
  //mousedown, mouseup, mousemove, mousewheel, click, dblclick, keydown,
  //keypress, keyup, change, submit, focus, blur, contextmenu
  hover:        jamhover,       // jam.hover(enter, leave) -> jam
  // [1][get] jam.html() -> ["innerHTML", ...]
  // [2][set] jam.html("<p>html</p>") -> jam
  html:         jamhtml,
  // [1][get] jam.text() -> ["innerText", ...]
  // [2][set] jam.text("html") -> jam
  text:         jamtext,
  // [1][get] jam.val() -> ["value", ...]
  // [2][set] jam.val("value") -> jam
  val:          jamval
});

// --- uu.jam (nodeset interface) ---
// uu.jam - nodeset accessor factory
function _uujamfactory(expr, ctx) {
  return new uujam(expr, ctx);
}

function uujam(expr,  // @param Node/NodeArray/String/Instance/window/document:
               ctx) { // @param Node(= void 0): context
  this._stack = [[]]; // [nodeset, ...]
  this._ns = !expr ? [] // nodeset
      : (expr === win || expr.nodeType) ? [expr] // node
      : uuisary(expr) ? expr.slice() // clone NodeArray
      : uuisstr(expr) ?
          (!expr.indexOf("<") ? [uunodebulk(expr)]  // <div> -> fragment
                              : uuquery(expr, ctx && ctx._ns ? ctx._ns.slice()
                                                             : ctx)) // query
      : (expr instanceof uujam) ? expr._ns.slice() // copy constructor
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
                fn,     // @param Function(= void 0): fn({ rv, url, code, guid, type })
                        //    rv   - String: responseText or responseXML or ""(fail)
                        //    url  - String: request url (absolute)
                        //    code - Number: status code (0, 2xx, 3xx, 4xx, 5xx)
                        //    guid - Number: request id (atom)
                        //    type - String: Content-Type( "text/css" or ""(fail) )
                ngfn,   // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
                _fn2) { // @hidden Function: for uu.ajax.queue
                        // @return Number: guid(request atom)
  function _ajaxstatechange() {
    var rv = "", type, code, lastmod, hash;

    if (xhr.readyState === 4) {
      code = xhr.status || 0;
      if ((code >= 200 && code < 300) || (!code && !url.indexOf("file:"))) {
        if (fn && !run++) {
          type = xhr.getResponseHeader("Content-Type") || "";
          method === "HEAD" || (rv = type.indexOf("xml") < 0 ? xhr.responseText
                                                             : xhr.responseXML);
          fn(hash = { code: code, rv: rv, url: url,
                      guid: guid, type: type, id: opt.id });
          _fn2 && _fn2(hash); // callback uu.ajax.queue
        }
        if (opt.ifmod) { // parse "Last-Modified" value
          lastmod = xhr.getResponseHeader("Last-Modified");
          _ajaxc[url] = lastmod ? Date.parse(lastmod) : 0; // add cache
        }
      } else {
        _ajaxng(code || ((_ver.opera && opt.ifmod) ? 304 : 400)); // [Opera]
      }
      _ajaxgc();
    }
  }
  function _ajaxng(code) {
    ngfn && !run++ &&
        ngfn({ code: code, rv: "", url: url, guid: guid, type: "", id: opt.id });
  }
  function _ajaxgc() {
    befn && uuevdetach(win, "beforeunload", befn);
    xhr && (xhr.onreadystatechange = uuvain, xhr = null); // [IE] mem leak
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
  var opt = option || {}, xhr = uuajaxcreate(),
      method = opt.method || (opt.data ? "POST" : "GET"),
      header = opt.header || [],
      guid = uuguid(), run = 0, v, i = 0, befn, div;

  // relative url -> absolute url
  if (!_SCHEME.test(url)) {
    div = doc.createElement("div");
    div.innerHTML = '<a href="' + url + '" />';
    url = div.firstChild ? div.firstChild.href
                         : /href\="([^"]+)"/.exec(div.innerHTML)[1];
  }
  opt.nocache && (url += (url.indexOf("?") < 0 ? "?" :
                          url.indexOf("&") < 0 ? ";" : "&") + "uuguid=" + guid);
  if (xhr) {
    try {
      // [Gecko] beforeunload event -> gc
      _ver.gecko && uuevattach(win, "beforeunload", befn = _ajaxabort);

      // initialize
      xhr.open(method, url, true); // GET / POST / PUT / DELETE / HEAD, Async
      xhr.onreadystatechange = _ajaxstatechange;

      // set header
      header.push("X-Requested-With", "XMLHttpRequest");
      opt.ifmod && _ajaxc[url] &&
          header.push("If-Modified-Since", uudate2str(_ajaxc[url], 1)); // GMT
      opt.data &&
          header.push("Content-Type", "application/x-www-form-urlencoded");
      while ( (v = header[i++]) ) {
        xhr.setRequestHeader(v, header[i++]);
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
  uuajax(url, uuarg(option, { data: null }), fn, ngfn);
}

// uu.ajax.post - async "POST" request
function uuajaxpost(url, data, option, fn, ngfn) { // @see uu.ajax
  uuajax(url, uuarg(option, { data: data }), fn, ngfn);
}

// uu.ajax.sync - sync "GET" request
function uuajaxsync(url) { // @param String:
                           // @return String: responseText
  try {
    var xhr = uuajaxcreate();

    xhr.open("GET", url, false); // false = sync
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(null);
    if (!xhr.status || xhr.status === 200) {
      return xhr.responseText;
    }
  } catch(err) {
    _cfg.debug &&
        alert("uu.ajax.sync error. " + err.message + url);
  }
  return "";
}

// uu.ajax.ifmod - async request with "If-Modified-Since" header
function uuajaxifmod(url, option, fn, ngfn) { // @see uu.ajax
  uuajax(url, uuarg(option, { ifmod: 1 }), fn, ngfn);
}

// uu.ajax.queue - request queue
// uu.ajax.queue("a+b>c", [url, ...], [option, ...], [fn], lastfn, ngfn)
function uuajaxqueue(cmd,    // @param String: "0>1", "0+1", "0+1>2>3"
                     urlary, // @param Array: [url, ...]
                     optary, // @param Array: [option, ...]
                     fnary,  // @param Array: [fn, ...]
                     lastfn, // @param Function(= void 0): lastfn([{ rv, url, code, guid, type }, ... ])
                     ngfn) { // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
  _uuajaxq(1, cmd, urlary, optary, fnary, lastfn || uuvain, ngfn || uuvain, []);
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
    atom.push((ajax ? uu.ajax : uu.jsonp)(ary[i], ary[i + 1],
                                          ary[i + 2], _error, _nextp));
  }
}

// uu.ajax.create - create XMLHttpRequest object
function uuajaxcreate() { // @return XMLHttpRequest/0:
  try {
    return new win.XMLHttpRequest();
  } catch (err) {
    try { // [IE6]
      return new win.ActiveXObject("Microsoft.XMLHTTP");
    } catch (err) {}
  }
  return 0;
}

// uu.ajax.expire - expire Modified Since request cache and sync xhr object
function uuajaxexpire() {
  _ajaxc = {};  // expire If-Modified-Since cache
}

// uu.jsonp - Async JSONP request
// uu.jsonp("http://example.com/a.php", {}, function(result) {});
function uujsonp(url,    // @param URLString: request url
                 option, // @param Hash(= {}): { method, timeout }
                         //   option.mehtod  - String(= "callback"):
                         //   option.timeout - Number(= 10): unit sec
                 fn,     // @param Function: fn({ rv, url, code, guid, type })
                 ngfn,   // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
                 _fn2) { // @hidden Function: for uu.jsonp.queue
                         // @return Number: guid(request atom)
  function _jsonpwatchdog() {
    _jsondb[jobid]("", 408); // 408 "Request Time-out"
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
    delete _jsondb[jobid];
  }
  var opt = option || {},
      guid = uuguid(), type = "text/javascript",
      timeout = opt.timeout || 10,
      method = opt.method || "callback",
      jobid = "j" + uuguid(),
      node = doc.createElement("script"),
      src = url + (url.indexOf("?") < 0 ? "?" :
                   url.indexOf("&") < 0 ? ";" : "&") +
                  method + "=uupub.jsondb." + jobid; // uupub.jsondb = _jobid

  _jsondb[jobid] = _jsonpjob;
  uumix(node, { type: type, charset: "utf-8", uujsonprun: 0 });
  _head.appendChild(node);
  node.setAttribute("src", src);
  setTimeout(_jsonpwatchdog, timeout * 1000);
  return guid;
}

// uu.jsonp.queue - request queue
function uujsonpqueue(cmd, urlary, optary, fnary, lastfn, ngfn) { // @see uu.ajax.queue
  _uuajaxq(0, cmd, urlary, optary, fnary, lastfn || uuvain, ngfn || uuvain, []);
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
  var type = uutype(mix), sp = split === void 0 ? "," : split;

  return (type === _ARY)  ? mix // [1]
       : (type === _FAKE) ? (_ie ? _toary(mix) : _slice.call(mix)) // [5][6]
       : (type === _STR && sp) ? mix.split(sp) // [7][8]
       : [mix]; // [2][3][4]
}

// uu.ary.has - has array
// [1][has array] uu.ary.has([1, 2], [1, 2, 3]) -> true
// [2][has node]  uu.ary.has(<body>, [<head>, <body>]) -> true
function uuaryhas(ary,   // @param Array/Mix: search element(s)
                  ctx) { // @param Array: context
                         // @return Boolean:
  if (ary === void 0) { // [IE, Fx2,Fx3] exclude undefined value
    return false;       // http://d.hatena.ne.jp/uupaa/20091022
  }
  var a = uuary(ary), i = 0, iz = a.length;

  for (; i < iz; ++i) {
    if (i in a && uuaryindexof(ctx, a[i]) < 0) {
      return false;
    }
  }
  return true;
}

// uu.ary.each - tiny Array.prototype.forEach
function uuaryeach(ary,  // @param Array:
                   fn) { // @param Function: callback
  for (var i = 0, iz = ary.length; i < iz; ++i) {
    fn(ary[i], i); // fn(value, index)
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

// uu.ary.clone - clone array
function uuaryclone(ary) { // @param Array: source
                           // @return Array: new Array
  return _slice.call(ary);
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
                      index) { // @param Number(= 0):
                               // @return Number: 0~  or  -1(not found)
  var iz = ary.length, i = index || 0;

  i = (i < 0) ? i + iz : i;
  for (; i < iz; ++i) {
    if (i in ary && ary[i] === find) {
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
  var rv = {}, i = 0, v, ary, num, split = 0;

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
    while ( (v = ary[i++]) ) {
      rv[v] = num ? +(ary[i++]) : ary[i++];
    }
  }
  return rv;
}

// uu.hash.has - has Hash
function uuhashhas(find,   // @param Hash: find { key, value, ... }
                   hash) { // @param Hash:
                           // @return Boolean:
  var v, w, i;

  for (i in find) {
    v = find[i], w = hash[i];
    if (!(i in hash) || // key not found
        (v !== w && _jsoninspect(v) !== _jsoninspect(w))) { // match JSON
      return false;
    }
  }
  return true;
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
  return (uuisary(mix) ? mix : uuhashkeys(mix)).length;
}

// uu.hash.keys - enum hash keys
function uuhashkeys(mix,    // @param Array/Hash:
                    _val) { // @hidden Boolean(= false): true is enum values
                            // @return Array: [key, ... ]
  var rv = [], ri = -1, i, iz;

  if (uuisary(mix)) {
    for (i = 0, iz = mix.length; i < iz; ++i) {
      i in mix && (rv[++ri] = _val ? mix[i] : i);
    }
  } else {
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
  var rv = {}, cs, url, v, i = 0, ary = uuary(name),
      div = doc.body.appendChild(doc.createElement("div")),
      fn = decodeURIComponent;

  while ( (v = ary[i++]) ) {
    div.className = v;
    cs = _ie ? div.currentStyle : win.getComputedStyle(div, null);
    url = uutrimurl(cs.listStyleImage);
    if (url && url.indexOf("?") > 0) {
      url.slice(url.indexOf("?") + 1).replace(_QUERY_STR, _qsparse);
    }
  }
  doc.body.removeChild(div);
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
function uuhashcombine(keyary,     // @param Array: key array
                       valary,     // @param Array: value array
                       toNumber) { // @param Number(= 0): 1 is exec parseInt()
                                   // @return Hash: { key: value, ... }
  var rv = {}, i = 0, iz = keyary.length;

  for (; i < iz; ++i) {
    rv[keyary[i]] = toNumber ? +(valary[i]) : valary[i];
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
  (uuisary(mix) ? uuaryeach : uuhasheach)(mix, fn);
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
// [1][supply args] uu.arg({ a: 1 }, { b: 2 }) -> new Hash( { a: 1, b: 2 } )
function uuarg(arg1,   // @param Hash: arg1
               arg2,   // @param Hash: arg2
               arg3) { // @param Hash(= void 0): arg3
                       // @return Hash: new Hash(mixed arg)
  return uumix(uumix({}, arg1), arg2, arg3, 0); // [1]
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
    var rv = {}, ary = node.attributes, v, w, i = 0;

    while ( (v = ary[i++]) ) {
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

// uu.attr.get - get attribute
// [1][get one  attr]  uu.attr.get(node, "attr") -> String
// [2][get some attrs] uu.attr.get(node, "attr,...") -> Hash
function uuattrget(node,    // @param Node:
                   attrs) { // @param JointString: "attr1,..."
                            // @return String/Hash: "value" (one attr)
                            //                   or { attr1: "value", ... }
  var rv = {}, ary, v, w, i = 0, ie8 = _ver.ie8, ATTR = _ATTR,
      IEFIX = { href: 1, src: 1 }; // fix a[href^="#"] for IE6, IE7

  ary = attrs.split(",");
  while ( (v = ary[i++]) ) {
    w = ATTR[v] || v;
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
  var hash, i, ATTR = _ATTR;

  uuisstr(key) ? (hash = {}, hash[key] = val) : (hash = key);
  for (i in hash) {
    node.setAttribute(ATTR[i] || i, hash[i]);
  }
  return node;
}

// --- className(klass) ---
// uu.klass.has - has className
function uuklasshas(node,   // @param Node:
                    name) { // @param JointString: "class1 class2 ..."
                            // @return Boolean:
  var m, ary, cn = node.className;

  if (!name || !cn) { return false; }
  if (name.indexOf(" ") < 0) {
    return (" " + cn + " ").indexOf(" " + name + " ") >= 0; // single
  }
  ary = uusplit(name); // multi
  m = cn.match(_matcher(ary));
  return m && m.length >= ary.length;
}

// uu.klass.add - add className
// [1][add className] uu.klass.add(node, "class1 class2") -> node
function uuklassadd(node,   // @param Node:
                    name) { // @param JointString: "class1 class2 ..."
                            // @return Node:
  node.className += " " + name; // [perf point] // uutriminner()
  return node;
}

// uu.klass.sub - remove className
// [1][sub className] uu.klass.sub(node, "class1 class2") -> node
function uuklasssub(node,   // @param Node:
                    name) { // @param JointString(= ""): "class1 class2 ..."
                            // @return Node:
  node.className =
      uutriminner(node.className.replace(_matcher(uusplit(name)), ""));
  return node;
}

// uu.klass.toggle - toggle(add / sub) className property
function uuklasstoggle(node,   // @param Node:
                       name) { // @param JointString: "class1 class2 ..."
                               // @return Node:
  (uuklasshas(node, name) ? uuklasssub : uuklassadd)(node, name);
  return node;
}

// --- Class / Instance ---
// uu.Class - create a generic class
function uuclass(name,    // @param String: class name
                 proto) { // @param Hash(= void 0): prototype object
  uuclass[name] = function() {
    var me = this;

    uuclassguid(me);
    me.init && me.init.apply(me, arguments);
    me.fin  && uuevattach(win, "unload", function() {
      me.fin();
    });
    me.msgbox || (me.msgbox = uuvain);
    uu.msg.register(me);
  };
  uuclass[name].prototype = proto || {};
}

// uu.Class.guid - get instance id
function uuclassguid(instance) { // @param Instance:
                                 // @return Number: instance id, from 1
  return instance.uuguid || (instance.uuguid = uu.guid());
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(name,    // @param String: class name
                          proto) { // @param Hash(= void 0): prototype object
                                   // @return Object: singleton class instance
  uuclass[name] = function() {
    var me = this, arg = arguments, self = arg.callee;

    if (self.instance) {
      me.stable && me.stable.apply(me, arg); // after the second
    } else {
      uuclassguid(me);
      me.init && me.init.apply(me, arg);
      me.fin  && uuevattach(win, "unload", function() {
        me.fin();
      });
      me.msgbox || (me.msgbox = uuvain);
      uu.msg.register(me);
    }
    return self.instance || (self.instance = me);
  };
  uuclass[name].prototype = proto || {};
}

// uu.factory - class factory(max args 4)
// [1][create instance] uu.factory("my", arg1, ...) -> new uu.Class("my")
// [2][define and create instance] uu.factory("my2", prototype, arg1, ...)
//                                                  -> new uu.Class("my2")
function uufactory(name,   // @param String: class name
                   arg1,   // @param Hash/Mix(= void 0): prototype or arg1
                   arg2,   // @param Mix(= void 0):
                   arg3,   // @param Mix(= void 0):
                   arg4,   // @param Mix(= void 0):
                   arg5) { // @param Mix(= void 0):
                           // @return Instance: new Class[name](arg, ...)
  if (!uuclass[name]) { // [2]
    uuclass(name, arg1); // define Class
    return new uuclass[name](arg2, arg3, arg4, arg5);
  }
  return new uuclass[name](arg1, arg2, arg3, arg4); // [1]
}

// --- color ---
// uu.color - parse color
function uucolor(str) { // @parem String: "black", "#fff", "rgba(0,0,0,0)" ...
                        // @return ColorHash/0: 0 is error
  function _p2n(n) { // percent to number
    n = ((parseFloat(n) || 0) * 2.56) | 0;
    return n > 255 ? 255 : n;
  }
  var v, m, n, r, g, b, a, add = 0, rgb = 0,
      rv = _colordb[str] || _colorc[str]
                         || _colordb[++add, v = str.toLowerCase()];

  if (!rv) {
    switch ({ "#": 1, r: 2, h: 3 }[v.charAt(0)]) {
    case 1: m = _HEXCOLOR.exec(v);
            if (m) {
              n = parseInt(m[5] ? m[1] // "#ffffff"
                                : m[2] + m[2] + m[3] + m[3] + m[4] + m[4], 16);
              rv = { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1, hex: v };
            }
            break;
    case 2: ++rgb;
    case 3: m = (rgb ? _RGBACOLOR : _HSLACOLOR).exec(v.replace(_SPACE, "").
                                                       replace(_PERCENT, _p2n));
            if (m) {
              r = m[1] | 0, g = m[2] | 0, b = m[3] | 0;
              a = m[4] ? parseFloat(m[4]) : 1;
              rv = rgb ? { r: r, g: g, b: b, a: a }
                       : uu.color.hsla2rgba({ h: r, s: g, l: b, a: a }); // depend
            }
    }
  }
  if (add && rv) {
    rv.hex  || (rv.hex  = "#" + _HEX2[rv.r] + _HEX2[rv.g] + _HEX2[rv.b]);
    rv.rgba || (rv.rgba = "rgba(" + rv.r + "," + rv.g + "," +
                                    rv.b + "," + rv.a + ")");
    _colorc[str] = rv; // add cache
  }
  return rv || 0; // ColorHash or 0
}

// uu.color.add
function uucoloradd(str) { // @param JointString: "000000black,..."
  var ary = str.split(","), i = 0, v, w, n, r, g, b;

  while ( (v = ary[i++]) ) {
    w = v.slice(0, 6);
    n = parseInt(w, 16);
    r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    _colordb[v.slice(6)] = { hex: "#" + w, r: r, g: g, b: b, a: 1,
                             rgba: "rgba(" + r + "," + g + "," + b + ",1)" };
  }
}

// uu.color.expire - expire color cache
function uucolorexpire() {
  _colorc = {};
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
  var rv = [], ri = -1, v, w, i = 0, ary = to ? uuary(to) : this._guid;

  while ( (v = ary[i++]) ) {
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
// [1][bind] uu.ev(node, "click", fn)
// [2][bind] uu.ev(node, "my.click", fn)
function uuev(node,   // @param Node:
              names,  // @param JointString: "click,click+,..."
              fn,     // @param Function/Instance: callback function
              mode) { // @param Number(= 1): 1 is attach, 2 is detach
                      // @return Node:
  function _uuevclosure(evt, fire) {
    evt = evt || win.event;
    if (!fire && !evt.code) {
      var src = evt.srcElement || evt.target, from = evt.fromElement;

      evt.node = node;
      evt.name = evt.type;
      evt.code = (_EVCODE[evt.type] || 0) & 255,
      evt.src  = (webkit && src.nodeType === 3) ? src.parentNode : src;
      evt.rel  = _ie ? ((src === from) ? evt.toElement : from)
                     : evt.relatedTarget;
      evt.px   = _ie ? (evt.clientX + iebody.scrollLeft) : evt.pageX;
      evt.py   = _ie ? (evt.clientY + iebody.scrollTop)  : evt.pageY;
      evt.ox   = evt.offsetX || evt.layerX || 0; // [offsetX] IE, Opera, WebKit
      evt.oy   = evt.offsetY || evt.layerY || 0; // [layerX]  Gecko, WebKit
    }
    handler.call(fn, evt, node);
  }
  mode = mode || 1;
  var types = node.uuevtypes || (node.uuevfn = {}, node.uuevtypes = ","),
      ary = names.split(","), v, i = 0, m, name, closure, handler,
      losecapture = "losecapture",
      webkit = _ver.webkit, iebody = uupub.iebody;

  if (mode === 1) {
    handler = uuisfunc(fn) ? fn : fn.handleEvent;
    closure = fn.uuevclosure = _uuevclosure;
  } else if (mode === 2) {
    closure = fn.uuevclosure || fn;
  }
  while ( (v = ary[i++]) ) { // v = "my.click+"
    m = _EVPARSE.exec(v); // split ["my.click+", "my", "click", "+"]
    if (m) {
      name = m[2];
      (m[3] && _ie && name === "mousemove") &&
          uuev(node, losecapture, closure, mode); // IE mouse capture

      if (types.indexOf("," + v + ",") >= 0) { // bound?
        if (mode === 2) { // detach event
          _ie && (name === losecapture) && node.releaseCapture();

          // ",dblclick," <- ",my.click+,dblclick,".replace(",my.click+,", ",")
          node.uuevtypes = node.uuevtypes.replace("," + v + ",", ",");
          node.uuevfn[v] = void 0;
          uuevdetach(node, _EVFIX[name] || name, closure, m[3]);
        }
      } else if (mode === 1) { // attach event
        _ie && (name === losecapture) && node.setCapture();

        // ",my.click+,dblclick," <- ",my.click+," + "dblclick" + ,"
        node.uuevtypes += v + ",";
        node.uuevfn[v] = closure;
        uuevattach(node, _EVFIX[name] || name, closure, m[3]);
      }
    }
  }
  return node;
}

// uu.ev.has - has event
function uuevhas(node,   // @param Node: target node
                 name) { // @param String: "click", "my.mousemove+"
                         // @return Boolean:
  return (node.uuevtypes || "").indexOf("," + name + ",") >= 0;
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
// [3][unbind namespace all]  uu.ev.unbind(node, "my.*")
// [4][unbind namespace some] uu.ev.unbind(node, "my.click+,my.dblclick")
function uuevunbind(node,    // @param Node: target node
                    names) { // @param JointString(= void 0): "click,click+,..."
                             // @return Node:
  function _eachnamespace(w) {
    !w.indexOf(ns) && uuev(node, w, node.uuevfn[w], 2);
  }
  var types = node.uuevtypes, ary, v, i = 0, ns;

  if (types && types.length > 1) { // ignore ","
    if (names) { // [2][3][4]
      ary = uusplitcomma(names);
      while ( (v = ary[i++]) ) {
        if (v.lastIndexOf(".*") > 1) { // [3] "my.*"
          ns = v.slice(0, -1); // "my."
          uuaryeach(uusplitcomma(types), _eachnamespace);
        } else { // [2][4]
          (types.indexOf("," + v + ",") >= 0) &&
              uuev(node, v, node.uuevfn[v], 2);
        }
      }
    } else { // [1]
      ary = uusplitcomma(types);
      while ( (v = ary[i++]) ) {
        uuev(node, v, node.uuevfn[v], 2);
      }
    }
  }
  return node;
}

// [protected] uu.ev.attach - attach event - raw level api
function uuevattach(node, type, fn, capture) {
  _ie ? node.attachEvent("on" + type, fn)
      : node.addEventListener(type, fn, !!(capture || 0));
}

// [protected] uu.ev.detach - detach event - raw level api
function uuevdetach(node, type, fn, capture) {
  _ie ? node.detachEvent("on" + type, fn)
      : node.removeEventListener(type, fn, !!(capture || 0));
}

// uu.ready - hook DOMContentLoaded event
// [1][DOM ready] uu.ready(fn, order = 0)
function uuready(fn,      // @param Function(= void 0): callback function
                 order) { // @param Number(= 0): uu.lazy order
  if (fn !== void 0 && !uuready.gone.blackout) {
    uuready.gone.dom ? fn(uu) : uulazy("boot", fn, order || 0); // [1] stock
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
  return node[_ver.gecko ? "textContent" : "innerText"];
}

// uu.text.set
function uutextset(node,   // @param Node:
                   text) { // @param Array/String: innerText
                           // @return Node: node
  uunode(doc.createTextNode(uuisary(text) ? text.join("") : text),
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
  var rv = [], v, i = 0, ary, multi = 0;

  if (node.tagName.toLowerCase() === "select") {
    i = node.selectedIndex;
    multi = node.multiple;
    if (i >= 0) {
      while ( (v = node.options[i++]) ) {
        v.selected && rv.push(v.value || v.text);
        if (!multi) { break; }
      }
    }
    rv = multi ? rv : (rv[0] || "");
  } else if (node.type === "radio" || node.type === "checkbox") {
    ary = node.name ? uuary(doc.getElementsByName(node.name)) : [node];
    while ( (v = ary[i++]) ) {
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
  var v, i = 0, j, jz, prop, ary, vals = uuary(val);

  if (node.tagName.toLowerCase() === "select") {
    ary = node.options, prop = "selected";
  } else if ({ checkbox: 1, radio: 1 }[node.type || ""]) {
    ary = node.name ? uuary(doc.getElementsByName(node.name)) : [node];
  }
  if (ary) {
    prop || (prop = "checked"); // prop is "selected" or "checked"
    while ( (v = ary[i++]) ) {
      v[prop] = false; // reset current state
    }
    i = 0, jz = vals.length;
    while ( (v = ary[i++]) ) {
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
    case 1: ctx = p; // break;
    case 5: ctx[fc] ? ctx[ib](n, ctx[fc]) : ctx.appendChild(n); break;
    case 4: ctx = p; // break;
    case 6: ctx.appendChild(n); break;
    case 2: p[ib](n, ctx); break;
    case 3: (p.lastChild === ctx) ? p.appendChild(n) : p[ib](n, ctx.nextSibling);
    }
  }
  return rv;
}

// uu.node.id - get nodeid
function uunodeid(node) { // @param Node:
                          // @return Number: nodeid, from 1
  return node.uuguid || (_ndiddb[node.uuguid = ++uupub.ndidseed] = node,
                         node.uuguid);
}

// uu.node.id.toNode - get node by nodeid
function uunodeidtonode(nodeid) { // @param String: nodeid
                                  // @return Node/void 0:
  return _ndiddb[nodeid];
}

// uu.node.id.remove - remove from node db
function uunodeidremove(node) { // @param Node:
                                // @return Node:
  node.uuguid && (_ndiddb[node.uuguid] = null, node.uuguid = null);
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
  var rv = _qtag("*", ctx), v, i = 0;

  while ( (v = rv[i++]) ) {
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
  return arguments.length ? _newtag.apply(_html, arguments) : _html;
}

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
  return arguments.length ? _newtag.apply(_head, arguments) : _head;
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
  return arguments.length ? _newtag.apply(doc.body, arguments) : doc.body;
}

// uu.img - create <img> element
function uuimg() {
  return arguments.length ? _newtag.apply("img", arguments)
                          : doc.createElement("img");
}

// inner - build new elements
// [1] uu.div(uu.div()) - add node
// [2] uu.div(":hello") - add text node
// [3] uu.div(uu.text("hello")) - add text node
// [4] uu.div("#tagid") - "#...." is window.xtag(uu, node, "tagid") callback
// [5] uu.div(1) - Number(from 1) is window.xtag(uu, node, 1) callback
// [6] uu.div("title,hello") - first String is uu.attr("title,hello")
// [7] uu.div({ title: "hello" }) - first Hash is uu.attr({ title: "hello" })
// [8] uu.div("", "color,red") - second String is uu.css("color,red")
// [9] uu.div("", { color: "red" }) - second Hash is uu.css({ color: "red" })
// [10] uu.a("url:http://example.com"), uu.img, uu.iframe - String("url:...")
//                                        is a.href, img.src, iframe.src
function _newtag(/* var_args */) { // @param Mix: var_args, nodes, attr/css
                                   // @this Node/String: <body>, "div"
                                   // @return Node:
  function _callback(node, tagid) {
    uunodeid(node); // register node
    xtag && win.xtag(uu, node, tagid);
  }
  function _tohash(mix) {
    return !uuisstr(mix) ? mix
         : !mix.indexOf(" ") ? uuhash(uutrim(mix), " ", 0) // " color red"
                             : uuhash(mix);                // "color,red"
  }
  var v, w, x, i = 0, j = 0, iz = arguments.length,
      xtag = uuisfunc(win.xtag), atag = { a: 1, A: 1 },
      node = this.nodeType ? this : doc.createElement(this + "");

  for (; i < iz; ++i) {
    v = arguments[i];
    switch (uutype(v)) {
    case _NODE: node.appendChild(v); break; // [1][3]
    case _NUM:  _callback(node, v); break; // [5]
    case _STR:  // [2][4][6][8][10]
      if (v) {
        w = ":#".indexOf(v.slice(0, 1));
        if (w >= 0) { // [2][4]
          x = v.slice(1); // trim ":" or "#"
          w ? _callback(node, x) : node.appendChild(doc.createTextNode(x));
          break;
        } else if (!v.indexOf("url:")) { // [10]
          node.setAttribute(atag[node.tagName] ? "href" : "src", v.slice(4)); // trim "url:"
          break;
        }
      }
    default:
      switch (j++) {
      case 0: v && uuattrset(node, _tohash(v)); break; // [6][7]
      case 1: v && uu.css.set(node, _tohash(v));       // [8][9]
      }
    }
  }
  return node;
}

// --- query ---
// uu.query - query CSS3 Selector
function uuquery(expr,  // @param String: "css > rule"
                 ctx) { // @param NodeArray/Node(= document): query context
                        // @return NodeArray: [Node, ...]
  if (doc.querySelectorAll && !_NGWORD.test(expr)) {
    if (ctx && ctx.nodeType) { // [:scope] guard
      try {
        var nl = (ctx || doc).querySelectorAll(expr);

        return _ie ? _toary(nl) : _slice.call(nl);
      } catch(err) {} // case: extend pseudo class / operators
    }
  }
  return uuquery.selectorAll(expr, ctx || doc); // depend: uu.query.js
}

// [1][query all ui instance]  uu.query.ui("", ctx) -> { name, [instance, ...] }
// [2][query some ui instance] uu.query.ui("slider", ctx) -> [instance, ...]
function uuqueryui(widget, // @param String(= ""): widget name
                   ctx) {  // @param String(= document.body): context
                           // @param Array/Hash: [instance, ...]
                           //                    { name, [instance, ...], ... }
  var rv = [], i = 0, v,
      ary = uuquery(":ui" + (widget || ""), ctx || doc.body);

  if (widget) {
    while ( (v = ary[i++]) ) {
      rv.push(v.uuui.instance);
    }
  } else {
    rv = {};
    while ( (v = ary[i++]) ) {
      rv[v.uuui.name] || (rv[v.uuui.name] = []);
      rv[v.uuui.name].push(v.uuui.instance);
    }
  }
  return rv;
}

// uu.id - query id
function uuid(expr,  // @param String: id
              ctx) { // @param Node(= document): query context
                     // @return Node:
  return (ctx || doc).getElementById(expr);
}

// uu.tag - query tagName
function uutag(expr,  // @param String: "*" or "tag"
               ctx) { // @param Node(= document): query context
                      // @return NodeArray: [Node, ...]
  return _slice.call((ctx || doc).getElementsByTagName(expr));
}

//{:: inner - getElementsByTagName for legacy browser(IE6~IE8, Opera9.2x)
function uutaglegacy(expr, ctx) {
  var nl = (ctx || doc).getElementsByTagName(expr),
      rv = [], ri = -1, v, i = 0;

  if (expr !== "*") {
    rv = _toary(nl);
  } else { // [IE] getElementsByTagName("*") has comment nodes
    while ( (v = nl[i++]) ) {
      (v.nodeType === 1) && (rv[++ri] = v); // 1: ELEMENT_NODE
    }
  }
  return rv;
}
//::}

// uu.klass - query className
function uuklass(expr,  // @param JointString: "class", "class1, ..."
                 ctx) { // @param Node(= document): query context
                        // @return NodeArray: [Node, ...]
  return _slice.call((ctx || doc).getElementsByClassName(expr));
}

//{:: inner - getElementsByClassName for legacy browser(IE6~IE8, etc...)
function uuklasslegacy(expr, ctx) {
  var nodes = (ctx || doc).getElementsByTagName("*"),
      name = uusplit(expr),
      rv = [], ri = -1, v, match, c, i = 0, nz = name.length, rex;

  (nz > 1) && (name = uuaryunique(name, 1), nz = name.length); // #fix 170b
  rex = _matcher(name);
  while ( (v = nodes[i++]) ) {
    c = v.className;
    if (c) {
      match = c.match(rex); // match = rex.exec(c);
      (match && match.length >= nz) && (rv[++ri] = v);
    }
  }
  return rv;
}
//::}

// --- string ---
// uu.fix - fix style property, attribute name
// [1] uu.fix("-webkit-shadow")   -> "-webkit-shadow"
// [2] uu.fix("background-color") -> "backgroundColor"
// [3] uu.fix("float")            -> "cssFloat" or "styleFloat"(IE)
// [4] uu.fix("for")              -> "htmlFor"
function uufix(str) { // @param String:
                      // @return String:
  return _FIX[str] || str;
}

// uu.fmt - sprintf (PHP::sprintf like function)
// uu.fmt("%s-%d", var_args, ...) -> "formatted string"
function uufmt(format            // @param String: sprintf format string
               /* var_args */) { // @param Mix: sprintf var_args
                                 // @return String: formated string
  // http://d.hatena.ne.jp/uupaa/20091214
  function _uufmtparse(m, argidx, flag, width, prec, size, types) {
    if (types === "%") { return "%"; }
    idx = argidx ? parseInt(argidx) : next++;
    var w = _FMT_BITS[types], ovf, pad,
        v = (av[idx] === void 0) ? "" : av[idx];

    w & 3 && (v = w & 1 ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
    w & 4 && (v = ((types === "s" ? v : types) || "").toString());
    w & 0x20  && (v = v >= 0 ? v : v % 0x100000000 + 0x100000000);
    w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
    w & 0x40  && flag === "#" && (v = (w & 0x100 ? "0" : "0x") + v);
    w & 0x80  && prec && (v = w & 2 ? v.toFixed(prec) : v.slice(0, prec));
    w & 0x400 && (v = _jsoninspect(v));
    w & 0x6000 && (ovf = (typeof v !== "number" || v < 0));
    w & 0x2000 && (v = ovf ? "" : String.fromCharCode(v));
    w & 0x8000 && (flag = flag === "0" ? "" : flag);
    v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();
    if (!(w & 0x800 || width === void 0 || v.length >= width)) {
      pad = uurep((!flag || flag === "#") ? " " : flag, width - v.length);
      v = ((w & 0x10 && flag === "0") && !v.indexOf("-"))
        ? ("-" + pad + v.slice(1)) : (pad + v);
    }
    return v;
  }
  var next = 1, idx = 0, av = arguments;

  return format.replace(_FMT_PARSE, _uufmtparse);
}

// uu.puff - alert + uu.fmt
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
  return str.replace(_TO_ENT, _uuescentity);
}

// inner - to/from entity
function _uuescentity(code) {
  return _ENT[code];
}

// uu.ucs2 - char to "\u0000"
function uuucs2(str,   // @param String:
                pos) { // @param Number(= 0): position
                       // @return String "\u0000" ~ "\uffff"
  var c = str.charCodeAt(pos || 0);

  return "\\u" + _HEX2[(c >> 8) & 255] + _HEX2[c & 255];
}

// uu.unesc - unescape from HTML entity
function uuunesc(str) { // @param String: '&lt;a href=&quot;&amp;&quot;&gt;'
                        // @return String: '<a href="&">'
  return str.replace(_FROM_ENT, _uuescentity);
}

// uu.unucs2 - "\u0000" to char
function uuunucs2(str) { // @param String:
                         // @return String: "\u0000" ~ "\uffff"
  function _uuunucs2(m, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  }
  return str.replace(_UCS2, _uuunucs2);
}

// uu.trim - trim both side whitespace
function uutrim(str) { // @param String: "  has  space "
                       // @return String: "has  space"
  return str.replace(_TRIM, "");
}

// uu.trim.tag - trim.inner + strip tags
function uutrimtag(str) { // @param String: " <h1>A</h1>  B  <p>C</p> "
                          // @return String: "A B C"
  return str.replace(_TRIM, "").replace(_TAGS, "").replace(_SPACES, " ");
}

// uu.trim.url - trim.inner + strip "url(" ... ")" + trim.quote
function uutrimurl(str) { // @param String: 'url("http://...")'
                          // @return String: "http://..."
  return (!str.indexOf("url(") && str.indexOf(")") === str.length - 1)
         ? str.slice(4, -1).replace(_QUOTE, "") : str;
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
  return str.replace(_BRACKET, "");
}

// uu.split - split space
function uusplit(str) { // @param String: " split  space  token "
                        // @return Array: ["split", "space", "token"]
  return str.replace(_SPACES, " ").replace(_TRIM, "").split(" ");
}

// uu.split.comma
// uu.split.comma(",,, ,,A,,,B,C,, ") -> ["A", "B", "C"]
function uusplitcomma(str) { // @param String: " split,comma,token "
                             // @return Array: ["split", "comma", "token"]
  return str.replace(_COMMAS, ",").replace(_SPCOMMA, "").split(",");
}

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
               : uuisnum(date) ? new Date(date) : date;
  var rv = "", pad0, ms;

  if (type) { // GMT(RFC1123) [3][4]
    rv = date.toUTCString();
    if (_ie && rv.indexOf("UTC") > 0) { // http://d.hatena.ne.jp/uupaa/20080515
      rv = rv.replace(/UTC/, "GMT");
      (rv.length < 29) && (rv = rv.replace(/, /, ", 0")); // [IE] fix format
    }
  } else { // [1][2]
    ms = date.getUTCMilliseconds();
    pad0 = (ms < 10) ? "00" : (ms < 100) ? "0" : "";
    rv = date.getUTCFullYear() + '-' +
            _DEC2[date.getUTCMonth() + 1] + '-' +
            _DEC2[date.getUTCDate()]      + 'T' +
            _DEC2[date.getUTCHours()]     + ':' +
            _DEC2[date.getUTCMinutes()]   + ':' +
            _DEC2[date.getUTCSeconds()]   + '.' +
            pad0 + date.getUTCMilliseconds() + 'Z';
  }
  return rv;
}

// uu.str2date - decode format time string // from ISO8601 string to Date
// [1] uu.str2date("2000-01-01T00:00:00[.000]Z") -> { valid, date }
function uustr2date(str,  // @param ISO8601DateString/RFC1123DateString:
                    rv) { // @param Hash(= void 0):
                          // @return Hash: { valid, date }
                          //         Boolean: valid, 0 or 1
                          //         DateObject: date, date object or NaN
  function _uustr2date(_, dow, d, m) {
    return dow + " " + m + " " + d;
  }

  rv || (rv = { valid: 0, date: NaN });
  var m = _ISO_DATE.exec(str);

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

// uu.mix2json
function uumix2json(mix,  // @param Mix:
                    fn,   // @param Function(= void 0): callback
                    js) { // @param Number(= 0): 0 is native JSON, 1 is js impl
                          // @return JSONString:
  return (!js && _json) ? _json.stringify(mix) || ""
                        : _jsoninspect(mix, fn);
}

// uu.json2mix
function uujson2mix(str,  // @param JSONString:
                    js) { // @param Number(= 0): 0 is native JSON, 1 is js impl
                          // @return Mix/Boolean:
  return (!js && _json) ? _json.parse(str) :
         _JSON_NGWORD.test(str.replace(_JSON_UNESC, ""))
            ? false : uujs("return " + str + ";");
}

// uu.str2json
function uustr2json(str,     // @param String:
                    quote) { // @param Boolean(= false): true is add quote(")
                             // @return String:
  function _swap(m) {
    return _JSON_SWAP[m];
  }
  function _ucs2(str, c) {
    c = str.charCodeAt(0);
    return "\\u" + _HEX2[(c >> 8) & 255] + _HEX2[c & 255];
  }
  var rv = str.replace(_JSON_ESCAPE, _swap).replace(_JSON_ENCODE, _ucs2);

  return quote ? '"' + rv + '"' : rv;
}

// inner - json inspect
function _jsoninspect(mix, fn) {
  var ary, type = uutype(mix), w, i, iz;

  switch (type) {
  case _CSTYLE:
  case _HASH: ary = []; break;
  case _NODE: return '"uuguid":' + uunodeid(mix);
  case _NULL: return "null";
  case _VOID: return "undefined";
  case _DATE: return uudate2str(mix);
  case _FUNC:
  case _BOOL:
  case _NUM:  return mix.toString();
  case _STR:  return uustr2json(mix, 1);
  case _ARY:
  case _FAKE: for (ary = [], i = 0, iz = mix.length; i < iz; ++i) {
                ary.push(_jsoninspect(mix[i], fn));
              }
              return "[" + ary + "]";
  default:    return fn ? (fn(mix) || "") : "";
  }
  if (type === _CSTYLE) {
    w = uu.webkit;
    for (i in mix) {
      if (typeof mix[i] === "string" && (w || i != (+i + ""))) { // !isNaN(i)
        w && (i = mix.item(i));
        ary.push('"' + i + '":' + uustr2json(mix[i], 1));
      }
    }
  } else {
    for (i in mix) {
      ary.push(uustr2json(i, 1) + ":" + _jsoninspect(mix[i], fn));
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
  case _HASH: return uuhashhas(mix, ctx);
  case _FAKE:
  case _ARY:  return uuaryhas(mix, ctx);
  case _STR:  return (mix.indexOf(ctx) >= 0);
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
  case _FUNC: return false;
  case _DATE: return uudate2str(mix1) === uudate2str(mix2);
  case _HASH: return (uuhashsize(mix1) === uuhashsize(mix2) &&
                        uuhashhas(mix1, mix2));
  case _FAKE: // http://d.hatena.ne.jp/uupaa/20091223
  case _ARY:  return uuary(mix1) + "" == uuary(mix2);
  }
  return mix1 === mix2;
}

// uu.type - type detection
// [1] uu.type("str") -> 0x100(uu.STR)
// [2] uu.type("str", uu.STR | uu.NUM) -> true
function uutype(mix,     // @param Mix:
                match) { // @param Number(= 0): match types
                         // @return Boolean/Number: true is match,
                         //                         false is unmatch,
                         //                         Number is matched bits
  var rv = _TYPE[typeof mix] || _TYPE[_tostr.call(mix)] ||
           (!mix ? 16 : mix.nodeType ? 2 : "length" in mix ? 4 : 1);

  return match ? !!(match & rv) : rv;
}

// uu.isnum - is number
function uuisnum(mix) { // @param Mix:
                        // @return Boolean:
  return _TYPE[_tostr.call(mix)] === _NUM;
}

// uu.isstr - is string
function uuisstr(mix) { // @param Mix:
                        // @return Boolean:
  return _TYPE[_tostr.call(mix)] === _STR;
}

// uu.isary - is array
function uuisary(mix) { // @param Mix:
                        // @return Boolean:
  return _TYPE[_tostr.call(mix)] === _ARY;
}

// uu.isfunc - is function
function uuisfunc(mix) { // @param Mix:
                         // @return Boolean:
  return _TYPE[_tostr.call(mix)] === _FUNC;
}

// --- other ---
// uu.js - eval js
// uu.js("JavaScript Expression") -> eval result
function uujs(expr) { // @param JavaScriptExpressionString:
                      // @return Mix: eval(expr) result
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
    var node = uupub.iebody;

    return { iw: node.clientWidth, ih: node.clientHeight,
             sw: node.scrollLeft,  sh: node.scrollTop };
  }
  return { iw: win.innerWidth,  ih: win.innerHeight,
           sw: win.pageXOffset, sh: win.pageYOffset };
}

// uu.guid - get unique number
function uuguid() { // @return Number: unique number, from 1
  return ++_guid;
}

// uu.lazy - lazy evaluate
function uulazy(id,      // @param String(= ""): id
                fn,      // @param Function: callback function
                order) { // @param Number(= 0): 0 is low, 1 is mid, 2 is high
  id = id || "";
  id in _lazydb || (_lazydb[id] = [[], [], []]);
  _lazydb[id][order || 0].push(fn);
}

// uu.lazy.fire
function uulazyfire(id) { // @param String(= ""): id
  id = id || "";
  if (id in _lazydb) {
    var v, i = 0, db = _lazydb[id], ary = db[2].concat(db[1], db[0]);

    delete _lazydb[id];
    while ( (v = ary[i++]) ) {
      v(uu);
    }
  }
}

// --- ECMAScript-262 5th ---
//{:: Array.prototype.indexOf
function arrayindexof(elm,   // @param Mix: searchElement
                      idx) { // @param Number(= 0): fromIndex
                             // @return Number: found index or -1
  var iz = this.length, i = idx || 0;

  i = (i < 0) ? i + iz : i;
  for (; i < iz; ++i) {
    if (i in this && this[i] === elm) {
      return i;
    }
  }
  return -1;
}

// Array.prototype.lastIndexOf
function arraylastindexof(elm,   // @param Mix: searchElement
                          idx) { // @param Number(= this.length): fromIndex
                                 // @return Number: found index or -1
  var iz = this.length, i = idx;

  i = (i < 0) ? i + iz + 1 : iz;
  while (--i >= 0) {
    if (i in this && this[i] === elm) {
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
//::}

// Array.prototype.reduce
function arrayreduce(fn,     // @param Function: callback evaluator
                     init) { // @param Mix(= void 0): initial value
                             // @return Mix:
  var z, f = 0, rv = init === z ? z : (++f, init), i = 0, iz = this.length;

  for (; i < iz; ++i) {
    i in this && (rv = f ? fn(rv, this[i], i, this) : (++f, this[i]));
  }
  if (!f) { throw ""; } // reduce of empty array with no initial value
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
  if (!f) { throw ""; } // reduce of empty array with no initial value
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
//{::
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

  !p && doc.body.appendChild(me); // orphan
  r.selectNode(me);
  div.appendChild(r.cloneContents());
  rv = div.innerHTML;
  !p && me.parentNode.removeChild(me);
  return rv;
}

// HTMLElement.prototype.outerHTML setter
function outerhtmlsetter(html) {
  var r = doc.createRange();

  r.setStartBefore(this);
  this.parentNode.replaceChild(r.createContextualFragment(html), this);
}
//::}

// --- uu.jam ---
// jam.back
function jamback() { // @return jam:
  this._ns = this._stack.pop() || [];
  return this;
}

// jam.find
function jamfind(expr) { // @return jam:
  this._stack.push(this._ns); // add stack
  this._ns = uuquery("! " + expr, this._ns);
  return this;
}

// jam.nth - nodeset[nth]
function jamnth(nth) { // @param Number(= 0):  0 is first element
                       //                   : -1 is last element
                       // @return Node:
  return this._ns[nth < 0 ? nth + this._ns.length : nth || 0];
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

uuhasheach({ first: 1, prev: 2, next: 3, last: 4,
             firstChild: 5, lastChild: 6, add: 6 }, function(pos, method) {
  // jam.first, jam.prev, jam.next, jam.last, jam.firstChild, jam.lastChild, jam.add
  // jam.lastChild(node or "<p>html</p>") -> jam
  uujam.prototype[method] = function(node) { // @param Node/HTMLString:
                                             // @return jam:
    var ary = this._ns, w, i = 0;

    if (ary.length === 1) {
      uunode(node, ary[0], pos);
    } else {
      while ( (w = ary[i++]) ) {
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
  return _jammap(this, uu.css, a, b);
}

// jam.klass
function jamklass(a) { // @return jam:
  function _clear(v) { v.className = ""; }
  var method = _JAM_KLASS[a.charAt(0)];

  return method ? _jammap(this, method, a.slice(1))
                : _jammap(this, a ? uuklassadd : _clear, a);
}

// jam.bind
function jambind(a) { // @return jam:
  return _jameach(this, uuev, a);
}

// jam.tween
function jamtween(ms, param, fn) { // @return jam
  return _jameach(this, uu.tween, ms, param, fn);
}

// jam.unbind
function jamunbind(a) { // @return jam:
  return _jameach(this, uuevunbind, a);
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
  var v, ary = jam._ns, i = 0;

  while ( (v = ary[i++]) ) {
    if (v && v.nodeType === 11) { // 11: DocumentFragment
      v = v.firstChild || v;
    }
    fn(v, p1, p2, p3, p4);
  }
  return jam;
}

// inner - node iterator
function _jammap(jam, fn, p1, p2, p3, p4) {
  var rv = [], ary = jam._ns, w, v, i = 0, r = 0;

  while ( (v = ary[i]) ) {
    if (v && v.nodeType === 11) { // 11: DocumentFragment
      v = v.firstChild || v;
    }
    rv[i++] = w = fn(v, p1, p2, p3, p4);
    r || (r = (v === w) ? 1 : 2); // 1: r is node
  }
  return (r < 2) ? jam : rv; // return jam or [result, ...]
}

// --- initialize ---
// inner - build element creator - add uu.div(), uu.a(), ...
uuaryeach(uuary("a,b,br,dd,div,dl,dt,h1,h2,h3,h4,h5,h6,i,iframe,input,li,ol," +
                "option,p,pre,select,span,table,tbody,tr,td,th,tfoot," +
                "textarea,u,ul," + _HTML5), function(v) {
  uu[v] = function(/* var_args */) { // @param Mix: var_args
    return arguments.length ? _newtag.apply(v, arguments)
                            : doc.createElement(v);
  };
});

// inner - build DOM Lv2 event handler - uu.click(), jam.click(), ...
uuaryeach(uuary(_EV), function(v) {
  uu[v] = function(node, fn) {
    return uuev(node, v, fn);
  };
  uu["un" + v] = function(node) {
    return uuev(node, v, 0, 2);
  };
  uujam.prototype[v] = function(fn) {
    return _jameach(this, uuev, v, fn);
  };
  uujam.prototype["un" + v] = function() {
    return _jameach(this, uuevunbind, v);
  };
});

try {
  _ie && doc.execCommand("BackgroundImageCache", false, true);
} catch(err) {} // ignore error(IETester / stand alone IE too)

// inner - bootstrap, WindowReadyState and DOMReadyState handler
(function(gone) {
  function _fire() {
    if (!gone.blackout && !gone.dom++) {
      _ie && (uupub.iebody = _ver.quirks ? doc.body : uupub.root); // [IE] lazy detect
      uulazy.fire("boot");
      uuisfunc(win.xboot || 0) && win.xboot(uu);
    }
  }
  function _peekie() {
    try {
      doc.firstChild.doScroll("up"), _fire();
    } catch(err) { setTimeout(_peekie, 64); }
  }
  function _windowloaded() {
    gone.win = 1;
    _fire();
    uuisfunc(win.xwin || 0) && win.xwin(uu);
    uulazy.fire("canvas");
  }
  uuevattach(win, "load", _windowloaded);
  _ie ? _peekie() : uuevattach(doc, "DOMContentLoaded", _fire);
})(uuready.gone);

// inner -
// 1. prebuild camelized hash - http://handsout.jp/slide/1894
// 2. prebuild nodeid
// 3. remove comment node(IE only) - http://d.hatena.ne.jp/uupaa/20091203/1259820356
uuready(function() {
  uumix(_camelhash(_FIX, _ver.webkit ? win.getComputedStyle(_html, null)
                                     : _html.style), _STYLE, _ATTR);
  var live = _html.getElementsByTagName("*"), v, w, ary = [], i = 0, j = 0;

  uunodeid(_html);
  while ( (v = live[i++]) ) {   // live NodeList
    w = v.nodeType;
    w === 1 ? uunodeid(v) :     // 1: ELEMENT_NODE
    w === 8 ? ary.push(v) : 0;  // 8: COMMENT_NODE (IE only)
  }
  while ( (v = ary[j++]) ) {    // [IE] static NodeArray
    v.parentNode.removeChild(v);
  }
}, 2); // 2: high order

// inner -
function _camelhash(rv, props) {
  function _camelize(m, c) {
    return c.toUpperCase();
  }
  function _decamelize(m, c, C) {
    return c + "-" + C.toLowerCase();
  }
  var i, v, webkit = _ver.webkit, gecko = _ver.gecko,
      CAMELIZE = /-([a-z])/g, DECAMELIZE = /([a-z])([A-Z])/g;

  for (i in props) {
    if (typeof props[i] === "string") {
      webkit && (i = props.item(i)); // i = "text-align"
      if (i.indexOf("-")) { // -webkit-xxx
        v = webkit ? i.replace(CAMELIZE, _camelize)
                   : i.replace(DECAMELIZE, _decamelize);
        gecko && !v.indexOf("Moz") && (v = "-moz" + v.slice(3));
        // { text-align: "textAlign", ... }
        (i !== v) && (webkit ? (rv[i] = v) : (rv[v] = i));
      }
    }
  }
  return rv;
}

// inner - make array from FakeArray/Array/Arguments
function _toary(a) {
  var r=[],i=a.length;while(i--){r[i]=a[i];}return r;
}

// inner - make numbering array from string
function _numary(s) {
  var r=[],k=-1,i=0,j,a=s.split(""),z=a.length;
  for(;i<z;++i){for(j=0;j<z;++j){r[++k]=a[i]+a[j];}}return r;
}

// inner - make className matcher from array
function _matcher(a) {
  return RegExp("(?:^| )("+a.join("|")+")(?:$|(?= ))","g");
}

})(window, document, window.xconfig || {}, window.JSON);

// window.uuvers - collect versions and meta informations
//    http://d.hatena.ne.jp/uupaa/20090603
//
// ua       - Number: User Agent version
// re       - Number: Rendering Engine version
//              (Firefox2: 1.81, Firefox3: 1.9, Firefox3.5: 1.91,
//               Safari3.1: 525, Safari4: 530)
// sl       - Number: Silverlight version(3 later)
// fl       - Number: Flash version(7 later)
// ie       - Boolean: true is IE6, IE7, IE8+
// ie6      - Boolean: true is IE6
// ie7      - Boolean: true is IE7
// ie8      - Boolean: true is IE8 (exclude IE9)
// ie67     - Boolean: true is IE67
// opera    - Boolean: true is Opera
// gecko    - Boolean: true is Gecko based browsers
// webkit   - Boolean: true is WebKit based browsers
//              (Safari, iPhone, iPod, Google Chrome)
// chrome   - Boolean: true is Google Chrome (exclude Safari, iPhone, iPod)
// safari   - Boolean: true is Safari, iPhone, iPod (exclude Google Chrome)
// iphone   - Boolean: true is iPhone, iPod
// quirks   - Boolean: true is quirks mode
// advanced - Boolean: true is Advanced browsers
//              (Firefox3.5+, Safari4+, Google Chrome2+, Opera10.50)
// majority - Boolean: true is major/majority browsers
//              (IE6+, Firefox3+, Safari3.1+, Google Chrome2+, Opera 9.5+)
// xml      - Boolean: true is XML Document, false is HTML Document
// +------ CONDITIONAL SELECTOR ------
// | IDENT         | CONDITION
// +---------------+------------------
// | "ifie"        | IE6, IE7, IE8
// | "ifie6"       | IE6
// | "ifie7"       | IE7
// | "ifie8"       | IE8
// | "ifie67"      | IE6, IE7
// | "ifopera"     | Opera9.5+
// | "ifgecko"     | Firefox3+
// | "ifwebkit"    | Safari3.1+, Google Chrome2+, iPhone, iPod
// | "ifiphone"    | iPhone, iPod
// | "ifjs"        | Enable JavaScript
// | "ifmajority"  | IE6+, Opera9.5+, Firefox3+, Safari3.1+, Google Chrome
// | "ifadvanced"  | Firefox3.5+, Safari4+, Google Chrome2+, Opera10.50
// | "ifclassic"   | not advanced browser
// +---------------+------------------
// <style>
//  div>ul { color: black }               /* for Generic browser */
//  html.ifwebkit div>ul { color: blue }  /* for Safari, Chrome, iPhone */
//  html.ifadvanced div>ul { color: red } /* for Safari4, Chrome2, Firefox3.5 */
//  html.ifclassic div>ul { color: green } /* for IE, Opera10, Firefox3 */
// </style>
function uuvers(consel,    // @param Number(= 0): 1 is add conditional selector
                slupper) { // @param Number(= 4): Silverlight upper version
                           // @return Hash: { ua, re, sl, fl, ie, ie6, ie7, ie8,
                           //                 ie67, opera, webkit, chrome,
                           //                 safari, iphone, quirks, advanced,
                           //                 majority, xml }
  var sl = slupper || 4, ax, v, doc = document,
      nv = navigator, nu = nv.userAgent,
      ie = !!doc.uniqueID, opera = window.opera,
      ua = opera ? +(opera.version().replace(/\d$/, ""))
                 : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                              exec(nu) || [,0])[1]),
      re = parseFloat(((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.
              exec(nu) || [,0])[1]).toString().replace(/[^\d\.]/g, "").
              replace(/^(\d+\.\d+)(\.(\d+))?$/,"$1$3")),
      xml = doc.createElement("p").tagName === doc.createElement("P").tagName,
      gecko  = nu.indexOf("Gecko/") > 0,
      webkit = nu.indexOf("WebKit") > 0,
      chrome = nu.indexOf("Chrome") > 0,
      html = doc.getElementsByTagName("html")[0],
      ary = "ie,ie67,opera,gecko,webkit,iphone,majority".split(","),
      cn = [html.className.replace(/ifnojs/, ""), "ifjs"], i = 0,
      rv = { ua: ua, re: re, sl: 0, fl: 0, xml: xml,
             ie: ie, ie6: ie && ua === 6, ie7: ie && ua === 7,
             ie8: ie && (doc.documentMode || 0) === 8,
             opera: !!opera, gecko: gecko,
             webkit: webkit, chrome: chrome, 
             safari: !chrome && nu.indexOf("Safari") > 0,
             iphone: webkit && /iPod|iPhone/.test(nu),
             quirks: (doc.compatMode || "") !== "CSS1Compat" };

//{:: Flash version (version 7.0 ~ later)
  try {
    ax = ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
            : nv.plugins["Shockwave Flash"];
    v = /\d+\.\d+/.exec(ie ? ax.GetVariable("$version").replace(/,/g, ".")
                           : ax.description);
    rv.fl = v ? parseFloat(v[0], 10) : 0;
  } catch(err) {}
//::}

//{:: Silverlight version (version 3.0 ~ later)
  if (sl >= 3) {
    try {
      ax = ie ? new ActiveXObject("AgControl.AgControl")
              : parseInt(/\d+\.\d+/.exec(nv.plugins["Silverlight Plug-In"].
                                         description)[0]);
      for (; sl >= 3 && !rv.sl; --sl) {
        (ie ? ax.IsVersionSupported(sl + ".0") : ax >= sl) && (rv.sl = sl);
      }
    } catch(err) {}
  }
//::}

  rv.ie67 = rv.ie6 || rv.ie7;
  rv.advanced = (gecko  && re >  1.9) || // Firefox 3.5+(1.91)
                (webkit && re >= 528) || // Safari 4+, Google Chrome 2+
                (opera  && ua >= 10.5);  // Opera10.50+
  rv.majority = (ie     && ua >= 6)   || // IE 6+
                (opera  && ua >= 9.5) || // Opera 9.5+
                (gecko  && re >= 1.9) || // Firefox 3+
                (webkit && re >  524);   // Safari 3.1+, Google Chrome 1+
  // --- conditional selector ---
  if (consel) {
    while ( (v = ary[i++]) ) {
      rv[v] && cn.push("if" + v);
    }
    rv.ie && cn.push("ifie" + rv.ua); // [IE] fix multi versioning
    cn.push(rv.advanced ? "ifadvanced" : "ifclassic");

    // <html class="..."> modify
    html.className = cn.join(" ").replace(/^\s+|\s+$/g, "").replace(/\./g, "");
  }
  return rv;
}

//{:: window.getComputedStyle() for IE6+
// http://d.hatena.ne.jp/uupaa/20091212
window.getComputedStyle || (function() {
var _PT = /pt$/, _FULL = [], _MORE = [], _BOX = [],
    _MOD = { top: 1, left: 2, width: 3, height: 4 },
    _UNIT = { m: 1, t: 2, "%": 3, o: 3 }, // em, pt, %, auto
    _THICK = (document.documentMode || 0) > 7 ? "5px" : "6px";

window.getComputedStyle = winstyle;

function winstyle(node,     // @param Node:
                  pseudo,   // @param String(= void 0):
                  option) { // @param Number(= 0x0):
                            //   0x0: enum full properties
                            //   0x1: enum more properties
                            //   0x2: enum some properties
                            // @return Hash: { prop: "val", ... }
  if (!node.currentStyle) {
    return {};
  }
  var rv = {},
      ns = node.style,
      cs = node.currentStyle,
      rs = node.runtimeStyle,
      em, rect, unit, v, w, x, i = 0, j = 0, m1, m2,
      ary = !option ? _FULL : (option === 1) ? _MORE : 0,
      stock = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                thin: "1px", medium: "3px", thick: _THICK };

  if (ary) {
    while ( (w = ary[j++]) ) {
      rv[w] = cs[w];
    }
  }

  em = parseFloat(cs.fontSize) * (_PT.test(cs.fontSize) ? 4 / 3 : 1);
  rect = node.getBoundingClientRect();

  // calc border, padding and margin size
  while ( (w = _BOX[i++]) ) {
    v = cs[w];
    if (!(v in stock)) {
      x = v;
      switch (unit = _UNIT[v.slice(-1)] || 0) {
      case 1: x = parseFloat(v) * em; break;    // em
      case 2: x = parseFloat(v) * 4 / 3; break; // pt
      case 3: m1 = ns.left, m2 = rs.left;       // %, auto
              rs.left = cs.left, ns.left = v;
              x = ns.pixelLeft, ns.left = m1, rs.left = m2;
      }
      stock[v] = unit ? x + "px" : x;
    }
    rv[w] = stock[v];
  }
  for (w in _MOD) {
    v = cs[w];
    switch (unit = _UNIT[v.slice(-1)] || 0) {
    case 1: v = parseFloat(v) * em; break;    // em
    case 2: v = parseFloat(v) * 4 / 3; break; // pt
    case 3: // %, auto
      switch (_MOD[w]) {
      case 1: v = node.offsetTop; break;
      case 2: v = node.offsetLeft; break;
      case 3: v = (node.offsetWidth  || rect.right - rect.left)
                - parseInt(rv.borderLeftWidth) - parseInt(rv.borderRightWidth)
                - parseInt(rv.paddingLeft) - parseInt(rv.paddingRight);
              v = v > 0 ? v : 0;
              break;
      case 4: v = (node.offsetHeight || rect.bottom - rect.top)
                - parseInt(rv.borderTopWidth) - parseInt(rv.borderBottomWidth)
                - parseInt(rv.paddingTop) - parseInt(rv.paddingBottom);
              v = v > 0 ? v : 0;
      }
    }
    rv[w] = unit ? v + "px" : v;
  }
  rv.fontSize = em + "px";
  rv.cssFloat = cs.styleFloat; // compat alias
  return rv;
}

// init - make _FULL, _MORE, _BOX props
(function() {
  var ary = [" "], i, w, trim = /^\s+|\s+$/g,
      cs = document.getElementsByTagName("html")[0].currentStyle;

  for (i in cs) {
    ary.push(i);
  }
  ary.sort();
  w = ary.join(" ").replace(/ (?:accelerator|behavior|hasLayout|zoom)/g, "");
  _FULL = w.replace(trim, "").split(" ");
  _MORE = w.replace(/ (?:lay\w+|rub\w+|text\w+|pageB\w+|ms\w+|scr\w+)/g, "").
    replace(/ (?:blockDirection|orphans|quotes|widows|filter|styleFloat)/g, "").
    replace(/ (?:imeMode|writingMode|unicodeBidi|emptyCells|tableLayout)/g, "").
    replace(/ (?:border(?:Color|Style|Width)|margin|padding|outline) /g, " ").
    replace(/ (border\w+Width|margin\w+|padding\w+)/g, function(_, m) {
      return _BOX.push(m), _;
    }).replace(trim, "").concat(" textAlign textOverflow textIndent").
    split(" ").sort();
})();

})();
//::}

