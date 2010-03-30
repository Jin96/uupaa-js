
// === Storage ===
//{{{!depend uu, uu.flash
//}}}!depend

// Web Storage:  http://www.w3.org/TR/webstorage/#storage
//         IE8:  http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx
//
uu.local || (function(win, doc, uu) {
var _db = 0,      // Storage object
    _dbwait = 0,  // 1: waiting
    _backend = 0, // Storage backend,
                  //     0: none
                  //     1: waiting...
                  //     2: Web Storage    (use localStorage)
                  //     3: DOM Storage    (use globalStorage)
                  //     4: Flash Storage  (use SharedObject)
                  //     5: IE Storage     (use IE userData behavior)
                  //     6: Cookie Storage (use Cookie)
    _persist = new Date(2032, 1, 1), // IEStorage, CookieStorage persist date
    _cookieReady = !!navigator.cookieEnabled,
    _localStorageMax = uu.gecko      ? 4.9 // Firefox3.5(5MB), Firefox3.6(4.9MB)
                     : uu.ver.iphone ? 2.4 // iPhone3.1.2(Safari4+)
                     : uu.ver.safari ? 8.0 // Safari4+
                     : uu.ver.chrome ? 2.4 // Chrome4+
                     : uu.webkit     ? 2.4 // WebKit
                     : uu.opera      ? 2.4 // Opera10.50
                     : uu.ie         ? 2.2 // IE8+
                     : 0,
    _useWebStorage    = win.localStorage  ? 1 : 0,
//  _useDOMStorage    = win.globalStorage ? 1 : 0,
    _useFlashStorage  = uu.ver.flash > 7 && uu.config.flash ? 1 : 0,
    _useIEStorage     = uu.ie             ? 1 : 0,
    _useCookieStorage = _cookieReady      ? 1 : 0,
    _AS_NULL_TRAP     = "UU_NULL_TRAP__",
    _IE_DELIMITER     = "UU_DELIM__";

uu.mix(uu, {
    // --- Cookie ---
    // [1][get all] uu.cookie() -> { key: "val", ... }
    // [2][get one] uu.cookie("key") -> "val"
    // [3][set]     uu.cookie("key", "val", safe = 0, option = {})
    cookie: uu.mix(uucookie, {
        get:        uucookieget,    // uu.cookie.get("key") -> "val"
        set:        uucookieset,    // uu.cookie.set("key", "val", safe = 0, option = {}) -> Boolean
        size:       uucookiesize,   // uu.cookie.size() -> { use, max, free } (bytes)
        pairs:      uucookiepairs,  // uu.cookie.pairs() -> Number(pairs)
        clear:      uucookieclear,  // uu.cookie.clear()
        ready:      uucookieready,  // uu.cookie.ready() -> Boolean
        remove:     uucookieremove  // uu.cookie.remove("key")
    }),
    // --- Web Storage ---
    // [1][get all] uu.local() -> { key: "val", ... }
    // [2][get one] uu.local("key") -> "val"
    // [3][set]     uu.local("key", "val", safe = 0) -> Boolean
    local: uu.mix(uulocal, {
        nth:        uulocalnth,     // uu.local.nth(n) -> "key"
        get:        uulocalget,     // uu.local.get("key") -> "val"
        set:        uulocalset,     // uu.local.set("key", "val", safe = 0) -> Boolean
        size:       uulocalsize,    // uu.local.size() -> { use, max, free } (bytes)
        pairs:      uulocalpairs,   // uu.local.pairs() -> Number(pairs)
        clear:      uulocalclear,   // uu.local.clear()
        ready:      uulocalready,   // uu.local.ready() -> Boolean
        remove:     uulocalremove,  // uu.local.remove("key")
        backend:    uulocalbackend  // uu.local.backend() -> Number(0~6)
    })
});

// --- Cookie ---
// uu.cookie - cookie accessor
// [1][get all] uu.cookie() -> { key: "val", ... }
// [2][get one] uu.cookie("key") -> "val"
// [3][set]     uu.cookie("key", "val", safe = 0, option = {})
function uucookie(a, b, c, d) { // @return Hash/String/void 0:
    return a === void 0 ? _uucookiegetall()
        : (b === void 0 ? _uucookiegetall : uucookieset)(a, b, c, d);
}

// uu.cookie.get - retrieve cookie
function uucookieget(key) { // @param String: "key"
                            // @return String/null: "val" or null
    return _uucookiegetall()[key];
}

// inner - get all cookies
function _uucookiegetall(prefix) { // @hidden String(= void 0): prefix filter
    var rv = {}, i = -1, pair, ary, kv, k, v,
        pfx = prefix || "", pz = pfx.length;

    if (_cookieReady && doc.cookie) {
        pair = doc.cookie.split("; ");

        while ( (kv = pair[++i]) ) {
            ary = kv.split("=");
            k = ary[0];
            v = decodeURIComponent(ary[1] == null ? "" : ary[1]);
            if (pfx) {
                !k.indexOf(pfx) && (rv[k.slice(pz)] = v);
            } else {
                rv[k] = v;
            }
        }
    }
    return rv;
}

// uu.cookie.set - store cookie
function uucookieset(key,      // @param String: "key"
                     val,      // @param String: "val"
                     safe,     // @param Number(= 0): 1 is safe(but slowly)
                               //                     0 is unsafe(speedy)
                     option,   // @param Hash(= {}): { domain, path, maxage }
                               //   maxage - Number/Date: 2 -> +2 days
                               //                         new Date(2010,1,1) -> expire 2010/1/1
                               //   domain - String(= ""):
                               //   path   - String(= ""):
                     remove) { // @hidden Boolean: true is remove cookie
                               // @return Boolean: false is fail
    if (_cookieReady) {
        var rv = [], opt = option || {}, age = opt.maxage, n;

        rv.push(key + "=" + encodeURIComponent(val));
        if (!remove) {
            // judge limit
            n = rv[0].length + doc.cookie.length;
            if (n > 3800) { // [!] threshold 3800byte
                return false;
            }
        }
        opt.domain && rv.push("domain=" + opt.domain);
        opt.path   && rv.push("path="   + opt.path);
        if (age !== void 0) {
            rv.push("expires=" +
                    (uu.isNumber(age) ? new Date((+new Date) + age * 86400000)
                                      : age).toUTCString());
        }
        (location.protocol === "https:") && rv.push("secure");
        doc.cookie = rv.join("; "); // store
        if (!remove) {
            // safe -> verify
            if (safe && !val) {
                if (_uucookiegetall(key) !== val) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}

// uu.cookie.size
function uucookiesize() { // @return Array: { use, max, free }
    if (_cookieReady && doc.cookie) {
        var n = doc.cookie.length, max = 3800; // [!] threshold 3800byte

        return { use: n, max: max, free: Math.max(max - n, 0) };
    }
    return { use: -1, max: -1, free: 0 };
}

// uu.cookie.pairs
function uucookiepairs() { // @return Number: pairs
    return uu.hash.size(_uucookiegetall("uustorage"));
}

// uu.cookie.clear - clear cookie
function uucookieclear(prefix) { // @hidden String(= ""): prefix filter
    for (var i in _uucookiegetall(prefix = prefix || "")) {
        uucookieremove(prefix + i);
    }
}

// uu.cookie.ready
function uucookieready() { // @return Boolean:
    return _cookieReady;
}

// uu.cookie.remove
function uucookieremove(key) { // @param String: "key"
    uucookieset(key, "", 0, { maxage: -1 }, 1); // remove
}

// --- Web Storage ---
// [1][get all] uu.local() -> { key: "val", ... }
// [2][get one] uu.local("key") -> "val"
// [3][set]     uu.local("key", "val", safe = 0) -> Boolean
function uulocal(a, b, c) { // @return String/Boolean:
    if (a === void 0) { // [1]
        var rv = {}, v, i = 0, iz;

        try {
            switch (_backend) {
            case 2: for (iz = _db.length; i < iz; ++i) {
                        v = _db.key(i);
                        rv[v] = _db.getItem(v);
                    }
                    break;
//{{{!mb
            case 4: rv = _flashall(); break;
            case 5: rv = _ieall(); break;
            case 6: rv = _uucookiegetall("uustorage");
//}}}!mb
            }
        } catch (err) {
            uu.config.debug && alert(err);
            rv = {};
        }
        return rv;
    }
    return (b === void 0 ? uulocalget : uulocalset)(a, b, c); // [2][3]
}

// uu.local.nth
function uulocalnth(nth) { // @param Number: index
                           // @return String: "key" or "" (unknown index)
    var rv, hash;

    try {
        switch (_backend) {
        case 2: rv = _db.key(nth); break;
//{{{!mb
        case 4: rv = _flashnth(nth); break;
        case 5: rv = _ienth(nth); break;
        case 6: hash = _uucookiegetall("uustorage");
                rv = uu.hash.nth(hash, nth)[0];
//}}}!mb
        }
    } catch(err) {
        uu.config.debug && alert(err);
        rv = "";
    }
    return rv == null ? "" : rv; // [HTML5 SPEC] throw INDEX_SIZE_ERR
}

// uu.local.get
function uulocalget(key) { // @param String: "key"
                           // @return String: "val" or "" (unknown key)
    var rv;

    try {
        if (key) {
            switch (_backend) {
            case 2: rv = _db[key]; break;
//{{{!mb
            case 4: rv = _flashget(key); break;
            case 5: rv = _ieget(key); break;
            case 6: rv = _uucookiegetall("uustorage")[key];
//}}}!mb
            }
        }
    } catch(err) {
        uu.config.debug && alert(err);
        rv = "";
    }
    return rv == null ? "" : rv; // [HTML5 SPEC] null
}

// uu.local.set
function uulocalset(key,    // @param String: "key"
                    val,    // @param String: "val"
                    safe) { // @param Number(= 0): safe mode,
                            //        1 is safe(but slowly), judge overflow
                            //        0 is unsafe(speedy), ignore overflow
                            // @return Boolean: false is fail
    if (!key) {
        return false;
    }
    var rv;

    try {
        switch (_backend) {
        case 2: _db[key] = ""; // [iPhone][FIX] http://d.hatena.ne.jp/uupaa/2010/01/05
                _db[key] = val;
                rv = !safe ? 1 : (_db[key] === val);
                break;
//{{{!mb
        case 4: rv = _flashset(key, val, safe); break;
        case 5: rv = _ieset(key, val, safe); break;
        case 6: rv = uucookieset("uustorage" + key, val,
                                 safe, { maxage: _persist });
//}}}!mb
        }
    } catch(err) {
        uu.config.debug && alert(err);
        rv = 0;
    }
    return !!rv;
}

// uu.local.backend - Storage backend
function uulocalbackend() { // @return Number: 0~6
    return _dbwait ? 1 : _backend;
}

// uu.local.size
function uulocalsize() { // @return Hash: { use, max, free }
    var n = 0, i = 0, iz, max;

    try {
        switch (_backend) {
        case 2: for (iz = _db.length; i < iz; ++i) {
                    n += _db.getItem(_db.key(i)).length;
                }
                max = (_localStorageMax * 1024 * 1024) | 0;
                if (max) {
                    return { use: n, max: max, free: Math.max(max - n, 0) };
                }
                break;
//{{{!mb
        case 4: return _db.flashstoragesize();
        case 5: return _iesize();
        case 6: return uucookiesize();
//}}}!mb
        }
    } catch(err) {
        uu.config.debug && alert(err);
    }
    return { use: -1, max: -1, free: 0 }; // unknown storage
}

// uu.local.pairs
function uulocalpairs() { // @return Number: pairs
    try {
        switch (_backend) {
        case 2: return _db.length;
//{{{!mb
        case 4: return _db.flashstoragepairs();
        case 5: return _ieindex().length;
        case 6: return uucookiepairs("uustorage");
//}}}!mb
        }
    } catch(err) {
        uu.config.debug && alert(err);
    }
    return 0;
}

// uu.local.clear
function uulocalclear() {
    try {
        switch (_backend) {
        case 2: _db.clear(); break;
//{{{!mb
        case 4: _db.flashstorageclear(); break;
        case 5: _ieclear(); break;
        case 6: uucookieclear("uustorage");
//}}}!mb
        }
    } catch(err) {
        uu.config.debug && alert(err);
    }
}

// uu.local.ready
function uulocalready() { // @return Boolean:
    return !!_backend;
}

// uu.local.remove
function uulocalremove(key) { // @param String: "key"
    if (key) {
        try {
            switch (_backend) {
            case 2: _db.removeItem(key); break;
//{{{!mb
            case 4: _db.flashstorageremove(key); break;
            case 5: _ieremove(key); break;
            case 6: uucookieremove("uustorage" + key);
//}}}!mb
            }
        } catch(err) {
            uu.config.debug && alert(err);
        }
    }
}

//{{{!mb --- IE Storage ---
function _ieinit() {
    var meta = uu.node("meta");

    doc.head.appendChild(meta);
    meta.addBehavior("#default#userData");
    meta.expires = _persist.toUTCString();
    return meta;
}
function _ieall() {
    var rv = {}, ary = _ieindex(), v, i = -1;

    while ( (v = ary[++i]) ) {
        rv[v] = _db.getAttribute(v) || "";
    }
    return rv;
}
function _ienth(nth) {
    return _ieindex()[nth];
}
function _ieget(key) {
    _db.load("uustorage");
    return _db.getAttribute(key);
}
function _ieset(key, val, safe) {
    var ary = _ieindex(), free;

    if (safe) {
        free = _iesize().free - (key.length * 2) // index-key + key
             - val.length;
        if (free < 0) {
            return 0;
        }
    }
    ary.push(key);
    _db.setAttribute(key, val);
    _iesaveindex(ary);
      // safe -> verify
    if (safe) {
        if (_db.getAttribute(key) !== val) {
            return 0;
        }
    }
    return 1;
}
function _iesize() {
    var ary, idx, v, i = -1, n = 0, max = 1024 * 63; // 63kB

    _db.load("uustorage");
    idx = _db.getAttribute("uulocalidx") || "";
    ary = idx ? idx.split(_IE_DELIMITER) : [];
    while ( (v = ary[++i]) ) {
        n += (_db.getAttribute(v) || "").length;
    }
    n += idx.length;
    return { use: n, max: max, free: max - n };
}
function _ieclear() {
    var ary = _ieindex(), v, i = -1;

    while ( (v = ary[++i]) ) {
        _db.removeAttribute(v);
    }
    _iesaveindex([]);
}
function _ieremove(key) {
    var ary = _ieindex(), i = 0;

    _db.removeAttribute(key);
    i = ary.indexOf(key);
    i >= 0 && ary.splice(i, 1);
    _iesaveindex(ary);
}
function _ieindex() {
    _db.load("uustorage");
    var idx = _db.getAttribute("uulocalidx");

    return idx ? idx.split(_IE_DELIMITER) : [];
}
function _iesaveindex(ary) {
    _db.setAttribute("uulocalidx", ary.join(_IE_DELIMITER));
    _db.save("uustorage");
}
//}}}!mb

//{{{!mb --- Flash Storage ---
uu.dmz.storageReadyCallback = flashStorageReadyCallback;

// uu.dmz.storageReadyCallback - callback from FlashStorage
function flashStorageReadyCallback(/* msg */) {
    _dbwait = 0;
    uu.dmz.storageReadyCallback = uu.nop;
    setTimeout(WebStorageReady, 0);
}
function _flashall() {
    var rv = {}, r = _db.flashstorageall(), i, v;

    for (i in r) {
        v = r[i];
        (v === _AS_NULL_TRAP) && (v = ""); // [!] restore null
        rv[i] = v;
    }
    return rv;
}
function _flashnth(nth) {
    var rv = _db.flashstoragenth(nth);

    return (rv !== _AS_NULL_TRAP) ? rv : null; // [!] restore null
}
function _flashget(key) {
    var rv = _db.flashstorageget(key);

    return (rv !== _AS_NULL_TRAP) ? rv : null; // [!] restore null
}
function _flashset(key, val, safe) {
    return _db.flashstorageset(key, val || _AS_NULL_TRAP, safe || 0); // [!] null trap
}
//}}}!mb

// --- open storage object ---
_dbwait = 1;
_useWebStorage ? _detected(win.localStorage, 0, 2)
               : _detectFlashStorage(); // next chain

function _detectFlashStorage() { // all
    if (_useFlashStorage) {
        uu.ready(function() {
            var url = uu.config.baseDir + "uu.storage.swf", div,
                obj = uu.id("externalflashstorage");

            if (obj) {
                _detected(obj, 0, 4); // already exists
            } else {
                // [IE][ignore] http://twitter.com/uupaa/status/7473790508
                uu.ajax(url, { ignore: 1 }, function() { // file stat
                    uu.body.appendChild(div = uu.div());
                    _detected(uu.flash(div, "externalflashstorage", url, 1, 1), 1, 4);
                }, function() {
                    _detectIEStorage(); // next chain
                });
            }
        }, 2); // 2: high(system)
    } else {
        _detectIEStorage(); // next chain
    }
}
function _detectIEStorage() { // IE6~IE8
    _useIEStorage ? _detected(_ieinit(), 0, 5)
                  : _detectCookieStorage(); // next chain
}
function _detectCookieStorage() { // all
    _useCookieStorage ? _detected(uucookie, 0, 6)
                      : _detected(0, void 0);
}
function _detected(db, wait, backend) {
    _db = db;
    _dbwait = wait;
    _backend = backend;

    if (_backend === 2 || _backend === 5 || _backend === 6) {
        setTimeout(WebStorageReady, 0);
    }
}

// inner - window.xlocal callback
function WebStorageReady() {
    uu.ready.gone.storage = 1;
    uu.isFunction(win.xlocal || 0) && win.xlocal(uu, _backend);
}

})(window, document, uu);

