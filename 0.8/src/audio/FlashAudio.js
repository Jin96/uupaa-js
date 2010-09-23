
// === FlashAudio ===
//{{{!depend uu, uu.class
//}}}!depend

//  <audio>
//      <object>
//      </object>
//  </audio>

// http://livedocs.adobe.com/flash/9.0_jp/ActionScriptLangRefV3/flash/media/Sound.html

// {{{!mb

uu.Class.FlashAudio || (function(win, doc, uu, swf) {

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
    ready:          function() {
        return uu.env.flash && uu.stat(swf);
    },
    isSupport:      function(src) {
        return /\.mp3$/i.test(src);
    }
});

// FlashAudio.init
function FlashAudioInit(src,     // @param String: "music.mp3"
                        option,     // @param AudioOptionHash(= {}):
                        callback) { // @param Function(= void): callback(this)
    // glue
    this.audio = option.node; // event source
    if (this.audio) {
        ;
    } else {
        this.audio = uu.div();
    }
    if (!this.audio.parentNode) {
        uu.add(this.audio);
    }

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

        if (option.autoplay) {
            that.play();
        }
    }
    this.flash = uu.flash(swf, OBJECT_ID, { width: 1, height: 1 }, wait);
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
    if (!this.state().closed) {
        this.flash.asFlashAudioPlay();
    }
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
    if (this.state().playing) {
        this.flash.asFlashAudioPause();
    }
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

})(window, document, uu, uu.config.baseDir + "uu.audio.swf");

// }}}!mb

