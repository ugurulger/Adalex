#!/bin/bash

# Test Coverage Visualizer Startup Script
# This script automatically parses test files and opens the visualization

echo "🧪 Starting Test Coverage Visualizer..."
echo "========================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js to use the test parser"
    exit 1
fi

# Parse test files
echo "📊 Parsing test files..."
node parse-tests.js

if [ $? -eq 0 ]; then
    echo "✅ Test parsing completed successfully"
else
    echo "❌ Error parsing test files"
    exit 1
fi

# Determine the best way to open the browser
echo "🌐 Opening visualization in browser..."

if command -v open &> /dev/null; then
    # macOS
    open index.html
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open index.html
elif command -v start &> /dev/null; then
    # Windows
    start index.html
else
    echo "⚠️  Could not automatically open browser"
    echo "Please manually open index.html in your browser"
    echo "File location: $(pwd)/index.html"
fi

echo ""
echo "🎉 Test Coverage Visualizer is ready!"
echo ""
echo "📋 Quick Tips:"
echo "  • Use the filters to focus on specific test types or coverage levels"
echo "  • Switch between Tree, Flow, and Heatmap views"
echo "  • Click on test files in the sidebar to highlight their coverage"
echo "  • Export reports using the 'Export Report' button"
echo ""
echo "📖 For more information, see README.md"
echo ""
echo "🔗 Visualization URL: file://$(pwd)/index.html"
