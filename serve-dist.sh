#!/bin/bash
cd "$(dirname "$0")/dist"
exec python3 -m http.server 5055
