// case "http://localhost:8080/0.8/test/media/media.htm"

uu.Class("MediaPlayer", {
    _source: [],
    _lastID: 0, // current playing itemID
    _seekPosition: 0,
    _volumePosition: 0,
    _ignoreSeekUpdate: false,
    _ignoreVolumeUpdate: false,

    init: function(seekSlider,    // @param UISlider:
                   volumeSlider,  // @param UISlider:
                   sourceArray) { // @param Array:

        function doSeek(evt, attr) { // attr.value = 0~100
            that._ignoreSeekUpdate = true;
            that.seek(parseFloat(attr.value));

            setTimeout(function() {
                that._ignoreSeekUpdate = false;
            }, 150);
        }
        function doVolume(evt, attr) { // attr.value = 0~100
            that._ignoreVolumeUpdate = true;
            that.volume(parseFloat(attr.value) / 100);

            setTimeout(function() {
                that._ignoreVolumeUpdate = false;
            }, 150);
        }

        var that = this;

        this._seekSlider = seekSlider;
        this._volumeSlider = volumeSlider;
        this._source = sourceArray;
        this._swf = uu.flash.call(this, "../../swf/uu.media.swf",
                                  { width: 300, height: 100, nocache: true },
                                  this.handleFlash);
        // volume event handler
        volumeSlider.bind("mousedown", function(evt, attr) {
            that._ignoreVolumeUpdate = true;
        });
        volumeSlider.bind("mouseup", doVolume);
        volumeSlider.bind("mousewheel", doVolume);
        volumeSlider.bind("keydown", doVolume);

        // seek event handler
        seekSlider.bind("mousedown", function(evt, attr) {
            that._ignoreSeekUpdate = true;
        });
        seekSlider.bind("mouseup", doSeek);
        seekSlider.bind("mousewheel", doSeek);
        seekSlider.bind("keydown", doSeek);
    },
    handleFlash: function(xid, msg, id, state) {
        var that = this;

        if (state) {
            if (this._lastID === id) {
                switch (state.audioState) {
                case 0: uu.text(uu.id("playButtonState"), "STOPPED"); break;
                case 1: uu.text(uu.id("playButtonState"), "PLAYING"); break;
                case 2: uu.text(uu.id("playButtonState"), "PAUSED");
                }
                uu.text(uu.id("audioSource"), state.audioSource);
            }
            uu.log("msg=@, id=@, state=@", msg, id, uu.json(state));
        }

        switch (msg) {
        case "init":
            this.setFinalizer();
            this._source.forEach(function(src) {
                that._swf.xiListAddAudio(src);
            });
            this._lastID = 1;
            this._swf.xiAutoPlay(this._lastID);
            this.volume(1, true);
            break;
        case "timeupdate":
            // update grip position
            if (this._lastID === id) {
                if (!this._ignoreSeekUpdate &&
                    this._seekPosition !== state.position) {

                    this._seekPosition = state.position;
                    uu.msg.post(this._seekSlider, "value", state.position, 0);
                }
            }
            break;
        case "volumechange":
            // upate volume slider position
            if (this._lastID === id) {
                if (!this._ignoreVolumeUpdate &&
                    this._volumePosition != state.volume) {

                    this._volumePosition = state.volume;
                    uu.msg.post(this._volumeSlider, "value", state.volume * 100, 0);
                }
            }
            break;
        case "ended":
            this.next();
        }
    },
    volume: function(volume, force) {
        this._swf.xiSetVolume(this._lastID, volume, force);
    },
    togglePlay: function() {
        this._swf.xiTogglePlay(this._lastID);
    },
    play: function() {
        this._swf.xiAutoPlay(this._lastID);
    },
    pause: function() {
        this._swf.xiPause(this._lastID);
    },
    seek: function(position) { // 0~100
        this._swf.xiSeek(this._lastID, position);
    },
    stop: function() {
        this._swf.xiStop(this._lastID);
    },
    next: function() {
        this._lastID = this._swf.xiNextAutoPlay();
    },
    prev: function() {
        this._lastID = this._swf.xiPrevAutoPlay();
    },
    setFinalizer: function() {
        var swf = this._swf;

        // close window / close tab
        if (window.addEventListener) {
            window.addEventListener("beforeunload", function(evt) {
                swf.xiBeforeUnload();
            }, false);
        } else if (window.attachEvent) {
            window.attachEvent("beforeunload", function(evt) {
                swf.xiBeforeUnload();
            });
        }
    }
});
