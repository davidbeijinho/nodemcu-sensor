const LED = NodeMCU.D4;
var ledStatus = false;

const setLed = function (status) {
    ledStatus = status;
    digitalWrite(LED, ledStatus);
};

const configureLed = function () {
    console.log('INFO: Configuring LED');
    pinMode(LED, 'output');
    digitalWrite(LED, STATE.ledStatus);
};

module.exports = {
    setLed,
    configureLed
};
