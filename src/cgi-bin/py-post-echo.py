#!/usr/bin/env python3
import cgi

# Headers
print("Content-Type: text/html\n\n")

# Get POST data
form = cgi.FieldStorage()
print("<!DOCTYPE html>")
print("""
<html><head><title>POST Message Body</title></head>
      <body><h1 align=center>POST Message Body</h1>
      <hr/>
<body>""")
print("<p>Message Body:</p><br>")
print("<ul>")
for key in form.keys():
    print(f"<li>{key} = {form.getvalue(key)}</li>")

print("</ul>")

print("""
</body>
</html>
""")

