
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
    loadFromServer: loadFromServer  // loadFromServer(url:String, option:JSONPOptionHash = void, callback:Function = void)
});

// uu.Class.Storage.saveToServer - static method
uu.Class.Storage.saveToServer = function(storage,    // @param Hash: StorageObject
                                         url,        // @param String: url
                                         option,     // @param AjaxOptionHash(= void):
                                         callback) { // @param Function(= void): callback(AjaxResultHash)
    var json = uu.json(storage.getAll());

    uu.ajax.post(url, json, option, function(ajaxResultHash) {
        callback && callback(ajaxResultHash);
    }, function(ajaxResultHash) {
        callback && callback(ajaxResultHash);
    });
};

// uu.Class.Storage.loadFromServer - static method
uu.Class.Storage.loadFromServer = function(storage,    // @param StorageObject:
                                           url,        // @param String: url
                                           option,     // @param JSONPOptionHash:
                                           callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.jsonp(url, option, function(jsonpResultHash) {
        if (jsonpResultHash.ok) {

            var key, json = jsonpResultHash.json;

            for (key in json) {
                storage.set(key, json[key]);
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
                uu(backendName, function(storage) {
                    var size = storage.size();

                    if (requireDiskSpace && requireDiskSpace > size.max) {

                        that.backend = "MemStorage";
                        that.storage = uu("MemStorage");
                    } else {
                        that.backend = backendName;
                        that.storage = storage;
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
    return this.storage.nth(index) || "";
}

// Storage.get
function get(key) { // @param String:
                    // @return String: "value" or ""
    return this.storage.get(key) || "";
}

// Storage.set
function set(key,     // @param String:
             value) { // @param String: "value"
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

// Storage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this.storage, url, option, callback);
}

// Storage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this.storage, url, option, callback);
}

// --- init ---
uu.ready(function() {
    uu.Class["Storage"] && uu("Storage");
});

})(window, document, uu);

