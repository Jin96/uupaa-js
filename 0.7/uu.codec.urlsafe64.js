
// === URLSafe64 ===
// depend: uu, uu.codec, uu.codec.utf8, uu.codec.base64
uu.agein || (function(uu) {

uu.codec.urlsafe64 = {
    encode: urlsafe64encode,    // uu.code.urlsafe64encode
    decode: urlsafe64decode     // uu.code.urlsafe64decode
};

// uu.code.urlsafe64encode
function urlsafe64encode(str) { // @param String:
                                // @return URLSafe64String:
    return uu.codec.base64.encode(uu.codec.utf8.encode(str), 1);
}

// uu.code.urlsafe64decode
function urlsafe64decode(str) { // @param URLSafe64String:
                                // @return String:
    return uu.codec.utf8.decode(uu.codec.base64.decode(str));
}

})(uu);

