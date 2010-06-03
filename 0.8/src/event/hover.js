
// === uu.event.hover ===
//#include uupaa.js

uu.event.hover || (function(uu) {

uu.event.hover = uueventhover; // uu.event.hover(node:Node, enterExpression:Function/ClassNameString,
                               //                           leaveExpression:Function = void):Node
                               //  [1][callback]         uu.event.hover(node, function(){ alert("enter") },
                               //                                             function(){ alert("leave") }) -> node
                               //  [2][toggle className] uu.event.hover(node, "action") -> node

// uu.event.hover
function uueventhover(node,              // @param Node:
                      enterExpression,   // @param Function/ClassNameString: enter-callback or toggle-className
                      leaveExpression) { // @param Function(= void 0): leave-callback
                                         // @return Node:
    function mouseenter(event) {
        var rel = event.relatedTarget;

        // ignode mouse transit(mouseover, mouseout) in child node
        if (event.currentTarget !== rel && !uu.node.has(rel, event.currentTarget)) {
            event.xtype = uuevent.xtypes.mouseenter; // effect
            enterExpression(event, node); // enterExpression(event, node)
        }
        event.stop();
    }

    function mouseleave(event) {
        var rel = event.relatedTarget;

        if (event.currentTarget !== rel && !uu.node.has(rel, event.currentTarget)) {
            event.xtype = uuevent.xtypes.mouseleave; // effect
            leaveExpression(event, node); // leaveExpression(event, node)
        }
        event.stop();
    }

    function toggle() {
        uu.klass.toggle((node, enterExpression);
    }

//{{{!mb
    function mouseenterie(event) { // [IE]
        enterExpression(event, node);
    }

    function mouseleaveie(event) { // [IE]
        leaveExpression(event, node);
    }
//}}}!mb

    var isClassName = uu.isString(enterExpression);

//{{{!mb
    if (uu.ie) {
        uu.event(node, "mouseenter", isClassName ? toggle : mouseenterie);
        uu.event(node, "mouseleave", isClassName ? toggle : mouseleaveie);
    } else {
//}}}!mb
        uu.event(node, "mouseover+", isClassName ? toggle : mouseenter);
        uu.event(node, "mouseout+",  isClassName ? toggle : mouseleave);
//{{{!mb
    }
//}}}!mb
    return node;
}

})(uu);

