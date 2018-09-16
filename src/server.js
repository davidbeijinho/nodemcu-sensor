const HTTP = require('http');
const SENSOR = require('sensor');
const MYLED = require('myLed');
const WIFI = require('myWifi');
const UPDATER = require('updater');

const PORT = 80;
var  START_TIME;

const getUptime = function () {
    return Date.now() - START_TIME;
};

const mainRouteResponse = function (res) {
    sendOKResponse(res, {
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const ledResponse = function (res) {
    sendOKResponse(res, {
        status: MYLED.getStatus(),
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const ledPostRoute = function (data, res) {
    if (typeof data.status == 'boolean') {
        MYLED.setStatus(data.status);
        ledResponse(res);
    } else {
        console.log('INFO: Invalid data , ' + JSON.stringify(data));
        sendErrorResponse(res, 400, 'Invalid Data');
    }
};

const updaterResponse = function (res) {
    sendOKResponse(res, {
        updater: UPDATER.getState(),
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const updaterPostRoute = function (data, res) {
    var newConfig = UPDATER.getNewConfig(data);
    console.log('INFO: new config', newConfig);
    if (UPDATER.isConfigValid(newConfig)) {
        UPDATER.setUpdater(newConfig, updaterResponse, res);
    } else {
        console.log('INFO: Invalid updater config , ' + data);
        sendErrorResponse(res, 400, 'Invalid updater config');
    }
};

const sensorResponse = function (res) {
    SENSOR.getSensorData(function(err, data){
    if (err) {
        sendErrorResponse(res, 400, err);
    } else {
        sendOKResponse(res, {
            pressure: data.pressure,
            temperature: data.temperature,
            altitude: data.altitude,
            upTime: getUptime(),
            startTime: START_TIME,
        });
    }
    });
};

const sensorPostRoute = function (res) {
    sendOKResponse(res, {
        bmp: SENSOR.isConected(),
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const sendOKResponse = function (res, data) {
    doResponse(res, 200, data);
};

const sendErrorResponse = function (res, code, message) {
    doResponse(res, code, {
        error: message,
        upTime: getUptime(),
        startTime: START_TIME,
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

const getPostData = function (req, res, callback) {
    var data = '';
    req.on('data', function (d) { data += d; });
    req.on('end', function () {
        var parsedData = JSON.parse(data);
        callback(parsedData, res);
    });
};

const mainRoutesHandler = function(req, res) {
    if (req.method === 'GET') {
        console.log('INFO: Main page');
        mainRouteResponse(res);
    } else {
        notHandled(req, res);
    }
};

const ledRoutesHandler = function(req, res) {
    if (req.method === 'GET') {
        console.log('INFO: Get status of the LED');
        ledResponse(res);
    } else if (req.method === 'POST') {
        console.log('INFO: LED Post route');
        getPostData(req, res, ledPostRoute);
    } else {
        notHandled(req, res);
    }
};

const updaterRoutesHandler = function(req, res) {
    if (req.method === 'GET') {
        console.log('INFO: Get updater information');
        updaterResponse(res);
    } else if (req.method === 'POST') {
        console.log('INFO: Updater config route');
        getPostData(req, res, updaterPostRoute);
    } else {
        notHandled(req, res);
    }
};

const sensorRoutesHandler = function(req, res) {
    if (req.method === 'GET' && req.url === '/sensor') {
        console.log('INFO: Sensor response');
        sensorResponse(res);
    } else if (req.method === 'POST' && req.url === '/sensor/connect') {
        console.log('INFO: Try to reconect to the sensor');
        SENSOR.connectToSensor();
        sensorPostRoute(res);
    } else {
        notHandled(req, res);
    }
};

const router = function(req, res){
    switch (req.url) {
        case '/':
            mainRoutesHandler(req, res);
            break;
        case '/led':
            ledRoutesHandler(req, res);
            break;
        case '/updater':
            updaterRoutesHandler(req, res);
            break;
        case '/sensor':
        case '/sensor/connect':
            sensorRoutesHandler(req, res);
            break;
        default:
            notHandled(req, res);
            break;
    }
};

const notHandled = function(req, res){
    console.log('INFO: URL not handled, ');
    console.log('INFO: URL, ' + req.url);
    console.log('INFO: Method, ' + req.method);
    sendErrorResponse(res, 400, 'Url not handled');
};

const createServer = function (port) {
    console.log('INFO: Start Time ' + START_TIME);
    HTTP.createServer(router).listen(port);
};

E.on('init', function () {
    START_TIME = Date.now();
    console.log('INFO: init board');
    MYLED.configureLed();
    WIFI.setWifi();
    createServer(PORT);
    SENSOR.configureIC2();
    SENSOR.connectToSensor();
});

console.log('INFO: End of script file');
