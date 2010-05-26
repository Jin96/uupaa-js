
// === uu.test ===
//{{{!depend uu
//}}}!depend

uu.tween.fade || (function(uu) {

uu.tween.fade = uutweenfade;
uu.tween.puff = uutweenpuff;
uu.tween.shrink = uutweenshrink;
uu.tween.movein = uutweenmovein;
uu.tween.moveout = uutweenmoveout;

uu.each({ fade:     uutweenfade,
          puff:     uutweenpuff,
          shrink:   uutweenshrink,
          movein:   uutweenmovein,
          moveout: uutweenmoveout }, function(fn, name) {
    uu.nodeSet[name] = function(a, b, c) {
        return uu.nodeSet(0, this, fn, a, b, c);
    }
});

// uu.tween.fade - fadeout / fadein
function uutweenfade(node,     // @param Node:
                     duration, // @param Number: duration
                     param) {  // @param Hash(= {}):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
            uu.mix(param, { o: uu.css.getOpacity(node) < 0.5 ? 1 : 0 });
        }}));
}

// uu.tween.puff - zoom out and fadeout
function uutweenpuff(node,     // @param Node:
                     duration, // @param Number: duration
                     param) {  // @param Hash(= {}):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
            var cs = uu.css(node, true);

            uu.mix(param, { w: "*1.5", h: "*1.5", o: 0,
                            x: "-" + parseInt(cs.width)  / 3,
                            y: "-" + parseInt(cs.height) / 3,
                            fs: "*1.5" });
        }}));
}

// uu.tween.shrink - shrink
function uutweenshrink(node,     // @param Node:
                       duration, // @param Number: duration
                       param) {  // @param Hash(= {}):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
            var cs = uu.css(node, true);

            uu.mix(param, { w: 0, h: 0, o: 0,
                            x: "+" + parseInt(cs.width)  / 2,
                            y: "+" + parseInt(cs.height) / 2,
                            fs: "/2" });
        }}));
}

// uu.tween.movein - movein + fadein
function uutweenmovein(node,     // @param Node:
                       duration, // @param Number: duration
                       param) {  // @param Hash(= { degree: 0 }):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
                var cs = uu.css(node, true), style = node.style,
                    angle, endX, endY, fs, w, h, o;

                angle = param.degree * Math.PI / 180;
                endX = parseInt(cs.left);
                endY = parseInt(cs.top);
                fs = parseInt(cs.fontSize);
                w = parseInt(cs.width);
                h = parseInt(cs.height);
                o = uu.css.getOpacity(node);
                style.left     = (Math.cos(angle) * 400 + endX) + "px";
                style.top      = (Math.sin(angle) * 400 + endY) + "px";
                style.width    = (w * 1.5) + "px";
                style.height   = (h * 1.5) + "px";
                style.fontSize = (fs * 1.5) + "px";
                uu.css.setOpacity(node, 0);

                uu.mix(param, { w: w, h: h, x: endX, y: endY, fs: fs });
            }, degree: 0, o: 1 }));
}

// uu.tween.moveout - moveout + fadeout
function uutweenmoveout(node,     // @param Node:
                        duration, // @param Number: duration
                        param) {  // @param Hash(= { degree: 0 }):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
                var cs = uu.css(node, true), angle, endX, endY;

                angle = param.degree * Math.PI / 180;
                endX = Math.cos(angle) * 400 + parseInt(cs.left);
                endY = Math.sin(angle) * 400 + parseInt(cs.top);

                uu.mix(param, { w: "*1.5", h: "*1.5", x: endX, y: endY, fs: "*1.5" });
            }, degree: 0, o: 0 }));
}

})(uu);

