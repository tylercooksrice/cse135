#!/usr/bin/env python3
import cgi

# Headers
print("Content-Type: text/html\n")

# Get POST data
form = cgi.FieldStorage()
print("<h1>POST Data</h1>")
print("<ul>")
for key in form.keys():
    print(f"<li>{key} = {form.getvalue(key)}</li>")
print("</ul>")