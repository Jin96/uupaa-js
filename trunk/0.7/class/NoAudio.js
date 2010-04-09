
// === NoAudio ===
//{{{!depend uu, uu.class
//}}}!depend

uu.Class.NoAudio || (function(win, doc, uu) {

uu.Class("NoAudio", {
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
    finishTime:     finishTime,     // finishTime(time:Number):Number/void
                                    //  [1][set] finishTime(0)
                                    //  [2][get] finishTime() -> 0
    currentTime:    currentTime,    // currentTime(time:Number):Number/void
                                    //  [1][set] currentTime(0)
                                    //  [2][get] currentTime() -> 0
    bind:           bind,           // bind(eventTypes:String, evaluator:Function)
    unbind:         unbind,         // unbind(eventTypes:String, evaluator:Function)
    isPlaying:      isPlaying,      // isPlaying():Boolean
    toString:       toString
});

uu.Class.NoAudio.isReady = function() {
    return true;
};

uu.Class.NoAudio.isSupport = function(source) { // @param String: "music.mp3"
                                                // @return Boolean;
    return true;
};

// NoAudio.init
function init(source,     // @param String: "music.mp3"
              option,     // @param AudioOptionHash(= {}):
              callback) { // @param Function(= void): callback(this)

    callback && callback(this);
}

// NoAudio.close
function close() {
}

// NoAudio.play
function play() {
}

// NoAudio.pause
function pause() {
}

// NoAudio.stop
function stop() {
}

// NoAudio.loop
function loop(value) { // @param Boolean: true is loop
                       // @return Boolean/void: true is loop
    if (value === void 0) {
        return false;
    }
}

// NoAudio.state
function state() { // @return Hash: { loop, error, paused, ended, source, duration }
    return {
        loop:       false,
        error:      true,
        paused:     false,
        ended:      false,
        source:     "",
        duration:   0,
    }
}

// NoAudio.volume
function volume(value) { // @param Number: 0.0 ~ 1.0
                         // @return Number/void:
    if (value === void 0) {
        return 0;
    }
}

// NoAudio.startTime
function startTime(time) { // @param Number: time
                           // @return Number/void:
    if (time === void 0) {
        return 0;
    }
}

// NoAudio.finishTime
function finishTime(time) { // @param Number: time
                            // @return Number/void:
    if (time === void 0) {
        return 0;
    }
}

// NoAudio.currentTime
function currentTime(time) { // @param Number: time
                             // @return Number/void:
    if (time === void 0) {
        return 0;
    }
}

// NoAudio.bind
function bind(eventTypes, // @param String:
              callback) { // @param Function:
}

// NoAudio.unbind
function unbind(eventTypes, // @param String:
                callback) { // @param Function:
}

// NoAudio.isPlaying
function isPlaying() { // @return Boolean:
    return false;
}

// NoAudio.toString
function toString() {
    return "NoAudio";
}

})(window, document, uu);

