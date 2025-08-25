const http = require('http');

const server = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    const now = new Date();
    
    const data = {
        message: "Hello World",
        timestamp: now.toString(),
        ip: ip
    };
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(data, null, 2));
});

server.listen(3001, () => {
    console.log('Hello JSON World server running on port 3001');
});