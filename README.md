# NodeMCU sensor

Simple project to upload code to the NodeMCU

Connected hardware

    - BMP085
    - Board led on D4

Board Json

- http://www.espruino.com/json/ESP8266_4MB.json

Swagger Ui

- http://localhost:9000
- http://localhost:9000/swagger.json

## Todo
    - Be able to access to espruino over hostname
    - Fix swagger UI POST send as OPTIONS
    - Get current time from network
    - Method to update sea level presure
    - Method to call api in intervals
        - listen to board events low memory to stop updater
        - Save reason for stop ( fails get data, fails response, board events)
    - update swagger documentation

## UTILS

require("Storage").eraseAll();