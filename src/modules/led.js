const LED = NodeMCU.D4;

const STATE = {
    status: false,
}

const setStatus= function (status) {
    STATE.status = status;
    digitalWrite(LED, STATE.status);
};

const getStatus = function () {
    return STATE.status;
};

const configureLed = function () {
    console.log('INFO: Configuring LED');
    pinMode(LED, 'output');
    setStatus(STATE.status);
};

module.exports = {
    setLed: setLed,
    configureLed: configureLed,
    getStatus: getStatus,
};
