

# 導入 #

uu.url は URL や QueryString をパースし、ビルドする機能を提供します。

uu.url を利用するには以下のファイルが必要です。
  * src/misc/url.js

src/misc/url.js をロードすると、以下の関数が追加されます。
  * uu.url
  * uu.url.abs
  * uu.url.dir
  * uu.url.split
  * uu.url.query


# API #

## uu.url ##

uu.url(_url_:URLHash/URLString = ""):URLString/URLHash/null は、
_url_ を受け取り、URLString または URLHash を返します。URL として無効な URLHash や URLString を受け取った場合は null を返します。

  * _url_ が 空文字列なら、現在のページの絶対ディレクトリパスの URLString を返します。
  * _url_ が URLHash なら、URLHash から URL を構築し、URLString を返します。
  * _url_ が URLString なら、URLString を URLHash に分解し返します。
```
    uu.url() -> "http://example.com/index.htm"
    uu.url("http://example.com/dir/file.ext") -> { schme: "http", ... }
    uu.url({ schme: "http", ... }) -> "http://example.com/..."
```

## uu.url.abs ##

uu.url.abs(_url_:URLString = ".", _currentDir_ = ""):URLString は、_url_ を絶対ディレクトリパスに変換し返します。
_url_ が相対パスで、_currentDir_ が与えられた場合は、_currentDir_ を基準としたディレクトリパスを返します。
```
    uu.url.abs("./index.htm") -> "http://example.com/index.htm"
```

## uu.url.dir ##

uu.url.dir(_url_:URLString/PathString):String は _url_ を受け取り、ファイル名.拡張子を切り落とした、ディレクトリパス部分を返します。
返される文字列は必ず "/" で終わります。
```
    uu.url.dir("http://example.com/dir/file.ext") -> "http://example.com/dir/"
    uu.url.dir("/root/dir/file.ext")              -> "/root/dir/"
    uu.url.dir("/file.ext")                       -> "/"
    uu.url.dir("/")                               -> "/"
    uu.url.dir("")                                -> "/"
```

## uu.url.split ##

uu.url.split(_url_:URLString/PathString):Array は、URL または パス文字列を受け取り、ディレクトリ部分とファイル名.拡張子の部分に分割した配列を返します。

```
    uu.url.split("http://example.com/dir/file.ext") -> ["http://example.com/dir/", "file.ext"]
```

## uu.url.query ##

uu.url.query(_queryString_:QueryString/Hash, _add_:Hash):QueryString/Hash は、
QueryString のパース、ビルド、追加を行います。

各要素は、アンパサンド( `&` ) ではなく セミコロン( ; ) で結合します。

  * _add_ が指定されると、_queryString_ に追加し、QueryString を返します。
  * _queryString_ が文字列ならパースし、Hash を返します。
  * _queryString_ が Hash ならビルドし、QueryString を返します。

```
    uu.url.query("key=val;key2=val2")              -> { key: "val", key2: "val2" }
    uu.url.query({ key: "val",     key2: "val2" }) -> "key=val;key2=val2"
    uu.url.query( "key=val",     { key2: "val2" }) -> "key=val;key2=val2"
    uu.url.query({ key: "val" }, { key2: "val2" }) -> "key=val;key2=val2"
```

<a href='Hidden comment: 
= Test Code =
* http://uupaa-js.googlecode.com/svn/trunk/0.8/test/misc/url.htm
'></a>

# TYPES #

uu.url.js で登場する型の一覧です。

```
    URLString = "scheme://domain[:port][/path][?query#fragment]"

    URLHash = {
        url      - AbsoluteURLString: "http://example.com:8080/dir/file.ext?query=string;more=value#fragment"
        scheme   - SchemeString:      "http"                           or "https", "file"
        domain   - DomainNameString:  "example.com"
        port     - PortNumberString:  "8080"                           or ""
        base     - BaseURLString:     "http://example.com:8080/dir/"
        path     - PathString:        "/dir/file.ext"                  or "/"
        dir      - DirString:         "/dir/"                          or "/"
        file     - FileNameString:    "file.ext"                       or ""
        query    - QueryString:       "query=string;more=value"        or ""
        hash     - QueryStringHash:   { query: "string", more: "value" } or {}
        fragment - FragmentString:    "fragment"                       or ""
    }

    QueryString = "query=string;more=value"

    QueryStringHash = { query: "string", more: "value" }
```