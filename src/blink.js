var status = false;

setInterval(function interval() {
	status = !status;
	digitalWrite(NodeMCU.D4, status);
}, 1000);
