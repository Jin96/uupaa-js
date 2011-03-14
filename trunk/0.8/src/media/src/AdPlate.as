package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class AdPlate extends Sprite {
        // Identity
        private var _boss:Media;
        // State
        private var _data:Array = []; // [<ratio, imageURL, openURL>, ...]
        private var _ratioBox:Array = []; // shuffled ratio box

        private var _ratio:Number = 0; // 0 ~ 100
        private var _imageURL:String = "";
        private var _openURL:String = "";
        private var _imageSprite:Sprite = null;
        private var _closeButtonSprite:Sprite = null;
        private var _loader:Loader = null;
        private var _padding:Object = { top: 108, right: 0, bottom: 0, left: 0 };
        private var _callback:Function = null;

        // CloseButton
        [Embed(source="closeButton.png")]
        private var _closeButtonImage:Class;
        private var _closeButtonBitmap:Bitmap;

        public function AdPlate(boss:Media, data:Array) {
            _boss = boss;
            _data = data.concat(); // clone

            _imageSprite = new Sprite();
            _imageSprite.buttonMode = true;
            _boss.stage.addChild(_imageSprite);

            _closeButtonSprite = new Sprite();
            _closeButtonSprite.addEventListener(MouseEvent.CLICK, handleCloseButtonClick);

            _closeButtonBitmap = new _closeButtonImage();
            _closeButtonBitmap.smoothing = true;
            _closeButtonSprite.addChild(_closeButtonBitmap);

            _loader = new Loader();
            _loader.contentLoaderInfo.addEventListener(Event.COMPLETE,
                                                       handleImageLoadComplete);
            _loader.addEventListener(MouseEvent.CLICK, handleImageClick);
        }

        protected function handleImageLoadComplete(event:Event):void {
            while (_imageSprite.numChildren) {
                _imageSprite.removeChildAt(0);
            }

            _imageSprite.addChild(event.target.loader);
            _imageSprite.addChild(_closeButtonSprite);
            _imageSprite.x = _padding.left;
            _imageSprite.y = _padding.top;
            if (_callback !== null) {
                _callback(_imageSprite);
                _callback = null;
            }
        }

        protected function handleImageClick(event:MouseEvent):void {
            var url:URLRequest = new URLRequest(_openURL);
            navigateToURL(url, "_blank");
        }

        protected function handleCloseButtonClick(event:MouseEvent):void {
            _imageSprite.visible = false;
        }

        public function next(callback:Function):* {
            if (!_ratioBox.length) {
                shuffleAdBox();
            }
            _callback = callback;

            var k:int = _ratioBox.pop(),
                imageURL:String;

            if (_data[k * 3 + 1] === _imageURL) {
                _callback(_imageSprite); // nop
                return;
            }

            _ratio    = _data[k * 3 + 0];
            _imageURL = _data[k * 3 + 1];
            _openURL  = _data[k * 3 + 2];

            trace("AdPlate::next()", _ratio, _imageURL, _openURL);

            _loader.load(new URLRequest(_imageURL));
        }

        private function shuffleAdBox():void {
            _ratioBox = [];

            // --- create shuffled ratio box ---
            var i:int = 0, iz:int = _data.length,
                j:int = 0, jz:int, k:int = 0;

            for (; i < iz; ++k, i += 3) {
                for (j = 0, jz = _data[i]; j < jz; ++j) {
                    _ratioBox.push(k); // [0,0,0,0, 1,1,1,1, 2,2,2,2, ...]
                }
            }
            shuffleArray(_ratioBox); // [2,1,1,0,0,1,2,2,1,2,0,0, ...]
        }

        private function shuffleArray(ary:Array):void {
            // Fisher-Yates algorithm
            var i:int = ary.length, j:int, t:int;

            while (i) {
                j = Math.floor(Math.random() * i);
                t = ary[--i];
                ary[i] = ary[j];
                ary[j] = t;
            }
        }
    }
}

