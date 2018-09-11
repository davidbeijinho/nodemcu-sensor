const WIFI = require('Wifi');
const HTTP = require('http');
const BMP085 = require('BMP085');
const BMP_MODE = 3;
const LED = NodeMCU.D4;
const PORT = 8080;
const SEALEVEL = 99867; // current sea level pressure in Pa
const I2CBUS = new I2C();
const wifiConfig = {
    SSID: 'XXXXX',
    hostname: 'nomada-espruino',
    options: {
        password: 'XXXXX',
    }
};
var BMP = null;

const STATE = {
    ledStatus: true,
};

const setWifi = function () {
    WIFI.setHostname(wifiConfig.hostname, function () {
        console.log('INFO: Wifi Hostanme seted', arguments);
    });
    WIFI.connect(wifiConfig.SSID, wifiConfig.options, function () { 
        console.log('INFO: Wifi connection', arguments); 
    });echo
    WIFI.stopAP();
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

const sensorResponse = function (res) {
    if (BMP !== null) {
        BMP.getPressure(function (d) {
            let altitude = BMP.getAltitude(d.pressure, SEALEVEL);
            console.log('INFO: Pressure: ' + d.pressure + ' Pa');
            console.log('INFO: Temperature: ' + d.temperature + ' C');
            console.log('INFO: Altitude: ' + altitude + ' m');

            sendOKResponse(res, {
                pressure: d.pressure,
                temperature: d.temperature,
                altitude: altitude,
                upTime: getUptime(),
                startTime: STATE.startTime,
            });
        });
    } else {
        console.log('INFO: Sensor not connected');
        errorResponse(res, 500, 'Sensor not connected');
    }
};

const ledResponse = function (res) {
    sendOKResponse(res, {
        led: STATE.ledStatus,
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
    res.writeHead(code, { 'Content-Type': 'application/json' });
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