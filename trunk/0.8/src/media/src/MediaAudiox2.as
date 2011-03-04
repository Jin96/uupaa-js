package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaAudiox2 {
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
        // Media
        protected var _frontMedia:MediaAudio = null;
        protected var _rearMedia:MediaAudio = null;

        public function MediaAudiox2(boss:Media,
                                     id:Number,
                                     media:Array,
                                     poster:String = "") {
            _boss = boss;
            _id = id;
            _frontMedia = new MediaAudio(boss, _id, [media[0], media[1]], poster);
            _rearMedia  = new MediaAudio(boss,   0, [media[2], media[3]]);
        }

        public function play(dummyCallback:Function = null):void {
            var frontState:Object = _frontMedia.getState(),
                rearState:Object = _rearMedia.getState(),
                frontStream:uint = frontState.streamState[0],
                rearStream:uint = rearState.streamState[0];

            if (frontStream === STREAM_STATE_ERROR ||
                rearStream === STREAM_STATE_ERROR) {

                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if ((frontStream === STREAM_STATE_CLOSED ||
                 frontStream === STREAM_STATE_OPEN) &&
                (rearStream === STREAM_STATE_CLOSED ||
                 rearStream === STREAM_STATE_OPEN)) {

                _rearMedia.play(waitForCanPlay); // wait
                _frontMedia.play(waitForCanPlay); // wait
                return;
            }
            if ((frontStream === STREAM_STATE_CAN_PLAY ||
                 frontStream === STREAM_STATE_LOADED) &&
                (rearStream === STREAM_STATE_CAN_PLAY ||
                 rearStream === STREAM_STATE_LOADED)) {
                // [1] STOPPED + STOPPED -> REWIND -> A/V PLAY
                // [2] STOPPED + PLAYING -> NOP
                // [3] STOPPED + PAUSED  -> V PLAY
                // [4] PLAYING + STOPPED -> NOP
                // [5] PLAYING + PLAYING -> A/V PAUSE
                // [6] PLAYING + PAUSED  -> V PLAY
                // [7] PAUSED  + STOPPED -> A PLAY
                // [8] PAUSED  + PLAYING -> A PLAY
                // [9] PAUSED  + PAUSED  -> A/V PLAY
                switch (frontState.mediaState[0]) {
                case MEDIA_STATE_STOPPED:
                    switch (rearState.mediaState[0]) {
                    case MEDIA_STATE_STOPPED:   // [1]
                                                _rearMedia.play(waitForCanPlay);
                                                _frontMedia.play(waitForCanPlay);
                                                break;
                    case MEDIA_STATE_PLAYING:   break; // [2]
                    case MEDIA_STATE_PAUSED:    _rearMedia.playback(); // [3]
                    }
                    break;
                case MEDIA_STATE_PLAYING:
                    switch (rearState.mediaState[0]) {
                    case MEDIA_STATE_STOPPED:   break; // [4]
                    case MEDIA_STATE_PLAYING:   pause(); break; // [5]
                    case MEDIA_STATE_PAUSED:    _rearMedia.playback(); // [6]
                    }
                    break;
                case MEDIA_STATE_PAUSED:
                    switch (rearState.mediaState[0]) {
                    case MEDIA_STATE_STOPPED:   // [7]
                    case MEDIA_STATE_PLAYING:   _frontMedia.playback(); break; // [8]
                    case MEDIA_STATE_PAUSED:    // [9]
                                                _rearMedia.play(waitForCanPlay);
                                                _frontMedia.play(waitForCanPlay); 
                    }
                }
            }
        }

        protected function waitForCanPlay(dummyID:Number):void {
            var rearState:Object = _rearMedia.getState(),
                frontState:Object = _frontMedia.getState(),
                frontStream:uint = frontState.streamState[0],
                rearStream:uint = rearState.streamState[0],
                doPlay:Number = 0;

            trace("MediaAudiox2::waitForCanPlay",
                        frontState.streamState[0], rearState.streamState[0],
                        frontState.mediaState[0], rearState.mediaState[0]);

            if (frontStream === STREAM_STATE_ERROR ||
                rearStream  === STREAM_STATE_ERROR) {

                _boss.postMessage("error", _id); // W3C NamedEvent
                return;
            }
            if (frontStream === STREAM_STATE_CAN_PLAY ||
                frontStream === STREAM_STATE_LOADED) {
                if (rearStream === STREAM_STATE_CAN_PLAY ||
                    rearStream === STREAM_STATE_LOADED) {
                    ++doPlay;
                }
            }
            if (doPlay) {
                trace("MediaAudiox2::waitForCanPlay() sync play...");

                _rearMedia.playback();
                _frontMedia.playback();

//                _boss.postMessage("play", _id); // W3C NamedEvent
//                _boss.postMessage("playing", _id); // W3C NamedEvent
            } else {
                trace("MediaAudiox2::waitForCanPlay() wait...");
            }
        }

        public function seek(position:Number):void {
            _rearMedia.seek(position);
            _frontMedia.seek(position);
        }

        public function pause():void {
            _rearMedia.pause();
            _frontMedia.pause();
        }

        public function stop():void {
            _rearMedia.stop();
            _frontMedia.stop();
        }

        public function close():void {
            _rearMedia.close();
            _frontMedia.close();
        }

        public function getState():Object {
            var rearState:Object = _rearMedia.getState(),
                frontState:Object = _frontMedia.getState(),
                m0:uint = _boss.judgeMultipleMediaState(frontState.mediaState[0],
                                                        rearState.mediaState[0]),
                s0:uint = _boss.judgeMultipleStreamState(frontState.streamState[0],
                                                         rearState.streamState[0]);

            frontState.name = "MediaAudiox2";
            frontState.mediaState = [m0, frontState.mediaState[0],
                                         rearState.mediaState[0]];
            frontState.mediaSource = [frontState.mediaSource,
                                      rearState.mediaSource];
            frontState.streamState = [s0, frontState.streamState[0],
                                          rearState.streamState[0]];
            return frontState;
        }

        public function setLoop(loop:Boolean):void {
            _rearMedia.setLoop(loop);
            _frontMedia.setLoop(loop);
        }

        public function setMute(mute:Boolean):void {
            _rearMedia.setMute(mute);
            _frontMedia.setMute(mute);
        }

        public function setVolume(volume:Number,
                                  force:Boolean = false):void {
            _rearMedia.setVolume(volume);
            _frontMedia.setVolume(volume);
        }

        public function setStartTime(time:Number):void {
            _rearMedia.setStartTime(time);
            _frontMedia.setStartTime(time);
        }

        public function setCurrentTime(time:Number):void {
            _rearMedia.setCurrentTime(time);
            _frontMedia.setCurrentTime(time);
        }
    }
}
