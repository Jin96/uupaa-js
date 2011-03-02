// W3C NamedEvent -> http://www.w3.org/TR/html5/video.html#event-media-timeupdate
package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaVideo extends Sprite {
        public static var MEDIA_STATE_STOPPED:uint   = 0x0;
        public static var MEDIA_STATE_PLAYING:uint   = 0x1;
        public static var MEDIA_STATE_PAUSED:uint    = 0x2;
        public static var STREAM_STATE_CLOSED:uint   = 0x0;
        public static var STREAM_STATE_OPEN:uint     = 0x1;
        public static var STREAM_STATE_CAN_PLAY:uint = 0x2;
//      public static var STREAM_STATE_LOADED:uint   = 0x3;
        public static var STREAM_STATE_ERROR:uint    = 0x4;
        // Identity
        protected var _boss:Media;
        protected var _id:Number = 0;
        // Video
        protected var _netConnection:NetConnection = null;
        protected var _netStream:NetStream = null;
        protected var _video:Video = null;
        protected var _mediaSource:Array = [];  // [videoURL, ...]
        protected var _canPlayCallback:Array = [];

        // Internal Structure
        protected var _messageTimer:Timer = new Timer(200, 0);
        protected var _lastProgress:Number = 0; // 0 ~ 100
        protected var _lastDuration:Number = 0; // 0 ~ 100
        protected var _updateVolume:Boolean = false;
        protected var _updateDuration:Boolean = false;
        // FadeIn/FadeOut
        protected var _fadeDelta:Number = 0.1;
        protected var _fadeSpeed:Number = 32; // msec
        protected var _fadeTimer:Timer = new Timer(_fadeSpeed, 20); // 32msec * 20 = 0.64sec
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
        protected var _currentTime:Number = 0;  // unit: ms

        public function MediaVideo(boss:Media,
                                   id:Number,
                                   videoSource:Array) {
            _boss = boss;
            _id = id;
            _mediaSource = videoSource.concat();

            _messageTimer.addEventListener(TimerEvent.TIMER, handleMessageTimer);
            _messageTimer.start();

            _fadeTimer.addEventListener(TimerEvent.TIMER, handleFadeTimer);
            _fadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, handleFadeComplete);

            // video setting
            _video = new Video(_boss.stage.stageWidth,
                               _boss.stage.stageHeight);
            _video.alpha = 0;
            _video.smoothing = true;
            _boss.stage.addChild(_video);
        }

        protected function handleNetStatus(event:NetStatusEvent):void {
            var fn:Function;

            switch (event.info.code) {
            case "NetConnection.Connect.Success":
                // play() -> NetConnection.connect() -> new NetStream()
                _streamState = STREAM_STATE_OPEN;

                _netStream = new NetStream(_netConnection);
                _netStream.addEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                _netStream.addEventListener(NetStatusEvent.NET_STATUS, handleNetStatus);
                _netStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, handleAsyncError);
                _netStream.client = this;
                _video.attachNetStream(_netStream);
                _netStream.soundTransform =
                        new SoundTransform(_mute ? 0 : _volume.current);
                _netStream.play(_mediaSource[0]); // 1st play() -> pause() -> seek(0)
                break;
            case "NetStream.Play.Start":
                _mediaState = MEDIA_STATE_PLAYING;
                if (_streamState === STREAM_STATE_OPEN) { // 1st play
                    _netStream.pause();
                    _netStream.seek(_currentTime / 1000); // (msec / 1000) -> sec
                    _streamState = STREAM_STATE_CAN_PLAY;
                    _mediaState = MEDIA_STATE_STOPPED;

                    while (fn = _canPlayCallback.shift()) {
                        fn(_id); // callback -> this.playback() -> play
                    }
                }
                break;
            case "NetStream.Play.StreamNotFound":
                _mediaState = MEDIA_STATE_STOPPED;
                _streamState = STREAM_STATE_ERROR;

                trace("Unable to locate video: " + _mediaSource[0]);
            }
        }

        public function onMetaData(data:Object):void {
            trace("onMetaData");
            trace("videodatarate", data.videodatarate);
            trace("canSeekToEnd", data.canSeekToEnd);
            trace("videocodecid", data.videocodecid);
            trace("framerate", data.framerate);
            trace("duration", data.duration);
            trace("height", data.height);
            trace("width", data.width);

            _lastDuration = data.duration || 0;
        }
        public function onXMPData(data:Object):void {
            trace("onXMPData");
        }
        public function onCuePoint(data:Object):void {
            trace("onCuePoint");
        }
        public function onPlayStatus(data:Object):void {
            trace("onPlayStatus");
        }

        protected function handleSecurityError(event:SecurityErrorEvent):void {
            trace("securityErrorHandler: " + event);
            handleError();
        }

        protected function handleAsyncError(event:AsyncErrorEvent):void {
            trace("handleAsyncError: " + event);
            handleError();
        }

        protected function handleIOError(event:IOErrorEvent):void {
            trace(_id, "handleIOError", event + "");
            handleError();
        }

        protected function handleError():void {
            _streamState = STREAM_STATE_ERROR;
            _mediaState = MEDIA_STATE_STOPPED;
            _currentTime = 0;
            try {
                _netStream && _netStream.close();
            } catch(err:Error) {
                trace("handleIOError NetStream.close()", err + "");
            }
            try {
                _netConnection && _netConnection.close();
            } catch(err:Error) {
                trace("handleIOError NetConnection.close()", err + "");
            }
            _boss.postMessage("error", _id); // W3C NamedEvent
        }

        public function playback():void {
            _boss.postMessage("play", _id); // W3C NamedEvent
            _netStream.soundTransform =
                    new SoundTransform(_mute ? 0 : _volume.current);
            _netStream.play(_mediaSource[0]);
            _boss.postMessage("playing", _id); // W3C NamedEvent
        }

        public function play(callback:Function = null):void {
            switch (_streamState) {
            case STREAM_STATE_CLOSED:
                _mediaState = MEDIA_STATE_STOPPED;
                _currentTime = _startTime;
                callback && _canPlayCallback.push(callback);

                // show poster image
                // move to top layer
                _boss.stage.setChildIndex(_video, _boss.stage.numChildren - 1);

                // fadein
                _video.alpha = 0;

                var i:int = 0;
                var timerID:Number = setInterval(function():void {

                    var alpha:Number = _video.alpha;

                    alpha += _fadeDelta;
                    if (alpha >= 1) {
                        alpha = 1;
                        clearInterval(timerID);
                    }
                    _video.alpha = alpha;
                }, 40);

                _netConnection = new NetConnection();
                _netConnection.addEventListener(NetStatusEvent.NET_STATUS, handleNetStatus);
                _netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, handleSecurityError);
                _netConnection.connect(null); // -> STREAM_STATE_OPEN
                break;
            case STREAM_STATE_CAN_PLAY:
                switch (_mediaState) {
                case MEDIA_STATE_STOPPED:
                    _boss.postMessage("play", _id); // W3C NamedEvent

                    if (_currentTime !== _netStream.time * 1000) { // msec !== sec * 1000
                        _netStream.seek(_currentTime / 1000); // (msec / 1000) -> sec
                    }
                    _netStream.soundTransform =
                            new SoundTransform(_mute ? 0 : _volume.current);
                    _netStream.play(_mediaSource[0]);
                    _boss.postMessage("playing", _id); // W3C NamedEvent
                    break;
                case MEDIA_STATE_PAUSED:
                    if (_currentTime !== _netStream.time * 1000) { // msec !== sec * 1000
                        _netStream.seek(_currentTime / 1000); // (msec / 1000) -> sec
                        _netStream.togglePause();

                        _boss.postMessage("play", _id); // W3C NamedEvent
                        _mediaState = MEDIA_STATE_PLAYING;
                        _boss.postMessage("playing", _id); // W3C NamedEvent
                    } else {
                        _boss.postMessage("play", _id); // W3C NamedEvent
                        _mediaState = MEDIA_STATE_PLAYING;
                        _netStream.resume();
                        _boss.postMessage("playing", _id); // W3C NamedEvent
                    }
                }
            }
        }

        public function seek(position:Number):void { // @param Number: 0~100
            // map 0~100 to 0~duration
            var realPositon:Number = ((position * _lastDuration) / 100) * 1000; // ((0~100) * sec) / 100

            switch (_mediaState) {
            case MEDIA_STATE_STOPPED: // stopped + seek
            case MEDIA_STATE_PAUSED:
                _currentTime = realPositon;
                break;
            case MEDIA_STATE_PLAYING:
                _boss.postMessage("seeking", _id); // W3C NamedEvent

                _netStream.seek(realPositon / 1000); // (msec / 1000) -> sec

                _boss.postMessage("seekend", _id); // W3C NamedEvent
                _boss.postMessage("playing", _id); // W3C NamedEvent
            }
        }

        public function pause():void {
            if (_mediaState === MEDIA_STATE_PLAYING) {
                _netStream.pause();
                _currentTime = _netStream.time * 1000; // sec -> msec

                _mediaState = MEDIA_STATE_PAUSED;
                _boss.postMessage("pause", _id); // W3C NamedEvent
            }
        }

        public function stop():void {
            if (_mediaState === MEDIA_STATE_PLAYING) {
                _netStream.pause();
                _currentTime = _startTime; // rewind (msec)

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

            alpha = _video.alpha;
            if (alpha) {
                alpha -= _fadeDelta;
                _video.alpha = alpha < 0 ? 0 : alpha;
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
            if (_streamState !== STREAM_STATE_CLOSED) {
                // OPEN, CAN_PLAY, LOADED, ERROR
                _video.alpha = 0;
                _video.clear();
                _video.attachNetStream(null); // detach
                if (_netStream) {
                    _netStream.removeEventListener(IOErrorEvent.IO_ERROR, handleIOError);
                    _netStream.removeEventListener(NetStatusEvent.NET_STATUS, handleNetStatus);
                    _netStream.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, handleAsyncError);
                    _netStream.close();
                    _netStream = null;
                }
                if (_netConnection) {
                    _netConnection.removeEventListener(NetStatusEvent.NET_STATUS, handleNetStatus);
                    _netConnection.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, handleSecurityError);
                    _netConnection.close();
                    _netConnection = null;
                }
            }
            _mediaState = MEDIA_STATE_STOPPED;
            _streamState = STREAM_STATE_CLOSED;
            _currentTime = _startTime; // rewind
            _boss.postMessage("close", _id); // NOT W3C NamedEvent
        }

        public function getState():Object { // @return Hash: { loop, volume, duration,
                                            //                 startTime, currentTime,
                                            //                 audioSource, videoSource, imageSource,
                                            //                 audioState, videoState, imageState, streamState }
            var duration:Number = _lastDuration,
                currentTime:Number = 0;

            currentTime = _mediaState === MEDIA_STATE_PLAYING ? _netStream.time
                        : _mediaState === MEDIA_STATE_PAUSED  ? _netStream.time
                        : _mediaState === MEDIA_STATE_STOPPED ? _currentTime
                        : 0;
            return {
                id: _id,
                name: "MediaVideo",
                loop: _loop,
                mute: _mute,
                volume: _volume.current, // 0~1
                duration: duration,
                progress: _lastProgress,
                position: duration ? Math.round(currentTime / duration * 100) : 0, // 0~100
                startTime: _startTime, // ms
                currentTime: currentTime, // ms
                mediaState: [_mediaState],
                mediaSource: _mediaSource,
                streamState: [_streamState],
                imageSource: [],
                imageState: _video && _video.alpha > 0 ? 1 : 0
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
            _startTime = time / 1000; // ms -> sec
        }

        public function setCurrentTime(time:Number):void {
            _currentTime = time / 1000; // ms -> sec
        }

        // ---------------------------------------
        protected function handleMessageTimer(event:TimerEvent):void {
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
                    if (_mediaState === MEDIA_STATE_PLAYING) {
                        var position:Number = _netStream.time;

                        _boss.postMessage("timeupdate", _id, position); // W3C NamedEvent
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

        protected function updateVolume(forceUpdate:Boolean = false):void {
            if (_updateVolume || forceUpdate) {
                _updateVolume = false;

                if (_netStream) {
                    _netStream.soundTransform =
                            new SoundTransform(_mute ? 0 : _volume.current);
                }
                forceUpdate = true;
            }
            if (forceUpdate) {
                _boss.postMessage("volumechange", _id); // W3C NamedEvent
            }
        }
    }
}

