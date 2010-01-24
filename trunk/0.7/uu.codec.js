
// === Codec ===
// depend: uu.js
uu.agein || (function(uu) {
var _B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    _DATA_URI   = /^data:([\w\/]+)(;base64)?,/,
    _B64_NGCHAR = /[^A-Za-z0-9\+\/]/,
    _S64_CHAR   = /-_=/g,
    _S64_NGCHAR = /\+\/=/g,
    _TO_B64     = { "-": "+", "_": "/", "=": "" },
    _TO_S64     = { "+": "-", "/": "_", "=": "" },
    _b64db      = _makeBase64Hash();

uu.codec = {
  hex: {
    decode:   uucodechexdecode     // uu.codec.hex.decode("%00%01") -> [0x00, 0x01]
  },
  ucs2: {
    decode:   uucodecucs2decode,   // uu.codec.ucs2.decode(str) -> URLSafe64String
    encode:   uucodecucs2encode    // uu.codec.ucs2.encode(urlsafe64str) -> String
  },
  utf8: {
    decode:   uucodecutf8decode,   // uu.codec.utf8.decode(bary) -> UCS2
    encode:   uucodecutf8encode    // uu.codec.utf8.encode(ucs2) -> UTF8ByteArray
  },
  base64: {
    decode:   uucodecbase64decode, // uu.codec.base64.decode(str) -> ByteArray
    encode:   uucodecbase64encode  // uu.codec.base64.encode(ByteArray, safe64)
                                   //           -> Base64String/URLSafe64String
  },
  datauri: {
    decode:   uucodecdatauridecode // uu.codec.datauri.decode(str) -> { mime, data }
  }
};

// uu.codec.hex.decode - "%00%01" to [0x00, 0x01]
function uucodechexdecode(hex) { // @param HexString: "%00" + ASCII string
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

// uu.codec.ucs2.encode - JavaScript String(UCS2) -> UTF8 -> URLSafe64
function uucodecucs2encode(str) { // @param String:
                                  // @return URLSafe64String:
  return uucodecbase64encode(uucodecutf8encode(str));
}

// uu.codec.ucs2.decode - URLSafe64 -> UTF8 -> JavaScript String(UCS2)
function uucodecucs2decode(urlsafe64str) { // @param URLSafe64String:
                                           // @return String:
  return uucodecutf8decode(uucodecbase64decode(urlsafe64str));
}

// uu.codec.utf8.encode - UCS2String to UTF8ByteArray
function uucodecutf8encode(ucs2) { // @param String:
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

// uu.codec.utf8.decode - UTF8ByteArray to UCS2String
function uucodecutf8decode(ary) { // @param UTF8ByteArray:
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

// uu.codec.base64.encode - ByteArray to Base64String
function uucodecbase64encode(ary,       // @param ByteArray: array( [0x0, ... ] )
                             urlsafe) { // @param Boolean(= true): true = URLSafe
                                        // @return Base64String/URLSafe64String:
  var rv = [], pad = 0, code = _B64, c = 0, i = 0, iz;

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
    return rv.join("").replace(_S64_NGCHAR, toURLSafe64Char);
  }
  return rv.join("");
}

// inner - base64 char to urlsafe64 char
function toURLSafe64Char(c) {
  return _TO_S64[c];
}

// inner - urlbase64 char to base64 char
function toBase64Char(c) {
  return _TO_B64[c];
}

// uu.codec.base64.decode - Base64String to ByteArray
function uucodecbase64decode(b64) { // @param Base64String/URLSafe64String:
                                    // @return ByteArray:
  if (typeof b64 !== "string" || !b64.length) {
    return []; // empty
  }

  // URLBase64Charcter("-", "_") convert to ("+", "/")
  b64 = b64.replace(_S64_CHAR, toBase64Char);

  if (_B64_NGCHAR.test(b64)) {
    return []; // bad data
  }

  var rv = [], pad = 0, hash = _b64db, c = 0, i = 0, iz;

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
function _makeBase64Hash() {
  var rv = { "=": 0 }, i = 0, iz = _B64.length;

  for (; i < iz; ++i) {
    rv[_B64.charAt(i)] = i;
  }
  return rv;
}

// uu.codec.datauri.decode
//    data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAA...
//    data:text/css,.picture%20%7B%20background%3A%20none%3B%20%7D
function uucodecdatauridecode(str) { // @param String:
                                     // @return Hash: { mime, data }
  var m, mime, data;

  m = _DATA_URI.exec(str);
  if (m) {
    mime = m[1];
    data = str.slice(m[0].length);
    data = m[2] ? uucodecbase64decode(decodeURIComponent(data)) // base64
                : uucodechexdecode(data); // decodeURI weak("%00")
  }
  return { mime: mime || "", data: data || [] };
}

})(uu);

