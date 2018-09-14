const LED = NodeMCU.D4;
var ledStatus = false;

const setStatus= function (status) {
    ledStatus = status;
    digitalWrite(LED, ledStatus);
};

const getStatus = function () {
    return ledStatus;
};

const configureLed = function () {
    console.log('INFO: Configuring LED');
    pinMode(LED, 'output');
    setStatus(ledStatus);
};

module.exports = {
    setLed,
    configureLed
};
