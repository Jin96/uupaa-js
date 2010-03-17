// === conditional selector ===
// depend: uu
// http://d.hatena.ne.jp/uupaa/20100101

(function(uu, html) {
    if (!uu || !uu.ver || !/ifnojs/.test(html.className)) {
        return;
    }

    var className = html.className,
        ary = [className.replace(/ifnojs|ifnoua|ifnoos/g, ""), "ifjs"],
        hint = "advanced,major",
        i = 0, keyword;

    // <html class="ifnoua">
    if (!/ifnoua/.test(className)) {
        hint += ",ie,ie6,ie7,ie8,ie67,ie678,opera,gecko,webkit,iphone";
    }

    // <html class="ifnoos">
    if (!/ifnoos/.test(className)) {
        hint += ",win,mac,unix";
    }

    hint = hint.split(",");
    while ( (keyword = hint[i++]) ) {
        ary.push((uu[keyword] ? "if" : "ifno") + keyword);
    }

    // <html class="..."> modify
    html.className = ary.join(" ").replace(/^\s+/, "");

})(uu, document.getElementsByTagName("html")[0]);

