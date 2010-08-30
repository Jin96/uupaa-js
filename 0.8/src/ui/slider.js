uu.Class.Slider || (function(doc, uu) {

// uu.Class.Slider - generic Slider Widget manage class
uu.Class("Slider", {
    init:         init,         // init(rail:Node, grip:Node, param:Hash = {})
    handleEvent:  handleEvent,  // handleEvent(evt)
    msgbox:       msgbox,       // msgbox(msg, value) -> mix
                                //  [1][set] uu.msg.send(*, "set", value)
                                //  [2][get] uu.msg.send(*, "get")
    info:         info,         // info():Hash
    value:        value         // value(val:Number = void, fx:Boolean = false):Number
                                //  [1][set] value(50) -> 50
                                //  [2][get] value()   -> 100
});

// uu.Class.Slider.init
function init(rail,    // @param Node: rail node
              grip,    // @param Node: grip node
              param) { // @param Hash(= {}): { vertical, short, min, max, step,
                       //                      value, change, mouseup, mousedown,
                       //                      gripWidth, gripHeight }
                       //    vertical   - Boolean(= false): true is vertical
                       //    short      - Boolean(= false):
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

    this.param = param = uu.arg(param, {
        kind: "silder", name: "slider",
        rail: rail, grip: grip,
        vertical: 0, short: 0, min: 0, max: 100, step: 1, value: 0,
        change: null, mouseup: null, mousedown: null,
        gripWidth: 13, gripHeight: 18
    });
    param.railz = param.short ? 100 : 200;
    param.keyCode = param.vertical ? { 38: -1, 40: 1 } : { 37: -1, 39: 1 };
    param.dpp = param.railz / (param.max - param.min); // dot per pitch
/*
    if (uu.config.aria) {
        uu.attr(rail, { "aria-valuemin": param.min,
                        "aria-valuemax": param.max });
    }
 */
    param.ox =  param.vertical ? 0 : -((param.gripHeight / 2) | 0);
    param.oy = !param.vertical ? 0 : -((param.gripWidth  / 2) | 0);

    this.value(param.value);

    // rail drag events
    uu.bind(rail, uu.env.touch ? "touchstart"
                               : "mousedown,mousewheel", this);
    // key events
    uu.keydown(doc, function(evt) {
        if (rail === doc.activeElement) {
            var key = param.keyCode[uu.event.key(evt).code];

            key && that.value(param.value + key * param.step);
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
        dragInfo.ox = rect.x;
        dragInfo.oy = rect.y;
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
        move(this, pageX + param.ox - dragInfo.ox,
                   pageY + param.oy - dragInfo.oy);

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
    case "set": this.value(value, 0); break;
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
        val = uu.range(this.param.min, val, this.param.max) * this.param.dpp;
        move(this, val, val, fx);
    }
    return this.param.value;
}

// inner -
function move(that, px, py, fx) {
    var param = that.param, w = param.step * param.dpp, x = 0, y = 0,
        arrange = param.step > 1 ? (param.step - 1) : 0;

    if (param.vertical) {
        y = parseInt((uu.range(0, py, param.railz) + arrange) / w) * w;
        param.value = y / param.dpp;
    } else {
        x = parseInt((uu.range(0, px, param.railz) + arrange) / w) * w;
        param.value = x / param.dpp;
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

/*
    if (uu.config.aria) {
        uu.attr(that.param.rail, "aria-valuenow",
                                 "slider value " + parseInt(param.value));
        // delay focus
        if (!that.delayFocusTimer) {
            that.delayFocusTimer = setTimeout(function() {
                that.delayFocusTimer = 0;
                param.rail.blur();
                param.rail.focus();
            }, 2000);
        }
    }
 */
    param.change && param.change(that, param.value);
}

})(document, uu);
