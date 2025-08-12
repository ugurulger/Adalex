# CI/CD Pipeline Documentation

This document explains the comprehensive CI/CD pipeline setup for the Adalex legal case management system.

## Overview

The CI/CD pipeline consists of multiple workflows that handle testing, building, and deployment across different environments. The system supports both traditional deployment and containerized deployment using Docker.

## Workflow Structure

### 1. Main CI Pipeline (`ci.yml`)
**Triggers**: Push to `main`/`develop` branches, Pull Requests

**Jobs**:
- **Backend Tests**: Python unit and integration tests with coverage
- **Frontend Tests**: Next.js linting and build verification
- **E2E Tests**: Playwright end-to-end tests
- **Integration Tests**: Cross-component integration testing
- **Security Checks**: Code and dependency security scanning
- **Deploy**: Production deployment (main branch only)

### 2. Scheduled Tests (`scheduled-tests.yml`)
**Triggers**: Daily at 2 AM UTC, Manual dispatch

**Jobs**:
- **Full Test Suite**: Matrix testing across Python/Node.js versions
- **Performance Tests**: API performance benchmarking
- **Security Scan**: Comprehensive security analysis
- **Dependency Updates**: Check for outdated dependencies

### 3. Deployment (`deploy.yml`)
**Triggers**: Push to `main`, Manual dispatch with environment selection

**Jobs**:
- **Build and Test**: Complete build and test process
- **Deploy to Staging**: Staging environment deployment
- **Deploy to Production**: Production environment deployment
- **Rollback**: Automatic rollback on failure

### 4. Docker CI/CD (`docker-ci.yml`)
**Triggers**: Push to `main`/`develop`, Pull Requests

**Jobs**:
- **Build and Test**: Docker image building and testing
- **Push Images**: Container registry upload
- **Deploy**: Docker-based deployment

## Quick Start

### Prerequisites
1. GitHub repository with Actions enabled
2. Environment secrets configured (if needed)
3. Docker registry access (for containerized deployment)

### Local Development Setup

1. **Install dependencies**:
```bash
# Backend
cd backend
pip install -r api/requirements.txt
pip install pytest pytest-cov pytest-mock responses testcontainers

# Frontend
cd frontend
npm install

# Tests
cd tests
npm install
```

2. **Run tests locally**:
```bash
# Backend tests
cd backend
python -m pytest ../tests/backend/ -v

# Frontend tests
cd frontend
npm run lint
npm run build

# E2E tests
cd tests
npx playwright test
```

3. **Docker development**:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Configuration

### Environment Variables

Create `.github/environments/` directories and configure:

**staging.yml**:
```yaml
name: staging
url: https://staging.adalex.com
```

**production.yml**:
```yaml
name: production
url: https://adalex.com
```

### Secrets Configuration

Add the following secrets in your GitHub repository:

- `DOCKER_REGISTRY_TOKEN`: For container registry access
- `DEPLOYMENT_SSH_KEY`: SSH key for server deployment
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `DATABASE_URL`: Database connection string
- `UYAP_CREDENTIALS`: UYAP service credentials

### Coverage Requirements

- **Backend**: Minimum 70% code coverage
- **Frontend**: Linting must pass, build must succeed
- **E2E**: All critical user journeys must pass

## Deployment Strategies

### Traditional Deployment
1. Build application artifacts
2. Upload to deployment server
3. Restart services
4. Run smoke tests

### Containerized Deployment
1. Build Docker images
2. Push to container registry
3. Deploy using Docker Compose or Kubernetes
4. Health checks and rollback

## Monitoring and Alerts

### Success Metrics
- All tests passing
- Coverage thresholds met
- Security scans clean
- Performance benchmarks met

### Failure Handling
- Automatic rollback on deployment failure
- Slack/email notifications
- Detailed error reporting
- Artifact preservation for debugging

## Customization

### Adding New Tests
1. Add test files to appropriate directories
2. Update workflow files if needed
3. Configure test runners and coverage

### Modifying Deployment
1. Update deployment scripts in workflows
2. Configure environment-specific settings
3. Add new deployment targets

### Security Scanning
The pipeline includes:
- **Bandit**: Python security linting
- **Safety**: Python dependency vulnerability scanning
- **npm audit**: Node.js dependency security
- **Container scanning**: Docker image security

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**:
   - Check environment differences
   - Verify dependency versions
   - Check for missing environment variables

2. **Docker build failures**:
   - Verify Dockerfile syntax
   - Check for missing files
   - Ensure proper context

3. **Deployment failures**:
   - Check server connectivity
   - Verify credentials
   - Review deployment logs

### Debug Commands

```bash
# Check workflow status
gh run list

# View workflow logs
gh run view <run-id>

# Download artifacts
gh run download <run-id>

# Rerun failed jobs
gh run rerun <run-id>
```

## Best Practices

1. **Branch Strategy**:
   - Use feature branches for development
   - Merge to `develop` for testing
   - Merge to `main` for production

2. **Testing**:
   - Write tests for all new features
   - Maintain high coverage
   - Include integration tests

3. **Security**:
   - Regular dependency updates
   - Security scanning in CI
   - Secrets management

4. **Monitoring**:
   - Set up alerts for failures
   - Monitor deployment metrics
   - Track performance trends

## Support

For issues with the CI/CD pipeline:
1. Check the workflow logs
2. Review this documentation
3. Contact the development team
4. Create an issue in the repository

## Future Enhancements

- [ ] Kubernetes deployment support
- [ ] Blue-green deployment strategy
- [ ] Advanced monitoring integration
- [ ] Automated performance testing
- [ ] Multi-region deployment
- [ ] Disaster recovery procedures
