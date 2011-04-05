// environment detection

// see: user agent strings - http://code.google.com/p/uupaa-js/wiki/UserAgent
// see: Titanium.Platform - http://code.google.com/p/uupaa-js/wiki/TitaniumPlatform

(function(global,     // @param GlobalObject:
          lib,        // @param LibraryRootObject/undefined:
          document) { // @param DocumentObject/undefined:

var _ios        = 0,        // Number: iOS Version
    _mac        = 0,        // Number: Mac OS X Version
    _cros       = 0,        // Number: Chrome OS Version
    _unix       = 0,        // Number: Unix OS Version
    _android    = 0,        // Number: Android OS Version
    _windows    = 0,        // Number: Windows OS Version
    _nodejs     = false,    // Boolean: runs Node.js
    _worker     = false,    // Boolean: runs WebWorkers
    _browser    = false,    // Boolean: runs Browser
    _titanium   = false,    // Boolean: runs Titanium
    _secure     = false,    // Boolean: SSL
    _jit        = false,    // Boolean: JIT
    _lang       = "en",     // String: Browser Language
    _ident      = "",       // String: UserAgent String
    _ie         = 0,        // Number: IE Version
    _gecko      = 0,        // Number: Gecko Engine Version
    _opera      = 0,        // Number: Opera Version
    _chrome     = 0,        // Number: Chrome Version
    _safari     = 0,        // Number: Safari Version
    _webkit     = 0,        // Number: WebKit Engine Version
    _netfront   = 0,        // Number: NetFront Engine Version
    _longedge   = 0,        // Number: device long edge (w:800 x h:600) -> 800
    _retina     = false,    // Boolean: Retina display
    _iphone     = false,    // Boolean: iPhone or iPod
    _ipad       = false;    // Boolean: iPad

// --- detect runs ---
if (document && global.location) {
    _browser = true;
    _ident = global.navigator.userAgent;
} else if (global.self && global.self.importScripts) {
    _worker = true;
    _ident = global.navigator.userAgent;
} else if (global.Titanium) {
    _titanium = true;
    _ident = global.Titanium.userAgent;
} else if (global.require && global.process) {
    _nodejs = true;
}

//{@node
//{@ti
// --- detect os ---
if (_browser || _worker) {
    if (/Win/.test(_ident)) {
        _windows = parseFloat(_ident.split(/Windows NT /)[1]) || 1;
    } else if (/iPhone|iP[ao]d/i.test(_ident)) {
        _ios = parseFloat(_ident.split(/OS /)[1].replace("_", ".")) || 1;
    } else if (/Mac/.test(_ident)) {
        _mac = parseFloat(_ident.split(/Mac OS X /)[1].replace("_", ".")) || 1;
    } else if (/Android/i.test(_ident)) {
        _android = parseFloat(_ident.split(/Android /)[1]) || 1;
    } else if (/CrOS/.test(_ident)) {
        _cros = 1; // TODO
    } else if (/X11|Linux/.test(_ident)) {
        _unix = 1;
    }
}
//}@ti
//}@node

//{@node
//{@ti
// --- detect browser environment ---
if (_browser || _worker) {
    if (document.documentID) {
        _ie = global.WebSocket ? 10 :
              global.getComputedStyle ? 9 :
              document.documentMode === 8 ? 8 :
              global.XMLHttpRequest ? 7 : 6;
    } else if (global.netscape) {
        _gecko = parseFloat(_ident.split(/rv\:\//)[1]);
    } else if (/WebKit/.test(_ident)) {
        _webkit = parseFloat(_ident.split(/AppleWebKit\//)[1]);
        if (/Chrome/.test(_ident)) {
            _chrome = parseFloat(_ident.split(/Chrome\//)[1]);
        } else {
            _safari = parseFloat(_ident.split(/Version\//)[1]);
        }
    } else if (global.opera) {
        _opera = parseFloat(global.opera.version());
    } else if (/netfront/i.test(_ident)) {
        _netfront = parseFloat(_ident.split(/NetFront\//)[1]);
    }

    if (/iPhone|iPod/.test(_ident)) {
        _iphone = true;
    } else if (/iPad/.test(_ident)) {
        _ipad = true;
    }
    if (_ios) {
        _retina = (global.devicePixelRatio || 1) >= 2;
    }

    _jit = (_ie     >= 9)    || // IE 9+
           (_gecko  >= 1.91) || // Firefox 3.5+(Geko 1.91+)
           (_webkit >= 528)  || // Safari 4+, Google Chrome 2+
           (_opera  >= 10.5);   // Opera 10.50+
    ((_ios || _android) && (_jit = false));

    // "en-us" -> "en"
    if (global.navigator) {
        _lang = (global.navigator.language ||
                 global.navigator.browserLanguage || "").split("-", 1)[0];
    }

    if (global.location) {
        _secure = global.location.protocol === "https:";
    }

    if (global.screen && global.screen.width) {
        _longEdge = Math.max(global.screen.width, global.screen.height);
    } else if (_ie && _ie < 9 && document.documentElement) {
        _longEdge = Math.max(document.documentElement.clientWidth,
                             document.documentElement.clientHeight);
    } else if (global.innerWidth) {
        _longEdge = Math.max(global.innerWidth, global.innerHeight);
    }
}
//}@ti
//}@node

// --- export ---
lib.env = {
    ios:        _ios,       // Number: iOS Version
    mac:        _mac,       // Number: Mac OS X Version
    cros:       _cros,      // Number: Chrome OS Version
    unix:       _unix,      // Number: Unix OS Version
    android:    _android,   // Number: Android OS Version
    windows:    _windows,   // Number: Windows OS Version
    nodejs:     _nodejs,    // Boolean: runs Node.js
    worker:     _worker,    // Boolean: runs WebWorkers
    browser:    _browser,   // Boolean: runs Browser
    titanium:   _titanium,  // Boolean: runs Titanium
    secure:     _secure,    // Boolean: SSL
    jit:        _jit,       // Boolean: JIT
    lang:       _lang,      // String: Language. "en", "ja"
    ident:      _ident,     // String: UserAgent String
    ie:         _ie,        // Number: IE Version
    gecko:      _gecko,     // Number: Gecko Engine Version
    opera:      _opera,     // Number: Opera Version
    chrome:     _chrome,    // Number: Chrome Version
    safari:     _safari,    // Number: Safari Version
    webkit:     _webkit,    // Number: WebKit Engine Version
    netfront:   _netfront,  // Number: NetFront Engine Version
    longedge:   _longedge,  // Number: device long edge (w:800 x h:600) -> 800
    retina:     _retina,    // Boolean: Retina display
    iphone:     _iphone,    // Boolean: iPhone
    ipad:       _ipad,      // Boolean: iPad
    flash:      0,          // Number: FlashPlayer Version(9+)
    silver:     0           // Number: Silverlight Version(3+)
};

//{@node
//{@ti
//{@mb

// inner - detect FlashPlayer version
function detectFlashPlayerVersion(minimumVersion) {
    var rv = 0, ver, match,
        ie = !!global.ActiveXObject;

    try {
        ver = ie ? (new global.ActiveXObject("ShockwaveFlash.ShockwaveFlash")).
                    GetVariable("$version").replace(/,/g, ".")
                 : global.navigator.plugins["Shockwave Flash"].description;
        match = /\d+\.\d+/.exec(ver);
        rv = match ? parseFloat(match[0]) : 0;
    } catch(err) {}
    return rv < minimumVersion ? 0 : rv;
}

// inner - detect Silverlight version
function detectSilverlightVersion(minimumVersion) {
    var rv = 0, obj, check = minimumVersion,
        ie = !!global.ActiveXObject;

    try {
        obj = ie ? new global.ActiveXObject("AgControl.AgControl")
                 : global.navigator.plugins["Silverlight Plug-In"];
        if (ie) {
            // try "3.0" -> "4.0" -> "5.0" ...
            while (obj.IsVersionSupported(check + ".0")) {
                rv = check++;
            }
        } else {
            rv = parseInt(/\d+\.\d+/.exec(obj.description)[0], 10);
        }
    } catch(err) {}
    return rv < minimumVersion ? 0 : rv;
}

// --- detect plugin ---
if (_browser) {
    lib.env.flash = detectFlashPlayerVersion(9);
    lib.env.silver = detectSilverlightVersion(3);
}

//}@mb
//}@ti
//}@node

})(this, this.uu || this, this.document);

