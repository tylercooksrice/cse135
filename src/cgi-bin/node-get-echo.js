#!/usr/bin/env node
const query = process.env.QUERY_STRING || "";

process.stdout.write("Content-Type: text/plain\n\n");
process.stdout.write("GET query string:\n" + query + "\n");
