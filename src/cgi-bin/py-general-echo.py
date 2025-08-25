#!/usr/bin/env python3
import os
import cgi

method = os.environ.get("REQUEST_METHOD", "GET")
protocol = os.environ.get("SERVER_PROTOCOL", "")
msgBody = os.environ.get("QUERY_STRING", "")
print("Content-Type: text/html\n")

print(f"<h1>Method: {method}</h1>")
print(f"<p><b>HTTP Protocol:</b> {protocol} </p>")

if method in ["POST", "PUT", "PATCH"]:
    form = cgi.FieldStorage()
    print("<h2>Payload</h2><ul>")
    for key in form.keys():
        print(f"<li>{key} = {form.getvalue(key)}</li>")
    print("</ul>")
else:
    query_string = os.environ.get("QUERY_STRING", "")
    print(f"<h2>Query String: {query_string}</h2>")

print(f"<p><b>Message Body:</b> {msgBody}</p>")