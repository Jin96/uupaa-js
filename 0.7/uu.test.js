
// === Unit Test ===
//{{{!depend uu, uu.str
//}}}!depend

uu.test || (function(uu) {

uu.test = uutest; // uu.test({ "title": function() { return [lhs, ope, rhs] })

// uu.test
function uutest(hash) { // @param Hash: { title: function, ... }
    var rv, node = [], r, v, i, j = 0, fn, ary,
        ok = 0, total = 0, ng = [], br = /\n/g;

    // collect
    for (i in hash) {
        ++j;
        v = hash[i];
        ary = [rv = 2, ''];
        if (uu.isfunc(v)) {
            try {
                r = v();
                rv = _judge(r[0], r[1], r[2]); // [0]lhs, [1]ope, [2]rhs
                if (rv === -1) { // -1: bad operator
                    ary = [rv, "bad operator: " + r[1]];
                } else {
                    ary = [rv = +!!rv, uu.sprintf(r[2] === void 0 ? "%j %s" : "%j %s %j",
                                                  r[0], r[1], r[2])];
                    uu.isfunc(fn = r[3] || r[2]) && fn(); // after callback
                }
            } catch(err) {
                ary = [rv = -1, err.message]; // -1: error
            }
            rv == 1 ? ++ok : ng.push(uu.fmt('<a href="#uutest?">?</a>', j, j));
            ++total;
        }
        // (rv === -1 || 0) -> error -> red bg
        rv < 1 && (document.body.style.backgroundColor = "red");
        // add item
        node.push(uu.fmt(uutest._LI, uutest._BGCOLOR[ary[0]], j,
                         uu.codec.entity.encode(i).replace(br, "<br />"), // \n -> <br />
                         uu.codec.entity.encode(ary[1])));
    }
    uu.node(
        uu.fmt('<ol>?</ol>' +
               '<div class="uutestresult"' +
                  ' style="position:fixed;top:0;font-size:xx-large">?:' +
                  ' <span class="ok">?</span> / <span class="total">?</span>' +
                  ' <p>?</p></div>',
                node.join(""),
                ok === total ? "OK" : "NG",
                ok, total,
                ok === total ? "" : "(" + ng.join(", ") + ")"));
}
uutest._BGCOLOR = { 1: "green", 2: "#0c0", "-1": "red" };
uutest._LI = '<li style="padding:5px;border:1px solid #ccc;background-color:?">' +
             '<p style="color:white"><a name="uutest?"></a>?<br />?</p></li>';

// inner -
function _judge(lhs, ope, rhs) {
    var rv = -1; // -1: bad operator

    ope = ope.toUpperCase().replace(/\s+/g, "");

    switch (ope) {
    case "IS":
    case "->":
    case "==":
    case "LIKE":    rv =  uu.like(lhs, rhs); break;
    case "!=":
    case "NOTLIKE": rv = !uu.like(lhs, rhs); break;
    case "===":     rv = lhs.valueOf() == rhs.valueOf(); break;
    case "!==":     rv = lhs.valueOf() != rhs.valueOf(); break;
    case ">":       rv = lhs >  rhs; break;
    case ">=":      rv = lhs >= rhs; break;
    case "<":       rv = lhs <  rhs; break;
    case "<=":      rv = lhs <= rhs; break;
    case "&":       rv = lhs &  rhs; break;
    case "&&":
    case "AND":     rv = lhs && rhs; break;
    case "|":       rv = lhs |  rhs; break;
    case "||":
    case "OR":      rv = lhs || rhs; break;
    case "HAS":     rv =  uu.has(lhs, rhs); break;
    case "!HAS":
    case "HASNOT":  rv = !uu.has(lhs, rhs); break;
    case "ISTRUE":  rv = !!lhs; break;
    case "ISFALSE": rv =  !lhs; break;
    case "ISNAN":   rv = isNaN(lhs); break;
    case "ISFAIL":  rv = false; break;
    case "ISINSTANCE": rv = !!lhs.msgbox; break;
    default:
        ope = (_judge._TYPE_ALIAS[ope] || ope).slice(2);
        if (ope in uu.type) {
            rv = !!uu.type(lhs, uu.type[ope]); // ISARY -> uu.type..ARY
        }
    }
    return rv;
}
_judge._TYPE_ALIAS = uu.split.toHash(
    "ISUNDEF,ISVOID,ISUNDEFINED,ISVOID,ISOBJECT,ISHASH,ISARRAY,ISARY," +
    "ISBOOLEAN,ISBOOL,ISNUMBER,ISNUM,ISSTRING,ISSTR," +
    "ISFUNCTION,ISFUNC,ISFAKEARRAY,ISFAKE,ISFAKEARY,ISFAKE");

})(uu);

