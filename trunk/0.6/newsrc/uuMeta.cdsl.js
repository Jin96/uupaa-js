
// === uuMeta.cdsl - conditional selector ===
// depend: uuMeta
/*
window.UUMETA_DISABLE_CDSL = 1
window.UUMETA_ADD_EXTENSION = 1
uuMeta.cdsl()
 */
// --- conditional selector ---
//  <style>
//    div>ul { color: black }                /* for Generic browser */
//    html.ifwebkit div>ul { color: blue }   /* for Safari, Chrome */
//    html.ifchrome3 div>ul { color: green } /* for Google Chrome3 */
//    html.ifopera92 div>ul { color: red }   /* for Opera9.27 */
//    html.ifswlt800.ifshlt600 div>ul { font-size: large }
//                                           /* screen width  < 800 and
//                                              screen height < 600 */
//  </style>
//  +----------------+---------------+------------------------------
//  | CONDITION      | IDENT         | NOTE
//  +----------------+---------------+------------------------------
//  | IE             | "ifie"        | version >= 6
//  | IE6.0          | "ifie6"       |
//  | IE7.0          | "ifie7"       |
//  | IE6.0 or IE7.0 | "ifie67"      |
//  | IE8.0          | "ifie8"       |
//  | Opera          | "ifopera"     | version >= 9.20
//  | Opera9.27      | "ifopera92"   |
//  | Opera9.63      | "ifopera96"   |
//  | Opera10.00     | "ifopera10"   |
//  | Opera10.10     | "ifopera101"  |
//  | Gecko          | "ifgecko"     |
//  | Gecko1.9.1~    | "ifgecko191b" | Gecko engine version >= 191(Firefox3.5)
//  | Firefox        | "iffirefox"   | version >= 2
//  | Firefox2.0     | "iffirefox2"  |
//  | Firefox3.0     | "iffirefox3"  |
//  | Firefox3.5     | "iffirefox35" |
//  | WebKit         | "ifwebkit"    | has Safari, Chrome, iPhone
//  | WebKit522~     | "ifwebkit522b"| WebKit engine version >= 522(Safari3)
//  | WebKit530~     | "ifwebkit530b"| WebKit engine version >= 530(Safari4)
//  | Safari         | "ifsafari"    | version >= 3
//  | Safari3.2.3    | "ifsafari32"  |
//  | Safari4.0      | "ifsafari4"   |
//  | iPod           | "ifiphone"    |
//  | iPhone         | "ifiphone"    |
//  | Chrome         | "ifchrome"    | version >= 1
//  | Chrome1.0      | "ifchrome1"   |
//  | Chrome2.0      | "ifchrome2"   |
//  | Chrome3.0      | "ifchrome3"   |
//  | Silverlight    | "ifsl"        | version >= 1
//  | Flash          | "iffl"        | version >= 7
//  | HTML5::Canvas  | "ifcanvas"    | enable HTML5::Canvas
//  | JavaScript     | "ifjs"        | enable JavaScript
//  | width  <  800  | "ifw800s"     | screen width  <  800px
//  | width  >= 1200 | "ifw1200b"    | screen width  >= 1200px
//  | height <  600  | "ifh600s"     | screen height <  600px
//  | height >= 1000 | "ifh1000b"    | screen height >= 1000px
//  +----------------+---------------+------------------------------
(function uuMetaConditionalSelectorScope() {

function conditionalSelector() {
  var _mm = uuMeta,
      _ua = _mm.ua,
      cn = [_mm.node.html.className.replace(/ifnojs/, ""), "ifjs"],
      sw = screen.width, sh = screen.height;

  _ua.ie      && cn.push("ifie ifie" + _ua.uaver);
  _ua.ie67    && cn.push("ifie67");
  _ua.opera   && cn.push("ifopera ifopera" + _ua.uaver);
  _ua.gecko   && cn.push("ifgecko");
  _ua.gecko   && (_ua.rever >= 1.91) && cn.push("ifgecko191b");
  _ua.firefox && cn.push("iffirefox iffirefox" + _ua.uaver);
  _ua.webkit  && cn.push("ifwebkit");
  _ua.webkit  && (_ua.rever >= 522)  && cn.push("ifwebkit522b");
  _ua.webkit  && (_ua.rever >= 530)  && cn.push("ifwebkit530b");
  _ua.safari  && cn.push("ifsafari ifsafari" + _ua.uaver);
  _ua.chrome  && cn.push("ifchrome ifchrome" + _ua.uaver);
  _ua.iphone  && cn.push("ifiphone");
  if (window.UUMETA_ADD_EXTENSION) {
    _mm.feature.slver    && cn.push("ifsl");
    _mm.feature.flver    && cn.push("iffl");
    _mm.feature.ifcanvas && cn.push("ifcanvas");
  }
  (sw <   800) && cn.push("ifw800s");
  (sw >= 1200) && cn.push("ifw1200b");
  (sh <   600) && cn.push("ifh600s");
  (sh >= 1000) && cn.push("ifh1000b");

  if (!window.UUMETA_DISABLE_CDSL) {
    _mm.node.html.className = _mm.trim(cn.join(" ")).replace(/\./g, "");
  }
}

// --- initialize / export ---
uuMeta.cdsl = conditionalSelector;

})(); // uuMeta.cdsl scope

