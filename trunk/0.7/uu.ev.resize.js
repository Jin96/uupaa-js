
// === Resize Event ===
// depend: uu.js, uu.css.js
//
// ::event.keyCode
//    http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
uu.waste || (function(win, doc, uu) {
var _db = {
      0: { delay:  40, lock: 0, fn: []        }, // event
      1: { delay: 100, lock: 0, fn: [], tm: 0 }  // agent
    },
    _clear = function(db){db.lock=db.kill=0,db.fn=[]}; // clear db

uu.mix(uu.ev, {
  resize:  uu.mix(uuevresize, {   // uu.ev.resize(fn, type = false)
    stop:         uuevresizestop  // uu.ev.resize.stop
  })
});

// uu.ev.resize
function uuevresize(fn,      // @param Function: callback function
                    agent) { // @param Number(= 0): 0 is event, 1 is agent
  var db = _db[agent || 0];

  if (!db.fn.length) { // init
    agent ? (db.dim = uu.css.size(),
             db.tm = setInterval(_agent, db.delay))
          : uu.ev.attach(win, "resize", _event);
  }
  db.fn.push(fn);
}

// uu.ev.resize.stop
function uuevresizestop(agent) { // @param Number(= 0): 0 is event, 1 is agent
  var db = _db[agent || 0];

  db.fn = [];
  agent ? (db.tm && (db.tm = clearInterval(db.tm), 0))
        : uu.ev.detach(win, "resize", _event);
  db.lock = 0;
}

// inner - resize agent loop
function _agent() {
  var db = _db[1], i = 0, iz, dim;

  if (!db.lock++) {
    dim = uu.css.size();
    if (db.dim.iw !== dim.iw || db.dim.ih !== dim.ih) { // resized?
      db.dim = dim; // store
      for (iz = db.fn.length; i < iz; ++i) {
        db.fn[i] && db.fn[i](); // callback
      }
    }
    setTimeout(function() { db.lock = 0; }, 0); // [lazy] unlock
  }
}

// inner - resize event handler
function _event() {
  var db = _db[0];

  if (!db.lock++) {
    setTimeout(function() {
      for (var i = 0, iz = db.fn.length; i < iz; ++i) {
        db.fn[i] && db.fn[i]();
      }
      setTimeout(function() { db.lock = 0; }, 0); // [lazy] unlock
    }, db.delay); // event-intensive
  }
}

})(window, document, uu);

