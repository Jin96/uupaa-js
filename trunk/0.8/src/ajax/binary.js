
// === uu.ajax.binary ===
//#include uupaa.js
//#include ajax/ajax.js

uu.ajax.binary || (function(uu) {

uu.ajax.binary = uuajaxbinary; // uu.ajax.binary(url:String, callback:Function, option:Hash = {})

// uu.ajax.binary
function uuajaxbinary(url,      // @param String:
                      callback, // @param Function: callback function
                      option) { // @param Hash(= {}):
    function readyStateChange() {
        if (xhr.readyState === 4) {
            var status = xhr.status,
                rv = { ok: status >= 200 && status < 300,
                       status: status, option: option, data: [] };

            if (rv.ok) {
                rv.data = uu.ie ? toByteArrayIE(xhr)
                                : toByteArray(xhr.responseText);
            }
            callback(rv);
            xhr = null;
        }
    }

    var xhr = uu.ajax.create();

    xhr.onreadystatechange = readyStateChange;

    xhr.open("GET", url, true); // ASync

    if (!uu.ie) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        } else {
            xhr.setRequestHeader("Accept-Charset", "x-user-defined");
        }
    }
    xhr.send(null);
}


// inner - to toByteArray
function toByteArray(data) { // @param String:
                             // @return ByteArray:
    var rv = [], remain,
        charCodeAt = "charCodeAt", _0xff = 0xff,
        i = -1, iz;

    iz = data.length;
    remain = iz % 8;

    while (remain--) {
        ++i;
        rv[i] = data[charCodeAt](i) & _0xff;
    }
    remain = iz >> 3;
    while (remain--) {
        rv.push(data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff,
                data[charCodeAt](++i) & _0xff);
    }
    return rv;
}

//{{{!mb
// inner - to toByteArray
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
//}}}!mb

// --- init ---
//{{{!mb
_ie && document.write('<script type="text/vbscript">\
Function vblen(b)vblen=LenB(b.responseBody)End Function\n\
Function vbstr(b)vbstr=CStr(b.responseBody)+chr(0)End Function</'+'script>');
//}}}!mb

})(uu);

