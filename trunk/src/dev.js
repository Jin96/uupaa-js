// === Develop =============================================
// depend: advance,aid,feat,ready,node,stylesheet,types,hash
uu.feat.dev = {}; // package

// === Develop - Performance ===============================
// depend: none
uu.feat.perf = {};

// --- local scope -----------------------------------------
(function() {

function dummy() {
}

function numberSort(a, b) {
  return a - b;
}

function runner(fn, loop, set, cost, rv) {
  var curt = +new Date, past, size = 0, r = 0;

  while (set--) {
    past = +new Date;
    size = loop + 1;
    while (--size) {
      fn();
    }
    r = +new Date - past - cost;
    rv.push(r < 0 ? 0 : r);
  }
  return +new Date - curt; // return loop cost
}

uu.Class.Perf = function() {
  this.clear();
};

uu.Class.Perf.prototype = {
  // uu.Class.Perf.clear - clear data
  clear: function() {
    this._data = [];
    this._cost = 0;
    return this; // return this
  },

  // uu.Class.Perf.run
  run: function(fn,     // Function: evaluator
                loop) { // Number: loops
    this._cost = runner(dummy, loop, 5, 0, []); // calc cost
    runner(fn, loop, 5, this._cost, this._data);

    this._data.sort(numberSort);
    this._data.pop(); // drop tail
    this._data.pop(); // drop tail
    this._data.shift(); // drop head
    this._data.shift(); // drop head
    return this; // return this
  },

  // uu.Class.Perf.toString
  toString: function() {
    var total = 0, i = 0, iz = this._data.length;

    for (; i < iz; ++i) {
      total += this._data[i];
    }
    return [
      "total=", total.toFixed(2), "ms",
      " avg=", (total / iz).toFixed(2), "ms",
      " set=", iz,
      " (cost=", this._cost.toFixed(2), "ms)"
    ].join("");
    // return String( "total=... avg=... set=... (cost=...)" )
  }
};

})();

// === Develop - Unit Test =================================
// depend: aid, feat, ready, node, stylesheet
uu.feat.test = {};

(function() {
var OPERATORS = {
      "==":       function(v1, v2)  { return v1 == v2; },
      "===":      function(v1, v2)  { return eq3(v1, v2); },// isNaN not support
      "!=":       function(v1, v2)  { return v1 != v2; },
      "!==":      function(v1, v2)  { return !eq3(v1, v2); },
      ">":        function(v1, v2)  { return v1 >  v2; },
      ">=":       function(v1, v2)  { return v1 >= v2; },
      "<":        function(v1, v2)  { return v1 <  v2; },
      "<=":       function(v1, v2)  { return v1 <= v2; },
      HAS:        function(v1, v2)  { return has(v1, v2); },
      ISTRUE:     function(v1)      { return !!v1; },
      ISFALSE:    function(v1)      { return !v1; },
      ISNAN:      function(v1)      { return isNaN(v1); },
      ISNULL:     function(v1)      { return uu.types(v1, UU.NULL);  },
      ISUNDEF:    function(v1)      { return uu.types(v1, UU.UNDEF); },
      ISUNDEFINED:function(v1)      { return uu.types(v1, UU.UNDEF); },
      ISHASH:     function(v1)      { return uu.types(v1, UU.HASH);  },
      ISARRAY:    function(v1)      { return uu.types(v1, UU.ARRAY); },
      ISBOOL:     function(v1)      { return uu.types(v1, UU.BOOL);  },
      ISBOOLEAN:  function(v1)      { return uu.types(v1, UU.BOOL);  },
      ISNUM:      function(v1)      { return uu.types(v1, UU.NUM);   },
      ISNUMBER:   function(v1)      { return uu.types(v1, UU.NUM);   },
      ISSTR:      function(v1)      { return uu.types(v1, UU.STR);   },
      ISSTRING:   function(v1)      { return uu.types(v1, UU.STR);   },
      ISFUNC:     function(v1)      { return uu.types(v1, UU.FUNC);  },
      ISFUNCTION: function(v1)      { return uu.types(v1, UU.FUNC);  },
      ISNODE:     function(v1)      { return uu.types(v1, UU.NODE);  },
      ISFAKE:     function(v1)      { return uu.types(v1, UU.FAKE);  },
      ISFAKEARRAY:function(v1)      { return uu.types(v1, UU.FAKE);  },
      ISRGBA:     function(v1)      { return uu.types(v1, UU.RGBA);  },
      ISRGBAHASH: function(v1)      { return uu.types(v1, UU.RGBA);  },
      EVERY:      function(v1, v2)  { return v1.every(function(v) {
                                        return v2.indexOf(v) >= 0;
                                      }); },
      SOME:       function(v1, v2)  { return v1.some(function(v) {
                                        return v2.indexOf(v) >= 0;
                                      }); }
    };

// "===" operator
function eq3(v1, v2) {
  var i, n, type1 = uu.types(v1), type2 = uu.types(v2);

  if (type1 === type2) {
    switch (type1) {
    case UU.ARRAY:
    case UU.FAKE:
      return (uu.size(v1) === uu.size(v2) && v1.join(",") === v2.join(","));
    case UU.HASH:
      if (uu.size(v1) === uu.size(v2)) {
        for (i in v1) {
          if (v1.hasOwnProperty(i)) {
            if (i in v2) {
              if (v1[i] === v2[i]) {
                ++n;
              }
            }
          }
        }
        return uu.size(v1) === n;
      }
      return false;
    }
    return v1 === v2;
  }
  return false;
}

// "has" operator
function has(v1, v2) {
  var i = 0, iz, type1 = uu.types(v1), type2 = uu.types(v2);

  switch (type1) {
  case UU.STR:
    return (v1.indexOf(v2) >= 0); // ["123" "has", "12"] is true
  case UU.HASH:
    if (type2 !== UU.HASH) { throw ""; }
    for (i in v2) {
      if (!(i in v1) || (v1[i] !== v2[i])) {
        return false;
      }
    }
    return true; // [{ a: 1, b: 2, c: 3 }, "has", { a: 1 }] is true
  case UU.FAKE:
    v1 = uu.toArray(v1);
  case UU.ARRAY:
    switch (type2) {
    case UU.ARRAY:
    case UU.FAKE:
      for (iz = v2.length; i < iz; ++i) {
        if (i in v2) {
          if (v1.indexOf(v2[i]) < 0) {
            return false;
          }
        }
      }
      return true; // [[1, 2, 3], "has", [1, 2]] is true
    default:
      return v1.indexOf(v2) >= 0; // [[1, 2, 3], "has", 1] is true
    }
  default:
    throw "";
  }
  return false;
}

function runner() {
  var i, r;
  for (i in uu.test.problem) {
    r = null;
    try {
      r = uu.test.problem[i]();
      if (i in uu.test.right || i in uu.test.wrong) {
        ; // already tested
      } else {
        if (uu.assert(i, r[0], r[1], r[2])) {
          uu.test.right[i] = 1;
        } else {
          uu.test.wrong[i] = 1;
        }
      }
    } catch(err) {
      uu.test.wrong[i] = 1;
    }
    try {
      if (r) {
        // after callback
        if (r[3] && typeof r[3] === "function") {
          r[3]();
        } else if (r[2] && typeof r[2] === "function") {
          r[2]();
        }
      }
    } catch(err) {}
  }
}

uu.mix(uu, {
  // uu.test - unit test
  test: function(problem, // Hash(problem)/String(feat):
                 path) {  // String(default: "."):
    if (typeof problem === "string") { // problem = feat
      uu.feat(problem || "", function() {
        runner();
        uu.test.view();
      }, path || ".");
    } else { // problem = Hash
      uu.mix(uu.test.problem, problem);
      runner();
      uu.test.view();
    }
  },

  // uu.assert - assert
  assert: function(note,     // String: label
                   val1,     // Mix: lhs
                   operator, // String: operator
                   val2) {   // Mix/undefined: rhs
    if (!UU.CONFIG.ASSERT) { return true; }

    var rv, ope = operator.toUpperCase().replace(/\s+/, "");

    if (!(ope in OPERATORS)) {
      if (console) {
        console.error(["unsupport operator:", operator, "in", note].join(" "));
        return false;
      } else {
        throw ["unsupport: ", note, operator].join(" ");
      }
    }

    // eval(val1 operator val2)
    rv = OPERATORS[ope](val1, val2);
    if (!rv) {
      if (console) {
        console.error(["assert:", note, val1, operator, val2].join(" "));
      }
    }
    return rv; // return Boolean
  }
});

uu.mix(uu.test, {
  // uu.test.problem - collection
  problem: {},

  // uu.test.right - tested collection
  right: { /* tested func, ... */ },

  // uu.test.wrong - tested collection
  wrong: { /* tested func, ... */ },

  // uu.test.clear - clear tested collection
  clear: function() {
    uu.test.right = {};
    uu.test.wrong = {};
  },

  // uu.test.setColumn - set columns
  setColumn: function(column) { // Number: columns(1 to)
    uu.test._column = column;
  },
  _column: 4,

  // uu.test.view
  view: function() {
    var i, j = 0, node = [], column = uu.test._column;

    node.push('<div class="uutest_frame"><table class="uutest_table"><tr>');

    for (i in uu.test.problem) {
      if (j && !(j % column)) {
        node.push('</tr><tr>');
      }
      if (i in uu.test.right) {
        node.push('<td class="uutest_right"><pre>', i, '</pre></td>');
      } else {
        node.push('<td class="uutest_wrong"><pre>', i, ' !</pre></td>');
      }
      ++j;
    }

    node.push('</tr></table></div>');

    uu.node.insert(node.join(""), uudoc.body);
  }
})

// --- auto run ---
// <title>{feat} test</title> or <title>{feat} unittest</title>
uu.ready(function() {
  var node, title, match;
  node = uu.tag("title");
  if (node.length) {
//  title = node[0].textContent || node[0].innerText;
    title = node[0][uu.aid.textContent];
    match = title.match(/^\s*([\w\-+.,]+)\s*(?:test|unittest)$/);
    if (match) {
      uu.test(match[1]);
    }
  }
});

// apply table style
if (uu.style) {
  uu.style.appendRule("dev", ".uutest_frame",    "position:absolute;left:0;top:0");
  uu.style.appendRule("dev", ".uutest_table td", "padding:5px;border:1px dotted green");
  uu.style.appendRule("dev", ".uutest_right",    "color:white;background-color:green");
  uu.style.appendRule("dev", ".uutest_wrong",    "color:white;background-color:red");
}

})();

/* test example

--- [filename: uu.size.htm] --------------------------------
<html><head><title>test uu.size</title>
<script src="../uupaa.debug.js"></script></head><body></body></html>

--- [filename: uu.size.js] ---------------------------------
uu.feat["uu.size"] = {};

uu.mix(uu.test.problem, {
  size: function() {
    var a = { aaa: 1, bbb: 2, ccc: 3 };
    var callback = function() { ; };
    return [uu.size(a), "===", 3, callback];
  }
});

 */

// === Develop - Inspect ===================================
// depend: string_sprintf,types,hash
uu.feat.inspect = {};

uu.inspect = function(mix,   // Mix: object
                      sort,  // Boolean: true is sort
                      nest,  // Number: current nest count
                      max) { // Number: max nest count
  var type = uu.types(mix);
  try {
    switch (type) {
    case UU.NULL: return "null";
    case UU.UNDEF:return "undefined";
    case UU.BOOL:
    case UU.NUM:  return mix.toString();
    case UU.STR:  return '"' + mix + '"';
    case UU.FUNC: return "function(){}";
    case UU.NODE: return uu.inspect.node(mix, sort, nest, max);
    case UU.HASH:
    case UU.ARRAY:
    case UU.FAKE: return uu.inspect.iterate(mix, sort, nest, max, type);
    case UU.RGBA: return uu.sprintf("[%02X %02X %02X %.1f]", mix.r, mix.g, mix.b, mix.a || 1.0);
    }
  } catch(e) { ; }
  return "*** catch exception ***";
};

uu.mix(uu.inspect, {
  iterate: function(mix,    // Mix: object
                    sort,   // Boolean: true is sort
                    nest,   // Number: current nest count
                    max,    // Number: max nest count
                    type) { // Number: UU.TYPES
    var rv = [], i, iz, rz,
        sp1 = Array(nest + 1).join("  "),
        sp2 = Array(nest + 2).join("  "),
        name = { 3: "Hash", 4: "Array", 10: "FakeArray" }[type];

    if (nest + 1 > max) {
      return uu.sprintf("%s%s@%d[...]", sp1, name, uu.size(mix));
    }
    if (type === 2) { // Hash
      for (i in mix) {
        rv.push(uu.sprintf("%s%s: %s", sp2, i, uu.inspect(mix[i], sort, nest + 1, max)));
      }
    } else {
      for (i = 0, iz = mix.length; i < iz; ++i) {
        rv.push(uu.sprintf("%s%s", sp2, uu.inspect(mix[i], sort, nest + 1, max)));
      }
    }
    sort && rv.sort();
    rz = uu.size(rv);
    if (rz <= 4) {
      return uu.sprintf("%s%s@%d[%s]", sp1, name, rz, rv.join((rz <= 1) ? "" : ", "));
    }
    return uu.sprintf("%s%s@%d[<br />%s<br />%s]", sp1, name, rz, rv.join(",<br />"), sp1);
    // return String
  },

  node: function(mix,   // Mix: object
                 sort,  // Boolean: true is sort
                 nest,  // Number: current nest count
                 max) { // Number: max nest count
    var rv = [], name = [], i,
        sp1 = Array(nest + 1).join("  "),
        sp2 = Array(nest + 2).join("  ");
        ignore;

    if (nest + 1 > max) {
      return uu.sprintf("%s", uu.inspect.toXPath(mix));
    }

    switch (mix.nodeType) {
    case 3:  return ["(TEXT_NODE)[\"",
                     mix.nodeValue.substring(0, 32).replace(/\n/, "\\n"),
                     "\"]"].join("");
    case 8:  return ["(COMMENT_NODE)[\"",
                     mix.nodeValue.substring(0, 32).replace(/\n/, "\\n"),
                     "\"]"].join("");
    case 9:  return "(DOCUMENT_NODE)";
    case 1:  name.push("(ELEMENT_NODE)"); break;
    case 11: name.push("(DOCUMENT_FRAGMENT_NODE)"); break;
    default: return uu.sprintf("(NODE[type:%d])", mix.nodeType);
    }

    if (mix.nodeType !== 11) {
      name.push(uu.inspect.toXPath(mix));
      mix.id && name.push(" #" + mix.id); // add "#id"
      mix.className && name.push(" ." + mix.className); // add ".className"
    }

    for (i in mix) {
      if (this._enableFilter && !this._filterExpr.test(i)) { continue; }
      ignore = uu.inspect._ignoreProps[i] || 0;
      if (ignore) {
        if (ignore === 2) {
          rv.push(uu.sprintf("%s%s: ...", sp2, i));
        }
      } else {
        rv.push(uu.sprintf("%s%s: %s", sp2, i, this._inspect(mix[i], sort, nest + 1, max))); // Object
      }
    }
    sort && rv.sort();
    return sp1 + name.join("") + uu.sprintf("{<br />%s<br />%s}", rv.join(",<br />"), sp1);
    // return String
  },

  // uu.inspect.hex - Hex dump
  hex: function(byteArray) { // ByteArray: Array( [num, ...] )
    var rv = [],
        rb, b = byteArray, p = 0,
        fmtHex = ["<br />"], fmtAscii = [" "],
        i, sz = parseInt(b.length / 16);

    for (i = 0; i < sz; p += 16, ++i) {
      rv.push(
        uu.sprintf("<br />%02X %02X %02X %02X %02X %02X %02X %02X  %02X %02X %02X %02X %02X %02X %02X %02X  %A%A%A%A%A%A%A%A%A%A%A%A%A%A%A%A",
          b[p + 0], b[p + 1], b[p + 2], b[p + 3], b[p + 4], b[p + 5], b[p + 6], b[p + 7],
          b[p + 8], b[p + 9], b[p +10], b[p +11], b[p +12], b[p +13], b[p +14], b[p +15],
          b[p + 0], b[p + 1], b[p + 2], b[p + 3], b[p + 4], b[p + 5], b[p + 6], b[p + 7],
          b[p + 8], b[p + 9], b[p +10], b[p +11], b[p +12], b[p +13], b[p +14], b[p +15])
      );
    }
    // pad: if less than 16 bytes
    if (b.length % 16) {
      rb = Array(16);

      for (i = 0; i < b.length % 16; ++i) {
        rb[i] = b[p + i];
        (i === 8) && fmtHex.push(" ");
        fmtHex.push("%02X ");
        fmtAscii.push("%A");
      }
      for (; i < 16; ++i) {
        rb[i] = 0;
        fmtHex.push("   ");
        fmtAscii.push(" ");
      }
      rv.push(uu.sprintf(fmtHex.join(""),
               rb[ 0], rb[ 1], rb[ 2], rb[ 3], rb[ 4], rb[ 5], rb[ 6], rb[ 7],
               rb[ 8], rb[ 9], rb[10], rb[11], rb[12], rb[13], rb[14], rb[15]));
      rv.push(uu.sprintf(fmtAscii.join(""),
               rb[ 0], rb[ 1], rb[ 2], rb[ 3], rb[ 4], rb[ 5], rb[ 6], rb[ 7],
               rb[ 8], rb[ 9], rb[10], rb[11], rb[12], rb[13], rb[14], rb[15]));
    }
    return rv.join(""); // return String
  },

  // uu.inspect.toXPath - node to XPath String
  toXPath: function(elm) { // Node:
    if (!elm.parentNode || elm.nodeType !== 1) {
      return "/html";
    }
    function POS(elm, tag) {
      var rv = 0, i = 0, c = elm.parentNode.childNodes, iz = c.length;
      for (; i < iz; ++i) {
        if (c[i].nodeType !== 1) { continue; }
        if (c[i].tagName === tag) { ++rv; }
        if (c[i] === elm) { return rv; }
      }
      return -1;
    }
    var rv = [], e = elm;
    while (e && e.nodeType === 1) {
      rv.push(e.tagName.toLowerCase());
      e = e.parentNode;
    }
    rv.reverse();
    return "/" + rv.join("/") + "[" + POS(elm, elm.tagName) + "]";
    // return String
  },

  // ignore property list
  _ignoreProps: { // 1: ignore, 2: shorty
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 1,
    TEXT_NODE: 1,
    CDATA_SECTION_NODE: 1,
    ENTITY_REFERENCE_NODE: 1,
    ENTITY_NODE: 1,
    PROCESSING_INSTRUCTION_NODE: 1,
    COMMENT_NODE: 1,
    DOCUMENT_NODE: 1,
    DOCUMENT_TYPE_NODE: 1,
    DOCUMENT_FRAGMENT_NODE: 1,
    NOTATION_NODE: 1,
    DOCUMENT_POSITION_DISCONNECTED: 1,
    DOCUMENT_POSITION_PRECEDING: 1,
    DOCUMENT_POSITION_FOLLOWING: 1,
    DOCUMENT_POSITION_CONTAINS: 1,
    DOCUMENT_POSITION_CONTAINED_BY: 1,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 1,
    all: 2,
    currentStyle: 2,
    style: 2,
    innerHTML: 2,
    innerText: 2,
    outerHTML: 2,
    outerText: 2,
    textContent: 2
  }
});
