/** <b>Pluggable MVC Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var /* uud = document, */ uuw = window, uu = uuw.uu;

/** <b>Pluggable MVC</b>
 *
 * @class
 */
uu.module.pmvc = function() {
};

/** <b>Pluggable MVC - Application Model</b>
 *
 * @class
 */
uu.module.pmvc.applicationModel = uu.basicClass();

/** <b>Pluggable MVC - Domain Model</b>
 *
 * @class
 */
uu.module.pmvc.domainModel = uu.basicClass();

/** <b>Pluggable MVC - controller</b>
 *
 * @class
 */
uu.module.pmvc.controller = uu.basicClass();

/** <b>Pluggable MVC - View</b>
 *
 * @class
 */
uu.module.pmvc.view = uu.basicClass();

uu.forEach({
  /** @scope uu.module.pmvc.controller */

  /** <b>初期化</b>
   *
   * @param string id       - ユニークなID(メッセージ配達用のアドレス)を指定します。
   */
  construct: function(id) {
    this.id = id;
    this.catalog = { ping: "_ping" }; // msg-name: function-name
    uu.msgpump.set(this.id, this);
    this.activate();
  },
  /** <b>メッセージとハンドラの登録</b>
   *
   * @param hash handler - hash { msg, function() { ... }, ... } を指定します。
   *                       msgで指定したメッセージが到着すると、
   *                       functionで指定した関数が呼ばれます。
   */
  regist: function(handler) {
    var me = this;
    uu.forEach(handler, function(fn, msg) {
      me.catalog[msg] = msg; // 実名で登録
      me[msg] = fn;
    });
  },
  /** <b>エリアスメッセージカタログの登録</b>
   *
   * メッセージの別名を登録します。
   *
   * @param hash catalog - エリアス(別名)とメッセージ(実体)のカタログです。
   *                       hash { alias, msg, ... } の形で指定します。
   *                       aliasで指定したメッセージが到着すると、
   *                       msgとリンクしているハンドラが呼ばれます。
   * @throws TypeError "uu.module.pmvc::registArias(catalog) no unsubstantial" 実体が無い
   */
  registArias: function(catalog) {
    var me = this;
    uu.forEach(catalog, function(msg, alias) {
      if (!(msg in me.catalog)) { // 実体が無い
        throw TypeError("uu.module.pmvc::registArias(catalog) no unsubstantial");
      }
      me.catalog[alias] = msg; // { msg-name(alias): function-name }
    });
  },
  /** <b>活性化</b>
   * メッセージの受け取りを開始します。
   */
  activate: function() {
    this.permit = 0x1;
  },
  /** <b>不活性化</b>
   * メッセージの受け取りを停止します。
   */
  deactivate: function() {
    this.permit = 0x0;
  },
  /** <b>メッセージの受信とハンドラの呼び出し</b>
   *
   * @param string msg   - メッセージの名前を指定します。
   * @param mix [param1] - 引数を指定します。
   * @param mix [param2] - 引数を指定します。
   * @return bool - 呼び出し成功でtrue, 失敗でfalseを返します。
   */
  procedure: function(msg, param1, param2) {
    if (!this._hook(msg, param1, param2) || !this.permit) { return false; }
    if (!(msg in this.catalog)) { return this._unknown(msg, param1, param2); }
    return this[this.catalog[msg]].call(this, msg, param1, param2);
  },
  _ping:    function(msg, param1, param2) { alert(this.id + " - alive"); },
  _hook:    function(msg, param1, param2) { return true; }, // falseでルーティング終了
  _unknown: function(msg, param1, param2) { return true; }  // 未知のメッセージ用ハンドラ
}, function(v, p) {
  uu.module.pmvc.applicationModel.prototype[p] = v;
  uu.module.pmvc.domainModel.prototype[p] = v;
  uu.module.pmvc.controller.prototype[p] = v;
  uu.module.pmvc.view.prototype[p] = v;
});

/* activate primary instance */
uu.module.pmvc.activate = function() {
  uu.app    = new uu.module.pmvc.applicationModel("A");
  uu.domain = new uu.module.pmvc.domainModel("D");
  uu.view   = new uu.module.pmvc.view("V");
  uu.ctrl   = new uu.module.pmvc.controller("C");
};

})(); // end (function())()
