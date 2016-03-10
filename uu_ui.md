

# uu.ui #
uu.ui(_uiname_:String = "", _var\_args_ ...):Node/NodeArray は特殊な属性 ui="クラス名" をもつ DOM 要素を検索し、UI コントロールに変換します。変換後の要素を配列で返します。

これは、
```
<input type="range" min="0" max="100" value="50" step="1" ui="Slider" />
```
を見つけると、以下のように変換します
```
<div class="uiSlider**"><div class="uiSlider*Grip" /></div>
<input type="range" value="50" min="0" max="100" style="display:none" ui="*Slider" />
```

## uu.ui("Slider") ##
uu.ui("Slider", _param_ = { caption, vertical, x2, min, max, step, value, change, mouseup, mousedown, gripWidth, gripHeight }) はスライダーコントロールを埋め込みます。

`<input type="range" onchange="hoge()" />` のように DOM Lv0 イベントハンドラは利用しないでください。代わりに、 uu.event でイベントを設定してください。

ToDo: 詳細な説明

# Test Code #
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/ui/slider.htm


