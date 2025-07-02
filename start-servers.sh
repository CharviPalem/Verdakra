#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd Backend && npm start &

# Start the frontend server
echo "Starting frontend server..."
cd ../frontend && npm run dev

# Keep the script running
trap "trap - SIGTERM && kill -- -$$"
