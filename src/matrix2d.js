// === Matrix 2D ===========================================
// depend: none
uu.feat.matrix2d = {};

uu.Class.Matrix2D = {
  identity: function() {
    return  [ [1, 0, 0],   // [0][0]=m11, [0][1]=m12, [0][2]=m13
              [0, 1, 0],   // [1][0]=m21, [1][1]=m22, [1][2]=m23
              [0, 0, 1] ]; // [2][0]=m31, [2][1]=m32, [2][2]=m33
                           // m31 = offsetX,
                           // m32 = offsetY
  },

  multiply: function(m1, m2) {
    var rv = uu.Class.Matrix2D.identity(), x, y, z, sum;
    for (x = 0; x < 3; ++x) {
      for (y = 0; y < 3; ++y) {
        for (sum = 0, z = 0; z < 3; ++z) {
          sum += m1[x][z] * m2[z][y];
        }
        rv[x][y] = sum;
      }
    }
    return rv;
  },

  translate: function(x, y) {
    return  [ [1, 0, 0],
              [0, 1, 0],
              [x, y, 1] ];
  },

  rotate: function(angle) {
    var c = Math.cos(angle), s = Math.sin(angle);
    return  [ [c, s, 0],
              [-s,c, 0],
              [0, 0, 1] ];
  },

  scale: function(x, y) {
    return  [ [x, 0, 0],
              [0, y, 0],
              [0, 0, 1] ];
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    return  [ [m11, m12, 0],
              [m21, m22, 0],
              [dx,  dy,  1] ];
  }
};
