
// === MemStorage (on memory storage) ===
//{{{!depend uu, uu.class, uu.Class.Storage
//}}}!depend

uu.Class.MemStorage || (function(win, doc, uu) {

uu.Class.singleton("MemStorage", {
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
    loadFromServer: loadFromServer  // loadFromServer(url:String, option:JSONPOptionHash = void, callback:Function = void)
});

// uu.Class.MemStorage.isReady - static method
uu.Class.MemStorage.isReady = function() { // @return Boolean
    return true;
};

// MemStorage.init
function init(callback) { // @param Function(= void): callback
    this.storage = {};

    callback && callback(this);
}

// MemStorage.nth
function nth(index) { // @param Number: index
                      // @return String: "key" or ""
    return uu.hash.nth(this.storage, index)[0] || "";
}

// MemStorage.get
function get(key) { // @param String:
                    // @return String: "value" or ""
    return this.storage[key] || "";
}

// MemStorage.set
function set(key,     // @param String:
             value) { // @param String: "value"
                      // @return Boolean: false is quota exceeded
    this.storage[key] = value;
    return true;
}

// MemStorage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    return this.storage;
}

// MemStorage.size
function size() { // @return Hash: { used, max }
    return { used: 0, max: Number.MAX_VALUE };
}

// MemStorage.pairs
function pairs() { // @return Number: pairs
    return uu.hash.size(this.storage);
}

// MemStorage.clear
function clear() {
    this.storage = {};
}

// MemStorage.remove
function remove(key) { // @param String: "key"
    delete this.storage[key];
}

// MemStorage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this, url, option, callback);
}

// MemStorage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this, url, option, callback);
}

})(window, document, uu);

