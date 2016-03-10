

# Supported Browsers #
uupaa.js は以下のブラウザをサポートします。
  * Aグレード: IE8+, Firefox3.6+, Opera10.50+, Google Chrome4+, Safari4+, iPhone3+
  * Bグレード: IE6, IE7, Firefox3.5

Bグレードのブラウザでは一部機能が制限されます。

# Namespace / Factory #
uupaa.js の全機能は [uu](uu.md) で始まります。また [uu](uu.md) は factory 機能を持ちます。

  * uu(Class, arg, ...) はクラスファクトリです。uu.Class 以下のクラスをインスタンス化し返します。
  * uu(CSSセレクタ, context) はNodeSetファクトリです、CSSセレクタに一致する要素を保持する NodeSet オブジェクトを返します。

# Node Set #
NodeSet は CSSセレクタを元に要素を抽出し、ノードの集合(ノードセット)を一括管理する機能を提供します。
  * [NodeSet.back()](NodeSet_back.md) は スタックを一つ巻き戻します。
  * [NodeSet.find()](NodeSet_find.md) は 現在のノードセットを絞り込み新しいノードセットを作成します。古いノードセットはスタックに移動します。
  * [NodeSet.nth()](NodeSet_nth.md) は 現在のノードセットのn番目のノードを取得するか、n番目のノードに対しコールバック関数を適用します。
  * [NodeSet.each()](NodeSet_each.md) は 現在のノードセットに対しコールバック関数を順番に適用します。ループの途中でfalseを返すとループアウトします。
  * [NodeSet.size()](NodeSet_size.md) は 現在のノードセットの要素数を返します。
  * [NodeSet.indexOf()](NodeSet_indexOf.md) は 現在のノードセットから一致するノードのインデックス(nth)を返します。
  * [NodeSet.add()](NodeSet_add.md) は 現在のノードセットの各要素を基準にして、ノードを追加/挿入します。
  * [NodeSet.remove()](NodeSet_remove.md) は 現在のノードセットを親要素から切り離します。切り離したノードの NodeArray を返します。
  * [NodeSet.bind()](NodeSet_bind.md) は 現在のノードセットに対しイベントを設定します。
  * [NodeSet.unbind()](NodeSet_unbind.md) は 現在のノードセットに対しイベントを解除します。
  * [NodeSet.live()](NodeSet_live.md) は 現在のノードセットに対し Live イベントを設定します。
  * [NodeSet.unlive()](NodeSet_unlive.md) は 現在のノードセットに対し Live イベントを解除します。
  * [NodeSet.hover()](NodeSet_hover.md) は 現在のノードセットに対し hover イベントを設定します。
  * [NodeSet.unhover()](NodeSet_unhover.md) は 現在のノードセットに対し hover イベントを解除します。
  * [NodeSet.cyclic()](NodeSet_cyclic.md) は 現在のノードセットに対し cyclic イベントを設定します。
  * [NodeSet.uncyclic()](NodeSet_uncyclic.md) は 現在のノードセットに対し cyclic イベントを解除します。
  * [NodeSet.attr()](NodeSet_attr.md) は 現在のノードセットの属性にアクセスします。
  * [NodeSet.css()](NodeSet_css.md) は 現在のノードセットのスタイルにアクセスします。
  * [NodeSet.show()](NodeSet_show.md) は 現在のノードセットの各要素が非表示なら表示します。
  * [NodeSet.hide()](NodeSet_hide.md) は 現在のノードセットの各要素を隠します。
  * [NodeSet.klass()](NodeSet_klass.md) は 現在のノードセットの className 属性にアクセスします。
  * [NodeSet.text()](NodeSet_text.md) は 現在のノードセットの textContent 属性にアクセスします。
  * [NodeSet.value()](NodeSet_value.md) は 現在のノードセットの value 属性にアクセスします。
  * [NodeSet.fx()](NodeSet_fx.md) は 現在のノードセットに対しアニメーションを設定します。
  * [NodeSet.skip()](NodeSet_skip.md) は 現在のノードセットに対し設定されているアニメーションをスキップします。

  * [NodeSet.click()](NodeSet_click.md) は NodeSet.event.bind(node, "click") と同じです。

以下のショートカットイベントも利用できます。
  * [NodeSet.mouseup()](NodeSet_mouseup.md)
  * [NodeSet.mousemove()](NodeSet_mousemove.md)
  * [NodeSet.mousewheel()](NodeSet_mousewheel.md)
  * [NodeSet.dblclick()](NodeSet_dblclick.md)
  * [NodeSet.keydown()](NodeSet_keydown.md)
  * [NodeSet.keypress()](NodeSet_keypress.md)
  * [NodeSet.keyup()](NodeSet_keyup.md)
  * [NodeSet.change()](NodeSet_change.md)
  * [NodeSet.submit()](NodeSet_submit.md)
  * [NodeSet.focus()](NodeSet_focus.md)
  * [NodeSet.blur()](NodeSet_blur.md)
  * [NodeSet.contextmenu()](NodeSet_contextmenu.md)

NodeSet に機能を追加するには、uu.Class.NodeSet.prototype に対してメソッドを定義します。

# Ready #
[uu.ready()](uu_ready.md) は利用可能な機能の一覧と [DOMReady](DOMReady.md), WindowReady, StorageReady などのタイミングでコールバックする仕組みを提供します。

# Version Detection #
[uu.ver](uu_ver.md) は ブラウザのバージョンと動作環境(JIT、OS, モバイル, Touch, プラグイン)についての情報を提供します。

  * uu.ie は uu.ver.ie の Alias です
  * uu.gecko は uu.ver.gecko の Alias です
  * uu.opera は uu.ver.opera の Alias です
  * uu.webkit は uu.ver.webkit の Alias です

# Code Snippet #
[uu.snippet()](uu_snippet.md) は 簡易テンプレートです。静的なHTMLを読み込み、ループを展開し変数を適用します。

# Ajax / JSONP #
  * [uu.ajax()](uu_ajax.md) は Ajax 機能を提供します。非同期専用です。
  * [uu.require()](uu_require.md) は 同期読み込み(Sjax)機能を提供します。
  * [uu.jsonp()](uu_jsonp.md) は jsonp による非同期読み込み機能を提供します。

# Type Match / Type Detection #
  * [uu.like()](uu_like.md) は 一致するものを含むかどうかを判定します。曖昧検索とディープチェックを行ないます。
  * [uu.type()](uu_type.md) は 型を判定します。
  * [uu.isNumber()](uu_isNumber.md) は Number型かどうかを判定します。
  * [uu.isString()](uu_isString.md) は String型かどうかを判定します。
  * [uu.isFunction()](uu_isFunction.md) は Function型かどうかを判定します。
  * uu.isArray() はありません。Array型の比較は Array.isArray() を使います。

# Hash / Array #
Hash(Object)とArrayを操作する一連の機能です。

  * [uu.arg()](uu_arg.md) は関数のデフォルト引数を補完します。
  * [uu.mix()](uu_mix.md) は Mixin を行います。
  * [uu.has()](uu_has.md) は Hash または Array が 要素や要素の集合を含んでいるかを検索します。Hash A が Hash B を内包しているか、Array A が Array B を内包しているかなども比較できます。
  * [uu.nth()](uu_nth.md) は Hash または Array の n 番目の key/value ペアを返します。Array の場合は欠落している要素をカウントしません。
  * [uu.each()](uu_each.md) は for (i in Hash) または Array#forEach を行ないます。
  * [uu.keys()](uu_keys.md) は Hash または Array のKey(添字)一覧を返します。
  * [uu.size()](uu_size.md) は Hash または Array の要素数を返します。
  * [uu.clone()](uu_clone.md) は Hash または Array のクローン(シャローコピー/浅いコピー)を返します。
  * [uu.values()](uu_values.md) は Hash または Array の値一覧を返します。
  * [uu.indexOf()](uu_indexOf.md) は Hash または Array の値を検索し一致する Key を返します。

  * [uu.hash()](uu_hash.md) は Hash 化します。Key/Value ペアや、カンマで結合された文字列から Hash を作成します。
  * [uu.array()](uu_array.md) は Array 化します。リテラル値や FakeArray を Array に変換します。変換と同時に slice もできます。
  * [uu.array.dump()](uu_array_dump.md) は ByteArray を10進/16進文字列化します。
  * [uu.array.sort()](uu_array_sort.md) は Array をソートします。
  * [uu.array.clean()](uu_array_clean.md) は Array から null / undefined などの値を削除し密な配列を作成します。Indexをリナンバリングします。
  * [uu.array.toHash()](uu_array_toHash.md) は Array と値 または Array と Array からHashを作成します。
  * [uu.array.unique()](uu_array_unique.md) は 重複した値を除去した配列を作成します。

# Attribute #
  * [uu.attr()](uu_attr.md) は Node の属性値にアクセスします。

# Data Set #
  * [uu.data()](uu_data.md) は Node のデータセット(HTML5 - EMBEDDING CUSTOM NON-VISIBLE DATA)にアクセスします。

# CSS / Style / Style Sheet / Viewport #
  * [uu.css()](uu_css.md) は Node のスタイル属性値にアクセスします。また getComputedStyle 互換機能の提供や、StyleSheetクラスのインスタンスを作成する機能もあります。
  * [uu.css.show()](uu_css_show.md) は 隠されている Node を見せます。
  * [uu.css.hide()](uu_css_hide.md) は 見えている Node を隠します。
  * [uu.css.unit()](uu_css_unit.md) は CSS の様々な単位系をピクセル単位に変換します。"12em" や "auto" 等をpixelに変換します。
  * [uu.css.isShow()](uu_css_isShow.md) は Node が見えているか判定します。

## CSS Box Model ##
CSS Box Model に関する機能を提供します。
  * [uu.css.box()](uu_css_box.md) は Margin, Border, Padding 幅を計算し、コンテントボックスの大きさを返します。
  * [uu.css.rect()](uu_css_rect.md) は コンテントボックスの絶対座標とオフセットサイズ(style.width + padding + border)を返します。
  * [uu.css.toStatic()](uu_css_toStatic.md) は style="position:static" 相当です。
  * [uu.css.toAbsolute()](uu_css_toAbsolute.md) は style="position:absolute" 相当です。オフセット値を自動的に解決します。
  * [uu.css.toRelative()](uu_css_toRelative.md) は style="position:relative" 相当です。

## CSS 3 ##
  * [uu.css.opacity()](uu_css_opacity.md) は Node の不透明度にアクセスします。
  * [uu.css.transform()](uu_css_transform.md) は Node の回転/拡大/移動に関する情報にアクセスします。
  * [uu.css.selectable()](uu_css_selectable.md) は DragDrop でテキストやノードが選択されないようにします。

## Viewport ##
  * [uu.viewport()](uu_viewport.md) は ViewPortの大きさ/スクロール/回転に関する情報を取得します。

# Effect / Animation #
  * [uu.fx()](uu_fx.md) は CSS ベースのアニメーション機能を提供します。
  * [uu.fx.skip()](uu_fx_skip.md) は 現在のアニメーションキューをスキップ(即終了)し実行を次のキューに移します。
  * [uu.fx.isBusy()](uu_fx_isBusy.md) は Node がアニメーション中かどうかを判定します。

# Query #
  * [uu.id()](uu_id.md) は Node の ID 属性が一致する最初の要素を検索します。
  * [uu.tag()](uu_tag.md) は Node の tagName 属性が一致する要素を全て検索します。コメントノードは除外します。
  * [uu.match()](uu_match.md) は Node が CSS セレクタと一致するかどうかを判定します。
  * [uu.query()](uu_query.md) は CSS セレクタと一致する Node を検索します。
  * [uu.klass()](uu_klass.md) は Node の className 属性が値を含んでいる要素を全て検索します。

# Class Name #
  * [uu.klass.has()](uu_klass_has.md) は Node の className 属性が値を含んでいるか判定します。
  * [uu.klass.add()](uu_klass_add.md) は Node の className 属性に値を追加します。
  * [uu.klass.remove()](uu_klass_remove.md) は Node の className 属性から値を削除します。
  * [uu.klass.toggle()](uu_klass_toggle.md) は Node の className 属性が値を含んでいれば削除し、無ければ追加します。

# OOP #
必要最小限のクラスベースOOPと、メッセージポンプによるインスタンス間の同期/非同期通信, ユニキャスト/ブロードキャスト機能を提供します。
  * [uu.Class()](uu_Class.md) は クラスを定義します。一段階の継承が可能です。
  * [uu.Class.singleton()](uu_Class_singleton.md) は シングルトンクラスを定義します。継承はできません。

以下の組み込みクラスがあります。

  * uu.Class.NodeSet は ノードセットを管理します。
  * uu.Class.MessagePump は インスタンス間のメッセージングを管理します。
  * uu.Class.Color は 色を管理します。

# Event #
  * [uu.event()](uu_event.md) は イベントハンドラの設定ができます。
  * [uu.event.has()](uu_event_has.md) は Node がイベントハンドラを持っているか判定します。
  * [uu.event.key()](uu_event_key.md) は Key イベントに関する情報を補強します。
  * [uu.event.edge()](uu_event_edge.md) は Mouse オフセット座標に関する情報を補強します。
  * [uu.event.fire()](uu_event_fire.md) は カスタムイベントを発火します。
  * [uu.event.stop()](uu_event_stop.md) は イベントの伝播とデフォルトアクションを抑止します。
  * [uu.event.hover()](uu_event_hover.md) は ホバーイベントハンドラの設定ができます。
  * [uu.event.unhover()](uu_event_unhover.md) は ホバーイベントハンドラを解除します。
  * [uu.event.cyclic()](uu_event_cyclic.md) は サイクリックイベントハンドラの設定ができます。
  * [uu.event.uncyclic()](uu_event_uncyclic.md) は サイクリックイベントハンドラを解除します。
  * [uu.event.unbind()](uu_event_unbind.md) は イベントハンドラを解除します。
  * [uu.event.attach()](uu_event_attach.md) は イベントハンドラを設定します。この関数でイベントを登録すると uu.event.bind や uu.event.unbind の管理対象外となります。
  * [uu.event.detach()](uu_event_detach.md) は uu.event.attach で設定したイベントハンドラを解除します。
  * [uu.bind()](uu_bind.md) は uu.event.bind の alias です。
  * [uu.unbind()](uu_unbind.md) は uu.event.unbind の alias です。

  * [uu.click()](uu_click.md) は uu.event.bind(node, "click") と同じです。

以下のショートカットイベントも利用できます。
  * [uu.mouseup()](uu_mouseup.md)
  * [uu.mousemove()](uu_mousemove.md)
  * [uu.mousewheel()](uu_mousewheel.md)
  * [uu.dblclick()](uu_dblclick.md)
  * [uu.keydown()](uu_keydown.md)
  * [uu.keypress()](uu_keypress.md)
  * [uu.keyup()](uu_keyup.md)
  * [uu.change()](uu_change.md)
  * [uu.submit()](uu_submit.md)
  * [uu.focus()](uu_focus.md)
  * [uu.blur()](uu_blur.md)
  * [uu.contextmenu()](uu_contextmenu.md)

## Resize Event ##
  * [uu.resize()](uu_resize.md) は resize イベントハンドラを設定します。
  * [uu.unresize()](uu_unresize.md) は resize イベントハンドラを解除します。
## Live Event ##
  * [uu.live()](uu_live.md) は イベントをバブルフェーズで補足するイベントハンドラを設定します。
  * [uu.live.has()](uu_live_has.md) は Node が live イベントハンドラを持っているか判定します。
  * [uu.unlive()](uu_unlive.md) は live イベントハンドラを解除します。
# Node / Node List / NodeID #
  * [uu.node()](uu_node.md) は DOM ノード または SVG ノード を構築します。
  * [uu.node.at()](uu_node_at.md) は uu.node でコールバックする関数を登録します。
  * [uu.node.add()](uu_node_add.md) は ノードを追加/挿入します。
  * [uu.node.has()](uu_node_has.md) は ノードの親子関係を判定します。
  * [uu.node.bulk()](uu_node_bulk.md) は HTML 文字列の断片から DocumentFragment を作成します。
  * [uu.node.path()](uu_node_path.md) は ノードの場所を示す文字列(ノードパス)を CSS セレクタ文字列で返します。
  * [uu.node.sort()](uu_node_sort.md) は NodeArray をドキュメントオーダーにソートし、重複を取り除いた NodeArray を返します。
  * [uu.node.swap()](uu_node_swap.md) は ノードを入れ替えます。
  * [uu.node.wrap()](uu_node_wrap.md) は ノードをラップします。
  * [uu.node.clear()](uu_node_clear.md) は 子ノード削除します。
  * [uu.node.clone()](uu_node_clone.md) は ノードのクローンを作成します。属性、DATASET、幾つかのイベントハンドラはコピーされます。
  * [uu.node.remove()](uu_node_remove.md) は 子ノードを親ノードから切り離し子ノードを返します。
  * [uu.node.indeOf()](uu_node_indexOf.md) は 親ノードからみた子ノードの順番を返します。TetxtNode や CommentNode はカウントしません。
  * [uu.node.children()](uu_node_children.md) は 親ノードが持つ子ノードの数を返します。TetxtNode や CommentNode はカウントしません。
  * [uu.node.normalize()](uu_node_normalize.md) は ノード以下のブランクノード(空行や空のテキストノード)やコメントノードを除去します。
  * [uu.add()](uu_add.md) は uu.node.add の alias です。
## NodeID ##
  * [uu.nodeid()](uu_nodeid.md) は ノードのユニークな番号(ID)を返します。
  * [uu.nodeid.toNode()](uu_nodeid_toNode.md) は ノードID からノードを取得します。
  * [uu.nodeid.remove()](uu_nodeid_remove.md) は ノード を管理対象から外します。
# Node Builder #
ノードビルダーは、簡単にノードツリーを作成する機能です。
  * [uu.head()](uu_head.md) は 引数で与えられたノードを、headノードに追加し head ノードを返します。
  * [uu.body()](uu_body.md) は 引数で与えられたノードを、bodyノードに追加し body ノードを返します。
  * [uu.text()](uu_text.md) は 引数で与えられた文字列を元にテキストノードを構築し返します。または テキストノードの値を取得します。

uu.head(), uu.body() 以外にも、
> uu.a(), uu.b(), uu.br(), uu.dd(), uu.div(), uu.dl(), uu.dt(), uu.form(),
> uu.h1(), uu.h2(), uu.h3(), uu.h4(), uu.h5(), uu.h6(), uu.i(), uu.img(), uu.iframe(),
> uu.input(), uu.li(), uu.ol(), uu.option(), uu.p(), uu.pre(), uu.select(), uu.span(),
> uu.table(), uu.tbody(), uu.tr(), uu.td(), uu.th(), uu.thead(), uu.tfoot(),
> uu.textarea(), uu.u(), uu.ul(),
> uu.abbr(), uu.article(), uu.aside(), uu.audio(), uu.canvas(), uu.datalist(),
> uu.details(), uu.eventsource(), uu.figure(), uu.footer(), uu.header(), uu.hgroup(),
> uu.mark(), uu.menu(), uu.meter(), uu.nav(), uu.output(), uu.progress(), uu.section(),
> uu.time(), uu.video
等が存在します。これらは uu.body() と同様の機能を持っています。

# Form.Value #
  * [uu.value()](uu_value.md) は form系要素(input, select, option, textarea)の値にアクセスします。

# JSON #
  * [uu.json()](uu_json.md) は JavaScript オブジェクトをJSON 文字列に変換します。
  * [uu.json.decode()](uu_json_decode.md) は JSON 文字列を JavaScript オブジェクトに戻します。

# String #
  * [uu.fix()](uu_fix.md) は CSS プロパティのキャメライズ、属性名のノーライズ、ベンダープリフィクスのノーマライズなどを行ないます。
  * [uu.trim()](uu_trim.md) は文字列の左右から空白を除去し、内側の連続した空白を一つの空白にします。
  * [uu.trim.tag()](uu_trim_tag.md) は文字列の `<` と `>` を除去し、さらに uu.trim() を行います。
  * [uu.trim.func()](uu_trim_func.md) は `" url(http://example.com) "` といった文字列から左右の空白を除去し、さらに `"url("` と `")"` を除去します。
  * [uu.trim.quote()](uu_trim_quote.md) は `" 'http://example.com' "` といった文字列から左右の空白を除去し、さらに クォート文字列(`"` と `'`)を除去します。
  * [uu.f()](uu_f.md) はプレースホルダ(`??`)を含むフォーマット文字列と可変長引数を受け取り、文字列化した引数をプレースホルダに埋め込みます。
  * [uu.format()](uu_format.md) は uu.f の alias です。
  * [uu.sf()](uu_sf.md) は [PHP の sprintf](http://php.net/manual/ja/function.sprintf.php)のサブセットです。%i, %d, %u, %o, %x, %X, %f, %c, %s, %j(JSON), %1$d(インデックスによる引数の再利用)や、パディング、桁あわせ、精度の指定などをサポートします。
  * [uu.sprintf()](uu_sprintf.md) は uu.sf の alias です。

# Codec #
  * [uu.entity()](uu_entity.md) は 記号(`<` `>` `&` `"`)を HTMLエンティティ文字列(`&lt;` `&gt;` `&amp;` `&quot;`)に変換します。
  * [uu.entity.decode()](uu_entity_decode.md) は HTMLエンティティを含む文字列を復号します。
  * [uu.base64()](uu_base64.md) は 文字列または ByteArray を Base64 文字列に変換します。
  * [uu.base64.decode()](uu_base64_decode.md) は Base64 文字列を 文字列または ByteArray に複合します。
  * [uu.utf8()](uu_utf8.md) は 文字列を UTF8ByteArray に変換します。
  * [uu.utf8.decode()](uu_utf8_decode.md) は UTF8ByteArray を文字列に複合します。slice も可能です。
  * [uu.md5()](uu_md5.md) は ASCIIString または ByteArrayを HexString(MD5 ハッシュ)に変換します。

# Date #
  * [uu.date()](uu_date.md) は DateHash, Date, Number または String を DateHash に変換します

# Number #
  * [uu.guid()](uu_guid.md) は ユニークな数字を返します。

# Evaluation #
  * [uu.ready()](uu_ready.md) は 機能が使用可能になったタイミングでコールバックする関数を登録します。

# Color #
uu.color は色辞書、色の相互変換、カラーエフェクト機能を提供します。またパース済みのカラーをキャッシュするため素早くアクセスすることができます。
  * [uu.Class.Color()](uu_Class_Color.md) は r, g, b, a, hex, rgba といったパブリックデータメンバを持ち、toString(), hsla(), gray(), sepia(), comple(), arrange() を提供します。
  * [uu.color()](uu_color.md) は Color, HSLAHash, RGBAHash または String をパースし Color クラスのインスタンスを返します。
  * [uu.color.add()](uu_color_add.md) は 色辞書にユーザー独自の色を追加します。
  * [uu.color.random()](uu_color_random.md) は ランダムな色を生成し、Color インスタンスを返します。
  * [uu.color.cache](uu_color_cache.md) は カラーキャッシュを保持する Hash です。カラーアニメーションを多用するケースでは、時々クリアする必要があるかもしれません。

# Image #
canvas.drawImage() では、予め画像をロードしておく必要があります。uu.image はそのような場合に有用です。
  * [uu.image()](uu_image.md) は URL とコールバック関数を受け取り画像を読み込みます。読み込み完了/失敗でコールバックします。
  * [uu.image.size()](uu_image_size.md) は 画像本来のサイズを返します。

# SVG #
  * [uu.svg()](uu_svg.md) は `<`svg:svg`>` を生成します。

# Canvas #
  * [uu.canvas()](uu_canvas.md) は `<`canvas`>` を生成します。

# Flash #
  * [uu.flash()](uu_flash.md) は `<`object`>`を生成し swf ファイルをロードします。

# Cookie #
  * [uu.cookie()](uu_cookie.md) は cookie を読み込み、パースした結果を返します。
  * [uu.cookie.save()](uu_cookie.md) は cookie を保存します。

# Storage #
HTML5::WebStorage互換機能を提供します。
  * [uu.storage](uu_storage.md) は Storage が利用可能な状態で、uu.Class.Storage クラスのインスタンスを保持します。利用不能なら null が設定されます。
  * [uu.Class.Storage](uu_Class_Storage.md) は [uu.Class.LocalStorage](uu_Class_LocalStorage.md), [uu.Class.FlashStorage](uu_Class_FlashStorage.md), [uu.Class.IEStorage](uu_Class_IEStorage.md), [uu.Class.CookieStorage](uu_Class_CookieStorage.md), [uu.Class.MemStorage](uu_Class_MemStorage.md)から適切なクラスを選択しインスタンスを保持します。また統一されたI/Fを提供します。
  * [uu.Class.LocalStorage](uu_Class_LocalStorage.md) は window.localStorage へのアクセスを提供します。最小で1.8MB、最大で8MBのストレージを提供します。
  * [uu.Class.FlashStorage](uu_Class_FlashStorage.md) は Flash::SharedObject へのアクセスを提供します。100kBから最大で1MBのストレージを提供します。ユーザがストレージサイズをゼロに設定したり、Flashのバージョンが8以下なら利用できません。
  * [uu.Class.IEStorage](uu_Class_IEStorage.md) は IE::userData へのアクセスを提供します。最大で63kBのストレージを提供します。
  * [uu.Class.CookieStorage](uu_Class_CookieStorage.md) は Cookie へのアクセスを提供します([uu.cookie](uu_cookie.md)を使役します)。最大で3.8kBのストレージを提供します。
  * [uu.Class.MemStorage](uu_Class_MemStorage.md) は 上記のクラスが選択されなかった場合のフォールバック機能を提供します。JavaScriptのHashに対しデータを格納するため容量は事実上無制限ですが、ブラウザを閉じるとデータは揮発します。

# URL #
  * [uu.url()](uu_url.md) は URL の分解と再構築を行います。
  * [uu.url.abs()](uu_url_abs.md) は 相対 URL を絶対 URL に変換します。
  * [uu.url.dir()](uu_url_dir.md) は URL から ディレクトリパスを取り出します。
  * [uu.url.split()](uu_url_split.md) は URL から ディレクトリパスとファイルパスを別々に取り出します。
  * [uu.qs()](uu_qs.md) は QueryString の分解/再構築および追加を行ないます。

# Debug #
  * [uu.puff()](uu_puff.md) は オブジェクトまたは、フォーマット文字列と幾つかの引数を受け取り、人の目で理解できる形でアラートボックスを表示します。
  * [uu.log()](uu_log.md) は オブジェクトまたは、フォーマット文字列と幾つかの引数を受け取り、人の目で理解できる形で画面に追記します。

# Unit Test #
  * [uu.ok()](uu_ok.md) は ユニットテストを実行し結果をストックします。引数なしで呼び出すと結果を画面に一覧表示し、スコア(ok, ng, total, ms)を返します。
  * [uu.ng()](uu_ng.md) は C言語の assert() 相当の機能です。assert() と\*違い\*比較結果が偽なら例外を発生させます。

# Other #
  * [uu.nop()](uu_nop.md) は 何もしない関数です。

# Cross Browser #
## ECMAScript-262 5th edition ##
ES5(ECMAScript-262 5th edition)で追加された機能の一部が、IE6などのレガシーな環境でも利用できます。

  * Array#map(), Array#some(), Array#every(), Array#filter(), Array#forEach(), Array#indexOf(), Array#lastIndexOf(), Array#reduce(), Array#reduceRight() が利用できます。
  * Boolean#toJSON(), Date#toISOString(), Date#toJSON(), Number#toJSON(), String#toJSON() が利用できます。
  * String#trim() が利用できます。

**IEや古いブラウザでは、Array.prototype, Boolean.prototype, Date.prototype, Number.prototype, String.prototype を拡張することでこれらのメソッドを実装しています。prototypeを拡張しているため、Arrayをfor in ループでループさせると、forEach メソッドなどが列挙されてしまいます。ご注意ください。**

## Extends ##
IE 発祥で Firefox だけがサポートしていない HTMLElement#innerText と HTMLElement#outerHTML を利用できます。
  * HTMLElement#innerText が利用できます。オーバーヘッドが気になる場合は innerText ではなく textContent を利用してください。
  * HTMLElement#outerHTML が利用できます。

## getComputedStyle ##
  * uu.css(node) または uu.css(node, true) により、IE でも getComputedStyle() 相当の情報を取得できます。
  * uu.json() は window.JSON 互換性のある結果を取得できます。また window.JSON が本来サポートしていない Function や Node なども理解するため人間が理解しやすい形でオブジェクトの情報を出力できます。