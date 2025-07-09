#!/bin/bash

# Start Database API and Next.js Application
echo "Starting Adalex Services..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down services..."
    kill $DATABASE_API_PID $NEXTJS_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Database API
echo "Starting Database API on port 5001..."
cd database
source venv/bin/activate && python api_endpoint.py &
DATABASE_API_PID=$!
cd ..

# Wait a moment for the database API to start
sleep 2

# Check if database API is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Database API is running on http://localhost:5001"
else
    echo "❌ Database API failed to start"
    exit 1
fi

# Start Next.js Application
echo "Starting Next.js Application on port 3000..."
cd new-ui
npm run dev &
NEXTJS_PID=$!
cd ..

# Wait a moment for Next.js to start
sleep 3

# Check if Next.js is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Next.js Application is running on http://localhost:3000"
else
    echo "❌ Next.js Application failed to start"
    exit 1
fi

echo ""
echo "🎉 All services are running!"
echo "📊 Database API: http://localhost:5001"
echo "🌐 Next.js App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop the services
wait 