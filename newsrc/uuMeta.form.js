// === Form ================================================
// depend: none
uu.feat.form = {};

// === Value ===============================================
// depend: ua, boost
uu.feat.value = {};

(function() {
var TAGS = { textarea: 1, button: 2, option: 3, select: 4, input: 5 };

uu.value = {
  // uu.value.get - get value
  get: function(elm) { // Node:
    var rv = [], ri = -1, v, i = 0, ie = UU.IE, prop = "value",
        multiple, nodeList;

    switch (TAGS[elm.tagName.toLowerCase()]) {
    case 1: // textarea
      rv = [elm[uu.textContent]];
      break;
    case 2: // button
    case 3: // option
      rv = [elm.value];
      break;
    case 4: // selected index
      if (elm.selectedIndex >= 0) {
        multiple = elm.multiple;
        while ( (v = elm.options[i++]) ) {
          if (v.selected) {
            if (ie) {
              prop = v.attributes.value.specified ? "value" : "text";
            }
            rv[++ri] = v[prop];
            if (!multiple) {
              break;
            }
          }
        }
      }
      break;
    case 5: // input
      if (/^(checkbox|radio)$/.test(elm.type) && elm.name) {
        // Only the element checked in the group is enumerated if there is a name.
        nodeList = uudoc.getElementsByName(elm.name);
        while ( (v = nodeList[i++]) ) {
          if (v.checked) {
            rv[++ri] = v.value;
          }
        }
      } else {
        // Value of the element is returned if there is no name(in checkbox, radio).
        rv[++ri] = elm.value;
      }
    }
    return rv; // return StringArray( ["value", ... ] )
  },

  // uu.value.set - set value
  set: function(elm,      // Node:
                value) {  // String/StringArray: String( "value" ) or
                          //                     StringArray( ["selected index", ...] )
    var v, i = 0, ie = UU.IE, prop = "value", nodeList;

    switch (TAGS[elm.tagName.toLowerCase()]) {
    case 1: // textarea
      elm[uu.textContent] = value;
      break;
    case 2: // button
    case 3: // option
      elm.value = value;
      break;
    case 4: // selected index
      value = "length" in value ? value : [value];
      while ( (v = elm.options[i++]) ) {
        if (ie) {
          prop = v.attributes.value.specified ? "value" : "text";
        }
        if (value.indexOf(v[prop]) >= 0) {
          v.selected = true;
        }
      }
      break;
    case 5: // input
      if (/^(checkbox|radio)$/.test(elm.type) && elm.name) {
        value = "length" in value ? value : [value];

        nodeList = uudoc.getElementsByName(elm.name);
        while ( (v = nodeList[i++]) ) {
          if (value.indexOf(v[prop]) >= 0) {
            v.checked = true;
          }
        }
      } else {
        elm.value = value;
      }
    }
  }
};
})();
