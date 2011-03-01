package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudioVideo {
        public static var MEDIA_STATE_STOPPED:uint   = 0x0;
        public static var MEDIA_STATE_PLAYING:uint   = 0x1;
        public static var MEDIA_STATE_PAUSED:uint    = 0x2;
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
        protected var _mediaSource:Array = [];      // [audio, video]
        protected var _media1:MediaAudio = null;    // front audio
        protected var _media2:MediaVideo = null;    // rear video
        // Image
        protected var _imageSource:Array = [];      // [imageURL, ...]

        public function MediaAudioVideo(boss:Media,
                                        id:Number,
                                        audioSource:Array,
                                        videoSource:Array,
                                        imageSource:Array = null) {
            _boss = boss;
            _id = id;
            _mediaSource = [audioSource[0], videoSource[0]];
            _imageSource = imageSource ? imageSource.concat() : [];

            _media1 = new MediaAudio(boss, _id, [audioSource[0]], []);
            _media2 = new MediaVideo(boss,   0, [videoSource[0]]);
        }

        public function play(dummyCallback:Function = null):void {
trace("MediaAudioVideo.in");
            var state1:Object = _media1.getState(),
                state2:Object = _media2.getState(),
                stream1:uint = state1.streamState[0],
                stream2:uint = state2.streamState[0];

trace("stream1", stream1);
trace("stream2", stream2);
trace("state1.mediaState", state1.mediaState);
trace("state2.mediaState", state2.mediaState);

            if (stream1 === STREAM_STATE_ERROR ||
                stream2 === STREAM_STATE_ERROR) {

                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if (stream1 === STREAM_STATE_CLOSED || stream1 === STREAM_STATE_OPEN ||
                stream2 === STREAM_STATE_CLOSED || stream2 === STREAM_STATE_OPEN) {
trace("同時再生待ち開始 audio.play(), video.play()");
                _media1.play(waitForCanPlay); // wait
                _media2.play(waitForCanPlay); // wait
                return;
            }
            if (stream1 === STREAM_STATE_CAN_PLAY || stream1 === STREAM_STATE_LOADED ||
                stream2 === STREAM_STATE_CAN_PLAY || stream2 === STREAM_STATE_LOADED) {
                // [1] MEDIA_STATE_STOPPED + MEDIA_STATE_STOPPED -> REWIND -> A/V PLAY
                // [2] MEDIA_STATE_STOPPED + MEDIA_STATE_PLAYING -> NOP
                // [3] MEDIA_STATE_STOPPED + MEDIA_STATE_PAUSED  -> V PLAY
                // [4] MEDIA_STATE_PLAYING + MEDIA_STATE_STOPPED -> NOP
                // [5] MEDIA_STATE_PLAYING + MEDIA_STATE_PLAYING -> A/V PAUSE
                // [6] MEDIA_STATE_PLAYING + MEDIA_STATE_PAUSED  -> V PLAY
                // [7] MEDIA_STATE_PAUSED  + MEDIA_STATE_STOPPED -> A PLAY
                // [8] MEDIA_STATE_PAUSED  + MEDIA_STATE_PLAYING -> A PLAY
                // [9] MEDIA_STATE_PAUSED  + MEDIA_STATE_PAUSED  -> A/V PLAY
                switch (state1.mediaState) {
                case MEDIA_STATE_STOPPED:
                    switch (state2.mediaState) {
                    case MEDIA_STATE_STOPPED:   stop();
                                                _media1.play(waitForCanPlay);
                                                _media2.play(waitForCanPlay);
                                                break; // [1]
                    case MEDIA_STATE_PLAYING:   break; // [2]
                    case MEDIA_STATE_PAUSED:    _media2.playback(); // [3]
                    }
                    break;
                case MEDIA_STATE_PLAYING:
                    switch (state2.mediaState) {
                    case MEDIA_STATE_STOPPED:   break; // [4]
                    case MEDIA_STATE_PLAYING:   pause(); break; // [5]
                    case MEDIA_STATE_PAUSED:    _media2.playback(); // [6]
                    }
                    break;
                case MEDIA_STATE_PAUSED:
                    switch (state2.mediaState) {
                    case MEDIA_STATE_STOPPED:   // [7]
                    case MEDIA_STATE_PLAYING:   _media1.openSoundChannel(state1.currentTime); break; // [8]
                    case MEDIA_STATE_PAUSED:    _media1.play(waitForCanPlay); // [9]
                                                _media2.play(waitForCanPlay);
                    }
                }
            }
        }

        protected function waitForCanPlay(dummyID:Number):void {
trace( "waitForCanPlay in" );
            var state1:Object = _media1.getState(),
                state2:Object = _media2.getState(),
                stream1:uint = state1.streamState[0],
                stream2:uint = state2.streamState[0],
                doPlay:Number = 0;

trace("stream1", stream1);
trace("stream2", stream2);
            if (stream1 === STREAM_STATE_ERROR ||
                stream2 === STREAM_STATE_ERROR) {

trace("STREAM_STATE_ERROR");
                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if (stream1 === STREAM_STATE_CAN_PLAY ||
                stream1 === STREAM_STATE_LOADED) {
                if (stream2 === STREAM_STATE_CAN_PLAY ||
                    stream2 === STREAM_STATE_LOADED) {
                    ++doPlay;
trace("doPlay", ++doPlay);
                }
            }
            if (doPlay) {
                _boss.postMessage("play", _id); // W3C NamedEvent
                // sync play
trace("同時再生開始");
trace("state1.currentTime", state1.currentTime);
                _media1.openSoundChannel(state1.currentTime);
                _media2.playback();
                _boss.postMessage("playing", _id); // W3C NamedEvent
            } else {
trace("どちらかの準備がまだ");
            }
        }

        public function seek(position:Number):void {
trace("MediaAudioVideo.seek", position);
            _media1.seek(position);
            _media2.seek(position);
        }

        public function pause():void {
trace("MediaAudioVideo.pause");
            _media1.pause();
            _media2.pause();
        }

        public function stop():void {
trace("MediaAudioVideo.stop");
            _media1.stop();
            _media2.stop();
        }

        public function close():void {
trace("MediaAudioVideo.close");
            _media1.close();
            _media2.close();
        }

        public function getState():Object {
            var state1:Object = _media1.getState(),
                state2:Object = _media2.getState(),
                m0:uint = _boss.judgeMultipleMediaState(state1.mediaState[0],
                                                        state2.mediaState[0]),
                s0:uint = _boss.judgeMultipleStreamState(state1.streamState[0],
                                                         state2.streamState[0]);

            state1.name = "MediaAudioVideo";
            state1.mediaState = [m0, state1.mediaState[0], state2.mediaState[0]];
            state1.mediaSource = _mediaSource;
            state1.streamState = [s0, state1.streamState[0], state2.streamState[0]];
            return state1;
        }

        public function setLoop(loop:Boolean):void {
            _media1.setLoop(loop);
            _media2.setLoop(loop);
        }

        public function setMute(mute:Boolean):void {
            _media1.setMute(mute);
            _media2.setMute(mute);
        }

        public function setVolume(volume:Number,
                                  force:Boolean = false):void {
            _media1.setVolume(volume);
            _media2.setVolume(volume);
        }

        public function setStartTime(time:Number):void {
            _media1.setStartTime(time);
            _media2.setStartTime(time);
        }

        public function setCurrentTime(time:Number):void {
            _media1.setCurrentTime(time);
            _media2.setCurrentTime(time);
        }
    }
}
