const STATE = require('./src/modules/state.js');

const LED = NodeMCU.D4;

const configureLed = function () {
    console.log('INFO: Configuring LED');
    pinMode(LED, 'output');
    digitalWrite(LED, STATE.ledStatus);
};

const setLed = function (status) {
    STATE.ledStatus = status;
    digitalWrite(LED, STATE.ledStatus);
};

module.exports = {
    configureLed,
    setLed,
};