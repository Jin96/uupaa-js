
// === Codec ===
//{{{!depend uu
//}}}!depend

uu.codec || (function(uu) {

uu.codec = {};

// HTML Entity
uu.codec.entity = {
    encode: entityencode,   // uu.codec.entity.encode('<a href="&">')
                            //                     -> '&lt;a href=&quot;&amp;&quot;&gt;'
    decode: entitydecode    // uu.codec.entity.decode('&lt;a href=&quot;&amp;&quot;&gt;')
                            //                     -> '<a href="&">'
};

// uu.codec.entity.encode - encode String to HTML Entity
function entityencode(str) { // @param String: '<a href="&">'
                             // @return String '&lt;a href=&quot;&amp;&quot;&gt;'
    return str.replace(entityencode._TO_ENTITY, _entity);
}
entityencode._TO_ENTITY = /[&<>"]/g; // entity keyword

// uu.codec.entity.decode - decode String from HTML Entity
function entitydecode(str) { // @param String: '&lt;a href=&quot;&amp;&quot;&gt;'
                             // @return String: '<a href="&">'
    return str.replace(entitydecode._FROM_ENTITY, _entity);
}
entitydecode._FROM_ENTITY = /&(?:amp|lt|gt|quot);/g;

// inner - to/from entity
function _entity(code) {
    return _entity._HASH[code];
}
_entity._HASH =
    uu.split.toHash('&,&amp;,<,&lt;,>,&gt;,",&quot;,&amp;,&,&lt;,<,&gt;,>,&quot;,"');

})(uu);

