var _media;

(function(uu) {

uu.Class("MediaPlayer", {
    _lastID: 0, // current playing itemID
    _itemID: [],
    _index: 0,
    _mp3: [
        "../../media/bego.mp3",
        "../../media/dora.mp3",
        "../../media/Hydrate-Kenny_Beltrey.mp3"
    ],

    init: function() {
        this._swf = uu.flash.call(this, "uu.media.swf",
                                  { width: 300, height: 300, nocache: true },
                                  this.handleFlash);
    },
    handleFlash: function(xid, msg, itemID, state) {
        var swf = this._swf, id;

        if (state) {
            switch (state.audioState) {
            case 0: uu.form.value(uu.id("playbtn"), "停止中"); break;
            case 1: uu.form.value(uu.id("playbtn"), "再生中"); break;
            case 2: uu.form.value(uu.id("playbtn"), "一時停止中");
            }

            uu.log("xid=@, msg=@, itemID=@, state=@", xid, msg, itemID, uu.json(state));
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
        case "durationchange":
            uu.log("durationchange, itemID=@, duration=@", itemID, state.duration);
            break;
        case "timeupdate":
            uu.log("timeupdate, itemID=@, duration=@", itemID, state.currentTime);
            break;
        case "changeState":
            uu.log("changeState, itemID=@, duration=@", itemID, state);
            break;
        }
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

uu.ready(function() {
    _media = uu("MediaPlayer");
});

})(uu);

// outer I/F
function playAudio() {
    _media.play();
}
function pauseAudio() {
    _media.pause();
}
function stopAudio() {
    _media.stop();
}
function nextAudio() {
    _media.next();
}
function prevAudio() {
    _media.prev();
}
function togglePlayAudio() {
    _media.togglePlay();
}

