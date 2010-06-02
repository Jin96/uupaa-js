// base: uu.codec.base64.encode
package {
    import flash.utils.*;

    public class CanvasBase64 {
        private static var BASE64_ENCODE:Array =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");

        // CanvasBase64.encode - ByteArray to Base64String
        public static function encode(ary:ByteArray):String { // @param ByteArray: array( [0x0, ... ] )
                                                              // @return Base64String:
            var rv:Array = [], pad:int = 0, c:int = 0, i:int = -1, iz:int;

            switch (ary.length % 3) {
            case 1: ary.writeInt(0); ++pad;
            case 2: ary.writeInt(0); ++pad;
            }
            iz = ary.length;

            while (i < iz) {
                c = (ary[++i] << 16) | (ary[++i] << 8) | (ary[++i]);
                rv.push(BASE64_ENCODE[(c >>> 18) & 0x3f],
                        BASE64_ENCODE[(c >>> 12) & 0x3f],
                        BASE64_ENCODE[(c >>>  6) & 0x3f],
                        BASE64_ENCODE[ c         & 0x3f]);
            }
            switch (pad) {
            case 2: rv[rv.length - 2] = "=";
            case 1: rv[rv.length - 1] = "=";
            }

            return rv.join("");
        }
    }
}

