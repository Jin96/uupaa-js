
package {
    import flash.external.*;
    import flash.display.*;
    import flash.utils.*;
    import flash.geom.*;
    import flash.net.*;

    public class CanvasCopy {

        private var _canvas:Canvas; // Boss
        private var _copyBuff:BitmapData;
        private var _zip:ByteArray = null;
        private var _unzip:ByteArray = null;
        private var _compress:int = 1; // 1: use zip
        private var _localConnection:LocalConnection = new LocalConnection();
        private var _canvasDrawImage:CanvasDrawImage;

        public function CanvasCopy(boss:Canvas) {
            _canvas = boss;

            _canvasDrawImage = new CanvasDrawImage(boss);

            // copyCanvas
            _localConnection.client = this;
            _localConnection.connect(ExternalInterface.objectID);
        }

        // purge ziped data
        public function purge():void {
            _zip = null;
        }

        // server side function
        public function draw(args:int, // 3, 5, 9
                             id:String,   // copy source canvas id
                             param:Object):void {
            _canvas.next(0); // lock
            _localConnection.send(id,
                                  "sendBack",
                                  ExternalInterface.objectID,
                                  args, param);
        }

        // client side function
        public function sendBack(id:String, args:int, param:Object):void {
            var me:* = this;

            _canvas.callback = function():void {
                _canvas.callback = null;
                me.readySendBack(id, args, param);
            };
            _canvas.next();
        }

        // client side function
        private function readySendBack(id:String, args:int, param:Object):void {
            var index:int  = 0;
            var blocks:int = 0;
            var packetSize:int = 40760; // 40kB - 200B
            var packet:ByteArray;
            var width:int  = _canvas.canvasWidth;
            var height:int = _canvas.canvasHeight;

            // http://twitter.com/uupaa/status/10189405664
            if (!_zip) {
                _zip = _canvas.bitmapData.getPixels(new Rectangle(0, 0, width, height));
                if (_compress) {
                    _zip.compress();
                }
            }
            _zip.position = 0; // reset position
            blocks = Math.ceil(_zip.bytesAvailable / packetSize);

            if (blocks < 2) {
                _localConnection.send(id, "recvBack",
                                      args, param, index, blocks, width, height, _zip);
            } else {
                while (_zip.bytesAvailable) {
                    packet = new ByteArray();
                    _zip.readBytes(packet, 0, Math.min(packetSize, _zip.bytesAvailable));

                    _localConnection.send(id, "recvBack",
                                          args, param, index, blocks, width, height, packet);
                    ++index;
                }
            }
        }

        // server side function
        public function recvBack(args:int,
                                 param:Object,
                                 index:int, blocks:int,
                                 width:int, height:int,
                                 packet:ByteArray):void {
/*
trace("--------recv in, packet.size="+packet.length);
trace(" index="+index);
trace(" blocks="+blocks);
trace(" sw="+param.sw);
 */

            function proxy(args:int, param:Object):void {
                var ary:Array = [];

                switch (args) {
                case 3: ary = [param.dx, param.dy, 0, 0, 0, 0, 0, 0]; break;
                case 5: ary = [param.dx, param.dy, param.dw, param.dh, 0, 0, 0, 0]; break;
                case 9: ary = [param.sx, param.sy, param.sw, param.sh,
                               param.dx, param.dy, param.dw, param.dh];
                }
                _canvasDrawImage.draw(args, ary, _copyBuff);
            }

            if (blocks < 2) {
                if (_compress) {
                    packet.uncompress();
                }
                _copyBuff = new BitmapData(width, height, true, 0);
                _copyBuff.setPixels(_copyBuff.rect, packet);
                proxy(args, param);
                _copyBuff.dispose();
                _copyBuff = null; // self [GC]

                _canvas.next(1); // unlock
            } else {
                if (!index) {
                    _copyBuff = new BitmapData(width, height, true, 0);
                    _unzip = new ByteArray();
                }

                _unzip.writeBytes(packet);

                if (index === blocks - 1) {
                    if (_compress) {
                        _unzip.uncompress();
                    }
                    _unzip.position = 0; // reset position

                    _copyBuff.setPixels(_copyBuff.rect, _unzip);
                    proxy(args, param);
                    _copyBuff.dispose();
                    _copyBuff = null; // self [GC]

                    _canvas.next(1); // unlock
                }
            }
        }
    }
}

