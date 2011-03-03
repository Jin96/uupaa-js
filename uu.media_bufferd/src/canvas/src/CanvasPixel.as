
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
            var copy:BitmapData = new BitmapData(sw, sh, true, 0);

            copy.copyPixels(_canvas.bitmapData,
                            new Rectangle(sx, sy, sw, sh), new Point());

            var data:ByteArray = copy.getPixels(new Rectangle(0, 0, sw, sh));

            data.position = 0;

            while (data.bytesAvailable) {
                rv[++i] = data.readUnsignedInt();
            }
            return rv;
        }

        public function putImageData(imagewidth:int,        // @param int:
                                     imageheight:int,       // @param int:
                                     dx:int,                // @param int:
                                     dy:int,                // @param int:
                                     dirtyX:int,            // @param int:
                                     dirtyY:int,            // @param int:
                                     dirtyWidth:int,        // @param int:
                                     dirtyHeight:int,       // @param int:
                                     rawdata:String):void { // @param String: "rawdata,..."
/*
trace("putImageData in");
trace("imagewidth="+imagewidth);
trace("imageheight="+imageheight);
//trace("rawdata="+rawdata);
trace("dx="+dx);
trace("dy="+dy);
trace("dirtyX="+dirtyX);
trace("dirtyY="+dirtyY);
trace("dirtyWidth="+dirtyWidth);
trace("dirtyHeight="+dirtyHeight);
 */

            if (dirtyWidth < 0) {
                dirtyX += dirtyWidth;
                dirtyWidth = Math.abs(dirtyWidth);
            }
            if (dirtyHeight < 0) {
                dirtyY += dirtyHeight;
                dirtyHeight = Math.abs(dirtyHeight);
            }
            if (dirtyX < 0) {
                dirtyWidth += dirtyX;
                dirtyX = 0;
            }
            if (dirtyY < 0) {
                dirtyHeight += dirtyY;
                dirtyY = 0;
            }
            if (dirtyX + dirtyWidth > imagewidth) {
                dirtyWidth = imagewidth - dirtyX;
            }
            if (dirtyY + dirtyHeight > imageheight) {
                dirtyHeight = imageheight - dirtyY;
            }
            if (dirtyWidth <= 0 || dirtyHeight <= 0) {
                return;
            }

/*
trace("--------------");
trace("dx="+dx);
trace("dy="+dy);
trace("dirtyX="+dirtyX);
trace("dirtyY="+dirtyY);
trace("dirtyWidth="+dirtyWidth);
trace("dirtyHeight="+dirtyHeight);
 */

            var byteArray:ByteArray = new ByteArray();
            var tmp:BitmapData = new BitmapData(imagewidth, imageheight, true, 0);

            var raw:Array = rawdata.split(",");
            var i:int = 0;
            var iz:int = raw.length;
            var n:uint;

/*
trace("data.length="+iz);
 */

            for (; i < iz; ++i) {
                n = parseInt(raw[i]);
                byteArray.writeUnsignedInt(n);
            }
            byteArray.position = 0; // reset position

            tmp.setPixels(tmp.rect, byteArray);

            _canvas.bitmapData.copyPixels(
                    tmp,
                    new Rectangle(dirtyX, dirtyY, dirtyWidth, dirtyHeight),
                    new Point(dx, dy))
        }
    }
}

