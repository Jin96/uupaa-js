/*

The original writer in CanvasArc.draw code block is Colin Leung.

http://code.google.com/p/ascanvas/

--------------------------
The New BSD License
--------------------------

Copyright (c) 2007, Colin Leung
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

    * Neither the name of Leonardo Dutra nor the names of LEAF and its
      contributors may be used to endorse or promote products derived from this
      software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */

package {

    import flash.display.*;
    import flash.geom.Matrix;
    import flash.geom.Point;

    public class CanvasArc {

        public function CanvasArc() {
        }

        // CanvasArc.draw
        public function draw(gfx:Graphics, matrix:Matrix,
                             x:Number, y:Number, radius:Number,
                             startAngle:Number, endAngle:Number,
                             anticlockwise:Number):void {
            var deg1:Number = startAngle * 180 / Math.PI; // Math.toDegree
            var deg2:Number = endAngle   * 180 / Math.PI; // Math.toDegree

            if (deg2 < 0) {
                deg2 += 360;
            }

            var arc:Number = deg2 - deg1;

            if (anticlockwise) {
                arc = 360 - arc;
                if (!arc && deg1 !== deg2) {
                    arc = 360;
                }
            }
            if (arc > 360 || arc < -360) {
                arc = 360;
            }

            var segs:Number = Math.ceil(Math.abs(arc) / 45);
            var segAngle:Number = arc / segs;

            var angle:Number = (deg1 / 180) * Math.PI;
            var theta:Number = (segAngle / 180) * Math.PI;

            if (anticlockwise) {
                theta = -theta;
            }

            var halfAngle:Number;
            var halfRadius:Number = radius / Math.cos(theta / 2);
            var dx:Number;
            var dy:Number;
            var bx:Number;
            var by:Number;
            var ctlx:Number;
            var ctly:Number;
            var diff:Point;

            for (var i:int = 0; i < segs; ++i) {
                angle += theta;
                halfAngle = angle - (theta / 2);

                dx = Math.cos(angle) * radius;
                dy = Math.sin(angle) * radius;
                diff = matrix.deltaTransformPoint(new Point(dx, dy));
                bx = x + diff.x;
                by = y + diff.y;

                dx = Math.cos(halfAngle) * halfRadius;
                dy = Math.sin(halfAngle) * halfRadius;
                diff = matrix.deltaTransformPoint(new Point(dx, dy));
                ctlx = x + diff.x;
                ctly = y + diff.y;

                gfx.curveTo(ctlx, ctly, bx, by);
            }
        }
    }
}
