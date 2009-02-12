// === Ajax ================================================
// depend: advance
uu.feat.ajax = {};

uu.mix(UU.CONFIG, {
  // UU.CONFIG.AJAX_REQUEST_TIMEOUT - request timeout(unit: sec)(min: 10000)
  AJAX_REQUEST_TIMEOUT: 10 * 1000,

  // UU.CONFIG.AJAX_REQUEST_HEADER - request header
  AJAX_REQUEST_HEADER: {
    "X-Requested-With": "XMLHttpRequest"
  }
}, 0, 0);

// uu.ajax - Ajax async request
uu.ajax = function(url,       // URLString: request url
                   fn,        // Function: callback function
                   data,      // Mix(default: null): put data
                   filter,    // Number(default: 0x2): callback filter
                   mime,      // String(default: ""): Mime Type
                   __ifMod) { // Boolean(default: false): hidden arg
  url     = uu.toAbsURL(url);
  data    = data || null;
  filter  = filter === void 0 ? 0x2 : filter;
  mime    = mime || "";
  __ifMod = __ifMod || 0;

  var xhr, run = 0, i,
      rv = {
        id:     "ajax" + uu.uuid(), // request id
        phase:  0x1,  // request phase
        resp:   "",   // response
        code:   0,    // response code
        url:    url   // request url
      };

  // --- create xhr object ---
  if (UU.IE && ActiveXObject) { // IE + overrideMimeType + GET
    xhr = new ActiveXObject((mime && !data) ? "Microsoft.XMLDOM"
                                            : "Microsoft.XMLHTTP");
  }
  if (!xhr && XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  }
  if (!xhr) {
    NG(400);
    return;
  }

  function OK() {
    if ((filter & 2) && !run++) {
      fn(uu.mix(rv, { phase: 0x2, code: 200, resp: xhr.responseText }));
    }
  }

  function NG(code) {
    if ((filter & 4) && !run++) {
      fn(uu.mix(rv, { phase: 0x4, code: code }));
    }
  }

  function STATE() {
    if (xhr.readyState !== 4) {
      return;
    }

    // fileスキームに限りrequest成功でstatusが0になる(Firefox2+, Safari3, Opera9.5, IE6+)
    if (xhr.status === 200 || (!xhr.status && url.indexOf("file://") > -1)) {
      OK();
      if (__ifMod) {
        // parse "Last-Modified" value
        var last = xhr.getResponseHeader("Last-Modified");
        uu.ajax._cache[url] = last ? Date.parse(last) : 0;
      }
      return;
    }
    NG(xhr.status); // 304 too
  }

  xhr.onreadystatechange = STATE;

  // --- open ---
  try {
    xhr.open(data ? "POST" : "GET",
             url.replace(/&amp;/g, "&"), true); // true = Async
  } catch(e) {
    NG(400);
    return;
  }

  // --- set header ---
  for (i in UU.CONFIG.AJAX_REQUEST_HEADER) {
    xhr.setRequestHeader(i, UU.CONFIG.AJAX_REQUEST_HEADER[i]);
  }
  if (data) {
    xhr.setRequestHeader("Content-Type",
                         "application/x-www-form-urlencoded");
  } else {
    mime && xhr.overrideMimeType(mime);
  }
  if (__ifMod && url in uu.ajax._cache) {
    xhr.setRequestHeader("If-Modified-Since",
                         Date.toRFC1123(new Date(uu.ajax._cache[url])));
  }

  (filter & 1) && fn(rv); // READY

  xhr.send(data);

  // watchdog
  setTimeout(function() {
    xhr.abort();
    NG(408); // 408 "Request Time-out"
  }, UU.CONFIG.AJAX_REQUEST_TIMEOUT);
}

// uu.ajax.ifMod - Ajax async request with new-arrival check
uu.ajax.ifMod = function(url,     // URLString: request url
                         fn,      // Function: callback function
                         filter,  // Number(default: 0x2): callback filter
                         mime) {  // String(default: ""): Mime Type
  uu.ajax(url, fn, null, filter, mime, true);
};

// If-Modified-Since cache
uu.ajax._cache = {};
