
// === uu.fx ===
//#include uupaa.js

uu.fx.fade || (function(uu) {

uu.each({ fade:         uufxfade,
          puff:         uufxpuff,
          flare:        uufxflare,
          shrink:       uufxshrink,
          movein:       uufxmovein,
          moveout:      uufxmoveout,
          highlight:    uufxhighlight }, function(fn, name) {
    uu.fx[name] = fn;
    uu.nodeSet[name] = function(node, duration, option) {
        return uu.nodeSet(0, this, fn, node, duration, option);
    }
});

// uu.fx.fade - fadeout / fadein
function uufxfade(node,     // @param Node:
                  duration, // @param Number: duration
                  option) { // @param Hash(= {}):
    return uu.fx(node, duration, uu.arg(option, { init: function(node, option) {
            uu.mix(option, { o: uu.css.opacity(node) < 0.5 ? 1 : 0 });
        }}));
}

// uu.fx.puff - zoom out and fadeout
function uufxpuff(node,     // @param Node:
                  duration, // @param Number: duration
                  option) { // @param Hash(= {}):
    return uu.fx(node, duration, uu.arg(option, { init: function(node, option) {
            var cs = uu.css(node, true);

            uu.mix(option, { w: "*1.5", h: "*1.5", o: 0,
                            x: "-" + parseInt(cs.width)  * 0.25,
                            y: "-" + parseInt(cs.height) * 0.25 },
                          uu.ver.jit ? { fs: "*1.5" } : {});
        }}));
}

// uu.fx.flare - flare
function uufxflare(node,     // @param Node:
                   duration, // @param Number: duration
                   option) { // @param Hash(= { parts: 10, range: 200 }):
    return uu.fx(node, duration, uu.arg(option, {
        o:      0,
        parts:  10,
        range:  200,
        init: function(node, option) {
            var cs = uu.css(node, true),
                x = parseInt(cs.left),
                y = parseInt(cs.top),
                newNode, i = 0, angle,
                p = uu.mix({}, option, {
                    w: parseInt(cs.width)  * 1.5,
                    h: parseInt(cs.height) * 1.5,
                    css: cs,
                    init: 0 // disable
                }),
                parts = (360 / p.parts) | 0;

            uu.ver.jit && (p.fs = parseInt(cs.fontSize) * 1.5);

            for (; i < 360; i += parts) {
                newNode = node.parentNode.appendChild(uu.node.clone(node, true));
                angle = i * Math.PI / 180;

                uu.fx(newNode, duration, uu.arg(p, {
                    x: Math.cos(angle) * p.range + x,
                    y: Math.sin(angle) * p.range + y,
                    init: function(newNode) {
                        uu.css.opacity(newNode, 0.5);
                    },
                    after: function(newNode, option, back) {
                        back || node.parentNode.removeChild(newNode);
                    }
                }));
            }
        }
    }));
}

// uu.fx.shrink - shrink
function uufxshrink(node,     // @param Node:
                    duration, // @param Number: duration
                    option) { // @param Hash(= {}):
    return uu.fx(node, duration, uu.arg(option, { init: function(node, option) {
            var cs = uu.css(node, true);

            uu.mix(option, { w: 0, h: 0, o: 0,
                            x: "-" + parseInt(cs.width)  * 0.5,
                            y: "-" + parseInt(cs.height) * 0.5, fs: "*0.5" });
        }}));
}

// uu.fx.movein - movein + fadein
function uufxmovein(node,     // @param Node:
                    duration, // @param Number: duration
                    option) { // @param Hash(= { degree: 0, range: 200 }):
    return uu.fx(node, duration, uu.arg(option, {
            degree: 0,
            o:      1,
            init:   function(node, option) {
                var cs = uu.css(node, true), style = node.style,
                    angle, endX, endY, fs, w, h, o, range = option.range || 200;

                angle = option.degree * Math.PI / 180;
                endX = parseInt(cs.left);
                endY = parseInt(cs.top);
                if (uu.ver.jit) {
                    fs = parseInt(cs.fontSize);
                }
                w = parseInt(cs.width);
                h = parseInt(cs.height);
                o = uu.css.opacity(node);
                style.left   = (Math.cos(angle) * range + endX) + "px";
                style.top    = (Math.sin(angle) * range + endY) + "px";
                style.width  = (w * 1.5) + "px";
                style.height = (h * 1.5) + "px";
                if (uu.ver.jit) {
                    style.fontSize = (fs * 1.5) + "px";
                }
                uu.css.opacity(node, 0);

                uu.ver.jit && (option.fs = fs);
                uu.mix(option, { w: w, h: h, x: endX, y: endY });
            }}));
}

// uu.fx.moveout - moveout + fadeout
function uufxmoveout(node,     // @param Node:
                     duration, // @param Number: duration
                     option) { // @param Hash(= { degree: 0, range: 200 }):
    return uu.fx(node, duration, uu.arg(option, { init: function(node, option) {
                var cs = uu.css(node, true), angle, endX, endY,
                    range = option.range || 200;

                angle = option.degree * Math.PI / 180;
                endX = Math.cos(angle) * range + parseInt(cs.left);
                endY = Math.sin(angle) * range + parseInt(cs.top);

                uu.mix(option, { w: "*1.5", h: "*1.5", x: endX, y: endY },
                              uu.ver.jit ? { fs: "*1.5" } : {});
            }, degree: 0, o: 0 }));
}

// uu.fx.highlight - highlight color
function uufxhighlight(node,     // @param Node:
                       duration, // @param Number: duration
                       option) {  // @param Hash(= { bgc: "#ff9", re: 1 }):
    return uu.fx(node, duration,
                 uu.arg(option, { bgc: "#ff9", begin: 1, reverse: 1 }));
}

})(uu);

