

function style() {
    return <>
<style>
.uiHSliderLongRail {
    background: url({{uu.config.img}}slider.png) no-repeat -15px 0;
    position: relative;
    width: 214px;
    height: 20px;
}
.uiHSliderShortRail {
    background: url({{uu.config.img}}slider.png) no-repeat -15px -20px;
    position: relative;
    width: 114px;
    height: 20px;
}
.uiHSliderGrip {
    background: url({{uu.config.img}}slider.png) no-repeat 0 0;
    position: absolute;
    width: 13px;
    height: 18px;
}

.uiVSliderLongRail {
    background: url({{uu.config.img}}slider.png) no-repeat -230px -15px;
    position: relative;
    width: 20px;
    height: 214px;
}
.uiVSliderShortRail {
    background: url({{uu.config.img}}slider.png) no-repeat -250px -15px;
    position: relative;
    width: 20px;
    height: 114px;
}
.uiVSliderGrip {
    background: url({{uu.config.img}}slider.png) no-repeat -250px 0;
    position: absolute;
    width: 18px;
    height: 13px;
}
</style>
</>
}

function widget(placeholder, // @param Node(= null):
                param) {     // @param Hash(= {}):
    param = uu.arg(param, {
        min: 0,
        max: 100,
        value: 0,
        short: 0,
        change: null,
        mouseup: null,
        mousedown: null
    });
    param.gripWidth  = param.vertical ? 18 : 13;
    param.gripHeight = param.vertical ? 13 : 18;

    var rv = <>
<div class="rail" role="slider" tabindex="0"
    aria-live="polite" aria-valuemin="0" aria-valuemax="0"
    aria-valuenow="0"><div class="grip" /></div>
</>

    if (placeholder) {
        rv = uu.node.swap(rv, placeholder);
    } else {
        rv = uu.add(rv);
    }
    rv.className = param.vertical ? (param.short ? "uiVSliderShortRail"
                                                 : "uiVSliderLongRail")
                                  : (param.short ? "uiHSliderShortRail"
                                                 : "uiHSliderLongRail");
    rv.firstChild.className = param.vertical ? "uiVSliderGrip"
                                             : "uiHSliderGrip";
    return uu("Slider", rv, rv.firstChild, param);
}

return { style: style, widget: widget };
