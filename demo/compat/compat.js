function onMouseMove(evt) {
  var rv = [];
  try {
    rv.push("<dt>offset from client(with scroll)</dt>");
    if ("pageX" in evt && "pageY" in evt) {
//    rv.push("<dd>", "pageX: " + parseInt(evt.pageX), ", pageY: " + parseInt(evt.pageY), "</dd>");
      rv.push("<dd>", "pageX: " + (evt.pageX), ", pageY: " + (evt.pageY), "</dd>");
    }
    rv.push("<dt>offset from client</dt>");
    if ("clientX" in evt && "clientY" in evt) {
//    rv.push("<dd>", "clientX: " + parseInt(evt.clientX), ", clientY: " + parseInt(evt.clientY), "</dd>");
      rv.push("<dd>", "clientX: " + (evt.clientX), ", clientY: " + (evt.clientY), "</dd>");
    }
    rv.push("<dt>offset from element</dt>");
    if ("layerX" in evt && "layerY" in evt) {
//    rv.push("<dd>", "layerX: " + parseInt(evt.layerX), ", layerY: " + parseInt(evt.layerY), "</dd>");
      rv.push("<dd>", "layerX: " + (evt.layerX), ", layerY: " + (evt.layerY), "</dd>");
    }
    rv.push("<dt>?</dt>");
    if ("offsetX" in evt && "offsetY" in evt) {
//    rv.push("<dd>", "offsetX: " + parseInt(evt.offsetX), ", offsetY: " + parseInt(evt.offsetY), "</dd>");
      rv.push("<dd>", "offsetX: " + (evt.offsetX), ", offsetY: " + (evt.offsetY), "</dd>");
    }
    rv.push("<dt>scroll</dt>");
    if ("pageXOffset" in window && "pageYOffset" in window) {
//    rv.push("<dd>" + "window.pageXOffset: " + parseInt(window.pageXOffset), "<br />",
//                     "window.pageYOffset: " + parseInt(window.pageYOffset), "</dd>");
      rv.push("<dd>" + "window.pageXOffset: " + (window.pageXOffset), "<br />",
                       "window.pageYOffset: " + (window.pageYOffset), "</dd>");
    }
    rv.push("<dt>scroll</dt>");
    if ("scrollLeft" in document.documentElement && "scrollTop" in document.documentElement) {
//    rv.push("<dd>" + "document.documentElement.scrollLeft: " + parseInt(document.documentElement.scrollLeft), "<br />",
//                     "document.documentElement.scrollTop: " + parseInt(document.documentElement.scrollTop), "</dd>");
      rv.push("<dd>" + "document.documentElement.scrollLeft: " + (document.documentElement.scrollLeft), "<br />",
                       "document.documentElement.scrollTop: " + (document.documentElement.scrollTop), "</dd>");
    }
    rv.push("<dt>scroll</dt>");
    if ("scrollLeft" in document.body && "scrollTop" in document.body) {
//    rv.push("<dd>" + "document.body.scrollLeft: " + parseInt(document.body.scrollLeft), "<br />",
//                     "document.body.scrollTop: " + parseInt(document.body.scrollTop), "</dd>");
      rv.push("<dd>" + "document.body.scrollLeft: " + (document.body.scrollLeft), "<br />",
                       "document.body.scrollTop: " + (document.body.scrollTop), "</dd>");
    }
    uu.id("mouseInfo").innerHTML = "<dl>" + rv.join("") + "</dl>";
  } catch (e) {}
}

function addNode(txt1, txt2) {
  var e = uu.id("item"), dt, dd, txt;
  dt = e.appendChild(document.createElement("dt"));
  dd = e.appendChild(document.createElement("dd"));
  dt.appendChild(document.createTextNode(txt1));
  dd.appendChild(document.createTextNode(txt2));
}

function boot() {
  var __ = "", uud = document;
  if (document.addEventListener) {
    document.addEventListener("mousemove", onMouseMove, true);
  } else {
    document.attachEvent("onmousemove", onMouseMove);
  }
//  try {
    addNode("document.compatMode", document.compatMode);
    addNode("navigator.userAgent", navigator.userAgent);
    if ("uniqueID" in document) {
      addNode("document.uniqueID", document.uniqueID);
    }
    if ("all" in document) {
      addNode("document.all", document.all);
    }
    addNode("window.innerWidth", window.innerWidth);
    addNode("window.innerHeight", window.innerHeight);
/*
    addNode("document.body.scrollWidth", document.body.scrollWidth);
    addNode("document.body.scrollHeight", document.body.scrollHeight);
    addNode("document.body.offsetWidth", document.body.offsetWidth);
    addNode("document.body.offsetHeight", document.body.offsetHeight);
 */
    addNode("document.body.clientWidth", document.body.clientWidth);
    addNode("document.body.clientHeight", document.body.clientHeight);
/*
    addNode("document.documentElement.scrollWidth", document.documentElement.scrollWidth);
    addNode("document.documentElement.scrollHeight", document.documentElement.scrollHeight);
    addNode("document.documentElement.offsetWidth", document.documentElement.offsetWidth);
    addNode("document.documentElement.offsetHeight", document.documentElement.offsetHeight);
 */
    addNode("document.documentElement.clientWidth", document.documentElement.clientWidth);
    addNode("document.documentElement.clientHeight", document.documentElement.clientHeight);

    if ("CanvasRenderingContext2D" in window) {
      addNode("window.CanvasRenderingContext2D", window.CanvasRenderingContext2D);
      addNode("window.CanvasRenderingContext2D.getContext()", document.getElementById("canvas").getContext);
    }
    // box size, firefox
    if ("getBoxObjectFor" in document) {
      addNode("document.getBoxObjectFor", document.getBoxObjectFor);
      var rv = document.getBoxObjectFor(document.getElementById("box2"));
      addNode("document.getBoxObjectFor('box2')", "x,y,width,height = [" + rv.x + "," + rv.y + "," + rv.width + "," + rv.height + "]");
    }
    // box size, ie
    if ("getBoundingClientRect" in uu.id("box2")) {
      addNode("element.getBoundingClientRect", uu.id("box2").getBoundingClientRect);
      var rv = uu.id("box2").getBoundingClientRect();
      addNode("'box2'.getBoundingClientRect()", "left,top,right,bottom = [" + rv.left + "," + rv.top + "," + rv.right + "," + rv.bottom + "]");
    }

    var b2 = uu.ui.element(uu.id("box2"));
    window.status = uu.sprintf("box2: x[%d],y[%d],w[%d],h[%d],cw[%d],ch[%d]", b2.x, b2.y, b2.w, b2.h, b2.cw, b2.ch);

    addNode("'box2'.offsetWidth", uu.id("box2").offsetWidth);
    addNode("'box2'.offsetHeight", uu.id("box2").offsetHeight);
    addNode("document.defaultView", document.defaultView);
    addNode("document.getElementById()", document.getElementById);
    if ("getElementsByTagName" in document) {
      addNode("document.getElementsByTagName()", document.getElementsByTagName);
      addNode("document.getElementsByTagName() result", document.getElementsByTagName("img"));
    }
    if ("getElementsByClassName" in document) {
      addNode("document.getElementsByClassName()", document.getElementsByClassName);
      addNode("document.getElementsByClassName() result", document.getElementsByClassName("hidden"));
    }
    addNode("HTMLCollection", (typeof HTMLCollection === "undefined") ? "undefined" : HTMLCollection);
    addNode("NodeList", (typeof NodeList === "undefined") ? "undefined" : NodeList);
    addNode("Array.forEach()", [].forEach);
    addNode("document.images.complete", document.images[0].complete);
//  } catch(e) {}
}

uu.module.load("", "ui", function() {
  uu.window.ready(boot);
});
