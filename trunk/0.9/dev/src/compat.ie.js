// Browser Compatibility for IE

//{@worker
//{@node
//{@ti
//{@mb
if (!(this.uu || this).env) {
    throw new Error("Compile Error: Need env.js");
}
if (!(this.uu || this).env.browser) {
    throw new Error("Compile Error: Excluding compat.ie.js");
}

(function(global,     // @param GlobalObject:
          lib,        // @param LibraryRootObject:
          document) { // @param Document/BlankObject: document or {}

var _ie6 = lib.env.ie === 6,
    _ie7 = lib.env.ie === 7,
    _ie8 = lib.env.ie === 8,
    _pt = /pt$/,
    _boxProperties = [
        "marginTop",
        "marginLeft",
        "marginRight",
        "marginBottom",
        "paddingTop",
        "paddingLeft",
        "paddingRight",
        "paddingBottom",
        "borderTopWidth",
        "borderLeftWidth",
        "borderRightWidth",
        "borderBottomWidth"
    ];

// <html5 tabs> [IE6][IE7][IE8]
function html5shiv() {
    var ary = ("abbr,article,aside,audio,canvas,datalist," +
               "details,eventsource,figure,footer,header," +
               "hgroup,mark,menu,meter,nav,output,progress," +
               "section,time,video").split(","),
        i = 0, iz = ary.length;

    for (; i < iz; ++i) {
        document.createElement(ary[i]);
    }
}

// <vml> [IE6][IE7][IE8]
function vmlshiv() {
    var ss = document.createStyleSheet(),
        ns = document.namespaces;

    if (!ns.v) {
        ns.add("v", "urn:schemas-microsoft-com:vml",           "#default#VML");
        ns.add("o", "urn:schemas-microsoft-com:office:office", "#default#VML");
    }
    ss.owningElement.id = "vmlshiv"; // <style id="vmlshiv"></style>
    ss.cssText =
        "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
        "v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath," +
        "v\:image,v\:line,v\:skew,v\:path,o\:opacity2" +
        "{behavior:url(#default#VML);display:inline-block}"; // [!] inline-block
}

// getComputedStyle [IE6][IE7][IE8]
function getComputedStyleIE678(node              // @param Node:
                               /*, pusedo */ ) { // @param Node: dummy
                                                 // @return Hash: { width: "123px", ... }
    // http://d.hatena.ne.jp/uupaa/20091212
    var RECTANGLE = { top: 1, left: 2, width: 3, height: 4 },
        UNITS = { m: 1, t: 2, "%": 3, o: 3 }, // em, pt, %, auto,
        cache = {
            "0px":  "0px",
            "1px":  "1px",
            "2px":  "2px",
            "5px":  "5px",
            thin:   "1px",
            medium: "3px",
            thick:  _ie8 ? "5px" : "6px"
        }, // [IE6][IE7] thick = "6px"
        rect, ut, v, w, x, i = 0, mem,
        style        = node.style,
        currentStyle = node.currentStyle,
        runtimeStyle = node.runtimeStyle,
        fontSize = currentStyle.fontSize,
        em = parseFloat(fontSize) * (_pt.test(fontSize) ? 4 / 3 : 1),
        rv;

    rv = new CSSStyleDeclaration(currentStyle);

    // calc: border*Width, padding*, margin*
    for (; (w = _boxProperties[i++]); ) {
        v = currentStyle[w];
        if (!(v in cache)) {
            x = v;
            ut = UNITS[v.slice(-1)];
            switch (ut) {
            case 1: x = parseFloat(v) * em; break;    // "12em"
            case 2: x = parseFloat(v) * 4 / 3; break; // "12pt"
            case 3: // %, auto
                    mem = [style.left, runtimeStyle.left];
                    runtimeStyle.left = currentStyle.left;
                    style.left = v;
                    x = style.pixelLeft;
                    style.left = mem[0];
                    runtimeStyle.left = mem[1];
            }
            cache[v] = ut ? (x + "px") : x;
        }
        rv[w] = cache[v];
    }
    // calc: top, left, width, height
    for (w in RECTANGLE) {
        v = currentStyle[w];
        ut = UNITS[v.slice(-1)];
        switch (ut) {
        case 1: v = parseFloat(v) * em;    break; // "12em"
        case 2: v = parseFloat(v) * 4 / 3; break; // "12pt"
        case 3: // %, auto
            switch (RECTANGLE[w]) {
            case 1: v = node.offsetTop;  break; // style.top
            case 2: v = node.offsetLeft; break; // style.left
            case 3: if (!rect) {
                        rect = node.getBoundingClientRect();
                    }
                    v = (node.offsetWidth || (rect.right - rect.left)) - // style.width
                        parseInt(rv.borderLeftWidth, 10) -
                        parseInt(rv.borderRightWidth, 10) -
                        parseInt(rv.paddingLeft, 10) -
                        parseInt(rv.paddingRight, 10);
                    v = v > 0 ? v : 0;
                    break;
            case 4: if (!rect) {
                        rect = node.getBoundingClientRect();
                    }
                    v = (node.offsetHeight || (rect.bottom - rect.top)) - // style.height
                        parseInt(rv.borderTopWidth, 10) -
                        parseInt(rv.borderBottomWidth, 10) -
                        parseInt(rv.paddingTop, 10) -
                        parseInt(rv.paddingBottom, 10);
                    v = v > 0 ? v : 0;
            }
        }
        rv[w] = ut ? (v + "px") : v;
    }
    rv.opacity = getOpacityIE678(node);
    rv.fontSize = em + "px";
    rv.cssFloat = currentStyle.styleFloat; // compat
    return rv;
}

function CSSStyleDeclaration(style) {
    this.backgroundColor    = style.backgroundColor;
    this.backgroundImage    = style.backgroundImage;
    this.backgroundPosition = style.backgroundPosition;
    this.backgroundRepeat   = style.backgroundRepeat;
    this.borderTopColor     = style.borderTopColor;
    this.borderTopStyle     = style.borderTopStyle;
    this.borderLeftColor    = style.borderLeftColor;
    this.borderLeftStyle    = style.borderLeftStyle;
    this.borderRightColor   = style.borderRightColor;
    this.borderRightStyle   = style.borderRightStyle;
    this.borderBottomColor  = style.borderBottomColor;
    this.borderBottomStyle  = style.borderBottomStyle;
    this.bottom             = style.bottom;
    this.clear              = style.clear;
    this.clipBottom         = style.clipBottom;
    this.clipLeft           = style.clipLeft;
    this.clipRight          = style.clipRight;
    this.clipTop            = style.clipTop;
    this.clipRight          = style.clipRight;
    this.color              = style.color;
    this.cursor             = style.cursor;
    this.direction          = style.direction;
    this.display            = style.display;
    this.fontFamily         = style.fontFamily;
    this.fontSize           = style.fontSize;
    this.fontStyle          = style.fontStyle;
    this.fontWeight         = style.fontWeight;
    this.letterSpacing      = style.letterSpacing;
    this.lineBreak          = style.lineBreak;
    this.lineHeight         = style.lineHeight;
    this.listStyleImage     = style.listStyleImage;
    this.listStylePosition  = style.listStylePosition;
    this.listStyleType      = style.listStyleType;
    this.maxHeight          = style.maxHeight;
    this.maxWidth           = style.maxWidth;
    this.minHeight          = style.minHeight;
    this.minWidth           = style.minWidth;
    this.position           = style.position;
    this.right              = style.right;
    this.textAlign          = style.textAlign;
    this.textIndent         = style.textIndent;
    this.textOverflow       = style.textOverflow;
    this.verticalAlign      = style.verticalAlign;
    this.visibility         = style.visibility;
    this.whiteSpace         = style.whiteSpace;
    this.wordBreak          = style.wordBreak;
    this.wordSpacing        = style.wordSpacing;
    this.wordWrap           = style.wordWrap;
    this.zIndex             = style.zIndex;
    this.zoom               = style.zoom;
}

// get opacity
function getOpacityIE678(node) { // @param Node:
                                 // @return Number:
    var opacity = node["data-opacity"]; // undefined or 1.0 ~ 2.0

    return opacity ? (opacity - 1) : 1;
}

// set opacity
function setOpacityIE678(node,      // @param Node:
                         opacity) { // @param Number: Number(0.0 - 1.0) absolute
    var style = node.style, alphaid, parent, filter, cs,
        dataid = "data-opacity";

    alphaid = "DXImageTransform.Microsoft.Alpha";

    if (!node[dataid]) {
        style.filter += " progid:" + alphaid + "()";
        if (_ie6 || _ie7) { // [FIX][IE6][IE7]
            cs = node.currentStyle;
            if (cs) {
                if (cs.width === "auto") {
                    style.zoom = 1;
                }
            }
        }
    }
    // normalize
    node.style.opacity = opacity = (opacity > 0.999) ? 1
                                 : (opacity < 0.001) ? 0 : opacity;

    node[dataid] = opacity + 1; // (1.0 ~ 2.0)

    // http://d.hatena.ne.jp/uupaa/20100819
    // attach temp parent
    if (!node.parentNode) {
        parent = document.body;
        parent.appendChild(node);
    }

    filter = node.filters.item(alphaid);

    if (opacity > 0 && opacity < 1) {
        filter.Enabled = true;
        filter.Opacity = (opacity * 100) | 0;
    } else {
        filter.Enabled = false;
    }
    if (parent) {
        parent.removeChild(node);
    }
    style.visibility = opacity ? "visible" : "hidden";
}

// setTransform
function setTransform2DIE678(node,    // @param Node:
                             param) { // @param Hash: { scaleX, scaleY, rotate,
                                      //                translateX, translateY }
                                      //     scaleX - Number:
                                      //     scaleY - Number:
                                      //     rotate - Number: degree
                                      //     translateX - Number:
                                      //     translateY - Number:

    var centerid = "data-transform2dcenter",
        transid = "data-transform2d",
        ident  = "DXImageTransform.Microsoft.Matrix",
        rotate = param.rotate * Math.PI / 180, // deg2rad
        cos    = Math.cos(-rotate),
        sin    = Math.sin(-rotate),
        // scale * rotate * translate
        mtx    = [ cos * param.scaleX, sin * param.scaleX, 0,
                  -sin * param.scaleY, cos * param.scaleY, 0,
                         param.translateX, param.translateY, 1],
        filter, rect, cx, cy;

    if (!node[centerid]) {
        // first touch -> get center position
        rect = node.getBoundingClientRect();
        cx = (rect.right  - rect.left) / 2; // center x
        cy = (rect.bottom - rect.top)  / 2; // center y

        node.style.filter += " progid:" + ident +
                             "(sizingMethod='auto expand')";
        node[centerid] = { cx: cx, cy: cy };
    }
    filter = node.filters.item(ident);

    filter.M11 = mtx[0];
    filter.M12 = mtx[1];
    filter.M21 = mtx[3];
    filter.M22 = mtx[4];
    filter.Dx  = mtx[6];
    filter.Dy  = mtx[7];

    // recalc center
    rect = node.getBoundingClientRect();
    cx = (rect.right  - rect.left) / 2;
    cy = (rect.bottom - rect.top)  / 2;

    // overwrite margin
    node.style.marginLeft = node[centerid].cx - cx + "px";
    node.style.marginTop  = node[centerid].cy - cy + "px";

    // bond
    node[transid] = param;
}

// get transform2d
function getTransform2DIE678(node) { // @param Node:
                                     // @return Hash: { scaleX, scaleY, rotate,
                                     //                 translateX, translateY }
    // "data-transform2d"
    return node["data-transform2d"] || {
                scaleX: 1,
                scaleY: 1,
                rotate: 0,
                translateX: 0,
                translateY: 0
            };
}

if (lib.env.ie < 9) {
    html5shiv();
}
if (lib.env.ie < 9) {
    vmlshiv();
}

(lib.impl || (lib.impl = {}));
lib.impl.getComputedStyleIE678 = getComputedStyleIE678;
lib.impl.getOpacityIE678       = getOpacityIE678;
lib.impl.setOpacityIE678       = setOpacityIE678;
lib.impl.setTransform2DIE678   = setTransform2DIE678;
lib.impl.getTransform2DIE678   = getTransform2DIE678;

})(this, this.uu || this, this.document);

//}@mb
//}@ti
//}@node
//}@worker

