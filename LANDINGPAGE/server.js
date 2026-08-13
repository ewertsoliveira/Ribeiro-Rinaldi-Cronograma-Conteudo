const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer(function (request, response) {
    let filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index-debug3.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            response.writeHead(500);
            response.end('Error');
            response.end(); 
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(8000);
console.log('Server running at http://127.0.0.1:8000/');
