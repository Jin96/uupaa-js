(function(){var B=window,A=B.uu;A.module.polygon=A.klass.generic();A.module.polygon.prototype={construct:function(C){this.param=A.mix.param(C||{},{fps:50});this.fps=1000/C.fps;this.cube=[];this.tmid=-1},add:function(F){F=A.mix.param(F||{},{highLight:64,color:0,opacity:1,x:0,y:0,zoom:600,phi:Math.PI/100,theta:Math.PI/80});var D=[[],[],[],[],[],[]],C=0,G,E;for(;C<5;++C){G=(!C)?0:Math.SQRT2*Math.cos((0.5*C-0.25)*Math.PI);E=(!C)?0:Math.SQRT2*Math.sin((0.5*C-0.25)*Math.PI);D[0].push([G,E,1]);D[1].push([1,G,E]);D[2].push([E,1,G]);D[3].push([-G,-E,-1]);D[4].push([-1,-G,-E]);D[5].push([-E,-1,-G])}this.cube.push(A.mix(F,{_data:D,_theta:0.5,_phi:0.5}))},draw:function(C,E){if(this.tmid!==-1){return }var D=this;if(E||false){this.tmid=B.setInterval(function(){C.clearRect(0,0,C.canvas.width,C.canvas.height);
D.cube.forEach(function(F){F._phi+=F.phi;F._theta+=F.theta;D._drawPolygon(C,F)})},this.fps)}else{C.clearRect(0,0,C.canvas.width,C.canvas.height);D.cube.forEach(function(F){D._drawPolygon(C,F)})}},_drawPolygon:function(N,G){var T=Math.sin(G._phi),L=Math.cos(G._phi),R=Math.sin(G._theta),K=Math.cos(G._theta),S=G._data,F=[-T,L,0],E=[-K*L,-K*T,R],D=[-R*L,-R*T,-K],Q=[],J,I,H,P,O,C,M;for(P=0;P<S.length;++P){M=[0,-(D[0]*S[P][0][0]+D[1]*S[P][0][1]+D[2]*S[P][0][2])];for(O=1;O<S[P].length;++O){H=D[0]*S[P][O][0]+D[1]*S[P][O][1]+D[2]*S[P][O][2];M.push([F[0]*S[P][O][0]+F[1]*S[P][O][1]+F[2]*S[P][O][2],E[0]*S[P][O][0]+E[1]*S[P][O][1]+E[2]*S[P][O][2],H]);M[0]+=H}Q.push(M)}Q.sort(this._sort);for(P=0;P<Q.length;++P){Q[P].shift();C=Q[P].shift();if(C>=0){for(O=0;O<Q[P].length;++O){J=G.zoom*Q[P][O][0]/(10+Q[P][O][2]);
I=G.zoom*Q[P][O][1]/(10+Q[P][O][2]);if(!O){N.beginPath();N.moveTo(G.x+J,G.y+-I);N.fillStyle=this._rgba(G.color,parseInt(C*G.highLight),G.opacity)}else{N.lineTo(G.x+J,G.y+-I)}}N.closePath();N.fill()}}},_sort:function(D,C){if(D[0]===C[0]){return 0}return D[0]<C[0]?1:-1},_rgba:function(C,E,D){var F=[Math.min(((C>>16)&255)+E,255),Math.min(((C>>8)&255)+E,255),Math.min((C&255)+E,255),D];return"rgba("+F.join(",")+")"}}})();