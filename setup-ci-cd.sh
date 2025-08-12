#!/bin/bash

# CI/CD Setup Script for Adalex
# This script helps you set up the CI/CD pipeline

set -e

echo "🚀 Setting up CI/CD Pipeline for Adalex"
echo "========================================"

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

# Check if we're in the right directory
if [ ! -f "start_service.sh" ]; then
    print_error "Please run this script from the root directory of the Adalex project"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This is not a git repository. Please initialize git first."
    exit 1
fi

# Check if GitHub CLI is available (optional)
if command -v gh &> /dev/null; then
    print_success "GitHub CLI is available"
    GH_AVAILABLE=true
else
    print_warning "GitHub CLI is not available. You'll need to configure secrets manually."
    GH_AVAILABLE=false
fi

print_status "Creating necessary directories..."

# Create .github directory structure
mkdir -p .github/workflows
mkdir -p .github/environments/staging
mkdir -p .github/environments/production

print_success "Directory structure created"

# Check if workflows already exist
if [ -f ".github/workflows/ci.yml" ]; then
    print_warning "CI workflow already exists. Skipping workflow creation."
else
    print_status "CI/CD workflows will be created when you push to GitHub"
fi

print_status "Setting up local development environment..."

# Install Python dependencies for testing
if [ -f "backend/api/requirements.txt" ]; then
    print_status "Installing Python test dependencies..."
    pip install pytest pytest-cov pytest-mock responses testcontainers bandit safety
    print_success "Python test dependencies installed"
fi

# Install Node.js dependencies for testing
if [ -f "tests/package.json" ]; then
    print_status "Installing Node.js test dependencies..."
    cd tests && npm install && cd ..
    print_success "Node.js test dependencies installed"
fi

# Install frontend dependencies
if [ -f "frontend/package.json" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    print_success "Frontend dependencies installed"
fi

print_status "Setting up Docker environment..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    print_success "Docker is available"
    
    # Check if docker-compose is available
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is available"
        
        # Test Docker setup
        print_status "Testing Docker setup..."
        if docker-compose config > /dev/null 2>&1; then
            print_success "Docker Compose configuration is valid"
        else
            print_warning "Docker Compose configuration has issues"
        fi
    else
        print_warning "Docker Compose is not available"
    fi
else
    print_warning "Docker is not available. Containerized deployment will not work."
fi

print_status "Creating environment configuration files..."

# Create staging environment config
cat > .github/environments/staging.yml << EOF
name: staging
url: https://staging.adalex.com
EOF

# Create production environment config
cat > .github/environments/production.yml << EOF
name: production
url: https://adalex.com
EOF

print_success "Environment configurations created"

print_status "Setting up local test scripts..."

# Create a local test runner script
cat > run-tests.sh << 'EOF'
#!/bin/bash

# Local test runner for Adalex
set -e

echo "🧪 Running Adalex Test Suite"
echo "============================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Backend tests
print_status "Running backend tests..."
cd backend
python -m pytest ../tests/backend/ -v --cov=api --cov-report=term-missing
cd ..

# Frontend tests
print_status "Running frontend tests..."
cd frontend
npm run lint
npm run build
cd ..

# E2E tests (if Playwright is available)
if command -v npx &> /dev/null; then
    print_status "Running E2E tests..."
    cd tests
    npx playwright test --config=config/playwright.config.ts
    cd ..
fi

print_success "All tests completed!"
EOF

chmod +x run-tests.sh
print_success "Local test runner created"

# Create a deployment helper script
cat > deploy-local.sh << 'EOF'
#!/bin/bash

# Local deployment helper for Adalex
set -e

echo "🚀 Local Deployment Helper"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Check if Docker is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is required for local deployment"
    exit 1
fi

print_status "Building and starting services..."

# Build and start services
docker-compose up --build -d

print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend service is running"
else
    print_error "Backend service is not responding"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend service is running"
else
    print_error "Frontend service is not responding"
fi

print_success "Local deployment completed!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "To stop services: docker-compose down"
EOF

chmod +x deploy-local.sh
print_success "Local deployment helper created"

print_status "Setting up GitHub secrets guide..."

# Create a secrets setup guide
cat > GITHUB_SECRETS_SETUP.md << 'EOF'
# GitHub Secrets Setup Guide

To complete the CI/CD setup, you need to configure the following secrets in your GitHub repository:

## Required Secrets

1. **DOCKER_REGISTRY_TOKEN**
   - Used for pushing Docker images to container registry
   - Generate from your container registry (Docker Hub, GitHub Container Registry, etc.)

2. **DEPLOYMENT_SSH_KEY**
   - SSH private key for server deployment
   - Generate with: `ssh-keygen -t rsa -b 4096 -C "deployment@adalex.com"`

3. **DATABASE_URL**
   - Database connection string
   - Format: `postgresql://user:password@host:port/database`

4. **UYAP_CREDENTIALS**
   - UYAP service credentials (JSON format)
   - Include username, password, and any other required fields

## Optional Secrets

5. **SLACK_WEBHOOK_URL**
   - For deployment notifications
   - Create a Slack app and get the webhook URL

6. **EMAIL_NOTIFICATION_ADDRESS**
   - For email notifications
   - Configure SMTP settings if needed

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the appropriate name and value

## Environment-Specific Secrets

You can also add secrets specific to environments:

1. Go to "Settings" → "Environments"
2. Create environments: "staging" and "production"
3. Add environment-specific secrets

## Testing Secrets

After adding secrets, you can test them by:
1. Creating a test workflow
2. Using the secret in a safe way (e.g., echo "Secret exists")
3. Running the workflow to verify access

## Security Best Practices

- Never commit secrets to the repository
- Use environment-specific secrets when possible
- Rotate secrets regularly
- Use least-privilege access for deployment keys
- Monitor secret usage and access
EOF

print_success "GitHub secrets setup guide created"

print_status "Finalizing setup..."

# Create a .gitignore entry for local files
if [ -f ".gitignore" ]; then
    if ! grep -q "run-tests.sh" .gitignore; then
        echo "" >> .gitignore
        echo "# Local CI/CD scripts" >> .gitignore
        echo "run-tests.sh" >> .gitignore
        echo "deploy-local.sh" >> .gitignore
        echo "GITHUB_SECRETS_SETUP.md" >> .gitignore
    fi
fi

print_success "Setup completed successfully!"
echo ""
echo "🎉 CI/CD Pipeline Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Review the created files and configurations"
echo "2. Configure GitHub secrets (see GITHUB_SECRETS_SETUP.md)"
echo "3. Push your code to GitHub to trigger the first CI run"
echo "4. Test locally using: ./run-tests.sh"
echo "5. Deploy locally using: ./deploy-local.sh"
echo ""
echo "📚 Documentation:"
echo "- CI_CD_README.md - Complete CI/CD documentation"
echo "- GITHUB_SECRETS_SETUP.md - Secrets configuration guide"
echo ""
echo "🔧 Available commands:"
echo "- ./run-tests.sh - Run all tests locally"
echo "- ./deploy-local.sh - Deploy locally with Docker"
echo "- docker-compose up -d - Start all services"
echo "- docker-compose down - Stop all services"
echo ""
print_success "Happy coding! 🚀"
