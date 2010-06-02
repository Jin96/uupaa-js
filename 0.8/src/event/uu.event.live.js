
// === uu.event.live ===
//{{{!depend uu
//}}}!depend

uu.event.live || (function(doc, uu) {

uu.event.live = uu.mix(live, {  // uu.event.live(cssSelector:String, eventTypeEx:EventTypeExString,
                                //               evaluator:Function/Instance)
                                //  [1][bind] uu.live("css > selector", "namespace.click", callback)
    has:    livehas,            // uu.event.live.has(cssSelector:String, eventTypeEx:EventTypeExString):Boolean
    unbind: liveunbind          // uu.event.live.unbind(cssSelector:String = void, eventTypeEx:EventTypeExString = void)
                                //  [1][unbind all]           uu.event.live.unbind()
                                //  [2][unbind all]           uu.event.live.unbind("selector")
                                //  [3][unbind one]           uu.event.live.unbind("selector", "click")
                                //  [4][unbind namespace all] uu.event.live.unbind("selector", "namespace.*")
                                //  [5][unbind namespace one] uu.event.live.unbind("selector", "namespace.click")
});
uu.nodeSet.live = NodeSetLive;      // NodeSet.live(cssSelector:String,
                                    //              eventTypeEx:EventTypeExString,
                                    //              evaluator:Function/Instance):NodeSet
uu.nodeSet.unlive = NodeSetUnlive;  // NodeSet.unlive(cssSelector:String = void,
                                    //                eventTypeEx:EventTypeExString = void):NodeSet

// uu.event.live
function live(selector,    // @param String "css > selector"
              eventTypeEx, // @param EventTypeExString: "namespace.click"
              evaluator,   // @param Function/Instance: callback function
              __data__) {  // @hidden Hash: data for recursive call
    function _liveClosure(event) { // @param EventObject:
        var target = event.target
//{{{!mb
                                  || event.srcElement || doc;
//}}}!mb

        event.xtarget = (target.nodeType === 3) ? target.parentNode
                                                : target;

        if (uu.match(selector, event.xtarget)) {
            event.xtype = (uu.event.xtypes[event.type] || 0) & 255;
//{{{!mb
            if (uu.ie) {
                if (!event.target) { // [IE6][IE7][IE8]
                    event.currentTarget = doc;
                }
                if (event.pageX === void 0) { // [IE6][IE7][IE8][IE9]
                    event.pageX = event.clientX + doc.html.scrollLeft;
                    event.pageY = event.clientY + doc.html.scrollTop;
                }
            }
//}}}!mb
            instance ? handler.call(evaluator, event) : evaluator(event);
        }
    }

    var instance = 0,
        handler = isFunction(evaluator) ? evaluator
                                        : (instance = 1, evaluator.handleEvent),
        // split token (ignore capture[+])
        //      "namespace.click+"
        //              v
        //      ["namespace.click+", "namespace", "click", "+"]
        token     = uu.event.parse.exec(eventTypeEx),
        ns        = token[1], // "namespace"
        eventType = token[2], // "click"
        capture   = 0,
        fixEventType = live.fix[eventType] || eventType;

    evaluator.liveClosure = _liveClosure;

    __data__ || (__data__ = live.db[selector + "\v" + eventTypeEx] = {
        s: selector,
        ns: ns,
        ex: eventTypeEx,
        unbind: []
    });

//{{{!mb
    if (uu.gecko) {
        if (eventType === "focus" || eventType === "blur") {
            capture = 1;
        }
    }
//}}}!mb

    __data__.unbind.push(function() {
        uu.event.detach(doc, fixEventType, _liveClosure, capture);
    });
    uu.event.attach(doc, fixEventType, _liveClosure, capture);

//{{{!mb
    if (uu.ie) {
        if (/submit$/.test(eventType)) {
            live(selector + " input[type=submit]," +
                 selector + " input[type=image]",
                 eventTypeEx.replace(/submit$/, "click"), evaluator, __data__);

        } else if (/change$/.test(eventType)) { // "change"
            live(selector,
                 eventTypeEx.replace(/change$/, "focus"), function(event) {
                     uu.event(event.srcElement, "uulive.change", evaluator);
                 }, __data__);

            live(selector,
                 eventTypeEx.replace(/change$/, "blur"), function(event) {
                     uu.event.unbind(event.srcElement, "uulive.change");
                 }, __data__);
        }
    }
//}}}!mb
}
live.db = {}; // { "selector\vnamespace.click": {...}, ... }
live.fix =
//{{{!mb
            uu.ie ? { focus: "focusin", blur: "focusout" } :
//}}}!mb
            uu.webkit ? { focus: "DOMFocusIn", blur: "DOMFocusOut" } : {};

// uu.event.live.has
function livehas(selector,      // @param String: "css > selector"
                 eventTypeEx) { // @param EventTypeExString: "namespace.click"
    var db = live.db[selector + "\v" + eventTypeEx];

    return db && selector === db.s && eventTypeEx === db.ex;
}

// uu.event.live.unbind
function liveunbind(selector,      // @param String(= void 0): "css > selector"
                    eventTypeEx) { // @param String(= void 0): "namespace.click"
    function run(fn) {
        fn();
    }
    var db = live.db,
        ns, data, i, unbind,
        mode = !selector    ? 1 : // [1]
               !eventTypeEx ? 2 : // [2]
               eventTypeEx.indexOf("*") < 0 ? 3 :  // [3][5]
               (ns = eventTypeEx.slice(0, -2), 4); // [4] "namespace.*" -> "namespace"

    for (i in db) { // i = "selector\vnamespace.click"
        data = db[i]; // data = { s:selector, ns:ns, ex:eventTypeEx, unbind:[closure] }
        unbind = 1;
        switch (mode) {
        case 2: unbind = selector === data.s; break; // [2]
        case 3: unbind = selector === data.s && eventTypeEx === data.ex; break; // [3][5]
        case 4: unbind = selector === data.s && ns === data.ns; // [4]
        }
        if (unbind) {
            uu.each(data.unbind, run);
            delete db[i];
        }
    }
}

// NodeSet.live
function NodeSetLive(cssSelector, // @param String:
                     eventTypeEx, // @param EventTypeExString:
                     evaluator) { // @param Function/Instance:
                                  // @return NodeSet:
    return uu.nodeSet.iter(0, this, live, cssSelector, eventTypeEx, evaluator);
}

// NodeSet.unlive
function NodeSetUnlive(cssSelector,   // @param String:
                       eventTypeEx) { // @param EventTypeExString:
                                      // @return NodeSet:
    return uu.nodeSet.iter(0, this, liveunbind, cssSelector, eventTypeEx);
}

})(document, uu);

