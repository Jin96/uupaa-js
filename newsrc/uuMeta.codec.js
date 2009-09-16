
// === uuMeta.codec ===
// depend: uuMeta
/*
uuMeta.codec.hex.decode("%00%01") - return [0x00, 0x01]
uuMeta.codec.ucs2.encode(str) - return URLSafe64String
uuMeta.codec.ucs2.decode(urlsafe64str) - return String
uuMeta.codec.utf8.encode(ucs2) - return UTF8ByteArray
uuMeta.codec.utf8.decode(bary) - return UCS2
uuMeta.codec.base64.encode(ByteArray, safe64)
                                  - return Base64String/URLSafe64String
uuMeta.codec.base64.decode(str) - return ByteArray
uuMeta.codec.dataURI.decode(str) - return { mime, data }
 */
(function uuMetaCodecScope() {
var _b64hash            = { "=": 0 },
    _DATA_URI           = /^data:([\w\/]+)(;base64)?,/,
    _BASE64_CODE        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                          "abcdefghijklmnopqrstuvwxyz0123456789+/",
    _BASE64_BAD_DATA    = /[^A-Za-z0-9\+\/]/;
    _URLSAFE64_CHAR     = /-_=/g,
    _URLSAFE64_NG_CHAR  = /\+\/=/g,
    _TO_BASE64          = { "-": "+", "_": "/", "=": "" },
    _TO_URLSAFE64       = { "+": "-", "/": "_", "=": "" };

// uuMeta.codec.hex.decode - "%00%01" to [0x00, 0x01]
function hexDecode(hex) { // @param HexString: "%00" + ASCII string
                          // @return ByteArray:
  var rv = [], ri = -1, c = 0, i = 0, iz = hex.length,
      mark = "%".charCodeAt(0);

  if (!hex.length) {
    return [];
  }
  if (hex.length >= 3) {
    if (hex.charAt(hex.length - 1) === "%" || // tail "...%"
        hex.charAt(hex.length - 2) === "%") { // tail "..%x"
      return []; // bad data
    }
  }
  while (i < iz) {
    c = hex.charCodeAt(i++);
    if (c === mark) {
      rv[++ri] = parseInt(hex.charAt(i) + hex.charAt(i + 1), 16);
      i += 2;
    } else {
      rv[++ri] = c;
    }
  }
  return rv;
}

// uuMeta.codec.ucs2.encode - JavaScript String(UCS2) -> UTF8 -> URLSafe64
function ucs2encode(str) { // @param String:
                           // @return URLSafe64String:
  return base64encode(utf8encode(str));
}

// uuMeta.codec.ucs2.decode - URLSafe64 -> UTF8 -> JavaScript String(UCS2)
function ucs2decode(urlsafe64str) { // @param URLSafe64String:
                                    // @return String:
  return utf8decode(base64decode(urlsafe64str));
}

// uuMeta.codec.utf8.encode - UCS2String to UTF8ByteArray
function utf8encode(ucs2) { // @param String:
                            // @return UTF8ByteArray:
  if (typeof ucs2 !== "string" || !ucs2.length) { return []; }
  var rv = [], iz = ucs2.length, c = 0, i = 0;

  for (; i < iz; ++i) {
    c = ucs2.charCodeAt(i);
    if (c < 0x0080) { // ASCII
      rv.push(c & 0x7f);
    } else if (c < 0x0800) {
      rv.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | 0x80);
    } else { // if (c < 0x10000)
      rv.push(((c >>> 12) & 0x0f) | 0xe0,
              ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
    }
  }
  return rv;
}

// uuMeta.codec.utf8.decode - UTF8ByteArray to UCS2String
function utf8decode(ary) { // @param UTF8ByteArray:
                           // @return String
  if (!ary.length) { return ""; }
  var rv = [], ri = -1, iz = ary.length, c = 0, i = 0,
      C = String.fromCharCode;

  for (; i < iz; ++i) {
    c = ary[i]; // 1st byte
    if (c < 0x80) { // ASCII
      rv[++ri] = C(c);
    } else if (c < 0xe0) {
      rv[++ri] = C((c & 0x1f) << 6 | (ary[++i] & 0x3f));
    } else if (c < 0xf0) {
      rv[++ri] = C((c & 0x0f) << 12 | (ary[++i] & 0x3f) << 6
                                    | (ary[++i] & 0x3f));
    }
  }
  return rv.join("");
}

// uuMeta.codec.base64.encode - ByteArray to Base64String
function base64Encode(ary,       // @param ByteArray: array( [0x0, ... ] )
                      urlsafe) { // @param Boolean(= true): true = URLSafe
                                 // @return Base64String/URLSafe64String:
  var rv = [], pad = 0, code = _BASE64_CODE, c = 0, i = 0, iz;

  switch (ary.length % 3) {
  case 1: ary.push(0); ++pad;
  case 2: ary.push(0); ++pad;
  }
  iz = ary.length;

  while (i < iz) {
    c = (ary[i++] << 16) | (ary[i++] << 8) | (ary[i++]);
    rv.push(code.charAt((c >>> 18) & 0x3f),
            code.charAt((c >>> 12) & 0x3f),
            code.charAt((c >>>  6) & 0x3f),
            code.charAt( c         & 0x3f));
  }
  switch (pad) {
  case 2: rv[rv.length - 2] = "=";
  case 1: rv[rv.length - 1] = "=";
  }

  if (urlsafe === void 0 || urlsafe) {
    return rv.join("").replace(_URLSAFE64_NG_CHAR, toURLSafe64Char);
  }
  return rv.join("");
}

// inner - base64 char to urlsafe64 char
function toURLSafe64Char(c) {
  return _TO_URLSAFE64[c];
}

// inner - urlbase64 char to base64 char
function toBase64Char(c) {
  return _TO_BASE64[c];
}

// uuMeta.codec.base64.decode - Base64String to ByteArray
function base64Decode(b64) { // @param Base64String/URLSafe64String:
                             // @return ByteArray:
  if (typeof b64 !== "string" || !b64.length) {
    return []; // empty
  }

  // URLBase64Charcter("-", "_") convert to ("+", "/")
  b64 = b64.replace(_URLSAFE64_CHAR, toBase64Char);

  if (_BASE64_BAD_DATA.test(b64)) {
    return []; // bad data
  }

  var rv = [], pad = 0, hash = _b64hash, c = 0, i = 0, iz;

  switch (b64.length % 4) { // pad length( "=" or "==" or "" )
  case 2: b64 += "="; ++pad;
  case 3: b64 += "="; ++pad;
  }

  iz = b64.length;
  while (i < iz) {                    // 00000000|00000000|00000000
    c = (hash[b64.charAt(i++)] << 18) // 111111  |        |
      | (hash[b64.charAt(i++)] << 12) //       11|1111    |
      | (hash[b64.charAt(i++)] <<  6) //         |    1111|11
      |  hash[b64.charAt(i++)]        //         |        |  111111
    rv.push((c >>> 16) & 0xff, (c >>> 8) & 0xff, c & 0xff);
  }
  rv.length -= [0,1,2][pad]; // cut tail
  return rv;
}

// inner - make base64 hash
function makeBase64Hash() {
  var i = 0, BASE64_CODE = _BASE64_CODE,
      iz = BASE64_CODE.length;

  for (; i < iz; ++i) {
    _b64hash[BASE64_CODE.charAt(i)] = i;
  }
}

// uuMeta.codec.dataURI.decode
//    data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAA...
//    data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D
function dataURIDecode(str) { // @param String:
                              // @return Hash: { mime, data }
  var m, mime, data;

  if ( (m = _DATA_URI.exec(str)) ) {
    mime = m[1];
    data = str.slice(m[0].length);
    data = m[2] ? base64Decode(decodeURIComponent(data)) // base64
                : hexDecode(data); // decodeURI weak("%00")
  }
  return { mime: mime || "", data: data || [] };
}

// --- initialize / export ---
makeBase64Hash();

uuMeta.mix(uuMeta.codec, {
  hex:      { decode: hexDecode },
  ucs2:     { decode: ucs2decode, encode: ucs2encode },
  utf8:     { decode: utf8decode, encode: utf8encode },
  base64:   { decode: base64Decode, encode: base64Encode },
  dataURI:  { decode: dataURIDecode }
});

})(); // uuMeta.codec scope

