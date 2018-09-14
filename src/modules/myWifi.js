const WIFI = require('Wifi');
const CONFIG = require('config');

const setWifi = function () {
    WIFI.setHostname(CONFIG.WIFI.hostname, function () {
        WIFI.connect(CONFIG.WIFI.SSID, CONFIG.WIFI.options, function () {
            console.log('INFO: Wifi connection');
            WIFI.getHostname(function(){
                console.log('INFO: Wifi Hostanme',arguments);
            });
            WIFI.getIP(function(){
                console.log('INFO: Wifi IP', arguments);
            })
            WIFI.getDetails(function(){
                console.log('INFO: Wifi details', arguments);
            });
            WIFI.stopAP();
            WIFI.save();
        });
    });
    
};

module.exports = {
    setWifi: setWifi,
};