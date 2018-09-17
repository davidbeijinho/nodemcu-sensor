/* global HTTP, SENSOR */
var MIN_INTERVAL = 10;
var MAX_ERRORS = 10;

var defaultCalls = {
	time: 0,
	lastStatus: null,
	totalCount: 0,
	errorCount: 0,
	errorSequence: 0
};

function getDefaultStateCalls () {
	return {
		time: defaultCalls.time,
		lastStatus: defaultCalls.lastStatus,
		totalCount: defaultCalls.totalCount,
		errorCount: defaultCalls.errorCount,
		errorSequence: defaultCalls.errorSequence
	};
}

var STATE = {
	path: '',
	host: '',
	port: 80,
	method: 'POST',
	protocol: 'http:',
	interval: MIN_INTERVAL,
	active: false,
	process: 0,
	calls: getDefaultStateCalls()
};

function getState () {
	return STATE;
}

function resetUpdaterCalls () {
	STATE.calls = getDefaultStateCalls();
}

function stopUpdater () {
	clearInterval(STATE.process);
	STATE.active = false;
}

function checkUpdater () {
	if (STATE.calls.errorSequence >= MAX_ERRORS) {
		console.log('INFO: stop updater to many errors');
		stopUpdater();
	}
}

function updaterFail () {
	if (STATE.calls.lastStatus === false) {
		STATE.calls.errorSequence += 1;
	}
	STATE.calls.lastStatus = false;
	STATE.calls.totalCount += 1;
	STATE.calls.errorCount += 1;
	console.log('INFO: Updater calls:', STATE.calls);
}

function updaterSuccess () {
	STATE.calls.lastStatus = true;
	STATE.calls.totalCount += 1;
	STATE.calls.errorSequence = 0;
}

function postData (sensorData) {
	var parsedData = JSON.stringify(sensorData);
	var options = {
		path: STATE.path, // path sent to server
		host: STATE.host, // host: 'example.com', // host name
		port: STATE.port, // (optional) port, defaults to 80
		method: STATE.method, // HTTP command sent to server (must be uppercase 'GET', 'POST', etc)
		protocol: STATE.protocol, // protocol: 'http:',   // optional protocol - https: or http:
		// headers: { key : value, key : value } // (optional) HTTP headers
		headers: {
			'content-type': 'application/json',
			'content-length': parsedData.length,
			connection: 'close'
		}
	};
	var request = HTTP.request(options, function doRequest(res) {
		var requestData = '';
		res.on('data', function onData(d) {
			requestData += d;
		});
		res.on('close', function onClose(data) {
			console.log('INFO: post response 1', requestData);
			console.log('INFO: post response 2', data);
			updaterSuccess();
		});
		if (res.statusCode === 200) {
			updaterSuccess();
		} else {
			updaterFail();
		}
	});
	request.on('error', function onError(e) {
		console.log('INFO : error posting data', e);
		updaterFail();
	});
	request.write(parsedData);
	request.end();
}

function updaterCallback (data) {
	postData(data);
}

function updaterFunction () {
	// is this variable global ?
	SENSOR.getSensorData(function onSensorData(err, data) {
		if (err) {
			console.log('INFO: Error calling update function', err);
			updaterFail();
		} else {
			updaterCallback(data);
		}
	});
}

function startUpdater () {
	STATE.process = setInterval(function interval() {
		console.log('INFO: interval run');
		checkUpdater();
		updaterFunction();
	}, STATE.interval);
}

function setNewUpdater (newConfig) {
	STATE.path = newConfig.path;
	STATE.port = newConfig.port;
	STATE.host = newConfig.host;
	STATE.interval = newConfig.interval;
	STATE.active = newConfig.active;
}

function setUpdater (newConfig, callback, callbackParam) {
	if (STATE.active) {
		stopUpdater();
	}

	setNewUpdater(newConfig);

	if (STATE.active) {
		resetUpdaterCalls();
		startUpdater();
	}
	callback(callbackParam);
}

function getNewConfig (data) {
	return {
		path: Object.prototype.hasOwnProperty.call(data, 'path') ? data.path : STATE.path,
		host: Object.prototype.hasOwnProperty.call(data, 'host') ? data.host : STATE.host,
		port: Object.prototype.hasOwnProperty.call(data, 'port') ? data.port : STATE.port,
		interval: Object.prototype.hasOwnProperty.call(data, 'interval') ? data.interval : STATE.interval,
		active: Object.prototype.hasOwnProperty.call(data, 'active') ? data.active : STATE.active
	};
}

function isConfigValid (newConfig) {
	return typeof newConfig.path === 'string' &&
        typeof newConfig.host === 'string' &&
        typeof newConfig.port === 'number' &&
        newConfig.port >= 0 &&
        typeof newConfig.interval === 'number' &&
        newConfig.interval >= MIN_INTERVAL &&
        typeof newConfig.active === 'boolean';
}

module.exports = {
	getState: getState,
	setUpdater: setUpdater,
	getNewConfig: getNewConfig,
	isConfigValid: isConfigValid,
};
