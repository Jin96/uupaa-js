// === URL manipulator =====================================
// depend: none
uu.feat.url = {};

(function() {
var REX_FILE = /^file:\/\/(?:\/)?(?:localhost\/)?((?:[a-z]\:)?.*)$/,
    REX_URL  = /^([a-z][a-z\d\+\-\.]*)\:\/\/([^\/\:]+)(?:\:(\d*))?([^\?#\s]*)(?:\?([^#]*))?(?:#(.*))?/i,
    REX_ABS  = /^(file|https|http)\:\/\//;

// uu.url - parse and build URL
uu.url = function(url) { // String/Hash(default: "."): 
  url = url || ".";
  if (typeof url === "string") {
    // parse URL
    var abs = uu.url.abs(url),
        dir = "", file = "", m, ary, hash;

    if ( (m = abs.match(REX_FILE)) ) {
      ary  = m[1].split("/");
      file = ary.pop();
      dir  = ary.join("/");
      return {
        url:      abs,
        scheme:   "file",
        domain:   "",
        port:     "",
        base:     "file:///" + dir || "/", path: m[1],
        dir:      dir || "/",
        file:     file || "",
        query:    "",
        hash:     {},
        fragment: ""
      };
    } else if ( (m = abs.match(REX_URL)) ) {
      if (m[4]) {
        ary  = m[4].split("/");
        file = ary.pop();
        dir  = ary.join("/");
      }
      hash = m[5] ? uu.url.query(m[5]) : {};
      return {
        // "http://wwww.example.com:8080/dir/file.ext?key1=value1&key2=value2#menu1"
        url:      abs,          // AbsoluteURLString( "http://..." )
        scheme:   m[1],         // SchemeString( "file" or "http" or "https" )
        domain:   m[2],         // DomainNameString( "www.example.com" )
        port:     m[3] || "",   // PortNumber( "8080" or "" ) - not Number
        base:     (m[1] + "://" + m[2]) + (m[3] ? ":" + m[3] : "") + (dir || "/"),
        path:     m[4] || "/",  // PathString( "/dir/file.ext" or "/" )
        dir:      dir  || "/",  // DirString( "/dir" or "/" )
        file:     file || "",   // FileNameString( "file.ext" or "" )
        query:    m[5] || "",   // QueryString( "key1=value1&key2=value2" or "" )
        hash:     hash,         // QueryHash( { key1: "value1", key2: "value2" } )
        fragment: m[6] || ""    // FragmentString( "menu1" or "" )
      };
      // return Hash( { url, scheme, domain, port, base, path, dir, file,
      //                query, hash, fragment } )
    }
    return false;
  }
  // build URL
  return [
    url.scheme, "://",
    url.domain,
    url.port ? ":" + url.port : "",
    url.path || "/",
    url.query ? "?" + url.query : "",
    url.fragment ? "#" + url.fragment : ""
  ].join("");
  // return String( "scheme://domain:port/path?query#fragment" )
};

uu.mix(uu.url, {
  // uu.url.abs - to absolute URL
  abs: function(url) { // String(default: "."): rel/abs-url
    url = url || ".";
    if (REX_ABS.test(url)) {
      return url;
    }
    var div = uudoc.createElement("div");
    div.innerHTML = '<a href="' + url + '" />';
    return div.firstChild ? div.firstChild.href
                          : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    // return String( "abs-url" )
  },

  // uu.url.query - parse and build QueryString
  query: function(query) { // String/Hash:
    var rv, fn, i;
    if (typeof query === "string") {
      // parse QueryString
      rv = {}, fn = decodeURIComponent;
      query.replace(/^.*\?/, "").replace(/&amp;/g, "&").
            replace(/(?:([^\=]+)\=([^\&]+)&?)/g, function(_, key, value) {
        return rv[fn(key)] = fn(value);
      });
      return rv; // return Hash( { key: value, ... } )
    }
    // build QueryString
    rv = [], fn = encodeURIComponent;
    for (i in query) {
      rv.push(fn(i) + "=" + fn(query[i]));
    }
    return rv.join("&"); // return String( "key=value&key=value..." )
  }
});
})();
