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
        private var _scaleX:Number;
        private var _scaleY:Number;
        private var _efx:Number;
        private var _mtx:Array;
        private var _stack:Array;
        private var _path:Array;
        private var _clipPath:String;
        private var _clipRect:String;
        private var _beginPos:Point = new Point();
        private var _curtPos:Point = new Point();
        private var matrix:Matrix = new Matrix();
        private var shape:Shape;
        private var view:Bitmap;
        private var buff:BitmapData;
        private var canvasWidth:int = 300;
        private var canvasHeight:int = 150;

        public function Canvas() {
            // for local debug
            Security.allowDomain("127.0.0.1");


            ExternalInterface.addCallback("send", recv);

            shape = new Shape;
            stage.frameRate = 60;
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align     = StageAlign.TOP_LEFT;

/*
 */

            ExternalInterface.call("uu.flash.dmz." + ExternalInterface.objectID);
        }

        private function recv(msg:String):void {
//ExternalInterface.call("uu.flash.alert", "recv=" + msg.replace(/\t/g, ":"));
/*
            trace("memory = " + System.totalMemory);
 */

            var ary:Array = msg.split("\t");
            var i:int = -1;
            var iz:int = ary.length;
            var v:String;

//            buff.lock();
            while (++i < iz) {
                switch (ary[i]) { // {COMMAND}
                case "in": init(+ary[++i], +ary[++i]); break;
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
                case "re": resize(+ary[++i], +ary[++i]); break;
                case "bP": beginPath(); break;
                case "cP": closePath(); break;
                case "mT": moveTo(+ary[++i], +ary[++i]); break;
                case "lT": lineTo(+ary[++i], +ary[++i]); break;
                case "st": stroke(); break;
                case "cA": clearAll(); break;
                case "cR": clearRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "fR": fillRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
//              case "sR": strokeRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
//              case "sT": strokeText(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                default:
                    ExternalInterface.call("uu.flash.alert", "recv=unknown command=" + ary[i]);
                    return;
                }
            }
//            buff.unlock();
        }

        private function init(width:int, height:int):void {
            canvasWidth = width;
            canvasHeight = height;

            buff = new BitmapData(canvasWidth, canvasHeight, true, 0); // 300 x 150
            view = new Bitmap(buff, "always");
            addChild(view);
        }

        private function beginPath():void {
            _path = []; // reset;
        }

        private function closePath():void {
            _path.push("x", _beginPos.x, _beginPos.y);

            _curtPos.x = _beginPos.x;
            _curtPos.y = _beginPos.y;
        }

        private function moveTo(x:Number, y:Number):void {
            var p:Point = _map(x, y);

            _path.push("m", p.x, p.y);

            _curtPos.x = p.x;
            _curtPos.y = p.y;
        }

        private function lineTo(x:Number, y:Number):void {
            var p:Point = _map(x, y);

            _path.push("l", p.x, p.y);
            _curtPos.x = p.x;
            _curtPos.y = p.y;
        }

        private function clearAll():void {
            shape.graphics.beginFill(0);
            shape.graphics.drawRect(0, 0, canvasWidth, canvasHeight);
            shape.graphics.endFill();

            buff.draw(shape, matrix, null, "erase"); // BlendMode.ERASE
            shape.graphics.clear();
        }

        private function clearRect(x:Number, y:Number, w:Number, h:Number):void {
            shape.graphics.beginFill(0);
            shape.graphics.drawRect(x, y, w, h);
            shape.graphics.endFill();

            buff.draw(shape, matrix, null, "erase"); // BlendMode.ERASE
            shape.graphics.clear();
        }

        private function stroke():void {
//public lineStyle(thickness:Number, rgb:Number, alpha:Number, pixelHinting:Boolean, noScale:String, capsStyle:String, jointStyle:String, miterLimit:Number) : Void
/*
trace("---stroke---");
trace("color =" + strokeColor[0]);
trace("alpha =" + strokeColor[1] * globalAlpha);
trace("lineWidth =" + lineWidth * _lineScale);
trace("lineCap =" + lineCap);
trace("lineJoin =" + lineJoin);
trace("miterLimit =" + miterLimit);
 */

            switch (strokeStyle) {
            case 0: shape.graphics.lineStyle(lineWidth * _lineScale,
                                strokeColor[0],
                                strokeColor[1] * globalAlpha,
                                true,
                                "normal",
                                lineCap,
                                lineJoin,
                                miterLimit);
                    break;
            }
//ExternalInterface.call("uu.flash.alert", "stroke = " + strokeStyle.join(","));

            buildPath(_path);

            buff.draw(shape);
            shape.graphics.clear();
        }

        private function buildPath(ary:Array):void {
            var i:int = 0;
            var iz:int = ary.length;

            while (i < iz) {
                switch (ary[i]) {
                case "x":
                    shape.graphics.lineTo(ary[i+1], ary[i+2]);
                    i += 3;
                    break;
                case "m":
                    shape.graphics.moveTo(ary[i+1], ary[i+2]);
                    i += 3;
                    break;
                case "l":
                    shape.graphics.lineTo(ary[i+1], ary[i+2]);
                    i += 3;
                    break;
                }
            }
        }

        private function fillRect(x:Number, y:Number, w:Number, h:Number):void {
// beginFill(color, alpha)
            // gp.lineStyle(); // clear
/*
trace("globalAlpha =" + globalAlpha);
trace("fillColor =" + fillColor[0]);
trace("fillColor =" + fillColor[1]);
 */
            switch (fillStyle) {
            case 0: shape.graphics.beginFill(fillColor[0], fillColor[1] * globalAlpha); break;
            }

            shape.graphics.moveTo(x, y);
            shape.graphics.lineTo(x + w, y);
            shape.graphics.lineTo(x + w, y + h);
            shape.graphics.lineTo(x, y + h);
            shape.graphics.lineTo(x, y);
            shape.graphics.endFill();

            buff.draw(shape);
            shape.graphics.clear();
        }

        private function _map(x:Number, y:Number):Point {
            return matrix.transformPoint(new Point(x, y));
        }

        private function resize(w:Number, h:Number):void {
            this._beginPos      = new Point();
            this._curtPos       = new Point();
            this.matrix = new Matrix();

            canvasWidth  = w;
            canvasHeight = h;

            buff.dispose();
//ExternalInterface.call("uu.flash.alert", "dispose");
            buff = new BitmapData(canvasWidth, canvasHeight, true, 0);
//ExternalInterface.call("uu.flash.alert", "new BitmapData");
            view = new Bitmap(buff);
//ExternalInterface.call("uu.flash.alert", "view");
            addChild(view);
//ExternalInterface.call("uu.flash.alert", "addChild");
        }

    }
}
