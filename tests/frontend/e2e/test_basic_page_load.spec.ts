import { test, expect } from '@playwright/test'

test.describe('Basic Page Load Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000')
    
    // Verify the page title
    await expect(page).toHaveTitle(/v0 App/)
    
    // Verify the header text is visible
    await expect(page.locator('text=Hukuk Takip Sistemi')).toBeVisible()
    
    // Verify main heading is visible
    await expect(page.locator('text=Anasayfa')).toBeVisible()
    
    // Verify both main cards are present
    await expect(page.locator('text=Dava Dosyalarım')).toBeVisible()
    await expect(page.locator('text=İcra Dosyalarım')).toBeVisible()
  })

  test('Navigation to İcra Dosyalarım page works', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000')
    
    // Click the "İcra Dosyalarına Git" button (not "İcra Dosyalarım")
    await page.click('text=İcra Dosyalarına Git')
    
    // Verify we're on the icra dosyalarim page
    await expect(page).toHaveURL(/.*icra-dosyalarim/)
    
    // Verify the page title (target the header specifically)
    await expect(page.locator('h1:has-text("İcra Dosyalarım")')).toBeVisible()
    
    // Verify the back button is present (check for either visible text or button)
    await expect(page.locator('button:has-text("Geri"), button:has-text("Anasayfaya Dön")')).toBeVisible()
  })

  test('Navigation to Dava Dosyalarım page works', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000')
    
    // Click the "Dava Dosyalarına Git" button
    await page.click('text=Dava Dosyalarına Git')
    
    // Verify we're on the dava dosyalarim page
    await expect(page).toHaveURL(/.*dava-dosyalarim/)
    
    // Verify the page title
    await expect(page.locator('text=Dava Dosyalarım')).toBeVisible()
  })

  test('İcra Dosyalarım page has expected elements', async ({ page }) => {
    // Navigate directly to the icra dosyalarim page
    await page.goto('http://localhost:3000/icra-dosyalarim')
    
    // Verify the page loads (target the header specifically)
    await expect(page.locator('h1:has-text("İcra Dosyalarım")')).toBeVisible()
    
    // Verify UYAP status badge is present
    await expect(page.locator('text=Uyap:')).toBeVisible()
    
    // Verify main action buttons are present (target buttons specifically)
    await expect(page.locator('button:has-text("Föyleri Getir")')).toBeVisible()
    await expect(page.locator('button:has-text("Yeni Föy Ekle")')).toBeVisible()
    
    // Verify tools section (target specific elements)
    await expect(page.locator('text=Araçlar')).toBeVisible()
    await expect(page.locator('button:has-text("Pratik Faiz Hesaplama")')).toBeVisible()
  })
}) 
