// === FlashStorage ===
//{{{!depend uu, uu.class, uu.flash
//}}}!depend

uu.Class.FlashStorage || (function(win, doc, uu) {

var _ID = "externalflashstorage",
    _SWF_PATH = uu.config.baseDir + "uu.storage.swf";

uu.Class.singleton("FlashStorage", {
    init:           init,       // init(callback:Function = void)
    nth:            nth,        // nth(index:Number):String
    get:            get,        // get(key:String):String
    set:            set,        // set(key:String, value:String):Boolean
    size:           size,       // size():Hash { used, max }
    pairs:          pairs,      // pairs():Number
    clear:          clear,      // clear()
    remove:         remove,     // remove(key:String)
    getAll:         getAll      // getAll():Hash
});

// uu.Class.FlashStorage.isReady - static method
uu.Class.FlashStorage.isReady = function() { // @return Boolean
    return uu.ver.as3 && uu.require(_SWF_PATH).ok;
};

// FlashStorage.init
function init(callback) { // @param Function(= void): callback
    // wait for response from flash initializer
    function flashStorageReadyCallback() {
        setTimeout(function() {
            uu.dmz[_ID] = null;
            callback && callback();
        }, 0);
    }

    uu.dmz[_ID] = flashStorageReadyCallback;

    this.storage = uu.flash(_SWF_PATH, {
                        id: _ID,
                        param: [
//                          "allowScriptAccess", "always"
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

})(window, document, uu);

