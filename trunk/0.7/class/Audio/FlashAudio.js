
// === FlashAudio ===
//{{{!depend uu, uu.class
//}}}!depend

//  <audio>
//      <object>
//      </object>
//  </audio>

// http://livedocs.adobe.com/flash/9.0_jp/ActionScriptLangRefV3/flash/media/Sound.html

// {{{!mb

uu.Class.FlashAudio || (function(win, doc, uu) {

var _SWF_PATH = uu.config.baseDir + "uu.audio.swf",
    _already = null;

uu.Class("FlashAudio", {
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

uu.Class.FlashAudio.isReady = function() {
    if (_already === null) {
        _already = uu.ver.as3 && uu.require(_SWF_PATH).ok;
    }
    return _already;
};

uu.Class.FlashAudio.isSupport = function(source) { // @param String: "music.mp3"
                                                   // @return Boolean;
    return /\.mp3$/i.test(source);
};

// FlashAudio.init
function init(source,     // @param String: "music.mp3"
              option,     // @param AudioOptionHash(= {}):
              callback) { // @param Function(= void): callback(this)

    option = uu.arg(option, {
        node:       uu.node(),
        loop:       false,
        volume:     1,
        autoplay:   true,
        startTime:  0
    });
    if (!option.node.parentNode) {
        uu.node.add(option.node);
    }

    this.media           = null; // backend object
    this.audio           = option.node; // for event
    this._loop           = option.loop;
    this._source         = source;
    this._volume         = option.volume;
    this._startTime      = option.startTime;
    this._lastUserAction = "";
    this._lastState      = "";
    this._interval       = 0; // setInterval timer id

    var that = this,
        OBJECT_ID = "externalflashaudio" + uu.guid();

    // HTMLAudioElement.getContext():AudioContext
    this.audio.getContext = function() {
        return that;
    };

    // wait for response from flash initializer
    function flashAudioReadyCallback() {
        setTimeout(function() {
            uu.dmz[OBJECT_ID] = null;

            that.media.ex_setSource(source);
            that.media.ex_setLoop(that._loop);
            that.media.ex_setVolume(that._volume);
            that.media.ex_setStartTime(that._startTime);

            callback && callback(that);

            if (option.autoplay) {
                setTimeout(function() {
                    that.play();
                }, 100);
            }
        }, 0);
    }
    function flashAudioReadyCallbackEvent(eventType) {
        setTimeout(function() {
            uu.event.fire(that.audio, eventType);
        }, 0);
    }

    uu.dmz[OBJECT_ID] = flashAudioReadyCallback;
    uu.dmz[OBJECT_ID + "event"] = flashAudioReadyCallbackEvent;

    this.media = uu.flash(_SWF_PATH, { id: OBJECT_ID, width: 1, height: 1 });
}

// FlashAudio.close
function close() {
    if (this._interval) {
        clearInterval(this._interval);
        this._interval = 0;
    }
    this.media.ex_stop();

//  uu.event.fire(this.audio, "ended");
    uu.node.remove(this.audio);
}

// FlashAudio.play
function play() {
    if (!this._error) {
        var that = this;

        this._lastUserAction = "play";
        this.media.ex_play();
        uu.event.fire(this.audio, "play");

        if (!this._interval) {

            this._interval = setInterval(function() {
                if (that.isPlaying()) {
                    uu.event.fire(that.audio, "timeupdate");
                }
            }, 1000);
        }
    }
}

// FlashAudio.pause
function pause() {
    if (!this._error) {
        this._lastUserAction = "pause";
        this.media.ex_pause();
        uu.event.fire(this.audio, "pause");
    }
}

// FlashAudio.stop
function stop() {
    if (!this._error) {
        this._lastUserAction = "stop";
        this.media.ex_stop();
    }
}

// FlashAudio.loop
function loop(value) { // @param Boolean: true is loop
                       // @return Boolean/void: true is loop
    if (value === void 0) {
        return this._loop;
    }

    this._loop = value;
    this.media.ex_setLoop(value);
}

// FlashAudio.state
function state() { // @return Hash: { loop, error, paused, ended, source, duration }
    var rv = this.media.ex_getState();

    return {
        loop:       this._loop,
        error:      rv.error,
        paused:     rv.paused,
        ended:      rv.ended,
        source:     this._source,
        duration:   rv.duration
    };
}

// FlashAudio.volume
function volume(value) { // @param Number: 0 ~ 0.1
                         // @return Number/void:
    if (value === void 0) {
        return this._volume;
    }
    this._volume = value;
    this.media.ex_setVolume(value);
}

// FlashAudio.startTime
function startTime(time) { // @param Number: time
                           // @return Number/void:
    if (time === void 0) {
        return this._startTime;
    }

    this._startTime = time;
    this.media.ex_setStartTime(time);
}

// FlashAudio.currentTime
function currentTime(time) { // @param Number: time
                             // @return Number/void:
    if (time === void 0) {
        return this.media.ex_getCurrentTime();
    }
    this.media.ex_setCurrentTime(time);
}

// FlashAudio.bind
function bind(eventTypes, // @param String:
              callback) { // @param Function:
    uu.event(this.audio, eventTypes, callback);
}

// FlashAudio.unbind
function unbind(eventTypes, // @param String:
                callback) { // @param Function:
    uu.event.unbind(this.audio, eventTypes, callback);
}

// FlashAudio.isPlaying
function isPlaying() { // @return Boolean:
    var rv = this.media.ex_getState();

    if (!rv.error && !rv.paused && !rv.ended) {
        return true;
    }
    return false;
}

// FlashAudio.toString
function toString() {
    return "FlashAudio";
}

})(window, document, uu);

// }}}!mb

