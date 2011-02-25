// W3C NamedEvent -> http://www.w3.org/TR/html5/video.html#event-media-timeupdate
package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudio extends Sprite {
        public static var AUDIO_STATE_STOPPED:uint   = 0x0;
        public static var AUDIO_STATE_PLAYING:uint   = 0x1;
        public static var AUDIO_STATE_PAUSED:uint    = 0x2;
        public static var STREAM_STATE_CLOSED:uint   = 0x0;
        public static var STREAM_STATE_OPEN:uint     = 0x1;
        public static var STREAM_STATE_CAN_PLAY:uint = 0x2;
        public static var STREAM_STATE_LOADED:uint   = 0x3;
        public static var STREAM_STATE_ERROR:uint    = 0x4;
        // Identity
        protected var _boss:Media;
        protected var _id:Number = 0;
        // Audio
        protected var _sound:Sound = null;
        protected var _soundChannel:SoundChannel = null;
        protected var _audioSource:Array = [];  // [audioURL, ...]
        // Image
        protected var _imageSource:Array = [];  // [imageURL, ...]
        protected var _imageLoader:Array = [];  // [Loadedr, ...]
        protected var _sprite:Sprite = null;
        // Internal Structure
        protected var _messageTimer:Timer = new Timer(200, 0);
        protected var _lastPosition:Number = 0; // unit: ms
        protected var _lastProgress:Number = 0; // 0 ~ 100
        protected var _updateVolume:Boolean = false;
        protected var _updateDuration:Boolean = false;
        protected var _autoLoad:Boolean = false;
        // FadeIn/FadeOut
        protected var _fadeDelta:Number = 0.1;
        protected var _fadeSpeed:Number = 32; // msec
        protected var _fadeTimer:Timer = new Timer(_fadeSpeed, 20); // 32msec * 20 = 0.64sec
        protected var _fadeStepCallback:Array = [];
        protected var _fadeCompleteCallback:Array = [];
        // State
        protected var _audioState:uint = AUDIO_STATE_STOPPED;
        protected var _streamState:uint = STREAM_STATE_CLOSED;
        protected var _loop:Boolean = false;
        protected var _mute:Boolean = false;
        protected var _volume:Object = { current: 1,   // 0~1
                                         future:  1,   // 0~1
                                         past:    1 }; // 0~1
        protected var _startTime:Number = 0;    // unit: ms
        protected var _currentTime:Number = 0;  // unit: ms

        public function MediaAudio(boss:Media,
                                   id:Number,
                                   audioSource:Array,
                                   imageSource:Array) {
            _boss = boss;
            _id = id;
            _audioSource = audioSource.concat();
            _imageSource = imageSource.concat();

            _messageTimer.addEventListener(TimerEvent.TIMER, handleMessageTimer);
            _messageTimer.start();

            _fadeTimer.addEventListener(TimerEvent.TIMER, handleFadeTimer);
            _fadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, handleFadeComplete);

            // image container
            if (_imageSource.length) {
                _sprite = new Sprite();
                _sprite.alpha = 0;
                boss.stage.addChild(_sprite);

                imageLoader();
            }
        }

        protected function imageLoader():void {
            var that:* = this;

            // load images
            _imageSource.forEach(function(url:String, index:int, ary:Array):void {
                trace("MediaAudio", url);

                var loader:Loader = new Loader();

                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleImageLoadComplete);
                loader.load(new URLRequest(url));

                that._imageLoader.push(loader);
            });
        }

        protected function handleImageLoadComplete(event:Event):void {
            _sprite.addChild(event.target.loader);
        }

        // fadein/fadeout volume
        protected function fadeVolume(volume:Number,
                                      stepCallback:Function,
                                      completeCallback:Function):void {
            _volume.past = _volume.current; // save
            _volume.future = volume;

            stepCallback && _fadeStepCallback.push(stepCallback);
            completeCallback && _fadeCompleteCallback.push(completeCallback);
            _fadeTimer.reset();
            _fadeTimer.start();
        }

        public function openSoundChannel(position:Number):void {
            _boss.postMessage("play", _id); // W3C NamedEvent

            _soundChannel = _sound.play(position, 0,
                                        new SoundTransform(_mute ? 0 : _volume.current));
            _lastPosition = _soundChannel.position;
            _audioState   = AUDIO_STATE_PLAYING;
            _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);

            _boss.postMessage("playing", _id); // W3C NamedEvent
        }

        public function closeSoundChannel():Number {
            var rv:Number = _currentTime;

            if (_audioState === AUDIO_STATE_PLAYING) {
                rv = _soundChannel.position; // unit: ms

                _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                _soundChannel.stop();
                _soundChannel = null;
            }
            _audioState = AUDIO_STATE_STOPPED;
            return rv;
        }

        public function play(autoLoad:Boolean = true):void {
            switch (_streamState) {
            case STREAM_STATE_CLOSED:
                _audioState = AUDIO_STATE_STOPPED;
                _currentTime = _startTime;
                autoLoad && (_autoLoad = true);

                // show poster image
                if (_sprite) {
                    // move to top layer
                    _boss.stage.setChildIndex(_sprite, _boss.stage.numChildren - 1);

                    // fadein
                    _sprite.alpha = 0;

                    var i:int = 0;
                    var timerID:Number = setInterval(function():void {

                        var alpha:Number = _sprite.alpha;

                        alpha += _fadeDelta;
                        if (alpha >= 1) {
                            alpha = 1;
                            clearInterval(timerID);
                        }
                        _sprite.alpha = alpha;
                    }, 40);
                }
                _sound = new Sound();
                _sound.addEventListener(Event.OPEN, handleOpen);
                _sound.addEventListener(Event.COMPLETE, handleComplete);
                _sound.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                _sound.addEventListener(ProgressEvent.PROGRESS, handleProgress);
                _sound.load(new URLRequest(_audioSource[0]));
            case STREAM_STATE_OPEN:
                autoLoad && (_autoLoad = true);
                break;
            case STREAM_STATE_CAN_PLAY:
            case STREAM_STATE_LOADED:
                switch (_audioState) {
                case AUDIO_STATE_STOPPED:
                case AUDIO_STATE_PAUSED:
                    openSoundChannel(_currentTime);
                }
            }
        }

        public function seek(position:Number):void { // @param Number: 0~100
            if (_sound) {
                // map 0~100 to 0~duration
                var realPositon:Number = position * _sound.length / 100;

                switch (_audioState) {
                case AUDIO_STATE_STOPPED: // stopped + seek
                    _currentTime = realPositon;
                    break;
                case AUDIO_STATE_PLAYING:
                case AUDIO_STATE_PAUSED:
                    try {
                        _boss.postMessage("seeking", _id); // W3C NamedEvent

                        var soundTransform:SoundTransform = _soundChannel.soundTransform;

                        _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                        _soundChannel.stop();
                        _soundChannel = null;
                        _soundChannel = _sound.play(realPositon, 0, soundTransform);
                        _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);

                        _audioState = AUDIO_STATE_PLAYING;

                        _boss.postMessage("seekend", _id); // W3C NamedEvent
                        _boss.postMessage("playing", _id); // W3C NamedEvent
                    } catch(err:Error) {
                        // maybe: net disconnected / connection reset
                        trace("seek", err);
                        _audioState = AUDIO_STATE_STOPPED;
                        _streamState = STREAM_STATE_ERROR;
                    }
                }
            }
        }

        public function pause():void {
            if (_audioState === AUDIO_STATE_PLAYING) {
                _currentTime = closeSoundChannel(); // keep current position
                _audioState = AUDIO_STATE_PAUSED; // STOPPED -> PAUSED
                _boss.postMessage("pause", _id); // W3C NamedEvent
            }
        }

        public function stop():void {
            if (_audioState === AUDIO_STATE_PLAYING) {
                closeSoundChannel();
                _currentTime = _startTime; // rewind
                _boss.postMessage("stop", _id); // NOT W3C NamedEvent
            }
        }

        public function close():void {
            fadeVolume(0, handleFadeStepCallback,
                          handleFadeCompleteCallback);
        }

        protected function handleFadeStepCallback():void {
            var alpha:Number;

            if (_sprite) {
                alpha = _sprite.alpha;
                if (alpha) {
                    alpha -= _fadeDelta;
                    _sprite.alpha = alpha < 0 ? 0 : alpha;
                }
            }
            if (_volume.current !== _volume.future) {
                if (_volume.current > _volume.future) {
                    _volume.current -= _fadeDelta;
                    if (_volume.current < _volume.future) {
                        _volume.current = _volume.future;
                    }
                } else {
                    _volume.current += _fadeDelta;
                    if (_volume.current > _volume.future) {
                        _volume.current = _volume.future;
                    }
                }
                updateVolume(true);
            }
        }

        protected function handleFadeCompleteCallback():void {
            closeSoundChannel();
            _currentTime = _startTime; // rewind

            if (_streamState !== STREAM_STATE_CLOSED) {
                // OPEN, CAN_PLAY, LOADED, ERROR
                if (_sound) {
                    try {
                        // hide poster image
                        if (_sprite) {
                            _sprite.alpha = 0;
                        }
                        if (_streamState !== STREAM_STATE_LOADED) {
                            // OPEN, CAN_PLAY, ERROR
                            _sound.close();
                        }
                    } catch(err:Error) {
                        trace(_id, "sound.close() fail.", err + "");
                    }
                    _sound.removeEventListener(Event.OPEN, handleOpen);
                    _sound.removeEventListener(Event.COMPLETE, handleComplete);
                    _sound.removeEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                    _sound.removeEventListener(ProgressEvent.PROGRESS, handleProgress);
                    _sound = null;
                }
                _streamState = STREAM_STATE_CLOSED;
            }
            _boss.postMessage("close", _id); // NOT W3C NamedEvent
        }

        public function getState():Object { // @return Hash: { loop, volume, duration,
                                            //                 startTime, currentTime,
                                            //                 audioSource, videoSource, imageSource,
                                            //                 audioState, videoState, imageState, streamState }
            var duration:Number = _sound ? _sound.length : 0,
                currentTime:Number = 0;

            currentTime = _audioState === AUDIO_STATE_PLAYING ? _soundChannel.position
                        : _audioState === AUDIO_STATE_PAUSED  ? _currentTime
                        : 0;
            return {
                loop: _loop,
                mute: _mute,
                volume: _volume.current, // 0~1
                duration: duration,
                progress: _lastProgress,
                position: duration ? Math.round(currentTime / duration * 100) : 0, // 0~100
                startTime: _startTime, // ms
                currentTime: currentTime, // ms
                audioSource: _audioSource.join(","),
                videoSource: "",
                imageSource: "",
                audioState: _audioState,
                videoState: 0,
                imageState: 0,
                streamState: _streamState
            };
        }

        public function getAudioState():uint {
            return _audioState;
        }

        public function getStreamState():uint {
            return _streamState;
        }

        public function setLoop(loop:Boolean):void {
            _loop = loop;
        }

        public function setMute(mute:Boolean):void {
            _mute = mute;
            updateVolume(true);
        }

        public function setVolume(volume:Number,
                                  force:Boolean = false):void {
            if (force || _volume.future !== volume) {
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

        // ---------------------------------------
        protected function handleMessageTimer(event:TimerEvent):void {
            if (_streamState === STREAM_STATE_OPEN ||
                _streamState === STREAM_STATE_CAN_PLAY ||
                _streamState === STREAM_STATE_LOADED) {

                updateVolume();

                // fire duration change event
                if (_updateDuration) {
                    _updateDuration = false;
                    _boss.postMessage("durationchange", _id); // W3C NamedEvent
                }

                if (_streamState === STREAM_STATE_CAN_PLAY ||
                    _streamState === STREAM_STATE_LOADED) {
                    // fire timeupdate event
                    if (_audioState === AUDIO_STATE_PLAYING) {
                        var position:Number = _soundChannel.position;

                        if (_lastPosition !== position) {
                            if (_lastPosition + 1000 < position) { // over 1sec
                                _lastPosition = position;
                                _boss.postMessage("timeupdate", _id, position); // W3C NamedEvent
                            }
                        }
                    }
                }
            }
        }

        protected function handleFadeTimer(event:TimerEvent):void {
            var callback:Function,
                i:int = 0, iz:int = _fadeStepCallback.length;

            for (; i < iz; ++i) {
                _fadeStepCallback[i].call(this);
            }
        }

        protected function handleFadeComplete(event:TimerEvent):void {
            var callback:Function;

            _volume.current = _volume.past; // resume volume
            updateVolume(true);

            _fadeStepCallback = []; // clear
            while (callback = _fadeCompleteCallback.shift()) {
                callback.call(this);
            }
        }

        protected function handleOpen(event:Event):void {
            _streamState = STREAM_STATE_OPEN;
            _boss.postMessage("loadstart", _id); // W3C NamedEvent
        }

        protected function handleComplete(event:Event):void {
            _streamState = STREAM_STATE_LOADED;
            _boss.postMessage("loadend", _id); // NOT W3C NamedEvent
        }

        protected function handleIOError(event:IOErrorEvent):void {
            trace(_id, "handleIOError", event + "");

            _streamState = STREAM_STATE_ERROR;
            _audioState = AUDIO_STATE_STOPPED;
            _autoLoad = false;
            _currentTime = 0;
            try {
                _soundChannel && _soundChannel.stop();
            } catch(err:Error) {
                trace("handleIOError SoundChannel.stop()", err + "");
            }
            try {
                _sound && _sound.close();
            } catch(err:Error) {
                trace("handleIOError Sound.close()", err + "");
            }
            _boss.postMessage("error", _id); // W3C NamedEvent
        }

        protected function handleProgress(event:ProgressEvent):void {
            if (_streamState === STREAM_STATE_OPEN) {
                _streamState = STREAM_STATE_CAN_PLAY;

                _boss.postMessage("canplay", _id); // W3C NamedEvent
                if (_autoLoad) {
                    _autoLoad = false;
                    openSoundChannel(_currentTime);
                }
            }
            var loadTime:Number = event.bytesLoaded / event.bytesTotal;
            _lastProgress = Math.round(100 * loadTime);

            _updateDuration = true;
            _boss.postMessage("progress", _id); // W3C NamedEvent
        }

        protected function handleSoundChannelComplete(event:Event):void {
            _audioState = AUDIO_STATE_STOPPED;

            var position:Number = _soundChannel.position;

            // update last position
            _lastPosition = position;

            _boss.postMessage("timeupdate", _id, position); // W3C NamedEvent
            _boss.postMessage("ended", _id); // W3C NamedEvent
            if (_loop) {
                closeSoundChannel();
                _currentTime = _startTime; // overwirte
                openSoundChannel(_startTime); // rewind
                _boss.postMessage("playing", _id); // W3C NamedEvent
            }
        }

        protected function updateVolume(forceUpdate:Boolean = false):void {
            if (_audioState === AUDIO_STATE_PLAYING) {
                if (_updateVolume || forceUpdate) {
                    _updateVolume = false;

                    var soundTransform:SoundTransform = _soundChannel.soundTransform;

                    soundTransform.volume = _mute ? 0 : _volume.current;
                    _soundChannel.soundTransform = soundTransform;
                    forceUpdate = true;
                }
            }
            if (forceUpdate) {
                _boss.postMessage("volumechange", _id); // W3C NamedEvent
            }
        }
    }
}

