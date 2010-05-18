
// === uu.Class.IEStorage (userData behavior) ===
//{{{!depend uu, Storage
//}}}!depend

// http://msdn.microsoft.com/en-us/library/ms531424(VS.85).aspx

//{{{!mb

uu.Class.IEStorage || (function(uu) {

var _STORE_NAME     = "uustorage",
    _INDEX          = "uuindex",
    _PERSIST_DATE   = (new Date(2032, 1, 1)).toUTCString(),
    _DISK_SPACE     = 63 * 1024; // 63kB

uu.Class.singleton("IEStorage", {
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
    save:           save,       // saveToServer(url:String, option:AjaxOptionHash = void, callback:Function = void)
    load:           load        // loadFromServer(url:String, option:JSONPOptionHash = void, callback:Function = void)
});

function init(callback) { // @param Function(= void): callback
    uu.head(this.storage = uu.node("script")); // <script>
    this.storage.addBehavior("#default#userData");
    this.storage.expires = _PERSIST_DATE;

    callback && callback(this);
}

function key(index) { // @param Number:
                      // @return String: "key" or ""
    this.storage.load(_STORE_NAME);
    return (this.storage.getAttribute(_INDEX) || "").split("\t")[index] || "";
}

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

function getItem(key) { // @param String:
                        // @return String: "value" or ""
    this.storage.load(_STORE_NAME);
    return this.storage.getAttribute(key) || "";
}

function setItem(key,     // @param String:
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

function getLength() { // @return Number: pairs
    this.storage.load(_STORE_NAME);
    return (this.storage.getAttribute(_INDEX) || "").split("\t").length;
}

function removeItem(key) { // @param String:
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

function getAllItems() { // @return Hash: { key: "value", ... }
    this.storage.load(_STORE_NAME);

    var rv = {}, key, i = -1,
        indexes = (this.storage.getAttribute(_INDEX) || "").split("\t");

    while ( (key = indexes[++i]) ) {
        rv[key] = this.storage.getAttribute(key) || "";
    }
    return rv;
}

function save(url,        // @param String: url
              option,     // @param AjaxOptionHash(= void):
              callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this, url, option, callback);
}

function load(url,        // @param String: url
              option,     // @param JSONPOptionHash:
              callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this, url, option, callback);
}

function toString() {
    return "IEStorage";
}

// uu.Class.IEStorage.isReady - static method
uu.Class.IEStorage.isReady = function() { // @return Boolean
    return uu.ie;
};

})(uu);

//}}}!mb
