// === Feature List ========================================
uu.featureList = {
  // feat:        "depend, ..."
  ajax:           "boost",
  jsonp:          "url",
  customEvent:    "boost,event,ua",
  dev:            "boost,aid,feat,ready,node,stylesheet,types,hash",
  dev_viewer:     "dev,style,event,event_drag,firebuglite,msg",
  style:          "viewport",
  drawpixel:      "canvas,node",
  draw:           "canvas",
  glossy:         "draw",
  event_drag:     "event,zindex,ieboost_shim",
  selector_plus:  "selector,stylesheet,color",
  datascheme:     "codec_datauri,codec_gif,drawpixel,selector,style",
  adapter:        "boost,hash,ready,event,node,className,form",
  ieboost_shim:   "style",
  codec_ucs2:     "codec_base64,codec_utf8",
  codec_json:     "types,evaluate",
  codec_gif:      "codec_lzw",
  codec_datauri:  "codec_base64,codec_hex",
  cookie:         "boost"
};
if (UU.IE) {
  uu.featureList["canvas"] = "ua,hash,style,matrix2d,color";
  uu.featureList["ieboost"] = "boost,ua,stylesheet,style,className,viewport,node,event,customEvent";
} else {
  uu.featureList["canvas"] = "ua";
  uu.feat.canvas = {};
  uu.feat.ieboost = {};
}
