uu.ready(function(uu) {

uu.Class("MediaPlayer", {
    _lastID: 0, // current playing itemID
    _itemID: [],
    _index: 0,
    _position: 0,
    _ignoreTimeupdate: false,
    _mp3: [
        "../../media/Hydrate-Kenny_Beltrey.mp3",
        "../../media/bego.mp3",
        "../../media/dora.mp3"
    ],
    init: function() {
        function doSeek(evt, attr) { // attr.value = 0~100
            that._ignoreTimeupdate = true;
            that.seek(parseFloat(attr.value));

            setTimeout(function() {
                that._ignoreTimeupdate = false;
            }, 100);
        }

        var that = this;

        this._swf = uu.flash.call(this, "../../swf/uu.media.swf",
                                  { width: 300, height: 100, nocache: true },
                                  this.handleFlash);
        // slider settings
        var ary = uu.ui("Slider"); // [0: volume, 1: seek]

        seekBar   = ary[0];
        volumeBar = ary[1];

        // volume.change event handler
        volumeBar.bind("change", function(evt, attr) { // attr.value 0~100
            that.volume(parseFloat(attr.value) * 0.01);
        });
        seekBar.bind("mousedown", function(evt, attr) {
            that._ignoreTimeupdate = true;
        });
        seekBar.bind("mouseup", doSeek);
        seekBar.bind("mousewheel", doSeek);
        seekBar.bind("keydown", doSeek);
    },
    handleFlash: function(xid, msg, itemID, state) {
        var swf = this._swf, id;

        if (state) {
            if (this._lastID === itemID) {
                switch (state.audioState) {
                case 0: uu.text(uu.id("playButtonState"), "STOPPED"); break;
                case 1: uu.text(uu.id("playButtonState"), "PLAYING"); break;
                case 2: uu.text(uu.id("playButtonState"), "PAUSED");
                }
                uu.text(uu.id("audioSource"), state.audioSource);
            }
            uu.log("msg=@, itemID=@, state=@", msg, itemID, uu.json(state));
        }

        switch (msg) {
        case "init":
            // List[0]
            id = swf.xiListAddItemAudio();
            this._itemID.push(id);
            swf.xiSetAudioSource(id, this._mp3[0]);
            swf.xiAutoPlay(id);
            this._lastID = id;
/*
            this._itemID.push(
                id = swf.xiListAddItemAudio("source/bego.mp3"));
            swf.xiAutoPlay(id);
            this._lastID = id;
 */


            // List[1]
            id = swf.xiListAddItemAudio();
            this._itemID.push(id);
            swf.xiSetAudioSource(id, this._mp3[1]);

            // List[2]
            id = swf.xiListAddItemAudio();
            this._itemID.push(id);
            swf.xiSetAudioSource(id, this._mp3[2]);
            break;
        case "timeupdate":
            if (this._ignoreTimeupdate) {
                break;
            }
            var position = state.position;

            if (this._position !== position) {
                this._position = position;
                // update grip position
                uu.msg.post(seekBar, "value", position, 0);
            }
            break;
        case "ended":
            this.next();
        }
    },
    volume: function(volume) {
        this._swf.xiVolume(this._lastID, volume);
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
        ++this._index;
        if (this._index >= this._itemID.length) {
            this._index = 0;
        }
        this._lastID = this._itemID[this._index];
        this._swf.xiAutoPlay(this._lastID);
    },
    prev: function() {
        --this._index;
        if (this._index < 0) {
            this._index = this._itemID.length - 1;
        }
        this._lastID = this._itemID[this._index];
        this._swf.xiAutoPlay(this._lastID);
    }
});

// activate slider
uu.ui.build();

var _media = uu("MediaPlayer");

// outer I/F
window.playAudio  = function() { _media.play(); };
window.pauseAudio = function() { _media.pause(); };
window.stopAudio  = function() { _media.stop(); };
window.nextAudio  = function() { _media.next(); };
window.prevAudio  = function() { _media.prev(); };
window.volumeAudio = function(n) { _media.volume(n); };
window.togglePlayAudio = function() { _media.togglePlay(); };

});

