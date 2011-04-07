// Browser Compatibility

//{@worker
//{@node
//{@ti
//{@mb
if (!(this.uu || this).env) {
    throw new Error("Compile Error: Need env.js");
}
if (!(this.uu || this).env.browser) {
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

})(this, this.uu || this, this.document);

//}@mb
//}@ti
//}@node
//}@worker

