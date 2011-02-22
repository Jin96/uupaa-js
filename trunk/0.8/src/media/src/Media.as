package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.system.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class Media extends Sprite {
        private var _xiCallback:String = "";
        private var _timer:Timer = new Timer(64, 0);
        private var _exportMessage:Boolean = true;
        private var _itemObj:Object = {}; // itemID: obj
        private var _lastItemID:Number = 0;
        private var _queue:Array = [];
        private var _lastPlayItemID:uint = 0; // 1 ~
        private var _xiLock:uint = 0;
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

            // flashVars.callback: String をコールバックメソッド名として取り出す
            // デフォルトのメソッド名は window.uu.dmz[ExternalInterface.objectID]
            // コールバック引数は、第一引数に文字列を、第ニ引数に値を渡す
            var flashVars:Object = LoaderInfo(this.root.loaderInfo).parameters;

            _xiCallback = flashVars["callback"] ? flashVars["callback"]
                                                : ("uu.dmz." + xi.objectID);

            xi.addCallback("xiSetAudioSource",          xiSetAudioSource);
/*
            xi.addCallback("xiSetVideoSource",          xiSetVideoSource);
            xi.addCallback("xiSetImageSource",          xiSetImageSource);
 */
            xi.addCallback("xiListAddItemAudio",          xiListAddItemAudio);
//            xi.addCallback("xiListAddItemImageAudio",     xiListAddItemImageAudio);
//            xi.addCallback("xiListAddItemImageAudiox2",   xiListAddItemImageAudiox2);
//            xi.addCallback("xiListAddItemVideoAudio",     xiListAddItemVideoAudio);
            xi.addCallback("xiListClearItem",             xiListClearItem);
            xi.addCallback("xiGetLastItemID",             xiGetLastItemID);
            xi.addCallback("xiGetState",                  xiGetState);
            xi.addCallback("xiTogglePlay",                xiTogglePlay);
            xi.addCallback("xiAutoPlay",                  xiAutoPlay);
            xi.addCallback("xiPlay",                      xiPlay);
            xi.addCallback("xiPause",                     xiPause);
            xi.addCallback("xiStop",                      xiStop);
            xi.addCallback("xiSeek",                      xiSeek);
/*
            xi.addCallback("xiState",         xiState);
            xi.addCallback("xiAttr",          xiAttr);
            xi.addCallback("xiIsReady",       xiIsReady);
            xi.addCallback("xiIsPlaying",     xiIsPlaying);
            xi.addCallback("xiIsLoaded",      xiIsLoaded);
            xi.addCallback("xiIsClosed",      xiIsClosed);
            xi.addCallback("xiIsStopped",     xiIsStopped);
            xi.addCallback("xiIsError",       xiIsError);
            xi.addCallback("xiBeforeUnload",  xiBeforeUnload);
 */
/*
            xi.addCallback("xiClearScreen", xiClearScreen);
            xi.addCallback("xiSetScreenSize", xiSetScreenSize);
 */
//            stage.scaleMode = StageScaleMode.EXACT_FIT; // 画面サイズにフィットさせる(縦横比は維持されない)

            try {
                xi.call(_xiCallback, "init", 0); // itemID = 0
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
            if (!(queue.itemID in _itemObj)) {
                trace(queue.itemID, "is unknown");
                return; // u
            }
            var obj:Object = _itemObj[queue.itemID];

            switch (queue.action) {
            case "setAudioSource":
                obj.setAudioSource(queue.param1);
                break;
            case "toggleplay":
                var state:Object = obj.getState();

                switch (state.audioState) {
                case 1: // obj.AUDIO_STATE_PLAYING -> pause
                    obj.pause();
                    return;
                case 2: // obj.AUDIO_STATE_PAUSED -> play
                    _lastPlayItemID = 0;
                case 0: // obj.AUDIO_STATE_STOPPED -> autoplay
                }
            case "autoplay":
                if (_lastPlayItemID && queue.itemID !== _lastPlayItemID) {
                    if (_lastPlayItemID in _itemObj) {
                        _itemObj[_lastPlayItemID].close(); // auto close
                    }
                }
            case "play":
                _lastPlayItemID = queue.itemID;
                if (obj.isCanPlay()) {
                    obj.play();
                } else {
                    obj.load(function(ok:Boolean):void {
                        if (ok) {
                            obj.play();
                        } else {
                            postMessage("error", queue.itemID);
                        }
                    });
                }
                break;
            case "pause":   obj.pause(); break;
            case "seek":    obj.seek(queue.param1); break;
            case "stop":    obj.stop(); break;
            case "close":   obj.close(); break;
            case "volume":  obj.setVolume(queue.param1);
            }
        }

        public function xiSetAudioSource(itemID:Number, url:String):void {
            _queue.push({ itemID: itemID, action: "setAudioSource", param1: url });
        }

        public function xiAutoPlay(itemID:Number):void {
            _queue.push({ itemID: itemID, action: "autoplay" });
        }

        public function xiGetState(itemID:Number):Object {
            var obj:Object = _itemObj[itemID];

            return obj ? obj.getState() : {};
        }

        public function xiPlay(itemID:Number): void {
            _queue.push({ itemID: itemID, action: "play" });
        }

        public function xiPause(itemID:Number): void {
            _queue.push({ itemID: itemID, action: "pause" });
        }

        public function xiTogglePlay(itemID:Number): void {
            _queue.push({ itemID: itemID, action: "toggleplay" });
        }

        public function xiSeek(itemID:Number, position:Number): void {
            _queue.push({ itemID: itemID, action: "seek", param1: position });
        }

        public function xiStop(itemID:Number): void {
            _queue.push({ itemID: itemID, action: "stop" });
        }

        public function xiClose(itemID:Number): void {
            _queue.push({ itemID: itemID, action: "close" });
        }

        public function xiVolume(itemID:Number, volume:Number): void {
            _queue.push({ itemID: itemID, action: "volume", param1: volume });
        }

        public function xiGetLastItemID():Number {
            return _lastItemID;
        }

        public function xiListAddItemAudio():Number {
            ++_xiLock;
            ++_lastItemID;
            _itemObj[_lastItemID] = new MediaAudio(this, _lastItemID);
            --_xiLock;
            return _lastItemID;
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

        public function xiListClearItem():void {
            var i:String;

            for (i in _itemObj) {
                _itemObj[i].close();
            }
            _itemObj = {};
            _lastItemID = 0;
            _lastPlayItemID = 0;
        }

        public function postMessage(msg:String, itemID:uint = 0, param:* = undefined):void {
trace("postMessage", msg, itemID, param);
            var that:* = this;

            if (_exportMessage) {
                if (_xiLock) { // lock -> stock
                    _xiMessagePool.push({ msg: msg, itemID: itemID });
                } else {
                    _xiMessagePool.forEach(function(e:Object, i:int, ary:Array):void {
                        postMessageToJavaScript.call(that, e.msg, e.itemID);
                    });
                    postMessageToJavaScript(msg, itemID);
                }
            }
        }

        // to js
        private function postMessageToJavaScript(msg:String, itemID:uint = 0):void {
            if (_itemObj[itemID]) {
                var state:Object = _itemObj[itemID].getState();

                switch (msg) {
                case "durationchange":
                case "timeupdate":
                case "progress":
                    ExternalInterface.call(_xiCallback, msg, itemID, state, true);
                    break;
                default:
                    ExternalInterface.call(_xiCallback, msg, itemID, state, true);
                }
            }
        }
    }
}
