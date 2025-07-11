#!/bin/bash

echo "🛑 Stopping Adalex Services..."

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🛑 Killing processes on port $port: $pids"
        echo $pids | xargs kill -KILL 2>/dev/null
        sleep 1
    else
        echo "✅ No processes found on port $port"
    fi
}

# Kill processes on our ports
echo "🧹 Stopping Flask API on port 5001..."
kill_port 5001

echo "🧹 Stopping Next.js on port 3000..."
kill_port 3000

# Additional cleanup
echo "🧹 Cleaning up any remaining processes..."
pkill -f "python api_endpoint.py" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "node.*next" 2>/dev/null

echo "✅ All services stopped successfully!" 