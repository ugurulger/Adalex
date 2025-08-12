#!/usr/bin/env node

/**
 * Test Coverage Parser
 * Automatically parses E2E test files and generates coverage data
 */

const fs = require('fs');
const path = require('path');

class TestCoverageParser {
  constructor() {
    this.testFiles = [];
    this.appStructure = this.getDefaultAppStructure();
  }

  getDefaultAppStructure() {
    return {
      name: "Adalex Hukuk Takip Sistemi",
      children: [
        {
          name: "Anasayfa",
          path: "/",
          children: [
            {
              name: "Dava Dosyalarım",
              path: "/dava-dosyalarim",
              children: []
            },
            {
              name: "İcra Dosyalarım",
              path: "/icra-dosyalarim",
              children: [
                {
                  name: "Dosya Listesi",
                  path: "/icra-dosyalarim",
                  children: [
                    {
                      name: "Föyleri Getir",
                      action: "load-files"
                    },
                    {
                      name: "Yeni Föy Ekle",
                      action: "create-case",
                      children: [
                        {
                          name: "İlamlı Takip",
                          action: "ilamli-case",
                          children: [
                            { name: "Takip Türü Seçimi", action: "case-type-selection" },
                            { name: "Alacaklı Bilgisi", action: "creditor-info" },
                            { name: "Borçlu Bilgileri", action: "debtor-info" },
                            { name: "Türlere Göre Seçim", action: "final-selection" }
                          ]
                        },
                        {
                          name: "İlamsız Takip",
                          action: "ilamsiz-case",
                          children: [
                            { name: "Takip Türü Seçimi", action: "case-type-selection" },
                            { name: "Alacaklı Bilgisi", action: "creditor-info" },
                            { name: "Borçlu Bilgileri", action: "debtor-info" },
                            { name: "Türlere Göre Seçim", action: "final-selection" }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  name: "Dosya Detayları",
                  path: "/icra-dosyalarim/[file_id]",
                  children: [
                    { name: "Dosya Özeti", tab: "summary" },
                    { name: "Dosya Detayı", tab: "details" },
                    {
                      name: "Sorgulama",
                      tab: "queries",
                      children: [
                        { name: "Adres Sorgulama", action: "address-query" },
                        { name: "SGK Sorgulama", action: "sgk-query" },
                        { name: "Araç Sorgulama", action: "vehicle-query" },
                        { name: "Gayrimenkul Sorgulama", action: "property-query" },
                        { name: "Alacaklı Dosyaları", action: "creditor-files-query" },
                        { name: "SGK Haciz Sorgulama", action: "sgk-seizure-query" },
                        { name: "Banka Sorgulama", action: "bank-query" },
                        { name: "GIB Sorgulama", action: "gib-query" },
                        { name: "İSKİ Sorgulama", action: "iski-query" },
                        { name: "Telefon Sorgulama", action: "phone-query" },
                        { name: "Posta Çeki Sorgulama", action: "postal-check-query" },
                        { name: "Dış İşleri Sorgulama", action: "foreign-affairs-query" }
                      ]
                    },
                    { name: "Evraklar", tab: "documents" },
                    { name: "İş Atama", tab: "task-assignment" },
                    { name: "Ödeme Ekranı", tab: "payment" },
                    { name: "Notlar", tab: "notes" },
                    { name: "Evrak Gönder", tab: "send-document" },
                    {
                      name: "Evrak Oluştur",
                      tab: "create-document",
                      children: [
                        { name: "Genel Talepler", action: "general-requests" },
                        { name: "Haciz Talepleri", action: "seizure-requests" },
                        { name: "Tebligat Talepleri", action: "notification-requests" }
                      ]
                    }
                  ]
                },
                {
                  name: "Araçlar",
                  children: [
                    { name: "Pratik Faiz Hesaplama", action: "interest-calculator" },
                    { name: "Güncel Faiz Oranları", action: "current-rates" }
                  ]
                },
                { name: "UYAP Bağlantısı", action: "uyap-connection" },
                { name: "Arama ve Filtreleme", action: "search-filter" },
                { name: "Profil Yönetimi", action: "profile-management" }
              ]
            }
          ]
        }
      ]
    };
  }

  parseTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      
      console.log(`Parsing ${fileName}...`);
      
      const testFile = {
        name: fileName,
        type: this.determineTestType(fileName),
        description: this.getTestDescription(fileName),
        tests: []
      };

      // Extract test blocks
      const testBlocks = this.extractTestBlocks(content);
      
      testBlocks.forEach(block => {
        const test = this.parseTestBlock(block, fileName);
        if (test) {
          testFile.tests.push(test);
        }
      });

      return testFile;
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error.message);
      return null;
    }
  }

  determineTestType(fileName) {
    if (fileName.includes('user_journey')) return 'user-journey';
    if (fileName.includes('case_creation')) return 'case-creation';
    if (fileName.includes('query_execution')) return 'query-execution';
    if (fileName.includes('basic_page_load')) return 'basic-page-load';
    return 'other';
  }

  getTestDescription(fileName) {
    const descriptions = {
      'test_user_journeys.spec.ts': 'Complete user journey workflows',
      'test_case_creation.spec.ts': 'Case creation form workflows',
      'test_query_execution.spec.ts': 'UYAP query execution workflows',
      'test_basic_page_load.spec.ts': 'Basic page load and navigation tests'
    };
    return descriptions[fileName] || 'Test file';
  }

  extractTestBlocks(content) {
    const testRegex = /test\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*async\s*\(\s*{\s*page\s*}\s*\)\s*=>\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\s*\}/g;
    const blocks = [];
    let match;

    while ((match = testRegex.exec(content)) !== null) {
      blocks.push({
        name: match[1],
        content: match[2]
      });
    }

    return blocks;
  }

  parseTestBlock(block, fileName) {
    const test = {
      name: block.name,
      coverage: 'partial', // Default to partial, will be refined
      coveredComponents: [],
      userFlow: []
    };

    // Analyze test content to determine coverage
    const content = block.content.toLowerCase();
    
    // Determine coverage level based on test content
    if (this.isComprehensiveTest(content)) {
      test.coverage = 'full';
    } else if (this.isBasicTest(content)) {
      test.coverage = 'partial';
    } else {
      test.coverage = 'none';
    }

    // Extract covered components based on test content
    test.coveredComponents = this.extractCoveredComponents(content);
    
    // Extract user flow steps
    test.userFlow = this.extractUserFlow(block.content);

    return test;
  }

  isComprehensiveTest(content) {
    const comprehensiveIndicators = [
      'complete',
      'workflow',
      'full',
      'comprehensive',
      'end-to-end',
      'user journey',
      'query execution',
      'sorgu yürütme',
      'test case',
      'execution'
    ];
    
    return comprehensiveIndicators.some(indicator => 
      content.includes(indicator)
    );
  }

  isBasicTest(content) {
    const basicIndicators = [
      'basic',
      'simple',
      'load',
      'navigation',
      'click',
      'verify'
    ];
    
    return basicIndicators.some(indicator => 
      content.includes(indicator)
    );
  }

  extractCoveredComponents(content) {
    const components = [];
    
    // Map content patterns to components
    const componentPatterns = {
      'anasayfa': 'Anasayfa',
      'icra dosyalarım': 'İcra Dosyalarım',
      'dava dosyalarım': 'Dava Dosyalarım',
      'dosya listesi': 'Dosya Listesi',
      'yeni föy ekle': 'Yeni Föy Ekle',
      'ilamlı': 'İlamlı Takip',
      'ilamsız': 'İlamsız Takip',
      'alacaklı': 'Alacaklı Bilgisi',
      'borçlu': 'Borçlu Bilgileri',
      'sorgulama': 'Sorgulama',
      'adres sorgulama': 'Adres Sorgulama',
      'adres query': 'Adres Sorgulama',
      'sgk sorgulama': 'SGK Sorgulama',
      'sgk query': 'SGK Sorgulama',
      'araç sorgulama': 'Araç Sorgulama',
      'araç query': 'Araç Sorgulama',
      'gayrimenkul sorgulama': 'Gayrimenkul Sorgulama',
      'gayrimenkul query': 'Gayrimenkul Sorgulama',
      'banka sorgulama': 'Banka Sorgulama',
      'banka query': 'Banka Sorgulama',
      'alacaklı dosyası': 'Alacaklı Dosyaları',
      'alacaklı dosyası query': 'Alacaklı Dosyaları',
      'sgk haciz': 'SGK Haciz Sorgulama',
      'sgk haciz query': 'SGK Haciz Sorgulama',
      'uyap': 'UYAP Bağlantısı',
      'föyleri getir': 'Föyleri Getir',
      'dosya detayları': 'Dosya Detayları',
      'uyap icra dosyası detayları': 'Dosya Detayları',
      'evraklar': 'Evraklar',
      'araçlar': 'Araçlar',
      'pratik faiz hesaplama': 'Pratik Faiz Hesaplama',
      'profil': 'Profil Yönetimi',
      'arama': 'Arama ve Filtreleme',
      'modal': 'Modal Components',
      'query execution': 'Query Execution',
      'sorgu yürütme': 'Query Execution'
    };

    Object.entries(componentPatterns).forEach(([pattern, component]) => {
      if (content.includes(pattern)) {
        components.push(component);
      }
    });

    return [...new Set(components)]; // Remove duplicates
  }

  extractUserFlow(content) {
    const flowSteps = [];
    
    // Extract common user actions
    const actionPatterns = [
      { pattern: /navigate to|goto/gi, action: 'Navigate to page' },
      { pattern: /click.*icra dosyalarına git/gi, action: 'Click İcra Dosyalarına Git' },
      { pattern: /click.*yeni föy ekle/gi, action: 'Click Yeni Föy Ekle' },
      { pattern: /click.*föyleri getir/gi, action: 'Click Föyleri Getir' },
      { pattern: /fill.*form/gi, action: 'Fill form data' },
      { pattern: /select.*case type/gi, action: 'Select case type' },
      { pattern: /execute.*query/gi, action: 'Execute query' },
      { pattern: /verify.*results/gi, action: 'Verify results' },
      { pattern: /upload.*document/gi, action: 'Upload document' },
      { pattern: /open.*modal/gi, action: 'Open modal' },
      { pattern: /close.*modal/gi, action: 'Close modal' }
    ];

    actionPatterns.forEach(({ pattern, action }) => {
      if (pattern.test(content)) {
        flowSteps.push(action);
      }
    });

    return flowSteps;
  }

  scanTestDirectory(testDir = '../frontend/e2e') {
    const testFiles = [];
    
    try {
      const files = fs.readdirSync(testDir);
      
      files.forEach(file => {
        if (file.endsWith('.spec.ts') || file.endsWith('.test.ts')) {
          const filePath = path.join(testDir, file);
          const testFile = this.parseTestFile(filePath);
          if (testFile) {
            testFiles.push(testFile);
          }
        }
      });
      
    } catch (error) {
      console.error('Error scanning test directory:', error.message);
    }

    return testFiles;
  }

  generateCoverageData() {
    const testFiles = this.scanTestDirectory();
    
    const coverageData = {
      appStructure: this.appStructure,
      testFiles: testFiles,
      coverageAnalysis: this.calculateCoverageAnalysis(testFiles),
      missingTests: this.identifyMissingTests(testFiles)
    };

    return coverageData;
  }

  calculateCoverageAnalysis(testFiles) {
    const allComponents = new Set();
    const coveredComponents = new Set();
    const partialComponents = new Set();

    // Collect all components from app structure
    const collectComponents = (node) => {
      allComponents.add(node.name);
      if (node.children) {
        node.children.forEach(collectComponents);
      }
    };

    collectComponents(this.appStructure);

    // Collect covered components from tests
    testFiles.forEach(testFile => {
      testFile.tests.forEach(test => {
        test.coveredComponents.forEach(component => {
          if (test.coverage === 'full') {
            coveredComponents.add(component);
          } else if (test.coverage === 'partial') {
            partialComponents.add(component);
          }
        });
      });
    });

    const totalComponents = allComponents.size;
    const fullyCovered = coveredComponents.size;
    const partiallyCovered = partialComponents.size;
    const notCovered = totalComponents - fullyCovered - partiallyCovered;
    const coveragePercentage = totalComponents > 0 ? 
      Math.round((fullyCovered + partiallyCovered * 0.5) / totalComponents * 100) : 0;

    return {
      totalComponents,
      fullyCovered,
      partiallyCovered,
      notCovered,
      coveragePercentage
    };
  }

  identifyMissingTests(testFiles) {
    const allComponents = new Set();
    const testedComponents = new Set();

    // Collect all components
    const collectComponents = (node) => {
      allComponents.add(node.name);
      if (node.children) {
        node.children.forEach(collectComponents);
      }
    };

    collectComponents(this.appStructure);

    // Collect tested components
    testFiles.forEach(testFile => {
      testFile.tests.forEach(test => {
        test.coveredComponents.forEach(component => {
          testedComponents.add(component);
        });
      });
    });

    // Find missing components
    const missingComponents = Array.from(allComponents).filter(
      component => !testedComponents.has(component)
    );

    return missingComponents.map(component => ({
      component,
      description: `No tests for ${component.toLowerCase()} functionality`,
      priority: this.determinePriority(component)
    }));
  }

  determinePriority(component) {
    const highPriority = ['Evrak Gönder', 'Evrak Oluştur', 'İş Atama', 'Ödeme Ekranı'];
    const mediumPriority = ['Dava Dosyalarım', 'Notlar'];
    const lowPriority = ['Güncel Faiz Oranları'];

    if (highPriority.includes(component)) return 'high';
    if (mediumPriority.includes(component)) return 'medium';
    if (lowPriority.includes(component)) return 'low';
    return 'medium';
  }

  saveCoverageData(data, outputPath = 'test-coverage-data.js') {
    const jsContent = `// Auto-generated test coverage data
// Generated on: ${new Date().toISOString()}

const testCoverageData = ${JSON.stringify(data, null, 2)};

// Calculate coverage statistics
function calculateCoverageStats() {
  const allComponents = new Set();
  const coveredComponents = new Set();
  const partialComponents = new Set();

  // Collect all components from app structure
  function collectComponents(node, path = []) {
    const currentPath = [...path, node.name];
    allComponents.add(currentPath.join(' > '));
    
    if (node.children) {
      node.children.forEach(child => collectComponents(child, currentPath));
    }
  }

  collectComponents(testCoverageData.appStructure);

  // Collect covered components from tests
  testCoverageData.testFiles.forEach(testFile => {
    testFile.tests.forEach(test => {
      test.coveredComponents.forEach(component => {
        if (test.coverage === 'full') {
          coveredComponents.add(component);
        } else if (test.coverage === 'partial') {
          partialComponents.add(component);
        }
      });
    });
  });

  // Calculate statistics
  const totalComponents = allComponents.size;
  const fullyCovered = coveredComponents.size;
  const partiallyCovered = partialComponents.size;
  const notCovered = totalComponents - fullyCovered - partiallyCovered;
  const coveragePercentage = totalComponents > 0 ? Math.round((fullyCovered + partiallyCovered * 0.5) / totalComponents * 100) : 0;

  testCoverageData.coverageAnalysis = {
    totalComponents,
    fullyCovered,
    partiallyCovered,
    notCovered,
    coveragePercentage
  };
}

// Initialize coverage statistics
calculateCoverageStats();
`;

    try {
      fs.writeFileSync(outputPath, jsContent);
      console.log(`Coverage data saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving coverage data:', error.message);
    }
  }
}

// CLI usage
if (require.main === module) {
  const parser = new TestCoverageParser();
  const coverageData = parser.generateCoverageData();
  
  console.log('\n=== Test Coverage Analysis ===');
  console.log(`Total test files: ${coverageData.testFiles.length}`);
  console.log(`Total tests: ${coverageData.testFiles.reduce((sum, file) => sum + file.tests.length, 0)}`);
  console.log(`Coverage percentage: ${coverageData.coverageAnalysis.coveragePercentage}%`);
  console.log(`Missing tests: ${coverageData.missingTests.length}`);
  
  console.log('\n=== Missing Test Scenarios ===');
  coverageData.missingTests.forEach(test => {
    console.log(`- ${test.component} (${test.priority} priority): ${test.description}`);
  });
  
  // Save the generated data
  parser.saveCoverageData(coverageData);
}

module.exports = TestCoverageParser;
