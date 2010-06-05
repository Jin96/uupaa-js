
// === uu.test ===
//#include uupaa.js

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

uu.test = uutest;           // uu.test(testCase:Hash, throwsError:Boolean = false)
uu.test.ignoreError = true; // uu.test.ignoreError
uu.test.data = {
    index: 0, ok: 0, ng: 0, total: 0, run: 0
};

//  [1][quick test] uu.test("title", lhs, "operator", rhs, callbackOrComments...)
//  [2][multi test] uu.test({ "title": function() { return [lhs, "operator", rhs, callbackOrComments...] }, ... })

// uu.test
function uutest(testCase) { // @param String/Hash: title or { title: evaluator, ... }
    var args, hash = {};

    if (uu.isString(testCase)) {
        args = uu.array(arguments, 1);
        if (uu.isString(args[0])) {
            run(uu.hash(testCase, args[0]));
        } else {
            run(uu.hash(testCase, function() { return args; }));
        }
    } else {
        run(testCase);
    }
}

// inner -
function run(hash) { // @param Hash: { title: evaluator, ... }
    var rv, data = uu.test.data, title, ngzone, ol;

    if (!data.run++) {
        uu.node.add(uu.div("class,uutestinfo",
                        uu.div("class,ngzone"),
                            uu.div("class,score", "0 / 0")));
        uu.node.add(uu.div("class,uutest", uu.ol()));
    }
    ngzone = uu.klass("ngzone")[0];
    ol = uu.klass("uutest")[0].firstChild;

    for (title in hash) {
        ++data.index;

        if (uu.isFunction(hash[title])) {
            rv = question(title, hash[title]);
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
                    uu.text(rv.slice(1).join(" # ")))), ol);
    }
    // RED BGCOLOR
    ol.style.backgroundColor = data.ng ? "red" : "";

    uu.text(uu.klass("score")[0], "?? / ??", data.ok, data.total);
}

function question(title,       // @param String:
                  evaluator) { // @param Function:
                               // @return Array: [state, msg, ...]
                               //    state - Number: 0 is false, 1 is true, 2 is error
                               //    msg - String:
    var rv, param, result;

    try {
        param = evaluator(); // param = [lhs, operator, rhs]
        result = judge(param[0], param[1], param[2]);

        if (result === 2) { // bad operator
            rv = [result, "bad operator: " + param[1]];
        } else {
            rv = [result, uu.format("?? ?? ??", uu.json(param[0]), param[1],
                                                param[2] ? uu.json(param[2]) : "")];
            param.slice(3).forEach(function(v, i) {
                uu.isFunction(v) ? v() // after callback
                                 : rv.push(v);
            });
        }
    } catch(err) {
        if (uu.test.ignoreError) {
            throw err;
        }
        rv = [2, err.message]; // 2: error
    }
    return rv;
}

// inner -
function judge(lhs,      // @param Mix: left hand set
               operator, // @param String: operator
               rhs) {    // @param Mix(= void): right hand set
                         // @return Number: 0 is false, 1 is true, 2 is bad operator
    var rv, ope = operator.toUpperCase().replace(/\s+/g, "");

    if (ope === "===") {
        rv = lhs.valueOf() == rhs.valueOf();
    } else if (ope === "!==") {
        rv = lhs.valueOf() != rhs.valueOf();
    } else {
        switch (ope) {
        case "IS":
        case "==":  rv =  uu.like(lhs, rhs); break;
        case "!=":  rv = !uu.like(lhs, rhs); break;
        case ">":   rv = lhs >  rhs; break;
        case ">=":  rv = lhs >= rhs; break;
        case "<":   rv = lhs <  rhs; break;
        case "<=":  rv = lhs <= rhs; break;
        case "&&":  rv = !!(lhs && rhs); break;
        case "||":  rv = !!(lhs || rhs); break;
        case "HAS": rv = uu.isString(lhs) ? lhs.indexOf(rhs) > 0
                                          : uu.hash.has(lhs, rhs); break;
        case "ISNAN":     rv = isNaN(lhs); break;
        case "ISTRUE":    rv = !!lhs; break;
        case "ISFALSE":   rv =  !lhs; break;
        case "ISERROR":   try { fn(), rv = 0; } catch(err) { rv = 1; } break;
        case "ISINFINITY":rv = !isFinite(lhs); break;
        case "ISINSTANCE":rv = !!lhs.msgbox; break;
        default:
            ope = ope.replace(/IS/, "");
            rv = uu.type[ope] ? uu.type(lhs, uu.type[ope]) : 2;
        }
    }
    return +rv;
}

})(uu);

