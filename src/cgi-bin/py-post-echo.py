#!/usr/bin/env python3
import cgi
import sys

print("Content-Type: text/html")
print()

print("""
<html><head><title>POST Message Body</title></head>
<body><h1 align=center>POST Message Body</h1>
<hr/>
<b>Message Body:</b><br/>
""")

form = cgi.FieldStorage()

if form.list:
    print("<ul>")
    for field in form.list:
        print(f"<li>{cgi.escape(field.name)} = {cgi.escape(field.value)}</li>")
    print("</ul>")
else:
    raw_data = sys.stdin.read()
    print(f"<pre>{cgi.escape(raw_data)}</pre>")

print("</body></html>")