#!/usr/bin/env python3
import cgi
import os

print("Content-Type: text/html")
print()

print("""
<!DOCTYPE html>
<html><head><title>General Request Echo</title></head>
<body><h1 align="center">General Request Echo</h1>
<hr>
""")

protocol = os.environ.get('SERVER_PROTOCOL', '')
method = os.environ.get('REQUEST_METHOD', '')
query = os.environ.get('QUERY_STRING', '')
body = sys.stdin.read()

print(f"<p><b>HTTP Protocol:</b> {cgi.escape(protocol)}</p>")
print(f"<p><b>HTTP Method:</b> {cgi.escape(method)}</p>")
print(f"<p><b>Query String:</b> {cgi.escape(query)}</p>")
print(f"<p><b>Message Body:</b> {cgi.escape(body)}</p>")

print("</body></html>")