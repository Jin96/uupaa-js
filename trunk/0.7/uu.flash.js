
// === Flash / ActionScript bridge ===
// depend: uu.js
uu.agein || (function(win, doc, uu) {

uu.mix(uu, {
    flash: uu.mix(uuflash, {        // uu.flash(id, url, width, height, option) -> new <object> element
        dmz:        {},             // uu.flash.dmz - bridge
        send:       uuflashsend,    // uu.flash.send(guid, msg, param) -> Mix
        post:       uuflashpost,    // uu.flash.post(guid, msg, param)
        alert:      uuflashalert    // uu.flash.alert("msg", debug = 0)
    })
});

// uu.flash - create flash <object> node
function uuflash(replaceNode, // @param Node: replacement node
                 objectID,    // @param String: <object id="...">, eg: "externalswf"
                 url,         // @param URLString:
                 width,       // @param Number:
                 height,      // @param Number:
                 option) {    // @param Hash(= { loop: "false"
                              //                 menu: "false",
                              //                 play: "true",
                              //                 scale: "noScale",
                              //                 wmode: "transparent",
                              //                 allowFullscreen: "false",
                              //                 allowScriptAccess: "always" or "sameDomain" });
                              // @return Node: new <object> element
    var fg, ary = [], node, i,
        opt = uu.arg(option, {
                    src:  url,
                    loop: "false",
                    menu: "false",
                    play: "true",
                    movie: url,
                    scale: "noScale",
                    wmode: "transparent",
                    allowFullscreen: "false",
                    allowScriptAccess:
                            /https?/.test(location.protocol) ? "sameDomain"
                                                             : "always" });

    for (i in opt) {
        ary.push(uu.fmt('<param name="%s" value="%s" />', i, opt[i]));
    }
    fg = uu.fmt('<object class="uuflashobject"' +
                ' id="%s" %s="%s" data="%s" width="%d" height="%d">%s</object>',
                      objectID,
                          uu.ie ? "classid" : "type",
                              uu.ie ? "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
                                    : "application/x-shockwave-flash",
                                        url,       width,      height,
                                                                   ary.join(""));
    node = uu.node.bulk(fg);
    uu.node.swap(node, replaceNode);
    return uu.id(objectID);
}

// uu.flash.post - post message from Flash
function uuflashpost(guid,    // @param Number: instance guid
                     msg,     // @param String: message
                     param) { // @param Mix: param
    uu.msg.post(guid, msg, param);
}

// uu.flash.send - send message from Flash
function uuflashsend(guid,    // @param Number: instance guid
                     msg,     // @param String: message
                     param) { // @param Mix: param
                              // @return Mix:
    return uu.msg.send(guid, msg, param);
}

// uu.flash.alert - alert from Flash
function uuflashalert(msg,     // @param Mix: message
                      debug) { // @param Boolean: debug mode only
    if (debug) {
        _cfg.debug && uu.puff(msg);
    } else {
        uu.puff(msg);
    }
}

})(window, document, uu);

