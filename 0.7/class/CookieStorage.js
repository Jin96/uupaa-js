// === CookieStorage ===
//{{{!depend uu, uu.class
//}}}!depend

uu.Class.CookieStorage || (function(win, doc, uu) {
var _STORE_NAME     = "uustorage",
    _PERSIST_DATE   = (new Date(2032, 1, 1)).toUTCString(),
    _REMOVE_DATE    = (new Date(0)).toUTCString(),
    _FREE_SPACE     = 3800, // byte
    _SECURE         = location.protocol === "https:" ? "; secure" : "";

uu.Class.singleton("CookieStorage", {
    init:           init,       // init(callback:Function = void)
    nth:            nth,        // nth(index:Number):String
    get:            get,        // get(key:String):String
    set:            set,        // set(key:String, value:String):Boolean
    size:           size,       // size():Hash { used, max }
    pairs:          pairs,      // pairs():Number
    clear:          clear,      // clear()
    remove:         remove,     // remove(key:String)
    getAll:         getAll,     // getAll():Hash
    load:           load,       // [PROTECTED]
    save:           save        // [PROTECTED]
});

// uu.Class.CookieStorage.isReady - static method
uu.Class.CookieStorage.isReady = function() { // @return Boolean
    return !!navigator.cookieEnabled;
};

// CookieStorage.init
function init(callback) { // @param Function(= void): callback
    // --- create hash ---
    this._shadowCookie = this.load();

    callback && callback();
}

// CookieStorage.nth - get nth key
function nth(index) { // @param Number:
                      // @return String: "key" or ""
    return uu.hash.nth(this._shadowCookie, index)[0] || "";
}

// CookieStorage.get - get value
function get(key) { // @param String:
                    // @return String: "value" or ""
    return this._shadowCookie[key] || "";
}

// CookieStorage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    return this._shadowCookie;
}

// CookieStorage.set - set value
function set(key,     // @param String:
             value) { // @param String:
                      // @return Boolean: false is quota exceeded
    var before = doc.cookie.length;

    if (before > _FREE_SPACE) {
        return false;
    }

    if (before) {
        before += 2; // "; ".length
    }
    before += this.save(uu.hash(key, value), _PERSIST_DATE);

    if (before !== doc.cookie.length) { // before !== after -> !damage!
        return false;
    }
    this._shadowCookie[key] = value;
    return true;
}

// CookieStorage.size
function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return { used: doc.cookie.length, max: _FREE_SPACE };
}

// CookieStorage.pairs
function pairs() { // @return Number: pairs
    return uu.hash.size(this._shadowCookie);
}

// CookieStorage.clear
function clear() {
    this.save(this._shadowCookie, _REMOVE_DATE);
    this._shadowCookie = {};
}

// CookieStorage.remove
function remove(key) { // @param String:
    this.save(uu.hash(key, ""), _REMOVE_DATE);
    delete this._shadowCookie[key];
}

// CookieStorage.load
function load() { // @return Hash: { key: "value", ... }
    var rv = {}, i = -1, pairs, pair, kv, cut = _STORE_NAME.length;

    if (doc.cookie) {

        // Load KeyValue pairs
        //      collect: "{{_STORE_NAME}}key=value"
        //      ignore:  "key=value"
        //
        pairs = doc.cookie.split("; ");

        while ( (pair = pairs[++i]) ) {
            kv = pair.split("="); // ["{{_STORE_NAME}}key", "value"]

            if (!kv[0].indexOf(_STORE_NAME)) {
                rv[kv[0].slice(cut)] = decodeURIComponent(kv[1] || "");
            }
        }
    }
    return rv;
}

// CookieStorage.save - save cookie
function save(hash,   // @param Hash:
              date) { // @param UTCDateString:
                      // @return Number: last KeyValue pair length
    var rv = "", key;

    for (key in hash) {
        rv = _STORE_NAME + key + "=" + encodeURIComponent(hash[key]);

        // store cookie
        doc.cookie = rv + "; expires=" + date + _SECURE;
    }
    return rv.length;
}

})(window, document, uu);

