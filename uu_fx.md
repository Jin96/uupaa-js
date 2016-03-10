

uu.fx() と NodeSet.fx() は CSSプロパティを連続的に変化させるCSSアニメーション機能を提供します。

uu.fxを特殊化した以下の関数があります。
  * uu.fx.show        NodeSet.show
  * uu.fx.hide        NodeSet.hide
  * uu.fx.fade        NodeSet.fade
  * uu.fx.puff        NodeSet.puff
  * uu.fx.flare       NodeSet.flare
  * uu.fx.shrink      NodeSet.shrink
  * uu.fx.movein      NodeSet.movein
  * uu.fx.moveout     NodeSet.moveout
  * uu.fx.highlight   NodeSet.highlight

要素の非表示状態を調べる uu.fx.isHide もあります。

以下の easing 関数が利用できます。easing 関数の特性については http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/easeing.htm を参照してください。
  * linear
  * InQuad
  * OutQuad
  * InOutQuad
  * InCubic
  * OutCubic
  * InOutCubic
  * OutInCubic
  * InQuart
  * OutQuart
  * InOutQuart
  * OutInQuart
  * InBack
  * OutBack
  * InOutBack
  * OutInBack
  * InBounce
  * OutBounce

# API #

## uu.fx ##

uu.fx(_node_:Node, _duration_:Number, _option_:Hash/Function):Node は、アニメーションキューを作成し _node_ を返します。

_duration_ には 0 以上の数値を指定します。単位は ms です。
_duration_ で指定した時間が経過するまで、_option_ で指定した幾つかの CSS プロパティを連続的に変化させます。
_duration_ で指定した時間が経過するとアニメーションは終了します。_option_.after が指定されている場合はコールバックします。

_option_ が関数なら、一定間隔でコールバックします。
_option_ に Hash を指定すると、一定間隔で変化させる CSS プロパティと変化の割合を easing 関数により指定できます。

Hash には { key: endValue, ...  } または { key: `[`endValue, easing`]`, ... } のように指定します。
  * key には color, opacity といった CSS プロパティや、後述する予約済みキーワードを指定します。
  * endValue には 文字列または数値を指定します
    * 現在の値を基準とした差分は "+100" "-100" "`*`100" "/100" のように演算子付きの値で指定します。
    * top, left, width, height 等のCSSプロパティは、数値で指定するか "100px"のように指定します。em や pt 等は速度的な理由から指定できません。
      * px 以外の値は [uu.css()](uu_css.md) や [uu.css.unit()](uu_css_unit.md)で px 単位に変換してから指定します。
    * "px" の指定はオプションです。{ width: 100 } と { width: "100px" } は同じ結果になります。
  * _easing_ は uu.fx.easing に登録されている関数名を文字列で指定します。大文字小文字は区別しません。省略も可能です。デフォルトは inoutquad です。

## 予約済みキーワード ##
key には、予約済みのキーワード( before, after, chain, reverse, deny ) も指定できます。

| { after: afterCallback }   | アニメーション終了後に afterCallback(_node_, _option_, _back_) の形でコールバックします(逆再生中は _back_ に true が渡されます) |
|:---------------------------|:---------------------------------------------------------------------------------------------|
| { before: beforeCallback } | アニメーション開始前に beforeCallback(_node_, _option_, _back_) の形でコールバックします                            |
| { chain: 1 }               | 逆再生用のキューを作成します                                                                               |
| { reverse: 1 }             | 逆再生用のキューを作成します。<br />また、アニメーション終了後に逆再生用のキューを通常のキューに割り込ませ逆再生を開始します                            |
| { stop: 1 }                | アニメーションを再生する前に [uu.fx.stop](uu_fx_stop.md) を呼び出し、現在実行中のアニメーションを停止します                         |
| { junction: uu.junction()の戻り値 } | uu.junction() の戻り値を指定することで、アニメーション終了時に、自動的に Junction.join() を呼び出します                          |


key には、短い名前(Alias) も指定できます。

| alias | CSS property |
|:------|:-------------|
| w     | width        |
| h     | height       |
| x     | left         |
| y     | top          |
| l     | left         |
| t     | top          |
| c     | color        |
| bgc   | backgroundColor |
| o     | opacity      |
| fs    | fontSize     |
| m     | margin       |
| b     | border       |
| p     | padding      |
```
uu.fx(node, 200, { x: 10, y: 200, o: 0.5 });
```

### 逆再生 ###

A{ reverse: 1 } は、A → !A の順に再生と逆再生を行ないます(`!`は逆再生を意味します)。
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/reverse.a.htm
```
    // A(width を 300px に変化させ), !A(元に戻す)
    uu(".box").fx(2000, { w: 300, reverse: 1 }); // A
```



A{ chain: 1 }, B{ reverse: 1 } は、A → B → !B → !A の順になります。
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/reverse.ab.htm
```
    // A(width を 300px に)、B(height を 300px に変化させ)、!B(height), !A(width の順に元に戻す)
    uu(".box").fx(2000, { w: 300, chain:   1 }). // A
               fx(2000, { h: 300, reverse: 1 }); // B
```



A{ reverse: 1 }, B{ chain: 1 }, C{ reverse: 1 } は、A → !A → B → C → !C → !B の順になります。
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/reverse.abc.htm
```
    // A(不透明度(opacity)を0.2に変化させ)、!A(元に戻した後に)、
    // B(width を 300px に)、C(height を 300px に変化させ)、!C(height), !B(width の順に元に戻す)
    uu(".box").fx(2000, { o: 0.2, reverse: 1 }). // A
               fx(2000, { w: 300, chain:   1 }). // B
               fx(2000, { h: 300, reverse: 1 }); // C
```



A{}, B{ chain: 1 }, C{}, D{ reverse: 1 } は、A → B → C → D → !D → !B の順になります。A と C は逆再生されません。
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/reverse.abcd.htm
```
    // A(不透明度(opacity)を0.5に変化させ)、
    // B(width を 300px に)、C(height を 300px に変化させ)、
    // D(font-size を 3倍にし)、!D(元に戻し)、!B(width も元に戻す)
    // 最終的に、不透明度は0.5になり、高さは 300 になり、それらは元に戻らない。
    uu(".box").fx(2000, { o: 0.5               }). // A
               fx(2000, { w: 300,   chain:   1 }). // B
               fx(2000, { h: 300,              }). // C
               fx(2000, { fs: "*3", reverse: 1 }); // D
```



A{ chain: 1 }, B{ reverse: 1 }, C{ chain: 1 }, D{ reverse: 1 }, E{ reverse: 1} は、A → B → !B → !A → C → D → !D → !C → E → !E の順になります。
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/reverse.abcde.htm
```
    // A(不透明度(opacity)を0.5に変化させ)、
    // B(width を 300px に変化させ)、!B(widthを元に戻し)、!A(不透明度を元に戻す)。
    // C(height を 300px に変化させ)、
    // D(font-size を 3倍にし)、!D(元に戻した後に)、!C(height を元に戻す)
    // E(背景色を赤にし)、!E(元に戻す)
    uu(".box").fx(2000, { o: 0.5,     chain:   1 }). // A
               fx(2000, { w: 300,     reverse: 1 }). // B
               fx(2000, { h: 300,     chain:   1 }). // C
               fx(2000, { fs: "*3",   reverse: 1 }). // D
               fx(2000, { bgc: "red", reverse: 1 }); // E
```

## uu.fx.show ##
uu.fx.show(_node_:Node, _duration_:Number = 0, _displayValue_:String= "block"):Node は、_node_ を _duration_ 時間かけて表示し、_node_ を返します。

_duration_ には処理時間を ms 単位で指定します。 0 を指定するとすぐに表示し、1000 を指定すると 1秒かけて表示します。

_displayValue_ には style.display が "none" の場合に、display に設定する値を指定します。デフォルトは "block" です。

```
    uu.fx(node, { w: 100, h: 100, o: 0.5 });

    // 1秒かけて要素を表示する
    uu.fx.show(node, 1000);
```

## uu.fx.hide ##
uu.fx.hide(_node_:Node, _duration_:Number = 0):Node は、_node_ を _duration_ 時間かけて隠し、_node_ を返します。

_duration_ には処理時間を ms 単位で指定します。 0 を指定するとすぐに隠します、1000 を指定すると 1秒かけて隠します。

```
    uu.fx(node, { w: 100, h: 100, o: 1 });

    // 1秒かけて要素を隠す
    uu.fx.hide(node, 1000);
```

## uu.fx.isHide ##
uu.fx.isHide(_node_:Node):Boolean は、要素が見えない状態で true を返します。

  * style.opacity === 0
  * style.display === "none"
  * style.visibility === "hidden"

上記のいずれかで true を返します。

### 色の変化 ###
色を連続的に変化させます。
```
    var c = uu.color.random().hex,
        bgc = uu.color.random().hex;

    // 色(color)と背景色(background-color)を 500ms かけて変化させる。c は color のエリアスで、bgc は background-color のエリアスです。
    uu.fx(node, 500, { c: c, bgc: bgc });
```

### 不透明度の変化 ###
不透明度(opacity)を連続的に変化させます。o は opacity の別名です。
```
    // 不透明度を 500ms かけて 0 ～ 1 に連続的に変化させる
    uu("div").css({ o: 0 }).fx(500, { o: 1 });
```

### 位置の変化 ###
位置(left, top)を連続的に変化させます。変化方法も指定します。x, y は left, top の別名です。
```
    // left と top を 500ms かけて left = 100, top + 200(現在位置 + 200) の位置に連続的に変化させる
    // top は InOutQuad の計算結果を使用する
    uu("div").css({ x: 0 }).fx(500, { x: 100, y: ["+200", "InOutQuad"] });
```

### 大きさの変化 ###
大きさ(width, height)を連続的に変化させます。w, h は width, height の別名です。
```
    // width と height を 500ms かけて width = 0, height 0 に連続的に変化させる
    uu("div").css({ w: 100, h: 100 }).fx(500, { w: 0, h: 0 });
```

### スタンバイキュー ###
uu.fx(_node_, _duration_, uu.nop) とすることで、_duration_ の間だけ何もしないスタンバイキューを作成できます。
```
    // 500ms かけて不透明にし、500ms なにもせず、その後 500ms かけて透明にする
    uu("div").fx(500, { o: 1.0 }).fx(500, uu.nop).fx(500, { o: 0 });
```

## uu.fx.skip ##
uu.fx.skip(_node_:Node = null, _skipAll_:Boolean = false, _invisible_:Boolean = false):NodeArray は、_node_ のキューに積まれたアニメーションを一つだけスキップし、キューをスキップしたノードの配列 NodeArray を返します。
スキップすると、各CSSプロパティの値は、アニメーション開始時に uu.fx で指定した endValue の値になります。
複数のキューが設定されている場合は、次のキューが再生されます。

uu.fx.stop はアニメーションを途中で停止し、uu.fx.skip はアニメーションを最後まで実行した状態で次のキューを再生します。

_node_ に null を指定すると、アニメーションキューを持つ全てのノードから先頭のキューを一つだけスキップし、NodeArray を返します。
_skipAll_ に true を指定すると、全てのアニメーションキューをスキップします。
_invisible_ に true を指定すると、2つ以上のアニメーションを連続でスキップする際に style.visibility = "hidden" を設定し、スキップ完了後に "visible" に戻す特別な処理が追加されます。この処理をいれるとフリッカー(点滅)を抑止できるケースがあります。

```
    // node のアニメーションを一つスキップする
    uu.fx.skip(node);
```
```
    // アニメーションしている全てのノードで、アニメーションキューを全てスキップし、
    // アニメーションを終了させる
    uu.fx.skip(0, true);
```
```
    // ちらつきを抑えつつ、アニメーションを終了させる
    uu.fx.skip(0, true, true);
```

## uu.fx.stop ##
uu.fx.stop(_node_:Node):!Node は、_node_ のキューに積まれたアニメーションを一つだけ途中で停止し、_node_ を返します。アニメーションが実行されていなければ何も起きません。
複数のキューが設定されている場合は、次のキューが再生されます。

uu.fx.stop はアニメーションを途中で停止し、uu.fx.skip はアニメーションを最後まで実行した状態で次のキューを再生します。

## uu.fx.isBusy ##
uu.fx.isBusy(_node_:Node) は _node_ がアニメーション中かアニメーションキューが積まれている状態で true を返します。

## uu.fx.fade ##

uu.fx.fade(_node_:Node, _duration_:Number, _option_:Hash/Function = void):Node は、
opacity が 0.5以上ならフェードアウトし、0.5未満ならフェードインします。

## uu.fx.puff ##

uu.fx.puff(_node_:Node, _duration_:Number, _option_:Hash/Function = void):Node は、
その場で拡大しながら消えます。

## uu.fx.flare ##

uu.fx.flare(_node_:Node, _duration_:Number, _option_:Hash/Function = { parts: 10, range: 200 }):Node は、
フレア状に拡散し消えます。
  * _option_.parts にはフレアの数を 1以上の値で指定します。
  * _option_.range にはフレアの飛距離を 100以上の値で指定します。

## uu.fx.shrink ##

uu.fx.shrink(_node_:Node, _duration_:Number, _option_:Hash/Function = void):Node は、
縮小し消えます。

## uu.fx.movein ##

uu.fx.movein(_node_:Node, _duration_:Number, _option_:Hash/Function = { degree: 0, range: 200 }):Node は、
離れた場所から登場します。
  * _option_.degree には登場位置を、角度(0～360)で指定します。
  * _option_.range には飛距離を 100以上の値で指定します。

## uu.fx.moveout ##

uu.fx.moveout(_node_:Node, _duration_:Number, _option_:Hash/Function = { degree: 0, range: 200 }):Node は、
離れた場所に消えます。
  * _option_.degree には登場位置を、角度(0～360)で指定します。
  * _option_.range には飛距離を 100以上の値で指定します。

## uu.fx.highlight ##

uu.fx.highlight(_node_:Node, _duration_:Number, _option_:Hash/Function = { bgc: "#ff9", r: 1 }):Node は、
背景色をハイライトカラー(#ff9)にし、元の背景色に戻します。

# Test Code #
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/show.htm (uu.fx.show / uu.fx.hide)
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/base.htm
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/dance.htm
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/plus.htm
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/easeing.htm
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/stress.htm
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/timming.htm
  * http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/junction.htm