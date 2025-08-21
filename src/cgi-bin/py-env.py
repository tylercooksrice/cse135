#!/usr/bin/env python3
import os

print("Content-Type: text/plain\n")
for key, value in os.environ.items():
    print(f"{key} = {value}")
