// === uuMeta.vt ===
// depend: uuMeta
/*
uuMeta.Class.VirtualTimer.endless(thisArg, callback) - return vtid
uuMeta.Class.VirtualTimer.limited(thisArg, callback, loop = 1) - return vtid
uuMeta.Class.VirtualTimer.kill(vtid)
uuMeta.Class.VirtualTimer.resume(vtid = void 0)
uuMeta.Class.VirtualTimer.suspend(vtid = void 0)
uuMeta.Class.VirtualTimer.state() - return Hash( { vtid: state, ... } )
                            state = INACTIVE(0) / RUNNING(1) / SUSPEND(2)
 */
// VirtualTimer factory
uuMeta.vt = function(baseClock) {
  return new uuMeta.Class.VirtualTimer(baseClock);
};

// class VirtualTimer
uuMeta.Class("VirtualTimer", {
  construct: function(baseClock) {
    // increment base timer id. for Safari3
    setTimeout(uuMeta.vain, 0);

    this._baseClock = baseClock;
    this._btid = 0; // base timer ID
    this._db = {};  // { vtid: {data}, ... }
                    // data = { next,last,kill,thisArg,callback,count,loop }
  },

  // uuMeta.Class.VirtualTimer.endless - regist endless timer
  endless: function(thisArg,    // @param this: bind this
                    callback) { // @param Function: callback, delay time
                                // @return Number/false: vtid
    return this._regist(bind_this, callback, -1);
  },

  // uuMeta.Class.VirtualTimer.limited - regist limited loop timer
  limited: function(thisArg,  // @param this: bind this
                    callback, // @param Function: callback, delay time
                    loop) {   // @param Number(= 1): loop count
                              // @return Number/false: vtid
    return this._regist(bind_this, callback, loop || 1);
  },

  _regist: function(thisArg, callback, loop) {
    var vtid = uuMeta.guid(),     // virtual timer id
        next = callback(0, vtid); // first delay time

    if (next < 0) { return false; } // quit
    this.resume(); // base timer auto restart

    this._db[vtid] = {
      next:     loop ? ((+new Date) + next) : 0, // next tick(0 is finished)
      last:     0,        // last tick
      kill:     0,        // kill flag
      thisArg:  thisArg,
      callback: callback,
      count:    0,        // execution count
      loop:     loop      // loop count(-1 is endless)
    };
    return vtid;
  },

  // uuMeta.Class.VirtualTimer.kill - kill virtual timer
  kill: function(vtid) { // @param Number: vtid
    this._db[vtid] && (this._db[vtid].kill = 1);
  },

  // uuMeta.Class.VirtualTimer.resume - resume timer
  resume: function(vtid) { // @param Number(= void): void 0 is base timer
    var v;

    if (vtid === void 0) {
      !this._btid && this._runner(); // restart
    } else if ((v = this._db[vtid]) && !v.kill) {
      v.next = 1; // restart virtual timer
      !this._btid && this.resume(); // resume() - restart base timer
    }
  },

  // uuMeta.Class.VirtualTimer.suspend - suspend timer
  suspend: function(vtid) { // @param Number(= void): void 0 is base timer
    var v;

    if (vtid === void 0) {
      this._btid && clearTimeout(this._btid);
      this._btid = 0;
    } else if ((v = this._db[vtid]) && !v.kill) {
      v.next = 0; // stop virtual timer
    }
  },

  // uuMeta.Class.VirtualTimer.state - get state
  state: function() { // @return Hash: { vtid: state, ... }
                      //    Number: state INACTIVE(0)
                      //               or RUNNING(1)
                      //               or SUSPEND(2)
    var rv = {}, v, i;

    for (i in this._db) {
      v = this._db[vtid];
      rv[i] = (v.kill || !v.loop) ? 0 : v.next ? 1 : 2;
    }
    return rv;
  },

  _runner: function() {
    var me = this;

    function _innerLoop() {
      var tick = +new Date, db = me._db, i, r, v, gc = [];

      for (i in db) {
        v = db[i];
        if (v.kill || !v.loop) { gc.push(i); continue; }

        if (v.next && tick >= v.next) {
          if (v.loop < 0 || --v.loop) { // rest
            // next_delay = callback(count, vtid)
            r = v.callback.call(v.thisArg, ++v.count, i);
            (r < 0) ? (v.next = v.loop = 0)  // loop out
                    : (v.next = v.last + r); // calc next
            v.last = tick;
          } else {
            v.next = 0; // loop out
          }
        }
      }
      i = 0;
      while ( (v = gc[i++]) ) {
        delete me._db[v];
      }
      me._btid = setTimeout(_innerLoop, me._baseClock);
    }
    _innerLoop();
  }
});

uuMeta.vtHigh = uuMeta.vt(uuMeta.ua.webkit ? 10 : 16);
uuMeta.vtMid  = uuMeta.vt(100);
uuMeta.vtLow  = uuMeta.vt(250);

