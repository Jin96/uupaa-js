package {
    import flash.external.*;
    import flash.display.*;
    import flash.filters.*;
    import flash.events.*;
    import flash.utils.*;
    import flash.geom.*;

    public class Canvas extends Sprite {
        // --- dimensions ---
        public  var canvasWidth:int = 300;
        public  var canvasHeight:int = 150;
        // --- compositing ---
        public  var globalAlpha:Number = 1; // globalAlpha
        private var mix:int = 0; // globalCompositeOperation
        private var mixMode:String = ""; // globalCompositeOperation
        // --- colors and styles ---
        public  var strokeStyle:int = 0; // 0: color, 1: liner, 2: radial, 3: pattern
        public  var strokeColor:Array = [0, 1];
        private var strokeGradient:CanvasGradient = new CanvasGradient();
        private var strokePattern:Array = []; // [url, repeation]
        public  var fillStyle:int = 0; // 0: color, 1: liner, 2: radial, 3: pattern
        public  var fillColor:Array = [0, 1];
        private var fillGradient:CanvasGradient = new CanvasGradient();
        private var fillPattern:Array = []; // [url, repeation]
        public  var lineWidth:Number = 1;
        public  var lineCap:String = "none"; // butt
        public  var lineJoin:String = "miter";
        public  var miterLimit:Number = 10;
        // --- shadows ---
        public  var shadowBlur:Number;
        public  var shadowColor:Array = [0, 1];
        public  var shadowOffsetX:Number;
        public  var shadowOffsetY:Number;
        // --- text ---
        public  var font:Array = []; // [style, weight, variant, family]
        public  var textAlign:String = "start";
        public  var textBaseline:String = "alphabetic";
        // --- current positon, start position ---
        private var bx:Number = 0; // begin position x
        private var by:Number = 0; // begin position y
        private var px:Number = 0; // current position x
        private var py:Number = 0; // current position y
        // --- hidden properties ---
        private var _lineScale:Number = 1;
        private var _scaleX:Number = 1;
        private var _scaleY:Number = 1;
        private var _matrixfxd:Number = 0;
        private var _matrix:Matrix;
        private var _stack:Array = [];
        private var _path:Array = [];
        private var _clipPath:Array = [];
        private var _clipShape:Shape = new Shape();
        // --- Shape, Filter ---
        private var _shape:Shape;
        private var _gfx:Graphics; // shape.graphics
        private var _view:Bitmap;
        private var _buff:BitmapData;
        private var _clearBitmap:BitmapData; // clearAll()
        private var _shadowFilter:BitmapFilter; // shadow filter
        private var _mode:int = 0; // 1: xFlyweight
        // --- JavaScript <- -> ActionScript ---
        private var _lastMessageID:String = "";
        private var _state:int = 0;     // 0: not ready(locked)
                                        // 1: not ready -> ready
                                        // 2: ready
        private var _jscallback:Array = [];
        // --- command stock ---
        public  var _stock:Array = [];
        // --- ActionScript <- -> ActionScript ---
        private var _callback:Function = null; // for copyCanvas
        // --- sub class instance ---
        private var fillImage:CanvasImage;
        private var strokeImage:CanvasImage;
        private var canvasArc:CanvasArc = new CanvasArc();
        private var canvasBezier:CanvasBezier = new CanvasBezier();
        private var canvasPixel:CanvasPixel;
        private var canvasText:CanvasText;
        private var canvasCopy:CanvasCopy;
        private var canvasDrawImage:CanvasDrawImage;

        public function Canvas() {
            ExternalInterface.addCallback("send", recv);
            ExternalInterface.addCallback("resize", resize);
            ExternalInterface.addCallback("toDataURL", toDataURL);
            ExternalInterface.addCallback("getImageData", getImageData);
            ExternalInterface.addCallback("isPointInPath", isPointInPath);
            ExternalInterface.addCallback("addJsCallback", addJsCallback);

            _shape = new Shape();
            _gfx = _shape.graphics;
            _shape.mask = null;

            stage.frameRate = 62.5;
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align     = StageAlign.TOP_LEFT;

            fillImage   = new CanvasImage(this);
            strokeImage = new CanvasImage(this);
            canvasPixel = new CanvasPixel(this);
            canvasText  = new CanvasText(this);
            canvasCopy  = new CanvasCopy(this);
            canvasDrawImage = new CanvasDrawImage(this);

            // send "initialized" message
            ExternalInterface.call("uu.dmz." + ExternalInterface.objectID);
        }

        public function get bitmapData():BitmapData {
            return _buff;
        }

        public function get shadowFilter():BitmapFilter {
            return _shadowFilter;
        }

        public function get matrix():Matrix {
            return _matrix;
        }

        public function set callback(fn:Function):void {
            _callback = fn;
        }

        private function onEnterFrame(event:Event):void {
            var message:Object = stage.loaderInfo.parameters;
            var messageID:String = message.i;
            var messageBody:String = message.b;
            var commands:String;

            if (messageID) {
                if (_lastMessageID !== messageID) {
                    _lastMessageID = messageID; // update

0 && trace(ExternalInterface.objectID + ", valid message=" + messageID + ":" + messageBody);

                    switch (_state) {
                    case 0: // not ready(locked)
                            _stock.push(messageBody);
                            break;
                    case 1: // not ready(locked) -> ready
                            _state = 2;
                            _buff && _buff.lock();

                                messageBody && _stock.push(messageBody);
                                commands = _stock.join("\t").replace(/^\t+/, ""); // trim head(\t)

                                _stock = []; // pre clear
                                commands && recv(commands);

                            _buff && _buff.unlock();
                            break;
                    case 2: // ready
                            _buff && _buff.lock();

                                recv(messageBody);

                            _buff && _buff.unlock();
                    }
                }
            }


            // copy ready
            if (_state && !_stock.length && _jscallback.length) {
                var timer:Timer = new Timer(10, 1);

                timer.addEventListener(TimerEvent.TIMER, execJsCallback);
                timer.start();
            }

        }

        public function next(state:int = -1):void {
            if (state !== -1) {
                _state = state;
            }

            if (_state) {
                _buff && _buff.lock();

                    var commands:String = _stock.join("\t").replace(/^\t+/, "");

                    _stock = []; // pre clear
                    commands && recv(commands);

                _buff && _buff.unlock();
            }

            // wait for copyCanvas
            if (_callback !== null && !_stock.length) {
                _callback();
            }
        }

        public function recv(commands:String):void {
            var a:Array = commands.split("\t"); // command array
            var i:int = -1;
            var iz:int = a.length;
            var fill:int;
            var loopout:int = 0;
            var modify:int = 0; // canvas updated

0 && trace(ExternalInterface.objectID + "[recv] "+commands);

            while (++i < iz) {
                fill = 0;
                switch (a[i]) { // COMMAND
                case "in":  init(+a[++i], +a[++i], +a[++i]);
                            _state = 1; // not ready(locked) -> ready
                            addEventListener("enterFrame", onEnterFrame);
                            break;
                case "xp":  CanvasImageCache.getInstance().clear(); break;
                case "rt":  canvasText.direction = 1; break; // direction = rtl
                case "gA":  globalAlpha = +a[++i]; break;
                case "gC":  mix = 0;
                            switch (mixMode = a[++i]) {
//                          case "source-over":     break;
//                          case "source-in":       break;
//                          case "source-out":      break;
//                          case "source-atop":     break;
                            case "destination-over": mix = 1; break;
//                          case "destination-in":  break;
                            case "destination-out": mix = 1; mixMode = BlendMode.ERASE;  break;
//                          case "destination-atop": break;
                            case "lighter":         mix = 1; mixMode = BlendMode.ADD;    break;
                            case "darker":          mix = 1; mixMode = BlendMode.DARKEN; break;
                            case "copy":            mix = 1; break;
//                          case "xor":
                            }
                            break;
                case "s0":  strokeStyle = 0;
                            strokeColor = [+a[++i], +a[++i]]; break;
                case "s1":  strokeStyle = 1;
                            i = strokeGradient.setLiner(a, i); break;
                case "s2":  strokeStyle = 2;
                            i = strokeGradient.setRadial(a, i); break;
                case "s3":  strokeStyle = 3;
                            loadPatternImage(a[++i], a[++i], 0);
                            if (_state < 2) {
                                _stock.push(a.slice(++i).join("\t")); // push remain commands
                                ++loopout;
                            }
                            break;
                case "f0":  fillStyle = 0;
                            fillColor = [+a[++i], +a[++i]]; break;
                case "f1":  fillStyle = 1;
                            i = fillGradient.setLiner(a, i); break;
                case "f2":  fillStyle = 2;
                            i = fillGradient.setRadial(a, i); break;
                case "f3":  fillStyle = 3;
                            loadPatternImage(a[++i], a[++i], 1);
                            if (_state < 2) {
                                _stock.push(a.slice(++i).join("\t")); // push remain commands
                                ++loopout;
                            }
                            break;
                case "lC":  lineCap = a[++i];
                            lineCap === "butt" && (lineCap = "none"); break;
                case "lJ":  lineJoin = a[++i]; break;
                case "lW":  lineWidth = +a[++i]; break;
                case "mL":  miterLimit = +a[++i]; break;
                case "sh":  shadowBlur = +a[++i];
                            shadowColor = [+a[++i], +a[++i]];
                            shadowOffsetX = +a[++i];
                            shadowOffsetY = +a[++i];
                            setShadow(); break;
                case "fo":  font = [+a[++i], a[++i], a[++i], a[++i], a[++i]]; break;
                case "tA":  textAlign = a[++i]; break;
                case "tB":  textBaseline = a[++i]; break;
                case "re":  rect(+a[++i], +a[++i], +a[++i], +a[++i]); break;
                case "bP":  _path = []; break; // reset path
                case "cP":  closePath(); break;
                case "cR":  ++modify;
                            clearRect(+a[++i], +a[++i], +a[++i], +a[++i]); break;
                case "cA":  ++modify;
                            clearAll(); break;
                case "mT":  moveTo(a[++i] * 0.001, a[++i] * 0.001); break;
                case "lT":  lineTo(a[++i] * 0.001, a[++i] * 0.001); break;
                case "ar":  arc(+a[++i], +a[++i], +a[++i],
                                +a[++i], +a[++i], +a[++i]); break;
                case "at":  arcTo(+a[++i], +a[++i], +a[++i],
                                  +a[++i], +a[++i]); break;
                case "qC":  quadraticCurveTo(+a[++i], +a[++i],
                                             +a[++i], +a[++i]); break;
                case "bC":  bezierCurveTo(+a[++i], +a[++i],
                                          +a[++i], +a[++i],
                                          +a[++i], +a[++i]); break;
                case "fi":  fill = 1; // [THROUGH]
                case "st":  ++modify;
                            stroke(fill); break;
                case "fR":  fill = 1; // [THROUGH]
                case "sR":  ++modify;
                            strokeRect(+a[++i], +a[++i], +a[++i], +a[++i], fill); break;
                case "fT":  fill = 1; // [THROUGH]
                case "sT":  ++modify;
                            canvasText.draw(a[++i], +a[++i], +a[++i], +a[++i], fill); break;
                case "cl":  clip(); break;
                case "d0":  ++modify;
                            drawImage(+a[++i], a[++i],
                                      [+a[++i], +a[++i], +a[++i], +a[++i],
                                       +a[++i], +a[++i], +a[++i], +a[++i]]);
                            if (_state < 2) {
                                _stock.push(a.slice(++i).join("\t")); // push remain commands
                                ++loopout;
                            }
                            break;
                case "d1":  if (modify) {
                                modify = 0;
                                canvasCopy.purge();
                            }
                            canvasCopy.draw(+a[++i], a[++i], // <object id>
                                            { sx: +a[++i], sy: +a[++i], sw: +a[++i], sh: +a[++i],
                                              dx: +a[++i], dy: +a[++i], dw: +a[++i], dh: +a[++i] });
                            break;
                case "ro":  rotate(a[++i] * 0.000001); break;
                case "sc":  scale(+a[++i], +a[++i]); break;
                case "ST":  setTransform(+a[++i], +a[++i], +a[++i], +a[++i],
                                         +a[++i], +a[++i]); break;
                case "tf":  transform__(+a[++i], +a[++i], +a[++i], +a[++i],
                                        +a[++i], +a[++i]); break;
                case "tl":  translate(+a[++i], +a[++i]); break;
                case "sv":  save(); break;
                case "rs":  restore(); break;
                case "pI":  canvasPixel.putImageData(
                                +a[++i],    // imagedata.width,
                                +a[++i],    // imagedata.height,
                                +a[++i],    // dx,
                                +a[++i],    // dy,
                                +a[++i],    // dirtyX,
                                +a[++i],    // dirtyY,
                                +a[++i],    // dirtyWidth,
                                +a[++i],    // dirtyHeight,
                                 a[++i]);   // "rawdata,..."
                            break;
                case "X0":  ++modify;
                            drawCircle(+a[++i], +a[++i], +a[++i], // x, y, r
                                       +a[++i], +a[++i],          // fillColor.hex, fillColor.a
                                       +a[++i], +a[++i],          // strokeColor.hex, strokeColor.a
                                       +a[++i]);                  // lineWidth
                            break;
                case "X1":  ++modify;
                            drawRoundRect(+a[++i], +a[++i],          // x, y,
                                          +a[++i], +a[++i],          // width, height
                                          [+a[++i], +a[++i],         // round[0], round[1]
                                           +a[++i], +a[++i]],        // round[2], round[3]
                                          +a[++i], +a[++i],          // fillColor.hex, fillColor.a
                                          +a[++i], +a[++i],          // strokeColor.hex, strokeColor.a
                                          +a[++i]);                  // lineWidth
                            break;
                case "XX":  // dummy
                            break;
                case "undefined": // [!] undefined trap
                            trace("[!] undefined trap");
                            ++loopout;
                            break;
                default:    trace("[!] unknown command trap: " + a[i]);
                            ExternalInterface.call("uu.flash.alert", "Unknown command=" + a[i]);
                            ++loopout;
                }
                if (loopout) {
                    break;
                }
            }
            if (modify) {
                canvasCopy.purge();
            }
        }

        public function addJsCallback(guid:String):void {
//trace("addJsCallback=" + guid);
            _jscallback.push(guid);
        }

        // callback javascript functions
        private function execJsCallback(event:TimerEvent):void {
            var ary:Array = _jscallback.concat(),
                i:int = 0, iz:int = ary.length, fn:String;

            // pre clear
            _jscallback = [];

            for (; i < iz; ++i) {
                fn = "uu.dmz." + ExternalInterface.objectID + ary[i];

//trace("execJsCallback.callback=" + fn);

                // callback
                ExternalInterface.call(fn);
            }

        }

        private function init(width:int, height:int, mode:int):void {
//trace(ExternalInterface.objectID + " init(), width="+width+",height="+height);
            _mode = mode;
            canvasWidth = width;
            canvasHeight = height;

            // reset matrix
            _matrix = new Matrix();

            // reset path
            _path = [];

            // reset path current position
            bx = by = px = py = 0;

            // reset mask
            _shape.mask = null;

            // reset canvas
            if (_buff) {
//                clearAll();
                _buff.dispose();
                _buff = new BitmapData(width, height, true, 0); // 300 x 150
                _view.bitmapData = _buff;
            } else {
                _buff = new BitmapData(width, height, true, 0); // 300 x 150
                _view = new Bitmap(_buff,
                                   mode ? PixelSnapping.AUTO : PixelSnapping.NEVER,
                                   mode ? false : true);
                addChild(_view);
            }

            // build clearAll params
            _clearBitmap = _buff.clone();
        }

        public function resize(width:int, height:int, mode:int):void {
//trace("resize(), width="+width+",height="+height);
            canvasCopy.purge();
            CanvasImageCache.getInstance().clear();
            init(width, height, mode);
        }

        private function clearAll():void {
            _buff.copyPixels(_clearBitmap, _clearBitmap.rect, new Point());
        }

        public function toDataURL(mimeType:String,
                                  jpegQuality:Number):String {
            return canvasPixel.toDataURL(mimeType, jpegQuality);
        }

        public function getImageData(sx:int, sy:int, sw:int, sh:int):Array {
            return canvasPixel.getImageData(sx, sy, sw, sh);
        }

        public function isPointInPath(x:int, y:int):Boolean {
            var shape:Shape = new Shape();
            var gfx:Graphics = shape.graphics;
            var bitmapData:BitmapData = new BitmapData(canvasWidth, canvasHeight,
                                                       false, 0xFFFFFFFF);
            var bitmap:Bitmap = new Bitmap(bitmapData);

            gfx.beginFill(0);
            buildPath(_path, gfx);
            gfx.endFill();

if (0) {
    trace(_path.join(","));
    gfx.lineStyle(0, 0xff00ff00, 1);
    gfx.drawCircle(x, y, 5);
}
            bitmapData.draw(shape);
            gfx.clear();

            var dot:uint = bitmapData.getPixel(x, y);

if (0) {
    addChild(bitmap);
    trace("x="+x);
    trace("y="+y);
    trace("dot="+dot);
}

            // search black dot
            return dot === 0;
        }

        private function buildPath(ary:Array, gfx:Graphics):void {
            var i:int = -1;
            var iz:int = ary.length;

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
                case "q": // quadraticCurveTo
                    gfx.curveTo(ary[++i], ary[++i],  // cpx, cpy
                                ary[++i], ary[++i]); // x, y
                    break;
                case "t": // arcTo
/*
                    drawArcTo(gfx,
                              ary[++i], ary[++i],            // x0, y0
                              ary[++i], ary[++i],            // x1, y1
                              ary[++i], ary[++i], ary[++i]); // x2, y2, radius
 */
                    break;
                case "a": // arc
                    canvasArc.draw(gfx, _matrix,
                                    ary[++i], ary[++i], ary[++i],
                                    ary[++i], ary[++i], ary[++i]);
                    break;
                case "b": // bezierCurveTo
                    canvasBezier.draw(gfx,
                                      ary[++i], ary[++i],
                                      ary[++i], ary[++i]);
                }
            }
        }

        private function arc(x:Number, y:Number, radius:Number,
                             startAngle:Number, endAngle:Number, anticlockwise:Number):void {
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
            // add begin point
            _path.length ? _path.push("l", sx, sy)
                         : _path.push("m", bx = sx, by = sy);

            if (_scaleX === _scaleY
                && Math.round(sx * 100) === Math.round(ex * 100)
                && Math.round(sy * 100) === Math.round(ey * 100)) {
                // circle
                _path.push("c", x, y, _scaleX * radius);
            } else {
                // arc
                _path.push("a", x, y, radius, startAngle, endAngle,
                           anticlockwise);
            }
            px = ex;
            py = ey;
        }

        private function arcTo(x1:Number, y1:Number,
                               x2:Number, y2:Number, radius:Number):void {
        }

        private function moveTo(x:Number, y:Number):void {
            if (_matrixfxd) {
                var p:Point = _matrix.transformPoint(new Point(x, y));

                x = p.x;
                y = p.y;
            }
            _path.push("m", bx = px = x, by = py = y);
        }

        private function lineTo(x:Number, y:Number):void {
            if (_matrixfxd) {
                var p:Point = _matrix.transformPoint(new Point(x, y));

                x = p.x;
                y = p.y;
            }
            // add begin point
            _path.length || _path.push("m", bx = x, by = y);

            _path.push("l", px = x, py = y);
        }

        private function bezierCurveTo(cp1x:Number, cp1y:Number,
                                       cp2x:Number, cp2y:Number,
                                          x:Number,    y:Number):void {
            var cp1:Point = _matrix.transformPoint(new Point(cp1x, cp1y));
            var cp2:Point = _matrix.transformPoint(new Point(cp2x, cp2y));
            var   p:Point = _matrix.transformPoint(new Point(x, y));

            // add begin point
            _path.length || _path.push("m", px = bx = cp1.x,
                                            py = by = cp1.y);
            _path.push("b", new Point(px, py), cp1, cp2, p);
            px = p.x;
            py = p.y;
        }

        private function quadraticCurveTo(cpx:Number, cpy:Number,
                                            x:Number,   y:Number):void {
            var cp:Point = _matrix.transformPoint(new Point(cpx, cpy));
            var  p:Point = _matrix.transformPoint(new Point(x, y));

            // add begin point
            _path.length || _path.push("m", bx = cpx, by = cpy);

            _path.push("q", cp.x, cp.y, px = p.x, py = p.y);
        }

        private function closePath():void {
            if (_path.length) {
                if (px !== bx || py !== by) {
                    _path.push("x", px = bx, py = by);
                }
            }
        }

        private function clearRect(x:Number, y:Number, w:Number, h:Number):void {
            if (!x && !y && w >= canvasWidth && h >= canvasHeight) {
                clearAll();
            } else {
                _gfx.beginFill(0);
                _gfx.drawRect(x, y, w, h);
                _gfx.endFill();

                _buff.draw(_shape, _matrix, null, BlendMode.ERASE, null, true);
                _gfx.clear();
            }
        }

        private function stroke(fill:int):void {
            fill ? _applyFillStyle()
                 : _applyStrokeStyle();

            buildPath(_path, _gfx);
            fill && _gfx.endFill();

            mixin(_buff, _shape, null);
            _gfx.clear();
        }

        private function strokeRect(x:Number, y:Number,
                                    w:Number, h:Number, fill:int):void {
            fill ? _applyFillStyle()
                 : _applyStrokeStyle();

            if (_matrixfxd) {
                var p1:Point = _matrix.transformPoint(new Point(x, y));
                var p2:Point = _matrix.transformPoint(new Point(x + w, y));
                var p3:Point = _matrix.transformPoint(new Point(x + w, y + h));
                var p4:Point = _matrix.transformPoint(new Point(x, y + h));

                _gfx.moveTo(p1.x, p1.y);
                _gfx.lineTo(p2.x, p2.y);
                _gfx.lineTo(p3.x, p3.y);
                _gfx.lineTo(p4.x, p4.y);
                _gfx.lineTo(p1.x, p1.y);
            } else {
                _gfx.drawRect(x, y, w, h);
            }

            fill && _gfx.endFill();

            mixin(_buff, _shape, null);
            _gfx.clear();
        }

        private function rect(x:Number, y:Number, w:Number, h:Number):void {
            moveTo(x, y);
            lineTo(x + w, y);
            lineTo(x + w, y + h);
            lineTo(x, y + h);
            lineTo(x, y);
            closePath();
        }

        private function clip():void {
            _clipShape.graphics.clear();
            _clipShape.graphics.beginFill(0);
            buildPath(_clipPath = _path.concat(), _clipShape.graphics);
            _clipShape.graphics.endFill();

            // apply mask
            _shape.mask = _clipShape;
        }

        private function scale(x:Number, y:Number):void {
            _matrixfxd = 1;

            var curt:Matrix = _matrix.clone();

            _matrix.identity(); // reset
            _matrix.scale(x, y);
            _matrix.concat(curt); // matrix multiply

            _scaleX *= x;
            _scaleY *= y;
            _lineScale = (_matrix.a + _matrix.d) / 2;
        }

        private function rotate(angle:Number):void {
            _matrixfxd = 1;

            var curt:Matrix = _matrix.clone();

            _matrix.identity(); // reset
            _matrix.rotate(angle);
            _matrix.concat(curt); // matrix multiply
        }

        private function translate(x:Number, y:Number):void {
            _matrixfxd = 1;

            var curt:Matrix = _matrix.clone();

            _matrix.identity(); // reset
            _matrix.translate(x, y);
            _matrix.concat(curt); // matrix multiply
        }

        private function transform__(m11:Number, m12:Number,
                                     m21:Number, m22:Number,
                                      dx:Number,  dy:Number):void {
            _matrixfxd = 1;

            var curt:Matrix = _matrix.clone();

            _matrix = new Matrix(m11, m12, m21, m22, dx, dy);
            _matrix.concat(curt); // matrix multiply
            _lineScale = (_matrix.a + _matrix.d) / 2;
        }

        private function setTransform(m11:Number, m12:Number,
                                      m21:Number, m22:Number,
                                       dx:Number,  dy:Number):void {
            _matrixfxd = 1;

            // reset _matrixfxd flag
            if (m11 === 1 && !m12 && m22 === 1 && !m21 && !dx && !dy) {
                _matrixfxd = 0;
            }
            _matrix = new Matrix(m11, m12, m21, m22, dx, dy);
            _lineScale = (_matrix.a + _matrix.d) / 2;
        }

        private function drawImage(args:Number, // 3, 5, 9
                                   url:String,
                                   param:Array):void {
            var me:* = this;
            var canvasImage:CanvasImage = new CanvasImage(this);
            var rv:Boolean = canvasImage.load(url, function():void {
                me.canvasDrawImage.draw(args, param, canvasImage.bitmapData);
                me.next(1);
            });

            next(rv ? 2 : 0);
        }

        private function save(): void {
            var prop:Object = {};

            _copyprop(prop, this);
            _stack.push(prop);
        }

        private function restore(): void {
            if (_stack.length) {
                var last:Object = _stack.pop();

                // rebuild clipping mask
                if (last._clipPath.join(",") !== _clipPath.join(",")) {
                    _clipShape.graphics.clear();
                    _clipShape.graphics.beginFill(0);
                    buildPath(last._clipPath, _clipShape.graphics);
                    _clipShape.graphics.endFill();
                }
                _copyprop(this, last); // restore props

                // restore shadow
                _shape.filters = _shadowFilter ? [_shadowFilter] : [];
            }
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
            to.font             = from.font.concat();
            to.textAlign        = from.textAlign;
            to.textBaseline     = from.textBaseline;
            to._lineScale       = from._lineScale;
            to._scaleX          = from._scaleX;
            to._scaleY          = from._scaleY;
            to._matrixfxd       = from._matrixfxd;
            to._matrix          = from._matrix.clone();
            to._clipPath        = from._clipPath.concat();
        }

        private function _applyStrokeStyle():void {
            if (!strokeStyle) { // Color
                _gfx.lineStyle(
                            lineWidth * _lineScale,
                            strokeColor[0],
                            strokeColor[1], // * globalAlpha
                            true,
                            LineScaleMode.NORMAL,
                            lineCap,
                            lineJoin,
                            miterLimit);
            } else if (strokeStyle < 3) { // Liner, Radial
                var matrix:Matrix = strokeGradient.matrix.clone();

                matrix.concat(_matrix);

                _gfx.lineStyle(lineWidth * _lineScale);
                _gfx.lineGradientStyle(
                        strokeStyle === 1 ? GradientType.LINEAR
                                          : GradientType.RADIAL,
                        strokeGradient.colors,
                        strokeGradient.alphas, // strokeGradient.mixedAlpha(globalAlpha),
                        strokeGradient.ratios,
                        matrix,
                        SpreadMethod.PAD,
                        InterpolationMethod.RGB,
                        strokeStyle === 1 ? 0
                                          : strokeGradient.focalPointRatio);
            } else { // pattern
                _gfx.beginBitmapFill(strokeImage.bitmapData, _matrix);
            }
        }

        private function _applyFillStyle():void {
            if (!fillStyle) { // Color
                _gfx.beginFill(fillColor[0],
                               fillColor[1]); // * globalAlpha
            } else if (fillStyle < 3) { // Liner, Radial
                var matrix:Matrix = fillGradient.matrix.clone();

                matrix.concat(_matrix);

                _gfx.beginGradientFill(
                        fillStyle === 1 ? GradientType.LINEAR
                                        : GradientType.RADIAL,
                        fillGradient.colors,
                        fillGradient.alphas, // fillGradient.mixedAlpha(globalAlpha),
                        fillGradient.ratios,
                        matrix,
                        SpreadMethod.PAD,
                        InterpolationMethod.RGB,
                        fillStyle === 1 ? 0
                                        : fillGradient.focalPointRatio);
            } else { // pattern
                _gfx.beginBitmapFill(fillImage.bitmapData, _matrix);
            }
        }

        private function loadPatternImage(url:String, repeation:String, fill:int):void {
            var param:Array = fill ? fillPattern : strokePattern;

            param[0] = url;
            param[1] = repeation;

            var canvasImage:CanvasImage = fill ? fillImage : strokeImage;
            var me:Canvas = this;
            var rv:Boolean = canvasImage.load(url, function():void {
                me.next(1);
            });

            next(rv ? 2 : 0);
        }

        private function drawCircle(x:Number, y:Number, radius:Number,
                                    fillColor:int, fillColorAlpha:Number,
                                    strokeColor:int, strokeColorAlpha:Number,
                                    lineWidth:int):void {
            if (fillColorAlpha) {
                _gfx.beginFill(fillColor, fillColorAlpha);
                _gfx.drawCircle(x, y, radius);
                _gfx.endFill();
            }
            if (strokeColorAlpha && lineWidth) {
                _gfx.lineStyle(lineWidth * _lineScale,
                               strokeColor, strokeColorAlpha, true);
                _gfx.drawCircle(x, y, radius);
            }
            _buff.draw(_shape);
            _gfx.clear();
        }

        private function drawRoundRect(x:Number, y:Number,
                                       width:Number, height:Number,
                                       radius:Array,
                                       xfillColor:int, fillColorAlpha:Number,
                                       xstrokeColor:int, strokeColorAlpha:Number,
                                       xlineWidth:int):void {
            if (radius[0] === radius[1]
                && radius[0] === radius[2]
                && radius[0] === radius[3]) {

                if (fillColorAlpha) {
                    _gfx.beginFill(xfillColor, fillColorAlpha);
                    _gfx.drawRoundRect(x, y, width, height, radius[0]);
                    _gfx.endFill();
                }
                if (strokeColorAlpha && xlineWidth) {
                    _gfx.lineStyle(xlineWidth * _lineScale,
                                   xstrokeColor, strokeColorAlpha, true);
                    _gfx.drawRoundRect(x, y, width, height, radius[0]);
                }
                _buff.draw(_shape);
                _gfx.clear();
            } else {
                var w:Number = width,
                    h:Number = height,
                    r0:Number = radius[0],
                    r1:Number = radius[1],
                    r2:Number = radius[2],
                    r3:Number = radius[3],
                    w2:Number = (width  / 2) | 0,
                    h2:Number = (height / 2) | 0;

                r0 < 0 && (r0 = 0);
                r1 < 0 && (r1 = 0);
                r2 < 0 && (r2 = 0);
                r3 < 0 && (r3 = 0);
                (r0 >= w2 || r0 >= h2) && (r0 = Math.min(w2, h2) - 2);
                (r1 >= w2 || r1 >= h2) && (r1 = Math.min(w2, h2) - 2);
                (r2 >= w2 || r2 >= h2) && (r2 = Math.min(w2, h2) - 2);
                (r3 >= w2 || r3 >= h2) && (r3 = Math.min(w2, h2) - 2);

                save();
                setTransform(1, 0, 0, 1, 0, 0);

                if (fillColorAlpha) {
                    fillStyle = 0;
                    fillColor = [xfillColor, fillColorAlpha];
                }
                if (strokeColorAlpha && xlineWidth) {
                    strokeStyle = 0;
                    strokeColor = [xstrokeColor, strokeColorAlpha];
                    lineWidth = xlineWidth;
                }

                _path = []; // beginPath();
                moveTo(x, y + h2);
                lineTo(x, y + h - r3);
                quadraticCurveTo(x, y + h, x + r3, y + h); // bottom-left
                lineTo(x + w - r2, y + h);
                quadraticCurveTo(x + w, y + h, x + w, y + h - r2); // bottom-right
                lineTo(x + w, y + r1);
                quadraticCurveTo(x + w, y, x + w - r1, y); // top-left
                lineTo(x + r0, y);
                quadraticCurveTo(x, y, x, y + r0); // top-right
                closePath();

                if (fillColorAlpha) {
                    stroke(1); // fill()
                }
                if (strokeColorAlpha && xlineWidth) {
                    stroke(0); // stroke()
                }
                restore();
            }
        }

        private function setShadow():void {
            if (this.shadowColor[1] && this.shadowBlur) {
                var angle:Number = Math.atan2(shadowOffsetY,
                                              shadowOffsetX) * 180 / Math.PI; // toDegree

                _shadowFilter =
                    new DropShadowFilter(
                                Math.sqrt(shadowOffsetX * shadowOffsetX +
                                          shadowOffsetY * shadowOffsetY),
                                angle < 0 ? angle + 360 : angle,
                                shadowColor[0],
                                shadowColor[1],
                                shadowBlur,
                                shadowBlur);

                _shape.filters = [_shadowFilter];
            } else {
                _shadowFilter = null;
                _shape.filters = [];
            }
        }

        // draw with blendMode
        public function mixin(bg:BitmapData,           // _buff
                              pict:IBitmapDrawable,    // _shape
                              matrix:Matrix = null):void {
            var color:ColorTransform = globalAlpha < 1
                                     ? new ColorTransform(1, 1, 1, globalAlpha)
                                     : null;

            if (!mix) {
                bg.draw(pict, matrix, color, null, null, true);
            } else {
                var bgcopy:BitmapData;

                switch (mixMode) {
                case "copy":
                    // clear -> draw
                    bg.copyPixels(_clearBitmap, _clearBitmap.rect, new Point());
                    bg.draw(pict, matrix, color, null, null, true);
                    break;
                case "destination-over":
                    // copy(bg) -> clear -> draw(pict) -> draw(copied bg)
                    bgcopy = bg.clone();

                    bg.copyPixels(_clearBitmap, _clearBitmap.rect, new Point());
                    bg.draw(pict, matrix, color, null, null, true);
                    bg.draw(bgcopy);
                    break;
                default:
                    bg.draw(pict, matrix, color, mixMode, null, true);
                }
            }
        }
    }
}

