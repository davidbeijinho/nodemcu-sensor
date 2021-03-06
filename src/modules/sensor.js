var BMP_MODE = 3;
var SEALEVEL = 99867; // current sea level pressure in Pa
var I2CBUS = new I2C();
var BMP085 = require('BMP085');

var BMP = null;

function isConected () {
	return (BMP !== null);
}

function getSensorData (callback) {
	if (isConected()) {
		BMP.getPressure(function onData(d) {
			var altitude = BMP.getAltitude(d.pressure, SEALEVEL);
			console.log('INFO: Pressure:' + d.pressure + 'Pa');
			console.log('INFO: Temperature:' + d.temperature + ' C');
			console.log('INFO: Altitude:' + altitude + ' m');

			callback(null, {
				pressure: d.pressure,
				temperature: d.temperature,
				altitude: altitude
			});
		});
	} else {
		console.log('INFO: Sensor not connected');
		callback(new Error('Sensor not connected'));
	}
}

function connectToSensor () {
	BMP = BMP085.connect(I2CBUS, BMP_MODE);
	if (isConected()) {
		console.log('INFO: Sucessfuly connected to sensor');
	} else {
		console.log('INFO: Error connecting to sensor');
	}
}

function configureIC2 () {
	console.log('INFO: configure IC2');
	I2CBUS.setup({
		scl: NodeMCU.D1,
		sda: NodeMCU.D2
	});
}

module.exports = {
	configureIC2: configureIC2,
	connectToSensor: connectToSensor,
	isConected: isConected,
	getSensorData: getSensorData,
};
