(function(){var B=window,A=B.uu;A.module.canvas2={};A.module.context2dDebug=A.basicClass();A.module.context2dDebug.prototype={construct:function(C){this.ctx=C;this.stackSize=0;this.zoom=[1,1];this.offset=[0,0];this.rotate=0;this.clip=false;this.mode=0;this.historyIndex=0;this.cmdHistory=[[]];this.penHistory=[[]];this.x=0;this.y=0},info:function(){return{canvas:this.ctx.canvas,context:this.ctx,w:this.ctx.canvas.width,h:this.ctx.canvas.height,mix:this.ctx.globalCompositeOperation,alpha:this.ctx.globalAlpha,pos:{x:this.x,y:this.y},zoom:{x:this.zoom.x,y:this.zoom.y},offset:{x:this.offset.x,y:this.offset.y},rotate:this.rotate,clip:this.clip,stackSize:this.stackSize,mode:this.mode,penHistoryLength:this.penHistory.length,cmdHistoryLength:this.cmdHistory.length}},push:function(){this.ctx.save();++this.stackSize;
return this},pop:function(){if(this.stackSize){--this.stackSize;this.ctx.restore()}return this},reset:function(){this.ctx.strokeStyle="black";this.ctx.fillStyle="black";this.ctx.lineWidth=1;this.ctx.lineCap="butt";this.ctx.lineJoin="miter";this.ctx.miterLimit=10;this.ctx.shadowBlur=0;this.ctx.shadowColor="black";this.ctx.globalAlpha=1;this.ctx.globalComposite="source-over";this.stackSize=0;this.zoom(1,1);this.offset(0,0);this.rotate(0);this.clip=false;this.ctx.beginPath();this.ctx.rect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);this.ctx.clip();this.mode=0;this.historyIndex=0;this.cmdHistory=[[]];this.penHistory=[[]];this.x=0;this.y=0;return this},toDataURL:function(C){this.ctx.canvas.toDataURL(C||"image/png")},_posRec:function(C,D){if(this.mode===1){this.penHistory[this.historyIndex].push([C,D])
}},_cmdRec:function(C,D){if(this.mode===1){this.cmdHistory[this.historyIndex].push(A.toArray(arguments))}},record:function(){this.mode=1;this.penHistory[this.historyIndex]=[];this.cmdHistory[this.historyIndex]=[]},play:function(C){C=C||A.mute;this.mode=2;this.cmdHistory[this.historyIndex].forEach(function(D){var E=D[this.memid],F=D.slice(1);if(E in this){this.cmd.apply(this,F)}C()})},stop:function(){this.mode=0},ctx:function(){return this.ctx},mix:function(C){this._cmdRec("mix",C);return this._mix(C)},alpha:function(C){this._cmdRec("alpha",C);return this._alpha(C)},clear:function(C,F,D,E){this._cmdRec("clear",C,F,D,E);return this._clear(C,F,D,E)},begin:function(C,D){this._cmdRec("begin",C,D);return this._begin(C,D)},close:function(C,D){this._cmdRec("close",C,D);return this._close(C,D)},move:function(C,D){this._cmdRec("move",C,D);
return this._move(C,D)},line:function(C,D){if(!A.isA(C)||poing.length%2){throw TypeError("uu.module.context2dDebug.line(point)")}this._cmdRec("line",C,D);return this._line(C,D)},arcLine:function(C,E,D){if(!A.isA(C)||poing.length%2){throw TypeError("uu.module.context2dDebug.arcLine(point)")}this._cmdRec("arcLine",C,E,D);return this._arcTo(C,E,D)},fill:function(D,C){this._cmdRec("fill",D,C);if(D){return this._stroke(C)}return this._fill(C)},rect:function(C,G,D,F,E){this._cmdRec("rect",C,G,D,F,E);return this._rect(C,G,D,F,E)},arc:function(C,F,E,D){this._cmdRec("arc",C,F,E,D);return this._arc(C,F,E,D)},curve:function(C,E,D){if(!A.isA(C)||poing.length%2){throw TypeError("uu.module.context2dDebug.curve(point)")}this._cmdRec("curve",C,E,D);return this._curve(C,E,D)},clip:function(){this.clip=true;
this._cmdRec("clip");this.ctx.clip();return this},drawBox:function(C,H,D,F,G,E){this._cmdRec("box",C,H,D,F,fill,E);if(G){return this._storokeRect(C,H,D,F,E)}return this._fillRect(C,H,D,F,E)},zoom:function(C,D){this._cmdRec("zoom",C,D);this.zoom[0]=C;this.zoom[1]=D;this.ctx.scale(C,D);return this},offset:function(C,D){this._cmdRec("offset",C,D);this.offset[0]=C;this.offset[1]=D;this.ctx.translate(C,D);return this},rotate:function(C){this._cmdRec("rotate",C);this.rotate=C;this.ctx.rotate(C*Math.RADIAN);return this},gradation:function(C,E,D){this._cmdRec("gradation",C,E,D);var G,F=0;if(E||typeof E==="undefined"){G=this.ctx.createLinearGradient(C[0],C[1],C[2],C[3])}else{G=this.ctx.createRadialGradient(C[0],C[1],C[2],C[3],C[4],C[5])}if(A.isA(D)){for(;F<D.length;F+=2){G.addColorStop(color[F],color[F+1])
}}return G},drawImage:function(D,H,G,I,E,K,J,C,F){switch(arguments.length){case 1:this.ctx.drawImage(D,0,0);break;case 3:this.ctx.drawImage(D,H,G);break;case 5:this.ctx.drawImage(D,H,G,I,E);break;case 9:this.ctx.drawImage(D,H,G,I,E,K,J,C,F);break}return this},PRESET_GRADATION_REFRECTION_IMAGE:0,createPresetGradation:function(C,D){switch(C){case this.PRESET_GRADATION_REFRECTION_IMAGE:return this.gradation(0,D[0],0,0,[0,"rgba(0, 0, 0, 0.5)",1,"rgba(0, 0, 0, 1.0)"])}return null},drawReflectImage:function(F,C,I,E,H,D){var G=(typeof D!=="undefined")?D:this.createPresetGradation(this.PRESET_GRADATION_REFRECTION_IMAGE,[H]);this.push().translate(0,H*2).scale(1,-1).drawImage(F,C,I);this.mix("destination-out").fillRect(C,I,E,H,G);this.pop();this.drawImage(F,C,I)},drawQuickReflectScaledImage:function(D,J,I,K,E,C,G,H){var F=(typeof H!=="undefined")?H:this.createPresetGradation(this.PRESET_GRADATION_REFRECTION_IMAGE,[E]);
this.push();this.translate(J,I);this.scale(C,C);this.drawImage(D);this.pop();this.push();this.translate(J,I+E*2*C).scale(C,-C).drawImage(D);this.mix("destination-out").fillRect(0,0,K,E,F);this.pop()},drawReflectScaledImage:function(E,J,H,L,F,C,G){var K=G||50,D,I;this.push();this.translate(J,H);this.scale(C,C);this.drawImage(E);this.pop();this.push();this.translate(J,H+F*2*C).scale(C,-C);for(D=2,I=K/100;D<K/C;I-=0.01,D+=2){this.alpha(I).drawImage(E,0,F-D,L,2,0,F-D,L,2)}this.pop()},drawFixedImage:function(F){var I=F.width,G=F.height,E=this.ctx.canvas.width,C=this.ctx.canvas.height,K=(I<=E)?Math.floor((E-I)/2):0,J=(G<=C)?Math.floor((C-G)/2):0,D=(I<=E)?I:E,H=(G<=C)?G:C;return this.drawImage(F,0,0,I,G,K,J,D,H)},_mix:function(C){this.ctx.globalCompositeOperation=C;return this},_alpha:function(C){this.ctx.globalAlpha=C;
return this},_clear:function(C,F,D,E){if(arguments.length){if(D<0){C-=D;D=-D}if(E<0){F-=E;E=-E}this.ctx.clearRect(C,F,D,E)}else{this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)}return this},_begin:function(C,D){this.ctx.beginPath();if(arguments.length){this._posRec(this.x=C||this.x,this.y=D||this.y);this.ctx.moveTo(this.x,this.y)}return this},_close:function(C,D){this.ctx.closePath();if(arguments.length){this._posRec(this.x=C||this.x,this.y=D||this.y);this.ctx.moveTo(this.x,this.y)}return this},_move:function(C,D){this._posRec(this.x=C||this.x,this.y=D||this.y);this.ctx.moveTo(this.x,this.y);return this},_line:function(C,E){var D=0,F=C.length;if(E){this._lineStyle(E)}for(;D<F;D+=2){this._posRec(this.x=C[D],this.y=C[D+1]);this.ctx.lineTo(this.x,this.y)}return this},_fill:function(C){if(C){this._fillStyle(C)
}this.ctx.fill();return this},_rect:function(C,G,D,F,E){if(E){this._lineStyle(E)}this._posRec(this.x=C||this.x,this.y=G||this.y);this.ctx.rect(this.x,this.y,D,F);return this},_arc:function(C,F,E,D){if(D){this._lineStyle(D)}this._posRec(this.x=C||this.x,this.y=F||this.y);E=A.mix.param(E||{},{r:100,a0:0,a1:359,clock:true});this.ctx.arc(this.x,this.y,E.r,E.a0*Math.RADIAN,E.a1*Math.RADIAN,!clock);return this},_arcTo:function(C,E,D){if(D){this._lineStyle(D)}this.ctx.arc(C[0],C[1],C[2],C[3],E);return this},_curve:function(C,E,D){if(D){this._lineStyle(D)}if(E){return this.ctx.bezierCurveTo(C[0],C[1],C[2],C[3],C[4],C[5])}return this.ctx.quadraticCurveTo(C[0],C[1],C[2],C[3])},_stroke:function(C){if(C){this._strokeStyle(C)}this.ctx.stroke();return this},_lineStyle:function(C){A.mix(this.ctx,C);return this
},_fillStyle:function(C){this.ctx.fillStyle=C;return this},_strokeStyle:function(C){this.ctx.strokeStyle=C;return this},_fillRect:function(D,H,E,G,C,F){if(F){this._fillStyle(F)}this._posRec(this.x=this._posX(D,C),this.y=this._posY(H,C));this.ctx.fillRect(this.x,this.y,E,G);return this},_storokeRect:function(D,H,E,G,C,F){if(F){this._storokeStyle(F)}this._posRec(this.x=this._posX(D,C),this.y=this._posY(H,C));this.ctx.strokeRect(this.x,this.y,E,G);return this}}})();