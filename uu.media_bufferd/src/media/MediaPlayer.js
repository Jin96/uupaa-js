
uu.Class("MediaPlayer", {
    _id: 0, // current item id
    _data: [], // list data
    _option: null,
    _swfOption: null,
    _seekPosition: 0,
    _volumePosition: 0,
    _ignoreSeekUpdate: false,
    _ignoreVolumeUpdate: false,

    init: function(data,        // @param Array:
                   option,      // @param Hash: { debug, volume, autoplay, nextplay,
                                //                seekSlider, volumeSlider }
                                //      debug - Boolean(= false):
                                //      volume - Number(= 0.5): start volume
                                //      autoplay - Boolean(= false): auto play
                                //      nextplay - Boolean(= true): play -> ended -> next play
                                //      seekSlider - UISlider(= undefined): seek slider
                                //      volumeSlider - UISlider(= undefined): volume slider
                   swfOption) { // @param Hash: { width, height, ... }
                                //      width - Number/String(= "100%"): swf width
                                //      height - Number/String(= "100%"): swf height

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

        var that = this, volumeSlider, seekSlider;

        this._data = data.concat(); // clone
        this._option = uu.arg(option, { next: true, volume: 0.5 });
        this._swfOption = uu.arg(swfOption, { width: "100%", height: "100%" });
        this._seekSlider = option.seekSlider || null;
        this._volumeSlider = option.volumeSlider || null;
        this._swf = uu.flash.call(this, uu.config.media.swf,
                                  this._swfOption, this.handleFlash);
        // volume event handler
        if (option.volumeSlider) {
            volumeSlider = option.volumeSlider;
            volumeSlider.bind("mousedown", function(evt, attr) {
                that._ignoreVolumeUpdate = true;
            });
            volumeSlider.bind("mouseup", doVolume);
            volumeSlider.bind("mousewheel", doVolume);
            volumeSlider.bind("keydown", doVolume);
        }

        // seek event handler
        if (option.seekSlider) {
            seekSlider = option.seekSlider;
            seekSlider.bind("mousedown", function(evt, attr) {
                that._ignoreSeekUpdate = true;
            });
            seekSlider.bind("mouseup", doSeek);
            seekSlider.bind("mousewheel", doSeek);
            seekSlider.bind("keydown", doSeek);
        }
    },
    getCurrentID: function() {
        return this._id;
    },
    handleFlash: function(xid, msg, id, state) {
        var that = this;

        switch (msg) {
        case "init":
            // --- attach window.onunload event ---
            if (window.addEventListener) {
                window.addEventListener("beforeunload", function(evt) {
                    that._swf.xiBeforeUnload();
                }, false);
            } else if (window.attachEvent) {
                window.attachEvent("beforeunload", function(evt) {
                    that._swf.xiBeforeUnload();
                });
            }
            // --- init callback ---
            if (this.initCallback) {
                this.initCallback();
            }
            // --- add list item ---
/*
            this._data.forEach(function(hash, index) {
                that._swf.xiAdd(hash.type,
                                hash.audio   || [],
                                hash.video   || [],
                                hash.image   || [],
                                hash.comment || []);
            });
 */
            that._swf.xiAddList(this._data);

            // --- initial volume ---
            this.volume(this._option.volume);
            // --- auto play ---
            this._option.autoplay && (this._id = that._swf.xiPlay());
            return;
        case "timeupdate":
            // update grip position
            if (this._option.seekSlider) {
                if (this._id === id) {
                    if (!this._ignoreSeekUpdate &&
                        this._seekPosition !== state.position) {

                        this._seekPosition = state.position;
                        uu.msg.post(this._seekSlider, "value", state.position, 0);
                    }
                }
            }
            break;
        case "volumechange":
            // upate volume slider position
            if (this._option.volumeSlider) {
                if (this._id === id) {
                    if (!this._ignoreVolumeUpdate &&
                        this._volumePosition != state.volume) {

                        this._volumePosition = state.volume;
                        uu.msg.post(this._volumeSlider, "value", state.volume * 100, 0);
                    }
                }
            }
            break;
        case "ended":
            // --- next play ---
            this._option.nextplay && this.next();
        }
        // --- trace callback ---
        if (this.handleTrace) {
            this.handleTrace(xid, msg, state, id, this._id);
        }
    },
    //  [1][toggle play] play()
    //  [2][play]        play(playing id)
    //  [3][play]        play(other id)
    play: function(id) { // @param Number/String(= undefined): id
                         // @return Number: current item id
        return this._id = this._swf.xiPlay(id);
    },
    next: function() {
        return this._id = this._swf.xiPlay("next");
    },
    prev: function() {
        return this._id = this._swf.xiPlay("prev");
    },
    //  [1][toggle mute] mute()
    //  [2][mute]        mute(true)
    //  [3][unmute]      mute(false)
    mute: function(state) { // @param Boolean(= undefined):
                            //      undefined -> toggle mute
                            //      true      -> mute
                            //      false     -> unmute
        this._swf.xiMute(state);
    },
    volume: function(volume,  // @param Number: 0 ~ 1
                     force) { // @param Boolean(= false): force update
        this._swf.xiVolume(volume, force);
    },
    seek: function(position) { // @param Number: 0 ~ 100
        this._swf.xiSeek(this._id, position);
    },
    stop: function() {
        this._swf.xiStop(this._id);
    }
});
