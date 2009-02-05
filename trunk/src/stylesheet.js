// === Style Sheet =========================================
// depend: none
uu.feat.stylesheet = {};

(function() {
var styleSheets = {},
    DEFAULT_SSID = "__default__";

uu.mix(uu.style, {
  // uu.style.appendRule - append CSS rules
  appendRule: function(ssid,          // String: style sheet id
                       selector,      // String: css selector
                       declaration) { // String: css declaration
    return uu.style.insertRule(ssid, undefined, selector, declaration);
    // return inserted rule position
  },

  // uu.style.insertRule - insert CSS rules
  insertRule: function(ssid,          // String: style sheet id
                       position,      // Number: insert position (min: 0)
                       selector,      // String: css selector( "div > p" )
                       declaration) { // String: css declaration( "color: red" )
    ssid = ssid || DEFAULT_SSID;
    var pos, rule, e, sheet;

    if (!(ssid in styleSheets)) {
      // join new style-sheet
      if (UU.IE) {
        styleSheets[ssid] = uudoc.createStyleSheet();
      } else {
        e = uudoc.createElement("style");
        e.appendChild(uudoc.createTextNode(""));
        styleSheets[ssid] = uudoc.getElementsByTagName("head")[0].appendChild(e);
      }
    }
    sheet = styleSheets[ssid];

    if (UU.IE) {
      pos = position === void 0 ? sheet.rules.length : position;
      sheet.addRule(selector.replace(UU.UTIL.TRIM, ""),
                    declaration.replace(UU.UTIL.TRIM, ""), pos);
    } else {
      rule = selector + "{" + declaration + "}";
      pos = position === void 0 ? sheet.sheet.cssRules.length : position;
      pos = sheet.sheet.insertRule(rule, pos); // return inserted position
      if (UU.OPERA && opera.version() < 9.5) {
        pos = sheet.sheet.cssRules.length - 1; // Opera90 bug
      }
    }
    return pos; // return inserted position
  },

  // uu.style.deleteRule - delete CSS rules
  deleteRule: function(ssid,       // String: style sheet id
                       position) { // Number(default: undefined): undefined is last pos
    var sheet = styleSheets[ssid || DEFAULT_SSID],
        pos = position;
    if (sheet) {
      if (UU.IE) {
        pos = (pos === void 0) ? sheet.rules.length - 1 : pos;
        if (pos >= 0) {
          sheet.removeRule(pos);
        }
      } else {
        pos = (pos === void 0) ? sheet.sheet.cssRules.length - 1 : pos;
        if (pos >= 0) {
          sheet.sheet.deleteRule(pos);
        }
      }
    }
  },

  // uu.style.enableStyleSheet
  enableStyleSheet: function(ssid) { // String: style sheet id
    var sheet = styleSheets[ssid || DEFAULT_SSID];
    if (sheet) {
      UU.IE ? (sheet.disabled = false)
            : (sheet.sheet.disabled = false);
    }
  },

  // uu.style.disableStyleSheet
  disableStyleSheet: function(ssid) { // String: style sheet id
    var sheet = styleSheets[ssid || DEFAULT_SSID];
    if (sheet) {
      UU.IE ? (sheet.disabled = true)
            : (sheet.sheet.disabled = true);
    }
  }
});
})();
