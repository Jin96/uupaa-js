// === Easing ==============================================
// depend: none
uu.feat.easing = {};

/*
  This code block from [Robert Penner's EASING EQUATIONS]
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

(function() {
var _halfPI = Math.PI / 2,
    _dblPI  = Math.PI * 2;

uu.mix(Math, {
  // t:Number - current time
  // b:Number - beginning value 
  // c:Number - change in value
  // d:Number - duration(unit: ms)
  linearTween:      function(t, b, c, d) { return c*t/d+b; },
  easeInQuad:       function(t, b, c, d) { return c*(t/=d)*t+b; },
  easeOutQuad:      function(t, b, c, d) { return -c*(t/=d)*(t-2)+b; },
  easeInOutQuad:    function(t, b, c, d) { return (t/=d/2)<1?c/2*t*t+b:-c/2*((--t)*(t-2)-1)+b; },
  easeInCubic:      function(t, b, c, d) { return c*(t/=d)*t*t+b; },
  easeOutCubic:     function(t, b, c, d) { return c*((t=t/d-1)*t*t+1)+b; },
  easeInOutCubic:   function(t, b, c, d) { return (t/=d/2)<1?c/2*t*t*t+b:c/2*((t-=2)*t*t+2)+b; },
  easeOutInCubic:   function(t, b, c, d) { return t<d/2?Math.easeOutCubic(t*2,b,c/2,d):Math.easeInCubic((t*2)-d,b+c/2,c/2,d); },
  easeInQuart:      function(t, b, c, d) { return c*(t/=d)*t*t*t+b; },
  easeOutQuart:     function(t, b, c, d) { return -c*((t=t/d-1)*t*t*t-1)+b; },
  easeInOutQuart:   function(t, b, c, d) { return (t/=d/2)<1?c/2*t*t*t*t+b:-c/2*((t-=2)*t*t*t-2)+b; },
  easeOutInQuart:   function(t, b, c, d) { return t<d/2?Math.easeOutQuart(t*2,b,c/2,d):Math.easeInQuart((t*2)-d,b+c/2,c/2,d); },
  easeInQuint:      function(t, b, c, d) { return c*(t/=d)*t*t*t*t+b; },
  easeOutQuint:     function(t, b, c, d) { return c*((t=t/d-1)*t*t*t*t+1)+b; },
  easeInOutQuint:   function(t, b, c, d) { return (t/=d/2)<1?c/2*t*t*t*t*t+b:c/2*((t-=2)*t*t*t*t+2)+b; },
  easeOutInQuint:   function(t, b, c, d) { return t<d/2?Math.easeOutQuint(t*2,b,c/2,d):Math.easeInQuint((t*2)-d,b+c/2,c/2,d); },
  easeInSine:       function(t, b, c, d) { return -c*Math.cos(t/d*_halfPI)+c+b; },
  easeOutSine:      function(t, b, c, d) { return c*Math.sin(t/d*_halfPI)+b; },
  easeInOutSine:    function(t, b, c, d) { return -c/2*(Math.cos(Math.PI*t/d)-1)+b; },
  easeOutInSine:    function(t, b, c, d) { return t<d/2?Math.easeOutSine(t*2,b,c/2,d):Math.easeInSine((t*2)-d,b+c/2,c/2,d); },
  easeInExpo:       function(t, b, c, d) { return !t?b:c*Math.pow(2,10*(t/d-1))+b-c*0.001; },
  easeOutExpo:      function(t, b, c, d) { return t===d?b+c:c*1.001*(-Math.pow(2,-10*t/d)+1)+b; },
  easeInOutExpo:    function(t, b, c, d) { if(!t){return b;}if(t===d){return b+c;}if((t/=d/2)<1){return c/2*Math.pow(2,10*(t-1))+b-c*0.0005;}return c/2*1.0005*(-Math.pow(2,-10*--t)+2)+b; },
  easeOutInExpo:    function(t, b, c, d) { return t<d/2?Math.easeOutExpo(t*2,b,c/2,d):Math.easeInExpo((t*2)-d, b+c/2, c/2, d); },
  easeInCirc:       function(t, b, c, d) { return -c*(Math.sqrt(1-(t/=d)*t)-1)+b; },
  easeOutCirc:      function(t, b, c, d) { return c*Math.sqrt(1-(t=t/d-1)*t)+b; },
  easeInOutCirc:    function(t, b, c, d) { return (t/=d/2)<1?-c/2*(Math.sqrt(1-t*t)-1)+b:c/2*(Math.sqrt(1-(t-=2)*t)+1)+b; },
  easeOutInCirc:    function(t, b, c, d) { return t<d/2?Math.easeOutCirc(t*2,b,c/2,d):Math.easeInCirc((t*2)-d,b+c/2,c/2,d); },
  easeInElastic:    function(t, b, c, d, a, p) { var s;if(!t){return b;}if((t/=d)===1){return b+c;}if(!p){p=d*0.3;}if(!a||a<Math.abs(c)){a=c;s=p/4;}else{s=p/_dblPI*Math.asin(c/a);}return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*_dblPI/p))+b; },
  easeOutElastic:   function(t, b, c, d, a, p) { var s;if(!t){return b;}if((t/=d)===1){return b+c;}if(!p){p=d*0.3;}if(!a||a<Math.abs(c)){a=c;s=p/4;}else{s=p/_dblPI*Math.asin(c/a);}return (a*Math.pow(2,-10*t)*Math.sin((t*d-s)*_dblPI/p)+c+b); },
  easeInOutElastic: function(t, b, c, d, a, p) { var s;if(!t){return b;}if((t/=d/2)==2){return b+c;}if(!p){p=d*(0.3*1.5);}if(!a||a<Math.abs(c)){a=c;s=p/4;}else{s=p/_dblPI*Math.asin(c/a);}if(t<1){return -0.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*_dblPI/p))+b;}return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*_dblPI/p)*0.5+c+b; },
  easeOutInElastic: function(t, b, c, d, a, p) { return t<d/2?Math.easeOutElastic(t*2,b,c/2,d,a,p):Math.easeInElastic((t*2)-d,b+c/2,c/2,d,a,p); },
  easeInBack:       function(t, b, c, d, s) { if(s===void 0){s=1.70158;}return c*(t/=d)*t*((s+1)*t-s)+b; },
  easeOutBack:      function(t, b, c, d, s) { if(s===void 0){s=1.70158;}return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b; },
  easeInOutBack:    function(t, b, c, d, s) { if(s===void 0){s=1.70158;}if((t/=d/2)<1){return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;}return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b; },
  easeOutInBack:    function(t, b, c, d, s) { return t<d/2?Math.easeOutBack(t*2,b,c/2,d,s):Math.easeInBack((t*2)-d,b+c/2,c/2,d,s); },
  easeInBounce:     function(t, b, c, d) { return c-Math.easeOutBounce(d-t,0,c,d)+b; },
  easeOutBounce:    function(t, b, c, d) { if((t/=d)<(1/2.75)){return c*(7.5625*t*t)+b;}else if(t<(2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t+0.75)+b;}else if(t<(2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t+0.9375)+b;}return c*(7.5625*(t-=(2.625/2.75))*t+0.984375)+b; },
  easeInOutBounce:  function(t, b, c, d) { return t<d/2?Math.easeInBounce(t*2,0,c,d)*0.5+b:Math.easeOutBounce(t*2-d,0,c,d)*0.5+c*0.5+b; },
  easeOutInBounce:  function(t, b, c, d) { return t<d/2?Math.easeOutBounce(t*2,b,c/2,d):Math.easeInBounce((t*2)-d,b+c/2,c/2,d); }
}, 0, 0);
})();
