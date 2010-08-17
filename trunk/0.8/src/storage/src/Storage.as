package {
    import flash.external.*;
    import flash.display.*;
    import flash.events.*;
    import flash.net.*;

    public class Storage extends Sprite {
        private var _DISK_SPACE:uint = 0;

        public function Storage() {
            ExternalInterface.addCallback("key", ex_key);
            ExternalInterface.addCallback("info", ex_info);
            ExternalInterface.addCallback("clear", ex_clear);
            ExternalInterface.addCallback("allItem", ex_allItem);
            ExternalInterface.addCallback("getItem", ex_getItem);
            ExternalInterface.addCallback("setItem", ex_setItem);
            ExternalInterface.addCallback("removeItem", ex_removeItem);

            _DISK_SPACE = this.detectDiskSpace();
trace("DISK_SPACE = " + _DISK_SPACE);

            trace(ExternalInterface.objectID);

            ExternalInterface.call("uu.dmz." + ExternalInterface.objectID,
                                   ExternalInterface.objectID);
        }

        private function detectDiskSpace():uint {
            var so:SharedObject = getSharedObject();
            var key:String = "UUDETECTDISKSPACE";
            var used:uint = so.size;
            var kb:uint = 1024;
            var mb:uint = 1024 * 1024;

            if (!used) {
                so.data[key] = "1";
                if (flushSharedObject(so) !== SharedObjectFlushStatus.FLUSHED) {
                    return 0;
                }
            }
            if (11 * kb - used > 0) {
                so.data[key] = new Array(11 * kb - used).join("0");
                if (flushSharedObject(so) !== SharedObjectFlushStatus.FLUSHED) {
                    delete so.data[key];

                    closeSharedObject(so, true);

                    return 10 * kb;
                }
            }
            if (101 * kb - used > 0) {
                so.data[key] = new Array(101 * kb - used).join("0");
                if (flushSharedObject(so) !== SharedObjectFlushStatus.FLUSHED) {
                    delete so.data[key];

                    closeSharedObject(so, true);

                    return 100 * kb;
                }
            }
            delete so.data[key];

            closeSharedObject(so, true);

            return 1 * mb;
        }

        private function getSharedObject():SharedObject {
            var so:SharedObject = SharedObject.getLocal("FlashStorage", "/");

            so.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
            return so;
        }

        private function flushSharedObject(so:SharedObject):String {
            var rv:String;

            try {
                rv = so.flush();
            } catch(err:Error) {
                trace(err);
                return "";
            }
            return rv;
        }

        private function closeSharedObject(so:SharedObject,
                                           flush:Boolean = false):void {
            if (so) {
                if (flush) {
                    flushSharedObject(so);
                }
                so.removeEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
                so = null;
            }
        }

        private function netStatusHandler(event:NetStatusEvent):void {
        }

        public function ex_key(index:int):String {
            var so:SharedObject = getSharedObject(), i:int = -1, key:String;

            for (key in so.data) {
                if (++i === index) {
                    return key;
                }
            }
            closeSharedObject(so);
            return "";
        }

        public function ex_info():Object {
            var so:SharedObject = getSharedObject(), i:String, j:int = 0,
                size:uint = so.size;

            for (i in so.data) {
                ++j;
            }

            closeSharedObject(so);
            return { used: size, max: _DISK_SPACE, pair: j,
                     backend: "FlashStorage" };
        }

        public function ex_clear():void {
            var so:SharedObject = getSharedObject();

            so.clear();
            closeSharedObject(so, true);
        }

        public function ex_allItem():Object {
            var so:SharedObject = getSharedObject(),
                rv:Object = {}, key:String, value:String;

            for (key in so.data) {
                value = so.data[key];
                if (value === null) {
                    value = "";
                }
                rv[key] = value;
            }
            closeSharedObject(so);
            return rv;
        }

        public function ex_getItem(key:String):String {
            var so:SharedObject = getSharedObject(),
                rv:String = so.data[key];

            closeSharedObject(so);
            return (rv === null) ? "" : rv;
        }

        // set items
        public function ex_setItem(hash:Object):Boolean {
            var so:SharedObject = getSharedObject(), key:String;

            try {
                for (key in hash) {
                    so.data[key] = hash[key];
                }
            } catch(err:Error) {
                trace(err);
                return false;
            }

            if (flushSharedObject(so) === SharedObjectFlushStatus.PENDING) {
                return false;
            }

            // verify
            for (key in hash) {
                if (so.data[key] !== hash[key]) {
                    return false;
                }
            }
            closeSharedObject(so, true);
            return true;
        }

        public function ex_removeItem(key:String):void {
            var so:SharedObject = getSharedObject();

            delete so.data[key];

            closeSharedObject(so, true);
        }
    }
}

