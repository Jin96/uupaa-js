
// <<singleton>>
package {
    import flash.display.*;

    public class CanvasImageCache {
        private static var _instance:CanvasImageCache = null;
        private var _cache:Object = {}; // { url: BitmapData }

        public function CanvasImageCache(blocker:Blocker) {
            if (!blocker) {
                throw new Error("DENY");
            }
        }

        public static function getInstance():CanvasImageCache {
            if (_instance == null) {
                _instance = new CanvasImageCache(new Blocker());
            }
            return _instance;
        }

        public function find(url:String):Boolean {
            return url in _cache;
        }

        public function ref(url:String):BitmapData {
            return _cache[url];
        }

        public function add(url:String,
                            bitmapData:BitmapData):void {
            _cache[url] = bitmapData;
        }

        public function clear():void {
            var url:String;

            for (url in _cache) {
                _cache[url].dispose();
            }
        }
    }
}

internal class Blocker {
}

