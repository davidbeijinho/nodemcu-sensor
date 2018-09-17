var LEDPIN = NodeMCU.D4;

var STATE = {
	status: true
};

function setStatus (status) {
	STATE.status = status;
	digitalWrite(LEDPIN, STATE.status);
}

function getStatus () {
	return STATE.status;
}

function configureLed () {
	console.log('INFO: Configuring LED');
	pinMode(LEDPIN, 'output');
	setStatus(STATE.status);
}

module.exports = {
	setStatus: setStatus,
	configureLed: configureLed,
	getStatus: getStatus
};
