(function(){var B=document,C=window,A=C.uu;A.module.image={};A.image=function(){};A.image.isLoaded=function(E){function D(F){return F.complete&&F.src===E}return A.toArray(B.images).some(D)};A.image.preload=function(E,G){var F=0,D,H=0;E=A.url.abs(E);G=G||A.mute;D=new Image();if(A.image.isLoaded(E)){D.src=E;G(1,E,D);return }D.onabort=D.onerror=function(){H++?0:G(0,E,D)};D.onload=function(){H++?0:((A.ua.opera&&!D.complete)?G(0,E,D):G(1,E,D))};D.src=E;if(!H&&A.image.timeout){C.setTimeout(function(){if(H){return }if((A.ua.gecko&&D.complete&&!D.width)||(F+=A.image.delay)>A.image.timeout){H++?0:G(0,E,D);return }C.setTimeout(arguments.callee,A.image.delay)},0)}};A.image.png24=function(E,D){};A.image.png24._file=A.config.imagePath+"uu.module.image.1x1.gif";A.image.png24._search=function(){};A.image.timeout=10000;
A.image.delay=50;if(A.config.png24&&A.ua.ie&&(A.ua.version>5&&A.ua.version<7)){A.image.png24=A.mix(function(G,F){var D,E;(A.isA(G)?G:[G]).forEach(function(H){if(!(F||false)&&H.uu_png24){return }D=H.width,E=H.height;H.style.filter='progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+H.src+'",sizingMethod=image)';A.mix(H,{src:A.image.png24._file,width:D,height:E,uu_png24:1})})},A.image.png24);A.image.png24._search=function(){var D=[];A.toArray(B.images).forEach(function(E){if(E.complete&&/.png$/i.test(E.src)){if((E.alt&&/24b/i.test(E.alt))||/24b/i.test(E.src)||A.klass.has(E,"alpha")){D.push(E)}}});return D};A.window.ready(function(){A.image.preload(A.image.png24._file,function(D){if(D){D&&A.image.png24(A.image.png24._search())}else{if(A.config.debug){throw Error("image not exist: "+A.image.png24._file)
}}})})}})();