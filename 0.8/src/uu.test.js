
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

uu.test = uutest; // uu.test(testCase:Hash, throwsError:Boolean = false)
uu.test.addType = uutestaddtype; // uu.test.addType(operator:String, callback:Function):Boolean

// uu.test
function uutest(testCase,      // @param Hash: { title: evaluator, ... }
                throwsError) { // @param Boolean(= false): true is throws
    var rv, title, index = 0, i, iz,
        ok = 0, total = 0, ng = [], br = /\n/g,
        info, ngzone, ol;

    uu.node.add(
        info = uu.div("class,uutestinfo",
            ngzone = uu.div("class,ngzone")));
    uu.node.add(
        uu.div("class,uutest",
            ol = uu.ol()));

    for (title in testCase) {
        ++index;

        if (uu.isFunction(testCase[title])) {
            rv = question(title, testCase[title], throwsError);
            rv[0] === 1 ? ++ok : ng.push(index);
            ++total;
        } else {
            rv = [3, ""]; // { title: "" }
        }
        uu.node.add(
            uu.li("class,li" + rv[0], // .li0, .li1, .li2, .li3
                uu.p("class,p",
                    uu.a("name,uutest" + index,
                        uu.text(title.replace(br, "<br />"))),
                    uu.br(),
                    uu.text(rv[1]))), ol);
    }
    for (i = 0, iz = ng.length; i < iz; ++i) {
        uu.node.add(uu.a("href,#uutest" + ng[i], ng[i] + ""), ngzone);
    }
    iz && (ol.style.backgroundColor = "red");

    uu.node.add(uu.div("class,score", uu.format("?? / ??", ok, total)), info);
}
uutest.type = {}; // { operator: callback, ... }
uutest.trimOperator = /NOT|!|IS/ig;

function question(title,         // @param String:
                  evaluator,     // @param Function:
                  throwsError) { // @param Boolean:
                                 // @return Array: [state, msg]
                                 //    state - Number: 0 is false, 1 is true, 2 is error
                                 //    msg - String:
    var rv, param, result, callback;

    try {
        param = evaluator(); // param = [lhs, operator, rhs]
        result = judge(param[0], param[1], param[2]);

        if (result === 2) { // bad operator
            rv = [result, "bad operator: " + param[1]];
        } else {
            rv = [result, uu.format("?? ?? ??", uu.json(param[0]), param[1],
                                    param[2] === void 0 ? "" : uu.json(param[2]))];
            callback = param[3] || param[2];
            uu.isFunction(callback) && callback(); // after callback
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
function uutestaddtype(operator,   // @param String:
                       callback) { // @param Function:
                                   // @return Boolean:
    uutest.type[operator.toUpperCase().
                         replace(/\s+/g, "").
                         replace(uutest.trimOperator, "")] = callback;
}

})(uu);

