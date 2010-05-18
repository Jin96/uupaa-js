
// === uu.ajax.queue ===
//{{{!depend uu, uu.ajax
//}}}!depend

uu.ajax.queue || (function(uu) {

uu.ajax.queue = uuajaxqueue;    // uu.ajax.queue(command:String, url:Array, option:Array, callback:Array, ngCallback:Array, lastCallBack:Function = void, ngCallback:Function = void)
                                //  [1] uu.ajax.queue("0+1>2>3", [url, ...], [option, ...], [callback, ...], lastCallBack, ngCallback)
uu.jsonp.queue = uujsonpqueue;  // uu.jsonp.queue("0+1>2>3", [url, ...], [option, ...], [callback, ...], lastCallBack, ngCallBack)

// uu.ajax.queue - request queue
// uu.ajax.queue("a+b>c", [url, ...], [option, ...], [fn], lastCallback, ngCallback)
function uuajaxqueue(command,       // @param String: "0>1", "0+1", "0+1>2>3"
                     url,           // @param Array: [url, ...]
                     option,        // @param Array: [option, ...]
                     callback,      // @param Array: [callback, ...]
                     lastCallback,  // @param Function(= void): lastCallback([AjaxResultHash, ... ])
                     ngCallback) {  // @param Function(= void): ngCallback(AjaxResultHash)
    queue(1, command, url, option, callback,
          lastCallback || uu.nop, ngCallback || uu.nop, []);
}

// inner - queue impl. http://d.hatena.ne.jp/uupaa/20091221
function queue(ajax, command, url, option,
               callback, lastCallback, ngCallback, rv) {
    function next(r) {
        queue(ajax, command, url, option,
              callback, lastCallback, ngCallback, rv.concat(r)); // recursive
    }

    if (!command) {
        lastCallback(rv); // finish
        return;
    }

    var cmd, commandArray = command.split(""), ary = [];

    command = ""; // clear

    while ( (cmd = commandArray.shift()) ) { // v = "a"
        ary.push(url.shift(),
                 uu.mix(option.shift() || {}, { id: cmd }),
                 callback.shift());

        if (commandArray.shift() === ">") {
            command = commandArray.join(""); // rebuild command, "0+1>2>3" -> "2>3"
            break;
        }
    }
    parallel(ajax, ary, next, ngCallback);
}

// inner - ajax/jsonp parallel load
function parallel(ajax, ary, lastCallback, ngCallback) {
    function next(hash) {
        var idx = atom.indexOf(hash.guid);

        rv[idx] = hash;
        ++n >= iz / 3 && !run++ && lastCallback(rv); // callback([{...}, ..])
    }
    function error(hash) {
        !run++ && ngCallback(hash);
    }

    var rv = [], atom = [], i = 0, iz = ary.length, n = 0, run = 0;

    for (; i < iz; i += 3) {
        atom.push((ajax ? uu.ajax : uu.jsonp)(ary[i], ary[i + 1],
                                              ary[i + 2], error, next));
    }
}

// uu.jsonp.queue - request queue
function uujsonpqueue(command, url, option,
                      callback, lastCallback, ngCallback) { // @see uu.ajax.queue
    queue(0, command, url, option, callback,
          lastCallback || uu.nop, ngCallback || uu.nop, []);
}

})(uu);

