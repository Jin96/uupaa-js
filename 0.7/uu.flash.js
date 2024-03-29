
// === Flash / ActionScript bridge ===
//{{{!depend uu
//}}}!depend

//  <object id="external..." data="*.swf" width="..." height="..."
//      type="application/x-shockwave-flash">
//      <param name="allowScriptAccess" value="always" />
//      <embed name="external..." src="*.swf" width="..." height="..."
//          type="application/x-shockwave-flash" allowScriptAccess="always">
//      </embed>
//  </object>

uu.flash || (function(win, doc, uu) {

uu.mix(uu, {
    flash: uu.mix(uuflash, {        // uu.flash(id, url, width, height, option) -> new <object> element
        send:       uuflashsend,    // uu.flash.send(guid, msg, param) -> Mix
        post:       uuflashpost,    // uu.flash.post(guid, msg, param)
        alert:      uuflashalert    // uu.flash.alert("msg", debug = 0)
    })
});

// uu.flash - create flash <object> node
function uuflash(url,      // @param String: url
                 option) { // @param FlashOptionHash(= { allowScriptAccess: "always" }):
                           // @return Node: new <object> element
    option = uu.arg(option, {
        id:         "external" + uu.guid(),
        width:      "100%",
        height:     "100%",
        marker:     null,
        flashVars:  "",
        param:      []
    });

    // add default <param name="allowScriptAccess" value="always" />
    if (option.param.indexOf("allowScriptAccess") < 0) {
        option.param.push("allowScriptAccess", "always");
    }

    // add <param name="movie" value="{{url}}" />
    option.param.push("movie", url);

    // add <param name="flashVars" value="key=val&..." />
    if (option.flashVars) {
        option.flashVars += "&";
    }
    option.flashVars += "ExternalInterfaceObjectID=" + option.id;
    option.param.push("flashVars", option.flashVars);


    if (!option.marker) {
        option.marker = uu.node.add(); // <body>...<div/></body>
    }

    var paramArray = [], i = 0, iz = option.param.length, object;

    for (; i < iz; i += 2) {
        paramArray.push(uu.format('<param name="?" value="?" />',
                                  option.param[i], option.param[i + 1]));
    }

    object = uu.format(
        '<object id="?" width="?" height="?" data="?" ?>?</object>',
        option.id,
        option.width,
        option.height,
        url,
        uu.ie ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'
              : 'type="application/x-shockwave-flash"',
        paramArray.join(""));

    uu.node.swap(uu.node.bulk(object), option.marker);

    return uu.id(option.id); // <object id=...>
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
        uu.config.debug && uu.puff(msg);
    } else {
        uu.puff(msg);
    }
}

})(window, document, uu);

