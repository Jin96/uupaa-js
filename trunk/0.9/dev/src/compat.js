// Browser Compatibility

//{@worker
//{@node
//{@ti
//{@mb

if (!(this.lib || this).env) {
    throw new Error("Compile Error: Need env.js");
}
if (!(this.lib || this).env.browser) {
    throw new Error("Compile Error: Excluding compat.js");
}

(function(global,     // @param GlobalObject:
          lib,        // @param LibraryRootObject:
          document) { // @param Document/BlankObject: document or {}

// HTML5 document.head
// http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html
if (!document.head) {
    document.head = document.getElementsByTagName("head")[0];
}

if (!global.Node) { // [IE6][IE7][IE8]
    global.Node = {
        ELEMENT_NODE:            1,
        TEXT_NODE:               3,
        CDATA_SECTION_NODE:      4,
        COMMENT_NODE:            8,
        DOCUMENT_NODE:           9,
        DOCUMENT_FRAGMENT_NODE: 11
    };
}

})(this, this.lib || this, this.document);

//}@mb
//}@ti
//}@node
//}@worker

