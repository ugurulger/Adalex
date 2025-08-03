import { test, expect } from '@playwright/test'

test.describe('User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page before each test
    await page.goto('http://localhost:3000')
  })

  test('Complete case creation workflow', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Fill in the form (assuming it's a multi-step form)
    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')

    // Step 2: Fill debtor information
    await page.fill('input[name="borcluAdi"]', 'Ahmet Yılmaz')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.click('text=Devam Et')

    // Step 3: Fill creditor information
    await page.fill('input[name="alacakliAdi"]', 'Mehmet Demir')
    await page.fill('input[name="alacakliSoyadi"]', 'Demir')
    await page.fill('input[name="tutar"]', '50000')
    await page.click('text=Kaydet')

    // Verify success message
    await expect(page.locator('text=Yeni föy başarıyla oluşturuldu')).toBeVisible()

    // Verify the new case appears in the list
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()
  })

  test('UYAP connection and query execution workflow', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Connect to UYAP
    await page.click('text=Uyap: Bağlı Değil')
    
    // Wait for connection
    await expect(page.locator('text=Uyap: Bağlanıyor...')).toBeVisible()
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()

    // Fetch files from UYAP
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Veriler yükleniyor...')).toBeVisible()

    // Wait for data to load
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Click on a case to open details
    await page.click('text=Ahmet Yılmaz')

    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Navigate to query tab
    await page.click('text=Sorgulama')

    // Execute a bank query
    await page.click('text=Banka Sorgulama')
    await expect(page.locator('text=Sorgulama başlatılıyor...')).toBeVisible()

    // Wait for query results
    await expect(page.locator('text=Sorgulama tamamlandı')).toBeVisible()

    // Verify query results are displayed
    await expect(page.locator('text=Hesap Sayısı')).toBeVisible()
    await expect(page.locator('text=Toplam Bakiye')).toBeVisible()
  })

  test('Search and filter functionality', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Test search functionality
    await page.fill('input[placeholder*="Dosya No, Borçlu Adı"]', 'Ahmet')
    
    // Verify filtered results
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()
    await expect(page.locator('text=Fatma Kaya')).not.toBeVisible()

    // Clear search
    await page.fill('input[placeholder*="Dosya No, Borçlu Adı"]', '')
    
    // Verify all results are shown again
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()
    await expect(page.locator('text=Fatma Kaya')).toBeVisible()

    // Test sorting
    await page.click('text=Klasör')
    await expect(page.locator('text=2024/2')).toBeVisible()
  })

  test('Document management workflow', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Open case details
    await page.click('text=Ahmet Yılmaz')
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Navigate to documents tab
    await page.click('text=Evraklar')

    // Upload a document
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')

    // Verify upload success
    await expect(page.locator('text=Evrak başarıyla yüklendi')).toBeVisible()

    // View uploaded document
    await page.click('text=sample-document.pdf')
    await expect(page.locator('text=PDF Görüntüleyici')).toBeVisible()
  })

  test('Payment calculation tools', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Open Pratik Faiz Hesaplama tool
    await page.click('text=Pratik Faiz Hesaplama')
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Fill calculation form
    await page.fill('input[name="anaPara"]', '50000')
    await page.fill('input[name="faizOrani"]', '15')
    await page.fill('input[name="gunSayisi"]', '365')
    await page.click('text=Hesapla')

    // Verify calculation results
    await expect(page.locator('text=Faiz Tutarı')).toBeVisible()
    await expect(page.locator('text=7500')).toBeVisible() // 15% of 50000

    // Close modal
    await page.click('text=Kapat')
  })

  test('Profile management', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Open profile dropdown
    await page.click('text=Profil')
    await expect(page.locator('text=Kullanıcı Adı')).toBeVisible()

    // Update profile information
    await page.fill('input[name="username"]', 'Test User')
    await page.fill('input[name="pincode"]', '1234')
    await page.click('text=Kaydet')

    // Verify save success
    await expect(page.locator('text=Profil bilgileri kaydedildi')).toBeVisible()
  })

  test('Error handling scenarios', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Test UYAP connection failure
    await page.route('**/api/uyap', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, message: 'Connection failed' }) })
    })

    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Bağlantı hatası')).toBeVisible()

    // Test API error handling
    await page.route('**/api/icra-dosyalarim', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    })

    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Veri yüklenirken hata oluştu')).toBeVisible()
  })

  test('Responsive design and mobile functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Verify mobile layout
    await expect(page.locator('text=İşlemler')).toBeVisible()
    await expect(page.locator('text=Araçlar')).toBeVisible()

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Verify mobile card view is displayed
    await expect(page.locator('.card')).toBeVisible()

    // Test mobile navigation
    await page.click('text=Profil')
    await expect(page.locator('text=Kullanıcı Adı')).toBeVisible()
  })

  test('Cross-browser compatibility', async ({ page, browserName }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Test basic functionality across browsers
    await page.click('text=Ahmet Yılmaz')
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Verify modal content is displayed correctly
    await expect(page.locator('text=Dosya Detayları')).toBeVisible()

    // Close modal
    await page.click('text=Kapat')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Performance and loading states', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Test loading state
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Veriler yükleniyor...')).toBeVisible()

    // Wait for data to load
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Test UYAP connection loading
    await page.click('text=Uyap: Bağlı Değil')
    await expect(page.locator('text=Uyap: Bağlanıyor...')).toBeVisible()

    // Wait for connection to complete
    await expect(page.locator('text=Uyap: Bağlı')).toBeVisible()
  })

  test('Accessibility features', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Should activate "Föyleri Getir"

    // Wait for data to load
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Test screen reader compatibility
    await expect(page.locator('button[aria-label]')).toBeVisible()

    // Test focus management
    await page.click('text=Ahmet Yılmaz')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Modal should be focusable
    await expect(page.locator('[role="dialog"]')).toBeFocused()
  })

  test('Data persistence and state management', async ({ page }) => {
    // Navigate to icra dosyalarim page
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)

    // Load data
    await page.click('text=Föyleri Getir')
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()

    // Perform search
    await page.fill('input[placeholder*="Dosya No, Borçlu Adı"]', 'Ahmet')

    // Refresh page
    await page.reload()

    // Verify search state is maintained (if implemented)
    // This depends on whether the app persists search state
    await expect(page).toHaveURL(/.*icra-dosyalarim/)
  })
}) 