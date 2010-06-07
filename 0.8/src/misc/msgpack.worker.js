importScripts("utf8.js");
utf8 || importScripts("misc/utf8.js");
utf8 || importScripts("src/misc/utf8.js");

importScripts("msgpack.js");
msgpack || importScripts("misc/msgpack.js");
msgpack || importScripts("src/misc/msgpack.js");

onmessage = function(event) {
    var mix = msgpack.unpack(event.data);

//  postMessage(JSON.stringify(mix));
    postMessage(mix);
};
