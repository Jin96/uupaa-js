// runs and os detection
//
// export(global.uu.runs = {}) or export(global.runs = {})

(function(global, // @param GlobalObject:
          lib) {  // @param LibraryRootObject/undefined:

var _mac      = false,  // Boolean: Mac OS X
    _ios      = false,  // Boolean: iOS. iPhone, iPad, iPod
    _unix     = false,  // Boolean: Unix Based / Like OS
    _android  = false,  // Boolean: Android OS. Nexus One, ...
    _chromeos = false,  // Boolean: Chrome OS
    _windows  = false,  // Boolean: Windows OS
    _version  = 0,      // Number: OS Version (iOS / Android)
    _ident    = "",     // String: UserAgent String
    _nodejs   = false,  // Boolean: runs Node.js
    _worker   = false,  // Boolean: runs WebWorkers
    _browser  = false,  // Boolean: runs Browser
    _titanium = false;  // Boolean: runs Titanium

// --- detect runs ---
if (this.document && global.locate) { // Browser

    _browser = true;
    _ident = global.navigator.userAgent;

} else if (global.self &&
           global.self.importScripts) { // WebWorkers

    _worker = true;
    _ident = global.navigator.userAgent;

} else if (global.Titanium) { // Titanium

    _titanium = true;

    // "Appcelerator Titanium/1.6.1" +
    // " (iPhone Simurator/4.3; iPhone OS; en_US;)"
    _ident = global.Titanium.userAgent;

} else if (global.require &&
           global.process) { // Node.js

    _nodejs = true;
}

// --- detect OS ---
if (_browser || _worker || _titanium) {

    (/iPhone|iP[ao]d/i.test(_ident) ? (_ios      = true) :
     /Android/i.test(_ident)        ? (_android  = true) :
     /Win/.test(_ident)             ? (_windows  = true) :
     /Mac/.test(_ident)             ? (_mac      = true) :
     /CrOS/.test(_ident)            ? (_chromeos = true) :
     /X11|Linux/.test(_ident)       ? (_unix     = true) : 0);

    // --- detect OS version ---
    if (_titanium) {
        _osVersion = global.Titanium.Platform.version;
    } else if (_ios || _android) {
        _osVersion = parseFloat(
                _ident.split(/OS |Android /)[1].replace("_", "."));
    }
}

// --- export ---
lib.runs = {
    os: {
        mac:        _mac,       // Boolean: Mac OS X
        ios:        _ios,       // Boolean: iOS. iPhone, iPad, iPod
        unix:       _unix,      // Boolean: Unix Based / Like OS
        android:    _android,   // Boolean: Android OS. Nexus One, ...
        windows:    _windows,   // Boolean: Windows OS
        chromeos:   _chromeos,  // Boolean: Chrome OS
        version:    _osVersion  // Number: OS Version (iOS / Android)
    },
    ident:      _ident,         // String: UserAgent String
    nodejs:     _nodejs,        // Boolean: runs Node.js
    worker:     _worker,        // Boolean: runs WebWorkers
    browser:    _browser,       // Boolean: runs Browser
    titanium:   _titanium       // Boolean: runs Titanium
};

})(this, this.uu || this);

