import { test, expect } from '@playwright/test'

test.describe('Query Execution E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page before each test
    await page.goto('http://localhost:3000')
    await page.click('text=İcra Dosyalarına Git')
    await expect(page).toHaveURL(/.*icra-dosyalarim/)
  })

  // Function to click UĞUR ÇELİK element
  async function clickUgurCelik(page: any) {
    // Try title selector first (works on desktop)
    const titleElement = page.locator('[title="UĞUR ÇELİK"]')
    if (await titleElement.isVisible()) {
      await titleElement.click({ force: true })
      return
    }
    
    // Try text selector (works on mobile)
    const textElement = page.locator('text=UĞUR ÇELİK').first()
    if (await textElement.isVisible()) {
      await textElement.click({ force: true })
      return
    }
    
    throw new Error('Could not find any visible UĞUR ÇELİK element')
  }

  // Function to click the visible query button (universal)
  async function clickVisibleQueryButton(page: any, buttonText: string) {
    // Try Button 1 (with span class "text-[10px]") - works on mobile
    const button1 = page.locator(`button:has(span.text-\\[10px\\]:has-text("${buttonText}"))`).first()
    if (await button1.isVisible()) {
      await button1.click({ force: true })
      return
    }
    
    // Try Button 2 (with span class "text-[8px]") - works on desktop
    const button2 = page.locator(`button:has(span.text-\\[8px\\]:has-text("${buttonText}"))`).first()
    if (await button2.isVisible()) {
      await button2.click({ force: true })
      return
    }
    
    throw new Error(`Could not find any visible ${buttonText} button`)
  }

  test('Test case 1: Adres query execution', async ({ page }) => {
    // Click 'Föyleri Getir' button
    await page.click('text=Föyleri Getir')
    
    // Wait for the list to load
    await page.waitForTimeout(2000)
    
    // Click on the list item with title 'UĞUR ÇELİK'
    await clickUgurCelik(page)
    
    // Assert the text 'UYAP İcra Dosyası Detayları' exist
    await expect(page.locator('h1:has-text("UYAP İcra Dosyası Detayları"), h2:has-text("UYAP İcra Dosyası Detayları"), h3:has-text("UYAP İcra Dosyası Detayları")')).toBeVisible()
    
    // Wait for the modal to be fully loaded
    await page.waitForTimeout(2000)
    
    // Click on the visible Adres button
    await clickVisibleQueryButton(page, 'Adres')
    
    // Wait for the query to complete
    await page.waitForTimeout(3000)
    
    // Assert the text 'Son Sorgu Tarihi' exist
    await expect(page.locator('text=Son Sorgu Tarihi')).toBeVisible()
  })

  test('Test case 2: SGK query execution', async ({ page }) => {
    // Click 'Föyleri Getir' button
    await page.click('text=Föyleri Getir')
    
    // Wait for the list to load
    await page.waitForTimeout(2000)
    
    // Click on the list item with title 'UĞUR ÇELİK'
    await clickUgurCelik(page)
    
    // Assert the text 'UYAP İcra Dosyası Detayları' exist
    await expect(page.locator('h1:has-text("UYAP İcra Dosyası Detayları"), h2:has-text("UYAP İcra Dosyası Detayları"), h3:has-text("UYAP İcra Dosyası Detayları")')).toBeVisible()
    
    // Wait for the modal to be fully loaded
    await page.waitForTimeout(2000)
    
    // Click on the visible SGK button
    await clickVisibleQueryButton(page, 'SGK')
    
    // Wait for the query to complete
    await page.waitForTimeout(3000)
    
    // Assert the text 'Son Sorgu Tarihi' exist
    await expect(page.locator('text=Son Sorgu Tarihi')).toBeVisible()
  })

  test('Test case 3: Araç query execution', async ({ page }) => {
    // Click 'Föyleri Getir' button
    await page.click('text=Föyleri Getir')
    
    // Wait for the list to load
    await page.waitForTimeout(2000)
    
    // Click on the list item with title 'UĞUR ÇELİK'
    await clickUgurCelik(page)
    
    // Assert the text 'UYAP İcra Dosyası Detayları' exist
    await expect(page.locator('h1:has-text("UYAP İcra Dosyası Detayları"), h2:has-text("UYAP İcra Dosyası Detayları"), h3:has-text("UYAP İcra Dosyası Detayları")')).toBeVisible()
    
    // Wait for the modal to be fully loaded
    await page.waitForTimeout(2000)
    
    // Click on the visible Araç button
    await clickVisibleQueryButton(page, 'Araç')
    
    // Wait for the query to complete
    await page.waitForTimeout(3000)
    
    // Assert the text 'Son Sorgu Tarihi' exist
    await expect(page.locator('text=Son Sorgu Tarihi')).toBeVisible()
  })

  test('Test case 4: Gayrimenkul query execution', async ({ page }) => {
    // Click 'Föyleri Getir' button
    await page.click('text=Föyleri Getir')
    
    // Wait for the list to load
    await page.waitForTimeout(2000)
    
    // Click on the list item with title 'UĞUR ÇELİK'
    await clickUgurCelik(page)
    
    // Assert the text 'UYAP İcra Dosyası Detayları' exist
    await expect(page.locator('h1:has-text("UYAP İcra Dosyası Detayları"), h2:has-text("UYAP İcra Dosyası Detayları"), h3:has-text("UYAP İcra Dosyası Detayları")')).toBeVisible()
    
    // Wait for the modal to be fully loaded
    await page.waitForTimeout(2000)
    
    // Click on the visible Gayrimenkul button
    await clickVisibleQueryButton(page, 'Gayrimenkul')
    
    // Wait for the query to complete
    await page.waitForTimeout(3000)
    
    // Assert the text 'Son Sorgu Tarihi' exist
    await expect(page.locator('text=Son Sorgu Tarihi')).toBeVisible()
  })

  test('Test case 5: Alacaklı Dosyası query execution', async ({ page }) => {
    // Click 'Föyleri Getir' button
    await page.click('text=Föyleri Getir')
    
    // Wait for the list to load
    await page.waitForTimeout(2000)
    
    // Click on the list item with title 'UĞUR ÇELİK'
    await clickUgurCelik(page)
    
    // Assert the text 'UYAP İcra Dosyası Detayları' exist
    await expect(page.locator('h1:has-text("UYAP İcra Dosyası Detayları"), h2:has-text("UYAP İcra Dosyası Detayları"), h3:has-text("UYAP İcra Dosyası Detayları")')).toBeVisible()
    
    // Wait for the modal to be fully loaded
    await page.waitForTimeout(2000)
    
    // Click on the visible Alacaklı Dosyası button
    await clickVisibleQueryButton(page, 'Alacaklı Dosyası')
    
    // Wait for the query to complete
    await page.waitForTimeout(3000)
    
    // Assert the text 'Son Sorgu Tarihi' exist
    await expect(page.locator('text=Son Sorgu Tarihi')).toBeVisible()
  })

  test('Test case 6: SGK Haciz query execution', async ({ page }) => {
    // Click 'Föyleri Getir' button
    await page.click('text=Föyleri Getir')
    
    // Wait for the list to load
    await page.waitForTimeout(2000)
    
    // Click on the list item with title 'UĞUR ÇELİK'
    await clickUgurCelik(page)
    
    // Assert the text 'UYAP İcra Dosyası Detayları' exist
    await expect(page.locator('h1:has-text("UYAP İcra Dosyası Detayları"), h2:has-text("UYAP İcra Dosyası Detayları"), h3:has-text("UYAP İcra Dosyası Detayları")')).toBeVisible()
    
    // Wait for the modal to be fully loaded
    await page.waitForTimeout(2000)
    
    // Click on the visible SGK Haciz button
    await clickVisibleQueryButton(page, 'SGK Haciz')
    
    // Wait for the query to complete
    await page.waitForTimeout(3000)
    
    // Assert the text 'Son Sorgu Tarihi' exist
    await expect(page.locator('text=Son Sorgu Tarihi')).toBeVisible()
  })
}) 