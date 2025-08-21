#!/usr/bin/env python3
import os
import datetime
import json

print("Cache-Control: no-cache")
print("Content-type: application/json\n")

datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
ipaddress = os.environ.get("REMOTE_ADDR", "Unknown")

message = {
    "title": "Hello, Python!",
    "heading": "Hello, Python!",
    "message": "This page was generated with the Python programming language",
    "time": datetime,
    "IP": ipaddress
}

print(json.dumps(message))
