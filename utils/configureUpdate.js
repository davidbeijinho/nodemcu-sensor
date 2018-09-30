var http = require('http')

const config = {
    active: true,
    interval: 10000,
    port: 3000,
    path: '/api/sensor',
    host: '192.168.0.159'
}

const post_data =  JSON.stringify(config);

const post_options = {
    hostname: '192.168.0.157',
    port    : '5000',
    path    : '/updater',
    method  : 'POST',
    headers : {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
    }
};

const post_req = http.request(post_options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('Response: ', chunk);
    });
});

post_req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

post_req.write(post_data);
post_req.end();
