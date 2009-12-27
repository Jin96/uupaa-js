
// === URL ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {
var _absurl, // [lazy] uu.url(), current absolute-url cache
    _AMP = /&amp;|&/g,
    _URL = /^(\w+):\/\/([^\/:]+)(?::(\d*))?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i,
    _FILE = /^file:\/\/(?:\/)?(?:loc\w+\/)?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i,
    _HREF = /href\="([^"]+)"/,
    _SCHEME = /^(file|https?):/,
    _QUERY_STR = /(?:([^\=]+)\=([^\;]+);?)/g;

// --- url / query string / path ---
// [1][abs]   uu.url() -> current absolute-url, "http://example.com/..."
// [2][parse] uu.url("http://example.com/dir/file.ext") -> { schme: "http", ... }
// [3][build] uu.url({ schme: "http", ... }) -> "http://example.com/..."
uu.url = uu.mix(uuurl, {
  abs:        uuurlabs,       // uu.url.abs(url = ".", curtdir = "") -> absolute URL
  dir:        uuurldir,       // uu.url.dir(path, result) -> absolute directory
  parse:      uuurlparse,     // uu.url.parse(url) -> { url, scheme, domain, port, base, path,
                              //                        dir, file, query, hash, fragment }
  build:      uuurlbuild      // uu.url.build(url) -> "scheme://domain:port/path?query#fragment"
});

// [1][parse]    uu.qs() -> { key: "val" } (parse location.href)
// [2][parse]    uu.qs("key=val;key2=val2") -> { key: "val", key2: "val2" }
// [3][build(;)] uu.qs({ key: "val", key2: "val2" })    -> "key=val;key2=val2"
// [4][build(&)] uu.qs({ key: "val", key2: "val2" }, 1) -> "key=val&key2=val2"
// [5][add]      uu.qs("key=val", "key2", "val2") -> "key=val;key2=val2"
// [6][add]      uu.qs("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
uu.qs = uu.mix(uuqs, {
  add:        uuqsadd,        // [1] uu.qs.add("key=val", "key2", "val2") -> "key=val;key2=val2"
                              // [2] uu.qs.add("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
  amp:        uuqsamp,        // uu.qs.amp("key=val;key2=val2") -> "key=val&key2=val2"
  parse:      uuqsparse,      // [1] uu.qs.parse("http://...?key=value") -> { key: "value" }
                              // [2] uu.qs.parse("../img.png?key=value") -> { key: "value" }
                              // [3] uu.qs.parse("key=value") -> { key: "value" }
  build:      uuqsbuild       // [1][build(;)] uu.qs.build({key:"val",key2:"val2"})    -> "key=val;key2=val2"
                              // [2][build(&)] uu.qs.build({key:"val",key2:"val2"}, 1) -> "key=val&key2=val2"
});

// --- url / path ---
// uu.url - url accessor
// [1][abs]   uu.url() -> current absolute-url, "http://example.com/..."
// [2][parse] uu.url("http://example.com/...") -> { schme: "http", ... }
// [3][build] uu.url({ schme: "http", ... }) -> "http://example.com/..."
function uuurl(value) { // @param URLString/Hash(= void 0):
                        // @return String/Hash/void 0:
  return (value === void 0) ? uuurlabs() :    // [1]
         uu.isstr(value) ? uuurlparse(value)  // [2]
                         : uuurlbuild(value); // [3]
}

// uu.url.abs - convert relative URL to absolute URL
function uuurlabs(url,       // @param URLString(= "."): rel/abs URL
                  curtdir) { // @param URLString(= ""): current dir
                             // @return URLString: absolute URL
  function _uuurlabs(url) {
    if (!_SCHEME.test(url)) {
      var div = doc.createElement("div");

      div.innerHTML = '<a href="' + (curtdir || "") + url + '" />';
      url = div.firstChild ? div.firstChild.href
                           : _HREF.exec(div.innerHTML)[1];
    }
    return url.replace(_AMP, ";"); // "&" -> ";"
  }
  if (!url || url === ".") {
    _absurl || (_absurl = _uuurlabs("."));
    return _absurl; // return cached abs-url
  }
  return _uuurlabs(url);
}

// uu.url.dir - absolute path to absolute directory(chop filename)
// uu.url.dir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
// uu.url.dir("/root/dir/file.ext")              -> "/root/dir/"
// uu.url.dir("/file.ext")                       -> "/"
// uu.url.dir("/")                               -> "/"
// uu.url.dir("")                                -> "/"
function uuurldir(abspath,  // @param URLString/PathString: absolute path
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

// uu.url.parse - parse URL
// uu.url.parse(".") is current url
function uuurlparse(url) { // @param URLString:
                           // @return Hash/0: 0 is fail,
                           //         { url, scheme, domain, port, base,
                           //           path, dir, file, query, hash, fragment }
                           //   hash.url    - AbsoluteURLString: "http://..."
                           //   hash.scheme - SchemeString: "file" or "http" or "https"
                           //   hash.domain - DomainNameString: "www.example.com"
                           //   hash.port   - PortNumberString: "" or "8080"
                           //   hash.base   - BaseURLString: "shceme://domain[:port]/dir"
                           //   hash.path   - PathString: "/" or "/dir/file.ext"
                           //   hash.dir    - DirString: "/" or "/dir"
                           //   hash.file   - FileNameString: "" or "file.ext"
                           //   hash.query  - QueryString: "" or "key1=value1;key2=value2"
                           //   hash.hash   - QueryStringHash: { key: value, ... }
                           //   hash.fragment - FragmentString( "" or "menu1" )
  var m, w = ["/", ""], abs = uuurlabs(url);

  m = _FILE.exec(abs);
  if (m) {
    uuurldir(m[1], w);
    return { url: abs, scheme: "file", domain: "", port: "",
             base: "file:///" + w[0], path: m[1], dir: w[0],
             file: w[1], query: "", hash: m[2] ? uuqsparse(m[2]) : {},
             fragment: m[3] || "" };
  }
  m = _URL.exec(abs);
  if (m) {
    m[4] && uuurldir(m[4], w);
    return { url: abs, scheme: m[1], domain: m[2], port: m[3] || "",
             base: (m[1] + "://" + m[2]) + (m[3] ? ":" + m[3] : "") + w[0],
             path: m[4] || "/", dir: w[0], file: w[1], query: m[5] || "",
             hash: m[5] ? uuqsparse(m[5]) : {}, fragment: m[6] || "" };
  }
  return 0;
}

// uu.url.build - build URL
function uuurlbuild(hash) { // @param Hash:
                            // @return String: "scheme://domain:port/path?query#fragment"
  return [hash.scheme, "://", hash.domain,
          hash.port     ? ":" + hash.port     : "", hash.path || "/",
          hash.query    ? "?" + hash.query    : "",
          hash.fragment ? "#" + hash.fragment : ""].join("");
}

// uu.qs - query string accessor
// [1][parse]    uu.qs() -> { key: "val" } (parse location.href)
// [2][parse]    uu.qs("key=val;key2=val2") -> { key: "val", key2: "val2" }
// [3][build(;)] uu.qs({ key: "val", key2: "val2" })    -> "key=val;key2=val2"
// [4][build(&)] uu.qs({ key: "val", key2: "val2" }, 1) -> "key=val&key2=val2"
// [5][add]      uu.qs("key=val", "key2", "val2") -> "key=val;key2=val2"
// [6][add]      uu.qs("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
function uuqs(base,    // @param String/Hash: 
              key,     // @param String/Hash:
              value) { // @param String:
                       // @return String/Hash:
  if (base === void 0) { // [1]
    return uuqsparse(location.href);
  }
  return !uu.isstr(base) ? uuqsbuild(base, key) :      // [3][4]
         (key === void 0) ? uuqsparse(base)            // [2]
                          : uuqsadd(base, key, value); // [5][6]
}

// uu.qs.add - add query string
// [1][add] uu.qs.add("key=val", "key2", "val2") -> "key=val;key2=val2"
// [2][add] uu.qs.add("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
function uuqsadd(url,     // @param String:
                 key,     // @param Hash/String:
                 value) { // @param String:
                          // @return String:
  var hash = uuurlparse(url);

  hash.query = uuqsbuild(uu.mix(hash.hash, uu.hash(key, value)));
  return uuurlbuild(hash);
}

// uu.qs.amp - convert semicolon(;) to ampersand(&)
function uuqsamp(str,      // @param String: "key=val;key2=val2"
                 entity) { // @param Number(= 0): 0 is "&", 1 is "&amp;"
                           // @return String: "key=val&key2=val2"(entity=0)
                           //              or "key=val&amp;key2=val2"(entity=1)
  return str.replace(/;/g, entity ? "&amp;" : "&");
}

// uu.qs.parse - parse query string
// [1] uu.qs.parse("http://...?key=value") -> { key: "value" }
// [2] uu.qs.parse("../img.png?key=value") -> { key: "value" }
// [3] uu.qs.parse("key=value") -> { key: "value" }
function uuqsparse(query) { // @param URLString/QueryString:
                            // @return Hash: { key: value, ... }
  function _uuqsparse(m, key, value) {
    return rv[fn(key)] = fn(value);
  }
  var rv = {}, fn = decodeURIComponent;

  if (query.indexOf("?") >= 0) { // [1][2]
    return uuurlparse(query).hash;
  }
  query.replace(_AMP, ";").replace(_QUERY_STR, _uuqsparse); // [3]
  return rv;
}

// uu.qs.build - build query string
// [1][build(;)] uu.qs.build({key:"val",key2:"val2"})    -> "key=val;key2=val2"
// [2][build(&)] uu.qs.build({key:"val",key2:"val2"}, 1) -> "key=val&key2=val2"
function uuqsbuild(query, // @param Hash: { key: "val", key2: "val2" }
                   amp) { // @param Boolean(= false): use amp(&) separator
                          // @return QueryString: "key=val;key2=val2"
  var rv = [], i, fn = encodeURIComponent;

  for (i in query) {
    rv.push(fn(i) + "=" + fn(query[i]));
  }
  return rv.join(amp ? "&" : ";");
}

})(window, document, uu);

