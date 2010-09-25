
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
// |iOS4          |     m4a     |(mp3),m4a, wav |    -     |
// |IE6,IE7,IE8   | mp3         |       -       |   mp3    |
// |IE9beta       | mp3         |    mp3(buggy) |   mp3    |
// +--------------+-------------+---------------+----------+

//  interface HTMLMediaElement : HTMLElement {
//
//    // error state
//    readonly attribute MediaError error;              -> audio.state().error
//
//    // network state
//             attribute DOMString src;                 -> x
//    readonly attribute DOMString currentSrc;          -> audio.attr().src
//    readonly attribute unsigned short networkState;   -> x
//    const unsigned short NETWORK_EMPTY = 0;
//    const unsigned short NETWORK_IDLE = 1;
//    const unsigned short NETWORK_LOADING = 2;
//    const unsigned short NETWORK_NO_SOURCE = 3;
//             attribute DOMString preload;             -> x
//    readonly attribute TimeRanges buffered;           -> x
//    void load();                                      -> x
//    DOMString canPlayType(in DOMString type);         -> x
//
//    // ready state
//    readonly attribute unsigned short readyState;     -> x
//    const unsigned short HAVE_NOTHING = 0;
//    const unsigned short HAVE_METADATA = 1;
//    const unsigned short HAVE_CURRENT_DATA = 2;
//    const unsigned short HAVE_FUTURE_DATA = 3;
//    const unsigned short HAVE_ENOUGH_DATA = 4;
//    readonly attribute boolean seeking;               -> x
//
//    // playback state
//             attribute float currentTime;             -> audio.attr().currentTime
//    readonly attribute float startTime;               -> audio.attr().startTime
//    readonly attribute float duration;                -> audio.state().duration
//    readonly attribute boolean paused;                -> audio.state().paused
//             attribute float defaultPlaybackRate;     -> x
//             attribute float playbackRate;            -> x
//    readonly attribute TimeRanges played;             -> x
//    readonly attribute TimeRanges seekable;           -> x
//    readonly attribute boolean ended;                 -> audio.state().ended
//             attribute boolean autoplay;              -> uu.audio(src, { audoplay: true })
//             attribute boolean loop;                  -> audio.attr().loop
//    void play();                                      -> audio.play()
//    void pause();                                     -> audio.pause()
//
//    // controls
//             attribute boolean controls;              -> x
//             attribute float volume;                  -> audio.attr.volume
//             attribute boolean muted;                 -> x (audio.attr.volume === 0)
//  };
// --- support events ---
//  bind("pause,ended,error,play,playing,canplay,timeupdate,durationchange");

// Audio spec: http://www.w3.org/TR/html5/video.html
(function(win, doc, uu, HTMLAudioElement) {

uu.Class("HTML5Audio", {
    init:           HTML5AudioInit,     // init(src:String, option:Hash, callback:Function)
    attr:           HTML5AudioAttr,     // attr(key:String/Hash, value:Mix = void):Hash/void
                                        //      { src, loop, volume, backend, duration, startTime, currentTime }
    play:           HTML5AudioPlay,     // play()
    stop:           HTML5AudioStop,     // stop(close:Boolean = false)
    pause:          HTML5AudioPause,    // pause()
    state:          HTML5AudioState     // state():Hash - { error, ended, closed, paused,
                                        //                  playing, condition }
}, {
    ready:          !!HTMLAudioElement,
    isSupport:      function(src) {     // @param String: "music.mp3"
                                        // @return Boolean:
        var env = uu.env, windows = env.os === "windows";

        if (/\.mp3$/i.test(src)) { // *.mp3
            if ((windows && env.safari) || env.chrome || env.ie9) {
                return true;
            }
            if (env.iPhone) {
                return true;
            }
        } else if (/\.og\w+$/i.test(src)) { // *.ogg
            if (env.gecko || env.chrome || env.opera) {
                return true;
            }
        } else if (/\.m4a$/i.test(src)) { // *.m4a (AAC)
            if (env.webkit) {
                return true;
            }
        } else if (/\.wav$/i.test(src)) { // *.wav
            if ((windows && env.safari) || env.gecko || env.opera) {
                return true;
            }
        }
        return false;
    }
});

// HTML5Audio.init
function HTML5AudioInit(src,        // @param URLString: "music.mp3"
                        option,     // @param Hash: { node, loop, volume, startTime, autoplay }
                        callback) { // @param Function(= void): callback(this)
    // glue
    this.audio = option.node;
    if (this.audio) {
        this.audio.src || (this.audio.src = src);
    } else {
        if (win.Audio) {
            this.audio = new Audio();
        } else if (HTMLAudioElement) {
            this.audio = doc.createElement("audio"); // [IE9beta]
        } else {
            throw new Error("LOGIC_ERROR");
        }
        this.audio.src = src;
    }
    if (!this.audio.parentNode) {
        uu.add(this.audio);
    }

//  [iOS4.1][FIX] http://twitter.com/uupaa/status/25485203353
//  this.audio.loop = this._loop = option.loop || false;
    this._loop = option.loop || false;
    this.audio.volume = option.volume || 0.5;
    this._closed = false;
    this._startTime = option.startTime || 0;
    this._lastAction = "";

    var that = this;

    // HTMLAudioElement.instance():this
    this.audio.instance = function() {
        return that;
    };

    // audio.loop
    // [iOS4.1][FIX] http://twitter.com/uupaa/status/25485203353
    uu.bind(this.audio, "ended", function() {
        if (that._closed || that._lastAction === "stop") {
            return;
        }
        if (that._loop) {
            that.attr("currentTime", that._startTime); // rewind
            that.play();
        } else {
            that.audio.pause(); // ended -> pause
        }
    });

    // autoplay
    if (option.autoplay) {
        setTimeout(function() {
            that.play();
        }, 100);
    }

    callback && callback(this);
}

// HTML5Audio.attr
function HTML5AudioAttr(key,     // @param String/Hash(= void):
                        value) { // @param Mix(= void):
                                 // @return Hash/void: { src, loop, volume, backend, duration,
                                 //                      startTime, currentTime }
    var rv, i, v, undef;

    switch (uu.complex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: rv = {
                src:        this.audio.src || "",
                loop:       this._loop,
                volume:     this.audio.volume,
                backend:    "HTML5Audio",
                duration:   this.audio.duration || 0,
                startTime:  this._startTime,
                currentTime:this.audio.currentTime
            };
            return key === undef ? rv : rv[key];
    case 3: key = uu.pair(key, value);
    }
    for (i in key) {
        v = key[i];
        switch (i) {
//      case "loop":        this.audio.loop = this._loop = v; break;
        case "loop":        this._loop = v; break;
        case "volume":      this.audio.volume = v; break;
        case "startTime":   this._startTime = v; break;
        case "currentTime": this.audio.currentTime = v;
        }
    }
    return;
}

// HTML5Audio.play
function HTML5AudioPlay() {
    if (!this._closed) {
        this._lastAction = "play";
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
        this.attr("currentTime", this._startTime); // reset
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

// === FlashAudio ===
// http://livedocs.adobe.com/flash/9.0_jp/ActionScriptLangRefV3/flash/media/Sound.html

//{@mb
uu.Class("FlashAudio", {
    init:           FlashAudioInit,     // init(src:String, option:AudioOptionHash = {}, callback:Function)
    attr:           FlashAudioAttr,     // attr(key:String/Hash, value:Mix = void):Hash/void
                                        //      { src, loop, volume, backend, duration, startTime, currentTime }
    play:           FlashAudioPlay,     // play()
    stop:           FlashAudioStop,     // stop(close:Boolean = false)
    pause:          FlashAudioPause,    // pause()
    state:          FlashAudioState     // state():Hash - { error, ended, closed, paused,
                                        //                  playing, condition }
}, {
    swf:            uu.config.baseDir + "uu.audio.swf",
    ready:          function() {
        return uu.env.flash && uu.stat(uu.Class.FlashAudio.swf);
    },
    isSupport:      function(src) {
        return /\.mp3$/i.test(src);
    }
});

// FlashAudio.init
function FlashAudioInit(src,        // @param String: "music.mp3"
                        option,     // @param Hash: { node, loop, volume, startTime, autoplay }
                        callback) { // @param Function(= void): callback(this)
    // glue
    this.audio = option.node; // event source
    this.audio || (this.audio = uu.div());
    this.audio.parentNode || uu.add(this.audio);

    this.flash = null; // backend object

    var that = this,
        OBJECT_ID = "externalflashaudio" + uu.number();

    // FlashAudio.instance():this
    this.audio.instance = function() {
        return that;
    };

    // special event
    function flashAudioReadyCallbackEvent(eventType, param) {
        setTimeout(function() {
            uu.event.fire(that.audio, eventType, param);
        }, 0);
    }
    uu.dmz[OBJECT_ID + "event"] = flashAudioReadyCallbackEvent;

    // wait for response from flash initializer
    function wait() {
        that.flash.asFlashAudioSetAttr({ src:       src,
                                         loop:      option.loop   || false,
                                         volume:    option.volume || 0.5,
                                         startTime: option.startTime || 0 });
        callback && callback(that);
        option.autoplay && that.play();
    }
    this.flash = uu.flash(uu.Class.FlashAudio.swf,
                          OBJECT_ID, { width: 1, height: 1 }, wait);
}

// FlashAudio.attr
function FlashAudioAttr(key,     // @param String/Hash(= void):
                        value) { // @param Mix(= void):
                                 // @return Hash/void: { src, loop, volume, backend, duration,
                                 //                      startTime, currentTime }
    var rv, undef;

    switch (uu.complex(key, value)) { // 1: (), 2: (k), 3: (k,v), 4: ({})
    case 1:
    case 2: rv = this.flash.asFlashAudioGetAttr();
            return key === undef ? rv : rv[key];
    case 3: key = uu.pair(key, value);
    }
    this.flash.asFlashAudioSetAttr(key);
    return;
}

// FlashAudio.play
function FlashAudioPlay() {
    this.state().closed || this.flash.asFlashAudioPlay();
}

// FlashAudio.stop
function FlashAudioStop(close) { // @param Boolean(= false):
    if (close) {
        this.flash.asFlashAudioStop(true);
        uu.node.remove(this.audio);
    } else if (this.state().playing) {
        this.flash.asFlashAudioStop(false);

        var attr = this.flash.asFlashAudioGetAttr();

        this.flash.asFlashAudioSetAttr({ currentTime: attr.startTime,
                                         timeupdate: 1 }); // rewind
    }
}

// FlashAudio.pause
function FlashAudioPause() {
    this.state().playing && this.flash.asFlashAudioPause();
}

// FlashAudio.state
function FlashAudioState() { // @return Hash: { error, ended, closed, paused,
                             //                 playing, condition }
    var rv = this.flash.asFlashAudioGetState();

    rv.toString = function() {
        return this.condition;
    };
    return rv;
}
//}@mb

})(this, document, uu, this.HTMLAudioElement);

