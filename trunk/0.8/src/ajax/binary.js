
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
            var ok = xhr.status >= 200 && xhr.status < 300;

            callback({ ok: ok, xhr: xhr, data: ok ? toBinary(xhr) : [] });
        }
    }

    var xhr = uu.ajax.create();

    xhr.onreadystatechange = readyStateChange;

    if (!uu.ie) {
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        } else {
            xhr.setRequestHeader("Accept-Charset", "x-user-defined");
        }
    }
    xhr.open("GET", url, true); // ASync
    xhr.send(null);
}

// inner - to binary
function toBinary(xhr) { // @param XMLHttpRequest:
                         // @return ByteArray:
    var rv = [], data,
//{{{!mb
        loop, remain, v0, v1, v2, v3, v4, v5, v6, v7,
//}}}!mb
        i = 0, iz;

//{{{!mb
    if (!uu.ie) {
//}}}!mb
        data = xhr.responseText;
        iz = data.length;
        for (; i < iz; ++i) {
            rv[i] = data.charCodeAt(i) & 0xff;
        }
//{{{!mb
    } else {
        data = vbstr(xhr.responseBody);
        iz = vblen(xhr.responseBody);

        loop = Math.ceil(iz / 2);
        remain = loop % 8;
        i = -1;

        while (remain--) {
            v = data.charCodeAt(++i); // 0x00,0x01 -> 0x0100
            rv.push(v & 255, v >> 8);
        }
        remain = loop >> 3;
        while (remain--) {
            v0 = data.charCodeAt(++i);
            v1 = data.charCodeAt(++i);
            v2 = data.charCodeAt(++i);
            v3 = data.charCodeAt(++i);
            v4 = data.charCodeAt(++i);
            v5 = data.charCodeAt(++i);
            v6 = data.charCodeAt(++i);
            v7 = data.charCodeAt(++i);
            rv.push(v0 & 255, v0 >> 8, v1 & 255, v1 >> 8,
                    v2 & 255, v2 >> 8, v3 & 255, v3 >> 8,
                    v4 & 255, v4 >> 8, v5 & 255, v5 >> 8,
                    v6 & 255, v6 >> 8, v7 & 255, v7 >> 8);
        }
    }
//}}}!mb
    return rv;
}

// --- init ---
//{{{!mb
uu.ie && document.write('<script type="text/vbscript">\
Function vblen(b)vblen=LenB(b)End Function\n\
Function vbstr(b)vbstr=CStr(b)+chr(0)End Function</'+'script>');
//}}}!mb

})(uu);

