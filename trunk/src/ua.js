// === User Agent ==========================================
// depend: none
uu.feat.ua = {};

// ie
//    version: 6.0, 7.0, 8.0
//    engine: 6(ie6), 7(ie7), 8(ie8)
// gecko
//    firefox version: 2.0 3.0 3.1
//    engine(gecko): 1.81(fx2) 1.9(fx3) 1.91(fx3.1)
//
// webkit
//    chrome version: 0.4 1.0
//    safari version: 3.0 3.1
//    engine(webkit): 525.19(chrome1) 525.21(safari3.1)
//
// opera
//    version: 9.2 9.5 9.6 10.0
//    engine(presto): 0(opera9.27), 0(opera9.52) 2.11(opera9.61) 2.2(opera10.00)

(function(navi, ie, cmpt, mode, ver, eng) {
uu.ua = {
  version: parseFloat((ver.exec(navi) || [,0])[1]),
  engine: parseFloat(((eng.exec(navi) || [,0])[1]).toString().
                     replace(/[^\d\.]/g, "").
                     replace(/^(\d+\.\d+)(\.(\d+))?$/, "$1$3")),
  ie: ie,
  opera: !!window.opera,
  gecko: navi.indexOf("Gecko/") > 0,
  webkit: navi.indexOf("WebKit") > 0,
  quirks: ie && cmpt !== "CSS1Compat",
  ie8mode8: mode >= 8
};
})(navigator.userAgent,
   !!uudoc.uniqueID, uudoc.compatMode || "", uudoc.documentMode || 0,
   /(?:IE |fox\/|ome\/|ion\/|era\/)(\d+\.\d+)/,   // detect version
   /(?:IE |rv\:|ari\/|sto\/)(\d+\.\d+(\.\d+)?)/); // detect engine

uu.mix(uu.ua, {
  // uu.ua.getFlashVersion - get Flash version (version 7 later)
  getFlashVersion: (function() {
    return function() {
      try {
        var obj = UU.IE ? new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                        : navigator.plugins["Shockwave Flash"],
            match = /\d+\.\d+/.exec(UU.IE ? obj.GetVariable("$version").replace(/,/g, ".")
                                          : obj.description);
        return parseFloat(match[0], 10);
      } catch(err) {}
      return 0.0; // return float
    };
  })(),
  // uu.ua.isSilverLightInstalled - is SilverLight installed
  isSilverLightInstalled: function(version) { // String(default: "2.0"): "major.minor"
    try {
      var ver = version || "2.0",
          obj = UU.IE ? new ActiveXObject("AgControl.AgControl")
                      : navigator.plugins["Silverlight Plug-In"];
      return UU.IE ? obj.IsVersionSupported(ver)
                   : parseFloat(obj.description.match(/\d+\.\d+/)[0]) >= parseFloat(ver);
    } catch(err) {}
    return false; // return bool
  }
});
