
// === Image ===
// depend: uu.js
uu.agein || (function(win, doc, uu) {

uu.img.load = uuimgload;    // uu.img.load(url, fn) -> Image
uu.img.size = uuimgsize;    // uu.img.size(node) -> { w, h }

// uu.img.load - delay image loader
function uuimgload(url,  // @param String:
                   fn) { // @param Function: callback({ img, code, w, h })
                         //     img  - Object: image object
                         //     code - Number: status code, 0(loading...),
                         //                                 200(ok), 404(ng)
                         //     w    - Number: width
                         //     h    - Number: height
                         // @return Image:
    function callback(code) {
        // closure vars: img, url
        var v, i = -1, ary = uuimgload._fn[url].concat(),
            arg = { img: img, code: img.code = code,
                    w: img.width, h: img.height };

        uuimgload._fn[url] = []; // pre clear

        while ( (v = ary[++i]) ) {
            v(arg);
        }
    }

    var img = uuimgload._db[url];

    if (img) { // cached or scheduled
        uuimgload._fn[url].push(fn);
        img.code === 200 && callback(200);
    } else {
        uuimgload._db[url] = img = new Image();
        uuimgload._fn[url] = [fn];
        img.code = 0; // loading...
        img.onerror = function() {
            img.width = img.height = 0;
            callback(404);
            img.onerror = img.onload = null;
        };
        img.onload = function() {
            if (img.complete || img.readyState === "complete") { // [IE8] readyState
                callback(200);
            }
            img.onerror = img.onload = null;
        };
        img.setAttribute("src", url);
    }
    return img;
}
uuimgload._db = {}; // { url: Image, ... }
uuimgload._fn = {}; // { url: [fn, ...] }

// uu.img.render
/* keep
//  _render = ((uu.gecko && uu.ver.render >= 1.92) || (uu.ie && uu.ver.browser >= 7));
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

// uu.img.size - get image actual dimension
// http://d.hatena.ne.jp/uupaa/20090602
function uuimgsize(node) { // @param HTMLImageElement/HTMLCanvasElement:
                              // @return Hash: { w, h }
    var rs, rw, rh, w, h, BOND = "uuimgactsize", hide;

    // for Firefox, Safari, Chrome
    if (node.naturalWidth) {
        return { w: node.naturalWidth, h: node.naturalHeight };
    }
    if (node.src) { // HTMLImageElement
        if (node[BOND] && node[BOND].src === node.src) {
            return node[BOND];
        }
        if (uu.ie) { // for IE
            if (node.currentStyle) {
                hide = node.currentStyle.display === "none";
                hide && (node.style.display = "block");
            }
            rs = node.runtimeStyle;
            w = rs.width, h = rs.height; // keep runtimeStyle
            rs.width = rs.height = "auto"; // override
            rw = node.width;
            rh = node.height;

            // restore
            rs.width = w, rs.height = h;
            hide && (node.style.display = "none");
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

