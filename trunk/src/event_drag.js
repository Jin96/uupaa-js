// === Event Drag ==========================================
// depend: event,zindex
uu.feat.event_drag = {};

uu.mix(UU.CONFIG.EVENT, {
  // UU.CONFIG.EVENT.KIND_DRAG
  KIND_DRAG: {
    // event.type   kind
    unknown:        0x0000,
    mousedown:      0x0001,
    mouseup:        0x0002,
    mousemove:      0x0003,
    losecapture:    0x0102  // mouseup
  }
}, 0, 0);

// uu.Class.Event.drag - generic drag and drop impl
uu.mix(uu.Class.Event.prototype, {
  drag: function(evt,
                 dragFrame,
                 dragArea) {
    var mx, my, off, iebody,
        kind = 0xff && (UU.CONFIG.EVENT.KIND_DRAG[evt.type] || 0),
        rect, x, y, style;

    if (!kind || (kind > 0x3) ||
        (kind === 0x3 && !dragArea._uuEventDragging) || // 0x3: mousemove
        (kind === 0x1 &&  dragArea._uuEventDragging) || // 0x1: mousedown
        (kind === 0x2 && !dragArea._uuEventDragging)) { // 0x2: mouseup
      return 0;
    }

    if (UU.IE) {
      iebody = uudoc.documentElement || uudoc.body;
      mx = evt.clientX + iebody.scrollLeft;
      my = evt.clientY + iebody.scrollTop;
    } else {
      mx = evt.pageX;
      my = evt.pageY;
    }

    switch (kind) {
    case 3: // mousemove
      off = dragArea._uuEventDragOffset;
      x = mx - off.x;
      y = my - off.y;
      style = dragFrame.style;
      if (UU.IE) {
        style.pixelLeft = x;
        style.pixelTop  = y;
      } else {
        style.left = x + "px";
        style.top  = y + "px";
      }
      return { x: mx, y: my, kind: kind };
    case 1: // mousedown
      dragArea._uuEventDragging = 1;
      (new uu.Class.ZIndex()).beginDrag(dragArea);

      rect = uu.style.getRect(dragArea);
      x = mx - rect.x;
      y = my - rect.y;
      return dragArea._uuEventDragOffset = { x: x, y: y, kind: kind };
    case 2: // mouseup
      dragArea._uuEventDragging = 0;
      (new uu.Class.ZIndex()).endDrag(dragArea);

      return { x: mx, y: my, kind: kind };
    }
    return 0;
  }
});

/** Simply Drag and Drop
 *
 * @class
 */
uu.Class("SimplyDrag", {
  construct: function(dragFrame,  // Node: drag frame
                      dragArea) { // Node: drag area
    this._dragFrame = dragFrame;

    this._dragArea = dragArea;
    this._dragArea.style.cursor = "move";
    uu.event.attach(dragArea, "mousedown", this);
  },

  handleEvent: function(evt) {
    uu.event.stop(evt).drag(evt, this._dragFrame, this._dragArea);
    if (uu.event.kind(evt) <= 2) {
      uu.event.toggle(UU.IE ? this._dragArea
                            : uudoc, "mousemove,mouseup", this, true);
    }
  }
});
