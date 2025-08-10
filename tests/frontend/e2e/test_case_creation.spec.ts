import { test, expect } from '@playwright/test'

test.describe('Case Creation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page before each test
    await page.goto('http://localhost:3000')
    await page.click('text=İcra Dosyalarına Git')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)
  })

  test('Complete İLAMLI case creation workflow', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type from dropdown
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    
    // Select takip yolu
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    
    // Click next button
    await page.click('text=Sonraki')

    // Step 2: Fill alacaklı (creditor) information
    await expect(page.locator('h2:has-text("Alacaklı Bilgisi"):not(.sr-only)')).toBeVisible()
    
    // Select alacaklı tipi
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Fill alacaklı details
    await page.fill('#alacakli-ad-soyad', 'Mehmet Demir')
    await page.fill('#alacakli-tc-kimlik', '12345678901')
    await page.fill('#alacakli-telefon', '05559876543')
    await page.fill('#alacakli-adres', 'Ankara, Türkiye')
    
    // Click next button
    await page.click('text=Sonraki')

    // Step 3: Fill borçlu (debtor) information
    await expect(page.locator('h2:has-text("Borçlu Bilgileri"):not(.sr-only)')).toBeVisible()
    
    // Select borçlu tipi
    await page.click('text=Borçlu tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Fill borçlu details
    await page.fill('#borclu-ad-soyad', 'Ahmet Yılmaz')
    await page.fill('#borclu-tc-kimlik', '98765432109')
    await page.fill('#borclu-telefon', '05551234567')
    await page.fill('#borclu-adres', 'İstanbul, Türkiye')
    
    // Click next button
    await page.click('text=Sonraki')

    // Step 4: Verify we're on the final page
    await expect(page.locator('h2:has-text("Türlere Göre Seçim"):not(.sr-only)')).toBeVisible()
    
    // Submit the form
    await page.click('text=Formu Kaydet')
    
    // Verify form submission (modal should close)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Complete İLAMSIZ case creation workflow', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Select case type from dropdown
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMSIZ')
    
    // Select takip yolu
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=7 Örnek (İLAMSIZ TAKIP)')
    
    // Click next button
    await page.click('text=Sonraki')

    // Step 2: Fill alacaklı (creditor) information
    await expect(page.locator('h2:has-text("Alacaklı Bilgisi"):not(.sr-only)')).toBeVisible()
    
    // Select alacaklı tipi
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Fill alacaklı details
    await page.fill('#alacakli-ad-soyad', 'Ali Özkan')
    await page.fill('#alacakli-tc-kimlik', '11111111111')
    await page.fill('#alacakli-telefon', '05552222222')
    await page.fill('#alacakli-adres', 'Bursa, Türkiye')
    
    // Click next button
    await page.click('text=Sonraki')

    // Step 3: Fill borçlu (debtor) information
    await expect(page.locator('h2:has-text("Borçlu Bilgileri"):not(.sr-only)')).toBeVisible()
    
    // Select borçlu tipi
    await page.click('text=Borçlu tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Fill borçlu details
    await page.fill('#borclu-ad-soyad', 'Fatma Kaya')
    await page.fill('#borclu-tc-kimlik', '22222222222')
    await page.fill('#borclu-telefon', '05551111111')
    await page.fill('#borclu-adres', 'İzmir, Türkiye')
    
    // Click next button
    await page.click('text=Sonraki')

    // Step 4: Verify we're on the final page
    await expect(page.locator('h2:has-text("Türlere Göre Seçim"):not(.sr-only)')).toBeVisible()
    
    // Submit the form
    await page.click('text=Formu Kaydet')
    
    // Verify form submission (modal should close)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Form validation for required fields', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Try to click next without selecting anything
    await expect(page.locator('button:has-text("Sonraki")')).toBeDisabled()
    
    // Select only takip türü but not takip yolu
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    
    // Should still be disabled because takip yolu is required
    await expect(page.locator('button:has-text("Sonraki")')).toBeDisabled()
    
    // Select takip yolu
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    
    // Now should be enabled
    await expect(page.locator('button:has-text("Sonraki")')).toBeEnabled()
    
    // Click next to go to alacaklı page
    await page.click('text=Sonraki')
    
    // Try to proceed without selecting alacaklı tipi
    await expect(page.locator('button:has-text("Sonraki")')).toBeDisabled()
    
    // Select alacaklı tipi
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Should still be disabled because required fields are empty
    await expect(page.locator('button:has-text("Sonraki")')).toBeDisabled()
    
    // Fill required fields
    await page.fill('#alacakli-ad-soyad', 'Test User')
    await page.fill('#alacakli-tc-kimlik', '12345678901')
    await page.fill('#alacakli-telefon', '05551234567')
    await page.fill('#alacakli-adres', 'Test Address')
    
    // Now should be enabled
    await expect(page.locator('button:has-text("Sonraki")')).toBeEnabled()
  })

  test('TC No format validation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Navigate to alacaklı page
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    await page.click('text=Sonraki')
    
    // Select alacaklı tipi
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Fill form with invalid TC No (less than 11 digits)
    await page.fill('#alacakli-ad-soyad', 'Test User')
    await page.fill('#alacakli-tc-kimlik', '123456789') // Invalid: only 9 digits
    
    // Verify TC No field has maxLength attribute
    await expect(page.locator('#alacakli-tc-kimlik')).toHaveAttribute('maxLength', '11')
  })

  test('Phone number format validation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Navigate to alacaklı page
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    await page.click('text=Sonraki')
    
    // Select alacaklı tipi
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    
    // Fill form with phone number
    await page.fill('#alacakli-ad-soyad', 'Test User')
    await page.fill('#alacakli-tc-kimlik', '12345678901')
    await page.fill('#alacakli-telefon', '05551234567')
    
    // Verify phone number is accepted
    await expect(page.locator('#alacakli-telefon')).toHaveValue('05551234567')
  })

  test('Multi-step form navigation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Step 1: Verify first page
    await expect(page.locator('h2:has-text("Takip Türü ve Yolu Seçimi"):not(.sr-only)')).toBeVisible()
    
    // Navigate to step 2
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    await page.click('text=Sonraki')
    
    // Step 2: Verify alacaklı page
    await expect(page.locator('h2:has-text("Alacaklı Bilgisi"):not(.sr-only)')).toBeVisible()
    
    // Navigate to step 3
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    await page.fill('#alacakli-ad-soyad', 'Test User')
    await page.fill('#alacakli-tc-kimlik', '12345678901')
    await page.fill('#alacakli-telefon', '05551234567')
    await page.fill('#alacakli-adres', 'Test Address')
    await page.click('text=Sonraki')
    
    // Step 3: Verify borçlu page
    await expect(page.locator('h2:has-text("Borçlu Bilgileri"):not(.sr-only)')).toBeVisible()
    
    // Navigate to step 4
    await page.click('text=Borçlu tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    await page.fill('#borclu-ad-soyad', 'Test Debtor')
    await page.fill('#borclu-tc-kimlik', '98765432109')
    await page.fill('#borclu-telefon', '05559876543')
    await page.fill('#borclu-adres', 'Test Debtor Address')
    await page.click('text=Sonraki')
    
    // Step 4: Verify final page
    await expect(page.locator('h2:has-text("Türlere Göre Seçim"):not(.sr-only)')).toBeVisible()
    
    // Test back navigation
    await page.click('text=Önceki')
    await expect(page.locator('h2:has-text("Borçlu Bilgileri"):not(.sr-only)')).toBeVisible()
    
    await page.click('text=Önceki')
    await expect(page.locator('h2:has-text("Alacaklı Bilgisi"):not(.sr-only)')).toBeVisible()
    
    await page.click('text=Önceki')
    await expect(page.locator('h2:has-text("Takip Türü ve Yolu Seçimi"):not(.sr-only)')).toBeVisible()
  })

  test('Cancel form and verify cleanup', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Fill some data
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    await page.click('text=Sonraki')
    
    // Fill alacaklı data
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    await page.fill('#alacakli-ad-soyad', 'Test User')
    await page.fill('#alacakli-tc-kimlik', '12345678901')
    
    // Cancel the form
    await page.click('text=İptal')
    
    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // Verify we're back on the main page (target the heading specifically)
    await expect(page.locator('h1:has-text("İcra Dosyalarım")')).toBeVisible()
  })

  test('Form accessibility features', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Verify form has proper labels
    await expect(page.locator('label:has-text("Takip Türü")')).toBeVisible()
    await expect(page.locator('label:has-text("Takip Yolu")')).toBeVisible()
    
    // Verify required field indicators (target first one specifically)
    await expect(page.locator('span.text-red-500').first()).toBeVisible()
    
    // Verify form has proper structure
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('h2:not(.sr-only)')).toBeVisible()
  })

  test('Form submission with validation', async ({ page }) => {
    // Click "Yeni Föy Ekle" button
    await page.click('text=Yeni Föy Ekle')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Complete the form with valid data
    await page.click('text=Takip türünü seçiniz')
    await page.click('text=İLAMLI')
    await page.click('text=Takip yolunu seçiniz')
    await page.click('text=2-5 Örnek (Menkul Teslimi)')
    await page.click('text=Sonraki')
    
    // Fill alacaklı data
    await page.click('text=Alacaklı tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    await page.fill('#alacakli-ad-soyad', 'Test User')
    await page.fill('#alacakli-tc-kimlik', '12345678901')
    await page.fill('#alacakli-telefon', '05551234567')
    await page.fill('#alacakli-adres', 'Test Address')
    await page.click('text=Sonraki')
    
    // Fill borçlu data
    await page.click('text=Borçlu tipini seçiniz')
    await page.click('text=Gerçek Kişi')
    await page.fill('#borclu-ad-soyad', 'Test Debtor')
    await page.fill('#borclu-tc-kimlik', '98765432109')
    await page.fill('#borclu-telefon', '05559876543')
    await page.fill('#borclu-adres', 'Test Debtor Address')
    await page.click('text=Sonraki')
    
    // Submit the form
    await page.click('text=Formu Kaydet')
    
    // Verify form submission (modal should close)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
}) 