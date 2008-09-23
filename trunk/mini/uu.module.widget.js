(function(){var B=document,D=window,A=D.uu,C=D.UU;A.module.widget=function(){};A.module.window=function(){};A.module.widget.button=A.klass.singleton();A.module.widget.button.prototype={construct:function(){}};A.module.window.manager=A.klass.singleton();A.module.window.manager.prototype={construct:function(){this._wuid={};this._park=[];this._defaultParam={context:B.body,icon:"",title:"window",titleHeight:32,rect:{x:100,y:100,w:300,h:200},resizable:true,resizeLimit:{minw:100,maxw:-1,minh:100,maxh:-1},bodyBevel:12,bodyPadding:{top:0,right:0,bottom:0,left:0},skin:"plasticity",bodyCanvas:true,minimizeAnimation:true,fn:A.mute};this._defaultSkinParam={}},setDefaultParam:function(E){A.mix(this._defaultParam,E)},setDefaultSkinParam:function(E){A.mix(this._defaultSkinParam,E)},createWindow:function(G,F){var H=A.uid("window"),E=new A.module.fdc();
E.wuid=H;E.manager=this;this._wuid[H]=E;G=A.mix.param(G||{},this._defaultParam);F=A.mix.param(F||{},this._defaultSkinParam);E.initializer=new A.module.window.initializer(E,G,F);A.msg.post(E.initializer,"MI_INIT");return H},createDialog:function(G,F){var H=A.uid("dialog"),E=new A.module.fdc();E.wuid=H;E.manager=this;this._wuid[H]=E;G=A.mix.param(G||{},this._defaultParam,{resizable:false});F=A.mix.param(F||{},this._defaultSkinParam);E.initializer=new A.module.window.initializer(E,G,F);A.msg.post(E.initializer,"MI_INIT");return H},createModalDialog:function(){},isExist:function(E){return E in this._wuid},msgbox:function(G,F,E){switch(G){case"*M_CLOSE":this._close(F);break;case"LM_PARKING":return this._parking(F);case"MM_PARKING_OUT":case"LM_PARKING_OUT":this._parkingOut(F);break}return 0},_close:function(E){if(E in this._wuid){A.msg.post(this._wuid[E].initializer,"MI_CLOSE");
this.msgbox("MM_PARKING_OUT",E);delete this._wuid[E];A.vtmHighSpeed.diet()}},_parking:function(G){var F=0,E=this._park.indexOf(0);if(E===-1){F=this._park.push(G)-1}else{this._park[E]=G;F=E}return F},_parkingOut:function(F){var E=this;A.mix([],this._park).forEach(function(G,H){(G===F)&&(E._park[H]=0)})}};A.module.window.initializer=A.klass.generic();A.module.window.initializer.prototype={construct:function(E,G,F){this._fdc=E;this._run=0;E.node=0;E.shim=0;E.skin=0;E.param=G;E.skinParam=F;E.viewState={size:0,rect:{x:0,y:0,w:0,h:0}};E.bone=0;E.boneCanvas=0;E.body=0;E.title=0;E.resize=0;E.bodyCanvas=0;E.bodyCanvas2d=0},msgbox:function(G,F,E){switch(G){case"MI_INIT":this._fdc.node=new A.module.window.node(this._fdc);this._fdc.layout=new A.module.window.layout(this._fdc);this._fdc.skin=new A.module.skin[this._fdc.param.skin].window(this._fdc);
this._build();this._defaultStyle();this._fdc.shim=(A.ua.ie6)?new A.module.ieboost.shim(this._fdc.bone,1):0;A.msg.post(this._fdc.node,"IN_INIT");A.msg.post(this._fdc.layout,"IL_INIT");A.msg.post(this._fdc.skin,"IS_INIT");break;case"*I_INIT_OK":++this._run;if(this._run>=3){A.msg.post(this._fdc.layout,"*L_RESIZE",this._fdc.param.rect);A.msg.post(this._fdc.layout,"IL_SHOW");A.msg.post(this._fdc.node,"IN_INIT_OK")}break;case"*I_INIT_NG":A.msg.post(this._fdc.node,"IN_INIT_NG");break;case"MI_CLOSE":A.msg.send(this._fdc.layout,"IL_HIDE");this._fdc.layout.destruct();this._fdc.skin.destruct();this._destroy();break}},_build:function(){this._fdc.bone=B.createElement("div");this._fdc.boneCanvas=B.createElement("canvas");this._fdc.body=B.createElement("div");this._fdc.title=B.createElement("div");this._fdc.resize=this._fdc.param.resizable?B.createElement("div"):0;
this._fdc.bodyCanvas=this._fdc.param.bodyCanvas?B.createElement("canvas"):0;this._fdc.param.context.appendChild(this._fdc.bone);this._fdc.bone.appendChild(this._fdc.boneCanvas);if(A.ua.ie){this._fdc.boneCanvas=G_vmlCanvasManager.initElement(this._fdc.boneCanvas)}if(this._fdc.bodyCanvas){this._fdc.bone.appendChild(this._fdc.bodyCanvas);if(A.ua.ie){this._fdc.bodyCanvas=G_vmlCanvasManager.initElement(this._fdc.bodyCanvas)}this._fdc.bodyCanvas2d=new A.module.canvas2d(this._fdc.bodyCanvas)}this._fdc.bone.appendChild(this._fdc.body);this._fdc.bone.appendChild(this._fdc.title);this._fdc.resize&&this._fdc.bone.appendChild(this._fdc.resize);this._fdc.title.innerText=this._fdc.param.title},_destroy:function(){A.node.remove(this._fdc.bone)},_defaultStyle:function(){A.css.set(this._fdc.bone,{position:"absolute",display:"none"});
A.css.set(this._fdc.boneCanvas,{position:"absolute"});A.css.set(this._fdc.body,{position:"absolute",overflow:"auto"});A.css.set(this._fdc.title,{position:"absolute",cursor:"move",fontWeight:"bold",overflow:"hidden"});this._fdc.resize&&A.css.set(this._fdc.resize,{position:"absolute",cursor:"nw-resize",bottom:"0",right:"0",width:"16px",height:"16px"});this._fdc.bodyCanvas&&A.css.set(this._fdc.bodyCanvas,{position:"absolute",overflow:"hidden"});A.css.unselectable(this._fdc.title)}};A.module.window.node=A.klass.generic();A.module.window.node.prototype={construct:function(E){this._fdc=E},destruct:function(){},msgbox:function(G,F,E){switch(G){case"IN_INIT":A.msg.post(this._fdc.initializer,"*I_INIT_OK");break;case"IN_INIT_OK":this._fdc.param.fn(200,this.exportData());break;case"IN_INIT_NG":this._fdc.param.fn(400,null);
break}},exportData:function(){return{wuid:this._fdc.wuid,titleNode:this._fdc.title,bodyNode:this._fdc.body,bodyCanvas:this._fdc.bodyCanvas,bodyCanvas2d:this._fdc.bodyCanvas2d,boneRect:A.css.rect(this._fdc.bone),bodyRect:A.css.rect(this._fdc.body)}}};A.module.window.layout=A.klass.generic();A.module.window.layout.prototype={construct:function(E){this._fdc=E;this._wired=0;this._dragging=0;this._zindexer=new A.module.drag.zindexer()},destruct:function(){try{this._zindexer.unset(this._fdc.bone);A.event.unset(this,this._fdc.boneCanvas,"click");A.event.unset(this,this._fdc.body,"click");A.event.unset(this,this._fdc.title,"mousedown,dblclick");this._fdc.resize&&A.event.unset(this,this._fdc.resize,"mousedown");this._fdc.shim?this._fdc.shim.purge():0}catch(E){}},handleEvent:function(E){A.event.stop(E);
switch(A.event.toType(E)){case"mousedown":switch(A.event.target(E).target){case this._fdc.title:A.event.set(this,A.ua.ie?this._fdc.title:B,"mousemove,mouseup",true);this._mousedownOnTitleBar(E);break;case this._fdc.resize:A.event.set(this,A.ua.ie?this._fdc.resize:B,"mousemove,mouseup",true);this._mousedownOnResizeHandle(E);break}break;case"mousemove":switch(this._dragging){case 1:this._mousemoveOnTitleBar(E);break;case 2:this._mousemoveOnResizeHandle(E);break}break;case"mouseup":switch(this._dragging){case 1:A.event.unset(this,A.ua.ie?this._fdc.title:B,"mousemove,mouseup",true);this._mouseupOnTitleBar(E);break;case 2:A.event.unset(this,A.ua.ie?this._fdc.resize:B,"mousemove,mouseup",true);this._mouseupOnResizeHandle(E);break}break;case"click":this._click(E);break;case"dblclick":this._dblclick(E);
break}},msgbox:function(H,G,F){var E;switch(H){case"IL_INIT":this._init();break;case"FONT_RESIZE":case"*L_RESIZE":E=G||A.css.rect(this._fdc.bone);this._resize(E);A.msg.post(0,C.MSG_RESIZE_WINDOW,this._fdc.node.exportData());break;case"LL_WIRE":if(G===2){G=this._wired?0:1}this._wire(!!G);break;case"IL_SHOW":A.css.show(this._fdc.bone);break;case"IL_HIDE":A.css.hide(this._fdc.bone);break}},_init:function(){A.element.toAbsolute(this._fdc.bone);this._zindexer.set(this._fdc.bone);A.event.set(this,this._fdc.boneCanvas,"click");A.event.set(this,this._fdc.body,"click");A.event.set(this,this._fdc.title,"mousedown,dblclick");this._fdc.resize&&A.event.set(this,this._fdc.resize,"mousedown");A.msg.post(A.customEvent,"SET","FONT_RESIZE",this.uid);A.msg.post(this._fdc.initializer,"*I_INIT_OK")},_resize:function(E){this._draw(E);
A.msg.send(this._fdc.skin,"LS_UPDATE",E)},_wire:function(E){if(!E){A.css.set(this._fdc.bone,A.ua.ie?{border:""}:{outline:""});A.css.show(this._fdc.boneCanvas);A.css.show(this._fdc.title);if(this._fdc.viewState.size===0){A.css.show(this._fdc.body);this._fdc.resize&&A.css.show(this._fdc.resize);this._fdc.bodyCanvas&&A.css.show(this._fdc.bodyCanvas)}this._fdc.shim?this._fdc.shim.display(1):0;this._wired=0}else{A.css.set(this._fdc.bone,A.ua.ie?{border:"2px dotted gray"}:{outline:"2px dotted gray"});A.css.hide(this._fdc.boneCanvas);A.css.hide(this._fdc.title);A.css.hide(this._fdc.body);this._fdc.resize&&A.css.hide(this._fdc.resize);this._fdc.bodyCanvas&&A.css.hide(this._fdc.bodyCanvas);this._fdc.shim?this._fdc.shim.display(0):0;this._wired=1}},_draw:function(J){var I=this._fdc.param.titleHeight,K=this._fdc.param.bodyPadding,H=this._fdc.param.bodyBevel,L,G,F,E;
A.css.setRect(this._fdc.bone,J);A.mix(this._fdc.boneCanvas,{width:J.w,height:J.h});L=J.w-K.left-K.right-H*2;G=J.h-K.top-K.bottom-I-H;if(L>0&&G>0){A.css.setRect(this._fdc.body,{x:K.left+H,y:K.top+I,w:L,h:G})}if(this._fdc.param.bodyCanvas){A.css.setRect(this._fdc.bodyCanvas,{x:K.left+H,y:K.top+I,w:L,h:G})}F=A.css.measure();E=I/2-F.em/2;A.css.set(this._fdc.title,{paddingTop:E+"px",paddingLeft:H+"px",height:(I-4-(A.ua.std?E:0))+"px",width:(J.w-54-H*2)+"px"});this._fdc.shim&&this._fdc.shim.setRect(J)},_mousedownOnTitleBar:function(E){this._wired=0;this._dragging=1;A.module.drag.save(this._fdc.bone,E);this._zindexer.beginDrag(this._fdc.bone);var F=this;A.vtmLowSpeed.set(function(){if(F._dragging===1&&!F._wired){F._wired=1;A.msg.send(F._fdc.layout,"LL_WIRE",1)}},1000,1,"WIRED")},_mousedownOnResizeHandle:function(E){this._wired=1;
this._dragging=2;A.msg.send(this._fdc.layout,"LL_WIRE",1);this._zindexer.beginDrag(this._fdc.bone);var F=A.event.mousePos(E),G=A.css.rect(this._fdc.bone);this._fdc.bone.uuSaveDragOffset={x:F.x-G.w,y:F.y-G.h}},_mousemoveOnTitleBar:function(E){if(!this._wired){this._wired=1;A.msg.send(this._fdc.layout,"LL_WIRE",1)}var F=A.module.drag.move(this._fdc.bone,E);if(this._fdc.shim){this._fdc.shim.setRect({x:F.x-this._fdc.bone.uuSaveDragOffset.x,y:F.y-this._fdc.bone.uuSaveDragOffset.y})}},_mousemoveOnResizeHandle:function(G){var H=A.event.mousePos(G),F,E=H.x-this._fdc.bone.uuSaveDragOffset.x,I=H.y-this._fdc.bone.uuSaveDragOffset.y;if(A.ua.ie&&!A.ua.std){}F=this._fdc.param.resizeLimit;if(F.minw!==-1&&E<F.minw){E=F.minw}if(F.maxw!==-1&&E>F.maxw){E=F.maxw}if(F.minh!==-1&&I<F.minh){I=F.minh}if(F.maxh!==-1&&I>F.maxh){I=F.maxh
}A.css.setRect(this._fdc.bone,{w:E,h:I})},_mouseupOnTitleBar:function(E){var G=A.css.rect(this._fdc.bone),F=0;this._wired=0;A.msg.send(this._fdc.layout,"LL_WIRE",0);this._dragging=0;this._zindexer.endDrag(this._fdc.bone);if(G.x<0&&G.x<-G.w+100){G.x=-G.w+100;++F}if(G.y<0){G.y=0;++F}F&&A.msg.send(this._fdc.layout,"*L_RESIZE",G)},_mouseupOnResizeHandle:function(E){var F=A.css.rect(this._fdc.bone);this._wired=0;A.msg.send(this._fdc.layout,"LL_WIRE",0);this._dragging=0;this._zindexer.endDrag(this._fdc.bone);if(A.ua.ie&&!A.ua.std){}A.msg.send(this._fdc.layout,"*L_RESIZE",F)},_click:function(F){var H=0,K=A.event.target(F).target,I,G=A.event.mousePos(F),E=G.ox,J=G.oy;this._zindexer.top(this._fdc.bone);if(K!==this._fdc.boneCanvas){I=A.element.offsetFromAncestor(K,this._fdc.bone);E+=I.x;J+=I.y}H=A.msg.send(this._fdc.skin,"LS_QUERY_POSITION",A.css.rect(this._fdc.bone),{x:E,y:J});
switch(H){case 1:A.msg.post(this._fdc.manager,"*M_CLOSE",this._fdc.wuid);break;case 2:switch(this._fdc.viewState.size){case 0:this._maximize();break;case 1:this._revert();break;case 2:A.msg.post(this._fdc.manager,"LM_PARKING_OUT",this._fdc.wuid);this._maximize();break}break;case 3:switch(this._fdc.viewState.size){case 0:this._minimize();break;case 1:this._minimize();break;case 2:A.msg.post(this._fdc.manager,"LM_PARKING_OUT",this._fdc.wuid);this._revert();break}break}},_dblclick:function(E){switch(this._fdc.viewState.size){case 0:this._maximize();break;case 1:this._revert();break;case 2:A.msg.post(this._fdc.manager,"LM_PARKING_OUT",this._fdc.wuid);this._revert();break}},_maximize:function(){if(this._fdc.viewState.size===1){return }this._fdc.viewState.size=1;if(!this._fdc.viewState.rect.w&&!this._fdc.viewState.rect.h){this._fdc.viewState.rect=A.css.rect(this._fdc.bone)
}this._zindexer.top(this._fdc.bone);A.event.unset(this,this._fdc.title,"mousedown");A.css.set(this._fdc.title,{cursor:""});this._fdc.resize&&A.css.hide(this._fdc.resize);if(this._fdc.param.context===B.body){var E=A.viewport.rect();A.msg.send(this._fdc.layout,"*L_RESIZE",{x:E.x,y:E.y,w:E.w,h:E.h})}A.effect.diet()},_minimize:function(){if(this._fdc.viewState.size===2){return }this._fdc.viewState.size=2;var H=this,E=A.viewport.rect(),G,F=A.msg.send(this._fdc.manager,"LM_PARKING",this._fdc.wuid);if(!this._fdc.viewState.rect.w&&!this._fdc.viewState.rect.h){this._fdc.viewState.rect=A.css.rect(this._fdc.bone)}A.event.set(this,this._fdc.title,"mousedown");A.css.set(this._fdc.title,{cursor:"move"});A.css.hide(this._fdc.body);this._fdc.resize&&A.css.hide(this._fdc.resize);if(this._fdc.param.context===B.body){G={x:E.x+E.w-140,y:E.y+(F+1)*40,w:120,h:this._fdc.param.titleHeight};
A.effect.bullet(this._fdc.bone,{x:G.x,y:G.y,w:G.w,h:G.h,speed:this._fdc.param.minimizeAnimation?"quick":"now",fn:function(){A.msg.send(H._fdc.layout,"*L_RESIZE",G)}})}},_revert:function(){if(this._fdc.viewState.size===0){return }this._fdc.viewState.size=0;A.msg.send(this._fdc.layout,"*L_RESIZE",this._fdc.viewState.rect);this._fdc.viewState.rect={x:0,y:0,w:0,h:0};A.event.set(this,this._fdc.title,"mousedown");A.css.set(this._fdc.title,{cursor:"move"});this._fdc.resize&&A.css.show(this._fdc.resize);A.css.show(this._fdc.body);if(A.ua.gecko||A.ua.webkit){D.getSelection().collapse(B.body,0)}}};A.module.canvasPartsFactory=A.klass.singleton();A.module.canvasPartsFactory.prototype={button:function(I,G,E,H){H=H||{};E=E||"BLACK";var F=((G.indexOf(".")===-1)?G+".":G).split(".");A.mix.param(H,this._style[F[0].toUpperCase()]);
A.mix.param(H,this._style[E.toUpperCase()]);if(F[1]){A.mix(H,this.getStyle(G))}switch(F[0].toUpperCase()){case"METABOGLOSSY":case"JELLYBEAN":this.metaboGlossy(I,H);break;case"ANGLEGLOSSY":this.angleGlossy(I,H);break}},addStyle:function(E,F){this._style[E]=F},getStyle:function(E){return(E in this._style)?this._style[E]:{}},metaboGlossy:function(N,H){var P=H,O=P.x,M=P.y,Q=P.w,K=P.h,E=P.r,R=P.tarun,J=A.color.hash(P.color),I=A.color.hash(P.color2),G=P.oa,F=E>4?E-4:0,L=3;N.setStyle({fill:N.gradation([O,M,O,M+K],[0,J,1,I])}).begin().box(O,M,Q,K,E).close().setStyle({fill:"rgba(255,255,255,"+G+")"}).begin().metabo(O+L,M+L,Q-L*2,K*0.5,F,R).close()},angleGlossy:function(O,G){var Q=G,P=Q.x,N=Q.y,R=Q.w,K=Q.h,E=Q.r,H=Q.angle,J=A.color.hash(Q.color),I=A.color.hash(Q.color2),F=Q.oa,M=3,L=0;if(H<-45){H=-45
}if(H>45){H=45}O.setStyle({fill:O.gradation([P,N,P,N+K],[0,J,1,I])}).begin().box(P,N,R,K,E).close().setStyle({fill:"rgba(255,255,255,"+F+")"});switch(H){case 45:O.begin(P+M,N+M+E).line(P+M,N+K-M*2).line(P+R-M*2,N+M).line(P+M+E,N+M).curve(P,N,P+M,N+M+E).fill().close();break;case -45:O.begin(P-M+R,N+M+E).line(P-M+R,N+K-M*2).line(P+M*2,N+M).line(P-M-E+R,N+M).curve(P+R,N,P-M+R,N+M+E).fill().close();break;default:L=((K-M*2)/45*H)/2;O.begin(P+M,N+M+E).line(P+M,N+(K/2)-M*2+L).line(P+R-M,N+(K/2)-M*2-L).line(P+R-M,N+M+E).curve(P+R,N,P+R-E,N+M).line(P+M+E,N+M).curve(P,N,P+M,N+M+E).fill().close();break}},_style:{METABOGLOSSY:{x:0,y:0,w:100,h:50,r:12,tarun:6},JELLYBEAN:{x:0,y:0,w:100,h:30,r:16,tarun:6},ANGLEGLOSSY:{x:0,y:0,w:100,h:100,r:12,angle:0},"ANGLEGLOSSY.45":{angle:45},"ANGLEGLOSSY.-45":{angle:-45},"ANGLEGLOSSY.FLAT":{angle:0},"ANGLEGLOSSY.OVAL":{r:70},BLACK:{color:"#000",color2:"#333",oa:0.25},BLUE:{color:"#0000a0",color2:"#0097ff",oa:0.38},GREEN:{color:"#006400",color2:"#00ff00",oa:0.38},RED:{color:"#400000",color2:"#ff0000",oa:0.38},LEMON:{color:"#DFCC00",color2:"#FFE900",oa:0.38},GOLD:{color:"lemonchiffon",color2:"gold",oa:0.45},PEACH:{color:"violet",color2:"red",oa:0.38},GRAY:{color:"black",color2:"silver",oa:0.38},SLIVER:{color:"gray",color2:"white",oa:0.38},DUMMY:{}}}
})();