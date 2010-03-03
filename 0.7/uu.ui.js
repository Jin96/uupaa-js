
// === UI ===
// depend: uu.js
uu.agein || (function(win, doc, uu) {

uu.ui = uuui;               // [create instance] uu.ui(widget, placeholder, option) -> instance
uu.query.ui = uuqueryui;    // [1][query all ui instance]  uu.query.ui("", ctx) -> { name, [instance, ...] }
                            // [2][query some ui instance] uu.query.ui("slider", ctx) -> [instance, ...]

// uu.ui - create instance
function uuui(widget,      // @param Node/String: widget name
              placeholder, // @param Node(= void 0): place holder node
                           //                        void 0 is add body
              option) {    // @param Hash(= {}): option
                           // @return Instance:
    return uuui[widget](placeholder, option);
}

// [1][query all ui instance]  uu.query.ui("", ctx) -> { name, [instance, ...] }
// [2][query some ui instance] uu.query.ui("slider", ctx) -> [instance, ...]
function uuqueryui(widget, // @param String(= ""): widget name
                   ctx) {  // @param String(= <body>): context
                           // @param Array/Hash: [instance, ...]
                           //                    { name, [instance, ...], ... }
    var rv, ary = uu.query(":ui" + (widget || ""), ctx || doc.body),
        v, i = 0, iz = ary.length;

    if (widget) {
        for (rv = []; i < iz; ++i) {
            rv.push(ary[i].uuui.instance);
        }
    } else {
        for (rv = {}; i < iz; ++i) {
            v = ary[i];
            rv[v.uuui.name] || (rv[v.uuui.name] = []);
            rv[v.uuui.name].push(v.uuui.instance);
        }
    }
    return rv;
}

})(window, document, uu);

