(function(){var B=window,A=B.uu;A.module.skin.plasticityAngle={};A.module.skin.plasticityAngle.window=A.klass.generic();A.module.skin.plasticityAngle.window.prototype={construct:function(C){this._fdc=C;this._c2d=0;this._img=0;this._file=[A.config.imagePath+"window.btn1.png"];this._color={bone:A.color.zero,resize1:A.color.zero,resize2:A.color.zero}},destruct:function(){},msgbox:function(F,E,D){switch(F){case"IS_INIT":var C=this._fdc.skinParam;A.mix.param(C,{titleColor:"white",boneColor:"black",boneRadius:8,boneShadow:5,bodyStyle:"auto"});this._color.title=A.color.coffee(A.color.hash(C.titleColor));this._color.bone=A.color.hash(C.boneColor);this._color.resize1=A.color.ratio(this._color.bone,0,0,50);this._color.resize1.a=1;this._color.resize2=A.color.ratio(this._color.bone,0,0,-50);this._color.resize2.a=0.3;
this._c2d=new A.module.canvas2d(this._fdc.boneCanvas);A.msg.post(A.imageset,"PRELOAD_IMAGE",this,this._file);break;case"PRELOAD_IMAGE_OK":this._img=E;A.msg.post(this._fdc.initializer,"*I_INIT_OK");break;case"PRELOAD_IMAGE_NG":this._img=E;A.msg.post(this._fdc.initializer,"*I_INIT_NG");break;case"LS_UPDATE":this._bone(E);this._button(E.w-60-this._fdc.skinParam.boneShadow,10);this._fdc.resize&&this._fdc.viewState.size===0&&this._resizeHandle(E.w-17,E.h-17);break;case"LS_QUERY_POSITION":if(A.inRect({x:E.w-60-this._fdc.skinParam.boneShadow,y:10,w:18,h:18},D)){return 3}if(A.inRect({x:E.w-60+18-this._fdc.skinParam.boneShadow,y:10,w:18,h:18},D)){return 2}if(A.inRect({x:E.w-60+36-this._fdc.skinParam.boneShadow,y:10,w:18,h:18},D)){return 1}return 0;break}return 0},_bone:function(H){var I=this._fdc.skinParam,J=H.w,F=H.h,E,M=I.boneRadius,K=I.boneShadow,C,L,G=A.mix({},this._color.bone),D=(A.ua.ie)?2:1;
this._fdc.title.style.color=this._color.title;this._c2d.setStyle({alpha:0.9,lineWidth:D});for(E=0;E<K;E+=D){G.a=E*0.05+0.1;this._c2d.setStyle({stroke:G}).box(E,E,J-(E*2),F-(E*2),M+(K-E),1)}--E;this._c2d.setStyle({alpha:A.ua.ie?0.75:1});this._c2d.setStyle({fill:this._boneStyle(H,this._color.bone)});this._c2d.box(E,E,J-(E*2),F-(E*2),M+(K-E),0);this._c2d.setStyle({alpha:1});if(I.bodyStyle!=="none"){switch(I.bodyStyle){case"auto":this._c2d.setStyle({fill:this._bodyStyle(H)});break;default:this._c2d.setStyle({fill:I.bodyStyle});break}++E;C=this._fdc.param.bodyPadding,L=this._fdc.param.bodyBevel-E;this._c2d.box(E+C.left+L,this._fdc.param.titleHeight+C.top,J-(E*2)-C.left-C.right-L*2,F-E-this._fdc.param.titleHeight-C.top-C.bottom-L,M+(K-E),0)}this._c2d.setStyle({alpha:1})},_button:function(C,D){this._c2d.image(this._img.item(0),C,D)
},_resizeHandle:function(C,D){this._c2d.begin(C+0,D+12).line(C+12,D+0).move(C+4,D+12).line(C+12,D+4).setStyle({stroke:this._color.resize1}).stroke().close();this._c2d.begin(C+1,D+12).line(C+12,D+1).move(C+5,D+12).line(C+12,D+5).setStyle({stroke:this._color.resize2}).stroke().close()},_boneStyle:function(G,D){var F=D.r,E=D.g,C=D.b;return this._c2d.gradation([0,0,80,360],[0,{r:F,g:E,b:C,a:0.7},0.15,"white",0.6,{r:F,g:E,b:C,a:0.3},1,{r:F,g:E,b:C,a:0.3}])},_bodyStyle:function(C){var D=A.color.ratio(this._color.bone,10,5,0);D.a=1;return D}}})();