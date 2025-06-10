#!/bin/bash

# Start backend
echo "Starting Gin backend on :8080..."
cd backend && go run main.go &
BACKEND_PID=$!

# Start frontend
echo "Starting SolidJS frontend on :3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

# Function to kill both processes
cleanup() {
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}

# Set up trap to catch Ctrl+C
trap cleanup INT

echo "Both servers are running. Press Ctrl+C to stop."
wait
