// === Feature(dependency module loader) ===================
// depend: none

uu.mix(UU.CONFIG, {
  FEAT_URL1: "src",     // feature primary url
  FEAT_URL2: "",        // feature secondary url
  FEAT_TIMEOUT: 20000,  // feature timeout(unit: ms) default: 20sec
  FEAT_EXCLUDE: ""      // exclude feat list(default: "")
}, 0, 0);

uu.mix(uu.feat, {
  // uu.feat.loadFrom - set base-url and load feature
  loadFrom: function(url,   // String: from url
                     feat,  // JointString: "feat" or "feat,feat..."
                     fn) {  // Function(default: undefined): callback
    uu.feat.feat._url = url.replace(/\/+$/, ""); // trim tail "/"
    uu.feat.load(feat, fn);
  },

  // uu.feat.load - load feature
  load: function(feat,  // JointString: "feat" or "feat,feat..."
                 fn) {  // Function(default: undefined): callback
    if (feat) {
      var feats = uu.feat.collectDependencyList(feat),
          jobid = uu.uuid(), timeout = UU.CONFIG.FEAT_TIMEOUT;
      if (feats.length) {
        uu.feat.feat._job[jobid] = {
          fn:       fn,
          feats:    feats,
          timeout:  +new Date + timeout
        };
        uu.feat.feat._runner(jobid);
        setTimeout(uu.feat.feat._watchdog, timeout);
        return;
      }
    }
    fn && fn(true, ""); // already loaded
  },

  // uu.feat.already
  already: function(feats) { // JointString: "feat" or "feat,feat,..."
    var ary = feats.split(UU.UTIL.SPLIT_TOKEN), v, i = 0;
    while ( (v = ary[i++]) ) {
      if (!(v.replace(UU.UTIL.TRIM, "") in uu.feat)) {
        return false;
      }
    }
    return true; // return Boolean
  },

  // uu.feat.collectDependencyList - collect dependency list
  collectDependencyList: function(feat) { // JointString: "feat" or "feat,feat,..."
    var rv = [];
    feat.split(UU.UTIL.SPLIT_TOKEN).forEach(function(v) {
      uu.feat.feat._collect(v.replace(UU.UTIL.TRIM, ""), rv);
    });
    return rv; // return String( "feat,..." )
  },

  // uu.feat.mix - mix feature-list(override)
  mix: function(featureList) {
    uu.mix(uu.featureList, featureList);
    return uu.feat;
  },

  // uu.feat.init - initialize db
  init: function() {
    var exclude, ary, i;
    exclude = [
      "loadFrom,load,collectDependencyList,already,mix,init,feat,prototype",
      UU.CONFIG.FEAT_EXCLUDE.replace(/^\s*,?|,?\s*$/g, "")
    ].join(",").replace(/^,|,$/g, "");
    ary = exclude.split(",");

    for (i in uu.feat) {
      if (exclude.indexOf(i) < 0) {
        uu.feat.feat._run[i] = 2; // 2: loaded
      }
    }
  }
});

uu.feat.feat = {
  // loadFrom url
  _url: UU.BASE_DIR,

  // job database
  _job: { /* jobid: { fn, feats, timeout } */ },

  // status keeper
  _run: {}, // 1: loading, 2: loaded

  _collect: function(feat, rv) {
    var run = uu.feat.feat._run[feat] || (uu.feat.feat._run[feat] = 0);

    if (!run) { // loading(1) or loaded(2) -> skip
      (rv.indexOf(feat) < 0) && rv.push(feat); // pushed -> skip
      if (feat in uu.featureList) {
        uu.featureList[feat].split(UU.UTIL.SPLIT_TOKEN).forEach(function(v) {
          uu.feat.feat._collect(v.replace(UU.UTIL.TRIM, ""), rv); // recursive call
        });
      }
    }
  },

  _runner: function(jobid) {
    uu.feat.feat._job[jobid].feats.forEach(function(v) {

      if (uu.feat.feat._run[v] || uu.feat.feat._isDepend(v)) { // skip or lazy
        return;
      }

      // build script element
      // <script id="{feat}.js" type="text/javascript" charset="utf-8">
      var scr = uudoc.createElement("script");
      scr.id      = v + ".js";
      scr.type    = "text/javascript";
      scr.charset = "utf-8";

      if (UU.IE) {
        scr.onreadystatechange = function() {
          if (/loaded|complete/.test(this.readyState)) {
            (v in uu.feat) ? uu.feat.feat._done(jobid, v)
                           : uu.feat.feat._kill(jobid);
          }
        };
      } else {
        scr.onload = function() {
          (v in uu.feat) ? uu.feat.feat._done(jobid, v)
                         : uu.feat.feat._kill(jobid);
        };
        scr.onerror = function() {
          uu.feat.feat._kill(jobid);
        };
      }
      scr.setAttribute("src", uu.feat.feat._url + "/" + v + ".js");
      uudoc.getElementsByTagName("head")[0].appendChild(scr);
      uu.feat.feat._run[v] = 1;
    });
  },

  _isDepend: function(feat) {
    if (feat in uu.featureList) {
      var ary = uu.featureList[feat].split(UU.UTIL.SPLIT_TOKEN), v, i = 0;
      while ( (v = ary[i++]) ) {
        if (uu.feat.feat._run[v.replace(UU.UTIL.TRIM, "")] !== 2) { // depend
          return true;
        }
      }
    }
    return false; // not depend
  },

  _done: function(jobid, feat) {
    if (UU.CONFIG.DEBUG_MODE) { window.status += feat + ","; }

    uu.feat.feat._run[feat] = 2; // loaded

    var job = uu.feat.feat._job[jobid], fn = job.fn;

    if (!job) {
      throw "lost job";
    }
    job.feats.splice(job.feats.indexOf(feat), 1); // delete
    if (job.feats.length) {
      uu.feat.feat._runner(jobid); // next
    } else {
      delete uu.feat.feat._job[jobid]; // delete job
      fn && fn(true, ""); // load complete
    }
  },

  _kill: function(jobid) {
    var job = uu.feat.feat._job[jobid], fn = job.fn, feats;

    // remove <script id="{feat}.js"> element
    job.feats.forEach(function(v, i) {
      var e = uudoc.getElementById(v + ".js");
      e && e.parentNode.removeChild(e);
    });

    feats = job.feats.join(",");
    delete uu.feat.feat._job[jobid];
    fn && fn(false, feats); // fail
  },

  _watchdog: function() {
    var run = 0, time = +new Date, jobid;

    for (jobid in uu.feat.feat._job) {
      if (time > uu.feat.feat._job[jobid].timeout) {
        uu.feat.feat._kill(jobid);
      } else {
        ++run;
      }
    }
    run && setTimeout(uu.feat.feat._watchdog, UU.CONFIG.FEAT_TIMEOUT);
  }
};
