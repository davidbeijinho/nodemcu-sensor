const LEDPIN = NodeMCU.D4;

const STATE = {
    status: true,
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
    setStatus: setStatus,
    configureLed: configureLed,
    getStatus: getStatus,
};
