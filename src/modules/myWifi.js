const WIFI = require('Wifi');
const CONFIG = require('config');

const setWifi = function () {
    WIFI.setHostname(CONFIG.WIFI.hostname, function () {
        console.log('INFO: Wifi Hostanme seted',  WIFI.getHostname());
        WIFI.connect(CONFIG.WIFI.SSID, CONFIG.WIFI.options, function () {
            console.log('INFO: Wifi connection');
            console.log('INFO: Wifi IP', WIFI.getIP());
            WIFI.getDetails(function(){
                console.log('INFO: Wifi details', arguments);
            });
        });
    });
    WIFI.stopAP();
    WIFI.save();
};

module.exports = {
    setWifi: setWifi,
};