const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    
    // Output request headers
    res.write("=== HTTP Request Headers ===\n");
    for (const [key, value] of Object.entries(req.headers)) {
        res.write(`${key}: ${value}\n`);
    }
    
    // Output server variables (simulated)
    res.write("\n=== Server Variables ===\n");
    res.write(`HTTP Method: ${req.method}\n`);
    res.write(`URL: ${req.url}\n`);
    res.write(`HTTP Version: ${req.httpVersion}\n`);
    
    res.end();
});

server.listen(3002, () => {
    console.log('Environment server running on port 3002');
});