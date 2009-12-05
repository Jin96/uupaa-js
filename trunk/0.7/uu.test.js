
// === Unit Test ===
// depend: uu.js
uu.waste || (function(uu) {
var _TYPE_ALIAS = uu.hash(
        "ISUNDEF,ISVOID,ISUNDEFINED,ISVOID,ISOBJECT,ISHASH,ISARRAY,ISARY," +
        "ISBOOLEAN,ISBOOL,ISNUMBER,ISNUM,ISSTRING,ISSTR," +
        "ISFUNCTION,ISFUNC,ISFAKEARRAY,ISFAKE,ISFAKEARY,ISFAKE"),
    _OL  = '<ol>%s</ol>',
    _DIV = '<div style="position:fixed;top:0;font-size:xx-large">%s: %d/%d %s</div>',
    _LI  = '<li style="padding:5px;border:1px solid #ccc;background-color:%s">' +
              '<p style="color:white"><a name="uutest%d"></a>%s<br />%s</p></li>',
    _BGCOLOR = { 1: "green", 2: "#0c0", "-1": "red" };

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
          ary = [rv = +!!rv, uu.fmt(r[2] === void 0 ? "%j %s" : "%j %s %j",
                                    r[0], r[1], r[2])];
          uu.isfunc(fn = r[3] || r[2]) && fn(); // after callback
        }
      } catch(err) {
        ary = [rv = -1, err.message]; // -1: error
      }
      rv == 1 ? ++ok : ng.push(uu.fmt('<a href="#uutest%d">%d</a>', j, j));
      ++total;
    }
    // (rv === -1 || 0) -> error -> red bg
    rv < 1 && (document.body.style.backgroundColor = "red");
    // add item
    node.push(uu.fmt(_LI, _BGCOLOR[ary[0]], j,
                     uu.esc(i).replace(br, "<br />"), // \n -> <br />
                     uu.esc(ary[1])));
  }
  uu.node(uu.fmt(_OL + _DIV, node.join(""), ok === total ? "OK" : "NG", ok, total,
                 ok === total ? "" : "(" + ng.join(", ") + ")"));
}

// inner -
function _judge(lhs, ope, rhs) {
  var rv = -1; // -1: bad operator

  ope = ope.toUpperCase().replace(/\s+/g, "");
  switch (ope) {
  case "IS":
  case "->":
  case "==":      rv =  _eq2(lhs, rhs); break;
  case "!=":      rv = !_eq2(lhs, rhs); break;
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
  case "HAS":     rv = _has(lhs, rhs); break;
  case "!HAS":
  case "HASNOT":  rv = !_has(lhs, rhs); break;
  case "ISTRUE":  rv = !!lhs; break;
  case "ISFALSE": rv =  !lhs; break;
  case "ISNAN":   rv = isNaN(lhs); break;
  case "ISFAIL":  rv = false; break;
  case "ISINSTANCE": rv = !!lhs.msgbox; break;
  default:
    ope = (_TYPE_ALIAS[ope] || ope).slice(2);
    if (ope in uu) {
      rv = !!uu.type(lhs, uu[ope]); // ISARY -> uu.ARY
    }
  }
  return rv;
}

// inner - "==" operator
function _eq2(v1, v2) {
  var type1 = uu.type(v1);

  if (type1 === uu.type(v2)) {
    switch (type1) {
    case uu.ARY:
    case uu.FAKE: return uu.ary(v1).join(",") === uu.ary(v2).join(",");
    case uu.HASH:
    case uu.RGBA: return (uu.hash.size(v1) === uu.hash.size(v2) &&
                          uu.hash.has(v2, v1));
    case uu.FUNC: return false;
    case uu.DATE: return uu.date2str(v1) === uu.date2str(v2);
    }
    return v1 === v2;
  }
  return false;
}

// inner - "has" operator
function _has(v1, v2) {
  switch (uu.type(v1)) {
  case uu.STR:  return (v1.indexOf(v2) >= 0);
  case uu.HASH: return uu.hash.has(v2, v1);
  case uu.ARY:  return uu.ary.has(v2, v1);
  }
  return false;
}

})(uu);

