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
            var state1:Object = _media1.getState(),
                state2:Object = _media2.getState(),
                stream1:uint = state1.streamState[0],
                stream2:uint = state2.streamState[0];

            if (stream1 === STREAM_STATE_ERROR ||
                stream2 === STREAM_STATE_ERROR) {

                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if ((stream1 === STREAM_STATE_CLOSED || stream1 === STREAM_STATE_OPEN) &&
                (stream2 === STREAM_STATE_CLOSED || stream2 === STREAM_STATE_OPEN)) {
                _media2.play(waitForCanPlay); // wait
                _media1.play(waitForCanPlay); // wait
                return;
            }
            if ((stream1 === STREAM_STATE_CAN_PLAY || stream1 === STREAM_STATE_LOADED) &&
                (stream2 === STREAM_STATE_CAN_PLAY || stream2 === STREAM_STATE_LOADED)) {
                // [1] STOPPED + STOPPED -> REWIND -> A/V PLAY
                // [2] STOPPED + PLAYING -> NOP
                // [3] STOPPED + PAUSED  -> V PLAY
                // [4] PLAYING + STOPPED -> NOP
                // [5] PLAYING + PLAYING -> A/V PAUSE
                // [6] PLAYING + PAUSED  -> V PLAY
                // [7] PAUSED  + STOPPED -> A PLAY
                // [8] PAUSED  + PLAYING -> A PLAY
                // [9] PAUSED  + PAUSED  -> A/V PLAY
                switch (state1.mediaState[0]) {
                case MEDIA_STATE_STOPPED:
                    switch (state2.mediaState[0]) {
                    case MEDIA_STATE_STOPPED:   // [1]
                                                _media2.play(waitForCanPlay);
                                                _media1.play(waitForCanPlay);
                                                break;
                    case MEDIA_STATE_PLAYING:   break; // [2]
                    case MEDIA_STATE_PAUSED:    _media2.playback(); // [3]
                    }
                    break;
                case MEDIA_STATE_PLAYING:
                    switch (state2.mediaState[0]) {
                    case MEDIA_STATE_STOPPED:   break; // [4]
                    case MEDIA_STATE_PLAYING:   pause(); break; // [5]
                    case MEDIA_STATE_PAUSED:    _media2.playback(); // [6]
                    }
                    break;
                case MEDIA_STATE_PAUSED:
                    switch (state2.mediaState[0]) {
                    case MEDIA_STATE_STOPPED:   // [7]
                    case MEDIA_STATE_PLAYING:   _media1.openSoundChannel(state1.currentTime); break; // [8]
                    case MEDIA_STATE_PAUSED:    // [9]
                                                _media2.play(waitForCanPlay);
                                                _media1.play(waitForCanPlay); 
                    }
                }
            }
        }

        protected function waitForCanPlay(dummyID:Number):void {
            var state1:Object = _media1.getState(),
                state2:Object = _media2.getState(),
                stream1:uint = state1.streamState[0],
                stream2:uint = state2.streamState[0],
                doPlay:Number = 0;

            if (stream1 === STREAM_STATE_ERROR ||
                stream2 === STREAM_STATE_ERROR) {

                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if (stream1 === STREAM_STATE_CAN_PLAY ||
                stream1 === STREAM_STATE_LOADED) {
                if (stream2 === STREAM_STATE_CAN_PLAY ||
                    stream2 === STREAM_STATE_LOADED) {
                    ++doPlay;
                }
            }
            if (doPlay) {
                _boss.postMessage("play", _id); // W3C NamedEvent
                // sync play
                _media2.playback();
                _media1.openSoundChannel(state1.currentTime);
                _boss.postMessage("playing", _id); // W3C NamedEvent
            } else {
                trace("wait...");
            }
        }

        public function seek(position:Number):void {
            _media2.seek(position);
            _media1.seek(position);
        }

        public function pause():void {
            _media2.pause();
            _media1.pause();
        }

        public function stop():void {
            _media2.stop();
            _media1.stop();
        }

        public function close():void {
            _media2.close();
            _media1.close();
        }

        public function getState():Object {
            var state2:Object = _media2.getState(),
                state1:Object = _media1.getState(),
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
            _media2.setLoop(loop);
            _media1.setLoop(loop);
        }

        public function setMute(mute:Boolean):void {
            _media2.setMute(mute);
            _media1.setMute(mute);
        }

        public function setVolume(volume:Number,
                                  force:Boolean = false):void {
            _media2.setVolume(volume);
            _media1.setVolume(volume);
        }

        public function setStartTime(time:Number):void {
            _media2.setStartTime(time);
            _media1.setStartTime(time);
        }

        public function setCurrentTime(time:Number):void {
            _media2.setCurrentTime(time);
            _media1.setCurrentTime(time);
        }
    }
}
