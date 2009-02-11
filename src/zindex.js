// === Z-Index =============================================
// depend: advance
uu.feat.zindex = {};

/** z-index management
 *
 * @class singleton
 */
uu.Class.Singleton("ZIndex", {
  construct: function() {
    this._elm   = [];   // registed elelemt
    this._boost = 5000; // temporarily z-index in dragging
    this._top   = 20;   // top z-index
  },

  // uu.Class.Drag.ZIndex.attach - attach z-index handler
  attach: function(elm) { // Node:
    if (this._elm.indexOf(elm) === -1) {
      this._elm.push(elm);
      elm.style.zIndex = ++this._top; // top + 1
    }
    return this; // return this
  },

  // uu.Class.Drag.ZIndex.detach - detach z-index handler
  detach: function(elm) { // Node:
    if (this._elm.indexOf(elm) !== -1) {
      delete this._elm[this._elm.indexOf(elm)];
      --this._top;
    }
    return this; // return this
  },

  // uu.Class.Drag.ZIndex.beginDrag
  beginDrag: function(elm) { // Node:
    if (this._elm.indexOf(elm) === -1) {
      this.attach(elm); // auto regist
    }
    this._sink(elm);
    elm.style.zIndex = this._boost + 1;
    return this; // return this
  },

  // uu.Class.Drag.ZIndex.endDrag
  endDrag: function(elm) { // Node:
    if (this._elm.indexOf(elm) !== -1) {
      elm.style.zIndex = this._top; // move surface
    }
    return this; // return this
  },

  // uu.Class.Drag.ZIndex.top
  top: function(elm) { // Node:
    if (this._elm.indexOf(elm) !== -1) {
      this._sink(elm);
      elm.style.zIndex = this._top; // move surface
    }
    return this; // return this
  },

  _sink: function(elm) {
    var thresh = elm.style.zIndex || 10; // threshold
    this._elm.forEach(function(v) {
      (v.style.zIndex > thresh) && (v.style.zIndex -= 1);
    });
  }
});
