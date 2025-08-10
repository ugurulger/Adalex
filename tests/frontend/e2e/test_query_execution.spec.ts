import { test, expect } from '@playwright/test'

test.describe('Query Execution E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page before each test
    await page.goto('http://localhost:3000')
    await page.click('text=İcra Dosyalarına Git')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)
  })

  test('Complete UYAP connection and bank query workflow', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlanıyor...')).toBeVisible()
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Open case details
    await page.click('text=Ahmet Yılmaz')
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Navigate to query tab
    await page.click('text=Sorgulama')

    // Execute bank query
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()

    // Wait for query results
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Verify bank query results
    await expect(page.locator('text=Hesap Sayısı')).toBeVisible()
    await expect(page.locator('text=Toplam Bakiye')).toBeVisible()
    await expect(page.locator('text=Hesap Detayları')).toBeVisible()
  })

  test('SGK query execution workflow', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute SGK query
    await page.click('text=SGK Sorgulama')
    await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()

    // Wait for query results
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Verify SGK query results
    await expect(page.locator('text=SGK No')).toBeVisible()
    await expect(page.locator('text=Durum')).toBeVisible()
    await expect(page.locator('text=Prim Borcu')).toBeVisible()
  })

  test('GIB query execution workflow', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute GIB query
    await page.click('text=GİB Sorgulama')
    await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()

    // Wait for query results
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Verify GIB query results
    await expect(page.locator('text=Vergi No')).toBeVisible()
    await expect(page.locator('text=Vergi Borcu')).toBeVisible()
    await expect(page.locator('text=Haciz Durumu')).toBeVisible()
  })

  test('Multiple query execution in sequence', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute multiple queries
    const queries = ['Banka Sorgulama', 'SGK Sorgulama', 'GİB Sorgulama', 'EGM Sorgulama']

    for (const query of queries) {
      await page.click(`text=${query}`)
      await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()
      await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()
      
      // Verify query results are displayed
      await expect(page.locator('text=Sonuçlar')).toBeVisible()
    }

    // Verify all query results are available
    await expect(page.locator('text=Banka Sonuçları')).toBeVisible()
    await expect(page.locator('text=SGK Sonuçları')).toBeVisible()
    await expect(page.locator('text=GİB Sonuçları')).toBeVisible()
    await expect(page.locator('text=EGM Sonuçları')).toBeVisible()
  })

  test('Query execution with UYAP connection failure', async ({ page }) => {
    // Mock UYAP connection failure
    await page.route('**/api/uyap', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, message: 'Connection failed' }) })
    })

    // Try to connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Bağlantı hatası')).toBeVisible()

    // Try to execute query without connection
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')
    await page.click('text=Banka Sorgulama')

    // Verify error message
    await expect(page.locator('text=UYAP bağlantısı gerekli')).toBeVisible()
  })

  test('Query timeout handling', async ({ page }) => {
    // Mock slow query response
    await page.route('**/api/uyap/trigger-sorgulama', route => {
      // Simulate timeout by not responding
      setTimeout(() => {
        route.fulfill({ status: 408, body: 'Request Timeout' })
      }, 5000)
    })

    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Execute query
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')
    await page.click('text=Banka Sorgulama')

    // Verify timeout handling
    await expect(page.locator('text=Sorgulama zaman aşımına uğradı')).toBeVisible()
    await expect(page.locator('text=Tekrar Dene')).toBeVisible()
  })

  test('Query result caching and refresh', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute query
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Verify results are cached
    await expect(page.locator('text=Son Güncelleme')).toBeVisible()

    // Refresh query results
    await page.click('text=Yenile')
    await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()
  })

  test('Query result export functionality', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute query
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Export results
    await page.click('text=Dışa Aktar')
    await expect(page.locator('text=PDF')).toBeVisible()
    await expect(page.locator('text=Excel')).toBeVisible()

    // Export as PDF
    await page.click('text=PDF')
    await expect(page.locator('text=Dosya indiriliyor...')).toBeVisible()
  })

  test('Query history and previous results', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Navigate to query history
    await page.click('text=Sorgulama Geçmişi')
    await expect(page.locator('text=Önceki Sorgulamalar')).toBeVisible()

    // Verify history entries
    await expect(page.locator('text=Banka Sorgulama')).toBeVisible()
    await expect(page.locator('text=SGK Sorgulama')).toBeVisible()
    await expect(page.locator('text=GİB Sorgulama')).toBeVisible()

    // View previous result
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Hesap Sayısı')).toBeVisible()
  })

  test('Bulk query execution for multiple debtors', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()
    await expect(page.locator('text=Fatma Kaya')).toBeVisible()

    // Select multiple cases
    await page.click('input[type="checkbox"]:first-child')
    await page.click('input[type="checkbox"]:nth-child(2)')

    // Execute bulk query
    await page.click('text=Toplu Sorgulama')
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Toplu sorgulama başlatılıyor...')).toBeVisible()

    // Wait for completion
    await expect(page.locator('text=Toplu sorgulama tamamlandı')).toBeVisible()

    // Verify results for all selected cases
    await expect(page.locator('text=Ahmet Yılmaz - Banka Sonuçları')).toBeVisible()
    await expect(page.locator('text=Fatma Kaya - Banka Sonuçları')).toBeVisible()
  })

  test('Query result comparison and analysis', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute multiple queries
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    await page.click('text=SGK Sorgulama')
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Compare results
    await page.click('text=Sonuçları Karşılaştır')
    await expect(page.locator('text=Karşılaştırma Raporu')).toBeVisible()

    // Verify comparison data
    await expect(page.locator('text=Toplam Varlık')).toBeVisible()
    await expect(page.locator('text=Toplam Borç')).toBeVisible()
    await expect(page.locator('text=Net Durum')).toBeVisible()
  })

  test('Query result notifications and alerts', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Execute query with significant findings
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Verify notification for significant findings
    await expect(page.locator('text=Önemli Bulgu')).toBeVisible()
    await expect(page.locator('text=Yüksek bakiye tespit edildi')).toBeVisible()

    // Set up alert for future queries
    await page.click('text=Uyarı Ayarla')
    await page.fill('input[name="alertThreshold"]', '10000')
    await page.click('text=Kaydet')

    // Verify alert is set
    await expect(page.locator('text=Uyarı ayarlandı')).toBeVisible()
  })

  test('Query execution with different query types', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Test different query types
    const queryTypes = [
      { name: 'Banka Sorgulama', expectedResult: 'Hesap Sayısı' },
      { name: 'SGK Sorgulama', expectedResult: 'SGK No' },
      { name: 'GİB Sorgulama', expectedResult: 'Vergi No' },
      { name: 'EGM Sorgulama', expectedResult: 'Araç Bilgileri' },
      { name: 'TAKBİS Sorgulama', expectedResult: 'Takbis No' },
      { name: 'GSM Sorgulama', expectedResult: 'Telefon No' },
      { name: 'İSKİ Sorgulama', expectedResult: 'Su Borcu' },
      { name: 'Posta Çeki Sorgulama', expectedResult: 'Çek Bilgileri' }
    ]

    for (const queryType of queryTypes) {
      await page.click(`text=${queryType.name}`)
      await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()
      await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()
      await expect(page.locator(`text=${queryType.expectedResult}`)).toBeVisible()
    }
  })

  test('Query execution performance monitoring', async ({ page }) => {
    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Load data and open case
    await page.click('text=Föyleri Getir')
    await page.click('text=Ahmet Yılmaz')
    await page.click('text=Sorgulama')

    // Start performance monitoring
    const startTime = Date.now()

    // Execute query
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    const endTime = Date.now()
    const queryTime = endTime - startTime

    // Verify performance metrics are displayed
    await expect(page.locator('text=Sorgulama Süresi')).toBeVisible()
    await expect(page.locator(`text=${queryTime}ms`)).toBeVisible()

    // Verify query time is reasonable (less than 30 seconds)
    expect(queryTime).toBeLessThan(30000)
  })
}) 