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
            xi.addCallback("xiListAddAudio",            xiListAddAudio);
//            xi.addCallback("xiListAddItemImageAudio",     xiListAddItemImageAudio);
//            xi.addCallback("xiListAddItemImageAudiox2",   xiListAddItemImageAudiox2);
//            xi.addCallback("xiListAddItemVideoAudio",     xiListAddItemVideoAudio);
            xi.addCallback("xiListClear",               xiListClear);
            xi.addCallback("xiGetState",                xiGetState);
            xi.addCallback("xiTogglePlay",              xiTogglePlay);
            xi.addCallback("xiAutoPlay",                xiAutoPlay);
            xi.addCallback("xiPlay",                    xiPlay);
            xi.addCallback("xiPause",                   xiPause);
            xi.addCallback("xiSeek",                    xiSeek);
            xi.addCallback("xiStop",                    xiStop);
            xi.addCallback("xiClose",                   xiClose);
            xi.addCallback("xiSetVolume",               xiSetVolume);
            xi.addCallback("xiPrevAutoPlay",            xiPrevAutoPlay);
            xi.addCallback("xiNextAutoPlay",            xiNextAutoPlay);
/*
            xi.addCallback("xiBeforeUnload",  xiBeforeUnload);
 */
/*
            xi.addCallback("xiClearScreen", xiClearScreen);
            xi.addCallback("xiSetScreenSize", xiSetScreenSize);
 */
//            stage.scaleMode = StageScaleMode.EXACT_FIT; // 画面サイズにフィットさせる(縦横比は維持されない)

            try {
                xi.call(_xiCallback, "init", 0); // id = 0
            } catch(err:Error) {
                trace("callback(init) fail");
            }
            _timer.addEventListener(TimerEvent.TIMER, handleTimer);
            _timer.start();
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
                if (obj.isCanPlay()) {
                    obj.play();
                } else {
                    obj.load(function(ok:Boolean):void {
                        ok ? obj.play()
                           : postMessage("error", queue.id);
                    });
                }
                break;
            case "pause":   obj.pause(); break;
            case "seek":    obj.seek(queue.param1); break; // 0~100
            case "stop":    obj.stop(); break;
            case "close":   obj.close(); break;
            case "volume":  obj.setVolume(queue.param1);
            }
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

        public function xiSetVolume(id:Number, volume:Number):void {
            // volume = 0 ~ 1
            volume = volume > 1 ? 1
                   : volume < 0 ? 0
                   : volume;
            _queue.push({ id: id, action: "volume", param1: volume });
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

        public function xiListAddAudio(url:String):Number {
            ++_xiLock;
            _list.push(new MediaAudio(this, _list.length, url));
            --_xiLock;
            return _list.length - 1;
        }
/*
        public function xiListAddItemImageAudio(preload:Boolean,
                                                          imageURL:String,
                                                          audioURL:String):void {
        }

        public function xiListAddItemImageAudiox2(preload:Boolean,
                                                            imageURL:String,
                                                            audioURL1:String,
                                                            audioURL2:String):void {
        }

        public function xiListAddItemVideoAudio(preload:Boolean,
                                                          videoURL:String,
                                                          audioURL:String):void {
        }
 */

        public function xiListClear():void {
            _list.forEach(function(obj:Object, i:int, ary:Array):void {
                obj.close();
            });
            _list = [null];
            _playID = 0;
            _lastID = 0;
        }

        public function postMessage(msg:String, id:Number = 0, param:* = undefined):void {
trace("postMessage", msg, id, param);
            var that:* = this;

            if (_xiLock) { // lock -> stock
                _xiMessagePool.push({ msg: msg, id: id });
            } else {
                _xiMessagePool.forEach(function(obj:Object, i:int, ary:Array):void {
                    postMessageToJavaScript.call(that, obj.msg, obj.id);
                });
                postMessageToJavaScript(msg, id);
            }
        }

        // to js
        private function postMessageToJavaScript(msg:String, id:Number = 0):void {
            if (id in _list) {
                var state:Object = _list[id].getState();

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
    }
}
