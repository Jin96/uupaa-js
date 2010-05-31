
// === uu.msgpack / window.msgpack ===
// http://msgpack.sourceforge.net/
//{{{!depend uu.utf8
//}}}!depend

(this.uu || this).msgpack || (function(namespace) {

var _bin2num = {}, // { "00000000": 0, "00000001": 1, ... }
    // --- minify ---
    _0x100000000000000 = 0x100000000000000,
    _0x1000000000000 =     0x1000000000000,
    _0x10000000000 =         0x10000000000,
    _0x100000000 =             0x100000000,
    _0x1000000 =                 0x1000000,
    _0x10000 =                     0x10000,
    _0x100 =                         0x100,
    _0xff =                           0xff,
    _0x80 =                           0x80,
    _0x8000 =                       0x8000,
    _0x80000000 =               0x80000000,
    _00000000000 =           "00000000000",
    _sign = {
        8: _0x80,
        16: _0x8000,
        32: _0x80000000
    },
    _pow = Math.pow,
    _floor = Math.floor,
    _toString = Object.prototype.toString,
    _buggyToString2 = /2/.test((1.2).toString(2)); // [OPERA][FIX]

namespace.msgpack = {
    pack:   msgpackpack,  // uu.msgpack.pack(data:Mix):ByteArray
    unpack: msgpackunpack // uu.msgpack.unpack(data:String/ByteArray):Mix
};

// uu.msgpack.pack
function msgpackpack(data) { // @param Mix:
                             // @return ByteArray:
    return encode([], data);
}

// uu.msgpack.unpack
function msgpackunpack(data) { // @param String/ByteArray:
                               // @return Mix:
    var ary, i, iz;

    // convert String to ByteArray
    if (typeof data === "string") {
        for (ary = [], i = 0, iz = data.length; i < iz; ++i) {
            ary[i] = data.charCodeAt(i);
        }
    }
    return { data: ary || data, index: -1, decode: decode }.decode();
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
            namespace.utf8.encode(mix, utf8byteArray = []);
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
    var rv, size, i = 0, msb = 0, exp, key,
        that = this,
        data = that.data,
        type = data[++that.index];

    if (type >= 0xe0) {         // negative fixnum (111x xxxx) (-32 ~ -1)
        return type - _0x100;
    }
    if (type < _0x80) {         // positive fixnum (0xxx xxxx) (0 ~ 127)
        return type;
    }
    if (type < 0x90) {          // FixMap (1000 xxxx)
        size = type - _0x80, type = _0x80;
    } else if (type < 0xa0) {   // FixArray (1001 xxxx)
        size = type - 0x90, type = 0x90;
    } else if (type < 0xc0) {   // FixRaw (101x xxxx)
        size = type - 0xa0, type = 0xa0;
    }
    switch (type) {
    case 0xc0:  return null;
    case 0xc2:  return false;
    case 0xc3:  return true;
    case 0xca:  rv = readByte(that, 4);      // float
                exp = ((rv >> 23) & _0xff) - 127; // exp bias
                return (rv & _sign[32] ? -1 : 1)
                        * (rv & 0x7fffff | 0x800000) * _pow(2, exp - 23);
    case 0xcb:  rv = readByte(that, 4);      // double
                exp = ((rv >> 20) & 0x7ff) - 1023; // exp bias
                return (rv & _sign[32] ? -1 : 1)
                        * ((rv & 0xfffff | 0x100000) * _pow(2, exp - 20)
                            + readByte(that, 4) * _pow(2, exp - 52));
    case 0xcf:  return readByte(that, 8);    // uint 64
    case 0xce:  return readByte(that, 4);    // uint 32
    case 0xcd:  return readByte(that, 2);    // uint 16
    case 0xcc:  return readByte(that, 1);    // uint 8
    case 0xd3:  return decodeInt64(that);
    case 0xd2:  rv = readByte(that, 4);      // int 32
    case 0xd1:  rv === void 0 && (rv = readByte(that, 2));      // int 16
    case 0xd0:  rv === void 0 && (rv = readByte(that, 1));      // int 8
                msb = 4 << ((type & 0x3) + 1); // 8, 16, 32
                return rv < _sign[msb] ? rv : rv - _sign[msb] * 2;
    case 0xdb:  size = readByte(that, 4);                       // raw 32
    case 0xda:  size === void 0 && (size = readByte(that, 2));  // raw 16
    case 0xa0:  i = that.index + 1;                             // raw
                that.index += size;
                return namespace.utf8.decode(data, i, i + size);
    case 0xdf:  size = readByte(that, 4);                       // map 32
    case 0xde:  size === void 0 && (size = readByte(that, 2));  // map 16
    case 0x80:  for (rv = {}; i < size; ++i) {                  // map
                    key = that.decode();
                    rv[key] = that.decode(); // key/value pair
                }
                return rv;
    case 0xdd:  size = readByte(that, 4);                       // array 32
    case 0xdc:  size === void 0 && (size = readByte(that, 2));  // array 16
    case 0x90:  for (rv = []; i < size; ++i) {                  // array
                    rv.push(that.decode());
                }
                return rv;
    }
    return;
}

// inner - read byte
function readByte(that,   // @param Object:
                  size) { // @param Number:
                          // @return Number:
    var rv = 0, data = that.data, i = that.index;

    switch (size) {
    case 8: rv += data[++i] * _0x100000000000000; // << 56
            rv += data[++i] *   _0x1000000000000; // << 48
            rv += data[++i] *     _0x10000000000; // << 40
            rv += data[++i] *       _0x100000000; // << 32
    case 4: rv += data[++i] *         _0x1000000; // << 24
            rv += data[++i] *           _0x10000; // << 16
    case 2: rv += data[++i] *             _0x100; // << 8
    case 1: rv += data[++i];
    }
    that.index = i;
    return rv;
}

// inner - decode int64
function decodeInt64(that) { // @param Object:
                             // @return Number:
    var rv = 0, data = that.data, overflow = 0,
        bytes = data.slice(that.index + 1, that.index + 9);

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
    rv += bytes[0] * _0x100000000000000;
    rv += bytes[1] *   _0x1000000000000;
    rv += bytes[2] *     _0x10000000000;
    rv += bytes[3] *       _0x100000000;
    rv += bytes[4] *         _0x1000000;
    rv += bytes[5] *           _0x10000;
    rv += bytes[6] *             _0x100;
    rv += bytes[7];

    if (overflow) {
        rv += 1;
        rv *= -1;
    }
    return rv;
}

// inner - encode number
function encodeNumber(rv,    // @param ByteArray: result
                      mix) { // @param Number:
    if (_floor(mix) === mix) { // bugfix // (mix | 0 == mix)
        if (mix < 0) { // int
            if (mix >= -32) { // negative fixnum
                rv.push(0xe0 + mix + 32);
            } else if (mix >= -_0x80) {
                rv.push(0xd0, mix + _0x100);
            } else if (mix >= -_0x8000) {
                mix += _0x10000;
                rv.push(0xd1, mix >> 8, mix & _0xff);
            } else if (mix >= -_0x80000000) {
                mix += _0x100000000;
                rv.push(0xd2, mix >>> 24, (mix >> 16) & _0xff,
                                          (mix >>  8) & _0xff, mix & _0xff);
            } else {
                rv.push(0xd3, _floor(mix / _0x100000000000000) & _0xff,
                              _floor(mix /   _0x1000000000000) & _0xff,
                              _floor(mix /     _0x10000000000) & _0xff,
                              _floor(mix /       _0x100000000) & _0xff,
                              _floor(mix /         _0x1000000) & _0xff,
                              (mix >>  16) & _0xff,
                              (mix >>   8) & _0xff,
                                       mix & _0xff);
            }
        } else { // uint
            if (mix < 128) {
                rv.push(mix); // positive fixnum
            } else if (mix < _0x100) { // uint 8
                rv.push(0xcc, mix);
            } else if (mix < _0x10000) { // uint 16
                rv.push(0xcd, mix >> 8, mix & _0xff);
            } else if (mix < _0x100000000) { // uint 32
                rv.push(0xce, mix >>> 24, (mix >> 16) & _0xff,
                                          (mix >>  8) & _0xff, mix & _0xff);
            } else {
                rv.push(0xcf, _floor(mix / _0x100000000000000) & _0xff,
                              _floor(mix /   _0x1000000000000) & _0xff,
                              _floor(mix /     _0x10000000000) & _0xff,
                              _floor(mix /       _0x100000000) & _0xff,
                              (mix >>> 24) & _0xff,
                              (mix >>  16) & _0xff,
                              (mix >>   8) & _0xff,
                                       mix & _0xff);
            }
        }
    } else { // double
        toIEEE754(rv, mix);
    }
}

// inner - Number to IEEE754 formated ByteArray
function toIEEE754(rv,    // @param ByteArray: result, [0xcb, ...]
                   num) { // @param Number:

    // see -> http://pc.nikkeibp.co.jp/pc21/special/gosa/eg4.shtml

    var sign = num < 0 ? "1" : "0";
    var fraction;
    //  (123.456).toString(2)
    //      = "1111011.0111010010111100011010100111111011111001110111"
    //  (0.1).toString(2)
    //      = "0.0001100110011001100110011001100110011001100110011001101"
    var exp;

    if (_buggyToString2) {
        fraction = numberToBinaryString(Math.abs(num));
    } else {
        fraction = Math.abs(num).toString(2);
    }

    // case "1.xxx" or "0.xxxx"
    if (fraction.charAt(1) === ".") {
        if (fraction.charAt(0) === "1") { // /^1\./
            exp = 1023;
            exp = "0" + exp.toString(2); // pad zero

            fraction = fraction.slice(2); // "1.xxx" -> "xxx"
        } else { // /^0\./
            exp = 1023 - fraction.indexOf("1") + 1; // "0.00011000..." -> -5 + 1 = -4
            exp = (_00000000000 + exp.toString(2)).slice(-11); // pad zero

            fraction = fraction.slice(6); // "0.00011000..." -> "1000..."
        }
    } else {
        // case "11.xxxx"
        exp = 1023 + fraction.indexOf(".") - 1;
        exp = (_00000000000 + exp.toString(2)).slice(-11); // pad zero

        fraction = fraction.slice(1).replace(/\./, "");
    }
    fraction += "0000000000000000000000000000000000000000000000000000"; // x52


    // TODO: Rounding


    var s = (sign + exp + fraction).slice(0, 64);

    rv.push(0xcb, _bin2num[s.slice(0,  8) ], _bin2num[s.slice(8,  16)],
                  _bin2num[s.slice(16, 24)], _bin2num[s.slice(24, 32)],
                  _bin2num[s.slice(32, 40)], _bin2num[s.slice(40, 48)],
                  _bin2num[s.slice(48, 56)], _bin2num[s.slice(56, 64)]);
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

// inner - convert number to binary string
function numberToBinaryString(num) { // @param Number:
                                     // @return BinaryString: "0.11001100..."
    var rv = [], decimal = _floor(num), fraction, n, x, x2;

    rv.push(decimal.toString(2));

    if (decimal !== num) {
        rv.push(".");
        fraction = num - decimal;
        n = 1;
        x = fraction;
        while (n < 56) {
            x2 = x * 2;
            if (x2 < 1) {
                rv.push("0");
                x = x2;
            } else if (x2 > 1) {
                rv.push("1");
                x = x2 - 1;
            } else if (x2 === 1) {
                rv.push("1"); // tiny Rounding
                break;
            }
            ++n;
        }
    }
    return rv.join("");
}

// --- init ---
// inner - create binaryToNumber hash
(function() {
    var i = 0, s;

    for (; i < _0x100; ++i) {
        s = ("0000000" + i.toString(2)).slice(-8);
        _bin2num[s] = i;
    }
})();

})(this.uu || this);
