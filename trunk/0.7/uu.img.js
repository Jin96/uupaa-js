
// === Image ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {
var _imgdb = {}, // { url: ImageObject, ... }
    _render = ((uu.gecko && uu.ver.re >= 1.92) || (uu.ie && uu.ver.ua >= 7));

uu.mix(uu.img, {
    load:       uuimgload,   // uu.img.load(url, fn) -> ImageObject
//  render:     uuimgrender, // uu.img.render(node, speed = 0) -> node
    actsize:    uuimgactsize // uu.img.actsize(node) -> { w, h }
});

// uu.img.load - delay image loader
function uuimgload(url,  // @param String:
                   fn) { // @param Function: callback(img, state, dim)
                         //     Object: image object
                         //     Number: state, 0(loading...),
                         //                    1(loaded), -1(error)
                         //     Hash: dim: { w, h }
                         // @return ImageObject:
  function _onimageload() {
    var v, i = 0, ary = img.uufn.slice(), // copy
        keep = { img: img, state: img.state,
                 dim: { w: img.width, h: img.height }};

    img.uufn = []; // clear
    while ( (v = ary[i++]) ) {
      try {
        v(keep.img, keep.state, keep.dim); // fn(imgObj, state, dim)
      } catch(err) {}
    }
  }
  var img;

  if (url in _imgdb) {
    img = _imgdb[url];
    img.uufn.push(fn); // stock
    img.state && _onimageload(); // -1 or 1
    return img;
  }
  _imgdb[url] = img = new Image();
  img.state = 0; // bond
  img.clear = function() { // bond
    delete _imgdb[url];
    img.onerror = img.onload = uuvain;
    img = void 0; // [IE6] fix memory leak
  };
  img.onerror = function() {
    img.state = -1; // error
    img.width = img.height = 0;
    _onimageload();
  };
  img.onload = function() {
    if (img.complete || img.readyState === "complete") { // [IE8] readyState
      img.state = 1; // loaded
      _onimageload();
    }
  };
  img.uufn || (img.uufn = []); // bond
  img.uufn.push(fn); // stock
  img.setAttribute("src", url);
  return img;
}

// uu.img.render
/* keep
function uuimgrender(node,    // @param HTMLImageElement: image node
                     speed) { // @param Number(= 0): render mode
                              //                     0 is quality, 1 is speed
                              // @return Node:
  if (_render && { img: 1, IMG: 1 }[node.tagName]) {
    var ns = node.style, spd = speed || 0;

    uu.ie ? (ns.msInterpolationMode = spd ? "nearest-neighbor" : "")
          : (ns.imageRendering      = spd ? "optimizeSpeed" : "auto");
  }
  return node;
}
 */

// uu.img.actsize - get image actual dimension,
// http://d.hatena.ne.jp/uupaa/20090602
function uuimgactsize(node) { // @param HTMLImageElement/HTMLCanvasElement:
                              // @return Hash: { w, h }
  var rs, rw, rh, w, h, BOND = "uuimgactsize";

  // for Firefox, Safari, Chrome
  if ("naturalWidth" in node) {
    return { w: node.naturalWidth, h: node.naturalHeight };
  }
  if ("src" in node) { // HTMLImageElement
    if (node[BOND] && node[BOND].src === node.src) {
      return node[BOND];
    }
    if (uu.ie) { // for IE
      rs = node.runtimeStyle;
      w = rs.width, h = rs.height; // keep runtimeStyle
      rs.width = rs.height = "auto"; // override
      rw = node.width;
      rh = node.height;
      rs.width = w, rs.height = h; // restore
    } else { // for Opera
      w = node.width, h = node.height; // keep current style
      node.removeAttribute("width");
      node.removeAttribute("height");
      rw = node.width;
      rh = node.height;
      node.width = w, node.height = h; // restore
    }
    return node[BOND] = { w: rw, h: rh, src: node.src }; // bond
  }
  // HTMLCanvasElement
  return { w: node.width, h: node.height };
}

})(window, document, uu);

