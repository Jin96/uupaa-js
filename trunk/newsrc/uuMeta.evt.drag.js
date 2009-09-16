// === uuMeta.evt.drag ===
// depend: uuMeta, uuMeta.evt, uuMeta.style.zindex

// class Drag - generic drag and drop impl
uuMeta.Class("Drag", {
  drag: function(evt,
                 dragFrame,
                 dragArea) {
    var mx, my, off, iebody,
        kind = 0xff && (uuMeta.evt._EVENT_CODE[evt.type] || 0),
        rect, x, y, style;

    if (!kind || (kind > 0x3) ||
        (kind === 0x3 && !dragArea._uuEventDragging) || // 0x3: mousemove
        (kind === 0x1 &&  dragArea._uuEventDragging) || // 0x1: mousedown
        (kind === 0x2 && !dragArea._uuEventDragging)) { // 0x2: mouseup
      return 0;
    }
    uuMeta.evt.tidy(evt);
    mx = evt.xpageX;
    my = evt.xpageY;

    switch (kind) {
    case 3: // mousemove
      off = dragArea._uuEventDragOffset;
      x = mx - off.x;
      y = my - off.y;
      style = dragFrame.style;
      if (uuMeta.ua.ie) {
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
