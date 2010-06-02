
// === uu.event.edge ===
//{{{!depend uu
//}}}!depend

uu.event.edge || (function(win, uu) {

uu.event.edge = uueventedge; // uu.event.edge(event:EventObjectEx):Hash { x, y }

// uu.event.edge - get padding edge (cross browse offsetX/Y)
function uueventedge(event) { // @param EventObjectEx:
                              // @return Hash: { x, y }
                              //     x - Number: fixed offsetX
                              //     y - Number: fixed offsetY
    // http://d.hatena.ne.jp/uupaa/20100430/1272561922
    var style =
//{{{!mb
                uu.ie ? null :
//}}}!mb
                               getComputedStyle(event.xtarget, 0),
        x = event.offsetX || 0,
        y = event.offsetY || 0;

//{{{!mb
    if (uu.webkit) {
//}}}!mb
        x -= parseInt(style.borderTopWidth)  || 0; // "auto" -> 0
        y -= parseInt(style.borderLeftWidth) || 0;
//{{{!mb
    } else if (uu.opera) {
        x += parseInt(style.paddingTop)  || 0;
        y += parseInt(style.paddingLeft) || 0;
    } else if (uu.gecko || event.layer !== void 0) {
        x = (event.layerX || 0) - (parseInt(style.borderTopWidth)  || 0);
        y = (event.layerY || 0) - (parseInt(style.borderLeftWidth) || 0);
    } else if (uu.ie && uu.ver.browser > 8) { // [IE9+]
        x = win.event.offsetX;
        y = win.event.offsetY;
    }
//}}}!mb
    return { x: x, y: y };
}

})(this, uu);

