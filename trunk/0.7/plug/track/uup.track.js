
// === track plugin (Google Analytics) ===
// depend: uu.js
uu.waste || (function(win, doc, uu, uup) {

uup.track = uuptrack; // uu.track("UA-XXXXX-X")

// uu.track - add Google Analytics script
function uuptrack(account, // @param String: "UA-XXXXX-X"
                  delay) { // @param Number(= 0): delay time (sec)
  function _uutrackload() {
    var node = doc.createElement("script"),
        scheme = doc.location.protocol === "https:" ? "https://ssl"
                                                    : "http://www";

    node.setAttribute("async", "true");
    uu.head().appendChild(node);
    node.setAttribute("src", scheme + ".google-analytics.com/ga.js");
  }
  win._gaq || (win._gaq = []);
  win._gaq.push(["_setAccount", account], ["_trackPageview"]);

  setTimeout(_uutrackload, delay * 1000);
}

})(window, document, uu, uup);

