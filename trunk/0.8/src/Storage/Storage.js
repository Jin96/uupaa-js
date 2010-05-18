
// === uu.Class.Storage ===
//{{{!depend uu, uu.ajax
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

uu.Class.Storage || (function(uu) {

var _backendOrder = "LocalStorage,FlashStorage,IEStorage,CookieStorage,MemStorage";

uu.Class.singleton("Storage", {
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

function init() {
    var that = this,
        requireDiskSpace = uu.config.storage || 0;

    _backendOrder.split(",").some(function(backendName) {
        var storageBackend = uu.Class[backendName];

        if (storageBackend && storageBackend.isReady()) {
            try {
                uu(backendName, function(backend) { // ready.callback
                    var size = backend.size();

                    if (requireDiskSpace && requireDiskSpace > size.max) {
                        that.storage = uu("MemStorage"); // not possible
                    } else {
                        that.storage = backend;
                    }
                    uu.ready.storage = true;

                    setTimeout(function() {
                        uu.ready.fire("storage", that);
                    }, 0);
                });
            } catch(err) {
                return false;
            }
            return true;
        }
        return false;
    });
}

function key(index) { // @param Number:
                      // @return String: "key" or ""
    return this.storage.key(index) || "";
}

function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return this.storage.size();
}

function clear() {
    this.storage.clear();
}

function getItem(key) { // @param String:
                        // @return String: "value" or ""
    return this.storage.getItem(key) || "";
}

function setItem(key,     // @param String:
                 value) { // @param String:
                          // @return Boolean: false is quota exceeded
    return this.storage.setItem(key, value);
}

function getLength() { // @return Number: pairs
    return this.storage.getLength();
}

function removeItem(key) { // @param String:
    this.storage.removeItem(key);
}

function getAllItems() { // @return Hash: { key: "value", ... }
    return this.storage.getAllItems();
}

function save(url,        // @param String: url
              option,     // @param AjaxOptionHash(= void):
              callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.save(this.storage, url, option, callback);
}

function load(url,        // @param String: url
              option,     // @param JSONPOptionHash:
              callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.load(this.storage, url, option, callback);
}

function toString() { // @return String: "IDENTITY", eg: "MemStorage"
    return this.storage.toString();
}

// --- init ---
uu.ready("window", function() {
    uu.Class["Storage"] && uu("Storage");
});

// [STATIC] uu.Class.Storage.save - save to server
uu.Class.Storage.save = function(storage,    // @param Hash: StorageObject
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

// [STATIC] uu.Class.Storage.load - load from server
uu.Class.Storage.load = function(storage,    // @param StorageObject:
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

})(uu);

