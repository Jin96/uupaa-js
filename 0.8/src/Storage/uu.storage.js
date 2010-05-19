
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

uu.Class.Storage || (function(win, doc, uu) {

uu.storage = null; // uu.storage - uu.Class.Storage instance

var _backendOrder = "LocalStorage,FlashStorage,IEStorage,CookieStorage,MemStorage",
    _localStorageDiskSpace =
                   uu.ver.iphone ? 2.5   * 1024 * 1024 - 260 // iPhone3.1.2 (2.5MB)
                 : uu.ver.chrome ? 2.5   * 1024 * 1024 - 260 // Chrome4+    (2.5MB)
                 : uu.ver.safari ? 8     * 1024 * 1024       // Safari4+    (8.0MB)
                 : uu.webkit     ? 2.5   * 1024 * 1024 - 260 // WebKit      (2.5MB)
//{{{!mb
                 : uu.gecko      ? 5     * 1024 * 1024 - 260 // Firefox3.5+ (5.0MB)
                 : uu.opera      ? 1.875 * 1024 * 1024 - 128 // Opera10.50  (1.875MB)
                 : uu.ie         ? 5     * 1000 * 1000       // IE8+        (4.768MB)
//}}}!mb
                 : 0,
//{{{!mb
    _flashPath   = uu.config.baseDir + "uu.storage.swf",
    _flashReady  = null,
    _ieIndex     = "uuindex",
    _ieDiskSpace = 63 * 1024, // 63kB
//}}}!mb
    _storeName   = "uustorage", // IEStorage, CookieStorage
    _persistDate = (new Date(2032, 1, 1)).toUTCString(), // IEStorage, CookieStorage
    _cookieDiskSpace = 3800, // byte
    // minify
//{{{!mb
    _getAttribute = "getAttribute",
    _setAttribute = "setAttribute",
//}}}!mb
    _false = !1,
    _true = !0;

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

// --- uu.Class.LocalStorage (WebStorage) ---
// WebStorage: http://www.w3.org/TR/webstorage/#storage
//   IE8 spec: http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx
uu.Class.singleton("LocalStorage", {
    init:           localStorageInit,
    key:            key,
    size:           localStorageSize,
    clear:          clear,
    getItem:        getItem,
    setItem:        localStorageSetItem,
    getLength:      localStorageGetLength,
    removeItem:     removeItem,
    getAllItems:    localStorageGetAllItems,
    toString:       localStorageToString,
    save:           save,
    load:           load
});

//{{{!mb
// --- uu.Class.FlashStorage ---
uu.Class.singleton("FlashStorage", {
    init:           flashStorageInit,
    key:            key,
    size:           size,
    clear:          clear,
    getItem:        getItem,
    setItem:        setItem,
    getLength:      getLength,
    removeItem:     removeItem,
    getAllItems:    getAllItems,
    toString:       flashStorageToString,
    save:           save,
    load:           load
});
//}}}!mb

//{{{!mb
// --- uu.Class.IEStorage (userData behavior) ---
// http://msdn.microsoft.com/en-us/library/ms531424(VS.85).aspx
uu.Class.singleton("IEStorage", {
    init:           ieStorageInit,
    key:            ieStorageKey,
    size:           ieStorageSize,
    clear:          ieStorageClear,
    getItem:        ieStorageGetItem,
    setItem:        ieStorageSetItem,
    getLength:      ieStorageGetLength,
    removeItem:     ieStorageRemoveItem,
    getAllItems:    ieStorageGetAllItems,
    toString:       ieStorageToString,
    save:           save,
    load:           load
});
//}}}!mb

// --- uu.Class.CookieStorage ---
uu.Class.singleton("CookieStorage", {
    init:           cookieStorageInit,
    key:            cookieStorageKey,
    size:           cookieStorageSize,
    clear:          cookieStorageClear,
    getItem:        cookieStorageGetItem,
    setItem:        cookieStorageSetItem,
    getLength:      cookieStorageGetLength,
    removeItem:     cookieStorageRemoveItem,
    getAllItems:    cookieStorageGetAllItems,
    toString:       cookieStorageToString,
    save:           save,
    load:           load,
    store:          cookieStorageStore,
    retrieve:       cookieStorageRetrieve
});

// --- uu.Class.MemStorage (on memory storage) ---
uu.Class.singleton("MemStorage", {
    init:           memStorageInit,
    key:            memStorageKey,
    size:           memStorageSize,
    clear:          memStorageClear,
    getItem:        memStorageGetItem,
    setItem:        memStorageSetItem,
    getLength:      memStorageGetLength,
    removeItem:     memStorageRemoveItem,
    getAllItems:    memStorageGetAllItems,
    toString:       memStorageToString,
    save:           save,
    load:           load
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
                        that.so = uu("MemStorage"); // not possible
                    } else {
                        that.so = backend;
                    }
                    uu.storage = that;
                    uu.ready.storage = _true;

                    setTimeout(function() {
                        uu.ready.fire("storage", that);
                    }, 0);
                });
            } catch(err) {
                return _false;
            }
            return _true;
        }
        return _false;
    });
}

function key(index) { // @param Number:
                      // @return String: "key" or ""
    return this.so.key(index) || "";
}

function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return this.so.size();
}

function clear() {
    this.so.clear();
}

function getItem(key) { // @param String:
                        // @return String: "value" or ""
    return this.so.getItem(key) || "";
}

function setItem(key,     // @param String:
                 value) { // @param String:
                          // @return Boolean: false is quota exceeded
    return this.so.setItem(key, value);
}

function getLength() { // @return Number: pairs
    return this.so.getLength();
}

function removeItem(key) { // @param String:
    this.so.removeItem(key);
}

function getAllItems() { // @return Hash: { key: "value", ... }
    return this.so.getAllItems();
}

function save(url,        // @param String: url
              option,     // @param AjaxOptionHash(= void):
              callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.save(this.so, url, option, callback);
}

function load(url,        // @param String: url
              option,     // @param JSONPOptionHash:
              callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.load(this.so, url, option, callback);
}

function toString() { // @return String: "IDENTITY", eg: "MemStorage"
    return this.so.toString();
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

// --- LocalStorage ---
function localStorageInit(callback) { // @param Function(= void): callback
    this.so = win.localStorage;

    callback && callback(this);
}

function localStorageSize() { // @return Hash: { used, max }
                              //    used - Number: bytes
                              //    max  - Number: bytes
    var used = 0, i = 0, iz, remain;

//{{{!mb
    if (uu.ie && "remainingSpace" in this.so) { // [IE8][IE9] storage.remainingSpace

        remain = this.so.remainingSpace;

        if (_localStorageDiskSpace < remain) { // expand free space
            __localStorageDiskSpace = 5 * 1000 * 1000; // 5MB
        }
        return { used: __localStorageDiskSpace - remain,
                 max:  __localStorageDiskSpace };
    }
//}}}!mb
    for (iz = this.so.length; i < iz; ++i) {
        used += this.so.getItem(this.so.key(i)).length;
    }
    return { used: used, max: _localStorageDiskSpace };
}

function localStorageSetItem(key,     // @param String:
                             value) { // @param String:
                                      // @return Boolean: false is quota exceeded
    try {
        // pre clear
        //  [iPhone][FIX] http://d.hatena.ne.jp/uupaa/2010/01/05
        this.so[key] = "";
        this.so[key] = value;
    } catch(err) { // catch Error("QUOTA_EXCEEDED_ERR")
        uu.log(err + "");
        return _false;
    }

    // verify
    return this.so[key] === value;
}

function localStorageGetLength() { // @return Number: pairs
    return this.so.length;
}

function localStorageGetAllItems() { // @return Hash: { key: "value", ... }
    var rv = {}, key, index = 0, iz = this.so.length;

    for (; index < iz; ++index) {
        key = this.so.key(index);
        rv[key] = this.so.getItem(key);
    }
    return rv;
}

function localStorageToString() {
    return "LocalStorage";
}

// uu.Class.LocalStorage.isReady - static method
uu.Class.LocalStorage.isReady = function() { // @return Boolean
    return !!win.localStorage;
};

//{{{!mb
// --- FlashStorage ---
function flashStorageInit(callback) { // @param Function(= void): callback
    var that = this;
        externalObjectID = "externalflashstorage";

    // wait for response from flash initializer
    function flashStorageReadyCallback() {
        setTimeout(function() {
            uu.dmz[externalObjectID] = null;
            callback && callback(that);
        }, 0);
    }

    uu.dmz[externalObjectID] = flashStorageReadyCallback;

    this.so = uu.flash(_flashPath,
                       { id: externalObjectID, width: 1, height: 1 });
}

function flashStorageToString() {
    return "FlashStorage";
}

// uu.Class.FlashStorage.isReady - static method
uu.Class.FlashStorage.isReady = function() { // @return Boolean
    if (_flashReady === null) {
        _flashReady = uu.ver.flash && uu.file(_flashPath).ok;
    }
    return _flashReady;
};
//}}}!mb

//{{{!mb
// --- IEStorage ---
function ieStorageInit(callback) { // @param Function(= void): callback
    uu.head(this.so = uu.node("script")); // <script>
    this.so.addBehavior("#default#userData");
    this.so.expires = _persistDate;

    callback && callback(this);
}

function ieStorageKey(index) { // @param Number:
                               // @return String: "key" or ""
    this.so.load(_storeName);
    return (this.so[_getAttribute](_ieIndex) || "").split("\t")[index] || "";
}

function ieStorageSize() { // @return Hash: { used, max }
                           //    used - Number: bytes
                           //    max  - Number: bytes
    this.so.load(_storeName);
    var index = (this.so[_getAttribute](_ieIndex) || ""),
        used = index.length,
        indexes = index.split("\t"), key, i = -1;

    while ( (key = indexes[++i]) ) {
        used += (this.so[_getAttribute](key) || "").length;
    }
    return { used: used, max: _ieDiskSpace };
}

function ieStorageClear() {
    this.so.load(_storeName);

    var indexes = (this.so[_getAttribute](_ieIndex) || "").split("\t"),
        key, i = -1;

    while ( (key = indexes[++i]) ) {
        this.so.removeAttribute(key);
    }
    this.so[_setAttribute](_ieIndex, "");
    this.so.save(_storeName);
}

function ieStorageGetItem(key) { // @param String:
                                 // @return String: "value" or ""
    this.so.load(_storeName);
    return this.so[_getAttribute](key) || "";
}

function ieStorageSetItem(key,     // @param String:
                          value) { // @param String:
                                   // @return Boolean: false is quota exceeded
    this.so.load(_storeName);

    var index = this.so[_getAttribute](_ieIndex);

    try {
        // add index
        if (!index) {
            this.so[_setAttribute](_ieIndex, key); // first time
        } else if (("\t" + index + "\t").indexOf("\t" + key + "\t") < 0) {
            this.so[_setAttribute](_ieIndex, index + "\t" + key);
        }
        this.so[_setAttribute](key, value);
        this.so.save(_storeName);
    } catch(err) {
        return _false;
    }

    // verify
    return this.so[_getAttribute](key) === value;
}

function ieStorageGetLength() { // @return Number: pairs
    this.so.load(_storeName);
    return (this.so[_getAttribute](_ieIndex) || "").split("\t").length;
}

function ieStorageRemoveItem(key) { // @param String:
    this.so.load(_storeName);

    var index = (this.so[_getAttribute](_ieIndex) || ""),
        tabIndex = "\t" + index + "\t",
        tabKey   = "\t" + key   + "\t";

    if (tabIndex.indexOf(tabKey) >= 0) {
        index = uu.trim(tabIndex.replace(new RegExp(tabKey), ""));

        this.so[_setAttribute](_ieIndex, index);
        this.so.removeAttribute(key);
        this.so.save(_storeName);
    }
}

function ieStorageGetAllItems() { // @return Hash: { key: "value", ... }
    this.so.load(_storeName);

    var rv = {}, key, i = -1,
        indexes = (this.so[_getAttribute](_ieIndex) || "").split("\t");

    while ( (key = indexes[++i]) ) {
        rv[key] = this.so[_getAttribute](key) || "";
    }
    return rv;
}

function ieStorageToString() {
    return "IEStorage";
}

// uu.Class.IEStorage.isReady - static method
uu.Class.IEStorage.isReady = function() { // @return Boolean
    return uu.ie;
};
//}}}!mb

// --- CookieStorage ---
function cookieStorageInit(callback) { // @param Function(= void): callback
    this._secure = location.protocol === "https:" ? "; secure" : "";
    this._removeDate = (new Date(0)).toUTCString();
    this._shadowCookie = this.retrieve();

    callback && callback(this);
}

function cookieStorageKey(index) { // @param Number:
                                   // @return String: "key" or ""
    return uu.hash.nth(this._shadowCookie, index)[0] || "";
}

function cookieStorageSize() { // @return Hash: { used, max }
                               //    used - Number: bytes
                               //    max  - Number: bytes
    return { used: doc.cookie.length, max: _cookieDiskSpace };
}

function cookieStorageClear() {
    this.store(this._shadowCookie, this._removeDate);
    this._shadowCookie = {};
}

function cookieStorageGetItem(key) { // @param String:
                                     // @return String: "value" or ""
    return this._shadowCookie[key] || "";
}

function cookieStorageSetItem(key,     // @param String:
                              value) { // @param String:
                                       // @return Boolean: false is quota exceeded
    var before = doc.cookie.length;

    if (before > _cookieDiskSpace) {
        return _false;
    }

    if (before) {
        before += 2; // "; ".length
    }
    before += this.store(uu.hash(key, value), _persistDate);

    if (before !== doc.cookie.length) { // before !== after -> !damage!
        return _false;
    }
    this._shadowCookie[key] = value;
    return _true;
}

function cookieStorageGetLength() { // @return Number: pairs
    return uu.hash.size(this._shadowCookie);
}

function cookieStorageRemoveItem(key) { // @param String:
    this.store(uu.hash(key, ""), this._removeDate);
    delete this._shadowCookie[key];
}

function cookieStorageGetAllItems() { // @return Hash: { key: "value", ... }
    return this._shadowCookie;
}

function cookieStorageRetrieve() { // @return Hash: { key: "value", ... }
    var rv = {}, i = -1, pairs, pair, kv, cut = _storeName.length;

    if (doc.cookie) {

        // retrieve KeyValue pairs
        //      collect: "{{_storeName}}key=value"
        //      ignore:  "key=value"
        //
        pairs = doc.cookie.split("; ");

        while ( (pair = pairs[++i]) ) {
            kv = pair.split("="); // ["{{_storeName}}key", "value"]

            if (!kv[0].indexOf(_storeName)) {
                rv[kv[0].slice(cut)] = decodeURIComponent(kv[1] || "");
            }
        }
    }
    return rv;
}

function cookieStorageStore(hash,   // @param Hash:
                            date) { // @param UTCDateString:
                                    // @return Number: last KeyValue pair length
    var rv = "", key;

    for (key in hash) {
        rv = _storeName + key + "=" + encodeURIComponent(hash[key]);

        // store cookie
        doc.cookie = rv + "; expires=" + date + this._secure;
    }
    return rv.length;
}

function cookieStorageToString() {
    return "CookieStorage";
}

// uu.Class.CookieStorage.isReady - static method
uu.Class.CookieStorage.isReady = function() { // @return Boolean
    return !!navigator.cookieEnabled;
};

// --- MemStorage ---
function memStorageInit(callback) { // @param Function(= void): callback
    this.so = {};

    callback && callback(this);
}

function memStorageKey(index) { // @param Number:
                                // @return String: "key" or ""
    return uu.hash.nth(this.so, index)[0] || "";
}

function memStorageSize() { // @return Hash: { used, max }
                            //    used - Number: bytes
                            //    max  - Number: bytes
    return { used: 0, max: Number.MAX_VALUE };
}

function memStorageClear() {
    this.so = {};
}

function memStorageGetItem(key) { // @param String:
                                  // @return String: "value" or ""
    return this.so[key] || "";
}

function memStorageSetItem(key,     // @param String:
                           value) { // @param String:
                                    // @return Boolean: false is quota exceeded
    this.so[key] = value;
    return _true;
}

function memStorageGetLength() { // @return Number: pairs
    return uu.hash.size(this.so);
}

function memStorageRemoveItem(key) { // @param String:
    delete this.so[key];
}

function memStorageGetAllItems() { // @return Hash: { key: "value", ... }
    return this.so;
}

function memStorageToString() {
    return "MemStorage";
}

// uu.Class.MemStorage.isReady - static method
uu.Class.MemStorage.isReady = function() { // @return Boolean
    return _true;
};

})(window, document, uu);
