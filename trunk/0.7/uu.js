// === Core ===
// --- user configurations ---
// window.xconfig = {
//   aria: 0,        // @param Number(= 0): 1 is enable WAI-ARIA
//   debug: 0,       // @param Number(= 0): 1 is debug mode, 0 is normal mode
//   light: 1,       // @param Number(= 1): 1 is light weight mode
//   consel: 0,      // @param Number(= 1): 1 is enable conditional selector
//   imgdir: "img",  // @param String(= "img"): image dir
//   visited: 0,     // @param Number(= 0): 1 is :visited activate
//   css3maxmin: 0,  // @param Number(= 0): max-width: min-width: and *-height
//                   //                     1 is enable, 0 is disable
//   css3markup: 0,  // @param Number(= 0): css3 markup mode,
//                   //                     0 is auto, 1 is force, -1 is disable
// };
// --- user callback functions ---
// window.xboot(uu) - DOMContentLoaded or window.onload callback handler
// window.xwin(uu) - window.onload callback handler
// window.xcanvas(uu) - canvas ready callback handler
// window.xtag(uu, node, tagid) - new tag( uu.div(), etc... ) callback handler

var uu; // library namespace

function uup() { return uu.hash.keys(uup); }; // plugin namespace
function uuvain() {} // global function, memory leak of IE is evaded

uu ? ++uu.waste : (function(win, doc, _xconfig, _cstyle, _json) {
var _config = uuarg(_xconfig, {
        aria: 0, debug: 0, light: 1, consel: 1, imgdir: "img", visited: 0,
        css3maxmin: 0, css3markup: 0 }),
    _ver    = uuvers(_config.consel),
    _ie     = _ver.ie,
    _qtag   = _ie ? uutaglegacy : uutag,
    _qklass = doc.getElementsByClassName ? uuklass : uuklasslegacy,
    _html   = doc.getElementsByTagName("html")[0], // <html>
    _head   = doc.getElementsByTagName("head")[0], // <head>
    _slice  = Array.prototype.slice, // quick toArray
    _tostr  = Object.prototype.toString, // type detector
    _guid   = 0, // uu.guid() counter
    _lazydb = {}, // { id: [[low], [mid], [high]], ... }
    _ndiddb = {}, // { nodeid: node, ... }
    _ajaxdb = {}, // { "url": last modified date time(unit: ms), ...}
    _syncxhr = 0, // [lazy] xhr object cache for uu.ajax.sync
    _jsonpdb = {}, // JSONP job db
    _FIX = {},
    _DEC2 = _numary("0123456789"),       // { 0: "00", ...  99: "99" }
    _HEX2 = _numary("0123456789abcdef"), // { 0: "00", ... 255: "ff" }
    _HASH = 1, _NODE = 2, _FAKE = 4, _RGBA = 8, _NULL = 16, _VOID = 32,
    _BOOL = 64, _NUM = 128, _STR = 256, _REX = 512, _ARY = 1024,
    _FUNC = 2048, _DATE = 4096,
    _TYPE = uuhashnum( // http://d.hatena.ne.jp/uupaa/20091006/
        "undefined,32,boolean,64,number,128,string,256,[object Boolean],64," +
        "[object Number],128,[object String],256,[object RegExp],512," +
        "[object Array],1024,[object Function],2048,[object Date],4096"),
    _ATTR = uuhash(!_ver.ie67 ? "for,htmlFor,className,class" :
            ("class,className,for,htmlFor,colspan,colSpan,accesskey," +
             "accessKey,rowspan,rowSpan,tabindex,tabIndex")),
    _STYLE = uuhash((_ie ? "float,styleFloat,cssFloat,styleFloat"
                         : "float,cssFloat,styleFloat,cssFloat") +
                ",pos,position,w,width,h,height,x,left,y,top,o,opacity," +
                "bg,background,bgcolor,backgroundColor,bgimg,backgroundImage," +
                "bgrpt,backgroundRepeat,bgpos,backgroundPosition"),
    _EVENT = "mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown," +
             "keypress,keyup,change,submit,focus,blur,contextmenu",
    _EVCODE = uuhashnum("mousedown,1,mouseup,2,mousemove,3," +
        "mousewheel,4,click,5,dblclick,6,keydown,7,keypress,8,keyup,9," +
        "mouseenter,10,mouseleave,11,mouseover,12,mouseout,13,contextmenu,14," +
        "focus,15,blur,16,losecapture,0x102,DOMMouseScroll,0x104"),
    _HTML5 = "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details," +
             "dialog,eventsource,figure,footer,header,hgroup,mark,menu," +
             "meter,nav,output,progress,section,time,video",
    _EVFIX = _ver.gecko ? { mousewheel: "DOMMouseScroll" } :
             _ver.opera ? { contextmenu: "mousedown" } : {},
    _NGWORD = /(:(a|b|co|dig|first-l|li|mom|ne|p|sc|t|v))|!=|\/=|<=|>=|&=|x7b/,
    _ISO_DATE = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.(\d*))?Z$/,
    _FMT_BITS = uuhashnum("i,32785,d,32785,u,32801,o,33121,x,33377,X,37473," +
                       "f,146,c,10240,A,18432,s,132,%,3076,j,67584"),
    _FMT_PARSE = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcAsj])/g,
    _JSON_SWAP = uuhash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\'),
    _JSON_UNESC = /"(\\.|[^"\\])*"/g,
    _JSON_ESCAPE = /(?:\"|\\[bfnrt\\])/g,
    _JSON_ENCODE = /[\x00-\x1F\u0080-\uFFEE]/g,
    _JSON_NGWORD = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/,
    _JAM_KLASS = { "+": uuklassadd, "-": uuklasssub, "!": uuklasstoggle },
    _QUERY_STR = /(?:([^\=]+)\=([^\;]+);?)/g,
    _FROM_ENT = /&(?:amp|lt|gt|quot);/g,
    _EVPARSE = /^(?:(\w+)\.)?(\w+)(\+)?$/, // ^[NameSpace.]EvntType[Capture]$
    _BRACKET = /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g,
    _SPCOMMA = /^[ ,]+|[ ,]+$/g,
    _COMMAS = /,,+/g,
    _SCHEME = /^(file|https?):/,
    _SPACES = /\s\s+/g,
    _TO_ENT = /[&<>"]/g,
    _QUOTE = /^\s*["']?|["']?\s*$/g,
    _TAGS = /<\/?[^>]+>/g,
    _TRIM = /^\s+|\s+$/g,
    _UCS2 = /\\u([0-9a-z]{4})/g,
    _ENT = uuhash("&,&amp;,<,&lt;,>,&gt;,\",&quot;," +
                  "&amp;,&,&lt;,<,&gt;,>,&quot;,\""),
    _dmz = { root: doc.documentElement || _html, // root or <html>(IE quirks)
             iebody: 0,       // [lazy] documentElement or <body>(IE quirks)
             ndiddb: _ndiddb, // nodeid database
             ndidseed: 0,     // nodeid counter
             DEC2: _DEC2, HEX2: _HEX2, FIX: _FIX, EVENT: _EVENT,
             EVCODE: _EVCODE, HTML5TAG: _HTML5 };

// --- structure ---
uu = uumix(_uujamfactory, {     // uu(expr, ctx) -> Instance(jam)
  ver:    uumix(_ver, {         // uu.ver - version and meta infos
    lib:        0.7             //      ua, re, sl, fl, ie, ie6, ie7, ie8, ie67,
  }),                           //      opera, gecko, webkit, chrome, safari,
                                //      iphone, quirks, advanced, majority, lib
  config:       _config,        // uu.config - { aria, debug, light, ... }
  // --- ajax / jsonp ---
  ajax:   uumix(uuajax, {       // uu.ajax(url, option = {}, fn, ngfn = void 0)
    get:        uuajaxget,      // uu.ajax.get(url, option = {}, fn, ngfn = void 0 )
    post:       uuajaxpost,     // uu.ajax.post(url, data, option = {}, fn, ngfn = void 0)
    sync:       uuajaxsync,     // uu.ajax.sync(url) -> "response text"
    ifmod:      uuajaxifmod,    // uu.ajax.ifmod(url, option = {}, fn, ngfn = void 0)
    create:     uuajaxcreate,   // uu.ajax.create() -> XMLHttpRequestObject
    gc:         uuajaxgc        // uu.ajax.gc()
  }),
  jsonp:  uumix(uujsonp, {      // uu.jsonp(url, option = {}, fn, ngfn = void 0)
    _db:        _jsonpdb        // [protected] jsonp job database
  }),
  // --- array / hash ---
  // [1][clone]             uu.ary(Array) -> new Array
  // [2][convert NodeList]  uu.ary(NodeList) -> [elm, ...]
  // [3][convert arguments] uu.ary(arguments) -> [elm, ...]
  // [4][split comma]       uu.ary("word,word") -> ["word", "word"]
  // [5][split space]       uu.ary(" word word") -> ["word", "word"]
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
    unique:     uuaryunique,    // [1][unique elements] uu.ary.unique([<body>, <body>]) -> [<body>]
                                // [2][unique literals] uu.ary.uniqye([0,1,2,1,0], 1) -> [0,1,2]
    indexOf:    uuaryindexof    // uu.ary.indexOf(ary, find, index = 0) -> Number
  }),
  // [1][through] uu.hash({ key: "val" }) -> { key: "val" }
  // [2][to hash] uu.hash("key", mix) -> { key: mix }
  // [3][to hash(split comma)] uu.hash("key,a,key2,b") -> {key: "a", key2: "b"}
  // [4][to hash(split space)] uu.hash(" key a key2 b") -> {key: "a", key2: "b"}
  hash:   uumix(uuhash, {
    num:        uuhashnum,      // uu.hash.num("key,0,key2,1") -> { key: 0, key2: 1 }
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
  // [1][get one attr]   uu.attr(node, "attr") -> "value"
  // [2][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
  // [3][set one attr]   uu.attr(node, "attr", "val") -> node
  // [4][set some attrs] uu.attr(node, { attr: "val" }) -> node
  attr:   uumix(uuattr, {
    get:        uuattrget,      // [1][get all attrs]  uu.attr.get(node) -> { all: attrs }
                                // [2][get many attrs] uu.attr.get(node, 1) -> { many: attrs }
                                // [3][get one attr]   uu.attr.get(node, "attr") -> String
                                // [4][get some attrs] uu.attr.get(node, "attr,...") -> Hash
    set:        uuattrset       // [1][set some attrs] uu.attr.set(node, { id: "hoge" }) -> node
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
  str2json:     uustr2json,     // uu.str2json(str) -> String
  mix2json:     uumix2json,     // uu.mix2json(mix, fn = void 0, usejs = 0) -> String
  json2mix:     uujson2mix,     // uu.json2mix(str, usejs = 0) -> Mix
  // --- type ---
  type:         uutype,         // [1] uu.type("str") -> 0x100(uu.STR)
                                // [2] uu.type("str", uu.STR | uu.NUM) -> true
  isnum:        uuisnum,        // uu.isnum(123) -> true
  isstr:        uuisstr,        // uu.isstr("a") -> true
  isary:        uuisary,        // uu.isary([]) -> true
  isfunc:       uuisfunc,       // uu.isfunc(uuvain) -> true
  HASH:         _HASH,          // uu.HASH   - Object(Hash)
  NODE:         _NODE,          // uu.NODE   - Node
  FAKE:         _FAKE,          // uu.FAKE   - FakeArray, NodeList, arguments
  RGBA:         _RGBA,          // uu.RGBA   - { r, g, b, a }
  NULL:         _NULL,          // uu.NULL   - null
  VOID:         _VOID,          // uu.VOID   - undefined
  BOOL:         _BOOL,          // uu.BOOL   - Boolean
  NUM:          _NUM,           // uu.NUM    - Number
  STR:          _STR,           // uu.STR    - String
  REX:          _REX,           // uu.REX    - RegExp
  ARY:          _ARY,           // uu.ARY    - Array
  FUNC:         _FUNC,          // uu.FUNC   - Function
  DATE:         _DATE,          // uu.DATE   - Date
  UNDEF:        _VOID,          // uu.UNDEF  - [alias] uu.VOID
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
  js:           uujs,           // uu.js("JavaScript Expression") -> eval(expr) result
  ui:           uuui,           // [create instance] uu.ui(widget, placeholder, option) -> instance
  guid:         uuguid,         // uu.guid() -> Number(unique)
  lazy:   uumix(uulazy, {       // uu.lazy(id = "", fn, order = 0)
    fire:       uulazyfire      // uu.lazy.fire(id = "")
  }),
  dmz:          _dmz,           // uu.dmz - public data and methods
  waste:        0               // uu.waste - 1+ is library reloaded, 0 is first time
});

// --- message pump ---
MessagePump.prototype = {
  regist:       uumsgregist,    // uu.msg.regist(instance) -> this
  unregist:     uumsgunregist,  // uu.msg.unregist(instance) -> this
  send:         uumsgsend,      // [1][multicast] uu.msg.send([inst1, inst2], "hello") -> [result1, result2]
                                // [2][unicast]   uu.msg.send(inst, "hello") -> "world!"
                                // [3][broadcast] uu.msg.send(0, "hello") -> ["world!", ...]
  post:         uumsgpost       // [1][multicast] uu.msg.post([instance, instance], "hello")
                                // [2][unicast]   uu.mgg.post(instance, "hello")
                                // [3][broadcast] uu.msg.post(0, "hello")
};
uu.msg = new MessagePump();     // MessagePump instance

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

// === init interface ===
uu.config.imgdir = uu.config.imgdir.replace(/\/+$/, "") + "/"; // add tail(/)
// work
function _toary(a) { // make array from FakeArray/Array/Arguments
  var r=[],i=a.length;while(i--){r[i]=a[i];}return r;
}
function _numary(s) { // make numbering array from string
  var r=[],k=-1,i=0,j,a=s.split(""),z=a.length;
  for(;i<z;++i){for(j=0;j<z;++j){r[++k]=a[i]+a[j];}}return r;
}
function _matcher(a) { // make className matcher from array
  return RegExp("(?:^| )("+a.join("|")+")(?:$|(?= ))","g");
}

// --- Jam (nodeset I/F) ---
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
// uu.ajax - Async "GET" or "POST" request
// uu.ajax("http://", {}, function(txt) { alert(txt); });
// uu.ajax("http://", {}, function(txt) { uu.puff("result:%s", txt); },
//                        function(code, url) { uu.puff(url) });
function uuajax(url,    // @param URLString: request url
                option, // @param Hash(= {}): { data, header, timeout, xhr }
                        //    option.data    - Mix(= null): request data
                        //    option.header  - Array(= []): [(key, value), ...]
                        //    option.timeout - Number(= 10):  unit sec
                        //    option.xhr     - Object(= void 0): overrideMimeType
                fn,     // @param Function(= void 0): fn(txt)
                ngfn) { // @param Function(= void 0): ngfn(status, url)
  function _ajaxstatechange() {
    var ctype, lastmod;

    if (xhr.readyState === 4) {
      if ((fileScheme && !xhr.status) || xhr.status === 200) {
        if (fn && !run++) {
          ctype = xhr.getResponseHeader("content-type") || "";
          fn(ctype.indexOf("xml") < 0 ? xhr.responseText       // text
                                      : xhr.responseXML, url); // xml
        }
        if (ifmod) { // parse "Last-Modified" value
          lastmod = xhr.getResponseHeader("Last-Modified");
          _ajaxdb[url] = lastmod ? Date.parse(lastmod) : 0;
        }
      } else {
        _ajaxng(xhr.status || ((_ver.opera && ifmod) ? 304 : 400), url);
      }
      _ajaxgc();
    }
  }
  function _ajaxng(status, url) {
    (ng && !run++) && ng(status, url);
  }
  function _ajaxgc() {
    befn && uuevdetach(win, "beforeunload", befn);
    if (xhr) {
      xhr.onreadystatechange = uuvain;
      xhr = null;
    }
  }
  function _ajaxwatchdog() {
    _ajaxabort();
    _ajaxng(408, url); // 408 "Request Time-out"
    _ajaxgc();
  }
  function _ajaxabort() {
    try {
      xhr && xhr.abort();
    } catch(err) {}
  }
  option = option || {};
  var run = 0, v, i = 0, befn, div, fileScheme,
      timeout = option.timeout || 10, // 10sec
      header = option.header || [],
      ifmod = option.ifmod,
      data = option.data,
      xhr = option.xhr || uuajaxcreate(),
      ng = ngfn;

  if (!_SCHEME.test(url)) {
    div = doc.createElement("div");
    div.innerHTML = '<a href="' + url + '" />';
    url = div.firstChild ? div.firstChild.href
                         : /href\="([^"]+)"/.exec(div.innerHTML)[1];
  }
  fileScheme = !url.indexOf("file:");

  if (xhr) {
    try {
      _ver.gecko && uuevattach(win, "beforeunload", befn = _ajaxabort);
      xhr.open(data ? "POST" : "GET", url, true);
      xhr.onreadystatechange = _ajaxstatechange;
      header.push("X-Requested-With", "XMLHttpRequest");
      ifmod && _ajaxdb[url] &&
          header.push("If-Modified-Since", uudate2str(_ajaxdb[url], 1)); // GMT
      data &&
          header.push("Content-Type", "application/x-www-form-urlencoded");
      while ( (v = header[i++]) ) {
        xhr.setRequestHeader(v, header[i++]);
      }
      xhr.send(data || null);
      setTimeout(_ajaxwatchdog, timeout * 1000);
      return;
    } catch (err) {}
  }
  _ajaxng(400, url); // create object or request error
  _ajaxgc();
}

// uu.ajax.get - ASync "GET" request
function uuajaxget(url, option, fn, ngfn) { // @see uuajax params
  uuajax(url, uuarg(option, { data: null }), fn, ngfn);
}

// uu.ajax.post - ASync "POST" request
function uuajaxpost(url, data, option, fn, ngfn) { // @see uuajax params
  uuajax(url, uuarg(option, { data: data }), fn, ngfn);
}

// uu.ajax.sync - Sync "GET" request
function uuajaxsync(url) { // @param String: request url
                           // @return String: "responseText"
  try {
    var xhr = _syncxhr || (_syncxhr = uuajaxcreate());

    xhr.open("GET", url, false); // sync
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send(null);
    if (!xhr.status || xhr.status === 200) {
      return xhr.responseText;
    }
  } catch(err) {}
  return "";
}

// uu.ajax.ifmod - Async "GET" or "POST" request with "If-Modified-Since" header
function uuajaxifmod(url,    // @param URLString: request url
                     option, // @param Hash(= {}): { data, header, timeout }
                     fn,     // @param Function(= void 0): fn(txt)
                     ngfn) { // @param Function(= void 0): ngfn(status, url)
  uuajax(url, uuarg(option, { ifmod: 1 }), fn, ngfn);
}

// uu.ajax.create - create XMLHttpRequest object
function uuajaxcreate(xml) { // @param Number(= 0): 1 is Microsoft.XMLDOM
                             // @return XMLHttpRequest/XMLDOMRequest/void 0:
  var rv, name = xml ? "Microsoft.XMLDOM" : "Microsoft.XMLHTTP";

  try {
           win.XMLHttpRequest && (rv = new win.XMLHttpRequest());
    !rv && win.ActiveXObject  && (rv = new win.ActiveXObject(name));
  } catch (err) {}
  return rv;
}

// uu.ajax.gc - remove Modified Since request cache and request object
function uuajaxgc() {
  _ajaxdb = {};   // free If-Modified-Since cache
  _syncxhr = null; // free ajax.sync xhr object
}

// uu.jsonp - Async JSONP request
// uu.jsonp("http://example.com/a.php", {}, function(result) {});
function uujsonp(url,    // @param URLString: request url
                 option, // @param Hash(= {}): { method, timeout }
                         //   option.mehtod  - String(= "callback"):
                         //   option.timeout - Number(= 10): unit sec
                 fn,     // @param Function(= void 0): fn(json)
                 ngfn) { // @param Function(= void 0): ngfn(status, url)
  function _jsonpgc() {
    _head.removeChild(node);
    delete _jsonpdb[jobid];
  }
  function _jsonpwatchdog() {
    _jsonpdb[jobid]("", 408); // 408 "Request Time-out"
  }
  function _jsonpjob(json, status) {
    if (!node._run++) {
      json ? (fn && fn(json))
           : (ngfn && ngfn(status || 404, src));
      setTimeout(_jsonpgc, (timeout + 10) * 1000);
    }
  }
  option = option || {};
  var timeout = option.timeout || 10,
      method = option.method || "callback",
      jobid = "j" + uuguid(),
      node = doc.createElement("script"),
      src = url + (url.indexOf("?") < 0 ? "?" : ";") +
                  method + "=uu.jsonp._db." + jobid;

  _jsonpdb[jobid] = _jsonpjob;
  uumix(node, { type: "text/javascript", charset: "utf-8", _run: 0 });
  _head.appendChild(node);
  node.setAttribute("src", src);
  setTimeout(_jsonpwatchdog, timeout * 1000);
}

// --- array / hash ---
// uu.ary - clone array, convert array, split string
// [1][clone]             uu.ary(Array) -> new Array
// [2][convert NodeList]  uu.ary(NodeList) -> [elm, ...]
// [3][convert arguments] uu.ary(arguments) -> [elm, ...]
// [4][split comma]       uu.ary("word,word") -> ["word", "word"]
// [5][split space]       uu.ary(" word word") -> ["word", "word"]
function uuary(data) { // @param NodeList/Arguments/Array/String/Mix:
                       // @return Array:
  var rv = [], i = data.length;

  if (i) {
    rv = (typeof data === "string")
       ? (!data.indexOf(" ") ? data.slice(1).split(" ") : data.split(","))
       : (_cstyle ? _slice.call(data) : _toary(data));
  }
  return rv;
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
  var a = uuisary(ary) ? ary : [ary], i = 0, iz = a.length;

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

// uu.ary.clean - array compaction, trim null and undefined element
function uuaryclean(src) { // @param Array: source
                           // @return Array:
  var rv = [], ri = -1, v, i = 0, iz = src.length;

  for (; i < iz; ++i) {
    if (i in src) {
      v = src[i];
      (v !== null && v !== void 0) && (rv[++ri] = v);
    }
  }
  return rv;
}

// uu.ary.unique - make array from unique element
// [1][unique elements] uu.ary.unique([<body>, <body>]) -> [<body>]
// [2][unique literals] uu.ary.uniqye([0,1,2,1,0], 1) -> [0,1,2]
function uuaryunique(src,       // @param Array: source
                     literal) { // @param Number(= 0):
                                //          0 is Mix,
                                //          1 is literal(NUM, STR, BOOL) only
                                // @return Array:
  var rv = [], ri = -1, v, i = 0, j, iz = src.length, f, unq = {};

  for (; i < iz; ++i) {
    v = src[i];
    if (v !== null && v !== void 0) {
      if (literal) { // [2]
        unq[v] || (unq[v] = 1, rv[++ri] = v);
      } else { // [1]
        for (f = 0, j = i - 1; !f && j >= 0; --j) {
          f = (v === src[j]);
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
// [1][through] uu.hash({ key: "val" }) -> { key: "val" }
// [2][to hash] uu.hash("key", mix) -> { key: mix }
// [3][to hash(split comma)] uu.hash("key,a,key2,b") -> { key: "a", key2: "b" }
// [4][to hash(split space)] uu.hash(" key a key2 b") -> { key: "a", key2: "b" }
function uuhash(key,     // @param String/Hash: key
                value) { // @param Mix(= void 0): value
                         // @return Hash: { key: value, ... }
  var rv = {}, i = 0, v, ary;

  if (value !== void 0) { // [2]
    rv[key] = value;
  } else if (typeof key === "string") { // [3][4]
    ary = !key.indexOf(" ") ? key.slice(1).split(" ") : key.split(",");
    while ( (v = ary[i++]) ) {
      rv[v] = ary[i++];
    }
  } else { // [1]
    rv = key;
  }
  return rv;
}

// uu.hash.num - make { key: num } value pair
// uu.hash.num("key,0,key2,1") -> { key: 0, key2: 1 }
function uuhashnum(str) { // @param String:
                          // @return Hash:
  var rv = {}, i = 0, v, ary = str.split(",");

  while ( (v = ary[i++]) ) {
    rv[v] = +(ary[i++]);
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
        (v !== w && _jsoninsp(v) !== _jsoninsp(w))) { // match JSON
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
  return uuisary(mix) ? mix.length : uuhashkeys(mix).length;
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
  var rv = {}, cs, url, v, i = 0, ary = uuisary(name) ? name : [name],
      div = doc.body.appendChild(doc.createElement("div")),
      fn = decodeURIComponent;

  while ( (v = ary[i++]) ) {
    div.className = v;
    cs = _ie ? div.currentStyle : _cstyle(div, null);
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
    rv[keyary[i]] = toNumber ? parseInt(valary[i]) : valary[i];
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
  uuisary(mix) ? uuaryeach(mix, fn) : uuhasheach(mix, fn);
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
  return aroma ? uumix(base, aroma, void 0, override) : base;
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
// [1][get one attr]   uu.attr(node, "attr") -> "value"
// [2][get some attrs] uu.attr(node, "attr1,attr2") -> { attr1: "val", attr2: "val" }
// [3][set one attr]   uu.attr(node, "attr", "val") -> node
// [4][set some attrs] uu.attr(node, { attr: "val" }) -> node
function uuattr(node,  // @param Node:
                key,   // @param JointString/Hash(= void 0): key
                val) { // @param String(= void 0): value
                       // @return String/Hash/void 0:
  return (key === void 0 || (uuisstr(key) && val === void 0)) ?
         uuattrget(node, key) : // [1][2]
         uuattrset(node, uuhash(key, val)); // [3][4]
}

// uu.attr.get - get attribute
// [1][get all attrs]  uu.attr.get(node) -> { all: attrs }
// [2][get many attrs] uu.attr.get(node, 1) -> { many: attrs }
// [3][get one attr]   uu.attr.get(node, "attr") -> String
// [4][get some attrs] uu.attr.get(node, "attr,...") -> Hash
function uuattrget(node,    // @param Node:
                   attrs) { // @param JointString: "attr1,..."
                            // @return String/Hash: "value" (one attr)
                            //                   or { attr1: "value", ... }
  var rv = {}, ary, v, w, i = 0, ie8 = _ver.ie8, ATTR = _ATTR,
      IEFIX = { href: 1, src: 1 }; // fix a[href^="#"] for IE6, IE7

  if (!attrs || attrs === 1) { // [1] all, [2] many
    ary = node.attributes;
    while ( (v = ary[i++]) ) {
      w = v.name;
      if (!attrs) {
        rv[w] = v.value;
      } else if (v.specified && w !== "style" && w.indexOf("uu")) {
        rv[w] = v.value;
      }
    }
    return rv;
  }
  ary = attrs.split(",");
  while ( (v = ary[i++]) ) {
    w = ATTR[v] || v;
    rv[v] = (_ie ? ((ie8 || IEFIX[v]) ? node.getAttribute(v, 2) : node[w])
                 : node.getAttribute(w)) || "";
  }
  return (ary.length === 1) ? rv[ary[0]] : rv; // [3][4]
}

// uu.attr.set - set attribute
// [1][set some attrs] uu.attr.set(node, { id: "hoge" }) -> node
function uuattrset(node,   // @param Node:
                   hash) { // @param Hash: { attr1: "value", ... }
                           // @return Node:
  var i, ATTR = _ATTR;

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
    return (" " + cn + " ").indexOf(" " + name + " ") >= 0;
  }
  ary = uusplit(name);
  m = cn.match(_matcher(ary));
  return m && m.length >= ary.length;
}

// uu.klass.add - add className
// [1][add className] uu.klass.add(node, "class1 class2") -> node
function uuklassadd(node,   // @param Node:
                    name) { // @param JointString: "class1 class2 ..."
                            // @return Node:
  node.className += " " + name; // [perf point] no uutriminner()
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
    uu.msg.regist(me);
    me.send = me.msgbox;
    me.post = function(msg, param) {
      me.msgbox(msg, param);
    };
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
      uu.msg.regist(me);
      me.send = me.msgbox;
      me.post = function(msg, param) {
        me.msgbox(msg, param);
      };
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

// --- message pump ---
// uu.msg - Message Pump instance
function MessagePump() {
  this._addrdb = {};   // { guid: instance, ... }
  this._envelope = []; // [ [ guid, msg, param1, param2], ...]
  this._run = 0;
}

// uu.msg.regist - register the destination of the message
function uumsgregist(inst) { // @param Instance: class instance
  this._addrdb[uuclassguid(inst)] = inst;
}

// uu.msg.unregist
function uumsgunregist(inst) { // @param Instance: class instance
  delete this._addrdb[uuclassguid(inst)];
}

// uu.msg.send - send a message synchronously
// [1][multicast] uu.msg.send([inst1, inst2], "hello") -> [result1, result2]
// [2][unicast]   uu.msg.send(inst, "hello") -> "world!"
// [3][broadcast] uu.msg.send(0, "hello") -> ["world!", ...]
function uumsgsend(to,      // @param Array/0/instance(= 0): addr or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           0 is broadcast
                   msg,     // @param String: msg
                   param) { // @param Mix(= void 0):
                            // @return Array/Mix: [result, ...](broad or multi)
                            //                 or result(uni)
  var rv = [], v, i = 0, ary, guid;

  if (to) { // [1][2]
    ary = uuisary(to) ? to : [to];
    while ( (v = ary[i++]) ) {
      guid = (typeof v === "number") ? v : v.uuguid;
      rv.push(this._addrdb[guid].msgbox(msg, param));
    }
    return (rv.length === 1) ? rv[0] : rv;
  }
  for (i in this._addrdb) { // [3]
    rv.push(this._addrdb[i].msgbox(msg, param));
  }
  return rv;
}

// uu.msg.post - send a message asynchronously
// [1][multicast] uu.msg.post([instance, instance], "hello")
// [2][unicast]   uu.mgg.post(instance, "hello")
// [3][broadcast] uu.msg.post(0, "hello")
function uumsgpost(to,      // @param Array/0/instance(= 0): addr or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           0 is broadcast
                   msg,     // @param String: msg
                   param) { // @param Mix(= void 0): param
  function _msgloop(w, e, a, z) {
    e = me._envelope, a = me._addrdb, z = me._run = e.length;
    if (z) {
      w = e.shift(); // retrieve a envelope
      (w[0] in a) && a[w[0]].msgbox(w[1], w[2]); // msgbox(msg, param)
      setTimeout(_msgloop, 0);
    }
  }
  var me = this, v, i = 0, ary, guid;

  if (to) { // [1][2]
    ary = uuisary(to) ? to : [to];
    while ( (v = ary[i++]) ) {
      guid = (typeof v === "number") ? v : v.uuguid;
      me._envelope.push([guid, msg, param]); // stock
    }
  } else { // [3]
    for (guid in me._addrdb) {
      me._envelope.push([guid, msg, param]); // stock
    }
  }
  !me._run && _msgloop(); // lazy evaluate
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
      webkit = _ver.webkit, iebody = _dmz.iebody;

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
  var v, i = 0, j, jz, prop, ary, vals = uuisary(val) ? val : [val];

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
  return node.uuguid || (_ndiddb[node.uuguid = ++_dmz.ndidseed] = node,
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
    uunodeid(node); // regist node
    xtag && win.xtag(uu, node, tagid);
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
          x = v.slice(1);
          w ? _callback(node, x) : node.appendChild(doc.createTextNode(x));
          break;
        } else if (!v.indexOf("url:")) { // [10]
          node.setAttribute(atag[node.tagName] ? "href" : "src", v.slice(4));
          break;
        }
      }
    default:
      switch (j++) {
      case 0: v && uuattrset(node, uuhash(v)); break; // [6][7]
      case 1: v && uu.css.set(node, uuhash(v));       // [8][9]
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

        return _cstyle ? _slice.call(nl) : _toary(nl);
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

// inner - getElementsByTagName for legacy browser(Opera9.2x, IE6, IE7, IE8)
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

// uu.klass - query className
function uuklass(expr,  // @param JointString: "class", "class1, ..."
                 ctx) { // @param Node(= document): query context
                        // @return NodeArray: [Node, ...]
  return _slice.call((ctx || doc).getElementsByClassName(expr));
}

// inner - getElementsByClassName for legacy browser(IE6 - IE8, etc...)
function uuklasslegacy(expr, ctx) {
  var nodes = (ctx || doc).getElementsByTagName("*"),
      name = uusplit(expr),
      rv = [], ri = -1, v, match, c, i = 0, nz = name.length, rex;

  (nz > 1) && (name = uuaryunique(name, 1), nz = name.length); // #fix 170b
  rex = _matcher(name);
  while ( (v = nodes[i++]) ) {
    c = v.className;
    if (c) {
      match = c.match(rex); // [NG!] match = rex.exec(c);
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
  return _FIX[str] || str;
}

// uu.fmt - sprintf (PHP::sprintf like function)
// uu.fmt("%s-%d", var_args, ...) -> "formatted string"
function uufmt(format            // @param String: sprintf format string
               /* var_args */) { // @param Mix: sprintf var_args
                                 // @return String: formated string
  function _uufmtparse(m, aidx, flag, width, prec, size, types) {
    var v, w = _FMT_BITS[types], ovf;

    idx = aidx ? parseInt(aidx) : next++;

    w & 1024 || (v = (av[idx] === void 0) ? "undefined" : av[idx]);
    w & 1   && (v = parseInt(v));
    w & 2   && (v = parseFloat(v));
    w & 4   && (v = ((types === "s" ? v : types) || "").toString());
    if (w & (1 | 2) && isNaN(v)) { return ""; }

    w & 32  && (v = (v >= 0) ? v : v % 0x100000000 + 0x100000000);
    w & 256 && (v = v.toString(8));
    w & 512 && (v = v.toString(16));
    w & 64  && (flag === "#") && (v = ((w & 256) ? "0" : "0x") + v);
    w & 128 && prec && (v = (w & 2) ? v.toFixed(prec) : v.substring(0, prec));
    w & 24576 && (ovf = (typeof v !== "number" || v < 0));
    w & 8192  && (v = ovf ? "" : charCode(v));
    w & 16384 && (v = ovf ? "" : (v < 32 || v > 126) ? "." : charCode(v));
    w & 32768 && (flag = (flag === "0") ? "" : flag);
    w & 65536 && (v = uumix2json(v, 0, 1));
    v = w & 4096 ? v.toString().toUpperCase() : v.toString();
    if (w & 2048 || width === void 0 || v.length >= width) {
      return v;
    }
    // -- pad zero or space ---
    flag = flag || " ";
    size = width - v.length;
    if (flag === "0" && (w & 16) && v.indexOf("-") !== -1) {
      // "-123" -> "-00123"
      return "-" + Array(size + 1).join("0") + v.substring(1);
    }
    return Array(size + 1).join((flag === "#") ? " " : flag) + v;
  }
  var next = 1, idx = 0, av = arguments,
      charCode = String.fromCharCode;

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
                        // @return String '<a href="&">'
  return str.replace(_FROM_ENT, _uuescentity);
}

// uu.unucs2 - "\u0000" to char
function uuunucs2(str) { // @param String:
                         // @return String "\u0000" ~ "\uffff"
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
                        : _jsoninsp(mix, fn);
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
function uustr2json(str) { // @param String:
                           // @return String:
  function _swap(m) {
    return _JSON_SWAP[m];
  }
  function _ucs2(str, c) {
    c = str.charCodeAt(0);
    return "\\u" + _HEX2[(c >> 8) & 255] + _HEX2[c & 255];
  }
  return str.replace(_JSON_ESCAPE, _swap).
             replace(_JSON_ENCODE, _ucs2);
}

// inner - json inspect
function _jsoninsp(mix, fn) {
  var rv = "", ary, i, iz;

  switch (uutype(mix)) {
  case _NODE: rv = '{"uuguid":' + uunodeid(mix) + "}"; break;
  case _NULL: rv = "null"; break;
  case _VOID: rv = "undefined"; break;
  case _DATE: rv = uudate2str(mix); break;
  case _FUNC:
  case _BOOL:
  case _NUM:  rv = mix.toString(); break;
  case _STR:  rv =  '"' + uustr2json(mix) + '"'; break;
  case _ARY:
  case _FAKE: ary = [], i = 0, iz = mix.length;
              for (; i < iz; ++i) {
                ary.push(_jsoninsp(mix[i], fn));
              }
              rv =  "[" + ary.join(",") + "]"; break;
  case _RGBA:
  case _HASH: ary = [];
              for (i in mix) {
                ary.push('"' + uustr2json(i) + '":' + _jsoninsp(mix[i], fn));
              }
              rv =  "{" + ary.join(",") + "}"; break;
  default: rv = fn ? fn(mix) : "";
  }
  return rv;
}

// --- type ---
// uu.type - type detection
// [1] uu.type("str") -> 0x100(uu.STR)
// [2] uu.type("str", uu.STR | uu.NUM) -> true
function uutype(mix,     // @param Mix:
                match) { // @param Number(= 0): match types
                         // @return Boolean/Number: true is match,
                         //                         false is unmatch
                         //                         Number is matched bits
  var rv = _TYPE[typeof mix] || _TYPE[_tostr.call(mix)] ||
           (!mix ? 16 : mix.nodeType ? 2 : "length" in mix ? 4 :
            ("r" in mix && "g" in mix && "b" in mix && "a" in mix) ? 8 : 1);

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

// --- jam ---
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
uuaryeach(uuary(_EVENT), function(v) {
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
  _ie ? doc.execCommand("BackgroundImageCache", false, true)
      : _cstyle || (win.getComputedStyle = doc.defaultView.getComputedStyle);
} catch(err) {} // ignore error(IETester / stand alone IE too)

// inner - bootstrap, WindowReadyState and DOMReadyState handler
(function(gone) {
  function _fire() {
    if (!gone.blackout && !gone.dom++) {
      _ie && (_dmz.iebody = _ver.quirks ? doc.body : _dmz.root);
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

// inner - prebuild camelized hash(http://handsout.jp/slide/1894)  and nodeid
uuready(function() {
  uumix(_camelhash(_FIX, _ver.webkit ? _cstyle(_html, null) : _html.style),
        _STYLE, _ATTR);
  var nodes = uu.tag("*"), v, i = 0; // [uu.tag]

  while ( (v = nodes[i++]) ) {
    uunodeid(v);
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
  var i, v, webkit = _ver.webkit,
      CAMELIZE = /-([a-z])/g, DECAMELIZE = /([a-z])([A-Z])/g;

  for (i in props) {
    if (typeof props[i] === "string") {
      webkit && (i = props.item(i)); // i = "text-align"
      if (i.indexOf("-")) { // -webkit-xxx
        v = webkit ? i.replace(CAMELIZE, _camelize)
                   : i.replace(DECAMELIZE, _decamelize);
        // { text-align: "textAlign", ... }
        (i !== v) && (webkit ? (rv[i] = v) : (rv[v] = i));
      }
    }
  }
  return rv;
}

})(window, document, window.xconfig || {}, window.getComputedStyle, window.JSON);

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
//              (Firefox3.5+, Safari4+, Google Chrome2+)
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
// | "ifadvanced"  | Firefox3.5+, Safari4+, Google Chrome2+
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
                           // @return Hash: { ua, re, sl, fl, ie, ie6,
                           //                 ie7, ie8, ie67, opera, webkit,
                           //                 chrome, safari, iphone, quirks,
                           //                 advanced, majority }
  var sl = slupper || 4, ax, v, doc = document, html, cn,
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
      rv = { ua: ua, re: re, sl: 0, fl: 0, xml: xml,
             ie: ie, ie6: ie && ua === 6, ie7: ie && ua === 7,
             ie8: ie && (doc.documentMode || 0) === 8,
             opera: !!opera, gecko: gecko,
             webkit: webkit, chrome: chrome, 
             safari: !chrome && nu.indexOf("Safari") > 0,
             iphone: webkit && /iPod|iPhone/.test(nu),
             quirks: (doc.compatMode || "") !== "CSS1Compat" };

  // Flash version (version 7.0 ~ later)
  try {
    ax = ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
            : nv.plugins["Shockwave Flash"];
    v = /\d+\.\d+/.exec(ie ? ax.GetVariable("$version").replace(/,/g, ".")
                           : ax.description);
    rv.fl = v ? parseFloat(v[0], 10) : 0;
  } catch(err) {}

  // Silverlight version (version 3.0 ~ later)
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
  rv.ie67 = rv.ie6 || rv.ie7;
  rv.advanced = (gecko  && re >  1.9) || // Firefox 3.5+(1.91)
                (webkit && re >= 528);   // Safari 4+, Google Chrome 2+
  rv.majority = (ie     && ua >= 6)   || // IE 6+
                (opera  && ua >= 9.5) || // Opera 9.5+
                (gecko  && re >= 1.9) || // Firefox 3+
                (webkit && re >  524);   // Safari 3.1+, Google Chrome 1+
  // conditional selector
  if (consel) {
    html = doc.getElementsByTagName("html")[0];
    cn = [html.className.replace(/ifnojs/, ""), "ifjs"];
    rv.ie       && cn.push("ifie ifie" + rv.ua);
    rv.ie67     && cn.push("ifie67");
    rv.opera    && cn.push("ifopera");
    rv.gecko    && cn.push("ifgecko");
    rv.webkit   && cn.push("ifwebkit");
    rv.iphone   && cn.push("ifiphone");
    rv.majority && cn.push("ifmajority");
    cn.push(rv.advanced ? "ifadvanced" : "ifclassic");
    html.className = cn.join(" ").replace(/^\s+|\s+$/g, "").replace(/\./g, "");
  }
  return rv;
}

