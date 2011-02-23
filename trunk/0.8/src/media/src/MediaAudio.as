// W3C NamedEvent -> http://www.w3.org/TR/html5/video.html#event-media-timeupdate
package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudio extends Sprite {
        public static var AUDIO_STATE_STOPPED:uint   = 0;
        public static var AUDIO_STATE_PLAYING:uint   = 1;
        public static var AUDIO_STATE_PAUSED:uint    = 2;
        public static var STREAM_STATE_CLOSED:uint   = 0;
        public static var STREAM_STATE_OPEN:uint     = 1;
        public static var STREAM_STATE_CAN_PLAY:uint = 2;
        public static var STREAM_STATE_ERROR:uint    = 3;
        protected var _boss:Media;
        protected var _id:Number = 0;
        // inner
        protected var _sound:Sound = null;
        protected var _soundChannel:SoundChannel = null;
        protected var _timer:Timer = new Timer(200, 0);
        protected var _fadeTimer:Timer = new Timer(80, 20); // 80msec * 20 = 1.6sec
        protected var _fadeCompleteCallback:Array = [];
        protected var _canPlayedCallback:Array = [];
        protected var _lastPosition:Number = 0;
        protected var _updateDuration:Boolean = false;
        protected var _updateVolume:Boolean = false;
        protected var _progress:Number = 0; // 0 ~ 100
        // state
        protected var _audioState:uint = AUDIO_STATE_STOPPED;
        protected var _streamState:uint = STREAM_STATE_CLOSED;
        protected var _streamLoaded:Boolean = false;
        protected var _loop:Boolean = false;
        protected var _mute:Boolean = false;
        protected var _volume:Object = {
                        current: 1,             // 0~1
                        future: 1,              // 0~1
                        past: 1                 // 0~1
                    };
        protected var _keepVolume:Number = 1;     // 0~1
        protected var _startTime:Number = 0;      // unit: ms
        protected var _currentTime:Number = 0;    // unit: ms
        protected var _audioSource:Object = {
                        loaded: "",
                        current: ""
                    };

        public function MediaAudio(boss:Media,
                                   id:Number,
                                   audioSource:Array) {
            _boss = boss;
            _id = id;
            _audioSource.current = audioSource;

            _timer.addEventListener(TimerEvent.TIMER, handleTimer);
            _timer.start();

            _fadeTimer.addEventListener(TimerEvent.TIMER, handleFadeTimer);
            _fadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, handleFadeComplete);

        }

        public function load(callback:Function = null):void {
            if (!_audioSource.current) {
                trace(_id, "load() fail. audio source was empty")
                callback(false); // fail
                return;
            }
            if (_audioSource.loaded === _audioSource.current) {
                if (isCanPlay()) {
                    _boss.postMessage("canplay", _id); // W3C NamedEvent
                    callback(true); // success
                    return;
                }
            }
            if (!_audioSource.loaded) { // at first time (or error occurred)
                trace(_id, "load() at first time");
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
        protected function fadeVolume(volume:Number,
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

        protected function openSound(callback:Function = null):void {
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

        protected function closeSound():void {
            if (_sound) {
                if (!_streamLoaded) { // abort
                    try {
                        _sound.close();
                    } catch(err:Error) {
                        trace(_id, "sound.close() fail." + err);
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

        protected function openSoundChannel(position:Number):void {
            var soundTransform:SoundTransform = new SoundTransform(_volume.current);

            _audioState = AUDIO_STATE_PLAYING;
            _soundChannel = _sound.play(position, 0, soundTransform);
            _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
            _lastPosition = _soundChannel.position;
        }

        protected function closeSoundChannel():Number {
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

                _boss.postMessage("play", _id); // W3C NamedEvent

                closeSoundChannel();
                openSoundChannel(_currentTime);

                _boss.postMessage("playing", _id); // W3C NamedEvent
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
                    _boss.postMessage("seeking", _id); // W3C NamedEvent

                    var soundTransform:SoundTransform = _soundChannel.soundTransform;

                    _soundChannel.stop();
                    _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                    _soundChannel = null;

                    _soundChannel = _sound.play(realPositon, 0, soundTransform);
                    _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);

                    _audioState = AUDIO_STATE_PLAYING;

                    _boss.postMessage("seekend", _id); // W3C NamedEvent
                    _boss.postMessage("playing", _id); // W3C NamedEvent
                }
            }
        }

        public function pause():void {
            if (_streamState === STREAM_STATE_CAN_PLAY &&
                _audioState === AUDIO_STATE_PLAYING) {

                _currentTime = closeSoundChannel(); // keep current position
                _audioState = AUDIO_STATE_PAUSED; // overwrite
                _boss.postMessage("pause", _id); // W3C NamedEvent
            }
        }

        public function stop():void {
            if (_streamState === STREAM_STATE_OPEN ||
                _streamState === STREAM_STATE_CAN_PLAY) {

                if (_audioState !== AUDIO_STATE_STOPPED) {
                    closeSoundChannel();
                    _currentTime = 0;
                    _boss.postMessage("stop", _id); // NOT W3C NamedEvent
                }
            }
        }

        public function close():void {
            fadeVolume(0, function():void {
                closeSoundChannel();
                _currentTime = 0;
                closeSound();
                _boss.postMessage("close", _id); // NOT W3C NamedEvent
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
                volume: _volume.current, // 0~1
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

        public function setMute(unmute:Boolean):void {
            _mute = unmute ? false : true;
            updateVolume(true);
        }

        public function setVolume(volume:Number,
                                  force:Boolean = false):void {
            if (_volume.future !== volume || force) {
                _volume.past = volume;
                _volume.future = volume;
                _volume.current = volume;
                updateVolume(true);
            }
        }

        public function setStartTime(time:Number):void {
            _startTime = time; // ms
        }

        public function setCurrentTime(time:Number):void {
            _currentTime = time; // ms
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
        protected function handleTimer(event:TimerEvent):void {
            if (_streamState === STREAM_STATE_OPEN ||
                _streamState === STREAM_STATE_CAN_PLAY) {

                updateVolume();

                // fire duration change event
                if (_updateDuration) {
                    _updateDuration = false;
                    _boss.postMessage("durationchange", _id); // W3C NamedEvent
                }

                if (_streamState === STREAM_STATE_CAN_PLAY) {
                    // fire timeupdate event
                    if (_soundChannel) {
                        var pos:Number = _soundChannel.position;

                        if (_lastPosition !== pos) {
                            if (_lastPosition + 1000 < pos) { // over 1sec
                                _lastPosition = pos;
                                _boss.postMessage("timeupdate", _id, pos); // W3C NamedEvent
                            }
                        }
                    }
                }
            }
        }

        protected function handleFadeTimer(event:TimerEvent):void {
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

        protected function handleFadeComplete(event:TimerEvent):void {
            var callback:Function;

            _volume.current = _volume.past; // resume volume
            updateVolume(true);

            while (callback = _fadeCompleteCallback.shift()) {
                callback.call(this);
            }
        }

        protected function handleOpen(event:Event):void {
            _streamState = STREAM_STATE_OPEN;
            _boss.postMessage("loadstart", _id); // W3C NamedEvent
        }

        protected function handleComplete(event:Event):void {
            _streamLoaded = true;
            _boss.postMessage("loadend", _id); // NOT W3C NamedEvent
        }

        protected function handleIOError(event:IOErrorEvent):void {
            trace(_id, "handleIOError: " + event);

            _streamState = STREAM_STATE_ERROR;
            _audioSource.loaded = "";
            _boss.postMessage("error", _id); // W3C NamedEvent
        }

        protected function handleProgress(event:ProgressEvent):void {
            if (_streamState === STREAM_STATE_OPEN) {
                _streamState = STREAM_STATE_CAN_PLAY;

                var callback:Function;

                while (callback = _canPlayedCallback.shift()) {
                    callback(true); // openSound(ok:Boolean);
                }
                _boss.postMessage("canplay", _id); // W3C NamedEvent
            }
            var loadTime:Number = event.bytesLoaded / event.bytesTotal;
            _progress = Math.round(100 * loadTime);

            _updateDuration = true;
            _boss.postMessage("progress", _id); // W3C NamedEvent
        }

        protected function handleSoundChannelComplete(event:Event):void {
            _audioState = AUDIO_STATE_STOPPED;

            var pos:Number = 0;

            // update last position
            if (_soundChannel) {
                pos = _lastPosition = _soundChannel.position;
            }
            // update final position
            _boss.postMessage("timeupdate", _id, pos); // W3C NamedEvent
            _boss.postMessage("ended", _id); // W3C NamedEvent

            if (_loop) {
                closeSoundChannel();
                _currentTime = _startTime; // overwirte
                openSoundChannel(_startTime); // rewind
                _boss.postMessage("playing", _id); // W3C NamedEvent
            }
        }

        protected function updateVolume(forceUpdate:Boolean = false):void {
            if (_soundChannel) {
                if (_updateVolume || forceUpdate) {
                    _updateVolume = false;

                    var soundTransform:SoundTransform = _soundChannel.soundTransform;

                    soundTransform.volume = _mute ? 0 : _volume.current;
                    _soundChannel.soundTransform = soundTransform;

                    _boss.postMessage("volumechange", _id); // W3C NamedEvent
                    return;
                }
            }
            if (forceUpdate) {
                _boss.postMessage("volumechange", _id); // W3C NamedEvent
            }
        }
    }
}

