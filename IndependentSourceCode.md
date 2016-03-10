一部のソースコードは、単体利用も可能です。

# 単体利用可能なソースコードの一覧 #
  * [src/misc/lzw.js](uu_lzw.md)
  * [src/misc/msgpack.js](uu_msgpack.md)

# 単体利用を可能にする工夫 #
```
// === uu.base64 / window.base64 ===
(function(namespace) {

namespace.base64 = {
    encode: base64encode,
    decode: base64decode
};

function base64encode() { ... }
function base64decode() { ... }

})(this.uu || this);
```

このように window.uu があれば uu.base64 が追加され、window.uu が無ければ window.base64 として追加されるため、単体でも利用できます。

より詳しくは http://d.hatena.ne.jp/uupaa/20100524/1274684311 を参照してください。