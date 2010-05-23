
// === uu.msgpack / window.msgpack ===
// http://msgpack.sourceforge.net/
//{{{!depend uu, uu.utf8
//}}}!depend

(function(namespace) {

var _sign = { 8: 0x80, 16: 0x8000, 32: 0x80000000, 64: 0x8000000000000000 },
    // --- minify ---
    _charCodeAt = "charCodeAt";

namespace.msgpack = {
    pack:   msgpackpack,    // uu.msgpack.pack(data:Mix, utf8:Boolean = false):ByteArray
    unpack: msgpackunpack   // uu.msgpack.unpack(data:String/ByteArray, utf8:Boolean = false):Mix
};

// uu.msgpack.pack
function msgpackpack(data,   // @param Mix:
                     utf8) { // @param Boolean(= false): true is UTF8 raw data,
                             //                          false is UCS2 raw data
                             // @return ByteArray:
    return encode([], data, utf8);
}

function encode(rv, mix, utf8) {
    var size = 0, i = 0, ff = 0xff, rr;

    if (mix === null) {
        rv.push(0xc0);
        return rv;
    } else if (isArray(mix)) {
        size = mix.length;
        setSize(rv, 16, size, [0x90, 0xdc, 0xdd]);
        for (; i < size; ++i) {
            encode(rv, mix[i], utf8);
        }
        return rv;
    }
    switch (typeof mix) {
    case "boolean":
        rv.push(mix ? 0xc3 : 0xc2);
        break;
    case "number":
        if (Math.floor(mix) === mix) { // bugfix // (mix | 0 == mix)
            if (mix < 0) {
                // int
                if (mix >= -32) { // negative fixnum
                    rv.push(0xe0 + mix + 32); // 0xff = -1, 0xe0 = -32
                } else if (mix >= -0x100) {
                    rv.push(0xd0, 0x100 + mix); // -64 = 0xc0
                } else if (mix >= -0x10000) {
                    mix += 0x10000;
                    rv.push(0xd1, mix >> 8, mix & ff);
                } else if (mix >= -0x100000000) {
                    mix += 0x100000000;
                    rv.push(0xd2, mix >>> 24, (mix >> 16) & ff, (mix >> 8) & ff, mix & ff);
                } else {
                    mix += 0x10000000000000000;
                    rv.push(0xd3, (mix / 0x100000000000000) & ff,
                                  (mix /   0x1000000000000) & ff,
                                  (mix /     0x10000000000) & ff,
                                  (mix /       0x100000000) & ff,
                                  (mix >>> 24) & ff,
                                  (mix >>  16) & ff,
                                  (mix >>   8) & ff,
                                           mix & ff);
                }
            } else {
                // uint
                if (mix < 128) {
                    rv.push(mix); // positive fixnum
                } else if (mix < 0x100) { // uint 8
                    rv.push(0xcc, mix);
                } else if (mix < 0x10000) { // uint 16
                    rv.push(0xcd, mix >> 8, mix & ff);
                } else if (mix < 0x100000000) { // uint 32
                    rv.push(0xce, mix >>> 24, (mix >> 16) & ff, (mix >> 8) & ff, mix & ff);
                } else {
                    rv.push(0xcf, (mix / 0x100000000000000) & ff,
                                  (mix /   0x1000000000000) & ff,
                                  (mix /     0x10000000000) & ff,
                                  (mix /       0x100000000) & ff,
                                  (mix >>> 24) & ff,
                                  (mix >>  16) & ff,
                                  (mix >>   8) & ff,
                                           mix & ff);
                }
            }
        } else { // double
//            return [0xcb,
            // TODO
        }
        break;
    case "string":
        size = mix.length;
        if (utf8) {
            for (rr = [], i = 0; i < size; ++i) {
                namespace.utf8.encode(mix.charAt(i), rr);
            }
            setSize(rv, 32, rr.length, [0xa0, 0xda, 0xdb]);
            Array.prototype.push.apply(rv, rr);
        } else {
            setSize(rv, 32, size, [0xa0, 0xda, 0xdb]);
            for (i = 0; i < size; ++i) {
                rv.push(mix.charCodeAt(i)); // ucs2
            }
        }
        break;
    default: // hash
        setSize(rv, 16, hashSize(mix), [0x80, 0xde, 0xdf]);
        for (i in mix) {
            encode(rv, i, utf8);
            encode(rv, mix[i], utf8);
        }
    }
    return rv;
}

function setSize(rv, fixSize, size, types) {
    var ff = 0xff;

    if (size < fixSize) {
        rv.push(types[0] + size);
    } else if (size < 0x10000) { // 16
        rv.push(types[1], size >> 8, size & ff);
    } else if (size < 0x100000000) { // 32
        rv.push(types[2], size >>> 24, size >> 16 & ff, size >> 8 & ff, size & ff);
    } else {
        throw new Error("OVERFLOW");
    }
}

function hashSize(hash) {
    var rv = 0;

    if (Object.keys) {
        return Object.keys(hash).length;
    }
    for (i in hash) {
        hash.hasOwnProperty(i) && ++rv;
    }
    return rv;
}

function isArray(mix) {
    return Object.prototype.toString.call(mix) === "[object Array]";
}

// uu.msgpack.unpack
function msgpackunpack(data,   // @param String/ByteArray:
                       utf8) { // @param Boolean(= false): true is UTF8 raw data,
                               //                          false is UCS2 raw data
                               // @return Mix:
    return { data: data, index: -1, utf8: utf8, byte: isArray(data),
             decode: decode }.decode();
}

function decode() { // @return Mix:
    var rv = 0, size = 0, i = 0, msb = 0, exp, key,
        that = this,
        data = that.data,
        type = that.byte ? data[++that.index]
                         : data[_charCodeAt](++that.index);

    if (type >= 0xe0) {         // negative fixnum (111x xxxx) (-32 ~ -1)
        return type - 0x100;
    }
    if (type < 0x80) {          // positive fixnum (0xxx xxxx) (0 ~ 127)
        return type;
    }
    if (type < 0x90) {          // FixMap (1000 xxxx)
        size = type - 0x80, type = 0x80;
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
                exp = ((rv >> 23) & 0xff) - 0x7f;
                return (rv & _sign[32] ? -1 : 1)
                        * (rv & 0x7fffff | 0x800000) * Math.pow(2, exp - 23);
    case 0xcb:  rv = readByte(that, 4);      // double
                exp = ((rv >> 20) & 0x7ff) - 1023; // +1023 bias
                return (rv & _sign[32] ? -1 : 1)
                        * ((rv & 0xfffff | 0x100000) * Math.pow(2, exp - 20)
                            + readByte(that, 4) * Math.pow(2, exp - 52));
    case 0xcf:  return readByte(that, 8);    // uint 64
    case 0xce:  return readByte(that, 4);    // uint 32
    case 0xcd:  return readByte(that, 2);    // uint 16
    case 0xcc:  return readByte(that, 1);    // uint 8
    case 0xd3:  rv = readByte(that, 8);          // int 64
    case 0xd2:  rv || (rv = readByte(that, 4));  // int 32
    case 0xd1:  rv || (rv = readByte(that, 2));  // int 16
    case 0xd0:  rv || (rv = readByte(that, 1));  // int 8
                msb = 4 << ((type & 0x3) + 1); // 8, 16, 32, 64
                return rv < _sign[msb] ? rv : rv - _sign[msb] * 2;
    case 0xdb:  size = readByte(that, 4);           // raw 32
    case 0xda:  size || (size = readByte(that, 2)); // raw 16
    case 0xa0:  for (rv = []; i < size; ++i) {      // raw
                    rv[i] = that.byte ? data[++that.index]
                                      : data[_charCodeAt](++that.index);
                }
                return that.utf8 ? namespace.utf8.decode(rv)
                                 : String.fromCharCode.apply(null, rv);
    case 0xdf:  size = readByte(that, 4);           // map 32
    case 0xde:  size || (size = readByte(that, 2)); // map 16
    case 0x80:  for (rv = {}; i < size; ++i) {      // map
                    key = that.decode();
                    rv[key] = that.decode(); // key/value pair
                }
                return rv;
    case 0xdd:  size = readByte(that, 4);           // array 32
    case 0xdc:  size || (size = readByte(that, 2)); // array 16
    case 0x90:  for (rv = []; i < size; ++i) {      // array
                    rv.push(that.decode());
                }
                return rv;
    }
    return;
}

function readByte(that,   // @param Object:
                  size) { // @param Number:
                          // @return Number:
    var rv = 0, data = that.data, i = that.index, byte = that.byte;

    switch (size) {
    case 8: rv += (byte ? data[++i] : data[_charCodeAt](++i)) * 0x100000000000000; // << 56
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *   0x1000000000000; // << 48
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *     0x10000000000; // << 40
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *       0x100000000; // << 32
    case 4: rv += (byte ? data[++i] : data[_charCodeAt](++i)) *         0x1000000; // << 24 (keep msb)
            rv += (byte ? data[++i] : data[_charCodeAt](++i)) *           0x10000; // << 16
    case 2: rv += (byte ? data[++i] : data[_charCodeAt](++i)) *             0x100; // << 8
    case 1: rv += (byte ? data[++i] : data[_charCodeAt](++i));

    }
    that.index = i;
    return rv;
}

})(this.uu || this);
