const http = require('http');

const server = http.createServer((req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = new Date();
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hello HTML World</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                p { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Hello World</h1>
            <p>Current Date/Time: ${now.toString()}</p>
            <p>Your IP Address: ${ip}</p>
            <p>Served over: HTTPS</p>
            <a href="/src/index.html">Back to Home</a>
        </body>
        </html>
    `);
});

server.listen(3000, () => {
    console.log('Hello HTML World server running on port 3000');
});