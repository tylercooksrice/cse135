#!/usr/bin/env node

let body = "";
process.stdin.on("data", chunk => body += chunk);
process.stdin.on("end", () => {
  process.stdout.write("Content-Type: text/plain\n\n");
  process.stdout.write("POST body received:\n" + body);
});
