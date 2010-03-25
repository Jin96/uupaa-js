
// === gfx - cube polygon plugin ===
//{{{!depend uu, uu.class, uu.pligin
//}}}!depend

uu.Class.GfxCube || (function(uu) {

var _DEFAULT_PARM = {
        highLight: 0x40,      // Number(= 0x40): cube high light color (0x00~0xff)
        color:     0x000000,  // Number(= 0x000000): cube color (0xrrggbb),
                              //             0xff0000 is red, 0x00ff00 is green
        opacity:   1.0,       // Number(= 1.0): cube opacity (0.0~1.0)
        x:         0,         // Number(= 0): cube x position
        y:         0,         // Number(= 0): cube y position
        z:         500,       // Number(= 500): cube z position(zoom)
        phi:       Math.PI / 100, // Number(= Math.PI / 100): vertical rotation speed
        theta:     Math.PI / 80   // Number(= Math.PI / 80): horizontal rotation speed
    };

uu.Class("GfxCube", {
    init:   gfxcubeinit,
    add:    gfxcubeadd,       // this.add(param) -> this
    run:    gfxcuberun,       // this.run(ctx) -> this
    stop:   gfxcubestop,      // this.stop() -> this
    draw:   gfxcubedraw       // this.draw(ctx) -> this
});

function gfxcubeinit(option) { // @param Hash: { fps }
                               //    fps Number(= 50):
    var opt = uu.arg(option || {}, { fps: 50 });

    this.fps = 10000 / 16 / opt.fps;
    this.cube = [];
    this.tmid = 0;
}

// uu.Class.GfxCube.add - add cube
function gfxcubeadd(param) { // @param Hash(= _DEFAULT_PARM):
    var face = [[], [], [], [], [], []], // 6 = cube
        i = 0, v1, v2;

    for (; i < 5; ++i) {
        v = (0.5 * i - 0.25) * Math.PI;
        v1 = i ? Math.SQRT2 * Math.cos(v) : 0;
        v2 = i ? Math.SQRT2 * Math.sin(v) : 0;
        face[0].push([ v1,  v2,   1]);
        face[1].push([  1,  v1,  v2]);
        face[2].push([ v2,   1,  v1]);
        face[3].push([-v1, -v2,  -1]);
        face[4].push([ -1, -v1, -v2]);
        face[5].push([-v2,  -1, -v1]);
    }
    this.cube.push(uu.arg(param || {}, _DEFAULT_PARM,
                          { face: face, _theta: 0.5, _phi: 0.5 }));
    return this;
}

// uu.Class.GfxCube.run - draw cube animation
function gfxcuberun(ctx) { // @param CanvasRenderingContext2D:
    var me = this;

    if (!this.tmid) {
        me.tmid = setInterval(function() {
            var i = 0, v;

            ctx.lock(1);
            while ( (v = me.cube[i++]) ) {
                v._phi += v.phi;
                v._theta += v.theta;
                gfxcubeloop(me, ctx, v);
            }
            ctx.unlock();
        }, this.fps);
    }
    return this;
}

// uu.Class.GfxCube.stop - stop cube animation
function gfxcubestop() {
    this.tmid && (clearInterval(this.tmid), this.tmid = 0);
    return this;
}

// uu.Class.GfxCube.draw - draw cube
function gfxcubedraw(ctx) { // @param CanvasRenderingContext2D:
    var i = 0, v;

    ctx.lock(1); // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    while ( (v = this.cube[i++]) ) {
        gfxcubeloop(this, ctx, v);
    }
    ctx.unlock();
    return this;
}

// inner - draw cube
function gfxcubeloop(me, ctx, param) {
    function order(a, b) {
        return (a[0] === b[0]) ? 0 : (a[0] < b[0]) ? 1 : -1;
    }
    var sinP = Math.sin(param._phi),   cosP = Math.cos(param._phi),
        sinT = Math.sin(param._theta), cosT = Math.cos(param._theta),
        d = param.face,
        // vector data
        vX = [-sinP,         cosP,            0],
        vY = [-cosT * cosP, -cosT * sinP,  sinT],
        vZ = [-sinT * cosP, -sinT * sinP, -cosT],
        info = [],
        x, y, z, i, j, light, surface, // 2D Bitmap surface
        iz1, iz2, r1, r2, bright, rgba,
        px = param.x,
        py = param.y,
        pz = param.z,
        pc = param.color,
        ph = param.highLight,
        po = param.opacity;

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
                x = pz * r1[0] / r2;
                y = pz * r1[1] / r2;
                if (j === 2) {
                    ctx.beginPath();
                    ctx.moveTo(px + x, py + -y);

                    bright = parseInt(light * ph);
                    rgba = [Math.min(((pc >> 16) & 0xff) + bright, 255),
                            Math.min(((pc >>  8) & 0xff) + bright, 255),
                            Math.min( (pc        & 0xff) + bright, 255), po];
                    ctx.fillStyle = "rgba(" + rgba.join(",") + ")";
                } else {
                    ctx.lineTo(px + x, py + -y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}

})(uu);

