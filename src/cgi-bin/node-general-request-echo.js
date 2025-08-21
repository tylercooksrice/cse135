#!/usr/bin/env node
let body = "";
process.stdin.on("data", chunk => body += chunk);
process.stdin.on("end", () => {
  const method = process.env.REQUEST_METHOD || "UNKNOWN";
  const query = process.env.QUERY_STRING || "";

  process.stdout.write("Content-Type: text/plain\n\n");
  process.stdout.write(`Method: ${method}\n`);
  process.stdout.write(`Query: ${query}\n`);
  process.stdout.write(`Body: ${body}\n`);
});
