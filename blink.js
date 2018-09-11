var status = false;

setInterval(function() {
    status = !status;
    digitalWrite(LED_1, status);
}, 1000);
