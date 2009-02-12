// === JSONP ===============================================
// depend: url
uu.feat.jsonp = {};

uu.mix(UU.CONFIG, {
  // UU.CONFIG.JSONP_REQUEST_TIMEOUT - request timeout(unit: sec)(min: 10000)
  JSONP_REQUEST_TIMEOUT: 10 * 1000,

  // UU.CONFIG.JSONP_SUICIDE_TIMER - suicide timer(unit: sec)(min: 10000)
  JSONP_SUICIDE_TIMER: 10 * 1000,

  // UU.CONFIG.JSONP_CALLBACK_FUNCTION_NAME - JSONP callback function name
  JSONP_CALLBACK_FUNCTION_NAME: "callback"
}, 0, 0);

// uu.jsonp - JSONP async request
uu.jsonp = function(url,      // URLString: request url
                    fn,       // Function: callback function
                    filter) { // Number(default: 0x2): callback filter
  filter = filter === void 0 ? 0x2 : filter;

  var hash = uu.url(url),
      node = uudoc.createElement("script"),
      head = uudoc.getElementsByTagName("head")[0],
      rv = {
        id:     "jsonp" + uu.uuid(), // request id
        phase:  0x1,      // request phase
        resp:   "",       // response
        code:   0,        // response code
        url:    hash.url  // request url
      };

  // add QueryString( "&callback=uu.jsonp._job.jsonp1" )
  hash.hash[UU.CONFIG.JSONP_CALLBACK_FUNCTION_NAME] = "uu.jsonp._job." + rv.id;
  hash.query = uu.url.query(hash.hash);

  function OK(json) {
    (filter & 2) &&
        fn(uu.mix(rv, { phase: 0x2, code: 200, resp: json }));
  }

  function NG(code) {
    (filter & 4) &&
        fn(uu.mix(rv, { phase: 0x4, code: code }));
  }

  function DIE() {
    head.removeChild(node);
    delete uu.jsonp._job[rv.id];
  }

  uu.jsonp._job[rv.id] = function(json, code) {
    if (!node._run++) {
      json ? OK(json)
           : NG(code || 404);
      setTimeout(DIE, UU.CONFIG.JSONP_REQUEST_TIMEOUT +
                      UU.CONFIG.JSONP_SUICIDE_TIMER);
    }
  };

  (filter & 1) && fn(rv); // READY

  // <head>
  //   <script src="..." type="text/javascript" charset="utf-8"></script>
  // </head>
  node._run    = 0;
  node.type    = "text/javascript";
  node.charset = "utf-8";
  head.appendChild(node);
  node.setAttribute("src", uu.url(hash));

  // watchdog
  setTimeout(function() {
    uu.jsonp._job[rv.id]("", 408); // 408 "Request Time-out"
  }, UU.CONFIG.JSONP_REQUEST_TIMEOUT);
};

uu.jsonp._job = {}; // job database
