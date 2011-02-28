package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudiox2 {
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
        protected var _audio1:MediaAudio = null; // front audio
        protected var _audio2:MediaAudio = null; // rear audio
        // Image
        protected var _imageSource:Array = [];  // [imageURL, ...]

        public function MediaAudiox2(boss:Media,
                                     id:Number,
                                     audioSource:Array,
                                     imageSource:Array = null) {
            _boss = boss;
            _id = id;
            _audioSource = audioSource.concat();
            _imageSource = imageSource ? imageSource.concat() : [];

            _audio1 = new MediaAudio(boss, _id, [audioSource[0]], imageSource);
            _audio2 = new MediaAudio(boss,   0, [audioSource[1]], []);
        }

        public function play(autoPlay:Boolean = false):void {
            var state1:Object = _audio1.getState(),
                state2:Object = _audio2.getState(),
                stream1:Number = state1.streamState,
                stream2:Number = state2.streamState,
                doPlay:Number = 0;

            if (stream1 === STREAM_STATE_ERROR ||
                stream2 === STREAM_STATE_ERROR) {

                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if (stream1 === STREAM_STATE_CLOSED || stream1 === STREAM_STATE_OPEN ||
                stream2 === STREAM_STATE_CLOSED || stream2 === STREAM_STATE_OPEN) {

                _audio1.play(false); // wait
                _audio2.play(false); // wait
                setTimeout(waitForCanPlay, 50);
                return;
            }
            if (stream1 === STREAM_STATE_CAN_PLAY || stream1 === STREAM_STATE_LOADED ||
                stream2 === STREAM_STATE_CAN_PLAY || stream2 === STREAM_STATE_LOADED) {
                if (state1.audioState !== AUDIO_STATE_PLAYING) {
                    doPlay += 1;
                }
                if (state2.audioState !== AUDIO_STATE_PLAYING) {
                    doPlay += 2;
                }
            }
            doPlay && _boss.postMessage("play", _id); // W3C NamedEvent
            switch (doPlay) {
            case 0: break;
            case 1: _audio1.openSoundChannel(state1.currentTime); break;
            case 2: _audio2.openSoundChannel(state2.currentTime); break;
            case 3: _audio1.openSoundChannel(state1.currentTime);
                    _audio2.openSoundChannel(state2.currentTime);
            }
            doPlay && _boss.postMessage("playing", _id); // W3C NamedEvent
        }

        protected function waitForCanPlay():void {
            var state1:Object = _audio1.getState(),
                state2:Object = _audio2.getState(),
                stream1:Number = state1.streamState,
                stream2:Number = state2.streamState,
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
                _audio1.openSoundChannel(state1.currentTime);
                _audio2.openSoundChannel(state2.currentTime);
                _boss.postMessage("playing", _id); // W3C NamedEvent
                return;
            }
            setTimeout(waitForCanPlay, 50);
        }

        public function seek(position:Number):void {
            _audio1.seek(position);
            _audio2.seek(position);
        }

        public function pause():void {
            _audio1.pause();
            _audio2.pause();
        }

        public function stop():void {
            _audio1.stop();
            _audio2.stop();
        }

        public function close():void {
            _audio1.close();
            _audio2.close();
        }

        public function getState():Object {
            var state1:Object = _audio1.getState(),
                state2:Object = _audio2.getState(),
                a0:uint = 0,
                a1:uint = state1.audioState,
                a2:uint = state2.audioState,
                s0:uint = 0,
                s1:uint = state1.streamState,
                s2:uint = state2.streamState;

            // --- Judge Audio State ---
            // STOPPED  || STOPPED -> STOPPED
            // STOPPED  || PAUSED  -> STOPPED
            // STOPPED  || PLAYING -> STOPPED
            // PAUSED   || STOPPED -> PAUSED
            // PAUSED   || PAUSED  -> PAUSED
            // PAUSED   || PLAYING -> PAUSED
            // PLAYING  || STOPPED -> PLAYING
            // PLAYING  || PAUSED  -> PLAYING
            // PLAYING  || PLAYING -> PLAYING
            a0 = a1;

            // --- Judge Stream State ---
            // ERROR    || ANY      -> ERROR
            // ANY      || ERROR    -> ERROR
            // CLOSED   || CLOSED   -> CLOSED
            // CLOSED   || OPEN     -> CLOSED
            // CLOSED   || CAN_PLAY -> CLOSED
            // CLOSED   || LOADED   -> CLOSED
            // OPEN     || CLOSED   -> OPEN
            // OPEN     || OPEN     -> OPEN
            // OPEN     || CAN_PLAY -> OPEN
            // OPEN     || LOADED   -> OPEN
            // CAN_PLAY || CLOSED   -> CAN_PLAY
            // CAN_PLAY || OPEN     -> CAN_PLAY
            // CAN_PLAY || CAN_PLAY -> CAN_PLAY
            // CAN_PLAY || LOADED   -> CAN_PLAY
            // LOADED   || CLOSED   -> LOADED
            // LOADED   || OPEN     -> LOADED
            // LOADED   || CAN_PLAY -> LOADED
            // LOADED   || LOADED   -> LOADED
            if (s1 === STREAM_STATE_ERROR || s2 === STREAM_STATE_ERROR) {
                s0 = STREAM_STATE_ERROR;
            } else {
                s0 = s1;
            }

            // audioState = 0x210
            // streamState = 0x210
            state1.audioState  = (a2 << 8) | (a1 << 4) | a0;
            state1.streamState = (s2 << 8) | (s1 << 4) | s0;
            state1.multipleSource = true;
            return state1;
        }

        public function setLoop(loop:Boolean):void {
            _audio1.setLoop(loop);
            _audio2.setLoop(loop);
        }

        public function setMute(unmute:Boolean):void {
            _audio1.setMute(unmute);
            _audio2.setMute(unmute);
        }

        public function setVolume(volume:Number,
                                  force:Boolean = false):void {
            _audio1.setVolume(volume);
            _audio2.setVolume(volume);
        }

        public function setStartTime(time:Number):void {
            _audio1.setStartTime(time);
            _audio2.setStartTime(time);
        }

        public function setCurrentTime(time:Number):void {
            _audio1.setCurrentTime(time);
            _audio2.setCurrentTime(time);
        }
    }
}
