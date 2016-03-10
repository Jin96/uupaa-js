# EventObjectEx #

EventObjectEx は、クロスブラウザ用のプロパティを拡張した EventObject です。

uu.event() で登録した evaluator のコールバック第一引数が EventObjectEx になります。

```
EventObjectEx = {
    at            - Node:   as event.target or event.srcElement or document
    node          - Node:   as uu.event(_node_)
    code          - Number: as event.type
    mouse         - Number: as event.button
    pageX         - Number: as event.pageX (IE6, IE7, IE8 only)
    pageY         - Number: as event.pageY (IE6, IE7, IE8 only)
    wheel         - Number: as event.detail (Gecko, IE) or event.wheelDelta (WebKit)
    currentTarget - Node:   as event.currentTarget (IE6, IE7, IE8 only)
    relatedTarget - Node:   as event.relatedTarget (IE6, IE7, IE8 only)
}
```
## クロスブラウザ化された以下の情報が EventObjectEx に追加されます ##
  * EventObjectEx.at は、Actually event Target の略です。クロスブラウザ化された event.target 相当の情報を保持します。
  * EventObjectEx.node は uu.event(_node_) です。
  * EventObjectEx.code は、ブラウザ毎に異なるイベントタイプ(event.type)を正規化した数値を保持します。
  * EventObjectEx.mouse は、event.button を正規化した数値を保持します。
    * mouse = 0 で クリック。mouse = 1 でミドルクリック。 mouse = 2 で右クリックです。
    * mouse は mousedown, mouseup, contextmenu イベントで利用できます。
  * EventObjectEx.wheel は、マウスホイールの回転数を保持します。0 で無回転です。
    * 値は通常 +2 から -2 の範囲に収まりますが、OSやブラウザの設定を変更している場合はその限りではありません。

## IE6～IE8 限定で以下の情報が EventObjectEx に追加されます ##
  * EventObjectEx.currentTarget は、uu.event(node) の node を保持します。
    * これは DOM Events Lv2 の event.currentTarget に相当します。
  * EventObjectEx.relatedTarget は、event.relatedTarget 相当の情報を保持します。
    * このプロパティは mouseover または mouseout イベントで利用できます。
  * EventObjectEx.pageX は、event.pageX 相当の情報を保持します。
    * pageX, pageY はブラウザの原点(左上)からの絶対座標です。スクロールオフセットを含みます。
  * EventObjectEx.pageY は、event.pageY 相当の情報を保持します。
## EventObjectEx.code value ##
```
uu.event.codes = {
    // --- DOM Lv2 and Lv3 Events ---
    mousedown:   1,
    mouseup:     2,
    mousemove:   3,
    mousewheel:  4,
    click:       5,
    dblclick:    6,
    keydown:     7,
    keypress:    8,
    keyup:       9,
    mouseenter:  10,
    mouseleave:  11,
    mouseover:   12,
    mouseout:    13,
    contextmenu: 14,
    focus:       15,
    blur:        16,
    resize:      17,
    scroll:      18,
    change:      19,
    submit:      20,
    // --- iPhone Events ---
    touchstart:  32,
    touchend:    33,
    touchmove:   34,
    touchcancel: 35,
    gesturestart: 36,
    gesturechange: 37,
    gestureend:      38,
    orientationchange: 39,
    // --- HTML5 Events ---
    online:      50,
    offline:     51,
    message:     52
    losecapture:    2,
    DOMMouseScroll: 4
}
```

## ヘルパー関数 ##
キーコードや、PaddingEdgeを取得するヘルパー関数も存在します。

  * [uu.event.key](uu_event_key.md)(event) → { key, code }
  * [uu.event.edge](uu_event_edge.md)(event) → { x, y }

## 例 ##

関数をイベントハンドラとして登録する。
```
    var div = uu.node.add();
    var evaluator = function(eventObjectEx) {
        alert(eventObjectEx.code); // 5 = uu.event.codes.click
    };

    uu.event(div, "click", evaluator);

              または

    uu.click(div, evaluator);
```

クラスインスタンスをイベントハンドラとして登録する。
```
    uu.Class("Drag", {
        handleEvent: function(eventObjectEx) {
            alert(eventObjectEx.code); // 5 = uu.event.codes.click
        }
    });

    var div = uu.node.add();

    uu.event(div, "click", uu("Drag"));

              または

    uu.click(div, uu("Drag"));
```