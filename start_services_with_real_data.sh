#!/bin/bash

echo "🚀 Starting Adalex Services with Real Data..."

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Check if Flask API is already running on 5001
if check_port 5001; then
    echo "✅ Flask API is already running on port 5001"
else
    echo "🔧 Starting Flask API on port 5001..."
    cd database/api
    # Pass port 5001 to Flask API
    source venv/bin/activate
    FLASK_RUN_PORT=5001 python api_endpoint.py &
    FLASK_PID=$!
    echo "✅ Flask API started with PID: $FLASK_PID"
    cd ../..
fi

# Wait a moment for Flask to start
sleep 2

# Check if Next.js is already running
if check_port 3000; then
    echo "✅ Next.js is already running on port 3000"
else
    echo "🔧 Starting Next.js on port 3000..."
    cd new-ui
    npm run dev &
    NEXTJS_PID=$!
    echo "✅ Next.js started with PID: $NEXTJS_PID"
    cd ..
fi

echo ""
echo "🎉 Services are starting up!"
echo "📊 Flask API: http://localhost:5001"
echo "🌐 Next.js UI: http://localhost:3000"
echo ""
echo "📝 To stop services, use: pkill -f 'python api_endpoint.py' && pkill -f 'next dev'"
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