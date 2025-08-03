import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use

  // Setup authentication state if needed
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Navigate to the application
  await page.goto(baseURL!)
  
  // Wait for the application to be ready
  await page.waitForLoadState('networkidle')
  
  // Save signed-in state
  await page.context().storageState({ path: storageState as string })
  await browser.close()
}

export default globalSetup 