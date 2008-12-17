(function(){var B=document,C=window,A=C.uu;A.module.drag=function(){};A.module.drag.save=function(G,D){var E=A.event.mousePos(D),F=A.css.rect(G);G.uuSaveDragOffset={x:E.x-F.x,y:E.y-F.y}};A.module.drag.move=function(G,D){var E=A.event.mousePos(D),F=G.uuSaveDragOffset;A.css.setRect(G,{x:E.x-F.x,y:E.y-F.y});return E};A.module.drag.free=A.klass.generic();A.module.drag.free.prototype={construct:function(E,D){this.elm=E;this.param=A.mix.param(D||{},{ghost:true,cursor:"move",opacity:A.css.opacity(this.elm),msgto:"",msgFilter:A.echo,resize:true,shim:true});A.css.set(this.elm,{cursor:this.param.cursor});A.element.toAbsolute(this.elm);this.param.ghost&&A.effect.fade(this.elm,{begin:0,end:1});this.zindexer=new A.module.drag.zindexer();this.zindexer.set(this.elm);this.shim=(this.param.shim&&A.ua.ie6)?new A.module.ieboost.shim(E,this.param.ghost):0;
A.event.set(this,this.elm,"mousedown,mousewheel")},destruct:function(){try{this.zindexer.unset(this.elm);A.event.unset(this,this.elm,"mousedown,mousewheel")}catch(D){}},handleEvent:function(D){var E=A.event.toType(D);A.event.stop(D);switch(E){case"mousedown":A.event.set(this,A.ua.ie?this.elm:B,"mousemove,mouseup",true);break;case"mouseup":A.event.unset(this,A.ua.ie?this.elm:B,"mousemove,mouseup",true);break}switch(E){case"mousedown":case"mousemove":case"mouseup":case"mousewheel":this["_"+E](D);this.param.msgto&&A.msg&&this.param.msgFilter(E)&&A.msg.post(this.param.msgto,E,{from:"uu.module.drag.free",element:this.elm});break}},_mousedown:function(D){A.module.drag.save(this.elm,D);this.dragging=true;this.zindexer.beginDrag(this.elm);this.param.ghost&&A.css.setOpacity(this.elm,0.3)},_mousemove:function(D){if(!this.dragging){return 
}var E=A.module.drag.move(this.elm,D);if(this.shim){this.shim.setRect({x:E.x-this.elm.uuSaveDragOffset.x,y:E.y-this.elm.uuSaveDragOffset.y})}},_mouseup:function(D){if(!this.dragging){return }this.dragging=false;this.param.ghost&&A.effect.fade(this.elm,{speed:"quick",begin:A.css.opacity(this.elm),end:1});this.zindexer.endDrag(this.elm)},_mousewheel:function(E){if(!this.param.resize){return }var D=A.event.mouseState(E).wheel*2,F=A.css.rect(this.elm);A.css.setRect(this.elm,{x:F.x-D,y:F.y-D,w:F.w+D*2,h:F.h+D*2});if(this.shim){this.shim.setRect(A.css.rect(this.elm))}}};A.module.drag.limited=A.klass.generic();A.module.drag.limited.prototype={construct:function(E){var D=this;this.elm=null;this.param=A.mix.param(E||{},{ghost:true,cursor:"move",msgto:"",msgFilter:A.echo,resize:true,dropAllowColor:"bisque"});
this.draggable=A.toArray(A.klass("draggable",0,"div"));this.droppable=A.toArray(A.klass("droppable",0,"div"));this.zindexer=new A.module.drag.zindexer();A.forEach(this.draggable,function(F){F.style.cursor=D.param.cursor;A.event.set(D,F,"mousedown,mousewheel")});A.forEach(this.droppable,function(F){F._uu_drag_bgcolor=A.css.get(F,"backgroundColor");F._uu_drag_rect=A.element.rect(F)})},destruct:function(){var D=this;A.forEach(this.draggable,function(E){A.event.unset(D,E,"mousedown,mousewheel")})},handleEvent:function(D){var E=A.event.toType(D);A.event.stop(D);switch(E){case"mousedown":A.event.set(this,A.ua.ie?A.event.target(D).target:B,"mousemove,mouseup",true);break;case"mouseup":A.event.unset(this,A.ua.ie?this.elm:B,"mousemove,mouseup",true);break}switch(E){case"mousedown":case"mousemove":case"mouseup":case"mousewheel":this["_"+E](D);
this.param.msgto&&A.msg&&this.param.msgFilter(E)&&A.msg.post(this.param.msgto,E,{sender:"uu.module.drag.limited",element:this.elm});break}},_mousedown:function(D){this.elm=A.event.target(D).target;A.css.setOpacity(this.elm,this.param.ghost?0.5:1);A.element.toAbsolute(this.elm);this.zindexer.set(this.elm);this.zindexer.beginDrag(this.elm);A.module.drag.save(this.elm,D)},_mousemove:function(D){this._inDroppableRect(A.module.drag.move(this.elm,D))},_mouseup:function(D){A.css.set(this.elm,{position:"static",opacity:1});A.css.setRect(this.elm,{x:0,y:0});this.zindexer.endDrag(this.elm);this.zindexer.unset(this.elm);var E=this._inDroppableRect(A.event.mousePos(D));if(E){this._drop(E,this.elm)}},_mousewheel:function(E){if(!this.param.resize){return }var D=A.event.mouseState(E).wheel*2,F=A.css.rect(this.elm);
A.css.setRect(this.elm,{x:F.x-D,y:F.y-D,w:F.w+D*2,h:F.h+D*2})},_drop:function(E,D){if(!A.klass("draggable",E,"div").length){if(E.hasChildNodes()){E.insertBefore(D,E.firstChild)}else{E.appendChild(D)}this.param.msgto&&A.msg&&this.param.msgFilter("drop")&&A.msg.post(this.param.msgto,"drop",{sender:"uu.module.drag.limited",element:this.elm})}},_inDroppableRect:function(D){var F=null,E=this.param.dropAllowColor;A.forEach(this.droppable,function(G){if(A.inRect(G._uu_drag_rect,D)){G.style.backgroundColor=E;F=G;return }G.style.backgroundColor=G._uu_drag_bgcolor});return F}};A.module.drag.zindexer=A.klass.singleton();A.module.drag.zindexer.prototype={construct:function(){this._elm=[];this._boost=5000;this._top=20},set:function(D){if(this._elm.indexOf(D)!==-1){return }this._elm.push(D);D.style.zIndex=++this._top
},unset:function(D){if(this._elm.indexOf(D)===-1){return }delete this._elm[this._elm.indexOf(D)];--this._top},beginDrag:function(D){if(this._elm.indexOf(D)===-1){return }this._sink(D);D.style.zIndex=this._boost+1},endDrag:function(D){if(this._elm.indexOf(D)===-1){return }D.style.zIndex=this._top},top:function(D){if(this._elm.indexOf(D)===-1){return }this._sink(D);D.style.zIndex=this._top},_sink:function(E){var D=E.style.zIndex||10;A.forEach(this._elm,function(F){(F.style.zIndex>D)&&(F.style.zIndex-=1)})}}})();