// === IEStorage (userData behavior) ===
//{{{!depend uu, uu.class, uu.Class.Storage
//}}}!depend

// http://msdn.microsoft.com/en-us/library/ms531424(VS.85).aspx

uu.Class.IEStorage || (function(win, doc, uu) {
var _STORE_NAME     = "uustorage",
    _INDEX          = "uuindex",
    _PERSIST_DATE   = (new Date(2032, 1, 1)).toUTCString(),
    _DISK_SPACE     = 63 * 1024; // 63kB

uu.Class.singleton("IEStorage", {
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
    toString:       toString,   // toString():String
    // --- W3C spec API set ---
    getLength:      pairs,      // [ALIAS]
    key:            nth,        // [ALIAS]
    getItem:        get,        // [ALIAS]
    setItem:        set,        // [ALIAS]
    removeItem:     remove      // [ALIAS]
});

// uu.Class.IEStorage.isReady - static method
uu.Class.IEStorage.isReady = function() { // @return Boolean
    return uu.ie;
};

// IEStorage.init
function init(callback) { // @param Function(= void): callback
    // --- setup behavior ---
    this.storage = uu.node.add("script", doc.head); // <script>
    this.storage.addBehavior("#default#userData");
    this.storage.expires = _PERSIST_DATE;

    callback && callback(this);
}

// IEStorage.nth - get nth key
function nth(index) { // @param Number:
                      // @return String: "key" or ""
    this.storage.load(_STORE_NAME);
    return (this.storage.getAttribute(_INDEX) || "").split("\t")[index] || "";
}

// IEStorage.get - get value
function get(key) { // @param String:
                    // @return String: "value" or ""
    this.storage.load(_STORE_NAME);
    return this.storage.getAttribute(key) || "";
}

// IEStorage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    this.storage.load(_STORE_NAME);

    var rv = {}, key, i = -1,
        indexes = (this.storage.getAttribute(_INDEX) || "").split("\t");

    while ( (key = indexes[++i]) ) {
        rv[key] = this.storage.getAttribute(key) || "";
    }
    return rv;
}

// IEStorage.set
function set(key,     // @param String:
             value) { // @param String:
                      // @return Boolean: false is quota exceeded
    this.storage.load(_STORE_NAME);

    var index = this.storage.getAttribute(_INDEX);

    try {
        // add index
        if (!index) {
            this.storage.setAttribute(_INDEX, key); // first time
        } else if (("\t" + index + "\t").indexOf("\t" + key + "\t") < 0) {
            this.storage.setAttribute(_INDEX, index + "\t" + key);
        }
        this.storage.setAttribute(key, value);
        this.storage.save(_STORE_NAME);
    } catch(err) {
        return false;
    }

    // verify
    return this.storage.getAttribute(key) === value;
}

// IEStorage.size
function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    this.storage.load(_STORE_NAME);

    var index = (this.storage.getAttribute(_INDEX) || ""),
        used = index.length,
        indexes = index.split("\t"), key, i = -1;

    while ( (key = indexes[++i]) ) {
        used += (this.storage.getAttribute(key) || "").length;
    }
    return { used: used, max: _DISK_SPACE };
}

// IEStorage.pairs
function pairs() { // @return Number: pairs
    this.storage.load(_STORE_NAME);
    return (this.storage.getAttribute(_INDEX) || "").split("\t").length;
}

// IEStorage.clear
function clear() {
    this.storage.load(_STORE_NAME);

    var indexes = (this.storage.getAttribute(_INDEX) || "").split("\t"),
        key, i = -1;

    while ( (key = indexes[++i]) ) {
        this.storage.removeAttribute(key);
    }
    this.storage.setAttribute(_INDEX, "");
    this.storage.save(_STORE_NAME);
}

// IEStorage.remove
function remove(key) { // @param String: key
    this.storage.load(_STORE_NAME);

    var index = (this.storage.getAttribute(_INDEX) || ""),
        tabIndex = "\t" + index + "\t",
        tabKey   = "\t" + key   + "\t";

    if (tabIndex.indexOf(tabKey) >= 0) {
        index = uu.trim(tabIndex.replace(new RegExp(tabKey), ""));

        this.storage.setAttribute(_INDEX, index);
        this.storage.removeAttribute(key);
        this.storage.save(_STORE_NAME);
    }
}

// IEStorage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this, url, option, callback);
}

// IEStorage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this, url, option, callback);
}

// IEStorage.toString
function toString() {
    return "IEStorage";
}

})(window, document, uu);

