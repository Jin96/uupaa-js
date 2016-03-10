

uu.storage を使うと、クライアントサイドに永続的なデータを保存することができます。

```
uu.ready("storage", function(uu, storage) {
    storage.item("Hello", "Storage"); // set item

    uu.puff(storage.info());
});
```

イベントはサポートしていません。
共有メモリのようにストレージを利用し、データの更新を検知する直接的な方法はサポートしていません。

# ストレージバックエンド #
環境に応じて LocalStorage, FlashStorage, IEStorage, CookieStorage, MemStorage といったバックエンドの中から適切なものを一つ自動的に選択します。
妥当なバックエンドが利用できない場合は、MemStorage が選択されます。

## ストレージバックエンドの最大容量 ##

| LocalStorage         | 1.8 ~ 2.5MB |
|:---------------------|:------------|
| FlashStorage         |       100kB |
| IEStorage             |        63kB |
| CookieStorage        |       3.8kB |
| MemStorage           |         ?   |

## コールバック ##
uu.ready("storage", _callback_) を定義すると、ストレージが利用可能になったタイミングで _callback_ をコールバックします。

  * コールバック時の引数は _callback_(uu, _storageInstance_) です。第二引数には uu.storage が渡されます。
  * ストレージが利用可能になったタイミングで uu.storage に uu.Class.Storage のインスタンスが設定されます。
  * FlashStorage が選択された場合は uu.storage.swf を自動的にロードします(ユーザが明示的にロードする必要はありません)。

ストレージが利用可能になるタイミングは、バックエンドにより異なります。

# Storage #
Storage (uu.Class.Storage) は、自動的に利用可能なストレージバックエンドを判別し、バックエンドに対する参照を保持する機能を持ったシングルトンクラスです。 このクラスは自動的にインスタンス化され、 uu.storage により参照することができます。
ストレージへのアクセスは、通常このクラスを通して行います。LocalStorageなどのバックエンドを直接操作する必要はありません。

```
uu.Class.singleton("Storage", {
    key,  // key(index:Number):String
    info, // info():Hash { used, max, pair, backend }
    item, // item(key:String/Hash = void, value:String = void):String/Hash/Boolean
    clear // clear(key:String = void)
});
```

## uu.Class.Storage.key ##
Storage.key(_index_:Number):String は、_index_ で指定された添え字が示す _key_ を返します。

このメソッドは
```
    for (index in storage) {
        key = storage.key(index);
    }
```
のような用法を意図したものです。

バックエンドによっては、index が示す key が一定ではない場合があります(アイテムの増減により、for in ループで取れてくる順番が変化する可能性があります)。

存在しない添え字を指定すると空文字列( "" )を返します。

## uu.Class.Storage.info ##
Storage.info():Hash は、{ used:Number, max:Number, pair:Number, backend:String } を返します。

used は使用済みの、max は利用可能な ストレージスペースのバイト数です。
pair はkey/valueペア数です。backend は "LocalStorage", "FlashStorage", "IEStorage", "CookieStorage", "MemStorage" のいずれかになります。

MemStorage では、used は常に 0 になり、max は常に Number.MAX\_VALUE になります。

## uu.Class.Storage.clear ##
Storage.clear(_key_:String) は、アイテムを削除します。_key_ を省略した場合は全てのアイテムをクリアします。

CookieStorage でクリアするデータは、CookieStorage 経由で書き込んだデータに限定されます。

## uu.Class.Storage.item ##
Storage.item(_key_:String/Hash = void, _value_:String = void):String/Hash/Boolean は、4通りの方法でアイテムを取得/更新します。

  * _key_ と _value_ を省略すると、全てのアイテムを Hash で返します。アイテムが存在しない場合は 空の Hash ( {} ) を返します。
  * _key_ を指定し _value_ を省略すると、_key_ と一致するアイテムを文字列で返します。存在しない _key_ を指定すると空文字列( "" )を返します。
  * _key_ に Hash を指定すると、アイテムをマージ(まとめて更新/追加)します。成功で true を返します。
  * _key_ と _value_ を指定すると、アイテムを更新/追加します。成功で true を返します。

書き込みに失敗すると false を返します。多くの場合 false は、ストレージ容量の不足(QUOTA EXCEEDED)を意味します。
```
    // 全てのアイテムを取得する
    var hash = uu.storage.item();
```
```
    // アイテムを取得する
    var str = uu.storage.item(key);
```
```
    // アイテムをマージする
    uu.storage.item({ key: "value", key2: "value" });
```
```
    // アイテムを更新/追加する
    uu.storage.item("key", "value")
```

# LocalStorage #
LocalStorage は HTML5::WebStorage(window.localStorage) をラップしたものです。古いブラウザでは利用できません。

window.localStorage と window.sessionStorage は同じストレージを共有し容量を分け合うため、実際に利用可能なスペースは見た目よりも少ない可能性があります。

容量の最大値はブラウザによって異なります。最大値は uu.storage.info().max で取得できます。

| WebKit               | 2.5MB |
|:---------------------|:------|
| Firefox 3.5+         | 5.0MB |
| Opera 10.50+         | 1.8MB |
| IE 8+                | 4.7MB |

# FlashStorage #
FlashStorage は Flash の SharedObject をラップしたものです。FlashPlayer 9以上が必要です。
uu.storage.swf がロードできない場合は、FlashStorage も利用できません。

SharedObject はユーザがストレージスペースを、なし(0byte), 10kB, 100kB, 1MB, 10MB または 制限しない(infinity) に 設定できるため、実際の容量がゼロのケースもありえます。
FlashStorage は最大 1MB のストレージとして機能します(デフォルトでは100kBまでのデータを保存できます)。
1MB 以上のデータはストレージスペースに空きがあっても保存できません。

Flash がローカル環境(`file://...`)で動かない場合は、 サーバにファイル一式をアップロードするか、[グローバルセキュリティ設定パネル](http://www.macromedia.com/support/documentation/jp/flashplayer/help/settings_manager04.html)で、uu.storage.swf が設置されているフォルダに許可を与えてください。

# IEStorage #
IEStorage は IE の独自機能(userData behavior) をラップしたものです。
機能を OFF にされてしまう可能性があります。

# CookieStorage #
CookieStorage は Cookie をラップしたものです。
機能を OFF にされてしまう可能性があります。

# MemStorage #
MemStorage の実体は、JavaScript の Hash です。
オンメモリのため見かけ上の容量制限はありませんが、ページを閉じるとデータは失われてしまいます。

MemStorage はローカルストレージが利用できない場合に備えたフォールバック的な機能です。
MemStorage が選択された場合は、beforeunloadイベントによりページ移動を検知しサーバにデータを退避する必要があるでしょう。

# 最低容量を指定し、バックエンドを選択する方法 #
window.uuconfig = { storage: { space: _minimumStorageSize_ } } を定義しておくと、最低限必要とする ストレージスペースを byte 数で指定することができます。 要求を満たせないストレージバックエンドは選択されません。十分なストレージスペースを持ったバックエンドが利用できない場合は、MemStorage が選択されます。
```
<script>
window.uuconfig = {
    storage: {
        space: 100 * 1024 // require 100kB
    }
};
</script>
<script src="uupaa.js"></script>
```

# Test Code #

http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/storage/Storage.htm