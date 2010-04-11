// === CookieStorage ===
//{{{!depend uu, uu.class, uu.Class.Storage
//}}}!depend

uu.Class.CookieStorage || (function(win, doc, uu) {
var _STORE_NAME     = "uustorage",
    _PERSIST_DATE   = (new Date(2032, 1, 1)).toUTCString(),
    _REMOVE_DATE    = (new Date(0)).toUTCString(),
    _DISK_SPACE     = 3800, // byte
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
    saveToServer:   saveToServer,   // saveToServer(url:String, option:AjaxOptionHash = void, callback:Function = void)
    loadFromServer: loadFromServer, // loadFromServer(url:String, option:JSONPOptionHash = void, callback:Function = void)
    toString:       toString,       // toString():String
    store:          store,          // [PROTECTED]
    retrieve:       retrieve        // [PROTECTED]
});

// uu.Class.CookieStorage.isReady - static method
uu.Class.CookieStorage.isReady = function() { // @return Boolean
    return !!navigator.cookieEnabled;
};

// CookieStorage.init
function init(callback) { // @param Function(= void): callback
    // --- create hash ---
    this._shadowCookie = this.retrieve();

    callback && callback(this);
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

    if (before > _DISK_SPACE) {
        return false;
    }

    if (before) {
        before += 2; // "; ".length
    }
    before += this.store(uu.hash(key, value), _PERSIST_DATE);

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
    return { used: doc.cookie.length, max: _DISK_SPACE };
}

// CookieStorage.pairs
function pairs() { // @return Number: pairs
    return uu.hash.size(this._shadowCookie);
}

// CookieStorage.clear
function clear() {
    this.store(this._shadowCookie, _REMOVE_DATE);
    this._shadowCookie = {};
}

// CookieStorage.remove
function remove(key) { // @param String:
    this.store(uu.hash(key, ""), _REMOVE_DATE);
    delete this._shadowCookie[key];
}

// CookieStorage.retrieve
function retrieve() { // @return Hash: { key: "value", ... }
    var rv = {}, i = -1, pairs, pair, kv, cut = _STORE_NAME.length;

    if (doc.cookie) {

        // retrieve KeyValue pairs
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

// CookieStorage.store - store cookie
function store(hash,   // @param Hash:
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

// CookieStorage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this, url, option, callback);
}

// CookieStorage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this, url, option, callback);
}

// CookieStorage.toString
function toString() {
    return "CookieStorage";
}

})(window, document, uu);

