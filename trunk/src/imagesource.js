// === Image Source ========================================
uu.feat.imagesource = {};

// --- types of image-source ---
// URLString:       "url"
// JointURLString:  "url,url"
// URLStringArray:  Array( URLString, ... )

// imagesource factory
uu.imagesource = function(src) {
  return new uu.Class.ImageSource(src);
};

/** ImageSource Dictionary
 *
 * @class Singleton
 */
uu.Class.Singleton("ImageSourceDictionary", {
  // uu.Class.ImageSourceDictionary.construct - create dictionary
  construct: function() {
    this._200 = { /* absURL: counter */ };
    this._404 = { /* absURL: counter */ };
  },

  // uu.Class.ImageSourceDictionary.add - add URL
  add: function(absURL,     // String: abs-url
                code404) {  // Boolean: true is 404, false is 200
    if (code404) {
      this._404[absURL] ? ++this._404[absURL] : (this._404[absURL] = 1);
    } else {
      this._200[absURL] ? ++this._200[absURL] : (this._200[absURL] = 1);
    }
  },

  // uu.Class.ImageSourceDictionary.in200 - Valid URL exists
  in200: function(absURL) { // String: abs-url
    return absURL in this._200; // return Boolean
  },

  // uu.Class.ImageSourceDictionary.get404 - get invalid URL array
  get404: function() {
    var rv = [], i;
    for (i in this._404) {
      rv.push(i);
    }
    return rv; // return StringArray( ["404abs-url", ...] )
  }
});

/** Image Source
 *
 * @class
 */
uu.Class("ImageSource", {
  // uu.Class.ImageSource.construct - create instance, push image stack
  construct: function(src) { // URLString/JointURLString/URLStringArray/uu.Class.ImageSource instance
    this._loading = 0;
    this._stack = [];
    this.push(src);
  },

  // uu.Class.ImageSource.push - push image stack
  push: function(src) { // URLString/JointURLString/URLStringArray/uu.Class.ImageSource instance
    var i, iz, c;
    if (src !== void 0) {
      if (src instanceof uu.Class.ImageSource) { // stack copy
        for (i = 0, iz = src._stack.length; i < iz; ++i) {
          this._push(src._stack[i]); // clone
        }
      } else if (src instanceof Array) { // join array
        for (i = 0, iz = src.length; i < iz; ++i) {
          this._push(src[i]);
        }
      } else if (typeof src === "string") {
        if (/[;,]/.test(src)) { // "file1.ext;file2.ext" or "file1.ext,file2.ext"
          c = src.split(UU.UTIL.SPLIT_TOKEN);
          for (i = 0, iz = c.length; i < iz; ++i) {
            this._push(c[i]);
          }
        } else { // "http://.../file.ext" or "file.ext"
          this._push(src);
        }
      }
    }
    return this; // return this
  },
  _push: function(src) {
    src = uu.url.abs(src);
    if (!uu.imagesource.dict.in200(src)) {
      ++this._loading;
      var me = this, img = new Image(), run = 0;

      img.onerror = function() {
        !run++ && (--me._loading, uu.imagesource.dict.add(src, 1));
      };
      img.onabort = function() {
        !run++ && (--me._loading, uu.imagesource.dict.add(src, 1));
      };
      img.onload  = function() {
        !run++ && (--me._loading, uu.imagesource.dict.add(src, uu.ua.opera && !img.complete));
      };
      img.src = src;

      if (uu.ua.gecko && uu.engine < 1900) { // Firefox2.x
        (function() {
          if (!run) {
            if (img.complete && !img.width) {
              ++run;
              --me._loading;
              uu.imagesource.dict.add(src, 1);
              return;
            }
            setTimeout(arguments.callee, 50); // peek 50ms
          }
        })();
      }
    }
    this._stack.push(src);
  },

  // uu.Class.ImageSource.pop - pop image stack
  pop: function() {
    return this._stack.pop() || ""; // return URLString
  },

  // uu.Class.ImageSource.clear - clear all image stack
  clear: function() {
    this._stack = [];
    return this; // return this
  },

  // uu.Class.ImageSource.size - get stack size
  size: function() {
    return this._stack.length; // return Number
  },

  // uu.Class.ImageSource.empty - is Empty stack(every false)
  empty: function() {
    return !this._stack.length; // return Boolean
  },

  // uu.Class.ImageSource.top - get top stack
  top: function() {
    return this.ref(this._stack.length - 1); // return URLString
  },

  // uu.Class.ImageSource.bottom - get bottom stack
  bottom: function() {
    return this.ref(0); // return URLString
  },

  // uu.Class.ImageSource.ref - refer to image stack
  ref: function(n) { // Number(default: undefined): undefined is top stack
    return this._stack[this._ref(n)] || ""; // return URLString
  },
  _ref: function(n) {
    if (n !== void 0) { return n; }
    if (this._stack.length) { return this._stack.length - 1; }
    return 0; // empty stack
  },

  // uu.Class.ImageSource.loading - preloading image count
  loading: function() {
    return !!this._loading; // return Boolean
  },

  // uu.Class.ImageSource.forEach
  forEach: function(fn,        // Function: evaluator
                    thisArg) { // ThisObject(default: undefined):
    var v, i = 0, iz = this._stack.length;
    for(; i < iz; ++i) {
      v = this._stack[i];
      fn.call(thisArg, v, i, this);
    }
    return this; // return this;
  },

  // uu.Class.ImageSource.toString - return ref()
  toString: function() {
    return this.ref(); // return String
  }
});

uu.imagesource.dict = new uu.Class.ImageSourceDictionary();
