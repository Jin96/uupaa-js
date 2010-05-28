// === uu.matrix2d / window.matrix2d ===

//
//  type Matrix2D = [m11, m12, m13,
//                   m21, m22, m23,
//                   m31, m32, m33]

(this.uu || this).matrix2d || (function(namespace) {

namespace.matrix2d = {
    multiply:     multiply,    // matrix2d.multiply(a, b) -> Array(Matrix)
    scale:        scale,       // matrix2d.scale(x, y, m) -> Array(Matrix)
    rotate:       rotate,      // matrix2d.rotate(angle, m) -> Array(Matrix)
    transform:    transform,   // matrix2d.transform(m11, m12, m21, m22, dx, dy, m)
                               //                           -> Array(Matrix)
    translate:    translate    // matrix2d.translate(x, y, m) -> Array(Matrix)
};

// matrix2d.multiply - 2D Matrix multiply
function multiply(a,   // @param Array: matrix A
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

// matrix2d.scale - 2D Matrix multiply x scale
function scale(x,   // @param Number:
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

// matrix2d.rotate - 2D Matrix multiply x rotate
function rotate(angle, // @param Number:
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

// matrix2d.transform - 2D Matrix multiply x transform
function transform(m11, // @param Number:
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
             dx * m[0] +  dy * m[3] + m[6],
             dx * m[1] +  dy * m[4] + m[7],
             dx * m[2] +  dy * m[5] + m[8]];
}

// matrix2d.translate - 2D Matrix multiply x translate
function translate(x,   // @param Number:
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

})(this.uu || this);
