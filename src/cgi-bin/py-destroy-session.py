#!/usr/bin/env python3
import http.cookies
import datetime

# Expire the cookie to "destroy" the session
cookie = http.cookies.SimpleCookie()
cookie["username"] = ""
cookie["username"]["path"] = "/"
cookie["username"]["expires"] = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime("%a, %d-%b-%Y %H:%M:%S GMT")

# Print headers
print("Content-Type: text/html")
print(cookie.output())
print()

# HTML page
print("""
<html>
<head>
  <title>Python Session Destroyed</title>
</head>
<body>
  <h1>Session Destroyed</h1>
  <a href="/session.html">Back to the Session Form</a><br />
  <a href="/index.html">Back to Home</a><br />
</body>
</html>
""")
