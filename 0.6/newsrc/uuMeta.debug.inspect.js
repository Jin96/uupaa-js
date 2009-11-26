
// ===  uuMeta.debug.inspect ===
// depend: uuMeta
/*
uuMeta.debug.inspect(mix, sort, nest, max) - return String
uuMeta.debug.inspect.hexdump(byteArray) - return Hex dump
 */
(function uuMetaDebugInspectScope() {
var _mm = uuMeta,
    // PROPERTY_FILTER - RegExp/null: property filter
    PROPERTY_FILTER,
    // ignore property list(1: ignore, 2: shorty)
    IGNORE_PROPERTYS = {
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
    };

// uuMeta.debug.inspect
function inspect(mix,   // @param Mix: object
                 sort,  // @param Boolean(= false): true is sort
                 nest,  // @param Number(= 0): current nest count
                 max) { // @param Number(= 2): max nest count
                        // @return String:
  sort = sort || false;
  nest = nest || 0;
  max  = max  || 2;

  var types = _mm.type(mix);
//  try {
    switch (types) {
    case _mm.NULL:  return "null";
    case _mm.UNDEF: return "undefined";
    case _mm.BOOL:
    case _mm.NUM:
    case _mm.DATE:  return mix.toString();
    case _mm.STR:   return '"' + mix + '"';
    case _mm.FUNC:  return "function(){}";
    case _mm.NODE:  return _node(mix, sort, nest, max);
    case _mm.HASH:
    case _mm.ARRAY:
    case _mm.FAKE:  return _iterate(mix, sort, nest, max, types);
    }
//  } catch(err) { ; }

//  return "*** catch exception ***";
}

// inner -
function _iterate(mix,     // @param Mix: object
                  sort,    // @param Boolean: true is sort
                  nest,    // @param Number: current nest count
                  max,     // @param Number: max nest count
                  types) { // @param Number: uuType.TYPES
  var rv = [], v, i, iz, rz,
      sp1 = Array(nest + 1).join("  "),
      sp2 = Array(nest + 2).join("  "),
      typeNames = {},
      name = "";

  typeNames[_mm.HASH]  = "Hash";
  typeNames[_mm.ARRAY] = "Array";
  typeNames[_mm.FAKE]  = "FakeArray";
  name = typeNames[types];

  if (nest + 1 > max) {
    return _mm.fmt("%s%s@%d[...]", sp1, name, _mm.hash.size(mix));
  }
  if (types === _mm.HASH) {
    for (i in mix) {
      rv.push(_mm.fmt("%s%s: %s", sp2, i,
                      inspect(mix[i], sort, nest + 1, max)));
    }
  } else {
    for (i = 0, iz = mix.length; i < iz; ++i) {
      try {
        if (i in mix) {
          v = mix[i];
          rv.push(_mm.fmt("%s%s", sp2, inspect(v, sort, nest + 1, max)));
        }
      } catch(err) { ; }
    }
  }
  sort && rv.sort();
  rz = _mm.hash.size(rv);
  if (rz <= 4) {
    return _mm.fmt("%s%s@%d[%s]", sp1, name, rz,
                   rv.join((rz <= 1) ? "" : ", "));
  }
  return _mm.fmt("%s%s@%d[<br />%s<br />%s]", sp1, name, rz,
                 rv.join(",<br />"), sp1);
}

function _node(mix,   // @param Mix: object
               sort,  // @param Boolean: true is sort
               nest,  // @param Number: current nest count
               max) { // @param Number: max nest count
  var rv = [], name = [], v, i,
      sp1 = Array(nest + 1).join("  "),
      sp2 = Array(nest + 2).join("  "),
      nodeType = mix.nodeType,
      ignore;

  if (nest + 1 > max) {
    return _mm.fmt("%s", _xpath(mix));
  }

  switch (nodeType) {
  case  1: name.push("(ELEMENT_NODE)"); break;
  case 11: name.push("(DOCUMENT_FRAGMENT_NODE)"); break;
  case  3: return "(TEXT_NODE)[\"" +
                  mix.nodeValue.substring(0, 32).replace(/\n/, "\\n") +
                  "\"]";
  case  8: return "(COMMENT_NODE)[\"" +
                  mix.nodeValue.substring(0, 32).replace(/\n/, "\\n") +
                  "\"]";
  case  9: return "(DOCUMENT_NODE)";
  default: return _mm.fmt("(NODE[nodeType:%d])", mix.nodeType);
  }

  if (mix.nodeType !== 11) {
    name.push(_xpath(mix));
    mix.id && name.push(" #" + mix.id); // add "#id"
    mix.className && name.push(" ." + mix.className); // add ".className"
  }

  for (i in mix) {
    if (PROPERTY_FILTER && !PROPERTY_FILTER.test(i)) {
      continue;
    }
    ignore = IGNORE_PROPERTYS[i] || 0;
    if (ignore) {
      if (ignore === 2) {
        rv.push(_mm.fmt("%s%s: ...", sp2, i));
      }
    } else {
      try {
        v = mix[i];
        rv.push(_mm.fmt("%s%s: %s", sp2, i,
                        inspect(mix[i], sort, nest + 1, max))); // Object
      } catch(err) { ; }
    }
  }
  sort && rv.sort();
  return sp1 + name.join("") + _mm.fmt("{<br />%s<br />%s}",
                                       rv.join(",<br />"), sp1);
}

// uuMeta.debug.inspect.hexdump
function hexdump(byteArray) { // @param ByteArray: Array( [num, ...] )
                              // @return String: Hex dump
  var rv = [],
      rb, b = byteArray, p = 0,
      fmtHex = ["<br />"], fmtAscii = [" "],
      i, sz = parseInt(b.length / 16);

  for (i = 0; i < sz; p += 16, ++i) {
    rv.push(_mm.fmt("<br />" +
                    "%02X %02X %02X %02X %02X %02X %02X %02X  " +
                    "%02X %02X %02X %02X %02X %02X %02X %02X  " +
                    "%A%A%A%A%A%A%A%A%A%A%A%A%A%A%A%A",
                    b[p + 0], b[p + 1], b[p + 2], b[p + 3],
                    b[p + 4], b[p + 5], b[p + 6], b[p + 7],
                    b[p + 8], b[p + 9], b[p +10], b[p +11],
                    b[p +12], b[p +13], b[p +14], b[p +15],
                    b[p + 0], b[p + 1], b[p + 2], b[p + 3],
                    b[p + 4], b[p + 5], b[p + 6], b[p + 7],
                    b[p + 8], b[p + 9], b[p +10], b[p +11],
                    b[p +12], b[p +13], b[p +14], b[p +15]));
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
    rv.push(_mm.fmt(fmtHex.join(""),
             rb[ 0], rb[ 1], rb[ 2], rb[ 3],
             rb[ 4], rb[ 5], rb[ 6], rb[ 7],
             rb[ 8], rb[ 9], rb[10], rb[11],
             rb[12], rb[13], rb[14], rb[15]));
    rv.push(_mm.fmt(fmtAscii.join(""),
             rb[ 0], rb[ 1], rb[ 2], rb[ 3],
             rb[ 4], rb[ 5], rb[ 6], rb[ 7],
             rb[ 8], rb[ 9], rb[10], rb[11],
             rb[12], rb[13], rb[14], rb[15]));
  }
  return rv.join("");
}

// inner -
function _xpath(elm) { // @param Node:
                       // @return String: node to XPath String
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
}

// --- initialize / export ---
_mm.debug.inspect = _mm.mix(inspect, {
  hexdump: hexdump
});

})(); // uuMeta.debug.inspect scope

