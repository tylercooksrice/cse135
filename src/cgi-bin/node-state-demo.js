#!/usr/bin/env node
const fs = require("fs");

// Parse cookies
const cookieHeader = process.env.HTTP_COOKIE || "";
const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));

// Read POST body if submitted
let body = "";
process.stdin.on("data", chunk => body += chunk);
process.stdin.on("end", () => {
  let name = cookies.username;

  if (process.env.REQUEST_METHOD === "POST" && body.includes("username=")) {
    name = decodeURIComponent(body.split("username=")[1].split("&")[0] || "");
  }

  process.stdout.write("Content-Type: text/html\n");
  if (name) {
    process.stdout.write(`Set-Cookie: username=${encodeURIComponent(name)}; Path=/\n`);
  }
  process.stdout.write("\n");

  process.stdout.write("<!DOCTYPE html><html><body>");
  if (!name) {
    process.stdout.write(`
      <form method="POST" action="node-state-demo.js">
        <label>Enter your name: <input type="text" name="username"></label>
        <button type="submit">Submit</button>
      </form>
    `);
  } else {
    process.stdout.write(`<h1>Welcome back, ${name}!</h1>`);
  }
  process.stdout.write("</body></html>");
});
