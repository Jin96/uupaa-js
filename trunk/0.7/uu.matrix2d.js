// === Matrix 2D ===
// depend: uu.js
//
// typeof Matrix = [m11, m12, m13,
//                  m21, m22, m23,
//                  m31, m32, m33]
uu.agein || (function() {

uu.m2d = {
  map:          m2dmap,         // uu.m2d.map(x, y, m) -> { x, y }
  map2:         m2dmap2,        // uu.m2d.map2(x1, y1, x2, y2, m) -> { x1, y1, x2, y2 }
  multiply:     m2dmultiply,    // uu.m2d.multiply(a, b) -> Array(Matrix)
  scale:        m2dscale,       // uu.m2d.scale(x, y, m) -> Array(Matrix)
  rotate:       m2drotate,      // uu.m2d.rotate(angle, m) -> Array(Matrix)
  transform:    m2dtransform,   // uu.m2d.transform(m11, m12, m21, m22, dx, dy, m)
                                //                                -> Array(Matrix)
  translate:    m2dtranslate    // uu.m2d.translate(x, y, m) -> Array(Matrix)
};

// uu.m2d.map - 2D Matrix multiply
function m2dmap(x,   // @param Number:
                y,   // @param Number:
                m) { // @param Array: matrix
                          // @return Hash: { x, y }
  // for SL
  return {
    x: x * m[0] + y * m[3] + m[6], // x * m11 + y * m21 + dx
    y: x * m[1] + y * m[4] + m[7]  // x * m12 + y * m22 + dy
  };
/*
  // for VML
    x: _round((x * mtx[0] + y * mtx[3] + mtx[6]) * _ZOOM - _HALF_ZOOM),
    y: _round((x * mtx[1] + y * mtx[4] + mtx[7]) * _ZOOM - _HALF_ZOOM)

 */
}

// uu.m2d.map2 - 2D Matrix multiply
function m2dmap2(x1,  // @param Number:
                 y1,  // @param Number:
                 x2,  // @param Number:
                 y2,  // @param Number:
                 m) { // @param Array: matrix
                      // @return Hash: { x1, y1, x2, y2 }
  // for SL
  return {
    x1: x1 * m[0] + y1 * m[3] + m[6], // x * m11 + y * m21 + dx
    y1: x1 * m[1] + y1 * m[4] + m[7], // x * m12 + y * m22 + dy
    x2: x2 * m[0] + y2 * m[3] + m[6], // x * m11 + y * m21 + dx
    y2: x2 * m[1] + y2 * m[4] + m[7]  // x * m12 + y * m22 + dy
  };
/*
  // for VML
  return {
    x1: _round((x1 * mtx[0] + y1 * mtx[3] + mtx[6]) * _ZOOM - _HALF_ZOOM),
    y1: _round((x1 * mtx[1] + y1 * mtx[4] + mtx[7]) * _ZOOM - _HALF_ZOOM),
    x2: _round((x2 * mtx[0] + y2 * mtx[3] + mtx[6]) * _ZOOM - _HALF_ZOOM),
    y2: _round((x2 * mtx[1] + y2 * mtx[4] + mtx[7]) * _ZOOM - _HALF_ZOOM)
  };

 */
}

// uu.m2d.multiply - 2D Matrix multiply
function m2dmultiply(a,   // @param Array: matrix A
                     b) { // @param Array: matrix B
                          // @return Array: A x B
  return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],  // m11
          a[0] * b[1] + a[1] * b[4] + a[2] * b[7],  // m12
          0,                                        // m13
          a[3] * b[0] + a[4] * b[3] + a[5] * b[6],  // m21
          a[3] * b[1] + a[4] * b[4] + a[5] * b[7],  // m22
          0,                                        // m23
          a[6] * b[0] + a[7] * b[3] + a[8] * b[6],  // m31(dx)
          a[6] * b[1] + a[7] * b[4] + a[8] * b[7],  // m32(dy)
          a[6] * b[2] + a[7] * b[5] + a[8] * b[8]]; // m33
}

// uu.m2d.scale - 2D Matrix multiply x scale
function m2dscale(x,   // @param Number:
                  y,   // @param Number:
                  m) { // @param Array: matrix
                       // @return Array:
  // [x, 0, 0,
  //  0, y, 0,
  //  0, 0, 1]
  return [x * m[0], x * m[1],    0,
          y * m[3], y * m[4],    0,
              m[6],     m[7], m[8]];
}

// uu.m2d.rotate - 2D Matrix multiply x rotate
function m2drotate(angle, // @param Number:
                   m) {   // @param Array: matrix
                          // @return Array:
  // [ c, s, 0,
  //  -s, c, 0,
  //   0, 0, 1]
  var c = Math.cos(angle),
      s = Math.sin(angle);

  return [ c * m[0] + s * m[3],  c * m[1] + s * m[4], 0,
          -s * m[0] + c * m[3], -s * m[1] + c * m[4], 0,
                          m[6],                 m[7], m[8]];
}

// uu.m2d.transform - 2D Matrix multiply x transform
function m2dtransform(m11, // @param Number:
                      m12, // @param Number:
                      m21, // @param Number:
                      m22, // @param Number:
                      dx,  // @param Number:
                      dy,  // @param Number:
                      m) { // @param Array: matrix
                           // @return Array:
  // [m11, m12, 0,
  //  m21, m22, 0,
  //   dx,  dy, 1]
  return [m11 * m[0] + m12 * m[3], m11 * m[1] + m12 * m[4], 0,
          m21 * m[0] + m22 * m[3], m21 * m[1] + m22 * m[4], 0,
          dx * m[0] + dy * m[3] + m[6],
          dx * m[1] + dy * m[4] + m[7],
          dx * m[2] + dy * m[5] + m[8]];
}

// uu.m2d.translate - 2D Matrix multiply x translate
function m2dtranslate(x,   // @param Number:
                      y,   // @param Number:
                      m) { // @param Array: matrix
                           // @return Array:
  // [1, 0, 0,
  //  0, 1, 0,
  //  x, y, 1]
  return [m[0], m[1], 0,
          m[3], m[4], 0,
          x * m[0] + y * m[3] + m[6],
          x * m[1] + y * m[4] + m[7],
          x * m[2] + y * m[5] + m[8]];
}

})();

