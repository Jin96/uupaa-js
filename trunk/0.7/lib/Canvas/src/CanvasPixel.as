
package {
    import flash.display.*;
    import flash.utils.*;
    import flash.geom.*;

    // depend libraries
    import com.adobe.images.JPGEncoder;
    import com.adobe.images.PNGEncoder;

    public class CanvasPixel {

        private var _canvas:Canvas; // Boss

        public function CanvasPixel(boss:Canvas) {
            _canvas = boss;
        }
        public function toDataURL(mimeType:String,
                                  jpegQuality:Number):String {
            var jpgEncoder:JPGEncoder;
            var byteArray:ByteArray;

            switch (mimeType) {
            case "image/jpeg":
                    jpgEncoder = new JPGEncoder(jpegQuality * 100);
                    byteArray = jpgEncoder.encode(_canvas.bitmapData);
                    break;
            case "image/png":
            default:
                    byteArray = PNGEncoder.encode(_canvas.bitmapData);
            }
            return "data:" + mimeType + ";base64," + CanvasBase64.encode(byteArray);
        }

        public function getImageData(sx:int, sy:int, sw:int, sh:int):Array {
            var rv:Array = [sw, sh];
            var i:int = 1;
            var copy:BitmapData = new BitmapData(sw - sx, sh - sy, true, 0);

            copy.copyPixels(_canvas.bitmapData,
                            new Rectangle(sx, sy, sw, sh), new Point());

            var data:ByteArray = copy.getPixels(new Rectangle(0, 0, sw - sx,
                                                                    sh - sy));

            data.position = 0;

            while (data.bytesAvailable) {
                rv[++i] = data.readUnsignedInt();
            }
            return rv;
        }

        public function putImageData(imagedata:Array,        // @param Array:
                                     dx:int,                 // @param int:
                                     dy:int,                 // @param int:
                                     dirtyX:int,             // @param int:
                                     dirtyY:int,             // @param int:
                                     dirtyWidth:int,         // @param int:
                                     dirtyHeight:int):void { // @param int:
        }
    }
}

