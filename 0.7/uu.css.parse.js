
// === CSS Parser ===
//{{{!depend uu, uu.codec, uu.css.validate
//}}}!depend

uu.css.parse || (function(win, doc, uu) {

var _CSSCache = {}; // CSS Cache { url: cssText }

uu.css.parse   = uucssparse;    // uu.css.parse("clean css") -> { specs, data }
uu.css.clean   = uucssclean;    // uu.css.clean("dirty css") -> "clean css"
uu.css.imports = uucssimports;  // uu.css.imports() -> "dirty css"

// uu.css.parse
function uucssparse(cleancss) { // @param String: "clean css"
                                // @return Hash: { specs, data }
  var rv = { specs: [], data: {} }, // raw data
      escape = 0, v, i, j, k, iz, jz, kz,
      gd1, gp1, gd1i, gp1i, // for normal rule
      gd2, gp2, gd2i, gp2i, // for !important rule
      ary, expr, decl, decls, exprs, spec,
      rex1 = /\s*\!important\s*/,
      rex2 = /\s*\!important\s*/g,
      ignore, prop, val, valid, both,
      valids = { width: 1, border: 1, background: 1 },
      SEPA2CODE = { "{": "\\u007B", "}": "\\u007D",
                    ";": "\\u003B", ",": "\\u002C" },
      CODE2SEPA = { "7B": "{", "7D": "}",
                    "3B": ";", "2C": "," },
      SPECIAL_CHAR = /[\{\};,]/g,
      SPECIAL_CODE = /\\u00(7B|7D|3B|2C)/g,
      COMMA = /\s*,\s*/,
      COLON = /\s*:\s*/,
      SEMICOLON = /\s*;\s*/,
      STAR_HACK = /^\s*\*\s+html/i;

    if (!cleancss) {
        return rv;
    }
    v = cleancss.replace(/(["'])(.*?)\1/g, function(m, q, str) {
        ++escape;
        return q + str.replace(SPECIAL_CHAR, function(code) {
            return SEPA2CODE[code];
        }) + q;
    });

    if (uu.ie) {
        v = v.replace(/^\s*\{/,   "*{").  // }
              replace(/\}\s*\{/g, "}*{"). // }
              replace(/\{\}/g,    "{ }"); // [FIX][IE] Array.split bug
    }
    ary = v.split(/\s*\{|\}\s*/);
    !uu.ie && ary.pop(); // [FIX][IE] Array.split bug

    if (ary.length % 2) { // parse error
        uu.config.debug && alert("uu.css.parse() parse error\n" + v);
        return rv;
    }

    for (i = 0, iz = ary.length; i < iz; i += 2) {
        expr = ary[i];                          // "E>F,G"
        decl = uu.trim(ary[i + 1]);             // "color:red;text-aligh:left"
        exprs = (expr + ",").split(COMMA);      // ["E>F", "G"]
        decls = (decl + ";").split(SEMICOLON);  // ["color:red", "text-align:left"]
        !uu.ie && (exprs.pop(), decls.pop());   // IE split bug

        gd1 = [], gd2 = [], gp1 = [], gp2 = [];
        gd1i = gd2i = gp1i = gp2i = -1;

        for (k = 0, kz = decls.length; k < kz; ++k) {
            ignore = 0;

            if (decls[k]) {
                both = decls[k].split(COLON);
                prop = both.shift();  // "color:red" -> "color"

                val = both.join(":"); // "color:red" -> "red"
                if (escape) {
                    val = val.replace(SPECIAL_CODE, function(m, code) {
                        return CODE2SEPA[code];
                    });
                }

                if (prop.indexOf("\\") >= 0) { // [ACID2] .parser { m\argin: 2em; };
                    ++ignore;
                } else if (rex1.test(val)) { // [!important] rule
                    val = val.replace(rex2, ""); // trim "!important"
                    valid = (uu.config.right && valids[prop]) ?
                                uu.css.validate[prop](val).valid : 1;
                    if (valid) {
                        gd2[++gd2i] = prop + ":" + val;
                        gp2[++gp2i] = { prop: prop, val: val };
                    } else {
                        ++ignore;
                    }
                } else { // [normal] rule
                    valid = (uu.config.right && valids[prop]) ?
                                uu.css.validate[prop](val).valid : 1;
                    if (valid) {
                        gd1[++gd1i] = prop + ":" + val; // "color:red"
                        gp1[++gp1i] = { prop: prop, val: val }; //{prop:"color",val:"red"}
                    } else {
                        ++ignore;
                    }
                }
                ignore &&
                uu.config.debug &&
                    alert('"' + prop + ":" + val + '" ignore decl');
            }
        }
        for (j = 0, jz = exprs.length; j < jz; ++j) {
            v = exprs[j];
            if (escape) {
                v = v.replace(SPECIAL_CODE, function(m, code) {
                    return CODE2SEPA[code];
                });
            }

            // [CSS HACK] * html .parser {  background: gray; }  -> "gray"
            if (STAR_HACK.test(v)) {
                uu.config.debug &&
                    alert(v + " ignore CSS Star hack");
                continue; // ignore rule set
            }
            spec = _calcspec(v);
            if (gd1.length) { // normal rule
                spec in rv.data || (rv.specs.push(spec), rv.data[spec] = []);
                rv.data[spec].push({ expr: v, decl: gd1, pair: gp1 });
            }
            if (gd2.length) { // !important rule
                spec += 10000;
                spec in rv.data || (rv.specs.push(spec), rv.data[spec] = []);
                rv.data[spec].push({ expr: v, decl: gd2, pair: gp2 });
            }
        }
    }
    rv.specs.sort(function(a, b) { return a - b; });
    return rv;
}

// uu.css.imports
function uucssimports() { // @return String: "dirty CSS"
    function load(css, absdir) {
        return css.replace(uucssimports._HTML_COMMENT, "").
                   replace(uucssimports._CSTYLE_COMMENT, "").
                   replace(uucssimports._IMPORTS, function(m, url) {
            var v = uu.url.abs(url, absdir);

            return load(uu.ajax.sync(v).rv, uu.url.dir(v));
        });
    }

    var rv = [], absdir = uu.url(), href, hash, linkID, url,
        node = uu.array(doc.styleSheets), v, i = -1,
        prop1 = uu.ie ? "owningElement" : "ownerNode",
        prop2 = uu.ie ? "uucss3memento" : "textContent"; // MEMENTO

    // <style>* { color:red }</style>
    // <link href="data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D" />
    while ( (v = node[++i]) ) {

        // skip <style disabled="disabled">
        if (!v.disabled) {
            href = v.href || "";

            if (uucssimports._DATA_URI.test(href)) {

                // <link href="data:text/css,. ...">
                hash = uu.codec.datauri.decode(href, true); // { mime, data }

                linkID = "link" + i; // "link{n}"
                linkID in _CSSCache ||
                    (_CSSCache[linkID] = load(hash.data, absdir));

                rv.push(_CSSCache[linkID]);

            } else if (uucssimports._CSS_EXT.test(href)) {

                // <link href="example.css">
                url = uu.url.abs(href, absdir);
                url in _CSSCache ||
                    (_CSSCache[url] = load(uu.ajax.sync(url).rv, uu.url.dir(url)));

                rv.push(_CSSCache[url]);

            } else if (v.id && !v.id.indexOf("uucss3ignore")) {

                // skip <style id="uucss3ignore{xxx}">

            } else {

                // <style>
                rv.push(load(v[prop1][prop2], absdir));
            }
        }
    }
    return rv.join("");
}
uucssimports._IMPORTS = /@import\s*(?:url)?[\("']+\s*([\w\/.+-]+)\s*["'\)]+\s*([\w]+)?\s*;/g;
uucssimports._CSS_EXT = /(?:\.css$|\.css\?)/; // "hoge.css" or "hoeg.css?key=val"
uucssimports._DATA_URI = /^data\:text\/css[;,]/;
uucssimports._HTML_COMMENT = /^\s*<!--|-->\s*$/g;                 // <!-- ... -->
uucssimports._CSTYLE_COMMENT = /\/\*[^*]*\*+([^\/][^*]*\*+)*\//g; /* ... */

// uu.css.clean - cleanup dirty css
function uucssclean(dirtycss) { // @param String: dirty css
                                // @return String: clean css
    var rv;

    rv = dirtycss.replace(/^\s*<!--|-->\s*$/g, ""). // <!-- ... -->
        replace(/url\(([^\x29]+)\)/gi, function(m, data) { // url(...) -> url("...")
            return 'url("' + data.replace(/^["']|["']$/g, "") + '")'; // trim quote
        }).
        replace(/\\([{};,])/g, function(m, c) {
            return (0x10000 + c.charCodeAt(0)).toString(16).replace(/^1/, "\\\\u");
        }).
        replace(/@[^\{]+\{[^\}]*\}/g, "").    // @font-face @page
        replace(/@[^;]+\s*;/g, "").           // @charset
        replace(/\s*[\r\n]+\s*/g, " ").       // ...\r\n...
        replace(/[\u0000-\u001f]+/g, "").     // \u0009 -> "" (unicode)
        replace(/\\x?[0-3]?[0-9a-f]/gi, "");  // "\x9"  -> "" (hex \x00 ~ \x1f)
                                              // "\9"   -> "" (octet \0 ~ \37)
    return uu.trim(rv);
}

// inner - calculating a selector's specificity
function _calcspec(expr) { // @param String: simple selector(without comma)
                           // @return Number: spec value
    function A() { ++a; return ""; }
    function B() { ++b; return ""; }
    function C() { ++c; return ""; }
    function C2(m, E) { return " " + E; }

    var a = 0, b = 0, c = 0;

    expr.replace(_calcspec._NOT, C2).      // :not(E)
         replace(_calcspec._ID, A).        // #id
         replace(_calcspec._CLASS, B).     // .class
         replace(_calcspec._CONTAINS, B).  // :contains("...")
         replace(_calcspec._PELEMENT, C).  // ::pseudo-element
         replace(_calcspec._PCLASS, B).    // :pseudo-class
         replace(_calcspec._ATTR, B).      // [attr=value]
         replace(_calcspec._E, C);         // E
    // ignore the universal selector
    return a * 100 + b * 10 + c;
}
_calcspec._E = /\w+/g;
_calcspec._ID = /#[\w\u00C0-\uFFEE\-]+/g; // (
_calcspec._NOT = /:not\(([^\)]+)\)/;
_calcspec._ATTR = /\[\s*(?:([^~\^$*|=\s]+)\s*([~\^$*|]?\=)\s*(["'])?(.*?)\3|([^\]\s]+))\s*\]/g;
_calcspec._CLASS = /\.[\w\u00C0-\uFFEE\-]+/g;
_calcspec._PCLASS = /:[\w\-]+(?:\(.*\))?/g;
_calcspec._PELEMENT = /::?(?:first-letter|first-line|before|after)/g;
_calcspec._CONTAINS = /:contains\((["'])?.*?\1\)/g;

})(window, document, uu);

