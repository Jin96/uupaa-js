

# 導入 #

uu.node.normalize は指定されたノード以下から、空行だけのノードやコメントノードを除去します。

# API #

## uu.node.normalize ##

uu.node.normalize(_parent_:Node = `<body>`, _depth_:Number = 1):Number は、_parent_ 以下のノードを辿り、空行やコメントノードを検索し、まとめて除去します。
最大何階層まで辿るかは、_depth_ で指定します。_depth_ に 1 を指定すると、_parent_ の childNode だけが検索対象になります。
`<body>`以下の全てのノードを検索対象とする場合は、uu.node.normalize(document.body, 999) のように十分に大きな数を指定します。

# Test Code #
http://uupaa-js.googlecode.com/svn/trunk/0.8/test/core/node.normalize.htm

```
<!doctype html><html><head><title></title>
<script src="../../src/uupaa.js"></script>
<script src="../../src/node/normalize.js"></script>
<script>
uu.ready(function(uu) {
    var beforeNode = uu.text(document.body.outerHTML);

    var removed = uu.node.normalize(document.body, 10); // 10階層まで

    var afterNode = uu.text(document.body.outerHTML);

    uu.body( uu.br(), "--------------------", uu.br() );
    uu.body( uu.h1("before"), beforeNode );
    uu.body( uu.br(), "--------------------", uu.br() );
    uu.body( uu.h1("after"), afterNode );
    uu.body( uu.h2("removed node count=" + removed) );
});
</script>
</head><body>
<!-- first comment node -->
<h1>H1</h1>
<!-- second comment node -->
<p>
</p>
<div>
    <p>
        a
    </p>

    <p> b
    </p>
</div>
</body></html>
```

## 実行結果 ##
実行結果はブラウザ毎に異なります。

  * Firefox3.6
```
H1

a

b

--------------------
before
<body> <!-- first comment node --> <h1>H1</h1> <!-- second comment node --> <p> </p> <div> <p> a </p> <p> b </p> </div> </body>
--------------------
after
<body><h1>H1</h1><p></p><div><p> a </p><p> b </p></div></body>
removed node count=12
```
  * Google Chrome 5
```
H1

a

b


--------------------
before

<body> <!-- first comment node --> <h1>H1</h1> <!-- second comment node --> <p> </p> <div> <p> a </p> <p> b </p> </div> </body>
--------------------
after

<body><h1>H1</h1><p></p><div><p> a </p><p> b </p></div></body>
removed node count=13
```
  * IE8
```
H1

a

b


--------------------

before
<BODY data-uuguid="7"><!-- first comment node -->
<H1 data-uuguid="8">H1</H1><!-- second comment node --><P data-uuguid="9"></P>
<DIV data-uuguid="10"><P data-uuguid="11">a </P>
<P data-uuguid="12">b </P></DIV></BODY>
--------------------

after
<BODY data-uuguid="7"><H1 data-uuguid="8">H1</H1><P data-uuguid="9"></P>
<DIV data-uuguid="10"><P data-uuguid="11">a </P>
<P data-uuguid="12">b </P></DIV></BODY>
removed node count=2
```
  * Opera10.52
```
H1


a

b

--------------------
before
<BODY> <!-- first comment node --> <H1>H1</H1> <!-- second comment node --> <P> </P> <DIV> <P> a </P> <P> b </P> </DIV> </BODY>
--------------------
after
<BODY><H1>H1</H1><P></P><DIV><P> a </P><P> b </P></DIV></BODY>
removed node count=13
```