// === Develop - Log Viewer ================================
// depend: dev,style,event,drag,firebuglite,msg
uu.feat.dev_viewer = {};

uu.log = function(format      // String: sprintf format
                  // args...  // Mix: sprintf args
                  ) {
  if (typeof format === "string" && format.indexOf("%") >= 0 && arguments.length > 1) {
    uu.logviewer.log.apply(uu.logviewer, arguments);
  } else {
    uu.logviewer.inspect.apply(uu.logviewer, arguments);
  }
};

uu.mix(uu.log, {
  clear:  function() { uu.logviewer.clear(); },
  hex:    function() { uu.logviewer.hex.apply(uu.logviewer, arguments); },
  config: function() { uu.msg.post(uu.logviewer, "config", arguments); }
});

/** Log Window
 *
 * @class
 */
uu.Class.Singleton("LogViewer", {
  construct: function() {
    this._uparound = 100;
    this._sort = false;
    this._stock = [];
    this._line = 0;
    this._depth = 2;
    this._enableFilter = false;
    this._filterExpr = null; // RegExp object
    this._elm = 0;
    this._minimize = 0;
    this._closed = 0;

    var me = this;
    uu.ready(function() {
      var v, i;
      me._elm = uu.node.insert(uu.Class.LogViewer.UI.WINDOW_FRAME);

      for (i in uu.Class.LogViewer.UI.WINDOW_STYLE) {
        v = uu.Class.LogViewer.UI.WINDOW_STYLE[i];
        uu.style.appendRule("dev", i, v);
      }
      uu.id("uuLogDepth").innerText = me._depth;

      me._put(); // Collected logs are output. 

      me._drag = new uu.Class.SimplyDrag(uu.id("uuLogFrame"), uu.id("uuLogTitle"));

      // disable Firebug button
      if (uu.firebug && uu.firebug.lite) {
        uu.style.show(uu.id("uuFirebug"), "inline");
      }
    });
  },

  msgbox: function(msg, p1, p2) {
    var cs, d;

    if (msg === "config") {
      switch (p1[0].toLowerCase()) {
      case "sort":    this._sort = !!p1[1]; break;
      case "filter":  this._enableFilter = !!p1[1];
                      rgexp && (this._filterExpr = p1[2]); break;
      case "rect":    uu.style.setRect(this._elm, p1[1]); break;
      case "depth":   this._depth = p1[1];
                      uu.id("uuLogDepth").innerText = this._depth;
                      break;
      case "depth+":  ++this._depth;
                      uu.id("uuLogDepth").innerText = this._depth;
                      break;
      case "depth-":  --this._depth;
                      if (this._depth < 0) { this._depth = 0; }
                      uu.id("uuLogDepth").innerText = this._depth;
                      break;
      case "wide":    cs = uu.style.getRect(this._elm);
                      uu.style.setRect(this._elm, {
                        w: cs.w + 100,
                        h: cs.h + 100
                      });
                      break;
      case "slime":   cs = uu.style.getRect(this._elm);
                      uu.style.setRect(this._elm, {
                        w: (cs.w - 100 < 400) ? 400 : cs.w - 100,
                        h: (cs.h - 100 < 230) ? 230 : cs.h - 100
                      });
                      break;
      case "clear":   this.clear(); break;
      case "head":    d = window.open().document;
                      d.write("<xmp>" + uudoc.getElementsByTagName("head")[0].outerHTML + "</xmp>");
                      d.close();
                      break;
      case "body":    d = window.open().document;
                      d.write("<xmp>" + uudoc.body.outerHTML + "</xmp>");
                      d.close();
                      break;
      case "toggle":  if (this._minimize) {
                        uu.style.setRect(this._elm, { h: this._elm.orgHeight });
                        this._minimize = 0;
                        this._elm.style.overflow = "auto";
                      } else {
                        cs = uu.style.getRect(this._elm);
                        this._elm.orgHeight = cs.h;
                        this._minimize = 1;
                        uu.style.setRect(this._elm, { h: 54 });
                        this._elm.style.overflow = "hidden";
                      }
                      break;
      case "open":    this._elm.style.display = "block";
                      this._closed = 0;
                      break;
      case "close":   this._elm.style.display = "none";
                      this._closed = 1;
                      break;
      case "firebug": uu.firebug.init();
                      break;
      }
    }
    return 0;
  },

  // uu.Class.LogViewer.clear - clear log
  clear: function() {
    if (this._elm) {
      uu.id("uuLogConsole").innerHTML = "";
    }
    this._stock = [];
    this._line = 0;
  },

  // uu.Class.LogViewer.log - Logging
  log: function(format /*, arg, ... */) {
    this._stock.push(uu.sprintf.apply(this, arguments));
    this._put();
  },

  // uu.Class.LogViewer.inspect - Humanize output, Object Reflection
  inspect: function(/* mix, ... */) {
    var me = this, nest = 0, max = this._depth, i = 0, sz = arguments.length;
    for (; i < sz; ++i) {
      me._stock.push(uu.inspect(arguments[i], me._sort, nest, max));
    }
    this._put();
  },

  _put: function() {
    if (this._closed) {
      this.clear();
      return;
    }
    if (this._elm && this._stock.length) {
      uu.id("uuLogConsole").innerHTML += "<br />" + this._stock.join(", ");

      this._stock.length = 0; // clear
      if (this._uparound && ++this._line > this._uparound) {
        this.clear(); // clear log
      }
    }
  }
});

uu.Class.LogViewer.UI = {
  WINDOW_FRAME:
    '<div id="uuLogFrame">'+
      '<dl>'+
        '<dt id="uuLogTitle">Depth: <span id="uuLogDepth"></span>'+
        '</dt>'+
        '<dd id="uuLogBody">'+
          '<table>' +
          '<tr><td>' +
          '<input type="button" value="CLR" onclick="uu.log.config(\'clear\')" />'+
          '<input type="button" value="HEAD" onclick="uu.log.config(\'head\')" />'+
          '<input type="button" value="BODY" onclick="uu.log.config(\'body\')" />'+
          '<input id="uuFirebug" type="button" value="Firebug" onclick="uu.log.config(\'firebug\')" />'+
          '<button id="uuLogToggle" onclick="uu.log.config(\'toggle\')">_</button>'+
          '<button id="uuLogClose" onclick="uu.log.config(\'close\')">x</button>'+
          '<input type="button" value="D--" onclick="uu.log.config(\'depth-\')" />'+
          '<input type="button" value="D++" onclick="uu.log.config(\'depth+\')" />'+
          '<input type="button" value="S" onclick="uu.log.config(\'slime\')" />'+
          '<input type="button" value="W" onclick="uu.log.config(\'wide\')" />'+
          '</td></tr>' +
          '</table>' +
          '<pre id="uuLogConsole"></pre>'+
        '</dd>'+
      '</dl>'+
    '</div>',
  WINDOW_STYLE: {
    "#uuLogFrame":
            "background-color: #EEF5FF; color: black; " +
            "border: 1px solid skyblue; " +
            "position: absolute; width: 400px; height: 230px; right: 10px; top: 10px; " +
            "overflow: auto; margin: 0; padding: 0; ",
    "#uuLogFrame dl":
            "margin: 0; padding: 0;",
    "#uuLogTitle":
            "font-weight: bold; font-family: Arial; font-size: 12pt; " +
            "background-color: #D0D8E0; color: #215DC6; border-bottom: 1px solid skyblue; " +
            "margin: 0; padding: 0; height: 24px;",
    "#uuLogBody":
            "margin: 0; padding: 0;",
    "#uuLogBody pre":
            "border: 0; margin: 0; padding: 0; color: black; background-color: #EEF5FF;",
    "#uuFirebug":
            "display: none;",
    "#uuLogToggle":
            "background-color: #e3e3e3; position: absolute; top: 1px; right: 22px; width: 20px; height: 22px;",
    "#uuLogClose":
            "background-color: #e3e3e3; position: absolute; top: 1px; right: 2px; width: 20px; height: 22px;",
    "#uuLogDepth":
            "color: #215DC6;"
  }
};

uu.logviewer = new uu.Class.LogViewer();
