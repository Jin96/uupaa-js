
// === Silverlight Audio ===
//{{{!depend uu, uu.class
//}}}!depend

//  <audio>
//      <object>
//          <Canvas>
//              <MediaElement Source="example.mp3" AutoPlay="true" />
//          </Canvas>
//      </object>
//  </audio>
//
//  --- support events ---
//  audio.bind("pause")
//  audio.bind("ended")
//  audio.bind("error")
//  audio.bind("playing")
//  audio.bind("canplay")

// {{{!mb

uu.Class.SilverlightAudio || (function(win, doc, uu) {

uu.Class("SilverlightAudio", {
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

uu.Class.SilverlightAudio.isReady = function() {
    return !uu.opera && uu.ver.silverlight;
};

uu.Class.SilverlightAudio.isSupport = function(source) { // @param String: "music.mp3"
                                                         // @return Boolean;
    return /\.mp3$/i.test(source);
};

// SilverlightAudio.init
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
    this._error          = false;
    this._ended          = false;
    this._paused         = false;
    this._volume         = option.volume;
    this._startTime      = option.startTime;
    this._lastUserAction = "";
    this._lastState      = "";
    this._duration       = 0;
    this._interval       = 0; // setInterval timer id

    var that = this,
        // [ASYNC] initialized notify callback handler
        onload = "uuAudioSilverlightOnLoad" + uu.guid();

    // wait for response from Silverlight initializer
    win[onload] = function(sender) { // @param Node: sender is <Canvas> node

        sender.children.add(sender.getHost().content.createFromXaml(
            '<Canvas xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' +
                uu.format('<MediaElement x:Name="media" Source="?" Volume="?" AutoPlay="false" />',
                          that._source, that._volume) +
            '</Canvas>'));

        that.media = sender.findName("media"); // x:Name="media"

        initMedia(that);
        callback && callback(that);

        if (option.autoplay) {
            setTimeout(function() {
                that.play();
            }, 100);
        }
    };

    // create Silverlight <object>
    this.audio.innerHTML = [
        '<object type="application/x-silverlight-2" width="1" height="1">',
            '<param name="background" value="#00000000" />',  // transparent
            '<param name="windowless" value="true" />',
            '<param name="source" value="#xaml" />',          // XAML ID
            '<param name="onLoad" value="', onload, '" />',   // bond to global
        '</object>'].join("");

    // fixed memory leak
    uu.ver.ie678 && win.attachEvent("onunload", function() {
        win.detachEvent("onunload", arguments.callee);
        win[onload] = null;
    });
}

// inner -
function initMedia(that) {

    // trap Media Error
    that.media.AddEventListener("MediaFailed", function() {
        that._error = true;
        that._ended = true;
        that._paused = false;

        uu.event.fire(that.audio, "error"); // open failed
    });

    that.media.AddEventListener("MediaOpened", function() {
        // http://msdn.microsoft.com/ja-jp/library/bb979710(VS.95).aspx
        that._duration = that.media.NaturalDuration.Seconds;

        uu.event.fire(that.audio, "canplay");
    });

    // trap Media Ended
    that.media.AddEventListener("MediaEnded", function() {

//      uu.event.fire(that.audio, "ended");

        that.currentTime(that._startTime);

        if (that._loop) {
            that.media.play();

//            uu.event.fire(that.audio, "play");
        }
    });

    // trap Change State
    that.media.AddEventListener("CurrentStateChanged", function() {
        var lastState = that._lastState,
            currentState = that.media.CurrentState;

        // ignore consecutive events or "Closed" == "Error"
        if (lastState === currentState
            || (/^(Closed|Error)$/.test(lastState)
            &&  /^(Closed|Error)$/.test(currentState))) {

            return;
        }
        that._lastState = currentState; // update last state

        switch (currentState) {
        case "Buffering":
        case "Opening":
                break;

        // media.play(none supported file) -> "Error"
        // media.play(file not found)      -> "Closed"
        // media.load -> "Error"
        case "Error":
        case "Closed":
                that._error = true;
                that._ended = true;
                that._paused = false;
                uu.event.fire(that.audio, "error");
                break;

        // media.pause -> MediaState("Paused") -> uueventfire("pause")
        // media.stop  -> MediaState("Paused") -> uueventfire("ended")
        // file end    -> MediaState("Paused") -> uueventfire("ended")
        case "Paused":
                if (that._lastUserAction === "pause") {
                    that._ended = false;
                    that._paused = true;
                    uu.event.fire(that.audio, "pause");
                } else {
                    if (that._loop) {
                        that._ended = true;
                        that._paused = false;
                        uu.event.fire(that.audio, "ended"); // ???
                    } else {
                        that._ended = true;
                        that._paused = false;
                        uu.event.fire(that.audio, "ended");
                        that.currentTime(that._startTime);
                    }
                }
                break;

        // media.play -> "Playing"
        case "Playing":
                that._error = null;
                that._ended = false;
                that._paused = false;
                uu.event.fire(that.audio, "playing");
                break;

        // stop()
        case "Stopped":
                that._ended = true;
                that._paused = false;
                that.currentTime(that._startTime);
                uu.event.fire(that.audio, "ended");
        }
    });
}

// SilverlightAudio.close
function close() {
    if (this._interval) {
        clearInterval(this._interval);
        this._interval = 0;
    }
    uu.event.fire(this.audio, "ended");
    uu.node.remove(this.audio);
}

// SilverlightAudio.play
function play() {
    if (!this._error) {
        var that = this;

        this._lastUserAction = "play";
        this.media.play();
        this._paused = false;
        this._ended = false;
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

// SilverlightAudio.pause
function pause() {
    if (!this._error) {
        this._lastUserAction = "pause";
        this._paused = true;
        this.media.pause();
        uu.event.fire(this.audio, "pause");
    }
}

// SilverlightAudio.stop
function stop() {
    if (!this._error) {
        this._lastUserAction = "stop";
        this.media.stop();
        this._ended = true;
//      uu.event.fire(this.audio, "ended");
    }
}

// SilverlightAudio.loop
function loop(value) { // @param Boolean: true is loop
                       // @return Boolean/void: true is loop
    if (value === void 0) {
        return this._loop;
    }
    this._loop = value;
}

// SilverlightAudio.state
function state() { // @return Hash: { loop, error, paused, ended, source, duration }
    return {
        loop:       this._loop,
        error:      this._error,
        paused:     this._paused,
        ended:      this._ended,
        source:     this._source,
        duration:   this._duration
    };
}

// SilverlightAudio.volume
function volume(value) { // @param Number: 0.0 ~ 1.0
                         // @return Number/void:
    if (value === void 0) {
        return this._volume;
    }
    this._volume = value;
    this.media.Volume = value;
}

// SilverlightAudio.startTime
function startTime(time) { // @param Number: time
                           // @return Number/void:
    if (time === void 0) {
        return this._startTime;
    }
    this._startTime = time;
}

// SilverlightAudio.currentTime
function currentTime(time) { // @param Number: time
                             // @return Number/void:
    if (time === void 0) {
        return this.media.Position.Seconds;
    }

    var position = this.media.Position; // [!] create instance

    position.Seconds = time; // set current time

    this.media.Position = position; // [!] reattach instance
}

// SilverlightAudio.bind
function bind(eventTypes, // @param String:
              callback) { // @param Function:
    uu.event(this.audio, eventTypes, callback);
}

// SilverlightAudio.unbind
function unbind(eventTypes, // @param String:
                callback) { // @param Function:
    uu.event.unbind(this.audio, eventTypes, callback);
}

// SilverlightAudio.isPlaying
function isPlaying() { // @return Boolean:
    if (!this._error && !this._paused && !this._ended) {
        return true;
    }
    return false;
}

// SilverlightAudio.toString
function toString() {
    return "SilverlightAudio";
}

// --- init ---
// add inline XAML source
uu.ready(function() {
    uu.id("xaml") || doc.head.appendChild(uu.node("script", {
        id:   "xaml",
        type: "text/xaml",
        text: '<Canvas xmlns="http://schemas.microsoft.com/client/2007" ' +
                      'xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"></Canvas>'
    }));
}, 2); // 2: High

})(window, document, uu);

// }}}!mb

