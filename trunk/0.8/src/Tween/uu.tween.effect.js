
// === uu.test ===
//{{{!depend uu
//}}}!depend

uu.tween.fade || (function(uu) {

uu.each({ fade:         uutweenfade,
          puff:         uutweenpuff,
          flare:        uutweenflare,
          shrink:       uutweenshrink,
          movein:       uutweenmovein,
          moveout:      uutweenmoveout,
          highlight:    uutweenhighlight }, function(fn, name) {
    uu.tween[name] = fn;
    uu.nodeSet[name] = function(node, duration, param) {
        return uu.nodeSet(0, this, fn, node, duration, param);
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
                            y: "-" + parseInt(cs.height) / 3 },
                          uu.ver.jit ? { fs: "*1.5" } : {});
        }}));
}

// uu.tween.flare - flare
function uutweenflare(node,     // @param Node:
                      duration, // @param Number: duration
                      param) {  // @param Hash(= { parts: 10, range: 200 }):
    return uu.tween(node, duration, uu.arg(param, {
        init: function(node, param) {
            var opacity = uu.css.getOpacity(node), newNode, i = 0,
                parts = (360 / (param.parts || 10)) | 0,
                range = param.range || 200;

            uu.css.setOpacity(node, 0.5);

            for (; i < 360; i += parts) {
                newNode = document.body.appendChild(node.cloneNode(true));

                uutweenmoveout(newNode, speed, { degree: i, range: range,
                    after: function(newNode) {
                        newNode.parentNode.removeChild(newNode);
                    }
                });
            }

            uu.tween(node, speed, function() {
                uu.css.setOpacity(node, opacity);
            });
        }
    }));
}

// uu.tween.shrink - shrink
function uutweenshrink(node,     // @param Node:
                       duration, // @param Number: duration
                       param) {  // @param Hash(= {}):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
            var cs = uu.css(node, true);

            uu.mix(param, { w: 0, h: 0, o: 0,
                            x: "-" + parseInt(cs.width)  / 2,
                            y: "-" + parseInt(cs.height) / 2, fs: "/2" });
        }}));
}

// uu.tween.movein - movein + fadein
function uutweenmovein(node,     // @param Node:
                       duration, // @param Number: duration
                       param) {  // @param Hash(= { degree: 0, range: 200 }):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
                var cs = uu.css(node, true), style = node.style,
                    angle, endX, endY, fs, w, h, o, range = param.range || 200;

                angle = param.degree * Math.PI / 180;
                endX = parseInt(cs.left);
                endY = parseInt(cs.top);
                if (uu.ver.jit) {
                    fs = parseInt(cs.fontSize);
                }
                w = parseInt(cs.width);
                h = parseInt(cs.height);
                o = uu.css.getOpacity(node);
                style.left     = (Math.cos(angle) * range + endX) + "px";
                style.top      = (Math.sin(angle) * range + endY) + "px";
                style.width    = (w * 1.5) + "px";
                style.height   = (h * 1.5) + "px";
                if (uu.ver.jit) {
                    style.fontSize = (fs * 1.5) + "px";
                }
                uu.css.setOpacity(node, 0);

                uu.mix(param, { w: w, h: h, x: endX, y: endY },
                              uu.ver.jit ? { fs: fs } : {});
            }, degree: 0, o: 1 }));
}

// uu.tween.moveout - moveout + fadeout
function uutweenmoveout(node,     // @param Node:
                        duration, // @param Number: duration
                        param) {  // @param Hash(= { degree: 0, range: 200 }):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
                var cs = uu.css(node, true), angle, endX, endY,
                    range = param.range || 200;

                angle = param.degree * Math.PI / 180;
                endX = Math.cos(angle) * range + parseInt(cs.left);
                endY = Math.sin(angle) * range + parseInt(cs.top);

                uu.mix(param, { w: "*1.5", h: "*1.5", x: endX, y: endY },
                              uu.ver.jit ? { fs: "*1.5" } : {});
            }, degree: 0, o: 0 }));
}

// uu.tween.highlight - highlight color
function uutweenhighlight(node,     // @param Node:
                          duration, // @param Number: duration
                          param) {  // @param Hash(= { degree: 0 }):
    return uu.tween(node, duration, uu.arg(param, { init: function(node, param) {
            var comple = uu.color(uu.css(node).backgroundColor).comple();

            uu.mix(param, { bgc: comple + "" });
            uu.tween(node, duration, uu.mix({}, param, { bgc: "#fff", init: 0 }));
        }}));
}

})(uu);

