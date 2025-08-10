#!/bin/bash

# Adalex Service Startup Script
# This script starts both the backend API server and frontend development server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is already in use. Attempting to kill existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    # Kill background processes
    jobs -p | xargs kill -9 2>/dev/null || true
    print_success "All services stopped"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_status "Starting Adalex Services..."
print_status "Script directory: $SCRIPT_DIR"

# Check if required directories exist
if [ ! -d "backend" ]; then
    print_error "Backend directory not found!"
    exit 1
fi

if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found!"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    print_error "Python virtual environment not found in backend/venv"
    print_status "Please run: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r api/requirements.txt"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    print_error "Node modules not found in frontend/node_modules"
    print_status "Please run: cd frontend && npm install"
    exit 1
fi

# Kill all active services at startup
print_status "Killing any existing services..."
kill_port 5001  # Backend API port
kill_port 3000  # Frontend port

# Additional cleanup - kill any remaining processes that might be related
print_status "Performing additional cleanup..."
pkill -f "python.*api_endpoint.py" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
pkill -f "npm.*run.*dev" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Start Backend API Server
print_status "Starting Backend API Server on port 5001..."
cd backend
source venv/bin/activate
python api/api_endpoint.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if check_port 5001; then
    print_success "Backend API Server started successfully on port 5001"
else
    print_error "Failed to start Backend API Server"
    exit 1
fi

# Start Frontend Development Server
print_status "Starting Frontend Development Server on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if check_port 3000; then
    print_success "Frontend Development Server started successfully on port 3000"
else
    print_error "Failed to start Frontend Development Server"
    exit 1
fi

print_success "All services started successfully!"
print_status "Backend API: http://localhost:5001"
print_status "Frontend: http://localhost:3000"
print_status "Press Ctrl+C to stop all services"

# Wait for user to stop the services
wait
