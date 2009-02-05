// === Virtual Timer =======================================
// depend: ready
uu.feat.virtualtimer = {};

// VirtualTimer factory
uu.virtualtimer = function() {
  return new uu.Class.VirtualTimer();
};

/** Virtual Timer
 *
 * @class
 */
uu.Class("VirtualTimer", {
  UNKNOWN: 0, // diet
  UNSETED: 1, // diet
  RUNNING: 2,
  LOOPOUT: 3,
  SUSPEND: 4,

  construct: function() {
    this._btid = -1; // base timer ID
    this._lock = 0;  // 1: diet
    this._db = [ /* vtid: { next, unset, fn, count, dfn, delay,
                            last, loop, name, me }, ... */ ];
    var me = this;
    uu.unready(function() {
      me.suspend(-1);
      me.db = null;
    });
  },

  // uu.Class.VirtualTimer.set - regist VirtualTimer
  set: function(fn,         // Function: callback function
                delay,      // Number: delay time(unit: ms)
                loop,       // Number(default: -1): loop count, -1 is INFINITY loop
                name,       // String(default: "-"): timer name
                bindThis) { // ThisObject(default: undefined): fn.call(bindThis)
    loop = (loop === void 0) ? -1 : loop;

    var dfn  = (typeof delay === "function") ? delay : null,
        next = dfn ? dfn(0, name) : delay, // create first delay
        vtid = this._db.length;             // create virtual timer id

    if (next < 0) { return -2; } // quit
    this.resume(-1); // base timer auto restart

    this._db[vtid] = {
      next:     +new Date + next, // next tick(0 is finished)
      last:     0,            // last tick
      unset:    0,            // unset flag
      fn:       fn,           // callback function
      count:    0,            // execution count
      dfn:      dfn,          // generation function of delay time
      delay:    delay,        // delay time
      loop:     loop,         // limited loop count
      name:     name || "-",  // timer name
      bindThis: bindThis      // execution context
    };
    !loop && (this._db[vtid].next = 0); // loop=0 is Limited loop + finished state

    return vtid; // return Number: virtual timer id
  },

  // uu.Class.VirtualTimer.unset - unregist VirtualTimer
  unset: function(vtid) { // Number: virtual timer id
    var v = this._db[vtid];
    v && (v.unset = 1);
  },

  // uu.Class.VirtualTimer.extend - extend loop count
  extend: function(vtid,    // Number: virtual timer id
                   loop) {  // Number(default: -1): loop count
    loop = (loop === void 0) ? -1 : loop;

    var v = this._db[vtid];
    if (!v || v.unset) { return; }

    if (loop < 0) { // loop < 0 to Infinity loop
      v.loop = -1;
    } else if (v.loop < 0) { // loop >= 0 to Limited loop
      v.loop = loop;
    } else { // add loop count
      v.loop = v.loop + loop;
    }
    v.next += !v.next ? 1 : 0; // restart if suspended
  },

  // uu.Class.VirtualTimer.resume - resume
  resume: function(vtid) { // Number(default: -1): virtual timer id
    vtid = (vtid === void 0) ? -1 : vtid;
    var v;

    if (vtid < 0) {
      (this._btid === -1) && this._runner(); // restart
    } else if ((v = this._db[vtid]) && !v.unset) {
      v.next = 1; // restart
      (this._btid === -1) && this.resume(-1); // resume(-1) - restart base timer
    }
  },

  // uu.Class.VirtualTimer.suspend - suspend
  suspend: function(vtid) { // Number(default: -1): virtual timer id
    vtid = (vtid === void 0) ? -1 : vtid;
    var v;

    if (vtid < 0) {
      (this._btid !== -1) && clearTimeout(this._btid);
      this._btid = -1; // stop base timer
    } else if ((v = this._db[vtid]) && !v.unset) {
      v.next = 0; // stop
    }
  },

  // uu.Class.VirtualTimer.diet - memory compaction
  diet: function() {
    ++this._lock;
  },
  _diet: function() {
    var rv = [], i = 0, iz = this._db.length;
    for (; i < iz; ++i) {
      (this.state(i) & 0x6) && rv.push(this._db[i]);
    }
    this._db = rv;  // swap array
    this._lock = 0; // unlock
  },

  // uu.Class.VirtualTimer.state - get state
  state: function(vtid) { // Number: virtual timer id
    var v = this._db[vtid];
    if (v) {
      if (v.unset)            { return this.UNSETED; }
      if ( v.loop &&  v.next) { return this.RUNNING; }
      if (!v.loop && !v.next) { return this.LOOPOUT; }
      if ( v.loop && !v.next) { return this.SUSPEND; }
    }
    return this.UNKNOWN; // return Number
  },

  _runner: function() {
    var solver = this;
    (function VTM_RUNNER() {
      var me = solver, tick = +new Date,
          db = me._db, i = 0, iz = db.length, delay, v, next;

      me._lock && me._diet();

      for (; i < iz; ++i) {
        v = db[i]; // fetch
        next = v.next;

        if (next && tick >= next) {

          if (v.loop < 0 || --v.loop) { // rest
            if (v.dfn) {
              delay = v.dfn.call(v.bindThis, ++v.count, v.name);
              if (delay < 0) { // loopout
                v.next = 0;
                v.loop = 0;
              } else {
                v.next = v.last + delay;
              }
            } else {
              v.next = v.last + v.delay;
            }
          } else {
            v.next = 0; // loop out
          }
          v.last = tick;
          v.fn.call(v.bindThis);
        }
      }
      me._btid = setTimeout(VTM_RUNNER, 0);
    })();
  }
});
