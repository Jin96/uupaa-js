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
        public static var STREAM_STATE_CAN_PLAY:uint = 0x2;
        public static var STREAM_STATE_LOADED:uint   = 0x3;
        public static var STREAM_STATE_ERROR:uint    = 0x4;

        // for ExternalInterface
        private var _xiCallback:String = "";
        private var _xiExportMessage:Boolean = true;

        // for Message Queue
        private var _timer:Timer = new Timer(50, 0); // 20fps
        private var _queue:Array = [];

        // for List Management
        private var _list:Array = [null]; // [null, MediaAudio, ...]
        private var _playID:Number = 0; // playing id: 1 ~
        private var _lastID:Number = 0; // last inserted id: 1 ~

        // for Message Exports
        private var _xiLock:Number = 0;
        private var _xiMessagePool:Array = [];

        // state
        private var _masterMute:Boolean = false;
        private var _masterVolume:Number = 0;

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
            xi.addCallback("xiAdd",             xiAdd);
            xi.addCallback("xiClear",           xiClear);
            xi.addCallback("xiGetState",        xiGetState);
            xi.addCallback("xiTogglePlay",      xiTogglePlay);
            xi.addCallback("xiAutoPlay",        xiAutoPlay);
            xi.addCallback("xiPlay",            xiPlay);
            xi.addCallback("xiPause",           xiPause);
            xi.addCallback("xiSeek",            xiSeek);
            xi.addCallback("xiStop",            xiStop);
            xi.addCallback("xiClose",           xiClose);
            xi.addCallback("xiSetMasterMute",   xiSetMasterMute);
            xi.addCallback("xiToggleMasterMute",xiToggleMasterMute);
            xi.addCallback("xiSetVolume",       xiSetVolume);
            xi.addCallback("xiSetMasterVolume", xiSetMasterVolume);
            xi.addCallback("xiPrevAutoPlay",    xiPrevAutoPlay);
            xi.addCallback("xiNextAutoPlay",    xiNextAutoPlay);
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
            var queue:Object = _queue.shift();

            if (!queue) {
                return;
            }
            if (!(queue.id in _list) || !queue.id) {
                trace(queue.id, "is unknown");
                return; // skip
            }

            var obj:Object = _list[queue.id],
                state:Object, m1:uint, m2:uint;

            switch (queue.action) {
            case "pause":   obj.pause(); break;
            case "seek":    obj.seek(queue.param1); break; // 0~100
            case "stop":    obj.stop(); break;
            case "close":   obj.close(); break;
//          case "mute":    obj.setMute(queue.param1); break;
            case "volume":  obj.setVolume(queue.param1, queue.param2); break;
            case "toggleplay":
                state = obj.getState();

                switch (state.name) {
                case "MediaAudio":
                case "MediaVideo":
                    switch (state.mediaState[0]) {
                    case 1: obj.pause(); return;    // MEDIA_STATE_PLAYING -> pause
                    case 2: _lastID = 0;            // MEDIA_STATE_PAUSED  -> play
                    case 0:                         // MEDIA_STATE_STOPPED -> autoplay
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
                    m1 = state.mediaState[1];
                    m2 = state.mediaState[2];
                    if (m1 === m2) {
                        switch (m1) {
                        case MEDIA_STATE_STOPPED: // [1] AUTO PLAY/AUTO PLAY
                            if (_lastID && _lastID !== queue.id) {
                                (_lastID in _list) && _list[_lastID].close(); // auto close
                            }
                            _lastID = queue.id;
                            _masterMute && obj.setMute(true);
                            obj.play(handleCanPlayCallback);
                            break;
                        case MEDIA_STATE_PLAYING: // [5]
                            obj.pause();
                            break;
                        case MEDIA_STATE_PAUSED: // [9]
                            _lastID = queue.id;
                            _masterMute && obj.setMute(true);
                            obj.play(handleCanPlayCallback);
                        }
                    } else {
                        obj.stop();
                        _lastID = queue.id;
                        _masterMute && obj.setMute(true);
                        obj.play(handleCanPlayCallback);
                    }
                    return;
                }
            case "autoplay":
                if (_lastID && _lastID !== queue.id) {
                    (_lastID in _list) && _list[_lastID].close(); // auto close
                }
            case "play":
                _lastID = queue.id;
                _masterMute && obj.setMute(true);
                obj.play(handleCanPlayCallback);
            }
        }

        public function handleCanPlayCallback(id:Number):void {
            var obj:Object = _list[id];

            obj && obj.playback();
        }

        public function xiAdd(type:String,
                              audioSource:Array,
                              videoSource:Array,
                              imageSource:Array,
                              comment:Array):Number {
            ++_xiLock;
            var id:Number = _list.length;

            switch (type) {
            case "MediaAudio":
                _list.push(new MediaAudio(this, id, audioSource,
                                                    imageSource));
                break;
            case "MediaAudiox2":
                _list.push(new MediaAudiox2(this, id, audioSource,
                                                      imageSource));
                break;
            case "MediaVideo":
                _list.push(new MediaVideo(this, id, videoSource));
                break;
            case "MediaAudioVideo":
                _list.push(new MediaAudioVideo(this, id, audioSource,
                                                         videoSource,
                                                         imageSource));
                break;
            default:
                trace("ERROR", type);
            }
            --_xiLock;
            return id - 1;
        }

        public function xiClear():void {
            var i:int = 1, iz:int = _list.length;

            for (; i < iz; ++i) {
                _list[i].close();
            }
            _list = [null];
            _playID = 0;
            _lastID = 0;
        }

        public function xiAutoPlay(id:Number):void {
            _queue.push({ id: id, action: "autoplay" });
        }

        public function xiGetState(id:Number):Object {
            return _list[id] ? _list[id].getState() : {};
        }

        public function xiPlay(id:Number):void {
            _queue.push({ id: id, action: "play" });
        }

        public function xiPause(id:Number):void {
            _queue.push({ id: id, action: "pause" });
        }

        public function xiTogglePlay(id:Number):void {
            _queue.push({ id: id, action: "toggleplay" });
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

        public function xiSetMasterMute(mute:Boolean = true):void {
            _masterMute = mute;
            var i:int = 1, iz:int = _list.length,
                ex:Boolean = _xiExportMessage;

            _xiExportMessage = false;

            for (; i < iz; ++i) {
                _list[i].setMute(_masterMute);
            }

            _xiExportMessage = ex;

            _lastID && _list[_lastID].setMute(_masterMute);
        }

        public function xiToggleMasterMute():void {
            xiSetMasterMute(_masterMute ? false : true);
        }

        public function xiSetVolume(id:Number,
                                    volume:Number,
                                    force:Boolean = false):void {
            // volume = 0 ~ 1
            volume = volume > 1 ? 1
                   : volume < 0 ? 0
                   : volume;
            _queue.push({ id: id, action: "volume", param1: volume, param2: force });
        }

        public function xiSetMasterVolume(volume:Number):void {
            // volume = 0 ~ 1
            _masterVolume = volume > 1 ? 1
                          : volume < 0 ? 0
                          : volume;

            var i:int = 1, iz:int = _list.length,
                ex:Boolean = _xiExportMessage;

            _xiExportMessage = false;

            for (; i < iz; ++i) {
                if (i !== _lastID) {
                    _list[i].setVolume(_masterVolume, true);
                }
            }

            _xiExportMessage = ex;
            _lastID && _list[_lastID].setVolume(_masterVolume, true);
        }

        public function xiPrevAutoPlay():Number {
            var id:Number = _lastID;

            if (--id < 1) {
                id = _list.length - 1;
            }
            _queue.push({ id: id, action: "autoplay" });
            return id;
        }

        public function xiNextAutoPlay():Number {
            var id:Number = _lastID;

            if (++id >= _list.length) {
                id = 1;
            }
            _queue.push({ id: id, action: "autoplay" });
            return id;
        }

        public function xiBeforeUnload():void {
            trace("xiBeforeUnload");

            _xiExportMessage = false; // export prohibit
            xiClear();
        }

        public function postMessage(msg:String, id:Number = 0, param:* = undefined):void {
            var that:* = this;

            if (!_list[id]) {
                return;
            }
            if (_xiExportMessage) {
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
        }

        // to js
        private function postMessageToJavaScript(msg:String, id:Number = 0):void {
            // id = 0 -> null
            if (_list[id]) {
                var state:Object = _list[id].getState();

                state.masterMute = _masterMute; // join
                state.masterVolume = _masterVolume; // join

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
            // ERROR > CLOSED > OPEN > CAN_PLAY > LOADED
            // -----------------------------------------
            // ERROR    + ANY      -> ERROR
            // ANY      + ERROR    -> ERROR
            // CLOSED   + CLOSED   -> CLOSED
            // CLOSED   + OPEN     -> CLOSED
            // CLOSED   + CAN_PLAY -> CLOSED
            // CLOSED   + LOADED   -> CLOSED
            // OPEN     + CLOSED   -> CLOSED
            // OPEN     + OPEN     -> OPEN
            // OPEN     + CAN_PLAY -> OPEN
            // OPEN     + LOADED   -> OPEN
            // CAN_PLAY + CLOSED   -> CLOSED
            // CAN_PLAY + OPEN     -> OPEN
            // CAN_PLAY + CAN_PLAY -> CAN_PLAY
            // CAN_PLAY + LOADED   -> CAN_PLAY
            // LOADED   + CLOSED   -> CLOSED
            // LOADED   + OPEN     -> OPEN
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
            if (s1 === STREAM_STATE_CAN_PLAY ||
                s2 === STREAM_STATE_CAN_PLAY) {
                return STREAM_STATE_CAN_PLAY;
            }
            return STREAM_STATE_LOADED;
        }
    }
}
