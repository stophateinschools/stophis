#!/bin/bash

# Build React frontend
echo "Building client app..."
# TODO uncomment the following lines when we have authentication
# cd client
# npm install
# npm run build
# cd ..

# Now run Flask app
echo "Starting gunicorn..."
gunicorn server.wsgi:app