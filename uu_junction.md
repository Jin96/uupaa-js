

uu.junction は非同期に発生する複数のイベントを管理し、条件を満たした場合に一度だけコールバック関数を呼び出すことで、複数の非同期処理を一つにまとめる機能を提供します。

# API #
## uu.junction ##
uu.junction(_race_:Number, _items_:Number, _callback_:Function):Junction は、パラメタを受け取り、uu.Class.Junction のインスタンスを返します。
_callback_ は callback(_response_:Hash) の形でコールバックします。
_response_.rv には Junction.ok(_value_) や Junction.ng(_value_) の _value_ が配列で格納されています。
_response_.ok には Boolean 値が格納されています。

## uu.Class.Junction ##
new uu.Class.Junction(_race_:Number, _items_:Number, _callback_:Function) は終了条件 _race_ と、アイテム数 _items_ を比較し、条件を満たした場合にコールバックする _callback_ を設定し、ジャンクションを初期化します。

_race_ や _items_ に ゼロを指定したり、 _race_ `>` _items_ な値を指定すると例外を発生させます。

## uu.Class.Junction.ok ##
ok(_value_:Mix = void) は、処理が成功したことをジャンクションに通知し、this.judge() を呼び出します。_value_ はオプションです。このメソッドは this を返します。

## uu.Class.Junction.ng ##
ng(_value_:Mix = void) は、処理が失敗したことをジャンクションに通知し、this.judge() を呼び出します。_value_ はオプションです。このメソッドは this を返します。

## uu.Class.Junction.judge ##
judge() は、ok(), ng() が呼び出された回数で条件を判断し、_callback_(_response_:Hash) を呼び出します。_response_.ok には true または false が、_response_.rv には ok(), ng() の引数 _value_ を配列化し渡します。条件に満たない場合か、既にコールバック済みの場合は何もしません。
このメソッドは this を返します。

| **条件** | **動作** |
|:-------|:-------|
| uu.junction(1, 1, callback) | ok() か ng() が一度でも呼ばれるとコールバックします。ok()が呼ばれた場合は _callback_({ rv: `[`...`]`, ok: true }) として ng()が呼ばれた場合は  _callback_({ rv: `[`...`]`, ok: true }) の形でコールバックします |
| uu.junction(1, 2, callback) | 最大で2回まで待ち合わせをします。<br />ok() が1回呼ばれると _callback_({ rv:`[`...`]`, ok: true }) の形でコールバックします。<br />ng() が2回呼ばれた場合は _callback_({ rv: `[`...`]`, ok: false }) をコールバックします |
| uu.junction(2, 3, callback) | 最大で3回まで待ち合わせをします。<br />ok() が2回呼ばれると _callback_({ rv:`[`...`]`, ok: true }) の形でコールバックします。<br />1回しかok()が呼ばれないか、ng()が2回以上呼ばれた場合は _callback_({ rv: `[`...`]`, ok: false }) をコールバックします |
| uu.junction(4, 4, callback) | 最大で4回まで待ち合わせをします。<br />ok() が4回呼ばれると _callback_({ rv:`[`...`]`, ok: true }) の形でコールバックします。<br />1回でもng()が呼ばれた場合は _callback_({ rv: `[`...`]`, ok: false }) をコールバックします |

コールバックのタイミングは、条件を満たせないことが確定した時点か、条件を全て満たした時点です。


# Test Code #
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/junction.htm

http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/fx/junction.htm