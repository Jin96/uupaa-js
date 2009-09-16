// === uuGraphic.polygon ===
// depend: uuMeta
/*
 */
(function() {
var _polygon, // inner namespace
    _mm = uuMeta,
    _mix = _mm.mix;

function _polygon(hash) { // @param Hash: { fps = 50 }
  this.param = _mix(hash || {}, { fps: 50 }, 0, 0);
  this.fps = 10000 / 16 / hash.fps;
  this.cube = [];
  this.tmid = -1;
}

_polygon.prototype = {
  /** add - ポリゴンの追加
   *
   * @param Hash    [param]           - パラメタの指定です。
   * @param Number  [param.highLight] - ハイライトの強さを0x0～0xffで指定します。デフォルトは0x40です。
   * @param Number  [param.color]     - ポリゴンの色を指定します。0xff0000で赤, 0x00ff00で緑, 0x0000ffで青になります。デフォルトは0x000000(黒)です。
   * @param Number  [param.opacity]   - 不透明度を0.0～1.0の値で指定します。デフォルトは1.0(完全な不透明)です。
   * @param Number  [param.x]         - ポリゴンのx座標を指定します。デフォルトは0です。
   * @param Number  [param.y]         - ポリゴンのy座標を指定します。デフォルトは0です。
   * @param Number  [param.zoom]      - ポリゴンの拡大倍率を数値で指定します。デフォルトは600です。
   * @param Number  [param.phi]       - 縦軸の回転速度を指定します。デフォルトは0.03141592653589793(Math.PI / 100)です。
   * @param Number  [param.theta]     - 横軸の回転速度を指定します。デフォルトは0.1570796326794897(Math.PI / 80)です。
   */
  add: function(param) {
    param = _mix(param || {},
                 { highLight: 0x40, color: 0x000000,
                   opacity: 1.0, x: 0, y: 0, zoom: 600, 
                   phi: Math.PI / 100, theta: Math.PI / 80 }, 0, 0);

    var data = [[], [], [], [], [], []], // 6 = cube
        i = 0, v1, v2;

    for (; i < 5; ++i) {
      v1 = (!i) ? 0 : Math.SQRT2 * Math.cos((0.5 * i - 0.25) * Math.PI);
      v2 = (!i) ? 0 : Math.SQRT2 * Math.sin((0.5 * i - 0.25) * Math.PI);
      data[0].push([ v1,  v2,   1]);
      data[1].push([  1,  v1,  v2]);
      data[2].push([ v2,   1,  v1]);
      data[3].push([-v1, -v2,  -1]);
      data[4].push([ -1, -v1, -v2]);
      data[5].push([-v2,  -1, -v1]);
    }
    this.cube.push(_mix(param, { _data: data, _theta: 0.5, _phi: 0.5 }, 0, 0));
  },

  /** draw - 描画
   *
   * @param context2d ctx   - 描画先の2dコンテキストを指定します。
   * @param Boolean   [run] - 連続描画する場合にtrueを指定します。
   *                          falseを指定すると1度だけ描画します。
   *                          デフォルトはfalseです。
   */
  draw: function(ctx, run /* = false */) {
    if (this.tmid !== -1) {
      return;
    }

    var me = this, i = 0, v;

    if (run || false) {

      this.tmid = setInterval(function() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        var i = 0, v;

        while ( (v = me.cube[i++]) ) {
          v._phi += v.phi;
          v._theta += v.theta;
          me._drawPolygon(ctx, v);
        }
      }, this.fps);

    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      while ( (v = me.cube[i++]) ) {
        me._drawPolygon(ctx, v);
      }
    }
  },

  stop: function() {
    if (this.tmid !== -1) {
      clearInterval(this.tmid);
      this.tmid = -1;
    }
  },

  _drawPolygon: function(ctx, param) {
    var sinP = Math.sin(param._phi),   cosP = Math.cos(param._phi),
        sinT = Math.sin(param._theta), cosT = Math.cos(param._theta),
        d = param._data,
        // vector data
        vX = [-sinP,         cosP,            0],
        vY = [-cosT * cosP, -cosT * sinP,  sinT],
        vZ = [-sinT * cosP, -sinT * sinP, -cosT],
        info = [],
        x, y, z, i, j, light, surface, // 2D Bitmap surface
        // alias
        iz1, iz2, r1, r2,
        pazoom = param.zoom,
        pax = param.x,
        pay = param.y,
        pacolor = param.color,
        pahighLight = param.highLight,
        paopacity = param.opacity,
        bright, rgba;

    function order(a, b) {
      return (a[0] === b[0]) ? 0 : (a[0] < b[0]) ? 1 : -1;
    }

    for (i = 0, iz1 = d.length; i < iz1; ++i) {
      r1 = d[i][0];
      surface = [0, -(vZ[0] * r1[0] +
                      vZ[1] * r1[1] +
                      vZ[2] * r1[2])];

      for (j = 1, iz2 = d[i].length; j < iz2; ++j) {
        r2 = d[i][j];
        z = vZ[0] * r2[0] + vZ[1] * r2[1] + vZ[2] * r2[2];
        surface.push([vX[0] * r2[0] + vX[1] * r2[1] + vX[2] * r2[2],
                      vY[0] * r2[0] + vY[1] * r2[1] + vY[2] * r2[2], z]);
        surface[0] += z;
      }
      info.push(surface);
    }
    info.sort(order);

    for (i = 0, iz1 = info.length; i < iz1; ++i) {
      light = info[i][1];
      if (light >= 0.1) {

        for (j = 2, iz2 = info[i].length; j < iz2; ++j) {
          r1 = info[i][j];
          r2 = r1[2] + 10;
          x = pazoom * r1[0] / r2;
          y = pazoom * r1[1] / r2;
          if (j === 2) {
            ctx.beginPath();
            ctx.moveTo(pax + x, pay + -y);

            bright = parseInt(light * pahighLight);
            rgba = [Math.min(((pacolor >> 16) & 0xff) + bright, 255),
                    Math.min(((pacolor >> 8) & 0xff) + bright, 255),
                    Math.min((pacolor & 0xff) + bright, 255), paopacity];
            ctx.fillStyle = "rgba(" + rgba.join(",") + ")";
          } else {
            ctx.lineTo(pax + x, pay + -y);
          }
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }
};

// --- initialize / export ---
uuGraphic.polygon = _polygon;

})(); // uuPolygon scope
