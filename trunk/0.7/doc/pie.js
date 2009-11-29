(function(win, doc, uu) {

uu.Class.singleton("Pie", {
  init: function() {
    this._ctx = 0;

    this.pie(uu.id("version0.x-data"),
             uu.text(uu.id("version0.x-title")));
  },
  handleEvent: function(evt, node) {
    uu.ev.stop(evt);

    var src = evt.src;

    window.status = src.tagName;

    if ({ dt: 1, DT: 1 }[src.tagName]) {
      if (this._ctx !== src) {
        this._ctx = src;

        this.pie(uu.query("!+dd", src)[0], uu.text(src));
      }
    }
  },
  pie: function(ctx, title) {
    function _draw(img) {
      var pie = uu.id("pie");

      if (uu.ie6) { // パイチャートのファイル名には拡張子(".png")が無いため、透過png処理を手動で行う
        pie.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + img.src + '",sizingMethod=crop)';
        pie.style.width  = "360px";
        pie.style.height = "200px";
      } else {
        pie.src = img.src;
      }
    }
    var ary = [
      uu.klass("add", ctx).length,
      uu.klass("fix", ctx).length,
      uu.klass("del", ctx).length,
      uu.klass("move", ctx).length,
      uu.klass("rename", ctx).length,
      uu.klass("retake", ctx).length,
    ], total = ary[0] + ary[1] + ary[2] + ary[3] + ary[4] + ary[5];

    if (!total) {
      return;
    }
    uu.img.load(
      uu.fmt("http://chart.apis.google.com/chart" +
             "?chs=%dx%d" +                 // width, height
             "&cht=p3&chtt=%s|%d+Changes" + // 3D pie
             "&chts=FFFFFF,20" +            // title color, title size
             "&chl=%s|%s|%s|%s|%s|%s" +     // lable
             "&chco=%s,%s,%s,%s,%s,%s" +    // color
             "&chf=bg,s,%s" +               // bg-color
             "&chd=t:%d,%d,%d,%d,%d,%d",    // data
        360, 200,
        title.replace(/\/.*$/, "").replace(/ /g, "+"), total,
        "Add", "Fix", "Delete", "Move", "Rename", "Retake",
        "7FFF00", "87CEEB", "A9A9A9", "555555", "FF66FF", "FF0066",
        "00000000",
        ary[0], ary[1], ary[2], ary[3], ary[4], ary[5]
      ), _draw
    );
  }
});
})(window, document, uu);


function splitLang() {
  if (location.protocol === "file:") {
    return;
  }
  var lang = (navigator.language || navigator.browserLanguage || "en").replace(/\-.*$/, "");

  if (lang !== "ja") {
    uu.each(uu.tag("ja"), function(v) {
      try {
        v.innerHTML = "";
      } catch(err) { ; }
    });
  } else {
    uu.each(uu.tag("en"), function(v) {
      try {
        v.innerHTML = "";
      } catch(err) { ; }
    });
  }
}

function xboot() {
  splitLang();

  uu.ev(document, "mousemove", uu.factory("Pie"));
}

