
// === uu.Class.FlashStorage ===
//{{{!depend uu, Storage
//}}}!depend

//{{{!mb

uu.Class.FlashStorage || (function(uu) {

var _swfPath = uu.config.baseDir + "uu.storage.swf",
    _already = null;

uu.Class.singleton("FlashStorage", {
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

    this.storage = uu.flash(_swfPath, {
                        id:     OBJECT_ID,
                        width:  1,
                        height: 1
                   });
}

function key(index) { // @param Number:
                      // @return String: "key" or ""
    return this.storage.ex_key(index);
}

function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    return this.storage.ex_size();
}

function clear() {
    this.storage.ex_clear();
}

function getItem(key) { // @param String:
                        // @return String: "value" or ""
    return this.storage.ex_getItem(key);
}

function setItem(key,     // @param String:
                 value) { // @param String:
                          // @return Boolean: false is quota exceeded
    return this.storage.ex_setItem(key, value);
}

function getLength() { // @return Number: pairs
    return this.storage.ex_getLength();
}

function removeItem(key) { // @param String:
    this.storage.ex_removeItem(key);
}

function getAllItems() { // @return Hash: { key: "value", ... }
    return this.storage.ex_getAllItems();
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
    return "FlashStorage";
}

// uu.Class.FlashStorage.isReady - static method
uu.Class.FlashStorage.isReady = function() { // @return Boolean
    if (_already === null) {
        _already = uu.ver.flash && uu.file(_swfPath).ok;
    }
    return _already;
};

})(uu);

//}}}!mb

