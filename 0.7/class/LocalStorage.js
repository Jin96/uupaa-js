// === LocalStorage ===
//{{{!depend uu, uu.class
//}}}!depend

// WebStorage: http://www.w3.org/TR/webstorage/#storage
//   IE8 spec: http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx

uu.Class.LocalStorage || (function(win, doc, uu) {
var _FREE_SPACE = ((uu.gecko      ? 4.9 // Firefox3.5(5MB), Firefox3.6(4.9MB)
                :   uu.ver.iphone ? 2.4 // iPhone3.1.2(Safari4+)
                :   uu.ver.safari ? 8.0 // Safari4+
                :   uu.ver.chrome ? 2.4 // Chrome4+
                :   uu.webkit     ? 2.4 // WebKit
                :   uu.opera      ? 2.4 // Opera10.50
                :   uu.ie         ? 2.2 // IE8+
                :   0) * 1024 * 1024) | 0;

uu.Class.singleton("LocalStorage", {
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

// uu.Class.LocalStorage.isReady - static method
uu.Class.LocalStorage.isReady = function() { // @return Boolean
    return !!win.localStorage;
};

// LocalStorage.init
function init(callback) { // @param Function(= void): callback
    this.storage = win.localStorage;

    callback && callback();
}

// LocalStorage.nth - get nth key
function nth(index) { // @param Number:
                      // @return String: "key" or ""
    return this.storage.key(index) || ""; // return null is W3C spec
}

// LocalStorage.get - get value
function get(key) { // @param String:
                    // @return String: "value" or ""
    return this.storage[key] || ""; // return null is W3C spec
}

// LocalStorage.getAll
function getAll() { // @return Hash: { key: "value", ... }
    var rv = {}, key, index = 0, iz = this.storage.length;

    for (; index < iz; ++index) {
        key = this.storage.key(index);
        rv[key] = this.storage.getItem(key);
    }
    return rv;
}

// LocalStorage.set
function set(key,     // @param String:
             value) { // @param String:
                      // @return Boolean: false is quota exceeded
    try {
        // pre clear
        //  [iPhone][FIX] http://d.hatena.ne.jp/uupaa/2010/01/05
        this.storage[key] = "";
        this.storage[key] = value;
    } catch(err) { // catch Error("QUOTA_EXCEEDED_ERR")
        return false;
    }

    // verify
    return _storage[key] === value;
}

// LocalStorage.size
function size() { // @return Hash: { used, max }
                  //    used - Number: bytes
                  //    max  - Number: bytes
    var used = 0, i = 0, iz,
        remain = this.storage.remainingSpace; // [IE8+]

    if (remain != null) { // [IE8+]
        return { used: _FREE_SPACE - remain, max: _FREE_SPACE };
    }
    for (iz = this.storage.length; i < iz; ++i) {
        used += this.storage.getItem(this.storage.key(i)).length;
    }
    return { used: used, max: _FREE_SPACE };
}

// LocalStorage.pairs
function pairs() { // @return Number: pairs
    return this.storage.length;
}

// LocalStorage.clear
function clear() {
    this.storage.clear();
}

// LocalStorage.remove
function remove(key) { // @param String: key
    this.storage.removeItem(key);
}

})(window, document, uu);

