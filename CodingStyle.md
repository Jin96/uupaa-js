

uupaa.js は [WebKit](http://webkit.org/coding/coding-style.html)のコーディングスタイルをベースにしています。

# 独自ルール #
以下は uupaa.js の独自ルールです。

このルールは、多様なバックボーンを持つ開発者が気持ちよく作業できるように。また、バグに対する耐性と修正の容易さを意識しつつ、コードのクオリティを向上させる最低限のヒントを明文化したものです。

WEB+DB PRESS VOL.57 ～ VOL.61 の連載でも、以下のルールとほぼ同じ内容を取り上げています。

## 語彙(ボキャブラリ) ##
以下の用語があります。

  * Mix または Any はあらゆる型を意味します。
```
    function hash(key,     // @arg Hash/String: key
                  value) { // @arg Any(= undefined): value

        ...
    }
```
  * Hash は key/value ストアに特化した Object の別名です。データの入れ物として意識する場合に Hash と呼びます。
```
    var hash = { key: "value" };
```
  * NodeList は document.getElementsByTagName() などが返す 動的な(liveな)ノードリストです。
  * NodeArray は uu.query() などが返す 静的な(staticな)ノードの配列です。
  * Element は配列の要素を意味します。DOM Element は Node と呼び、配列の要素(Array Elements)とは区別します。
```
    var nodeList = document.getElementsByTagName("head"),
        node = nodeList[0],
        nodeArray = uu.query("div"),
        element = [0, 1, 2][0];
```
  * FakeArray は NodeList や arguments などを総称する型です。FakeArray は Array ではありませんが、 FakeArray`[`indexer`]` でアクセスが可能で length プロパティを持ちます。FakeArray は Array Like とも呼ばれます。
```
    function() {

        var fakeArray1 = arguments, // Arguments型 かつ FakeArray型
            fakeArray2 = document.getElementByTagName("*"); // NodeList型 かつ FakeArray型
    }
```
  * StringArray は文字列だけを要素に持つ配列です。 `[` "string", ... `]`
  * NumberArray は数値だけを要素に持つ配列です。`[` 123, ... `]`
  * IgnoreCaseString は大小文字を区別しない文字列です。
  * 上記以外にも多くの型が存在します。ほとんどのケースで 形容詞 + 基本型 + コレクション型の形をとっており、CSSQueryString は CSSクエリ文字列、TimerIDArray は タイマーID を入れるための配列 となります。
```
    var stringArray = ["a", "b", "c"],
        numberArray = [0, 1, 2],
        callback = funtion() {},
        timerIDArray = [];

    timerIDArray.push(setTimeout(callback, 100));
    timerIDArray.push(setTimeout(callback, 200));
```
  * イベントを受け取るコールバックをイベントハンドラ(event handler)と呼びます。あらゆるイベントを受け取るイベントハンドラはDOM標準に従い handlerEvent とします。特定のイベントを受け取る場合は handle + イベント名 とします。
  * DOM Element は省略せず node とします。
  * DOM Event は event または ev と省略します。
  * Event や Element を e の一文字に省略するのは禁止です。e は多用されるため一括置換漏れといったミスを誘発します。
```
    // good
    function handleEvent(ev) { // DOM標準のあらゆるイベントを受け取るハンドラ
    }

    // bad
    function onevent(e) { // DOM非標準な命名による、何かを受け取るハンドラ
    }


    // good 
    function handleClick(ev) { // click イベントを受け取るハンドラ

        var node = ev.target;
    }

    // bad
    function onclick(e) { // DOM Lv0 による、レガシーな命名法

        var el = e.target;
    }
```

## 演算子の後ろで改行する ##
JavaScriptは行末のセミコロンを自動的に補完するため、
複数行に改行する際に、演算子を行の先頭に置くと思わぬバグを発生させるケースがあります。
これを回避するため、演算子や括弧の後ろで改行しセミコロンの補完を回避する必要があります。

```
    // good
    if (expression ||
        expression) {
        ...
    }

    // wrong
    if (expression
        || expression) {
        ...
    }

    // good
    return expression,
           expression;

    // bad
    return expression
           , expression;

    // good
    return {
        result: value
    };

    // bad
    return
    {
        result: value
    }

```


## if や for のブレス( {} )は省略禁止 ##
文法レベルでコードを短縮するのは Minifier の仕事です。
うかつに { } を省略すると、コードのメンテナンスでバグが入り込む余地を前もって提供する事になり、修正に対する耐久性が低い "ナイーブ" なコードになります。

ブレスを省略すると、狙ったポイントにブレークポイントも貼れなくなります。デバッグ効率も低下します。

```
    // good
    if (expression) {
        ...
    }

    // bad
    if (expression) ...

    // good
    for (;;) {
        ...
    }

    // bad
    for (;;) ...
```
Minifier は省略可能なブレスであれば、適切に省略したコードを生成してくれます。
ブレスの省略は低練度なソースコードの特徴の一つです。気をつけてください。


## function とブレス { をできるだけ同じ行に書く ##
function のブレス( { ) は、理由が無い限り function と同じ行に記述します。
また、function() { ... } とワンライナーで記述すると、狙ったポイントにブレークポイントが貼れなくなり、デバッグ効率も低下します。

```
    // good
    function() {

        ...
    }

    // wrong
    function()
    {
        ...
    }

    // wrong
    function() { ... }
```

## function() の後ろに改行を入れる ##
IE6 や IE7 のデバッガ( [Miscrosoft Script Debugger](http://blogs.msdn.com/b/ie/archive/2004/10/26/247912.aspx) )は、function() { の後に改行コードが存在しないとブレークポイントが設定できません。圧縮されたコードが IE6 や IE7 でデバッグできない(ブレークポイントが設定できない)のもこれが理由です。IE6 や IE7 と無関係でいられるコードでは、このルールに従う必要はありません。

```
    // good
    function() {

        return withLF; // 改行を一つ入れてから書き始めると、ここで一時停止が可能に
    }

    // wrong
    function() {
        return noLF; // 改行なしで書き始めると、ここ(この関数内)で一時停止できない
    }
```

## 厳密比較演算子を使う ##
理由が無い限り、== ではなく === を使ってください。== は === に比べて実行速度が遅くなり、大抵のケースでデメリットがメリットを上回ります。

```
    // good
    if (a === b) {
        ...
    }

    // wrong
    if (a == b) {
        ...
    }
```


以下のようなケースでは == の利用も合法です。== を利用する場合はその理由をコメントで記述してください。コメントを伴わない == の利用は禁止します。
```
    // good, null または undefined かを調べる
    if (a == null) { // null or undefined
        ...
    }
    
    // bad
    if (a == null) {
        ...
    }
```


## var の後ろには空行を置く ##
var の後ろには一つ以上の空行をおきます。
```
    // good
    var a = 1, b = 2, c;
 
    c = a * b;

    // bad
    var a = 1, b = 2, c;
    c = a * b;
```

## 状態をnode.classNameに保存しない ##
内部的な状態を node.className に保存することを禁止します。
```
     // good
     var hit = false;

     function eventHandler(ev) {

         if (ev.target === node) {
             hit = true;
         } else {
             hit = false;
         }
     }

     // bad
     function eventHandler(ev) {

         if (ev.target === node) {
             node.className += " hit ";
         } else {
             node.className = (" " + node.className + " ").replace(/ hit /, "");
         }
     }
```

## Strict Mode セーフにする ##
Strict Mode セーフなコードを記述してください。
行末のセミコロンの省略や arguments.callee の利用は、理由が無い限りそうすべきではありません。
```
    // bad
    var a = 3 * 200
```