const LEDPIN = NodeMCU.D4;

const STATE = {
    status: false,
}

const setStatus= function (status) {
    STATE.status = status;
    digitalWrite(LEDPIN, STATE.status);
};

const getStatus = function () {
    return STATE.status;
};

const configureLed = function () {
    console.log('INFO: Configuring LED');
    pinMode(LEDPIN, 'output');
    setStatus(STATE.status);
};

module.exports = {
    setLed: setLed,
    configureLed: configureLed,
    getStatus: getStatus,
};