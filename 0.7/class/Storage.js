
// === Storage ===
//{{{!depend uu, uu.class
//}}}!depend

// http://d.hatena.ne.jp/uupaa/20100106/1262781846
// +-----------------+-----------------------+--------+-------+
// | Backend string  | Real backend          | Min    | Max   |
// +-----------------+-----------------------+--------+-------+
// | "LocalStorage"  | LocalStorage          | 2.2MB  | 8MB   |
// | "FlashStorage"  | SharedObject          | 99kB(*)| 1MB   |
// | "IEStorage"     | IE userData behavior  |        | 64kB  |
// | "CookieStorage" | Cookie                |        | 3.8kB |
// | "NoStorage"     |                       | 0      | 0     |
// +-----------------+-----------------------+--------+-------+

uu.local || (function(win, doc, uu) {

//var _order = "LocalStorage,FlashStorage,IEStorage,CookieStorage,NoStorage";
var _order = "FlashStorage,NoStorage";

uu.Class.singleton("Storage", {
    init:           init,       // Storage.init()
    nth:            nth,        // Storage.nth(index:Number):String
    get:            get,        // Storage.get(key:String):String
    set:            set,        // Storage.set(key:String, value:String):Boolean
    size:           size,       // Storage.size():Hash { used, max }
    pairs:          pairs,      // Storage.pairs():Number
    clear:          clear,      // Storage.clear()
    remove:         remove,     // Storage.remove(key:String)
    getAll:         getAll,     // Storage.getAll():Hash
    push:           push,       // Storage.push(url:String, option:AjaxOptionHash = void, callback:Function = void)
    pop:            pop         // Storage.pop(url:String, option:JSONPOptionHash = void, callback:Function = void)
});

uu.Class.singleton("NoStorage", {
    init:           function(callback) { callback && callback() },
    nth:            uu.nop,     // NoStorage.nth(index:Number):String
    get:            uu.nop,     // NoStorage.get(key:String):String
    set:            uu.nop,     // NoStorage.set(key:String, value:String):Boolean
    size:           function() { return { used: 0, max: 0 }; },
    pairs:          uu.nop,     // NoStorage.pairs():Number
    clear:          uu.nop,     // NoStorage.clear()
    remove:         uu.nop,     // NoStorage.remove(key:String)
    getAll:         uu.nop      // NoStorage.getAll():Hash
});
uu.Class.NoStorage.isReady = function() { // @return Boolean
    return true;
};

// Storage.init
function init() {
    var that = this;

    this.backend = "NoStorage";

    _order.split(",").some(function(storageName) {
        var Class = uu.Class[storageName];

        if (Class && Class.isReady()) {

            that.backend = storageName;
            that.storage = uu(storageName, function() {

                uu.ready.gone.storage = 1;

                if (uu.isFunction(win.xstorage)) {
                    setTimeout(function() {
                        win.xstorage(uu, that);
                    }, 0);
                }
            });
            return true;
        }
        return false;
    });
}

// Storage.nth
function nth(index) { // @param Number: index
                      // @return String: "key" or ""
    return this.storage.nth(index) || "";
}

// Storage.get
function get(key) { // @param String: "key"
                    // @return String: "val" or ""
    return this.storage.get(key) || "";
}

// Storage.set
function set(key,     // @param String: "key"
             value) { // @param String: "val"
                      // @return Boolean: false is quota exceeded
    return this.storage.set(key, value);
}

// Storage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    return this.storage.getAll();
}

// Storage.size
function size() { // @return Hash: { used, max, free }
    return this.storage.size();
}

// Storage.pairs
function pairs() { // @return Number: pairs
    return this.storage.pairs();
}

// Storage.clear
function clear() {
    this.storage.clear();
}

// Storage.remove
function remove(key) { // @param String: "key"
    this.storage.remove(key);
}

// TODO: test
// Storage.push - save to server
function push(url,        // @param String: url
              option,     // @param AjaxOptionHash(= void):
              callback) { // @param Function(= void): callback(AjaxResultHash)
    var data = uu.json(this.getAll());

    uu.ajax.post(url, data, option, function(ajaxResultHash) {
        callback && callback(ajaxResultHash);
    }, function(ajaxResultHash) {
        callback && callback(ajaxResultHash);
    });
}

// TODO: test
// Storage.pop - load from server
function pop(url,        // @param String: url
             option,     // @param JSONPOptionHash:
             callback) { // @param Function(= void): callback(JSONPResultHash)
    var that = this;

    uu.jsonp(url, option, function(jsonpResultHash) {

        var json = uu.json.decode(jsonpResultHash, true), // use native json
            key;

        for (key in json) {
            that.set(key, json[key]);
        }
        callback && callback(jsonpResultHash);
    }, function(jsonpResultHash) {
        callback && callback(jsonpResultHash);
    });
}

})(window, document, uu);

