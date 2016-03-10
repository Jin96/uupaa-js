

# 導入 #

uu.ui.imageSlider を利用するには以下のファイルが必要です。
  * src/ui/imageSlider.js
  * src/node/normalize.js
  * src/image/image.js

src/ui/imageSlider.js をロードすると、以下の関数が追加されます。
  * uu.ui.imageSlider
  * uu.ui.imageSlider.dressup

# API #

## uu.ui.imageSlider.dressup ##
uu.ui.imageSlider.dressup(_node_:Node, _param_:Hash/Function = { degree: 0 }) は、
uu.ui.imageSliderを呼ぶ前に、一度だけ実行する必要がある初期化関数です。

uu.ui.imageSlider.dressup を呼ぶと、画像を含むHTMLフラグメントをドレスアップし、スライダーに仕立てます。
_degree_ には 0, 45 または 90 を指定できます。0 なら横方向に、45 なら斜めに、90 なら縦方向にスライドします。

### ドレスアップ用のHTML ###
このようなHTMLフラグメントを用意し、uu.ui.imageSlider.dressup() を呼ぶとドレスアップが行われます。
```
        <div style="visibility:hidden">
            <div>
                <img src="...">
                <img src="...">
                    :
            </div>
        </div>
```
ドレスアップ後はこのような形になります。
```
        <div style="visibility:visible;width:??px;height:??px;overflow:hidden">
            <div style="width:??px;height:??px;margin:0;position:relative">
                <img src="..." style="position:absolute;top:?px;left:?px" />
                <img src="..." style="position:absolute;top:?px;left:?px" />
                    :
            </div>
        </div>
```
  * スライダーの大きさは、先頭画像の大きさで決まります。
    * 画像サイズをあらかじめ統一しておいてください。

## uu.ui.imageSlider ##

uu.ui.imageSlider(_node_:Node, _duration_:Number, _param_:Hash/Function = { _allow_: 1 }):Node は、
スライドアニメーションを実行します。

_allow_ に 1 を指定すると、アニメーション中にアニメーションキューを積むことができるようになり、クリックイベントなどの先行入力が可能になります。

# Test Code #
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/ui/imageSlider.htm