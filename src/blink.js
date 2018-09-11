var status = false;

setInterval(function() {
    status = !status;
    digitalWrite(NodeMCU.D4, status);
}, 1000);
