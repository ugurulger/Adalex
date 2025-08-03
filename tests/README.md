# Testing Infrastructure

This directory contains comprehensive testing infrastructure for the Adalex legal case management system, covering backend integration tests, frontend integration tests, and end-to-end tests using Playwright.

## Test Structure

```
tests/
├── backend/
│   └── integration/
│       ├── test_uyap_integration.py      # UYAP service integration tests
│       ├── test_database_operations.py   # Database CRUD operations tests
│       └── test_api_endpoints.py         # API endpoint integration tests
├── frontend/
│   ├── integration/
│   │   └── test_pages.test.tsx          # Frontend page integration tests
│   ├── e2e/
│   │   ├── test_user_journeys.spec.ts    # Complete user journey E2E tests
│   │   ├── test_case_creation.spec.ts    # Case creation workflow E2E tests
│   │   └── test_query_execution.spec.ts  # Query execution E2E tests
│   ├── mocks/
│   │   ├── server.ts                     # MSW server setup
│   │   └── handlers.ts                   # API mock handlers
│   └── setup.ts                          # Jest setup configuration
├── shared/
│   ├── fixtures/
│   │   └── test_data.json               # Shared test data
│   └── helpers/
│       ├── auth_helpers.py              # Authentication test helpers
│       ├── database_helpers.py          # Database test helpers
│       └── api_helpers.ts               # API test helpers
└── config/
    ├── pytest.ini                       # Pytest configuration
    ├── jest.config.js                   # Jest configuration
    └── playwright.config.ts             # Playwright configuration
```

## Test Categories

### 1. Backend Integration Tests
- **UYAP Integration**: Tests UYAP service functionality, session management, and query execution
- **Database Operations**: Tests CRUD operations, data retrieval, and error handling
- **API Endpoints**: Tests API routes, request/response handling, and error scenarios

### 2. Frontend Integration Tests
- **Page Integration**: Tests complete page workflows and component interactions
- **Form Validation**: Tests form submission, validation, and error handling
- **API Integration**: Tests frontend-backend communication with mocked APIs

### 3. End-to-End Tests (Playwright)
- **User Journeys**: Complete workflows from login to case management
- **Case Creation**: Multi-step form processes and validation
- **Query Execution**: UYAP integration and query result handling

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Testing Setup

1. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
pip install pytest pytest-cov pytest-mock responses testcontainers
```

2. **Run backend tests**:
```bash
# Run all backend tests
pytest tests/backend/

# Run specific test file
pytest tests/backend/integration/test_uyap_integration.py

# Run with coverage
pytest tests/backend/ --cov=backend --cov-report=html
```

### Frontend Testing Setup

1. **Install Node.js dependencies**:
```bash
cd frontend
npm install
npm install --save-dev @testing-library/react @testing-library/jest-dom jest msw
```

2. **Run frontend tests**:
```bash
# Run integration tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- test_pages.test.tsx
```

### E2E Testing Setup

1. **Install Playwright**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

2. **Run E2E tests**:
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test test_user_journeys.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with headed browsers
npx playwright test --headed
```

## Test Configuration

### Pytest Configuration (`tests/config/pytest.ini`)
- Coverage reporting with HTML output
- Custom markers for test categorization
- Warning filters for cleaner output

### Jest Configuration (`tests/config/jest.config.js`)
- Next.js integration
- Coverage thresholds (80%)
- MSW setup for API mocking

### Playwright Configuration (`tests/config/playwright.config.ts`)
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshot and video capture on failure

## Test Data Management

### Shared Test Data (`tests/shared/fixtures/test_data.json`)
- User accounts and authentication data
- Sample legal cases and documents
- Query results and response data

### Test Helpers
- **Auth Helpers**: User authentication and permission testing
- **Database Helpers**: Test database setup and cleanup
- **API Helpers**: Mock API functions and response validation

## Running Tests

### Development Workflow

1. **Backend Development**:
```bash
# Run backend tests on file changes
pytest tests/backend/ -f

# Run specific test category
pytest tests/backend/ -m "integration"
```

2. **Frontend Development**:
```bash
# Run tests in watch mode
npm test -- --watch

# Run tests for changed files
npm test -- --onlyChanged
```

3. **E2E Testing**:
```bash
# Run E2E tests in development
npx playwright test --project=chromium

# Run specific test scenarios
npx playwright test --grep "case creation"
```

### CI/CD Pipeline

1. **Backend Tests**:
```bash
pytest tests/backend/ --cov=backend --cov-report=xml --junitxml=test-results/backend.xml
```

2. **Frontend Tests**:
```bash
npm test -- --coverage --watchAll=false --ci
```

3. **E2E Tests**:
```bash
npx playwright test --reporter=junit --output=test-results/e2e.xml
```

## Test Categories and Markers

### Backend Test Markers
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.database`: Database-related tests
- `@pytest.mark.uyap`: UYAP integration tests
- `@pytest.mark.api`: API endpoint tests

### Frontend Test Categories
- **Integration Tests**: Component and page integration
- **Unit Tests**: Individual component testing
- **E2E Tests**: Complete user workflows

## Coverage Requirements

- **Backend**: 80% minimum coverage
- **Frontend**: 80% minimum coverage
- **Critical Paths**: 100% coverage for authentication, database operations, and UYAP integration

## Test Best Practices

### Backend Testing
1. Use temporary databases for testing
2. Mock external dependencies (UYAP, external APIs)
3. Test both success and failure scenarios
4. Validate data integrity and error handling

### Frontend Testing
1. Test user interactions and form submissions
2. Mock API responses for consistent testing
3. Test responsive design and accessibility
4. Validate error states and loading indicators

### E2E Testing
1. Test complete user workflows
2. Test cross-browser compatibility
3. Test mobile responsiveness
4. Validate real-world scenarios

## Debugging Tests

### Backend Debugging
```bash
# Run with verbose output
pytest tests/backend/ -v -s

# Debug specific test
pytest tests/backend/integration/test_uyap_integration.py::TestUYAPIntegration::test_uyap_login_success -s
```

### Frontend Debugging
```bash
# Run tests in debug mode
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="renders empty state"
```

### E2E Debugging
```bash
# Run with headed browser
npx playwright test --headed

# Debug mode with UI
npx playwright test --ui

# Run with trace
npx playwright test --trace on
```

## Performance Testing

### Backend Performance
- Database query performance
- API response times
- Memory usage monitoring

### Frontend Performance
- Component rendering times
- Bundle size analysis
- User interaction responsiveness

### E2E Performance
- Page load times
- User workflow completion times
- Cross-browser performance comparison

## Security Testing

### Backend Security
- Authentication and authorization
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Frontend Security
- Form validation
- Data sanitization
- Secure API communication

## Maintenance

### Regular Tasks
1. Update test data to match production schema
2. Review and update mock responses
3. Update dependencies and configurations
4. Monitor test performance and flakiness

### Test Data Management
1. Keep test data realistic and up-to-date
2. Use consistent naming conventions
3. Document test data relationships
4. Version control test data changes

## Troubleshooting

### Common Issues

1. **Test Database Issues**:
   - Ensure temporary database cleanup
   - Check database connection settings
   - Verify test data integrity

2. **Mock API Issues**:
   - Update mock handlers for API changes
   - Verify response format consistency
   - Check network request interception

3. **E2E Test Flakiness**:
   - Add proper wait conditions
   - Use stable selectors
   - Implement retry mechanisms

### Getting Help

1. Check test logs and error messages
2. Review test configuration files
3. Consult test documentation
4. Run tests in debug mode for detailed output

## Contributing

When adding new tests:

1. Follow existing test patterns and conventions
2. Add appropriate test markers and categories
3. Update test data and fixtures as needed
4. Ensure proper cleanup and isolation
5. Document new test scenarios and requirements