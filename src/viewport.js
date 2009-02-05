// === View Port ===========================================
// depend: none
uu.feat.viewport = {};

uu.viewport = {
  // uu.viewport.getRect - get viewport dimension and scroll offset
  getRect: function() {
    var sx, sy, iebody;

    // --- scroll offset ---
    if (UU.IE) {
      iebody = uudoc.documentElement || uudoc.body;
      sx = iebody.scrollLeft;
      sy = iebody.scrollTop;
    } else {
      sx = window.pageXOffset; // alias "scrollX" in gecko, webkit
      sy = window.pageYOffset; // alias "scrollY" in gecko, webkit
    }

    return {
      // viewport dimension
      w: UU.IE ? iebody.clientWidth  : window.innerWidth,
      h: UU.IE ? iebody.clientHeight : window.innerHeight,
      // scrollX, scrollY
      sx: sx,
      sy: sy
    };
  }
};
