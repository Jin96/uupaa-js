//{@ui

// --- Slider ---
(function(doc, uu) {

// uu.Class.Slider - generic Slider Widget manage class
uu.Class("Slider", {
    init:           init,           // init(rail:Node, grip:Node, param:Hash = {})
    handleEvent:    handleEvent,    // handleEvent(evt)
    msgbox:         msgbox,         // msgbox(msg, value) -> mix
                                    //  [1][set] uu.msg.post(*, "set", 50)
                                    //  [2][get] uu.msg.send(*, "get") -> 50
    info:           info,           // info():Hash
    value:          value           // value(val:Number = void, fx:Boolean = false):Number
                                    //  [1][set] value(50) -> 50
                                    //  [2][get] value()   -> 50
}, {
    activate:       activate,       // activate(param:Hash):Array
    transrate:      transrate,      // transrate(node:Node):Array
    isTransrate:    isTransrate     // isTransrate(node:Node)
});
uu.ui.bind("Slider", "activate",    activate);
uu.ui.bind("Slider", "transrate",   transrate);
uu.ui.bind("Slider", "isTransrate", isTransrate);

// uu.Class.Slider.init
function init(rail,    // @param Node: rail node
              grip,    // @param Node: grip node
              param) { // @param Hash(= {}): { vertical, long, min, max, step,
                       //                      value, change, mouseup, mousedown,
                       //                      gripWidth, gripHeight }
                       //    vertical   - Boolean(= false): true is vertical
                       //    long       - Boolean(= false):
                       //    node       - Node(= null): original node
                       //    min        - Number(= 0);
                       //    max        - Number(= 100):
                       //    step       - Number(= 1):
                       //    value      - Number(= 0):
                       //    change     - Function(= null):
                       //    mouseup    - Function(= null):
                       //    mousedown  - Function(= null):
                       //    gripWidth  - Number(= 13):
                       //    gripHeight - Number(= 18):
    var that = this;

    // node.ui - get UI instance
    rail.ui = function() {
        return that;
    };
    this.param = param = uu.arg(param, {
        name: "Slider", rail: rail, grip: grip,
        vertical: 0, long: 0, min: 0, max: 100, step: 1, value: 0,
        change: null, mouseup: null, mousedown: null,
        gripWidth: 13, gripHeight: 18
    });
    param.step < 1 && (param.step = 1);
    param.keyCode = param.vertical ? { 38: -1, 40: 1 } : { 37: -1, 39: 1 };
    param.ox =  param.vertical ? 0 : -((param.gripHeight / 2) | 0);
    param.oy = !param.vertical ? 0 : -((param.gripWidth  / 2) | 0);

    this.value(param.value);

    // rail drag events
    uu.bind(rail, uu.env.touch ? "touchstart"
                               : "mousedown,mousewheel", this);
    // key events
    uu.keydown(doc, function(evt) {
        if (rail === doc.activeElement) {
            var key = param.keyCode[uu.event.key(evt).code],
                shift = evt.shiftKey ? 10 : 1; // x10

            key && that.value(param.value + key * param.step * shift);
        }
    });
}

// uu.Class.Slider.handleEvent
function handleEvent(evt) {
    var code  = evt.code, rect,
        param = this.param,
        rail  = param.rail,
        pageX = evt.pageX,
        pageY = evt.pageY,
        dragInfo = rail["data-uuuidrag"],
        touches, finger, identifier, i; // for iPhone

    // init drag information
    if (!dragInfo) {
        rail["data-uuuidrag"] = dragInfo = {
            ox: 0, oy: 0, dragging: 0,
            id: 0, tap: 0 // for iPhone
        };
    }

    if (code === uu.event.codes.mousedown && !dragInfo.dragging) {
        if (uu.env.touch) {
            if (evt.touches) {
                finger = evt.touches[evt.touches.length - 1];
                pageX = finger.pageX;
                pageY = finger.pageY;
                identifier = finger.identifier;
            }
        }
        rect = uu.css.rect(rail, doc.html); // offset from <html>
        dragInfo.ox = rect.x - 3; // 3: magic word
        dragInfo.oy = rect.y - 3;
        dragInfo.id = identifier; // touch.identifier
        dragInfo.dragging = 1;
        ++dragInfo.tap;

        uu.bind(uu.ie ? rail : doc,
                uu.env.touch ? "touchmove+,touchend+"
                             : "mousemove+,mouseup+", this);
        rail.focus();
        move(this, pageX + param.ox - dragInfo.ox,
                   pageY + param.oy - dragInfo.oy, 1); // 1: fx

        param.mousedown && param.mousedown(evt, node, param, dragInfo);
    } else if (code === uu.event.codes.mouseup && dragInfo.dragging) {
        dragInfo.dragging = 0;
        param.mouseup && param.mouseup(evt, node, param, dragInfo);

        uu.unbind(uu.ie ? rail : doc,
                  uu.env.touch ? "touchmove+,touchend+"
                               : "mousemove+,mouseup+", this);
    } else if (code === uu.event.codes.mousemove && dragInfo.dragging) {
        if (uu.env.touch) {
            touches = evt.touches;
            if (touches) {
                i = touches.length;
                while (i--) {
                    finger = touches[i];
                    if (dragInfo.id === finger.identifier) {
                        pageX = finger.pageX;
                        pageY = finger.pageY;
                        break;
                    }
                }
            }
        }
        move(this, (pageX + param.ox - dragInfo.ox),
                   (pageY + param.oy - dragInfo.oy));

        param.mousemove && param.mousemove(evt, node, param, dragInfo);
        dragInfo.tap = 0;
    } else if (code === uu.event.codes.mousewheel) {
        rail.focus();
        this.value(param.value + evt.wheel * 10);
    } else if (code >= uu.event.codes.keydown && code <= uu.event.codes.keyup) {
        // keydown, keypress, keyup
        return;
    }
    return false; // uu.event.stop(evt)
}

// uu.Class.Slider.msgbox
function msgbox(msg, value) {
    switch (msg) {
    case "set": this.value(value); break;
    case "get": return this.param.value;
    }
    return value;
}

// uu.Class.Slider.info
function info() { // @return Hash: param
    return this.param;
}

// uu.Class.Slider.value
function value(val,  // @param Number(= void 0):
               fx) { // @param Boolean(= false):
                     // @return Number: current value
    if (val !== void 0) {
        var param = this.param, pp = 100 / (param.max - param.min);

        val = (val - param.min) * pp * (param.long ? 2 : 1);
        move(this, val, val, fx);
    }
    return this.param.value;
}

// inner - move grip
function move(that, // @param this:
              px,   // @param Number: pixel value
              py,   // @param Number: pixel value
              fx) { // @param Boolean: true is fx
    var param = that.param, x = 0, y = 0, w = param.max - param.min,
        tm = param.long ? 2 : 1, pp = 100 / w,
        round = param.step * pp * tm, threshold = pp * tm / 2;

    if (param.vertical) {
        y = parseInt((py + threshold) / round) * round;
        y = uu.range(0, y, tm * 100);
        param.value = Math.round(y / tm / pp + param.min);
        y |= 0;
    } else {
        x = parseInt((px + threshold) / round) * round;
        x = uu.range(0, x, tm * 100);
        param.value = Math.round(x / tm / pp + param.min);
        x |= 0;
    }

//{@fx
    if (fx) {
        uu.fx(param.grip, 150, { stop: 1, x: x, y: y });
    } else {
//}@fx
        param.grip.style.left = x + "px";
        param.grip.style.top  = y + "px";
//{@fx
    }
//}@fx
    // update caption
    param.rail.title = parseInt(param.value);

    // sync
    if (param.node) {
        // update original node.value
        param.node.value = param.value;

        if (param.change) {
            // fire original node.onchange event
            uu.event.fire(param.node, "change");
        }
    }
}

// uu.Class.Slider.activate
function activate(param) { // @param Hash(= {}):
                           // @return Array: [SliderClassInstance, RailNode]

    param = uu.arg(param, { min: 0, max: 100, value: 0, long: 0,
                            change: null, mouseup: null, mousedown: null });
    param.gripWidth  = param.vertical ? param.gripHeight : param.gripWidth;
    param.gripHeight = param.vertical ? param.gripWidth  : param.gripHeight;

    var rail = uu.div("tabindex,0", "display,inline-block", uu.div()),
        grip = rail.firstChild;

    rail.className = param.vertical ? (param.long ? "uiSliderVL" : "uiSliderVS")
                                    : (param.long ? "uiSliderHL" : "uiSliderHS");
    grip.className = param.vertical ? "uiSliderVGrip" : "uiSliderHGrip";

    uu("Slider", rail, grip, param);
    return rail;
}

// uu.Class.Slider.transrate
function transrate(node) { // @param Node:
                           // @return Array: [SliderClassInstance, RailNode, InputRangeNode]
    //
    // <input type="range" value="50" min="0" max="100" />
    //
    //          v
    //
    // <div class="uiSlider**"><div class="uiSlider*Grip" /></div>
    // <input type="range" value="50" min="0" max="100" style="display:none" />
    //

    // pick slider param
    var attrs = uu.attr(node),
        rail = activate({
            max:    parseInt(attrs.max   || 0),
            min:    parseInt(attrs.min   || 0),
            long:   parseInt(attrs.long  || 0),
            node:   node, // original node. <input type="range" />
            step:   parseInt(attrs.step  || 1),
            value:  parseInt(attrs.value || 0),
            change: uu.event.evaluator(node, "change").length
        });

    node.style.display = "none";
    uu.add(rail, node, "prev");

    return rail;
}

// uu.Class.Slider.isTransrate
function isTransrate(node) { // @param Node
    return (node.tagName + uu.attr(node, "type")).toLowerCase() === "inputrange";
}

})(document, uu);

uu.ready(function(uu) {
    var ss = uu.ss("ui"),
        img = uu.config.img + "ui.png",
        fmt = "background:url(@) no-repeat @px @px;position:@;width:@px;height:@px",
        relative = "relative",
        absolute = "absolute";

    ss.add(".uiSliderHL",    uu.f(fmt, img,  -15,   0, relative, 214,  20));
    ss.add(".uiSliderHS",    uu.f(fmt, img,  -15, -20, relative, 114,  20));
    ss.add(".uiSliderHGrip", uu.f(fmt, img,    0,   0, absolute,  13,  18));
    ss.add(".uiSliderVL",    uu.f(fmt, img, -230, -15, relative,  20, 214));
    ss.add(".uiSliderVS",    uu.f(fmt, img, -250, -15, relative,  20, 114));
    ss.add(".uiSliderVGrip", uu.f(fmt, img, -250,   0, absolute,  18,  13));
});

//}@ui
