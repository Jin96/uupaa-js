// === uu.matrix2d / window.matrix2d ===

//  type Matrix2DArray = [m11, m12, m13,     [1, 0, 0,     [m[0], m[1], m[2],
//                        m21, m22, m23,      0, 1, 0,      m[3], m[4], m[5],
//                        m31, m32, m33]      x, y, 1]      m[6], m[7], m[8]]

//  type SVGMatrix2DHash = { a, c, e,        [m11,    m21,    m31(x)
//                           b, d, f,    ->   m12,    m22,    m32(y)
//                           0, 0, 1 }        m13(0), m23(0), m33(1)]

(this.uu || this).matrix2d || (function(nameSpace) {

nameSpace.matrix2d = {
    identify:   identify,   // matrix2d.identify():Matrix2DArray - [1,0,0, 0,1,0, 0,0,1]
    multiply:   multiply,   // matrix2d.multiply(ma:Matrix2DArray,
                            //                   mb:Matrix2DArray):Matrix2DArray
    scale:      scale,      // matrix2d.scale(x:Number,
                            //                y:Number,
                            //                m:Matrix2DArray):Matrix2DArray
    rotate:     rotate,     // matrix2d.rotate(angle:Number,
                            //                 m:Matrix2DArray):Matrix2DArray
    transform:  transform,  // matrix2d.transform(m11:Number, m12:Number, m21:Number,
                            //                    m22:Number,  dx:Number,  dy:Number,
                            //                      m:Matrix2DArray):Matrix2DArray
    translate:  translate   // matrix2d.translate(x:Number,
                            //                    y:Number,
                            //                    m:Matrix2DArray):Matrix2DArray
};

// matrix2d.identify - 2D Matrix identify
function identify() { // @return Matrix2DArray: [1,0,0, 0,1,0, 0,0,1]
    return [1, 0, 0,
            0, 1, 0,
            0, 0, 1];
}

// matrix2d.multiply - 2D Matrix multiply
function multiply(ma,   // @param Matrix2DArray: matrix A
                  mb) { // @param Matrix2DArray: matrix B
                        // @return Matrix2DArray: A x B
    return [ma[0] * mb[0] + ma[1] * mb[3] + ma[2] * mb[6],  // m11
            ma[0] * mb[1] + ma[1] * mb[4] + ma[2] * mb[7],  // m12
            0,                                              // m13
            ma[3] * mb[0] + ma[4] * mb[3] + ma[5] * mb[6],  // m21
            ma[3] * mb[1] + ma[4] * mb[4] + ma[5] * mb[7],  // m22
            0,                                              // m23
            ma[6] * mb[0] + ma[7] * mb[3] + ma[8] * mb[6],  // m31(dx)
            ma[6] * mb[1] + ma[7] * mb[4] + ma[8] * mb[7],  // m32(dy)
            ma[6] * mb[2] + ma[7] * mb[5] + ma[8] * mb[8]]; // m33
}

// matrix2d.scale - 2D Matrix multiply x scale
function scale(x,   // @param Number:
               y,   // @param Number:
               m) { // @param Matrix2DArray: matrix
                    // @return Matrix2DArray:
    // [x, 0, 0,
    //  0, y, 0,
    //  0, 0, 1]
    return [x * m[0], x * m[1],    0,
            y * m[3], y * m[4],    0,
                m[6],     m[7], m[8]];
}

// matrix2d.rotate - 2D Matrix multiply x rotate
function rotate(angle, // @param Number: radian
                m) {   // @param Matrix2DArray: matrix
                       // @return Matrix2DArray:
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
                   m) { // @param Matrix2DArray: matrix
                        // @return Matrix2DArray:
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
                   m) { // @param Matrix2DArray: matrix
                        // @return Matrix2DArray:
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
