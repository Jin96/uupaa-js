// W3C NamedEvent -> http://www.w3.org/TR/html5/video.html#event-media-timeupdate
package {
    import flash.display.*;
    import flash.errors.*;
    import flash.events.*;
    import flash.media.*;
    import flash.utils.*;
    import flash.net.*;

    public class MediaImageAudio extends MediaAudio {
        protected var _imageSource:Array = []; // [imageURL, ...]
        protected var _imageLoader:Array = []; // [Loadedr, ...]
        protected var _sprite:Sprite;

        public function MediaImageAudio(boss:Media,
                                        id:Number,
                                        audioSource:Array,
                                        imageSource:Array) {
            super(boss, id, audioSource);

            this._imageSource = imageSource.concat();

            var that:* = this;

            // image container
            _sprite = new Sprite();
            _sprite.visible = false;
            boss.stage.addChild(_sprite);

            // load images
            imageSource.forEach(function(url:String, index:int, ary:Array):void {
                trace("MediaImageAudio", url);

                var loader:Loader = new Loader();

                loader.contentLoaderInfo.addEventListener(Event.COMPLETE, handleImageLoadComplete);
                loader.load(new URLRequest(url));

                that._imageLoader.push(loader);
            });
        }

        protected function handleImageLoadComplete(event:Event):void {
            _sprite.addChild(event.target.loader);
        }

        override public function play(autoLoad:Boolean = true):void {
            _sprite.visible = true;
            super.play();
        }

        override public function close():void {
            _sprite.visible = false;
            super.close();
        }
    }
}
