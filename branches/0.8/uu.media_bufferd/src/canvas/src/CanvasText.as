
package {
    import flash.display.*;
    import flash.filters.*;
    import flash.utils.*;
    import flash.geom.*;
    import flash.text.*;

    public class CanvasText {

        private var _canvas:Canvas; // Boss
        private var _rtl:int = 0; // 1: direction=rtl

        public function CanvasText(boss:Canvas) {
            _canvas = boss;
        }

        public function set direction(rtl:int):void {
            _rtl = rtl;
        }

        // CanvasRenderingContext2D.fillText
        // CanvasRenderingContext2D.strokeText
        public function draw(text:String, x:Number, y:Number,
                             maxWidth:Number, fill:int): void {
            var color:uint = fill ? _canvas.fillColor[0] : _canvas.strokeColor[0];
            var a:Number = (fill ? _canvas.fillColor[1] : _canvas.strokeColor[1]) * _canvas.globalAlpha;
            var textFormat:TextFormat = new TextFormat();
            var textField:TextField = new TextField();
            var bmp:BitmapData;
            var filterBmp:BitmapData; // filter bitmap
            var filterRect:Rectangle; // filter rect
            var matrix:Matrix = new Matrix(1, 0, 0, 1, x, y);
            var glowFilter:GlowFilter;

            // http://twitter.com/uupaa/status/9934417220
            var copyOffsetX:Number = (_canvas.shadowOffsetX < 0 ? -_canvas.shadowOffsetX : 0) + 20;
            var copyOffsetY:Number = (_canvas.shadowOffsetY < 0 ? -_canvas.shadowOffsetY : 0) + 20;
            var copyOffsetMatrix:Matrix = new Matrix(1, 0, 0, 1, copyOffsetX, copyOffsetY);

            textFormat.color = color;
            textFormat.size = _canvas.font[0]; // font-size
            textFormat.font = _canvas.font[4].replace(/^'+|'+$/g, ""); // "'Arial'" -> "Arial"
            textFormat.italic = _canvas.font[1] !== "normal";       // italic, oblique
            textFormat.bold = /[b56789]/.test(_canvas.font[2]);     // bold, bolder, 500~900
            textFormat.align = TextFormatAlign.LEFT;
            textField.defaultTextFormat = textFormat;       // apply font
            textField.autoSize = TextFieldAutoSize.LEFT;    // [!][NEED] auto resize
            textField.text = text;

            // strokeText
            if (!fill) {
                glowFilter = new GlowFilter(_canvas.strokeColor[0],
                                            _canvas.strokeColor[1],
                                            2, 2, 2, 1, false, true);
                textField.filters = [glowFilter];
            }

            switch (_canvas.textAlign) {
            case "left":    matrix.tx -= 2; break; // [FIX] -2
            case "start":   matrix.tx -= _rtl ? textField.width - 3 : 2; break; // [FIX] -2
            case "center":  matrix.tx -= textField.width / 2; break;
            case "right":   matrix.tx -= textField.width - 3; break; // [FIX] -3
            case "end":     matrix.tx -= _rtl ? 2 : textField.width - 3; break; // [FIX] -3
            }

            // http://twitter.com/uupaa/status/9934417220
            bmp = new BitmapData(copyOffsetX + textField.width,
                                 copyOffsetY + textField.height, true, 0);
            bmp.draw(textField, copyOffsetMatrix);

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
            matrix.concat(_canvas.matrix);

            // http://twitter.com/uupaa/status/9934417220
            matrix.tx -= copyOffsetX;
            matrix.ty -= copyOffsetY;

            _canvas.mixin(_canvas.bitmapData, _canvas.shadowFilter ? filterBmp : bmp, matrix);

            // [GC]
            bmp = null;
            filterBmp && (filterBmp = null);
        }
    }
}

