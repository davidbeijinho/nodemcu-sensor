const LEDPIN = NodeMCU.D4;

const STATE = {
  status: true
};

function setStatus (status) {
  STATE.status = status;
  digitalWrite(LEDPIN, STATE.status);
};

function getStatus () {
  return STATE.status;
};

function configureLed () {
  console.log('INFO: Configuring LED');
  pinMode(LEDPIN, 'output');
  setStatus(STATE.status);
};

module.exports = {
  setStatus,
  configureLed,
  getStatus
};
