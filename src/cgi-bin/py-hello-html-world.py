import cgi
import os
import datetime

print("Cache-Control: no-cache")
print("Content-type: text/html\n")

print("<html>")
print("<head><title>Hello, Python!</title></head>")
print("<body>")
print("<h1>Hello, Python!</h1>")
print("<p>This page was generated with the Python programming language</p>")

datetime = datetime.datetime.now()
print(f"<p>Current Time: {datetime}</p>")

ip = os.environ.get("REMOTE_ADDR", "Unknown")
print(f"<p>Your IP Address: {ip}</p>")

print("</body>")
print("</html>")
