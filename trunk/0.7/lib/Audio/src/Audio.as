package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.media.*;
    import flash.net.*;

    public class Audio extends Sprite {
        private var _OBJECT_ID:String = "";

        private var _loop:Boolean = false;
        private var _volume:Number = 1;
        private var _startTime:Number = 0;      // unit: ms
        private var _currentTime:Number = 0;    // unit: ms
        private var _sound:Sound = new Sound();
        private var _soundChannel:SoundChannel = null;
        private var _error:Number = 0;
        private var _ended:Boolean = true;
        private var _paused:Boolean = false;

        public function Audio() {
            ExternalInterface.addCallback("ex_setSource", ex_setSource);
            ExternalInterface.addCallback("ex_play", ex_play);
            ExternalInterface.addCallback("ex_pause", ex_pause);
            ExternalInterface.addCallback("ex_stop", ex_stop);
            ExternalInterface.addCallback("ex_setLoop", ex_setLoop);
            ExternalInterface.addCallback("ex_getState", ex_getState);
            ExternalInterface.addCallback("ex_setVolume", ex_setVolume);
            ExternalInterface.addCallback("ex_setStartTime", ex_setStartTime);
            ExternalInterface.addCallback("ex_getCurrentTime", ex_getCurrentTime);
            ExternalInterface.addCallback("ex_setCurrentTime", ex_setCurrentTime);

            var flashVars:Object = stage.loaderInfo.parameters;

            _OBJECT_ID = flashVars.ExternalInterfaceObjectID;
            trace(_OBJECT_ID);

            ExternalInterface.call("uu.dmz." + _OBJECT_ID);
        }

        public function ex_setSource(source:String):void {
            var request:URLRequest = new URLRequest(source);

            _sound.addEventListener(Event.OPEN, openHandler);
            _sound.addEventListener(Event.COMPLETE, completeHandler);
            _sound.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
            _sound.load(request);
        }

        private function openHandler(event:Event):void {
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "canplay");
        }

        private function completeHandler(event:Event):void {
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "loadend");
        }

        private function ioErrorHandler(event:Event):void {
            trace("ioErrorHandler: " + event);

            _error = 4;
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "error");
        }

        public function ex_play():void {
            if (_paused) {
                play(_currentTime);
            } else if (_ended) {
                play(_startTime);
            }
        }

        public function play(position:Number):void {
            if (_error) {
                return;
            }
            var soundTransform:SoundTransform = new SoundTransform(_volume);

            if (_soundChannel) {
                _soundChannel.removeEventListener(Event.SOUND_COMPLETE, endedHander);

                _soundChannel = _sound.play(position, 0, soundTransform);
                _soundChannel.addEventListener(Event.SOUND_COMPLETE, endedHander);
                _ended = false;
                _paused = false;
                _currentTime = 0;
            } else {
                _soundChannel = _sound.play(_startTime, 0, soundTransform);
                _soundChannel.addEventListener(Event.SOUND_COMPLETE, endedHander);

                _ended = false;
                _paused = false;
                _currentTime = 0;
            }
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "playing");
        }

        private function endedHander(event:Event):void {
            _ended = true;
            ExternalInterface.call("uu.dmz." + _OBJECT_ID + "event", "ended");

            if (_loop) {
                play(_startTime);
            }
        }

        public function ex_pause():void {
            if (!_error && !_ended && !_paused) {
                if (_soundChannel) {
                    _soundChannel.stop();
                    _paused = true;
                    _currentTime = _soundChannel.position; // unit: ms
                }
            }
        }

        public function ex_stop():void {
            if (_error) {
                return;
            }
            if (_soundChannel) {
                _soundChannel.stop();
                _ended = true;
                _paused = false;
                _currentTime = 0;
            }
        }

        public function ex_setLoop(loop:Boolean):void {
            _loop = loop;
        }

        public function ex_getState():Object {
            return {
                error:      _error,
                paused:     _paused,
                ended:      _ended,
                duration:   _sound.length / 1000
            };
        }

        public function ex_setVolume(volume:Number):void {
            _volume = volume;

            if (_soundChannel) {
                var soundTransform:SoundTransform = _soundChannel.soundTransform;

                soundTransform.volume = volume;
                _soundChannel.soundTransform = soundTransform;
            }
        }

        public function ex_setStartTime(time:int):void {
            _startTime = time * 1000; // sec -> ms
        }

        public function ex_getCurrentTime():Number {
            if (_soundChannel) {
                return _soundChannel.position / 1000; // ms -> sec
            }
            return 0;
        }

        public function ex_setCurrentTime(time:Number):void {
            _currentTime = time * 1000; // sec -> ms

            if (!_error && !_paused && !_ended) {
                // playing
                if (_soundChannel) {
                    _soundChannel.stop();
                    play(_currentTime);
                }
            }
        }
    }
}

