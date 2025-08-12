// Auto-generated test coverage data
// Generated on: 2025-08-12T00:30:32.514Z

const testCoverageData = {
  "appStructure": {
    "name": "Adalex Hukuk Takip Sistemi",
    "children": [
      {
        "name": "Anasayfa",
        "path": "/",
        "children": [
          {
            "name": "Dava Dosyalarım",
            "path": "/dava-dosyalarim",
            "children": []
          },
          {
            "name": "İcra Dosyalarım",
            "path": "/icra-dosyalarim",
            "children": [
              {
                "name": "Dosya Listesi",
                "path": "/icra-dosyalarim",
                "children": [
                  {
                    "name": "Föyleri Getir",
                    "action": "load-files"
                  },
                  {
                    "name": "Yeni Föy Ekle",
                    "action": "create-case",
                    "children": [
                      {
                        "name": "İlamlı Takip",
                        "action": "ilamli-case",
                        "children": [
                          {
                            "name": "Takip Türü Seçimi",
                            "action": "case-type-selection"
                          },
                          {
                            "name": "Alacaklı Bilgisi",
                            "action": "creditor-info"
                          },
                          {
                            "name": "Borçlu Bilgileri",
                            "action": "debtor-info"
                          },
                          {
                            "name": "Türlere Göre Seçim",
                            "action": "final-selection"
                          }
                        ]
                      },
                      {
                        "name": "İlamsız Takip",
                        "action": "ilamsiz-case",
                        "children": [
                          {
                            "name": "Takip Türü Seçimi",
                            "action": "case-type-selection"
                          },
                          {
                            "name": "Alacaklı Bilgisi",
                            "action": "creditor-info"
                          },
                          {
                            "name": "Borçlu Bilgileri",
                            "action": "debtor-info"
                          },
                          {
                            "name": "Türlere Göre Seçim",
                            "action": "final-selection"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "name": "Dosya Detayları",
                "path": "/icra-dosyalarim/[file_id]",
                "children": [
                  {
                    "name": "Dosya Özeti",
                    "tab": "summary"
                  },
                  {
                    "name": "Dosya Detayı",
                    "tab": "details"
                  },
                  {
                    "name": "Sorgulama",
                    "tab": "queries",
                    "children": [
                      {
                        "name": "Adres Sorgulama",
                        "action": "address-query"
                      },
                      {
                        "name": "SGK Sorgulama",
                        "action": "sgk-query"
                      },
                      {
                        "name": "Araç Sorgulama",
                        "action": "vehicle-query"
                      },
                      {
                        "name": "Gayrimenkul Sorgulama",
                        "action": "property-query"
                      },
                      {
                        "name": "Alacaklı Dosyaları",
                        "action": "creditor-files-query"
                      },
                      {
                        "name": "SGK Haciz Sorgulama",
                        "action": "sgk-seizure-query"
                      },
                      {
                        "name": "Banka Sorgulama",
                        "action": "bank-query"
                      },
                      {
                        "name": "GIB Sorgulama",
                        "action": "gib-query"
                      },
                      {
                        "name": "İSKİ Sorgulama",
                        "action": "iski-query"
                      },
                      {
                        "name": "Telefon Sorgulama",
                        "action": "phone-query"
                      },
                      {
                        "name": "Posta Çeki Sorgulama",
                        "action": "postal-check-query"
                      },
                      {
                        "name": "Dış İşleri Sorgulama",
                        "action": "foreign-affairs-query"
                      }
                    ]
                  },
                  {
                    "name": "Evraklar",
                    "tab": "documents"
                  },
                  {
                    "name": "İş Atama",
                    "tab": "task-assignment"
                  },
                  {
                    "name": "Ödeme Ekranı",
                    "tab": "payment"
                  },
                  {
                    "name": "Notlar",
                    "tab": "notes"
                  },
                  {
                    "name": "Evrak Gönder",
                    "tab": "send-document"
                  },
                  {
                    "name": "Evrak Oluştur",
                    "tab": "create-document",
                    "children": [
                      {
                        "name": "Genel Talepler",
                        "action": "general-requests"
                      },
                      {
                        "name": "Haciz Talepleri",
                        "action": "seizure-requests"
                      },
                      {
                        "name": "Tebligat Talepleri",
                        "action": "notification-requests"
                      }
                    ]
                  }
                ]
              },
              {
                "name": "Araçlar",
                "children": [
                  {
                    "name": "Pratik Faiz Hesaplama",
                    "action": "interest-calculator"
                  },
                  {
                    "name": "Güncel Faiz Oranları",
                    "action": "current-rates"
                  }
                ]
              },
              {
                "name": "UYAP Bağlantısı",
                "action": "uyap-connection"
              },
              {
                "name": "Arama ve Filtreleme",
                "action": "search-filter"
              },
              {
                "name": "Profil Yönetimi",
                "action": "profile-management"
              }
            ]
          }
        ]
      }
    ]
  },
  "testFiles": [
    {
      "name": "test_basic_page_load.spec.ts",
      "type": "basic-page-load",
      "description": "Basic page load and navigation tests",
      "tests": [
        {
          "name": "Homepage loads successfully",
          "coverage": "partial",
          "coveredComponents": [
            "Anasayfa",
            "Dava Dosyalarım"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        },
        {
          "name": "Navigation to İcra Dosyalarım page works",
          "coverage": "partial",
          "coveredComponents": [
            "Anasayfa"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        },
        {
          "name": "Navigation to Dava Dosyalarım page works",
          "coverage": "partial",
          "coveredComponents": [
            "Dava Dosyalarım"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        },
        {
          "name": "İcra Dosyalarım page has expected elements",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Araçlar",
            "Pratik Faiz Hesaplama"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        }
      ]
    },
    {
      "name": "test_case_creation.spec.ts",
      "type": "case-creation",
      "description": "Case creation form workflows",
      "tests": [
        {
          "name": "Complete İLAMLI case creation workflow",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Borçlu Bilgileri",
            "Modal Components"
          ],
          "userFlow": [
            "Click Yeni Föy Ekle",
            "Fill form data",
            "Select case type"
          ]
        },
        {
          "name": "Complete İLAMSIZ case creation workflow",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Borçlu Bilgileri",
            "Modal Components"
          ],
          "userFlow": [
            "Click Yeni Föy Ekle",
            "Fill form data",
            "Select case type"
          ]
        },
        {
          "name": "Form validation for required fields",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Modal Components"
          ],
          "userFlow": [
            "Click Yeni Föy Ekle"
          ]
        },
        {
          "name": "TC No format validation",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Yeni Föy Ekle",
            "Fill form data"
          ]
        },
        {
          "name": "Phone number format validation",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Yeni Föy Ekle",
            "Fill form data"
          ]
        },
        {
          "name": "Multi-step form navigation",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Borçlu Bilgileri",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Yeni Föy Ekle"
          ]
        },
        {
          "name": "Cancel form and verify cleanup",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Modal Components"
          ],
          "userFlow": [
            "Click Yeni Föy Ekle"
          ]
        },
        {
          "name": "Form accessibility features",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Modal Components"
          ],
          "userFlow": [
            "Click Yeni Föy Ekle"
          ]
        },
        {
          "name": "Form submission with validation",
          "coverage": "full",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Alacaklı Bilgisi",
            "Borçlu Bilgileri",
            "Modal Components"
          ],
          "userFlow": [
            "Click Yeni Föy Ekle"
          ]
        }
      ]
    },
    {
      "name": "test_query_execution.spec.ts",
      "type": "query-execution",
      "description": "UYAP query execution workflows",
      "tests": [
        {
          "name": "Test case 1: Adres query execution",
          "coverage": "full",
          "coveredComponents": [
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Click Föyleri Getir"
          ]
        },
        {
          "name": "Test case 2: SGK query execution",
          "coverage": "full",
          "coveredComponents": [
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Click Föyleri Getir"
          ]
        },
        {
          "name": "Test case 3: Araç query execution",
          "coverage": "full",
          "coveredComponents": [
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Click Föyleri Getir"
          ]
        },
        {
          "name": "Test case 4: Gayrimenkul query execution",
          "coverage": "full",
          "coveredComponents": [
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Click Föyleri Getir"
          ]
        },
        {
          "name": "Test case 5: Alacaklı Dosyası query execution",
          "coverage": "full",
          "coveredComponents": [
            "Alacaklı Bilgisi",
            "Alacaklı Dosyaları",
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Click Föyleri Getir"
          ]
        },
        {
          "name": "Test case 6: SGK Haciz query execution",
          "coverage": "full",
          "coveredComponents": [
            "SGK Haciz Sorgulama",
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Click Föyleri Getir"
          ]
        }
      ]
    },
    {
      "name": "test_user_journeys.spec.ts",
      "type": "user-journey",
      "description": "Complete user journey workflows",
      "tests": [
        {
          "name": "Complete case creation workflow",
          "coverage": "partial",
          "coveredComponents": [
            "Yeni Föy Ekle",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Yeni Föy Ekle",
            "Fill form data",
            "Select case type"
          ]
        },
        {
          "name": "UYAP connection and query execution workflow",
          "coverage": "partial",
          "coveredComponents": [
            "Sorgulama",
            "Banka Sorgulama",
            "UYAP Bağlantısı",
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Föyleri Getir",
            "Execute query",
            "Verify results"
          ]
        },
        {
          "name": "Search and filter functionality",
          "coverage": "partial",
          "coveredComponents": [
            "Borçlu Bilgileri",
            "Föyleri Getir"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Föyleri Getir",
            "Verify results"
          ]
        },
        {
          "name": "Document management workflow",
          "coverage": "partial",
          "coveredComponents": [
            "Föyleri Getir",
            "Evraklar"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Föyleri Getir",
            "Upload document"
          ]
        },
        {
          "name": "Payment calculation tools",
          "coverage": "partial",
          "coveredComponents": [
            "Pratik Faiz Hesaplama",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page",
            "Fill form data",
            "Verify results",
            "Close modal"
          ]
        },
        {
          "name": "Profile management",
          "coverage": "partial",
          "coveredComponents": [
            "Profil Yönetimi"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        },
        {
          "name": "Error handling scenarios",
          "coverage": "partial",
          "coveredComponents": [
            "UYAP Bağlantısı"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        },
        {
          "name": "Responsive design and mobile functionality",
          "coverage": "none",
          "coveredComponents": [],
          "userFlow": []
        },
        {
          "name": "Performance and loading states",
          "coverage": "full",
          "coveredComponents": [
            "UYAP Bağlantısı",
            "Föyleri Getir"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Föyleri Getir"
          ]
        },
        {
          "name": "Accessibility features",
          "coverage": "partial",
          "coveredComponents": [
            "Föyleri Getir",
            "Modal Components"
          ],
          "userFlow": [
            "Navigate to page"
          ]
        },
        {
          "name": "Data persistence and state management",
          "coverage": "partial",
          "coveredComponents": [
            "Borçlu Bilgileri",
            "Föyleri Getir"
          ],
          "userFlow": [
            "Navigate to page",
            "Click Föyleri Getir"
          ]
        }
      ]
    }
  ],
  "coverageAnalysis": {
    "totalComponents": 44,
    "fullyCovered": 8,
    "partiallyCovered": 14,
    "notCovered": 22,
    "coveragePercentage": 34
  },
  "missingTests": [
    {
      "component": "Adalex Hukuk Takip Sistemi",
      "description": "No tests for adalex hukuk takip sistemi functionality",
      "priority": "medium"
    },
    {
      "component": "İcra Dosyalarım",
      "description": "No tests for i̇cra dosyalarım functionality",
      "priority": "medium"
    },
    {
      "component": "Dosya Listesi",
      "description": "No tests for dosya listesi functionality",
      "priority": "medium"
    },
    {
      "component": "İlamlı Takip",
      "description": "No tests for i̇lamlı takip functionality",
      "priority": "medium"
    },
    {
      "component": "Takip Türü Seçimi",
      "description": "No tests for takip türü seçimi functionality",
      "priority": "medium"
    },
    {
      "component": "Türlere Göre Seçim",
      "description": "No tests for türlere göre seçim functionality",
      "priority": "medium"
    },
    {
      "component": "İlamsız Takip",
      "description": "No tests for i̇lamsız takip functionality",
      "priority": "medium"
    },
    {
      "component": "Dosya Detayları",
      "description": "No tests for dosya detayları functionality",
      "priority": "medium"
    },
    {
      "component": "Dosya Özeti",
      "description": "No tests for dosya özeti functionality",
      "priority": "medium"
    },
    {
      "component": "Dosya Detayı",
      "description": "No tests for dosya detayı functionality",
      "priority": "medium"
    },
    {
      "component": "Adres Sorgulama",
      "description": "No tests for adres sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "SGK Sorgulama",
      "description": "No tests for sgk sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "Araç Sorgulama",
      "description": "No tests for araç sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "Gayrimenkul Sorgulama",
      "description": "No tests for gayrimenkul sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "GIB Sorgulama",
      "description": "No tests for gib sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "İSKİ Sorgulama",
      "description": "No tests for i̇ski̇ sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "Telefon Sorgulama",
      "description": "No tests for telefon sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "Posta Çeki Sorgulama",
      "description": "No tests for posta çeki sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "Dış İşleri Sorgulama",
      "description": "No tests for dış i̇şleri sorgulama functionality",
      "priority": "medium"
    },
    {
      "component": "İş Atama",
      "description": "No tests for i̇ş atama functionality",
      "priority": "high"
    },
    {
      "component": "Ödeme Ekranı",
      "description": "No tests for ödeme ekranı functionality",
      "priority": "high"
    },
    {
      "component": "Notlar",
      "description": "No tests for notlar functionality",
      "priority": "medium"
    },
    {
      "component": "Evrak Gönder",
      "description": "No tests for evrak gönder functionality",
      "priority": "high"
    },
    {
      "component": "Evrak Oluştur",
      "description": "No tests for evrak oluştur functionality",
      "priority": "high"
    },
    {
      "component": "Genel Talepler",
      "description": "No tests for genel talepler functionality",
      "priority": "medium"
    },
    {
      "component": "Haciz Talepleri",
      "description": "No tests for haciz talepleri functionality",
      "priority": "medium"
    },
    {
      "component": "Tebligat Talepleri",
      "description": "No tests for tebligat talepleri functionality",
      "priority": "medium"
    },
    {
      "component": "Güncel Faiz Oranları",
      "description": "No tests for güncel faiz oranları functionality",
      "priority": "low"
    },
    {
      "component": "Arama ve Filtreleme",
      "description": "No tests for arama ve filtreleme functionality",
      "priority": "medium"
    }
  ]
};

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
