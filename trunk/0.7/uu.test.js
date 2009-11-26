
// === Unit Test ===
// depend: uu.js, uu.css.js
uu.waste || (function(uu) {
var _TYPE_ALIAS = uu.hash(
        "ISUNDEF,ISVOID,ISUNDEFINED,ISVOID,ISOBJECT,ISHASH,ISARRAY,ISARY," +
        "ISBOOLEAN,ISBOOL,ISNUMBER,ISNUM,ISSTRING,ISSTR," +
        "ISFUNCTION,ISFUNC,ISFAKEARRAY,ISFAKE,ISFAKEARY,ISFAKE");

// uu.test({ name: function }, columns = 4)
uu.test = test;

// --- initialize ---
uu.ready(function() {
  uu.css.create("uutest").add([
      ".uutest",    "position:absolute;left:0;top:0",
      ".uutest td", "padding:5px;border:1px solid gray",
      ".uutest .uuline", "background-color:lime",
      ".uutest .uuright", "color:white;background-color:green",
      ".uutest .uuwrong", "color:white;background-color:red"]);
});

// =========================================================
// uu.test
function test(testcase, // @param Hash: { name: function, ... }
              cols) {   // @param Number(= 4): columns
  cols = cols || 4;
  var rv = {}, r, v, i, j = 0, node = [], error = 0, after, idx = 0;

  // collect
  for (i in testcase) {
    v = testcase[i];
    if (typeof v === "function") {
      try {
        r = v(uu); // fn(uu)
        switch (_testassert(i, r[0], r[1], r[2])) { // [0]lhs, [1]ope, [2]rhs
        case true:
          rv[i] = [0, uu.fmt(r[2] === void 0 ? "%j %s" : "%j %s %j",
                             r[0], r[1], r[2])];
          after = r[3] || r[2]; // after callback
          after && (typeof after === "function")
                && after(uu); // fn(uu)
          break;
        case false:
          rv[i] = [1, uu.fmt(r[2] === void 0 ? "%j %s" : "%j %s %j",
                             r[0], r[1], r[2])];
          error = 1;
          break;
        default: // void 0
          rv[i] = [1, "unsupport operator: " + r[1]];
          error = 1;
        }
      } catch(err) {
        rv[i] = [1, err.message];
        error = 1;
      }
    } else {
      rv[i] = [2, ''];
    }
  }

  // inject
  for (i in rv) {
    (j && !(j % cols)) && node.push('</tr><tr>');

    v = rv[i];
    switch (v[0]) {
    case 0: node.push('<td class="uuright"><b>', ++idx, "</b>: ", uu.esc(i),
                      '<br />', uu.esc(v[1]), '</td>'); break;
    case 1: node.push('<td class="uuwrong"><b>', ++idx, "</b>: ", uu.esc(i),
                      '<br />', uu.esc(v[1]), '</td>'); break;
    case 2: node.push('</tr><tr class="uuline"><td colspan="', cols, '">',
                      uu.esc(i), '</td></tr>');
    }
    ++j;
  }
  uu.node('<div class="uutest">' +
            '<table><tr>' + node.join("") + '</tr></table>' +
          '</div>');
  if (error) {
    uu.css.set(document.body, { backgroundColor: "red" });
  }
}

// inner -
function _testassert(note, lhs, ope, rhs) {
  var rv;

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
  case "EVERY":   rv = lhs.every(function(v) {
                    return rhs.indexOf(v) >= 0;
                  }); 
                  break;
  case "SOME":    rv = lhs.some(function(v) {
                    return rhs.indexOf(v) >= 0;
                  }); 
                  break;
  case "ISFAIL":  rv = false; break;
  case "ISINSTANCE": rv = !!lhs.msgbox; break;
                  
  default:
    // ISNULL, ISVOID, ISHASH, ISARY, ISBOOL, ISNUM, ISSTR
    // ISFUNC, ISNODE, ISFAKE, ISDATE, ISRGBA
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
    case uu.FAKE: return uu.ary(v1).join(",") ===
                         uu.ary(v2).join(",");
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
  case uu.ARY:
  case uu.FAKE: return uu.ary.has(v2, v1);
  }
  return false;
}

})(uu);

