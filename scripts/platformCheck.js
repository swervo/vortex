/* global vortexApp */

// platform check code based on Zepto.js.
(function(thisApp){
    "use strict";
    function detect(ua){
        var ua = ua, os = {},
          android = ua.match(/(Android)\s+([\d.]+)/),
          iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/),
          ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        if (android) {os.android = true;}
        if (iphone) {os.ios = true;}
        if (ipad) {os.ios = true;}
        return os;
    }
    thisApp.os = detect(navigator.userAgent);
})(vortexApp.platform);
