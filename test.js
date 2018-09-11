require('espruino').expr('/dev/ttyUSB0', 'digitalWrite(NodeMCU.D4,false);', function(temp) {
        console.log('Current temperature is '+temp);
});