#!/usr/bin/env python3
import cgi
import datetime
import os

print("Content-Type: text/html")
print()

print("""
<!DOCTYPE html>
<html>
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