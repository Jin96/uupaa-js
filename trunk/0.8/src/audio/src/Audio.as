﻿// http://livedocs.adobe.com/flash/9.0_jp/ActionScriptLangRefV3/flash/media/Sound.html

package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class Audio extends Sprite {
        private var _OBJECT_ID:String = "";
        private var _sound:Sound = new Sound();
        private var _soundChannel:SoundChannel = null;
        private var _timer:Timer = null;
        private var _lastPosition:Number = 0;
        private var _updateDuration:Boolean = false;

        // attr
        private var _src:String = "";
        private var _loop:Boolean = false;
        private var _volume:Number = 1;
        private var _startTime:int = 0;         // unit: ms
        private var _currentTime:Number = 0;    // unit: ms
        // state
        private var _error:int = 0;
        private var _ended:Boolean = true;
        private var _closed:Boolean = false;
        private var _paused:Boolean = false;
        private var _canplay:Boolean = false;
        private var _lastAction:String = "";

        public function Audio() {
            ExternalInterface.addCallback("xiFlashAudioPlay", xiFlashAudioPlay);
            ExternalInterface.addCallback("xiFlashAudioStop", xiFlashAudioStop);
            ExternalInterface.addCallback("xiFlashAudioPause", xiFlashAudioPause);
            ExternalInterface.addCallback("xiFlashAudioSetAttr", xiFlashAudioSetAttr);
            ExternalInterface.addCallback("xiFlashAudioGetAttr", xiFlashAudioGetAttr);
            ExternalInterface.addCallback("xiFlashAudioGetState", xiFlashAudioGetState);
            ExternalInterface.addCallback("xiFlashAudioCanPlay", xiFlashAudioCanPlay);

            _OBJECT_ID = ExternalInterface.objectID;
            trace(_OBJECT_ID);

            _timer = new Timer(1000, 0);
            _timer.addEventListener(TimerEvent.TIMER, timerListener);
            _timer.start();

            try {
                ExternalInterface.call("uu.dmz." + _OBJECT_ID);
            } catch(err:Error) {
            }
        }

        private function timerListener(event:TimerEvent):void {
            handleDurationchange();
            handleTimeupdate();
        }

        private function handleDurationchange():void {
            if (_updateDuration) {
                _updateDuration = false;
                ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "durationchange");
            }
        }

        private function handleTimeupdate():void {
            if (!_soundChannel) {
                return;
            }
            if (_error || _closed || _ended || _paused) {
                return;
            }

            var pos:Number = _soundChannel.position;

            if (_lastPosition === pos) {
                return;
            }
            _lastPosition = pos;

            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "timeupdate");
        }

        private function openHandler(event:Event):void {
            _paused = true;
            _canplay = true;
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "canplay");
        }

        private function completeHandler(event:Event):void {
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "loadend");
        }

        private function ioErrorHandler(event:Event):void {
            trace("ioErrorHandler: " + event);

            _error = 4;
            _canplay = true;
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "error");
        }

        private function progressHandler(event:Event):void {
            _updateDuration = true;
        }

        public function xiFlashAudioPlay():void {
            if (_error || _closed) {
                return;
            }
            if (_paused || _ended) {
                _lastAction = "play";
                ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "play");

                play(_currentTime);
            }
        }

        public function play(position:Number):void {
            var soundTransform:SoundTransform = new SoundTransform(_volume);

            if (_soundChannel) {
                _soundChannel.removeEventListener(Event.SOUND_COMPLETE, endedHander);
            }
            _soundChannel = _sound.play(position, 0, soundTransform);
            _soundChannel.addEventListener(Event.SOUND_COMPLETE, endedHander);

            _ended = false;
            _paused = false;

            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "playing");
        }

        private function endedHander(event:Event):void {
            _ended = true;

            // update final position
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "timeupdate");

            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "ended");

            if (_loop) {
                play(_startTime);
            }
        }

        public function xiFlashAudioStop(close:Boolean):void {
            if (_error || _closed) {
                return;
            }

            if (close) {
                _closed = true;
                _canplay = true;
            } else {
                _lastAction = "stop";
            }

            if (_soundChannel) {
                _soundChannel.stop();
                _ended = true;
                _paused = false;
                _currentTime = _soundChannel.position; // unit: ms
            }
        }

        public function xiFlashAudioPause():void {
            if (_error || _closed || _ended || _paused) {
                return;
            }

            _lastAction = "pause";
            if (_soundChannel) {
                _soundChannel.stop();
                _paused = true;
                _currentTime = _soundChannel.position; // unit: ms

                ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "pause");
            }
        }

        private function setSrc(src:String):void {
            if (_src) {
                _sound.removeEventListener(Event.OPEN, openHandler);
                _sound.removeEventListener(Event.COMPLETE, completeHandler);
                _sound.removeEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
                _sound.removeEventListener(ProgressEvent.PROGRESS, progressHandler);
            }
            _src = src;
            if (src === "") {
                return;
            }
            var request:URLRequest = new URLRequest(src);

            _sound.addEventListener(Event.OPEN, openHandler);
            _sound.addEventListener(Event.COMPLETE, completeHandler);
            _sound.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
            _sound.addEventListener(ProgressEvent.PROGRESS, progressHandler);
            _sound.load(request);
        }

        private function setLoop(loop:Boolean):void {
            _loop = loop;
        }

        private function setStartTime(time:int):void {
            _startTime = time * 1000; // sec -> ms
        }

        private function setVolume(volume:Number):void {
            _volume = volume;

            if (_soundChannel) {
                var soundTransform:SoundTransform = _soundChannel.soundTransform;

                soundTransform.volume = volume;
                _soundChannel.soundTransform = soundTransform;
            }
        }

        private function setCurrentTime(time:Number):void {
            _currentTime = time * 1000; // sec -> ms
        }

        public function xiFlashAudioSetAttr(hash:Object):void {
            var i:String;

            for (i in hash) {
                switch (i) {
                case "src": this.setSrc(hash[i]); break;
                case "loop": this.setLoop(hash[i]); break;
                case "volume": this.setVolume(hash[i]); break;
                case "startTime": this.setStartTime(hash[i]); break;
                case "currentTime": this.setCurrentTime(hash[i]); break;
                case "timeupdate":
                    ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "timeupdate");
                }
            }
        }

        public function xiFlashAudioGetAttr():Object { // @return Hash: { src, loop, volume, duration,
                                                       //                 startTime, currentTime }
            var currentTime:Number = 0;

            if (_soundChannel) {
                if (_paused || _lastAction === "stop") {
                    currentTime = _currentTime;
                } else {
                    currentTime = _soundChannel.position;
                }
            }

            return {
                src: _src,
                loop: _loop,
                volume: _volume,
                duration: _sound.length / 1000,
                startTime: _startTime,
                currentTime: currentTime / 1000 // ms -> sec
            };
        }

        public function xiFlashAudioGetState():Object { // @return Hash: { error, ended, closed, paused,
                                                        //                 playing, condition }
            var error:int      = _error,
                ended:Boolean  = _ended,
                closed:Boolean = _closed,
                paused:Boolean = _paused,
                stoped:Boolean = _lastAction === "stop",
                condition:String;

            if (stoped && paused) {
                ended  = true;
                paused = false;
            }
            condition = closed ? "closed"
                      : error  ? "error"
                      : paused ? "paused"
                      : ended  ? "ended" : "playing";

            return {
                error:      error,
                ended:      ended,
                closed:     closed,
                paused:     paused,
                playing:    condition === "playing",
                condition:  condition
            };
        }

        public function xiFlashAudioCanPlay():Boolean { // @return Boolean
            return _canplay;
        }
    }
}

