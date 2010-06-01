
// === uu.fx.slide ===
//{{{!depend uu, uu.node.normalize, uu.image.size
//}}}!depend
/*
    1| uu.fx.slide(<div>, 0, { degree: 90 })  -> dress up


        <div style="visibility:hidden">   --- plain --+
            <div>                                     |
                <img src="...">                       |
                <img src="...">                       |
            </div>                                    |
        </div>      ----------------------------------+

                  |
                  V

        <div style="visibility:visible;             --------------- dress up --+
                    width:??px;height:??px;overflow:hidden">                   |
            <div style="width:??px;height:??px;                                |
                        margin:0;position:relative">                           |
                <img src="..." style="position:absolute;top:?px;left:?px" />   |
                <img src="..." style="position:absolute;top:?px;left:?px" />   |
            </div>                                                             |
        </div>      -----------------------------------------------------------+


    2| uu.fx.slide(<div>, 3000)   -> do animation
 */

uu.fx.slide || (function(uu) {

uu.fx.slide = uufxslide;
uu.nodeSet.slide = function(node, duration, param) {
    return uu.nodeSet(0, this, uufxslide, node, duration, param);
}

// uu.fx.slide - slide
function uufxslide(node,     // @param Node:
                   duration, // @param Number: duration
                   param) {  // @param Hash(= { degree: 0 }):
                             //  degree - Number: move direction. 0 or 45 or 90
    uu.ready("window", function(uu) {
        param = param || {};

        var data = node["data-uufxslide"], deg, x = "", y = "";

        data || (data = initSlide(node, param.degree || 0));

        deg = data.degree;

        if (!uu.fx.isBusy(data.target)) {
            if (++data.moved >= data.images) {
                data.moved = 0;
                x = y = 0;
            } else {
                x = y = "";
                deg < 90 && (x = -(data.w * data.moved));
                deg >  0 && (y = -(data.h * data.moved));
            }
            uu.fx(data.target, duration,
                  uu.arg(data.param, { marginLeft: x, marginTop: y }));
        }
    });
    return node;
}

// inner -
function initSlide(node,     // @param Node:
                   degree) { // @param Number: move direction. 0 or 45 or 90
                             // @return Hash: node data
    var data = node["data-uufxslide"],
        imageNodeArray, target, x = "", y = "", w, h;

    if (data) {
        return;
    }
    // trim spam node
    uu.node.normalize(node, 3);

    // first ElementNode
    target = node.firstChild;

    // enum <img>
    imageNodeArray = uu.tag("img", target);

    // get first <img> dimension(w, h)
    data = uu.image.size(imageNodeArray[0]);
    data.moved = -1;
    data.images = imageNodeArray.length;
    data.target = target;
    data.degree = degree;

    // set position
    imageNodeArray.forEach(function(node, i) {
        var x = 0, y = 0;

        degree < 90 && (x = data.w * i);
        degree > 0  && (y = data.h * i);
        uu.css(node, { pos: "absolute", m: 0, b: 0, p: 0, x: x, y: y });
    });

    node.style.width = data.w + "px";
    node.style.height = data.h + "px";
    node.style.visibility = "visible";
    node.style.overflow = "hidden";

    w = data.w;
    h = data.h;

    degree < 90 && (w = data.w * imageNodeArray.length);
    degree >  0 && (h = data.h * imageNodeArray.length);

    target.style.cssText =
            uu.format("width:??px;height:??px;margin:0;position:relative", w, h);

    // store
    return node["data-uufxslide"] = data;
}

})(uu);
