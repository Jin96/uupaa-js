
// === Unit Test ===
// depend: uu.js
uu.waste || (function(uu) {
var _TYPE_ALIAS = uu.hash(
        "ISUNDEF,ISVOID,ISUNDEFINED,ISVOID,ISOBJECT,ISHASH,ISARRAY,ISARY," +
        "ISBOOLEAN,ISBOOL,ISNUMBER,ISNUM,ISSTRING,ISSTR," +
        "ISFUNCTION,ISFUNC,ISFAKEARRAY,ISFAKE,ISFAKEARY,ISFAKE"),
    _LI = '<li style="padding:5px;border:1px solid #ccc;background-color:%s">' +
              '<p style="color:white">%s<br />%s</p></li>',
    _BGCOLOR = { 1: "green", 2: "#0c0", 9: "red" };

uu.test = uutest; // uu.test({ "title": function() { return [lhs, ope, rhs] })

// uu.test
function uutest(hash) { // @param Hash: { title: function, ... }
  var rv = {}, r, v, i, jr, node = [], fn, ary;

  // collect
  for (i in hash) {
    v = hash[i];
    ary = [jr = 2, ''];
    if (uu.isfunc(v)) {
      try {
        r = v();
        jr = _judge(r[0], r[1], r[2]); // [0]lhs, [1]ope, [2]rhs
        if (jr === 9) {
          ary = [jr, "bad operator: " + r[1]];
        } else {
          ary = [+!!jr, uu.fmt(r[2] === void 0 ? "%j %s" : "%j %s %j",
                               r[0], r[1], r[2])];
          uu.isfunc(fn = r[3] || r[2]) && fn(); // after callback
        }
      } catch(err) {
        ary = [9, err.message];
      }
    }
    (!jr || rv > 2) && (document.body.style.backgroundColor = "red");
    node.push(uu.fmt(_LI, _BGCOLOR[ary[0]], uu.esc(i), uu.esc(ary[1])));
  }
  uu.node("<ol>" + node.join("") + "</ol>");
}

// inner -
function _judge(lhs, ope, rhs) {
  var rv = 9; // 9: error

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

