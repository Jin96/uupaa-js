
// === Resize Event ===
//{{{!depend uu
//}}}!depend

uu.event.resize || (function(win, doc, uu) {
var _resizeevobj = { node: win, name: "resize", code: 17 }, // 17 -> uu.event._code
    _resizedb = {
        0: { delay:  40, lock: 0, fn: [] },         // window.onresize(delay:40ms)
        1: { delay: 100, lock: 0, fn: [], tmid: 0 } // resize agent(delay:100ms)
    };

uu.mix(uu.event, {
    resize: uu.mix(uueventresize, {  // uu.event.resize(fn, agent = 0)
        stop:      uueventresizestop // uu.event.resize.stop(agent = 0)
    })
});

// uu.event.resize
function uueventresize(fn,      // @param Function: callback function
                       agent) { // @param Number(= 0): 0 is event, 1 is agent
    var db = _resizedb[agent || 0];

    if (!db.fn.length) { // init
        agent ? (db.dim = uu.win.size(),
                 db.tmid = setInterval(_uueventresizeagent, db.delay))
              : uu.event.attach(win, "resize", _uueventresizeevent);
    }
    db.fn.push(fn);
}

// uu.event.resize.stop
function uueventresizestop(agent) { // @param Number(= 0): 0 is event, 1 is agent
    var db = _resizedb[agent || 0];

    db.fn = [];
    agent ? (db.tmid && (clearInterval(db.tmid), db.tmid = 0))
          : uu.event.detach(win, "resize", _uueventresizeevent);
    db.lock = 0;
}

// inner - resize agent loop
function _uueventresizeagent() {
    var db = _resizedb[1], i = 0, iz, dim;

    if (!db.lock++) {
        dim = uu.win.size();
        if (db.dim.innerWidth !== dim.innerWidth
            || db.dim.innerHeight !== dim.innerHeight) { // resized?

            db.dim = dim; // store
            for (iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](_resizeevobj, win); // callback(evt, window)
            }
        }
        setTimeout(function() { db.lock = 0; }, 0); // [lazy] unlock
    }
}

// inner - resize event handler
function _uueventresizeevent() {
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

