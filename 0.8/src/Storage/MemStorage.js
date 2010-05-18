
// === uu.Class.MemStorage (on memory storage) ===
//{{{!depend uu, Storage
//}}}!depend

uu.Class.MemStorage || (function(uu) {

uu.Class.singleton("MemStorage", {
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
    this.storage = {};

    callback && callback(this);
}

function key(index) { // @param Number:
                      // @return String: "key" or ""
    return uu.hash.nth(this.storage, index)[0] || "";
}

function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return { used: 0, max: Number.MAX_VALUE };
}

function clear() {
    this.storage = {};
}

function getItem(key) { // @param String:
                        // @return String: "value" or ""
    return this.storage[key] || "";
}

function setItem(key,     // @param String:
                 value) { // @param String:
                          // @return Boolean: false is quota exceeded
    this.storage[key] = value;
    return true;
}

function getLength() { // @return Number: pairs
    return uu.hash.size(this.storage);
}

function removeItem(key) { // @param String:
    delete this.storage[key];
}

function getAllItems() { // @return Hash: { key: "value", ... }
    return this.storage;
}

function save(url,        // @param String: url
              option,     // @param AjaxOptionHash(= void):
              callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.save(this, url, option, callback);
}

function load(url,        // @param String: url
              option,     // @param JSONPOptionHash:
              callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.load(this, url, option, callback);
}

function toString() {
    return "MemStorage";
}

// uu.Class.MemStorage.isReady - static method
uu.Class.MemStorage.isReady = function() { // @return Boolean
    return true;
};

})(uu);

