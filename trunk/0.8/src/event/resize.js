
// === uu.event.resize ===
//#include uupaa.js

uu.event.resize || (function(win, uu) {

uu.event.resize        = uueventresize;       // uu.event.resize(evaluator)
uu.event.resize.unbind = uueventresizeunbind; // uu.event.resize.unbind()

// uu.event.resize
function uueventresize(evaluator) { // @param Function: callback function
    var db = uueventresize.db;

    if (!db.fn.length) { // init
        uueventresize.unsafe ? (db.vp = uu.viewport();
                                db.tmid = setInterval(onagent, db.delay))
                             : uu.event.attach(win, "resize", onresize);
    }
    db.fn.push(evaluator);
}
// [IE6][IE7][IE8] resize event unsafe (infinity loop)
uueventresize.unsafe = uu.ie && uu.ver < 9;
uueventresize.db = {
    fn:     []
    tmid:   0,
    lock:   0,
    delay:  uueventresize.unsafe ? 100 : 40  // 100ms(unsafe) or 40ms(safe)
};

// uu.event.resize.unbind
function uueventresizeunbind() {
    var db = uueventresize.db;

    db.fn = [];
    uueventresize.unsafe ? (db.tmid && (clearInterval(db.tmid), db.tmid = 0))
                         : uu.event.detach(win, "resize", onresize);
    db.lock = 0;
}

// inner - resize event handler
function onresize() {
    var db = uueventresize.db;

    if (!db.lock++) {
        setTimeout(function() {
            for (var i = 0, iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](createFakeEvent(event)); // callback(event)
            }
            setTimeout(function() { // [lazy] unlock
                db.lock = 0;
            }, 0);
        }, db.delay); // event-intensive
    }
}

// inner - resize handler(resize agent) for unsafe browser
function onagent() {
    var db = uueventresize.db, i = 0, iz, vp;

    if (!db.lock++) {
        //
        // peek innerWidth and innerHeight
        //
        vp = uu.viewport();
        if (db.vp.w !== vp.innerWidth || db.vp.h !== vp.innerHeight) { // resized?

            db.vp = vp; // store
            for (iz = db.fn.length; i < iz; ++i) {
                db.fn[i] && db.fn[i](createFakeEvent({}), win); // callback(event)
            }
        }
        setTimeout(function() { // [lazy] unlock
            db.lock = 0;
        }, 0);
    }
}

// inner -
function createFakeEvent(event) {
    return uu.mix(event, {
        xtype: uu.event.xtypes.resize, // 17
        xtarget: win
    });
}

})(this, uu);

