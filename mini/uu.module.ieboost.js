(function(){var B=document,D=window,A=D.uu,C=D.UU;A.module.ieboost=A.klass.singleton();A.module.ieboost.prototype={construct:function(F){var E=this;this.param=A.mix.param(F||{},{maxmin:true,alphapng:true,opacity:true});this.he=A.event.handler(this);A.event.set(D,"resize",this.he);A.msgpump.set("uu.module.ieboost",this);if(A.ua.version>6&&A.ua.version<5.5){this.param.maxmin=false;this.param.alphapng=false}if(A.module.isLoaded("ui")){this.fontResizeEvent=new A.event.custom.fontResize()}this.maxmin=this.param.maxmin?new A.module.ieboost.maxmin():0;this.alphapng=this.param.alphapng?new A.module.ieboost.alphapng():0;this.alphapngbg=this.param.alphapng?new A.module.ieboost.alphapngbg():0;this.opacity=this.param.opacity?new A.module.ieboost.opacity():0;if(this.param.maxmin||this.param.alphapng){A.tm10.set(function(){E.alphapng&&E.alphapng.fix()
},2000,0)}},handleEvent:function(E){var F=A.event.type(E.type);switch(F){case"resize":this.maxmin&&this.maxmin.draw();break}},procedure:function(G,F,E){switch(G){case C.MSG_EVENT_DOM_MANIP:this.maxmin&&this.maxmin.recalc();this.alphapng&&this.alphapng.fix();this.alphapngbg&&this.alphapngbg.recalc();break;case C.MSG_EVENT_FONT_RESIZE:this.maxmin&&this.maxmin.recalc();break}}};A.module.ieboost.maxmin=A.klass.generic();A.module.ieboost.maxmin.prototype={construct:function(){this.lock=0;this.maxmin=this.markup();this.draw()},recalc:function(){if(!this.maxmin.length){return }this.maxmin=this.markup();this.maxmin.length&&this.draw()},draw:function(){if(this.lock){return }var E=this;function H(){E.lock=1}function G(){E.lock=0}function F(){H();E.maxmin.forEach(function(I){var J=I.uuMaxMin;if(J.w0!==-1||J.w2!==-1){E.resizeWidth(I)
}if(J.h0!==-1||J.h2!==-1){E.resizeHeight(I)}});A.delay(G,40)}A.delay(F,40)},resizeWidth:function(J){var I=J.uuMaxMin,G=J.style,F;function E(){if(I.w0===-1){return false}G.width=I.w0;return(J.clientWidth>F)?true:false}function H(){if(I.w2===-1){return false}G.width=I.w2;return(J.clientWidth<F)?true:false}G.width=I.width;F=J.clientWidth;if(!E()&&!H()){G.width=I.width}},resizeHeight:function(J){var I=J.uuMaxMin,G=J.style,F;function E(){if(I.h0===-1){return false}G.height=I.h0;return(J.clientHeight>F)?true:false}function H(){if(I.h2===-1){return false}G.height=I.h2;return(J.clientHeight<F)?true:false}G.height=I.height;F=J.clientHeight;if(!E()&&!H()){G.height=I.height}},markup:function(){var L=[],H,K,E,G,J;function I(N,M,F){if(!M||M==="auto"||M==="none"){return -1}if(M.lastIndexOf("%")!==-1){return A.css.get[F](N.parentNode)*parseFloat(M)/100
}return(isNaN(M))?A.css.get.toPixel(N,M,F):-1}A.forEach(A.tag("*",document.body),function(F){if(!A.css.isBlock(F)){return }H=F.currentStyle;if(!F.uuMaxMin){J=F.getBoundingClientRect();E=H.width,G=H.height;if(H.width.lastIndexOf("%")===-1){E=(H.width==="auto")?(J.right-J.left):F.clientWidth;E+="px"}if(H.height.lastIndexOf("%")===-1){G=(H.height==="auto")?(J.bottom-J.top):F.clientHeight;G+="px"}F.uuMaxMin={width:E,height:G,"min-width":H["min-width"],"max-width":H["max-width"],"min-height":H.minHeight,"max-height":H["max-height"]}}K=F.uuMaxMin;A.mix(K,{w0:I(F,K["min-width"],"width"),w2:I(F,K["max-width"],"width"),h0:I(F,K["min-height"],"height"),h2:I(F,K["max-height"],"height")});if(K.w0!==-1&&K.w2!==-1&&K.w0>K.w2){K.w2=K.w0}if(K.h0!==-1&&K.h2!==-1&&K.h0>K.h2){K.h2=K.h0}if(K.w0===-1&&K.w2===-1&&K.h0===-1&&K.h2===-1){return 
}L.push(F)});return L}};A.module.ieboost.alphapng=A.klass.generic();A.module.ieboost.alphapng.prototype={construct:function(){var E=this;this.alpha={gif:A.config.imagePath+"b1.gif",progid:"progid:DXImageTransform.Microsoft.AlphaImageLoader"};if(A.module.isLoaded("image")){A.module.image.preload(this.alpha.gif,function(F){if(F){E.trans(E.markup())}})}else{this.alpha.gif="";this.trans2(E.markup())}},fix:function(){var E=this.markup();if(E.length){this.alpha.gif?this.trans(E):this.trans2(E)}},trans:function(F){var H=this,E,G;F.forEach(function(I){if(!I.uuAlphaPNG||I.uuAlphaPNG!==1){return }E=I.width,G=I.height;I.style.filter=H.alpha.progid+'(src="'+I.src+'",sizingMethod="image")';A.mix(I,{src:H.alpha.gif,width:E,height:G,uuAlphaPNG:2})})},trans2:function(E){var F=this,G;E.forEach(function(H){if(!H.uuAlphaPNG||H.uuAlphaPNG!==1){return 
}G=B.createElement("span");G.id=H.id;G.className=H.className;G.style.cssText=H.currentStyle.cssText;G.style.display="inline-block";G.style.width=H.width;G.style.height=H.height;G.style.styleFloat=H.align;G.style.filter=F.alpha.progid+'(src="'+H.src+'",sizingMethod="scale")';G.uuAlphaPNG=2;H.parentNode.replaceChild(G,H);if(H.id){A.id._cache[H.id]=G}})},markup:function(){var E=[];A.forEach(A.tag("img"),function(F){if(!F.uuAlphaPNG){F.uuAlphaPNG=3;if(F.complete&&/.png$/i.test(F.src)){if(/trans|alpha/i.test(F.src+" "+F.className)){F.uuAlphaPNG=1;E.push(F)}}}});return E}};A.module.ieboost.alphapngbg=A.klass.generic();A.module.ieboost.alphapngbg.prototype={construct:function(){this.alpha={elm:[],progid:"progid:DXImageTransform.Microsoft.AlphaImageLoader"};var E=this;A.window.ready(function(){E.alpha.elm=E.markup();
E.alpha.elm.length&&E.trans()})},recalc:function(){if(A.window.already()){this.alpha.elm=this.markup();this.alpha.elm.length&&this.trans()}},trans:function(){var E=this;this.alpha.elm.forEach(function(F){if(!F.uuAlphaPNGBG||F.uuAlphaPNGBG!==1){return }if(F.currentStyle.width==="auto"&&F.currentStyle.height==="auto"){F.style.width=F.offsetWidth+"px"}F.style.backgroundImage="none";F.style.filter=E.alpha.progid+'(src="'+F.uuAlphaPNGBGSrc+'",sizingMethod=crop)';F.uuAlphaPNGBG=2;E.bugfix(F);E.bugfixs(F)})},bugfixs:function(H){var E=0,F=H.childNodes.length,G;for(;E<F;++E){G=H.childNodes[E];if(G.nodeType!==1){continue}this.bugfix(G);if(G.firstChild){this.bugfix(G)}}},bugfix:function(E){switch(E.tagName.toLowerCase()){case"a":E.style.cursor="pointer";case"input":case"textarea":case"select":!E.style.position&&(E.style.position="relative")
}},markup:function(){var H=[],G,F,E;A.forEach(A.tag("*",B.body),function(I){if(!I.uuAlphaPNGBG){I.uuAlphaPNGBG=3;E=I.tagName.toLowerCase();G=I.style.backgroundImage||I.currentStyle.backgroundImage;if(G){F=G.match(/^url\("(.*)"\)$/);if(F){if(/.png$/i.test(F[1])){if(/trans|alpha/i.test(F[1]+" "+I.className)){I.uuAlphaPNGBG=1;I.uuAlphaPNGBGSrc=F[1];H.push(I)}}}}}});return H}};A.module.ieboost.opacity=A.klass.generic();A.module.ieboost.opacity.prototype={construct:function(){var F,E;A.forEach(A.tag("*",B.body),function(G){E=G.style.opacity||G.currentStyle.opacity;if(E){F=parseFloat(E);if(F>=0&&F<=1){A.css.set.opacity(G,F)}}})}};A.ieboost={};if(A.ua.ie){A.window.ready(function(){A.ieboost=new A.module.ieboost()})}})();