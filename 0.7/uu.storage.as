// uu.storage.as
// mtasc -swf uu.storage.swf -header 1:1:1 -main -version 8 -strict uu.storage.as
import flash.external.ExternalInterface;

class FlashStorage {
  public function FlashStorage() {
  }
  private function obj():SharedObject {
    return SharedObject.getLocal("FlashStorage");
  }
  private function jsall():Object {
    var so:SharedObject = obj(), rv:Object = {}, key:String, val:String;

    for (key in so.data) {
      val = so.data[key];
      if (val === null) {
        val = "UU_NULL_TRAP__"; // [!] AS2("") -> JS(null) null trap
      }
      rv[key] = val;
    }
    return rv;
  }
  private function jsnth(n:Number):String {
    var so:SharedObject = obj(), i:Number = -1, key:String;

    for (key in so.data) {
      if (++i === n) {
        return key;
      }
    }
    return "UU_NULL_TRAP__"; // [!] AS2("") -> JS(null) null trap
  }
  private function jsget(key:String):String {
    var rv:String = obj().data[key];

    return (rv === null) ? "UU_NULL_TRAP__" : rv; // [!] AS2("") -> JS(null) null trap
  }
  private function jsset(key:String, val:String, safe:Number):Number {
    var so:SharedObject = obj(), n:Number = 0, r:Object;
  
    if (safe) {
      n = so.getSize() + key.length + val.length;
      if (n > 1024 * 99 - 2) { // [!] max 99kB - 2
        return 0;
      }
    }
    so.data[key] = val;
    r = so.flush();
    if (r !== true) {
      return 0;
    }
    // safe -> verify
    if (safe) {
      return (so.data[key] === val) ? 1 : 0;
    }
    return 1;
  }
  private function jssize():Object {
    var so:SharedObject = obj(), use:Number = so.getSize(),
        max:Number = 1024 * 99 - 2; // max 99kb - 2

    return { use: use, max: max, free: Math.max(max - use, 0) };
  }
  private function jspairs():Number {
    var so:SharedObject = obj(), i:String, j:Number = 0;

    for (i in so.data) {
      ++j;
    }
    return j;
  }
  private function jsclear():Void {
    var so:SharedObject = obj();

    so.clear();
  }
  private function jsremove(key:String):Void {
    var so:SharedObject = obj();

    delete so.data[key];
    so.flush();
  }
  static function main() {
    var obj:Object = new FlashStorage(),
        fn:Function = ExternalInterface.addCallback;

    fn("flashstorageall", obj, obj.jsall);
    fn("flashstoragenth", obj, obj.jsnth);
    fn("flashstorageget", obj, obj.jsget);
    fn("flashstorageset", obj, obj.jsset);
    fn("flashstoragesize", obj, obj.jssize);
    fn("flashstoragepairs", obj, obj.jspairs);
    fn("flashstorageclear", obj, obj.jsclear);
    fn("flashstorageremove", obj, obj.jsremove);

    ExternalInterface.call("uu.as.dmz.storageReadyCallback", "from flash");
  }
};
