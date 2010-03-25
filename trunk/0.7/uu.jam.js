
// === Jam (Node set I/F) ===
//{{{!depend uu
//}}}!depend

uu.jam || (function(win, doc, uu) {

uu.jam = uujam;

// --- uu.jam class ---
uu.mix(uujam.prototype, {
    // --- stack ---
    back:           jamback,        //       jam.back() -> jam
    find:           jamfind,        //       jam.find(expr) -> jam
    // --- nodeset ---
    nth:            jamnth,         //        jam.nth(= 0) -> Node / void 0
    each:           jameach,        //       jam.each(fn) -> jam
    size:           jamsize,        //       jam.size() -> Number(nodeset.length)
    clone:          jamclone,       //      jam.clone() -> Array(nodeset)
    indexOf:        jamindexOf,     //    jam.indexOf(node) -> Number(index or -1)
    // --- nodeset manipulator ---
//  first:          jamfirst,       //      jam.first(Node or "<p>fragment</p>") -> jam
//  prev:           jamprev,        //       jam.prev(Node or "<p>fragment</p>") -> jam
//  next:           jamnext,        //       jam.next(Node or "<p>fragment</p>") -> jam
//  last:           jamlast,        //       jam.last(Node or "<p>fragment</p>") -> jam
//  firstChild:     jamfirstChild,  // jam.firstChild(Node or "<p>fragment</p>") -> jam
//  lastChild:      jamlastChild,   //  jam.lastChild(Node or "<p>fragment</p>") -> jam
//  add:            jamadd,         //        jam.add(Node or "<p>fragment</p>") -> jam  // [alias] jamlastChild
    remove:         jamremove,      //     jam.remove() -> jam
    // --- attr, css, className ---
    attr:           jamattr,        // [1][get] jam.attr("attr") -> ["value", ...]
                                    // [2][get] jam.attr("attr1,attr2") -> [{ attr1: "value", attr2: "value" }, ...]
                                    // [3][set] jam.attr("attr", "value") -> jam
                                    // [4][set] jam.attr({ attr: "value", ... }) -> jam
    css:            jamcss,         // [1][get] jam.css("color") -> ["red", ...]
                                    // [2][get] jam.css("color,width") -> [{ color: "red", width: "20px" }, ...]
                                    // [3][set] jam.css("color", "red") -> jam
                                    // [4][set] jam.css({ color: "red" }) -> jam
    klass:          jamklass,       // [1][add]    jam.klass("+className") -> jam
                                    // [2][sub]    jam.klass("-className") -> jam
                                    // [3][toggle] jam.klass("!className") -> jam
                                    // [4][clear]  jam.klass() -> jam
    // --- event ---
    bind:           jambind,        //        jam.bind("click", fn) -> jam
    unbind:         jamunbind,      //      jam.unbind("click") -> jam
    tween:          jamtween,       //       jam.tween(ms, param, fn) -> jam
    show:           jamshow,        //        jam.show(fadein = false) -> jam
    hide:           jamhide,        //        jam.hide(fadeout = false) -> jam
//  mousedown:      jammousedown,   //   jam.mousedown(fn) -> jam
//  mouseup:        jammouseup,     //     jam.mouseup(fn) -> jam
//  mousemove:      jammousemove,   //   jam.mousemove(fn) -> jam
//  mousewheel:     jammousewheel,  //  jam.mousewheel(fn) -> jam
//  click:          jamclick,       //       jam.click(fn) -> jam
//  dblclick:       jamdblclick,    //    jam.dblclick(fn) -> jam
//  keydown:        jamkeydown,     //     jam.keydown(fn) -> jam
//  keypress:       jamkeypress,    //    jam.keypress(fn) -> jam
//  change:         jamchange,      //      jam.change(fn) -> jam
//  submit:         jamsubmit,      //      jam.submit(fn) -> jam
//  focus:          jamfocus,       //       jam.focus(fn) -> jam
//  blur:           jamblur,        //        jam.blur(fn) -> jam
//  contextmenu:    jamcontextmenu, // jam.contextmenu(fn) -> jam
    hover:          jamhover,       //       jam.hover(enterFn, leaveFn -> jam
    // --- html, text, form data ---
    html:           jamhtml,        // [1][get] jam.html() -> ["innerHTML", ...]
                                    // [2][set] jam.html("<p>html</p>") -> jam
    text:           jamtext,        // [1][get] jam.text() -> ["innerText", ...]
                                    // [2][set] jam.text("html") -> jam
    val:            jamval          // [1][get] jam.val() -> ["value", ...]
                                    // [2][set] jam.val("value") -> jam
});

// --- uu.jam (nodeset interface) ---
function uujam(expr,  // @param Node/NodeArray/String/Instance/window/document:
               ctx) { // @param Node/jam(= void 0): context
    this._stack = [[]]; // [nodeset, ...]
    this._ns = !expr ? [] // empty nodeset
        : (expr === win || expr.nodeType) ? [expr] // window / node
        : typeof expr === "string" ?
            (!expr.indexOf("<") ? [uu.node.bulk(expr)]  // <div> -> fragment
                                : uu.query(expr, ctx && ctx._ns ? ctx._ns.concat()
                                                                : ctx)) // query
        : Array.isArray(expr) ? expr.concat() // clone NodeArray
        : (expr instanceof uujam) ? expr._ns.concat() // copy constructor
        : []; // bad expr
}

// --- uu.jam ---
// jam.back
function jamback() { // @return jam:
    this._ns = this._stack.pop() || [];
    return this;
}

// jam.find
function jamfind(expr) { // @return jam:
    this._stack.push(this._ns); // add stack
    this._ns = uu.query("! " + expr, this._ns); // ":scope expr"
    return this;
}

// jam.nth - nodeset[nth]
function jamnth(nth) { // @param Number(= 0): 0 is first element
                       //                   : -1 is last element
                       //                   : nth < 0 is negative index
                       // @return Node:
    return this._ns[nth < 0 ? nth + this._ns.length : nth || 0];
}

// jam.clone - nodeset[nth]
function jamclone() { // @return Array: nodeset
    return this._ns.concat();
}

// jam.each
function jameach(fn) { // @return jam:
    uu.ary.each(this._ns, fn);
    return this;
}

// jam.size - nodeset.length
function jamsize() { // @return Number:
    return this._ns.length;
}

// jam.indexOf - nodeset.indexOf(node)
function jamindexOf(node) { // @param Node:
                            // @return Number: found index or -1
    return uu.ary.indexOf(this._ns.indexOf, node);
}

// jam.add
// jam.first
// jam.prev
// jam.next
// jam.last
// jam.firstChild
// jam.lastChild
uu.hash.each({ first: 1, prev: 2, next: 3, last: 4,
               firstChild: 5, lastChild: 6, add: 6 }, function(pos, method) {

    // jam.add(node or "<p>html</p>") -> jam
    uujam.prototype[method] = function(node) { // @param Node/HTMLString:
                                               // @return jam:
        var ary = this._ns, w, i = -1;

        if (ary.length === 1) {
            uu.node(node, ary[0], pos);
        } else {
            while ( (w = ary[++i]) ) {
                uu.node(uu.node.bulk(node), w, pos); // clone node
            }
        }
        return this;
    };
});

// jam.remove
function jamremove() { // @return jam:
    return _jameach(this, uu.node.remove);
}

// jam.attr
function jamattr(a, b) { // @return jam:
    return _jammap(this, uu.attr, a, b);
}

// jam.css
function jamcss(a, b) { // @return jam:
    return _jammap(this, uu.css, a, b);
}

// jam.klass
function jamklass(a) { // @return jam:
    function _clear(v) {
        v.className = "";
    }
    var method = jamklass._cmd[a.charAt(0)];

    return method ? _jammap(this, method, a.substring(1))
                  : _jammap(this, a ? uu.klass.add : _clear, a);
}
jamklass._cmd = { "+": uu.klass.add,      // "+class" add class
                  "-": uu.klass.sub,      // "-class" sub class
                  "!": uu.klass.toggle }; // "!class" toggle class

// jam.bind
function jambind(type, fn) { // @return jam:
    return _jameach(this, uu.ev, type, fn);
}

// jam.tween
function jamtween(ms, param, fn) { // @return jam
    return _jameach(this, uu.tween, ms, param, fn);
}

// jam.unbind
function jamunbind(type) { // @return jam:
    return _jameach(this, uu.ev.unbind, type);
}

// jam.show
function jamshow(a) { // @return jam:
    return _jammap(this, uu.css.show, a);
}

// jam.hide
function jamhide(a) { // @return jam:
    return _jammap(this, uu.css.hide, a);
}

// jam.hover
function jamhover(enter, leave) { // @return jam:
    return _jameach(this, uu.ev.hover, enter, leave);
}

// jam.html
function jamhtml(a) { // @return jam:
    function _jamhtml(node, value) {
        return (value === void 0) ? node.innerHTML
                                  : (uu.node(node, uu.node.clear(node)), node);
    }
    return _jammap(this, _jamhtml, a);
}

// jam.text
function jamtext(a) { // @return jam:
    return _jammap(this, uu.text, a);
}

// jam.val
function jamval(a) { // @return jam:
    return _jammap(this, uu.val, a);
}

// inner - node iterator
function _jameach(jam, fn, p1, p2, p3, p4) {
    var v, ary = jam._ns, i = -1;

    while ( (v = ary[++i]) ) {
        if (v && v.nodeType === 11) { // 11: DocumentFragment
            v = v.firstChild || v;
        }
        fn(v, p1, p2, p3, p4);
    }
    return jam;
}

// inner - node iterator
function _jammap(jam, fn, p1, p2, p3, p4) {
    var rv = [], ary = jam._ns, w, v, i = -1, r = 0;

    while ( (v = ary[++i]) ) {
        if (v && v.nodeType === 11) { // 11: DocumentFragment
            v = v.firstChild || v;
        }
        rv[i] = w = fn(v, p1, p2, p3, p4);
        r || (r = (v === w) ? 1 : 2); // 1: r is node
    }
    return (r < 2) ? jam : rv; // return jam or [result, ...]
}

// inner - build DOM Lv2 event handler - uu.click(), jam.click(), ...
uu.ary.each(uu.ev._LIST, function(v) {
    uujam.prototype[v] = function jambind(fn) { // uu("li").click(fn) -> jam
        return _jameach(this, uu.ev, v, fn);
    };
    uujam.prototype["un" + v] = function jamunbind() { // uu("li").unclick() -> jam
        return _jameach(this, uu.ev.unbind, v);
    };
});

})(window, document, uu);

