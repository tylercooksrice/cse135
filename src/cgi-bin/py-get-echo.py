#!/usr/bin/env python3
import cgi
import os

print("Content-Type: text/html")
print()

print("""
<html><head><title>GET query string</title></head>
<body><h1 align=center>GET query string</h1>
<hr/>
""")

query_string = os.environ.get('QUERY_STRING', '')
print(f"Raw query string: {cgi.escape(query_string)}<br/><br/>")

form = cgi.FieldStorage()
print("<table border=1 cellpadding=5> Formatted Query String:")

for key in form.keys():
    value = form.getvalue(key)
    print(f"<tr><td>{cgi.escape(key)}:</td><td>{cgi.escape(value)}</td></tr>")

print("</table>")
print("</body></html>")