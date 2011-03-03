package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.system.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class Media extends Sprite {
        public static var MEDIA_STATE_STOPPED:uint   = 0x0;
        public static var MEDIA_STATE_PLAYING:uint   = 0x1;
        public static var MEDIA_STATE_PAUSED:uint    = 0x2;
        public static var STREAM_STATE_CLOSED:uint   = 0x0;
        public static var STREAM_STATE_OPEN:uint     = 0x1;
        public static var STREAM_STATE_BUFFERING:uint= 0x2;
        public static var STREAM_STATE_CAN_PLAY:uint = 0x3;
        public static var STREAM_STATE_LOADED:uint   = 0x4;
        public static var STREAM_STATE_ERROR:uint    = 0x5;

        // for ExternalInterface
        private var _xiCallback:String = "";
        private var _xiExportMessage:Boolean = true;

        // for Message Queue
        private var _timer:Timer = new Timer(50, 0); // 20fps
        private var _queue:Array = [];

        // for List Management
        private var _list:Array = [null]; // [null, MediaAudio, ...]
        private var _id:Number = 0; // last inserted id: 1 ~

        // for Message Exports
        private var _xiLock:Number = 0;
        private var _xiMessagePool:Array = [];

        // state
        private var _lastMute:Boolean = false;
        private var _lastVolume:Number = 0.5; // 0~1

        public function Media():void {
            stage ? init() : addEventListener(Event.ADDED_TO_STAGE, init);
        }

        private function init(e:Event = null):void {
            removeEventListener(Event.ADDED_TO_STAGE, init);

            var xi:Object = ExternalInterface;

            if (!xi.available) {
                trace("ExternalInterface not available");
                return;
            }
            trace("ExternalInterface.objectID: " + xi.objectID);

            // get callback function name
            var flashVars:Object = LoaderInfo(this.root.loaderInfo).parameters;

            // { flashVars.callback = "" }
            // or window.uu.dmz[ExternalInterface.objectID]
            _xiCallback = flashVars["callback"] ? flashVars["callback"]
                                                : ("uu.dmz." + xi.objectID);

            // --- ExternalInterface definitions ---
            xi.addCallback("xiAddList",         xiAddList);// add lists
            xi.addCallback("xiClear",           xiClear);  // clear list
            xi.addCallback("xiState",           xiState);  // get state
            xi.addCallback("xiPlay",            xiPlay);   // toggle play / play / pause
            xi.addCallback("xiPause",           xiPause);  // pause
            xi.addCallback("xiSeek",            xiSeek);   // seek
            xi.addCallback("xiStop",            xiStop);   // stop
            xi.addCallback("xiClose",           xiClose);  // close
            xi.addCallback("xiMute",            xiMute);   // toggle mute / mute / unmute
            xi.addCallback("xiVolume",          xiVolume); // volume
            xi.addCallback("xiBeforeUnload",    xiBeforeUnload);

            try {
                xi.call(_xiCallback, "init", 0); // id = 0
            } catch(err:Error) {
                trace("callback(init) fail");
            }
            _timer.addEventListener(TimerEvent.TIMER, handleTimer);
            _timer.start();

            trace("stage.stageWidth",  stage.stageWidth);
            trace("stage.stageHeight", stage.stageHeight);

            stage.scaleMode = StageScaleMode.NO_BORDER;
        }

        private function handleTimer(event:TimerEvent):void {
            var queue:Object;

            if (!_queue.length) {
                return; // empty
            }
            if (!_queue[0].id || !(_queue[0].id in _list)) {
                _queue.shift(); // skip
                trace("Media::handleTimer", _queue[0].id, "is unknown");
                return;
            }

            queue = _queue.shift();
            if (_list[queue.id].isBusy()) {
                trace("Media::handleTimer", "isBusy() false. queue.length = ", _queue.length);
                return; // busy -> skip
            }

            var obj:Object = _list[queue.id],
                state:Object,
                play:Boolean = false,
                close:Boolean = false;

            switch (queue.action) {
            case "pause":   obj.pause(); break;
            case "seek":    obj.seek(queue.param1); break; // 0~100
            case "stop":    obj.stop(); break;
            case "close":   obj.close(); break;
            case "mute":    obj.setMute(queue.param1); break;
            case "volume":  obj.setVolume(queue.param1, queue.param2); break;
            case "play":    play = true; close = true; break;
            case "toggleplay":
                state = obj.getState();

                switch (state.name) {
                case "MediaAudio":
                case "MediaVideo":
                    switch (state.mediaState[0]) {
                    case MEDIA_STATE_PLAYING: obj.pause(); break; // PLAYING -> pause
                    case MEDIA_STATE_STOPPED: close = true;       // STOPPED -> autoplay -> close -> play
                    case MEDIA_STATE_PAUSED:  play = true;        // PAUSED  -> play
                    }
                    break;
                // [1] STOPPED + STOPPED -> AUTO PLAY/AUTO PLAY
                // [2] STOPPED + PLAYING -> STOP -> REWIND -> PLAY/PLAY
                // [3] STOPPED + PAUSED  -> STOP -> REWIND -> PLAY/PLAY
                // [4] PLAYING + STOPPED -> STOP -> REWIND -> PLAY/PLAY
                // [5] PLAYING + PLAYING -> PAUSE/PAUSE
                // [6] PLAYING + PAUSED  -> STOP -> REWIND -> PLAY/PLAY (ERROR CASE)
                // [7] PAUSED  + STOPPED -> STOP -> REWIND -> PLAY/PLAY
                // [8] PAUSED  + PLAYING -> STOP -> REWIND -> PLAY/PLAY (ERROR CASE)
                // [9] PAUSED  + PAUSED  -> PLAY/PLAY
                case "MediaAudiox2":
                case "MediaAudioVideo":
                    if (state.mediaState[1] === state.mediaState[2]) {
                        switch (state.mediaState[1]) {
                        case MEDIA_STATE_PLAYING: obj.pause(); break; // [5] PLAYING -> pause
                        case MEDIA_STATE_STOPPED: close = true;       // [1] STOPPED -> autoplay -> close -> play
                        case MEDIA_STATE_PAUSED:  play = true;        // [9] PAUSED  -> play
                        }
                    } else {
                        obj.stop();
                        play = true;
                    }
                }
            }

            if (close) { // auto close
                if (_id && _id !== queue.id) {
                    if (_id in _list) {
                        _list[_id].close(); // current item close
                    }
                }
            }
            if (play) { // auto play
                _id = queue.id;
                obj.setVolume(_lastVolume);
                obj.setMute(_lastMute);
                obj.play(handleCanPlayCallback);
            }
        }

        public function handleCanPlayCallback(id:Number):void {
            var obj:Object = _list[id];

            obj && obj.playback();
        }

        public function xiAddList(data:Array,
                                  formatVersion:Number = 1):Array {
            ++_xiLock;

            var rv:Array = [],
                item:Object, type:String, media:Array, poster:String,
                i:Number = 0, iz:Number = data.length,
                id:Number = _list.length;

            for (; i < iz; ++id, ++i) {
                item = data[i];
                type = item.type || "MediaAudio";
                media = item.media;
                poster = item.poster || "";
                switch (type) {
                case "MediaAudio":
                    // audioSource
                    _list.push(new MediaAudio(this, id, media, poster));
                    break;
                case "MediaAudiox2":
                    _list.push(new MediaAudiox2(this, id, media, poster));
                    break;
                case "MediaVideo":
                    _list.push(new MediaVideo(this, id, media, poster));
                    break;
                case "MediaAudioVideo":
                    _list.push(new MediaAudioVideo(this, id, media, poster));
                    break;
                default:
                    trace("ERROR", type);
                    --_xiLock;
                    return rv;
                }
                rv.push(id);
            }
            --_xiLock;
            return rv;
        }

        public function xiClear():void {
            var i:int = 1, iz:int = _list.length;

            for (; i < iz; ++i) {
                if (_id !== i) {
                    _list[i].close();
                }
            }
            _id && _list[_id].close();
            _list = [null];
            _id = 0;
        }

        public function xiState(id:Number):Object {
            return _list[id] ? _list[id].getState() : {};
        }

        //  [1][toggle play] xiPlay()
        //  [2][play]        xiPlay(playing id)
        //  [3][play]        xiPlay(other id)
        //  [4][prev]        xiPlay("prev")
        //  [5][next]        xiPlay("next")
        public function xiPlay(id:* = undefined):Number { // @param Number/String/undefined:
                                                          // @return Number: next id
                                                          //                 0 is ERROR
            var r:Number = _id;

            if (id == null) { // [1]
                if (!_id) {
                    _id = 1;
                }
                _queue.push({ id: _id, action: "toggleplay" });
                return _id;
            } else if (typeof id === "number") {
                r = id;
            } else if (id === "prev") {
                if (--r < 1) {
                    r = _list.length - 1;
                }
            } else if (id === "next") {
                if (++r >= _list.length) {
                    r = 1;
                }
            }
            if (isValidID(r)) {
                _queue.push({ id: r, action: "play" });
                return r;
            }
            trace("xiAutoPlay fail. invalid id", id);
            return 0; // ERROR
        }

        public function xiPause(id:Number):void {
            _queue.push({ id: id, action: "pause" });
        }

        public function xiSeek(id:Number,
                               position:Number):void { // @param Number: ms
            // position 0 ~ 100
            position = position > 100 ? 100
                     : position < 0   ? 0
                     : position;
            _queue.push({ id: id, action: "seek", param1: position });
        }

        public function xiStop(id:Number):void {
            _queue.push({ id: id, action: "stop" });
        }

        public function xiClose(id:Number):void {
            _queue.push({ id: id, action: "close" });
        }

        //  [1][toggle mute] xiMute()
        //  [2][mute]        xiMute(true)
        //  [3][unmute]      xiMute(false)
        public function xiMute(mute:* = undefined):void { // @param Boolean/undefined:
            if (mute == null) { // null or undefined -> toggle
                _lastMute = _lastMute ? false : true;
            } else {
                _lastMute = mute;
            }
            if (isValidID(_id)) {
                _queue.push({ id: _id, action: "mute", param1: _lastMute });
            }
        }

        public function xiVolume(volume:Number,
                                 force:Boolean = false):void {
            // volume = 0 ~ 1
            _lastVolume = volume > 1 ? 1
                        : volume < 0 ? 0
                        : volume;
            if (isValidID(_id)) {
                _queue.push({ id: _id, action: "volume",
                              param1: _lastVolume, param2: force });
            }
        }

        public function xiBeforeUnload():void {
            trace("xiBeforeUnload");

            _xiExportMessage = false; // export prohibit
            xiClear();
        }

        public function isValidID(id:Number):Boolean {
            return id > 0 && id < _list.length && _list[id];
        }

        public function postMessage(msg:String, id:Number = 0,
                                    param:* = undefined):void {
            var that:* = this;

            if (!_list[id] || !_xiExportMessage) {
                return;
            }

            // trace("postMessage", msg, id, param);
            if (_xiLock) { // lock -> stock
                _xiMessagePool.push({ msg: msg, id: id });
            } else {
                _xiMessagePool.forEach(function(obj:Object, i:int, ary:Array):void {
                    postMessageToJavaScript.call(that, obj.msg, obj.id);
                });
                postMessageToJavaScript(msg, id);
            }
        }

        // AS -> JS
        private function postMessageToJavaScript(msg:String, id:Number = 0):void {
            if (_list[id]) { // ignore _list[0]
                var state:Object = _list[id].getState();

                switch (msg) {
                case "durationchange":
                case "timeupdate":
                case "progress":
/*
                case "play":
                case "playing":
                case "ended":
 */
                    ExternalInterface.call(_xiCallback, msg, id, state, true);
                    break;
                default:
                    ExternalInterface.call(_xiCallback, msg, id, state, true);
                }
            }
        }

        public function judgeMultipleMediaState(s1:uint, s2:uint):uint {
            // STOPPED > PAUSED > PLAYING
            // -----------------------------------------
            // STOPPED + STOPPED -> STOPPED
            // STOPPED + PAUSED  -> PAUSED
            // STOPPED + PLAYING -> PLAYING
            // PAUSED  + STOPPED -> PAUSED
            // PAUSED  + PAUSED  -> PAUSED
            // PAUSED  + PLAYING -> PLAYING
            // PLAYING + STOPPED -> PLAYING
            // PLAYING + PAUSED  -> PLAYING
            // PLAYING + PLAYING -> PLAYING
            if (s1 === MEDIA_STATE_PLAYING ||
                s2 === MEDIA_STATE_PLAYING) {
                return MEDIA_STATE_PLAYING;
            } else if (s1 === MEDIA_STATE_PAUSED ||
                       s2 === MEDIA_STATE_PAUSED) {
                return MEDIA_STATE_PAUSED;
            }
            return MEDIA_STATE_STOPPED;
        }

        public function judgeMultipleStreamState(s1:uint, s2:uint):uint {
            // ERROR > CLOSED > OPEN > BUFFERING > CAN_PLAY > LOADED
            // -----------------------------------------
            // ERROR    + ANY      -> ERROR
            // ANY      + ERROR    -> ERROR
            // CLOSED   + CLOSED   -> CLOSED
            // CLOSED   + OPEN     -> CLOSED
            // CLOSED   + BUFFERING-> CLOSED
            // CLOSED   + CAN_PLAY -> CLOSED
            // CLOSED   + LOADED   -> CLOSED
            // OPEN     + CLOSED   -> CLOSED
            // OPEN     + OPEN     -> OPEN
            // OPEN     + BUFFERING-> OPEN
            // OPEN     + CAN_PLAY -> OPEN
            // OPEN     + LOADED   -> OPEN
            // BUFFERING+ CLOSED   -> CLOSED
            // BUFFERING+ OPEN     -> OPEN
            // BUFFERING+ BUFFERING-> BUFFERING
            // BUFFERING+ CAN_PLAY -> BUFFERING
            // BUFFERING+ LOADED   -> BUFFERING
            // CAN_PLAY + CLOSED   -> CLOSED
            // CAN_PLAY + OPEN     -> OPEN
            // CAN_PLAY + BUFFERING-> BUFFERING
            // CAN_PLAY + CAN_PLAY -> CAN_PLAY
            // CAN_PLAY + LOADED   -> CAN_PLAY
            // LOADED   + CLOSED   -> CLOSED
            // LOADED   + OPEN     -> OPEN
            // LOADED   + BUFFERING-> BUFFERING
            // LOADED   + CAN_PLAY -> CAN_PLAY
            // LOADED   + LOADED   -> LOADED
            if (s1 === STREAM_STATE_ERROR ||
                s2 === STREAM_STATE_ERROR) {
                return STREAM_STATE_ERROR;
            }
            if (s1 === STREAM_STATE_CLOSED ||
                s2 === STREAM_STATE_CLOSED) {
                return STREAM_STATE_CLOSED;
            }
            if (s1 === STREAM_STATE_OPEN ||
                s2 === STREAM_STATE_OPEN) {
                return STREAM_STATE_OPEN;
            }
            if (s1 === STREAM_STATE_BUFFERING ||
                s2 === STREAM_STATE_BUFFERING) {
                return STREAM_STATE_BUFFERING;
            }
            if (s1 === STREAM_STATE_CAN_PLAY ||
                s2 === STREAM_STATE_CAN_PLAY) {
                return STREAM_STATE_CAN_PLAY;
            }
            return STREAM_STATE_LOADED;
        }
    }
}
