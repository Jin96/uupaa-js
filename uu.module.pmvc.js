/** <b>Pluggable MVC Module</b>
 *
 * @author Takao Obara
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 */
(function() { var /* uud = document, */ uuw = window, uu = uuw.uu;

/** Pluggable MVC - Application Model
 *
 * @class
 */
uu.module.pmvc.applicationModel = uu.basicClass();

/** Pluggable MVC - Domain Model
 *
 * @class
 */
uu.module.pmvc.domainModel = uu.basicClass();

/** Pluggable MVC - controller
 *
 * @class
 */
uu.module.pmvc.controller = uu.basicClass();

/** Pluggable MVC - View
 *
 * @class
 */
uu.module.pmvc.view = uu.basicClass();

uu.forEach({
  construct: function(id, permit /* = 0x3 */, systemMethod /* = {} */, applicationMethod /* = {} */) {
    this.id = id;
    this.permit = permit || 0x3;
    this.method.sys = systemMethod || {};
    this.method.app = applicationMethod || {};
    (new uu.module.msgpump()).set(this.id, this);
  },
  id: "",
  permit: 0, // permit message routing: 0x0=deny, 0x1=allow sys msg, 0x2=allow app msg,0x3=both
  method: { sys:{}, app:{} },
  /** 処理 */
  procedure: function(msg, param1, param2) {
    var rv = false;
    if (!this._beforeHook(msg, param1, param2)) { return false; }
    rv = this._routing(msg, param1, param2);
    if (!this._afterHook(msg, param1, param2)) { return false; }
    return rv;
  },
  /** メッセージの配送 */
  _routing: function(msg, param1, param2) {
    var m = this.method, p = this.permit;
    if (msg in m.sys) { return (p.sys) ? m.sys[msg].call(this, msg, param1, param2) : false; }
    if (msg in m.app) { return (p.app) ? m.app[msg].call(this, msg, param1, param2) : false; }
    return this._unknown(msg, param1, param2);
  },
  _beforeHook:  function(msg, param1, param2) { return true; }, // falseでルーティング終了
  _afterHook:   function(msg, param1, param2) { return true; }, // falseでルーティング終了
  _unknown:     function(msg, param1, param2) { return true; }  // 未知のメッセージ用ハンドラ
}, function(v, p) {
  uu.module.pmvc.applicationModel.prototype[p] = v;
  uu.module.pmvc.domainModel.prototype[p] = v;
  uu.module.pmvc.controller.prototype[p] = v;
  uu.module.pmvc.view.prototype[p] = v;
});

/* activate method */
uu.module.pmvc.activate = function() {
  uu.app    = new uu.module.pmvc.applicationModel("A");
  uu.domain = new uu.module.pmvc.domainModel("D");
  uu.view   = new uu.module.pmvc.view("V");
  uu.ctrl   = new uu.module.pmvc.controller("C");
};

})(); // end (function())()
