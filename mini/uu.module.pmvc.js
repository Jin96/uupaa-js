(function(){var B=window,A=B.uu;A.module.pmvc=function(){};A.module.pmvc.applicationModel=A.basicClass();A.module.pmvc.domainModel=A.basicClass();A.module.pmvc.controller=A.basicClass();A.module.pmvc.view=A.basicClass();A.forEach({construct:function(C){this.id=C;this.catalog={ping:"_ping"};A.msgpump.set(this.id,this);this.activate()},regist:function(C){var D=this;A.forEach(C,function(E,F){D.catalog[F]=F;D[F]=E})},registArias:function(C){var D=this;A.forEach(C,function(F,E){if(!(F in D.catalog)){throw TypeError("uu.module.pmvc::registArias(catalog) no unsubstantial")}D.catalog[E]=F})},activate:function(){this.permit=1},deactivate:function(){this.permit=0},procedure:function(E,D,C){if(!this._hook(E,D,C)||!this.permit){return false}if(!(E in this.catalog)){return this._unknown(E,D,C)}return this[this.catalog[E]].call(this,E,D,C)
},_ping:function(E,D,C){alert(this.id+" - alive")},_hook:function(E,D,C){return true},_unknown:function(E,D,C){return true}},function(C,D){A.module.pmvc.applicationModel.prototype[D]=C;A.module.pmvc.domainModel.prototype[D]=C;A.module.pmvc.controller.prototype[D]=C;A.module.pmvc.view.prototype[D]=C});A.module.pmvc.activate=function(){A.app=new A.module.pmvc.applicationModel("A");A.domain=new A.module.pmvc.domainModel("D");A.view=new A.module.pmvc.view("V");A.ctrl=new A.module.pmvc.controller("C")}})();