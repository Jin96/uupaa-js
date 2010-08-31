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
        kind: "UI", name: "Slider",
        rail: rail, grip: grip,
        vertical: 0, short: 0, min: 0, max: 100, step: 1, value: 0,
        change: null, mouseup: null, mousedown: null,
        gripWidth: 13, gripHeight: 18
    });
    param.step < 1 && (param.step = 1);
    param.keyCode = param.vertical ? { 38: -1, 40: 1 } : { 37: -1, 39: 1 };
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
        moveGrip(this, pageX + param.ox - dragInfo.ox,
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
        moveGrip(this, (pageX + param.ox - dragInfo.ox),
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
        var param = this.param,
            pp = 100 / (param.max - param.min);

        val = (val - param.min) * pp * (param.short ? 1 : 2);
        moveGrip(this, val, val, fx);
    }
    return this.param.value;
}

// inner -
function moveGrip(that, // @param this:
                  px,   // @param Number: pixel value
                  py,   // @param Number: pixel value
                  fx) { // @param Boolean: true is fx
    var param = that.param,
        x = 0,
        y = 0,
        w = param.max - param.min,
        tm = param.short ? 1 : 2,
        pp = 100 / w,
        round = param.step * pp * tm,
        threshold = pp * tm / 2;

    if (param.vertical) {
        y = parseInt((py + threshold) / round) * round;
        y = parseInt(uu.range(0, y, tm * 100));
        param.value = (y / tm / pp + param.min) | 0;
    } else {
        x = parseInt((px + threshold) / round) * round;
        x = parseInt(uu.range(0, x, tm * 100));
        param.value = (x / tm / pp + param.min) | 0;
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

// uu.Class.Slider.activate
function activate(param) { // @param Hash(= {}):
                           // @return Array: [SliderClassInstance, RailNode]
    var rail, grip;

    param = uu.arg(param, {
        min: 0,
        max: 100,
        value: 0,
        short: 0,
        change: null,
        mouseup: null,
        mousedown: null
    });
    param.gripWidth  = param.vertical ? 18 : 13;
    param.gripHeight = param.vertical ? 13 : 18;

    rail = uu.div("role,slider,tabindex,0,aria-live,polite,aria-valuemin,0,aria-valuemax,0,aria-valuenow,0",
                  "display,inline-block",
            uu.div());
    grip = rail.firstChild;;

    rail.className = param.vertical ? (param.short ? "uiVSliderShortRail"
                                                   : "uiVSliderLongRail")
                                    : (param.short ? "uiHSliderShortRail"
                                                   : "uiHSliderLongRail");
    grip.className = param.vertical ? "uiVSliderGrip"
                                    : "uiHSliderGrip";
    return [uu("Slider", rail, grip, param), rail];
}

// uu.Class.Slider.transrate
function transrate(node) { // @param Node:
                           // @return Array: [SliderClassInstance, RailNode, InputHiddenNode]
    // <input id="hogeid" class="hogeclass" type="range" />
    //          v
    //  <div id="hogeid-ui" class="hogeclass-ui slider" data-uuui="slider"><div class="grip" /></div>
    //  <input type="hidden" id="hogeid" class="" data-uuui="slider" style="display:none" value="50" min="0" max="100" onchange="" />

    // pick slider param
    var attrs = uu.attr(node),
        param = {
            max:    parseInt(attrs.max   || 0),
            min:    parseInt(attrs.min   || 0),
            step:   parseInt(attrs.step  || 1),
            short:  parseInt(attrs.short || 0),
            value:  parseInt(attrs.value || 0),
            change: node.onchange
        }, ary = activate(param), rail = ary[1],
        hidden = uu.input("type,hidden,data-uuui,silder", "display,none");

    node.id        && (hidden.id        = node.id);
    node.className && (hidden.className = node.className);
    hidden.max = attrs.max;
    hidden.min = attrs.min;
    hidden.step = attrs.step;
    hidden.value = attrs.value;
    hidden.style.cssText = node.style.cssText;

    node.id        && (rail.id        = node.id + "-ui");
    node.className && (rail.className = node.className + "-ui");
    uu.add(rail, node, "prev");
    uu.add(hidden, node, "prev");
    uu.node.remove(node);

    return [ary[0], rail, hidden];
}

// uu.Class.Slider.isTransrate
function isTransrate(node) { // @param Node
    var realyNodeType = uu.attr(node, "type");

    return (node.tagName + realyNodeType).toLowerCase() === "inputrange";
}

})(document, uu);

//}@ui
