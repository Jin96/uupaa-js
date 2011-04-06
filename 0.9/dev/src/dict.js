// Dictionary

(function(global, // @param GlobalObject:
          lib) {  // @param LibraryRootObject:

var _dd2n   = {},   // {  "00":    0 , ...  "99":   99  }
    _n2dd   = {},   // {    0 :  "00", ...   99 :  "99" }
    _bin2n  = {},   // { "\00":    0 , ... "\ff":  255  }
    _n2bin  = {},   // {    0 : "\00", ...  255 : "\ff" }
    _hh2n   = {},   // {  "00":    0 , ...  "ff":  255  }
    _n2hh   = {},   // {    0 :  "00", ...  255 :  "ff" }
    _n2n    = {},   // {    0 :    0 , ...  255 :  255  }
    _bit2n  = {};   // { "00000000": 0, ... "11111111": 255 }

// --- create Number <=> String dictionary ---
var i = 0x100, n, v;

// 0x00 ~ 0xff
for (; i < 0x200; ++i) {
    n = i - 0x100;
    v = i.toString(16).slice(1);
    _n2hh[n] = v;
    _hh2n[v] = n;

    v = String.fromCharCode(n);
    _n2bin[n] = v;
    _bin2n[v] = n;
    _n2n[n] = n;
    _bit2n[("0000000" + n.toString(2)).slice(-8)] = n;
}

// 0 ~ 99
for (i = 100; i < 200; ++i) {
    n = i - 100;
    v = i.toString().slice(1);
    _n2dd[n] = v;
    _dd2n[v] = n;
}

// --- export ---
(lib.dict || (lib.dict = {}));

// Number <=> String Dictionary
lib.dict.dd2n  = _dd2n;  // {  "00":    0 , ...  "99":   99  }
lib.dict.n2dd  = _n2dd;  // {    0 :  "00", ...   99 :  "99" }
lib.dict.bin2n = _bin2n; // { "\00":    0 , ... "\ff":  255  }
lib.dict.n2bin = _n2bin; // {    0 : "\00", ...  255 : "\ff" }
lib.dict.hh2n  = _hh2n;  // {  "00":    0 , ...  "ff":  255  }
lib.dict.n2hh  = _n2hh;  // {    0 :  "00", ...  255 :  "ff" }
lib.dict.n2n   = _n2n;   // {    0 :    0 , ...  255 :  255  }
lib.dict.bit2n = _bit2n; // { "00000000": 0, ... "11111111": 255 }

})(this, this.uu || this);
