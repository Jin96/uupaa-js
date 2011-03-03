
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

        public function isCached(url:String):Boolean {
            var cache:CanvasImageCache = CanvasImageCache.getInstance();

            return cache.isCached(url);
        }

        public function load(url:String, callback:Function = undefined):Boolean {
            function onload(evt:Event):void {
                loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onload);

                // retrieve image
                _bitmapData = Bitmap(loader.content).bitmapData;

                // add cache
                cache.add(url, _bitmapData);

                // [GC]
                loader.unload();

                callback && callback();
            }

            var loader:Loader = new Loader();
            var cache:CanvasImageCache = CanvasImageCache.getInstance();

            if (cache.isCached(url)) {
                // cached
                _bitmapData = cache.ref(url);
                callback && callback();
            } else {
                _bitmapData = cache.ref(url);
                // loading...
                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onload);
                loader.load(new URLRequest(url));
            }
            return _bitmapData ? true : false; // true is cached
        }
    }
}

