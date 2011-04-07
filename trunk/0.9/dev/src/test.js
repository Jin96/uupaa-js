// Test

//{@test
(function(global, // @param GlobalObject:
          lib) {  // @param LibraryRootObject:

// uu.test
function uutest() {
    var i = 0, iz = lib.test.length;

    for (; i < iz; ++i) {
        if (!lib.test[i][1]) {
            alert("[ERROR] " + lib.test[i][0] + " is fail.");
            break;
        }
    }
}

// --- export ---
lib.test = uutest;

})(this, this.uu || this);

//}@test
