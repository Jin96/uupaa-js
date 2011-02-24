package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.system.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class Media extends Sprite {
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

            var obj:Object = _list[queue.id];

            switch (queue.action) {
            case "toggleplay":
                var state:Object = obj.getState();

                switch (state.audioState) {
                case 1: // obj.AUDIO_STATE_PLAYING -> pause
                    obj.pause();
                    return;
                case 2: // obj.AUDIO_STATE_PAUSED -> play
                    _lastID = 0;
                case 0: // obj.AUDIO_STATE_STOPPED -> autoplay
                }
            case "autoplay":
                if (_lastID && _lastID !== queue.id) {
                    if (_lastID in _list) {
                        _list[_lastID].close(); // auto close
                    }
                }
            case "play":
                _lastID = queue.id;
                _masterMute && obj.setMute(true);
                obj.play(true);
                break;
            case "pause":   obj.pause(); break;
            case "seek":    obj.seek(queue.param1); break; // 0~100
            case "stop":    obj.stop(); break;
            case "close":   obj.close(); break;
//          case "mute":    obj.setMute(queue.param1); break;
            case "volume":  obj.setVolume(queue.param1, queue.param2);
            }
        }

        public function xiAdd(type:String,
                              audioSource:Array,
                              videoSource:Array,
                              imageSource:Array,
                              comment:Array):Number {
            ++_xiLock;
            switch (type) {
            case "MediaAudio":
                _list.push(new MediaAudio(this, _list.length,
                                          audioSource,
                                          imageSource));
                break;
/*
            case "MediaAudiox2":
                _list.push(new MediaAudiox2(this, _list.length,
                                            audioSource,
                                            imageSource));
                break;
            case "MediaAudioVideo":
 */
            default:
                trace("ERROR", type);
            }
            --_xiLock;
            return _list.length - 1;
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
            var i:int = 1, iz:int = _list.length;

            for (; i < iz; ++i) {
                _list[i].setMute(_masterMute);
            }
        }

        public function xiToggleMasterMute():void {
            _masterMute = _masterMute ? false : true;
            var i:int = 1, iz:int = _list.length;

            for (; i < iz; ++i) {
                _list[i].setMute(_masterMute);
            }
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

            var i:int = 1, iz:int = _list.length;

            for (; i < iz; ++i) {
                _list[i].setVolume(_masterVolume, true);
            }
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
            if (id in _list) {
                var state:Object = _list[id].getState();

                state.masterMute = _masterMute; // join
                state.masterVolume = _masterVolume; // join

                switch (msg) {
                case "durationchange":
                case "timeupdate":
                case "progress":
                    ExternalInterface.call(_xiCallback, msg, id, state, true);
                    break;
                default:
                    ExternalInterface.call(_xiCallback, msg, id, state, true);
                }
            }
        }

        public function waitForObject(evaluate:Function,
                                      args:Array,
                                      that:*,
                                      callback:Function,
                                      msec:Number):void {
            setTimeout(function tick():void {
                var r:* = evaluate.apply(that, args);
                // return false is callback(false)
                // return true is callback(true)

                if (r === true) {
                    callback(true);
                    return;
                } else if (r === false) {
                    callback(false);
                    return;
                }
                setTimeout(tick, msec);
            }, msec);
        }
    }
}
