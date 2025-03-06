import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Constants
USER_DATA_DIR = "/Users/ugurulger/Library/Application Support/Google/ChromeDuplicate"
PROFILE_DIRECTORY = "Default"
ARKSIGNER_EXTENSION_PATH = "/Users/ugurulger/Library/Application Support/Google/Chrome/Default/Extensions/pllcidbcfbamjfbfpemnnjohnfcliakf/2.0.1_0"
URL = "https://avukatbeta.uyap.gov.tr/"
FIRST_BTN_SELECTOR = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-normal.nav-link"
PIN_BOX_SELECTOR = "input[aria-id='pinKodu']"
GIRIS_BTN_SELECTOR = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-icon.adalet-button.btn.btn-primary.px-4.btn-sm"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def open_browser_and_login(pinkodu, result_label=None):
    """
    Open Chrome browser, navigate to the UYAP login page, and log in using the provided PIN.
    Returns the driver instance on success, None on failure.
    
    Args:
        pinkodu (str): The PIN code to enter.
        result_label (optional): A GUI label to update with status messages.
    """
    driver = None
    try:
        # Open Chrome browser
        if result_label:
            result_label.config(text="Opening Chrome with duplicate profile & ArcSigner...")
        chrome_options = Options()
        chrome_options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
        chrome_options.add_argument(f"--profile-directory={PROFILE_DIRECTORY}")
        chrome_options.add_argument(f"--load-extension={ARKSIGNER_EXTENSION_PATH}")
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        wait = WebDriverWait(driver, 15)

        # 1. Open the page
        driver.get(URL)
        logger.info("Page opened successfully.")
        if result_label:
            result_label.config(text="Page opened successfully.")

        # 2. Click the first button
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, FIRST_BTN_SELECTOR))).click()
        logger.info("First button clicked.")
        if result_label:
            result_label.config(text="First button clicked.")
        time.sleep(5)  # Wait for the next page to load

        # 3. Enter the PIN
        pin_box = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, PIN_BOX_SELECTOR)))
        pin_box.click()
        pin_box.clear()
        pin_box.send_keys(pinkodu)
        logger.info("PIN entered.")
        if result_label:
            result_label.config(text="PIN entered.")

        # 4. Click the "Giriş" button
        giris_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, GIRIS_BTN_SELECTOR)))
        driver.execute_script("arguments[0].click();", giris_btn)  # Use JavaScript to click
        logger.info("Giriş button clicked.")
        if result_label:
            result_label.config(text="Giriş button clicked. Waiting 10 seconds...")

        # Wait for login to complete (10 seconds, could be optimized later)
        time.sleep(10)

        # Return driver instance to keep browser open
        logger.info("Login successful, returning driver.")
        return driver

    except TimeoutException:
        error_msg = "Timed out waiting for an element to load."
        logger.error(error_msg)
        if result_label:
            result_label.config(text=error_msg)
        driver.save_screenshot("/Users/ugurulger/Desktop/timeout_error.png")
        logger.info("Screenshot saved as '/Users/ugurulger/Desktop/timeout_error.png'.")
    except NoSuchElementException:
        error_msg = "Element not found on the page."
        logger.error(error_msg)
        if result_label:
            result_label.config(text=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error: {e}"
        logger.error(error_msg)
        if result_label:
            result_label.config(text=error_msg)
    finally:
        if driver and not isinstance(driver, webdriver.Chrome):
            driver.quit()  # Close only if login failed
            logger.info("Browser closed due to failure.")
    return None  # Return None if login fails