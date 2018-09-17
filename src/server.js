var HTTP = require('http');
var SENSOR = require('sensor');
var MYLED = require('myLed');
var WIFI = require('myWifi');
var UPDATER = require('updater');

var PORT = 80;
var START_TIME;

function getUptime () {
	return Date.now() - START_TIME;
}

function doResponse (res, code, data) {
	res.writeHead(code, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
	});
	res.write(JSON.stringify(data));
	res.end();
}

function sendOKResponse (res, data) {
	doResponse(res, 200, data);
}

function sendErrorResponse (res, code, message) {
	doResponse(res, code, {
		error: message,
		upTime: getUptime(),
		startTime: START_TIME
	});
}

function notHandled (req, res) {
	console.log('INFO: URL not handled');
	console.log('INFO: URL', req.url);
	console.log('INFO: Method', req.method);
	sendErrorResponse(res, 400, 'Url not handled');
}

function mainRouteResponse (res) {
	sendOKResponse(res, {
		upTime: getUptime(),
		startTime: START_TIME
	});
}

function ledResponse (res) {
	sendOKResponse(res, {
		status: MYLED.getStatus(),
		upTime: getUptime(),
		startTime: START_TIME
	});
}

function ledPostRoute (data, res) {
	if (typeof data.status === 'boolean') {
		MYLED.setStatus(data.status);
		ledResponse(res);
	} else {
		console.log('INFO: Invalid data' , JSON.stringify(data));
		sendErrorResponse(res, 400, 'Invalid Data');
	}
}

function updaterResponse (res) {
	sendOKResponse(res, {
		updater: UPDATER.getState(),
		upTime: getUptime(),
		startTime: START_TIME
	});
}

function updaterPostRoute (data, res) {
	var newConfig = UPDATER.getNewConfig(data);
	console.log('INFO: new config', newConfig);
	if (UPDATER.isConfigValid(newConfig)) {
		UPDATER.setUpdater(newConfig, updaterResponse, res);
	} else {
		console.log('INFO: Invalid updater config', data);
		sendErrorResponse(res, 400, 'Invalid updater config');
	}
}

function sensorResponse (res) {
	SENSOR.getSensorData(function onData(err, data) {
		if (err) {
			sendErrorResponse(res, 400, err);
		} else {
			sendOKResponse(res, {
				pressure: data.pressure,
				temperature: data.temperature,
				altitude: data.altitude,
				upTime: getUptime(),
				startTime: START_TIME
			});
		}
	});
}

function sensorPostRoute (res) {
	sendOKResponse(res, {
		bmp: SENSOR.isConected(),
		upTime: getUptime(),
		startTime: START_TIME
	});
}

function getPostData (req, res, callback) {
	var data = '';
	req.on('data', function onData(d) { data += d; });
	req.on('end', function onEnd() {
		var parsedData = JSON.parse(data);
		callback(parsedData, res);
	});
}

function mainRoutesHandler (req, res) {
	if (req.method === 'GET') {
		console.log('INFO: Main page');
		mainRouteResponse(res);
	} else {
		notHandled(req, res);
	}
}

function ledRoutesHandler (req, res) {
	if (req.method === 'GET') {
		console.log('INFO: Get status of the LED');
		ledResponse(res);
	} else if (req.method === 'POST') {
		console.log('INFO: LED Post route');
		getPostData(req, res, ledPostRoute);
	} else {
		notHandled(req, res);
	}
}

function updaterRoutesHandler (req, res) {
	if (req.method === 'GET') {
		console.log('INFO: Get updater information');
		updaterResponse(res);
	} else if (req.method === 'POST') {
		console.log('INFO: Updater config route');
		getPostData(req, res, updaterPostRoute);
	} else {
		notHandled(req, res);
	}
}

function sensorRoutesHandler (req, res) {
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
}

function router (req, res) {
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
}

function createServer (port) {
	console.log('INFO: Start Time', START_TIME);
	HTTP.createServer(router).listen(port);
}

E.on('init', function onInit() {
	START_TIME = Date.now();
	console.log('INFO: init board');
	MYLED.configureLed();
	WIFI.setWifi();
	createServer(PORT);
	SENSOR.configureIC2();
	SENSOR.connectToSensor();
});

console.log('INFO: End of script file');
