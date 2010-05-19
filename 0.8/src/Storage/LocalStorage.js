
// === uu.Class.LocalStorage (WebStorage) ===
//{{{!depend uu, Storage
//}}}!depend

// WebStorage: http://www.w3.org/TR/webstorage/#storage
//   IE8 spec: http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx

uu.Class.LocalStorage || (function(uu) {

var _diskSpace = uu.ver.iphone ? 2.5   * 1024 * 1024 - 260 // iPhone3.1.2 (2.5MB)
               : uu.ver.chrome ? 2.5   * 1024 * 1024 - 260 // Chrome4+    (2.5MB)
               : uu.ver.safari ? 8     * 1024 * 1024       // Safari4+    (8.0MB)
               : uu.webkit     ? 2.5   * 1024 * 1024 - 260 // WebKit      (2.5MB)
//{{{!mb
               : uu.gecko      ? 5     * 1024 * 1024 - 260 // Firefox3.5+ (5.0MB)
               : uu.opera      ? 1.875 * 1024 * 1024 - 128 // Opera10.50  (1.875MB)
               : uu.ie         ? 5     * 1000 * 1000       // IE8+        (4.768MB)
//}}}!mb
               : 0,
    _inherit = uu.Class.Storage.prototype;

uu.Class.singleton("LocalStorage", {
    init:           init,
    key:            _inherit.key,
    size:           size,
    clear:          _inherit.clear,
    getItem:        _inherit.getItem,
    setItem:        setItem,
    getLength:      getLength,
    removeItem:     _inherit.removeItem,
    getAllItems:    getAllItems,
    toString:       toString,
    save:           _inherit.save,
    load:           _inherit.load
});

function init(callback) { // @param Function(= void): callback
    this.storage = window.localStorage;

    callback && callback(this);
}

function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    var used = 0, i = 0, iz, remain;

//{{{!mb
    if (uu.ie && "remainingSpace" in this.storage) { // [IE8][IE9] storage.remainingSpace

        remain = this.storage.remainingSpace;

        if (_diskSpace < remain) { // expand free space
            _diskSpace = 5 * 1000 * 1000; // 5MB
        }
        return { used: _diskSpace - remain, max: _diskSpace };
    }
//}}}!mb
    for (iz = this.storage.length; i < iz; ++i) {
        used += this.storage.getItem(this.storage.key(i)).length;
    }
    return { used: used, max: _diskSpace };
}

function setItem(key,     // @param String:
                 value) { // @param String:
                          // @return Boolean: false is quota exceeded
    try {
        // pre clear
        //  [iPhone][FIX] http://d.hatena.ne.jp/uupaa/2010/01/05
        this.storage[key] = "";
        this.storage[key] = value;
    } catch(err) { // catch Error("QUOTA_EXCEEDED_ERR")
        uu.log(err.message);
        return false;
    }

    // verify
    return this.storage[key] === value;
}

function getLength() { // @return Number: pairs
    return this.storage.length;
}

function getAllItems() { // @return Hash: { key: "value", ... }
    var rv = {}, key, index = 0, iz = this.storage.length;

    for (; index < iz; ++index) {
        key = this.storage.key(index);
        rv[key] = this.storage.getItem(key);
    }
    return rv;
}

function toString() {
    return "LocalStorage";
}

// uu.Class.LocalStorage.isReady - static method
uu.Class.LocalStorage.isReady = function() { // @return Boolean
    return !!window.localStorage;
};

})(uu);

