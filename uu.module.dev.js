/** Develop Module
 *
 * @author Takao Obara <com.gmail@js.uupaa>
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 * @see <a href="http://code.google.com/p/uupaa-js/">Home(Google Code)</a>
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/README.htm">README</a>
 */
(function() { var uud = document, uuw = window, uu = uuw.uu, UU = uuw.UU;

uu.module.dev = function() {};

// ---------------------------
// Performance and Log Module

/** Performance
 *
 * @class
 */
uu.module.perf = uu.klass.kiss();
uu.module.perf.prototype = {
  construct:
            function() {
              this.diff = [];
            },
  // uu.module.perf.run
  run:      function(times /* = 1 */, me /* = undefined */, fn, args /* Array( [arg,...] ) */) {
              this.diff.length = 0;
              var rv, i = 0, sz = times || 1;
              for (; i < sz; ++i) {
                rv = (new Date()).getTime();
                fn.apply(me, args || []);
                this.diff.push((new Date()).getTime() - rv);
              }
            },
  // uu.module.perf.report
  report:   function() {
              if (!this.diff.length) {
                return { total: 0, avg: 0, times: 0, dump: [] };
              }
              var total = 0;
              this.diff.forEach(function(v) { total += v; });
              return { total: total, avg: total / this.diff.length,
                       times: this.diff.length, dump: this.diff };
            }
};

/** Log2
 *
 * @class
 */
uu.module.log2 = uu.klass.singleton();
uu.module.log2.prototype = {
  construct:
            function(id /* = "uuLog" */, uparound /* = 100 */) {
              this._id = id || "uuLog";
              this._uparound = uparound || 100;
              this._sort = false;
              this._stock = [];
              this._line = 0;
              this._depth = 1;
              this._enableFilter = false;
              this._filterExpr = null; // RegExp object
              this._e = 0;
            },
  msgbox:   function(msg, p1, p2) {
              switch (msg) {
              case UU.MSG_CHANGE_READY_STATE: // post(p1= "W")
                if (p1 !== "W") { break; }
                this._createViewPort()
                this._applyViewPortStyle();
                this._put(); // 溜まったログを出力
                break;
              case "STYLE": // post(p1 = StyleHash( { cssProp: value, ... }) )
                uu.css.set(this._e, p1);
                break;
              case "SORT": // post(p1 = bool)
                this._sort = !!p1;
                break;
              case "FILTER": // post(p1 = bool, [p2 = RegExp Object])
                this._enableFilter = !!p1;
                if (p2) {
                  this._filterExpr = p2;
                }
                break;
              }
              return 0;
            },
  clear:    function() {
              if (this._e) { this._e.innerHTML = ""; }
              this._stock = [];
              this._line = 0;
            },
  // uu.module.log2.log - Logging - ログ出力
  log:      function(fmt /*, arg, ... */) {
              this._stock.push(uu.sprintf.apply(this, arguments));
              this._put();
            },
  // uu.module.log2.inspect - Humanize output, Object Reflection - オブジェクトを人間用に加工し出力する
  inspect:  function(/* mix, ... */) {
              var me = this, nest = 0, max = this._depth;
              uu.toArray(arguments).forEach(function(v) {
                me._stock.push(me._inspect(v, me._sort, nest, max));
              });
              this._put();
            },
  _createViewPort: function() {
              this._e = uu.id(this._id, false);
              if (!this._e) {
                this._e = uu.mix(uud.body.appendChild(uud.createElement("pre")), { id: this._id });
              }
            },
  _applyViewPortStyle: function() {
              var rule = "background-color: powderblue; color: black; display: none; "
                       + "position: absolute; width: 40em; height: 20em; right: 1em; bottom: 1em; "
                       + "overflow: auto;";
              uu.css.insertRule(uu.sprintf("#%s { %s }", this._id, rule));
              uu.css.setOpacity(this._e, 0.75);
            },
  _put:     function() {
              if (this._e && this._stock.length) {
                uu.css.show(this._e);
                this._e.innerHTML += "<br />" + this._stock.join(", ");
                this._stock.length = 0; // clear
                if (this._uparound && ++this._line > this._uparound) {
                  this.clear(); // clear log
                }
              }
            },
  _inspect: function(mix, sort, nest, max) {
              if (mix === null)   { return "null"; }
              if (mix === void 0) { return "undefined"; }
              if (uu.isB(mix) ||
                  uu.isN(mix))    { return mix.toString(); }
              if (uu.isS(mix))    { return '"' + mix + '"'; }
              if (uu.isF(mix))    { return this._getFunctionName(mix); }
              if (uu.isE(mix))    { return this._inspectNode(mix, sort, nest, max); }
              if (uu.isA(mix))    { return this._inspectArray(mix, sort, nest, max); }
              if (uu.isFA(mix))   { return this._inspectFakeArray(mix, sort, nest, max); }
              return this._inspectObject(mix, sort, nest, max);
            },
  _inspectArray:
            function(mix, sort, nest, max) {
              var rv = [], i, sz;
              if (nest + 1 > max) { return "[Array...]"; }

              for (i = 0, sz = mix.length; i < sz; ++i) {
                rv.push(this._inspect(mix[i], sort, nest + 1, max));
              }
              if (rv.length <= 1) {
                return "[" + rv.join(", <br /> ") + "]";
              }
              return "[<br /> " + rv.join(", <br /> ") + "<br />]";
            },
  _inspectFakeArray:
            function(mix, sort, nest, max) {
              var rv = [], i;
              if (nest + 1 > max) { return "[FakeArray...]"; }

              for (i in mix) {
                rv.push(uu.sprintf("%16s: %s", i, this._inspect(mix[i], sort, nest + 1, max))); // FakeArray
              }
              sort && rv.sort();
              if (uu.size(rv) <= 1) {
                return "{" + rv.join(", <br /> ") + "}";
              }
              return "{<br /> " + rv.join(", <br /> ") + "<br />}";
            },
  _inspectObject:
            function(mix, sort, nest, max) {
              var rv = [], i;
              if (nest + 1 > max) { return "{Object...}"; }

              for (i in mix) {
                rv.push(uu.sprintf("%16s: %s", i, this._inspect(mix[i], sort, nest + 1, max))); // Object
              }
              sort && rv.sort();
              if (uu.size(rv) <= 1) {
                return "{" + rv.join(", <br /> ") + "}";
              }
              return "{<br /> " + rv.join(", <br /> ") + "<br />}";
            },
  _inspectNode:
            function(mix, sort, nest, max) {
              var rv = [], name = [], i;
              if (nest + 1 > max) { return this._node2XPath(mix) + "..."; }

              switch (mix.nodeType) {
              case 1:  name.push("(ELEMENT_NODE)"); break;
              case 3:  return "(TEXT_NODE)[\""    + this._chopNodeValue(mix, 32) + "\"]";
              case 8:  return "(COMMENT_NODE)[\"" + this._chopNodeValue(mix, 32) + "\"]";
              case 9:  return "(DOCUMENT_NODE)";
              default: return uu.sprintf("(NODE[type:%d])", mix.nodeType);
              }
              name.push(this._node2XPath(mix));
              mix.id && name.push(" #" + mix.id); // add "#id"
              mix.className && name.push(" ." + mix.className); // add ".className"

              for (i in mix) {
                if (this._enableFilter && !this._filterExpr.test(i)) { continue; }

                switch (i) {
                case "style":
                case "innerHTML":
                case "innerText":
                case "outerHTML":
                  rv.push(uu.sprintf("%16s: ...", i));
                  break;
                default:
                  rv.push(uu.sprintf("%16s: %s", i, this._inspect(mix[i], sort, nest + 1, max))); // Object
                }
              }
              sort && rv.sort();
              return name.join("") + "{<br /> " + rv.join(", <br /> ") + "<br />}";
            },
  _getFunctionName:
            function(mix) { // {{
              return mix.toString().replace(/function\s*([^\(]*)\([^}]*}/, "$1(){}"); // ))
            },
  _chopNodeValue:
            function(mix, size /* = 32 */) {
              return mix.nodeValue.substring(0, size || 32).replace(/\n/, "\\n");
            },
  _node2XPath:
            function(elm) {
              if (!elm.parentNode || elm.nodeType !== 1) { return "/html"; }
              function F(e, tag) {
                var rv = 0, i = 0, c = e.parentNode.childNodes, sz = c.length;
                for (; i < sz; ++i) { if (c[i].nodeType !== 1) { continue; }
                                      if (c[i].tagName === tag) { ++rv; }
                                      if (c[i] === e) { return rv; } }
                return -1;
              }
              var rv = [], pos = F(elm, elm.tagName);
              while (elm && elm.nodeType === 1) {
                rv.push(elm.tagName.toLowerCase());
                elm = elm.parentNode;
              }
              rv.reverse();
              return "/" + rv.join("/") + "[" + pos + "]";
            }
};
uu.syslog = new uu.module.log2();
// override
uu.log = function(fmt /*, arg, ... */ /* or */ /* mix */) {
  var m = (uu.isS(fmt) && fmt.indexOf("%") >= 0 && arguments.length > 1)
        ? "log" : "inspect";
  uu.syslog[m].apply(uu.syslog, arguments);
};
uu.log.inspect = function(/* arg, ... */) {
  uu.syslog.inspect.apply(uu.syslog, arguments);
};
uu.log.clear = function() {
  uu.syslog.clear();
}



// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// --- tryout code --- 以下は開発中 ---


uu.mix(uu.mix, {
  // uu.mix.prefix - prefix付きのミックスイン - Object mixin with/without prefix
  prefix:   function(base, flavor, prefix /* = "" */, add /* = true */) {
              var i, p = prefix || "", sz = p.length;
              if (!sz) {
                return uu.mix(base, flavor);
              }
              if (add === void 0 || add) {
                for (i in flavor) {
                  base[p + i] = flavor[i];
                }
              } else {
                for (i in flavor) {
                  (i.indexOf(p) !== -1) ? (base[i.substring(sz)] = flavor[i])
                                        : (base[i] = flavor[i]);
                }
              }
              return base;
            }
});

uu.mix(uu.ajax, {
  // uu.ajax.loadSync - 同期通信 - Ajax sync request
  loadSync:
            function(url, fn /* = undefined */, data /* = undefined */, callbackFilter /* = undefined */) {
              !url && uu.die("uu.ajax.loadSync", "url", url);
              url = uu.url.abs(url), fn = fn || uu.mute, data = data || null;
              var rq = uu.request, cf = callbackFilter || rq.callbackFilter, uid = uu.uid("ajax"),
                  filescheme = url.indexOf("file://") !== -1, // file スキームでtrue
                  xhr = uuw.XMLHttpRequest ? new XMLHttpRequest()
                      : uuw.ActiveXObject  ? new ActiveXObject('Microsoft.XMLHTTP') : null;
              function H(v, k) { ("setRequestHeader" in xhr) && xhr.setRequestHeader(k, v); } // Opera8にはsetRequestHeader()メソッドが無い
              function fail(state) { (cf & 4) && fn(uid, 4, "", state || 400, url, 1); } // 400 "Bad Request"

              if (!xhr) { fail(); return; }

              try {
                xhr.open(data ? "POST" : "GET", url.replace(/&amp;/, "&"), false); // false = Sync
              } catch(e) { fail(); return; }

              uu.forEach(rq.header, H);
              data && H("application/x-www-form-urlencoded", "Content-Type");
              (cf & 1) && fn(uid, 1, "", 0, url, 0);
              xhr.send(data);
              // fileスキームでは成功時にstatusが0になる(Firefox2,Safari3,Opera9.5,IE6)
              if (xhr.status === 200 || filescheme && !xhr.status) {
                (cf & 2) && fn(uid, 2, xhr.responseText, 200, url, 0);
              } else {
                fail(xhr.status);
              }
            }
});
/** uu.script.load - スクリプトの読み込み - Load Script
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/DOCUMENT.htm#uu.script.load">uu.script.load</a>
 */
//uu.script.load = function(type /* = "text/x-uu-form" */, fn /* = undefined */, callbackFilter /* = undefined */) {
/*
  type = type || "text/x-uu-form", fn = fn || uu.mute;
  var uid = uu.uid("scriptLoad"), cf = callbackFilter || uu.request.callbackFilter;
  uu.attr('script[@type="' + type + '"]').forEach(function(v) {
    if (!v.src) { // sync
      v.data = uu.module.evaljs(v.text.replace(/[\n]/mg, ""));
      (cf & 1) && fn(uid, 1, "",       0, "", 0);
      (cf & 2) && fn(uid, 2, v.data, 200, "", 0, v); // eval後のデータを渡す
    } else { // async
      v.data = v.text = "";
      uu.ajax(v.src, function(uid, step, text) {
        switch (step) {
        case 1: (cf & 1) && fn(uid, 1, "",     0,   "", 0); break;
        case 2: v.text = text, v.data = uu.module.evaljs(v.text.replace(/[\n]/mg, ""));
                (cf & 2) && fn(uid, 2, v.data, 200, "", 0, v); break; // responseにeval後のデータを渡す
        case 4: (cf & 4) && fn(uid, 4, v.data, 200, "", 0, v); break;
        }
      }, 0, 7); // callbackFilter = SEND + OK + NG
    }
  });
};
 */

})(); // end (function())()
