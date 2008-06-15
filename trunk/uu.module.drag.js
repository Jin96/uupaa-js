/** <b>Drag and Drop Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module.drag = function() {
};

/** <b>ブロック要素をドラッグで自由に移動可能にする(Free Drag and Drop)</b>
 *
 * @class
 */
uu.module.drag.free = uu.basicClass();
uu.module.drag.free.prototype = {
  /** <b>初期化</b>
   *
   * @param element   elm               - ドラッグする要素を指定します。
   * @param hash      [param]           - パラメタの指定です。
   * @param bool      [param.ghost]     - ゴーストエフェクト(fade)を使用する場合にtrueにします。デフォルトはtrueです。
   * @param string    [param.msgto]     - メッセージの受取先を指定します。""を指定するとメッセージを送信しません。
   *                                    "broadcast"を指定するとブロードキャストになります。デフォルトは""です。
   * @param function  [param.msgFilter] - 送信するメッセージを絞り込むフィルターを指定します。
   *                                      msgFilter(メッセージ名) の形で呼ばれ、falseに評価される値を返すとメッセージは送信されません。
   *                                      デフォルトはundefinedです。
   * @param bool      [param.resize]    - ホイールでリサイズする場合にtrueにします。<br />
   *                                      デフォルトは、trueです。
   */
  construct: function(elm, param /* = {} */) {
    this.elm = elm;
    this.param = uu.mix.param(param || {}, {
      ghost: true, cursor: "move",
      opacity: uu.css.get.opacity(this.elm),
      msgto: "", msgFilter: uu.echo, resize: true,
      _x: 0, _y: 0, _dragging: false
    });

    uu.ui.element.toAbsolute(this.elm);
    this.elm.style.cursor = this.param.cursor;

    // ghost effect. 見えない状態から本来の不透明度に戻す
    this.param.ghost && uu.effect.fadein(this.elm, { begin: 0, end: 1.0 });

    // z-index初期化
    this.zindexer = new uu.module.drag.zindexer();
    this.zindexer.set(this.elm.id);

    // EventHandler
    this.hr = uu.event.handler(this);
    uu.event.set(this.elm, "mousedown,mousewheel", this.hr);
  },
  /** <b>後処理</b> */
  destruct: function() {
    try {
      this.zindexer.unset(this.elm.id);
      uu.event.unset(this.elm, "mousedown,mousewheel", this.hr);
    } catch (e) {}
  },
  /** <b>イベントハンドラ</b> */
  handleEvent: function(evt) {
    var type = uu.event.type(evt.type);
    uu.event.stop(evt); // イベントバブルの停止(+テキストの選択を抑止)
    switch (type) {
    case "mousedown": uu.event.set(uu.ua.ie ? this.elm : uud, "mousemove,mouseup", this.hr, true); break;
    case "mouseup": uu.event.unset(uu.ua.ie ? this.elm : uud, "mousemove,mouseup", this.hr, true); break;
    }
    switch (type) {
    case "mousedown":
    case "mousemove":
    case "mouseup":
    case "mousewheel":
      this[type](evt);
      this.param.msgto && uu.msgpump && this.param.msgFilter(type) &&
        uu.msgpump.post(this.param.msgto, type, { sender: "uu.module.drag.free", element: this.elm });
      break;
    }
  },
  mousedown: function(evt) {
    var mpos = uu.event.mouse.pos(evt);
    // ドラッグ開始時のオフセット座標(マウス座標の絶対値 - ドラッグターゲットの原点座標)と不透明度を保存する
    this.param._x = mpos.x - parseInt(this.elm.style.left);
    this.param._y = mpos.y - parseInt(this.elm.style.top);
    this.dragging = true;
    this.zindexer.beginDrag(this.elm.id); // z-indexの更新
    this.param.ghost && uu.css.set.opacity(this.elm, 0.3); // 不透明度の設定
  },
  mousemove: function(evt) {
    if (!this.dragging) { return; }

    var mpos = uu.event.mouse.pos(evt);
    this.elm.style.left = parseInt(mpos.x - this.param._x) + "px";
    this.elm.style.top  = parseInt(mpos.y - this.param._y) + "px";
  },
  mouseup: function(evt) {
    if (!this.dragging) { return; }
    this.dragging = false;
    this.param.ghost && uu.effect.fadein(this.elm, { speed: "quick", end: 1.0 }); // 不透明度を戻す
    this.zindexer.endDrag(this.elm.id); // z-indexを戻す
  },
  mousewheel: function(evt) {
    if (!this.param.resize) { return; }
    var ss = uu.css.get(this.elm), wh = uu.event.mouse.state(evt).wheel * 2;
    uu.css.set(this.elm, { width:  (parseInt(ss.width)  + (wh * 2)) + "px",
                           height: (parseInt(ss.height) + (wh * 2)) + "px",
                           top:    (parseInt(ss.top)    - wh) + "px",
                           left:   (parseInt(ss.left)   - wh) + "px" });
  }
};

/** <b>Limited Drag and Drop</b>
 *
 * idとclass="draggable"を持つdiv要素がドラッグ移動可能となり、
 * class="droppable"を持つdiv要素にドロップ可能になります。
 * droppable以外の場所でドロップしようとすると、元の場所に戻します。
 *
 * @class
 */
uu.module.drag.limited = uu.basicClass();
uu.module.drag.limited.prototype = {
  /** <b>ドラッグ可能要素の列挙とイベントハンドラのアサイン</b>
   *
   * @param hash      [param]       - パラメタの指定です。
   * @param bool      [param.ghost] - ゴーストエフェクト(fade)を使用する場合にtrueにします。デフォルトはtrueです。
   * @param string    [param.msgto] - メッセージの受取先を指定します。""を指定するとメッセージを送信しません。
   *                                  "broadcast"を指定するとブロードキャストになります。デフォルトは""です。
   * @param function  [param.msgFilter] - 送信するメッセージを絞り込むフィルターを指定します。
   *                                      msgFilter(メッセージ名) の形で呼ばれ、falseに評価される値を返すとメッセージは送信されません。
   *                                      デフォルトはundefinedです。
   * @param bool      [param.resize]    - ホイールでリサイズする場合にtrueにします。<br />
   *                                      デフォルトは、trueです。
   * @param bool      [param.dropAllowColor] - ドロップ可能な要素の背景色の指定です。デフォルトは"bisque"です。
   */
  construct: function(param /* = {} */) {
    var me = this;
    this.elm = null; // drag target
    this.param = uu.mix.param(param || {}, {
      ghost: true, cursor: "move",
      msgto: "", msgFilter: uu.echo, resize: true,
      dropAllowColor: "bisque",
      _x: 0, _y: 0
    });

    this.draggable = uu.xpath.snap('//div[@class="draggable"]');
    this.droppable = uu.xpath.snap('//div[@class="droppable"]');
    this.zindexer = new uu.module.drag.zindexer(); // instantiate
    // ドラッグ可能要素にマウスカーソルとイベントハンドラを設定する
    me.hr = uu.event.handler(me);
    uu.forEach(this.draggable, function(v) {
      v.style.cursor = me.param.cursor;
      uu.event.set(v, "mousedown,mousewheel", me.hr);
    });
    // ドロップ可能要素の背景色と矩形を独自のプロパティとして保存する
    uu.forEach(this.droppable, function(v) {
      v._uu_drag_bgcolor = uu.css.get(v, "backgroundColor");
      v._uu_drag_rect = uu.ui.element(v);
    });
  },
  /** <b>後処理</b> */
  destruct: function() {
    var me = this;
    uu.forEach(this.draggable, function(v) {
      uu.event.unset(v, "mousedown,mousewheel", me.hr);
    });
  },
  /** <b>イベントハンドラ</b> */
  handleEvent: function(evt) {
    var type = uu.event.type(evt.type);
    uu.event.stop(evt); // イベントバブルの停止(+テキストの選択を抑止)
    switch (type) {
    case "mousedown":
      uu.event.set(uu.ua.ie ? uu.event.target(evt).real : uud, "mousemove,mouseup", this.hr, true);
      break;
    case "mouseup":
      uu.event.unset(uu.ua.ie ? this.elm : uud, "mousemove,mouseup", this.hr, true);
      break;;
    }
    switch (type) {
    case "mousedown":
    case "mousemove":
    case "mouseup":
    case "mousewheel":
      this[type](evt);
      this.param.msgto && uu.msgpump && this.param.msgFilter(type) &&
        uu.msgpump.post(this.param.msgto, type, { sender: "uu.module.drag.limited", element: this.elm });
      break;
    }
  },
  mousedown: function(evt) {
    this.elm = uu.event.target(evt).real; // ドラッグターゲットの設定
    var mpos = uu.event.mouse.pos(evt), // マウスの絶対位置を取得
        rect = uu.ui.element(this.elm); // screen offset
    // ドラッグ可能要素を絶対座標化
    uu.ui.element.toAbsolute(this.elm, { opacity: this.param.ghost ? 0.5 : 1.0 });
    uu.ui.element.toAbsolute(this.elm, { opacity: this.param.ghost ? 0.5 : 1.0 });

    // z-indexの管理を開始
    this.zindexer.set(this.elm.id); // z-index初期化
    this.zindexer.beginDrag(this.elm.id); // z-indexの更新
    // マウス座標と要素の左上とのオフセットを保存
    this.param._x = mpos.x - rect.x;
    this.param._y = mpos.y - rect.y;
  },
  mousemove: function(evt) {
    var mpos = uu.event.mouse.pos(evt);
    uu.css.set(this.elm, { left: mpos.x - this.param._x + "px",
                           top:  mpos.y - this.param._y + "px" });
    this.inDroppableRect(mpos);
  },
  mouseup: function(evt) {
    // ドラッグ可能要素を静的座標化
    uu.css.set(this.elm, { position: "static", left: 0, top: 0, opacity: 1.0 });

    // z-indexの管理を終了
    this.zindexer.endDrag(this.elm.id);
    this.zindexer.unset(this.elm.id);

    // droppable要素にドロップ可能かを判断する
    var e = this.inDroppableRect(uu.event.mouse.pos(evt));
    if (e) {
      this.drop(e, this.elm);
    }
  },
  mousewheel: function(evt) {
    if (!this.param.resize) { return; }
    var ss = uu.css.get(this.elm), wh = uu.event.mouse.state(evt).wheel * 2;
    uu.css.set(this.elm, { width:  (parseInt(ss.width)  + (wh * 2)) + "px",
                           height: (parseInt(ss.height) + (wh * 2)) + "px",
                           top:    (parseInt(ss.top)    - wh) + "px",
                           left:   (parseInt(ss.left)   - wh) + "px" });
  },
  /** ドロップ時のアクション: */
  drop: function(droppable, draggable) {
    // 先客がいるならドロップ失敗
    if (!uu.xpath('count(./div[@class="draggable"])', droppable)) {
      if (droppable.hasChildNodes()) {
        droppable.insertBefore(draggable, droppable.firstChild); // droppable.lastChild
      } else {
        droppable.appendChild(draggable);
      }
      this.param.msgto && uu.msgpump && this.param.msgFilter("drop") &&
        uu.msgpump.post(this.param.msgto, "drop", { sender: "uu.module.drag.limited", element: this.elm });
    }
  },
  /** ドロップ可能領域内なら背景色を差し替え: */
  inDroppableRect: function(mpos) {
    var rv = null, bg = this.param.dropAllowColor;
    uu.forEach(this.droppable, function(v) {
      if (uu.ui.inRect(v._uu_drag_rect, mpos)) {
        v.style.backgroundColor = bg;
        rv = v;
        return;
      }
      v.style.backgroundColor = v._uu_drag_bgcolor;
    });
    return rv;
  }
};

/** <b>ドラッグオブジェクトのz-indexを管理</b>
 *
 * @class
 */
uu.module.drag.zindexer = uu.singletonClass();
uu.module.drag.zindexer.prototype = {
  /** <b>初期化</b> */
  construct: function() {
    this.obj = {};              // 登録済みのドラッガブルオブジェクト
    this.boost_zIndex = 1000;   // ドラッグ中のオブジェクトに一時的に設定されるz-index
    this.default_zIndex = 20;   // 初期オブジェクトの階層z-index
  },
  /** <b>IDの登録と適切なz-indexの設定</b>
   *
   * @param string id       z-indexを管理する要素のIDを指定します。
   */
  set: function(id) {
    if (id in this.obj) {
      if (uu.config.debug) { throw Error("duplicate id: " + id); }
      return;
    }
    this.obj[id] = uu.id(id);
    this.obj[id].style.zIndex = ++this.default_zIndex;
  },
  /** <b>IDの抹消</b>
   * 
   * @param string id       set()で登録済みのIDを指定します。
   */
  unset: function(id) {
    if (!(id in this.obj)) {
      if (uu.config.debug) { throw Error("unknown id: " + id); }
      return;
    }
    delete this.obj[id];
    --this.default_zIndex;
  },
  /** <b>ドラッグ開始通知</b>
   *
   * @param string id       set()で登録済みのIDを指定します。
   */
  beginDrag: function(id) {
    if (!(id in this.obj)) {
      if (uu.config.debug) { throw Error("unknown id: " + id); }
      return;
    }
    var base = this.obj[id].style.zIndex;
    this.obj[id].style.zIndex = this.boost_zIndex + 1;

    // 毎回ソートするのではなく、
    // ある値(閾値)を越えた時点でガベージ的にソートを行えば速度向上も可能。
    uu.forEach(this.obj, function(v) {
      if (v.style.zIndex > base) { // baseより大きければ-1
        v.style.zIndex -= 1;
      }
    });
  },
  /** <b>ドラッグ終了通知</b>
   *
   * @param string id       set()で登録済みのIDを指定します。
   */
  endDrag: function(id, opacity) {
    if (!(id in this.obj)) {
      if (uu.config.debug) { throw Error("unknown id: " + id); }
      return;
    }
    this.obj[id].style.zIndex = this.default_zIndex; // 最上位に移動
  }
};

/* Drag and Drop skeleton code
 *
 * <code>
 *  uu.module.example = uu.basicClass();
 *  uu.module.example.prototype = {
 *    construct: function(elm) {
 *      this.elm = elm;
 *      this.hr = uu.event.handler(this);
 *      uu.event.set(this.elm, "mousedown,mousewheel", this.hr);
 *    },
 *    destruct: function() {
 *      uu.event.unset(this.elm, "mousedown,mousewheel", this.hr);
 *    },
 *    handleEvent: function(evt) {
 *      switch (evt.type) {
 *      case "DOMMouseScroll":
 *      case "mousewheel":
 *        this.mousewheel(evt);
 *        uu.event.stop(evt);
 *        break;
 *      case "mousedown":
 *        uu.event.set(uu.ua.ie ? this.elm : uud, "mousemove,mouseup", this.hr, true);
 *        uu.event.stop(evt);
 *        this.mousedown(evt);
 *        break;
 *      case "mousemove":
 *        uu.event.stop(evt);
 *        this.mousemove(evt);
 *        break;
 *      case "onlosecapture":
 *      case "mouseup":
 *        uu.event.unset(uu.ua.ie ? this.elm : uud, "mousemove,mouseup", this.hr, true);
 *        uu.event.stop(evt);
 *        this.mouseup(evt);
 *        break;
 *      }
 *    },
 *    mousewheel: function(evt) { ... },
 *    mousedown: function(evt) { ... },
 *    mousemove: function(evt) { ... },
 *    mouseup: function(evt) { ... }
 *  };
 * </code>
 */

})(); // end (function())()
