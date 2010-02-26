// LinerGradient, RadialGradient data container

package {

    import flash.geom.Matrix;

    public class Gradient {
        public var ratios:Array = [];
        public var colors:Array = [];
        public var alphas:Array = [];
        public var matrix:Matrix = new Matrix();
        public var focalPointRatio:Number; // for Radial

        public function Gradient() {
        }

        // get alphas x globalAlpha
        public function mixedAlpha(globalAlpha:Number):Array {
            var i:int = 0;
            var iz:int = alphas.length;
            var rv:Array = [];

            for (; i < iz; ++i) {
                rv[i] = alphas[i] * globalAlpha;
            }
            return rv;
        }

        public function setLiner(ary:Array, i:int):int {
            var x0:Number = +ary[++i];
            var y0:Number = +ary[++i];
            var x1:Number = +ary[++i];
            var y1:Number = +ary[++i];
            var w:Number = x1 - x0;
            var h:Number = y1 - y0;
            var d:Number = Math.sqrt(w * w + h * h);

            matrix.identity();
            matrix.createGradientBox(d, d, Math.atan2(h, w),
                                     ((x0 + x1) - d) / 2,
                                     ((y0 + y1) - d) / 2);
            var j:int = 0;
            var jz:int = +ary[++i];

            ratios = [];
            colors = [];
            alphas = [];

            for (; j < jz; ++j) {
                ratios[j] = +ary[++i];
                colors[j] = +ary[++i];
                alphas[j] = +ary[++i];
            }
            return i;
        }

        public function setRadial(ary:Array, i:int):int {
            var x0:Number = +ary[++i];
            var y0:Number = +ary[++i];
            var r0:Number = +ary[++i];
            var x1:Number = +ary[++i];
            var y1:Number = +ary[++i];
            var r1:Number = +ary[++i];
            var w:Number = x0 - x1;
            var h:Number = y0 - y1;
            var d:Number = r1 * 2;
            var r:Number = r0 / r1;

            matrix.identity();
            matrix.createGradientBox(d, d, Math.atan2(h, w),
                                     x1 - r1, y1 - r1);
            ratios = [];
            colors = [];
            alphas = [];
            focalPointRatio = Math.sqrt(w * w + h * h) / (r1 - r0);

            var j:int = 0;
            var jz:int = +ary[++i];

            for (; j < jz; ++j) {
                ratios.push((((+ary[++i] / 255) * (1 - r) + r) * 255) | 0);
                colors.push(+ary[++i]);
                alphas.push(+ary[++i]);
            }
            return i;
        }
    }
}

