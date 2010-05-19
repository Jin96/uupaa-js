
// === uu.Class.FlashStorage ===
//{{{!depend uu, Storage
//}}}!depend

//{{{!mb

uu.Class.FlashStorage || (function(uu) {

var _swfPath = uu.config.baseDir + "uu.storage.swf",
    _already = null,
    _inherit = uu.Class.Storage.prototype;

uu.Class.singleton("FlashStorage", {
    init:           init,       // init()
    key:            _inherit.key,
    size:           _inherit.size,
    clear:          _inherit.clear,
    getItem:        _inherit.getItem,
    setItem:        _inherit.setItem,
    getLength:      _inherit.getLength,
    removeItem:     _inherit.removeItem,
    getAllItems:    _inherit.getAllItems,
    toString:       toString,   // toString():String - storage identity
    save:           _inherit.save,
    load:           _inherit.load
});

function init(callback) { // @param Function(= void): callback
    var that = this,
        OBJECT_ID = "externalflashstorage";

    // wait for response from flash initializer
    function flashStorageReadyCallback() {
        setTimeout(function() {
            uu.dmz[OBJECT_ID] = null;
            callback && callback(that);
        }, 0);
    }

    uu.dmz[OBJECT_ID] = flashStorageReadyCallback;

    this.storage = uu.flash(_swfPath, {
                        id:     OBJECT_ID,
                        width:  1,
                        height: 1
                   });
}

function toString() {
    return "FlashStorage";
}

// uu.Class.FlashStorage.isReady - static method
uu.Class.FlashStorage.isReady = function() { // @return Boolean
    if (_already === null) {
        _already = uu.ver.flash && uu.file(_swfPath).ok;
    }
    return _already;
};

})(uu);

//}}}!mb

