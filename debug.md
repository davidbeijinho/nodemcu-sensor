

var status = false;setInterval(function() {status = !status;digitalWrite(NodeMCU.D4, status);}, 1000);


---> "\u0010reset();\n\u0010setTime(1536673531.325);E.setTimeZone(2)\n\u0010\u001b[1drequire(\"Storage\").write(\".bootcde\",\"var status = false;setInterval(function() {status = !status;digitalWrite(NodeMCU.D4, status);}, 1000);\",0,102);\n\u0010\u001b[2dload()\n\n"
Splitting for reset(), delay 250

>>> Connecting...
Set Slow Write = true
[object Object]
Connected [object Object]
Received a prompt after sending newline... good!
>>> Sending...
---> "\u0010print(\"<\",\"<<\",JSON.stringify(process.env),\">>\",\">\")\n"
>>> Sent
Got "< << {\"VERSION\":\"1v99\",\"GIT_COMMIT\":\"f0d66ba\",\"BOARD\":\"ESP8266_4MB\",\"FLASH\":0,\"RAM\":81920,\"SERIAL\":\"a020a612-5680\",\"CONSOLE\":\"Serial1\",\"MODULES\":\"Flash,Storage,net,dgram,http,NetworkJS,Wifi,ESP8266,TelnetServer,crypto,neopixel\",\"EXPTR\":1073643636} >> >\r\n>"
[notify_info] Found ESP8266_4MB, 1v99
Loading http://www.espruino.com/json/ESP8266_4MB.json
Board JSON loaded
Set Slow Write = true
FIRMWARE: Current 1v99, Available 1v99
Device found {"bitrate":115200,"bufferSize":4096,"connectionId":4,"ctsFlowControl":false,"dataBits":"eight","name":"","parityBit":"no","paused":false,"persistent":false,"receiveTimeout":0,"sendTimeout":0,"stopBits":"one"}
[success] Connected to /dev/ttyUSB0
>>> Connected to /dev/ttyUSB0


UPLOAD
espruino -p /dev/ttyUSB0 --board ESP8266_4MB  -b 115200 -v --no-ble  -w index.js  -o out.js  --config RESET_BEFORE_SEND=true --config SAVE_ON_SEND=true

reset

espruino -p /dev/ttyUSB0 --board ESP8266_4MB  -b 115200 -v --no-ble  -e "reset()" 

 1276  espruino -p /dev/ttyUSB0 --board ESP8266_4MB  -b 115200 -v --no-ble  -w index.js -e "save()"  -o out.js  --config RESET_BEFORE_SEND=true
 1277  espruino -p /dev/ttyUSB0 --board ESP8266_4MB  -b 115200 -v --no-ble  -w index.js -e "save()"  -o out.js  --config RESET_BEFORE_SEND=true --config SAVE_ON_SEND=true
 1278  espruino -p /dev/ttyUSB0 --board ESP8266_4MB  -b 115200 -v --no-ble  -w index.js  -o out.js  --config RESET_BEFORE_SEND=true --config SAVE_ON_SEND=true
