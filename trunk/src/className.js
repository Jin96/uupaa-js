// === ClassName ===========================================
// depend: none
uu.feat.className = {};

uu.mix(uu.className, {
  // uu.className.has - has className
  has: function(elm,          // Node:
                className) {  // JointString: "className" or "className1 className2 ..."
    var ary = className.replace(/^\s+|\s+$/g, "").split(/\s+/),
        rex, match;
    if (ary.length > 1) {
      rex = RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
      match = elm.className.match(rex);
      return match && match.length >= ary.length;
    }
    return (" " + elm.className + " ").indexOf(" " + ary[0] + " ") >= 0;
    // return Boolean
  },

  // uu.className.add - add className property
  add: function(elm,          // Node:
                className) {  // JointString: "className" or "className1 className2 ..."
    elm.className = (elm.className + " " + className).replace(/\s+/g, " ").
                                                      replace(/^\s+|\s+$/g, "");
  },

  // uu.className.remove - remove className property
  remove: function(elm,         // Node:
                   className) { // JointString: "className" or "className1 className2 ..."
    var ary = className.replace(/^\s+|\s+$/g, "").split(/\s+/),
        rex = RegExp("(?:^| )(" + ary.join("|") + ")(?:$|(?= ))", "g");
    elm.className = elm.className.replace(rex, "").replace(/^\s+/, ""); // trimLeft
  },

  // uu.className.toggle - add className property or remove
  toggle: function(elm,         // Node:
                   className) { // JointString: "className" or "className1 className2 ..."
    uu.className.has(elm, className) ? uu.className.remove(elm, className)
                                     : uu.className.add(elm, className);
  }
});
