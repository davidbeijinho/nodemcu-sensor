const express = require('express');
const swaggerUiDist = require('swagger-ui-dist');

const pathToSwaggerUi = swaggerUiDist.absolutePath();
const app = express();

app.use(express.static('public'))
app.use(express.static(pathToSwaggerUi));

app.listen(3000);
