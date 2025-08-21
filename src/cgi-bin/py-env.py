#!/usr/bin/env python3
import os

print("Content-Type: text/html")
print()

print("""
<!DOCTYPE html>
<html>
<head><title>Environment Variables</title></head>
<body>
<h1 align="center">Environment Variables</h1>
<hr>
""")

for key, value in os.environ.items():
    print(f"<b>{key}:</b> {value}<br />")

print("""
</body>
</html>
""")