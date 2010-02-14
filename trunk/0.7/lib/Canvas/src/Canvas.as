package {
    // debug
    import flash.system.Security; // for Security.allowDomain
    import flash.system.System;

    //
    import flash.display.Shape;
    import flash.display.Sprite;
    import flash.display.StageAlign;
    import flash.display.StageScaleMode;
    import flash.display.Bitmap;
    import flash.display.BitmapData;
    import flash.display.BlendMode;
    import flash.display.CapsStyle;
    import flash.display.Graphics;
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
        private var globalAlpha:Number;
        private var globalCompositeOperation:String;
        // --- colors and styles ---
        private var strokeStyle:int = 0;
        private var strokeColor:Array = [0, 1];
        private var fillStyle:int = 0;
        private var fillColor:Array = [0, 1];
        private var lineWidth:Number = 1;
        private var lineCap:String = "none"; // butt
        private var lineJoin:String = "miter";
        private var miterLimit:Number = 10;
        // --- shadows ---
        private var shadowBlur:Number;
        private var shadowColor:Array;
        private var shadowOffsetX:Number;
        private var shadowOffsetY:Number;
        // --- text ---
        private var font:String;
        private var textAlign:String;
        private var textBaseline:String;
        // --- hidden properties ---
        private var _lineScale:Number = 1;
        private var _scaleX:Number = 1;
        private var _scaleY:Number = 1;
        private var _matrixfxd:Number = 0;
        private var _matrix:Matrix = new Matrix();
        private var _stack:Array;
        private var _path:Array;
        private var _clipPath:String;
        private var _clipRect:String;
        private var _beginX:Number = 0;
        private var _beginY:Number = 0;
        private var _curtX:Number = 0;
        private var _curtY:Number = 0;
        private var shape:Shape;
        private var view:Bitmap;
        private var buff:BitmapData;
        private var canvasWidth:int = 300;
        private var canvasHeight:int = 150;
        private var msgid:String; // last message id

        public function Canvas() {
            // for local debug
            Security.allowDomain("*");

            ExternalInterface.addCallback("send", recv);

            shape = new Shape;
            stage.frameRate = 60;
            stage.scaleMode = "noScale"; // StageScaleMode.NO_SCALE;
            stage.align     = StageAlign.TOP_LEFT;
//          blendMode = BlendMode.LAYER;

            ExternalInterface.call("uu.flash.dmz." + ExternalInterface.objectID);
        }

        private function onEnterFrame(evt:Event):void {
            var cmd:Object = stage.loaderInfo.parameters;

            if (cmd.i && msgid !== cmd.i) {
trace(cmd.i + ":" + cmd.c);
                msgid = cmd.i; // update
                recv(cmd.c);
            }
        }

        private function recv(msg:String):void {
            var ary:Array = msg.split("\t");
            var i:int = -1;
            var iz:int = ary.length;
            var v:String;

/*
            if (buff) {
                buff.lock();
            }
 */
            while (++i < iz) {
                switch (ary[i]) { // {COMMAND}
                case "in": init(+ary[++i], +ary[++i]);
                           addEventListener("enterFrame", onEnterFrame);
                           break;
                case "gA": globalAlpha  = +ary[++i]; break;
                case "gC": globalCompositeOperation = ary[++i]; break;
                case "s0": strokeStyle  = 0;
                           strokeColor  = [+ary[++i], +ary[++i]]; break;
                case "f0": fillStyle    = 0;
                           fillColor    = [+ary[++i], +ary[++i]]; break;
                case "lW": lineWidth    = +ary[++i]; break;
                case "lC": v = ary[++i];
                           lineCap      = v === "butt" ? "none" : v; break;
                case "lJ": lineJoin     = ary[++i]; break;
                case "mL": miterLimit   = +ary[++i]; break;
                case "sB": shadowBlur   = +ary[++i]; break;
                case "sC": shadowColor  = [+ary[++i], +ary[++i]]; break;
                case "sX": shadowOffsetX= +ary[++i]; break;
                case "sY": shadowOffsetY= +ary[++i]; break;
                case "fo": font         = ary[++i]; break;
                case "tA": textAlign    = ary[++i]; break;
                case "tB": textBaseline = ary[++i]; break;
                case "re": rect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "rz": resize(+ary[++i], +ary[++i]); break;
                case "ar": arc(+ary[++i], +ary[++i], +ary[++i],
                               +ary[++i], +ary[++i], +ary[++i]); break;
                case "bP": beginPath(); break;
                case "cP": closePath(); break;
                case "mT": moveTo(+ary[++i], +ary[++i]); break;
                case "qC": quadraticCurveTo(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "lT": lineTo(+ary[++i], +ary[++i]); break;
                case "st": stroke(); break;
                case "fi": fill(); break;
                case "cA": clearAll(); break;
                case "cR": clearRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "fR": fillRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i], 1); break;
                case "sR": fillRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i], 0); break;
                case "sT": strokeText(ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "fT": fillText(ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
//              case "d3": drawImage(ary[++i], +ary[++i], +ary[++i]); break;
//              case "d5": drawImage(ary[++i], +ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
//              case "d9": drawImage(ary[++i], +ary[++i], +ary[++i], +ary[++i], +ary[++i],
//                                             +ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "ro": rotate(+ary[++i]); break;
                case "sc": scale(+ary[++i], +ary[++i]); break;
                case "ST": setTransform(+ary[++i], +ary[++i],
                                        +ary[++i], +ary[++i],
                                        +ary[++i], +ary[++i]); break;
                case "tf": x_transform(+ary[++i], +ary[++i],
                                       +ary[++i], +ary[++i],
                                       +ary[++i], +ary[++i]); break;
                case "tl": translate(+ary[++i], +ary[++i]); break;
                case "undefined": // [!] undefined trap
                    trace("[!] undefined trap");
                    return;
                default:
                    trace("[!] unknown command trap: " + ary[i]);
                    ExternalInterface.call("uu.flash.alert", "Unknown command=" + ary[i]);
                    return;
                }
            }
/*
            if (buff) {
                buff.unlock();
            }
 */
        }

        private function init(width:int, height:int):void {
            canvasWidth = width;
            canvasHeight = height;

            buff = new BitmapData(canvasWidth, canvasHeight, true, 0); // 300 x 150
            view = new Bitmap(buff, "always");
            addChild(view);
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

                x = p0.x;
                y = p0.y;
                sx = p1.x;
                sy = p1.y;
                ex = p2.x;
                ey = p2.y;
            }
            // add StartPoint
            _path.length ? lineTo(sx, sy)
                         : moveTo(_beginX = sx, _beginY = sy);

            if (Math.round(sx * 1000) === Math.round(ex * 1000)
                && Math.round(sy * 1000) === Math.round(ey * 1000)) {
                _path.push("c", x, y, radius); // circle
            } else {
                _path.push("a", x, y, radius, startAngle, endAngle, anticlockwise); // arc
            }
            _curtX = ex;
            _curtY = ey;
        }

        private function beginPath():void {
            _path = []; // reset;
        }

        private function closePath():void {
            _path.push("x", _curtX = _beginX, _curtY = _beginY);
        }

        private function moveTo(x:Number, y:Number):void {
            if (_matrixfxd) {
                var p:Point = _matrix.transformPoint(new Point(x, y));

                x = p.x;
                y = p.y;
            }
            _path.push("m", _curtX = x, _curtY = y);
        }

        private function lineTo(x:Number, y:Number):void {
            if (_matrixfxd) {
                var p:Point = _matrix.transformPoint(new Point(x, y));

                x = p.x;
                y = p.y;
            }
            _path.push("l", _curtX = x, _curtY = y);
        }

        private function clearAll():void {
            shape.graphics.beginFill(0);
            shape.graphics.drawRect(0, 0, canvasWidth, canvasHeight);
            shape.graphics.endFill();

            buff.draw(shape, _matrix, null, "erase"); // BlendMode.ERASE
            shape.graphics.clear();
        }

        private function clearRect(x:Number, y:Number, w:Number, h:Number):void {
            shape.graphics.beginFill(0);
            shape.graphics.drawRect(x, y, w, h);
            shape.graphics.endFill();

            buff.draw(shape, _matrix, null, "erase"); // BlendMode.ERASE
//          buff.draw(shape, _matrix, null, "invert");
            shape.graphics.clear();
        }

        private function stroke():void {
            // lineStyle(thickness:Number, rgb:Number, alpha:Number, pixelHinting:Boolean, noScale:String, capsStyle:String, jointStyle:String, miterLimit:Number)
            switch (strokeStyle) {
            case 0: shape.graphics.lineStyle(lineWidth * _lineScale,
                                strokeColor[0],
                                strokeColor[1] * globalAlpha,
                                true,       // pixelHinting
                                "normal",   // scaleMode
                                lineCap,
                                lineJoin,
                                miterLimit);
                    break;
            }
            buildPath(_path);
            buff.draw(shape);
            shape.graphics.clear();
        }

        private function fill():void {
            switch (strokeStyle) {
            case 0: shape.graphics.beginFill(fillColor[0],
                                             fillColor[1] * globalAlpha);
                    break;
            }
            buildPath(_path);
            shape.graphics.endFill();
            buff.draw(shape);
            shape.graphics.clear();
        }

        private function buildPath(ary:Array):void {
            var i:int = -1;
            var iz:int = ary.length;

            while (i < iz) {
                switch (ary[++i]) {
                case "x": // closePath
                    shape.graphics.lineTo(ary[++i], ary[++i]);
                    break;
                case "m": // moveTo
                    shape.graphics.moveTo(ary[++i], ary[++i]);
                    break;
                case "l": // lineTo
                    shape.graphics.lineTo(ary[++i], ary[++i]);
                    break;
                case "c": // circle
                    shape.graphics.drawCircle(ary[++i], ary[++i], ary[++i]);
                    break;
                case "a": // arc
                    drawArc(ary[++i], ary[++i], ary[++i],
                            ary[++i], ary[++i], ary[++i]);
                }
            }
        }

        private function drawArc(x:Number, y:Number, radius:Number,
                                 startAngle:Number, endAngle:Number,
                                 anticlockwise:Number):void {

        }

        private function fillRect(x:Number, y:Number,
                                  w:Number, h:Number, fill:int):void {
            if (fill) {
                switch (fillStyle) {
                // beginFill(color, alpha)
                case 0: shape.graphics.beginFill(fillColor[0],
                                                 fillColor[1] * globalAlpha);
                        break;
                }
            } else {
                var width:Number;
                var alpha:Number;

                switch (strokeStyle) {
                case 0: width = lineWidth * _lineScale;
                        alpha = strokeColor[1] * globalAlpha;
                        if (!_matrixfxd && width === 1 && alpha > 0.5) {
                            width = 2;
                            alpha = 0.5;
                        }
                        shape.graphics.lineStyle(width,
                                strokeColor[0],
                                alpha,
                                true,
                                "normal",
                                lineCap,
                                lineJoin,
                                miterLimit);
                        break;
                }
            }
            var p1:Point = _matrix.transformPoint(new Point(x, y));
            var p2:Point = _matrix.transformPoint(new Point(x + w, y));
            var p3:Point = _matrix.transformPoint(new Point(x + w, y + h));
            var p4:Point = _matrix.transformPoint(new Point(x, y + h));

            shape.graphics.moveTo(p1.x, p1.y);
            shape.graphics.lineTo(p2.x, p2.y);
            shape.graphics.lineTo(p3.x, p3.y);
            shape.graphics.lineTo(p4.x, p4.y);
            shape.graphics.lineTo(p1.x, p1.y);
            if (fill) {
                shape.graphics.endFill();
            }

            buff.draw(shape);
            shape.graphics.clear();
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

        private function resize(w:Number, h:Number):void {
            _beginX = _beginY = 0;
            _curtX = _curtY = 0;
            _matrix = new Matrix();

            canvasWidth  = w;
            canvasHeight = h;

            buff.dispose();
            buff = new BitmapData(canvasWidth, canvasHeight, true, 0);
            view = new Bitmap(buff);
            addChild(view);
        }

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

            _matrix.identity();
            _matrix.translate(x, y);
            _matrix.concat(curt);
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
    }
}
