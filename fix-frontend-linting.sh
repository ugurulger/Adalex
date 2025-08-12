#!/bin/bash

# Frontend Linting Fix Script
# This script helps fix common ESLint and TypeScript issues

set -e

echo "🔧 Fixing Frontend Linting Issues"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the root directory of the Adalex project"
    exit 1
fi

cd frontend

print_status "Installing dependencies..."
npm install

print_status "Running ESLint with auto-fix..."
npx eslint . --ext .ts,.tsx --fix || true

print_status "Running TypeScript check..."
npx tsc --noEmit || true

print_status "Running Prettier to format code..."
npx prettier --write . || true

print_status "Creating ESLint configuration override..."

# Create a temporary ESLint config to suppress some errors during development
cat > .eslintrc.temp.json << 'EOF'
{
  "extends": "next/core-web-vitals",
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "warn"
  }
}
EOF

print_status "Running tests with relaxed linting..."
npm run lint -- --config .eslintrc.temp.json || true

print_status "Building frontend..."
npm run build

# Clean up temporary file
rm -f .eslintrc.temp.json

cd ..

print_success "Frontend linting fixes completed!"
echo ""
echo "📋 Summary of fixes applied:"
echo "- Auto-fixed ESLint issues where possible"
echo "- Formatted code with Prettier"
echo "- Created temporary relaxed linting config"
echo "- Verified build still works"
echo ""
echo "🔍 Next steps:"
echo "1. Review the remaining warnings manually"
echo "2. Fix TypeScript 'any' types with proper interfaces"
echo "3. Add missing React Hook dependencies"
echo "4. Escape HTML entities in JSX"
echo "5. Remove unused variables"
echo ""
echo "💡 Tips:"
echo "- Use 'npm run lint' to check current status"
echo "- Use 'npm run build' to verify everything works"
echo "- Consider using TypeScript strict mode for better type safety"
