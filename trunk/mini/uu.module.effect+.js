(function(){var B=document,C=window,A=C.uu;A.module["effect+"]={};A.mix(A.module.effect.prototype,{sunset:function(I,H){var D=this._prepare(I,A.mix.param(H||{},{scanLine:false,roundRect:true})),G=0,F=this._revert;A.css.show(I);if(!("uuEffectWaveResource" in I)){this.createWaveResource(I,D.scanLine)}function E(){(++G===2)&&(F(I,D.revert),D.fn(I))}this._wave(I,0,D.speed,E,D.roundRect);this._fade(I.uuEffectWaveResource.c2d.ctx.canvas,0,D.speed*3,E,1,0)},wave:function(F,E){var D=this._prepare(F,A.mix.param(E||{},{scanLine:false,roundRect:false}));if(!("uuEffectWaveResource" in F)){this.createWaveResource(F,D.scanLine)}this._wave(F,D.revert,D.speed,D.fn,D.roundRect)},createWaveResource:function(I,H){H=H||false;if("uuEffectWaveResource" in I){return }this._hasResourceElement.push([I,this._deleteWaveResource]);
var K=this,L=A.css.rect(I),N=B.createElement("canvas"),M,J=[],F=0,G=4,D=4;B.body.appendChild(N);N.width=L.w+8;N.height=L.h;N.style.cssText=A.sprintf("display:none;position:absolute;left:%dpx;top:%dpx;overflow:hidden;z-index:%d",L.x-4+400,L.y,A.css.get(I,"zIndex"));M=new A.module.canvas2d(N);for(F=0;F<0.24;F+=0.01){J.push(M.pattern(E(0+F,1+F,G,D),"no-repeat"))}function E(P,Q,T,O){var R=K._createWaveTable(P,Q,L.h,T,O),S=0,U=L.h,V,W=L.w;M.clear();if(H){for(S=0;S<U;S+=2){V=R[S]+4;M.image(I,0,S,W,1,V,S,W,1)}}else{for(S=0;S<U;S+=2){V=R[S]+4;M.image(I,0,S,W,2,V,S,W,2)}}return M.ctx.canvas}I.uuEffectWaveResource={c2d:M,pattern:J}},_wave:function(J,E,Q,L,O){var D=A.css.show(J,1),V=this,U=1/(Q/10),K=0,H=0,N=J.uuEffectWaveResource.c2d,R=J.uuEffectWaveResource.pattern,M=0,I,G=0,F=0;function P(W,X){N.clear().setStyle({fill:R[W]}).box(0,0,D.w+8,D.h,parseInt(X>60?60:X))
}function T(){A.css.hide(N.ctx.canvas);V._revert(J,E);L(J)}I=A.css.get(J);G=parseInt(I.marginLeft)+parseInt(I.paddingLeft)+parseInt(I.borderLeftWidth);F=parseInt(I.marginTop)+parseInt(I.paddingTop)+parseInt(I.borderTopWidth);P(0,0);A.css.setRect(N.ctx.canvas,{x:D.x+G+-4,y:D.y+F});A.css.show(N.ctx.canvas);function S(W){switch(W){case 0:A.css.hide(J);break;case 1:K+=U;M+=U*70;return K<1;case 2:P(++H%R.length,O?M:0);break;case 4:T()}return true}this._core(30,S)},_createWaveTable:function(G,D,F,J,I){var K=[],E=G,H=(D-G)/F;for(;E<D;E+=H){K.push(Math.round(Math.sin(2*Math.PI*J*E)*I))}return K},_deleteWaveResource:function(D){if("uuEffectWaveResource" in D){delete D.uuEffectWaveResource}}});A.ua.ie&&A.mix(A.module.effect.prototype,{sunset:function(I,H){var D=this._prepare(I,A.mix.param(H||{},{scanLine:false,roundRect:true})),G=0,F=this._revert;
A.css.show(I);function E(){(++G===2)&&(F(I,D.revert),D.fn(I))}this._wave(I,0,D.speed,E,D.roundRect);this._fade(I,0,D.speed*2,E,1,0)},wave:function(F,E){var D=this._prepare(F,A.mix.param(E||{},{scanLine:false,roundRect:false}));this._wave(F,D.revert,D.speed,D.fn,D.roundRect)},_wave:function(J,K,F,N,P){var M=A.css.show(J,1),L=this,O=1/(F/10),E=0,D="DXImageTransform.Microsoft.Wave";A.css.setRect(J,{x:M.x-4});J.style.filter+=A.sprintf(" progid:%s(add=0,freq=%d,lightstrength=0,phase=0,strength=%d)",D,M.h/30,5);function H(){A.css.setRect(J,{x:M.x});J.filters[D].enabled=0;L._revert(J,K);N(J)}function G(Q){J.filters[D].phase=parseFloat(Q*100)}function I(Q){switch(Q){case 1:E+=O;return E<1;case 2:G(E);break;case 4:H()}return true}this._core(20,I)},createWaveResource:function(){},_createWaveTable:function(){},_deleteWaveResource:function(){}})
})();