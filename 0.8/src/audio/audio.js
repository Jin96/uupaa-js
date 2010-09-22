
// === Audio ===

//  <audio autoplay loop="true">
//      <source src="hoge.mp3" type="audio/mpeg" />
//      <source src="audio.ogg" type="audio/ogg; codecs=vorbis">
//  </audio>
//
// +--------------+-------------+---------------+----------+
// |   Browser    | uu("Audio") |   HTML5Audio  |FlashAudio|
// +--------------+-------------+---------------+----------+
// |Firefox3.0    | mp3         |       -       |   mp3    |
// |Firefox3.5+   | mp3,ogg,wav |      ogg, wav |   mp3    |
// |Safari3.x     | mp3         |       -       |   mp3    |
// |Safari4+ (win)| mp3,m4a,wav |(mp3),m4a, wav |   mp3    |
// |Safari4+ (mac)| mp3,m4a     |      m4a      |   mp3    |
// |Chrome4+      | mp3,m4a,ogg |(mp3),m4a, ogg |   mp3    |
// |Opera9x-10.10 | mp3         |       -       |   mp3    |
// |Opera10.50+   | mp3,ogg,wav |      ogg, wav |   mp3    |
// |iOS3          |     -       |       -       |    -     |
// |iOS4          |     ?       |(mp3),m4a, wav |    -     |
// |IE6,IE7,IE8   | mp3         |       -       |   mp3    |
// |IE9beta       | mp3         |      mp3      |   mp3    |
// +--------------+-------------+---------------+----------+

//  interface HTMLMediaElement : HTMLElement {
//
//    // error state
//    readonly attribute MediaError error;              -> state() -> { error }
//
//    // network state
//             attribute DOMString src;                 -> x
//    readonly attribute DOMString currentSrc;          -> state() -> { source }
//    const unsigned short NETWORK_EMPTY = 0;
//    const unsigned short NETWORK_IDLE = 1;
//    const unsigned short NETWORK_LOADING = 2;
//    const unsigned short NETWORK_NO_SOURCE = 3;
//    readonly attribute unsigned short networkState;   -> x
//             attribute DOMString preload;             -> x
//    readonly attribute TimeRanges buffered;           -> x
//    void load();                                      -> x
//    DOMString canPlayType(in DOMString type);         -> x
//
//    // ready state
//    const unsigned short HAVE_NOTHING = 0;
//    const unsigned short HAVE_METADATA = 1;
//    const unsigned short HAVE_CURRENT_DATA = 2;
//    const unsigned short HAVE_FUTURE_DATA = 3;
//    const unsigned short HAVE_ENOUGH_DATA = 4;
//    readonly attribute unsigned short readyState;     -> x
//    readonly attribute boolean seeking;               -> x
//
//    // playback state
//             attribute float currentTime;             -> currentTime()
//    readonly attribute float startTime;               -> startTime()
//    readonly attribute float duration;                -> state() -> { duration }
//    readonly attribute boolean paused;                -> state() -> { paused }
//             attribute float defaultPlaybackRate;     -> x
//             attribute float playbackRate;            -> x
//    readonly attribute TimeRanges played;             -> x
//    readonly attribute TimeRanges seekable;           -> x
//    readonly attribute boolean ended;                 -> state() -> { ended }
//             attribute boolean autoplay;              -> x  (AudioOptionHash.autoplay)
//             attribute boolean loop;                  -> loop()
//    void play();                                      -> play()
//    void pause();                                     -> pause()
//
//    // controls
//             attribute boolean controls;              -> x
//             attribute float volume;                  -> volume()
//             attribute boolean muted;                 -> mute()
//  };
// --- support events ---
//  bind("pause,ended,error,play,playing,canplay,timeupdate");

// Audio spec: http://www.w3.org/TR/html5/video.html
(function(win, doc, uu, HTMLAudioElement) {

var _env = uu.env;

uu.Class("HTML5Audio", {
    init:           HTML5AudioInit,     // init(src:String, option:Hash, callback:Function)
    attr:           HTML5AudioAttr,     // attr(key:String/Hash, value:Mix = void):Hash/void
                                        //      { src, loop, start, volume, backend, current, duration }
    play:           HTML5AudioPlay,     // play()
    stop:           HTML5AudioStop,     // stop(close:Boolean = false)
    pause:          HTML5AudioPause,    // pause()
    state:          HTML5AudioState     // state():Hash - { error, ended, closed, paused,
                                        //                  playing, condition }
}, {
    ready:          !!HTMLAudioElement,
    isSupport:      function(src) {     // @param String: "music.mp3"
                                        // @return Boolean:
        var windows = _env.os === "windows";

        if (/\.mp3$/i.test(src)) { // *.mp3
            if ((windows && _env.safari) || _env.chrome || _env.ie9) {
                return true;
            }
        } else if (/\.og\w+$/i.test(src)) { // *.ogg
            if (_env.gecko || _env.chrome || _env.opera) {
                return true;
            }
        } else if (/\.m4a$/i.test(src)) { // *.m4a (AAC)
            if (_env.webkit) {
                return true;
            }
        } else if (/\.wav$/i.test(src)) { // *.wav
            if ((windows && _env.safari) || _env.gecko || _env.opera) {
                return true;
            }
        }
        return false;
    }
});

// HTML5Audio.init
function HTML5AudioInit(src,        // @param URLString: "music.mp3"
                        option,     // @param Hash:
                        callback) { // @param Function: callback(this)
    if (option.node) {
        this.audio = option.node;

        if (!option.node.parentNode) {
            uu.add(this.audio);
        }
    } else {
        if (win.Audio) {
            this.audio = new Audio(src);
        } else if (win.HTMLAudioElement) {
            this.audio = doc.createElement("audio");
            this.audio.src = src;
        } else {
            throw new Error("LOGIC_ERROR");
        }
        uu.add(this.audio);
    }
    this.audio.loop = this._loop = option.loop || false;
    this.audio.volume = option.volume || 0.5;
    this._lastAction = "";
    this._startTime = option.start || 0;
    this._closed = false;

    var that = this;

    // HTMLAudioElement.instance():this
    this.audio.instance = function() {
        return that;
    };

    uu.bind(this.audio, "ended", function() {
        if (that._closed || that._lastAction === "stop") {
            return;
        }
        if (that._loop) {
            that.play();
        }
    });

    // autoplay
    if (option.auto) {
        setTimeout(function() {
            that.play();
        }, 100);
    }

    callback && callback(this);
}

// HTML5Audio.attr
function HTML5AudioAttr(key,     // @param String/Hash(= void):
                        value) { // @param Mix(= void):
                                 // @return Hash/void: { src, loop, start, volume,
                                 //                      backend, current, duration }
    var rv, i, v, undef;

    switch (uu.complex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: rv = {
                src:        this.audio.src || "",
                loop:       this._loop,
                start:      this._startTime,
                volume:     this.audio.volume,
                backend:    "HTML5Audio",
                current:    this.audio.currentTime,
                duration:   this.audio.duration || 0
            };
            return key === undef ? rv : rv[key];
    case 3: key = uu.pair(key, value);
    }
    for (i in key) {
        v = key[i];
        switch (i) {
        case "loop":    this.audio.loop = this._loop = v; break;
        case "start":   this._startTime = v; break;
        case "volume":  this.audio.volume = v; break;
        case "current": this.audio.currentTime = v;
        }
    }
    return;
}

// HTML5Audio.play
function HTML5AudioPlay() {
    if (!this._closed) {
        this._lastAction = "play";

        if (!this.audio.paused) {
            this.attr("current", this._startTime);
        }
        this.audio.play();
    }
}

// HTML5Audio.stop
function HTML5AudioStop(close) { // @param Boolean(= false):
    if (close) {
        this._closed = true;
        uu.unbind(this.audio, "ended");
        uu.event.fire(this.audio, "ended");
        uu.node.remove(this.audio);
    } else if (this.state().playing) {
        this._lastAction = "stop";
        this.audio.pause();
        this.attr("current", this._startTime); // reset
    }
}

// HTML5Audio.pause
function HTML5AudioPause() {
    if (this.state().playing) {
        this._lastAction = "pause";
        this.audio.pause();
    }
}

// HTML5Audio.state
function HTML5AudioState() { // @return Hash: { error, ended, closed, paused,
                             //                 playing, condition }
    var error  = this.audio.error,
        ended  = this.audio.ended  || false,
        closed = this._closed,
        paused = this.audio.paused || false,
        stoped = this._lastAction === "stop",
        condition;

    if (stoped && paused) {
        ended  = true;
        paused = false;
    }
    condition = closed ? "closed"
              : error  ? "error"
              : paused ? "paused"
              : ended  ? "ended" : "playing";
    return {
        error:      error,
        ended:      ended,
        closed:     closed,
        paused:     paused,
        playing:    condition === "playing",
        condition:  condition,
        toString:   function() {
            return this.condition;
        }
    };
}

})(this, document, uu, this.HTMLAudioElement);

