

# 導入 #

uu.node.clone は指定されたノード以下のノードツリーを複製し返します。

Node.cloneNode(true) をクロスブラウザに対応させ、イベントハンドラの複製と、uu.data() で付与したノードデータのコピーを行います。

# API #

## uu.node.clone ##
uu.node.clone(_parent_:Node, _quick_:Boolean = _false_):Node は、_parent_ ノード以下のノードツリーを複製し返します。
_quick_ に true を指定すると _parent_ ノードをクローンし、イベントやノードデータのコピー等の特別な処理を行わずに _parent_ ノードのクローンを返します。
_quick_ に false を指定すると _parent_ ノード以下の子要素をクローンし、イベントハンドラの複製やノードデータのこピーを行います。

返される各ノードは
  * id, style, className 属性などの、主要な属性値がコピーされています。(その結果id属性が重複します)
  * 各ノードにはノードのユニークなID(nodeid)が付与されています。
    * uu.nodeid.toNode(nodeid)でnodeidからnodeを取得できます。
    * uu.nodeid(node)でnodeからnodeidを取得できます。
  * イベントがコピーされています。
    * [uu.event](uu_event.md)()でイベントが設定されている場合に限ります。
    * [uu.event.attach](uu_event.md)()によるイベントの設定や、ユーザがaddEventListenerにより独自に設定したイベントはコピーの対象外です。
    * node.onclick = function(){} などの DOM Level0 イベントハンドラはクローンされません。
  * `<input type="checkbox" checked="checked">` 等の、UIの状態も可能な限り引き継がれています。


```
<div id="source">
  <p>clone target</p>
</div>

alert(uu.node.clone(uu.id("source")).outerHTML);
    -> <div id="source"> <p>clone target</p> </div>
```

# Test Code #
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/node.clone.htm
```
<!doctype html><html><head><title></title>
<style>
#p, #checkbox, #radio, #password, #text {
    border: outset 3px #ccc;
}
</style>
<script src="../../src/uupaa.js"></script>
<script src="../../src/color/color.js"></script>
<script>
uu.ready(function() {
    function handler(evt) {
        var node = evt.currentTarget;

        if (evt.shiftKey) {
            uu.node.remove(node);
        } else {
            var clonedNode = uu.node.clone(node);

            node.parentNode.appendChild(clonedNode);
            var num = (Math.random() * 0xffffff) | 0;
            var colorHash = uu.color(num);
            clonedNode.style.backgroundColor = colorHash.hex;
            clonedNode.style.color = colorHash.comple().hex;
            clonedNode.firstChild.nodeValue = clonedNode.uniqueID || uu.guid();

        }
    }

    uu.event(uu.id("p"), "click", handler);
    uu.event(uu.id("checkbox"), "click", handler);
    uu.event(uu.id("radio"), "click", handler);
    uu.event(uu.id("password"), "click", handler);
    uu.event(uu.id("text"), "click", handler);
});
</script>
</head><body>
<h1>cloneNode test</h1>
<p>"click" -> cloneNode</p>
<p>shift + "click" -> removeNode</p>

<p id="p">click me</p>

<div id="checkbox">click me<input name="a" type="checkbox" value="1" /></div>
<div id="radio">click me<input name="b" type="radio" value="1" /><input name="b" type="radio" value="1" /></div>
<div id="password">click me(readonly)<input name="c" type="password" value="1" readonly="readonly" /></div>
<div id="text">click me(disabled)<input name="c" type="text" value="1" disabled="disabled" /></div>

</body></html>
```