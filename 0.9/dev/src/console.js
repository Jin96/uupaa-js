// window.console

//{@worker
//{@node
//{@ti
//{@mb

(function(global) { // @param GlobalObject:

// none operation
function nop() {
}

// window.console
// supports: IE9+, Opera, WebKit, Firefox, Node
if (!global.console) {
    global.console = {};
}

var console = global.console;

// --- export ---
(console.log        || (console.log        = nop));
(console.debug      || (console.debug      = nop));
(console.info       || (console.info       = nop));
(console.warn       || (console.warn       = nop));
(console.error      || (console.error      = nop));
(console.debug      || (console.debug      = nop));
(console.info       || (console.info       = nop));
(console.warn       || (console.warn       = nop));
(console.error      || (console.error      = nop));
(console.assert     || (console.assert     = nop));
(console.dir        || (console.dir        = nop));
(console.dirxml     || (console.dirxml     = nop));
(console.trace      || (console.trace      = nop));
(console.group      || (console.group      = nop));
(console.groupEnd   || (console.groupEnd   = nop));
(console.time       || (console.time       = nop));
(console.timeend    || (console.timeend    = nop));
(console.count      || (console.count      = nop));
(console.profile    || (console.profile    = nop));
(console.profileEnd || (console.profileEnd = nop));

})(this);

//}@mb
//}@ti
//}@node
//}@worker

