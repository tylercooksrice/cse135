#!/usr/bin/env python3
import cgi
import os
import http.cookies
import uuid
import pickle

# Session storage path
SESSION_DIR = "/tmp/sessions"

def get_session_id():
    cookie = http.cookies.SimpleCookie(os.environ.get('HTTP_COOKIE'))
    return cookie.get('session_id').value if 'session_id' in cookie else None

def save_session(session_id, data):
    with open(f"{SESSION_DIR}/{session_id}", 'wb') as f:
        pickle.dump(data, f)

def load_session(session_id):
    try:
        with open(f"{SESSION_DIR}/{session_id}", 'rb') as f:
            return pickle.load(f)
    except FileNotFoundError:
        return {}

# Generate or retrieve session
session_id = get_session_id()
if not session_id:
    session_id = str(uuid.uuid4())
    # Set cookie in headers
    print(f"Set-Cookie: session_id={session_id}; Path=/\n")

session_data = load_session(session_id)

form = cgi.FieldStorage()
print("Content-Type: text/html\n")

# Page 1: Form input
if not form.getvalue('name'):
    print('''
        <form method="POST">
            Enter your name: <input type="text" name="name">
            <input type="submit" value="Submit">
        </form>
    ''')
else:
    # Save name to session and show link to next page
    session_data['name'] = form.getvalue('name')
    save_session(session_id, session_data)
    print('''
        <h1>Name saved!</h1>
        <a href="state-demo.py?page=2">Go to page 2</a>
    ''')

# Page 2: Retrieve data from session
if form.getvalue('page') == '2':
    name = session_data.get('name', 'No name found')
    print(f"<h1>Stored Name: {name}</h1>")