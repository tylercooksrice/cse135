const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    
    let responseHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Environment Variables</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Environment Variables</h1>
            <table>
                <tr>
                    <th>Variable</th>
                    <th>Value</th>
                </tr>
    `;
    
    // Add request headers
    for (const [key, value] of Object.entries(req.headers)) {
        responseHTML += `
            <tr>
                <td>${key}</td>
                <td>${value}</td>
            </tr>
        `;
    }
    
    // Add server environment variables
    for (const [key, value] of Object.entries(process.env)) {
        responseHTML += `
            <tr>
                <td>${key}</td>
                <td>${value}</td>
            </tr>
        `;
    }
    
    responseHTML += `
            </table>
            <p><a href="/">Back to Home</a></p>
        </body>
        </html>
    `;
    
    res.end(responseHTML);
});

server.listen(3003, () => {
    console.log('Environment server running on port 3003');
});