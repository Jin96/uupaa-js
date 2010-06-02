
package {
    import flash.display.*;
    import flash.events.*;
    import flash.net.*;

    public class CanvasImage {

        private var _canvas:Canvas; // Boss
//      private var _url:String;
        private var _bitmapData:BitmapData;

        public function CanvasImage(boss:Canvas) {
            _canvas = boss;
        }

        public function get bitmapData():BitmapData {
            return _bitmapData;
        }

        public function load(url:String, callback:Function):Boolean {
            function onload(evt:Event):void {
                loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onload);

                // retrieve image
                _bitmapData = Bitmap(loader.content).bitmapData;

                // add cache
                cache.add(url, _bitmapData);

                // [GC]
                loader.unload();

                callback();
            }

            var loader:Loader = new Loader();
            var cache:CanvasImageCache = CanvasImageCache.getInstance();

            if (cache.find(url)) {
                _bitmapData = cache.ref(url);
                callback();
            } else {
                _bitmapData = cache.ref(url);
                // load
                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onload);
                loader.load(new URLRequest(url));
            }
            return _bitmapData ? true : false; // true is cached
        }
    }
}

