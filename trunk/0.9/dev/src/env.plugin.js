// pligin environment detection
//#include("runs.js")
//#include("env.js")

//{@node
//{@ti
//{@mb
(function(global, // @param GlobalObject:
          lib) {  // @param LibraryRootObject/undefined:

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

// --- export ---
lib.env.flash  = detectFlashPlayerVersion(9); // Number: FlashPlayerVersion(9+)
lib.env.silver = detectSilverlightVersion(3); // Number: SilverLightVersion(3+)

})(this, this.uu || this);

//}@mb
//}@ti
//}@node
