
// === <audio> ===
//{{{!depend uu
//}}}!depend

//  <audio autoplay loop="true" src="hoge.mp3">
//  </audio>
//
//     or
//
//  <audio autoplay loop="true">
//      <source src="hoge.mp3" type="audio/mpeg" />
//  </audio>
//
// +--------------+------------+--------------+-------------------+
// |Browser       | new Audio  | new MP3Audio |  HTMLAudioElement |
// +--------------+------------+--------------+-------------------+
// |Firefox3.5+   |  ogg,wav   |     mp3      |    ogg,    wav    |
// |Safari4+      |  mp3,wav   |     mp3      |        mp3,wav    |
// |Chrome3+      |  ogg,mp3   |     mp3      |    ogg,mp3        |
// |Opera10.50+   |  ogg,wav   |     mp3      |    ogg,    wav    |
// |iPhone3       |     -      |      -       |         -         |
// |IE6,IE7,IE8   |    mp3     |     mp3      |         -         |
// |IE9 preview   |    mp3     |     mp3      |         -         |
// +--------------+------------+--------------+-------------------+
//  var audio    = new Audio(src = "");
//  var mp3audio = new MP3Audio(src = "");
//
//  --- support properties ---
//  audio.autoplay = false;         // [READ / WRITE]
//  audio.loop = false;             // [READ / WRITE]
//  audio.src = "...";              // [READ / WRITE]
//  audio.error = false;            // [READ-ONLY]
//  audio.ended = false;            // [READ-ONLY]
//  audio.paused = true;            // [READ-ONLY]
//  audio.volume = 0.5;             // [READ / WRITE]
//  audio.startTime = 0;            // [READ / WRITE]
//  audio.currentTime = 0;          // [WRITE-ONLY]
//  audio.xBackend = "Audio";       // [READ-ONLY]
//                   "Silverlight"
//                   "Flash"
//                   "NoAudio"
//  --- support methods ---
//  audio.play();
//  audio.pause();
//  audio.stop();
//  audio.getCurrentTime() -> Number
//  --- support events ---
//  audio.addEventListener("pause")
//  audio.addEventListener("ended")
//  audio.addEventListener("error")
//  audio.addEventListener("playing")
//  audio.addEventListener("canplay")

// uu.audio
if (!uu.audio) {
    uu.audio = function html5NodeBuilder() { // @param Mix: var_args
        return uu.node.build("audio", arguments);
    };
}

uu.audio.init || (function(win, doc, uu) {

var _mp3builder,
    _builder = win.HTMLAudioElement ? Native
             : uu.ver.silverlight ? Silverlight
             : uu.ver.as3 && uu.require(uu.config.baseDir + "uu.audio.swf").ok ? Flash
             : NoAudio;

if (win.HTMLAudioElement) {
    win.HTMLAudioElement.prototype.getCurrentTime = function() {
        return this.currentTime;
    };
    win.HTMLAudioElement.prototype.stop = function() {
        if (!this.error) {
            if (!this.paused) {
                if (!this.ended) {
                    this.pause();
                    this.currentTime = 0;
                }
            }
        }
    };

    if (uu.webkit) {
        win.MP3Audio = win.Audio;
    } else {
        _mp3builder = uu.ver.silverlight ? Silverlight
                    : uu.ver.as3 && uu.require(uu.config.baseDir + "uu.audio.swf").ok ? Flash
                    : NoAudio;
        win.MP3Audio = function(src) { // @param URLString(= ""): media source
            var audio = _mp3builder.build(uu.node.add("mp3audio")); // <mp3audio>

            src && (audio.src = src);
            return audio;
        };
    }
} else {
    win.Audio = win.MP3Audio = function(src) { // @param URLString(= ""): media source
        var audio = _builder.build(uu.node.add("audio"));

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
    audio.play = audio.pause = audio.stop = audio.load = uu.nop;
};

// uu.audio.init
function uuaudioinit() {
    uu.tag("audio").forEach(function(audio) {
        var newAudioNode = uu.ie ? _removeFallback(audio) : audio;

        _builder.build(newAudioNode);
    });
    uu.ready.gone.win = uu.ready.gone.audio = 1;
}

// uu.audio.create - create audio element
function uuaudiocreate(placeHolder) { // @param Node(= <body>): placeholder Node
                                      // @return Node: new element
    var audio = uu.node(uu.ie ? "AUDIO" : "audio"); // [IE][!] need upper case

    placeHolder || (placeHolder = doc.body.appendChild(uu.node())); // <body><div /></body>
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

// --- initialize ---
uu.lazy("audio", function() {
    uu.audio.init();
    win.xaudio && win.xaudio(uu, uu.tag("audio"));
});

})(window, document, uu);

