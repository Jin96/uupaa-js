
// === uu.test ===
//{{{!depend uu
//}}}!depend

/*
<style>
.uutest ol { background-color:dodgerblue;color:white }
.uutest li { padding:5px;border:1px solid #ccc }
.uutest .li0 { background-color:red   }
.uutest .li1 { background-color:green }
.uutest .li2 { background-color:red   }
.uutest .li3 { background-color:#0c0  }
.uutestinfo { position:fixed;top:10px;right:10px;font-size:xx-large }
.uutestinfo a { border: 3px outset gray;padding:3px;background-color:red;color:white }
.uutestinfo .score { color:black;text-shadow:gray 1px 1px 1px }
.uutestinfo .ngzone {}
</style>

  uu.test({
    "phase": "",
      "test title": function() {
        return [true, "is", "true", function(aftercallback){}];
      },
    "End Of Test": ""
  });
 */

uu.test || (function(uu) {

uu.test = uutest;                   // uu.test(testCase:Hash, throwsError:Boolean = false)
uu.test.addType     = addType;      // uu.test.addType(operator:String, callback:Function):Boolean
uu.test.toHexString = toHexString;  // uu.test.toHexString(source:ByteArray):String
uu.test.data = { index: 0, ok: 0, ng: 0, total: 0, run: 0 };

// uu.test
function uutest(testCase,      // @param Hash: { title: evaluator, ... }
                throwsError) { // @param Boolean(= false): true is throws
    var rv, data = uu.test.data, title, ngzone, ol;

    if (!data.run++) {
        uu.node.add(uu.div("class,uutestinfo",
                        uu.div("class,ngzone"),
                            uu.div("class,score", "0 / 0")));
        uu.node.add(uu.div("class,uutest", uu.ol()));
    }
    ngzone = uu.klass("ngzone")[0];
    ol = uu.klass("uutest")[0].firstChild;

    for (title in testCase) {
        ++data.index;

        if (uu.isFunction(testCase[title])) {
            rv = question(title, testCase[title], throwsError);
            if (rv[0] === 1) {
                ++data.ok;
            } else {
                ++data.ng;
                uu.node.add(uu.a("href,#uutest" + data.index, data.index + ""), ngzone);
            }
            ++data.total;
        } else {
            rv = [3, ""]; // { title: "" }
        }
        uu.node.add(
            uu.li("class,li" + rv[0], // .li0, .li1, .li2, .li3
                uu.p("class,p",
                    uu.a("name,uutest" + data.index,
                        uu.text(title.replace(/\n/g, "<br />"))),
                    uu.br(),
                    uu.text(rv.slice(1).join(" // ")))), ol);
    }
    // RED BGCOLOR
    ol.style.backgroundColor = data.ng ? "red" : "";

    uu.text(uu.klass("score")[0], "?? / ??", data.ok, data.total);
}
uutest.type = {}; // { operator: callback, ... }
uutest.trimOperator = /NOT|!|IS/ig;

function question(title,         // @param String:
                  evaluator,     // @param Function:
                  throwsError) { // @param Boolean:
                                 // @return Array: [state, msg, ...]
                                 //    state - Number: 0 is false, 1 is true, 2 is error
                                 //    msg - String:
    var rv, param, result, callback, lhs, rhs;

    try {
        param = evaluator(); // param = [lhs, operator, rhs]
        result = judge(param[0], param[1], param[2]);

        if (result === 2) { // bad operator
            rv = [result, "bad operator: " + param[1]];
        } else {
            lhs = param[0];
            lhs = uu.isString(lhs) ? ('"' + lhs + '"') : uu.json(lhs);

            rhs = param[2] === void 0 ? "" : param[2];
            rhs = uu.isString(rhs) ? ('"' + rhs + '"') : uu.json(rhs);

            rv = [result, uu.format("?? ?? ??", lhs, param[1], rhs)];

            // after callback
            param.slice(param[2] === void 0 ? 2 : 3).forEach(function(v, i) {
                uu.isFunction(v) ? v() // after callback
                                 : rv.push(v);
            });
        }
    } catch(err) {
        if (throwsError) {
            throw err;
        }
        rv = [2, err.message]; // -1: error
    }
    return rv;
}

// inner -
function judge(lhs,      // @param Mix: left hand set
               operator, // @param String: operator
               rhs) {    // @param Mix(= void): right hand set
                         // @return Number: 0 is false, 1 is true, 2 is bad operator
    var rv,
        ope = operator.toUpperCase().replace(/\s+/g, "");
        negate = /NOT|!/i.test(ope) ? 1 : 0;

    if (ope === "!==" || ope === "===") {
        rv = lhs.valueOf() == rhs.valueOf();
    } else {
        // strip "NOT", "!", "IS"
        ope = ope.replace(uutest.trimOperator, "");

        switch (ope) {
        case "":
        case "=":
        case "==":
        case "LIKE":    rv = uu.like(lhs, rhs); break;
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
        case "HAS":     rv = uu.isString(lhs) ? lhs.indexOf(rhs) > 0
                                              : uu.hash.has(lhs, rhs); break;
        case "TRUE":    rv = !!lhs; break;
        case "FALSE":   rv =  !lhs; break;
        case "NAN":     rv = isNaN(lhs); break;
        case "FAIL":    rv = false; break;
        case "INFINITY":rv = !isFinite(lhs); break;
        case "INSTANCE":rv = !!lhs.msgbox; break;
        default:
            if (uu.type[ope]) {
                rv = !!uu.type(lhs, uu.type[ope]);
            } else {
                if (uutest.type[ope]) {
                    rv = uutest.type[ope](lhs, operator);
                } else {
                    return 2;
                }
            }
        }
    }
    return rv ^ negate;
}

// uu.test.addType - register type detective operator
function addType(operator,   // @param String:
                 callback) { // @param Function:
                             // @return Boolean:
    uutest.type[operator.toUpperCase().
                         replace(/\s+/g, "").
                         replace(uutest.trimOperator, "")] = callback;
}

// uu.test.toHexString - array to HexString
function toHexString(source) { // @param ByteArray:
                               // @return String: "[0xnn, 0xnn, ... ]"
    var rv = [], v, i = 0, iz = source.length;

    for (; i < iz; ++i) {
        v = source[i];
        rv.push("0x" + uu.hash.num2hh[v * (v < 0 ? -1 : 1)]);
    }
    return "[" + rv.join(", ") + "]";
}

})(uu);

