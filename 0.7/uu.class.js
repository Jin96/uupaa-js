
// === class / message pump ===
// depend: uu
uu.agein || (function(win, doc, uu) {

// --- class(oop) / instance ---
uu.Class = uuclass;                 // [1][no inheit] uu.Class("A",   { proto: ... })
                                    // [2][inherit]   uu.Class("B:A", { proto: ... })
uu.Class.guid = uuclassguid;        // uu.Class.guid() -> Number(instance guid)
uu.Class.singleton = uuclasssingleton;
                                    // uu.Class.singleton("myclass", proto)
uu.factory = uufactory;             // [1][create instance]         uu.factory("my", arg1, ...)                -> new uu.Class("my", arg1, ...)
                                    // [2][uu.Class + instance]     uu.factory("my2", my2prototype, arg1, ...) -> new uu.Class("my2", arg1, ...)

// --- MessagePump class ---
MessagePump.prototype = {
    send:           uumsgsend,      // [1][multicast] MessagePump.send([inst1, inst2], "hello") -> [result1, result2]
                                    // [2][unicast]   MessagePump.send(inst, "hello") -> ["world!"]
                                    // [3][broadcast] MessagePump.send(0, "hello") -> ["world!", ...]
    post:           uumsgpost,      // [1][multicast] MessagePump.post([instance, instance], "hello")
                                    // [2][unicast]   MessagePump.post(instance, "hello")
                                    // [3][broadcast] MessagePump.post(0, "hello")
    register:       uumsgregister,  // MessagePump.register(instance) -> this
    unregister:     uumsgunregister // MessagePump.unregister(instance) -> this
};

uu.msg = new MessagePump();         // uu.msg - MessagePump instance


// --- Class / Instance ---
// uu.Class - create a generic class
// [1][no inheit] uu.Class("A",   { proto: ... })
// [2][inherit]   uu.Class("B:A", { proto: ... })
function uuclass(className, // @param String: "Class"
                            //             or "Class:SuperClass"
                            //             or "Class<SuperClass"
                 proto) {   // @param Hash(= void 0): prototype object
    // http://d.hatena.ne.jp/uupaa/20100129
    var ary = className.split(/\s*[\x3a-\x40]\s*/), tmp, i,
        Class = ary[0], Super = ary[1] || "";

    uuclass[Class] = function uuClass() {
        var lv3 = this,
            lv2 = lv3.superClass || 0,
            lv1 = lv2 ? lv2.superClass : 0;

        uuclassguid(lv3);
        lv3.msgbox || (lv3.msgbox = uunop);
        uu.msg.register(lv3);

        // constructor(lv1 -> lv2 -> lv3)
        lv1 && lv1.init && lv1.init.apply(lv3, arguments);
        lv2 && lv2.init && lv2.init.apply(lv3, arguments);
               lv3.init && lv3.init.apply(lv3, arguments);

        // destructor(~lv3 -> ~lv2 -> ~lv1)
        lv3["~fin"] = lv3.fin || uunop;
        lv3.fin && uu.ev.attach(win, "unload", function() {
            lv3.fin && lv3.fin();
        });
        lv3.fin = function wrapper() {
            lv3["~fin"]();
            lv2 && lv2.fin && lv2.fin.call(lv3);
            lv1 && lv1.fin && lv1.fin.call(lv3);

            // destroy them all
            for (var i in lv3) {
                lv3[i] = null;
            }
        };
    };
    uuclass[Class].prototype = proto || {};

    if (Super) { // [2]
        tmp = function() {};
        tmp.prototype = uu.Class[Super].prototype;
        uuclass[Class].prototype = new tmp;

        for (i in proto) {
            uuclass[Class].prototype[i] = proto[i];
        }
        uuclass[Class].prototype.constructor = uuclass[Class];
        uuclass[Class].prototype.superClass = uu.Class[Super].prototype;
        uuclass[Class].prototype.superMethod = superMethod;
    }

    function superMethod(from,             // @param Function: caller
                         method            // @param String: method name
                         /* var_args */) { // @param Mix: args
        var obj = this.superClass;

        // recurtion guard
        if (from === obj[method] || superMethod.caller === obj[method]) {
            obj = obj.superClass;
        }
        return obj[method].apply(this, uu.ary(arguments).slice(2));
    }
}

// uu.Class.guid - get instance id
function uuclassguid(instance) { // @param Instance:
                                 // @return Number: instance id, from 1
    return instance.uuguid || (instance.uuguid = uu.guid());
}

// uu.Class.singleton - create a singleton class
function uuclasssingleton(className, // @param String: class name
                          proto) {   // @param Hash(= void 0): prototype object
                                     // @return Object: singleton class instance
    uuclass[className] = function() {
        var me = this, arg = arguments, self = arg.callee;

        if (self.instance) {
            me.stable && me.stable.apply(me, arg); // after the second
        } else {
            uuclassguid(me);
            me.init && me.init.apply(me, arg);
            me.fin  && uu.ev.attach(win, "unload", function() {
                me.fin();
            });
            me.msgbox || (me.msgbox = uunop);
            uu.msg.register(me);
        }
        return self.instance || (self.instance = me);
    };
    uuclass[className].prototype = proto || {};
}

// uu.factory - class factory(max args 4)
// [1][create instance] uu.factory("my", arg1, ...) -> new uu.Class("my")
// [2][define and create instance] uu.factory("my2", prototype, arg1, ...)
//                                                  -> new uu.Class("my2")
function uufactory(className, // @param String: class name
                   arg1,      // @param Hash/Mix(= void 0): prototype or arg1
                   arg2,      // @param Mix(= void 0):
                   arg3,      // @param Mix(= void 0):
                   arg4,      // @param Mix(= void 0):
                   arg5) {    // @param Mix(= void 0):
                              // @return Instance: new Class[className](arg, ...)
    if (!uuclass[className]) { // [2]
        uuclass(className, arg1); // define Class
        return new uuclass[className](arg2, arg3, arg4, arg5);
    }
    return new uuclass[className](arg1, arg2, arg3, arg4); // [1]
}
// --- message pump ---
// uu.Class.MessagePump
function MessagePump() {
    this._db = {};   // Address { guid: instance, ... }
    this._guid = []; // guid cache [guid, ...]
}

// MessagePump.send - send a message synchronously
// [1][multicast] MessagePump.send([inst1, inst2], "hello") -> [result1, result2]
// [2][unicast]   MessagePump.send(inst, "hello") -> ["world!"]
// [3][broadcast] MessagePump.send(0, "hello") -> ["world!", ...]
function uumsgsend(to,      // @param Array/0/instance(= 0): addr or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           0 is broadcast
                   msg,     // @param String: msg
                   param) { // @param Mix(= void 0):
                            // @return Arra: [result, ...]
    var rv = [], ri = -1, v, w, i = -1, ary = to ? uu.ary(to) : this._guid;

    while ( (v = ary[++i]) ) {
        w = this._db[v.uuguid || v || 0];
        w && (rv[++ri] = w.msgbox(msg, param));
    }
    return rv;
}

// MessagePump.post - send a message asynchronously
// [1][multicast] MessagePump.post([instance, instance], "hello")
// [2][unicast]   MessagePump.post(instance, "hello")
// [3][broadcast] MessagePump.post(0, "hello")
function uumsgpost(to,      // @param Array/0/instance(= 0): addr or guid
                            //           [instance, ...] is multicast
                            //           instance is unicast
                            //           0 is broadcast
                   msg,     // @param String: msg
                   param) { // @param Mix(= void 0): param
    var me = this;

    setTimeout(function() {
        me.send(to ? uu.ary(to) : me._guid, msg, param);
    }, 0);
}

// MessagePump.register - register the destination of the message
function uumsgregister(inst) { // @param Instance: class instance
    this._db[uuclassguid(inst)] = inst;
    this._guid = uu.hash.keys(this._db);
}

// MessagePump.unregister
function uumsgunregister(inst) { // @param Instance: class instance
    delete this.db[uuclassguid(inst)];
    this._guid = uu.hash.keys(this._db);
}

})(window, document, uu);

