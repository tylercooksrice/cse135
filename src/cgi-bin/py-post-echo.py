#!/usr/bin/env python3
import cgi

print("Content-Type: text/html\n")
form = cgi.FieldStorage()

print("<html><body><h2>POST Echo</h2><ul>")
for key in form.keys():
    print(f"<li>{key}: {form.getvalue(key)}</li>")
print("</ul></body></html>")
