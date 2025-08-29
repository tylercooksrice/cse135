const http = require('http');

const server = http.createServer((req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const currentDate = new Date().toLocaleString();
    
    const responseData = {
        message: "Hello World!",
        currentDateTime: currentDate,
        clientIP: clientIP
    };
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(responseData));
});

server.listen(3002, () => {
    console.log('Hello JSON World server running on port 3002');
});