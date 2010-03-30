
// === Ajax ===
// depend: uu.js
uu.agein || (function(win, doc, uu) {

uu.mix(uu, {
    // --- ajax / jsonp ---
    ajax:    uu.mix(uuajax, {       // uu.ajax(url, option = {}, fn = void 0, ngfn = void 0, beforefn = void 0)
        get:        uuajaxget,      // uu.ajax.get(url, option = {}, fn, ngfn = void 0, beforefn = void 0) -> guid
        post:       uuajaxpost,     // uu.ajax.post(url, data, option = {}, fn, ngfn = void 0, beforefn = void 0) -> guid
        sync:       uuajaxsync,     // uu.ajax.sync(url, option = {}) -> { rv: "response text" or "", ok, code }
        ifmod:      uuajaxifmod,    // uu.ajax.ifmod(url, option = {}, fn, ngfn = void 0)
        queue:      uuajaxqueue,    // uu.ajax.queue("0+1>2>3", [url, ...], [option, ...], [fn, ...], lastfn, ngfn)
        create:     uuajaxcreate,   // uu.ajax.create() -> XMLHttpRequestObject
        expire:     uuajaxexpire    // uu.ajax.expire()
    }),
    jsonp:   uu.mix(uujsonp, {      // uu.jsonp(url, option = {}, fn = void 0, ngfn = void 0) -> guid
        queue:      uujsonpqueue    // uu.jsonp.queue("0+1>2>3", [url, ...], [option, ...], [fn, ...], lastfn, ngfn)
    })
});


// --- ajax / jsonp ---
// uu.ajax - async "GET", "POST", "PUT", "DELETE" and "HEAD" request
// [1][basic use]        uu.ajax("http://...", {}, function(hash) { alert(hash.rv); });
// [2][trap error]       uu.ajax("http://...", {}, function(hash) { uu.puff("OK:" + hash.rv); },
//                                                 function(hash) { uu.puff("NG:" + hash.url) });
// [3][trap before send] uu.ajax("http://...", {}, function(hash) {...},
//                                                 void 0,
//                                                 function(xhr) { xhr.overrideMimeType(...); });
function uuajax(
        url,        // @param URLString: request url
        option,     // @param Hash(= {}): { data, header, method, timeout, nocache, ignore }
                    //    option.xhr     - XMLHttpRequestObject(= void 0):
                    //    option.data    - Mix(= null): request data(auto "POST")
                    //    option.header  - Array(= []): [(key, value), ...]
                    //    option.method  - String(= "GET" or "POST"):
                    //    option.timeout - Number(= 10):  unit sec
                    //    option.nocache - Number(= 0): 1 is no cache
                    //    option.ignore  - Number(= 0): 1 is ignore response data
        fn,         // @param Function(= void 0): fn({ rv, url, code, guid, type })
                    //    rv   - String: responseText or responseXML or ""(fail)
                    //    url  - String: request url (absolute)
                    //    code - Number: status code (0, 2xx, 3xx, 4xx, 5xx)
                    //    guid - Number: request id (atom)
                    //    type - String: Content-Type( "text/css" or ""(fail) )
        ngfn,       // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
        beforefn) { // @param Function(= void 0): trap before send function
                    //                            beforefn(XMLHttpRequestObject)
                    // @return Number: guid(request atom)
    return _uuajax(url, option, fn, ngfn, void 0, beforefn);
}
uuajax._cache  = {}; // { "url": Number(lastModified), ... }
uuajax._scheme = /^(?:file|https?):/; // judge absolute url

function _uuajax(url, option, fn, ngfn, _fn2, beforefn) {
    function _ajaxstatechange() {
        var rv, type, code, lastmod, hash;

        if (xhr.readyState === 4) {
            code = xhr.status || 0;

            if ((code >= 200 && code < 300)
                || (!code && !url.indexOf("file:"))) {

                if (fn && !run++) {
                    type = xhr.getResponseHeader("Content-Type") || "";
                    ignore || (rv = type.indexOf("xml") < 0 ? xhr.responseText
                                                            : xhr.responseXML);
                    fn(hash = { code: code, rv: rv || "", url: url,
                                guid: guid, type: type, id: opt.id });
                    _fn2 && _fn2(hash); // callback uu.ajax.queue
                }
                if (opt.ifmod) { // parse "Last-Modified" value
                    lastmod = xhr.getResponseHeader("Last-Modified");
                    uuajax._cache[url] = lastmod ? Date.parse(lastmod) : 0; // add cache
                }
            } else {
                _ajaxng(code || ((uu.opera && opt.ifmod) ? 304 : 400)); // [Opera]
            }
            _ajaxgc();
        }
    }
    function _ajaxng(code) {
        ngfn && !run++ &&
            ngfn({ code: code, rv: "", url: url,
                   guid: guid, type: "", id: opt.id });
    }
    function _ajaxgc() {
        befn && uu.event.detach(win, "beforeunload", befn);
        xhr && (xhr.onreadystatechange = uu.nop, xhr = null); // [IE] mem leak
    }
    function _ajaxwatchdog() {
        _ajaxabort();
        _ajaxng(408); // 408 "Request Time-out"
        _ajaxgc();
    }
    function _ajaxabort() {
        try {
            xhr && xhr.abort();
        } catch(err) {}
    }
    var opt = option || {}, xhr = opt.xhr || uuajaxcreate(),
        method = opt.method || (opt.data ? "POST" : "GET"),
        ignore = opt.ignore || (method === "HEAD" ? 1 : 0),
        header = opt.header || [],
        guid = uu.guid(), run = 0, v, i = -1, befn, div;

    // relative url -> absolute url
    if (!uuajax._scheme.test(url)) {
        div = uu.node();
        div.innerHTML = '<a href="' + url + '" />';
        url = div.firstChild ? div.firstChild.href
                             : /href\="([^"]+)"/.exec(div.innerHTML)[1];
    }
    opt.nocache && (url += (url.indexOf("?") < 0 ? "?" :
                            url.indexOf("&") < 0 ? ";" : "&") + "uuguid=" + guid);
    if (xhr) {
        try {
            // [Gecko] beforeunload event -> gc
            uu.gecko && uu.event.attach(win, "beforeunload", befn = _ajaxabort);

            // initialize
            xhr.open(method, url, true); // GET / POST / PUT / DELETE / HEAD, Async
            xhr.onreadystatechange = _ajaxstatechange;

            // set header
            header.push("X-Requested-With", "XMLHttpRequest");
            opt.ifmod && uuajax._cache[url] &&
                header.push("If-Modified-Since",
                            uu.date2str(uuajax._cache[url], 1)); // GMT
            opt.data &&
                header.push("Content-Type", "application/x-www-form-urlencoded");

            while ( (v = header[++i]) ) {
                xhr.setRequestHeader(v, header[++i]);
            }

            // before send
            beforefn && beforefn(xhr);

            // request
            xhr.send(opt.data || null);
            setTimeout(_ajaxwatchdog, (option.timeout || 10) * 1000);
            return guid;
        } catch (err) {}
    }
    // create object or request error
    setTimeout(function() { _ajaxng(400), _ajaxgc(); }, 0); // [delay]
    return guid;
}

// uu.ajax.get - async "GET" request
function uuajaxget(url, option, fn, ngfn, beforefn) { // @see uu.ajax
    return _uuajax(url, uu.arg(option, { data: null }), fn, ngfn, beforefn);
}

// uu.ajax.post - async "POST" request
function uuajaxpost(url, data, option, fn, ngfn, beforefn) { // @see uu.ajax
    return _uuajax(url, uu.arg(option, { data: data }), fn, ngfn, beforefn);
}

// uu.ajax.sync - sync "GET" request
function uuajaxsync(url) { // @param String:
                           // @return Hash: { rv: String(responseText or ""),
                           //                 ok: Boolean(200 >= code < 300)
                           //                 code: Number(status code) }
    try {
        var xhr = uuajaxsync._xhr || (uuajaxsync._xhr = uuajaxcreate());

        xhr.open("GET", url, false); // sync
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(null);

        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
            return { rv: xhr.responseText, ok: true,
                     code: xhr.status || 200 };
        }
    } catch(err) {
        uu.config.debug &&
            alert("uu.ajax.sync error. " + err.message + " " + url);
    }
    return { rv: "", ok: false,
             code: xhr && xhr.status ? xhr.status : 400 }; // 400: request error
}
uuajaxsync._xhr = 0; // static xhr object

// uu.ajax.ifmod - async request with "If-Modified-Since" header
function uuajaxifmod(url, option, fn, ngfn) { // @see uu.ajax
    return _uuajax(url, uu.arg(option, { ifmod: 1 }), fn, ngfn);
}

// uu.ajax.queue - request queue
// uu.ajax.queue("a+b>c", [url, ...], [option, ...], [fn], lastfn, ngfn)
function uuajaxqueue(cmd,    // @param String: "0>1", "0+1", "0+1>2>3"
                     urlary, // @param Array: [url, ...]
                     optary, // @param Array: [option, ...]
                     fnary,  // @param Array: [fn, ...]
                     lastfn, // @param Function(= void 0): lastfn([{ rv, url, code, guid, type }, ... ])
                     ngfn) { // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
    _uuajaxq(1, cmd, urlary, optary, fnary, lastfn || uu.nop, ngfn || uu.nop, []);
}

// inner - uu.ajax.queue impl. http://d.hatena.ne.jp/uupaa/20091221
function _uuajaxq(ajax, cmd, url, opt, fn, lastfn, ngfn, rv) {
    function _nextq(r) {
        _uuajaxq(ajax, cmd, url, opt, fn, lastfn, ngfn, rv.concat(r)); // recursive
    }
    if (!cmd) {
        lastfn(rv); // finish
        return;
    }
    var c = cmd.split(""), ary = [], v;

    cmd = "";
    while ( (v = c.shift()) ) { // v = "a"
        ary.push(url.shift(), uu.mix(opt.shift() || {}, { id: v }), fn.shift());
        if (c.shift() === ">") {
            cmd = c.join(""); // rebuild command, "0+1>2>3" -> "2>3"
            break;
        }
    }
    _uuajaxparallel(ajax, ary, _nextq, ngfn);
}

// inner - ajax/jsonp parallel load
function _uuajaxparallel(ajax, ary, lastfn, ngfn) {
    function _nextp(hash) {
        var idx = atom.indexOf(hash.guid);

        rv[idx] = hash;
        ++n >= iz / 3 && !run++ && lastfn(rv); // fn([{...}, ..])
    }
    function _error(hash) {
        !run++ && ngfn(hash);
    }
    var rv = [], atom = [], i = 0, iz = ary.length, n = 0, run = 0;

    for (; i < iz; i += 3) {
        atom.push((ajax ? _uuajax : _uujsonp)(ary[i], ary[i + 1],
                                              ary[i + 2], _error, _nextp));
    }
}

// uu.ajax.create - create XMLHttpRequest object
function uuajaxcreate() { // @return XMLHttpRequest/0:
    return win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
           win.XMLHttpRequest ? new XMLHttpRequest() : 0;
}

// uu.ajax.expire - expire Modified Since request cache and sync xhr object
function uuajaxexpire() {
    _uuajax._cache = {}; // expire If-Modified-Since cache
    uuajaxsync._xhr = null;
}

// uu.jsonp - Async JSONP request
// uu.jsonp("http://example.com/a.php", {}, function(result) {});
function uujsonp(url,    // @param URLString: request url
                 option, // @param Hash(= {}): { method, timeout }
                         //   option.mehtod  - String(= "callback"):
                         //   option.timeout - Number(= 10): unit sec
                 fn,     // @param Function: fn({ rv, url, code, guid, type })
                 ngfn) { // @param Function(= void 0): ngfn({ rv, url, code, guid, type })
                         // @return Number: guid(request atom)
    return _uujsonp(url, option, fn, ngfn);
}
uujsonp._db = {}; // { jobid: fn, ... } jsonp job db

function _uujsonp(url, option, fn, ngfn, _fn2) {
    function _jsonpwatchdog() {
        uujsonp._db[jobid]("", 408); // 408 "Request Time-out"
    }
    function _jsonpjob(rv, code, hash) {
        if (!node.uujsonprun++) {
            if (rv) {
                fn && fn(hash = { code: 200, rv: rv, url: url, guid: guid,
                                  type: type, id: opt.id });
                _fn2 && _fn2(hash);
            } else {
                ngfn && ngfn({ code: code || 404, rv: "", url: url, guid: guid,
                               type: "", id: opt.id });
            }
            setTimeout(_jsonpgc, (timeout + 10) * 1000);
        }
    }
    function _jsonpgc() {
        doc.head.removeChild(node);
        delete uujsonp._db[jobid];
    }
    var opt = option || {},
        guid = uu.guid(), type = "text/javascript",
        timeout = opt.timeout || 10,
        method = opt.method || "callback",
        jobid = "j" + uu.guid(),
        node = uu.node("script"),
        src = url + (url.indexOf("?") < 0 ? "?" :
                     url.indexOf("&") < 0 ? ";" : "&") +
                    method + "=uu.jsonp._db." + jobid; // uu.jsonp._db = _jobid

    uujsonp._db[jobid] = _jsonpjob;
    uu.mix(node, { type: type, charset: "utf-8", uujsonprun: 0 });
    doc.head.appendChild(node);
    node.setAttribute("src", src);
    setTimeout(_jsonpwatchdog, timeout * 1000);
    return guid;
}

// uu.jsonp.queue - request queue
function uujsonpqueue(cmd, urlary, optary, fnary, lastfn, ngfn) { // @see uu.ajax.queue
    _uuajaxq(0, cmd, urlary, optary, fnary, lastfn || uu.nop, ngfn || uu.nop, []);
}

})(window, document, uu);

