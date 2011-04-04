// runs and client side environment detection
//#include("runs.js")

// user agent strings - http://code.google.com/p/uupaa-js/wiki/UserAgent
// Titanium.Platform - http://code.google.com/p/uupaa-js/wiki/TitaniumPlatform

(function(global,     // @param GlobalObject:
          lib,        // @param LibraryRootObject/undefined:
          document) { // @param DocumentObject/undefined:

var _ident      = lib.runs.ident,
    _os         = lib.runs.os,
    _jit        = false,
    _lang       = "en",
    _secure     = false,
    _ie         = false,    // IE6+
    _gecko      = false,
    _opera      = false,
    _chrome     = false,
    _safari     = false,
    _webkit     = false,
    _netfront   = false,
    _engine     = 0,        // Browser Engine
    _version    = 0,        // Browser Version
    _longEdge   = 0,        // device long edge
    _touch      = false,
    _retina     = false,
    _iphone     = false,    // iPhone3+, iPod
    _iphone3    = false,    // iPhone3
    _iphone4    = false,    // iPhone4
    _ipad       = false,    // iPad1, iPad2
    _ie6        = false,
    _ie7        = false,
    _ie8        = false,
    _ie9        = false,
    _ie678      = false;

//{@node
//{@ti
if (lib.runs.browser) {
    (document.documentID         ? (_ie       = true) :
     /netfront/i.test(_ident)    ? (_netfront = true) :
     /playstation/i.test(_ident) ? 0 :
     global.opera                ? (_opera    = true) :
     global.netscape             ? (_gecko    = true) :
     /WebKit/.test(_ident)       ? (_webkit   = true) : 0);

    _version = parseFloat(
                    _ident.split(/MSIE |Version\/|Firefox\/|Chrome\//)[1]);
    _engine  = parseFloat(
                    _ident.split(/Trident\/|Presto\/|rv\:\/|AppleWebKit\//)[1]);

    if (_ie) { // IE version re-detection
        _version = global.WebSocket ? 10 :
                   global.getComputedStyle ? 9 :
                   global.document.documentMode === 8 ? 8 :
                   global.XMLHttpRequest ? 7 : 6;
        _ie6 = _version === 6;
        _ie7 = _version === 7;
        _ie8 = _version === 8;
        _ie9 = _version === 9;
        _ie678 = _ie6 || _ie7 || _ie8;
    }

    if (_webkit) {
        (/Chrome/.test(_ident) ? (_chrome = true)
                               : (_safari = true));
    }

    _jit = (_ie     && _version >= 9)    || // IE 9+
           (_gecko  && _engine  >= 1.91) || // Firefox 3.5+(Geko 1.91+)
           (_webkit && _engine  >= 528)  || // Safari 4+, Google Chrome 2+
           (_opera  && _version >= 10.5);   // Opera 10.50+
    ((_os.ios || _os.android) && (_jit = false));

    // "en-us" -> "en"
    _lang = (global.navigator.language ||
             global.navigator.browserLanguage).split("-", 1)[0];

    // iOS has window.Touch
    _touch = _os.ios || _os.android || !!global.Touch;
    _secure = global.location.protocol === "https:";

    if (_os.ios) {
        if (global.navigator.platform === "iPad") {
            _ipad = true;
        } else {
            _iphone = true;
            if (global.devicePixelRatio >= 2) {
                _retina = true;
                _iphone4 = true;
            } else {
                _iphone3 = true;
            }
        }
    }

    if (_os.ios) {
        _longEdge = Math.max(global.screen.width, global.screen.height);
    } else if (_ie && _version < 9) {
        _longEdge = Math.max(document.documentElement.clientWidth,
                             document.documentElement.clientHeight);
    } else {
        _longEdge = Math.max(global.innerWidth, global.innerHeight);
    }
}
//}@ti
//}@node

// --- export ---
// client side environment
lib.env = {
    jit:        _jit,       // Boolean: IE9+, Firefox 3.5+ (Gecko 1.91), Safari 4+, Chrome 2+, Opera 10.50+
    lang:       _lang,      // String: Lang
    secure:     _secure,    // Boolean: SSL
    ie:         _ie,        // Boolean: IE 6+
    ie6:        _ie6,       // Boolean: IE 6
    ie7:        _ie7,       // Boolean: IE 7
    ie8:        _ie8,       // Boolean: IE 8
    ie9:        _ie9,       // Boolean: IE 9
    ie678:      _ie678,     // Boolean: IE 6 / IE 7 / IE 8
    gecko:      _gecko,     // Boolean: Gecko Based Browser. Firefox, ...
    opera:      _opera,     // Boolean: Opera Based Browser. Opera Mini, Opera Mobile
    chrome:     _chrome,    // Boolean: Chrome Based Browser. Google Chrome, ChromeLite(Android)
    safari:     _safari,    // Boolean: Safari Based Browser. Safari, MobileSafari(iOS), ...
    webkit:     _webkit,    // Boolean: WebKit Based Browser. Chrome, Safari, MobileSafari, ChromeLite
    engine:     _engine,    // Number: Engine Version. Gecko(2), WebKit(534.13), Trident(5), Presto(2.7)
    version:    _version,   // Number: Browser Version. IE(9), Firefox(4), Chrome(11), Opera(11), Safari(5)
    touch:      _touch,     // Boolean: iOS, Android, Chrome OS
    iphone:     _iphone,    // Boolean: iPhone
    iphone3:    _iphone3,   // Boolean: iPhone3
    iphone4:    _iphone4,   // Boolean: iPhone4
    ipad:       _ipad,      // Boolean: iPad
    retina:     _retina,    // Boolean: Retina Display. iPhone5, iPod touch
    longEdge:   _longEdge   // Number: device long edge (w:800 x h:600) -> 800
};

})(this, this.uu || this, this.document);

