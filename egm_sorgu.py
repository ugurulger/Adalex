import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5
EGM_BUTTON_CSS = (
    "button.query-button .hedef-card.hedef-card--bordered "
    ".hedef-card-body .hedef-card-content .info-card--main-title[title='EGM-TNB']"
)
SORGULA_BUTTON_CSS = ".dx-button.dx-button-mode-contained.dx-button-default[aria-label='Sorgula']"
DATA_XPATH = (
    "/html/body/div[2]/div/div[2]/div/div/div/div/div[2]/div/div/div[9]/div/div[1]/div[1]/div/div/div[2]/"
    "div/div[2]/div/div[2]/div/div/div[1]/div/div[1]/div[2]/div[3]/div[2]/div/div/div/div/div/div[2]"
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def click_with_retry(driver, wait, css_selector, action_name, item_text, result_label=None, retries=RETRY_ATTEMPTS):
    """
    Click an element with retry logic, using both standard click and JavaScript fallback.
    """
    for attempt in range(retries):
        try:
            element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, css_selector)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            time.sleep(SLEEP_INTERVAL)
            element.click()
            logger.info(f"Clicked {action_name} for {item_text} (attempt {attempt + 1})")
            return True
        except Exception as e:
            logger.warning(f"{action_name} click attempt {attempt + 1} failed for {item_text}: {e}")
            try:
                element = driver.find_element(By.CSS_SELECTOR, css_selector)
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JavaScript for {item_text} (attempt {attempt + 1})")
                return True
            except Exception as e2:
                logger.warning(f"JavaScript click also failed: {e2}")
            time.sleep(1)
    error_msg = f"Failed to click {action_name} for {item_text} after {retries} attempts"
    if result_label:
        result_label.config(text=error_msg)
    logger.error(error_msg)
    return False

def perform_egm_sorgu(driver, item_text, result_label=None):
    """
    Perform the EGM-TNB sorgu for a specific dropdown item and extract data.
    Steps:
        1. Click the EGM-TNB button.
        2. Click the "Sorgula" button.
        3. Extract data from the specified XPath (scrolling handled by centering data_element).
    Returns:
        Tuple (success: bool, data: str) - Success status and extracted data (or empty string if failed).
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = ""

    try:
        # Step 1: Click the EGM-TNB button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking EGM-TNB button...")
        if not click_with_retry(driver, wait, EGM_BUTTON_CSS, "EGM-TNB button", item_text, result_label):
            return False, extracted_data

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking Sorgula button...")
        if not click_with_retry(driver, wait, SORGULA_BUTTON_CSS, "Sorgula button", item_text, result_label):
            return False, extracted_data
        time.sleep(2)  # Wait for the pop-up to load

        # Step 3: Extract data from the specified XPath
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Extracting data...")
        try:
            data_element = wait.until(EC.presence_of_element_located((By.XPATH, DATA_XPATH)))
            # Scroll down by centering the data_element
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", data_element)
            time.sleep(1)  # Small delay to ensure the scroll completes (optional, adjust as needed)
            extracted_data = data_element.text.strip()
            if not extracted_data:
                logger.warning(f"Extracted data is empty for {item_text}")
            else:
                logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")
        except TimeoutException as e:
            error_msg = f"Failed to locate data element for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False, extracted_data
        except Exception as e:
            error_msg = f"Error extracting data for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False, extracted_data

        if result_label:
            result_label.config(text=f"EGM sorgu completed for {item_text}")
        logger.info(f"Waiting 10 seconds after processing {item_text}")
        time.sleep(10)
        return True, extracted_data

    except Exception as e:
        error_msg = f"EGM sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        return False, extracted_data