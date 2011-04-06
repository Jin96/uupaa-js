// IE compat

// --- for Gecko ---
// HTMLElement#innerText
// HTMLElement#outerHTML

//{@node
//{@ti
//{@mb
this.HTMLElement && this.netscape && (function(global) { // @param GlobalObject:

var document = global.document,
    prototype = global.HTMLElement.prototype;

// --- HTMLElement.prototype ---
// HTMLElement.prototype.innerText getter
function innerTextGetter() {
    return this.textContent;
}

// HTMLElement.prototype.innerText setter
function innerTextSetter(text) {
    while (this.hasChildNodes()) {
        this.removeChild(this.lastChild);
    }
    this.appendChild(document.createTextNode(text));
}

// HTMLElement.prototype.outerHTML getter
function outerHTMLGetter() {
    var rv,
        parentNode = this.parentNode,
        range = document.createRange(),
        div = document.createElement("div");

    if (!parentNode) { // orphan
        document.body.appendChild(this);
    }
    range.selectNode(this);
    div.appendChild(range.cloneContents());
    rv = div.innerHTML;
    if (!parentNode) {
        this.parentNode.removeChild(this);
    }
    return rv;
}

// HTMLElement.prototype.outerHTML setter
function outerHTMLSetter(html) {
    var range = document.createRange();

    range.setStartBefore(this);
    this.parentNode.replaceChild(
            range.createContextualFragment(html), this);
}

// --- export ---
if (!prototype.innerText) {
    prototype.__defineGetter__("innerText", innerTextGetter);
    prototype.__defineSetter__("innerText", innerTextSetter);
}
if (!prototype.outerHTML) {
    prototype.__defineGetter__("outerHTML", outerHTMLGetter);
    prototype.__defineSetter__("outerHTML", outerHTMLSetter);
}

})(this);

//}@mb
//}@ti
//}@node

