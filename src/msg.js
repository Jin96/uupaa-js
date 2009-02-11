// === Message Pump ========================================
// depend: advance
uu.feat.msg = {};

/** Message Pump
 */
uu.Class("Msg", {
  construct: function() {
    this._addr = { /* uuid: obj, ... */ };
    this._msg = [ /* num: [ uuid, msg, param1, param2], ... */ ];
    this._run = 0;
  },

  // uu.Class.Msg.regist - register the destination of the message
  regist: function(obj /* , ... */) { // Object: object has uuid property
    var arg = arguments, v, i = 0, iz = arg.length;

    for (; i < iz; ++i) {
      v = arg[i];
      if (!v.uuid) { throw ""; }
      this._addr[v.uuid] = v;
    }
    return this; // return this
  },

  // uu.Class.Msg.unregist
  unregist: function(obj /* , ... */) { // Object: object has uuid property
    var arg = arguments, v, i = 0, iz = arg.length;

    for (; i < iz; ++i) {
      v = arg[i];
      if (!v.uuid) { throw ""; }
      delete this._addr[obj.uuid];
    }
    return this; // return this
  },

  // uu.Class.Msg.send - send a message synchronously
  send: function(to,   // Object: send to
                 msg,  // String: msg
                 p1,   // Mix(default: undefined): param1
                 p2) { // Mix(default: undefined): param2
    var rv = [], i;

    if (to) { // unicast, multicast
      ((to instanceof Array) ? to : [to]).forEach(function(v, i) {
        rv.push(this._addr[typeof v === "object" ? v.uuid : v].msgbox(msg, p1, p2));
      });
      // if it is an unicast, not the array but the return value is returned.
      return (rv.length === 1) ? rv[0] : rv;
    }
    // broadcast
    for (i in this._addr) {
      rv.push(this._addr[i].msgbox(msg, p1, p2));
    }
    return rv; // return Mix: msgbox result
  },

  // uu.Class.Msg.post - send a message asynchronously
  post: function(to,   // Object: send to
                 msg,  // String: msg
                 p1,   // Mix(default: undefined): param1
                 p2) { // Mix(default: undefined): param2
    var i, stock = this._msg;

    if (to) { // unicast, multicast
      ((to instanceof Array) ? to : [to]).forEach(function(v, i) {
        stock.push([typeof v === "object" ? v.uuid : v, msg, p1, p2]);
      });
    } else { // broadcast
      for (i in this._addr) {
        stock.push([i, msg, p1, p2]);
      }
    }
    this._runner();
    return this; // return this
  },

  _runner: function() {
    var me = this;
    !this._run && (function() {
      if (!me._msg.length) {
        me._run = 0;
        return;
      }
      var v = me._msg.shift();
      if (v[0] in me._addr) {
        me._addr[v[0]].msgbox(v[1], v[2], v[3]); // (msg, param1, param2)
      }
      me._run = 1;
      setTimeout(arguments.callee, 0);
    })();
  }
});

uu.msg = new uu.Class.Msg();
