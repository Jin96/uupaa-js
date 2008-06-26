(function(){var B=document,C=window,A=C.uu;A.module.drag=function(){};A.module.drag.free=A.klass.generic();A.module.drag.free.prototype={construct:function(E,D){this.elm=E;this.param=A.mix.param(D||{},{ghost:true,cursor:"move",opacity:A.css.get.opacity(this.elm),msgto:"",msgFilter:A.echo,resize:true,_x:0,_y:0,_dragging:false});A.ui.element.toAbsolute(this.elm);this.elm.style.cursor=this.param.cursor;this.param.ghost&&A.effect.fadein(this.elm,{begin:0,end:1});this.zindexer=new A.module.drag.zindexer();this.zindexer.set(this.elm.id);this.hr=A.event.handler(this);A.event.set(this.elm,"mousedown,mousewheel",this.hr)},destruct:function(){try{this.zindexer.unset(this.elm.id);A.event.unset(this.elm,"mousedown,mousewheel",this.hr)}catch(D){}},handleEvent:function(D){var E=A.event.type(D.type);A.event.stop(D);
switch(E){case"mousedown":A.event.set(A.ua.ie?this.elm:B,"mousemove,mouseup",this.hr,true);break;case"mouseup":A.event.unset(A.ua.ie?this.elm:B,"mousemove,mouseup",this.hr,true);break}switch(E){case"mousedown":case"mousemove":case"mouseup":case"mousewheel":this[E](D);this.param.msgto&&A.msgpump&&this.param.msgFilter(E)&&A.msgpump.post(this.param.msgto,E,{sender:"uu.module.drag.free",element:this.elm});break}},mousedown:function(D){var E=A.event.mouse.pos(D);this.param._x=E.x-parseInt(this.elm.style.left);this.param._y=E.y-parseInt(this.elm.style.top);this.dragging=true;this.zindexer.beginDrag(this.elm.id);this.param.ghost&&A.css.set.opacity(this.elm,0.3)},mousemove:function(D){if(!this.dragging){return }var E=A.event.mouse.pos(D);this.elm.style.left=parseInt(E.x-this.param._x)+"px";this.elm.style.top=parseInt(E.y-this.param._y)+"px"
},mouseup:function(D){if(!this.dragging){return }this.dragging=false;this.param.ghost&&A.effect.fadein(this.elm,{speed:"quick",end:1});this.zindexer.endDrag(this.elm.id)},mousewheel:function(E){if(!this.param.resize){return }var F=A.css.get(this.elm),D=A.event.mouse.state(E).wheel*2;A.css.set(this.elm,{width:(parseInt(F.width)+(D*2))+"px",height:(parseInt(F.height)+(D*2))+"px",top:(parseInt(F.top)-D)+"px",left:(parseInt(F.left)-D)+"px"})}};A.module.drag.limited=A.klass.generic();A.module.drag.limited.prototype={construct:function(E){var D=this;this.elm=null;this.param=A.mix.param(E||{},{ghost:true,cursor:"move",msgto:"",msgFilter:A.echo,resize:true,dropAllowColor:"bisque",_x:0,_y:0});this.draggable=A.toArray(A.klass("draggable",0,"div"));this.droppable=A.toArray(A.klass("droppable",0,"div"));
this.zindexer=new A.module.drag.zindexer();D.hr=A.event.handler(D);A.forEach(this.draggable,function(F){F.style.cursor=D.param.cursor;A.event.set(F,"mousedown,mousewheel",D.hr)});A.forEach(this.droppable,function(F){F._uu_drag_bgcolor=A.css.get(F,"backgroundColor");F._uu_drag_rect=A.ui.element(F)})},destruct:function(){var D=this;A.forEach(this.draggable,function(E){A.event.unset(E,"mousedown,mousewheel",D.hr)})},handleEvent:function(D){var E=A.event.type(D.type);A.event.stop(D);switch(E){case"mousedown":A.event.set(A.ua.ie?A.event.target(D).real:B,"mousemove,mouseup",this.hr,true);break;case"mouseup":A.event.unset(A.ua.ie?this.elm:B,"mousemove,mouseup",this.hr,true);break}switch(E){case"mousedown":case"mousemove":case"mouseup":case"mousewheel":this[E](D);this.param.msgto&&A.msgpump&&this.param.msgFilter(E)&&A.msgpump.post(this.param.msgto,E,{sender:"uu.module.drag.limited",element:this.elm});
break}},mousedown:function(D){this.elm=A.event.target(D).real;var E=A.event.mouse.pos(D),F=A.ui.element(this.elm);A.ui.element.toAbsolute(this.elm,{opacity:this.param.ghost?0.5:1});A.ui.element.toAbsolute(this.elm,{opacity:this.param.ghost?0.5:1});this.zindexer.set(this.elm.id);this.zindexer.beginDrag(this.elm.id);this.param._x=E.x-F.x;this.param._y=E.y-F.y},mousemove:function(D){var E=A.event.mouse.pos(D);A.css.set(this.elm,{left:E.x-this.param._x+"px",top:E.y-this.param._y+"px"});this.inDroppableRect(E)},mouseup:function(D){A.css.set(this.elm,{position:"static",left:0,top:0,opacity:1});this.zindexer.endDrag(this.elm.id);this.zindexer.unset(this.elm.id);var E=this.inDroppableRect(A.event.mouse.pos(D));if(E){this.drop(E,this.elm)}},mousewheel:function(E){if(!this.param.resize){return }var F=A.css.get(this.elm),D=A.event.mouse.state(E).wheel*2;
A.css.set(this.elm,{width:(parseInt(F.width)+(D*2))+"px",height:(parseInt(F.height)+(D*2))+"px",top:(parseInt(F.top)-D)+"px",left:(parseInt(F.left)-D)+"px"})},drop:function(E,D){if(!A.klass("draggable",E,"div").length){if(E.hasChildNodes()){E.insertBefore(D,E.firstChild)}else{E.appendChild(D)}this.param.msgto&&A.msgpump&&this.param.msgFilter("drop")&&A.msgpump.post(this.param.msgto,"drop",{sender:"uu.module.drag.limited",element:this.elm})}},inDroppableRect:function(D){var F=null,E=this.param.dropAllowColor;A.forEach(this.droppable,function(G){if(A.ui.inRect(G._uu_drag_rect,D)){G.style.backgroundColor=E;F=G;return }G.style.backgroundColor=G._uu_drag_bgcolor});return F}};A.module.drag.zindexer=A.klass.singleton();A.module.drag.zindexer.prototype={construct:function(){this.obj={};this.boost_zIndex=1000;
this.default_zIndex=20},set:function(D){if(D in this.obj){if(A.config.debug){throw Error("duplicate id: "+D)}return }this.obj[D]=A.id(D);this.obj[D].style.zIndex=++this.default_zIndex},unset:function(D){if(!(D in this.obj)){if(A.config.debug){throw Error("unknown id: "+D)}return }delete this.obj[D];--this.default_zIndex},beginDrag:function(E){if(!(E in this.obj)){if(A.config.debug){throw Error("unknown id: "+E)}return }var D=this.obj[E].style.zIndex;this.obj[E].style.zIndex=this.boost_zIndex+1;A.forEach(this.obj,function(F){if(F.style.zIndex>D){F.style.zIndex-=1}})},endDrag:function(E,D){if(!(E in this.obj)){if(A.config.debug){throw Error("unknown id: "+E)}return }this.obj[E].style.zIndex=this.default_zIndex}}})();