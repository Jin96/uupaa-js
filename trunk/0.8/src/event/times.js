
// === uu.event.times ===
//#include uupaa.js

uu.event.times || (function(win, uu) {

uu.event.times = uueventtimes; // uu.event.times(node:Node, eventTypeEx:EventTypeExString,
                               //                cyclic:Number, var_args:Function, ...):Node
                               // [1] uu.event.times(<div>, "click", 3, fn1, fn2, fn3)

// uu.event.times - cyclic events
function uueventtimes(node,             // @param Node: target node
                      eventTypeEx,      // @param EventTypeExString: "click,click+,..."
                      cyclic            // @param Number: cyclic times, 0 is infinite
                      /* var_args */) { // @param Function: callback functions
                                        // @return Node:
    function _wrap(evt) {
        callbacks[index++](evt);
        if (index >= callbacks.length) {
            index = 0;
            if (cyclic && !--cyclic) {
                uu.event(node, eventTypeEx, _wrap, true); // unbind
            }
        }
    }

    cyclic = cyclic || 0;

    var index = 0, callbacks = uu.array(arguments, 3);

    callbacks.length && uu.event(node, eventTypeEx, _wrap);
    return node;
}

})(this, uu);

