#!/usr/bin/env python3
import json
import datetime
import os

data = {
    "message": "Hello World from Python!",
    "date": datetime.datetime.now().strftime("%a %b %d %H:%M:%S %Y"),
    "ipAddress": os.environ.get('REMOTE_ADDR', 'Unknown')
}

print("Content-Type: application/json")
print()

print(json.dumps(data))