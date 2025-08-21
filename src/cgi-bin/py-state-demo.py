#!/usr/bin/env python3
import cgi
import http.cookies
import os

# Check for existing session cookie
cookie = http.cookies.SimpleCookie(os.environ.get('HTTP_COOKIE', ''))
session_id = cookie.get('session_id')

# Handle form submission
form = cgi.FieldStorage()
if 'username' in form:
    # Create new session
    import uuid
    session_id = str(uuid.uuid4())
    # Store username in session (in real implementation, use database/filesystem)
    # For demo purposes, we'll just set cookie

print("Content-Type: text/html")
if session_id:
    cookie = http.cookies.SimpleCookie()
    cookie['session_id'] = session_id
    print(cookie.output())
print()

print("""
<!DOCTYPE html>
<html>
<head>
  <title>Python Sessions</title>
</head>
<body>
  <h1>Python Sessions Page 1</h1>
""")

if session_id:
    # In real implementation, retrieve username from session storage
    print("<p><b>Name:</b> User Name Set in Session</p>")
else:
    print("<p><b>Name:</b> You do not have a name set</p>")

print("""
  <form style="margin-top:30px" action="py-destroy-session.py" method="post">
    <button type="submit">Destroy Session</button>
  </form>
  <a href="/cgiform.html">Back to Form</a>
</body>
</html>
""")