
// === uu.image / window.image ===
//{{{!depend uu
//}}}!depend

(this.uu || this).image || (function(namespace) {

//{{{!mb
var _uuimage = "data-uuimage";
//}}}!mb

namespace.image      = uuimage;     // uu.image(url:String, callback:Function):Image
namespace.image.size = uuimagesize; // uu.image.size(node:HTMLImageElement/HTMLCanvasElement):Hash

// uu.image - image loader
function uuimage(url,        // @param String:
                 callback) { // @param Function: callback({ img, ok, url, status, w, h })
                             //     ok      - Boolean: true is success
                             //     img     - Object: image object
                             //     status  - Number: status code, 0(loading...),
                             //                       200(ok), 404(ng)
                             //     w       - Number: width
                             //     h       - Number: height
                             // @return Image:
    function after(ok) {
        var v, i = -1, ary = uuimage.fn[url].concat(),
            arg = {
                img: img,
                status: ok ? 200 : 404,
                ok: ok,
                width: img.width,
                height: img.height
            };

        uuimage.fn[url] = []; // pre clear

        while ( (v = ary[++i]) ) {
            v(arg);
        }
    }

    var img = uuimage.db[url];

    if (img) { // cached or scheduled
        uuimage.fn[url].push(callback);
        img.ok && after(_true);
    } else {
        uuimage.db[url] = img = new Image();
        uuimage.fn[url] = [callback];
        img.ok = _false;
        img.onerror = function() {
            img.width = img.height = 0;
            after(img.ok = _false);
            img.onerror = img.onload = null;
        };
        img.onload = function() {
            if (img.complete
//{{{!mb
                || img.readyState === "complete"    // [IE8] readyState
//}}}!mb
                                                ) {
                after(img.ok = _true);
            }
            img.onerror = img.onload = null;
        };
        img.setAttribute("src", url);
    }
    return img;
}
uuimage.db = {}; // { url: Image, ... }
uuimage.fn = {}; // { url: [callback, ...] }

// uu.image.size - get image actual dimension
function uuimagesize(node) { // @param HTMLImageElement/HTMLCanvasElement:
                             // @return Hash: { w, h }
    // [Gecko][WebKit]
    if ("naturalWidth" in node) {
        return {
            w: node.naturalWidth,
            h: node.naturalHeight
        };
    }
//{{{!mb
    // http://d.hatena.ne.jp/uupaa/20090602
    var rs, rw, rh, w, h, hide, width = "width", height = "height";

    if (node.src) { // HTMLImageElement
        if (node[_uuimage] && node[_uuimage].src === node.src) {
            return node[_uuimage];
        }
        if (uu.ie) { // [IE]
            if (node.currentStyle) {
                hide = node.currentStyle.display === "none";
                hide && (node.style.display = "block");
            }
            rs = node.runtimeStyle;

            // keep runtimeStyle
            w = rs[width];
            h = rs[height];

            // override
            rs[width] = rs[height] = "auto";

            rw = node[width];
            rh = node[height];

            // restore
            rs[width] = w;
            rs[height] = h;

            hide && (node.style.display = "none");
        } else { // [Opera]
            // keep current style
            w = node[width];
            h = node[height];

            node.removeAttribute(width);
            node.removeAttribute(height);

            rw = node[width];
            rh = node[height];

            // restore
            node[width] = w;
            node[height] = h;
        }
        return node[_uuimage] = { w: rw, h: rh, src: node.src }; // bond
    }
//}}}!mb
    return { w: node[width], h: node[height] };
}

})(this.uu || this);
