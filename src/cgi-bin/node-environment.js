#!/usr/bin/env node
process.stdout.write("Content-Type: text/plain\n\n");
for (const [key, value] of Object.entries(process.env)) {
  process.stdout.write(`${key}=${value}\n`);
}
