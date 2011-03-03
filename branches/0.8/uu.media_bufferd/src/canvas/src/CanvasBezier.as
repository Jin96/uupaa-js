
package {

    import flash.display.*;
    import flash.geom.Point;

    public class CanvasBezier {

        public function CanvasBezier() {
        }

        public function draw(gfx:Graphics,
                             p0:Point, p1:Point,
                             p2:Point, p3:Point):void {
            var bezier:Bezier_lib = new Bezier_lib(gfx);

            bezier.drawCubicBezier(p0, p1, p2, p3, 4);
        }
    }
}
