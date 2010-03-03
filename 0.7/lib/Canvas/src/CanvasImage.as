
package {
    import flash.display.*;
    import flash.events.Event;
    import flash.net.*;

    public class CanvasImage {

        public var canvas:Canvas; // Boss
        public var url:String;
        public var bitmapData:BitmapData;

        public function CanvasImage(boss:Canvas) {
            canvas = boss;
        }

        public function load(url:String, callback:Function):Boolean {
            function onload(evt:Event):void {
                loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onload);

                // retrieve image
                bitmapData = Bitmap(loader.content).bitmapData;

                // add cache
                canvas.imageCache[url] = bitmapData;

                // [GC]
                loader.unload();

                callback();
            }

            var loader:Loader = new Loader();

            // find cached image
            bitmapData = canvas.imageCache[url];

            if (bitmapData) {
                callback();
            } else {
                // load
                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onload);
                loader.load(new URLRequest(url));
            }
            return bitmapData ? true : false; // true is cached
        }
    }
}

