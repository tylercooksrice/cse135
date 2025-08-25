#!/usr/bin/env python3
import cgi

# Headers
print("Content-Type: text/html\n\n")

# Get POST data
form = cgi.FieldStorage()
print("<!DOCTYPE html>")
print("""
<html>
<head>
    <title>Python Post</title>
</head>
<body>""")
print("<h1>POST Data</h1>")
print("<ul>")
for key in form.keys():
    print(f"<li>{key} = {form.getvalue(key)}</li>")

print("</ul>")


print("""
</body>
</html>
""")