
// === Ajax ===
//{{{!depend uu, uu.date, uu.event, uu.node
//}}}!depend

uu.ajax || (function(win, doc, uu) {

uu.mix(uu, {
    // --- ajax / jsonp ---
    ajax:    uu.mix(uuajax, {       //       uu.ajax(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        get:        uuajaxget,      //   uu.ajax.get(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        post:       uuajaxpost,     //  uu.ajax.post(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        sync:       uu.require,     // @see uu.require
        ifmod:      uuajaxifmod,    // uu.ajax.ifmod(url:String, option:AjaxOptionHash = void, callback:Function = void, ngCallback:Function = void):Number
        queue:      uuajaxqueue,    // uu.ajax.queue(command:String, url:Array, option:Array, callback:Array, ngCallback:Array, lastCallBack:Function = void, ngCallback:Function = void)
                                    //  [1] uu.ajax.queue("0+1>2>3", [url, ...], [option, ...], [callback, ...], lastCallBack, ngCallback)
        create:     uuajaxcreate,   // uu.ajax.create():XMLHttpRequest/null
        expire:     uuajaxexpire    // uu.ajax.expire()
    }),
    jsonp:   uu.mix(uujsonp, {      // uu.jsonp(url:String, option:Hash, callback:Function = void, ngCallback:Function = void):Number
        queue:      uujsonpqueue    // uu.jsonp.queue("0+1>2>3", [url, ...], [option, ...], [callback, ...], lastCallBack, ngCallBack)
    })
});

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
                ngCallback) { // @param Function(= void): ngCallBack(AjaxResultHash)
                              // @return Number: guid(request atom)
    return _uuajax(url, option || {}, callback, ngCallback);
}

// inner - ajax request
function _uuajax(url, option, callback, ngCallback, _fn2) {
    function _onReadyStateChange() {
        if (xhr.readyState !== 4) {
            return;
        }

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
                    _uuajax._cache[url] =
                            uu.date(Date.parse(lastModified)).GMT(); // add cache
                }
            }
        } else {
            _ngCallback(status || ((uu.opera && option.ifmod) ? 304 : 400)); // [Opera]
        }
        _garbageCollection();
    }
    function _createAjaxResultHash(ok, status) {
        return {
            id:     option.id,
            ok:     ok,
            url:    url,
            xhr:    xhr,
            guid:   guid,
            status: status,
            isXMLContent:  function() {
                return /xml/i.test(this.xhr.getResponseHeader("Content-Type") || "");
            }
        };
    }
    function _ngCallback(status) {
        ngCallback && !run++ &&
            ngCallback(_createAjaxResultHash(false, status));
    }
    function _garbageCollection() {
        beforeUnload && uu.event.detach(win, "beforeunload", beforeUnload); // [Gecko]
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

    url = toAbsoluteURL(url);

    // option.nocache -> "http://example.com/" + "?uuguid={{time}}"
    if (option.nocache) {
        url += (url.indexOf("?") < 0 ? "?" :
                url.indexOf("&") < 0 ? ";" : "&") + "uuguid=" + +(new Date);
    }

    if (xhr) {
        try {
            // [Gecko] beforeunload event -> gc
            uu.gecko && uu.event.attach(win, "beforeunload",
                                        beforeUnload = _abort);

            // --- initialize ---
            xhr.open(option.method || (option.data ? "POST" : "GET"), url, true); // Async

            xhr.onreadystatechange = _onReadyStateChange;

            // set/overwrite headers
            //      X-Requested-With:   "XMLHttpRequest"
            //      If-Modified-Since:  "Wed, 16 Sep 2009 16:18:14 GMT"
            //      Content-Type:       "application/x-www-form-urlencoded"
            //
            header.push("X-Requested-With", "XMLHttpRequest");

            if (option.ifmod && _uuajax._cache[url]) { // cached
                header.push("If-Modified-Since", _uuajax._cache[url]); // GMT
            }

            if (option.data) {
                header.push("Content-Type", "application/x-www-form-urlencoded");
            }

            while ( (v = header[++i]) ) {
                xhr.setRequestHeader(v, header[++i]);
            }

            // before send callback
            option.beforeCallback && option.beforeCallback(xhr);

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
_uuajax._cache  = {}; // { "url": DateHash(lastModified), ... }

// uu.ajax.get - async "GET" request
function uuajaxget(url, option, callback, ngCallback) { // @see uu.ajax
    return _uuajax(url, uu.arg(option, { data: null }), callback, ngCallback);
}

// uu.ajax.post - async "POST" request
function uuajaxpost(url, data, option, callback, ngCallback) { // @see uu.ajax
    return _uuajax(url, uu.arg(option, { data: data }), callback, ngCallback);
}

// uu.ajax.ifmod - async request with "If-Modified-Since" header
function uuajaxifmod(url, option, callback, ngCallback) { // @see uu.ajax
    return _uuajax(url, uu.arg(option, { ifmod: 1 }), callback, ngCallback);
}

// uu.ajax.queue - request queue
// uu.ajax.queue("a+b>c", [url, ...], [option, ...], [fn], lastCallback, ngCallback)
function uuajaxqueue(command,       // @param String: "0>1", "0+1", "0+1>2>3"
                     url,           // @param Array: [url, ...]
                     option,        // @param Array: [option, ...]
                     callback,      // @param Array: [callback, ...]
                     lastCallback,  // @param Function(= void): lastCallback([AjaxResultHash, ... ])
                     ngCallback) {  // @param Function(= void): ngCallback(AjaxResultHash)
    _uuajaxqueue(1, command, url, option, callback,
                 lastCallback || uu.nop, ngCallback || uu.nop, []);
}

// inner - uu.ajax.queue impl. http://d.hatena.ne.jp/uupaa/20091221
function _uuajaxqueue(ajax, command, url, option,
                      callback, lastCallback, ngCallback, rv) {
    function _nextQueue(r) {
        _uuajaxqueue(ajax, command, url, option,
                     callback, lastCallback, ngCallback, rv.concat(r)); // recursive
    }

    if (!command) {
        lastCallback(rv); // finish
        return;
    }

    var cmd, commandArray = command.split(""), ary = [];

    command = ""; // clear

    while ( (cmd = commandArray.shift()) ) { // v = "a"
        ary.push(url.shift(),
                 uu.mix(option.shift() || {}, { id: cmd }),
                 callback.shift());

        if (commandArray.shift() === ">") {
            command = c.join(""); // rebuild command, "0+1>2>3" -> "2>3"
            break;
        }
    }
    _uuajaxparallel(ajax, ary, _nextQueue, ngCallback);
}

// inner - ajax/jsonp parallel load
function _uuajaxparallel(ajax, ary, lastCallback, ngCallback) {
    function _nextParallel(hash) {
        var idx = atom.indexOf(hash.guid);

        rv[idx] = hash;
        ++n >= iz / 3 && !run++ && lastCallback(rv); // callback([{...}, ..])
    }
    function _error(hash) {
        !run++ && ngCallback(hash);
    }

    var rv = [], atom = [], i = 0, iz = ary.length, n = 0, run = 0;

    for (; i < iz; i += 3) {
        atom.push((ajax ? _uuajax : _uujsonp)(ary[i], ary[i + 1],
                                              ary[i + 2], _error, _nextParallel));
    }
}

// uu.ajax.create - create XMLHttpRequest object
function uuajaxcreate() { // @return XMLHttpRequest/null:
    return win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
           win.XMLHttpRequest ? new XMLHttpRequest() : null;
}

// uu.ajax.expire - expire Modified Since request cache
function uuajaxexpire() {
    _uuajax._cache = {}; // expire If-Modified-Since cache
}

//  [1] uu.jsonp("http://example.com/a.php", {}, function(result) {});

// uu.jsonp - Async JSONP request
function uujsonp(url,          // @param String: request url
                 option,       // @param JSONPOptionHash(= {}):
                 callback,     // @param Function(= void): callback(JSONPResultHash)
                 ngCallback) { // @param Function(= void): ngCallback(JSONPResultHash)
                               // @return Number: guid(request atom)
    return _uujsonp(url, option || {}, callback, ngCallback);
}
uujsonp._db = {}; // { jobid: callback, ... } jsonp job db

function _uujsonp(url, option, callback, ngCallback, _fn2) {
    function _watchdog() {
        uujsonp._db[jobid]("", 408); // 408 "Request Time-out"
    }
    function _receiveData(response, status) {
        if (!scriptNode.uujsonprun++) {

            if (response) {
                var result = _createJSONPResultHash(true, 200, response);

                callback && callback(result);
                _fn2 && _fn2(result);
            } else {
                ngCallback &&
                    ngCallback(_createJSONPResultHash(false, status || 404));
            }
            setTimeout(_garbageCollection, (timeout + 10) * 1000);
        }
    }
    function _createJSONPResultHash(ok, status, response) {
        return {
            id:     option.id,
            ok:     ok,
            url:    url,
            xhr:    { responseText: response || "", status: status },
            guid:   guid,
            status: status
        };
    }
    function _garbageCollection() {
        doc.head.removeChild(scriptNode);
        delete uujsonp._db[jobid];
    }

    var guid = uu.guid(),
        jobid = "j" + uu.guid(),
        timeout = option.timeout || 10,
        scriptSrc = url,
        scriptNode = uu.node("script", {
            type:       "text/javascript",
            charset:    "utf-8",
            uujsonprun: 0           // chattering guard
        });

    scriptSrc += (url.indexOf("?") < 0 ? "?" :
                  url.indexOf("&") < 0 ? ";" : "&") +
                  option.method || "callback" + "=uu.jsonp._db." + jobid; // uu.jsonp._db = _jobid

    uujsonp._db[jobid] = _receiveData;

    doc.head.appendChild(scriptNode);
    scriptNode.setAttribute("src", scriptSrc);

    setTimeout(_watchdog, timeout * 1000);

    return guid;
}

// uu.jsonp.queue - request queue
function uujsonpqueue(command, url, option,
                      callback, lastCallback, ngCallback) { // @see uu.ajax.queue
    _uuajaxqueue(0, command, url, option, callback,
                 lastCallback || uu.nop, ngCallback || uu.nop, []);
}

// convert relative url to absolute url
function toAbsoluteURL(url) { // @param String:
                              // @return String:
    if (!toAbsoluteURL._ABSURL.test(url)) {
        var div = uu.node();

        div.innerHTML = '<a href="' + url + '" />';
        url = div.firstChild ? div.firstChild.href
                             : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    }
    return url;
}
toAbsoluteURL._ABSURL = /^(?:file|https?):/;

})(window, document, uu);

