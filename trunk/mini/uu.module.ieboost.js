(function(){var B=document,C=window,A=C.uu;A.module.ieboost=A.klass.singleton();A.module.ieboost.prototype={construct:function(E){this._param=A.mix.param(E||{},{maxmin:true,alphapng:true,opacity:true,datascheme:true,positionFixed:true,positionAbsolute:true});A.event.set(this,C,"resize");var D=this._param;switch(A.ua.version){case 8:D.datascheme=false;D.maxmin=false;D.alphapng=false;D.positionFixed=false;D.positionAbsolute=false;break;case 7:D.maxmin=false;D.alphapng=false;D.positionFixed=false;D.positionAbsolute=false;break;case 6:!A.ua.std&&(D.positionAbsolute=false);break}if(!A.module.already("datascheme")){D.datascheme=false}A.msg.post(A.customEvent,"SET","FONT_RESIZE",this.uid);this._maxmin=D.maxmin?new A.module.ieboost.maxmin():0;this._alphapng=D.alphapng?new A.module.ieboost.alphapng():0;
this._opacity=D.opacity?new A.module.ieboost.opacity():0;this._datascheme=D.datascheme?new A.module.ieboost.datascheme():0;this._posfix=D.positionFixed?new A.module.ieboost.positionFixed():0;this._posabs=D.positionAbsolute?new A.module.ieboost.positionAbsolute():0;if(D.maxmin){}},handleEvent:function(D){var E=A.event.toType(D);switch(E){case"resize":this._maxmin&&this._maxmin.draw();this._posfix&&this._posfix.recalc();break}},msgbox:function(F,E,D){switch(F){case"recalc":this._maxmin&&this._maxmin.recalc();this._opacity&&this._opacity.recalc();this._posfix&&this._posfix.markup();this._posabs&&this._posabs.recalc();break;case"FONT_RESIZE":this._maxmin&&this._maxmin.recalc();this._posfix&&this._posfix.recalc();break}return 0}};A.module.ieboost.maxmin=A.klass.kiss();A.module.ieboost.maxmin.prototype={construct:function(){this._lock=0;
this._mark=this._markup();this.draw()},recalc:function(){if(!this._mark.length){return }this._mark=this._markup();this._mark.length&&this.draw()},draw:function(){if(this._lock){return }var D=this;function G(){D._lock=1}function F(){D._lock=0}function E(){G();D._mark.forEach(function(H){var I=H.uuMaxMin;if(I.w0!==-1||I.w2!==-1){D._resizeWidth(H)}if(I.h0!==-1||I.h2!==-1){D._resizeHeight(H)}});A.delay(F,40)}A.delay(E,40)},_resizeWidth:function(I){var H=I.uuMaxMin,F=I.style,E;function D(){if(H.w0===-1){return false}F.width=H.w0;return(I.clientWidth>E)?true:false}function G(){if(H.w2===-1){return false}F.width=H.w2;return(I.clientWidth<E)?true:false}F.width=H.width;E=I.clientWidth;if(!D()&&!G()){F.width=H.width}},_resizeHeight:function(I){var H=I.uuMaxMin,F=I.style,E;function D(){if(H.h0===-1){return false
}F.height=H.h0;return(I.clientHeight>E)?true:false}function G(){if(H.h2===-1){return false}F.height=H.h2;return(I.clientHeight<E)?true:false}F.height=H.height;E=I.clientHeight;if(!D()&&!G()){F.height=H.height}},_markup:function(){var L=[],G,K,D,E,J,I;function H(N,M,F){if(!M||M==="auto"||M==="none"){return -1}if(M.lastIndexOf("%")!==-1){switch(F){case"width":I=A.css.rect(N.parentNode);return I.w*parseFloat(M)/100;case"height":I=A.css.rect(N.parentNode);return I.w*parseFloat(M)/100;break}return -1}return(isNaN(M))?A.css.toPixel(N,M,F):-1}A.forEach(A.tag("*",document.body),function(F){if(!A.css.isBlock(F)){return }G=F.currentStyle;if(!F.uuMaxMin){J=F.getBoundingClientRect();D=G.width,E=G.height;if(G.width.lastIndexOf("%")===-1){D=(G.width==="auto")?(J.right-J.left):F.clientWidth;D+="px"}if(G.height.lastIndexOf("%")===-1){E=(G.height==="auto")?(J.bottom-J.top):F.clientHeight;
E+="px"}F.uuMaxMin={width:D,height:E,"min-width":G["min-width"],"max-width":G["max-width"],"min-height":G.minHeight,"max-height":G["max-height"]}}K=F.uuMaxMin;A.mix(K,{w0:H(F,K["min-width"],"width"),w2:H(F,K["max-width"],"width"),h0:H(F,K["min-height"],"height"),h2:H(F,K["max-height"],"height")});if(K.w0!==-1&&K.w2!==-1&&K.w0>K.w2){K.w2=K.w0}if(K.h0!==-1&&K.h2!==-1&&K.h0>K.h2){K.h2=K.h0}if(K.w0===-1&&K.w2===-1&&K.h0===-1&&K.h2===-1){return }L.push(F)});return L}};A.module.ieboost.alphapng=A.klass.kiss();A.module.ieboost.alphapng.prototype={construct:function(){A.css.insertRule("img { behavior: expression(uu.module.ieboost.alphapng._expression(this)) }");A.css.insertRule(".png { behavior: expression(uu.module.ieboost.alphapng._expression(this)) }");A.css.insertRule("input { behavior: expression(uu.module.ieboost.alphapng._expression(this)) }");
A.css.insertRule(".alpha { behavior: expression(uu.module.ieboost.alphapng._expression(this)) }")}};A.mix(A.module.ieboost.alphapng,{_expression:function(K){var J=A.config.imagePath,F="b32.png",H=RegExp(F),E,D,G,I=0;switch(K.tagName.toLowerCase()){case"img":if(/.png$/i.test(K.src)){if(H.test(K.src)){break}K.uuIEBoostAlphapngSrc=K.src;D=K.width;G=K.height;A.module.ieboost.alphapng._setAlphaLoader(K,K.src,"image");K.src=J+F;K.width=D;K.height=G;++I}else{if(!H.test(K.src)&&!(/^data:/.test(K.src))){K.uuIEBoostAlphapngSrc=K.src;A.module.ieboost.alphapng._unsetAlphaLoader(K);K.style.width="auto";K.style.height="auto"}}break;case"input":if(K.type!=="image"){break}if(/.png$/i.test(K.src)){if(H.test(K.src)){break}K.uuIEBoostAlphapngSrc=K.src;A.module.ieboost.alphapng._setAlphaLoader(K,K.src,"image");
K.src=J+F;K.style.zoom=1;++I}else{if(!H.test(K.src)){K.uuIEBoostAlphapngSrc=K.src;A.module.ieboost.alphapng._unsetAlphaLoader(K);K.style.width="auto";K.style.height="auto"}}break;default:E=A.css.backgroundImage(K);if(E==="none"){A.module.ieboost.alphapng._unsetAlphaLoader(K);break}if(H.test(E)){break}if(/.png$/i.test(E)){A.module.ieboost.alphapng._setAlphaLoader(K,E,"crop");K.style.backgroundImage="url("+J+F+")";K.style.zoom=1;++I}else{A.module.ieboost.alphapng._unsetAlphaLoader(K)}}if(I){A.module.ieboost.alphapng._bugfix(K)}if(!("uuIEBoostAlphapngSpy" in K)){K.attachEvent("onpropertychange",A.module.ieboost.alphapng._onpropertychange);K.uuIEBoostAlphapngSpy=1}K.style.behavior="none"},_onpropertychange:function(){var D=C.event;switch(D.propertyName){case"style.backgroundImage":case"src":A.module.ieboost.alphapng._expression(D.srcElement);
break}},_setAlphaLoader:function(G,D,F){var E="DXImageTransform.Microsoft.AlphaImageLoader";if(G.filters.length&&E in G.filters){G.filters[E].enabled=1;G.filters[E].src=D}else{G.style.filter+=" progid:"+E+"(src='"+D+"', sizingMethod='"+F+"')"}},_unsetAlphaLoader:function(E){var D="DXImageTransform.Microsoft.AlphaImageLoader";if(E.filters.length&&D in E.filters){E.filters[D].enabled=0}},_bugfix:function(H){var D=0,F=H.childNodes.length,G;function E(I){switch(I.tagName.toLowerCase()){case"a":I.style.cursor="pointer";case"input":case"select":case"textarea":!I.style.position&&(I.style.position="relative")}}E(H);for(;D<F;++D){G=H.childNodes[D];if(G.nodeType===1){E(G);G.firstChild&&A.module.ieboost.alphapng._bugfix(G)}}}});A.module.ieboost.opacity=A.klass.kiss();A.module.ieboost.opacity.prototype={construct:function(){this.recalc()
},recalc:function(){var E,D;A.forEach(A.tag("*",B.body),function(F){D=F.style.opacity||F.currentStyle.opacity;if(D){E=parseFloat(D);if(E>=0&&E<=1){A.css.setOpacity(F,E)}}})}};A.module.ieboost.datascheme=A.klass.kiss();A.module.ieboost.datascheme.prototype={construct:function(){this._obj=new A.module.datascheme(48,48,0,0)}};A.module.ieboost.positionFixed=A.klass.kiss();A.module.ieboost.positionFixed.prototype={construct:function(){this._recalc=[];A.ua.std?A.css.insertRule(".positionfixed { behavior: expression(uu.module.ieboost.positionFixed._expression(this)) }"):A.css.insertRule(".positionfixed { behavior: expression(uu.module.ieboost.positionFixed._expressionQuirks(this)) }");this.markup()},recalc:function(){var D=[];this._recalc.forEach(function(F,G){if(!F||F.nodeType!==1){D.push(G);return 
}if(!F||!("uuIEBoostPositionFixed" in F)){return }var H=F.currentStyle,E;if(F.uuIEBoostPositionFixed.top){if(F.uuIEBoostPositionFixed.value.lastIndexOf("em")>-1){F.uuIEBoostPositionFixed.px=A.css.toPixel(F,H.paddingTop)+parseFloat(F.uuIEBoostPositionFixed.value)*A.css.measure().em}}else{E=A.viewport.rect(),rect=A.element.rect(F);if(F.uuIEBoostPositionFixed.value.lastIndexOf("em")>-1){F.uuIEBoostPositionFixed.px=E.h-rect.oh-(parseFloat(F.uuIEBoostPositionFixed.value)*A.css.measure().em)}else{F.uuIEBoostPositionFixed.px=E.h-rect.oh-A.css.toPixel(F,F.uuIEBoostPositionFixed.value)}}});if(this._recalc.length){B.recalc(1)}if(D.length){D.forEach(function(E){delete this._recalc[E]});A.diet(this._recalc)}},markup:function(){var H=this,D=A.tag("*"),F,E,G;D.forEach(function(J){if(!J||J.nodeType!==1){return 
}var K=J.currentStyle,L,I;if(K.position==="fixed"&&!("uuIEBoostPositionFixed" in J)){L=K.top||J.style.top||0;I=K.bottom||J.style.bottom||0;if(L!=="auto"){if(A.isS(L)&&L.lastIndexOf("em")>-1){H._recalc.push(J)}J.uuIEBoostPositionFixed={top:1,value:L,px:A.css.toPixel(J,K.paddingTop)+A.css.toPixel(J,L)}}else{E=A.viewport.rect();G=A.element.rect(J);H._recalc.push(J);J.uuIEBoostPositionFixed={top:0,value:I,px:E.h-G.oh-A.css.toPixel(J,I)}}A.klass.toggle(J,"positionfixed");J.style.position="absolute"}});if(D.length){if(A.css.backgroundImage(B.body)==="none"){A.css.setBackgroundImage(B.body,"none")}B.body.style.backgroundAttachment="fixed";F=A.tag("html")[0];if(A.css.backgroundImage(F)==="none"){A.css.setBackgroundImage(F,"none")}F.style.backgroundAttachment="fixed"}}};A.mix(A.module.ieboost.positionFixed,{_expression:function(D){D.style.top=(document.documentElement.scrollTop+D.uuIEBoostPositionFixed.px)+"px"
},_expressionQuirks:function(D){D.style.top=(document.body.scrollTop+D.uuIEBoostPositionFixed.px)+"px"}});A.module.ieboost.positionAbsolute=A.klass.kiss();A.module.ieboost.positionAbsolute.prototype={construct:function(){this._find=0;this.recalc()},recalc:function(){if(this._find){return }var E=0,G,D=A.tag("*",B.body),F=0,H=D.length;for(;F<H;++F){G=D[F].currentStyle||D[F].style;if(G.position==="absolute"){++E;break}}if(E){B.body.style.height="100%";A.tag("html")[0].style.height="100%";++this._find}}};A.module.ieboost.shim=A.klass.kiss();A.module.ieboost.shim.prototype={construct:function(E,D){this.elm=E;this.shim=0;if(A.ua.ie6){this.shim=B.createElement('<iframe scrolling="no" frameborder="0" style="position:absolute;top:0;left:0"></iframe>');E.parentNode.appendChild(this.shim);A.css.setRect(this.shim,A.css.rect(E));
if(D){this.shim.style.filter+=" alpha(opacity=0)"}}},enable:function(){return !!this.shim},display:function(D){this.shim.style.display=D?"":"none"},setRect:function(D){if(!this.shim){return }A.css.setRect(this.shim,D)},purge:function(){if(!this.shim){return }this.elm.parentNode.removeChild(this.shim);this.shim=0}};A.ieboost=0;if(!A.ua.ie){return }A.ready(function(){A.ieboost=new A.module.ieboost()},"D");A.mix(A.css,{recalc:function(D){A.msg.post(A.ieboost,"recalc",D||0)}})})();