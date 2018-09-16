const express = require('express');
const swaggerUiDist = require('swagger-ui-dist');
const bodyParser = require('body-parser');

const pathToSwaggerUi = swaggerUiDist.absolutePath();
const app = express();

app.use(express.static('public'))
app.use(express.static(pathToSwaggerUi));

app.use(bodyParser.json())
app.post('*', function (req, res) {
    // res.send('POST request to homepage');
    console.log('---------');
    console.log('recieve request');
    console.log('---------');
    console.log(req.headers);
    console.log('---------');
    console.log(req.body);
    console.log('---------.');
    res.send("test");
  });
  app.get('*', function (req, res) {
    // res.send('POST request to homepage');
    console.log('---------');
    console.log('recieve request');
    console.log('---------');
    console.log(req.headers);
    console.log('---------');
    console.log(req.body);
    console.log('---------.');
    res.send("test");
  });
app.listen(9000);
