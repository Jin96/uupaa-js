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
        // Media
        protected var _frontMedia:MediaAudio = null;
        protected var _rearMedia:MediaVideo = null;

        public function MediaAudioVideo(boss:Media,
                                        id:Number,
                                        media:Array,
                                        poster:String = "") {
            _boss = boss;
            _id = id;
            _frontMedia = new MediaAudio(boss, _id, [media[0], media[1]]);
            _rearMedia  = new MediaVideo(boss,   0, [media[2], media[3]]);
        }

        public function play(dummyCallback:Function):void {
            var frontState:Object = _frontMedia.getState(false),
                rearState:Object = _rearMedia.getState(false),
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
            var rearState:Object = _rearMedia.getState(false),
                frontState:Object = _frontMedia.getState(false),
                frontStream:uint = frontState.streamState[0],
                rearStream:uint = rearState.streamState[0],
                doPlay:Number = 0;

            trace("MediaAudioVideo::waitForCanPlay",
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
                trace("MediaAudioVideo::waitForCanPlay() sync play...");

                _rearMedia.playback();
                _frontMedia.playback();

//                _boss.postMessage("play", _id); // W3C NamedEvent
//                _boss.postMessage("playing", _id); // W3C NamedEvent
            } else {
                trace("MediaAudioVideo::waitForCanPlay() wait...");
            }
        }

        public function seek(position:Number):void {
            // seek position synchronization
            var frontDuration:Number = _frontMedia.getState(true).duration;
            var realPositon:Number = position * frontDuration / 100; // ms

            _rearMedia.seek(realPositon, true);  // seek real positon
            _frontMedia.seek(realPositon, true); // seek real positon
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

        public function getState(all:Boolean):Object { // @return Hash:
                                                       //   { id, name, mediaState, streamState }
                                                       //           or
                                                       //   { id, name, loop, mute, volume, duration,
                                                       //     position, startTime, currentTime,
                                                       //     mediaState, mediaSource, streamState,
                                                       //     imageSource, imageState }
                                                       //
                                                       //   id - Number: 1 ~
                                                       //   name - String: "MediaAudiox2"
                                                       //   loop - Boolean:
                                                       //   mute - Boolean:
                                                       //   volume - Number: 0 ~ 1
                                                       //   duration - Number: 0 ~
                                                       //   progress - Number: 0 ~ 1
                                                       //   position - Number: 0 ~ 100
                                                       //   startTime - Number: ms
                                                       //   currentTime - Number: ms
                                                       //   mediaState - Array: [mediaState:Number]
                                                       //   mediaSource - Array: [mediaSource:String]
                                                       //   streamState - Array: [streamState:Number]
                                                       //   imageSource - Array:
                                                       //   imageState - Number: 0 or 1
            var rearState:Object,
                frontState:Object,
                m0:uint, s0:uint;

            if (!all) {
                rearState  = _rearMedia.getState(false);
                frontState = _frontMedia.getState(false);
                m0 = _boss.judgeMultipleMediaState(frontState.mediaState[0],
                                                   rearState.mediaState[0]);
                s0 = _boss.judgeMultipleStreamState(frontState.streamState[0],
                                                    rearState.streamState[0]);
                return {
                    id: _id,
                    name: "MediaAudioVideo",
                    mediaState: [m0, frontState.mediaState[0],
                                     rearState.mediaState[0]],
                    streamState: [s0, frontState.streamState[0],
                                      rearState.streamState[0]]
                };
            }

            rearState  = _rearMedia.getState(true);
            frontState = _frontMedia.getState(true);
            m0 = _boss.judgeMultipleMediaState(frontState.mediaState[0],
                                               rearState.mediaState[0]);
            s0 = _boss.judgeMultipleStreamState(frontState.streamState[0],
                                                rearState.streamState[0]);

            frontState.name = "MediaAudioVideo";
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
