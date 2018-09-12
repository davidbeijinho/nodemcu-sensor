const HTTP = require('http');
const SENSOR = require('sensor');
const LED = require('led');
const WIFI = require('myWifi');

const PORT = 80;
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

const resetUpdaterCalls = function() {
    STATE.updater.calls = getDefaultStateCalls();
};

const getUptime = function () {
    return Date.now() - STATE.startTime;
};

const infoResponse = function (res) {
    doResponse(res, 200, {
        upTime: getUptime(),
        startTime: STATE.startTime,
    });
};

const sensorResponse = function (res) {
    getSensorData(function(err, data){
    if (err) {
        errorResponse(res, 500, err);
    } else {
        sendOKResponse(res, {
            pressure: data.pressure,
            temperature: data.temperature,
            altitude: data.altitude,
            upTime: getUptime(),
            startTime: STATE.startTime,
        });
    }
    });
};

const ledResponse = function (res) {
    sendOKResponse(res, {
        status: STATE.ledStatus,
        upTime: getUptime(),
        startTime: STATE.startTime,
    });
};

const updaterResponse = function (res) {
    sendOKResponse(res, {
        updater: STATE.updater,
        upTime: getUptime(),
        startTime: STATE.startTime,
    });
};

const sendOKResponse = function (res, data) {
    doResponse(res, 200, data);
};

const errorResponse = function (res, code, message) {
    doResponse(res, code, {
        error: message,
        upTime: getUptime(),
        startTime: STATE.startTime,
    });
};

const doResponse = function (res, code, data) {
    res.writeHead(code, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
     });
    res.write(JSON.stringify(data));
    res.end();
};

const connectResponse = function (res) {
    sendOKResponse(res, {
        bmp: SENSOR.isConected(),
        upTime: getUptime(),
        startTime: STATE.startTime,
    });
};

const getRoutes = function (req, res) {
    switch (req.url) {
        case '/':
            console.log('INFO: Main page');
            infoResponse(res);
            break;
        case '/sensor':
            console.log('INFO: Sensor response');
            sensorResponse(res);
            break;
        case '/led':
            console.log('INFO: Get status of the LED');
            ledResponse(res);
            break;
        case '/updater':
            console.log('INFO: Get updater information');
            updaterResponse(res);
            break;
        default:
            console.log('INFO: GET URL not handled, ' + req.url);
            errorResponse(res, 404, 'GET Url not handled');
            break;
    }
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
    getSensorData(function(err, data){
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

const postRoutes = function (req, res) {
    switch (req.url) {
        case '/led':
            console.log('INFO: LED Post route');
            getPostData(req, res, handleLedRoute);
            break;
        case '/updater':
            console.log('INFO: Updater config route');
            getPostData(req, res, handleUpdaterRoute);
            break;
        case '/connect':
            console.log('INFO: Try to reconect to the sensor');
            connectToSensor();
            connectResponse(res);
            break;
        default:
            console.log('INFO: POST URL not handled, ' + req.url);
            errorResponse(res, 404, 'POST Url not handled');
            break;
    }
};

const getPostData = function (req, res, callback) {
    var data = '';
    req.on('data', function (d) { data += d; });
    req.on('end', function () {
        var parsedData = JSON.parse(data);
        callback(parsedData, res);
    });
};

const handleLedRoute = function (data, res) {
    if (data.status === true) {
        setLed(true);
        ledResponse(res);
    } else if (data.status === false) {
        setLed(false);
        ledResponse(res);
    } else {
        console.log('INFO: Invalid data , ' + data);
        errorResponse(res, 403, 'Invalid Data');
    }
};

const handleUpdaterRoute = function (data, res) {
    var newConfig = {
        url: data.hasOwnProperty('url') ? data.url :  STATE.updater.url,
        interval: data.hasOwnProperty('interval') ? data.interval :  STATE.updater.interval,
        active: data.hasOwnProperty('active') ? data.active :  STATE.updater.active,
    };
    console.log('INFO: new config', newConfig);
    if (typeof newConfig.url == 'string' && typeof newConfig.interval == 'number' && newConfig.interval >= MIN_INTERVAL && typeof newConfig.active == 'boolean') {
        setUpdater(newConfig, updaterResponse, res);
    } else {
        console.log('INFO: Invalid updater config , ' + data);
        errorResponse(res, 403, 'Invalid updater config');
    }
};

const createServer = function (port) {
    console.log('INFO: Start Time ' + STATE.startTime);
    HTTP.createServer(function (req, res) {
        console.log('INFO: Starting server at port ' + port);
        switch (req.method) {
            case 'GET':
                getRoutes(req, res);
                break;
            case 'POST':
                postRoutes(req, res);
                break;
            // case 'OPTIONS': // HACK for swagger ui
            //     postRoutes(req, res);
            //     break;
            default:
                console.log('INFO: Method not handled, ' + req.method);
                errorResponse(res, 405, 'Method not handled');
                break;
        }
    }).listen(port);
};

E.on('init', function () {
    STATE.startTime = Date.now();
    console.log('INFO: init board');
    LED.configureLed();
    WIFI.setWifi();
    createServer(PORT);
    SENSOR.configureIC2();
    SENSOR.connectToSensor();
});

console.log('INFO: End of script file');
