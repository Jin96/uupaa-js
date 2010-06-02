
// === uu.node.clone ===
//{{{!depend uu
//}}}!depend

uu.node.clone || (function(uu) {

uu.node.clone = uunodeclone;  // uu.node.clone(parent:Node):Node

var DATA_UUGUID = "data-uuguid",
    DATA_UUEVENT = "data-uuevent",
    _ready = uu.ready;

// uu.node.clone - clone node, clone data, clone attached events
function uunodeclone(parent,  // @param Node: parent node
                     quick) { // @param Boolean(= false): true is quick clone
                              // @return Node: cloned node
    function cloneData(sourceNode, clonedNode) {
        var key, data = sourceNode[DATA_UUEVENT],
            handler = uu.data.handler, i, iz;

        // new nodeid
        _ready.copyNodeData && (clonedNode[DATA_UUGUID] = 0); // reset
        uu.nodeid(clonedNode);

        // bind event
        for (key in data) {
            if (key !== "types") { // skip node["data-uuevent"].types
                for (i = 0, iz = data[key].length; i < iz; ++i) {
                    uu.event(clonedNode, key, data[key][i]);
                }
            }
        }

        // clone UI state
        if (!_ready.copyUIState) {
            if (/^(?:checkbox|radio)$/.test(sourceNode.type || "")) {
                clonedNode.checked = sourceNode.checked;
            }
        }

        // extras data handler
        for (key in handler) {
            sourceNode[key] && handler(key, sourceNode, "cloneNode",
                                       { copiedAttr: copiedAttr,
                                         clonedNode: clonedNode });
        }
    }

    function drillDown(node, clone) { // recursive
        for (; node; node = node.nextSibling) {
            if (node.nodeType === 1) { // 1: ELEMENT_NODE
                cloneData(node, clone);
                drillDown(node.firstChild, clone.firstChild);
            }
        }
    }

    function reverseFetch(node, clone) {
        var cloneList = uu.tag("*", clone),
            i = -1, nodeid, sourceNode, clonedNode;

        while ( (clonedNode = cloneList[++i]) ) {
            nodeid = clonedNode[DATA_UUGUID];
            if (nodeid) {
                sourceNode = uu.nodeid.toNode(nodeid); // nodeid -> node
                cloneData(sourceNode, clonedNode);
            }
        }
    }

    var rv;

    if (parent.nodeType === 1) { // 1: ELEMENT_NODE
        if (_ready.copyEvent || _ready.copyNodeData) { // [IE] bugfix
            rv = uu.div();
            rv.innerHTML = parent.cloneNode(true).outerHTML;
            if (quick) {
                rv = rv.firstChild;
            } else {
                reverseFetch(parent, rv);
            }
        } else {
            rv = parent.cloneNode(true);
            if (!quick) {
                cloneData(parent, rv);
                drillDown(parent.firstChild, rv.firstChild);
            }
        }
    }
    return rv;
}

uu.ready(function() {
    var o = true, x = false,
        button, clone, evt, fired = 0, nodeData = "data-mydata";

    uu.mix(_ready, {
        copyAttr: o,        //  copy node.setAttribute(attr)
        copyEvent: x,       //  copy node.addEventListener/attachEvent("click") [IE6][IE7][IE8]
        copyUIState: x,     //  copy node.checked
        copyNodeData: x     //  copy node["data-***"] [IE6][IE7][IE8][IE9]
    });

    button = uu.node("input", { type: "checkbox", checked: o });
    button.setAttribute("Z", "1");
    button[nodeData] = { ref: 1 };
    if (button.addEventListener) {
        button.addEventListener("click", function() { fired += 1 }, x);
        clone = button.cloneNode(x);
        evt = document.createEvent("MouseEvents");
        evt.initEvent("click", x, o);
        clone.dispatchEvent(evt);
    } else if (button.attachEvent) {
        document.body.appendChild(button);
        button.attachEvent("onclick", function() { fired += 2 });
        clone = button.cloneNode(o);
        document.body.appendChild(clone);
        clone.fireEvent("onclick");

        document.body.removeChild(button);
        document.body.removeChild(clone);
    }
    clone[nodeData] && (clone[nodeData].ref = 2);

    _ready.copyAttr = button.getAttribute("Z") === clone.getAttribute("Z");
    _ready.copyEvent = !!fired;
    _ready.copyNodeData = clone[nodeData] &&
                                (button[nodeData].ref === clone[nodeData].ref);
    _ready.copyUIState = button.checked && (button.checked === clone.checked);
}, 2); // 2: High order

})(uu);

