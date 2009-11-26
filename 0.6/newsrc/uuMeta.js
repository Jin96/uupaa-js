
// === uuMeta ===
// depend: none
/*
window.UUMETA_IMAGE_DIR = "."
window.boot(uuMeta) - user defined boot loader
 */
(function uuMetaScope() {
var _mm,    // inner namespace
    _win    = window,
    _doc    = document,
    _UA     = navigator.userAgent,
    _ie     = !!_doc.uniqueID,
    _ie6    = _ie && (_UAVER === 6),
    _ie7    = _ie && (_UAVER === 7),
    _ie67   = _ie6 || _ie7,
    _ie8    = _ie && (_doc.documentMode || 0) >= 8,
    _opera  = !!_win.opera,
    _gecko  = _UA.indexOf("Gecko/") > 0,
    _webkit = _UA.indexOf("WebKit") > 0,
    _chrome = _UA.indexOf("Chrome") > 0,
    _quirks = (_doc.compatMode || "") !== "CSS1Compat",
    _UAVER  = _detectUserAgentVersion(),
    _REVER  = _detectRenderingEngineVersion(),
    _VAIN   = function() {}, // empty function
    _html   = _doc.getElementsByTagName("html")[0],
    _head   = _doc.getElementsByTagName("head")[0],
    _dec2   = _numbering("0123456789"),
    _hex2   = _numbering("0123456789abcdef"),
    _syncxhr, // lazy, xhr object for sync
    _ajaxdb = {}, // { "url": last modified date time(unit: ms), ... }
    _jsondb = {}; // JSONP job db
    _bootdb = [[], [], 0], // [[low order], [high order], fired]
    _nodedb = {}, // { nodeid: node, ... }
    _imgobj = {}, // { url: ImageObject, ... }
    _guid   = 0,
    _slice  = Array.prototype.slice,
    _DATA   = "uudata",
    _UTC    = /UTC/,
    _IE_FIX = /, /, // ie bug fix
    _SPACES = /\s+/,
    _BLANK  = /\S/,
    _TRIM   = /^\s+|\s+$/g,
    _QUOTE  = /^\s*["']?|["']?\s*$/g,
    _CLEAN  = /\s{2,}/g,
    _TAGS   = /<\/?[^>]+>/g,
    _BRACKET= /^\s*[\(\[\{<]?|[>\}\]\)]?\s*$/g,
    _TYPES  = fromStr("boolean,16,number,32,string,64,function,128", 1),
    // file:///localhost/dir/file.ext
    _FILE   = /^file:\/\/(?:\/)?(?:localhost\/)?((?:[a-z]:)?.*)$/i,
    // http://wwww.example.com:8080/dir/file.ext?key1=value1&key2=value2#frag
    _URL    = /^([\w.+-]*):\/\/([^\/:]+)(?::(\d*))?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i,
    _SCHEME = /^(file|https?):/,
    _HREF   = /href\="([^"]+)"/,
    _ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/,
    _CHOP_PATH    = /^.*\?/,
    _DECODE_AMP   = /&amp;/g,
    _PARSE_QS     = /(?:([^\=]+)\=([^\&]+)&?)/g,
    _HTML5TAGS    = "abbr,article,aside,audio,bb,canvas,datagrid,datalist," +
                    "details,dialog,eventsource,figure,footer,header,hgroup," +
                    "mark,menu,meter,nav,output,progress,section,time,video",
    _ATTR_ALIAS   = fromStr(_ie67 ? "class,className,for,htmlFor," +
                                    "colspan,colSpan,rowspan,rowSpan," +
                                    "accesskey,accessKey,tabindex,tabIndex"
                                  : "for,htmlFor"),
    _STYLE_ALIAS  = fromStr(_ie67 ? "float,styleFloat,cssFloat,styleFloat"
                                  : "float,cssFloat,styleFloat,cssFloat"),
    _TIDY_ALIAS   = mix(_decamelize(_html.style), _STYLE_ALIAS, _ATTR_ALIAS),
    _ATTR_COMPAT  = { href: 1, src: 1 }, // fix a[href^="#"] for IE6, IE7
    _QUERY_NGWORD = /(:(a|b|co|dig|first-l|li|mom|ne|p|t|v))|!=|\/=|<=|>=|&=|\{/,//}
    _FMT_DECODE   = fromStr("i,32785,d,32785,u,32801,o,33121,x,33377," +
                            "X,37473,f,146,c,10240,A,18432,s,132,%,3076", 1),
    _FMT_PARSE    = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcAs])/g,
    _HTML_ENCODE  = /[&<>]/g,
    _HTML_DECODE  = /&(?:amp|lt|gt|);/g,
    _HTML_CODE    = fromStr("&,&amp;,<,&lt;,>,&gt;,&amp;,&,&lt;,<,&gt;,>"),
    _JSON_JUDGE   = /"(\\.|[^"\\])*"/g,
    _JSON_NGWORD  = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/,
    _JSON_ESCAPE  = /(?:\"|\\[bfnrt\\])/g,
    _JSON_ENCODE  = /[\x00-\x1F\u0080-\uFFEE]/g,
    _JSON_SWAP    = fromStr('",\\",\b,\\b,\f,\\f,\n,\\n,\r,\\r,\t,\\t,\\,\\\\');

MessagePump.prototype = {
  regist:   msgRegist,
  unregist: msgUnregist,
  send:     msgSend,
  post:     msgPost
};

_win.uuMeta = _mm = {
  // --- ajax / jsonp / request ---
  ajax:     mix(ajax, {       // fn(url, param = { data = null, header = [], timeout = 10000 },
                              //    callback = void 0, ngcallback = void 0)
    sync:       ajaxSync,     // fn(url) - return response text or ""
    ifmod:      ajaxIfMod,    // fn(url, param = { data = null, header = [], timeout = 10000 },
                              //    callback = void 0, ngcallback = void 0)
    create:     ajaxObject,   // fn() - return new XMLHttpRequestObject object
    expire:     ajaxExpire    // fn()
  }),
  jsonp:    mix(jsonp, {      // fn(url, param = { timeout = 10000, method = "callback" },
                              //    callback = void 0, ngcallback = void 0)
    db:         _jsondb       // protected: jsonp job database
  }),
  // --- array ---
  toArray:      (_gecko || _webkit) ? toArray
                                    : toArrayLegacy, // fn(fake) - return array
  toCleanArray: toCleanArray, // fn([,,1,2,,]) - return [1, 2]
  toUniqueArray:toUniqueArray,// fn([0, 1, 2, 3, 3, 2, 1, 0]) - return [0, 1, 2, 3]
  // --- altcss ---
                              // uuMeta.altcss.* -> depend uuMeta.altcss.js
  // --- attr ---
  setAttr:      setAttr,      // fn(node, { attr1: "value", ... })
  getAttr:      getAttr,      // fn(node, "attr1,...") - return { attr1: "value", ... }
  // --- canvas ---
  canvas: {},                 // uuMeta.canvas.* -> uuMeta.canvas.js
  // --- cdsl(conditional selector) ---
                              // uuMeta.cdsl.* -> uuMeta.cdsl.js
  // --- class(oop) / instance ---
  Class:    mix(Class, {      // Class("myclass", { proto: ... }) - create new class
    singleton:  singleton,    // Class.singleton("myclass", proto) - create singleton class
    guid:       classguid     // Class.guid() - return Class instance guid
  }),
  // --- className ---
  hasClass:     hasClass,     // fn(node, "class1 class2") - return Boolean
  addClass:     addClass,     // fn(node, "class1 class2")
  removeClass:  removeClass,  // fn(node, "class1 class2")
  toggleClass:  toggleClass,  // fn(node, "class1 class2")
  // --- codec ---
  codec: {
    json: {
      decode:   jsondecode,
      encode:   jsonencode,
      parse:    jsondecode,   // alias
      stringify: jsonencode   // alias
    },
    unicode: {
      encode:   unicodeencode
    },
    html: { // HTML Entity
      encode:   htmlentityencode,
      decode:   htmlentitydecode
    }
  },
  // --- color ---
  color: {},                  // uuMeta.color.* -> uuMeta.color.js
  // --- cookie ---
  setCookie:    setCookie,    // fn(hash, option = {})
  getCookie:    getCookie,    // fn() - return { key: value, ... }
  // --- data / bond ---
  setData:      setData,      // fn(node, key, data = void 0)
  getData:      getData,      // fn(node, key) - return data
  hasData:      hasData,      // fn(node, key) - return Boolean
  eazyData:     eazyData,     // fn(node, key) - return Boolean
  // --- date ---
  date: {
    toGMTString:   toGMTString,  // fn(ms) - return "Wed, 16 Sep 2009 16:18:14 GMT"
    toISOString:   toISOString,  // fn(Date) - return "2000-01-01T00:00:00.000Z"
    fromISOString: fromISOString // fn("2000-01-01T00:00:00[.000]Z") - return { valid, date }
//  now:        function() { return +new Date; }
  },
  // --- debug ---
  debug: {},                  // uuMeta.debug.* -> uuMeta.debug.*.js
  // --- event ---
  evt: {
    boot:       boot,         // fn(callback, highPriority = false)
    shutdown:   shutdown,     // fn(callback, highPriority = false)
    blackout:   0             // protected: blackout flag
  },
  attachEvent:  attachEvent,  // fn(node, "click", callback, capture) - raw event handler
  detachEvent:  detachEvent,  // fn(node, "click", callback, capture) - raw event handler
  // --- feature ---
  feature: {
    HTML5TAGS:  _HTML5TAGS,                     // HTML5 tagset
    slver:      _detectSilverlightVersion(5),   // Silverlight version(3 later)
    flver:      _detectFlashVersion(),          // Flash version(7 later)
    ifjson:     !!_win.JSON,                    // support window.JSON object
    ifcookie:   navigator.cookieEnabled,        // support document.cookie object
    ifcanvas:   (_ie     && _UAVER >= 6)    ||  // support <canvas> element
                (_opera  && _UAVER >= 9.5)  ||
                (_gecko  && _REVER >= 1.81) ||
                (_webkit && _REVER >= 522)
  },
  // --- function --
  vain:         _VAIN,        // dummy function
  delay:        delay,        // fn(thisArg, callback, delay = 0, [args, ...]) - lazy eval
  evaluate:     evaluate,     // fn("return 1+2;") - return 3
  // --- hash / object ---
  hash: {
    dec2:       _dec2,        // number to dec numbered hash. [9]  -> "09"
    hex2:       _hex2,        // number to hex numbered hash. [15] -> "0f"
    size:       hashSize,     // fn(mix) - return Number(hash length)
    keys:       hashKeys,     // fn(mix) - return [key1, key2, ...]
    values:     hashValues,   // fn(mix) - return [value1, value2, ...]
    indexOf:    hashIndexOf,  // fn(hash, value) - return String("found") or void 0
    contains:   hashContains, // fn(hash, value) - return Boolean
    fromPair:   fromPair,     // fn(key, value) - return { key: value }
    fromStr:    fromStr       // fn("key,value,...") - return { key: "value", ... }
  },
  // --- image ---
  image: {
    dir:        (_win.UUMETA_IMAGE_DIR || ".").replace(/\/+$/, ""), // image dir
    load:       loadImage,                  // fn(url, callback)
    getActualDimension: getActualDimension  // fn(image) - return { w, h }
  },
  // --- jam ---
                              // uuMeta.jam.* -> uuMeta.jam.js
  // --- layer ---
                              // uuMeta.layer.* -> uuMeta.layer.js
  // --- message pump ---
  msg:          new MessagePump(), // uuMeta.msg is MessagePump class instance
                              // uuMeta.msg.regist(obj, ...) - return this
                              // uuMeta.msg.unregist(obj, ...) - return this
                              // uuMeta.msg.send(to, msg, p1, p2) - return msgbox() result
                              // uuMeta.msg.post(to, msg, p1, p2) - return this
  // --- node / node list ---
  node: {
    id:         nodeid,       // fn(node) - return nodeid
    id2node:    id2node,      // fn(nodeid) - return node
    idcounter:  0,            // protected: nodeid counter
    db:         _nodedb,      // protected: nodeid database
    insert:     insertNode,   // fn("<div>", ctx = body, pos = last) - return first node
    insertScript:insertScript,// fn("http://...", option = {}) - return script node
    insertText: insertText,   // fn("text", ctx = body, pos = last) - return first node
    clear:      clearNode,    // fn(parentNode) - return node
//  clone:      cloneNode,
    remove:     removeNode,   // fn(node) - return node
    replace:    replaceNode,  // fn(newNode, oldNode) - return oldNode
    cutdown:    cutdownNode,  // fn(ctx = body) - return DocumentFragment
    compact:    compactNode,  // fn(ctx = body, depth = 0)
    substance:  substanceNode,// fn("<div>", ctx = owner) - return DocumentFragment
    root:       _doc.documentElement || _html, // documentElement or <html>
    html:       _html,        // <html> element
    head:       _head         // <head> element
  },
  FIRST:        1,            // uuMeta.FIRST - first sibling
  PREV:         2,            // uuMeta.PREV - prev sibling
  NEXT:         3,            // uuMeta.NEXT - next sibling
  LAST:         4,            // uuMeta.LAST - last sibling
  FIRSTC:       5,            // uuMeta.FIRSTC - first child
  LASTC:        6,            // uuMeta.LASTC - last child
  // --- number ---
  guid:         guid,         // fn() - return unique number
  // --- query ---
  query:    mix(query, {      // fn(expr, context = document) - return NodeArray
    id:         queryid,      // fn(expr) - return Node
    tag:        _ie ? querytagLegacy
                    : querytag, // fn(expr, context = document) - return NodeArray
    className:  _doc.getElementsByClassName ? queryclass
                                            : queryclassLegacy
                              // fn(expr, context = document) - return NodeArray
  }),
  // --- scope ---
  exp:          exp,          // fn(scope, prefix = "", suffix = "")
  mix:          mix,          // fn(base, flavor, aroma = void 0, override = true) - return base
  // --- string ---
  clean:        clean,        // fn("  has  space  ") - return "hash space"
  tidy:         tidy,         // fn("class") - return "className"
  fmt:          fmt,          // fn("%s-%d", ...) - return "formatted string"
  trim:         trim,         // fn("  has  space  ") - return "has  space"
  trimQuote:    trimQuote,    // fn(" 'has  space' ") - return "has  space"
  trimBracket:  trimBracket,  // fn("<bracket>") - return "bracket"
  stripTags:    stripTags,    // fn("<h1>A</h1>B<p>C</p>") - return "ABC"
  splitSpace:   splitSpace,   // fn(" A  B  C ") - return ["A", "B", "C"]
  splitComma:   splitComma,   // fn(" A,B,C ") - return ["A", "B", "C"]
  splitToken:   splitToken,   // fn(expr, splitter = " ", notrim = 0) - return ["token", ...]
  // --- style ---
  style:        {             // uuMeta.style.* -> uuMeta.style.js
    show:       styleShow,    // fn(node)
    hide:       styleHide,    // fn(node)
    sheet:      {},           // uuMeta.style.sheet.*    -> uuMeta.style.sheet.js
    validate:   {}            // uuMeta.style.validate.* -> uuMeta.style.validate.js
  },
  setStyle:     setStyle,     // fn(node, { "css-prop": value, cssProp: value })
  getStyle:     _ie ? getStyleIE
                    : getStyle, // fn(node, "css-prop,cssProp") - return { cssProp: value }
  getInnerSize: getInnerSize, // fn() - return { w, h }
  getScrollSize:getScrollSize,// fn() - return { w, h }
  // --- type ---
  type:         detectType,   // fn(mix, match = 0) - return Boolean or Number(match type)
  NULL:         0x001,        // null
  UNDEF:        0x002,        // undefined
  HASH:         0x004,        // Hash / Object / window / document
  ARRAY:        0x008,        // Array
  BOOL:         0x010,        // Boolean
  NUM:          0x020,        // Number
  STR:          0x040,        // String
  FUNC:         0x080,        // Function
  NODE:         0x100,        // Node
  FAKE:         0x200,        // FakeArray "length" has collection (eg: NodeList)
  DATE:         0x400,        // Date
  // --- tween ---
                              // uuMeta.tween.* -> uuMeta.tween.js
  // --- url / path ---
  url: {
    toAbs:      toAbs,        // fn(url, curtdir) - return absolute URL
    toDir:      toDir,        // fn(path, result) - return absolute directory
    parse:      parseURL,     // fn(url) - return { url, scheme, domain, port, base, path,
                              //                    dir, file, query, hash, fragment }
    build:      buildURL,     // fn(url) - return "scheme://domain:port/path?query#fragment"
    parseQuery: parseQuery,   // fn(query) - return { key: value, ... }
    buildQuery: buildQuery    // fn(query) - return "key=value&key=value..."
  },
  // --- user agent ---
  ua: {
    ie:         _ie,          // is IE
    ie6:        _ie6,         // is IE6
    ie7:        _ie7,         // is IE7
    ie67:       _ie67,        // is IE6 or IE7
    ie8:        _ie8,         // is IE8(ie8 mode)
    opera:      _opera,       // is Opera
    gecko:      _gecko,       // is Gecko (has Firefox)
    webkit:     _webkit,      // is WebKit(has Chrome, iPhone, iPod, Safari)
    chrome:     _chrome,      // is Google Chrome
    safari:     !_chrome && _UA.indexOf("Safari") > 0,  // is Safari
    iphone:     _webkit && /iPod|iPhone/.test(_UA),     // is iPhone or iPod
    quirks:     _quirks,      // is Quirks mode
    firefox:    _UA.indexOf("Firefox/") > 0,  // is Firefox
    rever:      _REVER,       // rendering engine version
    uaver:      _UAVER        // user agent version, http://d.hatena.ne.jp/uupaa/20090603
  }
};

// --- ajax / jsonp / request ---
// uuMeta.ajax - Async "GET" or "POST" request
//    ajax("http://...", {}, function(txt) { alert(txt); });
function ajax(url,          // @param URLString: request url
              option,       // @param Hash(= {}): { data, header, timeout }
                            //        Mix(= null): data, request data
                            //        Array(= []): header, [(key, value), ...]
                            //        Number(= 10000): timeout
              callback,     // @param Function(= void 0): callback function
                            //        function callback(txt) {}
              ngcallback) { // @param Function(= void 0): ngcallback function
                            //        function ngcallback(status, url) {}
  url = toAbs(url);
  option = option || {};
  var xhr, run = 0, v, i = 0,
      timeout = option.timeout || 10000,
      header = option.header || [],
      ifmod = option.ifmod,
      data = option.data || null,
      ng = ngcallback;

  function state() {
    var ctype, last;

    if (xhr.readyState === 4) {
      if (xhr.status === 200 || !xhr.status) {
        if (callback && !run++) {
          ctype = xhr.getResponseHeader("content-type") || "";
          callback(ctype.indexOf("xml") < 0 ? xhr.responseText       // text
                                            : xhr.responseXML, url); // xml
        }
        if (ifmod) { // parse "Last-Modified" value
          last = xhr.getResponseHeader("Last-Modified");
          _ajaxdb[url] = last ? Date.parse(last) : 0;
        }
      } else {
        (ng && !run++) && ng(xhr.status, url); // 304 too
      }
      // gc
      xhr.onreadystatechange = "";
      xhr = null;
    }
  }

  if ( (xhr = ajaxObject()) ) {
    try {
      xhr.onreadystatechange = state;
      xhr.open(data ? "POST" : "GET", url, true);
      // set request header
      header.push("X-Requested-With", "XMLHttpRequest");
      (ifmod && url in _ajaxdb) &&
          header.push("If-Modified-Since", toGMTString(_ajaxdb[url]));
      data &&
          header.push("Content-Type", "application/x-www-form-urlencoded");

      while ( (v = header[i++]) ) {
        xhr.setRequestHeader(v, header[i++]);
      }
      xhr.send(data);

      setTimeout(function() { // watchdog timer
        xhr.abort && xhr.abort();
        (ng && !run++) && ng(408, url); // 408 "Request Time-out"
      }, timeout);
      return;
    } catch (err) {}
  }
  (ng && !run++) && ng(400, url);
}

// uuMeta.ajax.sync - Sync "GET" request
function ajaxSync(url) { // @param String: request url
                         // @return String: responseText or ""
  try {
    _syncxhr || (_syncxhr = ajaxObject());
    _syncxhr.open("GET", toAbs(url), false); // sync
    _syncxhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    _syncxhr.send(null);
    if (_syncxhr.status === 200 || !_syncxhr.status) {
      return _syncxhr.responseText;
    }
  } catch(err) {}
  return "";
}

// uuMeta.ajax.ifmod - Async "GET" or "POST" request
//                     with If-Modified-Since header
function ajaxIfMod(url,          // @param URLString: request url
                   option,       // @param Hash(= {}): { data, header, timeout }
                   callback,     // @param Function(= void 0): callback
                   ngcallback) { // @param Function(= void 0): ngcallback
  ajax(url, mix(option || {}, { ifmod: 1 }), callback, ngcallback);
}

// uuMeta.ajax.create - create XMLHttpRequest object
function ajaxObject() { // @return XMLHttpRequestObject/void 0:
  var rv;

  try {
    if (_ie && ActiveXObject) {
      rv = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!rv && XMLHttpRequest) {
      rv = new XMLHttpRequest();
    }
  } catch (err) {}
  return rv;
}

// uuMeta.ajax.expire - expire [Async If-Modified-Since request] cache
function ajaxExpire() {
  _ajaxdb = {};
}

// uuMeta.jsonp - Async JSONP request
//      jsonp("http://example.com/a.php", {}, function(result) {});
function jsonp(url,          // @param URLString: request url
               option,       // @param Hash(= {}): { method, timeout }
                             //        String(= "callback"): method
                             //        Number(= 10000):      timeout
               callback,     // @param Function(= void 0):
               ngcallback) { // @param Function(= void 0):
  url = toAbs(url);
  option = mix(option || {}, { timeout: 10000, method: "callback" }, 0, 0);
  var jobid = "j" + guid(), hash = parseURL(url), node;

  // add QueryString( "&callback=uuMeta.jsonp.db.j1" )
  hash.hash[option.method] = "uuMeta.jsonp.db." + jobid;
  hash.query = buildQuery(hash.hash);

  _jsondb[jobid] = function(json, code) {
    if (!node._run++) {
      json ? (callback && callback(json, url))
           : (ngcallback && ngcallback(code || 404));
      setTimeout(_jsonpgc, option.timeout + 100000);
    }
  };
  node = insertScript(buildURL(hash), { _run: 0 });

  setTimeout(function() { // watchdog
    _jsondb[jobid]("", 408); // 408 "Request Time-out"
  }, option.timeout);

  function _jsonpgc() {
    _head.removeChild(node);
    delete _jsondb[jobid];
  }
}

// --- array ---
// Array.prototype.indexOf
function ArrayIndexOf(searchElement, // @param Mix:
                      fromIndex) {   // @param Number(= 0):
                                     // @return Number: found index or -1
  var iz = this.length, i = fromIndex || 0;

  i = (i < 0) ? i + iz : i;
  for (; i < iz; ++i) {
    if (i in this && this[i] === searchElement) {
      return i;
    }
  }
  return -1;
}

// Array.prototype.lastIndexOf
function ArrayLastIndexOf(searchElement, // @param Mix:
                          fromIndex) {   // @param Number(= this.length):
                                         // @return Number: found index or -1
  var iz = this.length, i = fromIndex;

  i = (i < 0) ? i + iz : iz - 1;
  for (; i > -1; --i) {
    if (i in this && this[i] === searchElement) {
      return i;
    }
  }
  return -1;
}

// Array.prototype.every
function ArrayEvery(callback,  // @param Function: evaluator
                    thisArg) { // @param ThisObject(= void 0):
                               // @return Boolean:
  for (var i = 0, iz = this.length; i < iz; ++i) {
    if (i in this && !callback.call(thisArg, this[i], i, this)) {
      return false;
    }
  }
  return true;
}

// Array.prototype.some
function ArraySome(callback,  // @param Function: evaluator
                   thisArg) { // @param ThisObject(= void 0):
                              // @return Boolean:
  for (var i = 0, iz = this.length; i < iz; ++i) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return true;
    }
  }
  return false;
}

// Array.prototype.forEach
function ArrayForEach(callback,  // @param Function: evaluator
                      thisArg) { // @param ThisObject(= void 0):
  for (var i = 0, iz = this.length; i < iz; ++i) {
    i in this && callback.call(thisArg, this[i], i, this);
  }
}

// Array.prototype.map
function ArrayMap(callback,  // @param Function: evaluator
                  thisArg) { // @param ThisObject(= void 0):
                             // @return Array: [element, ... ]
  for (var iz = this.length, rv = Array(iz), i = 0; i < iz; ++i) {
    i in this && (rv[i] = callback.call(thisArg, this[i], i, this));
  }
  return rv;
}

// Array.prototype.filter
function ArrayFilter(callback,  // @param Function: evaluator
                     thisArg) { // @param ThisObject(= void 0):
                                // @return Array: [element, ... ]
  for (var rv = [], ri = -1, v, i = 0, iz = this.length; i < iz; ++i) {
    if (i in this) {
      v = this[i];
      callback.call(thisArg, v, i, this) && (rv[++ri] = v);
    }
  }
  return rv;
}

// Array.prototype.reduce
function ArrayReduce(callback,       // @param Function: evaluator
                     initialValue) { // @param Mix(= void 0):
                                     // @return Mix:
  var rv, i = 0, iz = this.length, found = 0;

  if (initialValue !== void 0) {
    rv = initialValue;
    ++found;
  }
  for (; i < iz; ++i) {
    if (i in this) {
      rv = found ? callback(rv, this[i], i, this)
                 : (++found, this[i]);
    }
  }
  if (!found) { throw ""; }
  return rv;
}

// Array.prototype.reduceRight
function ArrayReduceRight(callback,       // @param Function: evaluator
                          initialValue) { // @param Mix(= void 0):
                                          // @return Mix:
  var rv, i = 0, found = 0;

  if (initialValue !== void 0) {
    rv = initialValue;
    ++found;
  }
  for (i = this.length - 1; i >= 0; --i) {
    if (i in this) {
      rv = found ? callback(rv, this[i], i, this)
                 : (++found, this[i]);
    }
  }
  if (!found) { throw ""; }
  return rv;
}

// uuMeta.toArray - convert NodeList(fake array) to array
function toArray(fake) { // @param NodeList/Array:
                         // @return Array:
  return _slice.call(fake);
}

function toArrayLegacy(fake) {
  var rv = [], ri = -1, i = 0, iz = fake.length;

  for (; i < iz; ++i) {
    rv[++ri] = fake[i];
  }
  return rv;
}

// uuMeta.toCleanArray - Array compaction, trim null and undefined element
function toCleanArray(src) { // @param Array: source
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

// uuMeta.toUniqueArray - make array from unique element
function toUniqueArray(src,       // @param Array: source
                       literal) { // @param Boolean(= false): literal only
                                  // @return Array:
  var rv = [], ri = -1, v, i = 0, j, iz = src.length, f, unq = {};

  for (; i < iz; ++i) {
    v = src[i];
    if (v !== null && v !== void 0) {
      if (literal) {
        unq[v] || (unq[v] = 1, rv[++ri] = v);
      } else {
        for (f = 0, j = i - 1; !f && j >= 0; --j) {
          f = (v === src[j]);
        }
        !f && (rv[++ri] = v);
      }
    }
  }
  return rv;
}

// --- attr ---
// uuMeta.setAttr - set attribute
function setAttr(node,   // @param Node:
                 hash) { // @param Hash: { attr1: "value", ... }
  for (var i in hash) {
    node.setAttribute(_ie67 ? (_ATTR_ALIAS[i] || i)
                            : i, hash[i]);
  }
}

// uuMeta.getAttr - get attribute
function getAttr(node,    // @param Node:
                 attrs) { // @param JointString: "attr1,..."
                          // @return Hash: { attr1: "value", ... }
  var rv = {}, ary = attrs.split(","), v, i = 0;

  while ( (v = ary[i++]) ) {
    rv[v] = (_ie ? ((_ie8 || _ATTR_COMPAT[v]) ? node.getAttribute(v, 2)
                                              : node[_ATTR_ALIAS[v] || v])
                 : node.getAttribute(v)) || "";
  }
  return rv;
}

// --- data / bond ---
// uuMeta.setData - set data
//    setData(node, "key", "data") -> node.uudata[key] = data
//    setData(node, "key")         -> delete node.uudata
function setData(node,   // @param Node:
                 key,    // @param String: key
                 data) { // @param Mix(= void 0): data, void 0 is remove data
  node[_DATA] || (node[_DATA] = {});
  (data === void 0) ? (delete node[_DATA][key])
                    : (node[_DATA][key] = data);
}

// uuMeta.getData - get data
function getData(node,  // @param Node:
                 key) { // @param String: key
                        // @return Mix/void 0: value or void 0
  return node[_DATA] ? node[_DATA][key] : void 0;
}

// uuMeta.hasData - has data
function hasData(node,  // @param Node:
                 key) { // @param String: key
                        // @return Boolean:
  return node[_DATA] && node[_DATA][key];
}

// uuMeta.eazyData - eazy data handling
function eazyData(node,  // @param Node:
                  key) { // @param String: key
                         // @return Boolean: true is bonded
  var rv = getData(node, key) ? 1 : 0;

  setData(node, key, rv);
  return !!rv;
}

// --- class(oop) / instance ---
// uuMeta.Class - create a generic class
function Class(name,    // @param String: class name
               proto) { // @param Hash(= void 0): prototype object
  Class[name] = function() {
    var me = this;

    classguid(me);
    me.construct && me.construct.apply(me, arguments);
    me.destruct  && shutdown(function() { me.destruct(); });
    _mm.msg      && _mm.msg.regist(me);
  };
  Class[name].prototype = proto || {};
}

// uuMeta.Class.singleton - create a singleton class
function singleton(name,    // @param String: class name
                   proto) { // @param Hash(= void 0): prototype object
                            // @return Object: singleton class instance
  Class[name] = function() {
    var me = this, arg = arguments, self = arg.callee;

    if (self.instance) {
      me.stabled   && me.stabled.apply(me, arg); // after the second
    } else {
      classguid(me);
      me.construct && me.construct.apply(me, arg);
      me.destruct  && shutdown(function() { me.destruct(); });
      _mm.msg      && _mm.msg.regist(me);
    }
    return self.instance || (self.instance = me);
  };
  Class[name].prototype = proto || {};
}

// uuMeta.Class.guid - get instance id
function classguid(instance) { // @param instance:
                                // @return Number: instance id, from 1
  return instance.guid || (instance.guid = ++_guid);
}

// --- className ---
// uuMeta.hasClass - has className
function hasClass(node,    // @param Node:
                  klass) { // @param JointString: "class1 class2 ..."
                           // @return Boolean: true = has className
  var m, ary, cn = node.className;

  if (!klass || !cn) { return false; }

  ary = splitSpace(klass);
  if (ary.length > 1) {
    m = cn.match(_multiclass(ary));
    return m && m.length >= ary.length;
  }
  return (" " + cn + " ").indexOf(" " + ary[0] + " ") >= 0;
}

// uuMeta.addClass - add className property
function addClass(node,    // @param Node:
                  klass) { // @param JointString: "class1 class2 ..."
  node.className = clean(node.className + " " + klass);
}

// uuMeta.removeClass - remove className property
function removeClass(node,    // @param Node:
                klass) { // @param JointString: "class1 class2 ..."
  node.className =
      clean(node.className.replace(_multiclass(splitSpace(klass)), ""));
}

// uuMeta.toggleClass - toggle(add / remove) className property
function toggleClass(node,    // @param Node:
                     klass) { // @param JointString: "class1 class2 ..."
  (hasClass(node, klass) ? removeClass : addClass)(node, klass);
}

// inner - make multiple className RegExp object
function _multiclass(ary) { // @param Array:
                            // @return RegExpObject:
  // /(?:^| )(AA|BB|CC)(?:$|(?= ))/g
  return RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
}

// --- codec ---
// uuMeta.codec.json.encode
function jsonencode(mix,        // @param Mix:
                    callback) { // @param Function(= uuMeta.codec.json.strict):
                                // @return JSONString:
  return _jsoninspect(mix, callback || jsonstrict);
}

// uuMeta.codec.json.strict
function jsonstrict(mix) { // @param Mix:
  throw "";
}

// uuMeta.codec.json.decode
function jsondecode(str) { // @param JSONString:
                           // @return Mix/Boolean:
  return _JSON_NGWORD.test(str.replace(_JSON_JUDGE, "")) ? false
                                                         : evaluate(str);
}

// inner -
function _jsoninspect(mix, callback) {
  var rv, i, iz;

  switch (detectType(mix)) {
  case _mm.BOOL:
  case _mm.DATE:
  case _mm.NUM:
  case _mm.STR:   return mix.toJSON();
  case _mm.NULL:  return "null";
  case _mm.ARRAY:
  case _mm.FAKE:  rv = [], i = 0, iz = mix.length;
                  for (; i < iz; ++i) {
                    rv.push(_jsoninspect(mix[i], callback));
                  }
                  return "[" + rv.join(",") + "]";
  case _mm.HASH:  rv = [];
                  for (i in mix) {
                    rv.push(i.toJSON() + ":" +
                            _jsoninspect(mix[i], callback));
                  }
                  return "{" + rv.join(",") + "}";
  }
  return callback(mix); // error
}

// inner -
function _jsonswap(m) {
  return _JSON_SWAP[m];
}

// uuMeta.codec.unicode.encode - char to "\u0000"
function unicodeencode(c) { // @param String: char
                            // @return String "\u0000" ~ "\uffff"
  c = c.charCodeAt(0);
  return "\\u" + _hex2[(c >> 8) & 255] + _hex2[c & 255];
}

// uuMeta.codec.html.encode - HTML entity encode
function htmlentityencode(str) { // @param String: '<a href="&">'
                                 // @return String '&lt; href="&amp;"&gt;'
  return str.replace(_HTML_ENCODE, _htmlentityswap);
}

// uuMeta.codec.html.decode - HTML entity decode
function htmlentitydecode(str) { // @param String: '&lt; href="&amp;"&gt;'
                                 // @return String '<a href="&">'
  return str.replace(_HTML_DECODE, _htmlentityswap);
}

// inner -
function _htmlentityswap(c) {
  return _HTML_CODE[c];
}

// --- cookie ---
// uuMeta.setCookie - store cookie
function setCookie(hash,     // @param Hash: { key: value, ... }, cookie data
                   option) { // @param Hash(= {}): { domain, path, expire }
  if (_mm.feature.ifcookie) {
    var rv = [], i, fn = encodeURIComponent;

    for (i in hash) {
      rv.push(fn(i) + "=" + fn(hash[i]));
    }
    option.domain && rv.push("domain="  + option.domain);
    option.path   && rv.push("path="    + option.path);
    option.expire && rv.push("max-age=" + option.expire);
    (location.protocol === "https:") && rv.push("secure");
    _doc.cookie = rv.join("; "); // store
  }
}

// uuMeta.getCookie - retrieve cookie
function getCookie() { // @return Hash: { key: value, ... }
  if (!_mm.feature.ifcookie) { return {}; } // cookie not ready

  var rv = {}, r, ary = _doc.cookie.split("; "), v, i = 0,
      fn = decodeURIComponent;

  while ( (v = ary[i++]) ) {
    r = v.split("=");
    rv[fn(r[0])] = fn(r[1]);
  }
  return rv;
}

// --- date ---
// uuMeta.date.toGMTString - convert GMT format time string
function toGMTString(ms) { // @param Date/Number(= void 0): Date.parse result
                           //             void 0 is current time
                           // @return String:
  var rv = ((ms === void 0) ? new Date()
                            : new Date(ms)).toUTCString();

  if (_ie && _UTC.test(rv)) { // http://d.hatena.ne.jp/uupaa/20080515
    rv = rv.replace(_UTC, "GMT");
    (rv.length < 29) && (rv = rv.replace(_IE_FIX, ", 0")); // fix IE format
  }
  return rv;
}

// uuMeta.date.toISOString - convert to ISO8601 string(JSON SAFE DATE)
//    toISOString(new Date()) -> "YYYY-MM-DDTHH:mm:ss.sssTZ"
function toISOString(date) { // @param DateObject(= void 0):
                             // @return String: "2000-01-01T00:00:00.000Z"
  date || (date = new Date);
  return date.getUTCFullYear()        + '-' +
         _dec2[date.getUTCMonth() + 1] + '-' +
         _dec2[date.getUTCDate()]      + 'T' +
         _dec2[date.getUTCHours()]     + ':' +
         _dec2[date.getUTCMinutes()]   + ':' +
         _dec2[date.getUTCSeconds()]   + '.' +
         _dec2[date.getUTCMilliseconds()] + 'Z';
}

// Date.prototype.toISOString - to ISO8601 string, ECMAScript-262 5th
function DateToISOString() {
  return toISOString(this);
}

// uuMeta.date.fromISOString - from ISO8601 string to Date
function fromISOString(str,  // @param String: "2000-01-01T00:00:00[.000]Z"
                       rv) { // @param Hash(= void 0):
                             // @return Hash: { valid, date }
                             //         Boolean: valid, 0 or 1
                             //         DateObject: date, date object or null
  rv || (rv = { valid: 0, date: null });
  var m = _ISO_DATE.exec(str);

  if (m) {
    rv.date = new Date(Date.UTC(+m[1], (+m[2]) - 1, +m[3],
                                +m[4], +m[5], +m[6]));
    rv.valid = 1;
  }
  return rv;
}

// --- event ---
// uuMeta.evt.boot - catch DOMContentReady/window.onload event
function boot(callback,       // @param Function:
              highPriority) { // @param Boolean(= false):
  if (!_mm.evt.blackout) {
    _bootdb[2] ? callback() // [2] fired
               : _bootdb[+highPriority].push(callback); // stock
  }
}

// uuMeta.evt.shutdown - catch window.onunload event
function shutdown(callback) { // @param Function:
  detachEvent(_win, "unload", callback);
}

// uuMeta.attachEvent - attach event - raw level event handler
function attachEvent(node,      // @param Node:
                     eventName, // @param String:
                     callback,  // @param Function: callback
                     capture) { // @param Boolean(= false):
  _ie ? node.attachEvent("on" + eventName, callback)
      : node.addEventListener(eventName, callback, capture || false);
}

// uuMeta.detachEvent - detach event - raw level event handler
function detachEvent(node,      // @param Node:
                     eventName, // @param String:
                     callback,  // @param Function: callback
                     capture) { // @param Boolean(= false):
  _ie ? node.detachEvent("on" + eventName, callback)
      : node.removeEventListener(eventName, callback, capture || false);
}

// inner - bootstrap, WindowReadyState and DOMReadyState handler
function _bootstrap() {
  function fire() {
    if (!_mm.evt.blackout && !_bootdb[2]++) { // [2] fired
      var v, i = 0, ary = _bootdb[1].concat(_bootdb[0]); // marge copy

      while ( (v = ary[i++]) ) { v(); }
      (typeof _win.boot === "function") && _win.boot(_mm);
      _bootdb = [[], [], 1]; // reset
    }
  }
  function _peekie() {
    try {
      _doc.firstChild.doScroll("up"), fire();
    } catch(err) { setTimeout(_peekie, 16); }
  }
  attachEvent(_win, "load", fire);
  _ie ? _peekie()
      : attachEvent(_doc, "DOMContentLoaded", fire);
}

// --- function ---
// uuMeta.delay - lazy evaluation
function delay(thisArg,  // @param ThisObject: bind this
               callback, // @param Function:
               delay,    // @param Number(= 0): delay time(ms)
               args) {   // @param Array(= void 0): var_args
  setTimeout(function() {
    callback.apply(thisArg, args === void 0 ? [] : args);
  }, delay || 0);
}

// uuMeta.evaluate
//    evaluate("return 3+4") = 7
function evaluate(str) { // @param String:
                         // @return Mix:
  return (new Function(str))();
}

// Function.prototype.bind - ECMAScript-262 5th
function FunctionBind(thisArg,    // @param ThisObject: bind this
                      var_args) { // @param Mix(= void 0): bind var_args
                                  // @return Function: closure
  var currentScope = this, args = toArrayLegacy(arguments);

  args.shift();
  return function(var_args) {
    return currentScope.apply(thisArg,
                              args.concat(toArrayLegacy(arguments)));
  };
}

// --- feature ---
// inner - detect Silverlight version (version range 3.0 ~ 5.0)
function _detectSilverlightVersion(range, obj) {
  try {
    obj = _ie ? new ActiveXObject("AgControl.AgControl")
              : parseInt(/\d+\.\d+/.exec(navigator.plugins[
                         "Silverlight Plug-In"].description)[0]);
    for (; range >= 3; --range) {
      if (_ie ? obj.IsVersionSupported(range + ".0")
              : obj >= range) {
        return range;
      }
    }
  } catch(err) {}
  return 0;
}

// inner - detect Flash version (version range 7.0 ~ later)
function _detectFlashVersion(ver, obj) {
  try {
    obj = _ie ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
              : navigator.plugins["Shockwave Flash"];
    ver = /\d+\.\d+/.exec(_ie ? obj.GetVariable("$version").replace(/,/g, ".")
                              : obj.description);
    return ver ? parseFloat(ver[0], 10) : 0;
  } catch(err) {}
  return 0;
}

// --- hash / object ---
// inner - make numbering
function _numbering(str) { // @param String: "0123456789"
                           // @return Array: ["00", "01", "02", ... "99"]
  var rv = [], ri = -1, i = 0, j = 0,
      ary = str.split(""), az = ary.length;

  for (; i < az; ++i) {
    for (j = 0; j < az; ++j) {
      rv[++ri] = ary[i] + ary[j];
    }
  }
  return rv;
}

// uuMeta.hash.size - get hash length
function hashSize(mix) { // @param FakeArray/Array/Hash:
                         // @return Number:
  return mix.length || _hashsize(mix, 0, 0);
}

// uuMeta.hash.keys - enum hash keys
function hashKeys(mix) { // @param FakeArray/Array/Hash:
                         // @return Array: [key, ... ]
  return _enumhash(mix, 0, [], -1, 0, mix.length);
}

// uuMeta.hash.values - enum hash values
function hashValues(mix) { // @param FakeArray/Array/Hash:
                           // @return Array: [value, ... ]
  return _enumhash(mix, 1, [], -1, 0, mix.length);
}

// uuMeta.hash.indexOf - find key from value
function hashIndexOf(hash, value) { // @param Hash:
                                    // @param Mix: find value
                                    // @return String/void 0:
                                    //              "found-key" or void 0
  for (var i in hash){
    if (hash.hasOwnProperty(i) && hash[i] === value) {
      return i;
    }
  }
  return void 0;
}

// uuMeta.hash.contains - has value
function hashContains(hash,    // @param Hash:
                      value) { // @param Mix: find value
                               // @return Boolean:
  return hashIndexOf(hash, value) !== void 0;
}

// uuMeta.hash.fromPair - make hash from key value pair
function fromPair(key,     // @param String/Hash: key
                  value) { // @param Mix: value
                           // @return Hash: { key: value }
  var rv;

  return (typeof key !== "string") ? key
                                   : (rv = {}, rv[key] = value, rv);
}

// uuMeta.hash.fromStr - make hash from String
function fromStr(str,           // @param JointString: "key,value,..."
                 numberValue) { // @param Boolean(= false):
                                // @return Hash: { key: "value", ... }
                                //            or { key:  value,  ... }
  var rv = {}, w, v, i = 0, ary = str.split(","), num = numberValue || 0;

  while ( (v = ary[i++]) ) {
    w = ary[i++];
    rv[v] = num ? +w : w;
  }
  return rv;
}

// inner - enum keys or values
function _enumhash(mix, key, rv, ri, i, iz) {
  if (iz === void 0) {
    for (i in mix) {
      (mix.hasOwnProperty(i)) && (rv[++ri] = key ? i : mix[i]);
    }
  } else {
    for (; i < iz; ++i) {
      i in mix && (rv[++ri] = key ? i : mix[i]);
    }
  }
  return rv;
}

// inner - get hash size
function _hashsize(mix, i, rv) {
  for (i in mix) {
    mix.hasOwnProperty(i) && ++rv;
  }
  return rv;
}

// --- HTMLElement ---
function innerTextGetter() { // @return String:
                             // @reurn String: innerText
  return this.textContent;
}

function innerTextSetter(text) { // @param String:
  while (this.hasChildNodes()) {
    this.removeChild(this.lastChild);
  }
  this.appendChild(_doc.createTextNode(text));
}

function outerHTMLGetter() { // @return String:
                             // @reurn String: outerHTML
  var range = _doc.createRange(), div = _doc.createElement("div");

  range.selectNode(this);
  div.appendChild(range.cloneContents());
  return div.innerHTML;
}

function outerHTMLSetter(html) { // @param String:
  var range = _doc.createRange(), cf;

  range.setStartBefore(this);
  cf = range.createContextualFragment(html);
  this.parentNode.replaceChild(cf, this);
}

// --- image ---
// uuMeta.image.load - delay image loader
function loadImage(url,        // @param String:
                   callback) { // @param Function: callback(img, state, dim)
                               //     Object: image object
                               //     Number: state, 0(loading...),
                               //                    1(loaded), -1(error)
                               //     Hash: dim: { w, h }
                               // @return ImageObject:
  function _onimageload() {
    var v, i = 0, ary = img.callback.slice(), // copy
        keep = { img: img, state: img.state,
                 dim: { w: img.width, h: img.height }};

    img.callback = []; // clear
    while ( (v = ary[i++]) ) {
      try {
        v(keep.img, keep.state, keep.dim);
      } catch(err) {}
    }
  }
  var img;

  if (url in _imgobj) {
    img = _imgobj[url];
    img.callback.push(callback); // stock
    img.state && _onimageload(); // -1 or 1
    return img;
  }

  _imgobj[url] = img = new Image();
  img.state = 0; // bond
  img.clear = function() { // bond
    delete _imgobj[url];
    img.onerror = img.onload = "";
    img = void 0; // fix memory leak in IE6
  };
  img.onerror = function() {
    img.state = -1; // error
    img.width = img.height = 0;
    _onimageload();
  };
  img.onload = function() {
    if (img.complete ||
        img.readyState === "complete") { // IE8
      img.state = 1; // loaded
      _onimageload();
    }
  };
  img.callback || (img.callback = []); // bond
  img.callback.push(callback); // stock
  img.setAttribute("src", url);
  return img;
}

// uuMeta.image.getActualDimension - http://d.hatena.ne.jp/uupaa/20090602
function getActualDimension(image) { // @param HTMLImageElement
                                     // @return Hash: { w, h }
  var run, mem, w, h, BOND = "uuactual";

  // for Firefox, Safari, Chrome
  if ("naturalWidth" in image) {
    return { w: image.naturalWidth, h: image.naturalHeight };
  }

  if ("src" in image) { // HTMLImageElement
    if (image[BOND] && image[BOND].src === image.src) {
      return image[BOND];
    }
    if (_ie) { // for IE
      run = image.runtimeStyle;
      mem = { w: run.width, h: run.height }; // keep runtimeStyle
      run.width  = "auto"; // override
      run.height = "auto";
      w = image.width;
      h = image.height;
      run.width  = mem.w; // restore
      run.height = mem.h;
    } else { // for Opera
      mem = { w: image.width, h: image.height }; // keep current style
      image.removeAttribute("width");
      image.removeAttribute("height");
      w = image.width;
      h = image.height;
      image.width  = mem.w; // restore
      image.height = mem.h;
    }
    return image[BOND] = { w: w, h: h, src: image.src }; // bond
  }
  // HTMLCanvasElement
  return { w: image.width, h: image.height };
}

// --- message pump ---
// uuMeta.msg - Message Pump instance
function MessagePump() {
  this._addr = {}; // { guid: obj, ... }
  this._msg = [];  // num: [ guid, msg, param1, param2], ...
  this._run = 0;
}

// uuMeta.msg.regist - register the destination of the message
function msgRegist(obj,        // @param Object: object has guid property
                   var_args) { // @param Object(= void 0):
  var arg = arguments, v, i = 0, iz = arg.length;

  for (; i < iz; ++i) {
    v = arg[i];
    if (!v.guid) { throw ""; }
    this._addr[v.guid] = v;
  }
}

// uuMeta.msg.unregist
function msgUnregist(obj,        // @param Object: object has guid property
                     var_args) { // @param Object(= void 0):
  var arg = arguments, v, i = 0, iz = arg.length;

  for (; i < iz; ++i) {
    v = arg[i];
    if (!v.guid) { throw ""; }
    delete this._addr[obj.guid];
  }
}

// uuMeta.msg.send - send a message synchronously
function msgSend(to,   // @param Object: send to
                 msg,  // @param String: msg
                 p1,   // @param Mix(= void 0): param1
                 p2) { // @param Mix(= void 0): param2
                       // @return Mix: msgbox() result value
  var rv = [], v, i, iz, ary;

  if (to) { // unicast, multicast
    ary = to.length ? to : [to];
    for (i = 0, iz = ary.length; i < iz; ++i) {
      v = ary[i];
      rv.push(this._addr[typeof v === "object" ? v.guid
                                               : v].msgbox(msg, p1, p2));
    }
    // if it is an unicast, not the array but the return value is returned.
    return (rv.length === 1) ? rv[0] : rv;
  }
  // broadcast
  for (i in this._addr) {
    rv.push(this._addr[i].msgbox(msg, p1, p2));
  }
  return rv;
}

// uuMeta.msg.post - send a message asynchronously
function msgPost(to,   // @param Object: send to
                 msg,  // @param String: msg
                 p1,   // @param Mix(= void 0): param1
                 p2) { // @param Mix(= void 0): param2
  var stock = this._msg, v, i, iz, ary;

  if (to) { // unicast, multicast
    ary = to.length ? to : [to];
    for (i = 0, iz = ary.length; i < iz; ++i) {
      v = ary[i];
      stock.push([typeof v === "object" ? v.guid : v, msg, p1, p2]);
    }
  } else { // broadcast
    for (i in this._addr) {
      stock.push([i, msg, p1, p2]);
    }
  }
  _mprunner(this);
}

// inner -
function _msgrunner(me) {
  function _msgloop() {
    if (!me._msg.length) {
      me._run = 0;
      return;
    }
    var v = me._msg.shift();

    if (v[0] in me._addr) {
      me._addr[v[0]].msgbox(v[1], v[2], v[3]); // (msg, param1, param2)
    }
    me._run = 1;
    setTimeout(_msgloop, 0);
  }
  !me._run && _msgloop();
}

// --- node ---
// uuMeta.node.id - get nodeid
function nodeid(node) { // @param Node:
                        // @return Number: guid, from 1
  var rv = node.guid;

  if (!rv) {
    rv = node.guid = ++_mm.node.idcounter;
    _nodedb[rv] = node;
  }
  return rv;
}

// uuMeta.node.id2node - get node by nodeid
function id2node(nodeid) { // @param String: nodeid
                           // @return Node/void 0:
  return _nodedb[nodeid];
}

// inner - prebuild nodeid ( node.guid )
function _buildnodeid() {
  var nodes = query.tag("*"), v, i = 0;

  while ( (v = nodes[i++]) ) {
    nodeid(v);
  }
}

// uuMeta.node.insert - insert Node
function insertNode(node,    // @param DocumentFragment/HTMLString:
                    context, // @param Node(= document.body): parent node
                    pos) {   // @param Number(= uuMeta.LASTC): insert position
                             // @return Node: first node
  var rv = node, ctx = context || _doc.body, pn = ctx.parentNode;

  if (typeof node === "string") { // "<div>" to div node
    node = substance(node, ctx);
    rv = node.firstChild;
  }
  switch (pos || 6) {
  case 1: ctx = pn; // break;
  case 5: ctx.firstChild ? ctx.insertBefore(node, ctx.firstChild)
                         : ctx.appendChild(node); break;
  case 4: ctx = pn; // break;
  case 6: ctx.appendChild(node); break;
  case 2: pn.insertBefore(node, ctx); break;
  case 3: (pn.lastChild === ctx) ? pn.appendChild(node)
                                 : pn.insertBefore(node, ctx.nextSibling);
  }
  return rv;
}

// uuMeta.node.insertScript - insert script node
//  <head>
//    <script src="..." type="text/javascript" charset="utf-8"></script>
//  </head>
function insertScript(src,      // @param String: src attribute
                      option) { // @param Hash(= {}): mixin hash
                                // @return Node: script node
  var node = _doc.createElement("script");

  node.type = "text/javascript";
  node.charset = "utf-8";
  mix(node, option || {});
  _head.appendChild(node);
  node.setAttribute("src", src);
  return node;
}

// uuMeta.node.insertText - insert TEXT_NODE or "TextString"
function insertText(node,    // @param DocumentFragment/TextString:
                    context, // @param Node(= document.body): parent node
                    pos) {   // @param Number(= uuMeta.LASTC): insert position
                             // @return Node: first text node
  return insertNode(typeof node === "string" ? _doc.createTextNode(node)
                                             : node, context, pos);
}

// uuMeta.node.clear - clear all children
function clearNode(node) { // @param Node: parent node
  node.innerHTML = "";
  return node; // return node
}

/*
function cloneNode(node,     // @param Node: source
                   idsuffix) // @param String(= ""): add id suffix
                             //             "" is add random number
                             // @return Node:
  var rv = node.cloneNode(true), div;

  if (_ie) {
    div = _doc.createElement("div");
    div.appendChild(rv);
    rv = div.innerHTML;
  }
  // attach event
  return rv;
}
 */

// uuMeta.node.remove - remove node 
function removeNode(node) { // @param Node:
                            // @return Node:
  return node.parentNode.removeChild(node);
}

// uuMeta.node.replace - replace oldNode
function replaceNode(node,      // @param Node: new node
                     oldNode) { // @param Node: old node(cutout)
                                // @return Node: oldNode
  return oldNode.parentNode.replaceChild(node, oldNode);
}

// uuMeta.node.cutdown - cut all nodes less than context
function cutdownNode(context) { // @Node(= document.body): parent node
                                // @return DocumentFragment:
  var rv, ctx = context || _doc.body;

  if (_doc.createRange) {
    (rv = _doc.createRange()).selectNodeContents(ctx);
    return rv.extractContents(); // return DocumentFragment
  }
  rv = _doc.createDocumentFragment();
  while (ctx.firstChild) {
    rv.appendChild(ctx.removeChild(ctx.firstChild));
  }
  return rv;
}

// uuMeta.node.compact - removes CRLF/blank-text/white-space/comment node
function compactNode(context, // @param Node(= document.body): parent node
                     depth) { // @param Number(= 0): max depth
  function _impl(elm, depth) {
    for (var w = elm.firstChild; w; w = w.nextSibling) {
      switch (w.nodeType) {
      case 1: (depth + 1 <= limit) && _impl(w, depth + 1); break; // recursive
      case 3: if (_BLANK.test(w.nodeValue)) { break; } // blank-text node?
      case 8: rv.push(w); // comment node
      }
    }
  }
  var rv = [], v, i = 0, limit = depth || 0;

  _impl(context, 0);
  while ( (v = rv[i++]) ) {
    v.parentNode.removeChild(v);
  }
}

// uuMeta.node.substance - convert HTMLString into DocumentFragment
function substanceNode(html,      // @param HTMLString:
                       context) { // @param Node: node or owner document
                                  // @return DocumentFragment:
  var rv, range, placeholder;

  // use DOM Level2 Range Module, http://d.hatena.ne.jp/uupaa/20081021
  if (_doc.createRange && !(_opera && _uaver >= 9.5)) {
    range = _doc.createRange();
    range.selectNode(context);
    return range.createContextualFragment(html);
  }
  rv = _doc.createDocumentFragment();
  placeholder = _doc.createElement("div");
  placeholder.innerHTML = html;
  while (placeholder.firstChild) {
    rv.appendChild(placeholder.removeChild(placeholder.firstChild));
  }
  return rv;
}

// --- number ---
// uuMeta.guid - get unique number
function guid() { // @return Number: unique number, from 1
  return ++_guid;
}

// Number.prototype.toJSON
// Boolean.prototype.toJSON
function NumberToJSON() {
  return this.toString();
}

// --- query ---
// uuMeta.query - query css
function query(expr,      // @param String: "css > rule"
               context) { // @param Node(= document): query context
                          // @return NodeArray( [Node, Node, ...] )
                          //         /EmptyArray( [] )
  if (_doc.querySelectorAll && !_QUERY_NGWORD.test(expr)) {
    try {
      return _slice.call((context || _doc).querySelectorAll(expr));
    } catch(err) {} // case: extend pseudo class / operators
  }
  return query.querySelectorAll(trim(expr), context || _doc);
}

// uuMeta.query.id - query id
function queryid(expr) { // @param String: id
                         // @return Node/null
  return _doc.getElementById(expr);
}

// uuMeta.query.tag - query tagName
function querytag(expr,      // @param String: "*" or "tag"
                  context) { // @param Node(= document): query context
                             // @return NodeArray( [Node, Node, ...] )
                             //         /EmptyArray( [] )
  return _slice.call((context || _doc).getElementsByTagName(expr));
}

// inner -
function querytagLegacy(expr, context) {
  var nodeList = (context || _doc).getElementsByTagName(expr),
      rv = [], ri = -1, v, i = 0;

  if (expr !== "*") {
    while ( (v = nodeList[i++]) ) {
      rv[++ri] = v;
    }
  } else { // ie: getElementsByTagName("*") has comment nodes
    while ( (v = nodeList[i++]) ) {
      (v.nodeType === 1) && (rv[++ri] = v); // [1] ELEMENT_NODE
    }
  }
  return rv;
}

// uuMeta.query.className - query className
function queryclass(expr,      // @param JointString: "class", "class1, ..."
                    context) { // @param Node(= document): query context
                               // @return NodeArray( [Node, Node, ...] )
                               //         /EmptyArray( [] )
  return _slice.call((context || _doc).getElementsByClassName(expr));
}

// inner -
function queryclassLegacy(expr, context) {
  var nodes = (context || _doc).getElementsByTagName("*"),
      name = splitSpace(expr),
      rv = [], ri = -1, v, match, c, i = 0, nz = name.length, rex;

  (nz > 1) && (name = toUniqueArray(name, 1), nz = name.length); // #fix 170b
  rex = _multiclass(name);

  while ( (v = nodes[i++]) ) {
    if ( (c = v.className) ) {
      match = c.match(rex); // NG: match = rex.exec(c);
      (match && match.length >= nz) && (rv[++ri] = v);
    }
  }
  return rv;
}

// --- scope ---
// uuMeta.exp - create alias, export scope
//    exp(uuMeta,    "my")      -> window.myguid, window.my.feature.slver
//    exp(uuMeta.ua, "_2")      -> window._2feature.slver
//    exp(uuMeta.ua, "", "_3")  -> window.feature3_.slver
function exp(scope,    // @param Array/Hash(= uuMeta): [ uuMeta, uuMeta.evt ]
             prefix,   // @param String(= ""):
             suffix) { // @param String(= ""):
  scope = scope || _mm;
  scope = scope.length ? scope : [scope];
  prefix = prefix || "";
  suffix = suffix || "";
  var v, i = 0, p;

  while ( (v = scope[i++]) ) {
    for (p in v) {
      _win[prefix + p + suffix] = v[p];
    }
  }
}

// uuMeta.mix - mixin
function mix(base,       // @param Hash: mixin base
             flavor,     // @param Hash: add flavor
             aroma,      // @param Hash(= void 0): add aroma
             override) { // @param Boolean(= true): true is override
                         // @return Hash: base
  var i, ride = (override === void 0) || override;

  if (ride) {
    for (i in flavor) {
      base[i] = flavor[i];
    }
  } else {
    for (i in flavor) {
      i in base || (base[i] = flavor[i]);
    }
  }
  return aroma ? mix(base, aroma, void 0, ride) : base;
}

// --- string ---
// uuMeta.clean - trim both side whitespace, multi space to single
function clean(str) { // @param String: "  has  space  "
                      // @return String: "has space"
  return str.replace(_TRIM, "").replace(_CLEAN, " ");
}

// uuMeta.tidy - tidy style property, attribute name
//    tidy("-webkit-shadow")    -> "-webkit-shadow"
//    tidy("background-color")  -> "backgroundColor"
//    tidy("float")             -> "cssFloat" or "styleFloat"(IE)
//    tidy("for")               -> "htmlFor"
function tidy(name) { // @param String:
                      // @return String: "css-prop"->"cssProp",
                      //                 "for"->"htmlFor"
  return _TIDY_ALIAS[name] || name;
}

// uuMeta.fmt - sprintf (PHP::sprintf like function)
function fmt(format,     // @param String: sprintf format string
             var_args) { // @param Mix: sprintf args
                         // @return String: formated string
  var next = 1, idx = 0, av = arguments,
      charCode = String.fromCharCode;

  return format.replace(_FMT_PARSE, function(m, aidx, flag, width,
                                             prec, size, types) {
    var v, w = _FMT_DECODE[types], ovf;

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
  });
}

// uuMeta.trim - trim both side whitespace
function trim(str) { // @param String: "  has  space "
                     // @return String: "has  space"
  return str.replace(_TRIM, "");
}

// String.prototype.trim
function StringTrim() { // @return String "has  space"
  return this.replace(_TRIM, "");
}

// String.prototype.toJSON
function StringToJSON() { // @return String "string"
  return '"' + this.replace(_JSON_ESCAPE, _jsonswap).
                    replace(_JSON_ENCODE, unicodeencode) + '"';
}

// uuMeta.trimQuote - trim both side whitespace and "double" 'single' quote
function trimQuote(str) { // @param String: ' "quote string" '
                          // @return String: 'quote string'
  return str.replace(_QUOTE, "");
}

// uuMeta.trimBracket - trim both side whitespace and brackets () [] {} <>
function trimBracket(str) { // @param String: "<bracket>"
                            // @return String: "bracket"
  return str.replace(_BRACKET, "");
}

// uuMeta.stripTags - strip tags
function stripTags(str) { // @param String: "<h1>Section</h1><p>Content</p>"
                          // @return String: "SectionContent"
  return str.replace(_TAGS, "");
}

// uuMeta.splitSpace
function splitSpace(str) { // @param String: " split  space  token "
                           // @return Array: ["split", "space", "token"]
  return str.replace(_TRIM, "").split(_SPACES);
}

// uuMeta.splitComma
function splitComma(str) { // @param String: " split,comma,token "
                           // @return Array: ["split", "comma", "token"]
  return str.replace(_TRIM, "").split(",");
}

// uuMeta.splitToken - split token
function splitToken(expr,     // @param String: expression
                    splitter, // @param String(= " "):
                    notrim) { // @param Boolean(= false): trim space
                              // @return Array: ["token", ...]
  splitter = splitter || " ";
  if (expr.indexOf(splitter) < 0) { return [expr]; }

  var rv = [], ary = expr.split(""), v, w, i = 0,
      nest = 0, quote = 0, q, tmp = [], ti = -1, esc = 0,
      CSS_TOKEN = { "(": 2, ")": 3, '"': 4, "'": 4, "\\": 5 }; // [!]keep local

  CSS_TOKEN[splitter] = 1;

  while ( (v = ary[i++]) ) {
    if (esc) {
      esc = 0;
      tmp[++ti] = v;
    } else {
      switch (CSS_TOKEN[v] || 0) {
      case 0: tmp[++ti] = v;
              break;
      case 1: if (!quote) {
                if (nest) {
                  tmp[++ti] = v;
                } else {
                  w = tmp.join(""),
                  rv.push(notrim ? w : trim(w));
                  tmp = [];
                  ti = -1;
                }
              } else {
                tmp[++ti] = v;
              }
              break;
      case 2: tmp[++ti] = v;
              !quote && ++nest;
              break;
      case 3: tmp[++ti] = v;
              !quote && --nest;
              break;
      case 4: if (!quote) {
                quote = 1;
                q = v;
              } else if (v === q) {
                quote = 0;
              }
              tmp[++ti] = v;
              break;
      case 5: esc = 1;
              tmp[++ti] = v;
      }
    }
  }
  // remain
  if (tmp.length) {
    w = tmp.join("");
    rv.push(notrim ? w : trim(w));
  }
  return rv;
}

// inner -
function _decamelize(props) {
  var rv = {}, i, v, IGNORE = /^[A-Z-]/, UNCAMELIZE = /([a-z])([A-Z])/g;

  for (i in props) {
    if (!IGNORE.test(i) && typeof props[i] === "string") {
      v = i.replace(UNCAMELIZE, function(m, c, C) {
        return c + "-" + C.toLowerCase();
      });
      (v !== i) && (rv[v] = i); // { text-align: "textAlign" }
    }
  }
  return rv;
}

// --- style ---
// uuMeta.style.show
function styleShow(node) { // @param Node:
  var disp = node.uustyledisplay || "", ns = node.style;

  (disp && ns.display === "none") && (ns.display = disp);
}

// uuMeta.style.hide
function styleHide(node,            // @param Node:
                   computedStyle) { // @param CSSStyleObject(= void 0):
  var cs = computedStyle, disp;

  cs || (cs = _ie ? node.currentStyle
                  : getComputedStyle(node, null));
  disp = cs.display;
  if (disp !== "none") {
    node.uustyledisplay = disp; // bond
    node.style.display = "none";
  }
}

// uuMeta.setStyle
function setStyle(node,   // @param Node:
                  hash) { // @param Hash: { cssProp: "value", ... }
                          //           or { "css-prop": "value", ... }
  var i, TIDY = _TIDY_ALIAS;

  for (i in hash) {
    node.style[TIDY[i] || i] = hash[i]; // backgroundColor = "transparent"
  }
}

// uuMeta.getStyle
function getStyle(node,     // @param Node:
                  styles) { // @param JointString: "css-prop,cssProp..."
                            // @return Hash: { cssProp: "value", ... }
  var rv = {}, ary = styles.split(","), v, i = 0,
      ns = getComputedStyle(node, null), TIDY = _TIDY_ALIAS;

  while ( (v = ary[i++]) ) {
    rv[v] = ns[TIDY[v] || v];
  }
  return rv;
}

function getStyleIE(node, styles) {
  var rv = {}, ary = styles.split(","), v, w, i = 0,
      ns = node.currentStyle, topx = _mm.style.toActualPixel,
      STR = "string", AUTO = "auto", PX = "px", TIDY = _TIDY_ALIAS;

  while ( (v = ary[i++]) ) {
    w = ns[TIDY[v] || v];
    if (typeof w === STR) {
      w = (w === AUTO || w.lastIndexOf(PX) < 0) ? topx(node, w)
                                                : parseInt(w);
    }
    rv[v] = w;
  }
  return rv;
}

// uuMeta.getInnerSize - get innerWidth, innerHeight
function getInnerSize() { // @return Hash: { w, h }
  if (_ie) {
    var doc = _doc[_quirks ? "body" : "documentElement"];

    return { w: doc.clientWidth, h: doc.clientHeight };
  }
  return { w: _win.innerWidth, h: _win.innerHeight };
}

// uuMeta.getScrollSize - get scrollLeft, scrollTop
function getScrollSize() { // return Hash: { w, h }
  if (_ie) {
    var doc = _doc[_quirks ? "body" : "documentElement"];

    return { w: doc.scrollLeft, h: doc.scrollTop };
  }
  return { w: _win.pageXOffset, h: _win.pageYOffset };
}

// --- type ---
// uuMeta.type - type detection
function detectType(mix,     // @param Mix:
                    match) { // @param Number(= 0): match types
                             // @return Boolean/Number: true = match,
                             //                         false = unmatch
                             //                         number is matched bits
  // IE6 mem-leaks: (document instanceof Array),
  //                (window instanceof Array) is leaks
  var v0, // undefined
      rv = (mix === null) ? 1
         : (mix === v0  ) ? 2
         : (mix === _win) ? 4 // fix IE6 mem-leaks
         : (mix === _doc) ? 4 // fix IE6 mem-leaks
         : (mix instanceof Array) ? 8
         : (mix instanceof Date)  ? 1024
         : (_TYPES[typeof mix] || 4);

  if (rv === 4) {
    rv = mix.nodeType ? 256 : ("length" in mix) ? 512 : 4;
  }
  return match ? match & rv : rv;
}

// --- url / path ---
// uuMeta.url.toAbs - convert relative URL to absolute URL
function toAbs(url,       // @param URLString: rel/abs URL
               curtdir) { // @param URLString(= ""): current dir
                          // @return URLString: absolute URL
  if (!_SCHEME.test(url)) {
    var div = _doc.createElement("div");

    div.innerHTML = '<a href="' + (curtdir || "") + url + '" />';
    url = div.firstChild ? div.firstChild.href
                         : _HREF.exec(div.innerHTML)[1];
  }
  return url;
}

// uuMeta.url.toDir - absolute path to absolute directory(chop filename)
//    toDir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
//    toDir("/root/dir/file.ext")              -> "/root/dir/"
//    toDir("/file.ext")                       -> "/"
//    toDir("/")                               -> "/"
//    toDir("")                                -> "/"
function toDir(abspath,  // @param URLString/PathString: absolute path
               result) { // @param Array(= void 0): ref result array
                         //                            ["dir/", "file.ext"]
                         // @return String: absolute directory path,
                         //                 has tail "/"
  result = result || [];
  var ary = abspath.split("/");

  result[1] = ary.pop(); // file
  result[0] = ary.join("/") + "/";
  return result[0];
}

// uuMeta.url.parse - parse URL
//    uuMeta.url.parse(".") is current url
function parseURL(url) { // @param URLString:
                         // @return Boolean/Hash:
                         //           false is fail,
                         //           Hash( { url, scheme, domain, port, base,
                         //                   path, dir, file, query, hash,
                         //                   fragment } )
  var m, w = ["/", ""], abs = toAbs(url);

  if ( (m = _FILE.exec(abs)) ) {
    toDir(m[1], w);
    return { url: abs, scheme: "file", domain: "", port: "",
             base: "file:///" + w[0], path: m[1], dir: w[0],
             file: w[1], query: "", hash: {}, fragment: "" };
  }
  if ( (m = _URL.exec(abs)) ) {
    m[4] && toDir(m[4], w);
    return {
      url:      abs,          // AbsoluteURLString( "http://..." )
      scheme:   m[1],         // SchemeString( "file" or "http" or "https" )
      domain:   m[2],         // DomainNameString( "www.example.com" )
      port:     m[3] || "",   // PortNumber( "8080" or "" ) - not Number
      base:     (m[1] + "://" + m[2]) + (m[3] ? ":" + m[3] : "") + w[0],
      path:     m[4] || "/",  // PathString( "/dir/file.ext" or "/" )
      dir:      w[0],         // DirString( "/dir" or "/" )
      file:     w[1],         // FileNameString( "file.ext" or "" )
      query:    m[5] || "",   // QueryString( "key1=value1&key2=value2" or "" )
      hash:     m[5] ? parseQuery(m[5]) : {},
                              // QueryHash( { key1: "value1", key2: "value2" } )
      fragment: m[6] || ""    // FragmentString( "menu1" or "" )
    };
  }
  return false;
}

// uuMeta.url.build - build URL
function buildURL(hash) { // @param Hash:
                          // @return String:
                          //         "scheme://domain:port/path?query#fragment"
  return [hash.scheme, "://", hash.domain,
          hash.port     ? ":" + hash.port     : "", hash.path || "/",
          hash.query    ? "?" + hash.query    : "",
          hash.fragment ? "#" + hash.fragment : ""].join("");
}

// uuMeta.url.parseQuery - parse QueryString
function parseQuery(query) { // @param QueryString:
                             // @return Hash: { key: value, ... }
  var rv = {}, fn = decodeURIComponent;

  query.replace(_CHOP_PATH, "").replace(_DECODE_AMP, "&").
        replace(_PARSE_QS, function(m, key, value) {
    return rv[fn(key)] = fn(value);
  });
  return rv;
}

// uuMeta.url.buildQuery - build QueryString
function buildQuery(query) { // @param Hash:
                             // @return QueryString: "key=value&key=value..."
  var rv = [], i, fn = encodeURIComponent;

  for (i in query) {
    rv.push(fn(i) + "=" + fn(query[i]));
  }
  return rv.join("&");
}

// --- user agent ---
// inner - detect User Agent version
function _detectUserAgentVersion() {
  return _opera ? (opera.version().replace(/\d$/, "") - 0) // Opera10 shock
                : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.
                             exec(_UA) || [,0])[1]);
}

// inner - detect Rendering Engine version
function _detectRenderingEngineVersion() {
  return parseFloat(((/(?:rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/.
                    exec(_UA) || [,0])[1]).
                    toString().replace(/[^\d\.]/g, "").
                    replace(/^(\d+\.\d+)(\.(\d+))?$/, "$1$3"));
}

// =========================================================

// inner - init html5 tags, vml namespace
function _inithtml5tags() {
  var v, i = 0, ary = _HTML5TAGS.split(","),
      NS = "urn:schemas-microsoft-com:", NSV = "#default#VML",
      ns = _doc.namespaces;

  while ( (v = ary[i++]) ) {
    _doc.createElement(v);
  }
  if (!ns["v"]) {
    ns.add("v", NS + "vml", NSV);
    ns.add("o", NS + "office:office", NSV);
  }
  _doc.createStyleSheet().cssText =
    "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
    "v\:roundrect,v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
    "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
    "{behavior:url(" + NSV + ");display:inline-block}"; // inline-block [!]
}

// inner - bond window.getComputedStyle for old WebKit
function _getComputedStyle() {
  if (!_win.getComputedStyle && _doc.defaultView.getComputedStyle) {
    _win.getComputedStyle = _doc.defaultView.getComputedStyle;
  }
}

// =========================================================
mix(Array.prototype, {
  indexOf:      ArrayIndexOf,     // ECMAScript-262 5th
  lastIndexOf:  ArrayLastIndexOf, // ECMAScript-262 5th
  every:        ArrayEvery,       // ECMAScript-262 5th
  some:         ArraySome,        // ECMAScript-262 5th
  forEach:      ArrayForEach,     // ECMAScript-262 5th
  map:          ArrayMap,         // ECMAScript-262 5th
  filter:       ArrayFilter,      // ECMAScript-262 5th
  reduce:       ArrayReduce,      // ECMAScript-262 5th
  reduceRight:  ArrayReduceRight  // ECMAScript-262 5th
}, 0, 0);

mix(Boolean.prototype, {
  toJSON:       NumberToJSON      // ECMAScript-262 5th
}, 0, 0);

mix(Date.prototype, {
  toISOString:  DateToISOString,  // ECMAScript-262 5th
  toJSON:       DateToISOString   // ECMAScript-262 5th
}, 0, 0);

mix(Function.prototype, {
  bind:         FunctionBind      // ECMAScript-262 5th
}, 0, 0);

mix(Number.prototype, {
  toJSON:       NumberToJSON      // ECMAScript-262 5th
}, 0, 0);

mix(String.prototype, {
  trim:         StringTrim,       // ECMAScript-262 5th
  toJSON:       StringToJSON      // ECMAScript-262 5th
}, 0, 0);

_gecko && !HTMLElement.prototype.innerText && (function(proto) {
  proto.__defineGetter__("innerText", innerTextGetter);
  proto.__defineSetter__("innerText", innerTextSetter);
  proto.__defineGetter__("outerHTML", outerHTMLGetter);
  proto.__defineSetter__("outerHTML", outerHTMLSetter);
})(HTMLElement.prototype);

// --- initialize / export ---
if (_ie) {
  _inithtml5tags();
} else {
  _getComputedStyle();
}
_bootstrap();
boot(_buildnodeid, 1);

})(); // uuMeta scope

