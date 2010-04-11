// === FlashStorage ===
//{{{!depend uu, uu.class, uu.flash, uu.Class.Storage
//}}}!depend

//{{{!mb

uu.Class.FlashStorage || (function(win, doc, uu) {

var _SWF_PATH = uu.config.baseDir + "uu.storage.swf",
    _already = null;

uu.Class.singleton("FlashStorage", {
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

// uu.Class.FlashStorage.isReady - static method
uu.Class.FlashStorage.isReady = function() { // @return Boolean
    if (_already === null) {
        _already = uu.ver.as3 && uu.require(_SWF_PATH).ok;
    }
    return _already;
};

// FlashStorage.init
function init(callback) { // @param Function(= void): callback
    var that = this,
        OBJECT_ID = "externalflashstorage";

    // wait for response from flash initializer
    function flashStorageReadyCallback() {
        setTimeout(function() {
            uu.dmz[OBJECT_ID] = null;
            callback && callback(that);
        }, 0);
    }

    uu.dmz[OBJECT_ID] = flashStorageReadyCallback;

    this.storage = uu.flash(_SWF_PATH, {
                        id:     OBJECT_ID,
                        width:  1,
                        height: 1,
                        param:  [
//                            "loop", "false",
//                            "menu", "false",
//                            "play", "true",
//                            "scale", "noScale",
//                            "wmode", "transparent",
//                            "allowFullscreen", "false",
//                            "allowScriptAccess", "sameDomain",
//                            "allowScriptAccess", "always"
                        ]
                   });
}

// FlashStorage.nth - get nth key
function nth(index) { // @param Number: index
                      // @return String: "key" or ""
    return this.storage.ex_nth(index);
}

// FlashStorage.get - get value
function get(key) { // @param String: key
                    // @return String: "value" or ""
    return this.storage.ex_get(key);
}

// FlashStorage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    return this.storage.ex_getAll();
}

// FlashStorage.set
function set(key,     // @param String:
             value) { // @param String:
                      // @return Boolean: false is quota exceeded
    return this.storage.ex_set(key, value);
}

// FlashStorage.size
function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return this.storage.ex_size();
}

// FlashStorage.pairs
function pairs() { // @return Number: pairs
    return this.storage.ex_pairs();
}

// FlashStorage.clear
function clear() {
    this.storage.ex_clear();
}

// FlashStorage.remove
function remove(key) { // @param String: key
    this.storage.ex_remove(key);
}

// FlashStorage.saveToServer
function saveToServer(url,        // @param String: url
                      option,     // @param AjaxOptionHash(= void):
                      callback) { // @param Function(= void): callback(AjaxResultHash)
    uu.Class.Storage.saveToServer(this, url, option, callback);
}

// FlashStorage.loadFromServer
function loadFromServer(url,        // @param String: url
                        option,     // @param JSONPOptionHash:
                        callback) { // @param Function(= void): callback(JSONPResultHash)
    uu.Class.Storage.loadFromServer(this, url, option, callback);
}

// FlashStorage.toString
function toString() {
    return "FlashStorage";
}

})(window, document, uu);

//}}}!mb

