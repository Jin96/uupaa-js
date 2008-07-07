/** <b>Evaluate JavaScript Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uuw = window, uu = uuw.uu;

/** <b>Evaluate JavaScript Module</b>
 *
 * @class
 */
uu.module.evaljs = function(str) {
  var rv = false;
  try {
    rv = eval("(" + str + ")");
  } catch(e) {
    if (e instanceof SyntaxError) {
      throw SyntaxError("SyntaxError: " + e.message);
    }
    throw e;
  }
  return rv;
};

})(); // end (function())()
