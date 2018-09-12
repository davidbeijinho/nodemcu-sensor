const BMP_MODE = 3;
const SEALEVEL = 99867; // current sea level pressure in Pa
const I2CBUS = new I2C();
const BMP085 = require('BMP085');

var BMP = null;

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

const isConected = function () {
    return BMP !== null;
}

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

module.exports = {
    configureIC2: configureIC2,
    connectToSensor: connectToSensor,
    isConected: isConected,
    getSensorData: getSensorData
};