#!/usr/bin/env python3
import http.cookies

print("Content-Type: text/html")
cookie = http.cookies.SimpleCookie()
cookie['session_id'] = ''
cookie['session_id']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
print(cookie.output())
print()

print("""
<!DOCTYPE html>
<html>
<head>
  <title>Python Session Destroyed</title>
</head>
<body>
  <h1>Session Destroyed</h1>
  <a href="/cgiform.html">Back to Form</a><br>
  <a href="/cgi-bin/py-state-demo.py">Back to Python Session Page</a>
</body>
</html>
""")