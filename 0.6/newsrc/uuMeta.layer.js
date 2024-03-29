
// === uuMeta.layer ===
// depend: uuMeta, uuMeta.canvas,
//         uuMeta.style, uuMeta.style.opacity, uuMeta.image
/*

--- layer functions ---
new uuMeta.layer(view, width = "auto", height = "auto",
                 option = { HIDDEN: 1, FLYWEIGHT: 1 })
uuMeta.layer.getLayerInstance(elm) - return LayerObject or null

--- view operations ---
uuMeta.layer.view
uuMeta.layer.resizeView(width, height)
uuMeta.layer.getViewInfo() - return { clid, cctx, front, rear,
                                      zmax, zmin, zorder, length }

--- layer operations ---
uuMeta.layer.createLayer(id, type, hide = 0, back = 0,
                         width = void 0, height = void 0)
                            - return new layer element
uuMeta.layer.appendLayer(id, node, hide = 0) - return node
uuMeta.layer.removeLayer(id) - return this
uuMeta.layer.resizeLayer(id, width, height) - return this
uuMeta.layer.refLayer(id) - return layer element
uuMeta.layer.bringLayer(id, tgt) - return this
uuMeta.layer.moveLayer(id = "", x, y, diff = false) - return this
uuMeta.layer.showLayer(id = "") - return this
uuMeta.layer.hideLayer(id = "") - return this
uuMeta.layer.getLayerOpacity(id) - return 0.0 ~ 1.0
uuMeta.layer.setLayerOpacity(id = "", opacity = 1.0, diff = false)
                              - return this

  --- canvas 2D context operations ---
  uuMeta.layer.getContext(id = "") - return canvas context or void 0
  uuMeta.layer.push(id) - return this
  uuMeta.layer.pop() - return this

    --- canvas 2D context style operations ---
    uuMeta.layer.alphas(globalAlpha) - return this
    uuMeta.layer.fills(fillStyle) - return this
    uuMeta.layer.wires(strokeStyle, lineWidth = undef) - return this
    uuMeta.layer.fonts(font) - return this
    uuMeta.layer.lines(lineWidth) - return this
    uuMeta.layer.shadows(color = undef,
                         x = undef, y = undef, blur = undef) - return this
    uuMeta.layer.sets(propHash) - return this
    uuMeta.layer.gets(propHash) - return { prop: value, ... }

    --- canvas 2D context drawing operations ---
    uuMeta.layer.clear(x = 0, y = 0,
                       w = canvas.width, h = canvas.height) - return this
    uuMeta.layer.save() - return this
    uuMeta.layer.restore() - return this
    uuMeta.layer.scale(x, y) - return this
    uuMeta.layer.translate(x, y) - return this
    uuMeta.layer.rotate(90 or "90deg" or "1.2rad") - return this
    uuMeta.layer.transform(m11, m12, m21, m22, dx, dy) - return this
    uuMeta.layer.begin(x = undef, y = undef) - return this
    uuMeta.layer.move(x, y) - return this
    uuMeta.layer.line(x, y) - return this
    uuMeta.layer.curve(a0, a1, a2, a3,
                       a4 = undef, a5 = undef) - return this
    uuMeta.layer.clip() - return this
    uuMeta.layer.arc(x, y, r, a0 = 0, a1 = 360deg, clock = 1)
                            - return this
    uuMeta.layer.draw(wire = 0) - return this
    uuMeta.layer.close() - return this
    uuMeta.layer.text(text, x = 0, y = 0,
                      wire = 0, maxWidth = undef) - return this
    uuMeta.layer.measureText(text) - return { width, height }
    uuMeta.layer.poly([point, ...], wire = 0) - return this
    uuMeta.layer.box(x, y, w, h, r = 0, wire = 0) - return this
    uuMeta.layer.boxpath(x, y, w, h, r = 0) - return this
    uuMeta.layer.metabo(x, y, w, h, r = 0,
                        bulge = 10, wire = 0) - return this
    uuMeta.layer.circle(x, y, w, h, r, wire = 0) - return this
    uuMeta.layer.dots(x, y, w, h, {palette},
                      [data, ...], index = 0) - return this
    uuMeta.layer.linearGrad(x1, y1,
                            x2, y2, [offset, ...],
                                    [color, ...]) - return CanvasGradient
    uuMeta.layer.radialGrad(x1, y1, r1,
                            x2, y2, r2, [offset, ...],
                                        [color, ...]) - return CanvasGradient
    uuMeta.layer.pattern(image, pattern = "repeat") - return CanvasPattern
    uuMeta.layer.image(image, arg1, arg2, arg3, arg4,
                              arg5, arg6, arg7, arg8) - return this

    --- canvas 2D context convenient operations ---

    uuMeta.layer.fitImage(image) - return this
    uuMeta.layer.grid(size = 10, unit = 5,
                      color = "skyblue", color2 = "steelblue") - return this
    uuMeta.layer.angleGlossy(x, y, preset, extend) - return this
    uuMeta.layer.metaboGlossy(x, y, preset, extend) - return this
    uuMeta.layer.jellyBean(x, y, preset, extend) - return this
 */
(function uuMetaLayerScope() {
var _mm = uuMeta,
    _ua = _mm.ua,
    _doc = document,
    _int = parseInt,
    _TO_RADIANS = Math.PI / 180, // Math.toRadians - from java.math
    _360DEG = 360 * _TO_RADIANS, // 6.283185307179586
    _instance = {}; // { uid: layer }

// uuMeta.layer
//    new uuMeta.layer(node, "auto", "auto");
//    new uuMeta.layer(node, "300px", "150px");
//    new uuMeta.layer(node, 300, 150, { HIDDEN: 0, FLYWEIGHT: 0 });
function layer(view,     // @param Node: layer container
               width,    // @param Number(= -1): view width(px), -1 = "auto"
               height,   // @param Number(= -1): view height(px), -1 = "auto"
               option) { // @param Hash: { HIDDEN, FLYWEIGHT }
                         //     Number: HIDDEN,     1 is (overflow = "hidden")
                         //     Number: FLYWEIGHT,  1 is (ctx.xFlyweight = 1)
  var uid = _mm.node.id(view);

  if (uid in _instance) {
    return _instance[uid]; // already
  }
  initLayer(this,
            view,
            (width  === void 0 || width  === -1) ? "auto" : (width  + "px"),
            (height === void 0 || height === -1) ? "auto" : (height + "px"),
            _mm.mix(option || {}, { HIDDEN: 1, FLYWEIGHT: 1 }, 0, 0));
  _instance[uid] = this;
}

function initLayer(me, view, width, height, option) {
  var st = view.style,
      cs = _ua.ie ? view.currentStyle
                  : getComputedStyle(view, null);

  me.view = view; // uuMeta.layer.view - public property
  me._layer = {}; // Hash( { id: elm, ctx, chain } )
  me._option = option;
  // for canvas context
  me._stack = [];    // context stack
  me._cctx = void 0; // current canvas context
  me._clid = void 0; // current canvas context layer id

  // view style
  st.width  = width;
  st.height = height;
  st.zIndex = _int(cs.zIndex) || 0;
  (option.HIDDEN) && (st.overflow = "hidden");
  (cs.position === "static") && (st.position = "relative");
}

// --- layer functions ---

// uuMeta.layer.getLayerInstance
function getLayerInstance(elm) { // @param Node:
                                 // @return LayerObject/null:
  var uid = _mm.node.id(elm);
  if (uid in _instance) {
    return _instance[uid];
  }
  return null;
}

// --- view operations ---

// uuMeta.layer.resizeView - resize view
function resizeView(width,    // @param CSSPixelUnitString: "300px"
                    height) { // @param CSSPixelUnitString: "150px"
  this.view.style.width  = width;
  this.view.style.height = height;
}

// uuMeta.layer.getViewInfo - get view state
function getViewInfo() { // @return Hash: { clid, cctx, front, rear,
                         //                 zmax, zmin, zorder, length }
  var hash = this._layer, v, i, j = 0,
      front, rear, max = 0, min = 0, order = [];

  for (i in hash) {
    ++j;
    v = _int(hash[i].elm.style.zIndex);
    (!front || max <= v) && (max = v, front = i);
    (!rear  || min >= v) && (min = v, rear = i);
    order[v] = i;
  }
  return { clid:  this._clid,   // current layer id
           cctx:  this._cctx,   // current canvas context
           front: front || "",  // front layer id
           rear:  rear  || "",  // rear layer id
           zmax:  max || 0,     // front layer z-index
           zmin:  min || 0,     // rear layer z-index
           zorder: order,       // order["a", "b", "c"]
           length: j };         // layer.length
}

// --- layer operations ---

// uuMeta.layer.createLayer - create child layer
function createLayer(id,      // @param String: layer id
                     type,    // @param String: "canvas", "vmlcanvas",
                              //                "div", "img", etc...
                     hide,    // @param Boolean(= false): true = hidden layer
                     back,    // @param Boolean(= false): back insertion
                     width,   // @param Number(= void 0): canvas,image width
                     height) {// @param Number(= void 0): canvas,image height
                              // @return Node: new layer element
  type = type.toLowerCase();

  var elm, es, ctx, v = this.view, viewInfo = this.getViewInfo();

  if (type.indexOf("canvas") >= 0) {
    elm = _doc.createElement("canvas");
    elm.width  = (width !== void 0) ? width :
                 (v.style.width === "auto") ? v.offsetWidth :
                 _int(v.style.width);
    elm.height = (height !== void 0) ? height :
                 (v.style.height === "auto") ? v.offsetHeight :
                 _int(v.style.height);
    elm = uuMeta.canvas.init(elm, type === "vmlcanvas");
    if (_ua.ie) {
      if (elm.unbind) {
        elm.unbind();
      }
    }
    es = elm.style;

    back ? v.insertBefore(elm, v.firstChild)
         : v.appendChild(elm);

    ctx = elm.getContext("2d");
    ctx.textBaseline = "top"; // force
    (this._option.FLYWEIGHT) && (ctx.xFlyweight = 1);
    // set current context
    this._clid = id;
    this._cctx = ctx;
  } else {
    elm = _doc.createElement(type);
    es = elm.style;

    back ? v.insertBefore(elm, v.firstChild)
         : v.appendChild(elm);

    if (type !== "img") {
      es.width  = v.style.width;
      es.height = v.style.height;
    } else {
      (width  !== void 0) && (elm.width  = width);
      (height !== void 0) && (elm.height = height);
    }
  }
  es.zIndex = back ? (viewInfo.zmin - 1) : (viewInfo.zmax + 1);
  es.display = hide ? "none": "";
  es.position = "absolute";
  es.top = "0";
  es.left = "0";

  this._layer[id] = { elm: elm, ctx: ctx, chain: [] };
  return elm;
}

// uuMeta.layer.appendLayer - add node
function appendLayer(id,      // @param String: layer id
                     node,    // @param Node:
                     hide) {  // @param Boolean(= false): true = hidden layer
                              // @return Node:
  var elm = node, type = elm.tagName.toLowerCase(), ctx;

  if (type === "canvas") {
    ctx = elm.getContext("2d");
    ctx.textBaseline = "top"; // force
    (this._option.FLYWEIGHT) && (ctx.xFlyweight = 1);
    // set current context
    this._clid = id;
    this._cctx = ctx;
  }
  elm.style.zIndex = this.getViewInfo().length;

  this._layer[id] = { elm: elm, ctx: ctx, chain: [] };
  return elm;
}

// uuMeta.layer.removeLayer - remove child layer
function removeLayer(id) { // @param String: layer id
                           // @return this:
  if (id in this._layer) {
    var v = this._layer[id], i = 0, iz = v.chain.length;
    for (; i < iz; ++i) {
      v.chain[i].elm.parentNode.removeChild(v.chain[i].elm);
      delete this._layer[v.chain[i]];
    }
    v.elm.parentNode.removeChild(v.elm);
    v.elm = void 0;
    delete this._layer[id];

    // reset context stack
    this._stack = [];
    this._clid = void 0;
    this._cctx = void 0;
  }
  return this;
}

// uuMeta.layer.resizeLayer - resize child layer
function resizeLayer(id,       // @param String: layer id
                     width,    // @param Number: pixel width
                     height) { // @param Number: pixel height
                               // @return this:
  var node = this._layer[id].elm;

  switch (node.tagName.toLowerCase()) {
  case "canvas":
    _ua.ie && node.bind && node.bind(1);
    node.width  = width;
    node.height = height;
    _ua.ie && node.unbind && node.unbind();
    break;
  case "img":
    node.width  = width;
    node.height = height;
    break;
  default:
    node.style.width  = width  + "px";
    node.style.height = height + "px";
  }
  return this;
}

// uuMeta.layer.refLayer - refer child layer
function refLayer(id) { // @param String: layer id
                         // @return Node: layer element
  return this._layer[id].elm;
}

// uuMeta.layer.bringLayer - lift child layer
//    bringLayer("a") is bring to front
//    bringLayer("a", "b") is bring to layer("b")
function bringLayer(id,    // @param String: move layer id
                    tgt) { // @param String(= ""): target layer id
                           // @return this:
  var ly = this._layer, z, i,
      p1 = _int(ly[id].elm.style.zIndex),
      p2 = _int(ly[tgt || this.getViewInfo().front].elm.style.zIndex);

  if (p1 < p2) {
    for (i in ly) {
      z = _int(ly[i].elm.style.zIndex);
      if (z > p1 && z <= p2) {
        ly[i].elm.style.zIndex = z - 1;
      }
    }
    ly[id].elm.style.zIndex = p2;
  } else if (p1 === p2) {
    ly[id].elm.style.zIndex = p1 + 1;
  }
  return this;
}

// inner -
function chains(me, id) {
  var rv = {}, v, i = 0, iz;

  rv[id] = v = me._layer[id];
  for (iz = v.chain.length; i < iz; ++i) {
    rv[v.chain[i]] = me._layer[v.chain[i]];
  }
  return rv;
}

// uuMeta.layer.moveLayer - set absolute/relative child layer position
//    moveLayer("", 100, 100) is move all layers to pos(100px, 100px)
//    moveLayer("a", 100, 100, 1) is move layer("a") to pos(+100px, +100px)
function moveLayer(id,     // @param String(= ""): layer id
                   x,      // @param Number: style.left value(unit px)
                   y,      // @param Number: style.top value(unit px)
                   diff) { // @param Boolean(= false): difference,
                           //           false = x and y is absolute value
                           //           true = x and y is relative value
                           // @return this:
  x = _int(x), y = _int(y), diff = diff || 0;

  var hash = id ? chains(this, id) : this._layer, v, i,
      doPixel = _ua.ie || _ua.opera;

  for (i in hash) {
    v = hash[i].elm.style;
    if (doPixel) {
      v.pixelLeft = (diff ? v.pixelLeft : 0) + x;
      v.pixelTop  = (diff ? v.pixelTop  : 0) + y;
    } else {
      v.left = (diff ? _int(v.left) : 0) + x + "px";
      v.top  = (diff ? _int(v.top)  : 0) + y + "px";
    }
  }
  return this;
}

// uuMeta.layer.showLayer - show child layer
//    showLayer() is show all layers
//    showLayer("a") is show layer("a")
function showLayer(id) { // @param String(= ""): layer id
                          // @return this:
  return showLayerImpl(this, id, 0);
}

// uuMeta.layer.hideLayer - hide child layer
//    hideLayer() is hide all layers
//    hideLayer("a") is hide layer("a")
function hideLayer(id) { // @param String(= ""): layer id
                          // @return this:
  return showLayerImpl(this, id, 1);
}

// inner -
function showLayerImpl(me, id, hide) {
  var hash = id ? chains(me, id) : me._layer, i;

  for (i in hash) {
    hash[i].elm.style.display = hide ? "none" : "block";
  }
  return me;
}

// uuMeta.layer.getLayerOpacity - get child layer opacity value(from 0.0 to 1.0)
function getLayerOpacity(id) { // @param String: layer id
                               // @return Number: float(min:0.0, max:1.0)
  return _mm.style.getOpacity(this._layer[id].elm);
}

// uuMeta.layer.setLayerOpacity - set child layer opacity value(from 0.0 to 1.0)
//    setLayerOpacity("", 0.1, 1) is set all layers opacity(+0.1)
//    setLayerOpacity("a", 0.5) is set layer("a") opacity(0.5)
function setLayerOpacity(id,      // @param String(= ""): layer id
                         opacity, // @param Number(= 1.0): float(0.0 to 1.0)
                         diff) {  // @param Boolean(= false):
                                  // @return this:
  opacity = (opacity === void 0) ? 1 : opacity;
  diff = diff || 0;

  var hash = id ? chains(this, id) : this._layer, i;

  for (i in hash) {
    _mm.style.setOpacity(hash[i].elm, opacity, diff);
  }
  return this;
}

// --- canvas 2D context operations ---

// uuMeta.layer.getContext - get canvas context
function getContext(id) { // @param String(= ""): layer id
                          //                      "" is current context
                          // @return CanvasRenderingContext2D/void 0:
  if (id) {
    return (id in this._layer) ? this._layer[id].ctx
                               : void 0;
  }
  return this._cctx;
}

// uuMeta.layer.push - push current context
function push(id) { // @param String: layer id
                    // @return this:
  this._clid && this._stack.push(this._clid);
  this._clid = id;
  this._cctx = this._layer[id].ctx;
  return this;
}

// uuMeta.layer.pop - pop current context
function pop() { // @param String: layer id
                 // @return this:
  if (this._stack.length) {
    this._clid = this._stack.pop();
    this._cctx = this._layer[this._clid].ctx;
  }
  return this;
}

// --- canvas 2D context style operations ---

// uuMeta.layer.alphas - set globalAlpha
//    globalAlpha: from 0.0 to 1.0
function alphas(globalAlpha) { // @param Number: globalAlpha
                               // @return this:
  this._cctx.globalAlpha = globalAlpha;
  return this;
}

// uuMeta.layer.fills - set fillStyle
function fills(fillStyle) { // @param String/Object: fillStyle
                            // @return this:
  this._cctx.fillStyle = fillStyle;
  return this;
}

// uuMeta.layer.wires - set strokeStyle
function wires(strokeStyle, // @param String/Object: strokeStyle
               lineWidth) { // @param Number(= void 0): lineWidth(from 1.0)
                            // @return this:
  this._cctx.strokeStyle = strokeStyle;
  if (lineWidth !== void 0) {
    this._cctx.lineWidth = lineWidth;
  }
  return this;
}

// uuMeta.layer.fonts - set font style
//    font: CSS font style value. (eg: "10px sans-serif")
function fonts(font) { // @param CSSFontString: font
                       // @return this:
  this._cctx.font = font;
  return this;
}

// uuMeta.layer.lines - set lineWidth
function lines(lineWidth) { // @param Number: lineWidth(from 1.0)
                            // @return this:
  this._cctx.lineWidth = lineWidth;
  return this;
}

// uuMeta.layer.setShadow - set shadow styles
function shadows(color,  // @param String(= void 0): shadowColor
                 x,      // @param Number(= void 0): shadowOffsetX
                 y,      // @param Number(= void 0): shadowOffsetY
                 blur) { // @param Number(= void 0): shadowBlur
                         // @return this:
  var ctx = this._cctx;

  (color !== void 0) && (ctx.shadowColor   = color);
  (x     !== void 0) && (ctx.shadowOffsetX = x);
  (y     !== void 0) && (ctx.shadowOffsetY = y);
  (blur  !== void 0) && (ctx.shadowBlur    = blur);
  return this;
}

// uuMeta.layer.sets - set styles
function sets(propHash) { // @param Hash: { prop: value, ... }
                          // @return this:
  var ctx = this._cctx, i;

  for (i in propHash) {
    ctx[i] = propHash[i];
  }
  return this;
}

// uuMeta.layer.gets - get styles
function gets(propHash) { // @param Hash: { font: "", ... }
                          // @return Hash: { font: "32pt Arial", ... }
  var ctx = this._cctx, i, rv = {};

  for (i in propHash) {
    rv[i] = ctx[i];
  }
  return rv;
}

// --- canvas 2D context drawing operations ---

// uuMeta.layer.clear - clear rect
function clear(x,   // @param Number(= 0): position x
               y,   // @param Number(= 0): position y
               w,   // @param Number(= canvas.width):  width
               h) { // @param Number(= canvas.height): height
                    // @return this:
  var ctx = this._cctx;

  ctx.clearRect(x || 0, y || 0,
                w || ctx.canvas.width, h || ctx.canvas.height);
  return this;
}

// uuMeta.layer.save
function save() { // @return this:
  this._cctx.save();
  return this;
}

// uuMeta.layer.restore
function restore() { // @return this:
  this._cctx.restore();
  return this;
}

// uuMeta.layer.scale - scale
function scale(w,   // @param Number: width scale
               h) { // @param Number: height scale
                    // @return this:
  this._cctx.scale(w, h);
  return this;
}

// uuMeta.layer.translate - offset origin
function translate(x,   // @param Number: offset x
                   y) { // @param Number: offset y
                        // @return this:
  this._cctx.translate(x, y);
  return this;
}

// uuMeta.layer.rotate - rotate
//    angle: 360 or "360deg" or "1.5rad"
function rotate(angle) { // @param Number/String: angle
                         // @return this:
  if (typeof angle === "string") {
    angle = parseFloat(angle) * (angle.lastIndexOf("deg") > 0) ? _TO_RADIANS : 1;
  }
  this._cctx.rotate(angle);
  return this;
}

// uuMeta.layer.transform
function transform(m11, m12, m21, m22, dx, dy) {
  this._cctx.transform(m11, m12, m21, m22, dx, dy);
  return this;
}

// uuMeta.layer.begin - beginPath + moveTo
function begin(x,    // @param Number(= void 0): move x
               y) {  // @param Number(= void 0): move y
                     // @return this:
  this._cctx.beginPath();
  (x !== void 0 && y !== void 0) && this._cctx.moveTo(x || 0, y || 0);
  return this;
}

// uuMeta.layer.move - moveTo
function move(x,   // @param Number: move x
              y) { // @param Number: move y
                   // @return this:
  this._cctx.moveTo(x, y);
  return this;
}

// uuMeta.layer.line - lineTo
function line(x,   // @param Number: move x
              y) { // @param Number: move y
                   // @return this:
  this._cctx.lineTo(x, y);
  return this;
}

// uuMeta.layer.curve - quadraticCurveTo or bezierCurveTo
function curve(a0,   // @param Number:
               a1,   // @param Number:
               a2,   // @param Number:
               a3,   // @param Number:
               a4,   // @param Number(= void 0):
               a5) { // @param Number(= void 0):
                     // @return this:
  if (a4 === void 0) {
    // cpx, cpy, x, y
    this._cctx.quadraticCurveTo(a0, a1, a2, a3);
  } else {
    // cp1x, cp1y, cp2x, cp2y, x, y
    this._cctx.bezierCurveTo(a0, a1, a2, a3, a4, a5);
  }
  return this;
}

// uuMeta.layer.clip - clip
function clip() { // @return this:
  this._cctx.clip();
  return this;
}

// uuMeta.layer.arc - arc
//    a0 and a1: 360 or "360deg" or "0rad"
function arc(x,       // @param Number:
             y,       // @param Number:
             r,       // @param Number:
             a0,      // @param Number/String(= 0): angle0
             a1,      // @param Number/String(= 360deg): angle1
             clock) { // @param Boolean(= true):
                      // @return this:
  a0 = a0 || 0;
  a1 = a1 || _360DEG;

  if (typeof a0 === "string") {
    a0 = parseFloat(a0) * (a0.lastIndexOf("deg") > 0) ? _TO_RADIANS : 1;
  }
  if (typeof a1 === "string") {
    a1 = parseFloat(a1) * (a1.lastIndexOf("deg") > 0) ? _TO_RADIANS : 1;
  }
  this._cctx.arc(x, y, r, a0, a1, (clock === void 0) ? 0 : !clock);
  return this;
}

// uuMeta.layer.draw - fill or stroke
function draw(wire) { // @param Boolean(= false):
                      // @return this:
  wire ? this._cctx.stroke() : this._cctx.fill();
  return this;
}

// uuMeta.layer.close - closePath
function close() { // @return this:
  this._cctx.closePath();
  return this;
}

// uuMeta.layer.text
function text(text,       // @param String:
              x,          // @param Number(= 0):
              y,          // @param Number(= 0):
              wire,       // @param Boolean(= false):
              maxWidth) { // @param Number(= void 0):
                          // @return this:
  var fn = wire ? "strokeText" : "fillText";

  if (maxWidth === void 0) { // for Firefox3.5 bug
    this._cctx[fn](text, x || 0, y || 0);
  } else {
    this._cctx[fn](text, x || 0, y || 0, maxWidth);
  }
  return this;
}

// uuMeta.layer.measureText - get text dimension
function measureText(text) { // @param String:
                             // @return TextMetrics: { width, height }
  this._cctx.measureText(text);
}

// uuMeta.layer.poly - poly line + fill
function poly(point,  // @param PointArray: Array( [x0, y0, x1, y1, ... ] )
              wire) { // @param Boolean(= false):
                      // @return this:
  var p = point || [0, 0], i, iz = point.length;

  this.close().begin(p[0], p[1]);
  for (i = 2; i < iz; i += 2) {
    this.line(p[i], p[i + 1]);
  }
  this.draw(wire).close();
}

// uuMeta.layer.box - add box path, fill inside
function box(x,      // @param Number:
             y,      // @param Number:
             w,      // @param Number:
             h,      // @param Number:
             r,      // @param Number(= 0):
             wire) { // @param Boolean(= false):
                     // @return this:
  return this.boxpath(x, y, w, h, r).draw(wire);
}

// uuMeta.layer.boxpath - add box path
function boxpath(x,   // @param Number:
                 y,   // @param Number:
                 w,   // @param Number:
                 h,   // @param Number:
                 r) { // @param Number(= 0):
                      // @return this:
  if (!r) {
    this._cctx.rect(x, y, w, h);
    return this;
  }
  if (r < 0) {
    r = 0;
  }
  // round corner
  return this.close().begin(x, y + r).line(x, y + h - r).
              curve(x, y + h, x + r, y + h).line(x + w - r, y + h).
              curve(x + w, y + h, x + w, y + h - r).line(x + w, y + r).
              curve(x + w, y, x + w - r, y).line(x + r, y).
              curve(x, y, x, y + r).
              close();
}

// uuMeta.layer.metabolic - metabolic box
function metabo(x,      // @param Number:
                y,      // @param Number:
                w,      // @param Number:
                h,      // @param Number:
                r,      // @param Number(= 0):
                bulge,  // @param Number(= 10):
                wire) { // @param Boolean(= false):
                        // @return this:
  r = r || 0;
  bulge = (bulge === void 0) ? 10 : bulge;

  if (bulge) {
    return this.close().begin(x, y + r).line(x, y + h - r). // 1
                curve(x + w * 0.5, y + h + bulge, x + w, y + h - r). // 2,3,4
                line(x + w, y + r). // 5
                curve(x + w, y, x + w - r, y).line(x + r, y). // 6,7
                curve(x, y, x, y + r).draw(wire). // 8
                close();
  }
  return this.close().begin(x, y + r).line(x, y + h). // 1
              line(x + w, y + h). // 2,3,4
              line(x + w, y + r). // 5
              curve(x + w, y, x + w - r, y).line(x + r, y). // 6,7
              curve(x, y, x, y + r).draw(wire). // 8
              close();
}

// uuMeta.layer.circle - circle + fill
function circle(x,      // @param Number:
                y,      // @param Number:
                w,      // @param Number:
                h,      // @param Number:
                r,      // @param Number:
                wire) { // @param Boolean(= false):
                        // @return this:
  if (w === h) { // circle
    return this.close().begin(x, y).arc(x, y, r).draw(wire).close();
  }
  // ellipse(oval) not impl.
  return this;
}

// uuMeta.layer.dots - draw dot with palette
//    palette: Hash( { paletteNo: "#ffffff" or { r,g,b,a }, ...} )
//    data: [paletteNo, paletteNo, ...]
function dots(x,       // @param Number:
              y,       // @param Number:
              w,       // @param Number:
              h,       // @param Number:
              palette, // @param Hash: color palette,
              data,    // @param Array: dot data
              index) { // @param Number(= 0): start data index
                       // @return this:
  var ctx = this._cctx, i = 0, j = 0, p, v, idx = index || 0;

  for (; j < h; ++j) {
    for (i = 0; i < w; ++i) {
      v = data[idx + i + j * w];
      if (!(v in palette)) {
        continue;
      }
      p = palette[v];
      if (typeof p === "string") {
        ctx.fillStyle = p;
      } else if (p.a) { // skip alpha = 0
        ctx.fillStyle = "rgba(" + p.r + "," + p.g + "," +
                                  p.b + "," + p.a + ")";
      }
      ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
  return this;
}

// uuMeta.layer.linearGrad - create linear gradient
function linearGrad(x1,      // @param Number:
                    y1,      // @param Number:
                    x2,      // @param Number:
                    y2,      // @param Number:
                    offset,  // @param Array: [offset, ...],
                             //           offset from 0.0 to 1.0
                    color) { // @param Number: [color, ...]
                             // @return CanvasGradient:
  var rv = this._cctx.createLinearGradient(x1, y1, x2, y2),
      i = 0, iz = offset.length;

  for (; i < iz; ++i) {
    rv.addColorStop(offset[i], color[i]);
  }
  return rv; // CanvasGradient object
}

// uuMeta.layer.radialGrad - create radial gradient
function radialGrad(x1,      // @param Number:
                    y1,      // @param Number:
                    r1,      // @param Number:
                    x2,      // @param Number:
                    y2,      // @param Number:
                    r2,      // @param Number:
                    offset,  // @param Array: [offset, ...],
                             //           offset from 0.0 to 1.0
                    color) { // @param Number: [color, ...]
                             // @return CanvasGradient:
  var rv = this._cctx.createRadialGradient(x1, y1, r1, x2, y2, r2),
      i = 0, iz = offset.length;

  for (; i < iz; ++i) {
    rv.addColorStop(offset[i], color[i]);
  }
  return rv; // CanvasGradient object
}

// uuMeta.layer.pattern - create pattern
function pattern(image,     // @param HTMLImageElement
                            //        /HTMLCanvasElement:
                 pattern) { // @param String(= "repeat"):
                            // @return CanvasPattern:
  return this._cctx.createPattern(image, pattern || "repeat");
}

// uuMeta.layer.image - image
function image(image,  // @param HTMLImageElement
                       //        /HTMLCanvasElement:
               arg1,   // @param Number(= void 0):
               arg2,   // @param Number(= void 0):
               arg3,   // @param Number(= void 0):
               arg4,   // @param Number(= void 0):
               arg5,   // @param Number(= void 0):
               arg6,   // @param Number(= void 0):
               arg7,   // @param Number(= void 0):
               arg8) { // @param Number(= void 0):
                       // @return this:
  switch (arguments.length) {
  case 1: this._cctx.drawImage(image, 0, 0); break;
  case 3: this._cctx.drawImage(image, arg1, arg2); break;
  case 5: this._cctx.drawImage(image, arg1, arg2, arg3, arg4); break;
  case 9: this._cctx.drawImage(image, arg1, arg2, arg3, arg4,
                                      arg5, arg6, arg7, arg8); break;
  default: throw "";
  }
  return this;
}

// --- canvas 2D context convenient operations ---

// uuMeta.layer.fitImage - image fitting(auto-scaling)
function fitImage(image) { // @param HTMLImageElement: image element
                           // @return this:
  var ctx = this._cctx,
      dim = _mm.image.getActualDimension(image),
      cw = _int(ctx.canvas.width),
      ch = _int(ctx.canvas.height),
      sw = dim.w,
      sh = dim.h,
      dx = (sw <= cw) ? Math.floor((cw - sw) / 2) : 0,
      dy = (sh <= ch) ? Math.floor((ch - sh) / 2) : 0,
      dw = (sw <= cw) ? sw : cw,
      dh = (sh <= ch) ? sh : ch;

  ctx.drawImage(image, 0, 0, sw, sh, dx, dy, dw, dh);
  return this;
}

// uuMeta.layer.grid - draw hatch
function grid(size,     // @param Number(= 10):
              unit,     // @param Number(= 5):
              color,    // @param String(= "skyblue"):
              color2) { // @param String(= "steelblue"):
                        // @return this:
  size = size || 10, unit = unit || 5;
  color = color || "skyblue", color2 = color2 || "steelblue";
  var x = size, y = size, i = 1, j = 1,
      w = _int(this._cctx.canvas.width),
      h = _int(this._cctx.canvas.height);

  for (; x < w; ++i, x += size) {
    this.wires((i % unit) ? color : color2).
         begin(x, 0).line(x, h).draw(1).close();
  }
  for (; y < h; ++j, y += size) {
    this.wires((j % unit) ? color : color2).
         begin(0, y).line(w, y).draw(1).close();
  }
  return this;
}

// uuMeta.layer.angleGlossy
//    override: Hash ( { gcolor1, gcolor2, overlayAlpha, w, h, r, angle } )
function angleGlossy(x,        // @param Number: move x
                     y,        // @param Number: move y
                     preset,   // @param String(= "GBLACK"): preset name
                     extend) { // @param Hash(= void 0): extend style
                               // @return this:
  preset = (preset || "GBLACK").toUpperCase();
  preset = (preset in this.preset) ? this.preset[preset] : {};
  extend = _mm.mix({ w: 100, h: 100, r: 12, angle: 0 }, preset, extend || {});

  var w = extend.w, h = extend.h, r = extend.r, angle = extend.angle,
      oa = extend.overlayAlpha, b = 3, dist = 0; // bevel size

  if (angle < -45) { angle = -45; }
  if (angle >  45) { angle =  45; }

  this.fills(this.linearGrad(x, y, x, y + h,
                             [0.0, 1.0], [extend.gcolor1, extend.gcolor2])).
       begin().box(x, y, w, h, r).close().
       fills("rgba(255,255,255," + oa + ")");

  switch (angle) {
  case 45:  this.begin(x + b, y + b + r).line(x + b, y + h - b * 2).
                  line(x + w - b * 2, y + b).line(x + b + r, y + b).
                  curve(x, y, x + b, y + b + r).draw().close(); break;
  case -45: this.begin(x - b + w, y + b + r).line(x - b + w, y + h - b * 2).
                  line(x + b * 2, y + b).line(x - b - r + w, y + b).
                  curve(x + w, y, x - b + w, y + b + r).draw().close(); break;
  default:  dist = ((h - b * 2) / 45 * angle) / 2;
            this.begin(x + b, y + b + r).
                  line(x + b, y + (h / 2) - b * 2 + dist).
                  line(x + w - b, y + (h / 2) - b * 2 - dist).
                  line(x + w - b, y + b + r).
                  curve(x + w, y, x + w - r, y + b).line(x + b + r, y + b).
                  curve(x, y, x + b, y + b + r).draw().close();
  }
  return this;
}

// uuMeta.layer.metaboGlossy
function metaboGlossy(x,        // @param Number: move x
                      y,        // @param Number: move y
                      preset,   // @param String(= "GBLACK"): preset name
                      extend) { // @param Hash(= void 0): extend style
                                // @return this:
  preset = (preset || "GBLACK").toUpperCase();
  preset = (preset in this.preset) ? this.preset[preset] : {};
  extend = _mm.mix({ w: 100, h: 50, r: 12, bulge: 6 }, preset, extend || {});

  var w = extend.w, h = extend.h, r = extend.r, bulge = extend.bulge,
      oa = extend.overlayAlpha, r2 = r > 4 ? r - 4 : 0, b = 3; // bevel size

  this.fills(this.linearGrad(x, y, x, y + h,
                             [0.0, 1.0], [extend.gcolor1, extend.gcolor2])).
        begin().box(x, y, w, h, r).close().
        fills("rgba(255,255,255," + oa + ")").
        begin().metabo(x + b, y + b, w - b * 2, h * 0.5, r2, bulge).close();
  return this;
}

// uuMeta.layer.jellyBean
function jellyBean(x,        // @param Number: move x
                   y,        // @param Number: move y
                   preset,   // @param String(= "GBLACK"): preset name
                   extend) { // @param Hash(= void 0): extend style
                             // @return this:
  extend = _mm.mix({ w: 100, h: 30, r: 16, bulge: 6 }, extend || {});
  this.metaboGlossy(x, y, preset, extend);
  return this;
}

// --- ---
function createReflectionLayer(
              id,            // @param String: layer id
              image,         // @param Node: image element
              hide,          // @param Boolean(= false): true = hide layer
              x,             // @param Number(= 0): x
              y,             // @param Number(= 0): y
              width,         // @param Number(= image width): width
              height,        // @param Number(= image height): height
              mirrorHeight,  // @param Number(= 0.625): mirror height(0 to 1)
              offsetX,       // @param Number(= 0): offset X
              offsetY) {     // @param Number(= 0): offset Y
                             // @return Node: new layer element
  var dim = _mm.image.getActualDimension(image),
      w = width || dim.w,
      h = height || dim.h,
      ox = offsetX || 0,
      oy = offsetY || 0,
      mh = (mirrorHeight === void 0) ? 0.625 : mirrorHeight;

  if (!_ua.ie) {
    return addReflection(this, id, image, hide,
                               dim, x || 0, y || 0, w, h, mh, ox, oy);
  }
  return addReflectionIE(this, id, image, hide,
                               dim, x || 0, y || 0, w, h, mh, ox, oy);
}

// inner -
function addReflection(me, id, image, hide, dim, x, y, w, h, mh, ox, oy) {
  var elm = me.createLayer(id, "canvas", hide),
      grad,
      sx = w / dim.w, // scale x
      sy = h / dim.h; // scale y

  elm.width  = w;
  elm.height = h + h * mh;

  me.moveLayer(id, x, y);

  x = 0, y = 0;
  grad = me.linearGrad(x, y + h, x, y + h + h * mh,
                         [mh, 0],
                         ["rgba(255, 255, 255, 1.0)",
                          "rgba(255, 255, 255, 0.3)"]),
  me.clear().
    save().translate(x, y).scale(sx, sy).image(image).restore().
    save().translate(x + ox, y + h * 2 + oy).
           scale(sx, -sy).image(image).restore().
    save().sets({ globalCompositeOperation: "destination-out" }).
           fills(grad).box(x, y + h, w, h * mh).restore();
  return elm;
}

// inner -
function addReflectionIE(me, id, image, hide, dim, x, y, w, h, mh, ox, oy) {
  var DXIMG = "DXImageTransform.Microsoft.",
      BASIC = DXIMG + "BasicImage",
      ALPHA = DXIMG + "Alpha",
      img1 = me.createLayer(id, "img", hide),
      img2 = me.createLayer(id + "_reflection", "img", hide), // mirror
      ns = img2.style, obj;

  _mm.mix(img1, { src: image.src, width: w, height: h });
  _mm.mix(img2, { src: image.src, width: w, height: h });

  _mm.mix(img1.style, { top: x + "px", left: y + "px" });
  _mm.mix(img2.style, { top: (x + h + oy) + "px", left: (y + ox) + "px" });

  (ns.filter.indexOf(BASIC) < 0) && (ns.filter += " progid:" + BASIC);
  (ns.filter.indexOf(ALPHA) < 0) && (ns.filter += " progid:" + ALPHA);

  obj = img2.filters.item(BASIC);
  obj.Mask = 0;
  obj.Xray = 0;
  obj.Invert = 0;
  obj.Mirror = 1;
  obj.Opacity = 1;
  obj.Rotation = 2;
  obj.GrayScale = 0;
  obj.Enabled = 1;

  obj = img2.filters.item(ALPHA);
  obj.Style = 1;
  obj.StartX = 0;
  obj.StartY = 0;
  obj.FinishX = 0;
  obj.FinishY = (1 - mh) * 100;
  obj.Opacity = 70;
  obj.FinishOpacity = 0;
  obj.Enabled = 1;

  me._layer[id].chain.push(id + "_reflection");
  return img1;
}

// inner - make color
function makeColor(gcolo1, gcolor2, overlayAlpha) {
  return { gcolor1: gcolo1,
           gcolor2: gcolor2,
           overlayAlpha: overlayAlpha };
}

// --- initialize / export ---
uuMeta.layer = uuMeta.mix(layer, {
  getLayerInstance: getLayerInstance
});
layer.prototype = {
  resizeView: resizeView,
  getViewInfo: getViewInfo,
  createLayer: createLayer,
  appendLayer: appendLayer,
  removeLayer: removeLayer,
  resizeLayer: resizeLayer,
  refLayer: refLayer,
  bringLayer: bringLayer,
  moveLayer: moveLayer,
  showLayer: showLayer,
  hideLayer: hideLayer,
  getLayerOpacity: getLayerOpacity,
  setLayerOpacity: setLayerOpacity,
  getContext: getContext,
  push: push,
  pop: pop,
  alphas: alphas,
  fills: fills,
  wires: wires,
  fonts: fonts,
  lines: lines,
  shadows: shadows,
  sets: sets,
  gets: gets,
  clear: clear,
  save: save,
  restore: restore,
  scale: scale,
  translate: translate,
  rotate: rotate,
  transform: transform,
  begin: begin,
  move: move,
  line: line,
  curve: curve,
  clip: clip,
  arc: arc,
  draw: draw,
  close: close,
  text: text,
  measureText: measureText,
  poly: poly,
  box: box,
  boxpath: boxpath,
  metabo: metabo,
  circle: circle,
  dots: dots,
  linearGrad: linearGrad,
  radialGrad: radialGrad,
  pattern: pattern,
  image: image,
  fitImage: fitImage,
  grid: grid,
  angleGlossy: angleGlossy,
  metaboGlossy: metaboGlossy,
  jellyBean: jellyBean,
  createReflectionLayer: createReflectionLayer,
  preset: {
      GBLACK:   makeColor("#000",    "#333",    0.25),
      GGRAY:    makeColor("black",   "silver",  0.38),
      GSLIVER:  makeColor("gray",    "white",   0.38),
      GBLUE:    makeColor("#0000a0", "#0097ff", 0.38),
      GGREEN:   makeColor("#006400", "#00ff00", 0.38),
      GRED:     makeColor("#400000", "#ff0000", 0.38),
      GLEMON:   makeColor("#dfcc00", "#FFE900", 0.38),
      GGOLD:    makeColor("#fffacd", "gold",    0.45), // lemonchiffon
      GPEACH:   makeColor("violet",  "red",     0.38),
      GBLOODORANGE:
                makeColor("orange",  "red",     0.38)
  }
};

})(); // uuMeta.layer scope

