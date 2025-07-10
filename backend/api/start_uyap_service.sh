#!/bin/bash

echo "Starting UYAP Automation Service..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed"
    exit 1
fi

# Check if required packages are installed
echo "Checking dependencies..."
python3 -c "import flask, selenium, webdriver_manager" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
fi

# Kill any existing process on port 5002
echo "Killing existing process on port 5002..."
lsof -ti :5002 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start the service
echo "Starting UYAP Automation Service on port 5002..."
python3 uyap_service.py 