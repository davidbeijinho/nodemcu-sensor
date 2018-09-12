const WIFI = require('Wifi');
const HTTP = require('http');
const BMP085 = require('BMP085');
const CONFIG = require('./config/config.js');
const BMP_MODE = 3;
const LED = NodeMCU.D4;
const PORT = 80;
const SEALEVEL = 99867; // current sea level pressure in Pa
const I2CBUS = new I2C();
var BMP = null;

const defaultCalls = {
    time: 0,
    lastStatus: null,
    totalCount: 0,
    errorCount: 0,
};

const getDefaultStateCalls = function() {
    return {
        time: defaultCalls.time,
        lastStatus: defaultCalls.lastStatus,
        totalCount: defaultCalls.totalCount,
        errorCount: defaultCalls.errorCount,
    };
};

const STATE = {
    ledStatus: true,
    updater: {
        url: '',
        interval: 0,
        active: false,
        process: 0,
        calls: getDefaultStateCalls(),
    },
};

const resetUpdaterCalls = function() {
    STATE.updater.calls = getDefaultStateCalls();
};

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

const getUptime = function () {
    return Date.now() - STATE.startTime;
};

const setLed = function (status) {
    ledStatus = status;
    digitalWrite(LED, ledStatus);
};

const infoResponse = function (res) {
    doResponse(res, 200, {
        upTime: getUptime(),
        startTime: STATE.startTime,
    });
};

const getSensorData = function(callback){
    if (BMP !== null) {
        BMP.getPressure(function (d) {
            let altitude = BMP.getAltitude(d.pressure, SEALEVEL);
            console.log('INFO: Pressure: ' + d.pressure + ' Pa');
            console.log('INFO: Temperature: ' + d.temperature + ' C');
            console.log('INFO: Altitude: ' + altitude + ' m');

            callback(null, {
                pressure: d.pressure,
                temperature: d.temperature,
                altitude: altitude,
            });
        });
    } else {
        console.log('INFO: Sensor not connected');
        callback('Sensor not connected');
    }
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
    var connected = (BMP !== null);
    sendOKResponse(res, {
        bmp: connected,
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
        updaterFunction();
    }, STATE.updater.interval);
};

const stopUpdater = function() {
    clearInterval(STATE.updater.process);
};

const updaterFunction = function() {
    getSensorData(function(err, data){
        if (err) {
            console.log('INFO: Error calling update function', err);
        } else {
            updaterFail();
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
    STATE.updater.calls.totalCount++;
};
const updaterFail = function() {
    STATE.updater.calls.status = false;
    STATE.updater.calls.totalCount++;
    STATE.updater.calls.errorCount++;
};

const setNewUpdater = function(newConfig) {
    STATE.updater.url = newConfig.updater.url;
    STATE.updater.interval = newConfig.updater.interval;
    STATE.updater.active = newConfig.updater.active;
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
        url: data.hasOwnProperty('property1') ? data.url :  STATE.updater.url,
        interval: data.hasOwnProperty('property1') ? data.interval :  STATE.updater.interval,
        active: data.hasOwnProperty('property1') ? data.active :  STATE.updater.active,
    };

    if (typeof newConfig.url == 'string' && typeof newConfig.url == 'number' && number >= 0 && typeof newConfig.active == 'boolean') {
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

const connectToSensor = function () {
    BMP = BMP085.connect(I2CBUS, BMP_MODE);
    if (BMP !== null) {
        console.log('INFO: Sucessfuly connected to sensor');
    } else {
        console.log('INFO: Error connecting to sensor');
    }
};

const configureIC2 = function () {
    console.log('INFO: configure IC2');
    I2CBUS.setup({ scl: NodeMCU.D1, sda: NodeMCU.D2 });
};

const configureLed = function () {
    console.log('INFO: Configuring LED');
    pinMode(LED, 'output');
    digitalWrite(LED, STATE.ledStatus);
};

E.on('init', function () {
    STATE.startTime = Date.now();
    console.log('INFO: init board');
    configureLed();
    setWifi();
    createServer(PORT);
    configureIC2();
    connectToSensor();
});

console.log('INFO: End of script file');
