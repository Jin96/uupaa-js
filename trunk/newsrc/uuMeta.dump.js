
// === uuMeta.dump ===
// depend: uuMeta
/*
uuMeta.dump(hash, rex = void 0) - return "[prop1]: [value1], ..."
 */
(function uuMetaDumpScope() {

// uuMeta.dump - dump
function dump(hash,  // @param Hash:
              rex) { // @param RegExp(= void 0): allow props
                     // @return String: "[prop1]: [value1], ..."
  var rv = [], i, filter = rex !== void 0;

  for (i in hash) {
    (!filter || rex.test(i)) &&
        rv.push("[" + i + "]: [" + hash[i] + "]");
  }
  return rv.join(", ");
}

// --- initialize / export ---
uuMeta.dump = dump;

})(); // uuMeta.dump scope

