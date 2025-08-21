#!/usr/bin/env node

// Required for CGI
const fs = require("fs");

// Get environment variables from Apache
const ip = process.env.REMOTE_ADDR || "unknown";
const now = new Date().toString();

// Write HTTP headers
process.stdout.write("Content-Type: text/html\n\n");

// Write HTML
process.stdout.write(`
<!DOCTYPE html>
<html>
<head><title>Hello World</title></head>
<body>
  <h1>Hello World from Node.js (CGI)</h1>
  <p>Current Date/Time: ${now}</p>
  <p>Your IP: ${ip}</p>
</body>
</html>
`);
