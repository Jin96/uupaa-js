
// === HTML5Audio ===
//{{{!depend uu, uu.class
//}}}!depend

uu.Class.HTML5Audio || (function(win, doc, uu) {

var _MP3_READY = true,
    // gecko unimplemented - audio.loop
    //      https://developer.mozilla.org/Ja/HTML/Element/Audio
    _LOOP_IMPL = uu.gecko && uu.ver.render < 1.93 ? false : true;

uu.Class("HTML5Audio", {
    init:           init,           // init(source:String, option:AudioOptionHash = {}, callback:Function)
    close:          close,          // close()
    play:           play,           // play()
    pause:          pause,          // pause()
    stop:           stop,           // stop()
    loop:           loop,           // loop(value:Boolean):Boolean/void
                                    //  [1][set] loop(true)
                                    //  [2][get] loop() -> true
    state:          state,          // state():Hash { loop, error, ended, paused, muted, source, duration }
    volume:         volume,         // volume(value:Number/String):Number/void
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
    isPlaying:      isPlaying,      // isPlaying():Boolean
    toString:       toString
});

uu.Class.HTML5Audio.isReady = function() { // @return Boolean:
    return win.HTMLAudioElement;
};

uu.Class.HTML5Audio.isSupport = function(source) { // @param String: "music.mp3"
                                                   // @return Boolean;
    if (_MP3_READY && /\.mp3$/i.test(source)) { // mp3
        if (uu.ver.safari || uu.ver.chrome) {
            return true;
        }
    } else if (/\.og\w+$/i.test(source)) { // ogg
        if (uu.ver.gecko || uu.ver.chrome || uu.ver.opera) {
            return true;
        }
    } else if (/\.wav$/i.test(source)) { // wav
        if (uu.ver.gecko || uu.ver.safari || uu.ver.opera) {
            return true;
        }
    }
    return false;
};

// HTML5Audio.init
function init(source,     // @param String: "music.mp3"
              option,     // @param AudioOptionHash(= {}):
              callback) { // @param Function(= void): callback(this)
    option = uu.arg(option, {
        node:       null,
        loop:       false,
        volume:     1,
        autoplay:   true,
        startTime:  0
    });

    if (option.node) {
        this.audio = option.node;

        if (!option.node.parentNode) {
            uu.node.add(this.audio);
        }
    } else {
        this.audio = new Audio(source);
        uu.node.add(this.audio);
    }

    this.audio.loop = option.loop;
    this.audio.volume = option.volume;
    this.audio.startTime = option.startTime;

    var that = this;

    if (!_LOOP_IMPL) {
        this.bind("ended", function() {
            that.loop() && that.play();
        });
    }

    // autoplay
    if (option.autoplay) {
        setTimeout(function() {
            that.play();
        }, 100);
    }

    callback && callback(this);
}

// HTML5Audio.close
function close() {
    if (!_LOOP_IMPL) {
        this.unbind("ended");
    }

    uu.event.fire(this.audio, "ended");
    uu.node.remove(this.audio);
}

// HTML5Audio.play
function play() {
    if (uu.ver.chrome) { // [CHROME][FIX] volume
        var that = this,
            vol = this.audio.volume;

        this.audio.volume = 0;
        this.audio.play();

        setTimeout(function() {
            that.audio.volume = vol;
        }, 0);
        return;
    }

    this.audio.play();
}

// HTML5Audio.pause
function pause() {
    this.audio.pause();
}

// HTML5Audio.stop
function stop() {
    this.currentTime(this.audio.startTime);
    this.audio.pause();
    this.currentTime(this.audio.startTime);
}

// HTML5Audio.loop
function loop(value) { // @param Boolean: true is loop
                       // @return Boolean/void: true is loop
    if (value === void 0) {
        return this.audio.loop;
    }

    this.audio.loop = value;
}

// HTML5Audio.state
function state() { // @return Hash: { error, paused, ended, source, duration }
    var error = false;

    if (this.audio.error) {
        error = true;
    }
    return {
        loop:       this.audio.loop     || false,
        error:      error,
        paused:     this.audio.paused   || false,
        ended:      this.audio.ended    || false,
        source:     this.audio.src      || "",
        duration:   this.audio.duration || 0,
    };
}

// HTML5Audio.volume
function volume(value) { // @param Number: 0.0 ~ 1.0
                         // @return Number/void:
    if (value === void 0) {
        return this.audio.volume;
    }
    this.audio.volume = value;
}

// HTML5Audio.startTime
function startTime(time) { // @param Number: time
                           // @return Number/void:
    if (time === void 0) {
        return this.audio.startTime;
    }
    this.audio.startTime = time;
}

// HTML5Audio.currentTime
function currentTime(time) { // @param Number: time
                             // @return Number/void:
    if (time === void 0) {
        return this.audio.currentTime;
    }
    this.audio.currentTime = time;
}

// HTML5Audio.bind
function bind(eventTypes, // @param String:
              callback) { // @param Function:
    uu.event(this.audio, eventTypes, callback);
}

// HTML5Audio.unbind
function unbind(eventTypes, // @param String:
                callback) { // @param Function:
    uu.event.unbind(this.audio, eventTypes, callback);
}

// HTML5Audio.isPlaying
function isPlaying() { // @return Boolean:
    if (!this.audio.error && !this.audio.paused && !this.audio.ended) {
        return true;
    }
    return false;
}

// HTML5Audio.toString
function toString() {
    return "HTML5Audio";
}

})(window, document, uu);

