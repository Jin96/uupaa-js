
// === uu.image ===
//{{{!depend uu
//}}}!depend

uu.image || (function(uu) {

//{{{!mb
var _uuimage = "data-uuimage";
//}}}!mb

uu.image      = uuimage;     // uu.image(url:String, callback:Function):Image
uu.image.size = uuimagesize; // uu.image.size(node:HTMLImageElement/HTMLCanvasElement):Hash

// uu.image - image loader
function uuimage(url,        // @param String:
                 callback) { // @param Function: callback({ img, ok, url, status, width, height })
                             //     ok     - Boolean: true is success
                             //     img    - Object: image object
                             //     status - Number: status code, 0(loading...),
                             //                                   200(ok), 404(ng)
                             //     width  - Number: width
                             //     height - Number: height
                             // @return Image:
    function after(ok) {
        var v, i = -1, ary = uuimage.fn[url].concat(),
            arg = { img: img, status: ok ? 200 : 404, ok: ok,
                    width: img.width, height: img.height };

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
                             // @return Hash: { width, height }
    if (node.naturalWidth) { // [Gecko][WebKit]
        return {
            width: node.naturalWidth,
            height: node.naturalHeight
        };
    }
//{{{!mb
    // http://d.hatena.ne.jp/uupaa/20090602
    var rs, rw, rh, w, h, hide, width = "width", height = "height";

    if (node.src) { // HTMLImageElement
        if (node[_uuimage] && node[_uuimage].src === node.src) {
            return node[_uuimage];
        }
        if (_ie) { // [IE]
            if (node.currentStyle) {
                hide = node.currentStyle.display === "none";
                hide && (node.style.display = "block");
            }
            rs = node.runtimeStyle;
            w = rs[width], h = rs[height]; // keep runtimeStyle
            rs[width] = rs[height] = "auto"; // override
            rw = node[width];
            rh = node[height];
            rs[width] = w, rs[height] = h; // restore
            hide && (node.style.display = "none");
        } else { // [Opera]
            w = node[width], h = node[height]; // keep current style
            node.removeAttribute(width);
            node.removeAttribute(height);
            rw = node[width];
            rh = node[height];
            node[width] = w, node[height] = h; // restore
        }
        return node[_uuimage] = { width: rw, height: rh, src: node.src }; // bond
    }
//}}}!mb
    return node;
}

})(uu);

