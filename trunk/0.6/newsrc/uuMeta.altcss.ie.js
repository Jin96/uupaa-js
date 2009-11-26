
// === uuMeta.altcss.ie ===
// depend: uuMeta, uuMeta.*, uuQuery
(function uuMetaAltCSSIEScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _styleSheetID = "uuAltCSSIE",
    _spacer = _mm.image.dir + "/1dot.gif",
    _job = { position: [], maxmin: [] },
    _ALPHA1 = "progid:DXImageTransform.Microsoft.AlphaImageLoader",
    _ALPHA2 = " " + _ALPHA1 + "(src='#',sizingMethod='image')",
    _ALPHA_REPLACE_SRC = /#/,
    _MAXMIN_PERCENT = /[\d\.]+%$/,
    _MAXMIN_KEYWORD = /^(inherit|none|auto)$/,
    _MAXMIN_BLOCK_LEVEL = { block: 1, "inline-block": 1, "table-cell": 1 };

// === uuMeta.altcss.ie.position ===
// care: position: absolute bug(cannot select text) for IE6
// care: position: fixed for IE6
// care: smooth scroll for IE6
// care: background image cache for IE6

// uuMeta.altcss.ie.position - apply position
function position() {
  if (!_job.position.length) { return; }

  var ary = [], v, w, i = 0, iz = _job.position.length,
      vp = _mm.style.getViewport(), cs, p;

  for (; i < iz; ++i) {
    v = _job.position[i];
    if (v && (p = v.uuCSSPosition)) {
      cs = v.currentStyle;
      w = _mm.style.toPixel(v, p.vcss, 1);
      p.vpx = (p.mode & 0x1) ? (_mm.style.getPixel(v, "paddingTop") + w)
                             : (vp.h - v.offsetHeight - w);
      w = _mm.style.toPixel(v, p.hcss, 1);
      p.hpx = (p.mode & 0x4) ? (_mm.style.getPixel(v, "paddingLeft") + w)
                             : (vp.w - v.offsetWidth - w);
      ary.push(v);
    }
  }
  // http://www.microsoft.com/japan/msdn/columns/dude/dude061198.aspx
  ary.length && document.recalc(); // update

  _job.position = ary;
}

// uuMeta.altcss.ie.position.init - init position
function positionInit(context) { // @param Node: context
                                 // @return NodeArray:
  function markup(elm) {
    rv.push(function() {
      var st = elm.style;
      // text selection bug
      if (!_ua.quirks) {
        st.height = "100%";
//      st.margin  = "0"; // ToDo
//      st.padding = "0"; // ToDo
      }
      st.backgroundAttachment = "fixed"; // smooth scroll
      !_mm.style.getBackgroundImage(elm) &&
          (st.backgroundImage = "url(none)");
    });
  }
  var rv = [];

  markup(uuQuery.tag("html")[0]); // <html>
  markup(document.body);          // <body>

  rv.push(function() {
    try {
      document.execCommand("BackgroundImageCache", false, true);
    } catch(err) {}
  });
  rv.push(function() {
    _mm.style.sheet.create(_styleSheetID);
    _mm.style.sheet.insertRule(_styleSheetID,
      ".uuposfix", // not "uucssposfix"
      ("z-index:5000;" +
       "behavior:expression(" +
       "this.style.pixelTop=document.#.scrollTop+this.uuCSSPosition.vpx," +
       "this.style.pixelLeft=document.#.scrollLeft+this.uuCSSPosition.hpx)").
      replace(/#/g, _ua.quirks ? "body" : "documentElement")
    );
  });
  return rv;
}

// uuMeta.altcss.ie.posfxd.markup - markup position fixed nodes
function positionMarkup(node) { // @param Node: context
  if ("uuCSSPosition" in node) { return; } // bonded

  var vp = _mm.style.getViewport(), rect = _mm.style.getSize(node),
      cs = node.currentStyle,
      v = cs.top  !== "auto", // vertical
      h = cs.left !== "auto", // horizontal
      pxfn = _mm.style.getPixel;

  _job.position.push(node);

  node.uuCSSPosition = { // bond
    mode: (v ? 1 : 2) | (h ? 4 : 8), // 1:top, 2:bottom, 4:left, 8:right
    vcss: v ? cs.top : cs.bottom,
    hcss: h ? cs.left : cs.right,
    vpx: v ? (pxfn(node, "paddingTop") + pxfn(node, "top"))
           : (vp.h - rect.h - pxfn(node, "bottom")),
    hpx: h ? (pxfn(node, "paddingLeft") + pxfn(node, "left"))
           : (vp.w - rect.w - pxfn(node, "right"))
  };
  node.className += " uuposfix";
  node.style.position = "absolute"; // position:fixed -> position:absolute
}

// === uuMeta.altcss.ie.alphapng ===
// care: alpha.png for IE6

// uuMeta.altcss.ie.alphapng - apply alpha png filter
function alphapng(ary) { // @param NodeArray:
  var v, i = 0, hash;

  while ( (v = ary[i++]) ) {
//  hash = _mm.bond(v, "uuAltCSS.ie.alphapng");
    hash = _mm.getData(v, "uuAltCSS.ie.alphapng");
    if (!hash || !hash.efx) {
      hash.efx = 1;

      v.style.filter += _ALPHA2.replace(_ALPHA_REPLACE_SRC, v.src);
      v.src = _spacer;
      (v.tagName === "IMG") ? (v.width = hash.w, v.height = hash.h)
                            : (v.style.zoom = 1);
    }
  }
}

// uuMeta.altcss.ie.alphapng.undo - undo
function alphapngUndo(nodeArray) { // @param NodeArray:
  function removeFilter(filter) {
    var rv = [], token = _mm.splitToken(v.style.filter, " ", 0),
        v, i = 0;

    while ( (v = token[i++]) ) {
      if (v.indexOf(_ALPHA1) < 0) {
        rv.push(v);
      }
    }
    return rv.join(" ");
  }

  var v, i = 0, hash;

  while ( (v = nodeArray[i++]) ) {
//    hash = _mm.bond(v, "uuAltCSS.ie.alphapng");
    hash = _mm.getData(v, "uuAltCSS.ie.alphapng");
    if (hash.efx) {
      hash.efx = 0;
      v.src = hash.src;
      v.style.filter = removeFilter(v.style.filter);
    }
  }
}

// uuMeta.altcss.ie.alphapng.query - query alpha png nodes
function alphapngQuery(context) { // @param Node: context
                                  // @return NodeArray:
  var rv = [], v, i = 0,
      ary = uuQuery('img[src$=".png"],input[type=image][src$=".png"]',
                    context),
      idx1 = ".alpha.png", idx2 = " alpha ";

  while ( (v = ary[i++]) ) {
    if (v.src.lastIndexOf(idx1) >= 0 ||
        (" " + v.className + " ").indexOf(idx2) >= 0) {
      rv.push(v);
/*
      _mm.bond(v, "uuAltCSS.ie.alphapng",
               { efx: 0, src: v.src, w: v.width, h: v.height });
 */
      _mm.setData(v, "uuAltCSS.ie.alphapng",
                  { efx: 0, src: v.src, w: v.width, h: v.height });
    }
  }
  return rv;
}

// === uuMeta.altcss.ie.disptbl ===
// care: -uu-display: table: for IE6, IE7
function disptbl(ary) { // @param NodeArray:
  var v, i = 0, j, tbl, row, cell,
      doc = document;

  while ( (v = ary[i++]) ) {
    tbl = doc.createElement("table");
    // copy attrs
    tbl.id = v.id;
    tbl.title = v.title;
    tbl.className = v.className;
    // copy style
    tbl.style.cssText = v.style.cssText;
    tbl.style.borderCollapse = "collapse";
    tbl.setAttribute("uuCSSLock", 1); // bond

    row = tbl.insertRow(); // add last row
    row.setAttribute("uuCSSLock", 1); // bond

    for (j = v.firstChild; j; j = j.nextSibling) {
      cell = row.insertCell(); // add last cell
      // copy attrs
      cell.id = j.id;
      cell.title = j.title;
      cell.className = j.className;
      // copy style
      cell.style.cssText = j.style.cssText;
      cell.style.margin = "0"; // force margin: 0
      // copy event handler(click, dblclick only)
      cell.onclick = j.onclick;
      cell.ondblclick = j.ondblclick;
      cell.setAttribute("uuCSSLock", 1); // bond

      while (j.firstChild) {
        cell.appendChild(j.removeChild(j.firstChild));
      }
    }
    v.parentNode.replaceChild(tbl, v);
  }
};

// === uuMeta.altcss.ie.maxmin ===
// care: max-width, min-width, max-height, min-height for IE6, IE7(td, th only)
function maxmin() {
  var elm, i = 0, hash,
      calcMaxWidth, calcMinWidth, calcMaxHeight, calcMinHeight,
      run, width, height, rect;

  while ( (elm = _job.maxmin[i++]) ) {
    hash = elm.uuCSSMaxMin;

    calcMaxWidth  = maxminSize(elm, hash, "maxWidth", 1);
    calcMinWidth  = maxminSize(elm, hash, "minWidth", 1);
    calcMaxHeight = maxminSize(elm, hash, "maxHeight");
    calcMinHeight = maxminSize(elm, hash, "minHeight");

    // recalc
    if (calcMaxWidth || calcMinWidth) {

      // recalc max-width
      if (calcMinWidth > calcMaxWidth) {
        calcMaxWidth = calcMinWidth;
      }

      // recalc width
      // width: auto !important
      run = elm.runtimeStyle.width;  // keep runtimeStyle.width
      elm.runtimeStyle.width = hash.orgWidth;
      elm.style.width = "auto";
      rect = elm.getBoundingClientRect(); // re-validate
      width = rect.right - rect.left;

      elm.style.width = hash.orgWidth; // o
      elm.runtimeStyle.width = run; // restore style

      // recalc limits
      if (width > calcMaxWidth) {
        width = calcMaxWidth;
        elm.style.pixelWidth = width;
      } else if (width < calcMinWidth) {
        width = calcMinWidth;
        elm.style.pixelWidth = width;
      }
    }

    if (calcMaxHeight || calcMinHeight) {

      // recalc max-height
      if (calcMinHeight > calcMaxHeight) {
        calcMaxHeight = calcMinHeight;
      }

      // recalc height
      // height: auto !important
      run = elm.runtimeStyle.height;  // keep runtimeStyle.height
      elm.runtimeStyle.height = hash.orgHeight;
      elm.style.height = "auto";
      rect = elm.getBoundingClientRect(); // re-validate
      height = rect.bottom - rect.top;

      elm.style.height = hash.orgHeight; // o
      elm.runtimeStyle.height = run; // restore style

      // recalc limits
      if (height > calcMaxHeight) {
        height = calcMaxHeight;
        elm.style.pixelHeight = height;
      } else if (height < calcMinHeight) {
        height = calcMinHeight;
        elm.style.pixelHeight = height;
      }
    }
  }
};

function maxminSize(elm, hash, prop, horizontal) {
  var rv = 0, rect;

  if (hash[prop] !== "") {
    if (_MAXMIN_PERCENT.test(hash[prop])) {
      rect = elm.parentNode.getBoundingClientRect();
      rv = parseFloat(hash[prop]);
      rv = (horizontal ? (rect.right - rect.left)
                       : (rect.bottom - rect.top)) * rv / 100;
    } else {
      rv = _mm.style.toPixel(elm, hash[prop], 1);
    }
  }
  return rv;
}

function maxminMarkup(context) {
  var rv = [], xw, nw, xh, nh,
      ie7 = _ua.ie7,
      node = _ua.ie6 ? uuQuery.tag("*", context)
                     : uuQuery("td,th", context), // IE7 td, th
      v, i = 0, cs,
      MAXMIN_KEYWORD = _MAXMIN_KEYWORD,
      MAXMIN_BLOCK_LEVEL = _MAXMIN_BLOCK_LEVEL;

  while ( (v = node[i++]) ) {
    cs = v.currentStyle;
    if (ie7 || MAXMIN_BLOCK_LEVEL[cs.display]) {
      xw = cs["max-width"]  || cs.maxWidth || ""; // length | % | none
      nw = cs["min-width"]  || cs.minWidth || ""; // length | %
      xh = cs["max-height"] || cs.maxHeight|| ""; // length | % | none
      nh = cs["min-height"] || cs.minHeight|| ""; // length | %
                                                  // (ie6 default "auto")
      MAXMIN_KEYWORD.test(xw) && (xw = "");
      MAXMIN_KEYWORD.test(nw) && (nw = "");
      MAXMIN_KEYWORD.test(xh) && (xh = "");
      MAXMIN_KEYWORD.test(nh) && (nh = "");

      if (xw === "" && nw === "" &&
          xh === "" && nh === "") {
        if ("uuCSSMaxMin" in v) {
          delete v["uuCSSMaxMin"];
        }
        continue; // exclude
      }

      _mm.mix(v, {
        uuCSSMaxMin: {}
      }, 0, 0);
      _mm.mix(v.uuCSSMaxMin, {
        maxWidth: xw,
        minWidth: nw,
        maxHeight: xh,
        minHeight: nh
      });
      _mm.mix(v.uuCSSMaxMin, {
        orgWidth:  v.currentStyle.width,
        orgHeight: v.currentStyle.height
      }, 0, 0);
      rv.push(v);
    }
  }
  _job.maxmin = rv;
}

// --- initialize / export ---
_mm.altcss.ie = {
  position: _mm.mix(position, {
    init:   positionInit,
    markup: positionMarkup
  }),
  alphapng: _mm.mix(alphapng, {
    undo:   alphapngUndo,
    query:  alphapngQuery
  }),
  disptbl:  disptbl,
  maxmin:   _mm.mix(maxmin, {
    size:   maxminSize,
    markup: maxminMarkup
  })
};

})(); // uuMeta.altcss.ie scope

