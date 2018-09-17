const WIFI = require('Wifi');
const CONFIG = require('config');

function setWifi () {
  WIFI.setHostname(CONFIG.WIFI.hostname, () => {
    WIFI.on('connected', function onConnected () {
      console.log('INFO: Wifi connection Event', arguments);
      WIFI.getIP(function getIPCallback () {
        console.log('INFO: Wifi IP', arguments);
      });
      WIFI.getHostname(function getHostnameCallback () {
        console.log('INFO: Wifi get Hostname', arguments);
      });
      WIFI.getDetails(function getDetailsCallback () {
        console.log('INFO: Wifi details', arguments);
      });
      WIFI.stopAP();
      WIFI.save();
    });

    WIFI.connect(CONFIG.WIFI.SSID, CONFIG.WIFI.options, function connectCallback (err) {
      console.log('INFO: Wifi connection callback', arguments);
      if (err) {
        console.log('INFO: Error conecting', err);
      }
    });
  });
}

module.exports = {
  setWifi,
  WIFI // For debug
};
