
// === uu.event.key ===
//{{{!depend uu
//}}}!depend

uu.event.key || (function(win, uu) {

uu.event.key = uueventkey; // uu.event.key(event:EventObjectEx):Hash { key, code }

// uu.event.key - get key and keyCode (cross browse keyCode)
function uueventkey(event) { // @param EventObjectEx:
                             // @return Hash: { key, code }
                             //     key  - String: "UP", "1", "A"
                             //     code - Number:   38,  49,  65
    var code = event.keyCode || event.charCode || 0;

//{{{!mb
    if (!code && win.event) { // [IE9]
        code = win.event.keyCode || 0;
    }
//}}}!mb
    return { key: uueventkey.ident[code] || "", code: code };
}

// ::event.keyCode
//    http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents

uueventkey.ident = uusplittohash( // virtual keycode -> "KEY IDENTIFIER"
    "8,BS,9,TAB,13,ENTER,16,SHIFT,17,CTRL,18,ALT,27,ESC," +
    "32,SP,33,PGUP,34,PGDN,35,END,36,HOME,37,LEFT,38,UP,39,RIGHT,40,DOWN," +
    "45,INS,46,DEL,48,0,49,1,50,2,51,3,52,4,53,5,54,6,55,7,56,8,57,9," +
    "65,A,66,B,67,C,68,D,69,E,70,F,71,G,72,H,73,I,74,J,75,K,76,L,77,M," +
    "78,N,79,O,80,P,81,Q,82,R,83,S,84,T,85,U,86,V,87,W,88,X,89,Y,90,Z");

})(this, uu);

