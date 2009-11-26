
// === uuMeta.style.zindex ===
// depend: uuMeta
(function uuMetaStyleZIndexScope() {
var _mm = uuMeta;

// class ZIndex
_mm.Class.singleton("ZIndex", {
  construct:  _zconstruct,
  top:        ztop,       // top(node)
  bind:       zbind,      // bind(node)
  unbind:     zunbind,    // unbind(node)
  drag:       zdrag       // drag(node)
});

// inner -
function _zconstruct() {
  this._node  = {};   // { nodid: node }
  this._boost = 5000; // temporarily z-index in dragging
  this._topz  = 20;   // top z-index
}

// uuMeta.zindex.top
function ztop(node) { // @param Node:
  var id = _mm.node.id(node);

  this._node[id] && (_zsink(this, node),
                     node.style.zIndex = this._topz); // move surface
}

// uuMeta.zindex.bind - bind z-index handler
function zbind(node) { // @param Node:
  var id = _mm.node.id(node);

  this._node[id] || (this._node[id] = node,
                     node.style.zIndex = ++this._topz); // top + 1
}

// uuMeta.zindex.unbind - unbind z-index handler
function zunbind(node) { // @param Node:
  var id = _mm.node.id(node);

  this._node[id] && (delete this._node[id], --this._topz);
}

// uuMeta.zindex.drag - begin drag, end drag
function zdrag(node) { // @param Node:
  if (_mm.eazyData(node, "zindexdrag")) { 
    this._node[_mm.node.id(node)] &&
        (node.style.zIndex = this._topz); // move surface
  } else { // begin drag
    this.bind(node); // auto attach
    _zsink(this, node);
    node.style.zIndex = this._boost + 1;
  }
}

// inner -
function _zsink(me, node) {
  var thresh = node.style.zIndex || 10, // threshold
      hash = this._node, v, i = 0;

  for (i in hash) {
    v = hash[i];
    (v.style.zIndex > thresh) && (v.style.zIndex -= 1);
  }
}

// --- initialize / export ---
uuMeta.zindex = new uuMeta.Class.ZIndex();

})(); // uuMeta.style.zindex scope

