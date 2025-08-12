# Test Coverage Tree Visualizer

A comprehensive visualization tool for mapping E2E test coverage across your application's user flows and UI components.

## 🎯 Features

- **Tree View**: Hierarchical visualization of your application structure with test coverage indicators
- **Flow View**: Interactive network diagram showing relationships between components
- **Coverage Heatmap**: Matrix view showing test coverage across different test files and components
- **Real-time Statistics**: Live coverage metrics and analysis
- **Filtering & Search**: Filter tests by coverage level, test type, and component
- **Export Functionality**: Export coverage reports as JSON
- **Auto-parsing**: Automatically parse test files to generate coverage data

## 🚀 Quick Start

### 1. Open the Visualization

Open `index.html` in your web browser to view the test coverage tree:

```bash
# Navigate to the test-coverage-visualizer directory
cd tests/test-coverage-visualizer

# Open in browser
open index.html
# or
firefox index.html
# or
google-chrome index.html
```

### 2. Auto-generate Coverage Data

Run the parser to automatically analyze your test files:

```bash
# From the test-coverage-visualizer directory
node parse-tests.js
```

This will:
- Scan your `../frontend/e2e` directory for test files
- Parse each test file to extract coverage information
- Generate `test-coverage-data.js` with the analysis results
- Display a summary of findings in the console

### 3. View the Results

The visualization will show:

- **Coverage Statistics**: Total tests, fully covered, partially covered, and uncovered components
- **Test File List**: Sidebar showing all test files with their coverage status
- **Interactive Tree**: Main visualization area showing your app structure with color-coded coverage

## 📊 Understanding the Visualization

### Color Coding

- 🟢 **Green**: Fully covered components (comprehensive tests exist)
- 🟡 **Yellow**: Partially covered components (basic tests exist)
- 🔴 **Red**: Uncovered components (no tests exist)

### View Modes

1. **Tree View**: Hierarchical structure showing parent-child relationships
2. **Flow View**: Network diagram with draggable nodes showing component connections
3. **Coverage Heatmap**: Matrix showing test coverage across files and components

### Filters

- **Coverage Filter**: Show only fully covered, partially covered, or uncovered components
- **Test Type Filter**: Filter by test categories (user-journey, case-creation, etc.)

## 🔧 Customization

### Adding New Components

To add new UI components to the visualization:

1. Edit `test-coverage-data.js`
2. Add new components to the `appStructure` object
3. Update the coverage mapping in your test files

### Modifying Test Parsing

To customize how tests are parsed:

1. Edit `parse-tests.js`
2. Modify the `extractCoveredComponents()` method to recognize new patterns
3. Update the `componentPatterns` object to map test content to components

### Styling

The visualization uses:
- **Mermaid.js** for tree diagrams
- **D3.js** for interactive visualizations
- **CSS Grid** for responsive layout
- **Custom CSS** for styling

## 📈 Coverage Analysis

The system provides detailed analysis including:

### Coverage Metrics
- **Total Components**: All UI components in your application
- **Fully Covered**: Components with comprehensive test coverage
- **Partially Covered**: Components with basic test coverage
- **Not Covered**: Components without any tests

### Missing Test Identification
The system automatically identifies components that need tests and prioritizes them:

- **High Priority**: Critical functionality (Evrak Gönder, Evrak Oluştur, etc.)
- **Medium Priority**: Important features (Dava Dosyalarım, İş Atama, etc.)
- **Low Priority**: Nice-to-have features (Güncel Faiz Oranları, etc.)

## 🛠️ Technical Details

### File Structure

```
test-coverage-visualizer/
├── index.html                 # Main visualization interface
├── test-coverage-data.js      # Coverage data structure
├── test-coverage-visualizer.js # Visualization logic
├── parse-tests.js             # Test file parser
└── README.md                  # This file
```

### Data Structure

The coverage data follows this structure:

```javascript
{
  appStructure: {
    name: "Component Name",
    children: [...]
  },
  testFiles: [
    {
      name: "test-file.spec.ts",
      type: "test-type",
      tests: [
        {
          name: "Test Name",
          coverage: "full|partial|none",
          coveredComponents: ["Component1", "Component2"],
          userFlow: ["Step1", "Step2"]
        }
      ]
    }
  ],
  coverageAnalysis: {
    totalComponents: 0,
    fullyCovered: 0,
    partiallyCovered: 0,
    notCovered: 0,
    coveragePercentage: 0
  }
}
```

### Supported Test Patterns

The parser recognizes these patterns in your test files:

- **Component Interactions**: `click`, `fill`, `select`, `verify`
- **Navigation**: `navigate to`, `goto`, `expect().toHaveURL()`
- **Form Operations**: `fill`, `submit`, `validation`
- **API Operations**: `route`, `fulfill`, `mock`
- **UI Elements**: `modal`, `dialog`, `dropdown`

## 🔄 Updating Coverage Data

### Manual Updates

1. Edit `test-coverage-data.js` directly
2. Add new test files and their coverage information
3. Refresh the visualization

### Automatic Updates

1. Run `node parse-tests.js` to regenerate data
2. The parser will scan your test directory and update the coverage data
3. Refresh the visualization to see changes

## 📋 Best Practices

### Writing Test-Friendly Code

1. **Use Semantic Selectors**: Prefer `data-testid` attributes over complex CSS selectors
2. **Consistent Naming**: Use consistent naming patterns for similar components
3. **Component Isolation**: Keep components focused and testable
4. **Clear User Flows**: Structure tests to follow clear user journeys

### Maintaining Coverage

1. **Regular Updates**: Run the parser regularly to keep coverage data current
2. **Review Missing Tests**: Focus on high-priority missing test scenarios
3. **Coverage Goals**: Aim for at least 80% coverage with comprehensive tests
4. **Documentation**: Keep test descriptions clear and up-to-date

## 🐛 Troubleshooting

### Common Issues

**Visualization not loading:**
- Check that all JavaScript files are in the same directory
- Ensure Mermaid.js and D3.js are loading correctly
- Check browser console for errors

**Parser not finding tests:**
- Verify the test directory path in `parse-tests.js`
- Ensure test files have `.spec.ts` or `.test.ts` extensions
- Check file permissions

**Coverage data not updating:**
- Clear browser cache
- Ensure `test-coverage-data.js` is being regenerated
- Check for JavaScript errors in the console

### Debug Mode

Enable debug logging by adding this to the browser console:

```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

To contribute to the test coverage visualizer:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Setup

```bash
# Clone the repository
git clone <your-repo>

# Navigate to the visualizer
cd tests/test-coverage-visualizer

# Run the parser
node parse-tests.js

# Open the visualization
open index.html
```

## 📄 License

This project is part of the Adalex Hukuk Takip Sistemi and follows the same licensing terms.

## 🆘 Support

For questions or issues:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are properly loaded
4. Verify test file paths and permissions

---

**Happy Testing! 🧪✨**
