

# uu.Class の概要 #

uu.Class はカプセル化, 継承, ポリモーフィズム機能を提供します。
また、メッセージハンドラとして機能する msgbox メソッドや、イベントハンドラとして機能する handleEvent メソッドに対するサポートが得られます。

# uu.Class #

  * uu.Class(_ClassName_:String, _protoMember_:Hash/Function = void, _staticMember_:Hash = void) は汎用的なクラスを定義します。
    * _ClassName_ にはクラス名を指定します。**:** と **<** はクラス名としては使用できません。
    * 継承は "_ClassName_ : _SuperClass_" や _ClassName_ < _SuperClass_" とします。

  * _protoMember_ には public なプロパティやメソッドを[Hash](Hash.md)で指定します。省略も可能です。
  * _protoMember_ に **init**: function(_var\_args_:[Mix](Mix.md), ...) を定義すると、コンストラクタとして機能します。init メソッドは初期化に必要な引数を受け取ることができます。
  * _protoMember_ に **msgbox**: function(msg:String, param:[Mix](Mix.md) = undefined) を定義すると、メッセージハンドラとして機能します。msg にはメッセージ文字列が渡され、param にはパラメタが渡されます。
  * _protoMember_ に **handleEvent**: function(event:[EventObjectEx](EventObjectEx.md)) を定義すると、イベントハンドラとして機能します。
  * _staticMember_ には static なメソッドを[Hash](Hash.md)で定義します。省略も可能です。
  * _staticMember_ で指定したメソッドは、uu.Class._クラス名_._静的メソッド名_ の形で呼び出せます。

```
uu.Class("MySuperClass", {
    init: function(arg1) { // コンストラクタ
        this.val1 = arg1
    },
    msgbox: function(msg, param) { // メッセージハンドラ
        alert(msg);
    },
    handleEvent: function(event) { // イベントハンドラ
        alert(event.type);
    },
    setItem: function(key, value) { // ユーザ定義メソッド
        // nop
    },
    getItem: function(key) { // ユーザ定義メソッド
        // nop
    }
});

uu.Class("MyClass < MySuperClass", { // MySuperClassを継承
    init: function(arg1) { // コンストラクタ
        this.val2 = arg1
    },
    msgbox: function(msg, param) { // メッセージハンドラ
        this.superMethod("msgbox", msg, param); // MySuperClass::msgbox を呼び出す
    },
    handleEvent: function(event) { // イベントハンドラ
    },
    setItem: function(key, value) { // ユーザ定義メソッドのオーバーライド
        window.localStorage[key] = value;
    },
    getItem: function(key) { // ユーザ定義メソッドのオーバーライド
        return window.localStorage[key];
    }
});
```
```
var obj1 = new uu.Class.MyClass(1);
var obj2 = new uu.Class.MyClass(2);

// メッセージのブロードキャスト
uu.msg.post(null, "hello"); // alert("hello") が2回実行される

// bodyの最後に<div>を追加
var div = uu.node.add();
// var div = document.body.appendChild(document.createElement("div")); 

// クリックイベントを obj1.handleEvent にバインド
uu.event("click", div, obj1);
```

# uu.Class.singleton #
  * uu.Class.singleton(_ClassName_:String, _protoMember_:Hash/Function = void, _staticMember_:Hash = void) は何度生成しても実体が一つしか存在しないシングルトンクラスを定義します。

```
uu.Class.singleton("MySingletonClass", {
    init: function(arg1) { // コンストラクタ
        this.val1 = arg1
    },
    msgbox: function(msg, param) { // メッセージハンドラ
        alert(msg);
    },
    handleEvent: function(event) { // イベントハンドラ
        alert(event.type);
    },
    setItem: function(key, value) { // ユーザ定義メソッド
    }
});
```
```
var obj1 = uu("MySingletonClass", 1);
var obj2 = uu("MySingletonClass", 2);

// singleton クラスは何度生成しても実体は一つだけです
alert(obj1 === obj2); // true
```


# その他の機能 #

  * uu.Class("_ClassName_", _initializeFunction_) や
  * uu.Class.singleton("_ClassName_", _initializeFunction_) は、init メソッドだけのクラスを定義する SyntaxSugar です。

```
uu.Class.singleton("State", function() {
    this.Run = 1;
    this.Stop = 2;
});

これは、以下と同じ意味になります。
uu.Class.singleton("State", {
    init: function() {
        this.Run = 1;
        this.Stop = 2;
    }
});
```
```
  // クラスのインスタンスを列挙型や定数として利用する
  window.State = uu("State");

  if (obj.state === State.Run) {
  }
```

  * superMethod(_methodName_:String, _var\_args_:Mix, ...) で親クラスのメソッドを呼び出せます。

## 仕様 ##
  * SuperClass を一つだけ指定した単純継承をサポートしています。多段継承や多重継承は未サポートです。
  * singleton クラスは継承をサポートしていません。
    * 継承元のクラス対し、動的にメソッドを追加/削除した場合の動作は未定義です。
  * コンストラクタメソッド(**init**)はオーバーロードできません。
  * 子のコンストラクタメソッド(**init**)を呼ぶと、親のコンストラクタメソッド(**SuperClass::init**)が自動的に呼ばれます。
  * デストラクタはサポートしていません。
  * 重複した名前を持つクラスは定義できません。_namespace_`_`_ClassName_ のようにネームスペースで区切るなどの工夫が必要です。
  * クラスのインスタンス化は、 new uu.Class._ClassName_(引数, ...) または [uu](uu.md)("_ClassName_", 引数, ...) で行います。
    * [uu](uu.md)("_ClassName_", 引数, ...) では最大で4つまでの引数を指定できます。5番目以降は無視されます。
  * uu.Class("_ClassName_") のプロトタイプオブジェクトは、uu.Class`[`_ClassName_`]`.prototype にあります。


## コメント ##
  * JavaScript はプロトタイプベースの言語ですが、クラスベースな書き方を好まれる方も多いかと思います。uu.Class はそのような方向けの機能です。
  * 多段継承やデストラクタは、uupaa.js 0.7 時点ではサポートしていましたが、ニーズが無いと判断したため機能落ちしています。