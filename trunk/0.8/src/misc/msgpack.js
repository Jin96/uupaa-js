
// === uu.msgpack / window.msgpack ===
// MessagePack -> http://msgpack.sourceforge.net/

(this.uu || this).msgpack || (function(globalScope) {

globalScope.msgpack = {
    pack:       msgpackpack,    // msgpack.pack(data:Mix):ByteArray
    unpack:     msgpackunpack,  // msgpack.unpack(data:BinaryString/ByteArray):Mix
    worker:     "msgpack.js",   // msgpack.worker - WebWorkers script filename
    upload:     msgpackupload,  // msgpack.upload(url:String, option:Hash, callback:Function)
    download:   msgpackdownload // msgpack.download(url:String, option:Hash, callback:Function)
};

var _ie         = /MSIE/.test(navigator.userAgent),
    _bit2num    = {}, // BitStringToNumber      { "00000000": 0, ... "11111111": 255 }
    _bin2num    = {}, // BinaryStringToNumber   { "\00": 0, ... "\ff": 255 }
    _num2bin    = {}, // NumberToBinaryString   { 0: "\00", ... 255: "\ff" }
    _num2b64    = ("ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                   "abcdefghijklmnopqrstuvwxyz0123456789+/").split(""),
    // http://twitter.com/uupaa/statuses/15870126840
    // http://twitter.com/uupaa/statuses/15876185346
    // http://twitter.com/uupaa/statuses/15876986379
    _toString2  = !/2/.test((1.2).toString(2)) && // [Opera][FIX]
                  (0.250223099719733).toString(2)
                        === "0.0100000000001110100111101111111", // [Safari][FIX]
    // --- minify ---
    _0x100000000000000 = 0x100000000000000,
    _0x1000000000000 =     0x1000000000000,
    _0x10000000000 =         0x10000000000,
    _0x100000000 =             0x100000000,
    _0x1000000 =                 0x1000000,
    _0x10000 =                     0x10000,
    _0x100 =                         0x100,
    _0xff =    /*              */     0xff,
    _0x80 =                           0x80,
    _0x8000 =                       0x8000,
    _0x80000000 =               0x80000000,
    _00000000000 =            "00000000000",
    _sign = {
        8: _0x80,
        16: _0x8000,
        32: _0x80000000
    },
    _pow = Math.pow,
    _floor = Math.floor;

// for WebWorkers Code Block
self.importScripts && (onmessage = function(event) {
    if (event.data.method === "pack") {
        postMessage(base64encode(msgpackpack(event.data.data)));
    } else {
        postMessage(msgpackunpack(event.data.data));
    }
});

// msgpack.pack
function msgpackpack(data) { // @param Mix:
                             // @return ByteArray:
    return encode([], data);
}

// msgpack.unpack
function msgpackunpack(data) { // @param BinaryString/ByteArray:
                               // @return Mix:
    return { data: typeof data === "string" ? toByteArray(data)
                                            : data,
             index: -1, decode: decode }.decode();
}

// inner - encoder
function encode(rv,    // @param ByteArray: result
                mix) { // @param Mix: source data
    var size = 0, i = 0, utf8byteArray;

    if (mix == null) { // null or undefined
        rv.push(0xc0);
    } else {
        switch (typeof mix) {
        case "boolean":
            rv.push(mix ? 0xc3 : 0xc2);
            break;
        case "number":
            encodeNumber(rv, mix);
            break;
        case "string":
            utf8byteArray = utf8encode(mix);
            setType(rv, 32, utf8byteArray.length, [0xa0, 0xda, 0xdb]);
            Array.prototype.push.apply(rv, utf8byteArray);
            break;
        default: // array or hash
            if (Object.prototype.toString.call(mix) === "[object Array]") { // array
                size = mix.length;
                setType(rv, 16, size, [0x90, 0xdc, 0xdd]);
                for (; i < size; ++i) {
                    encode(rv, mix[i]);
                }
            } else { // hash
                if (Object.keys) {
                    size = Object.keys(mix).length;
                } else {
                    for (i in mix) {
                        mix.hasOwnProperty(i) && ++size;
                    }
                }
                setType(rv, 16, size, [_0x80, 0xde, 0xdf]);
                for (i in mix) {
                    encode(rv, i);
                    encode(rv, mix[i]);
                }
            }
        }
    }
    return rv;
}

// inner - decoder
function decode() { // @return Mix:
    var rv, undef, size, i = 0, msb = 0, sign, exp, fraction, key,
        that = this,
        data = that.data,
        type = data[++that.index];

    if (type >= 0xe0) {         // Negative FixNum (111x xxxx) (-32 ~ -1)
        return type - _0x100;
    }
    if (type < _0x80) {         // Positive FixNum (0xxx xxxx) (0 ~ 127)
        return type;
    }
    if (type < 0x90) {          // FixMap (1000 xxxx)
        size = type - _0x80;
        type = _0x80;
    } else if (type < 0xa0) {   // FixArray (1001 xxxx)
        size = type - 0x90;
        type = 0x90;
    } else if (type < 0xc0) {   // FixRaw (101x xxxx)
        size = type - 0xa0;
        type = 0xa0;
    }
    switch (type) {
    case 0xc0:  return null;
    case 0xc2:  return false;
    case 0xc3:  return true;
    case 0xca:  rv = readByte(that, 4);     // float
                sign = rv & _sign[32];      //  1bit
                exp = (rv >> 23) & _0xff;   //  8bits
                fraction = rv & 0x7fffff;   // 23bits
                if (!rv || rv === _0x80000000) { // 0.0 or -0.0
                    return 0;
                }
                if (exp === _0xff) { // NaN or Infinity
                    return fraction ? NaN : Infinity;
                }
                return (sign ? -1 : 1) *
                            (fraction | 0x800000) * _pow(2, exp - 127 - 23); // 127: bias
    case 0xcb:  rv = readByte(that, 4);     // double
                sign = rv & _sign[32];      //  1bit
                exp = (rv >> 20) & 0x7ff;   // 11bits
                fraction = rv & 0xfffff;    // 52bits - 32bits (high word)
                if (!rv || rv === _0x80000000) { // 0.0 or -0.0
                    return 0;
                }
                if (exp === 0x7ff) { // NaN or Infinity
                    return fraction ? NaN : Infinity;
                }
                return (sign ? -1 : 1) *
                            ((fraction | 0x100000)  * _pow(2, exp - 1023 - 20) // 1023: bias
                                + readByte(that, 4) * _pow(2, exp - 1023 - 52));
    case 0xcf:  return readByte(that, 4) * _pow(2, 32) +
                       readByte(that, 4);                       // uint 64
    case 0xce:  return readByte(that, 4);                       // uint 32
    case 0xcd:  return readByte(that, 2);                       // uint 16
    case 0xcc:  return readByte(that, 1);                       // uint 8
    case 0xd3:  return decodeInt64(that);                       // int 64
    case 0xd2:  rv = readByte(that, 4);                         // int 32
    case 0xd1:  rv === undef && (rv = readByte(that, 2));       // int 16
    case 0xd0:  rv === undef && (rv = readByte(that, 1));       // int 8
                msb = 4 << ((type & 0x3) + 1); // 8, 16, 32
                return rv < _sign[msb] ? rv : rv - _sign[msb] * 2;
    case 0xdb:  size = readByte(that, 4);                       // raw 32
    case 0xda:  size === undef && (size = readByte(that, 2));   // raw 16
    case 0xa0:  i = that.index + 1;                             // raw
                that.index += size;
                return utf8decode(data, i, i + size);
    case 0xdf:  size = readByte(that, 4);                       // map 32
    case 0xde:  size === undef && (size = readByte(that, 2));   // map 16
    case 0x80:  for (rv = {}; i < size; ++i) {                  // map
                    key = that.decode();
                    rv[key] = that.decode(); // key/value pair
                }
                return rv;
    case 0xdd:  size = readByte(that, 4);                       // array 32
    case 0xdc:  size === undef && (size = readByte(that, 2));   // array 16
    case 0x90:  for (rv = []; i < size; ++i) {                  // array
                    rv.push(that.decode());
                }
    }
    return rv;
}

// inner - read byte
function readByte(that,   // @param Object:
                  size) { // @param Number:
                          // @return Number:
    var rv = 0, data = that.data, i = that.index;

    switch (size) {
    case 4: rv += data[++i] * _0x1000000 + (data[++i] << 16);
    case 2: rv += data[++i] << 8;
    case 1: rv += data[++i];
    }
    that.index = i;
    return rv;
}

// inner - decode int64
function decodeInt64(that) { // @param Object:
                             // @return Number:
    var rv, overflow = 0,
        bytes = that.data.slice(that.index + 1, that.index + 9);

    that.index += 8;

    // avoid overflow
    if (bytes[0] & _0x80) {

        ++overflow;
        bytes[0] ^= _0xff;
        bytes[1] ^= _0xff;
        bytes[2] ^= _0xff;
        bytes[3] ^= _0xff;
        bytes[4] ^= _0xff;
        bytes[5] ^= _0xff;
        bytes[6] ^= _0xff;
        bytes[7] ^= _0xff;
    }
    rv = bytes[0] * _0x100000000000000
       + bytes[1] *   _0x1000000000000
       + bytes[2] *     _0x10000000000
       + bytes[3] *       _0x100000000
       + bytes[4] *         _0x1000000
       + bytes[5] *           _0x10000
       + bytes[6] *             _0x100
       + bytes[7];

    if (overflow) {
        rv += 1;
        rv *= -1;
    }
    return rv;
}

// inner - encode number
function encodeNumber(rv,    // @param ByteArray: result
                      mix) { // @param Number:
    if (mix !== mix) { // isNaN
        rv.push(0xcb, _0xff, _0xff, _0xff, _0xff, _0xff, _0xff, _0xff, _0xff); // quiet NaN
    } else if (!isFinite(mix)) { // Infinity
        rv.push(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00); // positive infinity
    } else if (_floor(mix) === mix) {
        var high, low, i64 = 0;

        if (mix < 0) { // int
            if (mix >= -32) { // negative fixnum
                rv.push(0xe0 + mix + 32);
            } else if (mix > -_0x80) {
                rv.push(0xd0, mix + _0x100);
            } else if (mix > -_0x8000) {
                mix += _0x10000;
                rv.push(0xd1, mix >> 8, mix & _0xff);
            } else if (mix > -_0x80000000) {
                mix += _0x100000000;
                rv.push(0xd2, mix >>> 24, (mix >> 16) & _0xff,
                                          (mix >>  8) & _0xff, mix & _0xff);
            } else {
                ++i64;
            }
        } else { // uint
            if (mix < _0x80) {
                rv.push(mix); // positive fixnum
            } else if (mix < _0x100) { // uint 8
                rv.push(0xcc, mix);
            } else if (mix < _0x10000) { // uint 16
                rv.push(0xcd, mix >> 8, mix & _0xff);
            } else if (mix < _0x100000000) { // uint 32
                rv.push(0xce, mix >>> 24, (mix >> 16) & _0xff,
                                          (mix >>  8) & _0xff, mix & _0xff);
            } else {
                ++i64;
            }
        }
        if (i64) {
            high = _floor(mix / _0x100000000);
            low = mix & (_0x100000000 - 1);
            rv.push(mix < 0 ? 0xd3 : 0xcf,
                          (high >> 24) & _0xff, (high >> 16) & _0xff,
                          (high >>  8) & _0xff,         high & _0xff,
                          (low  >> 24) & _0xff, (low  >> 16) & _0xff,
                          (low  >>  8) & _0xff,          low & _0xff);
        }
    } else { // double
        toIEEE754(rv, mix);
    }
}

// inner - Number to IEEE754 formated ByteArray
function toIEEE754(rv,    // @param ByteArray: result, [0xcb, ...]
                   num) { // @param Number:

    // see -> http://pc.nikkeibp.co.jp/pc21/special/gosa/eg4.shtml

    //  (123.456).toString(2)
    //      = "1111011.0111010010111100011010100111111011111001110111"
    //  (0.1).toString(2)
    //      = "0.0001100110011001100110011001100110011001100110011001101"
    var ary, sign = num < 0 ? "1" : "0", exp, bit2num = _bit2num,
        fraction = _toString2 ? Math.abs(num).toString(2)
                 : numberToBinaryString(Math.abs(num));

    if (fraction.charAt(1) === ".") { // case "1.xxx" or "0.xxxx"
        if (fraction.charAt(0) === "1") { // /^1\./
            exp = 1023;
            exp = "0" + exp.toString(2);  // pad zero
            fraction = fraction.slice(2); // "1.xxx" -> "xxx"
        } else { // /^0\./
            exp = 1023 - fraction.indexOf("1") + 1; // "0.00011000..." -> -5 + 1 = -4
            exp = (_00000000000 + exp.toString(2)).slice(-11);    // pad zero
            fraction = fraction.slice(fraction.indexOf("1") + 1); // "0.00011000..." -> "1000..."
        }
    } else { // case "11.xxxx"
        exp = 1023 + fraction.indexOf(".") - 1;
        exp = (_00000000000 + exp.toString(2)).slice(-11); // pad zero
        fraction = fraction.slice(1).replace(/\./, "");
    }
    // http://twitter.com/uupaa/statuses/15912478013
    ary = (sign + exp + fraction
                + "0000000000000000000000000000000000000000000000000000"). // x52
                slice(0, 64).match(/.{8}/g);
    rv.push(0xcb, bit2num[ary[0]], bit2num[ary[1]],
                  bit2num[ary[2]], bit2num[ary[3]],
                  bit2num[ary[4]], bit2num[ary[5]],
                  bit2num[ary[6]], bit2num[ary[7]]);
}

// inner - set type and fixed size
function setType(rv,      // @param ByteArray: result
                 fixSize, // @param Number: fix size. 16 or 32
                 size,    // @param Number: size
                 types) { // @param ByteArray: type formats. eg: [0x90, 0xdc, 0xdd]
    if (size < fixSize) {
        rv.push(types[0] + size);
    } else if (size < _0x10000) { // 16
        rv.push(types[1], size >> 8, size & _0xff);
    } else if (size < _0x100000000) { // 32
        rv.push(types[2], size >>> 24, (size >> 16) & _0xff,
                                       (size >>  8) & _0xff, size & _0xff);
    }
}

// inner - Number to BinaryString
function numberToBinaryString(num) { // @param Number:
                                     // @return BinaryString: "0.11001100..."
    var decimal = _floor(num), fraction, n = 1, x, x2,
        rv = [decimal.toString(2)], ri = 0,
        found1 = 0, depth = 54;

    if (decimal !== num) {
        rv[++ri] = ".";
        fraction = num - decimal;
        x = fraction;

        while (n < depth) {
            x2 = x * 2;
            if (x2 < 1) {
                rv[++ri] = "0";
                found1 || ++depth;
                x = x2;
            } else if (x2 > 1) {
                rv[++ri] = "1";
                ++found1;
                x = x2 - 1;
            } else if (x2 === 1) {
                rv[++ri] = "1"; // tiny Rounding
                break;
            }
            ++n;
        }
    }
    return rv.join("");
}

// msgpack.download - load from server
function msgpackdownload(url,        // @param String:
                         option,     // @param Hash: { worker, timeout }
                                     //    option.worker - Boolean(= false): true is use WebWorkers
                                     //    option.timeout - Number(= 10): timeout sec
                         callback) { // @param Function: callback function
                                     //    callback(response = { ok, status, option, data, length })
                                     //        response.ok - Boolean:
                                     //        response.status - Number: HTTP status code
                                     //        response.option - Hash:
                                     //        response.data   - Mix/null:
                                     //        response.length - Number: downloaded data.length

    option.method = "GET";
    ajax(url, option, callback);
}

// msgpack.upload - save to server
function msgpackupload(url,        // @param String:
                       option,     // @param Hash: { data, worker, timeout }
                                   //    option.data - Mix:
                                   //    option.worker - Boolean(= false): true is use WebWorkers
                                   //    option.timeout - Number(= 10): timeout sec
                       callback) { // @param Function: callback function
                                   //    callback(response = { ok, status, option, data, length })
                                   //        response.ok - Boolean:
                                   //        response.status - Number: HTTP status code
                                   //        response.option - Hash:
                                   //        response.data   - String:
                                   //        response.length - Number: uploaded data.length
    option.method = "PUT";

    if (option.worker && globalScope.Worker) {
        var worker = new Worker(msgpack.worker);

        worker.onmessage = function(event) {
            option.data = event.data;
            ajax(url, option, callback);
        };
        worker.postMessage({ method: "pack", data: option.data });
    } else {
        // pack and base64 encode
        option.data = base64encode(msgpackpack(option.data));
        ajax(url, option, callback);
    }
}

// inner -
function ajax(url,        // @param String:
              option,     // @param Hash: { worker, timeout, data, method }
                          //    option.data - Mix: upload data
                          //    option.worker - Boolean(= false): true is use WebWorkers
                          //    option.method - String: "GET" or "PUT"
                          //    option.timeout - Number(= 10): timeout sec
              callback) { // @param Function: callback function
                          //    callback(response = { ok, status, option, data, length })
                          //        response.ok - Boolean:
                          //        response.status - Number: HTTP status code
                          //        response.option - Hash:
                          //        response.data   - String/Mix/null:
                          //        response.length - Number:
    function readyStateChange() {
        if (xhr.readyState === 4) {
            var status = xhr.status, worker, byteArray,
                rv = { ok: status >= 200 && status < 300,
                       status: status, option: option, data: null, length: 0 };

            if (!run++) {
                if (upload) {
                    rv.data = rv.ok ? xhr.responseText : "";
                    rv.length = option.data.length;
                } else {
                    if (rv.ok) {
                        rv.length = xhr.getResponseHeader("Content-Length");
                        if (option.worker && globalScope.Worker) {
                            worker = new Worker(msgpack.worker);
                            worker.onmessage = function(event) {
                                rv.data = event.data;
                                callback(rv);
                            };
                            worker.postMessage({ method: "unpack",
                                                 data: xhr.responseText });
                            gc();
                            return;
                        } else {
                            byteArray = _ie ? toByteArrayIE(xhr)
                                            : toByteArray(xhr.responseText)
                            rv.data = msgpackunpack(byteArray);
                        }
                    }
                }
                callback(rv);
                gc();
            }
        }
    }

    function ng(abort, status) {
        if (!run++) {
            callback({ ok: false, status: status || 400, option: option,
                       data: upload ? "" : null });
            gc(abort);
        }
    }

    function gc(abort) {
        abort && xhr && xhr.abort && xhr.abort();
        watchdog && (clearTimeout(watchdog), watchdog = 0);
        xhr = null;
        globalScope.addEventListener &&
            globalScope.removeEventListener("beforeunload", ng, false);
    }

    var run = 0, watchdog = 0,
        upload = option.method === "PUT",
        xhr = globalScope.XMLHttpRequest ? new XMLHttpRequest() :
              globalScope.ActiveXObject  ? new ActiveXObject("Microsoft.XMLHTTP") :
              null;

    try {
        xhr.onreadystatechange = readyStateChange;
        xhr.open(option.method, url, true); // ASync

        if (!upload && xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        }
        globalScope.addEventListener &&
            globalScope.addEventListener("beforeunload", ng, false); // 400: Bad Request

        xhr.send(upload ? option.data : null);
        watchdog = setTimeout(function() {
            ng(1, 408); // 408: Request Time-out
        }, (option.timeout || 10) * 1000);
    } catch (err) {
        ng(0, 400); // 400: Bad Request
    }
}

// inner - BinaryString To ByteArray
function toByteArray(data) { // @param BinaryString: "\00\01"
                             // @return ByteArray: [0x00, 0x01]
    var rv = [], bin2num = _bin2num, remain,
        ary = data.split(""),
        i = -1, iz;

    iz = ary.length;
    remain = iz % 8;

    while (remain--) {
        ++i;
        rv[i] = bin2num[ary[i]];
    }
    remain = iz >> 3;
    while (remain--) {
        rv.push(bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]],
                bin2num[ary[++i]], bin2num[ary[++i]]);
    }
    return rv;
}

// inner - BinaryString to ByteArray
function toByteArrayIE(xhr) {
    var rv = [], data, remain,
        charCodeAt = "charCodeAt", _0xff = 0xff,
        loop, v0, v1, v2, v3, v4, v5, v6, v7,
        i = -1, iz;

    iz = vblen(xhr);
    data = vbstr(xhr);
    loop = Math.ceil(iz / 2);
    remain = loop % 8;

    while (remain--) {
        v0 = data[charCodeAt](++i); // 0x00,0x01 -> 0x0100
        rv.push(v0 & _0xff, v0 >> 8);
    }
    remain = loop >> 3;
    while (remain--) {
        v0 = data[charCodeAt](++i);
        v1 = data[charCodeAt](++i);
        v2 = data[charCodeAt](++i);
        v3 = data[charCodeAt](++i);
        v4 = data[charCodeAt](++i);
        v5 = data[charCodeAt](++i);
        v6 = data[charCodeAt](++i);
        v7 = data[charCodeAt](++i);
        rv.push(v0 & _0xff, v0 >> 8, v1 & _0xff, v1 >> 8,
                v2 & _0xff, v2 >> 8, v3 & _0xff, v3 >> 8,
                v4 & _0xff, v4 >> 8, v5 & _0xff, v5 >> 8,
                v6 & _0xff, v6 >> 8, v7 & _0xff, v7 >> 8);
    }
    iz % 2 && rv.pop();

    return rv;
}

// inner - String to UTF8ByteArray
function utf8encode(str) { // @param String: JavaScript string
                           // @return UTF8ByteArray: [ Number(utf8), ... ]
    var rv = [], iz = str.length, c = 0, i = -1;

    while (i < iz) {
        c = str.charCodeAt(++i);
        if (c < _0x80) { // ASCII(0x00 ~ 0x7f)
            rv.push(c & 0x7f);
        } else if (c < 0x0800) {
            rv.push(((c >>>  6) & 0x1f) | 0xc0, (c & 0x3f) | _0x80);
        } else if (c < 0x10000) {
            rv.push(((c >>> 12) & 0x0f) | 0xe0,
                    ((c >>>  6) & 0x3f) | 0x80, (c & 0x3f) | _0x80);
        }
    }
    return rv;
}

// inner - UTF8ByteArray to String
function utf8decode(byteArray,  // @param UTF8ByteArray: [ Number(utf8), ... ]
                    startIndex, // @param Number(= 0):
                    endIndex) { // @param Number(= void):
                                // @return String: JavaScript string(UNICODE)
    var rv = [], ri = -1, iz = endIndex || byteArray.length, c = 0,
        i = startIndex || 0;

    if (iz > byteArray.length) {
        iz = byteArray.length;
    }

    for (; i < iz; ++i) {
        c = byteArray[i]; // first byte
        if (c < _0x80) { // ASCII(0x00 ~ 0x7f)
            rv[++ri] = c;
        } else if (c < 0xe0) {
            rv[++ri] = (c & 0x1f) <<  6 | (byteArray[++i] & 0x3f);
        } else if (c < 0xf0) {
            rv[++ri] = (c & 0x0f) << 12 | (byteArray[++i] & 0x3f) << 6
                                        | (byteArray[++i] & 0x3f);
        }
    }
    return String.fromCharCode.apply(null, rv);
}

// inner - base64.encode
function base64encode(data) { // @param ByteArray:
                              // @return Base64String:
    var rv = [], pad = 0, c = 0, i = -1, iz, num2b64 = _num2b64;

    if (globalScope.btoa) {
        iz = data.length;
        while (i < iz) {
            rv.push(_num2bin[data[++i]]);
        }
        return btoa(rv.join(""));
    }

    switch (data.length % 3) {
    case 1: data.push(0); ++pad;
    case 2: data.push(0); ++pad;
    }
    iz = data.length - 1;

    while (i < iz) {
        c = (data[++i] << 16) | (data[++i] << 8) | (data[++i]); // 24bit
        rv.push(num2b64[(c >> 18) & 0x3f],
                num2b64[(c >> 12) & 0x3f],
                num2b64[(c >>  6) & 0x3f],
                num2b64[ c        & 0x3f]);
    }
    pad > 1 && (rv[rv.length - 2] = "=", data.pop());
    pad > 0 && (rv[rv.length - 1] = "=", data.pop());
    return rv.join("");
}

// --- init ---
(function() {
    var i = 0, v;

    for (; i < _0x100; ++i) {
        v = String.fromCharCode(i);
        _bit2num[("0000000" + i.toString(2)).slice(-8)] = i;
        _bin2num[v] = i; // "\00" -> 0x00
        _num2bin[i] = v; //     0 -> "\00"
    }
    // http://twitter.com/edvakf/statuses/15576483807
    for (i = _0x80; i < _0x100; ++i) { // [Webkit][Gecko]
        _bin2num[String.fromCharCode(0xf700 + i)] = i; // "\f780" -> 0x80
    }
})();

_ie && document.write('<script type="text/vbscript">\
Function vblen(b)vblen=LenB(b.responseBody)End Function\n\
Function vbstr(b)vbstr=CStr(b.responseBody)+chr(0)End Function</'+'script>');

})(this.uu || this);
