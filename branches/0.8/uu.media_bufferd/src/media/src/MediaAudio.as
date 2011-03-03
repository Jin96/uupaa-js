// W3C NamedEvent -> http://www.w3.org/TR/html5/video.html#event-media-timeupdate
package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudio extends Sprite {
        public static var MEDIA_STATE_STOPPED:uint   = 0x0;
        public static var MEDIA_STATE_PLAYING:uint   = 0x1;
        public static var MEDIA_STATE_PAUSED:uint    = 0x2;
        public static var STREAM_STATE_CLOSED:uint   = 0x0;
        public static var STREAM_STATE_OPEN:uint     = 0x1;
        public static var STREAM_STATE_BUFFERING:uint= 0x2;
        public static var STREAM_STATE_CAN_PLAY:uint = 0x3;
        public static var STREAM_STATE_LOADED:uint   = 0x4;
        public static var STREAM_STATE_ERROR:uint    = 0x5;
        // Identity
        protected var _boss:Media;
        protected var _id:Number = 0;
        // Media
        protected var _media:Sound = null;
        protected var _mediaSource:String = "";
        protected var _soundChannel:SoundChannel = null;
        protected var _canPlayCallback:Array = [];
        // Poster
        protected var _poster:String = "";
        protected var _sprite:Sprite = null;
        // Internal Structure
        protected var _messageTimer:Timer = new Timer(200, 0);
        protected var _updateVolume:Boolean = false;
        protected var _buffringProgress:Number = 0.0001; // unit: %, 0.01 = 1%
        protected var _duration:Number = 0; // unit: ms
        protected var _position:Number = 0; // unit: ms, last position
        protected var _progress:Number = 0; // 0 ~ 1 (dataLoadedByte / dataTotalByte)
        // FadeIn/FadeOut
        protected var _fadeDelta:Number = 0.1;
        protected var _fadeSpeed:Number = 32; // ms
        protected var _fadeTimer:Timer = new Timer(_fadeSpeed, 20); // 32ms * 20 = 0.64sec
        protected var _fadeStepCallback:Array = [];
        protected var _fadeCompleteCallback:Array = [];
        // State
        protected var _mediaState:uint = MEDIA_STATE_STOPPED;
        protected var _streamState:uint = STREAM_STATE_CLOSED;
        protected var _loop:Boolean = false;
        protected var _mute:Boolean = false;
        protected var _volume:Object = { current: 1,   // 0~1
                                         future:  1,   // 0~1
                                         past:    1 }; // 0~1
        protected var _startTime:Number = 0;    // unit: ms
        protected var _currentTime:Number = 0;  // unit: ms, 1000 -> 1sec

        public function MediaAudio(boss:Media,
                                   id:Number,
                                   media:Array,
                                   poster:String = "") {
            _boss = boss;
            _id = id;
            _mediaSource = media[0];
            _duration = (media[1] || 0) * 1000; // sec -> ms;
            _poster = poster;

            trace("MediaAudio", _id, _mediaSource, _duration, _poster);

            _messageTimer.addEventListener(TimerEvent.TIMER, handleMessageTimer);
            _messageTimer.start();

            _fadeTimer.addEventListener(TimerEvent.TIMER, handleFadeTimer);
            _fadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, handleFadeComplete);

            if (_poster) {
                _sprite = new Sprite();
                _sprite.alpha = 0;
                boss.stage.addChild(_sprite);

                var loader:Loader = new Loader();

                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleImageLoadComplete);
                loader.load(new URLRequest(_poster));
            }
        }

        protected function handleImageLoadComplete(event:Event):void {
            _sprite.addChild(event.target.loader);
        }

        public function openSoundChannel(position:Number):void {
            _soundChannel = _media.play(position, 0,
                                        new SoundTransform(getContextualVolume()));
            _position = _soundChannel.position;
            _mediaState = MEDIA_STATE_PLAYING;
            _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
        }

        public function closeSoundChannel():Number {
            var rv:Number = _currentTime;

            if (_mediaState === MEDIA_STATE_PLAYING) {
                rv = _soundChannel.position; // unit: ms

                _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                _soundChannel.stop();
                _soundChannel = null;
            }
            _mediaState = MEDIA_STATE_STOPPED;
            return rv;
        }

        public function playback():void {
            trace("MediaAudio::playback()", _streamState, _mediaState);

            openSoundChannel(_currentTime);
//            _boss.postMessage("play", _id); // W3C NamedEvent
//            _boss.postMessage("playing", _id); // W3C NamedEvent
        }

        public function play(callback:Function = null):void {
            trace("MediaAudio::play()", _streamState, _mediaState);

            switch (_streamState) {
            case STREAM_STATE_CLOSED:
                _mediaState = MEDIA_STATE_STOPPED;
                _currentTime = _startTime;
                callback && _canPlayCallback.push(callback);

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
                _media = new Sound();
                _media.addEventListener(Event.OPEN, handleOpen);
                _media.addEventListener(Event.COMPLETE, handleComplete);
                _media.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                _media.addEventListener(ProgressEvent.PROGRESS, handleProgress);
                _media.load(new URLRequest(_mediaSource));
                trace("MediaAudio::play() Sound.load", _mediaSource);
                break;
            case STREAM_STATE_OPEN:
                callback && _canPlayCallback.push(callback);
                break;
            case STREAM_STATE_CAN_PLAY:
            case STREAM_STATE_LOADED:
                switch (_mediaState) {
                case MEDIA_STATE_STOPPED:
                case MEDIA_STATE_PAUSED:
                    openSoundChannel(_currentTime);
//                    _boss.postMessage("play", _id); // W3C NamedEvent
//                    _boss.postMessage("playing", _id); // W3C NamedEvent
                }
            }
        }

        public function seek(position:Number):void { // @param Number: 0~100
            trace("MediaAudio::seek()", _streamState, _mediaState, position);

            if (_media) {
                var realPositon:Number;

                // map 0~100 to 0~duration
                realPositon = position * _duration / 100; // 50 * 22.44 / 100

                switch (_mediaState) {
                case MEDIA_STATE_STOPPED: // stopped + seek
                case MEDIA_STATE_PAUSED:  // paused + seek
                    _currentTime = realPositon;
                    _position = realPositon;
                    break;
                case MEDIA_STATE_PLAYING:
                    try {
                        _boss.postMessage("seeking", _id); // W3C NamedEvent

                        if (_soundChannel) {
                            _soundChannel.removeEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                            _soundChannel.stop();
                            _soundChannel = null;
                        }
                        _soundChannel = _media.play(realPositon, 0,
                                                    new SoundTransform(getContextualVolume()));
                        _soundChannel.addEventListener(Event.SOUND_COMPLETE, handleSoundChannelComplete);
                        _position = realPositon;
                        _mediaState = MEDIA_STATE_PLAYING;

                        _boss.postMessage("seekend", _id); // W3C NamedEvent
//                        _boss.postMessage("playing", _id); // W3C NamedEvent
                    } catch(err:Error) {
                        // maybe: net disconnected / connection reset
                        trace("MediaAudio.seek", err);
                        _mediaState = MEDIA_STATE_STOPPED;
                        _streamState = STREAM_STATE_ERROR;
                        _currentTime = 0;
                        _position = 0;
                    }
                }
            }
        }

        public function pause():void {
            if (_mediaState === MEDIA_STATE_PLAYING) {
                _currentTime = closeSoundChannel(); // keep current position

                _mediaState = MEDIA_STATE_PAUSED; // STOPPED -> PAUSED
                _boss.postMessage("pause", _id); // W3C NamedEvent
            }
        }

        public function stop():void {
            if (_mediaState === MEDIA_STATE_PLAYING) {
                closeSoundChannel();
                _currentTime = _startTime; // rewind (ms)

                _mediaState = MEDIA_STATE_STOPPED;
                _boss.postMessage("stop", _id); // NOT W3C NamedEvent
            }
        }

        public function close():void {
            fadeVolume(0, handleFadeStepCallback,
                          handleFadeCompleteCallback);
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
                if (_media) {
                    try {
                        // hide poster image
                        if (_sprite) {
                            _sprite.alpha = 0;
                        }
                        if (_streamState !== STREAM_STATE_LOADED) {
                            // OPEN, CAN_PLAY, ERROR
                            _media.close();
                        }
                    } catch(err:Error) {
                        trace(_id, "sound.close() fail.", err + "");
                    }
                    _media.removeEventListener(Event.OPEN, handleOpen);
                    _media.removeEventListener(Event.COMPLETE, handleComplete);
                    _media.removeEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                    _media.removeEventListener(ProgressEvent.PROGRESS, handleProgress);
                    _media = null;
                }
                _streamState = STREAM_STATE_CLOSED;
            }
            _boss.postMessage("close", _id); // NOT W3C NamedEvent
        }

        public function getState():Object { // @return Hash: { loop, volume, duration,
                                            //                 startTime, currentTime,
                                            //                 audioSource, videoSource, imageSource,
                                            //                 audioState, videoState, imageState, streamState }
            var currentTime:Number = 0;

            currentTime = _mediaState === MEDIA_STATE_PLAYING ? _soundChannel.position
                        : _mediaState === MEDIA_STATE_PAUSED  ? _currentTime
                        : _mediaState === MEDIA_STATE_STOPPED ? _currentTime
                        : 0;
            return {
                id: _id,
                name: "MediaAudio",
                loop: _loop,
                mute: _mute,
                volume: _volume.current, // 0~1
                duration: _duration,
                progress: _progress, // 0~1
                position: _duration ? Math.round(currentTime / _duration * 100) : 0, // 0~100
                startTime: _startTime, // ms
                currentTime: currentTime, // ms
                mediaState: [_mediaState],
                mediaSource: _mediaSource,
                streamState: [_streamState],
                imageSource: [],
                imageState: _sprite && _sprite.alpha > 0 ? 1 : 0
            };
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
                _streamState === STREAM_STATE_BUFFERING ||
                _streamState === STREAM_STATE_CAN_PLAY ||
                _streamState === STREAM_STATE_LOADED) {

                updateVolume();

                if (_streamState === STREAM_STATE_CAN_PLAY ||
                    _streamState === STREAM_STATE_LOADED) {
                    // fire timeupdate event
                    if (_mediaState === MEDIA_STATE_PLAYING) {
                        var position:Number = _soundChannel.position;

                        if (_position !== position) {
                            if (_position + 1000 < position) { // over 1sec
                                _position = position;
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
            _mediaState = MEDIA_STATE_STOPPED;
            _currentTime = 0;
            try {
                _soundChannel && _soundChannel.stop();
            } catch(err:Error) {
                trace("handleIOError SoundChannel.stop()", err + "");
            }
            try {
                _media && _media.close();
            } catch(err:Error) {
                trace("handleIOError Sound.close()", err + "");
            }
            _boss.postMessage("error", _id); // W3C NamedEvent
        }

        // data load progress
        protected function handleProgress(event:ProgressEvent):void {
/*
            trace("MediaAudio::handleProgress()", _streamState, _mediaState,
                                                  event.bytesLoaded, event.bytesTotal,
                                                  _buffringProgress);
 */

            _progress = event.bytesLoaded / event.bytesTotal; // 0 ~ 1
            trace("MediaAudio::handleProgress()", "_progress", _progress);

            // OPEN -> BUFFERING
            if (_streamState === STREAM_STATE_OPEN) {
                trace("MediaAudio::handleProgress()", "OPEN -> BUFFERING");

                _streamState = STREAM_STATE_BUFFERING;

// TEST!! AUDIO NO BUFFRGING

                    trace("MediaAudio::handleProgress()", "BUFFERING -> CAN_PLAY");

                    _currentTime = _startTime;
                    if (_soundChannel) {
                        _soundChannel.removeEventListener(Event.SOUND_COMPLETE,
                                                          handleSoundChannelComplete);
                        _soundChannel.stop();
                        _soundChannel = null;
                    }
                    _streamState = STREAM_STATE_CAN_PLAY;
                    _mediaState = MEDIA_STATE_STOPPED;

                    _boss.postMessage("canplay", _id); // W3C NamedEvent
                    var fn:Function;

                    while (fn = _canPlayCallback.shift()) {
                        fn(_id);
                    }


            } else if (_streamState === STREAM_STATE_BUFFERING) {
/*
                trace("MediaAudio::handleProgress()", "BUFFERING...");

                // BUFFERING 3% -> CAN_PLAY
                if (_progress >= _buffringProgress) {
                    trace("MediaAudio::handleProgress()", "BUFFERING -> CAN_PLAY");

                    _currentTime = _startTime;
                    if (_soundChannel) {
                        _soundChannel.removeEventListener(Event.SOUND_COMPLETE,
                                                          handleSoundChannelComplete);
                        _soundChannel.stop();
                        _soundChannel = null;
                    }
                    _streamState = STREAM_STATE_CAN_PLAY;
                    _mediaState = MEDIA_STATE_STOPPED;

                    _boss.postMessage("canplay", _id); // W3C NamedEvent
                    var fn:Function;

                    while (fn = _canPlayCallback.shift()) {
                        fn(_id);
                    }
                }
 */
            }
            _boss.postMessage("progress", _id); // W3C NamedEvent
        }

        protected function handleSoundChannelComplete(event:Event):void {
            _mediaState = MEDIA_STATE_STOPPED;

            var position:Number = _soundChannel ? _soundChannel.position : 0;

            // update last position
            _position = position;

            _boss.postMessage("timeupdate", _id, position); // W3C NamedEvent
            _boss.postMessage("ended", _id); // W3C NamedEvent
            if (_loop) {
                closeSoundChannel();
                _currentTime = _startTime; // overwirte
                openSoundChannel(_startTime); // rewind
//                _boss.postMessage("play", _id); // W3C NamedEvent
//                _boss.postMessage("playing", _id); // W3C NamedEvent
            }
        }

        protected function updateVolume(forceUpdate:Boolean = false):void {
            if (_updateVolume || forceUpdate) {
                _updateVolume = false;

                if (_soundChannel) {
                    _soundChannel.soundTransform =
                            new SoundTransform(getContextualVolume());
                }
                forceUpdate = true;
            }
            if (forceUpdate) {
                _boss.postMessage("volumechange", _id); // W3C NamedEvent
            }
        }

        protected function getContextualVolume():Number {
            var rv:Number = _mute ? 0 : _volume.current;

            switch (_streamState) {
            case STREAM_STATE_CLOSED:
            case STREAM_STATE_OPEN:
            case STREAM_STATE_BUFFERING:
            case STREAM_STATE_ERROR:
                rv = 0; // force mute
            }
            return rv;
        }

        public function isBusy():Boolean {
            return _streamState === STREAM_STATE_BUFFERING;
        }
    }
}

