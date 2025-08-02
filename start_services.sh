#!/bin/bash

echo "🚀 Starting Adalex Services with Real Data..."

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🛑 Killing processes on port $port: $pids"
        echo $pids | xargs kill -KILL 2>/dev/null
        sleep 1
    fi
}

# Function to cleanup and stop all services
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    
    # Kill processes on our ports
    kill_port 5001
    kill_port 3000
    
    # Additional cleanup (preserve .next cache for faster restarts)
    echo "🧹 Cleaning up any remaining processes..."
    pkill -f "python api_endpoint.py" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    pkill -f "node.*next" 2>/dev/null
    
    echo "✅ All services stopped successfully!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Kill any existing processes on our ports
echo "🧹 Cleaning up any existing processes..."
kill_port 5001
kill_port 3000
sleep 2

# Fix permissions for chromedriver binaries
find $HOME/.wdm/drivers/chromedriver -type f -name 'chromedriver*' -exec chmod +x {} \;

# Start Flask API in background
echo "🔧 Starting Flask API on port 5001..."
cd database/api
source venv/bin/activate
FLASK_RUN_PORT=5001 python api_endpoint.py &
FLASK_PID=$!
cd ../..

# Wait a moment for Flask to start
sleep 3

# Start Next.js in background
echo "🔧 Starting Next.js on port 3000..."
cd frontend
# Ensure dependencies are installed (only if missing)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi
# Start Next.js with optimized flags for faster startup
echo "⚡ Starting Next.js with optimized settings..."
NODE_ENV=development npm run dev:fast &
NEXTJS_PID=$!
cd ..

echo ""
echo "🎉 Services are starting up!"
echo "📊 Flask API: http://localhost:5001"
echo "🌐 Next.js UI: http://localhost:3000"
echo ""
echo "📝 Press Ctrl+C to stop all services gracefully"
echo ""
echo "🔍 The UI will now show real data from the database instead of sample data!"
echo ""
echo "🚀 New Features:"
echo "   ✅ Real data integration with database"
echo "   ✅ UYAP'ta Sorgula button functionality"
echo "   ✅ Automatic data refresh after queries"
echo "   ✅ Progress indicators and error handling"
echo ""
echo "📋 How to test:"
echo "   1. Make sure UYAP is connected (green badge)"
echo "   2. Open any icra dosyası detail"
echo "   3. Click on Adres tab"
echo "   4. Click 'UYAP'ta Sorgula' button"
echo "   5. Watch the real data appear!"

echo ""
echo "⏳ Services are running. Press Ctrl+C to stop all services..."
echo "📝 You can also run './stop_services.sh' in another terminal to stop services"

echo ""
echo "🛑 TO STOP SERVICES:"
echo "   Option 1: Press Ctrl+C in this terminal"
echo "   Option 2: Run this command in a new terminal:"
echo "   ./stop_services.sh"
echo ""
echo "   Option 3: Manually kill processes:"
echo "   lsof -ti:5001 | xargs kill -KILL"
echo "   lsof -ti:3000 | xargs kill -KILL"

# Wait for both background processes and show their output
wait $FLASK_PID $NEXTJS_PID 