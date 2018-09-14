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

const infoResponse = function (res) {
    doResponse(res, 200, {
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const sensorResponse = function (res) {
    SENSOR.getSensorData(function(err, data){
    if (err) {
        errorResponse(res, 500, err);
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

const ledResponse = function (res) {
    sendOKResponse(res, {
        status: LED.getStatus(),
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const updaterResponse = function (res) {
    sendOKResponse(res, {
        updater: UPDATER.getState(),
        upTime: getUptime(),
        startTime: START_TIME,
    });
};

const sendOKResponse = function (res, data) {
    doResponse(res, 200, data);
};

const errorResponse = function (res, code, message) {
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

const connectResponse = function (res) {
    sendOKResponse(res, {
        bmp: SENSOR.isConected(),
        upTime: getUptime(),
        startTime: START_TIME,
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
            SENSOR.connectToSensor();
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
        MYLED.setLed(true);
        ledResponse(res);
    } else if (data.status === false) {
        MYLED.setLed(false);
        ledResponse(res);
    } else {
        console.log('INFO: Invalid data , ' + data);
        errorResponse(res, 403, 'Invalid Data');
    }
};

const handleUpdaterRoute = function (data, res) {
    var newConfig = UPDATER.getNewConfig(data);
    console.log('INFO: new config', newConfig);
    if (UPDATER.isConfigValid(newConfig)) {
        UPDATER.setUpdater(newConfig, updaterResponse, res);
    } else {
        console.log('INFO: Invalid updater config , ' + data);
        errorResponse(res, 403, 'Invalid updater config');
    }
};

const createServer = function (port) {
    console.log('INFO: Start Time ' + START_TIME);
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
    START_TIME = Date.now();
    console.log('INFO: init board');
    MYLED.configureLed();
    WIFI.setWifi();
    createServer(PORT);
    SENSOR.configureIC2();
    SENSOR.connectToSensor();
});

console.log('INFO: End of script file');
