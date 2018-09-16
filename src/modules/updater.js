const MIN_INTERVAL = 10;
const MAX_ERRORS = 10;

const defaultCalls = {
    time: 0,
    lastStatus: null,
    totalCount: 0,
    errorCount: 0,
    errorSequence: 0,
};

const getDefaultStateCalls = function () {
    return {
        time: defaultCalls.time,
        lastStatus: defaultCalls.lastStatus,
        totalCount: defaultCalls.totalCount,
        errorCount: defaultCalls.errorCount,
        errorSequence: defaultCalls.errorSequence,
        errors: {
            sensor: 0,
            request: 0,
            response: 0,
        }
    };
};

const STATE = {
    path: '',
    host: '',
    port: 80,
    method: 'POST',
    protocol: 'http:',
    interval: MIN_INTERVAL,
    active: false,
    process: 0,
    calls: getDefaultStateCalls(),
};

const getState = function () {
    return STATE;
};

const resetUpdaterCalls = function () {
    STATE.calls = getDefaultStateCalls();
};

const startUpdater = function () {
    STATE.process = setInterval(function () {
        console.log('INFO: interval run');
        checkUpdater();
        updaterFunction();
    }, STATE.interval);
};

const checkUpdater = function () {
    if (STATE.calls.errorSequence >= MAX_ERRORS) {
        console.log('INFO: stop updater to many errors');
        stopUpdater();
    }
};

const stopUpdater = function () {
    clearInterval(STATE.process);
    STATE.active = false;
};

const updaterFunction = function () {
    // is this variable global ?
    SENSOR.getSensorData(function (err, data) {
        if (err) {
            console.log('INFO: Error calling update function', err);
            updaterFail();
        } else {
            updaterCallback(data);
        }
    });
};

const postData = function (sensorData) {
    var parsedData = JSON.stringify(sensorData);
    var options = {
        path: STATE.path,           // path sent to server
        host: STATE.host,           // host: 'example.com', // host name
        port: STATE.port,           // (optional) port, defaults to 80
        method: STATE.method,       // HTTP command sent to server (must be uppercase 'GET', 'POST', etc)
        protocol: STATE.protocol,   // protocol: 'http:',   // optional protocol - https: or http:
        // headers: { key : value, key : value } // (optional) HTTP headers
        headers: {
            "content-type": "application/json",
            "content-length": parsedData.length,
            "connection": "close"
        }
    };
    var request = HTTP.request(options, function (res) {
        var requestData = '';
        res.on('data', function (d) {
            requestData += d;
        });
        res.on('close', function (data) {
            console.log("INFO: post response 1", requestData);
            console.log("INFO: post response 2", data);
            updaterSuccess();
        });
        if (res.statusCode == 200) {
            updaterSuccess();
        } else {
            updaterFail();
        }
    });
    request.on('error', function (e) {
        console.log('INFO : error posting data',  e);
        updaterFail();
    });
    request.write(parsedData);
    request.end();
};

const updaterCallback = function (data) {
    postData(data);
};

const setUpdater = function (newConfig, callback, callbackParam) {
    if (STATE.active) {
        stopUpdater();
    }

    setNewUpdater(newConfig);

    if (STATE.active) {
        resetUpdaterCalls();
        startUpdater();
    }
    callback(callbackParam);
};

const updaterSuccess = function () {
    STATE.calls.lastStatus = true;
    STATE.calls.totalCount++;
    STATE.calls.errorSequence = 0;
};
const updaterFail = function () {
    if (STATE.calls.lastStatus === false) {
        STATE.calls.errorSequence++;
    }
    STATE.calls.lastStatus = false;
    STATE.calls.totalCount++;
    STATE.calls.errorCount++;
    console.log('INFO: Updater calls:', STATE.calls);
};

const setNewUpdater = function (newConfig) {
    STATE.path = newConfig.path;
    STATE.port = newConfig.port;
    STATE.host = newConfig.host;
    STATE.interval = newConfig.interval;
    STATE.active = newConfig.active;
};

const getNewConfig = function (data) {
    return {
        path: data.hasOwnProperty('path') ? data.path : STATE.path,
        host: data.hasOwnProperty('host') ? data.host : STATE.host,
        port: data.hasOwnProperty('port') ? data.port : STATE.port,
        interval: data.hasOwnProperty('interval') ? data.interval : STATE.interval,
        active: data.hasOwnProperty('active') ? data.active : STATE.active,
    };
};

const isConfigValid = function (newConfig) {
    return typeof newConfig.path == 'string' &&
        typeof newConfig.host == 'string' &&
        typeof newConfig.port == 'number' &&
        newConfig.port >= 0 &&
        typeof newConfig.interval == 'number' &&
        newConfig.interval >= MIN_INTERVAL &&
        typeof newConfig.active == 'boolean';
};

module.exports = {
    getState: getState,
    setUpdater: setUpdater,
    getNewConfig: getNewConfig,
    isConfigValid: isConfigValid,
};