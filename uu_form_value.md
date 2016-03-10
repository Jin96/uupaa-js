

uu.form.value() は、フォーム要素への value 属性へのアクセスを簡単にします。

NodeSet.value() は カレントノードセット全てで、uu.form.value() を実行します。

  * uu.form.value(_node_) で value 属性の値の取得か、現在選択されている要素(checked, selected)を取得します。
  * uu.form.value(_ndoe_, _"value"_) で value 属性の値を設定するか、要素の選択状態をセット/リセットします。
  * uu(_CSSSelector_).value() は、uu.form.value() を実行し StringArray を返します。
  * uu(_CSSSelector_).value(_value_)) は、uu.form.value(_value_) を実行し NodeSet を返します。

# `<`textarea`>` #
uu.form.value(_textareaNode_:Node, _value_:String = void):String/Node は、_textareaNode_.value 属性にアクセスします。

uu.form.value(_textareaNode_) で value 属性の値を取得し、uu.form.value(_textareaNode_, "value") で値を設定し、_textareaNode_ を返します。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("textarea")[0];

    // set uu.form.value()
    uu.form.value(node, "new value");

    // get uu.form.value
    uu.puff(uu.form.value(node)); // "new value"

    // set NodeSet.value
    uu("textarea").value("aa");

    // get NodeSet.value
    uu.puff(uu("textarea").value()); // ["aa", "aa"]
});
</script><body>

<div>
    <textarea>1</textarea>
    <textarea>2</textarea>
</div>

</body></html>
```

# `<`button`>` #
uu.form.value(_buttonNode_:Node, _value_:String = void):String/Node は、_buttonNode_.value 属性にアクセスします。

uu.form.value(_buttonNode_) で value 属性の値を取得し、uu.form.value(_buttonNode_, "value") で値を設定し、_buttonNode_ を返します。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("button")[0];

    // set uu.form.value()
    uu.form.value(node, "new value");

    // get uu.form.value
    uu.puff(uu.form.value(node)); // "new value"

    // set NodeSet.value
    uu("button").value("aa");

    // get NodeSet.value
    uu.puff(uu("button").value()); // ["aa", "aa"]
});
</script><body>

<div>
    <button value="1">1</button>
    <button value="2">2</button>
</div>

</body></html>
```

# `<`option`>` #
uu.form.value(_optionNode_:Node, _value_:String = void):String/Node は、_optionNode_.value 属性にアクセスします。

uu.form.value(_optionNode_) で value 属性の値を取得し、uu.form.value(_optionNode_, "value") で値を設定し、_optionNode_ を返します。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("option")[0];

    // set uu.form.value()
    uu.form.value(node, "new value");

    // get uu.form.value
    uu.puff(uu.form.value(node)); // "new value"

    // set NodeSet.value
    uu("option").value("aa");

    // get NodeSet.value
    uu.puff(uu("option").value()); // ["aa", "aa"]
});
</script><body>

<div>
    <select>
        <option value="1">text1</option>
        <option value="2">text2</option>
    </select>
</div>

</body></html>
```

# `<`input type="radio"`>` #
uu.form.value(_inputNode_:Node, _value_:String = void):String/Node は、_inputNode_.value や checked 属性にアクセスします。

uu.form.value(_inputNode_) で _inputNode_ と name属性の値が同じ要素を検索し、その中からチェックされている要素の value 属性の値を String で返します。

uu.form.value(_inputNode_, _findValue_) で _inputNode_ と name属性の値が同じ要素を検索し、_findValue_ と value 属性の値が\*一致する要素をチェック\*し、_inputNode_ を返します(value 属性の設定ではなく、checked 属性の値を設定します)。
_findValue_ と一致する値が存在しなければ\*何も選択されていない状態\*にします。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("input")[0]; // <input name="radioA" value="A1">

    // A3 check
    uu.form.value(node, "A3");

    // get check value
    uu.puff(uu.form.value(node)); // "A3"

    // A系をアンチェックにし + B2をチェック
    uu("#A,#B").value("B2");

    // get NodeSet.value
    uu.puff(uu("#A,#B").value()); // ["", "B2"]
});
</script><body>

<div>
    <input id="A"
           name="radioA" type="radio" value="A1" />A1
    <input name="radioA" type="radio" value="A2" />A2
    <input name="radioA" type="radio" value="A3" />A3
</div>
<div>
    <input id="B"
           name="radioB" type="radio" value="B1" />A1
    <input name="radioB" type="radio" value="B2" />A2
    <input name="radioB" type="radio" value="B3" />A3
</div>

</body></html>
```


# `<`input type="checked"`>` #
uu.form.value(_inputNode_:Node, _value_:String = void):String/Node は、_inputNode_.value や checked 属性にアクセスします。

uu.form.value(_inputNode_) で _inputNode_ と name属性の値が同じ要素を検索し、その中からチェックされている要素の value 属性の値を StringArray で返します。一つもチェックされていない場合は、空の配列( `[` `]` )を返します。

uu.form.value(_inputNode_, _findValue_ or `[`_findValue_, ...`]`) で _inputNode_ と name属性の値が同じ要素を検索し、_findValue_ と value 属性の値が\*一致する全ての要素をチェック\*し、_inputNode_ を返します(value 属性の設定ではなく、checked 属性の値を設定します)。
_findValue_ と一致しない値を持つ要素は全て\*アンチェック\*にします。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("input")[0]; // <input name="checkboxA" value="A1">

    // A2 をチェック
    uu.form.value(node, "A2"); // Stringで指定

    // A2 がアンチェックになり A4 と A5 がチェックされる
    uu.form.value(node, ["A4", "A5"]); // 配列で指定

    // get check value
    uu.puff(uu.form.value(node)); // ["A4", "A5"]

    // A系を全てアンチェックにし + B2 だけをチェック
    uu("#A,#B").value("B2");

    // get NodeSet.value
    uu.puff(uu("#A,#B").value()); // [ [], ["B2"] ] - それぞれの系列について配列が返る
});
</script><body>

<div>
    <input id="A"
           name="checkboxA" type="checkbox" value="A1" />A1
    <input name="checkboxA" type="checkbox" value="A2" />A2
    <input name="checkboxA" type="checkbox" value="A3" />A3
    <input name="checkboxA" type="checkbox" value="A4" />A4
    <input name="checkboxA" type="checkbox" value="A5" />A5
</div>
<div>
    <input id="B"
           name="checkboxB" type="checkbox" value="B1" />A1
    <input name="checkboxB" type="checkbox" value="B2" />A2
    <input name="checkboxB" type="checkbox" value="B3" />A3
</div>

</body></html>
```

# `<`input type="file"`>` #
uu.form.value(_inputNode_:Node, _value_:String = void):String/Node は、_inputNode_.value 属性にアクセスします。

uu.form.value(_inputNode_) で value 属性の値を取得します。値の設定はできません。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("input")[0]; // <input type="file" value"">

    uu.puff(uu.form.value(node)); // ""

    uu.puff(uu("input").value()); // ["", ""]
});
</script><body>

<div>
    <input type="file" value="" />
    <input type="file" value="" />
</div>

</body></html>
```


# `<`input type="text"`>` #
# `<`input type="image"`>` #
# `<`input type="button"`>` #
# `<`input type="hidden"`>` #
# `<`input type="submit"`>` #
# `<`input type="password"`>` #
uu.form.value(_inputNode_:Node, _value_:String = void):String/Node は、_inputNode_.value 属性にアクセスします。

uu.form.value(_inputNode_) で value 属性の値を取得し、uu.form.value(_inputNode_, "value") で値を設定し、_inputNode_ を返します。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var nodeList = uu.tag("input");

    // set values
    uu.form.value(nodeList[0], "new text value"); // <input type="text">
    uu.form.value(nodeList[1], "new image value"); // <input type="image">
    uu.form.value(nodeList[2], "new button value"); // <input type="button">
    uu.form.value(nodeList[3], "new hidden value"); // <input type="hidden">
    uu.form.value(nodeList[4], "new submit value"); // <input type="submit">
    uu.form.value(nodeList[5], "new password value"); // <input type="password">

    // get values
    uu.puff([                   // [
        uu.form.value(nodeList[0]),  //   "new text value",
        uu.form.value(nodeList[1]),  //   "new image value",
        uu.form.value(nodeList[2]),  //   "new button value",
        uu.form.value(nodeList[3]),  //   "new hidden value",
        uu.form.value(nodeList[4]),  //   "new submit value",
        uu.form.value(nodeList[5])   //   "new password value"
    ]);                         // ]

    // set values
    uu("input").value("new value");

    // get values
    uu.puff(uu("input").value());  // ["new value" x 6]
});
</script><body>

<div>
    <input type="text" value="text" />
    <input type="image" src="" value="" />
    <input type="button" value="button" />
    <input type="hidden" value="hidden" />
    <input type="submit" value="submit" />
    <input type="password" value="password" />
</div>

</body></html>
```

# `<`select`>` #
uu.form.value(_selectNode_:Node, _value_:String = void):String/Node は、現在選択されている option要素の value 属性にアクセスします。

uu.form.value(_selectNode_) で、現在選択されている option 要素の value 属性の値を取得します。
uu.form.value(_selectNode_, _findValue_) で、_selectNode.selected 属性を変更し、_findValue_と一致する option要素を 選択した状態にします。_

_findValue_ で指定された値が存在しない場合は、選択状態がリセットされます。
  * `<`option selected`>` が有れば、その項目が選択される。
  * `<`option selected`>` が無い場合は、size == 1 かどうかで結果が変化する。
    * size = 1 なら\*一番上の項目が選択\*される。
    * size = n なら\*未選択の状態\*になる。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("select")[0];

    // set selected
    uu.form.value(node, "value3");

    // get selected value
    uu.puff(uu.form.value(node)); // "value3"

    // set selected
    uu("select").value("value1");

    uu.puff(uu("select").value()); // ["value1", ""]
});
</script><body>

<div>
    <select>
        <option value="value1">text1</option>
        <option value="value2" selected="selected">text2</option>
        <option value="value3">text3</option>
    </select>
    <select>
        <option>text1</option>
        <option selected="selected">text2</option>
        <option>text3</option>
    </select>
</div>

</body></html>
```

# `<`select multiple="multiple"`>` #

uu.form.value(_selectNode_:Node, _value_:String = void):StringArray/Node は、現在選択されている option要素の value 属性にアクセスします。

uu.form.value(_selectNode_) で、現在選択されている option 要素の value 属性の値を StringArray( `[` "_selectedValue_", ... `]` ) で取得します。
uu.form.value(_selectNode_, _findValue_ or `[`_findValue_, ...`]`) で、_selectNode.selected 属性を変更し、_findValue_と一致する option要素を 選択した状態にします。_

_findValue_ で指定された値が存在しない場合は\*未選択状態\*になります。これは `<`select`>` と異なります。

```
<!doctype html><html><head><meta charset="UTF-8" />
<script src="../../src/uupaa.js"></script>
<script src="../../src/form/form.js"></script>
<script>
uu.ready(function(uu) {
    var node = uu.tag("select")[0];

// uu.form.value - one
    // set selected
    uu.form.value(node, "value1");

    // get selected value
    uu.puff(uu.form.value(node)); // ["value1"]

// uu.form.value - multi
    // set selected
    uu.form.value(node, ["value1", "value4"]);

    // get selected value
    uu.puff(uu.form.value(node)); // ["value1", "value4"]


// Node.value - one
    // set selected
    uu("select").value("value1");

    // get selected value
    uu.puff(uu("select").value()); // [ ["value1"], [] ]

// Node.value - multi
    // set selected
    uu("select").value(["value1", "value4"]);

    // get selected value
    uu.puff(uu("select").value()); // [ ["value1", "value4"], [] ]

});
</script><body>

<div>
    <select multiple="multiple" size="4">
        <option value="value1">text1</option>
        <option value="value2" selected="selected">text2</option>
        <option value="value3" selected="selected">text3</option>
        <option value="value4">text4</option>
    </select>
    <select multiple="multiple" size="4">
        <option>text1</option>
        <option selected="selected">text2</option>
        <option selected="selected">text3</option>
        <option>text4</option>
    </select>
</div>

</body></html>
```