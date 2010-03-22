
// === <audio> ===
// depend: uu
//
//  <audio src="..." preload="..." autoplay="..." loop="..." controls="...">
//  </audio>
//
//     or
//
//  <audio preload="..." autoplay="..." loop="..." controls="...">
//      <source />
//      <source />
//  </audio>
//
//  HTMLAudioElement:
//
//  var audio = new Audio(src = "");
//
//  audio.autoplay = false;
//  audio.controls = false;
//  audio.currentSrc = "...";
//  audio.currentTime = 0;
//  audio.defaultPlaybackRate = 1;
//  audio.duration = 267.59588623046875;
//  audio.ended = false;
//  audio.loop = false;
//  audio.muted = false;
//  audio.networkState = 3;
//  audio.paused = true;
//  audio.playbackRate = 1;
//  audio.played = TimeRanges;
//  audio.preload = auto;
//  audio.seekable = TimeRanges;
//  audio.seeking = false;
//  audio.src = "...";
//  audio.startTime = 0;
//  audio.volume = 1;
//  audio.addEventListener("play")
//  audio.addEventListener("pause")
//  audio.addEventListener("ended")

uu.agein || (function(win, doc, uu) {

// <audio src="...">
// +--------------+------------+-----+-----+
// |Browser       | Ogg Vorbis | MP3 | WAV |
// |Firefox3.5+   |     ok     |     | ok  | -> Silverlight or Flash
// |Safari4+      |            | ok  | ok  | -> <audio>
// |Chrome3+      |     ok     | ok  |     | -> <audio>
// |Opera10.50+   |     ok     |     | ok  | -> Silverlight or Flash
// |iPhone3       |            |     |     | -> NoAudio
// |IE6,IE7,IE8   |            |     |     | -> Silverlight or Flash
// |IE9 preview   |            |     |     | -> Silverlight or Flash
// +--------------+------------+-----+-----+
var _builder = NoAudio;

if (uu.ver.advanced) {
    _builder = Native;
    if (uu.ver.chrome && uu.ver.browser < 3) {
        _builder = NoAudio;
    }
} else {
    if (uu.ver.silverlight) {
        _builder = Silverlight;
    } else if (uu.ver.flash > 8
               && _swfLoader(uu.config.baseDir + "uu.audio.swf")) {
        _builder = Flash;
    }
}

// uu.audio
if (!uu.audio) {
    uu.audio = function html5NodeBuilder() { // @param Mix: var_args
        return uu.node.build("audio", arguments);
    }
}

if (win.HTMLAudioElement) {
    win.HTMLAudioElement.prototype.getCurrentTime = function() {
        return this.currentTime;
    };
} else {
    win.Audio = function(src) { // @param URLString(= ""): media source
        var audio = _builder.build(uue("audio", 1));

        src && (audio.src = src);
        return audio;
    };
}

uu.audio.init   = uuaudioinit;      // uu.audio.init()
uu.audio.create = uuaudiocreate;    // uu.audio.create() -> <audio>

uu.audio.Native      = Native;      // uu.audio.Native class
uu.audio.Silverlight = Silverlight; // uu.audio.Silverlight class
uu.audio.Flash       = Flash;       // uu.audio.Flash class
uu.audio.NoAudio     = NoAudio;     // uu.audio.NoAudio class

// class Native
function Native() {
}
Native.build = function(audio) {
    // extend methods and properties
    audio.getCurrentTime = function() {
        return audio.currentTime;
    };
    audio.xBackend = "Audio";
};

// class Silverlight
function Silverlight(audio) { // @param Node: <audio>
    Silverlight.init(this, audio);

    // extend methods and properties
    audio.xBackend = "Silverlight";
}

// class Flash
function Flash(audio) { // @param Node: <audio>
    Flash.init(this, audio);

    // extend methods and properties
    audio.xBackend = "Flash";
}

// class NoAudio
function NoAudio() {
}
NoAudio.build = function(audio) {
    audio.autoplay = false;
    audio.loop = false;
    audio.src = "";
    audio.error = true;
    audio.ended = false;
    audio.paused = false;
    audio.startTime = 0;
    audio.currentTime = 0;
    audio.getCurrentTime = function() {
        return 0;
    };
    audio.xBackend = "NoAudio";
    audio.play = audio.pause = audio.stop = audio.load = uunop;
};

// uu.audio.init
function uuaudioinit() {
    uu.ary.each(uu.tag("audio"), function(audio) {
        var newAudioNode = uu.ie ? _removeFallback(audio) : audio;

        _builder.build(newAudioNode);
    });
    uu.ready.gone.win = uu.ready.gone.audio = 1;
}

// uu.audio.create - create audio element
function uuaudiocreate(placeHolder) { // @param Node(= <body>): placeholder Node
                                      // @return Node: new element
    var audio = uue(uu.ie ? "AUDIO" : "audio"); // [IE][!] need upper case

    placeHolder || (placeHolder = doc.body.appendChild(uue())); // <body><div /></body>
                                                                //       ~~~~~~~
    placeHolder.parentNode.replaceChild(audio, placeHolder);
    return _builder.build(audio);
}

// inner - remove fallback contents
function _removeFallback(audio) { // @param Node:
                                  // @return Node: new audio node
    if (!audio.parentNode) {
        return audio;
    }
    var rv = doc.createElement(audio.outerHTML),
        endTags = doc.getElementsByTagName("/CANVAS"),
        parent = audio.parentNode,
        idx = audio.sourceIndex, x, v, w, i = -1;

    while ( (x = endTags[++i]) ) {
        if (idx < x.sourceIndex && parent === x.parentNode) {
            v = doc.all[x.sourceIndex];
            do {
                w = v.previousSibling; // keep previous
                v.parentNode.removeChild(v);
                v = w;
            } while (v !== audio);
            break;
        }
    }
    parent.replaceChild(rv, audio);
    return rv;
}

// inner - swf preloader
function _swfLoader(url) { // @param String: url
                           // @return Number: 1 or 0
    try {
        var xhr = win.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
                  win.XMLHttpRequest ? new XMLHttpRequest() : 0;

        xhr.open("GET", url, false); // sync
        xhr.send(null);
        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
            return 1;
        }
    } catch (err) {}
    return 0;
}

// --- initialize ---
uu.lazy("audio", function() {
    uu.audio.init();
    win.xaudio && win.xaudio(uu, uu.tag("audio"));
});

})(window, document, uu);

