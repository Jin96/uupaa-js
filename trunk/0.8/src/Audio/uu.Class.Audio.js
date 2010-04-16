
// === Audio ===
//{{{!depend uu, uu.class
//}}}!depend

//  <audio autoplay loop="true">
//      <source src="hoge.mp3" type="audio/mpeg" />
//      <source src="audio.ogg" type="audio/ogg; codecs=vorbis">
//  </audio>
//
// +--------------+-------------+---------------+----------------+----------+
// |   Browser    | uu("Audio") |   HTML5Audio  |SilverlightAudio|FlashAudio|
// +--------------+-------------+---------------+----------------+----------+
// |Firefox3.0    | mp3         |       -       |      mp3       |   mp3    |
// |Firefox3.5+   | mp3,ogg,wav |      ogg, wav |      mp3       |   mp3    |
// |Safari3.x     | mp3         |       -       |      mp3       |   mp3    |
// |Safari4+ (win)| mp3,m4a,wav |(mp3),m4a, wav |      mp3       |   mp3    |
// |Safari4+ (mac)| mp3,m4a     |      m4a      |       -        |   mp3    |
// |Chrome4+      | mp3,m4a,ogg |(mp3),m4a, ogg |      mp3       |   mp3    |
// |Opera9x-10.10 | mp3         |       -       |       -        |   mp3    |
// |Opera10.50+   | mp3,ogg,wav |      ogg, wav |       -        |   mp3    |
// |iPhone3       |     -       |       -       |       -        |    -     |
// |IE6,IE7,IE8   | mp3         |       -       |      mp3       |   mp3    |
// |IE9 preview   | mp3         |       -       |      mp3       |   mp3    |
// +--------------+-------------+---------------+----------------+----------+

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

uu.Class.Audio || (function(win, doc, uu) {

var _backendOrder = "HTML5Audio,SilverlightAudio,FlashAudio,NoAudio";

uu.Class("Audio", {
    init:           init,           // init(source:String, option:AudioOptionHash = {}, callback:Function)
    close:          close,          // close()
    play:           play,           // play()
    pause:          pause,          // pause()
    stop:           stop,           // stop()
    loop:           loop,           // loop(value:Boolean):Boolean/void
                                    //  [1][set] loop(true)
                                    //  [2][get] loop() -> true
    mute:           mute,           // mute(value:Boolean):Boolean/void
                                    //  [1][set] mute(true)
                                    //  [2][get] mute() -> true
    togglePlay:     togglePlay,     // togglePlay():Boolean
                                    //  [1][play]   togglePlay() -> true
                                    //  [2][pause]  togglePlay() -> false
    toggleMute:     toggleMute,     // toggleMute():Boolean
                                    //  [1][mute]   toggleMute() -> true
                                    //  [2][sound]  toggleMute() -> false
    toggleLoop:     toggleLoop,     // toggleLoop():Boolean
                                    //  [1][loop]   toggleLoop() -> true
                                    //  [2][noloop] toggleLoop() -> false
    state:          state,          // state():Hash { text, loop, error, closed, playing,
                                    //                ended, paused, muted, source }
    volume:         volume,         // volume(value:Number):Number/void
                                    //  [1][set] volume(0.5)
                                    //  [2][get] volume() -> 0.5
    startTime:      startTime,      // startTime(time:Number):Number/void
                                    //  [1][set] startTime(0)
                                    //  [2][get] startTime() -> 0
    currentTime:    currentTime,    // currentTime(time:Number):Number/void
                                    //  [1][set] currentTime(0)
                                    //  [2][get] currentTime() -> 0
    bind:           bind,           // bind(eventTypes:String, evaluator:Function)
    unbind:         unbind,         // unbind(eventTypes:String, evaluator:Function)
    toString:       toString
});

// Audio.init
function init(source,     // @param String: "music.mp3"
              option,     // @param AudioOptionHash(= {}):
              callback) { // @param Function(= void): callback(this)
    var that = this;

    this._muted = false;
    this._closed = false;
    this._attenuate = 0;

    _backendOrder.split(",").some(function(backendName) {
        var Class = uu.Class[backendName];

        if (Class && Class.isReady() && Class.isSupport(source)) {

            uu(backendName, source, option || {}, function(backend) {

                that.backend = backend;
                callback && callback(that);
            });
            return true;
        }
        return false;
    });
}

// Audio.close
function close() {
    this._closed = true;
    this.backend.close();
}

// Audio.play
function play() {
    this.backend.play();
}

// Audio.pause
function pause() {
    this.backend.pause();
}

// Audio.loop
function loop(value) { // @param Boolean: true is loop
                       // @return Boolean/void: true is loop
    return this.backend.loop(value);
}

// Audio.mute
function mute(value) { // @param Boolean: true is loop
                       // @return Boolean/void: true is loop
    if (this._muted !== value) {
        this.toggleMute()
    }
    return this._muted;
}

// Audio.togglePlay - toggle play / pause
function togglePlay() { // @return Boolean: true is play
                        //                  false is pause
    switch (this.state().text) {
    case "ended":   this.backend.currentTime(0);
    case "pause":   this.play();
                    return true;
    case "playing": this.pause();
    }
    return false;
}

// Audio.stop
function stop() {
    this.backend.stop();
}

// Audio.toggleMute - toggle mute / sound
function toggleMute() { // @return Boolean: true is muted
    if (this._muted) {
        this.volume(this._attenuate);
        this._muted = false;
        return false;
    }
    this._attenuate = this.volume();
    this.volume(0);
    this._muted = true;
    return true;
}

// Audio.toggleLoop - toggle loop
function toggleLoop() { // @return Boolean: true is loop
    if (this.backend.loop()) {
        this.backend.loop(false);
        return false;
    }
    this.backend.loop(true);
    return true;
}

// Audio.state
function state() { // @return Hash: { text, loop, error, closed, playing,
                   //                 ended, paused, muted, source }
                   //   text    - String: statusText
                   //   loop    - Boolean:
                   //   error   - Number: 0 is not error,
                   //                     1 is MEDIA_ERR_ABORTED
                   //                     2 is MEDIA_ERR_NETWORK
                   //                     3 is MEDIA_ERR_DECODE,
                   //                     4 is MEDIA_ERR_SRC_NOT_SUPPORTED
                   //   closed  - Boolean:
                   //   playing - Boolean:
                   //   ended   - Boolean:
                   //   muted   - Boolean:
                   //   source  - String:
    var rv = this.backend.state();

    rv.muted = this._muted;
    rv.closed = this._closed;
    rv.playing = false;

    if (rv.closed) {
        rv.text = "closed";
    } else if (rv.error) {
        rv.text = "error";
    } else if (rv.paused) {
        rv.text = "pause";
    } else if (rv.ended) {
        rv.text = "ended";
    } else {
        rv.playing = true;
        rv.text = "playing";
    }
    return rv;
}

// Audio.volume
function volume(value) { // @param Number/String: 0 ~ 0.1 or "+0.1", "-0.1"
                         // @return Number/void:
    if (value === void 0) {
        return this.backend.volume();
    }

    // cancel mute
    if (this._muted) {
        this._muted = false;
        value = this._attenuate;
    }

    if (typeof value === "string") {
        value = this.backend.volume() + parseFloat(value);
    }

    if (value < 0) {
        value = 0;
    } else if (value > 1) {
        value = 1;
    }
    this.backend.volume(value);
}

// Audio.currentTime
function currentTime(time) { // @param Number: time
                             // @return Number/void:
    if (time === void 0) {
        return this.backend.currentTime();
    }

    if (time < 0) {
        time = 0;
    }
    this.backend.currentTime(time);
}

// Audio.startTime
function startTime(time) { // @param Number: time
                           // @return Number/void:
    return this.backend.startTime(time);
}

// Audio.bind
function bind(eventTypes, // @param String:
              callback) { // @param Function:
    this.backend.bind(eventTypes, callback);
}

// Audio.unbind
function unbind(eventTypes, // @param String:
                callback) { // @param Function:
    this.backend.unbind(eventTypes, callback);
}

// Audio.toString
function toString() {
    return this.backend.toString();
}

/*
// --- init ---
function _parseAudioTags(audioNodes, callback) {

    audioNodes.forEach(function(audio) {
        var sourceArray = [],
            option = {},
            c = audio.firstChild,
            ready,
            readySource = "";

        option.loop = audio.loop || false;
        option.autoplay = "autoplay" in audio ? true : false;

        if (audio.src) {
            sourceArray.push(audio.src);
        } else {
            for (; c; c = c.nextSibling) {
                if ("src" in c) {
                    sourceArray.push(c.src);
                }
            }
        }

        ready = sourceArray.some(function(source) {
            return _backendOrder.split(",").some(function(backendName) {
                var Class = uu.Class[backendName];

                if (Class && Class.isReady() && Class.isSupport(source)) {
                    readySource = source;
                    return true;
                }
                return false;
            });
        });
        if (ready) {
            option.node = audio;
            uu("Audio", readySource, option, callback);
        }
    });
}
 */

function _xaudio() {
    uu.lazy("audio", function() {
        uu.state.AudioReady = true;

        win.xaudio && win.xaudio(uu, uu.tag("audio"));
    });
}

/*
uu.ready(function() {
    var nodes = uu.tag("audio"),
        count = 0;

    if (nodes.length) {
        _parseAudioTags(nodes, function() {
            ++count;
            if (nodes.length >= count) {
                _xaudio()
            }
        });
    } else {
        _xaudio();
    }
});
 */

_xaudio();

})(window, document, uu);

