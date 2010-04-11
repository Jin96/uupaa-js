
// === Storage ===
//{{{!depend uu, uu.class, uu.ajax
//}}}!depend

// +-----------------+-----------------------+-----------+
// | Backend string  | backend               |    Max    |
// +-----------------+-----------------------+-----------+
// | "LocalStorage"  | LocalStorage          | 1.8 ~ 8MB |
// | "FlashStorage"  | SharedObject          |     100kB |
// | "IEStorage"     | IE userData behavior  |      63kB |
// | "CookieStorage" | Cookie                |     3.8kB |
// | "MemStorage"    |                       |       ?   |
// +-----------------+-----------------------+-----------+

uu.Class.Storage || (function(win, doc, uu) {

var _backendOrder = "LocalStorage,FlashStorage,IEStorage,CookieStorage,MemStorage";

uu.Class.singleton("Storage", {
    init:           init,       // init()
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

// uu.Class.Storage.saveToServer - static method
uu.Class.Storage.saveToServer = function(backend,    // @param Hash: StorageObject
                                         url,        // @param String: url
                                         option,     // @param AjaxOptionHash(= void):
                                         callback) { // @param Function(= void): callback(AjaxResultHash)
    var json = uu.json(backend.getAll());

    uu.ajax.post(url, json, option, function(ajaxResultHash) {
        callback && callback(ajaxResultHash);
    }, function(ajaxResultHash) {
        callback && callback(ajaxResultHash);
    });
};

// uu.Class.Storage.loadFromServer - static method
uu.Class.Storage.loadFromServer = function(backend,    // @param StorageObject:
                                           url,        // @param String: url
                                           option,     // @param JSONPOptionHash:
                                           callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.jsonp(url, option, function(jsonpResultHash) {
        if (jsonpResultHash.ok) {

            var key, json = jsonpResultHash.json;

            for (key in json) {
                backend.set(key, json[key]);
            }
        }
        callback && callback(jsonpResultHash);
    }, function(jsonpResultHash) {
        callback && callback(jsonpResultHash);
    });
};

// Storage.init
function init() {
    var that = this,
        requireDiskSpace = uu.config.storage;

    _backendOrder.split(",").some(function(backendName) {
        var Class = uu.Class[backendName];

        if (Class && Class.isReady()) {
            try {
                uu(backendName, function(backend) {
                    var size = backend.size();

                    if (requireDiskSpace && requireDiskSpace > size.max) {
                        that.backend = uu("MemStorage");
                    } else {
                        that.backend = backend;
                    }
                    uu.ready.gone.storage = 1;

                    if (uu.isFunction(win.xstorage)) {
                        setTimeout(function() {
                            win.xstorage(uu, that);
                        }, 0);
                    }
                });
            } catch(err) {
                return false;
            }
            return true;
        }
        return false;
    });
}

// Storage.nth
function nth(index) { // @param Number: index
                      // @return String: "key" or ""
    return this.backend.nth(index) || "";
}

// Storage.get
function get(key) { // @param String:
                    // @return String: "value" or ""
    return this.backend.get(key) || "";
}

// Storage.set
function set(key,     // @param String:
             value) { // @param String: "value"
                      // @return Boolean: false is quota exceeded
    return this.backend.set(key, value);
}

// Storage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    return this.backend.getAll();
}

// Storage.size
function size() { // @return Hash: { used, max, free }
    return this.backend.size();
}

// Storage.pairs
function pairs() { // @return Number: pairs
    return this.backend.pairs();
}

// Storage.clear
function clear() {
    this.backend.clear();
}

// Storage.remove
function remove(key) { // @param String: "key"
    this.backend.remove(key);
}

// Storage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this.backend, url, option, callback);
}

// Storage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this.backend, url, option, callback);
}

// Storage.toString
function toString() {
    return this.backend.toString();
}

// --- init ---
uu.ready(function() {
    uu.Class["Storage"] && uu("Storage");
});

})(window, document, uu);

