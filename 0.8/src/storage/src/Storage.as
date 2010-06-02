package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.net.*;

    public class Storage extends Sprite {
        private var _DISK_SPACE:uint = 0;
        private var _so:SharedObject = null;

        public function Storage() {
            ExternalInterface.addCallback("key", ex_key);
            ExternalInterface.addCallback("size", ex_size);
            ExternalInterface.addCallback("clear", ex_clear);
            ExternalInterface.addCallback("getItem", ex_getItem);
            ExternalInterface.addCallback("setItem", ex_setItem);
            ExternalInterface.addCallback("getLength", ex_getLength);
            ExternalInterface.addCallback("removeItem", ex_removeItem);
            ExternalInterface.addCallback("getAllItems", ex_getAllItems);

            _DISK_SPACE = this.detectDiskSpace();

            trace(ExternalInterface.objectID);

            ExternalInterface.call("uu.dmz." + ExternalInterface.objectID);
        }

        private function detectDiskSpace():uint {
            var so:SharedObject = getSharedObject();
            var key:String = "UUDETECTDISKSPACE";
            var used:uint = so.size;
            var kb:uint = 1024;
            var mb:uint = 1024 * 1024;

            if (!used) {
                so.data[key] = "1";
                if (so.flush() !== SharedObjectFlushStatus.FLUSHED) {
                    return 0;
                }
            }
            if (11 * kb - used > 0) {
                so.data[key] = new Array(11 * kb - used).join("0");
                if (so.flush() !== SharedObjectFlushStatus.FLUSHED) {
                    delete so.data[key];
                    return 10 * kb;
                }
            }
            if (101 * kb - used > 0) {
                so.data[key] = new Array(101 * kb - used).join("0");
                if (so.flush() !== SharedObjectFlushStatus.FLUSHED) {
                    delete so.data[key];
                    return 100 * kb;
                }
            }
            delete so.data[key];

            return 1 * mb;
        }

        private function getSharedObject():SharedObject {
            if (_so === null) {
                _so = SharedObject.getLocal("FlashStorage");
                _so.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
            }
            return _so;
        }

        private function netStatusHandler(event:NetStatusEvent):void {
        }

        public function ex_key(index:Number):String {
            var so:SharedObject = getSharedObject(), i:Number = -1, key:String;

            for (key in so.data) {
                if (++i === index) {
                    return key;
                }
            }
            return "";
        }

        public function ex_size():Object {
            var so:SharedObject = getSharedObject();

            return { used: so.size, max: _DISK_SPACE };
        }


        public function ex_clear():void {
            var so:SharedObject = getSharedObject();

            so.clear();
        }

        public function ex_getItem(key:String):String {
            var rv:String = getSharedObject().data[key];

            return (rv === null) ? "" : rv;
        }

        public function ex_setItem(key:String,
                                   value:String):Boolean {
            var so:SharedObject = getSharedObject();

            try {
                so.data[key] = value; // store
            } catch(err:Error) {
                trace(err);
                return false;
            }

            if (so.flush() === SharedObjectFlushStatus.PENDING) {
                return false;
            }

            // verify
            return so.data[key] === value;
        }

        public function ex_getLength():Number {
            var so:SharedObject = getSharedObject(), i:String, j:Number = 0;

            for (i in so.data) {
                ++j;
            }
            return j;
        }

        public function ex_removeItem(key:String):void {
            var so:SharedObject = getSharedObject();

            delete so.data[key];
            so.flush();
        }

        public function ex_getAllItems():Object {
            var so:SharedObject = getSharedObject(),
                rv:Object = {}, key:String, value:String;

            for (key in so.data) {
                value = so.data[key];
                if (value === null) {
                    value = "";
                }
                rv[key] = value;
            }
            return rv;
        }
    }
}

