import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use

  // Setup authentication state if needed
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Retry mechanism for connecting to the application
  let retries = 5
  while (retries > 0) {
    try {
      // Navigate to the application
      await page.goto(baseURL!, { timeout: 30000 })
      
      // Wait for the application to be ready
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      break
    } catch (error) {
      retries--
      if (retries === 0) {
        console.error('Failed to connect to application after 5 retries:', error)
        throw error
      }
      console.log(`Connection failed, retrying... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds before retry
    }
  }
  
  // Save signed-in state
  await page.context().storageState({ path: storageState as string })
  await browser.close()
}

export default globalSetup 