import { test, expect } from '@playwright/test'

test.describe('Case Creation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page before each test
    await page.goto('http://localhost:3000')
    await page.click('text=İcra Dosyalarım')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)
  })

  test('Complete ilamli case creation workflow', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')

    // Step 2: Fill debtor information
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.fill('input[name="telefon"]', '05551234567')
    await page.click('text=Devam Et')

    // Step 3: Fill creditor information
    await page.fill('input[name="alacakliAdi"]', 'Mehmet')
    await page.fill('input[name="alacakliSoyadi"]', 'Demir')
    await page.fill('input[name="alacakliAdres"]', 'Ankara, Türkiye')
    await page.fill('input[name="alacakliTelefon"]', '05559876543')
    await page.click('text=Devam Et')

    // Step 4: Fill case details
    await page.fill('input[name="dosyaNo"]', '2024/1')
    await page.fill('input[name="tutar"]', '50000')
    await page.fill('input[name="faizOrani"]', '15')
    await page.fill('input[name="takipTarihi"]', '2024-01-15')
    await page.selectOption('select[name="icraMudurlugu"]', 'İstanbul')
    await page.click('text=Kaydet')

    // Verify success message
    await expect(page.locator('text=Yeni föy başarıyla oluşturuldu')).toBeVisible()

    // Verify the new case appears in the list
    await expect(page.locator('text=Ahmet Yılmaz')).toBeVisible()
    await expect(page.locator('text=2024/1')).toBeVisible()
  })

  test('Complete ilamsiz case creation workflow', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamsız')
    await page.click('text=Devam Et')

    // Step 2: Fill debtor information
    await page.fill('input[name="borcluAdi"]', 'Fatma')
    await page.fill('input[name="borcluSoyadi"]', 'Kaya')
    await page.fill('input[name="tcNo"]', '98765432109')
    await page.fill('input[name="adres"]', 'İzmir, Türkiye')
    await page.fill('input[name="telefon"]', '05551111111')
    await page.click('text=Devam Et')

    // Step 3: Fill creditor information
    await page.fill('input[name="alacakliAdi"]', 'Ali')
    await page.fill('input[name="alacakliSoyadi"]', 'Özkan')
    await page.fill('input[name="alacakliAdres"]', 'Bursa, Türkiye')
    await page.fill('input[name="alacakliTelefon"]', '05552222222')
    await page.click('text=Devam Et')

    // Step 4: Fill case details
    await page.fill('input[name="dosyaNo"]', '2024/2')
    await page.fill('input[name="tutar"]', '75000')
    await page.fill('input[name="faizOrani"]', '12')
    await page.fill('input[name="takipTarihi"]', '2024-01-20')
    await page.selectOption('select[name="icraMudurlugu"]', 'Ankara')
    await page.click('text=Kaydet')

    // Verify success message
    await expect(page.locator('text=Yeni föy başarıyla oluşturuldu')).toBeVisible()

    // Verify the new case appears in the list
    await expect(page.locator('text=Fatma Kaya')).toBeVisible()
    await expect(page.locator('text=2024/2')).toBeVisible()
  })

  test('Form validation for required fields', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')

    // Try to proceed without filling required fields
    await page.click('text=Devam Et')

    // Verify validation errors
    await expect(page.locator('text=Bu alan zorunludur')).toBeVisible()

    // Fill required fields
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.click('text=Devam Et')

    // Should proceed to next step
    await expect(page.locator('text=Alacaklı Bilgileri')).toBeVisible()
  })

  test('TC No format validation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')

    // Fill form with invalid TC No
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '123456789') // Invalid format
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.click('text=Devam Et')

    // Verify validation error
    await expect(page.locator('text=TC Kimlik No 11 haneli olmalıdır')).toBeVisible()

    // Fix TC No
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.click('text=Devam Et')

    // Should proceed to next step
    await expect(page.locator('text=Alacaklı Bilgileri')).toBeVisible()
  })

  test('Phone number format validation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')

    // Fill form with invalid phone number
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.fill('input[name="telefon"]', '123') // Invalid format
    await page.click('text=Devam Et')

    // Verify validation error
    await expect(page.locator('text=Geçerli bir telefon numarası giriniz')).toBeVisible()

    // Fix phone number
    await page.fill('input[name="telefon"]', '05551234567')
    await page.click('text=Devam Et')

    // Should proceed to next step
    await expect(page.locator('text=Alacaklı Bilgileri')).toBeVisible()
  })

  test('Amount and interest rate validation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Navigate to case details step
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')
    
    // Fill debtor info
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.click('text=Devam Et')
    
    // Fill creditor info
    await page.fill('input[name="alacakliAdi"]', 'Mehmet')
    await page.fill('input[name="alacakliSoyadi"]', 'Demir')
    await page.fill('input[name="alacakliAdres"]', 'Ankara, Türkiye')
    await page.click('text=Devam Et')

    // Try to save with invalid amount
    await page.fill('input[name="tutar"]', '-1000') // Negative amount
    await page.fill('input[name="faizOrani"]', '150') // Invalid interest rate
    await page.click('text=Kaydet')

    // Verify validation errors
    await expect(page.locator('text=Tutar 0\'dan büyük olmalıdır')).toBeVisible()
    await expect(page.locator('text=Faiz oranı 0-100 arasında olmalıdır')).toBeVisible()

    // Fix values
    await page.fill('input[name="tutar"]', '50000')
    await page.fill('input[name="faizOrani"]', '15')
    await page.click('text=Kaydet')

    // Should save successfully
    await expect(page.locator('text=Yeni föy başarıyla oluşturuldu')).toBeVisible()
  })

  test('Multi-step form navigation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await expect(page.locator('text=Borçlu Bilgileri')).toBeVisible()
    await page.click('text=Devam Et')

    // Step 2: Fill debtor information
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await expect(page.locator('text=Alacaklı Bilgileri')).toBeVisible()
    await page.click('text=Devam Et')

    // Step 3: Fill creditor information
    await page.fill('input[name="alacakliAdi"]', 'Mehmet')
    await page.fill('input[name="alacakliSoyadi"]', 'Demir')
    await page.fill('input[name="alacakliAdres"]', 'Ankara, Türkiye')
    await expect(page.locator('text=Dosya Bilgileri')).toBeVisible()
    await page.click('text=Devam Et')

    // Step 4: Fill case details
    await page.fill('input[name="dosyaNo"]', '2024/1')
    await page.fill('input[name="tutar"]', '50000')
    await page.fill('input[name="faizOrani"]', '15')
    await page.fill('input[name="takipTarihi"]', '2024-01-15')
    await expect(page.locator('text=Özet')).toBeVisible()
    await page.click('text=Kaydet')

    // Verify completion
    await expect(page.locator('text=Yeni föy başarıyla oluşturuldu')).toBeVisible()
  })

  test('Form data persistence during navigation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')

    // Step 2: Fill debtor information
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.click('text=Devam Et')

    // Step 3: Fill creditor information
    await page.fill('input[name="alacakliAdi"]', 'Mehmet')
    await page.fill('input[name="alacakliSoyadi"]', 'Demir')
    await page.fill('input[name="alacakliAdres"]', 'Ankara, Türkiye')
    await page.click('text=Devam Et')

    // Step 4: Fill case details
    await page.fill('input[name="dosyaNo"]', '2024/1')
    await page.fill('input[name="tutar"]', '50000')
    await page.fill('input[name="faizOrani"]', '15')
    await page.fill('input[name="takipTarihi"]', '2024-01-15')

    // Navigate back to previous step
    await page.click('text=Geri')

    // Verify data is preserved
    await expect(page.locator('input[name="alacakliAdi"]')).toHaveValue('Mehmet')
    await expect(page.locator('input[name="alacakliSoyadi"]')).toHaveValue('Demir')

    // Navigate back to first step
    await page.click('text=Geri')

    // Verify debtor data is preserved
    await expect(page.locator('input[name="borcluAdi"]')).toHaveValue('Ahmet')
    await expect(page.locator('input[name="borcluSoyadi"]')).toHaveValue('Yılmaz')
  })

  test('Cancel form and verify cleanup', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Fill some data
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')

    // Cancel the form
    await page.click('text=İptal')

    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Open form again and verify it's clean
    await page.click('text=Yeni Föy Ekle')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('input[name="borcluAdi"]')).toHaveValue('')
  })

  test('Keyboard navigation in form', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type
    await page.click('text=İlamlı')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Should click "Devam Et"

    // Step 2: Navigate through form fields with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.type('Ahmet')
    await page.keyboard.press('Tab')
    await page.keyboard.type('Yılmaz')
    await page.keyboard.press('Tab')
    await page.keyboard.type('12345678901')
    await page.keyboard.press('Tab')
    await page.keyboard.type('İstanbul, Türkiye')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Should click "Devam Et"

    // Verify navigation worked
    await expect(page.locator('text=Alacaklı Bilgileri')).toBeVisible()
  })

  test('Form accessibility features', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Verify form has proper ARIA labels
    await expect(page.locator('input[aria-label*="borçlu"]')).toBeVisible()
    await expect(page.locator('button[aria-label*="devam"]')).toBeVisible()

    // Verify focus management
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="borcluAdi"]')).toBeFocused()

    // Test screen reader compatibility
    await expect(page.locator('label[for="borcluAdi"]')).toBeVisible()
  })

  test('Form submission with network errors', async ({ page }) => {
    // Mock network error
    await page.route('**/api/icra-dosyalarim', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    })

    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Fill and submit form
    await page.click('text=İlamlı')
    await page.click('text=Devam Et')
    await page.fill('input[name="borcluAdi"]', 'Ahmet')
    await page.fill('input[name="borcluSoyadi"]', 'Yılmaz')
    await page.fill('input[name="tcNo"]', '12345678901')
    await page.fill('input[name="adres"]', 'İstanbul, Türkiye')
    await page.click('text=Devam Et')
    await page.fill('input[name="alacakliAdi"]', 'Mehmet')
    await page.fill('input[name="alacakliSoyadi"]', 'Demir')
    await page.fill('input[name="alacakliAdres"]', 'Ankara, Türkiye')
    await page.click('text=Devam Et')
    await page.fill('input[name="dosyaNo"]', '2024/1')
    await page.fill('input[name="tutar"]', '50000')
    await page.fill('input[name="faizOrani"]', '15')
    await page.fill('input[name="takipTarihi"]', '2024-01-15')
    await page.click('text=Kaydet')

    // Verify error handling
    await expect(page.locator('text=Form gönderilirken hata oluştu')).toBeVisible()
    await expect(page.locator('text=Tekrar Dene')).toBeVisible()
  })
}) 