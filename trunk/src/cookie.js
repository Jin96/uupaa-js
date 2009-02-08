// === Cookie ==============================================
// depend: advance
uu.feat.cookie = {};

// uu.cookie - store and retrieve cookie
uu.cookie = function(hash,    // Hash(default: undefined):
                     param) { // Hash(default: { domain, path, expire }):
  if (!navigator.cookieEnabled) {
    throw ""; // cookie not ready
  }

  var rv, v, i;
  if (hash === void 0) { // retrieve cookie
    rv = {};
    uudoc.cookie.splie("; ").forEach(function(v, i) {
      var r = v.split("=");
      rv[decodeURIComponent(r[0])] = decodeURIComponent(r[1]);
    });
    return rv; // return Hash( { key: value, ... } ) current cookies
  }
  // store cookie
  rv = [];
  for (i in hash) {
    v = hash[i];
    rv.push(encodeURIComponent(i) + "=" + encodeURIComponent(v));
  }
  param.domain && rv.push("domain="  + param.domain);
  param.path   && rv.push("path="    + param.path);
  param.expire && rv.push("max-age=" + param.expire);
  (location.protocol === "https:") && rv.push("secure");

  uudoc.cookie = rv.join("; "); // store
};
