
// === uu.jsonp ===
//#include uupaa.js

uu.jsonp || (function(win, doc, uu) {

uu.jsonp = uujsonp; // uu.jsonp(url:String, option:Hash, callback:Function = void, ngCallback:Function = void):Number

// uu.jsonp - Async JSONP request
function uujsonp(url,        // @param String: "http://example.com?callback=??"
                 option,     // @param Hash: { timeout, method }
                             //     timeout - Number(= 10):
                             //     method  - String(= "callback")
                 callback) { // @param Function: callback(JSONPResultHash)
    var guid = uu.guid(),
        method = option.method || "callback",
        timeout = option.timeout || 10,
        before = option.before,
        after = option.after,
        script = uu.node("script", { type: "text/javascript", charset: "utf-8",
                                     run: 0 });

    url = uu.format(url, method);
    uujsonp.db[guid] = method;

    // build callback global function
    win[method] = function(data, rv) { // @param Mix: json data
        if (!script.run++) {
            rv = { ok: !!data, status: data ? 200 : 408 };

            after && after(script, option, rv);
            callback(data, option, rv);

            setTimeout(function() {
                doc.head.removeChild(script);
                win[method] = null;
                delete uujsonp.db[guid];
            }, (timeout + 10) * 1000);
        }
    };

    doc.head.appendChild(script);

    before && before(script, option);

    script.setAttribute("src", url);

    setTimeout(function() {
        uujsonp.db[guid](); // 408 "Request Time-out"
    }, timeout * 1000);
}
uujsonp.db = {}; // { guid: callbackMethod, ... }

})(window, document, uu);

