

# uu.flash #
uu.flash(_url_:String, _id_:String, _option_:Hash = { allowScriptAccess: "always" }, _callback_:function):Node は`<object>`要素を生成し _url_ で指定された swf ファイルをロードし、生成した`<object>`要素を返します。ロード完了で\_callback\_を呼び出します。

_id_ には "external" の文字を必ず含めるようにしてください。

## option ##
option に指定可能なkey/valueの一覧です。
| key    | type          | default value | |
|:-------|:--------------|:--------------|:|
| allowScriptAccess | String        | "always"      | ActionScript から JavaScript へのアクセスを許可するか指定します |
| width  | String/Number | "100%"        | Flash を表示する大きさを指定します |
| height | String/Number | "100%"        | Flash を表示する大きさを指定します |
| parent | Node          | `<body>`      | `<object>`要素の親となる要素を指定します |

上記以外のkey/valueペアも指定可能です。