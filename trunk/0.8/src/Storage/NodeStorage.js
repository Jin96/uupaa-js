
// === NodeStorage (on node storage) ===
//{{{!depend uu, uu.class
//}}}!depend

uu.Class.NodeStorage || (function(win, doc, uu) {

uu.Class.singleton("NodeStorage", {
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

// uu.Class.NodeStorage.isReady - static method
uu.Class.NodeStorage.isReady = function() { // @return Boolean
    return true;
};

// NodeStorage.init
function init(node) { // @param Node:
    this.node = node;
}

// NodeStorage.nth
function nth(index) { // @param Number: index
                      // @return String: "key" or ""
    return uu.hash.nth(this.storage, index)[0] || "";
}

// NodeStorage.get
function get(key) { // @param String:
                    // @return String: "value" or ""
    return this.storage[key] || "";
}

// NodeStorage.set
function set(key,     // @param String:
             value) { // @param String: "value"
                      // @return Boolean: false is quota exceeded
    this.storage[key] = value;
    return true;
}

// NodeStorage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    return this.storage;
}

// NodeStorage.size
function size() { // @return Hash: { used, max }
    return { used: 0, max: Number.MAX_VALUE };
}

// NodeStorage.pairs
function pairs() { // @return Number: pairs
    return uu.hash.size(this.storage);
}

// NodeStorage.clear
function clear() {
    this.storage = {};
}

// NodeStorage.remove
function remove(key) { // @param String: "key"
    delete this.storage[key];
}

// NodeStorage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this, url, option, callback);
}

// NodeStorage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this, url, option, callback);
}

// NodeStorage.toString
function toString() {
    return "NodeStorage";
}

})(window, document, uu);

