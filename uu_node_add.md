

# 導入 #

uu.node.add は指定されたコンテキスト(ノード)にノードを追加します。uu.add は uu.node.add の alias です。

# API #

## uu.node.add ##
## uu.add ##
uu.node.add(_source_:Node/NodeArray/DocumentFragment/HTMLFragmentString/TagName = "div", _context_:Node = `<body>`, _position_:Number/String = "./last"):Node は、_source_ で指定されたノードを _context_ ノードに追加(または挿入)し、追加したノードを返します(複数のノードを一度に追加した場合は、最初に追加したノード(先頭のノード)を返します)。追加する位置は、_position_ で指定します。

_source_ に NodeArray を指定すると、指定されたノードを全て追加します。
_source_ に DocumentFragment を指定すると、DocumentFragment 内の全てのノードを追加します。
_source_ に文字列( HTMLFragmentString )を指定すると、文字列からノードを生成し追加します。
_source_ にタグ文字列を `<` と `>` なしで指定すると、指定されたタグ(要素)を生成し追加します。
_context_ を省略すると `<body>` に要素を追加します。
_position_ には数値または文字列で挿入位置を指定します。
| "first"   | contextNode と同じ階層の先頭(firstSibling)に _source_ を挿入します(長男にします) |
|:----------|:------------------------------------------------------------|
| "prev"    | contextNode の前(prevSibling)に _source_ を挿入します(一つ兄にします)       |
| "next"    | contextNode の次(nextSibling)に _source_ を挿入します(一つ弟にします)       |
| "last"    | contextNode と同じ階層の末尾(lastSibling)に _source_ を追加します(末弟にします)  |
| "./first" | contextNode の最初の子として _source_ を挿入します                        |
| "./last"  | contextNode の最後の子として _source_ を追加します                        |

数値を指定した場合は、_source_ が、contextNodeと同じ階層にある _position_ 番目の要素になります(コメントノードはカウントしません)。指定した数値が children.length より大きな場合は、末尾に要素を追加します(appendChild)。

```
<div id="parentNode">

    <div id="firstSibling">    first(0)   </div>
    <div id="prevSibling">     prev(1)    </div>
    <ul id="contextNode">(2)
        <li id="firstChild">  ./first(./0) </li>
        <li>(./1)</li>
        <li id="lastChild">   ./last(./2)  </li>
    </ul>
    <div id="nextSibling">     next(3)    </div>
    <div id="lastSibling">     last(4)    </div>

</div>
```
# 用例 #
```
[1][add div node to body]     uu.node.add()         -> <div />  (div.parentNode = <body>)
[2][add p tag to body]        uu.node.add("p")      -> <p />    (p.parentNode = <body>)
[3][add Node to body]         uu.node.add(uu.div()) -> <div />  (div.parentNode = <body>)
[4][add NodeArray to context] uu.node.add([<link>, <link>], document.head) -> <link/> (link.parentNode = <head>)
[5][add HTMLFragmentString]   uu.node.add("<div><p>txt</p></div>") -> <div> (div.parentNode = <body>)
[6][add DocumentFragment]     uu.node.add(DocumentFragment)        -> <?>
[7][insert tr and tds]        uu.node.add(uu.tr(uu.td("A"), uu.td("B")), uu.id("ctx"), "prev") -> <tr>
            <table>
                <tr id="ctx"><td>C></td><td>D</td></tr>
            </table>
                   v
            <table>
                <tr><td>A></td><td>B</td></tr>
                <tr id="ctx"><td>C></td><td>D</td></tr>
            </table>
```

7番目の例は、uu.node.add() で `<tr><td>A</td><td>B</td></tr>` を追加する例です。
同様の機能にuu.node.bulk() があります。
uu.node.add は文字列からノードを作成する処理で内部的に、uu.node.bulk() を呼び出しますが、uu.node.bulk() は tr や td を文字列から作成できないため、文字列からテーブルの内容を生成せず、代わりに uu.node.add() と uu.tr(), uu.td() を使います。

# Test Code #
```
<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8" />
<title>uu.node.add(TableHTMLFragment)</title>
<style></style>
<script src="../../src/uupaa.js"></script>
<script>
uu.ready(function(uu, doc) {
    var tr = uu.id("xx"); // <tbody><tr id='xx'>...</tr></tbody>


 // uu.add("<tr><td>A</td><td>B</td></tr>", tr, "prev"); → エラー
    uu.add(uu.tr(uu.td("A"), uu.td("B")), tr, "prev");
});
</script>
</head><body>

<table>
<tr id='xx'><td>C</td><td>D</td></tr>
</table>

</body></html>
```

```
<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8" />
<title>uu.node.add(NodeArray)</title>
<style>
.div1 { background-color: #111; color: white; }
.div2 { background-color: #333; color: white; }
.div3 { background-color: #555; color: white; }
#contextNode { background-color: blue; }
</style>
<script src="../../src/uupaa.js"></script>
<script>
uu.ready(function(uu, doc) {
    var nodeArray = [uu.div({ "class": "div1" }, "div1"),
                     uu.div({ "class": "div2" }, "div2"),
                     uu.div({ "class": "div3" }, "div3")];
    var ctx = uu.id("contextNode");

    var pos = [
        "first", "prev", "./first", "./last", "next", "last"
    ];

//    uu.add(nodeArray, ctx, pos[3]);
    uu.add(nodeArray, ctx, 4);
});
</script></head><body>

<div id="parentNode">

    <div id="firstSibling">    first(0)   </div>
    <div id="prevSibling">     prev(1)    </div>
    <ul id="contextNode">(2)
        <li id="firstChild">  ./first(.0) </li>
        <li>(.1)</li>
        <li id="lastChild">   ./last(.2)  </li>
    </ul>
    <div id="nextSibling">     next(3)    </div>
    <div id="lastSibling">     last(4)    </div>

</div>
</body></html>
```