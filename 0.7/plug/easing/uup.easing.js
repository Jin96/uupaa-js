
// === easing ===
/*
  The original writer in this code block is Robert Penner.
    http://www.robertpenner.com/easing/
 */
/*
  TERMS OF USE - EASING EQUATIONS

  Open source under the BSD License.

  Copyright (c) 2001 Robert Penner
  All rights reserved.

  Redistribution and use in source and binary forms,
  with or without modification, are permitted provided that the following
  conditions are met:

  * Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer
    in the documentation and/or other materials provided with the distribution.

  * Neither the name of the author nor the names of contributors
    may be used to endorse or promote products derived
    from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
  FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
  WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
  THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function(_math) {
var _pow = _math.pow,
    _sin = _math.sin,
    _cos = _math.cos,
    _abs = _math.abs,
    _sqrt= _math.sqrt,
    _asin= _math.asin,
    _hpi = _math.PI / 2,
    _dpi = _math.PI * 2;

function mix(base, flavor) {
  for (var i in flavor) {
    base[i] = flavor[i];
  }
}

mix(Math, {
  linear:             aa,
  linearTween:        aa, // [alias]
  easeInQuad:         ab,
  easeOutQuad:        ac,
  easeInOutQuad:      ad,
  easeInCubic:        ae,
  easeOutCubic:       af,
  easeInOutCubic:     ag,
  easeOutInCubic:     ah,
  easeInQuart:        ai,
  easeOutQuart:       aj,
  easeInOutQuart:     ak,
  easeOutInQuart:     al,
  easeInQuint:        am,
  easeOutQuint:       an,
  easeInOutQuint:     ao,
  easeOutInQuint:     ap,
  easeInSine:         aq,
  easeOutSine:        ar,
  easeInOutSine:      as,
  easeOutInSine:      at,
  easeInExpo:         au,
  easeOutExpo:        av,
  easeInOutExpo:      aw,
  easeOutInExpo:      ax,
  easeInCirc:         ay,
  easeOutCirc:        az,
  easeInOutCirc:      ba,
  easeOutInCirc:      bb,
  easeInElastic:      bc,
  easeOutElastic:     bd,
  easeInOutElastic:   be,
  easeOutInElastic:   bf,
  easeInBack:         bg,
  easeOutBack:        bh,
  easeInOutBack:      bi,
  easeOutInBack:      bj,
  easeInBounce:       bk,
  easeOutBounce:      bl,
  easeInOutBounce:    bm,
  easeOutInBounce:    bn 
});

// t:Number - current time
// b:Number - beginning value 
// c:Number - change in value(delta)
// d:Number - duration(unit: ms)
function aa(t,b,c,d) { return c*t/d+b; }
function ab(t,b,c,d) { return c*(t/=d)*t+b; }
function ac(t,b,c,d) { return -c*(t/=d)*(t-2)+b; }
function ad(t,b,c,d) { return (t/=d/2)<1?c/2*t*t+b
                                        :-c/2*((--t)*(t-2)-1)+b; }
function ae(t,b,c,d) { return c*(t/=d)*t*t+b; }
function af(t,b,c,d) { return c*((t=t/d-1)*t*t+1)+b; }
function ag(t,b,c,d) { return (t/=d/2)<1?c/2*t*t*t+b
                                        :c/2*((t-=2)*t*t+2)+b; }
function ah(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?af(n1,b,n2,d)
                                   :ae(n1-d,b+n2,n2,d); }
function ai(t,b,c,d) { return c*(t/=d)*t*t*t+b; }
function aj(t,b,c,d) { return -c*((t=t/d-1)*t*t*t-1)+b; }
function ak(t,b,c,d) { return (t/=d/2)<1?c/2*t*t*t*t+b
                                        :-c/2*((t-=2)*t*t*t-2)+b; }
function al(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?aj(n1,b,n2,d)
                                   :ai(n1-d,b+n2,n2,d); }
function am(t,b,c,d) { return c*(t/=d)*t*t*t*t+b; }
function an(t,b,c,d) { return c*((t=t/d-1)*t*t*t*t+1)+b; }
function ao(t,b,c,d) { var n1=t*t*t*t,n2=c/2;
                       return (t/=d/2)<1?n2*n1*t+b
                                        :n2*((t-=2)*n1+2)+b; }
function ap(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?an(n1,b,n2,d)
                                   :am(n1-d,b+n2,n2,d); }
  
function aq(t,b,c,d) { return -c*_cos(t/d*_hpi)+c+b; }
function ar(t,b,c,d) { return c*_sin(t/d*_hpi)+b; }
function as(t,b,c,d) { return -c/2*(_cos(_math.PI*t/d)-1)+b; }
function at(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?ar(n1,b,n2,d)
                                   :aq(n1-d,b+n2,n2,d); }
function au(t,b,c,d) { return !t?b:c*_pow(2,10*(t/d-1))+b-c*0.001; }
function av(t,b,c,d) { return t===d?b+c:c*1.001*(-_pow(2,-10*t/d)+1)+b; }
function aw(t,b,c,d) { if(!t){return b;}
                       if(t===d){return b+c;}
                       return (t/=d/2)<1?(c/2*_pow(2,10*(t-1))+b-c*0.0005)
                                        :(c/2*1.0005*(-_pow(2,-10*--t)+2)+b); }
function ax(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?av(n1,b,n2,d)
                                   :au(n1-d,b+n2,n2,d); }
function ay(t,b,c,d) { return -c*(_sqrt(1-(t/=d)*t)-1)+b; }
function az(t,b,c,d) { return c*_sqrt(1-(t=t/d-1)*t)+b; }
function ba(t,b,c,d) { return (t/=d/2)<1?-c/2*(_sqrt(1-t*t)-1)+b
                                        :c/2*(_sqrt(1-(t-=2)*t)+1)+b; }
function bb(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?az(n1,b,n2,d)
                                   :ay(n1-d,b+n2,n2,d); }
function bc(t,b,c,d,a,p) {
  var s;
  if(!t){return b;}
  if((t/=d)===1){return b+c;}
  if(!p){p=d*0.3;}
  if(!a||a<_abs(c)){a=c;s=p/4;}
  else{s=p/_dpi*_asin(c/a);}
  return -(a*_pow(2,10*(t-=1))*_sin((t*d-s)*_dpi/p))+b;
}
function bd(t,b,c,d,a,p) {
  var s;
  if(!t){return b;}
  if((t/=d)===1){return b+c;}
  if(!p){p=d*0.3;}
  if(!a||a<_abs(c)){a=c;s=p/4;}
  else{s=p/_dpi*_asin(c/a);}
  return (a*_pow(2,-10*t)*_sin((t*d-s)*_dpi/p)+c+b);
}
function be(t,b,c,d,a,p) {
  var s,n1;
  if(!t){return b;}
  if((t/=d/2)==2){return b+c;}
  if(!p){p=d*(0.3*1.5);}
  if(!a||a<_abs(c)){a=c;s=p/4;}
  else{s=p/_dpi*_asin(c/a);}
  n1=_sin((t*d-s)*_dpi/p);
  if(t<1){return -0.5*(a*_pow(2,10*(t-=1))*n1)+b;}
  return a*_pow(2,-10*(t-=1))*n1*0.5+c+b;
}
function bf(t,b,c,d,a,p) {
  var n1=t*2,n2=c/2;
  return t<d/2?bd(n1,b,n2,d,a,p)
              :bc(n1-d,b+n2,n2,d,a,p);
}
function bg(t,b,c,d,s) {
  if(s===void 0){s=1.70158;}
  return c*(t/=d)*t*((s+1)*t-s)+b;
}
function bh(t,b,c,d,s) {
  if(s===void 0){s=1.70158;}
  return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;
}
function bi(t,b,c,d,s) {
  var n1=1.525;
  if(s===void 0){s=1.70158;}
  return (t/=d/2)<1?(c/2*(t*t*(((s*=n1)+1)*t-s))+b)
                   :(c/2*((t-=2)*t*(((s*=n1)+1)*t+s)+2)+b);
}
function bj(t,b,c,d,s) {
  var n1=t*2,n2=c/2;
  return t<d/2?bh(n1,b,n2,d,s)
              :bg(n1-d,b+n2,n2,d,s);
}
function bk(t,b,c,d) { return c-bl(d-t,0,c,d)+b; }
function bl(t,b,c,d) { var n1=7.5625,n2=2.75;
                       if((t/=d)<(1/n2)){return c*(n1*t*t)+b;}
                       else if(t<(2/n2)){return c*(n1*(t-=(1.5/n2))*t+.75)+b;}
                       return t<(2.5/n2)?(c*(n1*(t-=(2.25/n2))*t+.9375)+b)
                                        :(c*(n1*(t-=(2.625/n2))*t+.984375)+b); }
function bm(t,b,c,d) { var n1=t*2,n2=0.5;
                       return t<d/2?bk(n1,0,c,d)*n2+b
                                   :bl(n1-d,0,c,d)*n2+c*n2+b; }
function bn(t,b,c,d) { var n1=t*2,n2=c/2;
                       return t<d/2?bl(n1,b,n2,d)
                                   :bk(n1-d,b+n2,n2,d); }

})(Math);

