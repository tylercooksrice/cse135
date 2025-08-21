#!/usr/bin/env python3
import cgi
import http.cookies
import os
import datetime

print("Content-Type: text/html")

# Grab any existing cookies
cookie = http.cookies.SimpleCookie(os.environ.get("HTTP_COOKIE"))
form = cgi.FieldStorage()

username = form.getvalue("username")

if username:
    # Save username in a cookie
    cookie["username"] = username
    cookie["username"]["path"] = "/"
    cookie["username"]["expires"] = (datetime.datetime.utcnow() + datetime.timedelta(minutes=5)).strftime("%a, %d-%b-%Y %H:%M:%S GMT")
    print(cookie.output())
    print()
    print(f"<html><body><h2>Hello, {username}! Your session has been saved.</h2>")
else:
    # Read cookie if no username in form
    saved_user = cookie["username"].value if "username" in cookie else "Guest"
    print()
    print(f"<html><body><h2>Welcome back, {saved_user}!</h2>")

print('<a href="/session.html">Go back</a> | <a href="/index.html">Home</a>')
print("</body></html>")
