(function(){var B=window,A=B.uu;A.module.effect={};A.effect=function(){};A.effect._vtm=new A.module.virtualTimer(10);A.effect._speed={now:1,quick:250,fast:500,mid:1000,slow:4000};A.effect.show=function(F,E){var C=A.css.get(F),D=A.mix.param(E||{},{speed:"now",fn:A.mute});if(D.speed==="now"){if(C.visibility==="hidden"||C.display==="none"){A.css.set(F,{display:"show",visibility:"visible"})}return }A.effect.show._impl(F,D.speed,D.fn)};A.effect.show._impl=function(E,D,C){};A.effect.hide=function(D,C){};A.effect.fade=function(F,E){var D=A.css.get.opacity(F),C=A.mix.param(E||{},{speed:"mid",fn:A.mute,begin:-1,end:-1});if(C.begin===-1||!A.effect._judgeOpacity(C.begin)){C.begin=D}if(C.end===-1||!A.effect._judgeOpacity(C.end)){C.end=(D<0.5)?1:0}A.effect.show(F);(C.begin>C.end)?A.effect.fadeout._impl(F,C.speed,C.fn,C.begin,C.end):A.effect.fadein._impl(F,C.speed,C.fn,C.begin,C.end)
};A.effect.fadein=function(F,E){var D=A.css.get.opacity(F),C=A.mix.param(E||{},{speed:"mid",fn:A.mute,begin:D,end:1});A.effect.show(F);A.effect.fadein._impl(F,C.speed||1,C.fn,A.effect._judgeOpacity(C.begin)?C.begin:0,A.effect._judgeOpacity(C.end)?C.end:1)};A.effect.fadein._impl=function(G,D,I,C,E){var H=A.effect.fadein,J,K=C;(!A.isN(D))&&(D=H._speed[(D in H._speed)?D:"mid"]);J=1/(D/10);function F(L){switch(L){case 1:if(K>=E){return false}break;case 2:A.css.set.opacity(G,((K+=J)>E)?(K=E):K);break;case 4:I()}return true}A.effect._frame(G,10,F)};A.effect.fadein._speed={quick:250,mid:1000,slow:4000};A.effect.fadeout=function(F,E){var D=A.css.get.opacity(F),C=A.mix.param(E||{},{speed:"mid",fn:A.mute,begin:D,end:0});A.effect.show(F);A.effect.fadeout._impl(F,C.speed||1,C.fn,A.effect._judgeOpacity(C.begin)?C.begin:1,A.effect._judgeOpacity(C.end)?C.end:0)
};A.effect.fadeout._impl=function(G,D,I,C,E){var H=A.effect.fadein,J,K=C;(!A.isN(D))&&(D=H._speed[(D in H._speed)?D:"mid"]);J=1/(D/10);function F(L){switch(L){case 1:if(K<=E){return false}break;case 2:A.css.set.opacity(G,((K-=J)<E)?(K=E):K);break;case 4:I()}return true}A.effect._frame(G,10,F)};A.effect.fadeout._speed={quick:250,mid:1000,slow:4000};A.effect._frame=function(I,D,F){var H=0,G=0;function E(){!H++&&(A.effect._vtm.suspend(G),F(4))}function C(){(!H&&F(1)&&F(2)&&F(3))?0:E()}F(0);G=A.effect._vtm.set(C,D)};A.effect._judgeOpacity=function(C){return(A.isN(C)&&C>=0&&C<=1)}})();