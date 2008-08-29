/** Effect Plus Module
 *
 * @author Takao Obara <com.gmail@js.uupaa>
 * @license uupaa.js is licensed under the terms and conditions of the MIT licence.
 * @see <a href="http://code.google.com/p/uupaa-js/">Home(Google Code)</a>
 * @see <a href="http://uupaa-js.googlecode.com/svn/trunk/README.htm">README</a>
 */
(function() { var uud = document, uuw = window, uu = uuw.uu;

uu.module["effect+"] = {};

uu.mix(uu.module.effect.prototype, {
  // ToDo: 100px以上の大きな画像に対応できていない
  // uu.module.effect.wave, uu.effect.wave
  wave:     function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var pp = this._prepare(elm, param), rect = uu.css.show(elm, 1),
                  me = this, lineHeight = pp.speed < 300 ? 6 : pp.speed < 800 ? 4 : 1,
                  i = 0, rows = Math.round(elm.height / lineHeight),
                  delta = 1 / (pp.speed / 10), time = 0, hz = 4, down = hz / 2 * delta,
                  lines = [], wavetbl = [], holder = uud.createElement("div"),
                  cs = uu.css.get(elm), ox = 0, oy = 0;

              holder.style.cssText =
                uu.sprintf("position:absolute;left:%dpx;top:%dpx;width:%dpx;height:%dpx;" +
                           "overflow:hidden;visibility:hidden;z-index:%d",
                           rect.x - 10, rect.y, rect.w + 20, rect.h, uu.css.get(elm, "zIndex"));
              uud.body.appendChild(holder);

              // margin,padding,border分のoffsetをtop,leftに加算する
              ox = parseInt(cs.marginLeft) + parseInt(cs.paddingLeft) + parseInt(cs.borderLeftWidth);
              oy = parseInt(cs.marginTop)  + parseInt(cs.paddingTop)  + parseInt(cs.borderTopWidth);
              holder.style.left = parseInt(holder.style.left) + ox + "px";
              holder.style.top  = parseInt(holder.style.top)  + oy + "px";

              for (; i < rows; ++i) {
                wavetbl[i] = 0;
                lines[i] = uud.createElement("div");
                lines[i].style.cssText =
                  uu.sprintf("background:url(%s) no-repeat %dpx -%dpx;" + 
                             "position:absolute;left:%dpx;top:%dpx;width:%dpx;height:%dpx",
                             elm.src, 0, i * lineHeight, 50, i * lineHeight, rect.w, lineHeight);
                holder.appendChild(lines[i]);
              }
              holder.style.visibility = "visible";
              uu.css.setRect(elm, { x: -3333, y: -3333 }); // 画面外に移動

              function FIN() {
                uu.node.remove(holder);
                uu.css.setRect(elm, { x: rect.x, y: rect.y }); // 画面外から呼び戻す
                me._revert(elm, pp.revert); pp.fn(elm);
              }
              function NEXT(hz, time) {
                for (var i = rows - 1; i > 0; --i) {
                  wavetbl[i] = wavetbl[i - 1];
                  lines[i].style.left = (10 + wavetbl[i]) + "px";
                }
                wavetbl[0] = Math.round(Math.sin(2.0 * Math.PI * hz * time) * 10);
                lines[0].style.left = (10 + wavetbl[0]) + "px";
              }
              function loop(step) {
                switch (step) {
                case 1: time += delta;
                        return time < 1.0;
                case 2: if (time > 0.3) { hz -= down; hz = (hz > 0) ? hz : 0; }
                        NEXT(hz, time);
                        break;
                case 4: FIN();
                }
                return true;
              }
              this._core(10, loop);
            }
});

uu.ua.ie && uu.mix(uu.module.effect.prototype, {
  wave:     function(elm, param /* = { speed, fn, keep: false, revert: false } */) {
              var pp = this._prepare(elm, param), rect = uu.css.show(elm, 1),
                  me = this, delta = 1 / (pp.speed / 10), time = 0,
                  id = "DXImageTransform.Microsoft.Wave";

              uu.css.setRect(elm, { x: rect.x - 4 }); // -4px
              elm.style.filter += " progid:" + id + "(add=0,freq=4,lightstrength=0,phase=0,strength=4)";

              function FIN() {
                uu.css.setRect(elm, { x: rect.x });
                elm.filters[id].enabled = 0;
                me._revert(elm, pp.revert); pp.fn(elm);
              }
              function NEXT(time) {
                elm.filters[id].phase = time * 100;
              }
              function loop(step) {
                switch (step) {
                case 1: time += delta;
                        return time < 1.0;
                case 2: NEXT(time);
                        break;
                case 4: FIN();
                }
                return true;
              }
              this._core(10, loop);
            }
});

})(); // end (function())()
