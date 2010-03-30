
// === URL ===
// depend: uu.js
uu.url || (function(win, doc, uu) {
var _AMP = /&amp;|&/g;

// --- url / query string / path ---
// [1][abs]   uu.url() -> current absolute-url, "http://example.com/..."
// [2][parse] uu.url("http://example.com/dir/file.ext") -> { schme: "http", ... }
// [3][build] uu.url({ schme: "http", ... }) -> "http://example.com/..."
uu.url = uu.mix(uuurl, {
    abs:        uuurlabs,       // uu.url.abs(url = ".", curtdir = "") -> absolute URL
    dir:        uuurldir,       // uu.url.dir(path, result) -> absolute directory
    build:      uuurlbuild,     // uu.url.build(url) -> "scheme://domain:port/path?query#fragment"
    parse:      uuurlparse,     // uu.url.parse(url) -> { url, scheme, domain, port, base, path,
                                //                        dir, file, query, hash, fragment }
    split:      uuurlsplit      // uu.url.split("http://.../dir/file.exe") -> ["http://.../dir/", "file.ext"]
});

// [1][parse] uu.qs() -> { key: "val" } (parse location.href)
// [2][parse] uu.qs("key=val;key2=val2")          -> { key: "val", key2: "val2" }
// [3][build] uu.qs({ key: "val", key2: "val2" }) -> "key=val;key2=val2"
// [4][add]   uu.qs("key=val",  "key2", "val2")   -> "key=val;key2=val2"
// [5][add]   uu.qs("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
uu.qs = uu.mix(uuqs, {
    add:        uuqsadd,        // [1] uu.qs.add("key=val",  "key2", "val2")   -> "key=val;key2=val2"
                                // [2] uu.qs.add("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
    amp:        uuqsamp,        // uu.qs.amp("key=val;key2=val2", entity = 0)  -> "key=val&key2=val2"
    build:      uuqsbuild,      // uu.qs.build({key:"val",key2:"val2"})        -> "key=val;key2=val2"
    parse:      uuqsparse       // [1] uu.qs.parse("../img.png?key=value") -> { key: "value" }
                                // [2] uu.qs.parse("key=value")            -> { key: "value" }
});

// --- url / path ---
// uu.url - url accessor
// [1][abs]   uu.url() -> current absolute-url, "http://example.com/..."
// [2][parse] uu.url("http://example.com/...") -> { schme: "http", ... }
// [3][build] uu.url({ schme: "http", ... }) -> "http://example.com/..."
function uuurl(value) { // @param URLString/Hash(= void 0):
                        // @return String/Hash/void 0:
    return (value === void 0) ? uuurlabs() :    // [1]
           uu.isString(value) ? uuurlparse(value)  // [2]
                              : uuurlbuild(value); // [3]
}

// uu.url.abs - convert relative URL to absolute URL
function uuurlabs(url,       // @param URLString(= "."): rel/abs URL
                  curtdir) { // @param URLString(= ""): current dir
                             // @return URLString: absolute URL
    function _uuurlabs(url) {
        if (!uuurlabs._SCHEME.test(url)) {
            var div = uu.node();

            div.innerHTML = '<a href="' + (curtdir || "") + url + '" />';
            url = div.firstChild ? div.firstChild.href
                                 : uuurlabs._HREF.exec(div.innerHTML)[1];
        }
        return url.replace(_AMP, ";"); // "&" -> ";"
    }
    return (!url || url === ".") ? (uuurlabs._cache || (uuurlabs._cache = _uuurlabs(".")))
                                 : _uuurlabs(url);
}
uuurlabs._SCHEME = /^(file|https?):/;
uuurlabs._HREF = /href\="([^"]+)"/;
uuurlabs._cache = ""; // current absolute-url cache

// uu.url.dir - absolute path to absolute directory(chop filename)
// uu.url.dir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
// uu.url.dir("/root/dir/file.ext")              -> "/root/dir/"
// uu.url.dir("/file.ext")                       -> "/"
// uu.url.dir("/")                               -> "/"
// uu.url.dir("")                                -> "/"
function uuurldir(path) { // @param URLString/PathString: path
                          // @return String: directory path, has tail "/"
    var ary = path.split("/");

    ary.pop(); // chop "file.ext"
    return ary.join("/") + "/";
}

// uu.url.split - split dir/file "dir/file.ext" -> ["dir/", "file.ext"]
function uuurlsplit(path) { // @param URLString/PathString: path
                            // @return Array: ["dir/", "file.ext"]
    var rv = [], ary = path.split("/");

    rv[1] = ary.pop(); // file
    rv[0] = ary.join("/") + "/";
    return rv;
}

// uu.url.build - build URL
function uuurlbuild(hash) { // @param Hash:
                            // @return String: "scheme://domain:port/path?query#fragment"
    return [hash.scheme, "://", hash.domain,
            hash.port     ? ":" + hash.port     : "", hash.path || "/",
            hash.query    ? "?" + hash.query    : "",
            hash.fragment ? "#" + hash.fragment : ""].join("");
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

    m = uuurlparse._FILE.exec(abs);
    if (m) {
        w = uuurlsplit(m[1]);
        return { url: abs, scheme: "file", domain: "", port: "",
                 base: "file:///" + w[0], path: m[1], dir: w[0],
                 file: w[1], query: "", hash: m[2] ? uuqsparse(m[2]) : {},
                 fragment: m[3] || "" };
    }
    m = uuurlparse._URL.exec(abs);
    if (m) {
        m[4] && (w = uuurlsplit(m[4]));
        return { url: abs, scheme: m[1], domain: m[2], port: m[3] || "",
                 base: (m[1] + "://" + m[2]) + (m[3] ? ":" + m[3] : "") + w[0],
                 path: m[4] || "/", dir: w[0], file: w[1], query: m[5] || "",
                 hash: m[5] ? uuqsparse(m[5]) : {}, fragment: m[6] || "" };
    }
    return 0;
}
uuurlparse._FILE = /^file:\/\/(?:\/)?(?:loc\w+\/)?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i;
uuurlparse._URL = /^(\w+):\/\/([^\/:]+)(?::(\d*))?([^ ?#]*)(?:\?([^#]*))?(?:#(.*))?/i;

// uu.qs - query string accessor
// [1][parse] uu.qs() -> { key: "val" } (parse location.href)
// [2][parse] uu.qs("key=val;key2=val2")          -> { key: "val", key2: "val2" }
// [3][build] uu.qs({ key: "val", key2: "val2" }) -> "key=val;key2=val2"
// [4][add]   uu.qs("key=val",  "key2", "val2")   -> "key=val;key2=val2"
// [5][add]   uu.qs("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
function uuqs(a, b, c) { // @return String/Hash:
    if (a === void 0) { // [1]
        return uuqsparse(location.href);
    }
    return !uu.isString(a) ? uuqsbuild(a, b) : // [3]
           (b === void 0 ? uuqsparse : uuqsadd)(a, b, c); // [2][4][5]
}

// uu.qs.add - add query string
// [1] uu.qs.add("key=val",  "key2", "val2")   -> "key=val;key2=val2"
// [2] uu.qs.add("key=val", { key2 : "val2" }) -> "key=val;key2=val2"
function uuqsadd(url,     // @param String:
                 key,     // @param Hash/String:
                 value) { // @param String:
                          // @return String:
    var hash = uuurlparse(url);

    hash.query = uuqsbuild(uu.arg(hash.hash, uu.hash(key, value)));
    return uuurlbuild(hash);
}

// uu.qs.amp - convert semicolon(;) to ampersand(&)
function uuqsamp(str,      // @param String: "key=val;key2=val2"
                 entity) { // @param Number(= 0): 0 is "&", 1 is "&amp;"
                           // @return String: "key=val&key2=val2"(entity=0)
                           //              or "key=val&amp;key2=val2"(entity=1)
    return str.replace(/;/g, entity ? "&amp;" : "&");
}

// uu.qs.build - build query string
function uuqsbuild(query) { // @param Hash: { key: "val", key2: "val2" }
                            // @return QueryString: "key=val;key2=val2"
    var rv = [], i, fn = encodeURIComponent;

    for (i in query) {
        rv.push(fn(i) + "=" + fn(query[i]));
    }
    return rv.join(";");
}

// uu.qs.parse - parse query string
// [1] uu.qs.parse("../img.png?key=value") -> { key: "value" }
// [2] uu.qs.parse("key=value")            -> { key: "value" }
function uuqsparse(query) { // @param URLString/QueryString:
                            // @return Hash: { key: value, ... }
    function _uuqsparse(m, key, value) {
        return rv[fn(key)] = fn(value);
    }
    var rv = {}, fn = decodeURIComponent;

    if (query.indexOf("?") >= 0) { // [1]
        return uuurlparse(query).hash;
    }
    query.replace(_AMP, ";").replace(uuqsparse._QUERY_STR, _uuqsparse); // [2]
    return rv;
}
uuqsparse._QUERY_STR = /(?:([^\=]+)\=([^\;]+);?)/g;

})(window, document, uu);

