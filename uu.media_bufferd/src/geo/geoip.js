// WebServiceGeoLocation API - http://www.maxmind.com/app/api

//{@geo
uu.geo.webapi = function(callback, // @param CallbackFunction:
                         option,   // @param Hash:
                         watch) {  // @param Boolean(= false): true is watch position
    var rv = {
        ok:         false,
        option:     {},
        status:     400,
        latitude:   null,
        longitude:  null,
        timestamp:  0
    };

    if (watch) {
        if (uu.geo.webapi.watch.run++ > uu.geo.webapi.watch.max) {
            // don't update last location
            callback(rv);
            return;
        }
    }

    uu.js("http://j.maxmind.com/app/geoip.js", {}, function(resp) {
        try {
            var last = uu.geo.location,
                lat = +geoip_latitude(),
                lng = +geoip_longitude();

            uu.node.remove(resp.node); // remove <script>

            // getCurrentPosition() or modified?
            if (!option.watch || last.latitude  !== lat ||
                                 last.longitude !== lng) {
                // update last location
                rv = uu.mix({}, uu.geo.location = {
                    ok:         true,
                    option:     option,
                    status:     200,
                    latitude:   lat,
                    longitude:  lng,
                    timestamp:  +new Date
                });
            }
        } catch (err) {
            uu.node.remove(resp.node); // remove <script>
        }
        callback(rv);
    });
};
uu.geo.webapi.watch = {
    run: 0,             // watch count
    max: 3,             // watch max count
    interval: 20 * 1000 // setInterval(fn, 20sec)
};
//}@geo
