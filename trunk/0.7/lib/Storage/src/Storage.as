package {
    import flash.external.*;
    import flash.display.*;
    import flash.net.*;

    public class Storage extends Sprite {
        private const _FREE_SPACE:uint = 99 * 1024 - 2; // [!] max 99kB - 2
        // [!] link to Storage.as "_CALLBACK_ID" on NPAPI I/F
        private const _CALLBACK_ID:String = "externalflashstorage";

        public function Storage() {
            ExternalInterface.addCallback("ex_nth", ex_nth);
            ExternalInterface.addCallback("ex_get", ex_get);
            ExternalInterface.addCallback("ex_set", ex_set);
            ExternalInterface.addCallback("ex_size", ex_size);
            ExternalInterface.addCallback("ex_pairs", ex_pairs);
            ExternalInterface.addCallback("ex_clear", ex_clear);
            ExternalInterface.addCallback("ex_remove", ex_remove);
            ExternalInterface.addCallback("ex_getAll", ex_getAll);

            // [FIX] WebKit, Opera, Gecko, ExternalInterface.objectID = null
            // ExternalInterface.call("uu.dmz." + ExternalInterface.objectID);
            ExternalInterface.call("uu.dmz." + _CALLBACK_ID);
        }

        private function getSharedObject():SharedObject {
            return SharedObject.getLocal("FlashStorage");
        }

        public function ex_nth(index:Number):String {
            var so:SharedObject = getSharedObject(), i:Number = -1, key:String;

            for (key in so.data) {
                if (++i === index) {
                    return key;
                }
            }
            return "";
        }

        public function ex_get(key:String):String {
            var rv:String = getSharedObject().data[key];

            return (rv === null) ? "" : rv;
        }

        public function ex_set(key:String,
                               value:String):Boolean {
            var so:SharedObject = getSharedObject(), used:uint = 0, r:Object;

            used = so.size + key.length + value.length;
            if (used > _FREE_SPACE) {
                return false;
            }

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

        public function ex_size():Object {
            var so:SharedObject = getSharedObject();

            return { used: so.size, max: _FREE_SPACE };
        }

        public function ex_pairs():Number {
            var so:SharedObject = getSharedObject(), i:String, j:Number = 0;

            for (i in so.data) {
                ++j;
            }
            return j;
        }

        public function ex_clear():void {
            var so:SharedObject = getSharedObject();

            so.clear();
        }

        public function ex_remove(key:String):void {
            var so:SharedObject = getSharedObject();

            delete so.data[key];
            so.flush();
        }

        public function ex_getAll():Object {
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

