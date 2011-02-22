// W3C NamedEvent -> http://www.w3.org/TR/html5/video.html#event-media-timeupdate
package {
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudio {
        public static var AUDIO_STATE_STOPPED:uint   = 0;
        public static var AUDIO_STATE_PLAYING:uint   = 1;
        public static var AUDIO_STATE_PAUSED:uint    = 2;
        public static var STREAM_STATE_CLOSED:uint   = 0;
        public static var STREAM_STATE_OPEN:uint     = 1;
        public static var STREAM_STATE_CAN_PLAY:uint = 2;
        public static var STREAM_STATE_ERROR:uint    = 3;
        private var _boss:Media;
        private var _itemID:uint;
        // inner
        private var _sound:Sound = null;
        private var _soundChannel:SoundChannel = null;
        private var _timer:Timer = new Timer(1000, 0);
        private var _fadeTimer:Timer = new Timer(80, 16); // 1.3sec
        private var _fadeCompleteCallback:Array = [];
        private var _canPlayedCallback:Array = [];
        private var _lastPosition:Number = 0;
        private var _updateDuration:Boolean = false;
        private var _updateVolume:Boolean = false;
        private var _progress:Number = 0; // 0 ~ 100
        // state
        private var _audioState:uint = AUDIO_STATE_STOPPED;
        private var _streamState:uint = STREAM_STATE_CLOSED;
        private var _streamLoaded:Boolean = false;
        private var _loop:Boolean = false;
        private var _mute:Boolean = false;
        private var _volume:Object = {
                        current: 1,             // 0~1
                        future: 1,              // 0~1
                        past: 1                 // 0~1
                    };
        private var _keepVolume:Number = 1;     // 0~1
        private var _startTime:int = 0;         // unit: ms
        private var _currentTime:Number = 0;    // unit: ms
        private var _audioSource:Object = {
                        loaded: "",
                        current: ""
                    };

        public function MediaAudio(boss:Media, itemID:uint) {
            _boss = boss;
            _itemID = itemID;

            _timer.addEventListener(TimerEvent.TIMER, handleTimer);
            _timer.start();

            _fadeTimer.addEventListener(TimerEvent.TIMER, handleFadeTimer);
            _fadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, handleFadeComplete);
        }

        public function load(callback:Function = null):void {
            if (!_audioSource.current) {
                trace(_itemID, "load() fail. audio source was empty")
                callback(false); // fail
                return;
            }
            if (_audioSource.loaded === _audioSource.current) {
                if (isCanPlay()) {
                    _boss.postMessage("canplay", _itemID); // W3C NamedEvent
                    callback(true); // success
                    return;
                }
            }
            if (!_audioSource.loaded) { // at first time (or error occurred)
                trace(_itemID, "load() at first time");
                openSound(callback);
            } else {
                fadeVolume(0, function():void {
                    closeSoundChannel();
                    _currentTime = 0;
                    closeSound();
                    openSound(callback);
                });
            }
        }

        // fadein/fadeout volume
        private function fadeVolume(volume:Number,
                                    callback:Function = null):void {
            if (!_soundChannel) {
                callback && callback.call(this);
                return;
            }
            _volume.past = _volume.current; // save
            _volume.future = volume;

            callback && _fadeCompleteCallback.push(callback); // lazy
            _fadeTimer.reset();
            _fadeTimer.start();
        }

        private function openSound(callback:Function = null):void {
            _sound = new Sound();
            _sound.addEventListener(Event.OPEN, handleOpen);
            _sound.addEventListener(Event.COMPLETE, handleComplete);
            _sound.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
            _sound.addEventListener(ProgressEvent.PROGRESS, handleProgress);

            _sound.load(new URLRequest(_audioSource.current));
            _audioSource.loaded = _audioSource.current; // copy

            if (callback !== null) {
                _canPlayedCallback.push(callback); // wait for handleProgress
            }
        }

        private function closeSound():void {
            if (_sound) {
                if (!_streamLoaded) { // abort
                    try {
                        _sound.close();
                    } catch(err:Error) {
                        trace(_itemID, "sound.close() fail." + err);
                    }
                }
                _sound.removeEventListener(Event.OPEN, handleOpen);
                _sound.removeEventListener(Event.COMPLETE, handleComplete);
                _sound.removeEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                _sound.removeEventListener(ProgressEvent.PROGRESS, handleProgress);
                _sound = null;
            }
            _streamState = STREAM_STATE_CLOSED;
        }

        private function openSoundChannel(position:Number):void {
            var soundTransform:SoundTransform = new SoundTransform(_volume.current);

            _audioState = AUDIO_STATE_PLAYING;
            _soundChannel = _sound.play(position, 0, soundTransform);
            _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
        }

        private function closeSoundChannel():Number {
            var rv:Number = _currentTime;

            if (_soundChannel) {
                rv = _soundChannel.position; // unit: ms

                var soundTransform:SoundTransform = _soundChannel.soundTransform;
                soundTransform.volume = 0; // mute
                _soundChannel.soundTransform = soundTransform;

                _soundChannel.stop();
                _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                _soundChannel = null;

                _audioState = AUDIO_STATE_STOPPED;
            }
            return rv;
        }

        public function play():void {
            if (_streamState === STREAM_STATE_CAN_PLAY &&
                _audioState !== AUDIO_STATE_PLAYING) {

                _boss.postMessage("play", _itemID); // W3C NamedEvent

                closeSoundChannel();
                openSoundChannel(_currentTime);

                _boss.postMessage("playing", _itemID); // W3C NamedEvent
            }
        }

        public function seek(position:Number):void { // @param Number: 0~100
            if (_sound &&
                _streamState === STREAM_STATE_CAN_PLAY) {

                // map 0~100 to 0~duration
                var realPositon:Number = position * _sound.length / 100;

                switch (_audioState) {
                case AUDIO_STATE_STOPPED: // stopeed + seek
                    _currentTime = realPositon;
                    break;
                case AUDIO_STATE_PLAYING:
                case AUDIO_STATE_PAUSED:
                    _boss.postMessage("seeking", _itemID); // W3C NamedEvent

                    var soundTransform:SoundTransform = _soundChannel.soundTransform;

                    _soundChannel.stop();
                    _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                    _soundChannel = null;

                    _soundChannel = _sound.play(realPositon, 0, soundTransform);
                    _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);

                    _audioState = AUDIO_STATE_PLAYING;

                    _boss.postMessage("seekend", _itemID); // W3C NamedEvent
                    _boss.postMessage("playing", _itemID); // W3C NamedEvent
                }
            }
        }

        public function pause():void {
            if (_streamState === STREAM_STATE_CAN_PLAY &&
                _audioState === AUDIO_STATE_PLAYING) {

                _currentTime = closeSoundChannel(); // keep current position
                _audioState = AUDIO_STATE_PAUSED; // overwrite
                _boss.postMessage("pause", _itemID); // W3C NamedEvent
            }
        }

        public function stop():void {
            if (_streamState === STREAM_STATE_OPEN ||
                _streamState === STREAM_STATE_CAN_PLAY) {

                if (_audioState !== AUDIO_STATE_STOPPED) {
                    closeSoundChannel();
                    _currentTime = 0;
                    _boss.postMessage("stop", _itemID); // NOT W3C NamedEvent
                }
            }
        }

        public function close():void {
            fadeVolume(0, function():void {
                closeSoundChannel();
                _currentTime = 0;
                closeSound();
                _boss.postMessage("close", _itemID); // NOT W3C NamedEvent
            });
        }

        public function getState():Object { // @return Hash: { loop, volume, duration,
                                            //                 startTime, currentTime,
                                            //                 audioSource, videoSource, imageSource,
                                            //                 audioState, videoState, imageState, streamState }
            var duration:Number = _sound ? _sound.length : 0,
                currentTime:Number = 0;

            if (_soundChannel) {
                if (_audioState === AUDIO_STATE_PLAYING ||
                    _audioState === AUDIO_STATE_PAUSED) {
                    currentTime = _soundChannel.position;
                } else {
                    currentTime = _currentTime;
                }
            }
            return {
                loop: _loop,
                mute: _mute,
                volume: _volume.current,
                duration: duration,
                progress: _progress,
                position: duration ? Math.round(currentTime / duration * 100) : 0, // 0~100
                startTime: _startTime,
                currentTime: currentTime, // ms
                audioSource: _audioSource.current,
                videoSource: "",
                imageSource: "",
                audioState: _audioState,
                videoState: 0,
                imageState: 0,
                streamState: _streamState
            };
        }

        public function setLoop(loop:Boolean):void {
            _loop = loop;
        }

        public function setVolume(volume:Number):void {
            if (_volume.future !== volume) {
                _volume.past = volume;
                _volume.future = volume;
                _volume.current = volume;
                updateVolume(true);
            }
        }

        public function setMute(mute:Boolean):void {
            _mute = mute;
            updateVolume(true);
        }

        public function setStartTime(time:Number):void {
            _startTime = time; // ms
        }

        public function setCurrentTime(time:Number):void {
            _currentTime = time; // ms
        }

        public function setAudioSource(source:String):void {
            _audioSource.current = source;
        }

        public function isOpen():Boolean {
            return _streamState === STREAM_STATE_OPEN;
        }

        public function isCanPlay():Boolean {
            return _streamState === STREAM_STATE_CAN_PLAY;
        }

        public function isPlaying():Boolean {
            return _audioState === AUDIO_STATE_PLAYING;
        }

        // ---------------------------------------
        private function handleTimer(event:TimerEvent):void {
            if (_streamState === STREAM_STATE_OPEN ||
                _streamState === STREAM_STATE_CAN_PLAY) {

                updateVolume();

                // fire duration change event
                if (_updateDuration) {
                    _updateDuration = false;
                    _boss.postMessage("durationchange", _itemID); // W3C NamedEvent
                }

                if (_streamState === STREAM_STATE_CAN_PLAY) {
                    // fire timeupdate event
                    if (_soundChannel) {
                        var pos:Number = _soundChannel.position;

                        if (_lastPosition !== pos) {
                            _lastPosition = pos;
                            _boss.postMessage("timeupdate", _itemID, pos); // W3C NamedEvent
                        }
                    }
                }
            }
        }

        private function handleFadeTimer(event:TimerEvent):void {
            if (_volume.current !== _volume.future) {
                if (_volume.current > _volume.future) {
                    _volume.current -= 0.05;
                    if (_volume.current < _volume.future) {
                        _volume.current = _volume.future;
                    }
                } else {
                    _volume.current += 0.05;
                    if (_volume.current > _volume.future) {
                        _volume.current = _volume.future;
                    }
                }
                updateVolume(true);
            }
        }

        private function handleFadeComplete(event:TimerEvent):void {
            var callback:Function;

            _volume.current = _volume.past; // resume volume
            updateVolume(true);

            while (callback = _fadeCompleteCallback.shift()) {
                callback.call(this);
            }
        }

        private function handleOpen(event:Event):void {
            _streamState = STREAM_STATE_OPEN;
            _boss.postMessage("loadstart", _itemID); // W3C NamedEvent
        }

        private function handleComplete(event:Event):void {
            _streamLoaded = true;
            _boss.postMessage("loadend", _itemID); // NOT W3C NamedEvent
        }

        private function handleIOError(event:IOErrorEvent):void {
            trace(_itemID, "handleIOError: " + event);

            _streamState = STREAM_STATE_ERROR;
            _audioSource.loaded = "";
            _boss.postMessage("error", _itemID); // W3C NamedEvent
        }

        private function handleProgress(event:ProgressEvent):void {
            if (_streamState === STREAM_STATE_OPEN) {
                _streamState = STREAM_STATE_CAN_PLAY;

                var callback:Function;

                while (callback = _canPlayedCallback.shift()) {
                    callback(true); // openSound(ok:Boolean);
                }
                _boss.postMessage("canplay", _itemID); // W3C NamedEvent
            }
            var loadTime:Number = event.bytesLoaded / event.bytesTotal;
            _progress = Math.round(100 * loadTime);

            _updateDuration = true;
            _boss.postMessage("progress", _itemID); // W3C NamedEvent
        }

        private function handleSoundChannelComplete(event:Event):void {
            _audioState = AUDIO_STATE_STOPPED;

            var pos:Number = 0;

            // update last position
            if (_soundChannel) {
                pos = _lastPosition = _soundChannel.position;
            }
            // update final position
            _boss.postMessage("timeupdate", _itemID, pos); // W3C NamedEvent
            _boss.postMessage("ended", _itemID); // W3C NamedEvent

            if (_loop) {
                closeSoundChannel();
                _currentTime = _startTime; // overwirte
                openSoundChannel(_startTime); // rewind
                _boss.postMessage("playing", _itemID); // W3C NamedEvent
            }
        }

        private function updateVolume(forceUpdate:Boolean = false):void {
            if (_soundChannel) {
                if (_updateVolume || forceUpdate) {
                    _updateVolume = false;

                    var soundTransform:SoundTransform = _soundChannel.soundTransform;

                    soundTransform.volume = _mute ? 0 : _volume.current;
                    _soundChannel.soundTransform = soundTransform;

                    _boss.postMessage("volumechange", _itemID); // W3C NamedEvent
                }
            }
        }
    }
}

