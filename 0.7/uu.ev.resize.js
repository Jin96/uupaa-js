
// === Resize Event ===
//{{{!depend uu
//}}}!depend

uu.ev.resize || (function(win, doc, uu) {
var _resizeevobj = { node: win, name: "resize", code: 17 }, // 17 -> uu.ev._code
    _resizedb = {
        0: { delay:  40, lock: 0, fn: [] },         // window.onresize(delay:40ms)
        1: { delay: 100, lock: 0, fn: [], tmid: 0 } // resize agent(delay:100ms)
    };

uu.mix(uu.ev, {
    resize: uu.mix(uuevresize, {  // uu.ev.resize(fn, agent = 0)
        stop:        uuevresizestop // uu.ev.resize.stop(agent = 0)
    })
});

// uu.ev.resize
function uuevresize(fn,      // @param Function: callback function
                    agent) { // @param Number(= 0): 0 is event, 1 is agent
    var db = _resizedb[agent || 0];

    if (!db.fn.length) { // init
        agent ? (db.dim = uu.win.size(),
                 db.tmid = setInterval(_uuevresizeagent, db.delay))
              : uu.ev.attach(win, "resize", _uuevresizeevent);
    }
    db.fn.push(fn);
}

// uu.ev.resize.stop
function uuevresizestop(agent) { // @param Number(= 0): 0 is event, 1 is agent
    var db = _resizedb[agent || 0];

    db.fn = [];
    agent ? (db.tmid && (clearInterval(db.tmid), db.tmid = 0))
          : uu.ev.detach(win, "resize", _uuevresizeevent);
    db.lock = 0;
}

// inner - resize agent loop
function _uuevresizeagent() {
    var db = _resizedb[1], i = 0, iz, dim;

    if (!db.lock++) {
        dim = uu.win.size();
        if (db.dim.iw !== dim.iw || db.dim.ih !== dim.ih) { // resized?
            db.dim = dim; // store
            for (iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](_resizeevobj, win); // callback(evt, window)
            }
        }
        setTimeout(function() { db.lock = 0; }, 0); // [lazy] unlock
    }
}

// inner - resize event handler
function _uuevresizeevent() {
    var db = _resizedb[0];

    if (!db.lock++) {
        setTimeout(function() {
            for (var i = 0, iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](_resizeevobj, win); // callback(evt, window)
            }
            setTimeout(function() { db.lock = 0; }, 0); // [lazy] unlock
        }, db.delay); // event-intensive
    }
}

})(window, document, uu);

