
// === Audio ===
//{{{!depend uu, uu.class
//}}}!depend

//  <audio autoplay loop="true">
//      <source src="hoge.mp3" type="audio/mpeg" />
//  </audio>
//
// +--------------+-------------+---------------+----------------+----------+
// |   Browser    | uu("Audio") |   HTML5Audio  |SilverlightAudio|FlashAudio|
// +--------------+-------------+---------------+----------------+----------+
// |Firefox3.0    | mp3         |       -       |      mp3       |   mp3    |
// |Firefox3.5+   | mp3,ogg,wav |      ogg  wav |      mp3       |   mp3    |
// |Safari3.x     | mp3         |       -       |      mp3       |   mp3    |
// |Safari4+      | mp3,    wav |(mp3)      wav |      mp3       |   mp3    |
// |Chrome4+      | mp3,ogg,    |(mp3) ogg      |      mp3       |   mp3    |
// |Opera9x-10.10 | mp3         |       -       |       -        |   mp3    |
// |Opera10.50+   | mp3,ogg,wav |      ogg  wav |       -        |   mp3    |
// |iPhone3       |     -       |       -       |       -        |    -     |
// |IE6,IE7,IE8   | mp3         |       -       |      mp3       |   mp3    |
// |IE9 preview   | mp3         |       -       |      mp3       |   mp3    |
// +--------------+-------------+---------------+----------------+----------+

// --- support events ---
// audio.addEventListener("pause")
// audio.addEventListener("ended")
// audio.addEventListener("error")
// audio.addEventListener("play")
// audio.addEventListener("playing")
// audio.addEventListener("canplay")
// audio.addEventListener("timeupdate")

// Audio spec: http://www.w3.org/TR/html5/video.html

uu.Class.Audio || (function(win, doc, uu) {

var _backendOrder = "HTML5Audio,SilverlightAudio,FlashAudio,NoAudio";
//var _backendOrder = "FlashAudio,NoAudio";

uu.Class("Audio", {
    init:           init,           // init(source:String, option:AudioOptionHash = {}, callback:Function)
    close:          close,          // close()
    play:           play,           // play()
    pause:          pause,          // pause()
    toggle:         toggle,         // toggle():Boolean
    stop:           stop,           // stop()
    mute:           mute,           // mute()
    loop:           loop,           // loop()
    state:          state,          // state():Hash { text, loop, error, ended,
                                    //                paused, muted, source }
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

// Audio.toggle - toggle play / pause
function toggle() { // @return Boolean: true is play
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

// Audio.mute - toggle mute
function mute() {
    if (this._muted) {
        this.volume(this._attenuate);
        this._muted = false;
    } else {
        this._attenuate = this.volume();
        this.volume(0);
        this._muted = true;
    }
}

// Audio.loop - toggle loop
function loop(value) {
    if (this.backend.loop()) {
        this.backend.loop(false);
    } else {
        this.backend.loop(true);
    }
}

// Audio.state
function state() { // @return String:
    var rv = this.backend.state();

    rv.muted = this._muted;

    if (rv.error) {
        rv.text = "error";
    } else if (rv.paused) {
        rv.text = "pause";
    } else if (rv.ended) {
        rv.text = "ended";
    } else {
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
    return this.backend.currentTime(time);

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

// --- init ---
uu.ready(function() {
    uu.ready.gone.audio = 1;
    win.xaudio && win.xaudio(uu);
});

})(window, document, uu);

