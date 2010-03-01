package {
    import flash.display.*;
//  import flash.system.Security; // for Security.allowDomain
//  import flash.system.System;
    import flash.events.Event;
    import flash.geom.*;
    import flash.net.URLRequest;
    import flash.filters.*;
    import flash.text.*;
    import flash.external.ExternalInterface;

    public class Canvas extends Sprite {
        private var canvasDraw:CanvasDraw = new CanvasDraw();
        // --- compositing ---
        private var globalAlpha:Number = 1; // globalAlpha
        private var mix:int = 0; // globalCompositeOperation
        private var mixMode:String = ""; // globalCompositeOperation
        // --- colors and styles ---
        private var strokeStyle:int = 0; // 0: color, 1: liner, 2: radial, 3: pattern
        private var strokeColor:Array = [0, 1];
        private var strokeGradient:CanvasGradient = new CanvasGradient();
        private var strokePattern:Array = []; // [url, repeation]
        private var fillStyle:int = 0; // 0: color, 1: liner, 2: radial, 3: pattern
        private var fillColor:Array = [0, 1];
        private var fillGradient:CanvasGradient = new CanvasGradient();
        private var fillPattern:Array = []; // [url, repeation]
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
        private var font:Array = []; // [style, weight, variant, family]
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
        private var _rtl:int = 0; // 1: direction=rtl
        private var _clipPath:Array = [];
        private var _clipShape:Shape;
        private var _shadow:BitmapFilter; // shadow filter

        private var _beginX:Number = 0;
        private var _beginY:Number = 0;
        private var _curtX:Number = 0;
        private var _curtY:Number = 0;
        private var _shape:Shape;
        private var _gfx:Graphics; // shape.graphics
        private var _view:Bitmap;
        private var _buff:BitmapData;
        private var _msgid:String = ""; // last message id
        private var _state:int = 0;     // 0: not ready(locked)
                                        // 1: not ready -> ready
                                        // 2: ready
        private var _stock:Array = [];
        private var _imgdb:Object = {}; // image cached db. { url: loader }
        // clearAll params
        private var _clearAllBuff:BitmapData;
        private var _clearAllRect:Rectangle;
        private var _clearAllPoint:Point;

        private var xFlyweight:int = 0;
        private var canvasWidth:int = 300;
        private var canvasHeight:int = 150;
        // ----
        private var as2optim:AS2Optimize = new AS2Optimize();
        private var as3optim:AS3Optimize = new AS3Optimize();

        public function Canvas() {
            // for local debug
//          Security.allowDomain("*");

            ExternalInterface.addCallback("send", recv);

            _shape = new Shape();
            _gfx = _shape.graphics;
            _clipShape = new Shape();
            _shape.mask = _clipShape;

            stage.frameRate = 60;
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align     = StageAlign.TOP_LEFT;

            ExternalInterface.call("uu.flash.dmz." + ExternalInterface.objectID);
        }

        private function onEnterFrame(evt:Event):void {
            var cmd:Object = stage.loaderInfo.parameters;
            var tmp:String;

            if (cmd.i && _msgid !== cmd.i) {
    //trace(cmd.i + ":" + cmd.c);
                _msgid = cmd.i; // update
                switch (_state) {
                case 0: // not ready(locked)
                        _stock.push(cmd.c);
                        break;
                case 1: // not ready(locked) -> ready
                        _state = 2;
                        _buff && _buff.lock();

                            cmd.c && _stock.push(cmd.c);
                            tmp = _stock.join("\t");
                            _stock = []; // pre clear
                            recv(tmp);

                        _buff && _buff.unlock();
                        break;
                case 2: // ready
                        _buff && _buff.lock();

                            recv(cmd.c);

                        _buff && _buff.unlock();
                }
            }
        }

        private function next(state:int):void {
            _state = state;

            _buff && _buff.lock();

                var tmp:String = _stock.join("\t");
                _stock = []; // pre clear
                tmp && recv(tmp);

            _buff && _buff.unlock();
        }

        private function recv(msg:String):void {
            var ary:Array = msg.split("\t");
            var i:int = -1;
            var iz:int = ary.length;
            var fill:int;

            while (++i < iz) {
                fill = 0;
                switch (ary[i]) { // COMMAND
                case "in":  init(+ary[++i], +ary[++i], +ary[++i]);
                            _state = 1; // not ready(locked) -> ready
                            addEventListener("enterFrame", onEnterFrame);
                            break;
                case "rz":  // resize
                            expire();
                            init(+ary[++i], +ary[++i], +ary[++i]); break;
                case "xp":  expire(); break;
                case "rt":  _rtl = 1; break; // direction = rtl
                case "gA":  globalAlpha = +ary[++i]; break;
                case "gC":  mix = 0;
                            switch (mixMode = ary[++i]) {
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
                            strokeColor = [+ary[++i], +ary[++i]]; break;
                case "s1":  strokeStyle = 1;
                            i = strokeGradient.setLiner(ary, i); break;
                case "s2":  strokeStyle = 2;
                            i = strokeGradient.setRadial(ary, i); break;
                case "s3":  strokeStyle = 3;
                            setPattern(ary[++i], ary[++i], 0);
                            if (_state < 2) {
                                _stock.push(ary.slice(++i).join("\t")); // push remain commands
                                return;
                            }
                            break;
                case "f0":  fillStyle = 0;
                            fillColor = [+ary[++i], +ary[++i]]; break;
                case "f1":  fillStyle = 1;
                            i = fillGradient.setLiner(ary, i); break;
                case "f2":  fillStyle = 2;
                            i = fillGradient.setRadial(ary, i); break;
                case "f3":  fillStyle = 3;
                            setPattern(ary[++i], ary[++i], 1);
                            if (_state < 2) {
                                _stock.push(ary.slice(++i).join("\t")); // push remain commands
                                return;
                            }
                            break;
                case "lC":  lineCap = ary[++i];
                            lineCap === "butt" && (lineCap = "none"); break;
                case "lJ":  lineJoin = ary[++i]; break;
                case "lW":  lineWidth = +ary[++i]; break;
                case "mL":  miterLimit = +ary[++i]; break;
                case "sh":  shadowBlur    = +ary[++i];
                            shadowColor   = [+ary[++i], +ary[++i]];
                            shadowOffsetX = +ary[++i];
                            shadowOffsetY = +ary[++i];
                            setShadow(); break;
                case "fo":  font = [+ary[++i], ary[++i], ary[++i], ary[++i], ary[++i]]; break;
                case "tA":  textAlign = ary[++i]; break;
                case "tB":  textBaseline = ary[++i]; break;
                case "re":  rect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "bP":  _path = []; break; // reset path
                case "cP":  closePath(); break;
                case "cR":  clearRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i]); break;
                case "cA":  _buff.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint); break;
                case "mT":  moveTo(ary[++i] * 0.001, ary[++i] * 0.001); break;
                case "lT":  lineTo(ary[++i] * 0.001, ary[++i] * 0.001); break;
                case "ar":  arc(+ary[++i], +ary[++i], +ary[++i],
                                +ary[++i], +ary[++i], +ary[++i]); break;
                case "qC":  quadraticCurveTo(+ary[++i], +ary[++i],
                                             +ary[++i], +ary[++i]); break;
                case "bC":  bezierCurveTo(+ary[++i], +ary[++i],
                                          +ary[++i], +ary[++i],
                                          +ary[++i], +ary[++i]); break;
                case "fi":  fill = 1; // [THROUGH]
                case "st":  stroke(fill); break;
                case "fR":  fill = 1; // [THROUGH]
                case "sR":  strokeRect(+ary[++i], +ary[++i], +ary[++i], +ary[++i], fill); break;
                case "fT":  fill = 1; // [THROUGH]
                case "sT":  strokeText(ary[++i], +ary[++i], +ary[++i], +ary[++i], fill); break;
                case "cl":  clip(); break;
                case "dI":  drawImage(+ary[++i], ary[++i],
                                      [+ary[++i], +ary[++i], +ary[++i], +ary[++i],
                                       +ary[++i], +ary[++i], +ary[++i], +ary[++i]]);
                            if (_state < 2) {
                                _stock.push(ary.slice(++i).join("\t")); // push remain commands
                                return;
                            }
                            break;
                case "ro":  rotate(ary[++i] * 0.000001); break;
                case "sc":  scale(+ary[++i], +ary[++i]); break;
                case "ST":  setTransform(+ary[++i], +ary[++i], +ary[++i], +ary[++i],
                                         +ary[++i], +ary[++i]); break;
                case "tf":  transform__(+ary[++i], +ary[++i], +ary[++i], +ary[++i],
                                        +ary[++i], +ary[++i]); break;
                case "tl":  translate(+ary[++i], +ary[++i]); break;
                case "sv":  save(); break;
                case "rs":  restore(); break;
                case "X0":  fill = 1; // [THROUGH]
                case "X1":  strokeCircle(+ary[++i], +ary[++i],
                                         +ary[++i], +ary[++i], +ary[++i], fill); break;
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

        private function init(width:int, height:int, flyweight:int):void {
            _matrix = new Matrix();
            _path = []; // reset path
            _beginX = _beginY = _curtX = _curtY = 0;

            xFlyweight = flyweight;
            canvasWidth = width;
            canvasHeight = height;

            if (_buff) {
                _buff.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint);
                _buff.dispose();
                // _gfx.clear();
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

            // build clipShape
            rect(0, 0, width, height);
            clip();
        }

        // clear cache
        private function expire():void {
            // TODO: test
            var url:String;
            var loader:Loader;

            for (url in _imgdb) {
                loader = _imgdb[url];
                Bitmap(loader.content).bitmapData.dispose();
                loader.unload();
            }
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
                case "a": // arc
                    canvasDraw.arc(gfx, _matrix,
                                    ary[++i], ary[++i], ary[++i],
                                    ary[++i], ary[++i], ary[++i]);
                    break;
                case "b": // bezierCurveTo
                    canvasDraw.bezierCurveTo(gfx,
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
            // add StartPoint
            _path.length ? _path.push("l", sx, sy)
                         : _path.push("m", _beginX = sx, _beginY = sy);

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
            _curtX = ex;
            _curtY = ey;
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
    //          _path.length || moveTo(x, y); // add begin point
            _path.length || _path.push("m", _beginX = x, _beginY = y); // add begin point
            _path.push("l", _curtX = x, _curtY = y);
        }

        private function bezierCurveTo(cp1x:Number, cp1y:Number,
                                       cp2x:Number, cp2y:Number,
                                          x:Number,    y:Number):void {
            var cp1:Point = _matrix.transformPoint(new Point(cp1x, cp1y));
            var cp2:Point = _matrix.transformPoint(new Point(cp2x, cp2y));
            var   p:Point = _matrix.transformPoint(new Point(x, y));

    //          _path.length || moveTo(cp1x, cp1y); // add begin point
            _path.length || _path.push("m", _beginX = cp1.x, _beginY = cp1.y); // add begin point
            _path.push("b", new Point(_curtX, _curtY), cp1, cp2, p);
            _curtX = p.x;
            _curtY = p.y;
        }

        private function quadraticCurveTo(cpx:Number, cpy:Number,
                                            x:Number,   y:Number):void {
            var cp:Point = _matrix.transformPoint(new Point(cpx, cpy));
            var  p:Point = _matrix.transformPoint(new Point(x, y));

            _path.length || moveTo(cpx, cpy); // add begin point
            _path.push("q", cp.x, cp.y, _curtX = p.x, _curtX = p.y);
        }

        private function closePath():void {
            if (_path.length) {
                if (_curtX !== _beginX || _curtY !== _beginY) {
                    _path.push("x", _curtX = _beginX, _curtY = _beginY);
                }
            }
        }

        private function clearRect(x:Number, y:Number, w:Number, h:Number):void {
            if (!x && !y && w >= canvasWidth && h >= canvasHeight) {
                // clearAll
                _buff.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint);
            } else {
                _gfx.beginFill(0);
                _gfx.drawRect(x, y, w, h);
                _gfx.endFill();

//              _buff.draw(_shape, _matrix, null, BlendMode.ERASE);
                _buff.draw(_shape, _matrix, null, BlendMode.ERASE, null, true);
                _gfx.clear();
            }
        }

        private function stroke(fill:int):void {
            fill ? _applyFillStyle()
                 : _applyStrokeStyle();

            buildPath(_path, _gfx);
            fill && _gfx.endFill();

            mix ? mixin(_buff, _shape) : _buff.draw(_shape);
/*
            mixin(_buff, _shape, _matrix,
                  globalAlpha < 1 ? new ColorTransform(1, 1, 1, globalAlpha)
                                  : null,
                  true);
 */

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
                _gfx.moveTo(x, y);
                _gfx.lineTo(x + w, y);
                _gfx.lineTo(x + w, y + h);
                _gfx.lineTo(x, y + h);
                _gfx.lineTo(x, y);
            }
            fill && _gfx.endFill();

//          _buff.draw(_shape);
//          mix ? mixin(_buff, _shape) : _buff.draw(_shape);
/*
            mixin(_buff, _shape, _matrix,
                  globalAlpha < 1 ? new ColorTransform(1, 1, 1, globalAlpha)
                                  : null,
                  true);
 */
            // [!][TEST] 4_3_canvas_globalalpha.htm
            mixin(_buff, _shape, null, null, true);

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
            var gfx:Graphics = _clipShape.graphics;

            gfx.clear();
            gfx.beginFill(0);
            buildPath(_clipPath = _path.concat(), gfx);
            gfx.endFill();
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

        private function drawImage(args:Number, image:String, param:Array):void {
            function onload(evt:Event):void {
                loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onload);

                _drawImage(args, image, param, _imgdb[image] = loader); // add cache
                next(1);
            }

            var loader:Loader = _imgdb[image];

            if (loader) { // use cache
                _drawImage(args, image, param, loader); // redraw from cache
                next(2);
            } else {
                _state = 0; // not ready(locked)
                loader = new Loader();
                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onload);
                loader.load(new URLRequest(image));
            }
        }

        private function _drawImage(args:Number, image:String, param:Array, loader:Loader):void {
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

            if (args > 5) { // args 9 version
                sx = param[0];
                sy = param[1];
                sw = param[2];
                sh = param[3];
                dx = param[4];
                dy = param[5];
                dw = param[6];
                dh = param[7];

                bmp = new BitmapData(sw, sh, true, 0);
                bmp.copyPixels(Bitmap(loader.content).bitmapData,
                               new Rectangle(sx, sy, sw, sh),
                               new Point(0, 0));
            } else { // args 2 or 4 version
                bmp = Bitmap(loader.content).bitmapData;
                dx = param[0];
                dy = param[1];
                dw = param[2] || bmp.width;
                dh = param[3] || bmp.height;
            }

            // apply shadow
            if (_shadow) {
                filterRect = bmp.generateFilterRect(bmp.rect, _shadow);
                filterBmp = new BitmapData(filterRect.width,
                                           filterRect.height, true, 0);
                filterBmp.copyPixels(bmp, bmp.rect,
                                     new Point(filterRect.x - bmp.rect.x,
                                               filterRect.y - bmp.rect.y));
                filterBmp.applyFilter(bmp, bmp.rect, new Point(), _shadow);
            }

            // apply matrix
            matrix.scale(dw / bmp.width, dh / bmp.height);
            matrix.translate(dx, dy);
            matrix.concat(_matrix);

/*
            _buff.draw(_shadow ? filterBmp : bmp,
                       matrix,
                       globalAlpha < 1 ? new ColorTransform(1, 1, 1, globalAlpha)
                                       : null,
                       null, null, true);
 */


            mixin(_buff,
                  _shadow ? filterBmp : bmp,
                  matrix,
                  globalAlpha < 1 ? new ColorTransform(1, 1, 1, globalAlpha)
                                  : null,
                  true);

            // [GC]
            bmp = null;
            filterBmp && (filterBmp = null);
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
                _shape.filters = _shadow ? [_shadow] : [];
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
            if (!strokeStyle) {
                _gfx.lineStyle(
                            lineWidth * _lineScale,
                            strokeColor[0],
                            strokeColor[1] * globalAlpha,
                            true,
                            LineScaleMode.NORMAL,
                            lineCap,
                            lineJoin,
                            miterLimit);
            } else if (strokeStyle < 3) {
                var matrix:Matrix = strokeGradient.matrix.clone();
                    matrix.concat(_matrix);

                _gfx.lineStyle(lineWidth * _lineScale);
                _gfx.lineGradientStyle(
                        strokeStyle === 1 ? GradientType.LINEAR
                                          : GradientType.RADIAL,
                        strokeGradient.colors,
                        strokeGradient.mixedAlpha(globalAlpha),
                        strokeGradient.ratios,
                        matrix,
                        SpreadMethod.PAD,
                        InterpolationMethod.RGB,
                        strokeStyle === 1 ? 0
                                          : strokeGradient.focalPointRatio);
            }
        }

        private function _applyFillStyle():void {
            if (!fillStyle) {
                _gfx.beginFill(fillColor[0], fillColor[1] * globalAlpha);
            } else if (fillStyle < 3) {
                var matrix:Matrix = fillGradient.matrix.clone();
                matrix.concat(_matrix);

                _gfx.beginGradientFill(
                        fillStyle === 1 ? GradientType.LINEAR
                                        : GradientType.RADIAL,
                        fillGradient.colors,
                        fillGradient.mixedAlpha(globalAlpha),
                        fillGradient.ratios,
                        matrix,
                        SpreadMethod.PAD,
                        InterpolationMethod.RGB,
                        fillStyle === 1 ? 0
                                        : fillGradient.focalPointRatio);
            }
        }

        private function setPattern(url:String, repeation:String, fill:int):void {
            function onload(evt:Event):void {
                loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onload);

                _imgdb[param[0]] = loader; // add cache
                _gfx.beginBitmapFill(Bitmap(loader.content).bitmapData, _matrix);
                next(1);
            }

            var param:Array = fill ? fillPattern : strokePattern;

            param[0] = url;
            param[1] = repeation;

            var loader:Loader = _imgdb[param[0]];

            if (loader) { // use cache
                _gfx.beginBitmapFill(Bitmap(loader.content).bitmapData, _matrix);
                next(2);
            } else {
                _state = 0; // not ready(locked)
                loader = new Loader();
                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onload);
                loader.load(new URLRequest(param[0]));
            }
        }

        private function strokeCircle(x:Number, y:Number, radius:Number,
                                      color:Number, colorAlpha:Number, fill:int):void {
            if (fill) {
                _gfx.beginFill(color, colorAlpha);
                _gfx.drawCircle(x, y, radius);
                _gfx.endFill();
            } else {
                _gfx.lineStyle(lineWidth * _lineScale, color, colorAlpha, true);
                _gfx.drawCircle(x, y, radius);
            }
            _buff.draw(_shape);
            _gfx.clear();
        }

        private function strokeText(text:String, x:Number, y:Number, maxWidth:Number, fill:int): void {
            var color:uint = fill ? fillColor[0] : strokeColor[0];
            var a:Number = (fill ? fillColor[1] : strokeColor[1]) * globalAlpha;
            var textFormat:TextFormat = new TextFormat();
            var textField:TextField = new TextField();
            var bmp:BitmapData;
            var filterBmp:BitmapData; // filter bitmap
            var filterRect:Rectangle; // filter rect
            var matrix:Matrix = new Matrix(1, 0, 0, 1, x, y);

            textFormat.color = color;
            textFormat.size = font[0]; // font-size
            textFormat.font = font[4].replace(/^'+|'+$/g, ""); // "'Arial'" -> "Arial"
            textFormat.italic = font[1] !== "normal"; // italic, oblique
            textFormat.bold = /[b56789]/.test(font[2]); // bold, bolder, 500~900
            textFormat.align = TextFormatAlign.LEFT;
            textField.defaultTextFormat = textFormat; // apply font
            textField.autoSize = TextFieldAutoSize.LEFT; // [!][NEED] auto resize
            textField.text = text;

            switch (textAlign) {
            case "left":    matrix.tx -= 2; break; // [FIX] -2
            case "start":   matrix.tx -= _rtl ? textField.width - 3 : 2; break; // [FIX] -2
            case "center":  matrix.tx -= textField.width / 2; break;
            case "right":   matrix.tx -= textField.width - 3; break; // [FIX] -3
            case "end":     matrix.tx -= _rtl ? 2 : textField.width - 3; break; // [FIX] -3
            }

            bmp = new BitmapData(textField.width, textField.height, true, 0);
            bmp.draw(textField);

            // apply shadow
            if (_shadow) {
                filterRect = bmp.generateFilterRect(bmp.rect, _shadow);
                filterBmp = new BitmapData(filterRect.width,
                                           filterRect.height, true, 0);
                filterBmp.copyPixels(bmp, bmp.rect,
                                     new Point(filterRect.x - bmp.rect.x,
                                               filterRect.y - bmp.rect.y));
                filterBmp.applyFilter(bmp, bmp.rect, new Point(), _shadow);
            }

            // apply matrix
            matrix.concat(_matrix);

/*
            _buff.draw(_shadow ? filterBmp : bmp,
                       matrix,
                       a < 1 ? new ColorTransform(1, 1, 1, a)
                             : null,
                       null, null, true);
 */
            mixin(_buff,
                  _shadow ? filterBmp : bmp,
                  matrix,
                  globalAlpha < 1 ? new ColorTransform(1, 1, 1, globalAlpha)
                                  : null,
                  true);

            // [GC]
            bmp = null;
            filterBmp && (filterBmp = null);
        }

        private function setShadow():void {
            if (this.shadowColor[1] && this.shadowBlur) {
                var angle:Number = Math.atan2(shadowOffsetY,
                                              shadowOffsetX) * 180 / Math.PI; // toDegree

                _shadow = new DropShadowFilter(
                                Math.sqrt(shadowOffsetX * shadowOffsetX +
                                          shadowOffsetY * shadowOffsetY),
                                angle < 0 ? angle + 360 : angle,
                                shadowColor[0],
                                shadowColor[1],
                                shadowBlur,
                                shadowBlur);

                _shape.filters = [_shadow];
            } else {
                _shadow = null;
                _shape.filters = [];
            }
        }

        // draw with blendMode
        private function mixin(bg:BitmapData,           // _buff
                               pict:IBitmapDrawable,    // _shape
                               matrix:Matrix = null,
                               colorTransform:ColorTransform = null,
                               smoothing:Boolean = false):void {
            if (!mix) {
                bg.draw(pict, matrix, colorTransform, null, null, smoothing);
            } else {
                var bgcopy:BitmapData;

                switch (mixMode) {
                case "copy":
                    // clear -> draw
                    bg.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint);
                    bg.draw(pict);
                    break;
                case "destination-over":
                    // copy(bg) -> clear -> draw(pict) -> draw(copied bg)
                    bgcopy = bg.clone();

                    bg.copyPixels(_clearAllBuff, _clearAllRect, _clearAllPoint);
                    bg.draw(pict);
                    bg.draw(bgcopy);
                    break;
                default:
//                  bg.draw(pict, null, null, mode, null, true);
                    bg.draw(pict, matrix, colorTransform, mixMode, null, smoothing);
                }
            }
        }
    }
}

