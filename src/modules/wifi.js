const wifi = require('Wifi');
const CONFIG = require('./config/config.js');

const setWifi = function () {
    wifi.setHostname(CONFIG.wifi.hostname, function () {
        console.log('INFO: Wifi Hostanme seted',  wifi.getHostname());
        wifi.connect(CONFIG.wifi.SSID, CONFIG.wifi.options, function () { 
            console.log('INFO: Wifi connection'); 
            console.log('INFO: Wifi IP', wifi.getIP());
            wifi.getDetails(function(){
                console.log('INFO: Wifi details', arguments);
            });
        });
    });
    wifi.stopAP();
    wifi.save();
};

module.exports = {
    setWifi,
};