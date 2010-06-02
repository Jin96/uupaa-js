
// === uu.ui.slider ===
//#include uupaa.js
//#include Node/uu.node.normalize.js
//#include Image/uu.image.js
//#include Color/uu.color.js
/*
    1| uu.ui.slider.dressup(<div>, { degree: 90 })  -> dress up


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


    2| uu.ui.slider(<div>, 3000)   -> do animation
 */

uu.ui.slider || (function(uu) {

uu.ui.slider = uuuislider;
uu.ui.slider.dressup = uuuisliderdressup;

// uu.ui.slider - slider
function uuuislider(node,     // @param Node:
                    duration, // @param Number: duration
                    param) {  // @param Hash(= {}):
                              // @return Node:
    var data = node["data-uuuislider"], x = null, y = null;

    if (data) {
        if (!uu.fx.isBusy(data.target)) {
            if (++data.moved >= data.images) {
                data.moved = 0;
                x = y = 0;
            } else {
                data.degree < 90 && (x = -(data.w * data.moved));
                data.degree >  0 && (y = -(data.h * data.moved));
            }
            uu.fx(data.target, duration,
                  uu.arg(data.param, { marginLeft: x, marginTop: y }));
        }
    }
    return node;
}

// uu.ui.slider.dressup
function uuuisliderdressup(node,    // @param Node:
                           param) { // @param Hash(= { degree: 0 }):
                                    //  degree - Number: move direction. 0 or 45 or 90
    uu.ready("window", function(uu) {
        var data = node["data-uuuislider"],
            pr = uu.arg(param, { degree: 0 }), degree = pr.degree,
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
        node["data-uuuislider"] = data;
    });
}

})(uu);
