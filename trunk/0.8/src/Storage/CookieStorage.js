
// === uu.Class.CookieStorage ===
//{{{!depend uu, Storage
//}}}!depend

uu.Class.CookieStorage || (function(doc, uu) {

var _STORE_NAME     = "uustorage",
    _PERSIST_DATE   = (new Date(2032, 1, 1)).toUTCString(),
    _REMOVE_DATE    = (new Date(0)).toUTCString(),
    _DISK_SPACE     = 3800, // byte
    _SECURE         = location.protocol === "https:" ? "; secure" : "",
    _inherit = uu.Class.Storage.prototype;

uu.Class.singleton("CookieStorage", {
    init:           init,       // init()
    key:            key,        // key(index:Number):String
    size:           size,       // size():Hash { used, max }
    clear:          clear,      // clear()
    getItem:        getItem,    // getItem(key:String):String
    setItem:        setItem,    // setItem(key:String, value:String):Boolean
    getLength:      getLength,  // getLength():Number - pairs
    removeItem:     removeItem, // removeItem(key:String)
    getAllItems:    getAllItems,// getAllItems():Hash
    toString:       toString,   // toString():String - storage identity
    save:           _inherit.save,
    load:           _inherit.load,
    store:          store,      // [PROTECTED]
    retrieve:       retrieve    // [PROTECTED]
});

function init(callback) { // @param Function(= void): callback
    this._shadowCookie = this.retrieve();

    callback && callback(this);
}

function key(index) { // @param Number:
                      // @return String: "key" or ""
    return uu.hash.nth(this._shadowCookie, index)[0] || "";
}

function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return { used: doc.cookie.length, max: _DISK_SPACE };
}

function clear() {
    this.store(this._shadowCookie, _REMOVE_DATE);
    this._shadowCookie = {};
}

function getItem(key) { // @param String:
                        // @return String: "value" or ""
    return this._shadowCookie[key] || "";
}

function setItem(key,     // @param String:
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

function getLength() { // @return Number: pairs
    return uu.hash.size(this._shadowCookie);
}

function removeItem(key) { // @param String:
    this.store(uu.hash(key, ""), _REMOVE_DATE);
    delete this._shadowCookie[key];
}

function getAllItems() { // @return Hash: { key: "value", ... }
    return this._shadowCookie;
}

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

function toString() {
    return "CookieStorage";
}

// uu.Class.CookieStorage.isReady - static method
uu.Class.CookieStorage.isReady = function() { // @return Boolean
    return !!navigator.cookieEnabled;
};

})(document, uu);

