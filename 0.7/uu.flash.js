
// === Flash / ActionScript bridge ===
//{{{!depend uu
//}}}!depend

uu.flash || (function(win, doc, uu) {

uu.mix(uu, {
    flash: uu.mix(uuflash, {        // uu.flash(id, url, width, height, option) -> new <object> element
        send:       uuflashsend,    // uu.flash.send(guid, msg, param) -> Mix
        post:       uuflashpost,    // uu.flash.post(guid, msg, param)
        alert:      uuflashalert    // uu.flash.alert("msg", debug = 0)
    })
});

/*
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
        ary.push(uu.format('<param name="?" value="?" />', i, opt[i]));
    }
    fg = uu.format('<object class="uuflashobject"' +
                ' id="?" ?="?" data="?" width="?" height="?">?</object>',
                      objectID,
                         uu.ie ? "classid" : "type",
                            uu.ie ? "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
                                  : "application/x-shockwave-flash",
                                     url,      width,     height,
                                                             ary.join(""));
    node = uu.node.bulk(fg);
    uu.node.swap(node, replaceNode);
    return uu.id(objectID);
}
 */




// uu.flash - create flash <object> node
function uuflash(url,         // @param String: url
                 option) {    // @param FlashOptionHash(= {}):
                              // @return Node: new <object> element
    option = uu.arg(option, {
        id:         "external" + uu.guid(),
        width:      "100%",
        height:     "100%",
        nocache:    false,
        marker:     null,
        param:      []
    });

    // option.nocache -> "http://example.com/" + "?uuguid={{time}}"
    if (option.nocache) {
        url += (url.indexOf("?") < 0 ? "?" :
                url.indexOf("&") < 0 ? ";" : "&") + "uuguid=" + +(new Date);
    }

    // add default <param name="allowScriptAccess" value="always" />
    if (option.param.indexOf("allowScriptAccess") <= 0) {
        option.param.push("allowScriptAccess", "always");
    }

    // add <param name="movie" value="{{url}}" />
    uu.ie && option.param.push("movie", url);

    if (!option.marker) {
        option.marker = uu.node.add(); // <body>...<div/></body>
    }

    var paramArray = [], objectNode, i = 0, iz = option.param.length;

    for (; i < iz; i += 2) {
        paramArray.push(uu.format('<param name="?" value="?" />',
                                  option.param[i], option.param[i + 1]));
    }
/*
    objectNode = uu.node.bulk(uu.format(uu.ie ? uuflash._FORMAT_IE
                                              : uuflash._FORMAT,
                                        option.id,
                                        url,
                                        option.width,
                                        option.height,
                                        paramArray.join("")));
 */
    var fmt = uu.format(uu.ie ? uuflash._FORMAT_IE
                                              : uuflash._FORMAT,
                                        option.id,
                                        url,
                                        option.width,
                                        option.height,
                                        paramArray.join(""));
//alert(fmt);

    objectNode = uu.node.bulk(fmt);

    uu.node.swap(objectNode, option.marker);

    return uu.id(option.id); // <object id=...>
}
uuflash._FORMAT_IE = '<object id="?" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" data="?" width="?" height="?">?</object>';
uuflash._FORMAT    = '<object id="?" type="application/x-shockwave-flash" data="?" width="?" height="?">?</object>';











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
        uu.config.debug && uu.puff(msg);
    } else {
        uu.puff(msg);
    }
}

})(window, document, uu);

