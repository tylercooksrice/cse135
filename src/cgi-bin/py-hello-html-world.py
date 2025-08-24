#!/usr/bin/env python3
import datetime
import os

print("Cache-Control: no-cache")
print("Content-Type: text/html\n\n")

print("<!DOCTYPE html>")
print("""
<html>
<head>
    <title>Hello Python World</title>
</head>
<body>
    <h1>Hello, Python!</h1>
    <p>This page was generated with Python!</p>

""")

date_string = datetime.datetime.now().strftime("%a %b %d %H:%M:%S %Y")
ip_address = os.environ.get('REMOTE_ADDR', 'Unknown')

print(f"<p>Current Time: {date_string}</p>")
print(f"<p>Your IP address is: {ip_address}</p>")

print("""
</body>
</html>
""")