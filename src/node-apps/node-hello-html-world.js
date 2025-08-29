const http = require('http');

const server = http.createServer((req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const currentDate = new Date().toLocaleString();
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hello HTML World</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                .info { background: #f5f5f5; padding: 20px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Hello World!</h1>
            <div class="info">
                <p><strong>Current Date/Time:</strong> ${currentDate}</p>
                <p><strong>Your IP Address:</strong> ${clientIP}</p>
            </div>
            <p><a href="/">Back to Home</a></p>
        </body>
        </html>
    `);
});

server.listen(3001, () => {
    console.log('Hello HTML World server running on port 3001');
});