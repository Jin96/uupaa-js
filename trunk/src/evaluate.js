// === Evaluate ============================================
// depend: none
uu.feat.evaluate = {};

uu.evaluate = function(str) { // String: javascript source code
  var rv = false;
  try {
    rv = eval("(" + str + ")");
  } catch(err) {
    if (err instanceof SyntaxError) {
      throw "SyntaxError: " + err.message;
    }
    throw err;
  }
  return rv; // return result
};
