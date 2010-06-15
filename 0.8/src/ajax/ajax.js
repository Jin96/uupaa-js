
// === uu.ajax / uu.jsonp ===
//#include uupaa.js

uu.ajax || (function(win, doc, uu) {

uu.mix(uu, {
    // --- ajax / jsonp ---
    ajax:    uu.mix(uuajax, {       // uu.ajax(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        post:       uuajaxpost,     // uu.ajax.post(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        ifmod:      uuajaxifmod,    // uu.ajax.ifmod(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        create:     uuajaxcreate,   // uu.ajax.create():XMLHttpRequest/null
        expire:     uuajaxexpire    // uu.ajax.expire()
    }),
    jsonp:          uujsonp         // uu.jsonp(url:String, option:Hash, callback:Function = void, ngCallback:Function = void):Number
});

uu.ajax.binary = uuajaxbinary;      // uu.ajax.binary(url:String, option:Hash, callback:Function)

// uu.ajax.binary - upload / download binary data
function uuajaxbinary(url, option, callback) {
    option.method = option.data ? "PUT" : "GET";
    option.binary =
//{{{!mb
                    _ie ? toByteArrayIE(xhr) :
//}}}!mb
                          toByteArray(xhr);

    uuajax(url, option, callback);
}

// inner - BinaryString To ByteArray
function toByteArray(xhr) { // @param XMLHttpRequest:
                            // @return ByteArray: [0x00, 0x01]
    var rv = [], bb2num = _bb2num, remain,
        ary = xhr.responseText.split(""), // "\00\01"
        i = -1, iz;

    iz = ary.length;
    remain = iz % 8;

    while (remain--) {
        ++i;
        rv[i] = bb2num[ary[i]];
    }
    remain = iz >> 3;
    while (remain--) {
        rv.push(bb2num[ary[++i]], bb2num[ary[++i]],
                bb2num[ary[++i]], bb2num[ary[++i]],
                bb2num[ary[++i]], bb2num[ary[++i]],
                bb2num[ary[++i]], bb2num[ary[++i]]);
    }
    return rv;
}

//{{{!mb
// inner - BinaryString to ByteArray
function toByteArrayIE(xhr) {
    var rv = [], data, remain,
        charCodeAt = "charCodeAt", _0xff = 0xff,
        loop, v0, v1, v2, v3, v4, v5, v6, v7,
        i = -1, iz;

    iz = vblen(xhr);
    data = vbstr(xhr);
    loop = Math.ceil(iz / 2);
    remain = loop % 8;

    while (remain--) {
        v0 = data[charCodeAt](++i); // 0x00,0x01 -> 0x0100
        rv.push(v0 & _0xff, v0 >> 8);
    }
    remain = loop >> 3;
    while (remain--) {
        v0 = data[charCodeAt](++i);
        v1 = data[charCodeAt](++i);
        v2 = data[charCodeAt](++i);
        v3 = data[charCodeAt](++i);
        v4 = data[charCodeAt](++i);
        v5 = data[charCodeAt](++i);
        v6 = data[charCodeAt](++i);
        v7 = data[charCodeAt](++i);
        rv.push(v0 & _0xff, v0 >> 8, v1 & _0xff, v1 >> 8,
                v2 & _0xff, v2 >> 8, v3 & _0xff, v3 >> 8,
                v4 & _0xff, v4 >> 8, v5 & _0xff, v5 >> 8,
                v6 & _0xff, v6 >> 8, v7 & _0xff, v7 >> 8);
    }
    iz % 2 && rv.pop();

    return rv;
}
_ie && document.write('<script type="text/vbscript">\
Function vblen(b)vblen=LenB(b.responseBody)End Function\n\
Function vbstr(b)vbstr=CStr(b.responseBody)+chr(0)End Function</'+'script>');
//}}}!mb






// --- ajax / jsonp ---
// [1][basic use]        uu.ajax("http://...", {}, function(result) { alert(result.xhr.responseText); });
// [2][trap error]       uu.ajax("http://...", {}, function(result) { uu.puff("OK:" + result.xhr.responseText); },
//                                                 function(result) { uu.puff("NG:" + result.url) });
// [3][trap before send] uu.ajax("http://...", {}, void 0, void 0,
//                                                 function(xhr) { xhr.overrideMimeType(...); });

// uu.ajax - async "GET", "POST", "PUT", "DELETE" and "HEAD" request
function uuajax(url,          // @param String: url
                option,       // @param AjaxOptionHash(= {}):
                callback,     // @param Function(= void): callback(AjaxResultHash)
                ngCallback,   // @param Function(= void): ngCallBack(AjaxResultHash)
                __fn2__) {    // @hidden Function(= void): callback for queue
                              // @return Number: guid(request atom)
    option = option || {};

    function _onReadyStateChange() {
        if (xhr.readyState === 4) {
            var status = xhr.status || 0,
                lastModified,
                result;

            if ((status >= 200 && status < 300)
                || (!status && !url.indexOf("file:"))) {

                // --- callback phase ---
                if (callback && !run++) {
                    result = _createAjaxResultHash(true, status || 200);
                    callback(result);

                    _fn2 && _fn2(result); // callback uu.ajax.queue
                }
                // --- "Last-Modified" phase ---
                if (option.ifmod) {
                    lastModified = xhr.getResponseHeader("Last-Modified");
                    if (lastModified) {
                        uuajax.cache[url] =
                                uu.date(Date.parse(lastModified)).GMT(); // add cache
                    }
                }
            } else {
                _ngCallback(status || ((uu.opera && option.ifmod) ? 304 : 400)); // [Opera]
            }
            _garbageCollection();
        }
    }
    function _createAjaxResultHash(ok, status) {
        return {
            id:     option.id,
            ok:     ok,
            url:    url,
            xhr:    xhr,
            guid:   guid,
            status: status,
            isXML:  function() {
                return /xml/i.test(this.xhr.getResponseHeader("Content-Type") || "");
            }
        };
    }
    function _ngCallback(status) {
        ngCallback && !run++ &&
            ngCallback(_createAjaxResultHash(false, status));
    }
    function _garbageCollection() {
//{{{!mb
        beforeUnload && uu.event.detach(win, "beforeunload", beforeUnload); // [Gecko]
//}}}!mb
        xhr && (xhr.onreadystatechange = uu.nop, xhr = null); // [IE] mem leak
    }
    function _watchdog() {
        _abort();
        _ngCallback(408); // 408 "Request Time-out"
        _garbageCollection();
    }
    function _abort() {
        try {
            xhr && xhr.abort();
        } catch(err) {}
    }

    var xhr = option.xhr || uuajaxcreate(),
        guid = uu.guid(),
        header = option.header || [],
        run = 0, v, i = -1, beforeUnload;

    url = toAbsURL(url);

    // option.nocache -> "http://example.com/" + "?uuguid={{time}}"
    if (option.nocache) {
        url += (url.indexOf("?") < 0 ? "?" :
                url.indexOf("&") < 0 ? ";" : "&") + "uuguid=" + +(new Date);
    }

    if (xhr) {
        try {
//{{{!mb
            // [Gecko] beforeunload event -> gc
            uu.gecko && uu.event.attach(win, "beforeunload",
                                        beforeUnload = _abort);
//}}}!mb

            // --- initialize ---
            xhr.open(option.method || (option.data ? "POST" : "GET"), url, true); // Async

            xhr.onreadystatechange = _onReadyStateChange;

            // set/overwrite headers
            //      X-Requested-With:   "XMLHttpRequest"
            //      If-Modified-Since:  "Wed, 16 Sep 2009 16:18:14 GMT"
            //      Content-Type:       "application/x-www-form-urlencoded"
            //
            header.push("X-Requested-With", "XMLHttpRequest");

            if (option.ifmod && uuajax.cache[url]) { // cached
                header.push("If-Modified-Since", uuajax.cache[url]); // GMT
            }

            if (option.data) {
                header.push("Content-Type", "application/x-www-form-urlencoded");
            }

            while ( (v = header[++i]) ) {
                xhr.setRequestHeader(v, header[++i]);
            }

            // before send callback
            option.before && option.before(xhr);

            // send request
            xhr.send(option.data || null);

            setTimeout(_watchdog, (option.timeout || 10) * 1000);

            return guid;
        } catch (err) {
            xhr = xhr || { responseText: "", responseXML: "", status: 400 };
        }
    }
    // create object or request error
    setTimeout(function() {
        _ngCallback(400);
        _garbageCollection();
    }, 0); // [delay]

    return guid;
}
uuajax.cache = {}; // { "url": DateHash(lastModified), ... }

// uu.ajax.post - async "POST" request
function uuajaxpost(url, data, option, callback, ngCallback) { // @see uu.ajax
    return uuajax(url, uu.arg(option, { data: data }), callback, ngCallback);
}

// uu.ajax.ifmod - async request with "If-Modified-Since" header
function uuajaxifmod(url, option, callback, ngCallback) { // @see uu.ajax
    return uuajax(url, uu.arg(option, { ifmod: 1 }), callback, ngCallback);
}

// uu.ajax.create - create XMLHttpRequest object
function uuajaxcreate() { // @return XMLHttpRequest/null:
    var rv =
//{{{!mb
             win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
//}}}!mb
             win.XMLHttpRequest ? new XMLHttpRequest() : null;

    return rv;
}

// uu.ajax.expire - expire Modified Since request cache
function uuajaxexpire() {
    uuajax.cache = {}; // expire If-Modified-Since cache
}

//  [1] uu.jsonp("http://example.com/a.php", {}, function(result) {});

// uu.jsonp - Async JSONP request
function uujsonp(url,          // @param String: request url
                 option,       // @param JSONPOptionHash(= {}):
                 callback,     // @param Function(= void): callback(JSONPResultHash)
                 ngCallback,   // @param Function(= void): ngCallback(JSONPResultHash)
                 __fn2__) {    // @hidden Function(= void): callback for queue
                               // @return Number: guid(request atom)
    function _watchdog() {
        uujsonp.db[guid]("", 408); // 408 "Request Time-out"
    }
    function _garbageCollection() {
        doc.head.removeChild(script);
        win[method] = null;
        delete uujsonp.db[guid];
    }

    option = option || {};

    var guid = uu.guid(),
        timeout = option.timeout || 10,
        src = url,
        script = uu.node("script", {
            type:       "text/javascript",
            charset:    "utf-8",
            uujsonprun: 0           // chattering guard
        }),
        method = option.method || "callback";

    // replace last ?? mark
    //      "http://example.com?callback=??"
    //                                   v
    //      "http://example.com?callback={{method}}"
    //
    if (/\=\??$/.test(src)) {
        src = uu.format(src, method);
    }
    uujsonp.db[guid] = method;

    // build callback global function
    win[method] = function(json,         // @param Mix: json data
                           __status__) { // @hidden Number: from watchdog
        if (!script.uujsonprun++) {

            if (json) {
                var result = {
                    id:     option.id,
                    ok:     true,
                    url:    src,
                    json:   json,
                    guid:   guid,
                    status: 200
                };

                callback && callback(result);
                _fn2 && _fn2(result);
            } else {
                ngCallback && ngCallback({
                    id:     option.id,
                    ok:     false,
                    url:    src,
                    json:   void 0,
                    guid:   guid,
                    status: __status__ || 404
                });
            }
            setTimeout(_garbageCollection, (timeout + 10) * 1000);
        }
    };

    doc.head.appendChild(script);
    script.setAttribute("src", src);

    setTimeout(_watchdog, timeout * 1000);

    return guid;
}
uujsonp.db = {}; // { guid: callback, ... } jobdb

// inner - convert relative url to absolute url
function toAbsURL(url) { // @param String:
                         // @return String:
    if (!toAbsURL.scheme.test(url)) {
        var div = uu.node();

        div.innerHTML = '<a href="' + url + '" />';
        url = div.firstChild ? div.firstChild.href
                             : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    }
    return url;
}
toAbsURL.scheme = /^(?:file|https?):/;

})(window, document, uu);

