const STATE = require('./src/modules/state.js');

var updaterCallback = null;

const startUpdater = function(){
    STATE.updater.process = setInterval(function () { 
        console.log('INFO: interval run');
        updaterFunction();
    }, STATE.updater.interval);
};

const stopUpdater = function() {
    clearInterval(STATE.updater.process);
};

const updaterFunction = function() {
    getSensorData(function(err, data){
        if (typeof updaterCallback == 'function') {
            updaterCallback();
        } else {
            console.log('INFO: updater callback is not a function');
        }
    });
};

const setUpdater = function(newConfig, callback, callbackParam) {
    if (STATE.updater.active) {
        stopUpdater();
    }

    STATE.setNewUpdater(newConfig);

    if (STATE.updater.active) {
        UPDATER.startUpdater();
    }
    callback(callbackParam);
};

const success = function() {
    STATE.updater.calls.totalCount++;
};
const fail = function() {
    STATE.updater.calls.status = false;
    STATE.updater.calls.totalCount++;
    STATE.updater.calls.errorCount++;
};

const setNewUpdater = function(newConfig) {
    STATE.updater.url = newConfig.updater.url;
    STATE.updater.interval = newConfig.updater.interval;
    STATE.updater.active = newConfig.updater.active;
};

module.exports = {
    startUpdater,
    stopUpdater,
    setUpdater,
    success,
    fail,
    setNewUpdater
};