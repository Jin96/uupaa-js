
package {
    import flash.display.*;
    import flash.utils.*;
    import flash.geom.*;

    public class CanvasDrawImage {

        private var _canvas:Canvas; // Boss

        public function CanvasDrawImage(boss:Canvas) {
            _canvas = boss;
        }

        // CanvasRenderingContext2D.drawImage
        public function draw(args:Number,
                             param:Array,
                             bitmapData:BitmapData):void {
            var dx:Number = 0;
            var dy:Number = 0;
            var dw:Number = 0;
            var dh:Number = 0;
            var sx:Number = 0;
            var sy:Number = 0;
            var sw:Number = 0;
            var sh:Number = 0;
            var bmp:BitmapData;
            var filterBmp:BitmapData; // filter bitmap
            var filterRect:Rectangle; // filter rect
            var matrix:Matrix = new Matrix();

            // http://twitter.com/uupaa/status/9934417220
            var copyOffsetX:Number = (_canvas.shadowOffsetX < 0 ? -_canvas.shadowOffsetX : 0) + 20;
            var copyOffsetY:Number = (_canvas.shadowOffsetY < 0 ? -_canvas.shadowOffsetY : 0) + 20;

            if (!_canvas.shadowFilter) {
                copyOffsetX = copyOffsetY = 0;
            }

            if (args > 5) { // args 9 version
                sx = param[0];
                sy = param[1];
                sw = param[2];
                sh = param[3];
                dx = param[4];
                dy = param[5];
                dw = param[6];
                dh = param[7];

                dx += copyOffsetX;
                dy += copyOffsetY;

                // TODO: Shadow Offset

                bmp = new BitmapData(sw, sh, true, 0);
                bmp.copyPixels(bitmapData,
                               new Rectangle(sx, sy, sw, sh),
                               new Point());
            } else { // args 2 or 4 version
                bmp = new BitmapData(copyOffsetX + bitmapData.width,
                                     copyOffsetY + bitmapData.height, true, 0);
                bmp.copyPixels(bitmapData,
                               bmp.rect,
                               new Point(copyOffsetX, copyOffsetY));

                dx = param[0];
                dy = param[1];
                dw = param[2] || bmp.width;
                dh = param[3] || bmp.height;
            }

            // apply shadow
            if (_canvas.shadowFilter) {
                filterRect = bmp.generateFilterRect(bmp.rect, _canvas.shadowFilter);
                filterBmp = new BitmapData(filterRect.width,
                                           filterRect.height, true, 0);
                filterBmp.copyPixels(bmp, bmp.rect,
                                     new Point(filterRect.x - bmp.rect.x,
                                               filterRect.y - bmp.rect.y));
                filterBmp.applyFilter(bmp, bmp.rect, new Point(), _canvas.shadowFilter);
            }

            // apply matrix
            matrix.scale(dw / bmp.width, dh / bmp.height);
            matrix.translate(dx, dy);
            matrix.concat(_canvas.matrix);

            // http://twitter.com/uupaa/status/9934417220
            matrix.tx -= copyOffsetX;
            matrix.ty -= copyOffsetY;

            _canvas.mixin(_canvas.bitmapData,
                          _canvas.shadowFilter ? filterBmp : bmp, matrix);

            // [GC]
            bmp = null;
            filterBmp && (filterBmp = null);
        }
    }
}

