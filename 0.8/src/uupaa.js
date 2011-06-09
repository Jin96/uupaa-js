/*!{id:"uupaa.js",ver:0.8,license:"MIT",author:"uupaa.js@gmail.com"}*/

// upa -off {ident}
//
//      {ident}      | disable function
//      -------------+------------------
//      storage     -> uu.storage
//      canvas      -> uu.canvas
//      socket      -> uu.socket
//      audio       -> uu.audio
//      video       -> uu.video
//      geo         -> uu.geo
//      ui          -> uu.ui
//      snippet     -> uu.snippet
//      ajax        -> uu.ajax
//      cssbox      -> uu.css.box
//      color       -> uu.color
//      fx          -> uu.fx
//      eventhashchange
//                  -> uu.event(, "hashchange")
//      eventhover  -> uu.event.hover
//      eventrollback
//                  -> uu.event.rollback
//      eventresize -> uu.event.resize
//      eventcyclic -> uu.event.cyclic
//      live        -> uu.live
//      form        -> uu.form
//      sprintf     -> uu.sprintf
//      codec       -> uu.entity, uu.base64, uu.utf8, uu.md5, uu.sha1, uu.hmac,
//                     uu.msgpack
//      image       -> uu.image
//      font        -> uu.font
//      svg         -> uu.svg
//      flash       -> uu.flash
//      cookie      -> uu.cookie
//      url         -> uu.url, uu.event(, "hashchange")
//      test        -> uu.ok, uu.ng
//      nodeset     -> uu("query"), uu.Clas.NodeSet
//      ie6         -> IE6 special functions
//      ie67        -> IE6 and IE7 special functions
//
// CSS3 Selector Browser Implementation
//      Google("CSS Compatibility and Internet Explorer")
//          -> http://msdn.microsoft.com/en-us/library/cc351024(v=vs.85).aspx
//
// Firefox 2.0(Gecko 1.8.1 end of 2008-12)
// Firefox 3.0(Gecko 1.9.0 end of 2010-03)
// Firefox 3.5(Gecko 1.9.1 end of 2010-08)
//      <audio>, <video>, offline, DnD API, @font-face, MediaQuery,
//      text-shadow:, word-wrap: box-shadow:, box-image:,
//      column-rule:, CSS Transforms, localStorage, Web Workers,
//      Geolocation API, Canvas Text API, Canvas Shadow API,
//      Canvas ImageData API, (canvas.moz-opaque)
//      MozAfterPaint Event, window.JSON
// Firefox 3.6(Gecko 1.9.2)
//      Background Gradient(-moz-linear-gradient, -moz-radial-gradient),
//      Multiple background, File API, DnD File API,
//      orientation,
// Firefox 4.0(Gecko 2.0)
//      <article> <section> <nav> <aside> <hgroup> <header> <footer>,
//      WebSockets, D2D, WebM, IndexedDB( window.moz_indexedDB ),
//      FormData, SVG Background, <img src="svg">, CSS transitions,
//      WebGL, :-moz-any(S, ...), CSS calc(),  -moz-image-rect,
//      background: -moz-element(#bg1), document.mozSetImageElement()
//      :-moz-touch, :-moz-focusring
//      :valid and :invalid for <input type="*"> (tel, color, email...)
//      :optional and :required for <input type="*" required>
//      :-moz-placeholder
//      window.mozPaintCount, window.mozRequestAnimationFrame(),
//                            window.mozAnimationStartTime
//      TouchMediaQuery(  @media all and (-moz-touch-enabled) { ... }  )
//      [Gecko]event.streamId <---> [iOS]event.touches[finger].identifier
//             event.clientX  <-!->      event.touches[finger].pageX
//      <textarea resize="none">
//          none | both | horizontal | vertical | inherit
//      canvas.mozGetAsFile()
//
// Chrome 9
//      WebGL getContext("experimental-webgl")
//          --enable-accelerated-layers option ???
//
// Opera 10.70
//      <g buffered-rendering="static">
//      HTML5 hashchange event
//
// IE9beta
//      impl:
//          opacity, multibg, background-clip, background-size, background-origin,
//          border-radius, box-shadow, RGBA, HSLA,
//      not impl:
//          text-shadow, border-image, multiple columns, gradients, transforms,
//          transitions, outline-offset, resize,
//          Web Workers, Web Sockets, Geolocation, Offline Cache
//
// iPhone
//      Portrait:
//          320x480(full), 320x460(with status bar),
//          320x356(keyboard off), 320x140(with keyboard)
//      Landscape:
//          480 x 208
//      Viewport:
//          <meta name="viewport" content="width=320, user-scalable=no" />
//          <meta name="viewport" content="width=device-width, user-scalable=no, inicial-scale=1, maximum-scale=1" />
//
//      /favicon.png -> /apple-touch-icon.png (57x57) or (129x129)
//                      or <link rel="apple-touch-icon" href="{{icon url}}" />
//      FullScreen Mode (from Home Screen)
//          <meta name="apple-mobile-web-app-capable" content="yes" />
//                  content = "yes" / "no"
//          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
//                  content = "default" / "black" / "black-translucent"
//      Format-detection:
//          <meta name="format-detection" content="telephone=no" />
//      Impl.Font:
//          HiraKakuProN-W3, HiraKakuProN-W6
//      Magic:
//          --text-size-adjust:none;
//      autocapitalize, autocorrect
//          <input type="text" autocapitalize="off" autocorrect="off">
//      CSS:
//          body { -webkit-text-size-adjust: none } // disable auto font size adjust
//          body { -webkit-touch-callout: none } // disable link action
//          -webkit-tap-highlight-color: csscolor;
//          -webkit-user-select: auto / text / none;  node -> DnD / Slider
//          -webkit-text-size-adjust: none / zoom;
//          -webkit-appearance: appearance;
//          setTimeout(scrollTo, 100, 0, 1);
//
//      StandAlone(FullScreen Mode = App Mode)
//          window.navigator.standalone = true; (MobileWebKit)
//
// Flash10.1
//      <param name="hasPriority" value="true" />
//
// <video>
//       H264 = H.264, Ogg = Ogg Theora, WebM = WebM(VP8)
//      +---------------+-------------+-------------+----------+
//      |   Browser     | uu.video    | HTML5Video  |FlashVideo|
//      +---------------+-------------+-------------+----------+
//      |Firefox 3.0    |H264         |      -      |   H264   |
//      |Firefox 3.5    |H264,Ogg     |     Ogg     |   H264   |
//      |Firefox 4.0+   |H264,Ogg,WebM|     Ogg,WebM|   H264   |
//      |Safari 3       |H264         |      -      |   H264   |
//      |Safari 4+      |H264         |H264         |   H264   |
//      |Chrome 6+      |H264,Ogg,WebM|H264,Ogg,WebM|   H264   |
//      |Chrome 10+     |H264,Ogg,WebM|     Ogg,WebM|   H264   |
//      |Opera 9x-10.10 |H264         |      -      |   H264   |
//      |Opera 10.50    |H264,Ogg     |     Ogg     |   H264   |
//      |Opera 10.60+   |H264,Ogg,WebM|     Ogg,WebM|   H264   |
//      |iOS 3          | -           |      -      |    -     |
//      |iOS 4+         |H264         |H264         |    -     |
//      |IE 6,IE 7,IE 8 |H264         |      -      |   H264   |
//      |IE 9+          |H264,    WebM|H264,    WebM|   H264   |
//      +---------------+-------------+-------------+----------+
//
// <audio>
//      +---------------+-------------+-------------+----------+
//      |   Browser     | uu.audio()  | HTML5Audio  |FlashAudio|
//      +---------------+-------------+-------------+----------+
//      |Firefox 3.0    | mp3         |      -      |   mp3    |
//      |Firefox 3.5+   | mp3,ogg,wav |     ogg,wav |   mp3    |
//      |Safari 3.x     | mp3         |      -      |   mp3    |
//      |Safari 4+ (win)| mp3,m4a,wav | mp3,m4a,wav |   mp3    |
//      |Safari 4+ (mac)| mp3,m4a     |     m4a     |   mp3    |
//      |Chrome 4+      | mp3,m4a,ogg | mp3,m4a,ogg |   mp3    |
//      |Opera 9x-10.10 | mp3         |      -      |   mp3    |
//      |Opera 10.50+   | mp3,ogg,wav |     ogg,wav |   mp3    |
//      |iOS 3          |     -       |      -      |    -     |
//      |iOS 4+         | mp3,m4a     | mp3,m4a     |    -     |
//      |IE 6,IE 7,IE 8 | mp3         |      -      |   mp3    |
//      |IE 9+          | mp3         | mp3         |   mp3    |
//      +---------------+-------------+-------------+----------+
//
// Geo Location API
//      Firefox 3.5+
//      Chrome 5+
//      Safari 5.0+
//      Opera 10.60+
//      iOS 3+
//      Android(ChromeLite) 1+
//
// WebSockets
//      iOS4.2+, Firefox4.0+, Opera11+(but disabled), Chrome,
//
// Element Traversal
//      Gecko, WebKit, Opera, IE9+
//
// style.transform = "translate3d()"
// +-------------+----------+-------+-----------+--------+
// |             | WebKit   | Opera | Firefox   |   IE   |
// | translate3d | Safari4+ |  11+  | x 4.0beta | x 9pp7 |
// |             | Chrome   |       |           |        |
// +-------------+----------+-------+-----------+--------+
//
// +--------------+--------+---------+---------+---------+
// | Typed Array  | Chrome | Firefox | iOS     | Android |
// |              |        |         |  Safari |  WebKit |
// +--------------+--------+---------+---------+---------+
// | Uint8Array   |   9+   |    4+   |   4.2+  |
// | Uint16Array  |   9+   |    4+   |   4.2+  |
// | Uint32Array  |   9+   |    4+   |   4.2+  |
// | Int8Array    |   9+   |    4+   |   4.2+  |
// | Int16Array   |   9+   |    4+   |   4.2+  |
// | Int32Array   |  ---   |   ---   |   ---   |
// | Float32Array |   9+   |    4+   |   4.2+  |
// | Float64Array |  ---   |   ---   |   ---   |
// +--------------+--------+---------+---------+
//
//
//
// o    CSS3 2D Transforms
// o        css: -moz-transform: scale(), scaleX(), scaleY()
// o        css: -moz-transform: rotate()
// o        css: -moz-transform: translate(), translateX(), translateY()
// o        css: -mox:transform: matrix()
// o        js: style.MozTransform = "scale()"
// o        js: style.MozTransform = "rotate()"
// o        js: style.MozTransform = "translate()"
// o        js: style.MozTransform = "matrix()" // matrix({$a},{$b},{$c},{$d},{$e}px,{$f}px)
//

// === Core ===

// * Manual http://code.google.com/p/uupaa-js/w/list

var uu; // window.uu - uupaa.js library namespace

uu || (function(win,                // as global / window
                doc,                // as document
                htmlNode,           // as document.documentElement as <html>
                navigator,          // as window.navigator
                toString,           // as global.Object.prototype.toString
                isArray,            // as global.Array.isArray,
                toArray,            // as global.Array.prototype.slice, (x: IE NodeList, o: IE arguments)
                Node,               // as global.Node
                Math,               // as global.Math
                parseInt,           // as global.parseInt
                parseFloat,         // as global.parseFloat
                setTimeout,         // as global.setTimeout
                setInterval,        // as global.setInterval
                getComputedStyle) { // as window.getComputedStyle

// --- FALLBACK ( Array.isArray ) ---
isArray || (isArray = Array.isArray = fallbackIsArray); // [IE6][IE7][IE8][ES3]

// --- FALLBACK ( Node.* ) ---
//{@mb [IE6][IE7][IE8]
Node || (win.Node = Node = {
    ELEMENT_NODE: 1, TEXT_NODE:     3, CDATA_SECTION_NODE:      4,
    COMMENT_NODE: 8, DOCUMENT_NODE: 9, DOCUMENT_FRAGMENT_NODE: 11
});
//}@mb

// --- FALLBACK ( window.console ) ---
//{@mb [IE6][IE7]
//{@ie67
win.console || (win.console = {
    log: uunop, debug: uunop, info: uunop, warn: uunop, error: uunop,
    assert: uunop, dir: uunop, dirxml: uunop, trace: uunop, group: uunop,
    groupEnd: uunop, time: uunop, timeend: uunop, profile: uunop,
    profileEnd: uunop, count: uunop
});
//}@ie67
//}@mb

// --- MINIFY (create alias, http://d.hatena.ne.jp/uupaa/20100730) ---
var _addEventListener = "addEventListener",
    _hasOwnProperty = "hasOwnProperty",
    _getAttribute = "getAttribute",
    _setAttribute = "setAttribute",
    _toLowerCase = "toLowerCase",
    _appendChild = "appendChild",
    _nextSibling = "nextSibling",
    _removeChild = "removeChild",
    _transparent = "transparent",
    _parentNode = "parentNode",
    _firstChild = "firstChild",
    _visibility = "visibility",
    _lastChild = "lastChild",
    _className = "className",
    _prototype = "prototype",
    _nodeType = "nodeType",
    _position = "position",
    _nodeSet = "nodeSet",
    _display = "display",
    _indexOf = "indexOf",
    _replace = "replace",
    _tagName = "tagName",
    _concat = "concat",
    _datauu = "data-uu", // node["data-uu..."]
    _height = "height",
    _number = "number",
    _string = "string",
    _width = "width",
    _undef,
    _false = !1,
    _true = !0,
    _perf = new Date,
//{@debug
    _trace = [],
//}@debug
    _types = { "NaN": 2 },          // type detection
    _dd2num = {},                   // uu.hash.dd2num = {  "00":    0 , ...  "99":   99  }
    _num2dd = {},                   // uu.hash.num2dd = {    0 :  "00", ...   99 :  "99" }
    _bb2num = {},                   // uu.hash.bb2num = { "\00":    0 , ... "\ff":  255  }
    _num2bb = {},                   // uu.hash.num2bb = {    0 : "\00", ...  255 : "\ff" }
    _hh2num = {},                   // uu.hash.hh2num = {  "00":    0 , ...  "ff":  255  }
    _num2hh = { 256: "00" },        // uu.hash.num2hh = {    0 :  "00", ...  255 :  "ff", 256: "00" }
    _num2num = {},                  // uu.hash.num2num = {    0 :    0 , ...  255 :  255  }
    _bit2num = {},                  // uu.hash.bit2num = { "00000000": 0, ... "11111111": 255 }
//{@codec
    _num2b64,                       // uu.hash.num2b64 = ["A", "B", ... "/"]
    _b642num,                       // uu.hash.b642num = { "=": 0, "-": 62, "_": 63 }; // URLSafe64 chars("-", "_")
//}@codec
    _nodeiddb = {},                 // { nodeid: node, ... }
    _nodeidnum = 0,                 // nodeid counter
//{@mb
    _tokenCache = {},               // { css-selector-expression: token, ... } for uu.query
//}@mb
    _guidCounter = 0,               // uu.number
//{@storage
    _storage = {
        info: function(used, max, pair, backend) {
            return { used: used, max: max, pair: pair, backend: backend };
        },
/*{@mb*/index: "uuindex", /*}@mb*/  // for IEStorage
        store: "uustore",           // for IEStorage, CookieStorage
        expire: (new Date(2032, 1, 1)).toUTCString() // expire date
    },
//}@storage
    // --- RegExp ---
    _trimSpace = /^\s+|\s+$/g,
    _protocol = /^(https?|file|wss?):/,
    _format = /@/g, // uu.f()
    _parse = {
        file: /^(file:)\/{2,3}(?:loc\w+)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i,
        //                     localhost /dir/f.ext  ?key=value    #hash
        //      [1]                      [2]         [3]           [4]
        http: /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i
        //      https://    user:pass@    server     : port   /dir/f.ext  ?key=value   #hash
        //      [1]         [3]           [4]          [5]    [6]         [7]          [8]
    },
    _unit = { px: /px$/, pt: /pt$/, em: /em$/ },
    // --- ENVIRONMENT ---
    _env = detectEnvironment(0.8),  // as uu.env
    _ie = _env.ie,                  // as uu.ie
    _ie67 = _ie && _env < 8,        // as uu.ie67
    _ie678 = _ie && _env < 9,       // as uu.ie678
    _gecko = _env.gecko,            // as uu.gecko (Firefox and Gecko Based Browsers)
    _opera = _env.opera,            // as uu.opera (Opera, Opera Mini)
    _webkit = _env.webkit,          // as uu.webkit (Safari, iPhone, iPad, iPod, Google Chrome)
    _mobile = _env.mobile,          // as uu.env.mobile (iOS, Android)
    _baseDir = getBaseDir();        // base dir. default - directory containing uupaa.js

// --- HTML5 NEXT ( document.html, document.head ) ---
// http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html
doc.html || (doc.html = htmlNode);                   // document.html = <html>
doc.head || (doc.head = uutag("head", htmlNode)[0]); // document.head = <head>

// --- TYPE DETECTION ( create uu.type.* ) ---
(function(types, ary, i, iz) {
    for (; i < iz; ++i) {
        uutype[types[i]] = i + 1; // uu.type = { BOOLEAN: 1, NUMBER: 2, ... }
        i < 4 && (_types[typeof        ary[i] ] = i + 1);
        i < 7 && (_types[toString.call(ary[i])] = i + 1);
    }
})(("BOOLEAN,NUMBER,STRING,FUNCTION,ARRAY,DATE," +
    "REGEXP,UNDEFINED,NULL,HASH,NODE,FAKEARRAY").split(","),
   [_true, 0, "", uunop, [], _perf, /0/], 0, 12);

// --- CONFIGRATION ( window.config.* --marge--> uu.config.* ) ---
uumix(uuconfig, win.uuconfig || {}, {
    baseDir:        _baseDir,           // uu.config.baseDir - String: base directory. "http://example.com/"
    jsDir:          _baseDir + "js/",   // uu.config.jsDir   - String: JavaScript directory. "http://example.com/js/"
    uiDir:          _baseDir + "ui/",   // uu.config.uiDir   - String: UI parts(images/css/etc...) directory. "http://example.com/ui/"
                                        //                             "http://uupaa-js.googlecode.com/svn/trunk/0.8/img/"
    cssDir:         _baseDir + "css/",  // uu.config.cssDir  - String: css directory. "http://example.com/css/"
    imgDir:         _baseDir + "img/",  // uu.config.imgDir  - String: image directory. "http://example.com/img/"
    swfDir:         _baseDir + "swf/",  // uu.config.swfDir  - String: flash directory. "http://example.com/swf/"
    queryJoint:     "&",                // uu.config.queryJoint - uu.url.query joint char
    storage:        {},                 // uu.config.storage - Web Storage
    socket:         {},                 // uu.config.socket - Web Socket
    canvas:         {},                 // uu.config.canvas - <canvas>
    audio:          {},                 // uu.config.audio - <audio>
    video:          {},                 // uu.config.video - <video>
    media:          {},                 // uu.config.media - <video> and <audio>
    trace:          {},                 // uu.config.trace - API Trace / NetTrace
    geo:            {},                 // uu.config.geo - Geo Location
    log:            {},                 // uu.config.log - API Log / NetLog
    ui:             {}                  // uu.config.ui
}, 0);

//{@storage
uumix(uuconfig.storage, {
    disable:        _false,         // uu.config.storage.disable(= false) - Boolean:
    order:          "LFICM",        // uu.config.storage.order(= "LFICM") - String: storage backends and detection order
                                    //  "L" = WebStorage Native API(LocalStorage), "F" = FlashStorage,
                                    //  "I" = IEStorage, "C" = CookieStorage, "M" = MemStorage
    space:          0,              // uu.config.storage.space(= 0) - Number: require free space(unit: byte). 0 is no require
    swf:            uuconfig.swfDir + "uu.storage.swf"
}, 0, 0);
//}@storage
//{@socket
uumix(uuconfig.socket, {
    disable:        _false,         // uu.config.socket.disable(= false) - Boolean:
    order:          "AF",           // uu.config.socket.order(= "AF") - String: socket backends and detection order
                                    //  "A" = WebSocket Native API, "F" = FlashSocket,
    swf:            uuconfig.swfDir + "uu.socket.swf"
}, 0, 0);
//}@socket
//{@canvas
uumix(uuconfig.canvas, {
    disable:        _false,         // uu.config.canvas.disable(= false) - Boolean:
    order:          "SFV",          // uu.config.canvas.order(= "SFV") - String: canvas backends and detection order
                                    //  "S" = SilverlightCanvas
                                    //  "F" = FlashCanvas, "V" = VMLCanvas
    swf:            uuconfig.swfDir + "uu.canvas.swf"
}, 0, 0);
//}@canvas
//{@audio
uumix(uuconfig.audio, {
    disable:        _false,         // uu.config.audio.disable(= false) - Boolean:
    order:          "AFN",          // uu.config.audio.order(= "AFN") - String: audio backends and detection order
                                    //  "A" = HTML5 <audio> Native API, "F" = FlashAudio, "N" = NoAudio
    swf:            uuconfig.swfDir + "uu.audio.swf"
}, 0, 0);
//}@audio
//{@video
uumix(uuconfig.video, {
    disable:        _false,         // uu.config.video.disable(= false) - Boolean:
    order:          "AFN",          // uu.config.video.order(= "AFN") - String: video backends and detection order
                                    //  "A" = HTML5 <video> Native API, "F" = FlashVideo, "N" = NoVideo
    swf:            uuconfig.swfDir + "uu.video.swf"
}, 0, 0);
//}@video
//{@media
uumix(uuconfig.media, {
    disable:        _false,         // uu.config.media.disable(= false) - Boolean:
    order:          "FHN",          // uu.config.media.order(= "FHN") - String: media backends and detection order
                                    //  "F" = Flash, "H" = HTML5 <audio><video> Native API, "N" = NoMedia
    swf:            uuconfig.swfDir + "uu.media.swf"
}, 0, 0);
//}@media
//{@debug
uumix(uuconfig.log, {
    disable:        _false,         // uu.config.log.disable(= false) - Boolean:
    remote:         "",             // uu.config.log.remote(= "") - String: API log.   eg: "http://localhost/log?msg="
    rollup:         30              // uu.config.log.rollup(= 30) - Number: rollup log
}, 0, 0);
uumix(uuconfig.trace, {
    disable:        _true,          // uu.config.trace.disable(= true) - Boolean:
    remote:         ""              // uu.config.trace.remote(= "") - String: API trace. eg: "http://localhost/trace?msg="
}, 0, 0);
//}@debug
//{@geo
uumix(uuconfig.geo, {
    disable:        _false,         // uu.config.geo.disable(= false) - Boolean:
    order:          "AW"            // uu.config.geo.order(= "AW") - String: GeoLocation API backends and detection order
                                    //  "A" = GeoLocation API, "W" = WebAPI
}, 0, 0);
//}@geo
//{@ui
uumix(uuconfig.ui, {
    disable:        _false,         // uu.config.ui.disable(= false) - Boolean:
    img:                            // uu.config.ui.img(= uu.config.uiDir + "ui.png") - String:
                    uuconfig.uiDir + "ui.png"
}, 0, 0);
//}@ui



// --- LIBRARY STRUCTURE ( window.uu.* ) ---
uu = uumix(uufactory, {             // uu(expr:NodeSet/Node/NodeArray/OOPClassNameString/window,
                                    //    arg1:NodeSet/Node/Expression/Mix = void,
                                    //    arg2:Mix = void,
                                    //    arg3:Mix = void,
                                    //    arg4:Mix = void):Instance/NodeSet
                                    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Class.MyClass(arg1, arg2)
                                    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> NodeSet
                                    //  [3][NodeSet forEach] uu("div>ul>li", function(node, index) { ... }) -> NodeSet
    // --- CONFIGRATION ---
    config:         uuconfig,       // uu.config - Hash: user configurations
    // --- ENVIRONMENT ---
    env:            _env,           // uu.env - Hash: environment informations,
                                    //    { library, ssl, lang, render, browser,
                                    //      ie, ie6, ie7, ie8, ie9, ie67, ie678,
                                    //      opera, gecko, webkit, chrome, safari,
                                    //      longedge, mobile, ios, ipad, iphone,
                                    //      retina, android, mbosver, os,
                                    //      touch, jit, flash, silverlight }
    ie:             _ie,            // uu.ie     - as uu.env.ie     [ALIAS]
    ie67:           _ie67,          // uu.ie67   - as uu.env.ie67   [ALIAS]
    ie678:          _ie678,         // uu.ie678  - as uu.env.ie678  [ALIAS]
    gecko:          _gecko,         // uu.gecko  - as uu.env.gecko  [ALIAS]
    opera:          _opera,         // uu.opera  - as uu.env.opera  [ALIAS]
    webkit:         _webkit,        // uu.webkit - as uu.env.webkit [ALIAS]
    ver:            _env,           // uu.ver    - Hash: as uu.ver [ALIAS][DEPRECATED]
    // --- UNLIMIT ---
    unlimit:        uuunlimit,      // uu.unlimit()
    // --- CODE SNIPPET / LIGHT WEIGHT TEMPLATE ---
//{@snippet
    snippet:        uusnippet,      // uu.snippet(id:String, arg:Hash/Array = void):String/Mix
//}@snippet
    // --- AJAX / JSONP / LAZY JS LOADER / FILE STAT ---
//{@ajax
    ajax:     uumix(uuajax, {       // uu.ajax(url:String, option:Hash, callback:CallbackFunction = void)
                                    //  [1][async request] uu.ajax("http://...", { method: "POST", data: ... }, callback)
        post:       uuajaxpost,     // uu.ajax.post(url:String, option:Hash, callback:CallbackFunction = void)
                                    //  [1][post] uu.ajax.post("http://example.com/api?id=a", { data: uu.form.serialize(uu.id("#form")) }, callback)
        clear:      uuajaxclear,    // uu.ajax.clear(url:String = "") - clear "If-Modified-Since" cache
                                    //  [1][clear all]   uu.ajax.clear()
                                    //  [2][clear a url] uu.ajax.clear("http://example.com/api")
        binary:     uuajaxbinary    // uu.ajax.binary(url:String, option:Hash, callback:CallbackFunction = void)
                                    //  [1][get binary]       uu.ajax.binary("http://example.com/api", {}, callback)
                                    //  [2][post binary]      uu.ajax.binary("http://example.com/api", { data: byteArray }, callback)
                                    //  [3][get MessagePack]  uu.ajax.binary("http://example.com/api", { msgpack: true }, callback)
                                    //  [4][post MessagePack] uu.ajax.binary("http://example.com/api", { msgpack: true, data: JavaScriptMixObject }, callback)
    }),
    jsonp:          uujsonp,        // uu.jsonp(url:String, option:Hash, callback:CallbackFunction = void)
                                    //  [1][async request] uu.jsonp("http://...callback=@", { method: "mycallback" }, callback)
//}@ajax
    js:             uujs,           // uu.js(url:String, option:Hash = { async, defer, type, charset }, callback:CallbackFunction = void)
                                    //  [1][async load] uu.js("http://.../hoge.js", { async: true, defer: true })
                                    //  [2][defer load] uu.js("http://.../hoge.js", { defer: true })
                                    //  [3][lazy load]  uu.js("http://.../hoge.js")
                                    //  [4][callback]   uu.js("http://.../hoge.js", {}, callback)
    stat:           uustat,         // uu.stat(url:String):Boolean
    require:        uurequire,      // uu.require(url:String, option:Hash = {}):Hash - { data, option, status, ok }
                                    //  [1][sync request] uu.require("http://...") -> { data, option, status, ok }
    // --- TYPE MATCH / TYPE DETECTION ---
    like:           uulike,         // uu.like(lval:Date/Hash/Fake/Array, rval:Date/Hash/Fake/Array):Boolean
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
                                    //  uu.type.HASH         - 10: Hash (aka Object)
                                    //  uu.type.NODE         - 11: Node (HTMLElement)
                                    //  uu.type.FAKEARRAY    - 12: FakeArray (Arguments, NodeList, HTMLCollection, ...)
    complex:        uucomplex,      // uu.complex(key:String/Hash = void, value:String/Number = void):Number
                                    //  [1][get items]  uu.complex() -> 1
                                    //  [2][get item]   uu.complex(key) -> 2
                                    //  [3][set item]   uu.complex(key, value) -> 3
                                    //  [4][set items]  uu.complex({ key: value, ... }) -> 4
    isURL:          isURL,          // uu.isURL(search:Mix):Boolean
    isNode:         isNode,         // uu.isNode(search:Mix):Boolean
    isNumber:       isNumber,       // uu.isNumber(search:Mix):Boolean
    isString:       isString,       // uu.isString(search:Mix):Boolean
    isFunction:     isFunction,     // uu.isFunction(search:Mix):Boolean
    // --- ARRAY / HASH / ITERATION / GENERIC OPERATIONS ---
    arg:            uuarg,          // uu.arg(arg1:Hash/Function = {}, arg2:Hash = void, arg3:Hash = void):Hash/Function
    mix:            uumix,          // uu.mix(base:Hash/Function, flavor:Hash, aroma:Hash = void,
                                    //        override:Number/Boolean = true):Hash/Function
    has:            uuhas,          // uu.has(source:Hash/Array/Node/String, search:Hash/Array/Node/String/ExEventType):Boolean
                                    //  [1][Array has Array]      uuhas([1, 2], [1]) -> true
                                    //  [2][Hash has Hash]        uuhas({ a: 1, b: 2 }, { a: 1 }) -> true
                                    //  [3][Node has ExEventType] uuhas(node, "namespace.click") -> true
                                    //  [4][Node has Node]        uuhas(parentNode, childNode) -> true
                                    //  [5][Array has Mix]        uuhas([1, 2], 1) -> true
                                    //  [6][Array has Mix]        uuhas([1, "a"], "a") -> true
                                    //  [7][String has String]    uuhas("A B C", " ") -> true
    nth:            uunth,          // uu.nth(source:Hash/Array/String, index:Number = 0):Array - [key, value]
                                    //  [1][Hash nth ]   uunth({ a: 1, b: 2 }, 1)    -> ["b", 2]
                                    //  [2][Array nth]   uunth(["a", 100, true], 1)  -> [1, 100]
                                    //  [3][Array first] uunth(["a", 100, true])     -> [0, "a"]
                                    //  [4][Array last]  uunth(["a", 100, true], -1) -> [2, true]
                                    //  [5][String head] uunth("abc", 0)             -> [0, "a"]
                                    //  [6][String tail] uunth("abc", -1)            -> [2, "c"]
    map:            uumap,          // uu.map(source:Hash/Array, evaluator:Function):Array
    each:           uueach,         // uu.each(source:Hash/Array/Number, evaluator:Function)
    drip:           uudrip,         // uu.drip(source:Hash/Array, evaluator:Function):Hash - { rv, rest }
                                    //  [1][Function only] uu.drip([uu.nop, 1, "a"], uu.isFunction) -> { rv: [uu.nop], rest: [1, "a"]      }
                                    //  [2][Number only]   uu.drip([uu.nop, 1, "a"], uu.isNumber)   -> { rv: [1],      rest: [uu.nop, "a"] }
                                    //  [3][String only]   uu.drip([uu.nop, 1, "a"], uu.isString)   -> { rv: ["a"],    rest: [uu.nop, 1]   }
                                    //  [4][Array only]    uu.drip([[1, 2], 1, "a"], Array.isArray) -> { rv: [[1, 2]], rest: [1, "a"]      }
    keys:           uukeys,         // uu.keys(source:Hash/Array):Array
    pair:           uupair,         // uu.pair(key:Number/String/Hash, value:Mix):Hash - { key: value }
                                    //  [1][make pair]    uu.pair(1, 2)        -> { 1: 2 }
                                    //  [2][through hash] uu.pair({ 1: 2 }, 3) -> { 1: 2 }
    size:           uusize,         // uu.size(source:Hash/Array):Number
    some:           uusome,         // uu.some(source:Hash/Array, evaluator:CallbackFunction):Boolean
    calls:          uucalls,        // uu.calls(source:Hash/Array, Arguments/MixArray = void, that:this = void):Array
                                    //  [1][call function] uu.calls([uu.nop, "dummy", uu.nop]) -> [undefined, undefined]
                                    //  [2][call function] uu.calls({ a: uu.nop, b: "dummy", c: uu.nop }) -> [undefined, undefined]
    clone:          uuclone,        // uu.clone(source:Hash/Array):Hash/Array - shallow copy
    values:         uuvalues,       // uu.values(source:Hash/Array):Array
    indexOf:        uuindexof,      // uu.indexOf(source:Hash/Array, searchValue:Mix):Number/String/void
    hash:           uuhash,         // uu.hash(source:JointString, splitter:String/RegExp = /[,;:]/):Hash
                                    //  [1][String to Hash] uu.hash("a,1,b,2") -> { a: "1", b: "2" }
                                    //  [2][String to Hash] uu.hash("a:1,b:2") -> { a: "1", b: "2" }
                                    //  [3][String to Hash] uu.hash("a:1;b:2") -> { a: "1", b: "2" }
    array:    uumix(uuarray, {      // uu.array(source:Array/Mix/NodeList/Arguments,
                                    //          sliceStart:Number = void,
                                    //          sliceEnd:Number = void):Array+Hash - Array + { first, last }
                                    //  [1][through Array]      uu.array([1, 2])    -> [1, 2]
                                    //  [2][mix to Array]       uu.array(mix)       -> [mix]
                                    //  [3][NodeList to Array]  uu.array(NodeList)  -> [node, ...]
                                    //  [4][arguments to Array] uu.array(arguments) -> [arg, ...]
                                    //  [5][to Array + slice]   uu.array(uu.tag("", document), 1, 3) -> [<head>, <meta>]
        sort:       uuarraysort,    // uu.array.sort(source:Array, method:String/CallbackFunction = "A-Z"):Array
        clean:      uuarrayclean,   // uu.array.clean(source:Array):Array
        toHash:     uuarraytohash,  // uu.array.toHash(key:Array, value:Array/Mix, toNumber:Boolean = false):Hash
        unique:     uuarrayunique   // uu.array.unique(source:Array, literalOnly:Boolean = false):Array
    }),
    byteArray: uumix(uubyteArray, { // uu.byteArray(source:String):ByteArray
                                    //  [1][clone ByteArray]     uu.byteArray([1, 2]) -> [1, 2]
                                    //  [2][String to ByteArray] uu.byteArray("abc") -> [97, 98, 99]
                                    //  [3][slice]               uu.byteArray("abc", 1, 2) -> [98]
        dump:       uubyteArraydump // uu.byteArray.dump(source:ByteArray, type:String = "HEX"):String
                                    //  [1][ByteArray dump] uu.byteArray.dump([1, 2, 3]) -> "010203"
                                    //  [2][ByteArray dump] uu.byteArray.dump([1, 2, 3], "0x", ", 0x") -> "0x01, 0x02, 0x03"
    }),
    // --- DOM NODE ATTRIBUTE ---
    attr:     uumix(uuattr, {       // uu.attr(node:Node, key:String/Hash = void,
                                    //                    value:String = void):String/Hash/Node
                                    //  [1][get items] uu.attr(node) -> { key: "value", ... }
                                    //  [2][mix items] uu.attr(node, { key: "value", ... }) -> node
                                    //  [3][get item]  uu.attr(node, key) -> "value"
                                    //  [4][set item]  uu.attr(node, key, "value") -> node
        fix:        uuattrfix       // uu.attr.fix(source:String):String
                                    //  [1][html-attr to js-attr] uu.fix("for")   -> "htmlFor"
                                    //  [2][width]                uu.fix("width") -> "width"
    }),
    // --- DOM NODE DATA ---
    data:     uumix(uudata, {       // uu.data(node:Node, key:String/Hash = void,
                                    //                    value:Mix: = void):Hash/Mix/Node/undefined
                                    //  [1][get items] uu.data(node) -> { key: value, ... }
                                    //  [2][mix items] uu.data(node, { key: value, ... }) -> node
                                    //  [3][get item]  uu.data(node, key) -> value
                                    //  [4][set item]  uu.data(node, key, value) -> node
        clear:      uudataclear     // uu.data.clear(node:Node, key:String = void):Node
                                    //  [1][clear items] uu.data.clear(node) -> node
                                    //  [2][clear item]  uu.data.clear(node, key) -> node
//      bind:       uudatabind,     // uu.data.bind(key:String, callback:CallbackFunction)
//      unbind:     undataunbind    // uu.data.unbind(key:String)
    }),
    // --- CSS / DOM STYLE ATTRIBUTE ---
    css:      uumix(uucss, {        // uu.css(node:Node, key:String/Hash = void,
                                    //                   value:String = void):Hash/String/Node
                                    //  [1][get computed items]              uu.css(node) -> { key: value, ... }
                                    //  [2][mix items]                       uu.css(node, { key: value, ... }) -> node
                                    //  [3][get item]                        uu.css(node, key)  -> value
                                    //  [4][set item]                        uu.css(node, key, value) -> node
                                    //  [5][get computed(px unitized) items] uu.css(node, "px") -> { key: value, ... }
        fix:        uucssfix,       // uu.css.fix(source:String):String
                                    //  [1][css-prop to cssProp] uu.css.fix("background-color") -> "backgroundColor"
                                    //  [2][std-name to ie-name] uu.css.fix("float")            -> "cssFloat"(WEB STD) or "styleFloat"(IE)
                                    //  [3][through]             uu.css.fix("-webkit-shadow")   -> "-webkit-shadow"
        unit:       uucssunit,      // uu.css.unit(node:Node, value:Number/CSSUnitString):Number
                                    //  [1][to pixel] uu.css.unit(<div>,  12   ) -> 12
                                    //  [2][to pixel] uu.css.unit(<div>, "12"  ) -> 12
                                    //  [3][to pixel] uu.css.unit(<div>, "12px") -> 12
                                    //  [4][to pixel] uu.css.unit(<div>, "12pt") -> 16
                                    //  [5][to pixel] uu.css.unit(<div>, "12em") -> 192
                                    //  [6][to pixel] uu.css.unit(<div>, "auto") -> 100
        // --- CSS BOX MODEL ---
//{@cssbox
        box:        uucssbox,       // uu.css.box(node:Node, recalc:Boolean = false):Hash - { w, h, m, b, p }
        rect:       uucssrect,      // uu.css.rect(node:Node, ancestorNode:Node = null):Hash { x, y, w, h, from }
        position:   uucssposition,  // uu.css.position(node:Node, pos:String = "s"):Node
                                    //  [1][to static]   uu.css.position(<div>, "static")   -> <div style="position: static">
                                    //  [2][to absolute] uu.css.position(<div>, "absolute") -> <div style="position: absolute">
                                    //  [3][to relative] uu.css.position(<div>, "relative") -> <div style="position: relative">
//}@cssbox
        // --- CSS LEVEL 2 ---
//{@color
        bgcolor:    uucssbgcolor,   // uu.css.bgcolor(node:Node,
                                    //                defaultColor:ColorString= "#fff"):Color
//}@color
        // --- CSS LEVEL 3 ---
        opacity:    uucssopacity,   // uu.css.opacity(node:Node, value:Number):Number/Node
                                    //  [1][get opacity] uu.css.opacity(node) -> 0.5
                                    //  [2][set opacity] uu.css.opacity(node, 0.5) -> node
        transform2d:                // uu.css.transform2d(node:Node, param:Hash = void):Node/Hash
                    uucsstransform2d,
                                    //  [1][get transform] uu.css.transform2d(node) -> { scaleX, scaleY, rotate, translateX, translateY }
                                    //  [2][set transform] uu.css.transform2d(node, { rotate: 30 }) -> node
        userSelect: uucssuserSelect // uu.css.userSelect(node:Node, allow:Boolean = false):Node
    }),
    // --- STYLESHEET ---
    ss:             uuss,           // uu.ss(id:StyleSheetIDString = ""):StyleSheetObject
                                    //  [1][get/create StyleSheet object] uu.ss("myStyleSheet") -> StyleSheet
    // --- VIEW PORT ---
    viewport:       uuviewport,     // uu.viewport():Hash - { innerWidth, innerHeight,
                                    //                        pageXOffset, pageYOffset,
                                    //                        orientation, devicePixelRatio }
    // --- TIMER ---
    interval:       uuinterval,     // uu.interval(callback:CallbackFunction, arg:Mix = void):Number
    // --- EFFECT / ANIMATION / EASING ---
//{@fx
    fx:       uumix(uufx, {         // uu.fx(node:Node, duration:Number, param:Hash/CallbackFunction = void):Node
                                    //  [1][abs]             uu.fx(node, 500, { o: 0.5, x: 200 })
                                    //  [2][rel]             uu.fx(node, 500, { h: "+100", o: "+0.5" })
                                    //  [3][with "px" unit]  uu.fx(node, 500, { h: "-100px" })
                                    //  [4][with easing fn]  uu.fx(node, 500, { h: [200, "InOutQuad"] })
                                    //  [5][standby]         uu.fx(node, 2000)
                                    //  [6][after callback]  uu.fx(node, 500, { o: 1, after: afterCallback })
                                    //  [7][before callback] uu.fx(node, 500, { o: 1, before: beforeCallback })
                                    //  [8][revert]          uu.fx(node, 500, { o: 1, r: 1 })
        skip:       uufxskip,       // uu.fx.skip(node:Node = null, skipAll:Boolean = false, invisible:Boolean = false):NodeArray
        stop:       uufxstop,       // uu.fx.stop(node:Node):Node
        kill:       uufxkill,       // uu.fx.kill(node:Node = null):NodeArray
        isBusy:     uufxisbusy,     // uu.fx.isBusy(node:Node):Boolean
        isHide:     uufxishide,     // uu.fx.isHide(node:Node):Boolean
        hide:       uufxhide,       // uu.fx.hide(node:Node, duration:Number = 0):Node
        show:       uufxshow,       // uu.fx.show(node:Node, duration:Number = 0, displayValue:String= "block"):Node
        fade:       uufxfade,       // uu.fx.fade(node:Node, duration:Number, option:Hash = {}):Node
        fadeIn:     uufxfadein,     // uu.fx.fadeIn(node:Node, duration:Number, option:Hash = {}):Node
        fadeOut:    uufxfadeout,    // uu.fx.fadeOut(node:Node, duration:Number, option:Hash = {}):Node
        puff:       uufxpuff,       // uu.fx.puff(node:Node, duration:Number, option:Hash = {}):Node
//      wave:       uufxwave,       // uu.fx.wave(node:Node, duration:Number, option:Hash = {}):Node
        flare:      uufxflare,      // uu.fx.flare(node:Node, duration:Number, option:Hash = { parts: 10, range: 200 }):Node
        swing:      uufxswing,      // uu.fx.swing(node:Node, duration:Number, option:Hash = { swing: 10 }):Node
        slide:      uufxslide,      // uu.fx.slide(node:Node, duration:Number, option:Hash = {}):Node
        slideUp:    uufxslideup,    // uu.fx.slideUp(node:Node, duration:Number, option:Hash = {}):Node
        slideDown:  uufxslidedown,  // uu.fx.slideDown(node:Node, duration:Number, option:Hash = {}):Node
        shrink:     uufxshrink,     // uu.fx.shrink(node:Node, duration:Number, option:Hash = {}):Node
        scroll:     uufxscroll,     // uu.fx.scroll(node:Node, duration:Number, option:Hash = { orientationLock: "" }):Node
//      sunset:     uufxsunset,     // uu.fx.sunset(node:Node, duration:Number, option:Hash = {}):Node
        moveIn:     uufxmovein,     // uu.fx.moveIn(node:Node, duration:Number, option:Hash = { degree: 0, range: 200 }):Node
        moveOut:    uufxmoveout,    // uu.fx.moveOut(node:Node, duration:Number, option:Hash = { degree: 0, range: 200 }):Node
//{@color
        highlight:  uufxhighlight,  // uu.fx.highlight(node:Node, duration:Number, option:Hash = { bgc: "#ff9", reverse: 1 }):Node
//}@color
        easing:     {}              // uu.fx.easing - easing functions
    }),
//}@fx
    // --- DOM NODE QUERY ---
    id:             uuid,           // uu.id(expr:String, context:Node = document):Node/null
    idc:            uuidc,          // uu.idc(expr:String = void, context:Node = document):Node/null
                                    //  [1][find #id]             uu.idc("id") -> Node
                                    //  [2][find #id with cache]  uu.idc("id") -> Node(cached) so quickly
                                    //  [3][clear all Node cache] uu.idc()     -> null
    ids:            uuids,          // uu.ids(expr:CommaJointString, context:Node = document):NodeArray
                                    //  [1][has all]  uu.ids("A,B,C")         -> [<a id="A">, <li id="B">, <div id="C">]
                                    //  [2][skip one] uu.ids("A,NONEEXIST,C") -> [<a id="A">, <div id="C">]
    tag:            uutag,          // uu.tag(expr:String = "", context:Node = <body>):NodeArray
    match:          uumatch,        // uu.match(expr:CSSSelectorExpressionString, context:Node = <body>):Boolean
    query:          uuquery,        // uu.query(expr:CSSSelectorExpressionString, context:NodeArray/Node = <body>):NodeArray
    // --- DOM CLASSNAME ATTRIBUTE QUERY / CLASSNAME ACCESSOR ---
    klass:    uumix(uuklass, {      // uu.klass(expr:String/Node, context:String/Node = <body>):NodeArray/Node
                                    //  [1][query  className]  uu.klass("warn", <div>)             -> NodeArray
                                    //  [2][add    className]  uu.klass(<div>,              "A")   -> <div class="A">
                                    //  [3][add    className]  uu.klass(<div>,             "+A B") -> <div class="A B">
                                    //  [4][remove className]  uu.klass(<div class="A B">, "-A B") -> <div>
                                    //  [5][toggle className]  uu.klass(<div class="A">,   "!A B") -> <div>
                                    //  [6][remove className]  uu.klass(<div class="A B">, /(A|B)/) -> <div>
        has:        uuklasshas      // uu.klass.has(node:Node, classNames:String):Boolean
    }),
    // --- OOP CLASS ---
    Class:    uumix(uuClass, {      // uu.Class(className:String, protoMember:Hash/Function = void,
                                    //                            staticMember = void)
                                    //  [1][define tiny class]     uu.Class("Class")
                                    //  [2][define generic class]  uu.Class("Class",            { proto: ... }, { static: func... })
                                    //  [3][inherit]               uu.Class("SuperClass:Class", { proto: ... }, { static: func... })
                                    //  [4][inherit]               uu.Class("SuperClass<Class", { proto: ... }, { static: func... })
        singleton:  uuClassSingleton// uu.Class.singleton(className:String, proto:Hash/Function = void,
                                    //                                      staticMember = void)
    }),
    // --- DOM EVENT ---
    event:    uumix(uuevent, {      // uu.event(node:Node/Window,
                                    //          exEventType:ExEventTypeString,
                                    //          evaluator:Function/Instance,
                                    //          hint:String = void):Node
                                    //  [1][bind a event]            uu.event(node, "click", fn)             -> node
                                    //  [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
                                    //  [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
                                    //  [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node
        has:        uuhas,          // uu.event.has(node:Node, exEventType:ExEventTypeString):Boolean
        key:        uueventkey,     // uu.event.key(event:ExEvent):Hash - { key, code }
        one:        uueventone,     // uu.event.one(node:Node, exEventType:ExEventTypeString,
                                    //              callback:CallbackFunction, hint:String = "one"):Node
                                    //  [1]
        edge:       uueventedge,    // uu.event.edge(event:ExEvent):Hash - { x, y }
        fire:       uueventfire,    // uu.event.fire(node:Node/Window, eventType:String,
                                    //                          param:Mix = void,
                                    //                          hint:String = void):Node
        stop:       uueventstop,    // uu.event.stop(event:Event/ExEvent, stop:Boolean = true,
                                    //                                    prevent:Boolean = true)
//{@mb
//{@eventhover
        hover:      uueventhover,   // uu.event.hover(node:Node, expr:CallbackFunction/ClassNameString,
                                    //                           hint:String = void):Node
                                    //  [1][enter/leave callback] uu.event.hover(node, function callback(evt, isHover, node){ ... }) -> node
                                    //                                  hover event   -> callback(evt, true, node)
                                    //                                  unhover event -> callback(evt, false, node)
                                    //  [2][toggle className]     uu.event.hover(node, "hoverActionClass") -> node
                                    //                                  hover event   -> node.className += " hoverActionClass"
                                    //                                  unhover event -> node.className -= " hoverActionClass"
        unhover:    uueventunhover, // uu.event.unhover(node:Node):Node
                                    //  [1][unbind] uu.event.unhover(node) -> node
//}@eventhover
//{@eventrollover
        rollover: uumix(uueventrollover, {       // uu.event.rollover(node:Node/NodeArray, roll:ClassNameString/CallbackFunction):NodeArray
            enable:     uueventrolloverenable,   // uu.event.rollover.enable()
            disable:    uueventrolloverdisable   // uu.event.rollover.disable()
        }),
        unrollover:     uueventunrollover,       // uu.event.unrollover(node:NodeArray/Node = void):NodeArray
//}@eventrollover
//}@mb
/* TODO: test
//{@eventscroll
        scroll:     uueventscroll,  // uu.event.scroll(nameSpace:String, evaluator:CallbackFunction)
                                    //  [1][get scroll info] uu.event.scroll("myNameSpace", function(evt) { evt.uu.scroll })
        unscroll:   uueventunscroll,// uu.event.unscroll(nameSpace:Sting)
//}@eventscroll
 */
//{@eventresize
        resize:     uueventresize,  // uu.event.resize(evaluator)
        unresize:   uueventunresize,// uu.event.unresize()
//}@eventresize
//{@eventcyclic
        cyclic:     uueventcyclic,  // uu.event.cyclic(node:Node, exEventType:ExEventTypeString,
                                    //                            callback:CallbackFunction,
                                    //                            cyclic:Number,
                                    //                            loop:Number = 0,
                                    //                            hint:String = void):Node
        uncyclic:   uueventuncyclic,// uu.event.uncyclic(node:Node, exEventType:ExEventTypeString)
//}@eventcyclic
        evaluator:                  // uu.event.evaluator(node:Node, exEventType:ExEventTypeString):FunctionArray
                    uueventevaluator,
        unbind:     uueventunbind,  // uu.event.unbind(node:Node/Window, exEventType:ExEventTypeString = void):Node
        attach:     uueventattach,  // uu.event.attach(node:Node/Window, eventType:String,
                                    //                            evaluator:Function,
                                    //                            useCapture:Boolean = false)
        detach:     uueventdetach   // uu.event.detach(node:Node/Window, eventType:String,
                                    //                            evaluator:Function,
                                    //                            useCapture:Boolean = false)
    }),
    one:            uueventone,     // uu.one() as uu.event.one()
    bind:           uuevent,        // uu.bind() as uu.event()
    unbind:         uueventunbind,  // uu.unbind() as uu.event.unbind()
    junction:       uujunction,     // uu.junction(race:Number, items:Number, callback:CallbackFunction = void):Junction
                                    //  [1][some  1/3] uu.junction(1, 3, callback).ng(1).ng(2).ok(3)      -> callback({ rv: [1, 2, 3], ok: true })
                                    //  [2][some  2/3] uu.junction(2, 3, callback).ng(1).ng(2).ok(3)      -> callback({ rv: [1, 2, 3], ok: false })
                                    //  [3][some  2/3] uu.junction(2, 3, callback).ok(1).ng(2).ok( )      -> callback({ rv: [1, 2, undefined], ok: true })
                                    //  [4][every 3/3] uu.junction(3, 3, callback).ok(1).ok(2).ok({id:3}) -> callback({ rv: [1, 2, {id:3}], ok: true })
    // --- DOM LIVE EVENT ---
//{@live
    live:     uumix(uulive, {       // uu.live(expr:CSSSelectorExpressionString,
                                    //         exEventType:ExEventTypeString,
                                    //         evaluator:CallbackFunction/Instance,
                                    //         hint:String= void)
                                    //  [1][bind] uu.live("css > selector", "nameSpace.click", callback)
        has:        uulivehas       // uu.live.has(expr:CSSSelectorExpressionString, exEventType:ExEventTypeString):Boolean
    }),
    unlive:         uuunlive,       // uu.unlive(expr:CSSSelectorExpressionString = void, exEventType:ExEventTypeString = void)
                                    //  [1][unbind all]           uu.unlive()
                                    //  [2][unbind all]           uu.unlive("selector")
                                    //  [3][unbind one]           uu.unlive("selector", "click")
                                    //  [4][unbind namespace all] uu.unlive("selector", "namespace.*")
                                    //  [5][unbind namespace one] uu.unlive("selector", "namespace.click")
//}@live
    // --- DOM NODE / DOM NODE LIST ---
    node:     uumix(uunode, {       // uu.node(node:Node/TagNameString,
                                    //         args:Array/Argeumtns = void):Node
                                    //  [1][Node]               uu.div(uu.p())                          -> <div><p></p></div>
                                    //  [2][TextNode]           uu.div(uu.text("hello"))                -> <div>hello</div>
                                    //  [3][TextNode]           uu.div("hello")                         -> <div>hello</div>
                                    //  [4][TextNode atmark]    uu.div("format @ @", "hello", "world")  -> <div>format hello world</div>
                                    //  [5][attr]               uu.div("id:a,class:hello")              -> <div id="a" class="hello"></div>
                                    //  [6][attr]               uu.div({id:"a","class":"hello"})        -> <div id="a" class="hello"></div>
                                    //  [7][attr atmark]        uu.div("id:@", "a")                     -> <div id="a"></div>
                                    //  [8][css]                uu.div(null, "color:red;float:left")    -> <div style="color:red;float:left"></div>
                                    //  [9][css]                uu.div(null, {color:"red",float:"left"})-> <div style="color:red;float:left"></div>
                                    //  [10][css atmark]        uu.div(null, "color:@", "red")          -> <div style="color:red"></div>
                                    //  [11][complex]           uu.div("id:@", "a", {color:"red"}, "@ @", "hello", "world")
                                    //                                                                  -> <div id="a" style="color:red">hello world</div>
        add:        uunodeadd,      // uu.node.add(source:Node/NodeArray/DocumentFragment/HTMLFragmentString/TagName = "div",
                                    //             context:Node = <body>, position:Number/String = "./last"):Node
                                    //  [1][add div node to body]     uu.node.add()         -> <div />  (div.parentNode = <body>)
                                    //  [2][add p tag to body]        uu.node.add("p")      -> <p />    (p.parentNode = <body>)
                                    //  [3][add Node to body]         uu.node.add(uu.div()) -> <div />  (div.parentNode = <body>)
                                    //  [4][add NodeArray to context] uu.node.add([<link>, <link>], document.head) -> <link/> (link.parentNode = <head>)
                                    //  [5][add HTMLFragmentString]   uu.node.add("<div><p>txt</p></div>") -> <div> (div.parentNode = <body>)
                                    //  [6][add DocumentFragment]     uu.node.add(DocumentFragment)        -> <?>
                                    //  [7][insert tr and tds]        uu.node.add(uu.tr(uu.td("A"), uu.td("B")), uu.id("ctx"), "prev") -> <tr>
                                    //              <table>
                                    //                  <tr id="ctx"><td>C></td><td>D</td></tr>
                                    //              </table>
                                    //                     v
                                    //              <table>
                                    //                  <tr><td>A></td><td>B</td></tr>
                                    //                  <tr id="ctx"><td>C></td><td>D</td></tr>
                                    //              </table>
                                    //   --- uu.node.add ---
                                    //    <div id="parentNode">
                                    //
                                    //        <div id="firstSibling">    first   </div>
                                    //        <div id="prevSibling">     prev    </div>
                                    //        <div id="contextNode">
                                    //            <div id="firstChild">  ./first </div>
                                    //            <div />
                                    //            <div id="lastChild">   ./last  </div>
                                    //        </div>
                                    //        <div id="nextSibling">     next    </div>
                                    //        <div id="lastSibling">     last    </div>
                                    //
                                    //    </div>
        has:        uuhas,          // uu.node.has(parent:Node, child:Node):Boolean
        bros:       uunodebros,     // uu.node.bros(node:Node):NodeArray+Hash - [node, ...] + { first, prev, next, last, index }
        bulk:       uunodebulk,     // uu.node.bulk(source:Node/HTMLFragmentString, context:Node = <div>):DocumentFragment
                                    //  [1][clone]                         uu.node.bulk(Node) -> DocumentFragment
                                    //  [2][build]                         uu.node.bulk("<p>html</p>") -> DocumentFragment
                                    //  [3][TableHTMLFragment unsupported] uu.node.bulk("<tr>...</tr>") -> throw Error, use insertRow()
                                    //  [4][TableHTMLFragment unsupported] uu.node.bulk("<td>...</td>") -> throw Error, use insertCell()
        glue:       uunodeglue,     // uu.node.glue(node:Node, work:Function):Node
        path:       uunodepath,     // uu.node.path(node:Node):CSSQueryString
                                    //  [1][get CSSQueryString] uu.node.path(<div>) -> "body>div"
        sort:       uunodesort,     // uu.node.sort(ary:NodeArray, context:Node = <body>):Hash - { sort, dup }
                                    //  [1][sort] uu.node.sort([<body>, <html>, <body>], document) -> { sort: [<html>, <body>], dup: [<body>] }
        swap:       uunodeswap,     // uu.node.swap(swapout:Node, swapin:Node):Node (swapout node)
        wrap:       uunodewrap,     // uu.node.wrap(innerNode:Node, outerNode:Node):Node (innerNode)
        clear:      uunodeclear,    // uu.node.clear(parent:Node):Node
        clone:      uunodeclone,    // uu.node.clone(parent:Node, quick:Boolean = false):Node
        remove:     uunoderemove,   // uu.node.remove(node:Node, removeAll:Boolean = false):Node
        normalize:  uunodenormalize // uu.node.normalize(parent:Node = <body>, depth:Number = 0):Number
    }),
    add:            uunodeadd,      // uu.add as uu.node.add
    swap:           uunodeswap,     // uu.swap as uu.node.swap
    remove:         uunoderemove,   // uu.remove as uu.node.remove
    // --- NODE ID ---
    nodeid:   uumix(uunodeid, {     // uu.nodeid(ident:Node/Number, remove:Boolean = false):Number/Node
                                    //  [1][get NodeID by Node]  uu.nodeid(Node)         -> NodeID
                                    //  [2][get Node by NodeID]  uu.nodeid(NodeID)       -> Node
                                    //  [3][remove NodeID]       uu.nodeid(Node, true)   -> Node
                                    //  [4][remove NodeID]       uu.nodeid(NodeID, true) -> Node
        remove:     uunodeidremove  // uu.nodeid.remove(ident:Node/Number)
    }),
    // --- NODE BUILDER ---
    head:           uuhead,         // uu.head(/* var_args(node,attr,css,buildid) */):<head>
    body:           uubody,         // uu.body(/* var_args(node,attr,css,buildid) */):<body>
    style:          uustyle,        // uu.style(css:CSSString):<style>
    text:           uutext,         // uu.text(data:String/FormatString/Node,
                                    //         text:String/Mix(= void), var_args:Mix, ...):String/Node
                                    //  [1][create text node]          uu.text("text")          -> createTextNode("text")
                                    //  [2][create formated text node] uu.text("@ @", "a", "b") -> createTextNode("a b")
                                    //  [3][get text]                  uu.text(node)            -> "text"
                                    //  [4][set text]                  uu.text(node, "text")    -> node
                                    //  [5][set formated text]         uu.text(node, "@", "a")  -> node
    // --- HTML FORM ---
//{@form
    form:     uumix(uuform, {
        value:      uuformvalue,    // uu.form.value(node:Node, value:String = void):StringArray/Node
                                    //  [1][get value]            uu.form.value(node) -> value or [value, ...]
                                    //  [2][set value]            uu.form.value(node, "value") -> node
                                    //  [3][get <textarea>]       uu.form.value(node) -> "innerText"
                                    //  [4][get <button>]         uu.form.value(node) -> "<button value>"
                                    //  [5][get <option>]         uu.form.value(node) -> "<option value>" or
                                    //                                              "<option>value</option>"
                                    //  [6][get <selet>]          uu.form.value(node) -> selected option value
                                    //  [7][get <selet multiple>] uu.form.value(node) -> ["value", ...]
                                    //  [8][get <input checkbox>] uu.form.value(node) -> ["value", ...]
                                    //  [9][get <input radio>]    uu.form.value(node) -> "value"
        serialize:  uuformserialize // uu.form.serialize(node:Node, toHash:Boolean = false, joint:String = uu.config.queryJoint):URLEncodedQueryString/Hash
                                    //
                                    //  <form>
                                    //    <div>
                                    //      <input name="name.1" value="a" />                   <!-- name has dot -->
                                    //      <input name="name2" value="{{hiragana-A}}" />       <!-- value is CJK char -->
                                    //      <input type="checkbox" name="name3" value="1" />    <!-- single name -->
                                    //      <input type="checkbox" name="name4[]" value="1" />  <!-- name has [] -->
                                    //      <input type="checkbox" name="name4[]" value="2" />  <!-- name has [] -->
                                    //      <textarea name="textareaname" id="textareaid">
                                    //          hello
                                    //          world
                                    //      </textarea>
                                    //      <input type="image" name="submit" value="submit" /> <!-- IE has bug -->
                                    //      <input type="submit" name="submit" value="sumbit" />
                                    //    </div>
                                    //  </form>
                                    //
                                    //  [1][serialized] uu.form.serialize(<form>)
                                    //          -> "name.1=a&name2=%E3%81%82&name3=1&name4[]=1&name4[]=2"
                                    //             "&textareaname=\n%20...%20hello\n%20...%20world\n"
                                    //             "&submit=submit&submit_x=1&submit_y=1"
                                    //  [2][serialized] uu.form.serialize(<form>, { urlencode: false, hash: true })
                                    //          -> { "name.1": "a", name2: "{{hiragana-A}}",
                                    //               name3: "1", "name4[]": ["1", "2"]
                                    //               textareaname: "\n    hello\n    world\n",
                                    //               submit: "submit", "submit.x": "0", "submit.y": "0" }
    }),
//}@form
    // --- JSON ---
    json:     uumix(uujson, {       // uu.json(source:Mix, exjson:Boolean = false):JSONString/ExJSONString
        decode:     uujsondecode    // uu.json.decode(jsonString:JSONString/ExJSONString,
                                    //                exjson:Boolean = false):Mix/Boolean
    }),
    // --- STRING ---
    string: uumix({
        trim: uumix(uustringtrim, { // uu.string.trim(source:String, replacement:String = " "):String
                                    //  [1][trim both + unite spaces] uu.string.trim("  has  space  ")     -> "has space"
                                    //  [2][trim both + inner spaces] uu.string.trim("  has  space  ", "") -> "hasspace"
            tag:    uustringtrimtag,// uu.string.trim.tag(source:HTMLFragmentString, replacement:String = " "):String
                                    //  [1][trim tags]     uu.string.trim.tag("  <h1>A</h1>  B  <p>C</p>  ") -> "A B C"
                                    //  [2][trim tags]     uu.string.trim.tag("      A       B     C      ") -> "A B C"
            func:   uustringtrimfunc,
                                    // uu.string.trim.func(source:CSSStyleFragmentString, replacement:String = " "):String
                                    //  [1][trim function] uu.string.trim.func(' url("http://...") ') -> "http://..."
                                    //  [2][trim function] uu.string.trim.func(' rgb(1, 2, 3) ')      -> "1, 2, 3"
            hash:   uustringtrimhash,
                                    // uu.string.trim.hash(source:URLString, replacement:String = " "):String
                                    //  [1][trim url hash] uu.string.trim.hash("http://example.com/a.jpg#hash")           -> "http://example.com/a.jpg"
                                    //  [2][trim url hash] uu.string.trim.hash("http://example.com/a.jpg?key=value#hash") -> "http://example.com/a.jpg?key=value"
            quote:  uustringtrimquote
                                    // uu.string.trim.quote(source:String, replacement:String = " "):String
                                    //  [1][trim quotes]   uu.string.trim.quote(' "quote  string" ') -> "quote string"
                                    //  [2][trim quotes]   uu.string.trim.quote(" 'quote  string' ") -> "quote string"
        }),
        format:     uustringformat, // uu.string.format(format:FormatString/Array, var_args, ...):String
                                    //  [1][replace @] uu.string.format("@ dogs and @", 101, "cats") -> "101 dogs and cats"
                                    //  [2][replace #] uu.string.format(null, "#", "# dogs and #", 101, "cats") -> "101 dogs and cats"
//{@sprintf
        sprintf:    uustringsprintf,// uu.string.sprintf(format:FormatString, var_args ...):String
//}@sprintf
        truncate:                   // uu.string.truncate(source:String, wordCount:Number = 80, omit:String = "..."):String
                    uustringtruncate
                                    //  [1][truncate]  uu.string.truncate("hello world", 3)        -> "hel..."
                                    //  [2][truncate]  uu.string.truncate("hello world", 3, "***") -> "hel***"
    }),
    f:              uustringformat, // [ALIAS] uu.f(...) as uu.string.format
    // --- CODEC ---
//{@codec
    entity:   uumix(uuentity, {     // uu.entity(str:String):String
                                    //  [1][to Entity] uu.entity("<html>") -> "&lt;html&gt;"
                                    //  [2][to Entity] uu.entity('&<>"')   -> "&amp;&lt;&gt;&quot;"
        decode:     uuentitydecode  // uu.entity.decode(str:String):String
                                    //  [1][from Entity]         uu.entity.decode("&lt;html&gt;")        -> "<html>"
                                    //  [2][from Entity]         uu.entity.decode("&amp;&lt;&gt;&quot;") -> '&<>"'
                                    //  [3][from UNICODE Entity] uu.entity.decode("\u0041\u0042")        -> "AB"
    }),
    base64:   uumix(uubase64, {     // uu.base64(data:String/ByteArray,
                                    //           toURLSafe64:Boolean = false):Base64String/URLSafe64String
        decode:     uubase64decode  // uu.base64.decode(data:Base64String/URLSafe64String,
                                    //                  toByteArray:Boolean = false):String/ByteArray
    }),
    utf8:     uumix(uuutf8, {       // uu.utf8(str:String):UTF8ByteArray
        decode:     uuutf8decode    // uu.utf8.decode(byteArray:UTF8ByteArray,
                                    //                startIndex:Number = 0,
                                    //                endIndex:Number = void):String
    }),
//{@md5
    md5:            uumd5,          // uu.md5(data:ASCIIString/ByteArray, toByteArray:Boolean = false):HexString/ByteArray
                                    //  [1][MD5 test] uu.md5("")              -> "d41d8cd98f00b204e9800998ecf8427e"
                                    //  [2][MD5 test] uu.md5("hoge")          -> "ea703e7aa1efda0064eaa507d9e8ab7e"
                                    //  [3][MD5 test] uu.md5("ascii")         -> "5b7f33be48f19c25e1af2f96cffc569f"
                                    //  [4][MD5 test] uu.md5("user-password") -> "9a3729201fdd376c76ded01f986481b1"
                                    //  [5][CJK to HexDigestString] uu.md5(uu.utf8("CJK chars")) -> ...
//}@md5
//{@sha1
    sha1:           uusha1,         // uu.sha1(data:ASCIIString/ByteArray, toByteArray:Boolean = false):HexString/ByteArray
                                    //  [1][SHA-1 test] uu.sha1("")              -> "da39a3ee5e6b4b0d3255bfef95601890afd80709"
                                    //  [2][SHA-1 test] uu.sha1("hoge")          -> "31f30ddbcb1bf8446576f0e64aa4c88a9f055e3c"
                                    //  [3][SHA-1 test] uu.sha1("ascii")         -> "51c066b36ea8b32076964c766f8a0324ca4eb4b9"
                                    //  [4][SHA-1 test] uu.sha1("user-password") -> "691ca1151748ae7b52b1c82eaaacc60f8d41db82"
                                    //  [5][CJK to HexDigestString] uu.sha1(uu.utf8("CJK chars")) -> ...
//}@sha1
//{@hmac
    hmac:           uuhmac,         // uu.hmac(key:ASCIIString/ByteArray, data:ASCIIString/ByteArray, hashLib:Function, toByteArray:Boolean = false):HexString/ByteArray
                                    //  [1][HMAC-SHA1 HexString] uu.hmac("key", "data", uu.sha1)       -> "104152c5bfdca07bc633eebd46199f0255c9f49d"
                                    //  [2][HMAC-SHA1 ByteArray] uu.hmac("key", "data", uu.sha1, true) -> [16, 65, 82, 197, 191, 220, 160, 123, ...]
//}@hmac
//{@msgpack
    msgpack:  uumix(uumsgpack, {    // uu.msgpack(data:Mix):ByteArray
        decode:     uumsgpackdecode // uu.msgpack.decode(data:BinaryString/ByteArray):Mix
    }),
//}@msgpack
//}@codec
    // --- DATE ---
    date:           uudate,         // uu.date(source:DateHash/Date/Number/String = void):DateHash
                                    //  [1][get now]                 uu.date() -> DateHash
                                    //  [2][DateHash]                uu.date(DateHash) -> cloned DateHash
                                    //  [2][date to hash]            uu.date(Date) -> DateHash
                                    //  [3][time to hash]            uu.date(milliseconds) -> DateHash
                                    //  [4][DateString to hash]      uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
                                    //  [5][ISO8601String to hash]   uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
                                    //  [6][RFC1123String to hash]   uu.date("Wed, 16 Sep 2009 16:18:14 GMT") -> DateHash
                                    //
                                    // DateHash - { Y: 2010, M: 12, D: 31,
                                    //              h: 23, m: 59, s: 59, ms: 999,
                                    //              time: unix_time, ISO(), GMT() }
                                    //
                                    //  [7][DateHash to ISO Date String]   uu.date().ISO() -> "2000-01-01T00:00:00.000Z"
                                    //  [8][DateHash to GMT Date String]   uu.date().GMT() -> "Wed, 16 Sep 2009 16:18:14 GMT"
                                    //  [9][DateHash to RFC1123DateString] uu.date().GMT() -> "Wed, 16 Sep 2009 16:18:14 GMT"
                                    //  [10][DateHash to Formated Date]    uu.date().ISO().slice(0, 19).replace("T", " "); -> "2011-03-07 14:10:12"
    // --- NUMBER ---
    number:   uumix(uunumber, {     // uu.number():Number - unique number(guid)
        pad:        uunumberpad,    // uu.number.pad(source:Number, digits:Number = 2, pad = "0"):String
                                    //  [1][zero padding] uu.number.fillZero(9)     -> "09"
                                    //  [2][zero padding] uu.number.fillZero(99)    -> "99"
                                    //  [3][zero padding] uu.number.fillZero(99, 4) -> "0099"
                                    //  [4][char padding] uu.number.fillZero(99, 4, "*") -> "**99"
        range:      uunumberrange,  // uu.number.range(min:Number, value:Number, max:Number):Number
                                    //  [1][clipping range] uu.number.range(0, 123, 100) -> 100
                                    //  [2][clipping range] uu.number.range(100, 123, 200) -> 123
        expand:     uunumberexpand  // uu.number.expand(current:Number, value:String/Number, fn:Function = parseFloat):Number
                                    //  [1][through]           uu.number.expand(10, 20)    -> 20
                                    //  [2][base + value]      uu.number.expand(10, "+10") ->  20
                                    //  [3][base - value]      uu.number.expand(10, "-10") ->   0
                                    //  [4][base * value]      uu.number.expand(10, "*10") -> 100
                                    //  [5][base / value]      uu.number.expand(10, "/10") ->   1
                                    //  [6][parseInt   effect] uu.number.expand(0, 1.234, parseInt) -> 1
                                    //  [7][parseFloat effect] uu.number.expand(0, 1.234, parseFloat) -> 1.234
                                    //  [8][parseFloat effect] uu.number.expand(0, 1.234)             -> 1.234
    }),
    // --- EVALUATION / FUNCTIONAL STATUS / URL DISPATCHER ---
    ready:    uumix(uuready, {      // uu.ready(readyEventType:String/IgnoreCaseString = "dom", callback:CallbackFunction, ...)
                                    //  [1][DOMReady]                          uu.ready(DOMContentReadyCallback, ...)
                                    //  [2][DOMReady]                          uu.ready("dom", DOMContentReadyCallback, ...)
                                    //  [3][WindowReady (window.onload)]       uu.ready("window", WindowReadyCallbacK, ...)
                                    //  [4][StorageReady]                      uu.ready("storage", StorageReadyCallback, ...)
                                    //  [5][CanvasReady]                       uu.ready("canvas", CanvasReadyCallback, ...)
                                    //  [6][AudioReady]                        uu.ready("audio", AudioReadyCallback, ...)
                                    //  [7][VideoReady]                        uu.ready("video", VideoReadyCallback, ...)
                                    //  [8][SVGReady]                          uu.ready("canvas", SVGReadyCallback, ...)
                                    //  [9][URL Dispatcher]                    uu.ready("href:/event/xmas", LocationHrefRegExpMatchedCallback, ...)
                                    //  [10][User defined ident callback]      uu.ready("MyIdent", UserDefinedCallback); uu.ready.fire("MyIdent")
                                    //  [11][User level(low order) callback]   uu.ready("ident", UserLevelCallback, ...)
                                    //  [12][User level(low order) callback]   uu.ready("ident:0", UserLevelCallback, ...)
                                    //  [13][App level(high order) callback]   uu.ready("ident:1", AppLevelCallback, ...)
                                    //  [14][System level(top order) callback] uu.ready("ident:2", SystemLevelCallback, ...)
                                    //  [15][multiple callback]                uu.ready(UserLevelDOMContentReadyCallback,
                                    //                                           "dom:2", SystemLevelDOMContentReadyCallback,
                                    //                                           "window", UserLevelWindowReadyCallbacK,
                                    //                                           "window:2", SystemLevelWindowReadyCallbacK,
                                    //                                           "href:/event/xmas", LocationHrefRegExpMatchedCallback,
                                    //                                           "storage", UserLevelStorageReadyCallback,
                                    //                                                      UserLevelStorageReadyCallback)
        fire:       uureadyfire,    // uu.ready.fire(readyEventType:CaseInsenseString, param:Mix = document)
        dom:        _false,         // true is DOMContentLoaded event fired
        window:     _false,         // true is window.onload event fired
        geo:        _false,         // true is geolocation ready event fired
        svg:        _false,         // true is <svg> ready event fired
        audio:      _false,         // true is <audio> ready event fired
        video:      _false,         // true is <video> ready event fired
        canvas:     _false,         // true is <canvas> ready event fired
        storage:    _false,         // true is window.localStorage ready event fired
        reload:     _false          // true is blackout (css3 cache reload)
    }, detectFeatures(_env)),
    // --- COLOR / COLOR DICTIONARY / COLOR ARRANGE ---
//{@color
    color:    uumix(uucolor, {      // uu.color(expr:Color/RGBAHash/HSLAHash/HSVAHash/String):Color
                                    //  [1][Color]                               uu.color(Color)               -> Color
                                    //  [2][RGBAHash/HSLAHash/HSVAHash to Color] uu.color({ h:0,s:0,l:0,a:1 }) -> Color
                                    //  [3][W3CNamedColor to Color]              uu.color("black")             -> Color
                                    //  [4]["#000..." to Color]                  uu.color("#000")              -> Color
                                    //  [5]["rgba(,,,,)" to Color]               uu.color("rgba(0,0,0,1)")     -> Color
                                    //  [6]["hsla(,,,,)" to Color]               uu.color("hsla(360,1%,1%,1)") -> Color
                                    //  [7]["hsva(,,,,)" to Color]               uu.color("hsva(360,1%,1%,1)") -> Color
        add:        uucoloradd,     // uu.color.add(source:String)
        random:     uucolorrandom   // uu.color.random(a:Number = 1):Color
                                    //  [1][random color] uu.color.random() -> Color
    }),
//}@color
    // --- IMAGE / LAZY IMAGE LOADER / SIZE DETECTION ---
//{@image
    image:    uumix(uuimage, {      // uu.image(url:URLString/URLStringArray, callback:CallbackFunction = void)
                                    //  [1][load image]  uu.image(url,        function(response) { ... })
                                    //  [2][load images] uu.image([url, ...], function(response) { ... })
                                    //      respone = { ok, rv }
        isCached:   uuimageiscached,// uu.image(url:URLString):Boolean
        size:       uuimagesize     // uu.image.size(node:HTMLImageElement):Hash - { w, h }
    }),
//}@image
    // --- FONT / FONT DETECTION ---
//{@font
    font:     uumix(uufont, {       // uu.font(font, embase) -> Hash
        list:       uufontlist,     // uu.font.list(fonts) -> Array
        detect:     uufontdetect,   // uu.font.detect(node) -> String("Alial")
        metric:     uufontmetric    // uu.font.text(font, text) -> { w, h }
    }),
//}@font
    // --- CANVAS ---
//{@canvas
    canvas:         uucanvas,       // uu.canvas(width:Number = 300, height:Number = 150,
                                    //           order:String = uu.config.canvas.order,
                                    //           placeHolder:Node = void):Node
//}@canvas
    // --- AUDIO ---
//{@audio
    audio:          uuaudio,        // uu.audio(url:String, option:Hash, callback:CallbackFunction)
//}@audio
    // --- VIDEO ---
//{@video
    video:          uuvideo,        // uu.video(url:String, option:Hash, callback:CallbackFunction)
//}@video
    // --- FLASH ---
//{@flash
//{@mb
    flash:    uumix(uuflash, {      // uu.flash(url:String, param:Hash,
                                    //          callback:CallbackFunction):Node
                                    //
                                    //   param.xid - String(= "external{{uniqueID}}"): ExternalInterface.objectID
                                    //   param.width - String/Number(= "100%"):
                                    //   param.height - String/Number(= "100%"):
                                    //   param.parent - Node(= <body>): <object> parent node
                                    //   param.nowrap - Boolean(= false): false is wrap <div>, true is nowrap
                                    //   param.nocache - Boolean(= false): false is cache, true is nocache
                                    //   param.wmode - String(= ""): "transparent", "opaque", ...
                                    //   param.quality - String(= ""): "high", ...
                                    //   param.flashVars - String(= ""): "key=value&key=value..."
                                    //   param.allowScriptAccess - String(= "always"): "always", "sameDomain", "never"
                                    //
                                    //  [1][div wrapped] uu.flash("a.swf")  -> <body><div>{{<object />}}</div></body>
                                    //                                               ~~~~~              ~~~~~~ <- wrapped new <div>
                                    //  [2][nowrap]      uu.flash("a.swf", { parent: <canvas>, nowrap: true })
                                    //                                      -> <canvas>{{<object />}}</canvas>
                                    //  [3][nocache]     uu.flash("a.swf", { nocache: true })
                                    //                                      -> <body><div>{{<object><param name="movie" value="a.swf?12345" /></object>}}</div></body>
                                    //                                                                                              ~~~~~~
                                    //  [4][with xid]    uu.flash("a.swf", { xid: "externalAudio1" })
                                    //                                      -> <body><div>{{<object id="externalAudio1" />}}</div></body>
                                    //                                                              ~~~~~~~~~~~~~~~~~~~
                                    //  [5][callback]    uu.flash("a.swf", { xid: "externalAudio1" }, callback)
                                    //                                      -> <body><div>{{<object id="externalAudio1" />}}</div></body>
                                    //                                          callback("externalAudio1", "init")
                                    //                                          callback("externalAudio1", "play")
                                    //                                          callback("externalAudio1", "playing")
        fragment:   uuflashfragment // uu.flash.fragment(url:String, xid:String,
                                    //                   width:Number/String, height:Number/String,
                                    //                   param:Hash):HTMLObjectFragmentString
    }),
//}@mb
//}@flash
    // --- COOKIE ---
//{@cookie
    cookie:   uumix(uucookie, {     // uu.cookie(prefix:String):Hash
                                    //  [1][load cookie] uu.cookie() -> { phpsession: ... , }
        save:       uucookiesave    // uu.cookie.save(prefix:String, data:Hash, date:UTCDateString/Date = void):Number
                                    //  [1][save cookie] uu.cookie.save()
    }),
//}@cookie
    // --- STORAGE (WebStorage) ---
//{@storage
    storage:        null,           // uu.storage - uu.Class.Storage instance
//}@storage
    // --- SOCKET (WebSocket) ---
//{@socket
    socket:         null,           // uu.socket - uu.Class.Socket instance
//}@socket
//{@geo
    geo:      uumix(uugeo, {        // uu.geo(callback:CallbackFunction,
                                    //        option:Hash = { age, timeout, accuracy }):Boolean
                                    //      age      - Number:
                                    //      timeout  - Number:
                                    //      accuracy - Boolean:
        watch:      uugeowatch,     // uu.geo.watch(callback:CallbackFunction,
                                    //              option:Hash = { age, timeout, accuracy }):Number
        stop:       uugeostop,      // uu.geo.stop(watchid:Number) - stop watch
        api:        0,              // uu.geo.api - Number: detected api(0: unknown, 1: error,
                                    //                                   2: Native API, 4: WebService)
        location: {                 // uu.geo.location - Hash: last location
            ok:         _false,
            option:     {},
            status:     400,
            latitude:   null,
            longitude:  null,
            timestamp:  0
        }
    }),
//}@geo
    // --- URL / URL ACCESSOR ---
    url:      uumix(uuurl, {        // uu.url(url:URLHash/URLString = "", parseQuery:Boolean = false):URLString/URLHash
                                    //  [1][current abs-dir]   uu.url() -> "http://example.com/index.htm"
                                    //  [2][parse url]         uu.url("http://example.com/dir/file.ext?a=b") -> { protocol: "http:", query: {}, ... }
                                    //  [3][parse url + query] uu.url("http://example.com/dir/file.ext?a=b") -> { protocol: "http:", query: { a: "b" } }
                                    //  [4][build url]         uu.url({ schme: "http", ... }) -> "http://example.com/..."
        dir:        uuurldir,       // uu.url.dir(url:URLString/PathString):String
                                    //  [1][chop filename] uu.url.dir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
                                    //  [2][chop filename] uu.url.dir("/root/dir/file.ext")              -> "/root/dir/"
                                    //  [3][chop filename] uu.url.dir("/file.ext")                       -> "/"
                                    //  [4][through]       uu.url.dir("/")                               -> "/"
                                    //  [5][supply slash]  uu.url.dir("")                                -> "/"
        hash:       uuurlhash,      // uu.url.hash(url:URLString):String
                                    //  [1][get hash] uu.url.hash("http://example.com/api#hash") -> "hash"
                                    //  [2][get hash] uu.url.hash("http://example.com/api") -> ""
        split:      uuurlsplit,     // uu.url.split(url:URLString/PathString):Array+Hash - { dir, file }
                                    //  [1][split dir | file.ext] uu.url.split("http://example.com/dir/file.ext") -> ["http://example.com/dir/", "file.ext"]
        query:      uuurlquery,     // uu.url.query(queryString:QueryString/Hash, add:Hash = void, joint:String = uu.config.queryJoint):QueryString/Hash
                                    //  [1][parse] uu.url.query("key1=a;key2=b;key3=0;key3=1")    -> { key1: "a", key2: "b", key3: ["0", "1"] }
                                    //  [2][build] uu.url.query({ key1: "a", key2: "b",
                                    //                         key3: ["0", "1"] })             -> "key1=a;key2=b;key3=0;key3=1"
                                    //  [3][add]   uu.url.query( "key=val",     { key2: "val2" }) -> "key=val;key2=val2"
                                    //  [4][add]   uu.url.query({ key: "val" }, { key2: "val2" }) -> "key=val;key2=val2"
        resolve:    uuurlresolve,   // uu.url.resolve(url:URLString = ".", currentDir = ""):URLString
                                    //  [1][resolve abs-url] uu.url.resolve("./index.htm") -> "http://example.com/index.htm"
        normalize:  uuurlnormalize  // uu.url.normalize(url:String):String
                                    //  [1][up to dir]          uu.url.normalize("http://example.com/api/../") -> "http://example.com/"
                                    //  [2][current dir]        uu.url.normalize("http://example.com/api/./")  -> "http://example.com/api/"
                                    //  [3][through]            uu.url.normalize("http://example.com/api/")    -> "http://example.com/api/"
                                    //  [4][add tail slash]     uu.url.normalize("http://example.com/api")     -> "http://example.com/api/"
                                    //  [5][boundary condition] uu.url.normalize("http://example.com/../")     -> "http://example.com/"
                                    //  [6][rel path]           uu.url.normalize("/example.com/api/../")       -> "/example.com/"
                                    //  [7][rel path]           uu.url.normalize("/example.com/../")           -> "/"
                                    //  [8][boundary condition] uu.url.normalize("/../")                       -> "/"
                                    //  [9][boundary condition] uu.url.normalize("/./")                        -> "/"
                                    // [10][boundary condition] uu.url.normalize("/")                          -> "/"
                                    // [11][boundary condition] uu.url.normalize("")                           -> "/"
    }),
    // --- DEBUG ---
//{@canvas
    hatch:          uuhatch,        // uu.hatch(param:Hash):Boolean
                                    //  [1][draw hatch pattern]       uu.hatch()
                                    //  [2][draw large hatch pattern] uu.hatch({ size: 20, color: red })
//}@canvas
    glow:           uuglow,         // uu.glow(node:Node/NodeArray/NodeList/NodeSet/CSSSelectorExpressionString)
    puff:           uualert,        // uu.alert alias [DEPRECATED]
    alert:          uualert,        // uu.alert(mix:Mix/FormatString = void, var_args:Mix, ...)
                                    //  [1][alert] uu.alert("hello world")                   -> alert('hello world')
                                    //  [2][alert] uu.alert("@uupaa")                        -> alert('@uupaa')
                                    //  [3][alert] uu.alert("@ @!", "hello", "world")        -> alert('hello world!')
                                    //  [4][alert] uu.alert({ key: "value", num: 1 })        -> alert('{ "key": "value", num: 1 }')
                                    //  [5][alert] uu.alert(document.body.firstElementChild) -> alert('body>div:nth-child(1)')
                                    //  [6][alert] uu.alert("a", { k: 123 })                 -> alert('"a", { "k": 123 }')
                                    //  [7][alert] uu.alert()                                -> alert('undefined')
//{@debug
    log:      uumix(uulog, {        // uu.log(var_args:Mix = void, ...)
                                    //  [1][add(display) log] uu.log("Hello Log")
                                    //  [2][add remote log]   window.uuconfig = { log: { remote: "http://localhost/log?msg=" }};
                                    //                        uu.log("Hello Log") -> GET /http://localhost/log?msg=Hello%20Log
                                    //  [3][clear all log]    uu.log()
        clear:      uulogclear      // uu.log.clear()
    }),
    trace:          uutrace,        // uu.trace(fn:Function = void,
                                    //          length:Number = void,
                                    //          arg1:Mix = void,
                                    //          arg2:Mix = void,
                                    //          arg3:Mix = void,
                                    //          arg4:Mix = void):Array/void
                                    //  [1][add function trace]       uu.trace(argument.callee, argument.length, arg, ...)
                                    //  [2][add remote trace]         window.uuconfig = { trace: { remote: "http://localhost/trace?msg=" }};
                                    //                                uu.trace("Hello Trace") -> GET /http://localhost/trace?msg=Hello%20Trace
                                    //  [3][dump and clear all trace] uu.trace() -> Array
//}@debug
    // --- UNIT TEST ---
//{@test
    ok:             uuok,           // uu.ok(title:String/Boolean = void,
                                    //       lval:Mix = void,
                                    //       operator:String = void,
                                    //       rval:Mix = void,
                                    //       more:String = void):Hash/void - { ok, ng, ms, total }
                                    //  [1][add separater]  uu.ok("group separater or comment")
                                    //  [2][judge]          uu.ok("test title", 1, "===", 1, "more info")
                                    //  [3][get/show score] uu.ok() -> { ok, ng, ms, total }
                                    //  [4][get score]      uu.ok(false) -> { ok, ng, ms, total }
    ng:             uung,           // uu.ng(title:String,
                                    //       lval:Mix, operator:String = "NG", rval:Mix = void)
                                    //  [1][assert]         uu.ng("123 == 123", 123, "===", 123)
//}@test
    // --- UI ---
//{@ui
    ui:       uumix(uuui, {         // uu.ui(expr:StringArray/String = "", context:Node = <body>):InstanceArray
                                    //  [1][query all UI]         uu.ui.query() -> [<div>.instance, ...]
                                    //  [2][query Slider]         uu.ui.query("Slider", <body>) -> [<div>.instance, ...]
                                    //  [3][query Slider and Tab] uu.ui.query(["Slider", "Tab"], <body>) -> [<div>.instance, ...]
                                    //  [4][query expression]     uu.ui.query("#ui>div[ui=Slider]", <body>) -> [<div>.instance, ...]
        bind:       uuuibind,       // uu.ui.bind(uiname:String, callback:CallbackFunction)
        build:      uuuibuild       // uu.ui.build(uiname:Node/NodeArray/String = "", var_args ...):Node/NodeArray
                                    //  [1][build]      uu.ui("Slider", { step: 2 }) -> [<div ui="Slider" />]
                                    //  [2][transform]  uu.ui() -> [<div ui="Slider"><input type="range"/></div>, ...]
                                    //  [3][transform]  uu.ui(Node) -> [node]
                                    //  [4][transform]  uu.ui(NodeArray) -> [node, ...]
    }),
//}@ui
    // --- DMZ ( DeMilitarized Zone ) / PROXY / STM ( short term memory ) ---
    dmz: {                          // uu.dmz
        location: {                 // uu.dmz.location
            href:   location.href,  // uu.dmz.location.href - String: keep initial location.href
            hash:   location.hash   // uu.dmz.location.hash - String: keep initial location.hash
        }
    },
    // --- OTHER ---
    loopout:        _false,         // uu.loopout - false
    nop:            uunop,          // uu.nop - none operation
    pao:            uupao           // uu.pao - `function-producing` function
                                    //  [1][pao literal ] uu.pao(false)  -> (function() { return false; })
                                    //  [2][pao function] uu.pao(uu.nop) -> (function() { return uu.nop; })
});

//{@nodeset

// uu.Class.NodeSet - uu.Class.NodeSet.prototype alias
uu.Class.NodeSet = NodeSet[_prototype] = {
    push:           NodeSetPush,    // NodeSet.push():NodeSet
    pop:            NodeSetPop,     // NodeSet.pop():NodeSet
    find:           NodeSetFind,    // NodeSet.find(expr:String):NodeSet
    nth:            NodeSetNth,     // NodeSet.nth(index:Number = 0, evaluator:Function = void):Node/NodeSet
    each:           NodeSetEach,    // NodeSet.each(evaluator:Function, loopout:Boolean = false):NodeSet
    size:           NodeSetSize,    // NodeSet.size():Number
    array:          NodeSetArray,   // NodeSet.array():NodeArray
    indexOf:        NodeSetIndexOf, // NodeSet.indexOf(node):Number(index or -1)
    add:            NodeSetAdd,     // NodeSet.add(source:Node/DocumentFragment/HTMLFragmentString/TagName = "div",
                                    //             position:String = "./last"):NodeSet
    klass:          NodeSetKlass,   // NodeSet.klass(className:String):NodeSet
    iter:           NodeSetIter     // [PROTECTED]
};

// NodeSetIter(0) - forEach Methods
uueach({
    bind:           uuevent,        // NodeSet.bind(exEventType, callback)
    unbind:         uueventunbind,  // NodeSet.unbdin(exEventType)
//{@mb
//{@eventhover
    hover:          uueventhover,   // NodeSet.hover(expr)
    unhover:        uueventunhover, // NodeSet.unhover()
//}@eventhover
//}@mb
    cyclic:         uueventcyclic,  // NodeSet.cyclic(exEventType, callback, cyclic, loop)
    uncyclic:       uueventuncyclic,// NodeSet.cyclic(exEventType)
//{@fx
    fx:             uufx,           // NodeSet.fx(duration, option)
    skip:           uufxskip,       // NodeSet.skip(skipAll, invisible)
    show:           uufxshow,       // NodeSet.show(duration, displayValue)
    hide:           uufxhide,       // NodeSet.hide(duration)
    fade:           uufxfade,       // NodeSet.fade(duration, option)
    fadeIn:         uufxfadein,     // NodeSet.fadeIn(duration, option)
    fadeOut:        uufxfadeout,    // NodeSet.fadeOut(duration, option)
    puff:           uufxpuff,       // NodeSet.puff(duration, option)
    flare:          uufxflare,      // NodeSet.flare(duration, option)
    swing:          uufxswing,      // NodeSet.swing(duration, option)
    slide:          uufxslide,      // NodeSet.slide(duration, option)
    slideUp:        uufxslideup,    // NodeSet.slideUp(duration, option)
    slideDown:      uufxslidedown,  // NodeSet.slideDown(duration, option)
    shrink:         uufxshrink,     // NodeSet.shrink(duration, option)
    moveIn:         uufxmovein,     // NodeSet.moveIn(duration, option)
    moveOut:        uufxmoveout,    // NodeSet.moveOut(duration, option)
    highlight:      uufxhighlight,  // NodeSet.highlight(duration, option)
//}@fx
    remove:         uunoderemove    // NodeSet.remove()
}, function(fn, name) {
    NodeSet[_prototype][name] = function() {
        return NodeSetIter(0, this, fn, arguments);
    };
});

// NodeSetIter(1) - map methods
uueach({
//{@form
    value:          uuformvalue,    // NodeSet.value(value = void)
//}@form
    attr:           uuattr,         // NodeSet.attr(key:String/Hash = void, value:String = void)
    data:           uudata,         // NodeSet.data(key:String/Hash = void, value:String = void)
    css:            uucss,          // NodeSet.css(key:String/Hash = void, value:String = void)
    text:           uutext          // NodeSet.text(text:String = void, var_args...)
}, function(fn, name) {
    NodeSet[_prototype][name] = function() {
        return NodeSetIter(1, this, fn, arguments);
    };
});
//}@nodeset

// --- DEPRECATED API ---
uu.trim     = uustringtrim;         // uu.trim     as uu.string.trim        [ALIAS][DEPRECATED]
uu.format   = uustringformat;       // uu.format   as uu.string.format      [ALIAS][DEPRECATED]
uu.sprintf  = uustringsprintf;      // uu.sprintf  as uu.string.sprintf     [ALIAS][DEPRECATED]
uu.truncate = uustringtruncate;     // uu.truncate as uu.string.truncate    [ALIAS][DEPRECATED]

// =========================================================
// uu.config - configuration
function uuconfig() {
}

// uu.nop - none operation
function uunop() {
}

// uu.pao - `function-producing` function
function uupao(arg) { // @param Mix:
                      // @return Function:
    //  [1][pao literal ] uu.pao(false)  -> (function() { return false; })
    //  [2][pao function] uu.pao(uu.nop) -> (function() { return uu.nop; })

    return function() {
        return arg;
    };
}

// inner - get base directory and URL Normalize
function getBaseDir(rex) { // @param RegExp(= /uupaa(\-\d+)?\.js/): library name pattern
    rex = rex || /uupaa(\-\d+)?\.js/;
    var rv = uutag("script", doc).pop().src[_replace](/[^\/]+$/, function(file) {
                return rex.test(file) ? "../" : "";
             });

    // URL Normalize
    // "http://example.com/js/../uupaa.js" -> "http://example.com/uupaa.js"
    return uuurlnormalize(resolveURL(rv));
}

// inner - new node
function newNode(tag) { // @param TagNameString(= "div"):
                        // @return Node: <div>
    return doc.createElement(tag || "div");
}

// inner - new text node
function newText(text) { // @param String:
                         // @return TextNode: <textNode>text</textNode>
    return doc.createTextNode(text);
}

// --- READY ---
// uu.ready - bind DOMContentLoaded/WindowOnLoad/StorageReady/CanvasReady/AudioReady/SVGReady event
function uuready(/* readyEventType, */  // @param String/CaseInsenseString(= "dom"): readyEventType
                 /* callback, ... */) { // @param CallbackFunction: callback functions

    //  [1][DOMReady]                          uu.ready(DOMContentReadyCallback, ...)
    //  [2][DOMReady]                          uu.ready("dom", DOMContentReadyCallback, ...)
    //  [3][WindowReady (window.onload)]       uu.ready("window", WindowReadyCallbacK, ...)
    //  [4][StorageReady]                      uu.ready("storage", StorageReadyCallback, ...)
    //  [5][CanvasReady]                       uu.ready("canvas", CanvasReadyCallback, ...)
    //  [6][AudioReady]                        uu.ready("audio", AudioReadyCallback, ...)
    //  [7][VideoReady]                        uu.ready("video", VideoReadyCallback, ...)
    //  [8][SVGReady]                          uu.ready("canvas", SVGReadyCallback, ...)
    //  [9][URL Dispatcher]                    uu.ready("href:/event/xmas", LocationHrefRegExpMatchedCallback, ...)
    //  [10][User defined ident callback]      uu.ready("MyIdent", UserDefinedCallback); uu.ready.fire("MyIdent")
    //  [11][User level(low order) callback]   uu.ready("ident", UserLevelCallback, ...)
    //  [12][User level(low order) callback]   uu.ready("ident:0", UserLevelCallback, ...)
    //  [13][App level(high order) callback]   uu.ready("ident:1", AppLevelCallback, ...)
    //  [14][System level(top order) callback] uu.ready("ident:2", SystemLevelCallback, ...)
    //  [15][multiple callback]                uu.ready(UserLevelDOMContentReadyCallback,
    //                                           "dom:2", SystemLevelDOMContentReadyCallback,
    //                                           "window", UserLevelWindowReadyCallbacK,
    //                                           "window:2", SystemLevelWindowReadyCallbacK,
    //                                           "href:/event/xmas", LocationHrefRegExpMatchedCallback,
    //                                           "storage", UserLevelStorageReadyCallback,
    //                                                      UserLevelStorageReadyCallback)

    var mix, // String("ident") or Function(callback)
        i = 0, iz = arguments.length, ary,
        db = uuready.uudb, // alias
        type = "dom",      // default type
        order = 0;         // callback order

    if (!uuready.reload) {
        for (; i < iz; ++i) {
            mix = arguments[i]; // String("href:...") / String("window:2") / Function(callback)

            if (isString(mix)) {
                if (!mix.indexOf("href:")) { // String("href:...") -> URL Dispatcher
                    if (RegExp(mix.slice(5)).test(location.href)) { // "http://example.com:port/path/file.ext?key=val#hash"
                        order = 0;
                        type = "#href#";
                    } else {
                        type = "#avoid#"; // url miss matched -> clear type -> avoid next callback function
                    }
                } else { // String("window:2") -> window.onload, String("MyIdent") -> User callback
                    ary = (mix.indexOf(":") > 0 ? mix : mix + ":0").split(":"); // supply
                    type = ary[0];   // "window:2" -> "window"
                    order = +ary[1]; // "window:2" -> 2
                }
            } else { // isFunction(mix)
                if (uuready[type]) { // already? -> fire
                    switch (type) {
                    case "canvas":  mix(uu, uutag("canvas")); break; // uu.ready("canvas", function(uu, uu.tag("canvas")) { ... })
                    case "storage": mix(uu, uu.storage); break;      // uu.ready("storage", function(uu, uu.storage) { ... })
                    case "svg":     mix(uu, uu.svg); break;          // uu.ready("svg", function(uu, uu.svg) { ... })
                    case "#avoid#": break;                           // uu.ready("href:missmatched", function(){}) -> avoid callback
                    default:        mix(uu, doc);                    // uu.ready("dom", function(uu, doc) { ... })
                                                                     // uu.ready("MyIdent", function(uu, doc) { ... })
                    }
                } else {
                    if (type === "#href#") {
                        mix(uu, doc); // URL Dispatcher
                    } else if (type) {
                        db[type] || (db[type] = [[], [], []]); // init [order0, order1, order2]
                        db[type][order].push(mix);
                    }
                }
            }
        }
    }
}
uuready.uudb = {}; // { readyEventType: [[low order], [mid order], [high order]], ... }

// uu.ready.fire
function uureadyfire(readyEventType, // @param CaseInsenseString: readyEventType
                     param) {        // @param Mix(= document): callback(uu, param)
    var type = readyEventType[_toLowerCase](),
        db = uuready.uudb[type], ary, callback, i = 0;

    if (db) {
        ary = db[2][_concat](db[1], db[0]); // join order: ary = [2] + [1] + [0]
        uuready.uudb[type] = null; // clear order array

        for (; callback = ary[i++]; ) {
            callback(uu, param || doc); // uu.ready(function(uu, doc) { ... });
                                        // uu.ready("canvas", function(uu, uu.tag("canvas")) { ... });
                                        // uu.ready("audio", function(uu, that) { ... });
        }
    }
}

// --- MsgPump class ---
MsgPump[_prototype] = {
    send:           uumsgsend,      // MsgPump.send(address:NodeArray/InstanceArray/Array/Mix,
                                    //              message:String,
                                    //              param1:Mix = void,
                                    //              param2:Mix = void):Array/Mix
                                    //  [1][multicast] MsgPump.send([instance, ...], "hello") -> ["world!", ...]
                                    //  [2][unicast  ] MsgPump.send(instance, "hello") -> ["world!"]
                                    //  [3][broadcast] MsgPump.send(null, "hello") -> ["world!", ...]
    post:           uumsgpost,      // MsgPump.post(address:NodeArray/InstanceArray/Array/Mix,
                                    //              message:String,
                                    //              param1:Mix = void,
                                    //              param2:Mix = void)
                                    //  [1][multicast] MsgPump.post([instance, ...], "hello")
                                    //  [2][unicast  ] MsgPump.post(instance, "hello")
                                    //  [3][broadcast] MsgPump.post(null, "hello")
    bind:           uumsgbind,      // MsgPump.bind(instance:Instance)
    unbind:         uumsgunbind     // MsgPump.unbind(instance:Instance)
};
uu.msg = new MsgPump();             // uu.msg - MsgPump instance

// --- Junction class ---
uuClass("Junction", {
    init:           JunctionInit,   // uu.junction(race:Number, item:Number, callback:CallbackFunction)
                                    //   callback(values:MixArray, ok:Boolean)
    ok:             JunctionOK,     // ok(value:Mix = void):this
    ng:             JunctionNG,     // ng(value:Mix = void):this
    judge:          JunctionJudge   // judge():this
});

// --- StyleSheet Class ---
uuClass("StyleSheet", {
    init:           StyleSheetInit, // uu("StyleSheet", id:String = "")
    add:            StyleSheetAdd,  // styleSheet.add(expr:Hash/String, decl:String = void)
                                    //  [1] styleSheet.add({ "div>p": "color:red;font-weight:bold", ... })
    clear:          StyleSheetClear // styleSheet.clear()
});

// --- SystemStyleSheet Class ---
uuClassSingleton("SSS", {
    init:           SSSInit,        // uu("SystemStyleSheet")
    add:            SSSAdd,         // add(selector:String, declaration:String):Number
                                    //  [1][add last rule] add("div>p", "color:red;font-weight:bold") -> 0
    update:         SSSUpdate,      // update(index:Number, selector:String, declaration:String)
    remove:         SSSRemove,      // remove(index:Number)
    cssText:        SSSCSSText,     // cssText()
    clear:          SSSClear        // clear()
});

// --- ECMAScript-262 5th ---
// Array.isArray - fallback impl.
function fallbackIsArray(search) { // @param Mix: search
                                   // @return Boolean:
    return toString.call(search) === "[object Array]";
}
// Date.now - fallback impl.
function fallbackDateNow() { // @return Number:
    return +new Date;
}

uumix(Array[_prototype], {
//{@mb
    every:          ArrayEvery,     // Array#every(evaluator:Function, that:this = void):Boolean
    filter:         ArrayFilter,    // Array#filter(evaluator:Function, that:this = void):Array
    indexOf:        ArrayIndexOf,   // Array#indexOf(search:Mix, fromIndex:Number = 0):Number
    lastIndexOf:                    // Array#lastIndexOf(search:Mix, fromIndex:Number = this.length):Number
                    ArrayLastIndexOf,
//}@mb
    map:            ArrayMap,       // Array#map(evaluator:Function, that:this = void):Array
    some:           ArraySome,      // Array#some(evaluator:Function, that:this = void):Boolean
    forEach:        ArrayForEach,   // Array#forEach(evaluator:Function, that:this = void)
    reduce:         ArrayReduce,    // Array#reduce(evaluator:Function, initialValue:Mix = void):Mix
    reduceRight:                    // Array#reduceRight(evaluator:Function, initialValue:Mix = void):Mix
                    ArrayReduceRight
}, 0, 0);

uumix(Boolean[_prototype], {
    toJSON:         ObjectToJson    // Boolean#toJSON
}, 0, 0);

uumix(Date[_prototype], {
    toISOString:    DateToISOString,// String#toISOString
    toJSON:         DateToJSON      // String#toJSON
}, 0, 0);
Date.now || (Date.now = fallbackDateNow); // Date.now()

uumix(Number[_prototype], {
    toJSON:         ObjectToJson    // Number#toJSON
}, 0, 0);

uumix(String[_prototype], {
    trim:           StringTrim,     // String#trim
    toJSON:         ObjectToJson    // String#toJSON
}, 0, 0);

uumix(Function[_prototype], {
    bind:           FunctionBind    // Function#bind
}, 0, 0);

//{@mb
_gecko && !win.HTMLElement[_prototype].innerText &&
(function(proto) {
    proto.__defineGetter__("innerText", innerTextGetter);
    proto.__defineSetter__("innerText", innerTextSetter);
    proto.__defineGetter__("outerHTML", outerHTMLGetter);
    proto.__defineSetter__("outerHTML", outerHTMLSetter);
})(win.HTMLElement[_prototype]);
//}@mb

// --- CREATE HASH TABLES ---
(function(i, n, v) {
    for (; i < 0x200; ++i) {
        n = i - 0x100;
        _num2hh[n] = v = i.toString(16).slice(1);
        _hh2num[v] = n;
        _num2bb[n] = v = String.fromCharCode(n);
        _bb2num[v] = n;
        _num2num[n] = n;
        _bit2num[("0000000" + n.toString(2)).slice(-8)] = n;
    }
    for (i = 100; i < 200; ++i) {
        n = i - 100;
        _num2dd[n] = v = i.toString().slice(1);
        _dd2num[v] = n;
    }
    uumix(uuhash, {
        dd2num:     _dd2num,        // uu.hash.dd2num - {  "00":    0 , ...  "99":   99  }
        num2dd:     _num2dd,        // uu.hash.num2dd - {    0 :  "00", ...   99 :  "99" }
        bb2num:     _bb2num,        // uu.hash.bb2num - { "\00":    0 , ... "\ff":  255  }
        num2bb:     _num2bb,        // uu.hash.num2bb - {    0 : "\00", ...  255 : "\ff" }
        hh2num:     _hh2num,        // uu.hash.hh2num - {  "00":    0 , ...  "ff":  255  }
        num2hh:     _num2hh         // uu.hash.num2hh - {    0 :  "00", ...  255 :  "ff" }
    });
})(0x100);

// ===================================================================

// uu - factory
function uufactory(expr,   // @param NodeSet/Node/NodeArray/OOPClassNameString/window: ClassName or Expression
                   arg1,   // @param NodeSet/Node/Expression/Mix(= void): ClassName.init arg1 or Expression.context
                   arg2,   // @param Mix(= void): ClassName.init arg2
                   arg3,   // @param Mix(= void): ClassName.init arg3
                   arg4) { // @param Mix(= void): ClassName.init arg4
                           // @return Instance/NodeSet:
    //  [1][Class factory]   uu("MyClass", arg1, arg2) -> new uu.Class.MyClass(arg1, arg2)
    //  [2][NodeSet factory] uu("div>ul>li", <body>) -> NodeSet

    if (typeof expr === _string && uuClass[expr]) {     // Class factory
        return new uuClass[expr](arg1, arg2, arg3, arg4);
    }
//{@nodeset
    return new NodeSet(expr, arg1, arg2, arg3, arg4);   // NodeSet factory
//}@nodeset
}

// --- SNIPPET ---
//  <script>
//  var arg = {
//      hoge: 'style="color:red"',
//      listStyle: 'style="color: #3d3; background-color: #ddd"',
//      list: {
//          key: "a,b,c".split(",")   <-- "key" is <each> reserved word
//          value: "value1,value2,value3".split(",")
//      }
//  };
//  uu.snippet(snippetid, arg);
//  </script>
//  <script type="text/html" src="...">
//  return <>
//      <div {{arg.hoge}}>                              // {{arg.hoge}} -> style...
//          <ul>
//              <each arg.list>                         // <each arg.list> -> for (...)
//                  <li {{arg.listStyle}}>{{key}}</li>  // {{key}}   -> arg.list.key[n]
//                  <li>{{value}}</li>                  // {{value}} -> arg.list.value[n]
//              </each>
//          </ul>
//      </div>
//  </>
//  </script>
//
//{@snippet
// uusnippet - evaluate snippet
function uusnippet(id,    // @param String: snippet id. <script id="...">
                   arg) { // @param Array/Hash(= void): arg
                          // @return String/Mix:
    function brace2ident(_, ident) {
        // {{ident}}     -> {(ident)}  (dualBrace to eachBrace)
        // {{uu.ident}}  -> uu.ident
        // {{arg.ident}} -> arg.ident

        return ident[_indexOf](".") > 0 ? "'+" + ident + "+'"  // "{{arg.ident}}" -> "+ident+"
                                        : '{(' + ident + ')}'; // "{{ident}}"     -> "{(ident)}" // each brace
    }

    // <>...</> -> uu.node.bulk(' ... ');
    function each(_, match) {
        return "uu.node.bulk('" +
                match[_replace](/("|')/g, "\\$1")
                     [_replace](/\n/g, "\\n")
                     [_replace](eachBlock, function(_, hash, block) { // <each arg.list>...</each>
                        return "'+uu.snippet.each(" + hash + ",'" +
                               block[_replace](dualBrace, brace2ident) + "')+'";
                     })
                     [_replace](dualBrace, brace2ident) + "');";
    }

    arg = arg || {};
    var xhr, js = uusnippet.js[id] || "", node, // {
        eachBlock = /<each ([^>]+)>([\s\S]*?)<\/each>/g,
        dualBrace = /\{\{([^\}]+)\}\}/g;

    if (!js) {
        node = uuid(id);
        if (node) {
            if (node.src) { // <script type="text/html" src="...">
                xhr = uurequire(node.src);
                if (xhr.ok) {
                    js = xhr.rv;
                }
            } else {
                js = node.text;
            }
            if (js) {
                js = js[_replace](/\r\n|\r|\n/g, "\n")
                       [_replace](/<>\n([\s\S]*?)^<\/>$/gm, each); // <>...</>
                uusnippet.js[id] = js;
            }
        }
        uusnippet.run[id] = 0; // activated counter
    }
    if (js) {
        arg.run = uusnippet.run[id];
        ++uusnippet.run[id];
    }
    return js ? (new Function("arg", js))(arg) : "";
}
uusnippet.js = {};  // { id: JavaScriptExpression, ... }
uusnippet.run = {}; // { id: activated counter, ... }
uusnippet.each = function(hash, fragment) { // (
    var i = 0, iz = hash.key.length, // get each length from "key"
        block = [], eachBrace = /\{\(([^\)]+)\)\}/g,
        lastValue = {};

    for (; i < iz; ++i) {
        block.push(fragment[_replace](eachBrace, function(_, ident) {
            if (ident === "i") { // {{i}} is loop count
                return i;
            }
            var rv = isArray(hash[ident]) ? hash[ident][i]
                                          : hash[ident],
                undef;

            return rv === undef ? lastValue[ident]
                                : (lastValue[ident] = rv);
        }));
    }
    return block.join("");
};
//}@snippet

// --- AJAX ---
//{@ajax
// uu.ajax - Async request
function uuajax(url,        // @param String: url
                option,     // @param Hash: { xml, data, ifmod, method, timeout,
                            //                header, binary, before, after }
                            //    option.xml     - Boolean(= false): true is xml.responseXML, false is xml.responseText
                            //    option.data    - Mix(= null): upload data
                            //    option.ifmod   - Boolean(= false): true is apply/lookup "If-Modified-Since" header
                            //    option.method  - String(= "GET"): "GET", "POST", "PUT"
                            //    option.timeout - Number(= 10): timeout sec
                            //    option.header  - Hash(= {}): { key: "value", ... }
                            //    option.binary  - Boolean(= false): true is binary data
                            //    option.before  - CallbackFunction(= void): before({ option }, xhr)
                            //    option.after   - CallbackFunction(= void): after({ option, ok, rv, status }, xhr)
                callback) { // @param CallbackFunction(= void): callback(response)
                            //    response        - Hash: { ok, rv, date, cached, option, status }
                            //    response.ok     - Boolean(= false): true is status = 20x, false is status = 30x, 40x, 50x
                            //    response.rv     - String(= null): result value. xhr.responseText or xhr.responseXML
                            //    response.date   - DateHash(= null): uu.date(If-Modified-Since) value (option.iftMode)
                            //    response.cached - Boolean(= false): true is Not Modified(xhr.status = 304)
                            //    response.option - Hash(= option): option argument
                            //    response.status - Number(= 400): xhr.status
    function readyStateChange() {
        if (xhr && xhr.readyState === 4) {
            var status = xhr.status, lastMod,
                resp = {
                    ok:     !status || (status >= 200 && status < 300),
                    rv:     null,
                    date:   null,
                    cached: _false,
                    option: option,
                    status: status
                };

            if (!run++) {
                if (method === "PUT") {
                    resp.rv = resp.ok ? xhr.responseText : "";
                } else  {
                    if (resp.ok) {
                        if (binary) {
                            resp.rv = /*{@mb*/ _ie ? xhr2ByteArrayIE(xhr) : /*}@mb*/
                                      binaryString2ByteArray(xhr.responseText);
                        } else {
                            resp.rv = option.xml ? (xhr.responseXML  || "")
                                                 : (xhr.responseText || "");
                        }
                        // --- Last-Modified / Not Modified(xhr.status = 304) ---
                        if (option.ifmod) {
                            lastMod = xhr.getResponseHeader("Last-Modified");
                            if (lastMod) {
                                cache[url] = [uudate(Date.parse(lastMod)), resp.rv];
                            }
                        }
                    } else if (option.ifmod && status === 304 && cache[url] !== void 0) {
                        // has cached result value
                        resp.cached = _true;
                        resp.date = cache[url][0]; // DateHash
                        resp.rv   = cache[url][1]; // cached result value
                    }
                }
                option.after && option.after(resp, xhr); // after callback
                callback && callback(resp); // finished callback
                gc();
            }
        }
    }

    function watchdog() {
        ng(1, 408); // 408: Request Time-out
    }

    function ng(abort, status) {
        if (!run++) {
            var resp = {
                ok: _false,
                rv: null,
                date: null,
                cached: _false,
                option: option,
                status: status || 400
            };

            option.after && option.after(resp, xhr); // after callback
            callback && callback(resp); // finished callback
            gc(abort);
        }
    }

    function gc(abort) {
        if (abort) {
            // [IE6][IE7][FIX] xhr.abort throw exception
            // http://twitter.com/uupaa/status/26953945895
            try {
                xhr && xhr.abort && xhr.abort();
            } catch (err) {}
        }
        watchdogTimer && (clearTimeout(watchdogTimer), watchdogTimer = 0);
        xhr = null;
//{@mb
        _gecko && uueventdetach(win, "beforeunload", ng); // [Gecko]
//}@mb
    }

    var watchdogTimer = 0,
        method = option.method || "GET",
        header = option.header || {},
        binary = option.binary,
        cache = uuajax.cache,
        data = option.data || null,
        xhr = newXHR(),
        run = 0, i,
        overrideMimeType = "overrideMimeType",
        setRequestHeader = "setRequestHeader",
        getbinary = method === "GET" && binary;

    try {
        xhr.onreadystatechange = readyStateChange;
        xhr.open(method, url, _true); // ASync

        getbinary && xhr[overrideMimeType] &&
            xhr[overrideMimeType]("text/plain; charset=x-user-defined");
        // Content-Type:       "application/x-www-form-urlencoded"
        data &&
            xhr[setRequestHeader]("Content-Type",
                                  "application/x-www-form-urlencoded");
        // If-Modified-Since:  "Wed, 16 Sep 2009 16:18:14 GMT"
        option.ifmod && cache[url] &&
            xhr[setRequestHeader]("If-Modified-Since", cache[url]);

        for (i in header) {
            xhr[setRequestHeader](i, header[i]);
        }
//{@mb
        _gecko && uueventattach(win, "beforeunload", ng); // [Gecko]
//}@mb
        option.before && option.before({ option: option }, xhr);

        xhr.send(data);
        watchdogTimer = setTimeout(watchdog, (option.timeout || 10) * 1000);
    } catch (err) {
        ng(); // 400: Bad Request
    }
}
uuajax.cache = {}; // { "http://...": [DateHash(lastModified), rv], ... }

// uu.ajax.post - post
function uuajaxpost(url,        // @param String: url
                    option,     // @param Hash: { xml, data, ifmod, timeout,
                                //                header, binary, before, after }
                    callback) { // @param CallbackFunction(= void): callback(responce)
                                //    response - Hash: { ok, rv, date, cached, option, status }. see uu.ajax

    //  [1][post] uu.ajax.post("http://example.com/api?id=a", { data: uu.form.serialize(uu.id("#form")) }, callback)

    option = option || {};
    option.method = "POST";
    uuajax(url, option, callback);
}

// uu.ajax.clear - clear "If-Modified-Since" request cache
function uuajaxclear(url) { // @param String(= ""): "" is clear all cache

    //  [1][clear all]   uu.ajax.clear()
    //  [2][clear a url] uu.ajax.clear("http://example.com/api")

    url ? (delete uuajax.cache[url])
        : (uuajax.cache = {}); // clear all
}

// uu.ajax.binary - upload / download binary data
function uuajaxbinary(url,        // @param String:
                      option,     // @param Hash: { data, timeout, header, before, after, msgpack }
                                  //    option.msgpack - Boolean(= false): true is msgpack handling
                      callback) { // @param CallbackFunction(= void): callback(responce)
                                  //    response - Hash: { ok, rv, date, cached, option, status }. see uu.ajax

    //  [1][get  binary]      uu.ajax.binary("http://example.com/api", {}, callback)
    //  [2][post binary]      uu.ajax.binary("http://example.com/api", { data: byteArray }, callback)
    //  [3][get  MessagePack] uu.ajax.binary("http://example.com/api", { msgpack: true }, callback)
    //  [4][post MessagePack] uu.ajax.binary("http://example.com/api", { msgpack: true, data: JavaScriptMixObject }, callback)

    option.ifmode = _false;
    option.method = option.data ? "PUT" : "GET";
    option.binary = _true;
//{@msgpack
    if (option.msgpack) {
        if (option.data) { // upload
            option.data = uubase64(uumsgpack(option.data)); // upload(b64(msgpack()))
        } else {
            uuajax(url, option, function(resp) {
                if (resp.ok) {
                    resp.rv = uumsgpackdecode(resp.rv); // msgpack.decode(download())
                }
                callback && callback(resp);
            });
            return;
        }
    }
//}@msgpack
    uuajax(url, option, callback);
}

// inner - BinaryString To ByteArray
function binaryString2ByteArray(data) { // @param BinaryString: "\00\01":
                                        // @return ByteArray: [0x00, 0x01]
    var rv = [], bb2num = _bb2num, remain,
        ary = data.split(""), // "\00\01"
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

//{@mb
// inner - XHR to ByteArray
function xhr2ByteArrayIE(xhr) { // @param XMLHttpRequest:
                                // @return ByteArray: [0x00, 0x01]
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
//}@mb
//}@ajax

// inner - create XMLHttpRequest object
function newXHR() { // @return XMLHttpRequest:
//{@mb
    if (_ie) {
        if (win.ActiveXObject) {
            try {
                // http:// or https:// -> "Msxml2.XMLHTTP"
                // file://             -> "Microsoft.XMLHTTP"
                return new win.ActiveXObject("Microsoft.XMLHTTP");
            } catch(err) {}
        }
    }
//}@mb
    return new win.XMLHttpRequest;
}

// uujs - Async load JavasScript
function uujs(url,        // @param String:
              option,     // @param Hash(= {}): { async, defer, type, charset }
                          //   option.async - Boolean(= false): async load. After loading the script to run.
                          //                                    The script is executed before window.onload,
                          //                                    execution order is not guaranteed.
                          //   option.defer - Boolean(= false): async load. After loading the script to run,
                          //                                    The script is executed before DOMContentLoaded,
                          //                                    execution order is guaranteed.
                          //   option.type - String(= "text/javascript"):
                          //   option.charset - String(= "utf-8"):
              callback) { // @param CallbackFunction(= void): callback(response)
                          //     response.ok     - Boolean:
                          //     response.rv     - Node: <script>
                          //     response.node   - Node: <script>
                          //     response.option - Hash(= option): option argument
                          //     response.status - Number:

    //  [1][async load] uu.js("http://.../hoge.js", { async: true, defer: true })
    //  [2][defer load] uu.js("http://.../hoge.js", { defer: true })
    //  [3][lazy load]  uu.js("http://.../hoge.js")
    //  [4][callback]   uu.js("http://.../hoge.js", {}, callback)

    function handleOnLoad(event) {
        var evt = event || win.event;

        if (evt.type === "load" ||
            (evt.type === "readystatechange" &&
             node.readyState === "loaded")) {
            if (!node.run++) {
                node.onload = node.onreadystatechange = null; // [IE] avoid mem leak
                // [!][IE] lazy
                setTimeout(function() {
                    callback && callback({
                        ok: true,
                        rv: node,
                        node: node,
                        option: option,
                        status: 200
                    });
                }, 0);
            }
        }
    }

    var node = uumix(newNode("script"),
                     uuarg(option, { type: "text/javascript",
                                     charset: "utf-8", run: 0 }));

    doc.head[_appendChild](node);
    node.onload = node.onreadystatechange = handleOnLoad;
    node.src = url;
}

// uu.stat - Sync file stat
function uustat(url) { // @param String: url
                       // @return Boolean: true is file exists
    return uurequire(url, { stat: _true }).ok;
}

// uu.require - Sync load
function uurequire(url,      // @param String: url
                   option) { // @param Hash(= {}): { xml, stat, before, after }
                             //     option.xml    - Boolean(= false): true is xml.responseXML, false is xml.responseText
                             //     option.stat   - Boolean(= false): check whether a file exists
                             //     option.before - CallbackFunction(= void): before({ option }, xhr)
                             //     option.after  - CallbackFunction(= void): after({ ok, rv, option, status }, xhr)
                             // @return Hash: response, { ok, rv, option, status }
                             //     response.ok     - Boolean(= false): true is status = 20x, false is status = 30x, 40x, 50x
                             //     response.rv     - String(= null): result value. xhr.responseText or xhr.responseXML
                             //     response.option - Hash(= option): option argument
                             //     response.status - Number(= 400): xhr.status
    option = option || {};

    var resp = { ok: _false, rv: null, option: option, status: 400 },
        xhr = newXHR(), status;

    try {
        xhr.open("GET", url, _false); // open(,,false) is sync request
        option.before && option.before(resp, xhr);
        xhr.send(null);

        resp.status = status = xhr.status;
        resp.ok = !status || (status >= 200 && status < 300);
        if (!option.stat) {
            resp.rv = option.xml ? xhr.responseXML
                                 : xhr.responseText;
        }

        option.after && option.after(resp, xhr);

        xhr = null;
    } catch (err) {}
    return resp;
}

//{@ajax
// uu.jsonp - Async JSONP request
function uujsonp(url,        // @param String: "http://example.com/api?callback=@"
                 option,     // @param Hash: { timeout, method }
                             //    option.timeout - Number(= 10): timeout sec
                             //    option.method  - String(= "callback"): callback method name
                             //    option.before  - CallbackFunction(= void): before({ option }, <script>)
                             //    option.after   - CallbackFunction(= void): after({ option, ok, rv, status }, <script>)
                 callback) { // @param CallbackFunction(= void): callback(response)
                             //    response        - Hash: { ok, rv, option, status }
                             //    response.ok     - Boolean(= false): true is status = 20x, false is status = 30x, 40x, 50x
                             //    response.rv     - Mix(= null): result value
                             //    response.option - Hash(= option): option argument
                             //    response.status - Number(= 408): 200 or 408
    var timeout = option.timeout || 10,
        globalfn = option.method || "callback", // global CallbackFunction
        guid = uunumber(),
        node = uumix(newNode("script"),
                     uuarg(option, { type: "text/javascript",
                                     charset: "utf-8", run: 0 }));

    url = uustringformat(url, globalfn); // uustringformat("http://example.com/api?callback=@", option.method)
    uujsonp.db[guid] = globalfn;

    // build CallbackFunction
    win[globalfn] = function(rv) { // @param Mix(= void): json data
        if (!node.run++) {
            var resp = {
                ok: !!rv,
                rv: rv || null,
                option: option,
                status: rv ? 200 : 408
            };

            option.after && option.after(resp, node); // after callback
            callback && callback(resp); // finished

            setTimeout(function() {
                uunoderemove(node);
                win[globalfn] = null;
                delete uujsonp.db[guid];
            }, (timeout + 10) * 1000);
        }
    };

    function watchdog(globalfn) { // @var
        isFunction(globalfn = uujsonp.db[guid]) && globalfn(); // 408 "Request Time-out"
    }

    uunodeadd(node, doc.head);

    option.before && option.before({ option: option }, node); // before callback

    node.src = url;

    setTimeout(watchdog, timeout * 1000); // watchdog timer
}
uujsonp.db = {}; // { guid: callbackMethod, ... }
//}@ajax

// --- TYPE ---

// uu.like - like and deep matching
function uulike(lval,   // @param Date/Hash/Fake/Array: left value
                rval) { // @param Date/Hash/Fake/Array: right value
                        // @return Boolean:
    //  [1][literal like literal]     uu.like("abcdef", "abcdef")             -> true
    //  [2][Date like Date]           uu.like(new Date(123), new Date(123))   -> true
    //  [3][Hash like Hash]           uu.like({ a: { b: 1 }}, { a: { b: 1 }}) -> true
    //  [4][Array like Array]         uu.like([1, [2, 3]], [1, [2, 3]])       -> true
    //  [5][FakeArray like FakeArray] uu.like(document.links, document.links) -> true

    var type = uutype(lval);

    if (type !== uutype(rval)) {
        return _false;
    }
    switch (type) {
    case uutype.FUNCTION:   return _false;
    case uutype.DATE:       return uudate(lval).ISO() === uudate(rval).ISO();
    case uutype.HASH:       return (uusize(lval) === uusize(rval) && uuhas(lval, rval));
    case uutype.FAKEARRAY:  // http://d.hatena.ne.jp/uupaa/20091223
    case uutype.ARRAY:      return uuarray(lval) + "" == uuarray(rval);
    }
    return lval === rval;
}

// uu.type - type detection
function uutype(mix) { // @param Mix: search literal/object
                       // @return Number: uu.types
    //  [1][typeof] uu.type("str")          -> uu.type.STRING
    //  [2][typeof] uu.type(Node)           -> uu.type.NODE
    //  [3][typeof] uu.type(document.links) -> uu.type.FAKEARRAY

    if (mix == null) {
        return mix === null ? uutype.NULL : uutype.UNDEFINED;
    }
    if (mix === win) {
        return uutype.HASH;
    }
    if (mix[_nodeType] && mix[_appendChild]) {
        return uutype.NODE;
    }
    if (mix.constructor === win.NodeList) { // [fix][Safari5]
        return uutype.FAKEARRAY;
    }
    return _types[typeof mix] ||
           _types[toString.call(mix)] ||
           ((mix.callee || mix.item) ? uutype.FAKEARRAY : uutype.HASH);
}

// uu.complex - complex type detection
function uucomplex(key,     // @param String/Hash(= void):
                   value) { // @param String/Number(= void): 1 ~ 4
    //  [1][get items]  uu.complex() -> 1
    //  [2][get item]   uu.complex(key) -> 2
    //  [3][set item]   uu.complex(key, value) -> 3
    //  [4][set items]  uu.complex({ key: value, ... }) -> 4

    return key === void 0 ? 1
                          : value !== void 0 ? 3
                                             : typeof key === _string ? 2 : 4;
}

// uu.isURL - is URL
function isURL(search) { // @param Mix: search
                         // @return Boolean:
    if (isString(search) && _protocol.test(search)) {
        return search.slice(0, 4) === "file" ? _parse.file.test(search)
                                             : _parse.http.test(search);
    }
    return _false;
}

// uu.isNode - is DOM Node
function isNode(search) { // @param Mix: search
                          // @return Boolean:
    return !!(search && search.nodeType);
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
    return toString.call(search) === "[object Function]";
}

// --- hash / array ---

// uu.arg - supply default arguments
function uuarg(arg1,   // @param Hash/Function(= {}): arg1
               arg2,   // @param Hash(= void): arg2
               arg3) { // @param Hash(= void): arg3
                       // @return Hash/Function: new Hash(mixed args) or arg1 + args
    //  [1][supply args]   uu.arg({ a: 1 }, { b: 2 })          -> { a: 1, b: 2 }
    //  [2][LookDown args] uu.arg(function hoge(){}, { b: 2 }) -> hoge.b = 2

    return isFunction(arg1) ? uumix(arg1, arg2 || {}, arg3)
                            : uumix(uumix({}, arg1 || {}), arg2 || {}, arg3, 0);
}

// uu.mix - mixin
function uumix(base,       // @param Hash/Function: mixin base
               flavor,     // @param Hash: add flavor
               aroma,      // @param Hash(= void): add aroma
               override) { // @param Number/Boolean(= true): truly is override
                           // @return Hash/Function: base
    //  [1][override value] uu.mix({a:9, b:9}, {a:1}, {b:2})    -> { a: 1, b: 2 }
    //  [2][stable value]   uu.mix({a:9, b:9}, {a:1}, {b:2}, 0) -> { a: 9, b: 9 }

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

// uu.map - prototype pollution safety Array#map
function uumap(source,      // @param Hash/Array: source
               evaluator) { // @param Function: evaluator

    //  [1][Array#map] uu.map([1, 2],         function(v, i) {...}) -> Array
    //  [2][Hash#map]  uu.map({ a: 1, b: 2 }, function(v, i) {...}) -> Array

    if (isArray(source)) {
        // [uupaa.js + Prototype.js][PROTOTYPE POLLUTION][SAFE]
        return ArrayMap.call(source, evaluator);
    }

    var rv = [], ri = -1, i = 0;

    for (i in source) {
        rv[++ri] = evaluator(source[i], i); // evaluator(value, index)
    }
    return rv;
}

// uu.each - prototype pollution safety Array#forEach
function uueach(source,      // @param Hash/Array/Number: source or loop count
                evaluator) { // @param Function: evaluator

    //  [1][Array.forEach]  uu.each([1, 2],         function(v, i) {...})
    //  [2][Hash.forEach ]  uu.each({ a: 1, b: 2 }, function(v, i) {...})
    //  [3][Number.forEach] uu.each(3,              function(v, i) {...})

    var i = 0;

    if (typeof source === _number) {
        for (; i < source; ++i) {
            evaluator(i, i); // evaluator(index, index)
        }
    } else if (isArray(source)) {
        // [uupaa.js + Prototype.js][PROTOTYPE POLLUTION][SAFE]
        ArrayForEach.call(source, evaluator);
    } else {
        for (i in source) {
            evaluator(source[i], i); // evaluator(value, index)
        }
    }
}

// uu.keys - enum keys
function uukeys(source,           // @param Hash/Array: source
                __enumValues__) { // @hidden Number(= 0): 1 is enum values
                                  // @return Array: [key, ... ]
    //  [1][Hash.keys]   uu.keys({ a: 1, b: 2 }) -> ["a", "b"]
    //  [2][Array.keys]  uu.keys([1, 2]) -> [0, 1]

    var rv = [], ri = -1, i, iz, keys = Object.keys;

    if (isArray(source)) {
        for (i = 0, iz = source.length; i < iz; ++i) {
            i in source && (rv[++ri] = __enumValues__ ? source[i] : i);
        }
    } else {
        if (!__enumValues__ && keys) {
            return keys(source);
        }
        for (i in source) {
            source[_hasOwnProperty](i) &&
                (rv[++ri] = __enumValues__ ? source[i] : i);
        }
    }
    return rv;
}

// uu.drip - filter
function uudrip(source,      // @param Hash/Array: source
                evaluator) { // @param Function: evaluator(value):Boolean
                             // @return Hash: { rv, rest }
                             //  rv   - Array: result values. matchedArray
                             //  rest - Array: rest values. unmatchedArray

    //  [1][Function only] uu.drip([uu.nop, 1, "a"], uu.isFunction) -> { rv: [uu.nop], rest: [1, "a"]      }
    //  [2][Number only]   uu.drip([uu.nop, 1, "a"], uu.isNumber)   -> { rv: [1],      rest: [uu.nop, "a"] }
    //  [3][String only]   uu.drip([uu.nop, 1, "a"], uu.isString)   -> { rv: ["a"],    rest: [uu.nop, 1]   }
    //  [4][Array only]    uu.drip([[1, 2], 1, "a"], Array.isArray) -> { rv: [[1, 2]], rest: [1, "a"]      }

    var rv = [], rest = [], v, i, iz;

    if (isArray(source)) {
        for (i = 0, iz = source.length; i < iz; ++i) {
            v = source[i];
            evaluator(v) ? rv.push(v) : rest.push(v);
        }
    } else {
        for (i in source) {
            v = source[i];
            evaluator(v) ? rv.push(v) : rest.push(v);
        }
    }
    return { rv: rv, rest: rest };
}

// uu.values - enum values
function uuvalues(source) { // @param Hash/Array: source
                            // @return Array: [value, ... ]
    // [1][Hash.values]   uu.keys({ a: 1, b: 2 }) -> [1, 2]
    // [2][Array.values]  uu.keys([1, 2]) -> [1, 2]

    return uukeys(source, 1);
}

// uu.hash - String to Hash
function uuhash(source,     // @param JointString: "a,1,b,2"
                splitter) { // @param String/RegExp(= /[,;:]/): splitter
                            // @return Hash: { a: "1", b: "2" }

    //  [1][String to Hash] uu.hash("a,1,b,2") -> { a: "1", b: "2" }
    //  [2][String to Hash] uu.hash("a:1,b:2") -> { a: "1", b: "2" }
    //  [3][String to Hash] uu.hash("a:1;b:2") -> { a: "1", b: "2" }

    var rv = {}, ary = source.split(splitter || uuhash._), i = 0, iz = ary.length;

    for (; i < iz; i += 2) {
        rv[ary[i]] = ary[i + 1];
    }
    return rv;
}
uuhash._ = /[,;:]/; // default splitter

// uu.array - Mix to Array + slice
function uuarray(source,     // @param Array/Mix/NodeList/Arguments: source
                 sliceStart, // @param Number(= void): Array.slice(start, end)
                 sliceEnd) { // @param Number(= void): Array.slice(start, end)
                             // @return Array+Hash: [element, ...] + { first, last }
                             //     first - Mix: first element
                             //     last  - Mix: last elemen
    //  [1][through Array]      uu.array([1, 2])    -> [1, 2]      + { first, last }
    //  [2][mix to Array]       uu.array(mix)       -> [mix]       + { first, last }
    //  [3][NodeList to Array]  uu.array(NodeList)  -> [node, ...] + { first, last }
    //  [4][arguments to Array] uu.array(arguments) -> [arg, ...]  + { first, last }
    //  [5][to Array + slice]   uu.array(uu.tag("", document), 1, 3) -> [<head>, <meta>] + { first, last }

    var type = uutype(source),
        rv = (type === uutype.FAKEARRAY) ? fakeToArray(source) // [3][4]
           : (type === uutype.ARRAY)     ? source : [source];  // [1][2]

    if (sliceStart) {
        rv = sliceEnd ? rv.slice(sliceStart, sliceEnd)
                      : rv.slice(sliceStart);
    }
    rv.first = rv[0];
    rv.last  = rv[rv.length - 1];
    return rv;
}

// uu.has - A has B
function uuhas(source,   // @param Hash/Array/Node/String: haystack, context, parentNode
               search) { // @param Hash/Array/Node/String/ExEventType: needle, search element, childNode
                         // @return Boolean:
    //  [1][Array has Array]      uuhas([1, 2], [1]) -> true
    //  [2][Hash has Hash]        uuhas({ a: 1, b: 2 }, { a: 1 }) -> true
    //  [3][Node has ExEventType] uuhas(node, "namespace.click") -> true
    //  [4][Node has Node]        uuhas(parentNode, childNode) -> true
    //  [5][Array has Mix]        uuhas([1, 2], 1) -> true
    //  [6][Array has Mix]        uuhas([1, "a"], "a") -> true
    //  [7][String has String]    uuhas("A B C", " ") -> true

    if (source && search) {
        var i = 0, iz;

        if (source[_nodeType]) { // isNode
            if (isString(search)) { // [3] Node has ExEventType
                i = source[_datauu + "event"];
                return (i ? i.t : "")[_indexOf]("," + search + ",") >= 0;
            }
            for (i = search; i && i !== source; i = i[_parentNode]) { // [4] Node has Node
            }
            return search !== source && i === source;
        }

        if (isArray(source)) { // [1] Array has Array
                               // [5][6] Array has Mix
            search = uuarray(search);

            for (iz = search.length; i < iz; ++i) {
                if (i in search && source[_indexOf](search[i]) < 0) {
                    return _false;
                }
            }
        } else if (typeof source === _string) { // [7] String has String fragment
            if (source[_indexOf](search) < 0) {
                return _false;
            }
        } else { // [2] Hash has Hash
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

// uu.nth - get nth pair
function uunth(source,  // @param Hash/Array/String: source, Array is DenceArray
               index) { // @param Number(= 0): 0 is first, -1 is last pair
                        // @return Array: [key, value]
                        //                or [undefined, undefined] (not found)
    //  [1][Hash nth ]   uunth({ a: 1, b: 2 }, 1)    -> ["b", 2]
    //  [2][Array nth]   uunth(["a", 100, true], 1)  -> [1, 100]
    //  [3][Array first] uunth(["a", 100, true])     -> [0, "a"]
    //  [4][Array last]  uunth(["a", 100, true], -1) -> [2, true]
    //  [5][String head] uunth("abc", 0)             -> [0, "a"]
    //  [6][String tail] uunth("abc", -1)            -> [2, "c"]

    index = index || 0;
    var ary, key, i = 0;

    if (typeof source === _string) { // [5][6]
        i = index < 0 ? index + source.length : index;
        return [i, source.charAt(i)];
    } else if (isArray(source)) { // [2][3][4]
        i = index < 0 ? index + source.length : index;
        return [i, source[i]];
    }
    if (index > 0) {
        for (key in source) {
            if (i++ === index) {
                return [key, source[key]];
            }
        }
        return [void 0, void 0];
    }
    ary = uukeys(source);
    key = ary[index < 0 ? index + ary.length : index];
    return [key, source[key]];
}

// uu.pair - make pair
function uupair(key,     // @param Number/String/Hash: key
                value) { // @param Mix: value
                         // @return Hash: { key: value }
    //  [1][make pair]     uu.pair(1, 2)        -> { 1: 2 }
    //  [2][through hash]  uu.pair({ 1: 2 }, 3) -> { 1: 2 }

    if (typeof key !== "object") {
        var rv = {};

        rv[key] = value;
        return rv;
    }
    return key; // Hash or Hash Like Object
}

// uu.size - get length
function uusize(source) { // @param Hash/Array: source
                          // @return Number:
    // [1][Hash.length]   uusize({ a: 1, b: 2 }) -> 2
    // [2][Array.length]  uusize([1,2]) -> [1,2]

    return (isArray(source) ? source : uukeys(source)).length;
}

// uu.some - prototype pollution safety Array#some
function uusome(source,      // @param Hash/Array: source
                evaluator) { // @param CallbackFunction: evaluator
                             // @retrn Boolean:
    //  [1][Array#some] uu.some([1, 2],         function(v, i) {...}) -> Boolean
    //  [2][Hash#some]  uu.some({ a: 1, b: 2 }, function(v, i) {...}) -> Boolean

    if (isArray(source)) { // [1]
        return ArraySome.call(source, evaluator);
    }
    for (var i in source) { // [2]
        if (evaluator(source[i], i)) {
            return _true;
        }
    }
    return _false;
}

// uu.calls - call functions
function uucalls(source, // @param Hash/Array: has function
                 args,   // @param Arguments/MixArray(= void): [arg, ...]
                 that) { // @param this(= void):
                         // @return Array: [result, ...]

    //  [1][call function] uu.calls([uu.nop, "dummy", uu.nop]) -> [undefined, undefined]
    //  [2][call function] uu.calls({ a: uu.nop, b: "dummy", c: uu.nop }) -> [undefined, undefined]

    var rv = [], slow = args || that, fn,
        ary = uudrip(source, isFunction).rv, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        fn = ary[i];
        slow ? rv.push(fn.apply(that || null, args || []))
             : rv.push(fn());
    }
    return rv;
}

// uu.clone - clone hash, clone array - shallow copy
function uuclone(source) { // @param Hash/Array: source
                           // @return Hash/Array: cloned hash/array
    // [1][Hash.clone]   uuclone({ a: 1, b: 2 }) -> { a: 1, b: 2 }
    // [2][Array.clone]  uuclone([1,2]) -> [1,2]

    return isArray(source) ? source[_concat]() : uumix({}, source);
}

// uu.indexOf - find first key from value
function uuindexof(source,        // @param Hash/Array: source
                   searchValue) { // @param Mix: search value
                                  // @return Number/String/void: "found-key" or undefined
    // [1][Hash.indexOf]   uu.indexOf({ a: 1, b: 2, c: 2 }, 2) -> "b"
    // [2][Array.indexOf]  uu.indexOf(["A", "Z", "a"], "Z") -> 1

    if (isArray(source)) {
        return source[_indexOf](searchValue);
    }
    for (var key in source) {
        if (source[key] === searchValue && source[_hasOwnProperty](key)) {
            return key; // String
        }
    }
//{@mb
    return _undef;
//}@mb
}

// uu.array.sort - sort array
function uuarraysort(source,   // @param Array: source
                     method) { // @param String/CallbackFunction(= "A-Z"): method
                               //                   sort method or callback-function
                               // @return Array: source
    //  [1][ascii sort a-z]    uu.array.sort(["a","z"], "A-Z") -> ["a", "z"]
    //  [2][ascii sort a-z]    uu.array.sort(["a","z"], "Z-A") -> ["z", "a"]
    //  [3][numeric sort 0-9]  uu.array.sort([0,1,2], "0-9")   -> [0, 1, 2]
    //  [4][numeric sort 9-0]  uu.array.sort([0,1,2], "9-0")   -> [2, 1, 0]

    // 0x1: numeric sort, 0x2: reverse
    var r = { "A-Z": 0, "Z-A": 2, "0-9": 1, "9-0": 3 }[method] || 0;

    (r & 1) ? source.sort(function(a, b) {
                            return a - b;
                          })
            : source.sort();
    return (r & 2) ? source.reverse() : source;
}

// uu.array.clean - array compaction, trim null and undefined elements
function uuarrayclean(source) { // @param Array: source
                                // @return Array: clean Array
    //  [1][Array.clean]         uuarrayclean([,,1,2,,]) -> [1,2]

    var rv = [], i = 0, iz = source.length;

    for (; i < iz; ++i) {
        i in source && source[i] != null // skip null or undefined
                    && rv.push(source[i]);
    }
    return rv;
}

// uu.array.toHash - make { key: value } pair from array
function uuarraytohash(key,        // @param Array: key array
                       value,      // @param Array/Mix: value array or a mix value
                       toNumber) { // @param Boolean(= false): true is numeric value
                                   //                          false is original value
                                   // @return Hash: { key: value, ... }
    //  [1][Array x 2 = Hash]    uu.array.toHash(["a", "b"], [1, 2]) -> { a: 1, b: 2 }
    //  [2][Array + Mix = Hash]  uu.array.toHash(["a", "b"], 1)      -> { a: 1, b: 1 }

    var rv = {}, i = 0, iz = key.length, val, num = !!toNumber;

    if (isArray(value)) { // [1]
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

// uu.array.unique - make array from unique element(trim null and undefined elements)
function uuarrayunique(source,        // @param Array: source
                       literalOnly) { // @param Boolean(= false): true is literal only(quickly)
                                      // @return Array:
    //  [1][unique elements]  uu.array.unique([<body>, <body>]) -> [<body>]
    //  [2][unique literals]  uu.array.unique([0,1,2,1,0], true) -> [0,1,2]

    var rv = [], ri = -1, v, i = 0, j, iz = source.length,
        literal = !!literalOnly, found, unique = {};

    for (; i < iz; ++i) {
        v = source[i];
        if (v != null) { // v === null or v === undefined
            if (literal) { // [2]
                unique[v] || (unique[v] = 1, rv[++ri] = v);
            } else { // [1]
                for (found = 0, j = i - 1; !found && j >= 0; --j) {
                    found = (v === source[j]);
                }
                found || (rv[++ri] = v);
            }
        }
    }
    return rv;
}

// --- BYTE ARRAY ---
// uu.byteArray
function uubyteArray(source,     // @param String/ByteArray:
                     sliceStart, // @param Number(= void):
                     sliceEnd) { // @param Number(= void):
                                 // @return Array+Hash - Array + { first, last }
    //  [1][clone ByteArray]     uu.byteArray([1, 2]) -> [1, 2]
    //  [2][String to ByteArray] uu.byteArray("abc") -> [97, 98, 99]
    //  [3][slice]               uu.byteArray("abc", 1, 2) -> [98]

    var rv, i, iz;

    if (isString(source)) { // isString
        for (rv = [], i = 0, iz = source.length; i < iz; ++i) {
            rv[i] = source.charCodeAt(i) & 0xff;
        }
    } else { // isArray
        rv = source[_concat](); // clone
    }
    if (sliceStart) {
        rv = sliceEnd ? rv.slice(sliceStart, sliceEnd)
                      : rv.slice(sliceStart);
    }
    rv.first = rv[0];
    rv.last  = rv[rv.length - 1];
    return rv;
}

// uu.byteArray.dump - dump ByteArray
function uubyteArraydump(source,     // @param ByteArray: [0x00, ... 0xff]
                         prefix,     // @param String(= ""):
                         splitter) { // @param String(= ""):
                                     // @return String: "00010203"
    //  [1][ByteArray dump] uu.byteArray.dump([1, 2, 3]) -> "010203"
    //  [2][ByteArray dump] uu.byteArray.dump([1, 2, 3], "0x", ", 0x") -> "0x01, 0x02, 0x03"

    var rv = [], i = 0, iz = source.length, num2hh = _num2hh;

    for (; i < iz; ++i) {
        rv[i] = num2hh[source[i]];
    }
    return iz ? (prefix || "") + rv.join(splitter || "") : "";
}

// --- ATTRIBUTE ---

// uu.attr - attribute accessor
function uuattr(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param String(= void): "value"
                         // @return String/Hash/Node:
    //  [1][get items]  uu.attr(node) -> { key: "value", ... }
    //  [2][mix items]  uu.attr(node, { key: "value", ... }) -> node
    //  [3][get item]   uu.attr(node, key) -> "value"
    //  [4][set item]   uu.attr(node, key, "value") -> node

    var rv = {}, ary, i = 0, attr, fixdb = uuattrfix.db;

    // [IE6][IE7] for     -> htmlFor   class     -> className
    // [WEB STD]  htmlFor -> for       className -> class
    switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
//{@mb
            if (!uuready[_getAttribute]) { // [IE6][IE7][IE8]
                for (ary = node.attributes; attr = ary[i++]; ) {
                    if (attr.specified && attr.name[_indexOf](_datauu)) {
                        rv[attr.name] = attr.value;
                    }
                }
            } else {
//}@mb
                for (ary = node.attributes; attr = ary[i++]; ) {
                    rv[attr.name] = attr.value;
                }
//{@mb
            }
//}@mb
            return rv;
    case 2: // [IE6] tagindex, colspan is number
            attr = fixdb[key] || key;
//{@ie67
            if (_ie67) { // [IE6][IE7]
                switch (attr) {
                case "href":     return node[_getAttribute](attr, 2);
                case "checked":  return node.checked  ? "checked"  : "";
                case "disabled": return node.disabled ? "disabled" : "";
                }
            }
//}@ie67
            return (node[_getAttribute](attr) || "") + "";
    case 3: key = uupair(key, value);
    }
    for (i in key) {
        attr = fixdb[i] || i;
        switch (attr) {
        case "checked":
        case "disabled": node[attr] = !!key[i]; // node.disabled = true / false
            break;
        default:
            node[_setAttribute](attr, key[i]);
        }
    }
    return node;
}

// uu.attr.fix - fix attribute name
function uuattrfix(source) { // @param String:
                             // @return String:
    //  [1][html-attr to js-attr] uu.fix("for")   -> "htmlFor"
    //  [2][width]                uu.fix("width") -> "width"
    return uuattrfix.db[source] || source;
}
uuattrfix.db = {
    cn:             "class", // [DEPRECATED]
    klass:          "class",
    className:      "class",        // node.getAttribute("class")
    w:              "width",
    h:              "height",
    htmlFor:        "for"           // node.getAttribute("for")
};
//{@mb
//{@ie67
!uuready[_getAttribute] && uumix(uuattrfix.db, { // [IE6][IE7]
    cellspacing:    "cellSpacing",
    colspan:        "colSpan",
    "for":          "htmlFor",      // node.getAttribute("htmlFor")
    htmlFor:        "htmlFor",      // override
    frameborder:    "frameBorder",
    maxlength:      "maxLength",
    readonly:       "readOnly",
    rowspan:        "rowSpan",
    tabindex:       "tabIndex",
    usemap:         "useMap",
    cn:             "className",    // override [DEPRECATED]
    klass:          "className",    // override
    "class":        "className",    // override node.getAttribute("className")
    className:      "className"     // override
});
//}@ie67
//}@mb

// uu.data - node data accessor [HTML5 spec - Embedding custom non-visible data]
function uudata(node,    // @param Node:
                key,     // @param String/Hash(= void): key
                value) { // @param Mix(= void): value
                         // @return Hash/Mix/Node/undefined:
    //  [1][get items]  uu.data(node) -> { key: value, ... }
    //  [2][mix items]  uu.data(node, { key: value, ... }) -> node
    //  [3][get item]   uu.data(node, key) -> value
    //  [4][set item]   uu.data(node, key, value) -> node

    var rv = {}, i, prefix = "data-";

    switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1: for (key in node) {
                key[_indexOf](prefix) || (rv[key.slice(5)] = node[key]); // "data-*" -> "*"
            }
            return rv;
    case 2: return node[prefix + key]; // Mix or undefined
    case 3: if (key === "*") {
                for (key in uudata(node)) {
                    node[prefix + key] = value;
                }
            } else {
                node[prefix + key] = value;
            }
            break;
    case 4: for (i in key) {
                node[prefix + i] = key[i];
            }
    }
    return node;
}
uudata.handler = {}; // { "data-uu***": callback }

// uu.data.clear - clear/remove node data
function uudataclear(node,  // @param Node:
                     key) { // @param String(= void): key
                            // @return Node:
    //  [1][clear items]  uu.data.clear(node) -> node
    //  [2][clear item]   uu.data.clear(node, key) -> node

    return uudata(node, key || "*", null);
}

// uu.data.bind - bind data handler
//function uudatabind(key,        // @param String: "data-uu..."
//                    callback) { // @param CallbackFunction: callback function
//    uudata.handler[key] = callback;
//}

// uu.data.unbind - unbind data handler
//function undataunbind(key) { // @param String: "data-uu..."
//    delete uudata.handler[key];
//}

// --- CSS ---

// uu.css - css and StyleSheet accessor
function uucss(node,    // @param Node:
               key,     // @param String/Hash(= void): CSS Property Keyword or "px"
               value) { // @param String(= void): value
                        // @return Hash/String/Node:
    //  [1][get computed items]              uu.css(node) -> { key: value, ... }
    //  [2][mix items]                       uu.css(node, { key: value, ... }) -> node
    //  [3][get item]                        uu.css(node, key)  -> value
    //  [4][set item]                        uu.css(node, key, value) -> node
    //  [5][get computed(px unitized) items] uu.css(node, "px") -> { key: value, ... }

    var style = node.style, undef, opacity = "opacity", fixdb = uucssfix.db,
        fuzzy, // either "text-align" or "textAlign"
        right; // right "textAlign" style

    switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:                                         // uu.css(node)
    case 2: if (key === undef || key === "px") {    // uu.css(node, "px")
/*{@mb*/        if (getComputedStyle) { /*}@mb*/
                    return getComputedStyle(node, 0);
/*{@mb*/        }
                return key ? getComputedStyleIE(node) : node.currentStyle; /*}@mb*/
            }
            right = fixdb[key];
//{@mb
            if (getComputedStyle) {
//}@mb
                return getComputedStyle(node, 0)[right] || "";
//{@mb
            }
            if (right === opacity) { // [IE6][IE7][IE8]
                return style[opacity] || uucssopacity(node);
            }
            return (node.currentStyle || {})[right] || "";
//}@mb
    case 3: key = uupair(key, value);
    case 4: for (fuzzy in key) {
                value = key[fuzzy];
                right = fixdb[fuzzy];

                if (right === opacity) {
                    uucssopacity(node, +value);
                } else {
                    if (typeof value === _number) {
                        uucss.care[right] || (value += "px"); // number -> pixel value
                    }
                    // [IE6][IE7][IE8][IE9]
                    // http://twitter.com/uupaa/status/25788935187
                    style[right] = value + "";
                }
            }
    }
    return node;
}
uucss.care = { /*{@mb*/ zoom: 1, fontSizeAdjust: 1, /*}@mb*/ // [CSS3]
               lineHeight: 1, fontWeight: 1, zIndex: 1 };

// uu.css.fix - fix style name
function uucssfix(source) { // @param String:
                            // @return String:
    //  [1][css-prop to cssProp] uu.css.fix("background-color") -> "backgroundColor"
    //  [2][std-name to ie-name] uu.css.fix("float")            -> "cssFloat"(WEB STD) or "styleFloat"(IE)
    //  [3][through]             uu.css.fix("-webkit-shadow")   -> "-webkit-shadow"
    return uucssfix.db[source] || source;
}
uucssfix.db = {
    b:          "border",
    c:          "color",
    h:          "height",
    m:          "margin",
    o:          "opacity",
    p:          "padding",
    r:          "rotate",
    w:          "width",
    x:          "left",
    y:          "top",
    fs:         "fontSize",
    sx:         "scaleX",       // transform.scaleX
    sy:         "scaleY",       // transform.scaleY
    tx:         "translateX",   // transform.translateX
    ty:         "translateY",   // transform.translateY
    bgc:        "backgroundColor",
    bgcolor:    "backgroundColor",
    bgx:        "backgroundPositionX",
    bgy:        "backgroundPositionY",
    mbtx:       _mobile ? "translateX" : "left",
    mbty:       _mobile ? "translateY" : "top",
    rotate:     "rotate",
    scaleX:     "scaleX",
    scaleY:     "scaleY",
    translateX: "translateX",
    translateY: "translateY",
    translateZ: "translateZ"
};
uucssfix.more = {
    opacity:    "opacity",  // [IE6][IE7][IE8]
    "float":    _ie678 ? "styleFloat"
                       : "cssFloat",
    "cssFloat": _ie678 ? "styleFloat"
                       : "cssFloat"
};


// inner - prebuild camelized hash - http://handsout.jp/slide/1894
//          { width: "width", "text-align": "TextAlign", ... }
uuready("dom:2", function() {
    var fixdb = uucssfix.db,
/*{@mb*/DECAMELIZE = /([a-z])([A-Z])/g, /*}@mb*/
        props = _webkit ? getComputedStyle(htmlNode, 0) : htmlNode.style,
        k, v;

    for (k in props) {
        if (typeof props[k] === _string) {
//{@mb
            if (_webkit) {
//}@mb
                k = v = props.item(k); // k = "-webkit-...", "z-index"
                k[_indexOf]("-") >= 0 && (v = k[_replace](/-[a-z]/g, function(m) {
                    return m[1].toUpperCase();
                }));
                fixdb[k] = v; // { "z-index": "zIndex" }
                fixdb[v] = v; // {   zIndex : "zIndex" }
//{@mb
            } else {
                v = ((_gecko && !k[_indexOf]("Moz")) ? "-moz" + k.slice(3) :
                     (_ie    && !k[_indexOf]("ms"))  ? "-ms"  + k.slice(2) :
                     (_opera && !k[_indexOf]("O"))   ? "-o"   + k.slice(1) : k)
                    [_replace](DECAMELIZE, function(m, c, C) {
                        return c + "-" + C[_toLowerCase]();
                    });
                fixdb[v] = k; // { "z-index": "zIndex" }
                fixdb[k] = k; // {   zIndex : "zIndex" }
            }
//}@mb
        }
    }
    uumix(uucssfix.db, uucssfix.more);
});

// --- Style Sheet ---
function uuss(id) { // @param StyleSheetIDString(= ""):
                    // @return StyleSheetObject:
    id = id || "";
    return uuss.db[id] || (uuss.db[id] = uu("StyleSheet", id));
}
uuss.db = {}; // { id: styleSheetObject }

// --- Viewport ---
// uu.viewport
function uuviewport() { // @return Hash: { innerWidth, innerHeight,
                        //                 pageXOffset, pageYOffset,
                        //                 orientation, devicePixelRatio }
                        //      innerWidth  - Number:
                        //      innerHeight - Number:
                        //      pageXOffset - Number:
                        //      pageYOffset - Number:
                        //      orientation - Number: last orientation
                        //      devicePixelRatio - Number: 1 is not Retina display
                        //                                 2 is iPhone4 Retina dispiay
                        //            0 is Portrait
                        //          -90 is Landscape
                        //           90 is Landscape
                        //          180 is Portrait
//{@mb
    var undef,
        orientation = "orientation",
        devicePixelRatio = "devicePixelRatio";

    if (_ie678) { // [IE6][IE7][IE8] CSSOM View Module
        return { innerWidth:  htmlNode.clientWidth,  // [IE9] supported
                 innerHeight: htmlNode.clientHeight, // [IE9] supported
                 pageXOffset: htmlNode.scrollLeft,   // [IE9] supported
                 pageYOffset: htmlNode.scrollTop,    // [IE9] supported
                 orientation: 0,                     // [WebKit/iPhone/Android] only
                 devicePixelRatio: 1 };              // [WebKit/iPhone/Android] only
    }
    win[orientation] === undef && (win[orientation] = 0);
    win[devicePixelRatio] === undef && (win[devicePixelRatio] = 1);
//}@mb
    return win;
}

// --- TIMER ---
// uu.interval - interval timer
function uuinterval(callback, // @param CallbackFunction: callback
                    arg) {    // @param Mix(= void): arg
                              // @return Number: id
    var id = uunumber();

    // ary[i]     -> unique id
    // ary[i + 1] -> callback function
    // ary[i + 2] -> callback(arg)
    uuinterval.ary.push(id, callback, arg);

    if (uuinterval.base === null) {
        uuinterval.base = setInterval(tickIntervalTimer, _env.chrome ? 4 : 12);
    }
    return id;
}
uuinterval.ary = [];    // [<id, callback, arg>, ...]
uuinterval.base = null; // base interval timer id

// inner - tick interval timer
function tickIntervalTimer() {
    var ary = uuinterval.ary, i = 0, iz = ary.length;

    for (; i < iz; i += 3) {
        // ary[i]     -> unique id
        // ary[i + 1] -> callback function
        // ary[i + 2] -> callback(arg)
        // callback(unique, arg) === false is loopout
        if (ary[i + 1](ary[i], ary[i + 2]) === _false) {
            ary.splice(i, 3);
            i  -= 3;
            iz -= 3;
        }
    }
    ary.length || (clearInterval(uuinterval.base), uuinterval.base = null);
}

// --- EFFECT / ANIMATION ---

// uu.fx - add effect queue
//{@fx
function uufx(node,     // @param Node: animation target node
              duration, // @param Number: duration (unit ms)
              option) { // @param Hash/CallbackFunction: { key: endValue,
                        //                                 key: [endValue, easing],
                        //                                 key: callback, ...
                        //                               }
                        //     key      - CSSPropertyString/String: "color", "opacity", "before", "after", ...
                        //     endValue - String/Number: end value, "red", "+0.5", "+100px"
                        //     easing   - String: easing function name, "InOutQuad"
                        //     callback - CallbackFunction: before or after callback function
                        // @return Node:
    //  [1][abs]              uu.fx(node, 500, { o: 0.5, x: 200 })
    //  [2][rel]              uu.fx(node, 500, { h: "+100", o: "+0.5" })
    //  [3][with "px" unit]   uu.fx(node, 500, { h: "-100px" })
    //  [4][with easing fn]   uu.fx(node, 500, { h: [200, "InOutQuad"] })
    //  [5][after callback]   uu.fx(node, 500, { o: 1, after: afterCallback })
    //  [6][before callback]  uu.fx(node, 500, { o: 1, before: beforeCallback })
    //  [7][chain]            uu.fx(node, 500, { o: 1, chain: 1 })
    //  [8][reverse chain]    uu.fx(node, 500, { o: 1, reverse: 1 })
    //  [9][delay or sleep]   uu.fx(node, 500, callback)
    //  [10][deny]            uu.fx(node, 500, { deny: 1 })

    // --- INTERNAL DATA STRUCTURE ---
    //
    //  node["data-uufx"] = {
    //       q: [FxQueueDataHash, ...]  // forward queue
    //      rq: [FxQueueDataHash, ...]  // reverse queue
    //      id: 0                       // interval timer id
    //  }
    //
    //  FxQueueDataHash = { js, tm, dur, fin, guid, option }
    //      js     - String: JavaScript Expression
    //      tm     - Number: start time
    //      dur    - Number: duration
    //      fin    - Boolean: force finish flag
    //      guid   - Number:
    //      option - FxOptionHash:
    //
    //  FxOptionHash = { key: endValue, key: [endValue, esaing], key: callback, ... }
    //      key      - String: CSS Property or ReserveWord
    //      endValue - Number/String: 1, "+1", "-1", "1px", "*1.5", "/1.5"
    //      easing   - String: easing function name
    //      callback - Function: callback function
    //
    //  ReserveWord
    //      "init"      - CallbackFunctionArray: init callback. [callback, ...] (system)
    //      "after"     - CallbackFunctionArray: after callback. [callback, ...]
    //      "before"    - CallbackFunctionArray: before callback. [callback, ...]
    //      "reverse"   - Number/Boolean: truly is reverse
    //      "chain"     - Number/Boolean: truly is reverse-chain
    //      "deny"      - Number/Boolean:
    //      "stop"      - Number/Boolean: call uu.fx.stop(node)
    //      "kill"      - Number/Boolean: call uu.fx.kill(node)
    //      "back"      - Number/Boolean: backward (system)
    //      "cssCache"  - Hash: cached css (system)
    //      "junction"  - Instance: uu.Class.Junction

    option = option || {};
    isFunction(option.init)   && (option.init   = [option.init  ]);
    isFunction(option.after)  && (option.after  = [option.after ]);
    isFunction(option.before) && (option.before = [option.before]);

    // init fx queue
    var meta = _datauu + "fx", // node["data-uufx"]
        data = node[meta] || (node[meta] = {
            q:  [], // queue
            rq: [], // reverse queue
            id: 0   // interval timer id
//          js: ""  // eval(AnimationOptimizationCode)
        });

    if (data.q[0] && data.q[0].option.deny) {
        return node;
    }

    // call stop
    option.stop && uufxstop(node);
    // call kill
    option.kill && uufxkill(node);

    // add queue
    data.q.push({
        tm:       0,
        dur:      Math.max(duration, 1),
        fin:      _false,
        guid:     uunumber(), // unique id
        option:   option
    });
    // --- wakeup interval timer ---
    //  var uniqueid = uunumber();
    //
    //  setInterval(function() {
    //      uufxloop(uniqueid, node);
    //  }, 4 or 12)
    data.id || (data.id = uuinterval(uufxloop, node));
    return node;
}

// inner - animation loop
function uufxloop(id,     // @param Number: timer id
                  node) { // @param Node:
    function callback(mix, node, option, back) {
        var ary = isArray(mix) ? mix : [mix], i = 0, iz = ary.length;

        for (; i < iz; ++i) {
            ary[i](node, option, back);
        }
    }

    var data = node[_datauu + "fx"],
        q = data.q[0], // fetch current queue
        option, back, tm, finished, mix;

    if (!q) {
        // uu.fx.kill() after route
        data.id = data.ri = 0;
    } else {
        option = q.option;
        back = !!option.back;

        if (q.tm) { // already running?
            tm = +new Date; // running -> get current time
        } else {
            // initialize
            mix = option.init;
            mix && (callback(mix, node, option, back), option.init = 0); // clear
            mix = option.before;
            mix && callback(mix, node, option, back);
            q.js = isFunction(option) ? option
                                      : uufxbuild(node, data, q, option); // build JavaScript
            q.tm = tm = +new Date; // start time
        }
        finished = q.fin || (tm >= q.tm + q.dur);

        q.js(node, finished, tm - q.tm, q.dur); // js(node, finished, gain, duration)

        if (finished) {
            mix = option.after;
            mix && callback(mix, node, option, back);
            option.junction && option.junction.ok();
            data.q.shift(); // remove current queue

            if (!option.back && option.reverse && data.rq.length) {
                data.q = data.rq.reverse()[_concat](data.q); // inject reverse queue
                data.rq = []; // clear reverse qeueue
            }
            if (!data.q.length) {
                data.id = 0;
            }
        }
    }
    return !!data.id; // return false -> clearInterval
}

// uu.fx.easing - easing functions
uufx.easing = {
        linear: "(c*t/d+b)", // linear(t,b,c,d)
                             //     t:Number - current time
                             //     b:Number - beginning value
                             //     c:Number - change in value(delta)
                             //     d:Number - duration(unit: ms)
// Quad ---
        inquad: "(z1=t/d,c*z1*z1+b)",
       outquad: "(z1=t/d,-c*z1*(z1-2)+b)",
     inoutquad: "(z1=t/(d*0.5),z1<1?c*0.5*z1*z1+b:-c*0.5*((--z1)*(z1-2)-1)+b)",
// Cubic ---
       incubic: "(z1=t/d,c*z1*z1*z1+b)",
      outcubic: "(z1=t/d-1,c*(z1*z1*z1+1)+b)",
    inoutcubic: "(z1=t/(d*0.5),z1<1?c*0.5*z1*z1*z1+b:c*0.5*((z1-=2)*z1*z1+2)+b)",
    outincubic: "(z1=t*2,z2=c*0.5,t<d*0.5?(z3=z1/d-1,z2*(z3*z3*z3+1)+b)" +
                                        ":(z3=(z1-d)/d,z2*z3*z3*z3+b+z2))",
// Quart ---
       inquart: "(z1=t/d,c*z1*z1*z1*z1+b)",
      outquart: "(z1=t/d-1,-c*(z1*z1*z1*z1-1)+b)",
    inoutquart: "(z1=t/(d*0.5),z1<1?c*0.5*z1*z1*z1*z1+b" +
                                  ":-c*0.5*((z1-=2)*z1*z1*z1-2)+b)",
    outinquart: "(z1=t*2,z2=c*0.5,t<d*0.5?(z3=z1/d-1,-z2*(z3*z3*z3*z3-1)+b)" +
                                        ":(z4=z1-d,z3=z4/d,z2*z3*z3*z3*z3+b+z2))",
// Back ---
        inback: "(z1=t/d,z2=1.70158,c*z1*z1*((z2+1)*z1-z2)+b)",
       outback: "(z1=t/d-1,z2=1.70158,c*(z1*z1*((z2+1)*z1+z2)+1)+b)",
     inoutback: "(z1=t/(d*0.5),z2=1.525,z3=1.70158," +
                    "z1<1?(c*0.5*(z1*z1*(((z3*=z2)+1)*z1-z3))+b)" +
                        ":(c*0.5*((z1-=2)*z1*(((z3*=z2)+1)*z1+z3)+2)+b))",
     outinback: "(z1=t*2,z2=c*0.5," +
                    "t<d*0.5?(z3=z1/d-1,z4=1.70158,z2*(z3*z3*((z4+1)*z3+z4)+1)+b)" +
                           ":(z3=(z1-d)/d,z4=1.70158,z2*z3*z3*((z4+1)*z3-z4)+b+z2))",
// Bounce ---
      inbounce: "(z1=(d-t)/d,z2=7.5625,z3=2.75,c-(z1<(1/z3)?(c*(z2*z1*z1)+0)" +
                ":(z1<(2/z3))?(c*(z2*(z1-=(1.5/z3))*z1+.75)+0):z1<(2.5/z3)" +
                "?(c*(z2*(z1-=(2.25/z3))*z1+.9375)+0)" +
                ":(c*(z2*(z1-=(2.625/z3))*z1+.984375)+0))+b)",
     outbounce: "(z1=    t/d,z2=7.5625,z3=2.75,   z1<(1/z3)?(c*(z2*z1*z1)+b)" +
                ":(z1<(2/z3))?(c*(z2*(z1-=(1.5/z3))*z1+.75)+b):z1<(2.5/z3)" +
                "?(c*(z2*(z1-=(2.25/z3))*z1+.9375)+b)" +
                ":(c*(z2*(z1-=(2.625/z3))*z1+.984375)+b))"
};

// uu.fx.timing - timing functions
uufx.timing = {
    "default":      uufxtimingdefault,
    "ease-in":      uufxtimingeasein,
    "ease-out":     uufxtimingeaseout,
    "ease-in-out":  uufxtimingeaseinout,
    cubicBezier:    uufxtimingcubicbezier
};

// uu.fx.timing["default"]
function uufxtimingdefault(t, duration) {
    return uufxtimingcubicbezier(t, duration, 0.25, 0.1, 0.25, 0.1);
}

// uu.fx.timing["ease-in"]
function uufxtimingeasein(t, duration) {
    return uufxtimingcubicbezier(t, duration, 0.42, 0, 1, 1);
}

// uu.fx.timing["ease-out"]
function uufxtimingeaseout(t, duration) {
    return uufxtimingcubicbezier(t, duration, 0, 0, 0.58, 1);
}

// uu.fx.timing["ease-in-out"]
function uufxtimingeaseinout(t, duration) {
    return uufxtimingcubicbezier(t, duration, 0.42, 0, 0.58, 1);
}

// uu.fx.timing.cubicBezier
function uufxtimingcubicbezier(t,        // @param Number: current time
                               duration, // @param Number: unit ms
                               p1x,      // @param Number: 0.0 ~ 1.0
                               p1y,      // @param Number: 0.0 ~ 1.0
                               p2x,      // @param Number: 0.0 ~ 1.0
                               p2y) {    // @param Number: 0.0 ~ 1.0
                                         // @return Number: 0.0 ~ 1.0
    var cx = p1x * 3,
        cy = p1y * 3,
        bx = (p2x - p1x) * 3 - cx,
        by = (p2y - p1y) * 3 - cy,
        ax = 1 - cx - bx,
        ay = 1 - cy - by,
        xx, fin = 0,
        epsilon = 1 / (duration * 200),
        t0 = 0, t1 = 1, t2 = t, x2, d2, i = 0;

    for (; i < 8; ++i) {
        x2 = ((ax * t2 + bx) * t2 + cx) * t2 - t;
        if ((x2 >= 0 ? x2 : 0 - x2) < epsilon) {
            fin = 1;
            break;
        }
        d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
        if ((d2 >= 0 ? d2 : 0 - d2) < 0.000001) {
            break;
        }
        t2 = t2 - x2 / d2;
    }
    if (!fin) {
        if (t < 0 || t > 1) {
            return t < 0 ? 0 : 1;
        }
        for (t2 = t; t0 < t1; ) {
            x2 = ((ax * t2 + bx) * t2 + cx) * t2;
            xx = x2 - t;
            if ((xx >= 0 ? xx : -xx) < epsilon) {
                break;
            }
            t > x2 ? (t0 = t2) : (t1 = t2);
            t2 = (t1 - t0) * 0.5 + t0;
        }
    }
    return ((ay * t2 + by) * t2 + cy) * t2;
}

// inner - build animation
function uufxbuild(node, data, queue, option) {
    function ezfn(v0, v1, ez) {
        return "(b=" + v0 + ",c=" + (v1 - v0) + "," + uu.fx.easing[ez] + ")";
    }

    // fx1 = opacity, gain/dur, width, height
    // fx2 = node.filters, uu.hash.num2hh,
    // z1~z4 = for easing function
    // sx  = scroll x
    // sy  = scroll y
    var rv = 'var style=node.style,t=gain,b,c,d=dur,fx1,fx2,z1,z2,z3,z4,scx,scy;',
        reverseOption = {
            junction: option.junction,
            before:   option.before ? option.before[_concat]() : _undef,
            after:    option.after  ? option.after[_concat]()  : _undef,
            back:     1
        },
        reservedWordHash = {
            init:       1,
            after:      1,
            before:     1,
            reverse:    1,
            chain:      1,
            deny:       1,
            stop:       1,
            kill:       1,
            back:       1,
            cssCache:   1,
            junction:   1
        },
        key, w, opt,
        transform = uucsstransform2d(node),
        transformBuffer = {},
        transformChanged = 0,
        vp, // viewport
        ez, // easing function name. eg: "inoutquad"
        sv, // start value
        ev, // end value
        cs = option.cssCache || uucss(node, "px"), // current style (pixel based)
        fixdb = uucssfix.db;

    for (key in option) {
        w = fixdb[key] || key;
        if (!(w in reservedWordHash)) { // avoid ReservedWord

            opt = option[key];
            isArray(opt) ? (ev = opt[0], ez = opt[1][_toLowerCase]()) // { left: [100, "linear"] }
                         : (ev = opt,    ez = "inoutquad");           // { left: 100 }

            if (ev != null) {

                switch (w) {
                case "opacity":
                    sv = uucssopacity(node); // start value
//{@mb
                    // init opacity [IE6][IE7][IE8]
                    uuready.opacity || (uucssopacity(node, sv),
                                        node.style[_visibility] = "visible"); // [FIX]
//}@mb
                    ev = uunumberexpand(sv, ev);
                    rv += 'fx1=' + ezfn(sv, ev, ez)
                                 + ';fx1=fx1>0.999?1:fx1<0.001?0:fx1;';
//{@mb
                    if (_ie678) { // [IE6][IE7][IE8]
                        rv += uu.f('fin?uu.css.opacity(node,@)' +
                                      ':(style.filter="alpha(opacity="+@+") "+' +
                                        'style.filter.replace(@," "));',
                                   ev, "((fx1*100)|0)", "uu.css.opacity._");
                        break;
                    }
//}@mb
                    rv += 'style.opacity=fin?' + ev + ':fx1;';
                    break;
                case "color":
                case "backgroundColor":
//{@color
                    ev = uucolor(ev);
                    sv = w === "color" ? uucolor(cs[w])
                                       : uucssbgcolor(node);

                    if (sv.a !== ev.a && (w === "color" ? uuready.color.rgba
                                                        : uuready.background.rgba)) {
                        rv += ['fx1=gain/dur;style.', w, '="rgba("+',
                               '((fin?', ev.r, ':(', ev.r, '-', sv.r, ')*fx1+', sv.r, ')|0)', '+","+',
                               '((fin?', ev.g, ':(', ev.g, '-', sv.g, ')*fx1+', sv.g, ')|0)', '+","+',
                               '((fin?', ev.b, ':(', ev.b, '-', sv.b, ')*fx1+', sv.b, ')|0)', '+","+',
                               '((fin?', ev.a, ':(', ev.a, '-', sv.a, ')*fx1+', sv.a, '))',   '+")";'
                              ].join("");
                    } else {
                        rv += ['fx1=gain/dur;fx2=uu.hash.num2hh;style.', w, '="#"+',
                               '(fx2[(fin?', ev.r, ':(', ev.r, '-', sv.r, ')*fx1+', sv.r, ')|0]||0)+',
                               '(fx2[(fin?', ev.g, ':(', ev.g, '-', sv.g, ')*fx1+', sv.g, ')|0]||0)+',
                               '(fx2[(fin?', ev.b, ':(', ev.b, '-', sv.b, ')*fx1+', sv.b, ')|0]||0);'
                              ].join("");
                    }
//}@color
                    break;
                case "width":
                case "height":
                    sv = parseInt(cs[w]) || 0; // parseInt(computedStyle.width)
                    ev = uunumberexpand(sv, ev, parseInt);
                    rv += 'fx1=fin?' + ev + ':' + ezfn(sv, ev, ez) +
                          ';fx1=fx1<0?0:fx1;style.' + w + '=(fx1|0)+"px";';
                    break;
                case "pageXOffset":
                    vp = vp || uuviewport();
                    sv = vp[w];
                    ev = uunumberexpand(sv, ev, parseInt);
                    rv += 'scx=((fin?' + ev + ':' + ezfn(sv,ev,ez) + ')|0);' +
                          'scx!=null&&scy!=null&&(window.scrollTo(scx,scy),scx=scy=null);';
                    break;
                case "pageYOffset":
                    vp = vp || uuviewport();
                    sv = vp[w];
                    ev = uunumberexpand(sv, ev, parseInt);
                    rv += 'scy=((fin?' + ev + ':' + ezfn(sv, ev, ez) + ')|0);' +
                          'scy!=null&&scy!=null&&(window.scrollTo(scx,scy),scx=scy=null);';
                    break;
                case "left":
                    sv = node.offsetLeft - parseInt(cs.marginLeft);
                    ev = uunumberexpand(sv, ev, parseInt);
                    rv += 'style.left=((fin?' + ev + ':' + ezfn(sv, ev, ez) + ')|0)+"px";';
                    break;
                case "top":
                    sv = node.offsetTop  - parseInt(cs.marginTop)
                    ev = uunumberexpand(sv, ev, parseInt);
                    rv += 'style.top=((fin?' + ev + ':' + ezfn(sv, ev, ez) + ')|0)+"px";';
                    break;
                case "scaleX":
                case "scaleY":
                case "rotate":
                case "translateX":
                case "translateY":
                    sv = transform[w];
                    ev = uunumberexpand(sv, ev, parseFloat);
                    transformBuffer[w] = ('(fin?' + ev + ':' + ezfn(sv, ev, ez) + ')');
                    ++transformChanged;
                    break;
                default: // other...
                    sv = parseInt(cs[w]) || 0;
                    ev = uunumberexpand(sv, ev, parseInt);
                    // style.{{word}} = ((fin ? {{ev}} : ezfn({{sv}},{{ev}},{{ez}})) | 0) + "px";
                    //                    v
                    // style.top = ((fin ? 0 : easing-expression) | 0) + "px";
                    rv += 'style.'+w+'=((fin?'+ev+':'+ezfn(sv,ev,ez)+')|0)+"px";';
                }
                reverseOption[w] = [sv, ez];
            }
        }
    }

    if (transformChanged) {
        rv += uustringformat(
                    "uu.css.transform2d(node,{scaleX:@,scaleY:@,rotate:@,translateX:@,translateY:@});",
                    transformBuffer.scaleX     || transform.scaleX,
                    transformBuffer.scaleY     || transform.scaleY,
                    transformBuffer.rotate     || transform.rotate,
                    transformBuffer.translateX || transform.translateX,
                    transformBuffer.translateY || transform.translateY);
    }

    // add reverse queue
    if (option.chain || option.reverse) {
        data.rq.push({
            tm: 0,
            dur: queue.dur,
            fin: _false,
            guid: queue.guid, // copy guid
            option: reverseOption
        });
    }

    return new Function("node,fin,gain,dur", rv); // node, finished, gain, duration
}

// uu.fx.skip
function uufxskip(node,        // @param Node(= null): null is all node
                  skipAll,     // @param Boolean(= false): true is skip all queue
                               //                          false is skip top queue
                  invisible) { // @param Boolean(= false): true is avoid flicker
                               // @return NodeArray:
    var ary = node ? [node] : uutag(),
        i = 0, iz = ary.length,
        j, k, jz, kz, data, guid, option, q, rq;

    for (; i < iz; ++i) {
        data = ary[i][_datauu + "fx"];

        if (data && data.id) { // running
            q  = data.q;  // queue
            rq = data.rq; // reverse queue
            guid = [];

            // set finished flag
            for (j = 0, jz = skipAll ? q.length : 1; j < jz; ++j) {
                q[j].fin = _true;
                option = q[j].option;
                (option.chain || option.reverse) && guid.push(q[j].guid);
            }

            // reverse queue
            for (j = 0, jz = guid.length; j < jz; ++j) {
                for (k = 0, kz = rq.length; k < kz; ++k) {
                    if (rq[k].guid === guid[j]) {
                        rq[k].fin = _true;
                    }
                }
            }

            // avoid flicker
            if (invisible && q.length > 2) {
                q.push({
                    tm: 0, guid: 0, fin: 1, dur: 0,
                    option: function(node) {
                        node.style[_visibility] = "visible";
                    }});

                ary[i].style[_visibility] = "hidden";
            }
        }
    }
    return ary;
}

// uu.fx.stop
function uufxstop(node) { // @param Node:
                          // @return Node:
    if (uufxisbusy(node)) {
        var q = node[_datauu + "fx"].q[0];

        q.js = uunop; // clear function
        q.tm = 1;     // past time
    }
    return node;
}

// uu.fx.kill - kill animation, clear queue
function uufxkill(node) { // @param Node(= null): null is all node
                          // @return NodeArray:
    function removeQueue(queue, node, back) {
        var i, iz, q, ary;

        while (queue.length) {
            q = queue.shift();
            if (q && q.option) {
                ary = q.option.after;
                if (ary) {
                    ary = isArray(ary) ? ary : [ary];
                    for (i = 0, iz = ary.length; i < iz; ++i) {
                        ary[i](node, q.option, back);
                    }
                }
                q.option.junction && q.option.junction.ok();
            }
        }
    }

    var ary = node ? [node] : uutag(), i = 0, iz = ary.length, data,
        option = uuarg(option, { freeze: true, clear: true });

    for (; i < iz; ++i) {
        data = ary[i][_datauu + "fx"];

        if (data && data.id) { // running
            removeQueue(data.q,  node, _false); // queue
            removeQueue(data.rq, node, _true);  // reverse queue
        }
    }
    return ary;
}

// uu.fx.isBusy
function uufxisbusy(node) { // @param Node:
                            // @return Boolean:
    var data = node[_datauu + "fx"];

    return data && data.id;
}

// uu.fx.show - show node
function uufxshow(node,            // @param Node:
                  duration,        // @param Number(= 0): fadein effect duration
                  displayValue,    // @param String(= "block"): applied at display, "block", "table", "none"
                  __slideDown__) { // @hidden Boolean(= false): true is slideDown
                                   // @return Node:
    var cs = uucss(node), disp = displayValue || "block",
        w = cs[_width], h = cs[_height], o = uucssopacity(node) || 1;

//{@mb
    // [Opera] getComputedStyle(node).display === "none" -> width and height = "0px"
    if (cs[_display] === "none" && w === "0px" && w === h) { // [Opera] fix
        node.style[_display] = disp;
        cs = uucss(node);
        w = cs[_width];
        h = cs[_height];
        node.style[_display] = "none";
    }
//}@mb
    return uufx(node, duration || 0, { init: function(node, option) {
                var style = node.style;

                uucssopacity(node, 0);
                __slideDown__ || (style[_width] = "0");
                style[_height] = "0";
                style[_visibility] = "visible";
                if (uucss(node)[_display] === "none") {
                    style[_display] = disp;
                }
                __slideDown__ ? uumix(option, {       h: h, o: o })
                              : uumix(option, { w: w, h: h, o: o });
            }});
}

// uu.fx.hide - hide node
function uufxhide(node,       // @param Node:
                  duration) { // @param Number(= 0): fadeout effect duration
                              // @return Node:
    if (uufxishide(node)) {
        node.style[_display] = "none" // hidden -> force hide
    }
    return uufx(node, duration || 0, { w: 0, h: 0, o: 0 });
}

// uu.fx.isHide - is hidden
function uufxishide(node) { // @param Node:
                            // @return Boolean:
    var style = uucss(node);

    return style[_display] === "none" ||
           style[_visibility] === "hidden" ||
           uucssopacity(node) === 0;
}

// uu.fx.fade - toggle fadeout / fadein
function uufxfade(node,     // @param Node:
                  duration, // @param Number: duration
                  option) { // @param Hash(= {}):
                            // @return Node:
//{@mb
    if (!duration && _ie678) {
        return uucssopacity(node, uucssopacity(node) < 0.5 ? 1 : 0);
    }
//}@mb
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
            option.o = uucssopacity(node) < 0.5 ? 1 : 0;
        }}));
}

// uu.fx.fadeIn - fadein
function uufxfadein(node,     // @param Node:
                    duration, // @param Number: duration
                    option) { // @param Hash(= {}):
                              // @return Node:
//{@mb
    if (!duration && _ie678) {
        return uucssopacity(node, 1);
    }
//}@mb
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
            option.o = 1;
        }}));
}

// uu.fx.fadeOut - fadeout
function uufxfadeout(node,     // @param Node:
                     duration, // @param Number: duration
                     option) { // @param Hash(= {}):
                               // @return Node:
//{@mb
    if (!duration && _ie678) {
        return uucssopacity(node, 0);
    }
//}@mb
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
            option.o = 0;
        }}));
}

// uu.fx.puff - zoom out and fadeout
function uufxpuff(node,     // @param Node:
                  duration, // @param Number: duration
                  option) { // @param Hash(= {}):
                            // @return Node:
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
            var cs = uucss(node, "px");

            uumix(option, { w: "*1.5", h: "*1.5", o: 0,
                            mbtx: "-" + parseInt(cs[_width])  * 0.25,
                            mbty: "-" + parseInt(cs[_height]) * 0.25 },
                  _env.jit ? { fs: "*1.5" } : {});
        }}));
}

// uu.fx.flare - flare
function uufxflare(node,     // @param Node:
                   duration, // @param Number: duration
                   option) { // @param Hash(= { parts: 10, range: 200 }):
                             // @return Node:
    return uufx(node, duration, uuarg(option, {
        o:      0,
        parts:  10,
        range:  200,
        init:   function(node, option) {
            var cs = uucss(node, "px"), // get pixel unit
                x = parseInt(cs.left),
                y = parseInt(cs.top),
                cloneNode, i = 0, angle, tr,
                p = uumix({}, option, {
                    w: parseInt(cs[_width])  * 1.5,
                    h: parseInt(cs[_height]) * 1.5,
                    cssCache: cs, // css cache
                    after: option.after ? uuarray(option.after) : []
                }),
                parts = (360 / p.parts) | 0;

            _env.jit && (p.fs = parseInt(cs.fontSize) * 1.5);
            if (_mobile) {
                tr = uucsstransform2d(node);
                x = tr.translateX;
                y = tr.translateY;
            }
            for (; i < 360; i += parts) {
                cloneNode = node[_parentNode][_appendChild](uunodeclone(node, _true));
                angle = i * Math.PI / 180;

                uufx(cloneNode, duration, uumix({}, p, {
                    mbtx: Math.cos(angle) * p.range + x,
                    mbty: Math.sin(angle) * p.range + y,
                    init: function(cloneNode) {
                        uucssopacity(cloneNode, 0.5);
                    },
                    after: p.after[_concat](function(cloneNode, option, back) {
                        back || node[_parentNode][_removeChild](cloneNode);
                    })
                }));
            }
        }
    }));
}

// uu.fx.swing - swing elemenet / image
function uufxswing(node,     // @param Node:
                   duration, // @param Number: duration
                   option) { // @param Hash(= { range: 10 }):
                             //     option.range - Number: degree
                             // @return Node:
    var opt = uuarg(option, { range: 10 });
    if (opt.range) {
        uufx(node, duration, { rotate:  opt.range });     // swing left(large)
        uufx(node, duration, { rotate: -opt.range });     // turn right(large)
        uufx(node, duration, { rotate:  opt.range / 2 }); // swing left(small)
        uufx(node, duration, { rotate:  0 });             // stop center
    }
    return node;
}

// uu.fx.slide - toggle slideUp / slideDown
function uufxslide(node,     // @param Node:
                   duration, // @param Number: duration
                   option) { // @param Hash(= {}):
                             // @return Node:
    return uufxslidetoggle(node, duration, option);
}

// uu.fx.slideUp - slideUp
function uufxslideup(node,     // @param Node:
                     duration, // @param Number: duration
                     option) { // @param Hash(= {}):
                               // @return Node:
    return uufxslidetoggle(node, duration, option, 1);
}

// uu.fx.slideDown - slideDown
function uufxslidedown(node,     // @param Node:
                       duration, // @param Number: duration
                       option) { // @param Hash(= {}):
                                 // @return Node:
    return uufxslidetoggle(node, duration, option, 2);
}

// inner - uu.fx.slide toggle
function uufxslidetoggle(node,       // @param Node:
                         duration,   // @param Number: duration
                         option,     // @param Hash(= {}):
                         __mode__) { // @hidden Number(= 0): 0 = auto, 1 = slide up, 2 = slide down
                                     // @return Node:
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
            var cs = uucss(node, "px"),
                hash = uudata(node, "uufxsize") || 0, // get original dimensions
                w = parseInt(cs[_width]),
                h = parseInt(cs[_height]);

            if (!hash) {
                if (uufxishide(node)) { // <div style="display:none;height:100px">
                    return uufxshow(node, duration, "", 1); // show + slide down
                }
                if (!h) { // <div style="height:0">
                    return;
                }
                uudata(node, "uufxsize", hash = { w: w, h: h }); // keep original dimensions
            }
            uumix(option, {
                h: (!__mode__ ? (h ? 0 : hash.h)
                              : __mode__ < 2 ? 0 : hash.h),
                o: h ? 0 : 1
            });
        }}));
}

// uu.fx.shrink - shrink
function uufxshrink(node,     // @param Node:
                    duration, // @param Number: duration
                    option) { // @param Hash(= {}):
                              // @return Node:
//{@mb
//{@ie6
    _env.ie6 && (node.style.overflow = "hidden"); // [IE6]
//}@ie6
//}@mb
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
            var cs = uucss(node, "px");

            uumix(option, { w: 0, h: 0, o: 0,
                            mbtx: "-" + parseInt(cs[_width])  * 0.5,
                            mbty: "-" + parseInt(cs[_height]) * 0.5, fs: "*0.5" });
        }}));
}

// uu.fx.scroll - scroll
function uufxscroll(node,     // @param Node:
                    duration, // @param Number: duration
                    option) { // @param Hash(= { orientationLock: "" }):
                              //    orientationLock: String: "" or "x" or "y"
                              // @return Node:
    var rect = uu.css.rect(node, doc.body),
        vp = uuviewport(),
        iw = vp.innerWidth,
        ih = vp.innerHeight,
        sw = Math.max(htmlNode.scrollWidth,  doc.body.scrollWidth),
        sh = Math.max(htmlNode.scrollHeight, doc.body.scrollHeight),
        opt = uuarg(option, {
            pageXOffset: rect.x + iw > sw ? sw - iw + 40 : rect.x,
            pageYOffset: rect.y + ih > sh ? sh - ih + 40 : rect.y
        });

    if (opt.orientationLock === "x") {
        delete opt.pageXOffset;
    } else if (opt.orientationLock === "y") {
        delete opt.pageYOffset;
    }
    return uufx(node, duration, opt);
}

// uu.fx.moveIn - movein + fadein
function uufxmovein(node,     // @param Node:
                    duration, // @param Number: duration
                    option) { // @param Hash(= { degree: 0, range: 200 }):
                              // @return Node:
    return uufx(node, duration, uuarg(option, {
            degree: 0,
            o:      1,
            init:   function(node, option) {
                var cs = uucss(node, "px"), style = node.style, tr,
                    angle, endX, endY, fs, w, h, o, range = option.range || 200;

                angle = option.degree * Math.PI / 180;
                endX = parseInt(cs.left);
                endY = parseInt(cs.top);
                if (_env.jit) {
                    fs = parseInt(cs.fontSize);
                }
                w = parseInt(cs[_width]);
                h = parseInt(cs[_height]);
                o = uucssopacity(node);

                if (_mobile) {
                    tr = uucsstransform2d(node);
                    uucsstransform2d(node, {
                        translateX: Math.cos(angle) * range + tr.translateX + endX,
                        translateY: Math.sin(angle) * range + tr.translateY + endY,
                        scaleX: tr.scaleX * 1.5,
                        scaleY: tr.scaleY * 1.5 });
                    uucssopacity(node, 0);

                    _env.jit && (option.fs = fs);
                    uumix(option, {
                        tx: tr.translateX,
                        ty: tr.translateY,
                        sx: tr.scaleX,
                        sy: tr.scaleY });
                } else {
                    style.left = (Math.cos(angle) * range + endX) + "px";
                    style.top  = (Math.sin(angle) * range + endY) + "px";
                    style[_width]  = (w * 1.5) + "px";
                    style[_height] = (h * 1.5) + "px";
                    if (_env.jit) {
                        style.fontSize = (fs * 1.5) + "px";
                    }
                    uucssopacity(node, 0);

                    _env.jit && (option.fs = fs);
                    uumix(option, { x: endX, y: endY, w: w, h: h });
                }
            }}));
}

// uu.fx.moveOut - moveout + fadeout
function uufxmoveout(node,     // @param Node:
                     duration, // @param Number: duration
                     option) { // @param Hash(= { degree: 0, range: 200 }):
                               // @return Node:
    return uufx(node, duration, uuarg(option, { init: function(node, option) {
                var cs = uucss(node, "px"), angle, endX, endY,
                    range = option.range || 200;

                angle = option.degree * Math.PI / 180;
                endX = Math.cos(angle) * range + parseInt(cs.left);
                endY = Math.sin(angle) * range + parseInt(cs.top);

                uumix(option, { w: "*1.5", h: "*1.5", mbtx: endX, mbty: endY },
                      _env.jit ? { fs: "*1.5" } : {});
            }, degree: 0, o: 0 }));
}

//{@color
// uu.fx.highlight - highlight color
function uufxhighlight(node,     // @param Node:
                       duration, // @param Number: duration
                       option) { // @param Hash(= { bgc: "#ff9", reverse: 1 }):
                                 // @return Node:
    var bgc = uucssbgcolor(node, _transparent),
        undo = function(node, option, back) {
            back && uucss(node, { bgc: bgc });
        };

    option.after = option.after ? uuarray(option.after) : [];
    option.after.push(undo);

    return uufx(node, duration,
                uuarg(option, { bgc: "#ff9", reverse: 1, after: option.after }));
}
//}@color
//}@fx

// --- CSS 2 ---
//{@color
// uu.css.bgcolor - get inherit background color
function uucssbgcolor(node,           // @param Node:
                      defaultColor) { // @param ColorString(= "#fff"):
                                      // @return Color:
    var n = node, bgc, zero = { "rgba(0, 0, 0, 0)": 1 };

    zero[bgc = _transparent] = 1;

    while (n && n !== doc && zero[bgc]) {
//{@mb
        if (_ie678 && !n.currentStyle) {
            break;
        }
//}@mb
        bgc = uucss(n).backgroundColor;
        n = n[_parentNode];
    }
    return uucolor(zero[bgc] ? (defaultColor || "#fff") : bgc);
}
//}@color

// --- CSS 3 ---
// uu.css.opacity - accessor
function uucssopacity(node,      // @param Node:
                      opacity) { // @param Number: Number(0.0 - 1.0) absolute
                                 // @return Number/Node:
//{@mb
    if (_ie678) {
        var style = node.style, mary,
            filter = node.parentNode ? node.currentStyle.filter
                                     : style.filter;

        if (opacity === void 0) {
            mary = uucssopacity._.exec(filter);
            return mary ? mary[1] / 100 : 1;
        }
        // normalize
        opacity = (opacity > 0.999) ? 1
                : (opacity < 0.001) ? 0 : opacity;

        style.filter =
            ((opacity > 0 &&
              opacity < 1) ? ("alpha(opacity=" + ((opacity * 100) | 0) + ") ")
                           : "") + filter.replace(uucssopacity._, " ");
        style[_visibility] = opacity ? "visible" : "hidden";
//{@ie67
        if (_ie67) { // [IE6][IE7]
            style.zoom = 1;
        }
//}@ie67
        return node;
    }
//}@mb

    if (opacity === void 0) { // getter
        return parseFloat(getComputedStyle(node, "").opacity || 1);
    }
    // normalize
    node.style.opacity = opacity = (opacity > 0.999) ? 1
                                 : (opacity < 0.001) ? 0 : opacity;
    return node;
}
//{@mb
uucssopacity._ = /alpha\(opacity\=(\d+)\)/;
//}@mb

// uu.css.transform2d
function uucsstransform2d(node,    // @param Node:
                          param) { // @param Hash(= void): { scaleX, scaleY, rotate,
                                   //                        translateX, translateY, translateZ }
                                   //     param.scaleX - Number: scale x (default: 1)
                                   //     param.scaleY - Number: scale y (default: 1)
                                   //     param.rotate - Number: rotate (unit: degree)(0~360)(default: 0)
                                   //     param.translateX - Number: translate x (default: 0)
                                   //     param.translateY - Number: translate y (default: 0)
                                   //     param.translateZ - Number: translate z (default: 0)
                                   // @return Node/Hash:
    //  [1][get transform] uu.css.transform2d(node) -> { scaleX, scaleY, rotate, translateX, translateY, translateZ }
    //  [2][set transform] uu.css.transform2d(node, { rotate: 30 }) -> node

    var undef, dataid = _datauu + "trans", // node["data-uutrans"]
/*{@mb*/ident, dataie, cos, sin, mtx, filter, rect, cx, cy, /*}@mb*/
        meta = node[dataid], keyword = uuready.transform,
        scaleX = 1, scaleY = 1, rotate = 0,
        translateX = 0, translateY = 0;

    if (!meta) { // init
        if (!_ie678 && keyword) { // pickup current transform value
            node.style[keyword].replace(uucsstransform2d._.scale, function(_, x, y) {
                scaleX = x;
                scaleY = y;
            }).replace(uucsstransform2d._.rotate, function(_, r) {
                rotate = r;
            }).replace(uucsstransform2d._.translate, function(_, x, y) {
                translateX = x;
                translateY = y;
            });
        }
        node[dataid] = meta = { scaleX: scaleX,
                                scaleY: scaleY,
                                rotate: rotate,
                                translateX: translateX | 0,
                                translateY: translateY | 0 };
    }
    if (!param) {
        return meta;
    }
    node[dataid] = meta = {
        scaleX:     param.scaleX     === undef ? meta.scaleX     : param.scaleX,
        scaleY:     param.scaleY     === undef ? meta.scaleY     : param.scaleY,
        rotate:     param.rotate     === undef ? meta.rotate     : param.rotate,
        translateX: param.translateX === undef ? meta.translateX : param.translateX | 0,
        translateY: param.translateY === undef ? meta.translateY : param.translateY | 0
    };

//{@mb
    if (_ie678) {
        if (uuready.filter) {
            ident  = "DXImageTransform.Microsoft.Matrix";
            dataie = _datauu + "transie"; // node["data-uutransie"]
            rotate = meta.rotate * Math.PI / 180; // deg2rad
            cos    = Math.cos(rotate);
            sin    = Math.sin(rotate);
            // scale * rotate * translate
            mtx    = [ cos * meta.scaleX, sin * meta.scaleX, 0,
                      -sin * meta.scaleY, cos * meta.scaleY, 0,
                         meta.translateX,   meta.translateY, 1];

            if (!node[dataie]) {
                // init - get center position
                rect = node.getBoundingClientRect();
                cx = (rect.right  - rect.left) / 2; // center x
                cy = (rect.bottom - rect.top)  / 2; // center y
                node.style.filter += " progid:" + ident +
                                     "(sizingMethod='auto expand')";
                node[dataie] = { cx: cx, cy: cy };
            }
            filter = node.filters.item(ident);
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

            node.style.marginLeft = node[dataie].cx - cx + "px";
            node.style.marginTop  = node[dataie].cy - cy + "px";
        }
    } else {
        if (uuready.transform) {
//}@mb
            // node.style.WebkitTransform =
            //  "scale({$sx},{$sy}) rotate({$r}deg) translate({$tx}px,{$ty}px)"
            node.style[uuready.transform] =
                "scale(" + meta.scaleX + "," + meta.scaleY + ") " +
                "rotate(" + meta.rotate + "deg) " +
                "translate(" + (meta.translateX | 0) + "px," +
                               (meta.translateY | 0) + "px)";
//{@mb
        }
    }
//}@mb
    return node;
}
uucsstransform2d._ = {
    scale:      /scale\(([\d\.]+), ([\d\.]+)\)/,
    rotate:     /rotate\(([\d\.]+)\)/,
    translate:  /translate\(([\d\.]+), ([\d\.]+)\)/
};

// --- CSS BOX MODEL ---

// clientWidth           = node.style.width + padding
// offsetWidth           = node.style.width + padding + border
// getBoundingClientRect = node.style.width + padding + border
//
//   [CSS2.1 box model] http://www.w3.org/TR/CSS2/box.html
//
//       B-------border--------+ -> border edge [CSS2.1 KEYWORD]
//       |                     |
//       |  P----padding----+  | -> padding edge [CSS2.1 KEYWORD]
//       |  |               |  |
//       |  |  C-content-+  |  | -> content edge [CSS2.1 KEYWORD]
//       |  |  |         |  |  |
//       |  |  |         |  |  |
//       |  |  +---------+  |  |
//       |  |               |  |
//       |  +---------------+  |
//       |                     |
//       +---------------------+
//
//       B = event.offsetX/Y in WebKit
//           event.layerX/Y  in Gecko
//       P = event.offsetX/Y in IE6 ~ IE8
//       C = event.offsetX/Y in Opera

//{@cssbox

// uu.css.box - calculate box size(margin, padding, border, width, height)
function uucssbox(node,     // @param Node:
                  recalc) { // @param Boolean(= false): false is use-cache, true is recalc
                            // @return Hash: { w, h, m:{ t,l,r,b }, b:{ t,l,r,b }, p:{ t,l,r,b } }
                            //  w - Number: node.style.width  (without border and padding)
                            //  h - Number: node.style.height (without border and padding)
                            //  m.t - Number: margin top
                            //  m.l - Number: margin left
                            //  m.r - Number: margin right
                            //  m.b - Number: margin bottom
                            //  p.t - Number: padding top
                            //  p.l - Number: padding left
                            //  p.r - Number: padding right
                            //  p.b - Number: padding bottom
                            //  b.t - Number: border top width
                            //  b.l - Number: border left width
                            //  b.r - Number: border right width
                            //  b.b - Number: border bottom width
    if (!recalc && node[_datauu + "cssbox"]) { // node["data-uucssbox"]
        return node[_datauu + "cssbox"];
    }
    var cs = /*{@mb*/
             !getComputedStyle ? node.currentStyle : /*}@mb*/ // [IE6][IE7][IE8]
                                 getComputedStyle(node, 0),
        mt = cs.marginTop,
        ml = cs.marginLeft,
        mr = cs.marginRight,
        mb = cs.marginBottom,
        bt = cs.borderTopWidth,
        bl = cs.borderLeftWidth,
        br = cs.borderRightWidth,
        bb = cs.borderBottomWidth,
        pt = cs.paddingTop,
        pl = cs.paddingLeft,
        pr = cs.paddingRight,
        pb = cs.paddingBottom,
        db = uucssbox._, n, undef, rect, none = 0, auto = "auto",
        w = cs.width,  // "123px", "auto"
        h = cs.height;

    mt = ((n = db[mt]) === undef) ? uucssunit(node, mt) : n;
    ml = ((n = db[ml]) === undef) ? uucssunit(node, ml) : n;
    mr = ((n = db[mr]) === undef) ? uucssunit(node, mr) : n;
    mb = ((n = db[mb]) === undef) ? uucssunit(node, mb) : n;
    // border: auto -> invalid value -> 0
    bt = ((n = db[bt]) === undef) ? bt === auto ? 0 : uucssunit(node, bt) : n;
    bl = ((n = db[bl]) === undef) ? bl === auto ? 0 : uucssunit(node, bl) : n;
    br = ((n = db[br]) === undef) ? br === auto ? 0 : uucssunit(node, br) : n;
    bb = ((n = db[bb]) === undef) ? bb === auto ? 0 : uucssunit(node, bb) : n;
    // padding: auto -> invalid value -> 0
    pt = ((n = db[pt]) === undef) ? pt === auto ? 0 : uucssunit(node, pt) : n;
    pl = ((n = db[pl]) === undef) ? pl === auto ? 0 : uucssunit(node, pl) : n;
    pr = ((n = db[pr]) === undef) ? pr === auto ? 0 : uucssunit(node, pr) : n;
    pb = ((n = db[pb]) === undef) ? pb === auto ? 0 : uucssunit(node, pb) : n;

    // display:none -> display:block -> recalc width/height
    if (cs.display === "none") {
        ++none;
        node.style.display = "block";
    }
    rect = node.getBoundingClientRect(); // [Firefox3+][IE6+][WebKit][Opera]
    w = (node.offsetWidth || rect.right - rect.left)
        - parseInt(bl) - parseInt(br)
        - parseInt(pl) - parseInt(pr);
    w = w > 0 ? w : 0;

    h = (node.offsetHeight || rect.bottom - rect.top)
        - parseInt(bt) - parseInt(bb)
        - parseInt(pt) - parseInt(pb);
    h = h > 0 ? h : 0;

    none && (node.style.display = "none");

    return node[_datauu + "cssbox"] = { // cache
        w: w,
        h: h,
        m: { t: mt, l: ml, r: mr, b: mb },
        b: { t: bt, l: bl, r: br, b: bb },
        p: { t: pt, l: pl, r: pr, b: pb }
    };
}
uucssbox._ = {
    "0px": 0, "1px": 1, "2px": 2, "3px": 3,
    thin: 1, medium: 3, thick: (_ie67 || _opera) ? 6 : 5
};

// uu.css.rect - get offset from AncestorNode/LayoutParentNode
function uucssrect(node,           // @param Node:
                   ancestorNode) { // @param Node(= null): AncestorNode,
                                   //                      null is detect LayoutParentNode
                                   // @return Hash: { x, y, w, h, parent }
                                   //   x - Number: total offset
                                   //   y - Number: total offset
                                   //   w - Number: offsetWidth  (style.width  + padding + border)
                                   //   h - Number: offsetHeight (style.height + padding + border)
                                   //   from - Node: AncestorNode or LayoutParentNode

    //  [1][offset from LayoutParentNode] uu.css.rect(<div>)         -> { x: 100, y: 100, w: 100, h: 100, from: <?> }
    //  [2][offset from AncestorNode]     uu.css.rect(<div>, <html>) -> { x: 200, y: 200, w: 100, h: 100, from: <html> }

    var cs = /*{@mb*/ getComputedStyle ? /*}@mb*/ getComputedStyle(node, 0)
             /*{@mb*/                  :          node.currentStyle /*}@mb*/,
        position, body = doc.body,
        x = 0,
        y = 0,
        w = 0, // offsetWidth  = node.style.width  + padding + border
        h = 0, // offsetHeight = node.style.height + padding + border
        n = node,
        from = null,
        quick = 0;

    if (cs) {
        position = cs[_position];
        w = node.offsetWidth  || 0; // offsetWidth  = node.style.width  + padding + border
        h = node.offsetHeight || 0; // offsetHeight = node.style.height + padding + border

        if (position === "relative" || position === "absolute") {
            if (cs.left !== "auto" && cs.top !== "auto") {
                quick = 1;
            }
//{@mb
            if (_gecko) {
                if (cs.left === "0px" || cs.top === "0px") { // [GECKO][FIX] left:auto -> "0px"
                    quick = 0;
                }
            }
//}@mb
        }

        if (ancestorNode == null) {
            // offset from LayoutParentNode
            if (quick) {
                x = parseInt(cs.left);
                y = parseInt(cs.top);
                from = n.offsetParent;
            } else {
                while (n && n !== body) {
                    x += n.offsetLeft || 0;
                    y += n.offsetTop  || 0;
                    n  = n.offsetParent;
                    if (n) {
                        cs = (getComputedStyle ? getComputedStyle(n, 0)
                                               : n.currentStyle)[_position];
                        if (cs === "relative" || cs === "absolute") {
                            from = n;
                            break;
                        }
                    }
                }
            }
        } else {
            // offset from AncestorNode
            while (n && n !== body) {
                x += n.offsetLeft || 0;
                y += n.offsetTop  || 0;
                n  = n.offsetParent;
                if (n && n === ancestorNode) {
                    from = n;
                    break;
                }
            }
        }
    }
    return { x: x, y: y, w: w, h: h, from: from };
}

// uu.css.position - to static / to absolute / to relative
function uucssposition(node,  // @param Node:
                       pos) { // @param String(= "s"): "static", "absolute", "relative"
                              //                    or "s", "a", "r"
                              // @return Node:
    var ns = node.style, cs, rect, box;

    switch ((pos || "s").charAt(0)) {
    case "s":   ns[_position] = "static"; break;
    case "a":   rect = uucssrect(node); // offset from foster
                box = uucssbox(node, _true); // recalc margin
                ns.left = (rect.x - box.m.l) + "px"; // margin.left
                ns.top  = (rect.y - box.m.t) + "px"; // margin.top
                ns[_position] = "absolute";
                break;
    case "r":   cs = uucss(node); // get computed style
                ns.left = cs.left;
                ns.top  = cs.top;
                ns[_position] = "relative";
    }
    return node;
}
//}@cssbox

// --- CSS3 ---

// uu.css.userSelect - user select
function uucssuserSelect(node,    // @param Node(= null):
                         allow) { // @param Boolean(= false):
                                  // @return Node:
    var undef, all = node === undef,
/*{@mb*/ary, i, iz,/*}@mb*/
        style, val = allow ? "" : "none";

    all && (node = doc.body);
    style = node.style;

    if (style.userSelect !== undef) { // [CSS3] user-select:
        style.userSelect = val;
    } else if (style.WebkitUserSelect !== undef) {
        style.WebkitUserSelect = val;
//{@mb
    } else if (style.MozUserSelect !== undef) {
        ary = all ? uutag("", doc.body) : [node];
        for (i = 0, iz = ary.length; i < iz; ++i) {
            ary[i].style.MozUserSelect = allow ? "" : "-moz-none";
        }
    } else if (style.OUserSelect !== undef) {
        style.OUserSelect = val;
    } else { // [IE][OPERA]
        if (_ie && all) { // [IE]
            doc.unselectable  = allow ? "" : "on";
            doc.onselectstart = allow ? "" : uupao(_false);
        } else { // [IE][OPERA]
            ary = all ? uutag("", doc.body) : [node];
            for (i = 0, iz = ary.length; i < iz; ++i) {
                ary[i].unselectable  = allow ? "" : "on";
                ary[i].onselectstart = allow ? "" : uupao(_false);
            }
        }
//}@mb
    }
    return node;
}

// --- STYLE SHEET ---

// StyleSheet.init
function StyleSheetInit(id) { // @param String(= ""): style sheet id
    var node = doc.createElement("style");

    node.id = id || "";
    _webkit && node.appendChild(doc.createTextNode(" "));
    doc.head.appendChild(node);

    this.ss = node.sheet /*{@mb*/ || node.styleSheet /*}@mb */ ; // [IE] node.styleSheet
    this.rules = {};
}

// StyleSheet.add
function StyleSheetAdd(expr,   // @param Hash/String: { selector: declaration, ... } or a "selector"
                       decl) { // @param String(= void): "declaration"
    var ss = this.ss,
/*{@mb*/ary, i, iz, rex, /*}@mb*/
        selector, declaration, pair = uupair(expr, decl);

    // mixin rules
    uumix(this.rules, pair);

    for (selector in pair) {
        declaration = this.rules[selector];

//{@mb
        if (ss.insertRule) {
//}@mb
            ss.insertRule(selector + "{" + declaration + "}",
                          ss.cssRules.length);
//{@mb
        } else { // [IE]
            // IE6 unsupported "E+F" "E>F" "E~F"
            rex = _env.ie6 ? /(?:\+>~)/ : 0;

            // split group "E,F" -> "E", "F"
            ary = selector.split(",");
            for (i = 0, iz = ary.length; i < iz; ++i) {
                if (rex && rex.test(ary[i])) {
                    // http://d.hatena.ne.jp/uupaa/20100717/1279297903
                    throw new Error("BAD_SELECTOR");
                }
                ss.addRule(ary[i], declaration.trim());
            }
        }
//}@mb
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

//{@mb
    if (ss.deleteRule) {
//}@mb
        i = ss.cssRules.length;
        while (i--) {
            ss.deleteRule(i);
        }
//{@mb
    } else {
        i = ss.rules.length;
        while (i--) {
            ss.removeRule(i);
        }
    }
//}@mb
}

// --- SystemStyleSheet Class ---

// SSS.init
function SSSInit() {
    var node = doc.createElement("style");

    _webkit && node.appendChild(doc.createTextNode(" "));
    doc.head.appendChild(node);
    this.node = node;
    this.ss = node.sheet /*{@mb*/ || node.styleSheet /*}@mb */ ; // [IE] node.styleSheet
}

// SSS.add
function SSSAdd(selector,      // @param String: selector. "div>p"
                declaration) { // @param String: declaration. "color:red; font-weight:bold"
                               // @return Number: index
//{@mb
    if (_ie678) {
        this.ss.addRule(selector, declaration.trim()); // add last // [IE6][IE7][IE8]
        return this.ss.rules.length - 1;
    }
//}@mb
    return this.ss.insertRule(selector + "{" + declaration + "}", // [WEB STD][IE9]
                              this.ss.cssRules.length);
}

// SSS.update - update declaration
function SSSUpdate(index,         // @param Number: index
                   selector,      // @param String: selector. "div>p"
                   declaration) { // @param String: declaration. "color:red; font-weight:bold"
    this.remove(index);
    this.add(selector, declaration);
}

// SSS.remove - remove rule
function SSSRemove(index) { // @param Number: index
/*{@mb*/ _ie678 ? this.ss.removeRule(index) : /*}@mb*/ // [IE6][IE7][IE8]
                  this.ss.deleteRule(index);           // [WEB STD][IE9]
}

// SSS.cssText - dump cssText
function SSSCSSText() { // @return String:
    return this.ss.cssText;
}

// SSS.clear - clear all rules
function SSSClear() {
    var ss = this.ss, i = 0,
        rules = /*{@mb*/ _ie678 ? ss.rules.length : /*}@mb*/
                                  ss.cssRules.length;

    for (; i < rules; ++i) {
/*{@mb*/_ie678 ? ss.removeRule(0) : /*}@mb*/
                 ss.deleteRule(0);
    }
}

// --- CALC CSS UNIT ---
// uu.css.unit - convert to pixel unit
function uucssunit(node,    // @param Node: context
                   value) { // @param Number/CSSUnitString: 12, "12", "12px",
                            //                             "12pt", "12em", "auto"
                            // @return Number: pixel value
    //  [1][to pixel] uu.css.unit(<div>,  12   ) -> 12
    //  [2][to pixel] uu.css.unit(<div>, "12"  ) -> 12
    //  [3][to pixel] uu.css.unit(<div>, "12px") -> 12
    //  [4][to pixel] uu.css.unit(<div>, "12pt") -> 16
    //  [5][to pixel] uu.css.unit(<div>, "12em") -> 192
    //  [6][to pixel] uu.css.unit(<div>, "auto") -> 100

    if (isFinite(value)) { // [1][2] 12 or "12"
        return +value;
    }
    if (_unit.px.test(value)) { // [3] "12px"
        return parseInt(value) || 0;
    }
    if (_unit.pt.test(value)) { // [4] "12pt"
        return (parseFloat(value) * 4 / 3) | 0; // 12pt * 1.333 = 16px
    } else if (_unit.em.test(value)) { // [5] "12em"
        var fontSize = getComputedStyle ? getComputedStyle(node, 0).fontSize
                                        : node.currentStyle.fontSize

        return (parseFloat(value) *
                parseFloat(fontSize) *
                (_unit.pt.test(fontSize) ? 4 / 3 : 1)) | 0;
    }
    // [6] auto
    return (getComputedStyle ? calcPixel
                             : calcPixelIE)(node, value, "left");
}

// inner - convert CSS unit
function calcPixel(node,   // @param Node:
                   value,  // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                   prop) { // @param String: property, "left", "width", ...
                           // @return Number: pixel value
    var style = node.style, mem = [style.left, 0, 0], // [left, position, display]
        important = "important",
        setProperty = "setProperty",
        removeProperty = "removeProperty",
        getPropertyValue = "getPropertyValue";

//{@mb
    if (_webkit) {
//}@mb
        mem[1] = style[getPropertyValue](_position);
        mem[2] = style[getPropertyValue](_display);
        style[setProperty](_position, "absolute", important);
        style[setProperty](_display,  "block",    important);
//{@mb
    }
//}@mb
    style[setProperty](prop, value, important);
    // get pixel
    value = parseInt(getComputedStyle(node, 0).left);
    // restore
    style[removeProperty](prop);
    style[setProperty](prop, mem[0], "");
//{@mb
    if (_webkit) {
//}@mb
        style[removeProperty](_position);
        style[removeProperty](_display);
        style[setProperty](_position, mem[1], "");
        style[setProperty](_display,  mem[2], "");
//{@mb
    }
//}@mb
    return value || 0;
}

//{@mb
// inner - convert CSS unit
function calcPixelIE(node,   // @param Node:
                     value,  // @param CSSUnitString: "10em", "10pt", "10px", "auto"
                     prop) { // @param String: property, "left", "width", ...
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

// inner - emulate getComputedStyle [IE6][IE7][IE8]
function getComputedStyleIE(node) { // @param Node:
                                    // @return Hash: { width: "123px", ... }
    // http://d.hatena.ne.jp/uupaa/20091212
    var rv, rect, i = 0, left1, left2, mixVal, prop,
        style = node.style,
        currentStyle = node.currentStyle,
        runtimeStyle = node.runtimeStyle,
        RECTANGLE = { top: 1, left: 2, width: 3, height: 4 },
        fontSize = currentStyle.fontSize,
        em = parseFloat(fontSize) * (_unit.pt.test(fontSize) ? 4 / 3 : 1),
        boxProperties = getComputedStyleIE.boxs,
        cache = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                  thin: "1px", medium: "3px",
                  thick: _ie67 ? "6px" : "5px" }; // [IE6][IE7] thick = "6px"

    rv = getComputedStyleIE.getProps(currentStyle);

    // calc: border***Width, padding***, margin***
    for (; prop = boxProperties[i++]; ) {
        mixVal = currentStyle[prop]; // "12px" or "12pt" or "12%" or "auto"

        if (!(mixVal in cache)) { // cached ?
            // mix value -> pixel value
            switch (mixVal.slice(-2)) {
            case "px": cache[mixVal] = mixVal; break;
            case "em": cache[mixVal] = (parseFloat(mixVal) * em) + "px"; break;
            case "pt": cache[mixVal] = (parseFloat(mixVal) * 4 / 3) + "px"; break;
            default: // "%", "auto", etc...
                left1 = style.left;
                left2 = runtimeStyle.left;
                runtimeStyle.left = currentStyle.left;
                style.left = mixVal;
                cache[mixVal] = style.pixelLeft + "px";
                style.left = left1;
                runtimeStyle.left = left2;
            }
        }
        rv[prop] = cache[mixVal];
    }

    // calc: top, left, width, height
    for (prop in RECTANGLE) { // RECTANGLE = { top: 1, left: 2, width: 3, height: 4 }
        mixVal = currentStyle[prop]; // "12px" or "12pt" or "12%" or "auto"

        // mix value -> pixel value
        switch (mixVal.slice(-2)) {
        case "px": rv[prop] = mixVal; break;
        case "em": rv[prop] = (parseFloat(mixVal) * em) + "px"; break;
        case "pt": rv[prop] = (parseFloat(mixVal) * 4 / 3) + "px"; break;
        default:
            switch (RECTANGLE[prop]) {
            case 1: rv[prop] = node.offsetTop  + "px"; break; // style.top
            case 2: rv[prop] = node.offsetLeft + "px"; break; // style.left
            case 3: rect || (rect = node.getBoundingClientRect());
                    mixVal = (node.offsetWidth  || rect.right - rect.left) // style.width
                        - parseInt(rv.borderLeftWidth)
                        - parseInt(rv.borderRightWidth)
                        - parseInt(rv.paddingLeft)
                        - parseInt(rv.paddingRight);
                    rv[prop] = mixVal > 0 ? (mixVal + "px") : "0px";
                    break;
            case 4: rect || (rect = node.getBoundingClientRect());
                    mixVal = (node.offsetHeight || rect.bottom - rect.top) // style.height
                        - parseInt(rv.borderTopWidth)
                        - parseInt(rv.borderBottomWidth)
                        - parseInt(rv.paddingTop)
                        - parseInt(rv.paddingBottom);
                    rv[prop] = mixVal > 0 ? (mixVal + "px") : "0px";
            }
        }
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

    for (; prop = props[i++]; ) {
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
//}@mb

// --- className(klass) ---
// uu.klass - as document.getElementsByClassName and className accessor
function uuklass(expr,      // @param String/Node: "class", "class1, ..." or Node
                 context) { // @param String/Node(= <body>): query context
                            // @return NodeArray/Node: [Node, ...] or Node

    //  [1][query  className]  uu.klass("warn", <div>)             -> NodeArray
    //  [2][add    className]  uu.klass(<div>,              "A")   -> <div class="A">
    //  [3][add    className]  uu.klass(<div>,             "+A B") -> <div class="A B">
    //  [4][remove className]  uu.klass(<div class="A B">, "-A B") -> <div>
    //  [5][toggle className]  uu.klass(<div class="A">,   "!A B") -> <div>
    //  [6][remove className]  uu.klass(<div class="A B">, /(A|B)/) -> <div>

    var rex, m, node,
//{@mb
        rv, ri, i, iz, ary, az, nodeList,
//}@mb
        sp = " ", word = context;

    // className accessor [2][3][4][5][6]
    if (expr[_nodeType]) {
        node = expr;
        if (word.exec) { // isRegExp [6]
            node[_className] = node[_className].replace(word, "").trim();
            return node;
        }
        // [2][3][4][5]
        switch ({ "+": 3, "-": 4, "!": 5 }[word.charAt(0)] || 2) {
        case 2: node[_className] += sp + word; break;          //  add
        case 3: node[_className] += sp + word.slice(1); break; // +add
        case 4: rex = classNameMatcher(uustringtrim(word.slice(1)).split(sp)); // -remove
                node[_className] = uustringtrim(node[_className][_replace](rex, ""));
                break;
        case 5: m = uuklasshas(node, word = word.slice(1)) ? "-" : "+"; // !toggle
                uuklass(node, m + word);
        }
        return node;
    }

    // query.class [1]
//{@mb
    if (!doc.getElementsByClassName) { // [IE6][IE7][IE8]
        ary = uustringtrim(expr).split(sp);
        az  = ary.length;
        rex = classNameMatcher(ary);
        nodeList = (context || doc.body || doc).getElementsByTagName("*");

        for (rv = [], ri = 0, i = 0, iz = nodeList.length; i < iz; ++i) {
            node = nodeList[i];
            if ((word = node[_className]) &&
                ((m = word.match(rex)) && m.length >= az)) {
                rv[ri++] = node;
            }
        }
        return rv;
    }
//}@mb
    // [WEB STD][IE9]
    return toArray.call((context || doc.body || doc).getElementsByClassName(expr));
}

// uu.klass.has - has className
function uuklasshas(node,         // @param Node:
                    classNames) { // @param String: "class1 class2 ..." (joint space)
                                  // @return Boolean:
    var m, w = node[_className], ary = uustringtrim(classNames).split(" ");

    return w ? ((m = w.match(classNameMatcher(ary))) && (m.length >= ary.length))
             : _false;
}

// inner - className matcher
function classNameMatcher(ary) { // @param Array:
                                 // @return RegExp:
    return RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
}

// --- OOP ---
// uu.Class - create a generic class
function uuClass(className,      // @param String: "Class"
                                 //             or "Class : SuperClass"  (inherit)
                                 //             or "Class < SuperClass"  (inherit)
                 protoMember,    // @param Hash/Function(= void): prototype object
                                 //                               or init function
                 staticMember) { // @param Hash(= void): static member

    //  [1][define tiny class]     uu.Class("Class")
    //  [2][define generic class]  uu.Class("Class",            { proto: ... }, { static: func... })
    //  [3][inherit]               uu.Class("SuperClass:Class", { proto: ... }, { static: func... })
    //  [4][inherit]               uu.Class("SuperClass<Class", { proto: ... }, { static: func... })

    var ary = className.split(/\s*[\x3a\x3c]\s*/),
        Class = ary[0],
        Super = ary[1] || "",
        protoIsFunction = protoMember && isFunction(protoMember),
        tmp, i, classPrototype;

    uuClass[Class] = function() { // uu("CLASSNAME", arg, ...)
        var that = this,
            args = arguments,
            Super = that.superClass || 0;

        that.name = Class;        // class name
        that.uuguid = uunumber(); // instance guid
        that.msgbox || (that.msgbox = uunop);
        uu.msg.bind(that);        // bind MsgPump

        // constructor(Super -> that)
        Super && Super.init && Super.init.apply(that, args);
                  that.init &&  that.init.apply(that, args);
    };
    uuClass[Class].toString = function() { // uujsonencode()
        return Class;
    };
    uuClass[Class][_prototype] = protoIsFunction ? { init: protoMember }
                                                 : protoMember || {};
    staticMember && uumix(uuClass[Class], staticMember);

    if (Super && protoMember && !protoIsFunction) { // [2]
        tmp = function() {};
        tmp[_prototype] = uuClass[Super][_prototype];
        classPrototype  = uuClass[Class][_prototype] = new tmp;

        for (i in protoMember) {
            classPrototype[i] = protoMember[i];
        }
        classPrototype.constructor = uuClass[Class];
        classPrototype.superClass  = uuClass[Super][_prototype];
        classPrototype.superMethod = superMethod;
    }

    function superMethod(method              // @param String: method name
                         /*, var_args */ ) { // @param Mix: args
        return this.superClass[method].apply(this, uuarray(arguments, 1));
    }
}

// uu.Class.singleton - create a singleton class
function uuClassSingleton(className,      // @param String: class name
                          protoMember,    // @param Hash/Function(= void): prototype member
                                          //                               or init function
                          staticMember) { // @param Hash(= void): static member
    uuClass[className] = function() {
        var that = this, arg = arguments, self = arg.callee,
            instance = "instance";

        if (!self[instance]) {
            that.name = className;    // class name
            that.uuguid = uunumber(); // instance guid
            that.init && that.init.apply(that, arg);
            that.msgbox || (that.msgbox = uunop);
            uu.msg.bind(that);       // bind MsgPump
        }
        return self[instance] || (self[instance] = that);
    };
    uuClass[className].toString = function() { // uujsonencode()
        return className;
    };
    uuClass[className][_prototype] =
        protoMember && isFunction(protoMember) ? { init: protoMember }
                                               : protoMember || {};
    staticMember && uumix(uuClass[className], staticMember);
}

// --- MsgPump ---
// MsgPump
function MsgPump() {
    this.addr = {}; // AddressMap { guid: instance, ... }
    this.cast = []; // Broadcast AddressMap [guid, ...]
}

// MsgPump.send - send a message synchronously
function uumsgsend(address,  // @param NodeArray/InstanceArray/Array/Mix: address or guid or UINode
                             //           [instance, ...] is multicast
                             //           instance is unicast
                             //           null is broadcast
                   message,  // @param String: message
                   param1,   // @param Mix(= void): param1
                   param2) { // @param Mix(= void): param2
                             // @return Array: [result, ...]

    //  [1][multicast] MsgPump.send([instance, ...], "hello") -> ["world!", ...]
    //  [2][unicast  ] MsgPump.send(instance, "hello") -> ["world!"]
    //  [3][broadcast] MsgPump.send(null, "hello") -> ["world!", ...]

    var rv = [], ri = -1, to, obj, i = 0,
        ary = address ? uuarray(address) : this.cast;

    for (; to = ary[i++]; ) {
        obj = this.addr[to.instance ? to.instance.uuguid
                                    : (to.uuguid || to || 0)];
        obj && (rv[++ri] = obj.msgbox(message, param1, param2));
    }
    return rv;
}

// MsgPump.post - send a message asynchronously
function uumsgpost(address,  // @param NodeArray/InstanceArray/Array/Mix: address or guid or UINode
                             //           [instance, ...] is multicast
                             //           instance is unicast
                             //           null is broadcast
                   message,  // @param String: message
                   param1,   // @param Mix(= void): param1
                   param2) { // @param Mix(= void): param2

    //  [1][multicast] MsgPump.post([instance, ...], "hello")
    //  [2][unicast  ] MsgPump.post(instance, "hello")
    //  [3][broadcast] MsgPump.post(null, "hello")

    var that = this;

    setTimeout(function() {
        that.send(address ? uuarray(address) : that.cast,
                  message, param1, param2);
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

// uu.event - bind event
//   window.onbeforeunload unsupported
function uuevent(node,         // @param Node/Window:
                 exEventType,  // @param ExEventTypeString: some EventTypeEx, "click,click+,..."
                 evaluator,    // @param CallbackFunction/Instance: callback function
                 hint,         // @param String(= void): code search hint
                 __unbind__) { // @hidden Boolean(= false): true is unbind, false is bind
                               // @return Node:

//{@debug
    uutrace(arguments.callee, arguments.length, node, exEventType, evaluator, hint);
//}@debug
//{@assert
    if (node !== win && !isNode(node)) {
        uung("uu.event", node);
    }
    if (evaluator == null) { // null or undefined
        uung("uu.event", "evaluator does not function");
    }
    switch (uutype(hint)) {
    case uutype.STRING:
    case uutype.UNDEFINED: break;
    default: uung("uu.event", hint);
    }
    switch (uutype(__unbind__)) {
    case uutype.BOOLEAN:
    case uutype.UNDEFINED: break;
    default: uung("uu.event", __unbind__);
    }
//}@assert

    // [!] event callback
    function eventClosure(event) { // @param NativeEventObject:

        if (!event.uu ||        // extended?
            event.uuoverride) { // or force override?

            var fullcode = uuevent.codes[event.type] || 0, // event.type -> fullcode
                tgt = event.target /*{@mb*/ || event.srcElement || doc /*}@mb*/; // [IE6][IE7][IE8]

            // bonding event.uu = {...}
            event.uu = {
                at:     (tgt[_nodeType] === Node.TEXT_NODE) ? tgt[_parentNode] : tgt,
                ns:     ns,                 // last specified namespace
                code:   fullcode & 0xff,    // half code
                live:   _false,
                node:   node,
                hint:   hint,
                mouse:  event.button || 0,
                touch:  fullcode & 0x0200,
                gesture:fullcode & 0x0400
            };
            event.uuoverride && uumix(event.uu, event.uuoverride);
            event.uuoverride = 0;

//{@deprecated 2010-10-28 -> end of uupaa.js version 1.0 release
            uumix(event, event.uu);
//}@deprecated

/* Gecko2 multitouch events support
            if (_gecko && event.uu.touch) { // [Gecko2][Firefox4]
                if (event.mozInputSource === 5) { // 5: MOZ_SOURCE_TOUCH
                    switch (fullcode) {
                    case uuevent.codes.MozTouchDown:
                        uuevent.finger[event.streamId] = 1;
                        uuevent.finger.length += 1;
                        break;
                    case uuevent.codes.MozTouchUp:
                        uuevent.finger[event.streamId] = 0;
                        uuevent.finger.length -= 1;
                    }
                }
            }
 */

//{@mb
            if (_ie678) {
                if (!event.target) { // [IE6][IE7][IE8]
                    event.currentTarget = node;

                    switch (event.code) {
                    case uuevent.codes.mousedown:
                    case uuevent.codes.mouseup:
                        event.uu.mouse = (event.button & 1) ? 0
                                       : (event.button & 2) ? 2 : 1;
                        break;
                    case uuevent.codes.contextmenu:
                        event.uu.mouse = 2;
                        break;
                    case uuevent.codes.mouseover:
                    case uuevent.codes.mouseout:
                        event.relatedTarget = tgt === event.fromElement
                                            ? event.toElement
                                            : event.fromElement;
                    }
                }
                if (event.pageX === void 0) { // [IE6][IE7][IE8]
                    event.pageX = event.clientX + (owner.scrollLeft || 0);
                    event.pageY = event.clientY + (owner.scrollTop  || 0);
                }
            }
//}@mb
            if (event.uu.code === uuevent.codes.mousewheel) {
                event.uu.wheel = (/*{@mb*/ event.detail ? event.detail : /*}@mb*/
                                 (event.wheelDelta / -120)) | 0;
            }
        }
        // callback(event, node):Boolean -> return false -> uu.event.stop(event)
        (isInstance ? handler.call(evaluator, event)
                    : evaluator(event)) === _false && uueventstop(event);
    }

    // [1][bind a event]            uu.event(node, "click", fn)             -> node
    // [2][bind multi events]       uu.event(node, "click,dblclick", fn)    -> node
    // [3][bind a capture event]    uu.event(node, "mousemove+", fn)        -> node
    // [4][bind a namespace.event]  uu.event(node, "MyNameSpace.click", fn) -> node

    // --- init event database ---
    if (!(_datauu + "event" in node)) {
        node[_datauu + "event"] = { // node["data-uuevent"]
            t: ",",     // t:types
            c: {},      // c:closure
            e: {},      // e:evaluator
            hint: ","   // hint
        };
    }

    var exEventTypeArray = exEventType.split(","),
        eventData = node[_datauu + "event"],
        ex, token, ns, eventType, capture, closure, bound,
        handler, i = 0, pos,
/*{@mb*/owner = (node.ownerDocument || doc).documentElement,/*}@mb*/
        isInstance = 0;

    if (__unbind__) {
        closure = evaluator;
    } else {
        handler = isFunction(evaluator) ? evaluator
                                        : (isInstance = 1, evaluator.handleEvent);
        closure = eventClosure;
    }

    //
    // event database structure
    //
    //  node["data-uuevent"]                             // aka eventData
    //  node["data-uuevent"].t = "," + exEventType + "," // types
    //  node["data-uuevent"].c[exEventType] = closure    // closure db
    //  node["data-uuevent"].e[exEventType] = evaluator  // evaluator db
    //  node["data-uuevent"].hint = "," + hint + ","     // hints
    //

    for (; ex = exEventTypeArray[i++]; ) { // ex = "namespace.click+"

        //
        // parse ExEventTypeString( "namespace.click+" )
        //                                v
        // token = ["namespace.click+", "namespace", "click", "+"]
        //

        token = uuevent._.parse.exec(ex);
        ns        = token[1];
        eventType = token[2]; // "click"
        capture   = token[3] || 0; // "+"
        bound     = eventData.t[_indexOf]("," + ex + ",") >= 0;

//{@mb
        // IE mouse capture [IE6][IE7][IE8]
        if (_ie678) {
            if (eventType === "mousemove") {
                capture && (__unbind__ ? uueventunbind
                                       : uuevent)(node, "losecapture", closure);
            } else if (eventType === "losecapture") {
                if (node.setCapture) {
                    __unbind__ ? node.releaseCapture()
                               : node.setCapture();
                }
            }
        }
//}@mb
        if (__unbind__) {
            if (bound) {

                pos = eventData.c[ex][_indexOf](evaluator);
                if (pos >= 0) {

                    eventData.c[ex].splice(pos, 1); // remove closure
                    eventData.e[ex].splice(pos, 1); // remove evaluator
                    // removed all handlers in a type
                    if (!eventData.c[ex].length) {

                        // ",dblclick," <- ",namespace.click+,dblclick,".
                        //                      replace(",namespace.click+,", ",")
                        eventData.t =
                            eventData.t[_replace]("," + ex + ",", ",");
                    }
                    uueventattach(node, eventType, closure, capture, _true); // detach
                }
            }
        } else {
            // ",namespace.click+,dblclick," <- ",namespace.click+," + "dblclick" + ,"
            if (!bound) {
                // --- init ---
                eventData.t += ex + ",";
                eventData.c[ex] = [];
                eventData.e[ex] = [];
                if (hint) {
                    if (eventData.hint.indexOf("," + hint + ",") < 0) { // has not
                        eventData.hint += hint + ","; // add
                    }
                }
            }
            eventData.c[ex].push(closure);
            eventData.e[ex].push(evaluator);
            uueventattach(node, eventType, closure, capture);
        }
    }
    return node;
}
uuevent._ = {
    // uuevent._.parse - parse EventTypeEx
    parse:  /^(?:(\w+)\.)?(\w+)(\+)?$/, // ^[NameSpace.]EvntType[Capture]$
//{@mb
    // uuevent._.fix - crossbrowse event names
    fix:    _gecko ? { mousewheel: "DOMMouseScroll",
                       touchstart: "MozTouchDown",
                       touchend:   "MozTouchUp",
                       touchmove:  "MozTouchMove" } :
            _opera ? { contextmenu: "mousedown" } : {},
//}@mb
    // uuevent._.as - shortcuts, uu.mousedown as uu.event.mousedown
    as:     ("mousedown,mouseup,mousemove,mousewheel,click,dblclick,keydown," +
             "keypress,keyup,change,submit,focus,blur,contextmenu").split(",")
};
//{@mb
//uuevent.finger = { length: 0 }; // [Gecko] touch event fingers
//}@mb
uuevent.codes = {
//{@mb
    // Cross Browser Event
    losecapture:    0x102, // as mouseup    [IE]
    DOMMouseScroll: 0x104, // as mousewheel [GECKO]
//}@mb
    // DOM Level2 Events    iPhone Touch Events         iPhone Gesture Events
    mousedown:      1,      touchstart:     0x201,      gesturestart:   0x401,
    mouseup:        2,      touchend:       0x202,      gestureend:     0x402,
    mousemove:      3,      touchmove:      0x203,      gesturechange:  0x403,
    mousewheel:     4,
//{@mb
/*
    //                      Gecko Touch Events
                            MozTouchDown:   0x201,
                            MozTouchUp:     0x202,
                            MozTouchMove:   0x203,
 */
//}@mb
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
    message:        52,
    hashchange:     53 // Opera11+
};

// uu.event.fire - fire event / fire custom event(none capture event only)
function uueventfire(node,      // @param Node/Window: target node
                     eventType, // @param String: "click", "custom"
                     hint) {    // @param String(= void): code search hint
                                // @return Node:
    if (uuhas(node, eventType)) {

        var token = uuevent._.parse.exec(eventType),
            event = { // fake event object
                type:           token[2],
                pageX:          0,
                pageY:          0,
                target:         node,
                button:         0,
                detail:         0,
                currentTarget:  node,
                relatedTarget:  node,
                uuoverride: {
                    ns:         token[1],
                    node:       node,
                    hint:       hint
                }
            };

        uueach(node[_datauu + "event"].c[eventType], function(closure) {
            closure.call(node, event);
        });
    }
    return node;
}

// uu.event.stop - stopPropagation and preventDefault
function uueventstop(event,     // @param Event/ExEvent:
                     stop,      // @param Boolean(= true): stopPropagation
                     prevent) { // @param Boolean(= true): preventDefault
    stop    = stop    === _undef || !!stop;
    prevent = prevent === _undef || !!prevent;

//{@mb // [DOM STD]
    if (event.stopPropagation) {
//}@mb
        stop    && event.stopPropagation();
        prevent && event.preventDefault();
//{@mb
    } else {
        // [IE6][IE7][IE8]
        stop && (event.cancelBubble = _true);
        if (prevent) {
            event.returnValue  = _false;
            // [IE6][FIX]
//{@ie6
            if (_env.ie6 && (event.type === "mouseover" ||
                             event.type === "mouseout")) {
                event.returnValue = _true; // preventDefault
            }
//}@ie6
        }
    }
//}@mb
}

// uu.event.evaluator - get evaluator array
function uueventevaluator(node,          // @param Node:
                          exEventType) { // @param ExEventTypeString:
                                         // @return FunctionArray:
    var eventData = node[_datauu + "event"]; // node["data-uuevent"]

    return eventData &&
           eventData.e[exEventType] ? eventData.e[exEventType][_concat]()
                                    : [];
}

// uu.event.unbind - unbind event
function uueventunbind(node,          // @param Node/Window: target node
                       exEventType) { // @param ExEventTypeString(= void): namespace and event types, "click,click+,..."
                                      // @return Node:
    //  [1][unbind all]              uu.event.unbind(node) -> node
    //  [2][unbind some]             uu.event.unbind(node, "click+,dblclick") -> node
    //  [3][unbind namespace all]    uu.event.unbind(node, "namespace.*") -> node
    //  [4][unbind namespace some]   uu.event.unbind(node, "namespace.click+,namespace.dblclick") -> node

    var eventData = node[_datauu + "event"], ns, ary, ex, i = 0, c = ",";

    if (eventData) {
        exEventType = exEventType ? c + exEventType + c         // [2] ",click,"
                                  : node[_datauu + "event"].t; // [1] ",click,MyNamespace.mousemove+,"
        ary = exEventType[_replace](/^,|,$/g, "").split(c);

        for (; ex = ary[i++]; ) {
            if (ex.lastIndexOf(".*") > 1) { // [3] "namespace.*"
                ns = ex.slice(0, -1);       // "namespace.*" -> "namespace."
                uueach(ary, function(ex) {
                    if (!ex[_indexOf](ns)) {
                        uueach(eventData.c[ex], function(closure) {
                            uuevent(node, ex, closure, "", _true); // unbind
                        });
                    }
                });
            } else { // [2][4]
                if (exEventType[_indexOf](c + ex + c) >= 0 &&
                    eventData.c[ex] && eventData.c[ex].length) {
                    uueach(eventData.c[ex], function(closure) {
                        uuevent(node, ex, closure, "", _true); // unbind
                    });
                }
            }
        }
    }
    return node;
}

// uu.event.attach - attach event - Raw Level API wrapper
function uueventattach(node,         // @param Node/Window:
                       eventType,    // @param String: event type
                       evaluator,    // @param Function: evaluator
                       useCapture,   // @param Boolean(= false):
                       __detach__) { // @hidden Boolean(= false): true is detach
//{@eventhashchange
    function handleHashChange(evt) {
        var hash = location.hash;

        // expand event.uu.hash - Array: [oldHash, newHash]
        evt.uuoverride = {
            hash: [uu.dmz.location.hash,
                   hash === "#" ? "" : hash] // [IE6][IE7] last location.hash === "#"
        };
        uu.dmz.location.href = location.href;
        uu.dmz.location.hash = location.hash;
        evaluator(evt);
    }
//}@eventhashchange

//{@mb
    eventType = uuevent._.fix[eventType] || eventType;
//}@mb

    var /*{@mb*/factory, /*}@mb*/ callback = evaluator;

/* event log
    if (uu.ready.dom) {
        var fnguid;

        if (evaluator.fnguid) {
            fnguid = evaluator.fnguid;
        } else {
            evaluator.fnguid = uunumber();
            fnguid = evaluator.fnguid;
        }
        if (__detach__) {
            uulog("detach(" + eventType + ")" + fnguid);
        } else {
            uulog("attach(" + eventType + ")" + fnguid);
        }
    }
 */

    switch (eventType) {
//{@ie67
//{@eventhashchange
    case "hashchange":
//{@mb
        if ("onhashchange" in win) { // [IE8][IE9][Firefox3.6+][Opera10.70+][HTML5]
//}@mb
            callback = handleHashChange;
            break;
//{@mb
        }
        factory = _ie ? "HashChangeIE" : "HashChange";
        __detach__ ? uu(factory).fin()
                   : uu(factory, handleHashChange);
        return;
//}@mb
//}@eventhashchange
//}@ie67
    default:
    }

//{@mb
    if (node[_addEventListener]) {
//}@mb
        node[__detach__ ? "removeEventListener"
                        : _addEventListener](eventType, callback, !!useCapture);
//{@mb
    } else {
        node[__detach__ ? "detachEvent"
                        : "attachEvent"]("on" + eventType, callback);
    }
//}@mb
}

// uu.event.detach - detach event - Raw Level API wrapper
function uueventdetach(node,         // @param Node/Window:
                       eventType,    // @param String: event type
                       evaluator,    // @param Function: evaluator
                       useCapture) { // @param Boolean(= false):
    uueventattach(node, eventType, evaluator, useCapture, _true); // detach
}

//{@mb
//{@ie67
// [IE6][IE7] fake hashchange event. <iframe> impl.
uuClassSingleton("HashChangeIE", {
    hash: "",               // current location.hash
    trim: /^#/,             // trim "#"
    ident: "uuhashchange",  // iframe id
    iframe: null,           // <iframe id="uuhashchange">
    timerID: 0,             // interval timer id

    init: function(callback) { // @param CallbackFunction:
        function tick() {
            var ctx = uuid(that.ident).contentWindow.document,
                curt =     location.hash[_replace](trim, ""),
                prev = ctx.location.hash[_replace](trim, "");

            if (curt !== prev) {
                // [1] [<-] [->] back or forward button fired
                // [2] direct url input or jump from bookmark
                curt === that.hash ? (location.hash = that.hash = prev)  // [1]
                                   :     that.setHash(that.hash = curt); // [2]
                callback({ type: "hashchange" });
            }
        }

        var that = this, iframe = newNode("iframe"),
            trim = that.trim;

        //  <html></html>
        //  <iframe id="uuhashchange" style="display:none" src="javascript:void 0"></iframe>
        iframe.id = that.ident;
        iframe.style[_display] = "none";
        iframe.src = "javascript:void 0";
        htmlNode[_appendChild](iframe);

        that.iframe = iframe;
        that.hash = location.hash[_replace](trim, ""); // current location.hash
        that.setHash(that.hash);

        that.timerID = setInterval(tick, 100); // 100ms
    },
    fin: function() {
//{@assert
        if (!this.iframe) {
            uung("HashChangeIE.fin", "this.iframe in null");
        }
//}@assert
        if (this.iframe) {
            // clear interval timer
            if (this.timerID) {
                clearInterval(this.timerID);
                this.timerID = 0;
            }
            // remove <iframe> node
            uunoderemove(this.iframe);
            this.iframe = null;
        }
    },
    setHash: function(hash) { // @param String: "hash"
        var ctx = uuid(this.ident).contentWindow.document;

        ctx.open();
        ctx.close();
        ctx.location.hash = hash;
    }
});
//}@ie67
//}@mb

//{@mb
// [LEGACY] fake hashchange event.
uuClassSingleton("HashChange", {
    hash: "",   // current location.hash
    trim: /^#/, // trim "#"
    timerID: 0, // interval timer id

    init: function(callback) { // @param CallbackFunction:
        function tick() {
            var curt = location.hash[_replace](trim, ""),
                prev = that.hash;

            if (curt !== prev) {
                that.hash = curt;
                callback({ type: "hashchange" });
            }
        }

        var that = this, trim = that.trim;

        that.hash = location.hash[_replace](trim, ""); // current location.hash
        that.timerID = setInterval(tick, 100); // 100ms
    },
    fin: function() {
        // clear interval timer
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = 0;
        }
    }
});
//}@mb

// uu.event.one - one time event
function uueventone(node,        // @param Node: target node
                    exEventType, // @param ExEventTypeString: "click,..."
                    callback,    // @param CallbackFunction: callback(evt, times)
                    hint) {      // @param String(= "one"): code search hint
                                 // @return Node:
    return uueventcyclic(node, exEventType, callback, 1, 1, hint || "one");
}

// uu.event.key - get key and keyCode (cross browse keyCode)
function uueventkey(event) { // @param ExEvent:
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
function uueventedge(event) { // @param ExEvent:
                              // @return Hash: { x, y }
                              //     x - Number: fixed offsetX
                              //     y - Number: fixed offsetY
    // http://d.hatena.ne.jp/uupaa/20100430/1272561922
    var style =
//{@mb
                _ie ? null :
//}@mb
                             getComputedStyle(event.at, 0),
        x = event.offsetX || 0,
        y = event.offsetY || 0;

//{@mb
    if (_webkit) {
//}@mb
        x -= parseInt(style.borderTopWidth)  || 0; // "auto" -> 0
        y -= parseInt(style.borderLeftWidth) || 0;
//{@mb
    } else if (_opera) {
        x += parseInt(style.paddingTop)  || 0;
        y += parseInt(style.paddingLeft) || 0;
    } else if (_gecko || event.layer !== void 0) {
        x = (event.layerX || 0) - (parseInt(style.borderTopWidth)  || 0);
        y = (event.layerY || 0) - (parseInt(style.borderLeftWidth) || 0);
    }
//}@mb
    return { x: x, y: y };
}

//{@mb
//{@eventhover
// uu.event.hover - bind enter / leave event
function uueventhover(node,         // @param Node:
                      expr,         // @param CallbackFunction/ClassNameString: enter/leave-callback or toggle-className
                      hint,         // @param String(= void): code search hint
                      __unbind__) { // @hidden Boolean(= false): true is unbind
                                    // @return Node:

    //  [1][enter/leave callback] uu.event.hover(node, function callback(evt, isHover, node){ ... }) -> node
    //                                  hover event   -> callback(evt, true, node)
    //                                  unhover event -> callback(evt, false, node)
    //  [2][toggle className]     uu.event.hover(node, "hoverActionClass") -> node
    //                                  hover event   -> node.className += " hoverActionClass"
    //                                  unhover event -> node.className -= " hoverActionClass"

    function hoverEventClosure(evt) {
        if (toggle) {
            uuklass(node, "!" + expr); // uu.klass("!className") -> toggle className
        } else if (_ie) {
            // callback(evt:EventObject, isHover:Boolean, node:Node)
            expr(evt, evt.uu.code === uuevent.codes.mouseenter, node)
        } else {
            var rel = evt.relatedTarget;

            // ignode mouse transit(mouseover, mouseout) in child node
            if (node !== rel && !uuhas(node, rel)) {
                // callback(evt:EventObject, isHover:Boolean, node:Node)
                expr(evt, evt.uu.code === uuevent.codes.mouseover, node);
            }
        }
        uueventstop(evt);
    }

    var type = _ie ? "mouseenter,mouseleave"
                   : "mouseover+,mouseout+",
        toggle = isString(expr),
        dataset = "data-uueventhover",
        handler = node[dataset];   // node["data-uueventhover"]

    if (__unbind__) {
        uueventunbind(node, type, handler);
        node[dataset] = null;
        return node;
    }
    handler && uueventunbind(node, type, handler); // already bound? -> unbind -> rebind

    return uuevent(node, type, node[dataset] = hoverEventClosure, hint); // bind(rebind)
}

// uu.event.unhover - unbind hover event
function uueventunhover(node) { // @param Node:
                                // @return Node:

    //  [1][unbind] uu.event.unhover(node) -> node

    return uueventhover(node, "", "", _true); // unhover
}
//}@eventhover

//{@eventrollover
// uu.event.rollover - bind rollover action handler
function uueventrollover(node,   // @param NodeArray/Node:
                         roll) { // @param ClassNameString/CallbackFunction:
                                 // @return NodeArray:

    //  [1][bind rollover className] uu.event.rollover(uu.query("button"), "rollover") -> [<button>, ...]
    //                                  hover   -> node.className += " rollover"
    //                                  unhover -> node.className -= " rollover"
    //  [2][bind rollover handler]   uu.event.rollover(uu.query("button"),
    //                                           function callback(evt, isHover, node){...}) -> [<button>, ...]
    //                                  hover   -> callback(evt, true,  <button>)
    //                                  unhover -> callback(evt, false, <button>)

    var db = uueventrollover._,
        rv = node[_nodeType] ? [node] : node, // toArray
        i = 0, iz = rv.length;

    for (; i < iz; ++i) {
        uueventhover(rv[i], roll, "rollover"); // hint("rollover")
        db.node.push(rv[i]);
        db.roll.push(roll);
        db.disable.push(_false);
    }
    return rv;
}
// inner - rollover db
uueventrollover._ = {
    node: [],   // RolloverHandlerNodeArray: [Node, ...]
    roll: [],   // RolloverActionArray: [ClassNameString or CallbackFunction, ...]
    disable: [] // RolloverStateArray: [Boolean, ...]
};

// inner - rollover update state
function uueventrolloverupdate(enable) { // @param Boolean: true -> hover, false -> unhover
    var db = uueventrollover._,
        ary = db.node,
        i = 0, iz = ary.length,
        fn = enable ? uueventhover : uueventunhover;

    for (; i < iz; ++i) {
        if (enable === db.disable[i]) {
            fn(ary[i], db.roll[i], "rollover"); // bind / unbind
            db.disable[i] = !enable; // toggle state
        }
    }
}

// uu.rollover.enable
function uueventrolloverenable() {
    uueventrolloverupdate(_true);
}

// uu.rollover.disable
function uueventrolloverdisable() {
    uueventrolloverupdate(_false);
}

// uu.event.unrollover - unbind rollover handler
function uueventunrollover(node) { // @param NodeArray/Node(= void):
                                   // @return NodeArray:
    var db = uueventrollover._,
        rv = node ? (node[_nodeType] ? [node] : node) // toArray
                  : db.node[_concat](), // cloneArray
        i = 0, iz = rv.length, pos;

    for (; i < iz; ++i) {
        pos = db.node[_indexOf](rv[i]); // ECMA5 Array#indexOf
        if (pos >= 0) {
            uueventunhover(rv[i]);
            db.node.splice(pos, 1); // remove
            db.roll.splice(pos, 1);
            db.disable.splice(pos, 1);
        }
    }
    return rv;
}
//}@eventrollover
//}@mb

/* TODO: test
//{@eventscroll
// uu.event.scroll - bind scroll event
function uueventscroll(nameSpace,   // @param String: namespace
                       evaluator) { // @param CallbackFunction:

    //  [1][get scroll info] uu.event.scroll("myNameSpace", function(evt) { evt.uu.scroll })

    var vp = uuviewport(),
        opx = vp.pageXOffset,
        opy = vp.pageYOffset;

    uuevent(win, nameSpace + ".scroll", function(evt) {
        var vp = uuviewport(), dir = 0;
            sw = htmlNode.scrollWidth, sh = htmlNode.scrollHeight,
            iw = vp.innerWidth,  ih = vp.innerHeight,
            px = vp.pageXOffset, px = vp.pageYOffset,
            dx = Math.abs(opx - px),
            dy = Math.abs(opy - py);

        evt.uuoverride = {
            // scroll delta                                  ___________
            scrollDelta: Math.sqrt(dx * dx + dy * dy),  // v/ x^2 + y^2

            // scroll direction
            //
            //          1
            //       8     2
            //     7   (0)   3
            //       6     4
            //          5
            //
            scroll: (opx === px && opy === py) ? 0
                  : (opx === px && opy  >  py) ? 1
                  : (opx  <  px && opy  >  py) ? 2
                  : (opx  <  px && opy === py) ? 3
                  : (opx  <  px && opy  <  py) ? 4
                  : (opx === px && opy  <  py) ? 5
                  : (opx  >  px && opy  <  py) ? 6
                  : (opx  >  px && opy === py) ? 7 : 8
        };

        evaluator(evt);
    });
}

// uu.event.unscroll - unbind scroll event
function uueventscroll(nameSpace) { // @param String: namespace
    uueventunbind(win, nameSpace + ".scroll");
}
//}@eventscroll
 */

//{@eventcyclic
// uu.event.cyclic - bind cyclic event
function uueventcyclic(node,         // @param Node: target node
                       exEventType,  // @param ExEventTypeString: "click,..."
                       callback,     // @param CallbackFunction: callback(evt, times)
                       cyclic,       // @param Number: cyclic count
                       loop,         // @param Number(= 0): loops, zero is infinity
                       hint,         // @param String(= "cyclic"): code search hint
                       __unbind__) { // @hidden Boolean(= false): true is unbind
                                     // @return Node:
    function cyclicEventClosure(evt, rv) {
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
                         uueventunbind(node, exEventType, cyclicEventClosure)); // cancel & stop
        return rv;
    }

    var dataset = "data-uueventcyclic", data = node[dataset], count = 0;

    if (__unbind__) {
        uueventunbind(node, exEventType, data[exEventType]);
        data[exEventType] = null;
        return node;
    }
    data && data[exEventType] && uueventunbind(node, exEventType, data[exEventType]); // bound? -> unbind

    node[dataset] || (node[dataset] = {});
    node[dataset][exEventType] = cyclicEventClosure;
    return uuevent(node, exEventType, cyclicEventClosure, hint || "cyclic"); // bind(rebind)
}

// uu.event.uncyclic - unbind cyclic event
function uueventuncyclic(node,          // @param Node: target node
                         exEventType) { // @param ExEventTypeString: "click,..."
    return uueventcyclic(node, exEventType, 0, 0, 0, "", _true);
}
//}@eventcyclic

//{@eventresize
// uu.event.resize - bind resize event
function uueventresize(evaluator) { // @param CallbackFunction: callback function
    var db = uueventresize.db;

    if (!db.fn.length) { // init
//{@mb
        uueventresize.unsafe ? (db.vp = uuviewport(),
                                db.tm = setInterval(handleResizeAgent, db.delay)) : // [IE6][IE7][IE8]
//}@mb
                               uueventattach(win, "resize", handleResize); // [W3C]
    }
    db.fn.push(evaluator);
}
uueventresize.unsafe = _ie678; // [IE6][IE7][IE8]
uueventresize.db = {
    fn:     [],
    tm:     0,  // setInterval timer id
    lock:   0,
    delay:  uueventresize.unsafe ? 100 : 40  // 100ms(unsafe) or 40ms(safe)
};

// uu.event.unresize - unbind resize event
function uueventunresize() {
    var db = uueventresize.db;

    db.fn = [];
//{@mb
    uueventresize.unsafe ? (db.tm && (clearInterval(db.tm), db.tm = 0)) : // [IE6][IE7][IE8]
//}@mb
                           uueventdetach(win, "resize", handleResize); // [W3C]
    db.lock = 0;
}

// inner - resize event handler
function handleResize(event) {
    var db = uueventresize.db,
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
//{@mb
function handleResizeAgent() {
    var db = uueventresize.db, i = 0, iz, vp,
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
//}@mb
//}@eventresize

// --- LIVE EVENT ---
//{@live

// uu.event.live - bind live event
function uulive(expr,        // @param CSSSelectorExpressionString "css > selector"
                exEventType, // @param ExEventTypeString: "nameSpace.click"
                evaluator,   // @param CallbackFunction/Instance: callback function
                hint,        // @param String(= void): code search hint
                __data__) {  // @hidden Hash: data for recursive call

    //  [1][bind] uu.live("css > selector", "nameSpace.click", callback)

//{@debug
    uutrace(arguments.callee, arguments.length, expr, exEventType, evaluator, hint);
//}@debug
//{@assert
    switch (uutype(hint)) {
    case uutype.STRING:
    case uutype.UNDEFINED: break;
    default: uung("uu.event", hint);
    }
//}@assert

    function _liveClosure(event) { // @param EventObject:
        var fullcode = uuevent.codes[event.type] || 0, node,
            tgt = event.target
/*{@mb*/                       || event.srcElement || doc; /*}@mb*/

        node = (tgt[_nodeType] === Node.TEXT_NODE) ? tgt[_parentNode] : tgt;

        if (uumatch(expr, node)) {
            event.uu = {
                at:     node,
                ns:     ns,
                code:   fullcode & 0xff, // half code
                live:   _true,
                node:   node,
                hint:   hint,
                mouse:  event.button || 0,
                touch:  fullcode & 0x0200,
                gesture:fullcode & 0x0400
            };
            event.uuoverride && uumix(event.uu, event.uuoverride);

//{@mb
            if (_ie678) {
                if (!event.target) { // [IE6][IE7][IE8]
                    event.currentTarget = doc;
                }
                switch (event.code) {
                case uuevent.codes.mousedown:
                case uuevent.codes.mouseup:
                    event.uu.mouse = (event.button & 1) ? 0
                                   : (event.button & 2) ? 2 : 1;
                    break;
                case uuevent.codes.contextmenu:
                    event.uu.mouse = 2;
                    break;
                case uuevent.codes.mouseover:
                case uuevent.codes.mouseout:
                    event.relatedTarget = tgt === event.fromElement
                                        ? event.toElement
                                        : event.fromElement;
                }
                if (event.pageX === void 0) { // [IE6][IE7][IE8]
                    event.pageX = event.clientX + (htmlNode.scrollLeft || 0);
                    event.pageY = event.clientY + (htmlNode.scrollTop  || 0);
                }
            }
//}@mb
            if (event.uu.code === uuevent.codes.mousewheel) {
                event.uu.wheel = (/*{@mb*/ event.detail ? event.detail : /*}@mb*/
                                 (event.wheelDelta / -120)) | 0;
            }
            instance ? handler.call(evaluator, event)
                     : evaluator(event);
        }
    }

    var instance = 0,
        handler = isFunction(evaluator) ? evaluator
                                        : (instance = 1, evaluator.handleEvent),
        // split token (ignore capture[+])
        //      "nameSpace.click+"
        //              v
        //      ["nameSpace.click+", "nameSpace", "click", "+"]
        token     = uuevent._.parse.exec(exEventType),
        ns        = token[1], // "nameSpace"
        eventType = token[2], // "click"
        capture   = 0,        // not capture
        fixEventType = uulive.fix[eventType] || eventType;

    evaluator.liveClosure = _liveClosure;

    __data__ || (__data__ = uulive.db[expr + "\v" + exEventType] = {
        s: expr,
        ns: ns,
        ex: exEventType,
        unbind: []
    });

//{@mb
    if (_gecko) {
        if (eventType === "focus" || eventType === "blur") {
            capture = 1;
        }
    }
//}@mb

    __data__.unbind.push(function() {
        uueventdetach(doc, fixEventType, _liveClosure, capture);
    });
    uueventattach(doc, fixEventType, _liveClosure, capture);

//{@mb
    if (_ie) {
        if (/submit$/.test(eventType)) {
            uulive(expr + " input[type=submit]," +
                   expr + " input[type=image]",
                   exEventType[_replace](/submit$/, "click"),
                   evaluator,
                   hint,
                   __data__);

        } else if (/change$/.test(eventType)) { // "change"
            uulive(expr,
                   exEventType[_replace](/change$/, "focus"),
                   function(event) {
                       uuevent(event.srcElement, "uulive.change", evaluator);
                   },
                   hint,
                   __data__);

            uulive(expr,
                   exEventType[_replace](/change$/, "blur"),
                   function(event) {
                       uueventunbind(event.srcElement, "uulive.change");
                   },
                   hint,
                   __data__);
        }
    }
//}@mb
}
uulive.db = {}; // { "expr\vnameSpace.click": {...}, ... }
uulive.fix =
//{@mb
             _ie ? { focus: "focusin", blur: "focusout" } :
//}@mb
             _webkit ? { focus: "DOMFocusIn", blur: "DOMFocusOut" } : {};

// uu.live.has - has live event
function uulivehas(expr,          // @param CSSSelectorExpressionString: "css > selector"
                   exEventType) { // @param ExEventTypeString: "nameSpace.click"
    var db = uulive.db[expr + "\v" + exEventType];

    return db && expr === db.s && exEventType === db.ex;
}

// uu.unlive - unbind live event
function uuunlive(expr,          // @param CSSSelectorExpressionString(= void 0): "css > selector"
                  exEventType) { // @param String(= void 0): "nameSpace.click"
    function run(fn) {
        fn();
    }
    var db = uulive.db,
        ns, data, i, unbind,
        mode = !expr    ? 1 : // [1]
               !exEventType ? 2 : // [2]
               exEventType[_indexOf]("*") < 0 ? 3 :  // [3][5]
               (ns = exEventType.slice(0, -2), 4); // [4] "nameSpace.*" -> "nameSpace"

    for (i in db) { // i = "expr\vnameSpace.click"
        data = db[i]; // data = { s:expr, ns:ns, ex:exEventType, unbind:[closure] }
        unbind = 1;
        switch (mode) {
        case 2: unbind = expr === data.s; break; // [2]
        case 3: unbind = expr === data.s && exEventType === data.ex; break; // [3][5]
        case 4: unbind = expr === data.s && ns === data.ns; // [4]
        }
        if (unbind) {
            uueach(data.unbind, run);
            delete db[i];
        }
    }
}
//}@live

// uu.junction - create async event junction
function uujunction(race,       // @param Number: race conditions
                    items,      // @param Number: items
                    callback) { // @param CallbackFunction(= void): callback(response)
                                //    response.rv - Array: result value. [value, ...]
                                //    response.ok - Boolean: true is pass
                                // @throws Error("JUNCTION...")
    //  [1][some  1/3] uu.junction(1, 3, callback).ng(1).ng(2).ok(3)      -> callback({ rv: [1, 2, 3], ok: true })
    //  [2][some  2/3] uu.junction(2, 3, callback).ng(1).ng(2).ok(3)      -> callback({ rv: [1, 2, 3], ok: false })
    //  [3][some  2/3] uu.junction(2, 3, callback).ok(1).ng(2).ok( )      -> callback({ rv: [1, 2, undefined], ok: true })
    //  [4][every 3/3] uu.junction(3, 3, callback).ok(1).ok(2).ok({id:3}) -> callback({ rv: [1, 2, {id:3}], ok: true })

    return new uuClass["Junction"](race, items, callback);
}

// uu.Class.Junction.init
function JunctionInit(race, items, callback) {
    this.db = { ok: 0, ng: 0, race: race, items: items,
                values: [], callback: callback };
    if (!race || !items || race > items) {
        throw new Error(uustringformat("JUNCTION @ @", race, items));
    }
}

// uu.Class.Junction.ok
function JunctionOK(value) { // @param Mix(= void): value
    ++this.db.ok;
    this.db.values.push(value);
    return this.judge();
}

// uu.Class.Junction.ng
function JunctionNG(value) { // @param Mix(= void): value
    ++this.db.ng;
    this.db.values.push(value);
    return this.judge();
}

// uu.Class.Junction.judge
function JunctionJudge() {
    var db = this.db;

    if (db.callback) {
        if (db.ok           >= db.race  || // 4     >= 4
            db.ng + db.race >  db.items || // 2 + 3 >  4
            db.ok + db.ng   >= db.items) { // 2 + 2 >= 4

            db.callback({ rv: db.values, ok: db.ok >= db.race }); // callback({ rv: [], ok: bool })
            db.callback = null;
        }
    }
    return this;
}

// --- node ---

// uu.node - node builder
function uunode(node,   // @param Node/TagNameString: Node or TagName, eg: <div>, "div"
                args) { // @param Array/Arguments(= void): [Node/String/Number/Hash/null, ...]
                        // @return Node:

    //  [1][Node]               uu.div(uu.p())                          -> <div><p></p></div>
    //  [2][TextNode]           uu.div(uu.text("hello"))                -> <div>hello</div>
    //  [3][TextNode]           uu.div("hello")                         -> <div>hello</div>
    //  [4][TextNode atmark]    uu.div("format @ @", "hello", "world")  -> <div>format hello world</div>
    //  [5][attr]               uu.div("id:a,class:hello")              -> <div id="a" class="hello"></div>
    //  [6][attr]               uu.div({id:"a","class":"hello"})        -> <div id="a" class="hello"></div>
    //  [7][attr atmark]        uu.div("id:@", "a")                     -> <div id="a"></div>
    //  [8][css]                uu.div(null, "color:red;float:left")    -> <div style="color:red;float:left"></div>
    //  [9][css]                uu.div(null, {color:"red",float:"left"})-> <div style="color:red;float:left"></div>
    //  [10][css atmark]        uu.div(null, "color:@", "red")          -> <div style="color:red"></div>
    //  [11][complex]           uu.div("id:@", "a", {color:"red"}, "@ @", "hello", "world")
    //                                                                  -> <div id="a" style="color:red">hello world</div>

    node.nodeType || (node = newNode(node)); // "div" -> <div>

    if (args) {
        var arg, i = 0, iz = args.length, token = 0, match, type,
            split = uunode._.split, at = uunode._.at;

        for (; i < iz; ++i) {
            arg = args[i];
            type = arg == null ? 0 // null or undefined
                 : arg.nodeType ? 1 // Node
                 : typeof arg === "string" ? 2 : 3;

            switch (type) {
            case 0: ++token; break; // skip
            case 1: node.appendChild(arg); break; // arg is Node -> appendChild(node)
            case 2:
                // uu.node("id:@", "a")     -> uu.node(uu.string.format("id:@", "a"))
                // uu.node("@ @", "a", "b") -> uu.node(uu.string.format("@ @", "a", "b"))
                if (arg.indexOf("@") >= 0) {
                    match = arg.match(at).length;
                    arg = uustringformat(uuarray(args, i, i + match + 1));
                    i += match; // skip args
                }
                if (!split.test(arg)) { // uu.node("text") -> uu.node(uu.text("text"))
                    node.appendChild(newText(arg));
                    break;
                }
            case 3: // uu.node({id:"a"},{color:"red"}) -> uu.attr({id:"a"}), uu.css({color:"red"})
                    // uu.node("id:a","color:red")     -> uu.attr({id:"a"}), uu.css({color:"red"})
                switch (token++) {
                case 0: uuattr(node, type === 2 ? uuhash(arg, split) : arg); break;
                case 1:  uucss(node, type === 2 ? uuhash(arg, split) : arg); break;
                default: uung("uu.node", arg);
                }
            }
        }
    }
    return node;
}
uunode._ = {
    split:  /[,;:]/,    // split text
    at:     /@/g        // at mark count
};

// HTML4(a ~ ul) exclude <html><head><body>
uutag.html4 = "a,b,br,button,dd,div,dl,dt,form,h1,h2,h3,h4,h5,h6,hr,i,img," +
              "iframe,input,li,ol,option,p,pre,select,span,table,tbody,tr," +
              "td,th,thead,tfoot,textarea,u,ul";
// HTML5(abbr ~ video)
uutag.html5 = "abbr,article,aside,audio,canvas,datalist," +
              "details,eventsource,figure,footer,header,hgroup," +
              "mark,menu,meter,nav,output,progress,section,time,video";

// inner - setup node builder - uu.div(), uu.a(), ...
uueach((uutag.html4 + "," + uutag.html5).split(","), function(tag) {
    uu[tag] || (uu[tag] = function() { // @param Mix: var_args
        return uunode(tag, arguments);
    });
});

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
    return arguments.length ? uunode(doc.head, arguments) : doc.head;
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
    return arguments.length ? uunode(doc.body, arguments) : doc.body;
}

// uu.style
function uustyle(css) { // @param CSSString:
    return uunodebulk("<style>" + css + "</style>");
}

// uu.node.add - add/insert node
function uunodeadd(source,     // @param Node/NodeArray/DocumentFragment/HTMLFragmentString/TagName(= "div"):
                   context,    // @param Node(= <body>): add to context
                   position) { // @param Number/String(= "./last"): insert position
                               // @return Node: node
    //  [1][add div node to body]     uu.node.add()         -> <div />  (div.parentNode = <body>)
    //  [2][add p tag to body]        uu.node.add("p")      -> <p />    (p.parentNode = <body>)
    //  [3][add Node to body]         uu.node.add(uu.div()) -> <div />  (div.parentNode = <body>)
    //  [4][add NodeArray to context] uu.node.add([<link>, <link>], document.head) -> <link/> (link.parentNode = <head>)
    //  [5][add HTMLFragmentString]   uu.node.add("<div><p>txt</p></div>") -> <div> (div.parentNode = <body>)
    //  [6][add DocumentFragment]     uu.node.add(DocumentFragment)        -> <?>
    //  [7][insert tr and tds]        uu.node.add(uu.tr(uu.td("A"), uu.td("B")), uu.id("ctx"), "prev") -> <tr>
    //              <table>
    //                  <tr id="ctx"><td>C></td><td>D</td></tr>
    //              </table>
    //                     v
    //              <table>
    //                  <tr><td>A></td><td>B</td></tr>
    //                  <tr id="ctx"><td>C></td><td>D</td></tr>
    //              </table>

    context = context || doc.body;

    var nodes = !source ? [newNode()]        // [1] uu.node.add()
              : isArray(source) ? source     // [4] uu.node.add([<div>, <div>])
              : source[_nodeType] ? [source] // [3][6] uu.node.add(Node or DocumentFragment)
              : !source[_indexOf]("<") ? [uunodebulk(source)]
                                             // [5] uu.node.add(HTMLFragmentString)
              : [newNode(source)],           // [2] uu.node.add("p")
        reference = null, i = 0, iz = nodes.length, node, rv,
        parent = context[_parentNode], pos;

    rv = (nodes[0][_nodeType] === Node.DOCUMENT_FRAGMENT_NODE)
       ? nodes[0][_firstChild]
       : nodes[0];

    if (isNumber(position)) {
        reference = parent.children[position] || null; // [Firefox3.5+] Element.children
        for (; i < iz; ++i) {
            parent.insertBefore(nodes[i], reference);
        }
    } else {
        pos = position || "./last";
        (pos === "first" || pos === "./first") && nodes.reverse();

        for (; i < iz; ++i) {
            node = nodes[i];

            switch (pos) {
            case "first":   reference = parent[_firstChild];
            case "prev":    reference || (reference = context);
            case "next":    reference || (reference = context[_nextSibling]);
            case "last":    parent.insertBefore(node, reference); break;
            case "./first": reference = context[_firstChild];
            case "./last":  context.insertBefore(node, reference);
            }
        }
    }
    return rv;
}

// uu.nodeid - Node <-> NodeID
function uunodeid(ident) { // @param Node/Number: Node or NodeID
                           // @return Number/Node: NodeID, from 1

    //  [1][get NodeID by Node]  uu.nodeid(Node)   -> NodeID
    //  [2][get Node by NodeID]  uu.nodeid(NodeID) -> Node

    var id, data = _datauu + "nodeid"; // node["data-uunodeid"]

    return ident[_nodeType] ? (ident[data] || (_nodeiddb[id = ++_nodeidnum] = ident,
                                               ident[data] = id))
                            : _nodeiddb[ident];
}

// inner - prebuild nodeid
uuready("dom:2", function() {
    var nodeList = uutag("", htmlNode), v, i = 0;

    uunodeid(htmlNode);
    for (; v = nodeList[i++]; ) {
        uunodeid(v);
    }
});

// uu.nodeid.remove - remove NodeID
function uunodeidremove(nodeid) { // @param Number: NodeID
    var node = _nodeiddb[nodeid];

    node && (_nodeiddb[nodeid] = node[_datauu + "nodeid"] = 0); // node["data-uunodeid"]
}

// uu.node.bulk - convert HTMLString into DocumentFragment
function uunodebulk(source) { // @param Node/HTMLFragmentString: source
                              // @return Node/DocumentFragment:
    //  [1][clone]                         uu.node.bulk(Node) -> Node
    //  [2][build]                         uu.node.bulk("<p>html</p>") -> DocumentFragment
    //  [3][TableHTMLFragment unsupported] uu.node.bulk("<tr>...</tr>") -> throw Error, use insertRow()
    //  [4][TableHTMLFragment unsupported] uu.node.bulk("<td>...</td>") -> throw Error, use insertCell()


    var rv = doc.createDocumentFragment(),
        fragment = source.nodeType ? source.outerHTML // [1] node
                                   : source,          // [2] "<p>html</p>"
        placeholder = doc.createElement("div");

//{@assert
    // bad case
    //      "<tr>...</tr>"
    //      "<td>...</td>"
    if (!fragment.indexOf("<tr") || !fragment.indexOf("<td")) {
        uung("uu.node.bulk", fragment);
    }
//}@assert

//{@mb
    if (_ie678) {
        // [IE][FIX] node.innerHTML = "<style></style>" neglect
        // http://twitter.com/uupaa/status/20443869519
        // [IE6][IE7][IE8][FIX] HTML5 tag + innerHTML bug
        // http://d.hatena.ne.jp/uupaa/20110207

        placeholder.style.display = "none";
        doc.body.appendChild(placeholder);

        placeholder.innerHTML = "*<div>" + fragment + "</div>"; // wrap
        doc.body.removeChild(placeholder);

        placeholder = placeholder.lastChild; // unwrap
    } else {
//}@mb
        placeholder.innerHTML = fragment;
//{@mb
    }
//}@mb

    while (placeholder[_firstChild]) {
        rv[_appendChild](placeholder[_firstChild]);
    }

//{@assert judge result type
    if (isNode(rv) && rv.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        ;
    } else {
        uung("uu.node.bulk", fragment);
    }
//}@assert
    return rv;
}

// uu.node.glue - temporarily glued to <body>
function uunodeglue(node,       // @param Node/String: Node or HTMLFragmentString
                    callback) { // @param CallbackFunction: callback(Node)
                                // @return Node: node
    var div;

    node = isString(node) ? uunodebulk(node) : node;

    uu.body(div = uu.div(null, "position:absolute;top:-9999px;left:-9999px;" +
                               "margin:0;padding:0;border:0 none", node));
    callback(div.firstChild);
    doc.body[_removeChild](div);
    return div.firstChild;
}

// uu.node.path - get CSSQueryString fro node
function uunodepath(node) {  // @param Node: ELEMENT_NODE
                             // @return CSSQueryString: "body>div:nth-child(5)
    var rv = [], n = node, idx;

    while (n && n[_nodeType] === Node.ELEMENT_NODE) {
        if (uunodepath.vip.test(n[_tagName])) {
            rv.push(n[_tagName]);
            break;
        } else {
            idx = "";
            if (n[_parentNode]) {
                idx = (uunodebros(n).length < 2
                    ? ""
                    : ":nth-child(" + (uunodebros(n).index + 1) + ")");
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
                               // @return Hash: { sort, dup }
                               //   sort - Array: SortedNodeArray
                               //   dup  - Array: DuplicatedNodeArray

    //  [1][sort] uu.node.sort([<body>, <html>, <body>], document) -> { sort: [<html>, <body>], dup: [<body>] }

    var rv = [], ri = -1, i = 0, iz = ary.length, hash = { length: iz },
        idx, min = 0xfffffff, max = 0, node, dups = [], di = -1,
        all = /*{@mb*/ _ie ? 0 : /*}@mb*/
                       uutag("", context || doc.body);

    for (; i < iz; ++i) {
        node = ary[i];
        idx = /*{@mb*/ _ie ? node.sourceIndex : /*}@mb*/
                       all[_indexOf](node);
        min > idx && (min = idx);
        max < idx && (max = idx);
        hash[idx] ? (dups[++di] = node) : (hash[idx] = node); // judge duplicate
    }
    for (i = min; i <= max; ++i) {
        (node = hash[i]) && (rv[++ri] = node);
    }
    return { sort: rv, dup: dups };
}

// uu.node.swap - swap node
function uunodeswap(swapout,  // @param Node: swapout
                    swapin) { // @param Node: swapin
                              // @return Node: swapout
    return swapout[_parentNode].replaceChild(swapin, swapout);
}

// uu.node.wrap - wrapper
function uunodewrap(innerNode,   // @param Node: inner node
                    outerNode) { // @param Node: wrapper, outer node
                                 // @return Node: innerNode
    //  [1][wrap] uu.node.wrap(<span>target</span>, <p>)
    //            <span>target</span>  ->  <p><span>target</span></p>

    return outerNode[_appendChild](uunodeswap(innerNode, outerNode));
}

// uu.node.bros - collection brothers(siblings)
function uunodebros(node) { // @param Node: needle
                            // @return NodeArray+Hash: [node, ...] + { first, prev, next, last, index }
                            //      first - Node/null: firstElementSibling
                            //      prev  - Node/null: previousElementSibling
                            //      next  - Node/null: nextElementSibling
                            //      last  - Node/null: lastElementSibling
                            //      index - Number: position index or -1 (TEXT_NODE or COMMENT_NODE)
    var rv = [], i = 0, first = null, last = null, index = -1,
        n = node[_parentNode][_firstChild];

    for (; n; n = n[_nextSibling]) {
        if (n[_nodeType] === Node.ELEMENT_NODE) {
            rv.push(last = n);
            first || (first = n);
            n === node && (index = i); // found index
            ++i;
        }
    }
    // add property
    rv.first = first;
    rv.prev  = rv[index - 1] || null;
    rv.next  = rv[index + 1] || null;
    rv.last  = last;
    rv.index = index;
    return rv;
}

// uu.node.clear - clear all children
function uunodeclear(parent) { // @param Node: parent node
                               // @return Node: parent

    //  [1][clear children]      uu.node.clear(<body>)

    if (parent) {
        var rv = uutag("", parent), v, i = 0;

        for (; v = rv[i++]; ) {
            uunodeidremove(v);
            uueventunbind(v);
        }
        while (parent[_lastChild]) {
            parent[_removeChild](parent[_lastChild]);
        }
    }
    return parent;
}

// uu.node.clone - clone node, clone Attribute, NodeData, DOM Events
function uunodeclone(parent,  // @param Node: parent node (ElementNode)
                     quick) { // @param Boolean(= false): true is quick clone
                              // @return Node: cloned node
    function cloneData(source,   // @param Node: source node
                       cloned) { // @param Node: cloned node
        var key, i, iz,
            handler = uudata.handler,
            checked = "checked",
            selected = "selected",
            eventData = source[_datauu + "event"], // node["data-uuevent"]
            evaluator = eventData ? eventData.e : {};

        // new nodeid
//{@mb
        ready.data && (cloned[_datauu + "nodeid"] = 0); // node["data-uunodeid"] reset
//}@mb
        uunodeid(cloned);

        // bind event
        for (key in evaluator) { // key = exEventType
            for (i = 0, iz = evaluator[key].length; i < iz; ++i) {
                uuevent(cloned, key, evaluator[key][i]);
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

//{@mb
    function reverseFetch(nodeArray) { // [IE]
        var i = 0, nodeid, cloned;

        for (; cloned = nodeArray[i++]; ) {
            (nodeid = cloned[_datauu + "nodeid"]) &&
                cloneData(uunodeid(+nodeid), cloned); // NodeID -> Node
        }
    }
//}@mb

    function drillDown(node, cloned) { // recursive
        for (; node; node = node[_nextSibling], cloned = cloned[_nextSibling]) {
            if (node[_nodeType] === Node.ELEMENT_NODE) {
                cloneData(node, cloned);
                drillDown(node[_firstChild], cloned[_firstChild]);
            }
        }
    }

    var cloneNode = "cloneNode",
//{@mb
        ready = uuready[cloneNode],
//}@mb
        rv;

//{@mb
    if (parent[_nodeType] === Node.ELEMENT_NODE) {
        if (ready.event || ready.data) { // [IE] cloneNode bugfix
            rv = newNode();
            rv.innerHTML = parent[cloneNode](_true).outerHTML;
            quick ? (rv = rv[_firstChild]) : reverseFetch(uutag("", rv));
        } else {
//}@mb
            rv = parent[cloneNode](_true);
            if (!quick) {
                cloneData(parent, rv);
                drillDown(parent[_firstChild], rv[_firstChild]);
            }
//{@mb
        }
    }
//}@mb
    return rv;
}

// uu.node.remove - remove node, and NodeID, nodeData Events
function uunoderemove(node,        // @param Node:
                      removeAll) { // @param Boolean(= false): remove, NodeID, nodeData, events
                                   // @return Node: node
    if (removeAll) {
        uueventunbind(node);  // unbind event
        uunodeidremove(node); // remove nodeid

        // extras data handler
        var data, handler = uudata.handler;

        for (data in handler) {
            node[data] && handler[data](node, data, "removeNode");
        }
    }
    node[_parentNode] && node[_parentNode][_removeChild](node);
    return node;
}

// uu.node.normalize - remove CRLF/blank-text/white-space/comment nodes
function uunodenormalize(parent, // @param Node(= <body>): parent node
                         max) {  // @param Number(= 0): max depth, 0 is infinity
                                 // @return Number: removed node count
    // markup blank and comment nodes
    function markup(node, dig, n) {
        for (n = node[_firstChild]; n; n = n[_nextSibling]) {
            switch (n[_nodeType]) {
            case Node.ELEMENT_NODE:
                    (dig + 1 < max) && markup(n, dig + 1); // recursive
                    break;
            case Node.TEXT_NODE:
                    if (KEEP.test(n.nodeValue)) {
                        break;
                    }
            case Node.COMMENT_NODE:
                    nodeArray.push(n);
            }
        }
    }

    max = max || 9999; // max 9999 nest
    var nodeArray = [], node, i = 0, KEEP = /\S/;

    markup(parent || doc.body, 0);
    for (; node = nodeArray[i++]; ) {
        node[_parentNode][_removeChild](node); // remove
    }
    return nodeArray.length;
}

// uu.text - node.text / node.innerText accessor
function uutext(data,             // @param String/FormatString/Node: "string" or "format @ string" or node
                text              // @param String/Mix(= void): "textContent"
                /* var_args */) { // @param Mix(= void):
                                  // @return String/Node:
    //  [1][create text node]          uu.text("text")          -> createTextNode("text")
    //  [2][create formated text node] uu.text("@ @", "a", "b") -> createTextNode("a b")
    //  [3][get text]                  uu.text(node)            -> "text"
    //  [4][set text]                  uu.text(node, "text")    -> node
    //  [5][set formated text]         uu.text(node, "@", "a")  -> node

    var args = arguments, az = args.length, undef;

    if (isString(data)) {
        return newText(az < 2 ? data // [1]
                              : uustringformat.apply(this, args)); // [2]
    }
    if (text === undef) { // [3]
//{@mb
        if (_ie678) { // [IE6][IE7][IE8]
            return data.innerText;
        }
//}@mb
        return data.textContent; // [WEB STD][IE9]
    }
    uunodeadd(newText(az < 3 ? text // [4]
                             : uustringformat.apply(this, uuarray(args, 1))), // [5]
              uunodeclear(data));
    return data;
}

//{@form
// uu.form - create <form> node
function uuform(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <form> node
    return uunode("form", arguments);
}

// uu.form.serialize
function uuformserialize(node,    // @param Node: <form>
                         toHash,  // @param Boolean(= false): true is toHash, false is toString
                         joint) { // @param String(= uu.config.queryJoint): ";" or "&" or "&amp;"
                                  // @return URLEncodedQueryString/Hash:
    var rv = {},
        ary = uuquery("input,textarea,select,button"),
        ident, v, i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        v = ary[i];
        ident = v.name || v.id; // <input name="..."> or <input id="...">
        if (ident) {
            rv[ident] = uuformvalue(v); // "value" or ["value", ...]

            // <input type="image">
            if (v.type === "image") {
                rv[ident + ".y"] = rv[ident + ".x"] = 1; // [IE][PHP][FIX]
            }
        }
    }
    return toHash ? rv : uuurlquery(rv, 0, joint || uuconfig.queryJoint);
}

// uu.form.value - form node.value accessor
function uuformvalue(node,    // @param Node:
                     value) { // @param String(= void 0):
                              // @return String/Node:
    //  [1][get value]            uu.form.value(node) -> value or [value, ...]
    //  [2][set value]            uu.form.value(node, "value") -> node
    //  [3][get <textarea>]       uu.form.value(node) -> textarea.textContent
    //  [4][get <button>]         uu.form.value(node) -> <button>.value
    //  [5][get <option>]         uu.form.value(node) -> <option>.value or
    //                                                   <option>.textContent
    //  [6][get <selet>]          uu.form.value(node) -> selected <option>.value
    //  [7][get <selet multiple>] uu.form.value(node) -> ["value", ...]
    //  [8][get <input checkbox>] uu.form.value(node) -> ["value", ...]
    //  [9][get <input radio>]    uu.form.value(node) -> "value"

    //
    //  type
    //      0: <textarea> <input type="button"> <input type="image"> ...
    //      2: <select>
    //      3: <select multiple>
    //      4: <input type="radio">
    //      5: <input type="checkbox">
    //
    var type = {
            select: node.multiple ? 3 : 2,
            input: { radio: 4, checkbox: 5 }[node.type] || 0
        }[node[_tagName][_toLowerCase]()] || 0,
        ary = type & 2 ? node.options
                       : uuarray(node.name ? doc.getElementsByName(node.name)
                                           : node);

    return (value ? setNodeValue : getNodeValue)(node, type, ary, value);
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
                for (; v = ary[i++]; ) {
                    v.selected && rv.push(v.value || v.text);
                    if (!multi) { // <select>
                        break;
                    }
                }
            }
        } else if (type & 4) { // 4:<input type="radio">, 5:<input type="checkbox">
            for (; v = ary[i++]; ) {
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
                for (; v = ary[k++]; ) {
                    v[prop] = _false; // reset current state
                }
            }
            for (; v = ary[i++]; ) {
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
//}@form

// --- QUERY ---
// uu.query - as document.querySelectorAll
function uuquery(expr,      // @param CSSSelectorExpressionString: "css > selector"
                 context) { // @param Node(= <body>): query context
                            // @return NodeArray: [Node, ...]
    context = context || doc.body || doc;

//{@mb
    if (context.querySelectorAll) {
        if (!_ie || (_env.ie8 && expr[_indexOf](":") < 0)
                 || (_env.ie8 && uuquery.ie8ready.test(expr))) { // IE8 unsupported CSS3 pseudo-class
            if (!uuquery.extras.test(expr)) {
//}@mb
                // [IE8][IE9]
                return fakeToArray(context.querySelectorAll(expr));
//{@mb
            }
        }
    }

    var token = _tokenCache[expr] || (_tokenCache[expr] = uuquery.tokenizer(expr));

    return token.err ? [] : uuquery.selector(token, context);
//}@mb
}
//{@mb
// CSS3 Selector Browser Implementation
//      Google("CSS Compatibility and Internet Explorer")
//          -> http://msdn.microsoft.com/en-us/library/cc351024(v=vs.85).aspx
uuquery.extras = /\!\=|\:con/;                      // [IE8] Extras function "E[Attr!=Val]", "E:contains(...)"
uuquery.ie8ready = /:(?:focus|hover|link|visited)/; // [IE8] IE8 Unsupported CSS3 pseudo-class
//}@mb

// uu.id - as document.getElementById
function uuid(expr,      // @param String: id
              context) { // @param Node(= document): query context
                         // @return Node/null:
    return (context || doc).getElementById(expr);
}

// uu.idc - document.getElementById + cache
function uuidc(expr,      // @param String(= void): id
               context) { // @param Node(= document): query context
                          // @return Node/null:
    //  [1][find #id]             uu.idc("id") -> Node
    //  [2][find #id with cache]  uu.idc("id") -> Node(cached) so quickly
    //  [3][clear cache]          uu.idc()     -> null
    return !expr ? (uuidc._ = {}, null)
                 : (uuidc._[expr] ||
                    (uuidc._[expr] = (context || doc).getElementById(expr)));
}
uuidc._ = {};

// uu.ids - multiple uu.id
function uuids(expr,      // @param CommaJointString: "id1,id2,..."
               context) { // @param Node(= document): query context
                          // @return Node/null:
    //  [1][has all]  uu.ids("A,B,C")         -> [<a id="A">, <li id="B">, <div id="C">]
    //  [2][skip one] uu.ids("A,NONEEXIST,C") -> [<a id="A">, <div id="C">]

    var rv = [], ary = expr.trim().split(uuids._), i = 0, iz = ary.length,
        ctx = context || doc, node;

    for (; i < iz; ++i) {
        node = ctx.getElementById(ary[i]);
        node && rv.push(node); // nonexistent node skips
    }
    return rv;
}
uuids._ = /\s*,\s*/; // split

// uu.tag - as document.getElementsByTaName
function uutag(expr,      // @param String(= ""): tag name, "" is all
               context) { // @param Node(= <body>): query context
                          // @return NodeArray: [Node, ...]
//{@mb
    if (!_ie678) { // [WEB STD][IE9]
//}@mb
        return toArray.call((context || doc.body || doc).getElementsByTagName(expr || "*"));
//{@mb
    }

    // [IE6][IE7][IE8]
    var rv = [], ri = -1, v, i = 0, skip = (!expr || expr === "*"),
        nodeList = (context || doc.body || doc).getElementsByTagName(expr || "*"),
        iz = nodeList.length;

    // [IE] getElementsByTagName("*") has comment nodes
    for (; i < iz; ++i) {
        v = nodeList[i];
        if (!skip || v[_nodeType] === Node.ELEMENT_NODE) {
            rv[++ri] = v;
        }
    }
    return rv;
//}@mb
}

// uu.match - as document.matchesSelector
function uumatch(expr,      // @param CSSSelectorExpressionString: "css > selector"
                 context) { // @param Node(= <body>): match context
                            // @return Boolean:
    context = context || doc.body || doc;
//{@mb
    if (context.matchesSelector) {
        return context.matchesSelector(expr);
    }
    if (context.webkitMatchesSelector) {
//}@mb
        return context.webkitMatchesSelector(expr);
//{@mb
    }
    if (context.mozMatchesSelector) {
        return context.mozMatchesSelector(expr);
    }
    if (context.msMatchesSelector) {
        return context.msMatchesSelector(expr);
    }

    var node, i = 0, nodeArray = uuquery(expr, doc);

    for (; node = nodeArray[i++]; ) {
        if (node === context) {
            return _true;
        }
    }
    return _false;
//}@mb
}

// --- STRING ---
// uu.stringtrim - trim both side whitespaces and unit inner whitespaces
function uustringtrim(source,        // @param String: "  has  space  "
                      replacement) { // @param String(= " "): replacement inner spaces
                                     // @return String: "has space"
    //  [1][trim both + unite spaces] uu.string.trim("  has  space  ")     -> "has space"
    //  [2][trim both + inner spaces] uu.string.trim("  has  space  ", "") -> "hasspace"

    return source.trim()[_replace](uustringtrim._.u,
                                   replacement === _undef ? " " : replacement);
}
uustringtrim._ = { u: /\s+/g,              // uu.string.trim()
                   t: /<\/?[^>]+>/g,       // uu.string.trim.tag()
                   f: /^[^\(]+\(|\)\s*$/g, // uu.string.trim.func()
                   h: /#.*$/g,             // uu.string.trim.hash()
                   q: /^["']?|['"]?$/g };  // uu.string.trim.quote()

// uu.string.trim.tag - uu.string.trim() + strip tags
function uustringtrimtag(source,        // @param HTMLFragmentString: "  <h1>A</h1>  B  <p>C</p>  "
                         replacement) { // @param String(= " "): replacement inner spaces
                                        // @return String: "A B C"
    //  [1][trim tags]     uu.string.trim.tag("  <h1>A</h1>  B  <p>C</p>  ") -> "A B C"
    //  [2][trim tags]     uu.string.trim.tag("      A       B     C      ") -> "A B C"

    return uustringtrim(source, replacement)[_replace](uustringtrim._.t, "");
}

// uu.string.trim.func - uu.string.trim() + strip "function-name(" ... ")"
function uustringtrimfunc(source,        // @param CSSStyleFragmentString: '  url("http://...")  '
                          replacement) { // @param String(= " "): replacement inner spaces
                                         // @return String:  '"http://..."'
    //  [1][trim function] uu.string.trim.func(' url("http://...") ') -> "http://..."
    //  [2][trim function] uu.string.trim.func(' rgb(1, 2, 3) ')      -> "1, 2, 3"

    return uustringtrim(source, replacement)[_replace](uustringtrim._.f, ""); // )
}

// uu.stringtrim.hash - uu.stringtrim() + strip "#hash"
function uustringtrimhash(source,        // @param URLString: "http://example.com/a.jpg#hash"
                          replacement) { // @param String(= " "): replacement inner spaces
                                         // @return String:   "http://example.com/a.jpg"
    //  [1][trim url hash] uu.string.trim.hash("http://example.com/a.jpg#hash")           -> "http://example.com/a.jpg"
    //  [2][trim url hash] uu.string.trim.hash("http://example.com/a.jpg?key=value#hash") -> "http://example.com/a.jpg?key=value"

    return uustringtrim(source, replacement)[_replace](uustringtrim._.h, "");
}

// uu.string.trim.quote - uu.string.trim() + strip double and single quotes
function uustringtrimquote(source,        // @param String: ' "quote  string" '
                           replacement) { // @param String(= " "): replacement inner spaces
                                          // @return String: "quote  string"
    //  [1][trim quotes]   uu.string.trim.quote(' "quote  string" ') -> "quote string"
    //  [2][trim quotes]   uu.string.trim.quote(" 'quote  string' ") -> "quote string"

    return uustringtrim(source, replacement)[_replace](uustringtrim._.q, "");
}

// uu.string.truncate - truncate string
function uustringtruncate(source,    // @param String:
                          wordCount, // @param Number(= 80):
                          omit) {    // @param String(= "..."):
                                     // @return String:
    //  [1][truncate]  uu.truncate("hello world", 3)        -> "hel..."
    //  [2][truncate]  uu.truncate("hello world", 3, "***") -> "hel***"

    wordCount = wordCount || 80;
    omit = omit || "...";
    return source.length > wordCount ? source.slice(0, wordCount) + omit
                                     : source;
}

// uu.string.format - placeholder( "@" ) replacement
function uustringformat(format) { // @param FormatString/Array: formatted string with "@" placeholder
                                  // @return String: "formatted string"

    //  [1][replace @]  uu.format("@ dogs and @", 101, "cats") -> "101 dogs and cats"
    //  [2][replace #]  uu.format(null, "#", "# dogs and #", 101, "cats") -> "101 dogs and cats"
    //  [3][from array] uu.format(["@ dogs and @", 101, "cats"]) -> "101 dogs and cats"

    var i = 0, args = arguments, replacement = _format; // /@/g

    if (isArray(format)) {
        args = toArray.call(format);
        format = format[0];
    }

    // user definition replacement
    if (format === null && args.length > 3 && typeof args[1] === _string) { // [2]
        replacement = RegExp(args[1], "g"); // /#/g
    }
    return format[_replace](replacement, function() {
        return args[++i];
    });
}

//{@sprintf
// uu.string.sprintf - sprintf (PHP::sprintf like function)
function uustringsprintf(format            // @param String: sprintf format string
                         /* var_args */) { // @param Mix: sprintf var_args
                                           // @return String: "formatted string"
    // http://d.hatena.ne.jp/uupaa/20091214
    function parse(m, argidx, flag, width, prec, size, types) {
        if (types === "%") {
            return types;
        }
        idx = argidx ? parseInt(argidx) : next++;

        var w = uustringsprintf.bits[types], ovf, pad, undef,
            v = (av[idx] === undef) ? "" : av[idx];

        w & 3 && (v = w & 1 ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
        w & 4 && (v = ((types === "s" ? v : types) || "").toString());
        w & 0x20  && (v = v >= 0 ? v : v % 0x100000000 + 0x100000000);
        w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
        w & 0x40  && flag === "#" && (v = (w & 0x100 ? "0" : "0x") + v);
        w & 0x80  && prec && (v = w & 2 ? v.toFixed(prec) : v.slice(0, prec));
        w & 0x400 && (v = uujsonencode(v)); // "%j"
        w & 0x6000 && (ovf = (typeof v !== _number || v < 0));
        w & 0x2000 && (v = ovf ? "" : String.fromCharCode(v));
        w & 0x8000 && (flag = flag === "0" ? "" : flag);
        v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();
        // padding
        if (!(w & 0x800 || width === undef || v.length >= width)) {
            pad = Array(width - v.length + 1).join((!flag ||
                                                    flag === "#") ? " " : flag);
            v = ((w & 0x10 && flag === "0") && !v[_indexOf]("-")) ?
                ("-" + pad + v.slice(1)) : (pad + v);
        }
        return v;
    }

    var next = 1, idx = 0, av = arguments;

    return format[_replace](uustringsprintf.format, parse);
}
uustringsprintf.bits = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261,
                         X: 0x9261, f: 0x92, c: 0x2800, s: 0x84, j: 0xC00 };
uustringsprintf.format = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcsj])/g;
//}@sprintf

// --- CODEC ---
//{@codec
// uu.entity - encode String to HTML Entity
function uuentity(str) { // @param String:
                         // @return String:

    //  [1][to Entity] uu.entity("<html>") -> "&lt;html&gt;"
    //  [2][to Entity] uu.entity('&<>"')   -> "&amp;&lt;&gt;&quot;"

    return str[_replace](uuentity.to, toEntityHash);
}
uumix(uuentity, {
    to:     /[&<>"]/g,
    from:   /&(?:amp|lt|gt|quot);/g,
    hash:   uuhash('&,&amp;,<,&lt;,>,&gt;,",&quot;,&amp;,&,&lt;,<,&gt;,>,&quot;,"', ","),
    uffff:  /\\u([0-9a-f]{4})/g // \u0000 ~ \uffff
});

// uu.entity.decode - decode String from HTML Entity
function uuentitydecode(str) { // @param String:
                               // @return String:

    //  [1][from Entity]         uu.entity.decode("&lt;html&gt;")        -> "<html>"
    //  [2][from Entity]         uu.entity.decode("&amp;&lt;&gt;&quot;") -> '&<>"'
    //  [3][from UNICODE Entity] uu.entity.decode("\u0041\u0042")        -> "AB"

    return str[_replace](uuentity.from, toEntityHash)
              [_replace](uuentity.uffff, function(m, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

// inner - to/from entity
function toEntityHash(code) {
    return uuentity.hash[code];
}

// uu.base64 - encode ByteArray to Base64 formated String
function uubase64(data,          // @param String/ByteArray:
                  toURLSafe64) { // @param Boolean(= false):
                                 // @return Base64String/URLSafe64String:
    var rv = [],
        ary = isString(data) ? uuutf8(data) : data,
        c = 0, i = -1, iz = ary.length,
        pad = [0, 2, 1][ary.length % 3],
        num2bb = _num2bb,
        num2b64 = _num2b64;

    if (win.btoa && !toURLSafe64) {
        while (i < iz) {
            rv.push(num2bb[ary[++i]]);
        }
        return win.btoa(rv.join(""));
    }
    --iz;
    while (i < iz) {
        c = (ary[++i] << 16) | (ary[++i] << 8) | (ary[++i]); // 24bit
        rv.push(num2b64[(c >> 18) & 0x3f], num2b64[(c >> 12) & 0x3f],
                num2b64[(c >>  6) & 0x3f], num2b64[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=");
    pad > 0 && (rv[rv.length - 1] = "=");
    return toURLSafe64 ? rv.join("")[_replace](/\=+$/g, "")[_replace](/\+/g, "-")
                                                           [_replace](/\//g, "_")
                       : rv.join("");
}

// uu.base64.decode - decode Base64 formated String to ByteArray
function uubase64decode(data,          // @param Base64String/URLSafe64String:
                        toByteArray) { // @param Boolean(= false): true is ByteArray result
                                       // @return String/ByteArray:
    var rv = [], c = 0, i = -1,
        ary = data.split(""),
        iz = data.length - 1,
        b642num = _b642num;

    while (i < iz) {                  // 00000000|00000000|00000000 (24bit)
        c = (b642num[ary[++i]] << 18) // 111111  |        |
          | (b642num[ary[++i]] << 12) //       11|1111    |
          | (b642num[ary[++i]] <<  6) //         |    1111|11
          |  b642num[ary[++i]];       //         |        |  111111
                                      //    v        v        v
                            rv.push((c>>16)&0xff,
                                                 (c>>8)&0xff,
                                                             c&0xff);
    }
    rv.length -= [0, 0, 2, 1][data[_replace](/\=+$/, "").length % 4]; // cut tail

    return toByteArray ? rv : uuutf8decode(rv);
}

// uu.utf8 - String to UTF8ByteArray
function uuutf8(str) { // @param String: JavaScript string
                       // @return UTF8ByteArray: [ Number(utf8), ... ]
    var rv = [], iz = str.length, c = 0, i = 0;

    for (; i < iz; ++i) {
        c = str.charCodeAt(i);
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv.push(c & 0x7f);
        } else if (c < 0x0800) {
            rv.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | 0x80);
        } else if (c < 0x10000) {
            rv.push(((c >>> 12) & 0x0f) | 0xe0,
                    ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
        }
    }
    return rv;
}

// uu.utf8.decode - UTF8ByteArray to String
function uuutf8decode(byteArray,  // @param UTF8ByteArray: [ Number(utf8), ... ]
                      startIndex, // @param Number(= 0):
                      endIndex) { // @param Number(= void):
                                  // @return String: JavaScript string
    var rv = [], ri = -1, iz = endIndex || byteArray.length, c = 0,
        i = startIndex || 0;

    if (iz > byteArray.length) {
        iz = byteArray.length;
    }

    for (; i < iz; ++i) {
        c = byteArray[i]; // first byte
        if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
            rv[++ri] = c;
        } else if (c < 0xe0) {
            rv[++ri] = (c & 0x1f) <<  6 | (byteArray[++i] & 0x3f);
        } else if (c < 0xf0) {
            rv[++ri] = (c & 0x0f) << 12 | (byteArray[++i] & 0x3f) << 6
                                        | (byteArray[++i] & 0x3f);
        }
    }
    return String.fromCharCode.apply(null, rv);
}

//{@md5
// uu.md5 - encode
function uumd5(data,          // @param ASCIIString/ByteArray:
               toByteArray) { // @param Boolean(= false): true is result ByteArray
                              //                          false is result HexString
                              // @return HexString/ByteArray: "ffff.." or [255, 255, ...]
    return calcHash(data, 5, toByteArray);
}
//}@md5

//{@sha1
// uu.sha1 - encode
function uusha1(data,          // @param ASCIIString/ByteArray:
                toByteArray) { // @param Boolean(= false): true is result ByteArray
                               //                          false is result HexString
                               // @return HexString/ByteArray: "ffff.." or [255, 255, ...]
    return calcHash(data, 1, toByteArray);
}
//}@sha1

//{@hmac
// uu.hmac - encode
function uuhmac(key,           // @param ASCIIString/ByteArray:
                data,          // @param ASCIIString/ByteArray:
                hashLib,       // @param Function:
                toByteArray) { // @param Boolean(= false): true is result ByteArray
                               //                          false is result HexString
                               // @return HexString/ByteArray: "ffff.." or [255, 255, ...]
    //  [1][HMAC-SHA1 HexString] uu.hmac("key", "data", uu.sha1)       -> "104152c5bfdca07bc633eebd46199f0255c9f49d"
    //  [2][HMAC-SHA1 ByteArray] uu.hmac("key", "data", uu.sha1, true) -> [16, 65, 82, 197, 191, 220, 160, 123, ...]

    key  = uubyteArray(key);  // String/ByteArray to ByteArray
    data = uubyteArray(data); // String/ByteArray to ByteArray

    // http://en.wikipedia.org/wiki/HMAC
    var blocksize = 64, // magic word(MD5.blocksize = 64, SHA1.blocksize = 64)
        i = 0, opad, ipad;

    if (key.length > blocksize) {
        key = hashLib(key, _true);
    }
    opad = key[_concat]();
    ipad = key[_concat]();

    for (; i < blocksize; ++i) {
        opad[i] ^= 0x5C; // xor
        ipad[i] ^= 0x36; // xor
    }
    return hashLib(opad[_concat](hashLib(ipad[_concat](data), _true)), toByteArray);
}
//}@hmac

// inner - calc hash
function calcHash(data,          // @param ASCIIString/ByteArray:
                  type,          // @param Number: Type, 1 is SHA-1, 5 is MD5
                  toByteArray) { // @param Boolean(= false): true is result ByteArray
                                 //                          false is result HexString
                                 // @return HexString/ByteArray:
    var rv = uubyteArray(data), // String/ByteArray to ByteArray
        hash, i = rv.length, iz, c = i, _0xff = 0xff,
        map = toByteArray ? _num2num : _num2hh;

    // --- padding ---
    rv[i++] = 0x80;

    while (i % 64 !== 56) {
        rv[i++] = 0;
    }
    c *= 8;
    switch (type) {
//{@md5
    case 5: // MD5
        rv.push(c & _0xff, c >> 8 & _0xff, c >> 16 & _0xff, c >> 24 & _0xff,
                0, 0, 0, 0);
        hash = MD5(rv);

        // ByteArray to HexString/ByteArray
        for (rv = [], i = 0, iz = hash.length; i < iz; ++i) {
            rv.push(map[hash[i]       & _0xff], map[hash[i] >>  8 & _0xff],
                    map[hash[i] >> 16 & _0xff], map[hash[i] >> 24 & _0xff]);
        }
        break;
//}@md5
//{@sha1
    case 1: // SHA-1
        rv.push(0, 0, 0, 0,
                c >> 24 & _0xff, c >> 16 & _0xff, c >> 8 & _0xff, c & _0xff);
        hash = SHA1(rv);

        // ByteArray to HexString/ByteArray
        for (rv = [], i = 0, iz = hash.length; i < iz; ++i) {
            rv.push(map[hash[i] >> 24 & _0xff], map[hash[i] >> 16 & _0xff],
                    map[hash[i] >>  8 & _0xff], map[hash[i]       & _0xff]);
        }
        break;
//}@sha1
    default:
        rv = [];
    }
    return toByteArray ? rv : rv.join("");
}

//{@md5
uumix(uumd5, {
    A: [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
        0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
        0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
        0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
        0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
        0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391],
    S: [7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
        5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
        4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
        6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21],
    X: [0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
        1,  6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12,
        5,  8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2,
        0,  7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9]
});

// inner - calc MD5
function MD5(data) { // @param ByteArray:
                     // @return ByteArray:
    var a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476,
        aa, bb, cc, dd, ra, rb, rc,
        A = uumd5.A, S = uumd5.S, X = uumd5.X,
        i = 0, iz = data.length, j, k, n, word = [];

    for (; i < iz; i += 64) {
        for (j = 0; j < 16; ++j) {
            k = i + j * 4;
            word[j] = data[k] + (data[k + 1] <<  8)
                              + (data[k + 2] << 16)
                              + (data[k + 3] << 24);
        }
        aa = a, bb = b, cc = c, dd = d;

        for (j = 0; j < 64; ++j) {
            n = j < 16 ? (b & c) | (~b & d) // ff - Round 1
              : j < 32 ? (b & d) | (c & ~d) // gg - Round 2
              : j < 48 ?  b ^ c ^ d         // hh - Round 3
                       :  c ^ (b | ~d);     // ii - Round 4
            n += a + word[X[j]] + A[j];

            ra = b + ((n << S[j]) | (n >>> (32 - S[j])));
            rb = b;
            rc = c;
            // rotate
            a = d, b = ra, c = rb, d = rc;
        }
        a += aa, b += bb, c += cc, d += dd;
    }
    return [a, b, c, d];
}
//}@md5

//{@sha1
// inner - calc SHA-1
function SHA1(data) { // @param ByteArray:
                      // @return ByteArray:
    var a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476,
        e = 0xc3d2e1f0, aa, bb, cc, dd, ee,
        i = 0, iz = data.length, j, jz, n, n16 = [];

    for (; i < iz; i += 64) {
        aa = a, bb = b, cc = c, dd = d, ee = e;

        for (j = i, jz = i + 64, n = 0; j < jz; j += 4, ++n) {
            n16[n] = (data[j]     << 24) | (data[j + 1] << 16) |
                     (data[j + 2] <<  8) |  data[j + 3];
        }
        for (j = 16; j < 80; ++j) {
            n = n16[j - 3] ^ n16[j - 8] ^ n16[j - 14] ^ n16[j - 16];
            n16[j] = (n << 1) | (n >>> 31);
        }
        for (j = 0; j < 80; ++j) {
            n = j < 20 ? ((b & c) ^ (~b & d))           + 0x5a827999
              : j < 40 ?  (b ^ c ^ d)                   + 0x6ed9eba1
              : j < 60 ? ((b & c) ^  (b & d) ^ (c & d)) + 0x8f1bbcdc
                       :  (b ^ c ^ d)                   + 0xca62c1d6;
            n += ((a << 5) | (a >>> 27)) + n16[j] + e;

            e = d, d = c, c = (b << 30) | (b >>> 2), b = a, a = n;
        }
        a += aa, b += bb, c += cc, d += dd, e += ee;
    }
    return [a, b, c, d, e];
}
//}@sha1

//{@msgpack
// uu.msgpack - msgpack encode
function uumsgpack(data) { // @param Mix:
                           // @return ByteArray:
    return msgpackEncoder([], data);
}
uumsgpack.split8char = /.{8}/g;
uumsgpack.sign = { 8: 0x80, 16: 0x8000, 32: 0x80000000 };

// uu.msgpack.decode - msgpack decode
function uumsgpackdecode(data) { // @param BinaryString/ByteArray:
                                 // @return Mix:
    return { data: typeof data === "string" ? binaryString2ByteArray(data)
                                            : data,
             index: -1, decode: msgpackDecoder }.decode();
}

// inner - msgpack encoder
function msgpackEncoder(rv,    // @param ByteArray: result
                        mix) { // @param Mix: source data
                               // @return ByteArray:
    var size = 0, i = 0, iz, c, ary, hash,
        high, low, i64 = 0, sign, exp, frac;

    if (mix == null) { // null or undefined
        rv.push(0xc0);
    } else {
        switch (typeof mix) {
        case "boolean":
            rv.push(mix ? 0xc3 : 0xc2);
            break;
        case "number":
            if (mix !== mix) { // isNaN
                rv.push(0xcb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff); // quiet NaN
            } else if (mix === Infinity) {
                rv.push(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00); // positive infinity
            } else if (Math.floor(mix) === mix) {
                if (mix < 0) { // int
                    if (mix >= -32) { // negative fixnum
                        rv.push(0xe0 + mix + 32);
                    } else if (mix > -0x80) {
                        rv.push(0xd0, mix + 0x100);
                    } else if (mix > -0x8000) {
                        mix += 0x10000;
                        rv.push(0xd1, mix >> 8, mix & 0xff);
                    } else if (mix > -0x80000000) {
                        mix += 0x100000000;
                        rv.push(0xd2, mix >>> 24, (mix >> 16) & 0xff,
                                                  (mix >>  8) & 0xff, mix & 0xff);
                    } else {
                        ++i64;
                    }
                } else { // uint
                    if (mix < 0x80) {
                        rv.push(mix); // positive fixnum
                    } else if (mix < 0x100) { // uint 8
                        rv.push(0xcc, mix);
                    } else if (mix < 0x10000) { // uint 16
                        rv.push(0xcd, mix >> 8, mix & 0xff);
                    } else if (mix < 0x100000000) { // uint 32
                        rv.push(0xce, mix >>> 24, (mix >> 16) & 0xff,
                                                  (mix >>  8) & 0xff, mix & 0xff);
                    } else {
                        ++i64;
                    }
                }
                if (i64) {
                    high = Math.floor(mix / 0x100000000);
                    low = mix & (0x100000000 - 1);
                    rv.push(mix < 0 ? 0xd3 : 0xcf,
                                  (high >> 24) & 0xff, (high >> 16) & 0xff,
                                  (high >>  8) & 0xff,         high & 0xff,
                                  (low  >> 24) & 0xff, (low  >> 16) & 0xff,
                                  (low  >>  8) & 0xff,          low & 0xff);
                }
            } else { // double
                // THX! edvakf
                // http://javascript.g.hatena.ne.jp/edvakf/20100614/1276503044
                hash = _bit2num;
                sign = mix < 0;
                sign && (mix *= -1);

                // add offset 1023 to ensure positive
                exp  = Math.log(mix) / Math.LN2 + 1023 | 0;

                // shift 52 - (exp - 1023) bits to make integer part exactly 53 bits,
                // then throw away trash less than decimal point
                frac = (Math.floor(mix * Math.pow(2, 52 + 1023 - exp))).
                        toString(2).slice(1);

                // exp is between 1 and 2047. make it 11 bits
                exp  = ("000000000" + exp.toString(2)).slice(-11);

                ary  = (+sign + exp + frac).match(uumsgpack.split8char);
                rv.push(0xcb, hash[ary[0]], hash[ary[1]],
                              hash[ary[2]], hash[ary[3]],
                              hash[ary[4]], hash[ary[5]],
                              hash[ary[6]], hash[ary[7]]);
            }
            break;
        case "string":
            // utf8.encode
            for (ary = [], iz = mix.length, i = 0; i < iz; ++i) {
                c = mix.charCodeAt(i);
                if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
                    ary.push(c & 0x7f);
                } else if (c < 0x0800) {
                    ary.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | 0x80);
                } else if (c < 0x10000) {
                    ary.push(((c >>> 12) & 0x0f) | 0xe0,
                             ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
                }
            }
            msgpackSetType(rv, 32, ary.length, [0xa0, 0xda, 0xdb]);
            Array.prototype.push.apply(rv, ary);
            break;
        default: // array or hash
            if (isArray(mix)) { // array
                size = mix.length;
                msgpackSetType(rv, 16, size, [0x90, 0xdc, 0xdd]);
                for (; i < size; ++i) {
                    msgpackEncoder(rv, mix[i]);
                }
            } else { // hash
                if (Object.keys) {
                    size = Object.keys(mix).length;
                } else {
                    for (i in mix) {
                        mix.hasOwnProperty(i) && ++size;
                    }
                }
                msgpackSetType(rv, 16, size, [0x80, 0xde, 0xdf]);
                for (i in mix) {
                    msgpackEncoder(rv, i);
                    msgpackEncoder(rv, mix[i]);
                }
            }
        }
    }
    return rv;
}

// inner - msgpack decoder
function msgpackDecoder() { // @return Mix: JavaScript Object
    var rv, ri, undef, size, i = 0, iz, msb = 0, c, sign, exp, frac, key,
        that = this,
        data = that.data,
        type = data[++that.index];

    if (type >= 0xe0) {         // Negative FixNum (111x xxxx) (-32 ~ -1)
        return type - 0x100;
    }
    if (type < 0x80) {          // Positive FixNum (0xxx xxxx) (0 ~ 127)
        return type;
    }
    if (type < 0x90) {          // FixMap (1000 xxxx)
        size = type - 0x80;
        type = 0x80;
    } else if (type < 0xa0) {   // FixArray (1001 xxxx)
        size = type - 0x90;
        type = 0x90;
    } else if (type < 0xc0) {   // FixRaw (101x xxxx)
        size = type - 0xa0;
        type = 0xa0;
    }
    switch (type) {
    case 0xc0:  return null;
    case 0xc2:  return _false;
    case 0xc3:  return _true;
    case 0xca:  rv = msgpackReadByte(that, 4);  // float
                sign = rv & uumsgpack.sign[32]; //  1bit
                exp  = (rv >> 23) & 0xff;       //  8bits
                frac = rv & 0x7fffff;           // 23bits
                if (!rv || rv === 0x80000000) { // 0.0 or -0.0
                    return 0;
                }
                if (exp === 0xff) { // NaN or Infinity
                    return frac ? NaN : Infinity;
                }
                return (sign ? -1 : 1) *
                            (frac | 0x800000) * Math.pow(2, exp - 127 - 23); // 127: bias
    case 0xcb:  rv = msgpackReadByte(that, 4);  // double
                sign = rv & uumsgpack.sign[32]; //  1bit
                exp  = (rv >> 20) & 0x7ff;      // 11bits
                frac = rv & 0xfffff;            // 52bits - 32bits (high word)
                if (!rv || rv === 0x80000000) { // 0.0 or -0.0
                    return 0;
                }
                if (exp === 0x7ff) { // NaN or Infinity
                    return frac ? NaN : Infinity;
                }
                return (sign ? -1 : 1) *
                            ((frac | 0x100000) * Math.pow(2, exp - 1023 - 20) // 1023: bias
                             + msgpackReadByte(that, 4) * Math.pow(2, exp - 1023 - 52));
    case 0xcf:  return msgpackReadByte(that, 4) * Math.pow(2, 32) +
                       msgpackReadByte(that, 4);                    // uint 64
    case 0xce:  return msgpackReadByte(that, 4);                    // uint 32
    case 0xcd:  return msgpackReadByte(that, 2);                    // uint 16
    case 0xcc:  return msgpackReadByte(that, 1);                    // uint 8
    case 0xd3:  return msgpackDecodeInt64(that);                    // int 64
    case 0xd2:  rv = msgpackReadByte(that, 4);                      // int 32
    case 0xd1:  rv === undef && (rv = msgpackReadByte(that, 2));    // int 16
    case 0xd0:  rv === undef && (rv = msgpackReadByte(that, 1));    // int 8
                msb = 4 << ((type & 0x3) + 1); // 8, 16, 32
                return rv < uumsgpack.sign[msb] ? rv : rv - uumsgpack.sign[msb] * 2;
    case 0xdb:  size = msgpackReadByte(that, 4);                    // raw 32
    case 0xda:  size === undef && (size = msgpackReadByte(that, 2));// raw 16
    case 0xa0:  i = that.index + 1;                                 // raw
                that.index += size;
                // utf8.decode
                for (rv = [], ri = -1, iz = i + size; i < iz; ++i) {
                    c = data[i];    // first byte
                    if (c < 0x80) { // ASCII(0x00 ~ 0x7f)
                        rv[++ri] = c;
                    } else if (c < 0xe0) {
                        rv[++ri] = (c & 0x1f) <<  6 | (data[++i] & 0x3f);
                    } else if (c < 0xf0) {
                        rv[++ri] = (c & 0x0f) << 12 | (data[++i] & 0x3f) << 6
                                                    | (data[++i] & 0x3f);
                    }
                }
                return String.fromCharCode.apply(null, rv);
    case 0xdf:  size = msgpackReadByte(that, 4);                       // map 32
    case 0xde:  size === undef && (size = msgpackReadByte(that, 2));   // map 16
    case 0x80:  for (rv = {}; i < size; ++i) {                         // map
                    key = that.decode();
                    rv[key] = that.decode(); // key/value pair
                }
                return rv;
    case 0xdd:  size = msgpackReadByte(that, 4);                       // array 32
    case 0xdc:  size === undef && (size = msgpackReadByte(that, 2));   // array 16
    case 0x90:  for (rv = []; i < size; ++i) {                         // array
                    rv.push(that.decode());
                }
    }
    return rv;
}

// inner - read byte
function msgpackReadByte(that,   // @param Object:
                         size) { // @param Number:
                                 // @return Number:
    var rv = 0, data = that.data, i = that.index;

    switch (size) {
    case 4: rv += data[++i] * 0x1000000 + (data[++i] << 16);
    case 2: rv += data[++i] << 8;
    case 1: rv += data[++i];
    }
    that.index = i;
    return rv;
}

// inner - decode int64
function msgpackDecodeInt64(that) { // @param Object:
                                    // @return Number:
    var rv, overflow = 0,
        bytes = that.data.slice(that.index + 1, that.index + 9);

    that.index += 8;

    // avoid overflow
    if (bytes[0] & 0x80) {

        ++overflow;
        bytes[0] ^= 0xff;
        bytes[1] ^= 0xff;
        bytes[2] ^= 0xff;
        bytes[3] ^= 0xff;
        bytes[4] ^= 0xff;
        bytes[5] ^= 0xff;
        bytes[6] ^= 0xff;
        bytes[7] ^= 0xff;
    }
    rv = bytes[0] * 0x100000000000000
       + bytes[1] *   0x1000000000000
       + bytes[2] *     0x10000000000
       + bytes[3] *       0x100000000
       + bytes[4] *         0x1000000
       + bytes[5] *           0x10000
       + bytes[6] *             0x100
       + bytes[7];
    return overflow ? (rv + 1) * -1 : rv;
}

// inner - set type and fixed size
function msgpackSetType(rv,      // @param ByteArray: result
                        fixSize, // @param Number: fix size. 16 or 32
                        size,    // @param Number: size
                        types) { // @param ByteArray: type formats. eg: [0x90, 0xdc, 0xdd]
    if (size < fixSize) {
        rv.push(types[0] + size);
    } else if (size < 0x10000) { // 16
        rv.push(types[1], size >> 8, size & 0xff);
    } else if (size < 0x100000000) { // 32
        rv.push(types[2], size >>> 24, (size >> 16) & 0xff,
                                       (size >>  8) & 0xff, size & 0xff);
    }
}
//}@msgpack

// --- init ---
(function(base, i) {
    _num2b64 = base.split(""); // ["A", "B", ... "/"]
    _b642num = { "=": 0, "-": 62, "_": 63 }; // URLSafe64 chars("-", "_")

    for (; i < 64; ++i) {
        _b642num[base.charAt(i)] = i;
    }
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", 0);
//}@codec

// --- URL ---
// uu.url - url accessor
function uuurl(url,          // @param URLHash/URLString(= ""): "https://..."
               parseQuery) { // @param Boolean(= false): true is parse QueryString
                             // @return URLString/URLHash:

    //  [1][current abs-dir]   uu.url() -> "http://example.com/index.htm"
    //  [2][parse url]         uu.url("http://example.com/dir/file.ext?a=b") -> { protocol: "http:", query: {}, ... }
    //  [3][parse url + query] uu.url("http://example.com/dir/file.ext?a=b") -> { protocol: "http:", query: { a: "b" } }
    //  [4][build url]         uu.url({ schme: "http", ... }) -> "http://example.com/..."

    return !url ? uuurlresolve.cache // [1]
                : isString(url) ? parseURL(uuurlresolve(url), parseQuery) // [2][3]
                                : buildURL(url);                          // [4]
}

// uu.url.resolve - convert relative URL to absolute URL
function uuurlresolve(url,          // @param URLString(= "."): rel/abs URL
                      currentDir) { // @param URLString(= ""): current dir
                                    // @return URLString: absolute URL
    //  [1][resolve abs-url] uu.url.resolve("./index.htm") -> "http://example.com/index.htm"

    return (!url || url === ".") ? uuurlresolve.cache : resolveURL(url, currentDir);
}
uuurlresolve.cache = resolveURL("."); // current absolute-url cache

// inner - to absolute url
function resolveURL(url,          // @param String:
                    currentDir) { // @param String:
                                  // @return String:
/*
    if (!/^(?:file|https?):/.test(url)) { // no protocol
        var div = newNode();

        div.innerHTML = '<a href="' + (currentDir || "") + url + '" />';
        url = div[_firstChild] ? div[_firstChild].href
                               : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    }
    return url[_replace](/&amp;|&/g, ";"); // "&" -> ";"
 */
    if (!_protocol.test(url)) { // no protocol
        // build full path
        var a = newNode("a");

        a[_setAttribute]("href", (currentDir || "") + url);
        url = a.cloneNode(_false).href;
    }
    return url;
}

// uu.url.dir - absolute path to absolute directory(chop filename)
function uuurldir(url) { // @param URLString/PathString: url or path
                         // @return String: directory path, has tail "/"
    //  [1][chop filename] uu.url.dir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
    //  [2][chop filename] uu.url.dir("/root/dir/file.ext")              -> "/root/dir/"
    //  [3][chop filename] uu.url.dir("/file.ext")                       -> "/"
    //  [4][through]       uu.url.dir("/")                               -> "/"
    //  [5][supply slash]  uu.url.dir("")                                -> "/"

    var ary = url.split("/");

    ary.pop(); // chop "file.ext"
    return ary.join("/") + "/";
}

// inner - build URL
function buildURL(hash) { // @param URLHash: { protocol, host, pathname, search, hash }
                          // @return URLString: "{$protocol}//{$host}{$pathname}{$search}{$hash}"
    //  [1][build] uu.url({ protocol: "http:",
    //                      host:     "user:pass@example.com:8080",
    //                      pathname: "/dir1/dir2/file.ext",
    //                      search:   "?a=b&c=d",
    //                      hash:     "#hash" })
    //              -> "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b&c=d#hash"
    return [hash.protocol,
            hash.protocol ? (hash.protocol === "file:" ? "///"
                                                       : "//") : "",
            hash.host     || "",
            hash.pathname || "/",
            hash.search   || "",
            hash.hash     || ""].join("");
}

// inner - parse URL
function parseURL(url,          // @param URLString: absurl / relurl,
                  parseQuery) { // @param Boolean(= false): true is parse QueryString
                                //                   "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b&c=d#hash"
                                // @return URLHash: { href, protocol, secure, host,
                                //                    auth, hostname, port, pathname,
                                //                    search, query, hash, ok }
                                //     href     - String: "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash"
                                //     protocol - String: "http:"
                                //     secure   - Boolean: false
                                //     host     - String: "user:pass@example.com:8080". has auth
                                //     auth     - String: "user:pass"
                                //     hostname - String: "example.com"
                                //     port     - String: "8080"
                                //     pathname - String: "/dir1/dir2/file.ext". has /^\//
                                //     search   - String: "?a=b&c=d". has /^?/
                                //     query    - Hash:   { a: "b", c: "d" }
                                //     hash     - String: "#hash". has /^#/
                                //     ok       - Boolean: true is valid url

    // file: /^(file:)\/{2,3}(?:loc\w+)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i
    //                        localhost /dir/f.ext  ?key=value    #hash
    //         [1]                      [2]         [3]           [4]
    // http: /^(\w+:)\/\/((?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?/i
    //        https://    user:pass     server       port    /dir/f.ext  ?key=value   #hash
    //        [1]         [3]           [4]          [5]     [6]         [7]          [8]
    var m = _parse.file.exec(url) || _parse.http.exec(url), file, search;

    if (m) {
        file = m[1] === "file:";
        search = (file ? m[3] : m[7]) || "";
        return {
            href:       url,
            protocol:   m[1],
            secure:     file ? _false : (m[1] === "https:" || m[1] === "wss:"),
            host:       file ?     "" :  m[2],
            auth:       file ?     "" : (m[3] || ""),
            hostname:   file ?     "" :  m[4],
            port:       file ?     "" : (m[5] || ""),
            pathname:   file ?   m[2] :  m[6],
            search:     search,
            query:      parseQuery ? parseQueryString(search) : {},
            hash:       (file ? m[4] : m[8]) || "",
            ok:         _true
        };
    }
    return { href: url, protocol: "", secure: _false, host: "", auth: "",
             hostname: "", port: "", pathname: url, search: "", query: {},
             hash: "", ok: _false };
}

// uu.url.hash - get hash - quickly
function uuurlhash(url) { // @param URLString: "http://example.com/api#hash"
                          // @return String: "hash"
    //  [1][get hash] uu.url.hash("http://example.com/api#hash") -> "hash"
    //  [2][get hash] uu.url.hash("http://example.com/api") -> ""

    var i = url[_indexOf]("#") + 1; // 0 = not found, 1~ = found

    return i ? url.slice(i) : "";
}

// uu.url.split - split dir/file "dir/file.ext" -> ["dir/", "file.ext"]
function uuurlsplit(url) { // @param URLString/PathString: url or path
                           // @return Array+Hash: ["dir/", "file.ext"] + { dir: "dir/", file: "file.ext" }
    var rv = [], ary = url.split("/");

    rv[1] = rv.file = ary.pop(); // file
    rv[0] = rv.dir  = ary.join("/") + "/";
    return rv;
}

// uu.url.normalize - url normalize
function uuurlnormalize(url) { // @param String:
                               // @return String:

    //  [1][up to dir]          uu.url.normalize("http://example.com/api/../") -> "http://example.com/"
    //  [2][current dir]        uu.url.normalize("http://example.com/api/./")  -> "http://example.com/api/"
    //  [3][through]            uu.url.normalize("http://example.com/api/")    -> "http://example.com/api/"
    //  [4][add tail slash]     uu.url.normalize("http://example.com/api")     -> "http://example.com/api/"
    //  [5][boundary condition] uu.url.normalize("http://example.com/../")     -> "http://example.com/"
    //  [6][rel path]           uu.url.normalize("/example.com/api/../")       -> "/example.com/"
    //  [7][rel path]           uu.url.normalize("/example.com/../")           -> "/"
    //  [8][boundary condition] uu.url.normalize("/../")                       -> "/"
    //  [9][boundary condition] uu.url.normalize("/./")                        -> "/"
    // [10][boundary condition] uu.url.normalize("/")                          -> "/"
    // [11][boundary condition] uu.url.normalize("")                           -> "/"

    var rv = [], r, hash = parseURL(url),
        ary = hash.pathname.split("/"), i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        ary[i] === ".." ? rv.pop()
                        : ary[i] === "." ? 0 : rv.push(ary[i]);
    }
    r = rv.join("/");
    r || (r = "/");

    hash.pathname = r;
    return buildURL(hash);
}

// uu.url.query - query string accessor
function uuurlquery(queryString, // @param QueryString/Hash: "key1=a;key2=b;key3=0;key3=1"
                                 //                          { key1: "a", key2: "b", key3: [0, 1] }
                    add,         // @param Hash(= void): add pair { key: value, ... }
                    joint) {     // @param String(= uu.config.queryJoint): ";" or "&" or "&amp;"
                                 // @return QueryString/Hash:
    //  [1][parse] uu.url.query("key1=a;key2=b;key3=0;key3=1")    -> { key1: "a", key2: "b", key3: ["0", "1"] }
    //  [2][build] uu.url.query({ key1: "a", key2: "b",
    //                            key3: ["0", "1"] })             -> "key1=a;key2=b;key3=0;key3=1"
    //  [3][add]   uu.url.query( "key=val",     { key2: "val2" }) -> "key=val;key2=val2"
    //  [4][add]   uu.url.query({ key: "val" }, { key2: "val2" }) -> "key=val;key2=val2"

    joint = joint || uuconfig.queryJoint;
    var rv, isstr = isString(queryString), i;

    if (add) {
        rv = isstr ? parseQueryString(queryString) : queryString;
        for (i in add) {
            rv[i] = add[i];
        }
        return buildQueryString(rv, joint);
    }
    return (isstr ? parseQueryString : buildQueryString)(queryString, joint); // [1][2]
}

// inner - build query string
function buildQueryString(queryString, // @param Hash: { key1: "a", key2: "b", key3: [0, 1] }
                          joint) {     // @param String: joint string ";" or "&" or "&amp;"
                                       // @return QueryString: "key1=a;key2=b;key3=0;key3=1"
    var rv = [], i, j, jz, key, value, fn = encodeURIComponent;

    for (i in queryString) {
        key   = fn(i);
        value = queryString[i];
        if (isArray(value)) { // value is Array
            for (j = 0, jz = value.length; j < jz; ++j) {
                rv.push(key + "=" + fn(value[j])); // "key3=0;key3=1"
            }
        } else { // value is Literal
            rv.push(key + "=" + fn(value)); // "key1=a;key2=b"
        }
    }
    return rv.join(joint); // "key1=a;key2=b;key3=0;key3=1"
}

// inner - parse query string
function parseQueryString(queryString) { // @param URLString/QueryString: "key1=a;key2=b;key3=0;key3=1"
                                         // @return Hash: { key1: "a", key2: "b", key3: ["0", "1"] }
    function _parse(matchAll, key, value) {
        var k = fn(key), v = fn(value);

        rv[k] ? (isArray(rv[k]) ? rv[k].push(v)
                                : (rv[k] = [rv[k], v]))
              : (rv[k] = v);
        return "";
    }
    var rv = {}, fn = decodeURIComponent, pos = queryString[_indexOf]("?");

    // pickup: "http://example.com?key=val#hash" -> { key: "val" }
    if (pos >= 0) { // [1]
        queryString = uustringtrimhash(queryString.slice(pos + 1));
    }
    queryString[_replace](/&amp;|&|;/g, ";") // "&amp;" or "&" or ";" -> ";"
               [_replace](/(?:([^\=]+)\=([^\;]+);?)/g, _parse); // [2]
    return rv;
}

// --- DEBUG ---

//{@canvas
// uu.hatch - draw hatch pattern
function uuhatch(param) { // @param Hash: { size, unit, color, color2 }
                          //   size - Number(= 10): hatch pixel size
                          //   unit - Number(= 5): unit count
                          //   color - String(= "skyblue"):
                          //   color2 - String(= "steelblue"):
                          // @return Boolean: trus is draw, false is ng
    function drawHatch(canvas, x, y, w, h) {
        var i = 1, j = 1, ctx = canvas.getContext("2d");

        ctx.lineWidth = 0.2;
        ctx.textBaseline = "top";
        ctx.font = "bold 12px serif";
        ctx.shadowColor = "#111";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = "white"

        for (; x < w; ++i, x += p.size) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = (i % p.unit) ? p.color : p.color2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
            ctx.closePath();
            ctx.shadowBlur = 1;
            i % p.unit || ctx.fillText(x + "", x, p.size * p.unit);
        }
        for (; y < h; ++j, y += p.size) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = (j % p.unit) ? p.color : p.color2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            ctx.closePath();
            ctx.shadowBlur = 1;
            j % p.unit || ctx.fillText(y + "", p.size * p.unit, y);
        }
    }

    if (uuready.canvas) {

//{@assert judge DOMContentLoaded (has <body>)
        if (doc && doc.body) {
            ;
        } else {
            uung("uu.hatch", "<body>");
        }
//}@assert

        try {
            var p = uuarg(param, { size: 10, unit: 5,
                                   color: "#87ceeb", color2: "#4682b4" }),
                x = p.size, y = p.size,
                vp = uuviewport(),
                w = parseInt(vp.innerWidth),
                h = parseInt(vp.innerHeight),
                canvas;

            canvas = uucanvas(w, h, "V"); // VML only
            canvas.style.cssText = "position:absolute;z-index:-100";
            canvas.id = "uuhatch";
            uunodeadd(canvas, doc.body, "./first");
            drawHatch(canvas, x, y, w, h);

//{@eventresize
            uueventresize(function() {
                setTimeout(function() {
                    vp = uuviewport();
                    canvas.width  = w = parseInt(vp.innerWidth);
                    canvas.height = h = parseInt(vp.innerHeight);
                    drawHatch(canvas, x, y, w, h);
                }, 100);
            });
//}@eventresize
            return _true;
        } catch(err) {}
    }
    return _false;
}
//}@canvas

// uu.glow - glow node
function uuglow(node) { // @param Node/NodeArray/NodeList/NodeSet/CSSSelectorExpressionString:
//{@fx
//{@color
    var ary = isString(node) ? uuquery(node, doc)
                             : node[_nodeSet] ? node[_nodeSet]
                                              : node[_nodeType] ? [node]
                                                                : node;
    Array.isArray(ary) || (ary = uuarray(ary));

    uueach(ary, function(node) {
        var bgc = uucssbgcolor(node, _transparent) + "", // Color.toString() -> "transparent"
            undo = function(node, option, back) {
                back && uucss(node, { bgc: bgc });
            };

        uufx(node, 200, { bgc: "#f33", reverse: 1, after: [undo] });
    });
//}@color
//}@fx
}

// uu.alert - alert dialog
function uualert(/* var_args, ... */) { // @param Mix: var_args
    //  [1][alert] uu.alert("hello world")                   -> alert('hello world')
    //  [2][alert] uu.alert("@uupaa")                        -> alert('@uupaa')
    //  [3][alert] uu.alert("@ @!", "hello", "world")        -> alert('hello world!')
    //  [4][alert] uu.alert({ key: "value", num: 1 })        -> alert('{ "key": "value", num: 1 }')
    //  [5][alert] uu.alert(document.body.firstElementChild) -> alert('body>div:nth-child(1)')
    //  [6][alert] uu.alert("a", { k: 123 })                 -> alert('"a", { "k": 123 }')
    //  [7][alert] uu.alert(uu)                              -> alert('{ "function": "uufactory", ... }')
    //  [8][alert] uu.alert(uu.ready)                        -> alert('{ "function": "uuready", ... }')
    //  [9][alert] uu.alert()                                -> alert('undefined')
    alert(serializeArgument(toArray.call(arguments)));
}

// inner - argument serialize
function serializeArgument(ary) { // @param Array: arguments
                                  // @return String:
    var a0 = ary[0],
        rv = (ary.length < 2 && (isString(a0) || isNumber(a0))) ? a0 // [2]
           : uuhas(a0, "@") ? uustringformat.apply(this, ary)        // [3]
           : (toArray.call(ary).map(function(v) {
                return uujsonencode(v, 0, 1);
              }).join(", ") || "undefined");                         // [1][4-9]

    return rv;
}

//{@debug
// uu.log - add log
function uulog(/* var_args, ... */) { // @param Mix(= void): var_args
    //  [1][add(display) log] uu.log("Hello Log")
    //  [2][add remote log]   window.uuconfig = { log: { remote: "http://localhost/log?msg=" }};
    //                        uu.log("Hello Log") -> GET /http://localhost/log?msg=Hello%20Log
    //  [3][clear all log]    uu.log()

    var box, msg, config = uuconfig.log;

    if (!config.disable) {
        if (!arguments.length) { // [3]
            box = uuidc("uulog");
            box && (box.innerHTML = "");
        } else {
            msg = serializeArgument(toArray.call(arguments));

            if (config.remote) { // [2]
                (new Image).src = config.remote + encodeURIComponent(msg);
            } else { // [1]
                box = uuidc("uulog");
                box || uunodeadd(box = uu.ol({ id: "uulog" }));
                config.rollup <= uutag("", box).length && (box.innerHTML = ""); // rollup
                uunodeadd(uu[/OL|UL/.test(box[_tagName]) ? "li"
                                                         : "p"](newText(msg)), box);
            }
        }
    }
}

// uu.log.clear
function uulogclear() {
    uulog();
}
//}@debug

//{@debug
// uu.trace - add function trace
function uutrace(fn,     // @param Function(= void): arguments.callee
                 length, // @param Number(= void): arguments.length
                 arg1,   // @param Mix(= void):
                 arg2,   // @param Mix(= void):
                 arg3,   // @param Mix(= void):
                 arg4) { // @param Mix(= void):
                         // @return Array/void:
    //  [1][add function trace]       uu.trace(argument.callee, argument.length, arg, ...)
    //  [2][add remote trace]         window.uuconfig = { trace: { remote: "http://localhost/trace?msg=" }};
    //                                uu.trace("Hello Trace") -> GET /http://localhost/trace?msg=Hello%20Trace
    //  [3][dump and clear all trace] uu.trace() -> Array

    var rv, config = uuconfig.trace, msg, w = fn.name; // Function.name

    if (!arguments.length) { // [3]
        msg = _trace.concat(); // clone
        _trace = [];
        return msg;
    } else if (!config.disable) {
        // pick up function.name [IE6][IE7][IE8][IE9][OPERA9][OPERA10.1x]
        w || (w = fn + "", w = w.slice(9, w.indexOf("("))); // )

        msg = [w, length,
               uujsonencode(arg1),
               uujsonencode(arg2),
               uujsonencode(arg3),
               uujsonencode(arg4)].join(",");

        config.remote ? ((new Image).src = config.remote + encodeURIComponent(msg))
                      : _trace.push(msg);
    }
    return;
}
//}@debug

// --- UNIT TEST ---
//{@test

// uu.ok - unit test
function uuok(title,    // @param String/Boolean(= ""): title
              lval,     // @param Mix(= void): left value
              operator, // @param String(= void): operator
              rval,     // @param Mix(= void): right value
              more) {   // @param String(= void): more info
                        // @return Hash/void: { ok, ng, ms, total }
                        //  ok - Number: truly count
                        //  ng - Number: falsy count
                        //  ms - Number: Elapsed time (unit: ms)
                        //  total - Number: ok + ng
                        // @throws Error from judge()
    //  [1][test]           uu.ok("title", 1, "===", 1, "more info")
    //  [2][add separater]  uu.ok("separater comment")
    //  [3][get/show score] uu.ok() -> { ok, ng, ms, total }
    //  [4][get score]      uu.ok(false) -> { ok, ng, ms, total }

    var rv, r, tm, db = uuok.db, ol, undef;

    if (operator) { // [1]
        tm = +new Date;
        r = uuokjudge(lval, operator, rval); // 0 is false, 1 is true
//{@debug
        if (!r) {
            debugger;
        }
//}@debug
        tm = ((+new Date) - tm);
        ++db[r ? "ok" : "ng"];
        ++db.total;
        db.ms += tm;
        //  <li style="...">
        //      <span>title</span><b>(.. ms)</b><br />
        //      <span>lval operator rval</span><br />
        //      <span>more</span>
        //  </li>
        db.row.push(
            uustringformat(uuok.fmt.join(""),
                uuok.bgc[r + (db.row.length % 2) * 4], uuentity(title),
                tm > 0 ? "<b>(" + tm + " ms)</b>" : "",
                uujsonencode(lval, _true, _true), // +esc +space
                operator,
                rval === undef ? "" : uujsonencode(rval, _true, _true), // +esc +space
                !r ? "ERROR" : (more || "")));

    } else if (isString(title)) { // [2]
        db.row.push(
            uustringformat(uuok.fmt[0] + uuok.fmt[2],
                uuok.bgc[2 + (db.row.length % 2) * 4], uuentity(title)));
    } else { // [3][4]
        rv = uuclone(db);
        db.ng && uucss(doc.body, { bgc: uuok.bgc[0] });
        if (title !== _false) { // [4]
            ol = uuid("uuok") || doc.body[_appendChild](uu.ol("id,uuok"));
            ol.innerHTML += db.row.join("");
        }

        uuok.db = { ok: 0, ng: 0, total: 0, ms: 0, row: [] }; // reset
        return rv;
    }
}
uuok.fmt = ['<li style="line-height:1.5;padding:5px;background-color:@">',
            '<span>@</span> @ <br /><span>@ @ @</span><br />',
            '<span>@</span></li>'];
uuok.db = { ok: 0, ng: 0, total: 0, ms: 0, row: [] };
uuok.bgc = { 0: "#fcd", 1: "#dfc", 2: "#80c65a",   // 0 is ng, 1 is ok, 2 is title
             4: "#fac", 5: "#cfa", 6: "#72bf47" };

// inner -
function uuokjudge(lval,     // @param Mix: left hand set
                   operator, // @param String: operator
                   rval) {   // @param Mix(= void): right hand set
                             // @return Number: 0 is false, 1 is true
                             // @throws Error("BAD_OPERATOR")
    var rv, ope = uustringtrim(operator.toUpperCase(), "");

    if (ope === "===") {
        rv = lval.valueOf() == rval.valueOf();
    } else if (ope === "!==") {
        rv = lval.valueOf() != rval.valueOf();
    } else {
        switch (ope) {
        case "NG":  rv = _false; break; // for assert code block
        case "IS":
        case "==":  rv =  uulike(lval, rval); break;
        case "!=":  rv = !uulike(lval, rval); break;
        case ">":   rv = lval >  rval; break;
        case ">=":  rv = lval >= rval; break;
        case "<":   rv = lval <  rval; break;
        case "<=":  rv = lval <= rval; break;
        case "&&":  rv = !!(lval && rval); break;
        case "||":  rv = !!(lval || rval); break;
        case "HAS": rv = uuhas(lval, rval); break;
        case "ISNAN":     rv = isNaN(lval); break;
        case "ISTRUE":    rv = !!lval; break;
        case "ISFALSE":   rv =  !lval; break;
        case "ISERROR":   try { lval(), rv = 0; } catch(err) { rv = 1; } break;
        case "ISINFINITY":rv = !isFinite(lval); break;
        case "INSTANCEOF":rv = lval instanceof rval; break;
        default:
            ope = ope[_replace](/IS/, "");
            rv = isFunction(uutype[ope]) ? uutype[ope](lval, ope) // extend types
               : uutype[ope] ? uutype(lval) === uutype[ope] : 2;
            if (rv === 2) {
                throw new Error("BAD_OPERATOR " + operator);
            }
        }
    }
    return +rv;
}

// uu.ng - assert
function uung(title,    // @param String: title
              lval,     // @param Mix: left value
              operator, // @param String(= "NG"): operator
              rval) {   // @param Mix(= void): right value
                        // @throws Error from judge()
    var r = uuokjudge(lval, operator || "NG", rval);

    if (!r) {
//{@debug
        debugger;
        doc.body && (doc.body.style.backgroundColor = "red");
//}@debug
        throw new Error(uustringformat("@: @ @ @", title,
                            uujsonencode(lval, 1), operator,
                            rval ? uujsonencode(rval, 1) : ""));
    }
}
//}@test

// --- JSON ---
// uu.json - mix to JSONString
function uujson(source,   // @param Mix:
                exjson) { // @param Boolean(= false): true is js ExJSONString
                          // @return JSONString/ExJSONString:
    return (exjson || !win.JSON) ? uujsonencode(source, 1)
                                 : source === void 0 ? "" // [IE8] undefined -> "undefined" bugfix
                                                     : (win.JSON.stringify(source) || "");
}
uujson.x = [
    /[^,:{}\[\]0-9\.\-+Eaeflnr-u \n\r\t]/,                      // x[0] NGWORDS
    /"(\\.|[^"\\])*"/g,                                         // x[1] UNESCAPE
    /(?:\"|\\[bfnrt\\])/g,                                      // x[2] ESCAPE
    uuhash('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\'), // x[3] SWAP ENTITY
    /[\x00-\x1f]/g];                                            // x[4] NON-ASCII TO UNICODE ENTITY

// uu.json.decode - decode JSONString
function uujsondecode(jsonString, // @param JSONString/ExJSONString:
                      exjson) {   // @param Boolean(= false): true is ExJSONString
                                  // @return Mix/Boolean: false is error
/*
    var str = jsonString.trim(), x = uujson.x;

    return (exjson || !win.JSON) ? (x[0].test(str[_replace](x[1], ""))
                                    ? _false
                                    : (new Function("return " + str))())
                                 : win.JSON.parse(str);
 */
    var str = jsonString.trim(), x = uujson.x, unescaped, evalString;

    if (exjson || !win.JSON) {
        unescaped = str[_replace](x[1], "");

        if (x[0].test(unescaped)) {
            return _false;
        }
        try {
            evalString = "return " + str;
            return (new Function(evalString))();
        } catch(err) {
            win.console && win.console.log(err + "");
        }
    }
    return win.JSON.parse(str);
}

// inner - json inspect
function uujsonencode(mix,     // @param Mix: value
                      esc,     // @param Boolean(= false): escape
                      space) { // @param Boolean(= false): add space
    var ary = [], type = uutype(mix), w, ai = -1, i, iz, q = '"', x,
        sp = space ? " " : "";

    if (mix === win) {
        return '"window"'; // window -> String("window")
    }
    // Class Instance -> '"ClassName"'
    if (type === uutype.HASH && mix.name && uu.Class[mix.name] &&
        mix instanceof uu.Class[mix.name]) {
        return q + mix.name + q;
    }
    switch (type) {
    case uutype.FUNCTION:   // Class -> "ClassName"
                            if (mix in uu.Class) { // #ref uuClass[Class].toString
                                return mix + "";
                            }
                            // Function -> "FunctionName():": { ... }
                            w = mix.name;
//{@mb
                            if (!w && (_ie || _opera)) { // [IE][OPERA] IE or Opera9.6x~10.10
                                w = mix + ""; // Function.toString()
                                w = w.slice(9, w[_indexOf]("(")); // )
                            }
//}@mb
                            ary.push('"function"' + ":" + sp + q + w + q);
                            ++ai;
    case uutype.HASH:       break;
    case uutype.NULL:
    case uutype.BOOLEAN:    return mix + "";
    case uutype.NODE:       return q + uunodepath(mix) + q; // node path
    case uutype.DATE:       return mix.toJSON();
    case uutype.NUMBER:     return isFinite(mix) ? mix + "" : "null";
    case uutype.STRING:
        x = uujson.x;
        return q + mix[_replace](x[2], function(m) {
                       return x[3][m] || m;
                   })[_replace](x[4], function(s) {
                       return "\\u00" + _num2hh[s.charCodeAt(0)];
                   }) + q;
    case uutype.ARRAY:
    case uutype.FAKEARRAY:
        for (i = 0, iz = mix.length; i < iz; ++i) {
            ary[++ai] = uujsonencode(mix[i], esc, space);
        }
        return "[" + ary.join("," + sp) + "]";
    default: // UNDEFINED
        return "";
    }
    if (toString.call(type).slice(-3) === "on]") { // [object CSSStyleDeclaration]
        w = _webkit;
        for (i in mix) {
            if (typeof mix[i] === _string && (w || i != (+i + ""))) { // isFinite(i)
                w && (i = mix.item(i));
                ary[++ai] = q + i + q + ':' + sp + q + mix[i] + q;
            }
        }
    } else { // is Hash
        for (i in mix) {
            // [IE6][IE7][IE8] host object has not hasOwnProperty
            (/*{@mb*/ !mix[_hasOwnProperty] || /*}@mb*/
             mix[_hasOwnProperty](i)) &&
                (ary[++ai] = q + i + q + ":" + sp + uujsonencode(mix[i], esc, space));
        }
    }
    return "{" + sp + ary.join("," + sp) + sp + "}";
}

// --- date ---

// uu.date - date accessor
function uudate(source) { // @param DateHash/Date/Number/String(= void):
                          // @return DateHash: { Y,M,D,h,m,s,ms,time,ISO(),GMT() }
    //  [1][get now]                 uu.date() -> DateHash
    //  [2][DateHash]                uu.date(DateHash) -> cloned DateHash
    //  [2][date to hash]            uu.date(Date) -> DateHash
    //  [3][time to hash]            uu.date(milliseconds) -> DateHash
    //  [4][DateString to hash]      uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
    //  [5][ISO8601String to hash]   uu.date("2000-01-01T00:00:00[.000]Z") -> DateHash
    //  [6][RFC1123String to hash]   uu.date("Wed, 16 Sep 2009 16:18:14 GMT") -> DateHash
    //  [7][DateHash to ISO Date String]   uu.date().ISO() -> "2000-01-01T00:00:00.000Z"
    //  [8][DateHash to GMT Date String]   uu.date().GMT() -> "Wed, 16 Sep 2009 16:18:14 GMT"
    //  [9][DateHash to RFC1123DateString] uu.date().GMT() -> "Wed, 16 Sep 2009 16:18:14 GMT"
    //  [10][DateHash to Formated Date]    uu.date().ISO().slice(0, 19).replace("T", " "); -> "2011-03-07 14:10:12"

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
                            //                 time: unix_time, ISO: func(), GMT: func() }
    return {
        Y:      date.getUTCFullYear(),      M:      date.getUTCMonth() + 1,
        D:      date.getUTCDate(),          h:      date.getUTCHours(),
        m:      date.getUTCMinutes(),       s:      date.getUTCSeconds(),
        ms:     date.getUTCMilliseconds(),  time:   date.getTime(),
        ISO:    datehashiso,                GMT:    datehashgmt,
        valueOf: function() { // @return Number:
            return date.getTime();
        },
        toString: function() { // @return ISODateString:
            return this.ISO();
        }
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
//{@mb
    if (_ie && str[_indexOf]("GMT") > 0) { // [IE6][IE7][IE8][IE9]
        str = str[_replace](/GMT/, "UTC");
    }
//}@mb
    return new Date(str[_replace](",", "")
                       [_replace](x[1], _toDate));
}

// DateHash.ISO - encode DateHash To ISO8601String
function datehashiso() { // @return ISO8601DateString: "2000-01-01T00:00:00.000Z"
    var that = this;

    return uustringformat("@-@-@T@:@:@.@Z",
               that.Y, _num2dd[that.M], _num2dd[that.D],
               _num2dd[that.h], _num2dd[that.m],
               _num2dd[that.s], ("00" + that.ms).slice(-3));
}

// DateHash.GMT - encode DateHash To RFC1123String
function datehashgmt() { // @return RFC1123DateString: "Wed, 16 Sep 2009 16:18:14 GMT"
    var rv = (new Date(this.time)).toUTCString();

//{@mb
    if (_ie && rv[_indexOf]("UTC") > 0) { // [IE6][IE7][IE8][IE9]
        // http://d.hatena.ne.jp/uupaa/20080515
        //
        // (new Date).toString() -> "Thu Sep 16 16:26:32 UTC+0900 2010"
        //                       -> "Thu Sep 16 16:26:32 GMT+0900 2010"
        rv = rv[_replace](/UTC/, "GMT");
        (rv.length < 29) && (rv = rv[_replace](/, /, ", 0")); // [IE] fix format
    }
//}@mb
    return rv;
}

// --- COLOR ---
//{@color
// uu.Class.Color - constructor
function Color(r,   // @param Number: red   (0 ~ 255)
               g,   // @param Number: green (0 ~ 255)
               b,   // @param Number: blue  (0 ~ 255)
               a) { // @param Number: alpha (0.0 ~ 1.0)
                    // @return this:
    a == null && (a = 0); // null or undefined -> 0

    this.r = r = (r < 0 ? 0 : r > 255 ? 255 : r) | 0;
    this.g = g = (g < 0 ? 0 : g > 255 ? 255 : g) | 0;
    this.b = b = (b < 0 ? 0 : b > 255 ? 255 : b) | 0;
    this.a = a =  a < 0 ? 0 : a >   1 ?   1 : a;
    this.hex = "#" + _num2hh[r] + _num2hh[g] + _num2hh[b];
    this.num = (r << 16) + (g << 8) + b;
    this.rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    this[_transparent] = !(r + g + b + a); // Boolean
}
Color[_prototype] = {
    toString:   function() { // @return String: "#000000" or "rgba(0,0,0,0)"
                    return (this.rgba === "rgba(0,0,0,0)") ? _transparent
                         : uuready.color.rgba ? this.rgba : this.hex;
                },
    argb:       function() { // @return String: "#ffffffff"
                    return "#" + _num2hh[(this.a * 255) & 0xff] +
                           _num2hh[this.r] + _num2hh[this.g] + _num2hh[this.b];
                },
    hsla:       function() { // @return Hash: { h, s, l, a }
                    return rgba2hsla(this.r, this.g, this.b, this.a);
                },
    hsva:       function() { // @return Hash: { h, s, v, a }
                    return rgba2hsva(this.r, this.g, this.b, this.a);
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
                function(h,   // @param Number(= 0): Hue        (-360 ~ 360)
                         s,   // @param Number(= 0): Saturation (-100 ~ 100)
                         l) { // @param Number(= 0): Lightness  (-100 ~ 100)
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
uuClass.Color = Color; // uu.Class.Color

// uu.color - parse color
function uucolor(expr) { // @parem Color/RGBAHash/HSLAHash/HSVAHash/String: "black", "#fff", "rgba(0,0,0,0)"
                         // @return Color:
    //  [1][Color]                               uu.color(Color)               -> Color
    //  [2][RGBAHash/HSLAHash/HSVAHash to Color] uu.color({ h:0,s:0,l:0,a:1 }) -> Color
    //  [3][W3CNamedColor to Color]              uu.color("black")             -> Color
    //  [4]["#000..." to Color]                  uu.color("#000")              -> Color
    //  [5]["rgba(,,,,)" to Color]               uu.color("rgba(0,0,0,1)")     -> Color
    //  [6]["hsla(,,,,)" to Color]               uu.color("hsla(360,1%,1%,1)") -> Color
    //  [7]["hsva(,,,,)" to Color]               uu.color("hsva(360,1%,1%,1)") -> Color

    var rv, m, n, r, g, b, a = 1;

    if (expr instanceof Color) { // [1] through
        return expr;
    }
    if (typeof expr !== _string) { // [2] convert HSLAHash / RGBAHash to Color
        return "l" in expr ? hsla2color(expr.h, expr.s, expr.l, expr.a) // HSLAHash
             : "v" in expr ? hsva2color(expr.h, expr.s, expr.v, expr.a) // HSVAHash
                           : new Color(expr.r, expr.g, expr.b, expr.a); // RGBAHash
    }
    // "Red" -> "red"
    expr = expr[_toLowerCase]();

    // [3] W3CNamedColor or cached Color?
    rv = uucolor.db[expr] || uucolor.cache[expr];
    if (rv) {
        return rv;
    }

    // parse
    if (expr.length < 8 && (m = uucolor.rex.hex.exec(expr)) ) { // [4] #fff or #ffffff
        n = expr.length > 4 ? parseInt(m[1], 16)
                            : (m = m[1].split(""),
                               parseInt(m[0]+m[0] + m[1]+m[1] + m[2]+m[2], 16));
        r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    } else {
        m = uucolor.rex.rgba.exec(uustringtrim(expr, "")); // [5][6][7]
        if (m) {
            n = m[1] === "rgb" ? 2.555 : 1;
            r = m[3] ? m[2] * n : m[2];
            g = m[5] ? m[4] * n : m[4];
            b = m[7] ? m[6] * n : m[6];
            a = m[8] ? parseFloat(m[8]) : 1;
            if (n === 1) {
                return m[1] === "hsl" ? hsla2color(r, g, b, a)
                                      : hsva2color(r, g, b, a);
            }
        }
    }
    // add cache
    return uucolor.cache[expr] = new Color(r, g, b, a);
}
uucolor.db = { transparent: new Color(0, 0, 0, 0) };
uucolor.cache = {}; // { "#123": Color, ... }
uucolor.rex = {
//  hex: /^#([\da-f]{3}(?:[\da-f]{3})?)$/, // #fff or #ffffff
    hex: /^#([\da-f]{3}([\da-f]{3})?)$/, // #fff or #ffffff [OPERA10+] bugfix
    rgba: /^(rgb|hsl|hsv)a?\(([\d\.]+)(%)?,([\d\.]+)(%)?,([\d\.]+)(%)?(?:,([\d\.]+))?\)$/,
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
    r = r / 255;
    g = g / 255;
    b = b / 255;

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

// inner - RGBA to HSVAHash
function rgba2hsva(r, g, b, a) { // @return Hash: { h, s, v, a }
    r = r / 255;
    g = g / 255;
    b = b / 255;

    var max = (r > g && r > b) ? r : g > b ? g : b,
        min = (r < g && r < b) ? r : g < b ? g : b,
        diff = max - min,
        h = 0,
        s = max ? ((diff / max * 100) + 0.5) | 0 : 0,
        v = ((max * 100) + 0.5) | 0;

    if (s) {
        h = (r === max) ? ((g - b) * 60 / diff) :
            (g === max) ? ((b - r) * 60 / diff + 120)
                        : ((r - g) * 60 / diff + 240);
    }
    return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: a };
}

// inner - HSLA to Color - ( h: 0-360, s: 0-100, l: 0-100, a: alpha )
function hsla2color(h, s, l, a) { // @return Color:
    h = (h === 360) ? 0 : h;
    s = s / 100;
    l = l / 100;

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

// inner - HSVA to Color - ( h: 0-360, s: 0-100, v: 0-100, a: alpha )
function hsva2color(h, s, v, a) { // @return Color:
    h = (h >= 360) ? 0 : h;
    s = s * 0.01;
    v = v * 2.55;

    var r = 0, g = 0, b = 0, f, p, q, t, w;

    h = h / 60;
    f = h - (h | 0);

    if (s) {
        p = (((1 - s)             * v) + 0.5) | 0;
        q = (((1 - (s * f))       * v) + 0.5) | 0;
        t = (((1 - (s * (1 - f))) * v) + 0.5) | 0;
        w = (                       v  + 0.5) | 0;

        switch (h | 0) {
        case 0: r = w; g = t; b = p; break;
        case 1: r = q; g = w; b = p; break;
        case 2: r = p; g = w; b = t; break;
        case 3: r = p; g = q; b = w; break;
        case 4: r = t; g = p; b = w; break;
        case 5: r = w; g = p; b = q;
        }
    } else {
        r = g = b = (v + 0.5) | 0;
    }
    return new Color(r * 255 + 0.5, g * 255 + 0.5, b * 255 + 0.5, a);
}

// --- initialize ---
//{@colordict
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
//}@colordict
//}@color

// --- IMAGE ---
// uu.image - image loader
//{@image
function uuimage(url,        // @param URLString/URLStringArray:
                 callback) { // @param CallbackFunction(= void): callback(response)
                             //     response.ok - Boolean: true is success
                             //     response.rv - NodeArray: image nodes. [<img>, ...]
    //  [1][load image]  uu.image(url,        function(response) { ... })
    //  [2][load images] uu.image([url, ...], function(response) { ... })

    url = uuarray(url);
    var iz = url.length,
        junc = uujunction(iz, iz, callback); // callback(response)

    uueach(url, function(v) {
        imageLoader(v, function(img, ok) {
            ok ? junc.ok(img) : junc.ng(img);
        });
    });
}

// inner - image loader
function imageLoader(url, callback) {
    function after(ok, fn) {
        while ( (fn = uuimage.fn[url].shift()) ) {
            fn(img, ok);
        }
    }

    var img = uuimage.db[url];

    if (img) { // cached or self scheduled
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
uuimage.db = {}; // { url: <img>, ... }
uuimage.fn = {}; // { url: [callback, ...] }

// uu.image.isCached - is cached
function uuimageiscached(url) { // @param URLString
    return !!uuimage.db[url];
}

// uu.image.size - get image natural dimension
function uuimagesize(node) { // @param HTMLImageElement:
                             // @return Hash: { w, h }
//{@mb
    if ("naturalWidth" in node) { // [HTML5][GECKO][WEBKIT]
//}@mb
        return { w: node.naturalWidth, h: node.naturalHeight };
//{@mb
    }
    // http://d.hatena.ne.jp/uupaa/20090602
    var rs, rw, rh, w, h, hide, meta = _datauu + "image";

    if (node.src) { // HTMLImageElement
        if (node[meta] && node[meta].src === node.src) {
            return node[meta];
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
        return node[meta] = { w: rw, h: rh, src: node.src }; // bond
    }
    return { w: node[_width], h: node[_height] };
//}@mb
}
//}@image

// --- FONT ---
//{@font

// uu.font - parse CSS::font style
function uufont(font,     // @param String: font string, eg: "12pt Arial"
                embase) { // @param Node: The em base node
                          // @return Hash: { style, weight, variant, rawfamily,
                          //                 family, formal }
                          //    style     - String: "normal", "italic", "oblique"
                          //    weight    - String: "normal", "bold", "bolder",
                          //                        "lighter", "100" ~ "900"
                          //    variant   - String: "normal", "small-caps"
                          //    rawfamily - String: "Times New Roman,Arial"
                          //    family    - String: "'Times New Roman','Arial'"
                          //    formal    - String: "{style} {variant} {weight} {size}px {family}"
                          // @throws Error("UNKNOWN_FONT_UNIT")
    // inner - measure em unit
    function _em(node) {
        var rv, div = node[_appendChild](newNode());

        div.style.cssText = uufont.BASE_STYLE + "width:12em";
        rv = div.clientWidth / 12;
        node[_removeChild](div);
        return rv;
    }

    var rv = {}, fontSize, style,
        cache = embase.uucanvascache ||
                (embase.uucanvascache = { font: {}, em: _em(embase) });

    if (!cache.font[font]) {
        // --- parse font string ---
        style = newNode().style; // dummy(div) node
        try {
            style.font = font; // parse
        } catch (err) {
            throw err;
        }
        fontSize = style.fontSize; // get font-size

        rv.size = uufont.SIZES[fontSize];
        if (rv.size) { // "small", "large" ...
            rv.size *= 16;
        } else if (fontSize.lastIndexOf("px") > 0) { // "12px"
            rv.size = parseFloat(fontSize);
        } else if (fontSize.lastIndexOf("pt") > 0) { // "12.3pt"
            rv.size = parseFloat(fontSize) * 1.33;
        } else if (fontSize.lastIndexOf("em") > 0) { // "10.5em"
            rv.size = parseFloat(fontSize) * cache.em;
        } else {
            throw new Error("UNKNOWN_FONT_UNIT");
        }
        rv.style = style.fontStyle; // normal, italic, oblique
        rv.weight = style.fontWeight; // normal, bold, bolder, lighter, 100~900
        rv.variant = style.fontVariant; // normal, small-caps
        rv.rawfamily = style.fontFamily[_replace](/[\"\']/g, "");
        rv.family = "'" + rv.rawfamily[_replace](/\s*,\s*/g, "','") + "'";
        rv.formal = [rv.style,
                     rv.variant,
                     rv.weight,
                     rv.size.toFixed(2) + "px",
                     rv.family].join(" ");
        cache.font[font] = rv; // add cache
    }
    return cache.font[font];
}
uufont.BASE_STYLE = "position:absolute;border:0 none;margin:0;padding:0;";
uufont.SCALE = {
//{@mb
    ARIAL: 1.55, "ARIAL BLACK": 1.07, "COMIC SANS MS": 1.15,
    "COURIER NEW": 1.6, GEORGIA: 1.6, "LUCIDA GRANDE": 1,
    "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
    "TREBUCHET MS": 1.55, VERDANA: 1.4,
    "MS UI GOTHIC": 2, "MS PGOTHIC": 2, MEIRYO: 1,
//}@mb
    "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1, FANTASY: 1, CURSIVE: 1
};
uufont.SIZES = {
    "xx-small": 0.512,
    "x-small":  0.64,
    smaller:    0.8,
    small:      0.8,
    medium:     1,
    large:      1.2,
    larger:     1.2,
    "x-large":  1.44,
    "xx-large": 1.728
};

// uu.font.list - enum usable font lists
function uufontlist(fonts) { // @param FontNameArray: ["Arial", "Times New Roman",
                             //                        "DeviceDependencyFont",
                             //                        "UnknownUserFont"]
                             // @return Array: [UsableFontArray, UnusableFontArray]
                             //                eg: [["Arial", "Times New Roman"],
                             //                     ["DeviceDependencyFont", "UnknownUserFont"]]
    var usable = [], unusable = [], i = 0, iz = fonts.length, a, b;

    for (; i < iz; ++i) {
        a = uufontmetric("72pt dummy");
        b = uufontmetric("72pt " + fonts[i]);

        if (a.w !== b.w || a.h !== b.h) {
            usable.push(fonts[i]);
        } else {
            unusable.push(fonts[i]);
        }
    }
    return [usable, unusable];
}

// uu.font.detect - detect the rendering font
function uufontdetect(node) { // @param Node:
                              // @return String: detected font, eg: "serif"
    var fam = uucss(node, "px").fontFamily,
        ary = fam.trim().split(","), v, i = 0,
        a, b = uufontmetric("72pt " + fam);

    for (; v = ary[i++]; ) {
        a = uufontmetric("72pt " + v);
        if (a.w === b.w && a.h === b.h) {
            return v; // match
        }
    }
    return "";
}

// uu.font.metric - measure text rect(width, height)
function uufontmetric(font,   // @param CSSFronString: "12pt Arial"
                      text) { // @param String(= "aABCDEFGHIJKLMm"):
                              // @return Hash: { w, h }
    var node = uufontmetric.cache;

    if (!node) {
        uufontmetric.cache = node = uunodeadd();

        node.style.cssText = uufont.BASE_STYLE +
            "top:-10000px;left:-10000px;text-align:left;visibility:hidden";
    }
    node.style.font = font;
    node[ /*{@mb*/ _ie678 ? "innerText" : /*}@mb*/
         "textContent"] = text || "aABCDEFGHIJKLMm";
    return { w: node.offsetWidth,
             h: node.offsetHeight };
}
uufontmetric.cache = 0; // [lazy] measure node
//}@font

// --- CANVAS ---
//{@canvas

// uu.canvas - <canvas>
function uucanvas(width,         // @param Number(= 300):
                  height,        // @param Number(= 150):
                  order,         // @param String(= uu.config.canvas.order): backend order
                  placeHolder) { // @param Node(= void): placeholder Node
                                 // @return Node: <canvas>
    var canvas = newNode(
/*{@mb*/                 _ie678 ? "CANVAS" : /*}@mb*/ // [IE6][IE7][IE8][!] need upper case
                         "canvas");

    canvas[_width]  = width  == null ? 300 : width;
    canvas[_height] = height == null ? 150 : height;

    placeHolder || (placeHolder = doc.body[_appendChild](newNode())); // <body>...<div /></body>
    placeHolder[_parentNode].replaceChild(canvas, placeHolder);

//{@mb
    if (_ie678) {
        return uucanvas.build(canvas, order || uuconfig.canvas.order); // order = "SFV"
    }
//}@mb
    return canvas;
}

// --- initialize ---
uuready("window", function() {
    uucanvas.init && uucanvas.init();
    uuready.canvas = _true;
    uureadyfire("canvas", uutag("canvas"));
});
//}@canvas

// --- AUDIO ---
//  <audio autoplay loop="true">
//      <source src="hoge.mp3" type="audio/mpeg" />
//      <source src="audio.ogg" type="audio/ogg; codecs=vorbis">
//  </audio>
//
// Audio spec: http://www.w3.org/TR/html5/video.html
//  interface HTMLMediaElement : HTMLElement {
//
//    // error state
//    readonly attribute MediaError error;              -> audio.state().error
//
//    // network state
//             attribute DOMString src;                 -> x
//    readonly attribute DOMString currentSrc;          -> audio.attr("src")
//    readonly attribute unsigned short networkState;   -> x
//    const unsigned short NETWORK_EMPTY = 0;
//    const unsigned short NETWORK_IDLE = 1;
//    const unsigned short NETWORK_LOADING = 2;
//    const unsigned short NETWORK_NO_SOURCE = 3;
//             attribute DOMString preload;             -> x
//    readonly attribute TimeRanges buffered;           -> x
//    void load();                                      -> x
//    DOMString canPlayType(in DOMString type);         -> x
//
//    // ready state
//    readonly attribute unsigned short readyState;     -> x
//    const unsigned short HAVE_NOTHING = 0;
//    const unsigned short HAVE_METADATA = 1;
//    const unsigned short HAVE_CURRENT_DATA = 2;
//    const unsigned short HAVE_FUTURE_DATA = 3;
//    const unsigned short HAVE_ENOUGH_DATA = 4;
//    readonly attribute boolean seeking;               -> x
//
//    // playback state
//             attribute float currentTime;             -> audio.attr("currentTime")
//    readonly attribute float startTime;               -> audio.attr("startTime")
//    readonly attribute float duration;                -> audio.state().duration
//    readonly attribute boolean paused;                -> audio.state().paused
//             attribute float defaultPlaybackRate;     -> x
//             attribute float playbackRate;            -> x
//    readonly attribute TimeRanges played;             -> x
//    readonly attribute TimeRanges seekable;           -> x
//    readonly attribute boolean ended;                 -> audio.state().ended
//             attribute boolean autoplay;              -> uu.audio(src, { audoplay: true })
//             attribute boolean loop;                  -> audio.attr("loop")
//    void play();                                      -> audio.play()
//    void pause();                                     -> audio.pause()
//
//    // controls
//             attribute boolean controls;              -> x
//             attribute float volume;                  -> audio.attr("volume")
//             attribute boolean muted;                 -> x
//  };
// --- support events ---
//  bind("pause,ended,error,play,playing,canplay,timeupdate,durationchange");

//{@audio
// uu.audio
function uuaudio(src,        // @param URLString: url or ""
                 option,     // @param Hash: { loop, parent, volume, autoplay, startTime }
                             //     loop - Boolean(= false):
                             //     parent - Node: parent Node
                             //     volume - Number(= 0.5): 0.0 ~ 1.0
                             //     autoplay - Boolean(= true):
                             //     startTime - Number(= 0): start time
                 callback) { // @param CallbackFunction:

    // create uu.Class.Audio instance
    uu("Audio", src, uuarg(option, {
        loop:       _false,
        parent:     doc.body,
        volume:     0.5,
        autoplay:   _true,
        startTime:  0
    }), callback);
}

uuClass("Audio", {
    _muted:         false,
    _primaryVolume: 0,  // mute before
    init:           AudioInit,      // init(src:URLString, option:Hash, callback:Function)
    attr:           AudioAttr,      // attr(key:String/Hash = void,
                                    //      value:Number/Boolean = void):String/Hash/Number/Boolean
                                    //  [1][get items] attr() -> { src, loop, startTime, volume,
                                    //                             currentTime, duration }
                                    //  [2][mix items] attr({ key: value, ... })
                                    //  [3][get item]  attr(key) -> value
                                    //  [4][set item]  attr(key, value)
                                    //      loop - Boolean: true is loop
                                    //      startTime - Nunber: 0 ~
                                    //      volume - Number: 0.0 ~ 1.0
                                    //      currentTime - Nunber: 0 ~
    play:           AudioPlay,      // play()
    seek:           AudioSeek,      // seek(currentTime:Number)
    stop:           AudioStop,      // stop(close:Boolean = false)
    mute:           AudioMute,      // mute(unmute:Boolean = false)
    pause:          AudioPause,     // pause()
    state:          AudioState,     // state():Hash - { error, ended, closed, paused,
                                    //                  playing, condition }
                                    //  error - Boolean:
                                    //  ended - Boolean:
                                    //  closed - Boolean:
                                    //  paused - Boolean:
                                    //  playing - Boolean:
                                    //  condition - String: "error", "closed", "paused", "playing"
    isMuted:        AudioIsMuted,   // isMuted():Boolean
    isReady:        AudioIsReady,   // isReady():Boolean
    isCanPlay:      AudioIsCanPlay, // isCanPlay():Boolean
    isPlaying:      AudioIsPlaying, // isPlaying():Boolean
    bind:           AudioBind,      // bind(eventTypes:String, evaluator:Function)
    unbind:         AudioUnbind,    // unbind(eventTypes:String, evaluator:Function)
    msgbox:         AudioMsgBox,    // msgbox(msg:String,
                                    //        param1:Mix = void, param2:Mix = void):Boolean/Hash/void
    toString:       function() {
        return this.ao.name;
    }
});

// Audio.init
function AudioInit(src,        // @param URLString: "http://.../music.mp3", "music.mp3" or ""
                   option,     // @param Hash: { autoplay, loop, startTime, parent, volume }
                               //   option.autoplay - Boolean(= false): auto play
                               //   option.loop - Boolean(= false):
                               //   option.startTime - Number(= 0): start time
                               //   option.parent - Node(= <body>): <object> parent node
                               //   option.volume - Number(= 0.5): 0.0 ~ 1.0
                   callback) { // @param CallbackFunction: callback(this)
    var that = this,
        backends = {
            A: "HTML5Audio",
/*{@mb*/    F: "FlashAudio", /*}@mb*/
            N: "NoAudio"
        };

    uusome((uuconfig.audio.order || "N").split(""), function(klass) { // klass = "A"
        if (klass) {
            klass = backends[klass] || ""; // "HTML5Audio" <- "A"

            if (uuClass[klass] && uuClass[klass].isReady(src)) { // static call
                uu(klass, src, option, function(ao) { // @param AudioObjectInstance:
                    that.ao = ao;
                    callback(that);
                });
                return _true;
            }
        }
        return _false;
    });
}

// Audio.attr
function AudioAttr(key,     // @param String/Hash(= void): key
                   value) { // @param String/Number/Boolean(= void): value
                            // @return Hash/void: { src, loop, volume,
                            //                      duration, startTime, currentTime }
                            //   src         - String:
                            //   loop        - Boolean:
                            //   volume      - Number/String: 0.0 ~ 1.0, "+0.1", "-0.1"
                            //   duration    - Number:
                            //   startTime   - Number: start time
                            //   currentTime - Number/String: current time, 0 ~, "+10", "-10"
    var rv = this.ao.attr(), i, val, undef;

    switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: return key === undef ? rv : rv[key];
    case 3: key = uupair(key, value);
    }
    for (i in key) {
        val = key[i];
        switch (i) {
        case "startTime":
        case "currentTime": val = uunumberexpand(rv[i], val); break;
        case "volume":      val = uunumberrange(0, uunumberexpand(rv[i], val), 1);
        }
        this.ao.attr(i, val); // set(key, value)
    }
    return;
}

// Audio.play
function AudioPlay() {
    switch (this.ao.state().condition) {
    case "ended":
    case "paused": this.ao.play();
    }
}

// AudioSeek
function AudioSeek(currentTime) { // @param Number: current time
    var ao = this.ao, curt = parseFloat(currentTime);

    if (this.isPlaying()) {
        ao.pause();
        ao.attr("currentTime", curt);
        ao.play();
    } else {
        ao.attr("currentTime", curt);
    }
}

// Audio.stop
function AudioStop(close) { // @param Boolean(= false):
    this.ao.stop(close);
}

// Audio.mute
function AudioMute(unmute) { // @param Boolean(= false): true is unmute
    // [1][toggle mute] audio.mute(audio.isMuted())

    if (unmute) {
        if (this._muted) {
            this.attr("volume", this._primaryVolume);
            this._muted = _false;
        }
    } else if (!this._muted) {
        this._primaryVolume = this.attr("volume");
        this.attr("volume", 0);
        this._muted = _true;
    }
}

// Audio.pause
function AudioPause() {
    this.ao.state().playing && this.ao.pause();
}

// Audio.state
function AudioState() { // @return Hash: { error, ended, closed, paused,
                        //                 playing, condition }
    return this.ao.state();
}

// Audio.isMuted
function AudioIsMuted() { // @return Boolean:
    return this._muted;
}

// Audio.isReady
function AudioIsReady() { // @return Boolean:
    if (this.ao) {
        var state = this.ao.state();

        return !(state.error || state.closed);
    }
    return _false;
}

// Audio.isCanPlay
function AudioIsCanPlay() { // @return Boolean:
    return this.ao.isCanPlay();
}

// Audio.isPlaying
function AudioIsPlaying() { // @return Boolean:
    return this.ao.state().playing;
}

// Audio.bind
function AudioBind(eventTypes, // @param String:
                   callback) { // @param CallbackFunction:
    uuevent(this.ao.audio, eventTypes, callback);
}

// Audio.unbind
function AudioUnbind(eventTypes, // @param String:
                     callback) { // @param CallbackFunction:
    uueventunbind(this.ao.audio, eventTypes, callback);
}

// Audio.msgbox
function AudioMsgBox(msg,      // @param String: msg
                     param1,   // @param Mix(= void): param1
                     param2) { // @param Mix(= void): param2
                               // @return Boolean/Hash/void:

    //   [1][attr]  msgbox("attr", key:String/Hash = void,
    //                             value:Number/Boolean = void):Boolean/String/Number
    //   [2][play]  msgbox("play"):Boolean - true is playing, false is paused
    //   [3][stop]  msgbox("stop", close:Boolean = false)

    switch (msg) {
    case "attr": return this.attr(param1, param2);
    case "play": return this.play();
    case "stop": return this.stop(param1);
    }
    return;
}

uu.Class("HTML5Audio", {
    init:           HTML5AudioInit,     // init(src:String, option:Hash, callback:Function)
    attr:           HTML5AudioAttr,     // attr(key:String/Hash, value:Mix = void):Hash/void
                                        //      { src, loop, volume, duration, startTime, currentTime }
    play:           HTML5AudioPlay,     // play()
    stop:           HTML5AudioStop,     // stop(close:Boolean = false)
    pause:          HTML5AudioPause,    // pause()
    state:          HTML5AudioState,    // state():Hash - { error, ended, closed, paused,
                                        //                  playing, condition }
    isCanPlay:      HTML5AudioIsCanPlay // isCanPlay():Boolean
}, {
    isReady:        function(src) {     // @param String: "music.mp3" or ""
                                        // @return Boolean:
        if (win.HTMLAudioElement) {
            var macSafari = (_env.os === "mac" && _env.safari);

            if (src === "") {
                return _true;
            }
            if (_webkit && /\.mp3$/i.test(src)) {
                return _env.browser > 4; // Safari4=WebKit533, Safari5=WebKit534
            }
            return /\.mp3$/i.test(src) ? (!macSafari && (_webkit || _env.ie9)) // mp3
                 : /\.og.$/i.test(src) ? (_gecko || _env.chrome || _opera)     // ogg, oga, ogx
                 : /\.m4a$/i.test(src) ? _webkit                               // m4a
                 : /\.wav$/i.test(src) ? (!macSafari && (_gecko || _opera))    // wav
                 : _false;
        }
        return _false;
    }
});

// HTML5Audio.init
function HTML5AudioInit(src,        // @param URLString: "music.mp3" or ""
                        option,     // @param Hash: { node, loop, volume, startTime, autoplay }
                        callback) { // @param CallbackFunction: callback(this)
    var that = this, audio;

    this.audio = null;
    this._canplay = _false;
    // glue
    audio = option.node;
    if (audio) {
        audio.src || (audio.src = src);
    } else {
        audio = win.Audio ? new win.Audio()
                          : newNode("audio"); // [IE9beta]
        audio.src = src;
    }
    audio[_parentNode] || uunodeadd(audio);
    this.audio = audio;

    if (audio) {
        //  [iOS4.1][FIX] http://twitter.com/uupaa/status/25485203353
        //  audio.loop = this._loop = option.loop || false;
        this._loop = option.loop || _false;
        audio.volume = option.volume || 0.5;
        this._closed = _false;
        this._startTime = option.startTime || 0;
        this._lastAction = "";

        // HTMLAudioElement.instance
        audio.instance = this;

        // audio.loop
        // [iOS4.1][FIX] http://twitter.com/uupaa/status/25485203353
        uuevent(audio, "ended", function() {
            if (that._closed || that._lastAction === "stop") {
                return;
            }
            if (that._loop) {
                that.attr("currentTime", that._startTime); // rewind
                that.play();
            } else {
                audio.pause(); // ended -> pause
            }
        });
        uuevent(audio, "canplay", function() {
            that._canplay = _true;
        });
        uuevent(audio, "error", function() {
            that._canplay = _false;
        });

        // autoplay
        if (option.autoplay && audio.src) {
            setTimeout(function() {
                that.play();
            }, 100);
        }
    }
    callback(this);
}

// HTML5Audio.attr
function HTML5AudioAttr(key,     // @param String/Hash(= void):
                        value) { // @param Mix(= void):
                                 // @return Hash/void: { src, loop, volume, duration,
                                 //                      startTime, currentTime }
    var rv, audio = this.audio || {}, i, v, undef;

    switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: rv = {
                src:        audio.src || "",
                loop:       this._loop,
                volume:     audio.volume || 0,
                duration:   audio.duration || 0,
                startTime:  this._startTime,
                currentTime: audio.currentTime || 0
            };
            return key === undef ? rv : rv[key];
    case 3: key = uupair(key, value);
    }
    for (i in key) {
        v = key[i];
        switch (i) {
//      case "loop":        audio.loop = this._loop = v; break;
        case "loop":        this._loop = v; break;
        case "volume":      audio.volume = v; break;
        case "startTime":   this._startTime = v; break;
        case "currentTime":
            try {
                audio.currentTime = v;
            } catch (err) {
                uu.log("ERROR @, duration = @, currentTime = @", audio.error, audio.duration, audio.currentTime);
            }
        }
    }
    return;
}

// HTML5Audio.play
function HTML5AudioPlay() {
    if (!this._closed) {
        this._lastAction = "play";
        this.audio.play();
    }
}

// HTML5Audio.stop
function HTML5AudioStop(close) { // @param Boolean(= false):
    var audio = this.audio;

    if (close) {
        this._closed = _true;
        this._canplay = _false;
        uueventunbind(audio, "ended");
        uueventfire(audio, "ended");
        uunoderemove(audio, _true); // removeAll
    } else if (this.state().playing) {
        this._lastAction = "stop";
        audio.pause();
        this.attr("currentTime", this._startTime); // reset
    }
}

// HTML5Audio.pause
function HTML5AudioPause() {
    if (this.state().playing) {
        this._lastAction = "pause";
        this.audio.pause();
    }
}

// HTML5Audio.state
function HTML5AudioState() { // @return Hash: { error, ended, closed, paused,
                             //                 playing, condition }
    var audio  = this.audio,
        error  = audio.error,
        ended  = audio.ended  || _false,
        closed = this._closed,
        paused = audio.paused || _false,
        stoped = this._lastAction === "stop",
        condition;

    if (stoped && paused) {
        ended  = _true;
        paused = _false;
    }
    condition = !audio ? "error"
              : closed ? "closed"
              : error  ? "error"
              : paused ? "paused"
              : ended  ? "ended" : "playing";
    return {
        error:      error,
        ended:      ended,
        closed:     closed,
        paused:     paused,
        playing:    condition === "playing",
        condition:  condition,
        toString:   function() {
            return this.condition;
        }
    };
}

// HTML5Audio.isCanPlay
function HTML5AudioIsCanPlay() { // @return Boolean
    return this._canplay;
}

//{@mb
uu.Class("FlashAudio", {
    init:           FlashAudioInit,     // init(src:String, option:Hash, callback:CallbackFunction)
    attr:           FlashAudioAttr,     // attr(key:String/Hash, value:Mix = void):Hash/void
                                        //      { src, loop, volume, duration, startTime, currentTime }
    play:           FlashAudioPlay,     // play()
    stop:           FlashAudioStop,     // stop(close:Boolean = false)
    pause:          FlashAudioPause,    // pause()
    state:          FlashAudioState,    // state():Hash - { error, ended, closed, paused,
                                        //                  playing, condition }
    isCanPlay:      FlashAudioIsCanPlay // isCanPlay():Boolean
}, {
    isReady:        function(src) {     // @param String: "music.mp3" or ""
                                        // @return Boolean:
        if (src === "") {
            return _true;
        }
        if (/\.mp3$/i.test(src)) {
            return _env.flash && uustat(uuconfig.audio.swf); // "uu.audio.swf"
        }
        return _false;
    }
});

// FlashAudio.init
function FlashAudioInit(src,        // @param String: "music.mp3" or ""
                        option,     // @param Hash: { node, loop, volume, startTime, autoplay }
                        callback) { // @param CallbackFunction: callback(this)

    // callback from ExternalInterface.call()
    function handleFlash(xid, msg, param1, param2) {
        switch (msg) {
        case "init":
            that.flash.xiFlashAudioSetAttr({
                src:       src,
                loop:      option.loop   || _false,
                volume:    option.volume || 0.5,
                startTime: option.startTime || 0
            });
            callback(that);
            option.autoplay && that.play();
            break;
        default:
            uueventfire(audio, msg, param1, param2);
        }
    }

    var that = this, audio, container;

    // glue
    audio = option.node;
    audio || (audio = newNode());
    audio[_parentNode] || uunodeadd(audio);
    this.audio = audio; // event source
    this.flash = null;  // backend object

    // FlashAudio.instance
    audio.instance = this;

    // create hidden container
    container = uu.id("uuAudioContainer");

    if (!container) {
        container = newNode();
        container.style.cssText = "position:absolute;top:-9999px;";
        doc.body.appendChild(container);
    }

    this.flash = uuflash(uuconfig.audio.swf,
                         { width: 1, height: 1, parent: container },
                         handleFlash);
}

// FlashAudio.attr
function FlashAudioAttr(key,     // @param String/Hash(= void):
                        value) { // @param Mix(= void):
                                 // @return Hash/void: { src, loop, volume, duration,
                                 //                      startTime, currentTime }
    var rv, flash = this.flash, undef;

    switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: rv = flash.xiFlashAudioGetAttr();
            return key === undef ? rv : rv[key];
    case 3: key = uupair(key, value);
    }
    flash.xiFlashAudioSetAttr(key);
    return;
}

// FlashAudio.play
function FlashAudioPlay() {
    this.state().closed || this.flash.xiFlashAudioPlay();
}

// FlashAudio.stop
function FlashAudioStop(close) { // @param Boolean(= false):
    var flash = this.flash, attr;

    if (close) {
        flash.xiFlashAudioSetAttr({ volume: 0 }); // puchi noise
        flash.xiFlashAudioStop(_true);
        uunoderemove(this.audio, _true); // removeAll
    } else if (this.state().playing) {
        attr = flash.xiFlashAudioGetAttr(); // get current volume
        flash.xiFlashAudioSetAttr({ volume: 0 }); // puchi noise
        flash.xiFlashAudioStop(_false);
        flash.xiFlashAudioSetAttr({ currentTime: attr.startTime,
                                    timeupdate: 1, // rewind
                                    volume: attr.volume }); // volume
    }
}

// FlashAudio.pause
function FlashAudioPause() {
    this.state().playing && this.flash.xiFlashAudioPause();
}

// FlashAudio.state
function FlashAudioState() { // @return Hash: { error, ended, closed, paused,
                             //                 playing, condition }
    var rv = this.flash.xiFlashAudioGetState();

    rv.toString = function() {
        return this.condition;
    };
    return rv;
}

// FlashAudio.isCanPlay
function FlashAudioIsCanPlay() { // @return Boolean
    return this.flash.xiFlashAudioCanPlay();
}

//}@mb

uu.Class("NoAudio", {
    init:           function(src, option, callback) {
        callback(this);
    },
    attr:           uunop,
    play:           uunop,
    stop:           uunop,
    pause:          uunop,
    state:          uupao({ closed: _true, toString: uupao("closed") }),
    isCanPlay:      uupao(_false)
}, {
    isReady:        uupao(_true)
});

// --- initialize ---
uuready("window", function() {
    uuready.audio = _true;
    uureadyfire("audio");
});
//}@audio

//{@video
// uu.video
function uuvideo(src,        // @param URLString:
                 option,     // @param Hash: { loop, parent, volume, autoplay, startTime }
                             //     loop - Boolean(= false):
                             //     parent - Node: parent Node
                             //     volume - Number(= 0.5): 0.0 ~ 1.0
                             //     autoplay - Boolean(= true):
                             //     startTime - Number(= 0): start time
                 callback) { // @param CallbackFunction:
/* TODO: impl
    uu("Video", src, uuarg(option, {
        loop:       _false,
        parent:     doc.body,
        volume:     0.5,
        autoplay:   _true,
        startTime:  0
    }), callback);
 */
}
// --- initialize ---
uuready("window", function() {
    uuready.video = _true;
    uureadyfire("video");
});
//}@video

// --- FLASH ---
// uu.flash - create flash <object> node
//{@flash
//{@mb
function uuflash(url,        // @param String: url, eg: "example.swf"
                 param,      // @param Hash(= { xid, width, height, parent, nowrap, nocache,
                             //                 wmode, quality, flashVars, allowScriptAccess, ... });
                             //   param.xid - String(= "external{{uniqueID}}"): ExternalInterface.objectID
                             //   param.width - String/Number(= "100%"):
                             //   param.height - String/Number(= "100%"):
                             //   param.parent - Node(= <body>): <object> parent node
                             //   param.nowrap - Boolean(= false): false is wrap <div>, true is nowrap
                             //   param.nocache - Boolean(= false): false is cache, true is nocache
                             //   param.wmode - String(= ""): "transparent", "opaque", ...
                             //   param.quality - String(= ""): "low", "medium", "high", "best", "autolow", "autohigh"
                             //   param.flashVars - String(= ""): "key=value&key=value..."
                             //   param.allowNetworking - String(= ""): see AS3 spec
                             //   param.allowScriptAccess - String(= "always"): "always", "sameDomain", "never"
                 callback) { // @param CallbackFunction(= void): ExternalInterface callback(xid, action, param)
                             //   argument.xid - String: xid is ExternalInterface.objectID
                             //   argument.msg - String: eg: "init", "loadend", "canplay", ...
                             //   argument.param - Mix(= void): callback param
                             // @return Node: <object>

    //  [1][div wrapped] uu.flash("a.swf")  -> <body><div>{{<object />}}</div></body>
    //                                               ~~~~~              ~~~~~~ <- wrapped new <div>
    //  [2][nowrap]      uu.flash("a.swf", { parent: <canvas>, nowrap: true })
    //                                      -> <canvas>{{<object />}}</canvas>
    //  [3][nocache]     uu.flash("a.swf", { nocache: true })
    //                                      -> <body><div>{{<object><param name="movie" value="a.swf?12345" /></object>}}</div></body>
    //                                                                                              ~~~~~~
    //  [4][with xid]    uu.flash("a.swf", { xid: "externalAudio1" })
    //                                      -> <body><div>{{<object id="externalAudio1" />}}</div></body>
    //                                                              ~~~~~~~~~~~~~~~~~~~
    //  [5][callback]    uu.flash("a.swf", { xid: "externalAudio1" }, callback)
    //                                      -> <body><div>{{<object id="externalAudio1" />}}</div></body>
    //                                          callback("externalAudio1", "init")
    //                                          callback("externalAudio1", "play")
    //                                          callback("externalAudio1", "playing")

    // callback from ExternalInterface.call()
    function handleFlash(msg,     // @param String: "init", "error", "click", ...
                         param1,  // @param Mix(= void):
                         param2,  // @param Mix(= void):
                         async) { // @param Boolean(= false): true is async, false is sync
                                 // @return Mix/undefine: callback result (sync only)
        if (async) {
            setTimeout(function() {
                callback.call(that, xid, msg, param1, param2); // async
            }, 0);
        } else {
            return callback.call(that, xid, msg, param1, param2); // sync
        }
    }

    var that = this,
        pm = uuarg(param, { width: "100%", height: "100%",
                            xid: "external" + uunumber(),
                            allowScriptAccess: "always" }),
        xid = pm.xid, node, fragment,
        parent = pm.parent || doc.body;

    if (pm.nocache) {
        url += /\?/.test(url) ? "&" : "?";
        url += +new Date;
    }

    fragment = uuflashfragment(url, xid, pm.width, pm.height, pm);

    callback && (uu.dmz[xid] = handleFlash); // uu.dmz[xid] = handler

    if (pm.nowrap) {
        parent.innerHTML = fragment; // <canvas><object /></canvas>
        return parent[_firstChild];  // return <object> or <embed> node
    }
    node = parent.appendChild(newNode());
    node.innerHTML = fragment; // <body><div><object /></div></body>
    return node[_firstChild];  // return <object> or <embed> node
}

// uu.flash.fragment - build HTMLObjectFragmentString
function uuflashfragment(url,     // @param String: url
                         xid,     // @param String: ExternalInterface.objectID
                         width,   // @param Number/String:
                         height,  // @param Number/String:
                         param) { // @param Hash:
                                  // @return HTMLObjectFragmentString: "<object...>" or "<embed ...>"

    //  <object id="{{xid}}" width="{{width}}" height="{{height}}" classid="clsid:d27...">
    //      <param name="movie" value="{{url}}" />
    //      <param name="allowScriptAccess" value="{{param.allowScriptAccess}}" />
    //      <param name="{{param.key}}" value="{{param.value}}" />...
    //  </object>
    //
    //  <embed id="{{xid}}" name="{{xid}}" width="{{width}}" height="{{height}}"
    //          type="application/x-shockwave-flash" src="{{url}}"
    //          allowScriptAccess="{{param.allowScriptAccess}}"
    //          {{param.key}}="{{param.value}}" ...>
    //  </embed>

    var paramArray = [], i,
        ignore = { xid: 1, width: 1, height: 1, parent: 1, nowrap: 1, nocache: 1 };

    if (_ie) {
        // add <param name="movie" value="{{url}}" />
        param.movie = url;

        for (i in param) {
            i in ignore ||
                paramArray.push(uustringformat('<param name="@" value="@" />', i, param[i]));
        }
        return uustringformat('<object id="@" width="@" height="@" ' +
                    'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">@</object>',
                    xid, width, height, paramArray.join(""));
    }
    for (i in param) {
        i in ignore ||
            paramArray.push(uustringformat('@="@"', i, param[i]));
    }
    return uustringformat('<embed id="@" name="@" width="@" height="@" ' +
                'type="application/x-shockwave-flash" src="@" @ />',
                xid, xid, width, height, url,
                paramArray.join(" "));
}
//}@mb
//}@flash

// --- COOKIE ---
//{@cookie
// uu.cookie - load and parse cookie
function uucookie(prefix) { // @param String: prefix, namespace
                            // @return Hash: { key: "value", ... }
    var rv = {}, i = 0, ary, pair, kv, cut = prefix.length;

    if (doc.cookie) {

        // retrieve KeyValue pairs
        //      collect: "{{prefix}}key=value"
        //      ignore:  "key=value"
        //

        ary = doc.cookie.split("; "); // ["k=v", "k2=v2"] <- "k=v; k2=v2".split("; ")

        for (; pair = ary[i++]; ) {
            kv = pair.split("="); // ["k", "v"]

            if (!kv[0][_indexOf](prefix)) {
                rv[kv[0].slice(cut)] = decodeURIComponent(kv[1] || "");
            }
        }
    }
    return rv;
}

// uu.cookie.save - save cookie
function uucookiesave(prefix, // @param String: prefix, namespace
                      data,   // @param Hash: { key: "value", ... }
                      date) { // @param UTCDateString/Date(= void):
                              // @return Number: last KeyValue pair length

//  [1][save exipre +3days]    uu.cookie.save("my", { key: value }, +(new Date) + 86400 * 3);
//  [2][save temporary cookie] uu.cookie.save("my", { key: value }, +(new Date) + 86400 * 3);

    date = date ? "; expires=" + (isString(date) ? date
                                                 : new Date(+date).toUTCString())
                : "";
    var rv = "", i, secure = "";

    try {
        location.protocol === "https:" && (secure = "; secure"); // [IE][FIX] stand alone
    } catch(err) {}

    for (i in data) {
        rv = prefix + i + "=" + encodeURIComponent(data[i]);

        doc.cookie = rv + date + secure;
    }
    return rv.length;
}
//}@cookie

// --- STORAGE ---
// WebStorage spec:     http://www.w3.org/TR/webstorage/#storage
// WebStorage spec(IE): http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx
// SharedObject spec:   http://livedocs.adobe.com/flash/9.0/ActionScriptLangRefV3/flash/net/SharedObject.html
// UserData spec:       http://msdn.microsoft.com/en-us/library/ms531424(VS.85).aspx
// Storage Limit:       http://d.hatena.ne.jp/uupaa/20100106

// +---------------+---------------------+----+--------+----+----+----+----+----+-----+
// | Storage Class | Storage Backend     | Min|    Max |Fx  |GC  |IE  |Sa  |iSa |Op   |
// +---------------+---------------------+----+--------+----+----+----+----+----+-----+
// | LocalStorage  | HTML5::WebStorage   |1.8M|     5M |  3+|3+  |8+  |  4+| 3.1|10.5+|
// |               |                     |    |        |5.0M|2.5M|4.7M|2.5M|2.5M|1.8M |
// | FlashStorage  | Flash::SharedObject |  0 |100k(1M)|   o|   o|   o|   o|  o |  o  |
// | IEStorage     | IE::userData        |    |    63k |   x|   x|  6+|   x|  x |  x  |
// | CookieStorage | Cookie              |  0 |   3.8k |   o|   o|   o|   o|  o |  o  |
// | MemStorage    | JavaScript::Object  |    |infinity|   o|   o|   o|   o|  o |  o  |
// +---------------+---------------------+----+--------+----+----+----+----+----+-----+

//{@storage
uuClassSingleton("Storage", {
    init: function() {
        var that = this, config = uuconfig.storage,
            backends = {
                L: "LocalStorage",
/*{@mb*/        F: "FlashStorage",
                I: "IEStorage",         /*}@mb*/
/*{@cookie*/    C: "CookieStorage",     /*}@cookie*/
                M: "MemStorage"
            };

        uusome((config.order || "M").split(""), function(klass) { // klass = "L"
            klass = backends[klass] || ""; // "LocalStorage" <- "L"

            if (uuClass[klass] && uuClass[klass].isReady()) {
                try {
                    uu(klass, function(so) { // @param StorageObjectInstance:
                        that.so = config.space &&
                                  config.space > so.info().max ? uu("MemStorage")
                                                               : so;
                        setTimeout(function() {
                            uuready.storage = _true;
                            uureadyfire("storage", uu.storage = that);
                        }, 0);
                    });
                    return _true;
                } catch(err) {}
            }
            return _false;
        });
    },
    key: function(index) {
        return this.so.key(index) || "";
    },
    info: function() {
        return this.so.info();
    },
    item: function(key, value) {
        return this.so.item(key, value);
    },
    clear: function(key) {
        this.so.clear(key);
    }
});

uuClassSingleton("LocalStorage", {
    init: function(callback) {
        this.so = win.localStorage;
        callback(this);
    },
    key: function(index) {
        return ( //{@mb
                 (index < 0 || index >= this.so.length) ? "" :
                 //}@mb
                 (this.so.key(index) || "") );
    },
    info: function() {
        var so = this.so, used = 0, i = 0, iz, /*{@mb*/ remain, /*}@mb*/
            limit = _webkit ? 2.5   * 1024 * 1024 - 260 // WebKit      (2.5MB)
/*{@mb*/          : _gecko  ? 5     * 1024 * 1024 - 260 // Firefox3.5+ (5.0MB)
                  : _opera  ? 1.875 * 1024 * 1024 - 128 // Opera10.50  (1.875MB)
                  : _ie     ? 5     * 1000 * 1000       // IE8+        (4.768MB) /*}@mb*/
                  : 0;
/*{@mb*/
        if (_ie && "remainingSpace" in so) { // [IE8][IE9] storage.remainingSpace
            remain = so.remainingSpace;
            if (limit < remain) { // expand free space
                limit = 5 * 1000 * 1000; // 5MB
            }
            used = limit - remain;
        } else { /*}@mb*/
            for (iz = so.length; i < iz; ++i) {
                used += so.getItem(so.key(i)).length;
            }
/*{@mb*/}/*}@mb*/
        return _storage.info(used, limit, so.length, "LocalStorage");
    },
    item: function(key, value) {
        var so = this.so, rv, i, iz;

        switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
        case 1: for (rv = {}, i = 0, iz = so.length; i < iz; ++i) {
                    key = so.key(i);
                    rv[key] = so.getItem(key + "") || "";
                }
                return rv;
        case 2: return so.getItem(key + "") || "";
        case 3: key = uupair(key, value);
        }
        for (i in key) { // [4]
            try {
                so[i] = ""; // [iPhone][FIX] pre clear. http://d.hatena.ne.jp/uupaa/20100106
                so[i] = key[i] + ""; // [IE][FIX] crash care
            } catch(err) { // catch Error("QUOTA_EXCEEDED_ERR")
                return _false;
            }
            if (so[i] !== key[i]) { // verify
                return _false;
            }
        }
        return _true;
    },
    clear: function(key) {
        key === void 0 ? this.so.clear()
                       : this.so.removeItem(key + ""); // [IE][FIX] crash care
    }
}, {
    isReady: uupao(!!win.localStorage)
});

//{@mb
uuClassSingleton("FlashStorage", {
    init: function(callback) {
        var that = this;

        // callback from ExternalInterface.call()
        function handleFlash(xid, msg /*, param1, param2 */) {
            switch (msg) {
            case "init":
                callback(that);
                break;
            }
        }
        this.so = uuflash(uuconfig.storage.swf,
                          { width: 1, height: 1 }, handleFlash);
    },
    key: function(index) {
        return this.so.key(index) || "";
    },
    info: function() {
        return this.so.info();
    },
    item: function(key, value) {
        switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
        case 1: return this.so.allItem();
        case 2: return this.so.getItem(key) || "";
        case 3: key = uupair(key, value);
        }
        return this.so.setItem(key);
    },
    clear: function(key) {
        key === void 0 ? this.so.clear() : this.so.removeItem(key);
    }
}, {
    isReady: function() {
        return _env.flash && uustat(uuconfig.storage.swf); // "uu.storage.swf"
    }
});

uuClassSingleton("IEStorage", {
    init: function(callback) {
        var so = uunodeadd("script", doc.head); // <script>

        so.id = "uuiestorage";
        so.addBehavior("#default#userData");
        so.expires = _storage.expire;

        this.so = so;
        callback(this);
    },
    key: function(index) {
        this.so.load(_storage.store);
        return (this.so[_getAttribute](_storage.index) || "").split("\t")[index] || "";
    },
    info: function() {
        this.so.load(_storage.store);

        var so = this.so, idx = (so[_getAttribute](_storage.index) || ""),
            ary = idx.split("\t"),
            used = idx.length, key, i = 0;

        for (; key = ary[i++]; ) {
            used += (so[_getAttribute](key) || "").length;
        }
        return _storage.info(used, 63 * 1024, i - 1, "IEStorage");
    },
    item: function(key, value) {
        var rv = _true, so = this.so, i = 0, idx;

        so.load(_storage.store);

        switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
        case 1: idx = (so[_getAttribute](_storage.index) || "").split("\t");
                for (rv = {}; key = idx[i++]; ) {
                    rv[key] = so[_getAttribute](key) || "";
                }
                return rv;
        case 2: return so[_getAttribute](key) || "";
        case 3: key = uupair(key, value);
        }
        for (i in key) {
            try {
                idx = so[_getAttribute](_storage.index);
                value = key[i];

                // add index
                if (!idx) {
                    so[_setAttribute](_storage.index, i); // first time
                } else if (("\t" + idx + "\t")[_indexOf]("\t" + i + "\t") < 0) {
                    so[_setAttribute](_storage.index, idx + "\t" + i);
                }
                so[_setAttribute](i, value);
                so.save(_storage.store);
            } catch(err) {
                return _false;
            }
            if (so[_getAttribute](i) !== value) { // verify
                return _false;
            }
        }
        return _true;
    },
    clear: function(key) {
        this.so.load(_storage.store);

        var so = this.so, idx = (so[_getAttribute](_storage.index) || ""),
            tab, i = 0;

        if (key === void 0) { // clear all
            idx = idx.split("\t");
            for (; key = idx[i++]; ) {
                so.removeAttribute(key);
            }
            so[_setAttribute](_storage.index, "");
            so.save(_storage.store);
        } else if (key) { // clear(item)
            i   = "\t" + idx + "\t";
            tab = "\t" + key + "\t";

            if (i[_indexOf](tab) >= 0) {
                so[_setAttribute](_storage.index,
                                  i[_replace](new RegExp(tab), "").trim());
                so.removeAttribute(key);
                so.save(_storage.store);
            }
        }
    }
}, {
    isReady: uupao(_ie)
});
//}@mb

//{@cookie
uuClassSingleton("CookieStorage", {
    init: function(callback) {
        this.so = uucookie(_storage.store); // shadow cookie
        callback(this);
    },
    key: function(index) {
        return uunth(this.so, index)[0] || "";
    },
    info: function() {
        return _storage.info(doc.cookie.length, 3800,
                             uusize(this.so), "CookieStorage");
    },
    item: function(key, value) {
        var i, so = this.so, before;

        switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
        case 1: return uuclone(so);
        case 2: return so[key] || "";
        case 3: key = uupair(key, value);
        }
        for (i in key) {
            before = doc.cookie.length;
            if (before > 3800) { // 3.8kB
                return _false;
            }
            before && (before += 2); // 2: "; ".length
            before += uucookie.save(_storage.store, uupair(i, key[i]),
                                    _storage.expire);

            if (before !== doc.cookie.length) { // before !== after
                return _false;
            }
            so[i] = key[i];
        }
        return _true;
    },
    clear: function(key) {
        uucookie.save(_storage.store, key === void 0 ? this.so : uupair(key, ""),
                      (new Date(0)).toUTCString());
        key === void 0 ? (this.so = {}) : delete this.so[key];
    }
}, {
    isReady: uupao(!!navigator.cookieEnabled)
});
//}@cookie

uuClassSingleton("MemStorage", {
    init: function(callback) {
        this.so = {};
        callback(this);
    },
    key: function(index) {
        return uunth(this.so, index)[0] || "";
    },
    info: function() {
        return _storage.info(0, Number.MAX_VALUE, uusize(this.so), "MemStorage");
    },
    item: function(key, value) {
        switch (uucomplex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
        case 1: return uuclone(this.so);
        case 2: return this.so[key] || "";
        case 3: this.so[key] = value; break;
        case 4: uumix(this.so, key);
        }
        return _true;
    },
    clear: function(key) {
        key === void 0 ? (this.so = {}) : delete this.so[key];
    }
}, {
    isReady: uupao(_true)
});

uuready("window", function() {
    uuconfig.storage.disable || uu("Storage"); // -> uu.Class.Storage.Init()
});
//}@storage

//{@geo
// --- GEO LOCATION ---
// uu.geo - getCurrentPosition()
function uugeo(callback,    // @param CallbackFunction: callback(response:Hash)
                            //     response.ok - Boolean: true is success
                            //     response.option - Hash(= option): option argument
                            //     response.latitude - Number: response.coords.latitude
                            //     response.longitude - Number: response.coords.longitude
                            //     response.timestamp - Number: response.timestamp
                            //     response.status - Number: status code
                            //         200 OK (SUCCESS)
                            //         400 BAD REQUEST (PositionError.POSITION_UNAVAILABLE = 2)
                            //         405 METHOD NOT ALLOWED (PositionError.PERMISSION_DENIED = 1)
                            //         408 REQUEST TIMEOUT (PositionError.TIMEOUT = 3)
                            //         501 NOT IMPLEMENTED (Geo Location API Not Impl)
               option,      // @param Hash: { age, timeout, accuracy }
                            //     age - Number(= 0): maximumAge.
                            //                        0 is immediately attempt to acquire a new position, unit msec
                            //                        1+ is willing to accept a cached position.
                            //     timeout - Number(= Infinity): timeout. unit msec
                            //     accuracy - Boolean(= false): true is enableHighAccuracy
               __watch__) { // @hidden Boolean(= false):
                            // @return Boolean: false is not implement or disabled API.
    function handleSuccessCallback(resp) {
        var lastLocation = uugeo.location, coords = resp.coords;

        // getCurrentPosition() or modified?
        if (!option.watch || lastLocation.latitude  !== coords.latitude ||
                             lastLocation.longitude !== coords.longitude) {
            // update last location
            callback(uumix(lastLocation, coords, {
                ok:         _true,
                option:     option,
                status:     200,
                timestamp:  +resp.timestamp
            }));
        }
    }

    function handleErrorCallback(response) {
        // don't update last location
        callback({
            ok:         _false,
            option:     option,
            status:     { 1: 405, 2: 400, 3: 408 }[response.code] || 500,
            latitude:   null,
            longitude:  null,
            timestamp:  0
        });
    }

    if (!uuconfig.geo.disable) {
        option = option || {};

        var opt = {}, geo = navigator.geolocation, ary, i, iz;

        option.age      !== _undef && (opt.maximumAge         = option.age);
        option.timeout  !== _undef && (opt.timeout            = option.timeout);
        option.accuracy !== _undef && (opt.enableHighAccuracy = option.accuracy);
        __watch__                  && (opt.watch              = _true);

        // detect order
        if (!uugeo.api) {
            ary = (uuconfig.geo.order || "W").split("");
            for (i = 0, iz = ary.length; i < iz && uugeo.api < 2; ++i) {
                uugeo.api = (ary[i] === "A" && geo) ? 2
                          : (ary[i] === "W" && uugeo.webapi) ? 4 : 1;
            }
        }

        switch (uugeo.api) {
        case 2: if (__watch__) {
                    return geo.watchPosition(handleSuccessCallback,
                                             handleErrorCallback, opt);
                }
                geo.getCurrentPosition(handleSuccessCallback,
                                       handleErrorCallback, opt);
                return _true;
        case 4: if (__watch__) {
                    uugeo.webapi(callback, opt);
                    return setInterval(function() {
                        uugeo.webapi(callback, opt, _true);
                    }, uugeo.webapi.watch || 20000); // 20sec
                }
                uugeo.webapi(callback, opt);
                return _true;
        }
    }
    return __watch__ ? 0 : _false;
}

// uu.geo.watch - watchPosition()
function uugeowatch(callback, // @param CallbackFunction: callback(response:Hash)
                    option) { // @param Hash: { age, timeout, accuracy }
                              // @return Number: watch id, 0 is error
    return uugeo(callback, option, _true); // watch
}

// uu.geo.stop - stop watch
function uugeostop(watchid) { // @param Number: watch id
    switch (uugeo.api) {
    case 2: navigator.geolocation.clearWatch(watchid); break;
    case 4: clearInterval(watchid);
    }
}

// for GeoLocation Service API Entry point
uugeo.webapi = null;

// --- initialize ---
uuready("window", function() {
    uuready.geo = _true;
    uureadyfire("geo");
});
//}@geo

// --- NUMBER ---
// uu.number - get unique number
function uunumber() { // @return Number: unique number, from 1
    return ++_guidCounter;
}

// uu.number.pad - zero padding
function uunumberpad(source,   // @param Number:
                     digits,   // @param Number(= 2):
                     pad) {    // @param String(= "0"):
                               // @return String:

    //  [1][zero padding] uu.number.fillZero(9)     -> "09"
    //  [2][zero padding] uu.number.fillZero(99)    -> "99"
    //  [3][zero padding] uu.number.fillZero(99, 4) -> "0099"
    //  [4][char padding] uu.number.fillZero(99, 4, "*") -> "**99"

    var rv = source + "";

    digits = digits || 2;
    return rv.length < digits ? (Array(digits - rv.length + 1).join(pad || "0") + rv)
                              : rv;
}

// uu.number.range - clipping value
function uunumberrange(min,   // @param Number: min
                       value, // @param Number: value
                       max) { // @param Number: max
                              // @return Number:

    //  [1][clipping range] uu.number.range(0, 123, 100) -> 100
    //  [2][clipping range] uu.number.range(100, 123, 200) -> 123

    return value < min ? min :
           value > max ? max : value;
}

// uu.number.expand - number expand(normalize)
function uunumberexpand(base,        // @param Number: base / current value
                        expandValue, // @param String/Number: value or "{{operator}}value"
                                     //     operator - String: "+" or "-" or "*" or "/"
                        effect) {    // @param Function(= parseFloat):
                                     // @return Number:

    //  [1][through]           uu.number.expand(10, 20)    -> 20
    //  [2][base + value]      uu.number.expand(10, "+10") ->  20
    //  [3][base - value]      uu.number.expand(10, "-10") ->   0
    //  [4][base * value]      uu.number.expand(10, "*10") -> 100
    //  [5][base / value]      uu.number.expand(10, "/10") ->   1
    //  [6][parseInt   effect] uu.number.expand(0, 1.234, parseInt) -> 1
    //  [7][parseFloat effect] uu.number.expand(0, 1.234, parseFloat) -> 1.234
    //  [8][parseFloat effect] uu.number.expand(0, 1.234)             -> 1.234

    effect = effect || parseFloat;
    var op, rv = expandValue, n;

    if (typeof expandValue !== _number) {
        n  = parseFloat(expandValue.slice(1)); // "+10.1" -> 10.1
        op = expandValue.charCodeAt(0) - 42;
        rv = !op    ? base * n :     // 0 is "*"
             op < 2 ? base + n :     // 1 is "+"
             op < 4 ? base - n :     // 3 is "-"
             op < 6 ? base / n : rv; // 5 is "/"
    }
    return effect(rv);
}

// --- UI ---
//{@ui

// uu.ui - query ui instance
function uuui(expr,      // @param CSSSelectorExpressionString/StringArray/String(= ""): UI name
              context) { // @param Node(= <body>): context
                         // @return InstanceArray: [instance, ...]

    //  [1][query all UI]         uu.ui() -> [instance, ...]
    //  [2][query Slider]         uu.ui("Slider", <body>) -> [instance, ...]
    //  [3][query Slider and Tab] uu.ui(["Slider", "Tab"], <body>) -> [instance, ...]
    //  [4][query expression]     uu.ui("#ui>div[ui=Slider]", <body>) -> [instance, ...]

    var rv = [], ary, v, i = 0, r;

    if (!expr) {
        expr = "*[ui]";
    } else if (!/\W/.test(expr)) {
        for (r = [], ary = uuarray(expr); v = ary[i++]; ) {
            r.push("[ui=" + v + "]");
        }
        expr = r.join(",");
    }
    ary = uuquery(expr, context || doc.body);

    for (i = 0; v = ary[i++]; ) {
        rv.push(v.instance);
    }
    return rv;
}

// uu.ui.bind - bind UI
function uuuibind(uiname,     // @param String: UI name
                  callback) { // @param Hash: { method: callback, ...}
                              //  method   - String: "build", "transform", "isTransform"
                              //  callback - CallbackFunction: callback function
    for (var i in callback) {
        uuuibind.db[uiname + i] = callback[i];
    }
}
uuuibind.db = {}; // { name+method: callback, ... }

// uu.ui.build - build / transform UI component
function uuuibuild(uiname                  // @param Node/String(= ""):
                   /*, var_args, ... */) { // @param Mix(= void):
                                           // @return Node/NodeArray: <div> or [<div>, ...]

    //  [1][build]      uu.ui.build("Slider", { step: 2 }) -> [<div ui="Slider" />]
    //  [2][transform]  uu.ui.build() -> [<div ui="Slider"><input type="range"/></div>, ...]
    //  [3][transform]  uu.ui.build(Node) -> [node]
    //  [4][transform]  uu.ui.build(NodeArray) -> [node, ...]

    // [1] build
    if (typeof uiname === _string) {
        uiname = uiname + "build";
        if (uiname in uuuibind.db) {
            return uuuibind.db[uiname].apply(null, uuarray(arguments, 1));
        }
        return null;
    }

    // [2] transform
    var rv = [], ary = uiname ? uuarray(uiname) : uutag(),
        i = 0, iz = ary.length,
        fn, ctrl, method,
        db = uuuibind.db;

    for (; i < iz; ++i) {
        ctrl = uuattr(ary[i], "ui");
        if (ctrl) {
            method = ctrl + "isTransform";

            if (db[method] && db[method](ary[i])) {
                method = ctrl + "transform";

                if (db[method]) {
                    fn = db[method];
                    rv.push(fn(ary[i]));
                }
            }
        }
    }
    return rv;
}
//}@ui

// --- ECMAScript-262 5th ---
//{@mb

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
//}@mb

// Array.prototype.map
function ArrayMap(evaluator, // @param Function: evaluator
                  that) {    // @param this(= void): evaluator this
                             // @return Array: [element, ... ]
    for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
        i in this && (rv[i] = evaluator.call(that, this[i], i, this));
    }
    return rv;
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
}

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

// Function.prototype.bind
function FunctionBind(context                 // @param this: context
                      /*, var_args, ... */) { // @param Mix: arguments
                                              // @return Function:
    var rv, that = this, array = Array.prototype,
        args = array.slice.call(arguments, 1), // IE safe
        clean = function() {};

    rv = function() {
        return that.apply(this instanceof clean ? this : context,
            array.concat.call(args, array.slice.call(arguments, 0)));
    };
    clean.prototype = that.prototype;
    rv.prototype = new clean();
    return rv;
}

// --- HTMLElement.prototype ---
//{@mb

// HTMLElement.prototype.innerText getter
function innerTextGetter() {
    return this.textContent;
}

// HTMLElement.prototype.innerText setter
function innerTextSetter(text) {
    while (this.hasChildNodes()) {
        this[_removeChild](this[_lastChild]);
    }
    this[_appendChild](newText(text));
}

// HTMLElement.prototype.outerHTML getter
function outerHTMLGetter() {
    var rv, that = this, p = that[_parentNode],
        r = doc.createRange(), div = newNode();

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
//}@mb

// --- NodeSet ---
// NodeSet class
//{@nodeset
function NodeSet(expr,        // @param NodeSet/Node/NodeArray/String/window:
                 context,     // @param Function/NodeSet/Node(= void): context or forEach evaluator
                 evaluator) { // @param Function(= void): forEach evaluator
    this.stack = [[]]; // [NodeSet, ...]

    var ary, ctx, eva;

    if (typeof context === "function") {
        ctx = null;
        eva = context;
    } else {
        ctx = context || null;
        eva = evaluator || null;
    }

    if (expr) {
        if (typeof expr === _string) {
            if (expr.charAt(0) === "<") { // <div> -> fragment
                ary = [uunodebulk(expr)];
            } else {
                ary = uuquery(expr,
                              ctx && ctx[_nodeSet] ? ctx[_nodeSet][_concat]()
                                                   : ctx);
            }
        } else {
            ary = (expr === win || expr[_nodeType]) ? [expr] // window / document / Node
                : isArray(expr) ? expr[_concat]() // NodeArray.clone
                : expr instanceof NodeSet ? expr[_nodeSet][_concat]() : []; // copy constructor
        }
    }
    this[_nodeSet] = ary || [];

    // forEach evaluator
    if (eva) {
        this[_nodeSet].forEach(eva);
    }
}

// NodeSet.push - push stack
function NodeSetPush() { // @return NodeSet:
    this.stack.push(this[_nodeSet]); // push stack
    return this;
}

// NodeSet.pop - pop stack
function NodeSetPop() { // @return NodeSet:
    this[_nodeSet] = this.stack.pop() || [];
    return this;
}

// NodeSet.find
function NodeSetFind(expr) { // @param String: expression, "css > expr"
                             // @return NodeSet:
    var rv = [], ary = this[_nodeSet], i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        rv = rv[_concat](uuquery(expr, ary[i]));
    }
    this[_nodeSet] = rv;
    return this;
}

// NodeSet.nth - NodeSet[indexer]
function NodeSetNth(index,       // @param Number(= 0): index,
                                 //                   :  0 is first element
                                 //                   : -1 is last element
                                 //                   : index < 0 is negative index
                    evaluator) { // @param CallbackFunction(= void): callback function
                                 //                                  evaluator(node, index)
                                 // @return Node/NodeSet: evaluator == void is return Node
    var rv = this[_nodeSet][index < 0 ? index + this[_nodeSet].length
                                      : (index || 0)];

    return evaluator ? (evaluator(rv, index), this) : rv;
}

// NodeSet.each
function NodeSetEach(evaluator, // @param Function: evaluator
                     loopout) { // @param Boolean(= false): loop-out of "return false"
                                // @return NodeSet:
    if (loopout) { // use loopout -> slow!
        var ary = this[_nodeSet], i = 0, iz = ary.length, r;

        for (; i < iz; ++i) {
            if (i in ary) {
                r = evaluator(ary[i], i); // evaluator(value, index)
                if (r === _false) { // evaluator() -> false -> loopout
                    break;
                }
            }
        }
    } else { // no loopout -> quick!
        uueach(this[_nodeSet], evaluator); // evaluator(value, index)
    }
    return this;
}

// NodeSet.size - get NodeSet.length
function NodeSetSize() { // @return Number:
    return this[_nodeSet].length;
}

// NodeSet.array - clone NodeSet plain Array
function NodeSetArray() { // @return Array: NodeSet
    return this[_nodeSet][_concat]();
}

// NodeSet.indexOf - NodeSet.indexOf(node)
function NodeSetIndexOf(node) { // @param Node:
                                // @return Number: found index or -1
    return this[_nodeSet][_indexOf](node);
}

// NodeSet.add - add child node
function NodeSetAdd(source,     // @param Node/DocumentFragment/HTMLFragmentString/TagName(= "div"):
                    position) { // @param Boolean(= "./last"): insert position
                                // @return NodeSet:
    var ary = this[_nodeSet], context, i = 0;

    if (ary.length === 1) {
        uunodeadd(source, ary[0], position); // add original node
    } else {
        for (; context = ary[i++]; ) {
            uunodeadd(uunodebulk(source), context, position); // add cloned node
        }
    }
    return this;
}

// NodeSet.klass
function NodeSetKlass(className) { // @param String:
                                   // @return NodeSet:
    return NodeSetIter(1, this, uuklass, [className]);
}

// NodeSet.iter - NodeSet iterator
function NodeSetIter(map,       // @param Number: iter type. 0 is forEach, 1 is map
                     that,      // @param NodeSet:
                     evaluator, // @param Function: evaluator
                     args) {    // @param Arguments/MixArray: arguments
                                // @return NodeSet:
    var node, ary = that[_nodeSet], i = 0, iz = ary.length,
        rv = [], r, arrayResult = 0, argz = args.length;

    for (; i < iz; ++i) {
        node = ary[i];
        if (node && node[_nodeType] === Node.DOCUMENT_FRAGMENT_NODE) {
            node = node[_firstChild] || node;
        }
        switch (argz) {
        case 0: r = evaluator(node); break;
        case 1: r = evaluator(node, args[0]); break;
        case 2: r = evaluator(node, args[0], args[1]); break;
        case 3: r = evaluator(node, args[0], args[1], args[2]); break;
        case 4: r = evaluator(node, args[0], args[1], args[2], args[3]);
        }
        i || !map || r === node || ++arrayResult;
        arrayResult && (rv[i] = r);
    }
    return (map && arrayResult) ? rv : that;
}
//}@nodeset

// --- initialize ---

// inner - build DOM Lv2 event handler - uu.click(), ...
uueach(uuevent._.as, function(eventType) {
    // uu.click(node, fn) -> node
    uu[eventType] = function(node,      // @param Node:
                             evaluator, // @param Function/Instance:
                             hint) {    // @param String(= void):
        return uuevent(node, eventType, evaluator, hint || "DOMLv2");
    };
//{@nodeset
    // uu("li").click(fn) -> NodeSet
    NodeSet[_prototype][eventType] = function(evaluator, // @param Function/Instance:
                                              hint) {    // @param String(= void):
        return NodeSetIter(0, this, uuevent,
                           [eventType, evaluator, hint || "DOMLv2"]);
    };
//}@nodeset
});

//{@mb
// <html5-tags> shim. <section>, <summary> ...
_ie && uueach(uutag.html5.split(","), newNode); // [IE6][IE7][IE8][IE9 partial]

//{@ie6
try {
    // [IE6] flicker fix
    _env.ie6 && doc.execCommand("BackgroundImageCache", _false, _true);
} catch(err) {} // ignore error(IETester / stand alone IE too)
//}@ie6
//}@mb

// --- window.onload handler ---
function _windowonload() {
    uuready.window = _true;
    _DOMContentLoaded();
    uureadyfire("window");
}
doc.readyState === "complete" ? _windowonload()
                              : uueventattach(win, "load", _windowonload);

// --- DOMContentLoaded handler ---
function _DOMContentLoaded() {
    if (!uuready.reload && !uuready.dom) {
        uuready.dom = _true;
        uureadyfire("dom");
    }
}
//{@mb
// inner - hook DOMContentLoaded for [IE6][IE7][IE8]
function _IEDOMContentLoaded() {
    try {
        // trick -> http://d.hatena.ne.jp/uupaa/20100410/1270882150
        (new Image).doScroll();
        doc.body && _DOMContentLoaded(); // doc.body for <iframe>
    } catch(err) {
        setTimeout(_IEDOMContentLoaded, 32);
    }
}
_ie678 ? _IEDOMContentLoaded() : // [IE6][IE7][IE8]
//}@mb
    uueventattach(doc, "DOMContentLoaded", _DOMContentLoaded);

// --- finalize ---
//{@mb

// inner - [IE] fix mem leak
function _windowonunload() {
    var nodeid, node, ary, i, v;

    for (nodeid in _nodeiddb) {
        try {
            node = _nodeiddb[nodeid];
            ary = node.attributes;
            for (i = 0; v = ary[i++]; ) {
                !v.name[_indexOf]("data-") && (node[v.name] = null);
            }
        } catch (err) {}
    }
    doc.html = doc.head = null;
    uueventdetach(win, "load",   _windowonload);
    uueventdetach(win, "unload", _windowonunload);
}
_ie678 && uueventattach(win, "unload", _windowonunload);
//}@mb

// inner - uu.env - detect environment and meta informations
function detectEnvironment(libraryVersion) { // @param Number: Library version
                                             // @return Hash:
//{@mb
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

//}@mb
    function test(rex) {
        return rex.test(ua);
    }

    var rv = { library: libraryVersion, ssl: _false,
               ie: _false, ie6: _false, ie7: _false, ie8: _false, ie9: _false,
               ie67: _false, ie678: _false,
               opera: _false, gecko: _false, webkit: _true,
               chrome: _false, safari: _true, jit: _false,
               touch: _true, flash: 0, silverlight: 0 }, num, render,
        ua = navigator.userAgent,
        ie = !!doc.uniqueID,
        opera = !!win.opera,
        gecko = (!!win.netscape || !!win.Components) && /Gecko\//.test(ua),
        webkit = !ie && !opera && !gecko && /WebKit/.test(ua),
/*{@mb*/docMode = doc.documentMode || 0, /*}@mb*/ // [IE]
        mbosver = /(?:Android|OS) ([a-z\d\.]+)/.exec(
                        ua[_replace](/(\d+)_(\d+)(?:_(\d+))?/, "$1.$2$3")), // [, ver]
        browser = opera ? +(win.opera.version()[_replace](/\d$/, ""))
                        : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                                     exec(ua) || [,0])[1]);

    // --- Windows 7 x64 UserAgent and Render Version ---
    // Firefox 4.0 beta 9 -> "Mozilla/5.0 (Windows NT 6.1; rv:2.0b9) Gecko/20100101 Firefox/4.0b9"
    //                                                        ~~~~~
    // Chrome 9.0.597.67  -> "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.13 (KHTML, like Gecko) Chrome/9.0.597.67 Safari/534.13"
    //                                                                                    ~~~~~~
    // Safari 5.0.3       -> "Mozilla/5.0 (Windows; U; Windows NT 6.1; ja-JP) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4"
    //                                                                                    ~~~~~~~~
    // WebKit r74232      -> "Mozilla/5.0 (Windows; U; Windows NT 6.1; ja-JP) AppleWebKit/533+ (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4"
    //                                                                                    ~~~
    // Opera 11           -> "Opera/9.80 (Windows NT 6.1; U; ja) Presto/2.7.62 Version/11.00"
    //                                                                  ~~~~~~
    // IE9pp7             -> "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"
    //                                                                                   ~~~
    // IE8                -> "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)"
    //                                                                                   ~~~
    // Windows Phone 7    -> "Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0)"
    //                                                                                         ~~~
    //
    // http://d.hatena.ne.jp/uupaa/20090603
    num = ((/(?:rv\:|WebKit\/|Presto\/|Trident\/)(\d+\.\d+(\.\d+)?)/.exec(ua) ||
            [,0])[1]).toString();
    render = parseFloat(num[_replace](/[^\d\.]/g, "")
                           [_replace](/^(\d+\.\d+)(\.(\d+))?$/,"$1$3"));

    rv.ssl          = location.protocol === "https:";
    rv.lang         = (navigator.language ||
                       navigator.browserLanguage).split("-", 1)[0];
    rv.render       = render;
    rv.browser      = browser;
    rv.valueOf      = uupao(browser);
//{@mb
    rv.ie           = ie;
    rv.ie6          = ie && browser === 6 &&  !win.XMLHttpRequest;
    rv.ie7          = ie && browser === 7 && !!win.XMLHttpRequest;
    rv.ie8          = ie && browser === 8 &&  !getComputedStyle && docMode === 8;
    rv.ie9          = ie && browser === 9 && !!getComputedStyle && docMode === 9;
    rv.ie67         = rv.ie6  || rv.ie7;
    rv.ie678        = rv.ie67 || rv.ie8;
    rv.opera        = opera;
    rv.gecko        = gecko;
    rv.webkit       = webkit;
    rv.chrome       = webkit && test(/Chrome/);
    rv.safari       = webkit && test(/Safari/) && !rv.chrome;
//}@mb
    rv.longedge     = /*{@mb*/
                      rv.ie678 ? Math.max(htmlNode.clientWidth,
                                          htmlNode.clientHeight) : /*}@mb*/
                                 Math.max(win.innerWidth, win.innerHeight);
    rv.ipad         = webkit && test(/iPad/);
    rv.iphone       = webkit && !rv.ipad && test(/iPhone|iPod/);
    rv.ios          = rv.ipad || rv.iphone;
    rv.retina       = webkit && win.devicePixelRatio >= 2;
    rv.android      = webkit && test(/Android/);
    rv.mbosver      = mbosver ? parseFloat(mbosver[1]) : 0; // mobile os version
    // slate definition. http://twitter.com/#!/uupaa/status/27301790851
//  rv.slate        = rv.ipad || (rv.android && rv.longedge > 961);
    rv.mobile       = rv.ios || rv.android || test(/Opera Mini/);
    rv.os           = rv.ios            ? "ios"     // iPhone OS    -> "ios"
                    : rv.android        ? "android" // Android OS   -> "android"
//{@mb
                    : test(/CrOS/)      ? "chrome"  // Chrome OS    -> "chrome"
                    : test(/Win/)       ? "windows" // Windows OS   -> "windows"
                    : test(/Mac/)       ? "mac"     // Mac OS       -> "mac"
                    : test(/X11|Linux/) ? "unix"    // Unix Base OS -> "unix"
//}@mb
                    : "";                           // Unknown OS   -> ""
//{@mb
    rv.touch        = rv.ios || rv.android;
    rv.jit          = (ie     && browser >= 9)   ||    // IE 9+
                      (gecko  && render  >  1.9) ||    // Firefox 3.5+(1.91)
                      (webkit && render  >= 528
                              && !rv.mobile)     ||    // Safari 4+, Google Chrome(2+)
                      (opera  && browser >= 10.5);     // Opera10.50+
    rv.flash        = detectFlashPlayerVersion(ie, 9); // FlashPlayer 9+
    rv.silverlight  = detectSilverlightVersion(ie, 3); // Silverlight 3+
//}@mb
    return rv;
}

//{@mb
// inner - CrossBrowse Array.prototype.slice.call
function fakeToArray(fakeArray) { // @param FakeArray: NodeList, Arguments
                                  // @return Array:
    if (uuready.ArraySlice) {
        return toArray.call(fakeArray);
    }

    // [IE6][IE7][IE8]
    var rv = [], i = 0, iz = fakeArray.length;

    for (; i < iz; ++i) {
        rv[i] = fakeArray[i];
    }
    return rv;
}
//}@mb

function detectFeatures() {
    var hash = { rgba: _true, hsla: _true, transparent: _true },
//{@mb
        undef,
        node = newNode(), child, style = node.style,
//}@mb
        rv = {
            touch: "",              // touch keyword (window.Touch)
            transform: "",          // CSS3 transform keyword (style.transform)
            translate3d: _true,     // CSS3 transform.translate3d ready
            opacity: _true,         // CSS3 opacity ready
            filter: _false,         // node.filters ready [IE]
            color: uuarg(hash),     // color: rgba, hsla, transparent ready
            border: uuarg(hash),    // border: rgba, hsla, transparent ready
            background: uuarg(hash),// background: rgba, hsla, transparent ready
            ArraySlice: _true,      // Array.prototype.slice.call(FakeArray) ready [IE9+]
            getAttribute: _true,    // getAttribute("href"), getAttribute("class") ready [IE8+]
            StringIndexer: _true,   // String[indexer] ready
            style: {                // style
                inlineBlock: _true  //  style.inlineBlock ready
            },
            innerHTML: {            // node.innerHTML
                style: _true,       //  node.innerHTML = "<style></style>" ready
                padStyle: _true     //  node.innerHTML = "<dummyNode/><style></style>" ready
            },
            cloneNode: {            // cloneNode:
                attr: _false,       //  ref attribute [GECKO][WEBKIT][OPERA][IE] is false
                data: _false,       //  ref node["data-*"] [IE6-IE8][IE9pp3] is true
                event: _false       //  ref DOM Event      [IE6-IE8][IE9pp3] is true
            }
        };

//{@mb
    uueach({ rgba: ["rgba(255,0,0,0.5)", /rgba.2/],
             hsla: ["hsla(100,100%,100%,0.5)", /rgba.2|hsla.1/],
             transparent: [_transparent, /tran|rgba/] }, function(v, i) {
        style.cssText = 'color:' + v[0] + ';background:' + v[0] +
                        ';border:0 none ' + v[0];
        rv.color[i] = v[1].test(style.color);
        rv.border[i] = v[1].test(style.borderTopColor);
        rv.background[i] = v[1].test(style.backgroundColor);
    });
    rv.touch = (window.Touch !== void 0) ? "Touch" : "";
    rv.transform = (style.WebkitTransform !== void 0) ? "WebkitTransform"
                 : (style.MozTransform    !== void 0) ? "MozTransform"
                 : (style.OTransform      !== void 0) ? "OTransform"
                 : (style.msTransform     !== void 0) ? "msTransform"
                 : (style.transform       !== void 0) ? "transform" : "";
    // translate3d supporte
    //  ok: WebKit, Opera11
    //  ng: Firefox4.0beta, IE9pp7
    rv.translate3d = _webkit || _opera;

    // detect opacity - http://d.hatena.ne.jp/uupaa/20100513
    rv.opacity = style.opacity != undef;

    // detect innerHTML = "<style>" bug
    node.innerHTML = '<style></style>';
    rv.innerHTML.style = !!node.childNodes.length;

    // detect 2 bugs
    //      innerHTML="<style>"
    //      getAttribute
    node.innerHTML = '<a href="/a" class="a"></a><br/><style>*{color:red}</style>';
    rv.innerHTML.padStyle = node.childNodes.length === 3;

    child = node[_firstChild];
    try {
        toArray.call(doc.getElementsByTagName("head"));
    } catch(err) { rv.ArraySlice = _false; }
    rv[_getAttribute] = child[_getAttribute]("class") === "a" &&
                        child[_getAttribute]("href") === "/a";
    rv.StringIndexer = !!"0"[0];

    // revise
    if (_ie) {
        _env < 9 && (rv.color[_transparent]  = _false);
        _env < 8 && (rv.style.inlineBlock    = _false);
        _env < 7 && (rv.border[_transparent] = _false);
    }
//}@mb
    return rv;
}

//{@mb
// --- detect uu.ready.cloneNode.* features ---
uuready("dom:2", function() {
    var cloned, evt, fired = 0, attr = "uuz", data = _datauu + "z",
        body = doc.body, cloneNode = uuready.cloneNode, div = newNode(),
        onfire = function() {
            fired += 1;
        };

    div[_setAttribute](attr, "1");  // node.setAttribute("uuz", "1")
    div[data] = { ref: 1 };         // node["data-uuz"] = { ref: 1 }
    if (div[_addEventListener]) {   // [GECKO][WEBKIT][OPERA][IE9]
        div[_addEventListener]("click", onfire, _false);
        cloned = div.cloneNode(_false);
        (evt = doc.createEvent("MouseEvents")).initEvent("click", _false, _true);
        cloned.dispatchEvent(evt);  // fire
    } else if (div.attachEvent) {   // [IE]
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
}, function() {
    // detect uu.ready.filter
    if (_ie) {
        var div = doc.body[_appendChild](newNode()), dummy;

        try {
            dummy = div.filters;
            uuready.filter = _true;
        } catch(err) {}
        uunoderemove(div, _true); // removeAll
    }
});
//}@mb

function uuunlimit() {
    // TODO: impl.
}

})(this,
   document,
   document.documentElement,
   navigator,
   Object.prototype.toString,
   Array.isArray,
   Array.prototype.slice,
   this.Node,
   Math,
   parseInt,
   parseFloat,
   setTimeout,
   setInterval,
   this.getComputedStyle);

// === query.tokenizer, query.selector ===
// - query.selector() function limits
// -- unsupported impossible rules ( ":root:first-child", etc ) in W3C Test Suite - css3_id27a
// -- unsupported impossible rules ( "* html"), "* :root"     ) in W3C Test Suite - css3_id27b
// -- unsupported case sensitivity ( ".cs P" )                  in W3C Test Suite - css3_id181
// -- unsupported ":not()", ":not(*)"                           in WebKit querySelectorAll()

//{@mb
uu.query.tokenizer || (function(uu,    // as window.uu
                                doc) { // as window.document

uu.query.tokenizer = tokenizer;
uu.query.selector  = selector;

                          //  +-----------------+-----------------------------
                          //  | EXPRESSION      | RESULT
                          //  +-----------------+-----------------------------
var _A_TAG          = 1,  //  | E               | [ _A_TAG, "E" ]
    _A_COMBINATOR   = 2,  //  | E > F           | [ _A_COMBINATOR, ">", _A_TAG, "E" ]
    _A_ID           = 3,  //  | #ID             | [ _A_ID, "ID" ]
    _A_CLASS        = 4,  //  | .CLASS          | [ _A_CLASS, "CLASS" ]
    _A_ATTR         = 5,  //  | [ATTR]          | [ _A_ATTR, "ATTR" ]
    _A_ATTR_VALUE   = 6,  //  | [ATTR="VALUE"]  | [ _A_ATTR_VALUE, "ATTR", 1~7, "VALUE" ]
    _A_PSEUDO       = 7,  //  | :target         | [ _A_PSEUDO,      1~29 ]
    _A_PSEUDO_NTH   = 8,  //  | :nth-child(...) | [ _A_PSEUDO_FUNC, 31~34, { a,b,k } ]
    _A_PSEUDO_FUNC  = 9,  //  | :lang(...)      | [ _A_PSEUDO_FUNC, 35~99, arg ]
    _A_PSEUDO_NOT   = 10, //  | :not(...)       | [ _A_PSEUDO_NOT,  _A_ID or _A_CLASS or _ATTR or _A_PSEUDO or _A_PSEUDO_FUNC, ... ]
    _A_GROUP        = 11, //  | E,F             | [ _A_GROUP ]
    _A_QUICK_ID     = 12, //  | #ID             | [ _A_QUICK_ID,    true or false, "ID" or "CLASS" ]
    _A_QUICK_EFG    = 13, //  | E,F or E,F,G    | [ _A_QUICK_EFG,   ["E", "F"] or ["E", "F", "G"] ]
                          //  +-----------------+-----------------------------
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
/* TODO: test
        required:          18, optional:          19,                        // otherFilter <input required>
 */
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
    _uudoctype      = "data-uudoctype", // doctype=1: XMLDocument, doctype=2: HTMLDocument
    _nodeCount      = 0,
    _ie67           = uu.ie67,  // as [IE6][IE7] -> hasAttribute not impl
    _ie678          = uu.ie678, // as [IE6][IE7][IE8]
    _textContent    = _ie678 ? "innerText" : "textContent";

// uu.query.tokenizer - CSS3 Selectors Expression tokenizer
function tokenizer(expr) { // @param CSSSelectorExpressionString: "E > F"
                           // @return QueryTokenHash: { data, group, err, msg, expr }
                           //   data  - Array:   [_A_TOKEN, data, ...]
                           //   group - Number:  expression group count, from 1. uu.query("E,F,G") -> group=3
                           //   err   - Boolean: true is error
                           //   msg   - String:  error message
                           //   expr  - String:  expression
    var rv = { data: [], group: 1, err: false, msg: "", expr: expr = expr.trim() },
        data = rv.data, m, outer, inner;

    // --- QUICK PHASE ---
    (m = _QUICK.E.exec(expr))  ? data.push(_A_TAG, m[0]) :
    (m = _QUICK.ID.exec(expr)) ? data.push(_A_QUICK_ID, m[1] === "#", m[2]) :
    ((m = _QUICK.EFG.exec(expr)) && m[1] !== m[2] && m[1] !== m[3] && m[2] !== m[3]) // E !== F !== G
                               ? data.push(_A_QUICK_EFG, m[3] ? [m[1], m[2], m[3]]
                                                              : [m[1], m[2]]) :
    _TOKEN_ERROR.test(expr)    ? (rv.msg = expr) : 0;

    // --- GENERIC PHASE ---
    if (!data.length) {
        while (!rv.msg && expr && outer !== expr) { // outer loop
            m = _TOKEN_COMB.exec(outer = expr);
            if (m) {
                m[1] && data.push(_A_COMBINATOR, m[1]); // >+~
                        data.push(_A_TAG, m[2] || "*"); // E or "*"
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
function innerLoop(expr,  // @param String: CSS3 Selector Expression
                   rv,    // @param Hash: { data, group, err, msg, expr }
                   not) { // @param Boolean(= false): true is negate evaluation
                          // @return String: remain expression
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
                //
                //  <p title="hello world"></p> -> query('[title~="hello world"]') -> unmatch
                //            ~~~~~~~~~~~
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
                    // ":not(:not(...))", ":not()", ":not(*)" -> ERROR
                    if (not || expr === ":not()" || expr === ":not(*)") {
                        rv.msg = ":not()";
                    } else {
                        data.push(_A_PSEUDO_NOT);
                        expr = expr.slice(m[0].length);
                        m = _TOKEN_PSEUDO.E.exec(expr);
                        if (m) {
                            data.push(_A_TAG, m[1].toUpperCase()); // "DIV"
                        } else {
                            expr = innerLoop(expr, rv, true); // :not(simple selector)
                            m = _TOKEN_PSEUDO.END.exec(expr);
                            m || rv.msg || (rv.msg = ":not()");
                        }
                    }
                } else { // pseudo functions
                    data.push(num < 35 ? _A_PSEUDO_NTH : _A_PSEUDO_FUNC, num);
                    expr = expr.slice(m[0].length);
                    m = _TOKEN_PSEUDO.FUNC.exec(expr);
                    if (m) {
                        if (num < 35) { // pseudo nth-functions
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
                            anb ? data.push(anb) // pseudo function arg
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

// uu.query.selector - CSS3 Selectors Evaluator
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

    for (; i < iz; ++i) {

        jz = ctx.length;
        if (!jz) {
            if (result.length < token.group - 1) {
                // skip to next group
                for (; i < iz; ++i) {
                    if (data[i] === _A_GROUP) {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        r = [], ri = -1, j = type = 0;

        switch (data[i]) {
        case _A_QUICK_ID: // [ _A_QUICK_ID, true or false, "ID" or "CLASS" ]
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
        case _A_QUICK_EFG: // [ _A_QUICK_EFG, ["E", "F"] or ["E", "F", "G"] ]
            ary = data[++i];
            return uu.node.sort(
                        uu.tag(ary[0], context).concat(
                            uu.tag(ary[1], context),
                            ary[2] ? uu.tag(ary[2], context) : [])).sort;
        case _A_COMBINATOR: // [ _A_COMBINATOR, ">", _A_TAG, "DIV" ]
            type = _QUERY_COMB[data[++i]];
            ++i;
        case _A_TAG: // [ _A_TAG, "DIV" ]
            ident = data[++i]; // "DIV" or "*"
            match = ident === "*";
            xmldoc || (ident = ident.toUpperCase()); // if HTMLDocument -> "div" -> "DIV"

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
                        if ((match && node.nodeType === Node.ELEMENT_NODE) ||
                            node.tagName === ident) {

                            nid = node[_uuqid] || (node[_uuqid] = ++_nodeCount);
                            lock[nid] || (r[++ri] = node, lock[nid] = 1);
                        }
                    }
                }
            } else { // >+~
                for (lock = {}; j < jz; ++j) {
                    node = ctx[j][type < 2 ? "firstChild" : "nextSibling"];
                    for (; node; node = node.nextSibling) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (_ie678 && !node.tagName.indexOf("/")) { // fix #25
                                continue;
                            }
                            if (match || node.tagName === ident) {
                                if (type > 2) {
                                    nid = node[_uuqid] || (node[_uuqid] = ++_nodeCount);
                                    if (lock[nid]) {
                                        break;
                                    }
                                    lock[nid] = 1;
                                }
                                r[++ri] = node;
                            }
                            if (type === 2) {
                                break;
                            }
                        }
                    }
                }
            }
            ctx = r;
            break;
        case _A_ID: // [ _A_ID, "ID" ]
            type = 1;
        case _A_CLASS: // [ _A_CLASS, "CLASS" ]
            ident = type ? data[++i] : (" " + data[++i] + " "); // "ID" or " CLASS "
            for (; j < jz; ++j) {
                node = ctx[j];
                if (type) { // ID
                    word  = xmldoc ? node.id : (node.id || node.name); // XHTML is id only, HTML is id or name
                    match = word && word === ident;
                } else {    // CLASS
                    word  = node.className;
                    match = word && ((" " + word + " ").indexOf(ident) >= 0);
                }
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR: // [ _A_ATTR, "ATTR" ]
            for (attr = data[++i]; j < jz; ++j) {
                node = ctx[j];
                // [IE6][IE7] node.hasAttribute() not impl
                match =
//{@ie67
                    _ie67 ? ((word = node.getAttributeNode(attr)) && word.specified) :
//}@ie67
                            node.hasAttribute(attr);
                (match ^ negate) && (r[++ri] = node);
            }
            ctx = r;
            break;
        case _A_ATTR_VALUE: // [ _A_ATTR_VALUE, "ATTR", "OPERATOR", "VALUE" ]
            attr = data[++i];
            ope  = data[++i];
            val  = uu.string.trim.quote(data[++i]); // '"quote"' -> "quote"
            uu.ready.getAttribute || (attr = uu.attr.fix.db[attr] || attr); // [IE] fix attr name
            switch (ope) {
            case 1: val = "^" + val + "$"; break;                 // [attr  = value]
            case 3: val = "^" + val;       break;                 // [attr ^= value]
            case 4: val =       val + "$"; break;                 // [attr $= value]
            case 5: val = "(?:^| )" + val + "(?:$| )"; break;     // [attr ~= value]
            case 6: val = "^" + val + "\\-|^" + val + "$"; break; // [attr |= value]
            case 7: negate = +!negate;                            // [attr != value]
            }
            rex = RegExp(val, attr in _QUERY_CASESENS ? "" : "i"); // ignore case

//{@ie67
            if (_ie67) { // [IE6][IE7]
                // IE getAttribute(attr) problem
                // http://twitter.com/uupaa/status/25501532102
                // http://twitter.com/uupaa/status/25502149299
                for (; j < jz; ++j) {
                    node = ctx[j];
                    switch (attr) {
                    case "href":     word = node.getAttribute(attr, 2); break;
                    case "checked":  word = node.checked  ? "checked"  : ""; break;
                    case "disabled": word = node.disabled ? "disabled" : ""; break;
                    default:         word = node.getAttribute(attr);
                    }
                    ((word && rex.test(word)) ^ negate) && (r[++ri] = node);
                }
            } else { // [IE8][IE9][Gecko][WebKit][Opera]
//}@ie67
                for (; j < jz; ++j) {
                    node = ctx[j];
                    word = node.getAttribute(attr);
                    ((word && rex.test(word)) ^ negate) && (r[++ri] = node);
                }
//{@ie67
            }
//}@ie67
            ope === 7 && (negate = +!negate); // restore
            ctx = r;
            break;
        case _A_PSEUDO: // [ _A_PSEUDO, 1~29 ]
            type = data[++i];
            ctx = (type < 4  ? childFilter
                 : type < 10 ? actionFilter
                 : type < 13 ? formFilter
                             : otherFilter)(ctx, j, jz, negate, type, xmldoc);
            break;
        case _A_PSEUDO_NTH: // [ _A_PSEUDO_FUNC, 31~34, { a,b,k } ]
            type = data[++i];
            ctx = (type < 33 ? nthFilter
                             : nthTypeFilter)(ctx, j, jz, negate, type, data[++i], xmldoc);
            break;
        case _A_PSEUDO_FUNC: // [ _A_PSEUDO_FUNC, 31~99, arg ]
            type = data[++i];
            ctx = otherFunctionFilter(ctx, j, jz, negate, type, data[++i]);
            break;
        case _A_PSEUDO_NOT: // [ _A_PSEUDO_NOT, _A_ID/_A_CLASS/_ATTR/_A_PSEUDO/_A_PSEUDO_FUNC, ... ]
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
        return uu.node.sort(r).sort; // to document order
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
                cn.nodeType === Node.ELEMENT_NODE && ++found;
            }
        }
        if (ps & 2) { // last-child and only-child
            cn = node;
            while (!found && (cn = cn.nextSibling)) {
                cn.nodeType === Node.ELEMENT_NODE && ++found;
            }
        }
        ((!found) ^ negate) && (rv[++ri] = node);
    }
    return rv;
}

// inner - 7:hover  8:focus  x:active
function actionFilter(ctx, j, jz, negate, ps) {
    var rv = [], ri = -1, node, ok, cs,
        decl = uu.ie ? "ruby-align:center" : "outline:0 solid #000",
        ss = uu.ss("uuquery2"); // StyleSheetObject

    // http://d.hatena.ne.jp/uupaa/20080928
    ss.add(ps < 8 ? ":hover" : ":focus", decl);

    for (; j < jz; ++j) {
        node = ctx[j];
        ok = uu.ie ? node.currentStyle.rubyAlign === "center" :
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

// inner - 13:link  14:visited  15:empty  16:root  17:target  18:required  19:optional
function otherFilter(ctx, j, jz, negate, ps, xmldoc) {
    var rv = [], ri = -1, node, cn, ok = 0, found, word, rex /*, attr */;

    switch (ps) {
    case 13: rex = /^(?:a|area)$/i; break;
    case 14: jz = 0; break;
    case 16: negate || (jz = 0, rv = [doc.html]); break;
    case 17: (word = location.hash.slice(1)) || (jz = 0); break;
/* TODO: test
    case 18: attr = "required"; break;
    case 19: attr = "optional";
 */
    }

    for (; j < jz; ok = 0, ++j) {
        node = ctx[j];
        switch (ps) {
        case 13: ok = rex.test(node.tagName) && !!node.href; break;
        case 15: found = 0;
                 for (cn = node.firstChild; !found && cn; cn = cn.nextSibling) {
                    cn.nodeType === Node.ELEMENT_NODE && ++found;
                 }
                 ok = !found && !node[_textContent]; break;
        case 16: ok = node !== doc.html; break;
        case 17: ok = xmldoc ? (node.id === word)
                             : ((node.id || node.name) === word); break;
/* TODO: test
        case 18:
        case 19:
                // [IE6][IE7] node.hasAttribute() not impl
                ok = _ie67
                   ? ((word = node.getAttributeNode(attr)) && word.specified)
                   : node.hasAttribute(attr);
                ps === 19 && (ok = !ok);
 */
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
                if (cn.nodeType === Node.ELEMENT_NODE) {
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
                if (cn.nodeType === Node.ELEMENT_NODE) {
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

})(uu, document);
//}@mb

//{@ui
//{@uislider
(function(doc, uu) {

// uu.Class.Slider - generic Slider class
uu.Class("Slider", {
    init:           SliderInit,         // init(rail:Node, grip:Node, param:Hash = {})
    attr:           SliderAttr,         // attr(key:String/Hash = void, value:String/Number/Boolean = void):Mix/void
    bind:           SliderBind,         // bind(eventType:EventTypeString, evaluator:Function)
    unbind:         SliderUnbind,       // unbind(eventType:EventTypeString)
    msgbox:         SliderMsgBox,       // msgbox(msg:String, param1:Mix = void, param2:Mix):Hash/Boolean/void
                                        //  [1][get attr]     uu.msg.post(instance, "attr") -> Hash
                                        //  [2][bind]         uu.msg.post(instance, "bind",   { node, type, callback })
                                        //  [3][unbind]       uu.msg.post(instance, "unbind", { node, type, callback })
                                        //  [4][set value]    uu.msg.post(instance, "value", 100)
                                        //  [5][set value fx] uu.msg.post(instance, "value", 100, 100)
                                        //  [6][get value]    uu.msg.post(instance, "value") -> 100
    handleEvent:    SliderHandleEvent   // handleEvent(evt:Event)
}, {
    build:          SliderBuild,        // build(param:Hash, backyard:Node = <body>):Array
    transform:      SliderTransform,    // transform(node:Node):Array
    isTransform:    SliderIsTransform   // isTransform(node:Node)
});

// uu.Class.Slider.init
function SliderInit(rail,    // @param Node: rail node. <div class="Slider*">
                    grip,    // @param Node: grip node. <div><div class="Slider*Grip" /></div>
                    param) { // @param Hash(= {}): { caption, vertical, disabled, min, max, size,
                             //                      step, value, gripWidth, gripHeight }
                             //    caption    - Boolean(= false):
                             //    vertical   - Boolean(= false): true is vertical
                             //    disabled   - Boolean(= false): true is disabled
                             //    min        - Number(= 0);
                             //    max        - Number(= 100):
                             //    size       - Number(= 100): width or height
                             //    step       - Number(= 1):
                             //    value      - Number(= 0):
                             //    gripWidth  - Number(= 20):
                             //    gripHeight - Number(= 20):
    var that = this;

    this.event = {
        change: null,
        mouseup: null,
        mousedown: null,
        mousemove: null,
        mousewheel: null
    };
    this.param = param = uu.arg(param, {
        name: "Slider",
        rail: rail,
        grip: grip,
        caption: 0,
        vertical: 0,
        disabled: 0,
        min: 0,
        max: 100,
        size: 100,
        step: 1,
        value: 0,
        gripWidth: 20,
        gripHeight: 20,
        lastpx: 0,
        lastpy: 0
    });
    rail.instance = that;

    param.disabled = !!param.disabled;
    param.step < 1 && (param.step = 1);
    param.keyCode = param.vertical ? { 38: -1, 40: 1 } : { 37: -1, 39: 1 };
    param.ox =  param.vertical ? 0 : -parseInt((param.gripWidth  + 1) / 2) + 2;
    param.oy = !param.vertical ? 0 : -parseInt((param.gripHeight + 1) / 2) + 2;

    SliderValue(this, param.value, 0);
    SliderState(this, !param.disabled);
}

// inner -
function SliderState(that, enable) {
    var method = enable ? uu.bind : uu.unbind;

    // rail drag events
    method(that.param.rail, uu.env.touch ? "Slider.touchstart"
                                         : "Slider.mousedown,Slider.mousewheel", that);
    // key events
    method(doc, "Slider.keydown", that);

    uu.css.opacity(that.param.rail, enable ? 1 : 0.3);
    uu.css.opacity(that.param.grip, enable ? 1 : 0.5);
}

// uu.Class.Slider.attr
function SliderAttr(key,     // @param String/Hash(= void):
                    value) { // @param Mix(= void):
                             // @return Hash/void:
    var rv, i, v, mem = {};

    switch (uu.complex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: rv = uu.mix({}, this.param); // clone
            return key ? rv[key] : rv;
    case 3: key = uu.pair(key, value);
    case 4: for (i in key) {
                v = key[i];
                switch (i) {
                case "disabled":
                    if (this.param.disabled !== !!v) { // disable <-> enable
                        this.param.disabled = !!v;
                        SliderState(this, !v);
                    }
                    break;
                case "fx":      mem.fx = v; break;
                case "value":   mem.value = v; break;
                default:        this.param[i] = v;
                }
            }
            if (mem.value !== void 0) {
                SliderValue(this, mem.value, mem.fx || 0);
            }
    }
    return;
}

// uu.Class.Slider.bind
function SliderBind(type,        // @param EventTypeString:
                    evaluator) { // @param Function
    this.event[type] = evaluator;
}

// uu.Class.Slider.unbind
function SliderUnbind(type) { // @param EventTypeString:
    this.event[type] = null;
}

// uu.Class.Slider.msgbox
function SliderMsgBox(msg,      // @param String:
                      param1,   // @param Mix(= void): param1
                      param2) { // @param Mix(= void): param2
                                // @return Hash/Boolean/void:
    //  [1][get attr]     uu.msg.post(instance, "attr") -> Hash
    //  [2][bind]         uu.msg.post(instance, "bind",   { node, type, callback })
    //  [3][unbind]       uu.msg.post(instance, "unbind", { node, type, callback })
    //  [4][set value]    uu.msg.post(instance, "value", 100)
    //  [5][set value fx] uu.msg.post(instance, "value", 100, 100)
    //  [6][get value]    uu.msg.post(instance, "value") -> 100

    switch (msg) {
    case "attr":    return this.attr(param1, param2);
    case "bind":    this.bind(param1.type, param1.evaluator); break;
    case "unbind":  this.unbind(param1.type); break;
    case "value":   if (param1 !== void 0) {
                        SliderValue(this, param1 || 0, param2 || 0);
                    } else {
                        return this.param.value;
                    }
    }
    return;
}

// uu.Class.Slider.handleEvent
function SliderHandleEvent(evt) {
    var code  = evt.uu.code, rect, threshold, w, change = 0, key, shift,
        param = this.param,
        rail  = param.rail,
        pageX = evt.pageX,
        pageY = evt.pageY,
        dragInfo = rail["data-uuuidrag"],
        dragEvent = uu.env.touch ? "touchmove+,touchend+"
                                 : "mousemove+,mouseup+",
        touches, finger, identifier, i; // for iPhone

    // init drag information
    if (!dragInfo) {
        rail["data-uuuidrag"] = dragInfo = {
            ox: 0, oy: 0, dragging: 0, startValue: 0,
            lastPageX: 0, lastPageY: 0, id: 0, tap: 0 // for iPhone
        };
    }

    if (code === uu.event.codes.mousedown && !dragInfo.dragging) {
        if (uu.env.touch) {
            if (evt.touches) {
                finger = evt.touches[evt.touches.length - 1];
                dragInfo.lastPageX = pageX = finger.pageX;
                dragInfo.lastPageY = pageY = finger.pageY;
                identifier = finger.identifier;
            }
        }
        rect = uu.css.rect(rail, doc.html); // offset from <html>
        threshold = param.value >= (param.max - param.min) * 0.5;
        dragInfo.ox = rect.x + 1;
        dragInfo.oy = rect.y;
        dragInfo.id = identifier; // touch.identifier
        dragInfo.dragging = 1;
        dragInfo.startValue = threshold ? 1 : 0;
        ++dragInfo.tap;

        uu.bind(uu.ie678 ? rail : doc, dragEvent, this);

        if (rail !== doc.activeElement) {
            rail.focus();
        }

        // calc half gripWidth
        // http://twitter.com/uupaa/status/25483749734
        w = Math.round(((param.vertical ? param.gripHeight
                                        : param.gripWidth) + 1) / 2);
        SliderMove(this, pageX + param.ox - dragInfo.ox,
                         pageY + param.oy - dragInfo.oy, 1, w, w); // 1: fx

        this.event.mousedown && this.event.mousedown(evt, param);
        ++change;

    } else if (code === uu.event.codes.mouseup && dragInfo.dragging) {
        dragInfo.dragging = 0;
        uu.unbind(uu.ie678 ? rail : doc, dragEvent, this);

        this.event.mouseup && this.event.mouseup(evt, param);
        ++change;

    } else if (code === uu.event.codes.mousemove && dragInfo.dragging) {
        dragInfo.tap = 0;

        if (uu.env.touch) {
            touches = evt.touches;
            if (touches) {
                i = touches.length;
                while (i--) {
                    finger = touches[i];
                    if (dragInfo.id === finger.identifier) {
                        dragInfo.lastPageX = pageX = finger.pageX;
                        dragInfo.lastPageY = pageY = finger.pageY;
                        break;
                    }
                }
            }
        }
        SliderMove(this, (pageX + param.ox - dragInfo.ox),
                         (pageY + param.oy - dragInfo.oy), 0, 1, 1);
        this.event.mousemove && this.event.mousemove(evt, param);
        ++change;

    } else if (code === uu.event.codes.mousewheel) {
        if (rail !== doc.activeElement) {
            rail.focus();
        }
        SliderValue(this, param.value + evt.uu.wheel * 10, 0);

        this.event.mousewheel && this.event.mousewheel(evt, param);
        ++change;

    } else if (code === uu.event.codes.keydown) {
        if (rail === doc.activeElement) {
            key = param.keyCode[uu.event.key(evt).code];
            shift = evt.shiftKey ? 10 : 1; // x10

            if (key) {
                SliderValue(this, param.value + key * param.step * shift, 0);

                this.event.keydown && this.event.keydown(evt, param);
                ++change;
            }
        }
    }

    change && this.event.change &&
        this.event.change(uu.mix({}, evt, { type: "change" }), param);

    return false; // uu.event.stop(evt)
}

// inner - get value / set value
function SliderValue(that,  // @param this:
                     value, // @param Number(= void 0): slider value
                     fx) {  // @param Boolean(= false): true is uu.fx
                            // @return Number: current value
    if (value !== void 0) {
        var param = that.param, pp = 100 / (param.max - param.min);

        value = Math.round((value - param.min) * pp * (param.size * 0.01));
        SliderMove(that, value, value, fx, 0, 1, 1);
    }
    return that.param.value;
}

// inner - move grip
function SliderMove(that,   // @param this:
                    px,     // @param Number: pixel value
                    py,     // @param Number: pixel value
                    fx,     // @param Boolean: true is fx
                    minus,  // @param Number: minus
                    plus) { // @param Number: plus
    var move = 0,
        param = that.param, x = 0, y = 0, w, tm, pp, round, threshold;

    // http://twitter.com/uupaa/status/25483749734
    if (param.vertical) {
        if (param.lastpy - minus >= py ||
            param.lastpy + plus  <= py) {
            param.lastpy = py;
            ++move;
        }
    } else {
        if (param.lastpx - minus >= px ||
            param.lastpx + plus  <= px) {
            param.lastpx = px;
            ++move;
        }
    }
    if (!move) {
        return;
    }

    w = param.max - param.min;
    tm = param.size * 0.01;
    pp = 100 / w;
    round = param.step * pp * tm;
    threshold = round / 2;

    if (param.vertical) {
        y = parseInt((py + threshold) / round) * round;
        y = uu.number.range(0, y, tm * 100);
        param.value = Math.round(y / tm / pp + param.min);
        y |= 0;
    } else {
        x = parseInt((px + threshold) / round) * round;
        x = uu.number.range(0, x, tm * 100);
        param.value = Math.round(x / tm / pp + param.min);
        x |= 0;
    }

//{@fx
    if (fx) {
        uu.fx(param.grip, 150, { kill: 1, mbtx: x, mbty: y });
    } else {
//}@fx
        if (uu.env.mobile) {
            uu.css.transform2d(param.grip, { translateX: x, translateY: y });
        } else {
            param.grip.style.left = x + "px";
            param.grip.style.top  = y + "px";
        }
//{@fx
    }
//}@fx
    // update caption
    param.caption && (param.rail.title = parseInt(param.value));

    // sync
    if (param.node) {
        // update original node.value
        param.node.value = param.value;

        // fire original node.onchange event
        uu.event.fire(param.node, "change");
    }
}

// uu.Class.Slider.build
function SliderBuild(param,      // @param Hash(= {}):
                     backyard) { // @param Node(= <body>): backyard Node
                                 // @return Array: [SliderClassInstance, RailNode]
    var rail, grip, w;

    param = uu.arg(param, { min: 0, max: 100, size: 100, step: 1, value: 0,
                            vertical: 0, gripWidth: 13, gripHeight: 18 });

    if (param.vertical) {
        w = param.gripWidth;
        param.gripWidth  = param.gripHeight;
        param.gripHeight = w;
    }

    // <div class="Slider**" ui="Slider" tabindex="0" instance={uu.Class.Slider}>
    //      <div class="Slider*Grip" />
    // </div>

    rail = uu.div("ui,Slider,tabindex,0",
//{@mb
//{@ie67
                  !uu.ready.style.inlineBlock ? "display,inline,zoom,1" : // [IE6][IE7] hasLayout
//}@ie67
//}@mb
                  "display,inline-block,top,6px",
                  uu.div());
    grip = rail.firstChild;

    // glue
    uu.add(rail, backyard || doc.body);
    uu.css.userSelect(rail);

    rail.className = param.vertical ? ("SliderV" + param.size)
                                    : ("SliderH" + param.size);
    grip.className = param.vertical ? "SliderVGrip" : "SliderHGrip";

    uu("Slider", rail, grip, param);
    return rail;
}

// uu.Class.Slider.transform
function SliderTransform(node) { // @param Node:
                                 // @return Array: [SliderClassInstance, RailNode, InputRangeNode]
    //
    // <input type="range" value="50" min="0" max="100" ui="Slider" />
    //                                                  ~~~~~~~~~~~
    //          |
    //          |  transform
    //          v
    //
    // <div class="Slider**" ui="Slider" tabindex="0" instance={uu.Class.Slider} />  <- add
    //      <div class="Slider*Grip" />                                              <- add
    // </div>
    // <input type="range" value="50" min="0" max="100"                              <- modify
    //        instance={uu.Class.Slider} style="display:none" />
    //        ~~~~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~~~~~~~~
    //

    // pick slider param
    var attrs = uu.attr(node), rail,
        size = parseInt(attrs.size  || 100);

    size = uu.number.range(50, size, 200);

    rail = SliderBuild({
        min:    parseInt(attrs.min  || 0),
        max:    parseInt(attrs.max  || 100),
        size:   size,
        node:   node, // original node. <input type="range" />
        step:   parseInt(attrs.step || 1),
        value:  parseInt(node.value || 0),
        vertical: !!attrs.vertical
    });
    node.style.display = "none";
    node.removeAttribute("ui");
    node.instance = rail;
    uu.add(rail, node, "prev");

    return rail;
}

// uu.Class.Slider.isTransform
function SliderIsTransform(node) { // @param Node
    return node.tagName.toLowerCase() === "input" &&
           uu.attr(node, "ui") === "Slider";
}

// --- init ---
uu.ui.bind("Slider", { build:       SliderBuild,
                       transform:   SliderTransform,
                       isTransform: SliderIsTransform });

})(document, uu);
//}@uislider

//{@image
//{@preload
uu.config.ui.disable || uu.image(uu.config.ui.img); // pre-load
//}@preload
//}@image

uu.config.ui.disable || uu.ready(function(uu) {
    var ss = uu.ss("ui"), format = uu.f,
        img = uu.config.ui.img,
        fmt, focus,
        relative = "relative",
        absolute = "absolute";

//{@uislider
    // Slider
    fmt = 'background:url(@) no-repeat @px @px;position:@;width:@px;height:@px';
    ss.add({ ".SliderH200":  format(fmt, img,  -15,   0, relative, 214,  22),
             ".SliderH150":  format(fmt, img,  -15, -20, relative, 164,  22),
             ".SliderH100":  format(fmt, img,  -15, -40, relative, 114,  22),
             ".SliderH50":   format(fmt, img,  -15, -60, relative,  64,  22),
             ".SliderHGrip": format(fmt, img,    0,   0, absolute,  13,  18),
             ".SliderV200":  format(fmt, img, -230, -15, relative,  20, 214),
             ".SliderV150":  format(fmt, img, -250, -15, relative,  20, 164),
             ".SliderV100":  format(fmt, img, -270, -15, relative,  20, 114),
             ".SliderV50":   format(fmt, img, -290, -15, relative,  20,  64),
             ".SliderVGrip": format(fmt, img, -250,   0, absolute,  18,  13),
             ".SliderT50":   format(fmt, img,  -36, -80, relative,  64,  20) +
                             ";border:1px solid gray;-webkit-border-radius:5px" });
    // focus outline
    focus = "outline:1px solid skyblue";
    ss.add({ ".SliderH200:focus": focus,
             ".SliderH150:focus": focus,
             ".SliderH100:focus": focus,
             ".SliderH50:focus":  focus,
             ".SliderV200:focus": focus,
             ".SliderV150:focus": focus,
             ".SliderV100:focus": focus,
             ".SliderV50:focus":  focus });
//}@uislider
});

//}@ui
