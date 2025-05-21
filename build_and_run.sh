#!/bin/bash

# Build React frontend
echo "Building client app..."
npm install
npm run --workspace client build

# Now run Flask app
echo "Starting gunicorn..."
gunicorn server.wsgi:app