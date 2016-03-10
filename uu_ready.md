

uu.ready は、ブラウザに実装されている機能が実際に利用可能かどうかを判別し、情報を提供します。また非同期に発生する初期化完了を待機する方法を提供します。

uu.ready が扱うイベントは、System Event です。これは DOM Event とは性質が異なり、一度しか発生しない初期化イベント等をハンドリングするためのものです。

# uu.ready - properties #

## event status ##
System Event の発火状態を保持するプロパティの一覧です。

全て Boolean 型です。
|                                                              | **initial value** |
|:-------------------------------------------------------------|:------------------|
| **uu.ready.dom**         <br />DOMContentLoaded event fired     | false             |
| **uu.ready.window**      <br />window.onload event fired        | false             |
| **uu.ready.audio**       <br />`<`audio`>` ready event fired    | false             |
| **uu.ready.video**       <br />`<`video`>` ready event fired    | false             |
| **uu.ready.canvas**      <br />`<`canvas`>` ready event fired   | false             |
| **uu.ready.storage**     <br />window.localStorage ready event fired  | false             |
| **uu.ready.reload**      <br />cache reload event fired         | false             |

## functionally status ##
機能の実装状況(互換性)を保持するプロパティの一覧です。

全て Boolean 型です。機能が利用可能なら true になり、利用できない場合は false になります。

# o = true, space = false
|                                                                          | **IE6** | **IE7** | **IE8** | **IE9** | **IE10pp2** | **Gecko1.9.0+** | **WebKit525+** | **Opera9.5+** |
|:-------------------------------------------------------------------------|:--------|:--------|:--------|:--------|:------------|:----------------|:---------------|:--------------|
| **uu.ready.color.rgba**  <br />{ color: rgba(0,0,0,0) } ready               |         |         |         | o       |  o          | o               | o              | o(10+)        |
| **uu.ready.color.hsla**  <br />{ color: hsla(0,0%,0%,0) } ready             |         |         |         |         |             | o               | o              | o(10+)        |
| **uu.ready.color.transparent**  <br />{ color: transparent } ready          |         |         |         | o       |  o          | o               | o              | o(10+)        |
| **uu.ready.border.rgba** <br />{ border-color: rgb(0,0,0) } ready           |         |         |         | o       |  o          | o               | o              | o(10+)        |
| **uu.ready.border.hsla** <br />{ border-color: hsla(0,0%,0%,0) } ready      |         |         |         |         |             | o               | o              | o(10+)        |
| **uu.ready.border.transparent** <br />{ border-color: transparent } ready   |         | o       | o       | o       |  o          | o               | o              | o             |
| **uu.ready.background.rgba** <br />{ background: rgb(0,0,0) } ready         |         |         |         | o       |  o          | o               | o              | o(10+)        |
| **uu.ready.background.hsla** <br />{ background: hsla(0,0%,0%,0) } ready    |         |         |         |         |             | o               | o              | o(10+)        |
| **uu.ready.background.transparent** <br />{ background: transparent } ready | o       | o       | o       | o       |  o          | o               | o              | o             |
| **uu.ready.opacity**           <br />{ opacity: 1.0 } ready                |         |         |         | o       |  o          | o               | o              | o             |
| **uu.ready.filter**            <br />node.filters ready                    | o       | o       | o       | o       |  o          |                 |                |               |
| **uu.ready.ArraySlice**       <br />Array.prototype.slice.call(FakeArray) ready|         |         |         | o       |  o          | o               | o              | o             |
| **uu.ready.getAttribute**      <br />right getAttribute                    |         |         | o       | o       |  o          | o               | o              | o             |
| **uu.ready.StringIndexer**    <br />String`[`indexer`]` ready             |         |         | o       | o       |  o          | o               | o              | o             |
| **uu.ready.style.inlineBlock** <br />style.inlineBlock ready               |         |         | o       | o       |  o          | o               | o              | o             |
| **uu.ready.innerHTML.style**   <br />on-the-fly document.createElement("div").innerHTML = `"<style></style>"` ready |         |         |         | o       |  o          | o               | o              | o             |
| **uu.ready.cloneNode.attr**    <br />ref attribute                         |         |         |         |         |             |                 |                |               |
| **uu.ready.cloneNode.data**    <br />ref node["data-`*`"]                  | o       | o       | o       |         |             |                 |                |               |
| **uu.ready.cloneNode.event**   <br />ref DOM Event                         | o       | o       | o       |         |             |                 |                |               |

  * uu.ready.filter - スタンドアローン版のIEや、正規の手順以外でインストールされたIEではfalseになる可能性があります。
  * uu.ready.ArraySlice - Array.prototype.slice.call(_FakeArray_) が利用可能なら true になります。
    * FakeArray には NodeList や arguments などが入ります。
    * IE6, IE7, IE8 で false になります。
  * uu.ready.getAttribute - `<`a href="/b" class="c"`>` において、getAttribute("href") == "/b" && getAttribute("class") == "c" が成立すると true になります。
    * IE6, IE7, IE8 で false になります。
    * IE では node.getAttribute("href", 2) とすることで相対URLを取得できます。また getAttribute("className") とすることで className を取得できます。
  * uu.ready.StringIndexer - String`[`indexer`]` が利用可能なら true になります。
    * IE6, IE7 は "abc"`[`1`]` で undefined が返ります。

  * uu.ready.innerHTML.style - 親が居ない(parentNode === null)なノードに対し node.innderHTML = "`<style></style>`" を行った場合に、スタイルが解釈されるなら true になります。
    * IE6, IE7, IE8 では false になります。IE6～IE8でも parentNode !== null ならスタイルは解釈されます。

  * Firefox3.0 (Gecko1.9.0)
  * Firefox3.5 (Gecko1.9.1)
  * Firefox3.6 (Gecko1.9.2)
  * Safari3.1 (WebKit525)
  * Safari4.0 (WebKit528)
  * Google Chrome 1.0 (WebKit528)

# uu.ready - methods #

## uu.ready ##
uu.ready(_readyEventType_:IgnoreCaseString = "dom", _callback_:Function, ...) は条件成立後にコールバックする関数を登録します。
コールバック関数は複数指定可能です。_readyEventType_ でコールバック対象とする System Event を指定できます。大小文字は区別しません。
  * **"dom"** - DOMContentLoaded event (low order)
  * **"window"** - window.onload event
  * **"audio"** - `<`audio`>` ready event
  * **"video"** - `<`video`>` ready event
  * **"canvas"** - `<`canvas`>` ready event
  * **"storage"** - window.localStorage ready event
  * **"reload"** - location.reload() event
先に登録された System Event ほど優先的にコールバックします。
_readyEventType_ は省略できます。省略した場合は **"dom:0"** が指定されたものとみなします。

### 優先度の指定 ###
_readyEventType_ には 0～2までの数字で優先度を指定できます、値が大きいほど先に実行します。省略した場合の優先度は **0** です。優先度は "dom:2" のように イベントタイプ + ":" + 数字で指定します。

### 既に発火済みの System Event の扱い ###
条件成立後(System Event発火後)に uu.ready(_callback_) を実行すると、コールバック関数を溜め込まず、即座に _callback_ をコールバックします。
System Event 発火済みかどうかを調べるには、uu.ready.dom や uu.ready.window を調べます。true なら、それら System Event は発火済みです。

### DOMContentLoaded イベントハンドラの使い方 ###
```
    uu.ready(function(uu) {
        alert("DOMReady");
    });

    // ハンドラは複数指定できます(DOMReady1 → DOMReady2 の順に発火)
    uu.ready(function(uu) {
        alert("DOMReady1");
    }, function(uu) {
        alert("DOMReady2");
    });

    // 引数の途中で別のイベントタイプや優先度の変更指定できます(DOMReady2 → DOMReady1 → WindowReady3 の順に発火)
    uu.ready(function(uu) {
        alert("DOMReady1");
    }, "dom:2", function(uu) {
        alert("DOMReady2");
    }, "window", function(uu) {
        alert("WindowReady3");
    });

```
### window.onload イベントハンドラの使い方 ###
```
    // イベントタイプは先に指定します。
    uu.ready("window", function(uu) {
        alert("window.onload ready");
    });

    // 【注意】イベントタイプを後から指定すると、デフォルトのイベントタイプ "dom:0" として解釈されてしまいます。
    uu.ready(function(uu) {
        alert("window.onload ready"); // WindowReady ではなく DOMReady のタイミングで発火
    }, "window");
```

### WebStorage イベントハンドラの使い方 ###
```
    // WebStorage イベントハンドラは、第二引数に、Storage クラスのインスタンスが渡されます。
    uu.ready("storage", function(uu, storageObject) {
        alert("WebStorage ready");
    });
```

### `<`canvas`>` イベントハンドラの使い方 ###
```
    // <canvas> イベントハンドラは、第二引数に、uu.tag("canvas") の結果が渡されます。
    uu.ready("canvas", function(uu, canvasNodeArray) {
        alert("canvas ready");
    });
```

### `<`audio`>` イベントハンドラの使い方 ###
```
    // <audio> イベントハンドラは、第二引数に、uu.tag("audio") の結果が渡されます。
    uu.ready("audio", function(uu, audioNodeArray) {
        alert("audio ready");
    });
```

### ユーザ独自の System Event の使い方 ###
ユーザが独自に定義した System Event も指定可能です。適当なタイミングで uu.ready.fire() を呼び出し手動でコールバックします。
```
    var param = { counter: 0 };

    uu.ready("com.example.oreore", function(uu, param) {

        alert("oreore fire" + (++param.counter)); // oreore fire1

    }, function(uu) {

        alert("oreore fire" + (++param.counter)); // oreore fire2

    });
    uu.ready.fire("com.example.oreore", param);
```

## uu.ready.fire ##
uu.ready.fire(_readyEventType_:String, _param_:Mix = document) は uu.ready() で登録済みの System Event をコールバックします。
コールバック引数は、callback(uu, _param_) となります。

発火済みの場合は、何もしません。

# Test Code #
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/ready.htm