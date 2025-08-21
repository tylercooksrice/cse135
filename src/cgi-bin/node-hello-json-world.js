#!/usr/bin/env node

const ip = process.env.REMOTE_ADDR || "unknown";
const now = new Date().toISOString();

process.stdout.write("Content-Type: application/json\n\n");
process.stdout.write(JSON.stringify({
  message: "Hello World",
  datetime: now,
  ip: ip
}, null, 2));
