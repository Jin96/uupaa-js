package {
    // debug
    import flash.system.Security; // for Security.allowDomain
    import flash.system.System;

    import flash.display.Shape;
    import flash.display.Sprite;
    import flash.display.StageAlign;
    import flash.display.StageScaleMode;
    import flash.display.PixelSnapping;
    import flash.display.Bitmap;
    import flash.display.BitmapData;
    import flash.display.BlendMode;
    import flash.display.CapsStyle;
    import flash.display.Graphics;
    import flash.display.GradientType;
    import flash.display.InterpolationMethod;
    import flash.display.JointStyle;
    import flash.display.LineScaleMode;
    import flash.display.Loader;
    import flash.display.LoaderInfo;
    import flash.display.Shape;
    import flash.display.SpreadMethod;
    import flash.events.Event;
    import flash.geom.ColorTransform;
    import flash.geom.Matrix;
    import flash.geom.Point;
    import flash.geom.Rectangle;
    import flash.net.URLRequest;
    import flash.external.ExternalInterface;

    public class Canvas extends Sprite {
        // --- compositing ---
        private var globalAlpha:Number = 1; // globalAlpha
        private var mix:String = "source-over"; // globalCompositeOperation
        // --- colors and styles ---
        private var strokeStyle:int = 0;
        private var strokeColor:Array = [0, 1];
        private var strokeRatios:Array = []; // liner
        private var strokeColors:Array = []; // liner
        private var strokeAlphas:Array = []; // liner
        private var strokeMatrix:Matrix = new Matrix(); // liner

        private var fillStyle:int = 0;
        private var fillColor:Array = [0, 1];
        private var fillRatios:Array = []; // liner
        private var fillColors:Array = []; // liner
        private var fillAlphas:Array = []; // liner
        private var fillMatrix:Matrix = new Matrix(); // liner

        private var lineWidth:Number = 1;
        private var lineCap:String = "none"; // butt
        private var lineJoin:String = "miter";
        private var miterLimit:Number = 10;
        // --- shadows ---
        private var shadowBlur:Number;
        private var shadowColor:Array = [0, 1];
        private var shadowOffsetX:Number;
        private var shadowOffsetY:Number;
        // --- text ---
        private var font:String = "10px sans-serif";
        private var textAlign:String = "start";
        private var textBaseline:String = "alphabetic";
        // --- hidden properties ---
        private var _lineScale:Number = 1;
        private var _scaleX:Number = 1;
        private var _scaleY:Number = 1;
        private var _matrixfxd:Number = 0;
        private var _matrix:Matrix;
        private var _stack:Array = [];
        private var _path:Array = [];
        private var _clipPath:String;
        private var _clipRect:String;
        private var _beginX:Number = 0;
        private var _beginY:Number = 0;
        private var _curtX:Number = 0;
        private var _curtY:Number = 0;
        private var _shape:Shape;
        private var _view:Bitmap;
        private var _buff:BitmapData;
        private var _msgid:String = ""; // last message id
        // clearAll params
        private var _clearAllBuff:BitmapData;
        private var _clearAllRect:Rectangle;
        private var _clearAllPoint:Point;

        private var xFlyweight:int = 0;
        private var canvasWidth:int = 300;
        private var canvasHeight:int = 150;

        public function Canvas() {
            // for local debug
            Security.allowDomain("*");

            ExternalInterface.addCallback("send", recv);

            _shape = new Shape;
            stage.frameRate = 60;
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align     = StageAlign.TOP_LEFT;
//          blendMode = BlendMode.LAYER;
//            cacheAsBitmap = true;

            ExternalInterface.call("uu.flash.dmz." + ExternalInterface.objectID);
        }

        private function onEnterFrame(evt:Event):void {
            var cmd:Object = stage.loaderInfo.parameters;

            if (cmd.i && _msgid !== cmd.i) {
// trace(cmd.i + ":" + cmd.c);
                _msgid = cmd.i; // update
                _buff && _buff.lock();
                recv(cmd.c);
                _buff && _buff.unlock();
            }
        }

        private function recv(msg:String):void {
            var ary:Array = msg.split("\t");
            var i:int = -1;
            var iz:int = ary.length;

            var p:Object, j:int, jz:int;
            var w:Number, h:Number, d:Number, tx:Number, ty:Number;
            var dx:Number, dy:Number;

            while (++i < iz) {
                switch (ary[i]) { // {COMMAND}
                case "in":  init(+ary[++i], +ary[++i], +ary[++i]);
                            addEventListener("enterFrame", onEnterFrame);
                            break;
                case "gA":  globalAlpha = +ary[++i]; break;
                case "gC":  mix = ary[++i]; break;
                case "s0":  strokeStyle = 0;
                            strokeColor = [+ary[++i], +ary[++i]];
                            break;
                case "s1":  strokeStyle = 1;
                            i = setStrokeGradientProps(ary, i); break;
                case "f0":  fillStyle = 0;
                            fillColor = [+ary[++i], +ary[++i]];
                            break;
                case "f1":  fillStyle = 1;
                            i = setFillGradientProps(ary, i); break;
                case "lW":  lineWidth = +ary[++i]; break;
                case "lC":  lineCap = ary[++i];
                            lineCap === "butt" && (lineCap = "none"); break;
                case "lJ":  lineJoin = ary[++i]; break;
                case "mL":  miterLimit = +ary[++i]; break;
                case "sB":  shadowBlur = +ary[++i]; break;
                case "sC":  shadowColor = [+ary[++i], +ary[++i]]; break;
                case "sX":  shadowOffsetX= +ary[++i]; break;
                case "sY":  shadowOffsetY= +ary[++i]; break;
                case "fo":  font = ary[++i]; break;
                case "tA":  textAlign = ary[++i]; break;
                case "tB":  textBaseline = ary[++i]; break;
                case "re":  rect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "rz":  init(+ary[++i], +ary[++i], +ary[++i]); break;
                case "ar":  arc(+ary[++i], +ary[++i], +ary[++i],
                                +ary[++i], +ary[++i], +ary[++i]); break;
                case "bP":  _path = []; break; // reset path
                case "cP":  closePath(); break;
                case "mT":  moveTo(ary[++i] * 0.001, ary[++i] * 0.001); break;
                case "qC":  quadraticCurveTo(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "lT":  lineTo(ary[++i] * 0.001, ary[++i] * 0.001); break;
                case "st":  stroke(); break;
                case "fi":  fill(); break;
                case "cA":  _buff.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint); break;
                case "cR":  clearRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "fR":  fillRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i], 1); break;
                case "sR":  fillRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i], 0); break;
                case "sT":  strokeText(ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "fT":  fillText(ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
//              case "d3":  drawImage(ary[++i], +ary[++i], +ary[++i]); break;
//              case "d5":  drawImage(ary[++i], +ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
//              case "d9":  drawImage(ary[++i], +ary[++i], +ary[++i], +ary[++i], +ary[++i],
//                                              +ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "ro":  rotate(+ary[++i]); break;
                case "sc":  scale(+ary[++i], +ary[++i]); break;
                case "ST":  setTransform(+ary[++i], +ary[++i],
                                         +ary[++i], +ary[++i],
                                         +ary[++i], +ary[++i]); break;
                case "tf":  x_transform(+ary[++i], +ary[++i],
                                        +ary[++i], +ary[++i],
                                        +ary[++i], +ary[++i]); break;
                case "tl":  translate(+ary[++i], +ary[++i]); break;
                case "sv":  save(); break;
                case "rs":  restore(); break;
                case "undefined": // [!] undefined trap
                    trace("[!] undefined trap");
                    return;
                default:
                    trace("[!] unknown command trap: " + ary[i]);
                    ExternalInterface.call("uu.flash.alert", "Unknown command=" + ary[i]);
                    return;
                }
            }
        }

        private function setStrokeGradientProps(ary:Array, i:int):int {
            var p:Object = { x0: +ary[++i], y0: +ary[++i],
                             x1: +ary[++i], y1: +ary[++i] };
            var w:Number = p.x1 - p.x0,
                h:Number = p.y1 - p.y0;
            var d:Number = Math.sqrt(w * w + h * h);

            strokeMatrix.identity();
            strokeMatrix.createGradientBox(d, d, Math.atan2(h, w),
                                            ((p.x0 + p.x1) - d) / 2,
                                            ((p.y0 + p.y1) - d) / 2);
            strokeRatios = [];
            strokeColors = [];
            strokeAlphas = [];

            var j:int = 0;
            var jz:int = +ary[++i];

            for (; j < jz; ++j) {
                strokeRatios.push(+ary[++i]);
                strokeColors.push(+ary[++i]);
                strokeAlphas.push(+ary[++i]);
            }
            return i;
        }

        private function setFillGradientProps(ary:Array, i:int):int {
            var p:Object = { x0: +ary[++i], y0: +ary[++i],
                             x1: +ary[++i], y1: +ary[++i] };
            var w:Number = p.x1 - p.x0,
                h:Number = p.y1 - p.y0;
            var d:Number = Math.sqrt(w * w + h * h);

            fillMatrix.identity();
            fillMatrix.createGradientBox(d, d, Math.atan2(h, w),
                                            ((p.x0 + p.x1) - d) / 2,
                                            ((p.y0 + p.y1) - d) / 2);
            fillRatios = [];
            fillColors = [];
            fillAlphas = [];

            var j:int = 0;
            var jz:int = +ary[++i];

            for (; j < jz; ++j) {
                fillRatios.push(+ary[++i]);
                fillColors.push(+ary[++i]);
                fillAlphas.push(+ary[++i]);
            }
            return i;
        }

        private function init(width:int, height:int, flyweight:int):void {
            _matrix = new Matrix();
            _beginX = _beginY = _curtX = _curtY = 0;

            xFlyweight = flyweight;
            canvasWidth = width;
            canvasHeight = height;

            if (_buff) {
                _buff.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint);
                _buff.dispose();
                // _shape.graphics.clear();
            }
            _buff = new BitmapData(width, height, true, 0); // 300 x 150
            _view = new Bitmap(_buff,
                               flyweight ? PixelSnapping.AUTO : PixelSnapping.NEVER,
                               flyweight ? false : true);
            addChild(_view);

            // build clearAll params
            _clearAllBuff = _buff.clone();
            _clearAllRect = new Rectangle(0, 0, width, height);
            _clearAllPoint = new Point(0, 0);
        }

        private function arc(x:Number, y:Number, radius:Number,
                             startAngle:Number, endAngle:Number,
                             anticlockwise:Number):void {
            var sx:Number = Math.cos(startAngle) * radius + x;
            var sy:Number = Math.sin(startAngle) * radius + y;
            var ex:Number = Math.cos(endAngle)   * radius + x;
            var ey:Number = Math.sin(endAngle)   * radius + y;

            if (_matrixfxd) {
                var p0:Point = _matrix.transformPoint(new Point(x, y));
                var p1:Point = _matrix.transformPoint(new Point(sx, sy));
                var p2:Point = _matrix.transformPoint(new Point(ex, ey));

                x  = p0.x;
                y  = p0.y;
                sx = p1.x;
                sy = p1.y;
                ex = p2.x;
                ey = p2.y;
            }
            // add StartPoint
            _path.length ? lineTo(sx, sy)
                         : moveTo(_beginX = sx, _beginY = sy);

            if (Math.round(sx * 100) === Math.round(ex * 100)
                && Math.round(sy * 100) === Math.round(ey * 100)) {
                if (_scaleX === _scaleY) {
                    // circle
                    _path.push("c", x, y, this._scaleX * radius);
                } else {
                    // ellipse
                    _path.push("e", x, y, this._scaleX * radius * 2,
                                          this._scaleY * radius * 2);
                }
            } else {
                _path.push("a", x, y, radius, startAngle, endAngle, anticlockwise); // arc
            }
            _curtX = ex;
            _curtY = ey;
        }

        private function closePath():void {
            if (_path.length) {
                if (_curtX !== _beginX || _curtY !== _beginY) {
                    _path.push("x", _curtX = _beginX, _curtY = _beginY);
                }
            }
        }

        private function moveTo(x:Number, y:Number):void {
            if (_matrixfxd) {
                var p:Point = _matrix.transformPoint(new Point(x, y));

                x = p.x;
                y = p.y;
            }
            _path.push("m", _beginX = _curtX = x, _beginY = _curtY = y);
        }

        private function lineTo(x:Number, y:Number):void {
            if (_matrixfxd) {
                var p:Point = _matrix.transformPoint(new Point(x, y));

                x = p.x;
                y = p.y;
            }
            // add begin point
            if (!_path.length) {
                _path.push("m", _beginX = x, _beginY = y);
            }
            _path.push("l", _curtX = x, _curtY = y);
        }

        private function clearRect(x:Number, y:Number, w:Number, h:Number):void {
            if (!x && !y && w >= canvasWidth && h >= canvasHeight) {
                // clearAll
                _buff.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint);
            } else {
                _shape.graphics.beginFill(0);
                _shape.graphics.drawRect(x, y, w, h);
                _shape.graphics.endFill();

                _buff.draw(_shape, _matrix, null, BlendMode.ERASE);
                _shape.graphics.clear();
            }
        }

        private function stroke():void {
            _applyStrokeStyle();

            buildPath(_path);
            _buff.draw(_shape);
            _shape.graphics.clear();
        }

        private function fill():void {
            _applyFillStyle();

            buildPath(_path);
            _shape.graphics.endFill();
            _buff.draw(_shape);
            _shape.graphics.clear();
        }

        private function buildPath(ary:Array):void {
            var i:int = -1;
            var iz:int = ary.length;
            var gfx:Graphics = _shape.graphics;

            while (i < iz) {
                switch (ary[++i]) {
                case "x": // closePath
                    gfx.lineTo(ary[++i], ary[++i]);
                    break;
                case "m": // moveTo
                    gfx.moveTo(ary[++i], ary[++i]);
                    break;
                case "l": // lineTo
                    gfx.lineTo(ary[++i], ary[++i]);
                    break;
                case "c": // circle
                    gfx.drawCircle(ary[++i], ary[++i], ary[++i]);
                    break;
                case "e": // ellipse
                    gfx.drawEllipse(ary[++i], ary[++i], ary[++i], ary[++i]);
                    break;
                case "a": // arc
                    drawArc(gfx,
                            ary[++i], ary[++i], ary[++i],
                            ary[++i], ary[++i], ary[++i]);
                }
            }
        }

        private function drawArc(gfx:Graphics,
                                 x:Number, y:Number, radius:Number,
                                 startAngle:Number, endAngle:Number,
                                 anticlockwise:Number):void {
        }

        private function fillRect(x:Number, y:Number,
                                  w:Number, h:Number, fill:int):void {
            if (fill) {
                _applyFillStyle();
            } else {
                _applyStrokeStyle();
            }
            var p1:Point = _matrix.transformPoint(new Point(x, y));
            var p2:Point = _matrix.transformPoint(new Point(x + w, y));
            var p3:Point = _matrix.transformPoint(new Point(x + w, y + h));
            var p4:Point = _matrix.transformPoint(new Point(x, y + h));

            _shape.graphics.moveTo(p1.x, p1.y);
            _shape.graphics.lineTo(p2.x, p2.y);
            _shape.graphics.lineTo(p3.x, p3.y);
            _shape.graphics.lineTo(p4.x, p4.y);
            _shape.graphics.lineTo(p1.x, p1.y);
            if (fill) {
                _shape.graphics.endFill();
            }

            _buff.draw(_shape);
            _shape.graphics.clear();
        }

        private function rect(x:Number, y:Number, w:Number, h:Number):void {
            moveTo(x, y);
            lineTo(x + w, y);
            lineTo(x + w, y + h);
            lineTo(x, y + h);
            lineTo(x, y);
            closePath();
        }

/*
        private function _map(x:Number, y:Number):Point {
            return _matrix.transformPoint(new Point(x, y));
        }
 */

        private function scale(x:Number, y:Number):void {
            var curt:Matrix = _matrix.clone();

            _matrix.identity();
            _matrix.scale(x, y);
            _matrix.concat(curt);

            _scaleX *= x;
            _scaleY *= y;
            _lineScale = (_matrix.a + _matrix.d) / 2;
            _matrixfxd = 1;
        }

        private function rotate(angle:Number):void {
            var curt:Matrix = _matrix.clone();

            _matrix.identity();
            _matrix.rotate(angle);
            _matrix.concat(curt);
            _matrixfxd = 1;
        }

        private function translate(x:Number, y:Number):void {
            var curt:Matrix = _matrix.clone();

            _matrix.identity(); // reset
            _matrix.translate(x, y);
            _matrix.concat(curt); // matrix multiply
            _matrixfxd = 1;
        }

        private function x_transform(m11:Number, m12:Number,
                                     m21:Number, m22:Number,
                                      dx:Number,  dy:Number):void {
            var curt:Matrix = _matrix.clone();

            _matrix = new Matrix(m11, m12, m21, m22, dx, dy);
            _matrix.concat(curt);
            _matrixfxd = 1;
            _lineScale = (_matrix.a + _matrix.d) / 2;
        }

        private function setTransform(m11:Number, m12:Number,
                                      m21:Number, m22:Number,
                                       dx:Number,  dy:Number):void {
            // reset _matrixfxd flag
            if (m11 === 1 && !m12 && m22 === 1 && !m21 && !dx && !dy) {
                _matrixfxd = 0;
            }
            _matrix = new Matrix(m11, m12, m21, m22, dx, dy);
            _lineScale = (_matrix.a + _matrix.d) / 2;
        }

        private function quadraticCurveTo(cpx:Number, cpy:Number,
                                            x:Number,   y:Number):void {
        }
        private function fillText(text:String, x:Number, y:Number, maxWidth:Number): void {
        }
        private function strokeText(text:String, x:Number, y:Number, maxWidth:Number): void {
        }

        private function save(): void {
            var prop:Object = {};

            _copyprop(prop, this);
// TODO
//          prop._clipPath = this._clipPath ? String(this._clipPath) : null;
            _stack.push(prop);
        }

        private function restore(): void {
            _stack.length && _copyprop(this, _stack.pop());

        }

        private function _copyprop(to:Object, from:Object):void {
            to.globalAlpha      = from.globalAlpha;
            to.mix              = from.mix;
            to.strokeStyle      = from.strokeStyle;
            to.strokeColor      = from.strokeColor.concat();
            to.fillStyle        = from.fillStyle;
            to.fillColor        = from.fillColor.concat();
            to.lineWidth        = from.lineWidth;
            to.lineCap          = from.lineCap;
            to.lineJoin         = from.lineJoin;
            to.miterLimit       = from.miterLimit;
            to.shadowBlur       = from.shadowBlur;
            to.shadowColor      = from.shadowColor.concat();
            to.shadowOffsetX    = from.shadowOffsetX;
            to.shadowOffsetY    = from.shadowOffsetY;
            to.font             = from.font;
            to.textAlign        = from.textAlign;
            to.textBaseline     = from.textBaseline;
            to._lineScale       = from._lineScale;
            to._scaleX          = from._scaleX;
            to._scaleY          = from._scaleY;
            to._matrixfxd       = from._matrixfxd;
            to._matrix          = from._matrix.clone();
            to._clipPath        = from._clipPath;
        }

        private function _applyStrokeStyle():void {
            var matrix:Matrix;

            switch (strokeStyle) {
            case 0: _shape.graphics.lineStyle(
                            lineWidth * _lineScale,
                            strokeColor[0],
                            strokeColor[1] * globalAlpha,
                            true,
                            "normal",
                            lineCap,
                            lineJoin,
                            miterLimit);
                    break;
            case 1:
                    matrix = strokeMatrix.clone();
                    matrix.concat(_matrix);

                    _shape.graphics.lineStyle(lineWidth * _lineScale);
                    _shape.graphics.lineGradientStyle(
                            GradientType.LINEAR,
                            strokeColors,
                            strokeAlphas,
                            strokeRatios,
                            matrix);
                    break;
            }
        }

        private function _applyFillStyle():void {
            var matrix:Matrix;

            switch (fillStyle) {
            case 0: _shape.graphics.beginFill(
                            fillColor[0],
                            fillColor[1] * globalAlpha);
                    break;

            case 1:
                    matrix = fillMatrix.clone();
                    matrix.concat(_matrix);

                    _shape.graphics.beginGradientFill(
                            GradientType.LINEAR,
                            fillColors,
                            fillAlphas,
                            fillRatios,
                            matrix);
                    break;
            }
        }
    }
}
