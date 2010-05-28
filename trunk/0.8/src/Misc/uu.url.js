
// === uu.url / window.url ===

//  type URLString = "scheme://domain[:port][/path][?query#fragment]"
//
//  type URLHash = {
//        url      - AbsoluteURLString: "http://example.com:8080/dir/file.ext?query=string;more=value#fragment"
//        scheme   - SchemeString:      "http"                           or "https", "file"
//        domain   - DomainNameString:  "example.com"
//        port     - PortNumberString:  "8080"                           or ""
//        base     - BaseURLString:     "http://example.com:8080/dir/"
//        path     - PathString:        "/dir/file.ext"                  or "/"
//        dir      - DirString:         "/dir/"                          or "/"
//        file     - FileNameString:    "file.ext"                       or ""
//        query    - QueryString:       "query=string;more=value"        or ""
//        hash     - QueryStringHash:   { query: "string", more: "value" } or {}
//        fragment - FragmentString:    "fragment"                       or ""
//    }
//
//  type QueryString = "query=string;more=value"
//  type QueryStringHash = { query: "string", more: "value" }

(this.uu || this).url || (function(namespace) {

// --- url / query string / path ---
namespace.url       = uuurl;        // uu.url(url:URLHash/URLString = ""):URLString/URLHash/null
                                    //  [1][current abs-dir] uu.url() -> "http://example.com/index.htm"
                                    //  [2][parse url]       uu.url("http://example.com/dir/file.ext") -> { schme: "http", ... }
                                    //  [3][build url]       uu.url({ schme: "http", ... }) -> "http://example.com/..."
namespace.url.abs   = uuurlabs;     // uu.url.abs(url:URLString = ".", currentDir = ""):URLString
                                    //  [1][get abs-url]   uu.url.abs("./index.htm") -> "http://example.com/index.htm"
namespace.url.dir   = uuurldir;     // uu.url.dir(url:URLString/PathString):String
                                    //  [1][chop filename] uu.url.dir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
                                    //  [2][chop filename] uu.url.dir("/root/dir/file.ext")              -> "/root/dir/"
                                    //  [3][chop filename] uu.url.dir("/file.ext")                       -> "/"
                                    //  [4][through]       uu.url.dir("/")                               -> "/"
                                    //  [5][supply slash]  uu.url.dir("")                                -> "/"
namespace.url.split = uuurlsplit;   // uu.url.split(url:URLString/PathString):Array
                                    //  [1][split dir | file.ext] uu.url.split("http://example.com/dir/file.ext") -> ["http://example.com/dir/", "file.ext"]

namespace.url.query = uuurlquery;   // uu.url.query(queryString:QueryString/Hash, add:Hash):QueryString/Hash
                                    //  [1][parse] uu.url.query("key=val;key2=val2")              -> { key: "val", key2: "val2" }
                                    //  [2][build] uu.url.query({ key: "val",     key2: "val2" }) -> "key=val;key2=val2"
                                    //  [3][add]   uu.url.query( "key=val",     { key2: "val2" }) -> "key=val;key2=val2"
                                    //  [4][add]   uu.url.query({ key: "val" }, { key2: "val2" }) -> "key=val;key2=val2"

// --- url / path ---
// uu.url - url accessor
function uuurl(url) { // @param URLHash/URLString(= ""):
                      // @return URLString/URLHash/null:
    return !url ? uuurlabs() : // [1]
           (typeof url === "string" ? parseURL : buildURL)(url); // [2][3]
}

// uu.url.abs - convert relative URL to absolute URL
function uuurlabs(url,          // @param URLString(= "."): rel/abs URL
                  currentDir) { // @param URLString(= ""): current dir
                                // @return URLString: absolute URL
    function _uuurlabs(url) {
        if (!uuurlabs.scheme.test(url)) {
            var div = document.createElement("div");

            div.innerHTML = '<a href="' + (currentDir || "") + url + '" />';
            url = div.firstChild ? div.firstChild.href
                                 : uuurlabs.href.exec(div.innerHTML)[1];
        }
        return url.replace(/&amp;|&/g, ";"); // "&" -> ";"
    }
    return (!url || url === ".") ? (uuurlabs.cache || (uuurlabs.cache = _uuurlabs(".")))
                                 : _uuurlabs(url);
}
uuurlabs.scheme = /^(file|https?):/;
uuurlabs.href   = /href\="([^"]+)"/;
uuurlabs.cache  = ""; // current absolute-url cache

// uu.url.dir - absolute path to absolute directory(chop filename)
function uuurldir(url) { // @param URLString/PathString: url or path
                         // @return String: directory path, has tail "/"
    var ary = url.split("/");

    ary.pop(); // chop "file.ext"
    return ary.join("/") + "/";
}

// inner - build URL
function buildURL(hash) { // @param URLHash:
                          // @return URLString: "scheme://domain:port/path?query#fragment"
    return [hash.scheme, "://", hash.domain,
            hash.port     ? ":" + hash.port     : "", hash.path || "/",
            hash.query    ? "?" + hash.query    : "",
            hash.fragment ? "#" + hash.fragment : ""].join("");
}

// inner - parse URL
function parseURL(url) { // @param URLString:
                         // @return URLHash/null: null is fail,
    var m, w = ["/", ""], abs = uuurlabs(url);

    m = parseURL.fileScheme.exec(abs);
    if (m) {
        w = uuurlsplit(m[1]);
        return { url: abs, scheme: "file", domain: "", port: "",
                 base: "file:///" + w[0], path: m[1], dir: w[0],
                 file: w[1], query: "", hash: m[2] ? parseQueryString(m[2]) : {},
                 fragment: m[3] || "" };
    }
    m = parseURL.scheme.exec(abs);
    if (m) {
        m[4] && (w = uuurlsplit(m[4]));
        return { url: abs, scheme: m[1], domain: m[2], port: m[3] || "",
                 base: (m[1] + "://" + m[2]) + (m[3] ? ":" + m[3] : "") + w[0],
                 path: m[4] || "/", dir: w[0], file: w[1], query: m[5] || "",
                 hash: m[5] ? parseQueryString(m[5]) : {}, fragment: m[6] || "" };
    }
    return null;
}
parseURL.fileScheme = /^file:\/\/(?:\/)?(?:loc\w+\/)?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i;
parseURL.scheme     = /^(\w+):\/\/([^\/:]+)(?::(\d*))?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i;

// uu.url.split - split dir/file "dir/file.ext" -> ["dir/", "file.ext"]
function uuurlsplit(url) { // @param URLString/PathString: url or path
                           // @return Array: ["dir/", "file.ext"]
    var rv = [], ary = url.split("/");

    rv[1] = ary.pop(); // file
    rv[0] = ary.join("/") + "/";
    return rv;
}

// uu.url.query - query string accessor
function uuurlquery(queryString, // @param QueryString/Hash:
                    add) {       // @param Hash:
                                 // @return QueryString/Hash:

    var rv, isString = typeof queryString === "string", i;

    if (add) {
        rv = isString ? parseQueryString(queryString) : queryString;
        for (i in add) {
            rv[i] = add[i];
        }
        return buildQueryString(rv);
    }
    return (isString ? parseQueryString : buildQueryString)(queryString); // [1][2]
}

// inner - build query string
function buildQueryString(queryString) { // @param Hash: { key: "val", key2: "val2" }
                                         // @return QueryString: "key=val;key2=val2"
    var rv = [], i, fn = encodeURIComponent;

    for (i in queryString) {
        rv.push(fn(i) + "=" + fn(queryString[i]));
    }
    return rv.join(";");
}

// inner - parse query string
function parseQueryString(queryString) { // @param URLString/QueryString: "key=val;key2=val2"
                                         // @return Hash: { key: value, ... }
    function _parse(m, key, value) {
        return rv[fn(key)] = fn(value);
    }
    var rv = {}, fn = decodeURIComponent;

    if (queryString.indexOf("?") >= 0) { // [1]
        return parseURL(queryString).hash;
    }
    queryString.replace(/&amp;|&/g, ";").
                replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parse); // [2]
    return rv;
}

})(this.uu || this);
