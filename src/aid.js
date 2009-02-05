// === Aid =================================================
// depend: none
uu.feat.aid = {};

uu.aid = {
  // uu.aid.textContent
  textContent: (function() {
    return (UU.IE || (UU.OPERA && opera.version() < 9.5)) ? "innerText"
                                                          : "textContent";
  })()
};
