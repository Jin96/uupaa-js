
// === Node Builder ===
// depend: uu
uu.agein || (function(win, doc, uu) {

// NodeBuilder callback hander
//      window.uuNodeBuilder(uu, node, buildid, nodeid)
//      window.xnode(uu, node, buildid, nodeid) - ShortName
//ja                   ノードビルダー(uu.div() や uu.a() など)にビルドIDを指定するとノード生成時にコールバックします
//ja                   第二引数には生成されたノード, 第三引数にはユーザが指定したビルドIDが、
//ja                   第四引数には生成されたノードのユニークなノードIDが渡されます

var _callbackHandler = uu.isfunc(win.uuNodeBuilder) ? win.uuNodeBuilder
                     : uu.isfunc(win.xnode) ? win.xnode : uunop;

uu.html = uuhtml;         // uu.html(node, attr, style, buildid) -> <html>
uu.head = uuhead;         // uu.head(node, attr, style, buildid) -> <head>
uu.body = uubody;         // uu.body(node, attr, style, buildid) -> <body>
uu.node.build = uunodebuild;

// --- initialize ---
// inner - setup node builder - uu.div(), uu.a(), ...
uu.ary.each(uu.tag.HTML4, function(v) {
    // skip "img", "canvas"
    if (v === "img" || v === "canvas") {
        return;
    }

    uu[v] = function html4NodeBuilder() { // @param Mix: var_args
        return uunodebuild(v, arguments);
    };
});
uu.ary.each(uu.tag.HTML5, function(v) {
    uu.ie && doc.createElement(v); // [IE]
    uu[v] = function html5NodeBuilder() { // @param Mix: var_args
        return uunodebuild(v, arguments);
    };
});

// --- implement ---
// uu.html
function uuhtml(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <html> node
    return uunodebuild(doc.html, arguments);
}

// uu.head
function uuhead(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <head> node
    return uunodebuild(doc.head, arguments);
}

// uu.body
function uubody(/* var_args */) { // @param Mix: var_args
                                  // @return Node: <body> node
    return uunodebuild(doc.body, arguments);
}

// uu.node.build - node builder
// [1] uu.div(uu.div()) - add node
// [2] uu.div(":hello") - add text node
// [3] uu.div(uu.text("hello")) - add text node
// [4] uu.div("@buildid") - window.xnode(uu, <div>, "buildid", nodeid) callback
// [5] uu.div(1) - Number(from 1) is window.xnode(uu, <div>, 1, nodeid) callback
// [6] uu.div("title,hello") - first String is uu.attr("title,hello")
// [7] uu.div({ title: "hello" }) - first Hash is uu.attr({ title: "hello" })
// [8] uu.div("", "color,red") - second String is uu.css("color,red")
// [9] uu.div("", { color: "red" }) - second Hash is uu.css({ color: "red" })
// [10] uu.a("url:http://example.com"), uu.img, uu.iframe - String("url:...")
//                                        is a.href, img.src, iframe.src
function uunodebuild(node,   // @param Node/String:
                     args) { // @param Mix: arguments(nodes, attr/css)
                             // @return Node:
    function tohash(mix) {
        return !uu.isstr(mix) ? mix :
               !mix.indexOf(" ") ? uu.hash(uu.trim(mix), " ", 0) // " color red"
                                 : uu.hash(mix);                 // "color,red"
    }

    // "div" -> <div>
    node.nodeType || (node = uue(node));

    var v, w, i = 0, j = 0, iz = args.length;

    for (; i < iz; ++i) {
        v = args[i];
        w = 1;
        if (v) {
            if (v.nodeType && w--) {

                // add node
                node.appendChild(v); // [1][3]

            } else if (typeof v === "number" && w--) { // [5]

                // callback
                _callbackHandler(uu, node, v, uu.nodeid(node));

            } else if (typeof v === "string") { // [2][4][6][8][10]

                if (v.charAt(0) === ":" && w--) {// [2]

                    // add text-node
                    node.appendChild(doc.createTextNode(v.slice(1)));

                } else if (v.charAt(0) === "@" && w--) {// [4]

                    // callback
                    _callbackHandler(uu, node, v.slice(1), uu.nodeid(node));

                } else if (!v.indexOf("url:") && w--) { // [10]

                    // add <img> or <iframe>
                    node.setAttribute({a:1,A:1}[node.tagName] ? "href" : "src",
                                      v.slice(4));
                }
            }
        }
        if (w) {
            if (++j === 1) {

                // set node.attribute
                v && uu.attr.set(node, tohash(v)); // [6][7]

            } else if (j === 2) {

                // set node.style
                v && uu.css.set(node, tohash(v)); // [8][9]

            }
        }
    }
    return node;
}

})(window, document, uu);

