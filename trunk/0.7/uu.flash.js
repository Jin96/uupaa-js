
// === Flash / ActionScript bridge ===
// depend: uu.js
uu.waste || (function(win, doc, uu) {

uu.mix(uu, {
  flash:        uuflash,        // uu.flash(id, url, width, height, option) -> new <object> element
  as: {
    dmz:        {},             // uu.as.dmz - bridge
    send:       uuassend,       // uu.as.send(guid, msg, param) -> Mix
    post:       uuaspost,       // uu.as.post(guid, msg, param)
    alert:      uuasalert       // uu.as.aleat("msg", debug = 0)
  }
});

// uu.flash - create flash <object> node
function uuflash(replaceNode, // @param String
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
              allowScriptAccess: /https?/.test(location.protocol) ? "sameDomain"
                                                                  : "always"
          });

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

// uu.as.post - post message from ActionScript
function uuaspost(guid,    // @param Number: instance guid
                  msg,     // @param String: message
                  param) { // @param Mix: param
  uu.msg.post(guid, msg, param);
}

// uu.as.send - send message from ActionScript
function uuassend(guid,    // @param Number: instance guid
                  msg,     // @param String: message
                  param) { // @param Mix: param
                           // @return Mix:
  return uu.msg.send(guid, msg, param);
}

// uu.as.alert - alert from ActionScript
function uuasalert(msg,     // @param Mix: message
                   debug) { // @param Boolean: debug mode only
  if (debug) {
    _cfg.debug && uu.puff(msg);
  } else {
    uu.puff(msg);
  }
}

})(window, document, uu);

