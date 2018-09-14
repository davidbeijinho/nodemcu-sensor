const MIN_INTERVAL = 10;
const MAX_ERRORS = 10;

const defaultCalls = {
    time: 0,
    lastStatus: null,
    totalCount: 0,
    errorCount: 0,
    errorSequence: 0,
};

const getDefaultStateCalls = function() {
    return {
        time: defaultCalls.time,
        lastStatus: defaultCalls.lastStatus,
        totalCount: defaultCalls.totalCount,
        errorCount: defaultCalls.errorCount,
        errorSequence: defaultCalls.errorSequence,
    };
};

const STATE = {
    updater: {
        url: '',
        interval: MIN_INTERVAL,
        active: false,
        process: 0,
        calls: getDefaultStateCalls(),
    },
};

const getState = function (){
    return STATE;
};

const resetUpdaterCalls = function() {
    STATE.updater.calls = getDefaultStateCalls();
};

const startUpdater = function(){
    STATE.updater.process = setInterval(function () {
        console.log('INFO: interval run');
        checkUpdater();
        updaterFunction();
    }, STATE.updater.interval);
};

const checkUpdater= function(){
    if (STATE.updater.calls.errorSequence >= MAX_ERRORS){
        console.log('INFO: stop updater to many errors');
        stopUpdater();
    }
};

const stopUpdater = function() {
    clearInterval(STATE.updater.process);
    STATE.updater.active = false;
};


const updaterFunction = function() {
    SENSOR.getSensorData(function(err, data){
        if (err) {
            console.log('INFO: Error calling update function', err);
            updaterFail();
        } else {
            updaterCallback(data);
        }
    });
};

const updaterCallback = function(data){
    var success = false;
    if (success){
        updaterSuccess();
    } else {
        updaterFail();
    }
};

const setUpdater = function(newConfig, callback, callbackParam) {
    if (STATE.updater.active) {
        stopUpdater();
    }

    setNewUpdater(newConfig);

    if (STATE.updater.active) {
        resetUpdaterCalls();
        startUpdater();
    }
    callback(callbackParam);
};

const updaterSuccess = function() {
    STATE.updater.calls.lastStatus = true;
    STATE.updater.calls.totalCount++;
    STATE.updater.calls.errorSequence = 0;
};
const updaterFail = function() {
    if (STATE.updater.calls.lastStatus === false) {
        STATE.updater.calls.errorSequence++;
    }
    STATE.updater.calls.lastStatus = false;
    STATE.updater.calls.totalCount++;
    STATE.updater.calls.errorCount++;
    console.log( STATE.updater.calls);
};

const setNewUpdater = function(newConfig) {
    STATE.updater.url = newConfig.url;
    STATE.updater.interval = newConfig.interval;
    STATE.updater.active = newConfig.active;
};

const getNewConfig = function(data){
    return {
        url: data.hasOwnProperty('url') ? data.url :  STATE.updater.url,
        interval: data.hasOwnProperty('interval') ? data.interval :  STATE.updater.interval,
        active: data.hasOwnProperty('active') ? data.active :  STATE.updater.active,
    };
};

const isConfigValid = function(newConfig){
    return typeof newConfig.url == 'string' && typeof newConfig.interval == 'number' && newConfig.interval >= MIN_INTERVAL && typeof newConfig.active == 'boolean';
};

module.exports = {
    getState,
    setUpdater
};