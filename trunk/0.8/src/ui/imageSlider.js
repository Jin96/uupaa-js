
// === uu.ui.imageSlider ===
//#include uupaa.js
//#include css/text.js
/*
    1| uu.ui.imageSlider.dressup(<div>, { degree: 90 })  -> dress up


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


    2| uu.ui.imageSlider(<div>, 3000)   -> do animation
 */

uu.ui.imageSlider || (function(uu) {

uu.ui.imageSlider = uuuiimageslider;
uu.ui.imageSlider.dressup = uuuiimagesliderdressup;

var _dataset = "data-uuuiimageslider";

// uu.ui.imageSlider - slider
function uuuiimageslider(node,     // @param Node:
                         duration, // @param Number: duration
                         option) { // @param Hash(= { allow: 1 }):
                                   // @return Node:
    var data = node[_dataset], x = null, y = null,
        opt = uu.arg(option, { allow: 1 });

    if (data) {
        if (opt.allow || !uu.fx.isBusy(data.target)) {
            if (++data.moved >= data.images) {
                data.moved = x = y = 0;
            } else {
                data.degree < 90 && (x = -(data.w * data.moved));
                data.degree >  0 && (y = -(data.h * data.moved));
            }
            uu.fx(data.target, duration,
                  uu.arg(option, { marginLeft: x, marginTop: y }));
        }
    }
    return node;
}

// uu.ui.imageSlider.dressup
function uuuiimagesliderdressup(node,     // @param Node:
                                option) { // @param Hash(= { degree: 0 }):
                                          //    degree - Number: move direction. 0 or 45 or 90
    uu.ready("window", function(uu) {
        var data = node[_dataset],
            pr = uu.arg(option, { degree: 0 }), degree = pr.degree,
            imageNodeArray, target, w, h;

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
        data.moved = 0;
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
        node[_dataset] = data;
    });
}

})(uu);
