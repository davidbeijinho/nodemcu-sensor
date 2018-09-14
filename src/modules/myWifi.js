const WIFI = require('Wifi');
const CONFIG = require('config');

const setWifi = function () {
    WIFI.setHostname(CONFIG.WIFI.hostname, function () {
        WIFI.on('connected', function() {
            console.log('INFO: Wifi connection Event', arguments);
            WIFI.getIP(function(){
                console.log('INFO: Wifi IP', arguments);
            });
            WIFI.getHostname(function(){
                console.log('INFO: Wifi get Hostname', arguments);
            });
            WIFI.getDetails(function(){
                console.log('INFO: Wifi details', arguments);
            });
            WIFI.stopAP();
            WIFI.save();
        });

        WIFI.connect(CONFIG.WIFI.SSID, CONFIG.WIFI.options, function (err) {
            console.log('INFO: Wifi connection callback', arguments);
           if (err){
               console.log('INFO: Error conecting', err)
           }
        });
    });
};

module.exports = {
    setWifi: setWifi,
    WIFI: WIFI, // For debug
};