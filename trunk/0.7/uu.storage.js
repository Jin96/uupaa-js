
// === Storage ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {
var _cookie = !!navigator.cookieEnabled; // support cookie (document.cookie)

uu.mix(uu, {
  // --- cookie ---
  // [1][get all] uu.cookie.get() -> { name: Mix, ... }
  // [2][get one] uu.cookie.get(name) -> Mix
  // [3][set] uu.cookie(name, "val")
  // [4][set] uu.cookie(name, { key: "val", key2: "val2" })
  // [5][set option] uu.cookie("name", val, { maxage: 2 }) -> maxage 2 day
  //                 uu.cookie("name", val, { maxage: new Date(2010, 1, 10) })
  cookie: uu.mix(uucookie, {
    get:        uucookieget,    // uu.cookie.get() -> { key: value, ... }
    set:        uucookieset,    // [1][set] uu.cookie(name, "val")
                                // [2][set] uu.cookie(name, { key: "val", key2: "val2" })
                                // [3][set option] uu.cookie("name", val, { maxage: 2 }) -> maxage 2 day
                                //                 uu.cookie("name", val, { maxage: new Date(2010, 1, 10) })
    clear:      uucookieclear,  // [1][clear all] uu.cookie.clear()
                                // [2][clear one] uu.cookie.clear(name)
    ready:      uucookieready   // uu.cookie.ready() -> Boolean
  })
});

// --- cookie ---
// uu.cookie - cookie accessor
// [1][get all] uu.cookie.get() -> { name: Mix, ... }
// [2][get one] uu.cookie.get(name) -> Mix
// [3][cookie off] uu.cookie.get(name) -> void 0
// [4][set] uu.cookie(name, "val", option = {})
// [5][set] uu.cookie(name, { key: "val", key2: "val2" }, option = {})
// [6][set option] uu.cookie("name", val, { maxage: 2 }) -> maxage +2 days
//                 uu.cookie("name", val, { maxage: new Date(2010, 1, 10) })
//                                                 -> expire 2010-1-10
function uucookie(name,     // @param String(= void 0):
                  value,    // @param String/Hash(= void 0):
                  option) { // @param Hash(= {}): { domain, path, maxage }
                            //    domain String(= void 0):
                            //    path String(= void 0):
                            //    maxage Number/Date(= void 0):
                            // @return String/void 0:
  return ((value === void 0) ? uucookieget : uucookieset)(name, value, option);
}

// uu.cookie.get - retrieve cookie
// [1][get all] uu.cookie.get() -> { name: Mix, ... }
// [2][get one] uu.cookie.get(name) -> Mix
function uucookieget(name) { // @param String(= void 0):
                             // @return String/Hash/Mix:
  var rv = {}, i, v, w, ary;

  if (_cookie) {
    if (doc.cookie) {
      ary = doc.cookie.split("; ");
      for (i in ary) {
        v = ary[i].split("=");
        w = v[1] == null ? "" : v[1]; // [==] null or undefined
        rv[v[0]] = w ? uu.json2mix(uu.unucs2(decodeURIComponent(w))) : w;
      }
    }
    return name ? rv[name] : rv;
  }
  return "";
}

// uu.cookie.set - store cookie
// [1][set] uu.cookie(name, "val")
// [2][set] uu.cookie(name, { key: "val", key2: "val2" })
// [3][set option] uu.cookie("name", val, { maxage: 2 }) -> maxage +2 days
//                 uu.cookie("name", val, { maxage: new Date(2010, 1, 10) })
function uucookieset(name,     // @param String: name
                     val,      // @param Mix:
                     option) { // @param Hash(= {}): { domain, path, maxage }
  if (_cookie) {
    var rv = [], opt = option || {}, age = opt.maxage,
        v = (val == null) ? "" : encodeURIComponent(uu.fmt("%j", val));

    rv.push(name + "=" + v);
    opt.domain && rv.push("domain=" + opt.domain);
    opt.path   && rv.push("path="   + opt.path);
    if (age !== void 0) {
      rv.push("expires=" + (uu.isnum(age) ? new Date(+new Date + age * 86400000)
                                          : age).toUTCString());
    }
    (location.protocol === "https:") && rv.push("secure");
    doc.cookie = rv.join("; "); // store
  }
}

// uu.cookie.clear - clear cookie
// [1][clear all] uu.cookie.clear()
// [2][clear one] uu.cookie.clear(name)
function uucookieclear(name,     // @param String(= void 0): name
                       option) { // @param Hash(= {}): { domain, path }
  var hash = name ? uu.hash(name, 0) : uucookieget(), i,
      opt = uu.arg(option, { maxage: -1 });

  for (i in hash) {
    uucookieset(i, "", opt);
  }
}

// uu.cookie.ready
function uucookieready() { // @return Boolean
  return _cookie;
}

})(window, document, uu);

