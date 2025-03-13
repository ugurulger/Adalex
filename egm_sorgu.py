import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    ElementClickInterceptedException,
    ElementNotInteractableException,
    StaleElementReferenceException
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def click_element(driver, by, value, timeout=15):
    """Waits for an element to be visible, scrolls it into view, and clicks it.
    Retries if a stale element reference is encountered."""
    wait = WebDriverWait(driver, timeout)
    
    for attempt in range(3):
        try:
            element = wait.until(EC.presence_of_element_located((by, value)))
            element = wait.until(EC.visibility_of_element_located((by, value)))
            element = wait.until(EC.element_to_be_clickable((by, value)))

            # Scroll into view before clicking
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)

            try:
                element.click()
                logger.info(f"Clicked element: {value}")
                return True
            except Exception as e:
                logger.warning(f"Normal click failed for {value}. Trying JavaScript click. Error: {e}")
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked element via JavaScript: {value}")
                return True

        except StaleElementReferenceException as e:
            logger.warning(f"Stale element reference encountered for {value}, retrying... (attempt {attempt + 1})")
        except TimeoutException:
            logger.error(f"Timeout: Element not clickable ({value})")
            break
        except NoSuchElementException:
            logger.error(f"Element not found: {value}")
            break
        except Exception as e:
            logger.error(f"Unexpected error clicking element ({value}): {e}")
            break

    return False

def perform_egm_sorgu(driver, item_text, result_label=None):
    """
    Perform the EGM-TNB sorgu for a specific dropdown item.
    Step 1: Clicks the EGM-TNB card element.
    Step 2: Clicks the 'Sorgula' button.
    Step 3: Scrolls the pop-up by sending Page Down keys and extracts data from the result div, printing it to the console.

    Args:
        driver (webdriver.Chrome): The Selenium WebDriver instance.
        item_text (str): The text of the dropdown item being processed (for logging).
        result_label (tk.Label, optional): GUI label to update with status messages.
    """
    try:
        wait = WebDriverWait(driver, 15)

        # Step 1: Click the EGM-TNB card element
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking EGM-TNB card...")
        
        egm_card_xpath = (
            "//div[contains(@class, 'hedef-card') and contains(@class, 'hedef-card--bordered')]"
            "//div[contains(@class, 'hedef-card-body')]"
            "//div[contains(@class, 'hedef-card-content')]"
            "//div[contains(@class, 'info-card--main-title') and @title='EGM-TNB' and text()='EGM-TNB']"
        )
        
        egm_clicked = False
        last_exception = None
        for attempt in range(3):
            try:
                egm_card = wait.until(EC.element_to_be_clickable((By.XPATH, egm_card_xpath)))
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", egm_card)
                egm_card.click()
                logger.info(f"Clicked EGM-TNB card for {item_text}")
                egm_clicked = True
                break
            except Exception as e:
                last_exception = e
                logger.warning(f"EGM-TNB card click attempt {attempt + 1} failed for {item_text}: {e}")
                time.sleep(0.5)
        
        if not egm_clicked:
            error_msg = f"Failed to click EGM-TNB card for {item_text} after 3 attempts: {last_exception}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking Sorgula button...")
        
        sorgula_button_css = ".dx-button.dx-button-mode-contained.dx-button-default[aria-label='Sorgula']"
        
        sorgula_clicked = False
        last_exception = None
        for attempt in range(3):
            try:
                sorgula_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, sorgula_button_css)))
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sorgula_button)
                sorgula_button.click()
                logger.info(f"Clicked Sorgula button for {item_text}")
                sorgula_clicked = True
                break
            except Exception as e:
                last_exception = e
                logger.warning(f"Sorgula button click attempt {attempt + 1} failed for {item_text}: {e}")
                time.sleep(0.5)
        
        if not sorgula_clicked:
            error_msg = f"Failed to click Sorgula button for {item_text} after 3 attempts: {last_exception}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False

        # Step 3: Scroll the pop-up by sending Page Down keys and extract data from the result div
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Scrolling and extracting data...")
        
        # Locate the scrollable container and scroll with Page Down keys
        scroll_container_css = ".dx-scrollable-container"
        try:
            scroll_container = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, scroll_container_css)))
            actions = ActionChains(driver)
            for _ in range(5):  # Adjust the number of scrolls as needed
                actions.move_to_element(scroll_container).click().send_keys(Keys.PAGE_DOWN).perform()
                time.sleep(0.5)  # Small delay between scrolls to allow content to load
            logger.info(f"Scrolled pop-up container with Page Down keys for {item_text}")
        except Exception as e:
            error_msg = f"Failed to scroll pop-up container for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False
        
        time.sleep(1.5)  # Increased delay (1 + 0.5 seconds) to ensure content fully loads after scrolling
        
        # Flexible XPath based on the provided path, targeting the result div
        result_div_xpath = "//div[contains(@class, 'dx-scrollable-container')]//div[contains(@class, 'dx-scrollview-content')]//div[contains(@class, 'row')]//div[contains(@class, 'col-md')]/div"
        
        data_extracted = False
        last_exception = None
        for attempt in range(3):
            try:
                result_div = wait.until(EC.presence_of_element_located((By.XPATH, result_div_xpath)))
                result_text = result_div.text.strip()
                logger.info(f"Extracted data for {item_text}: {result_text}")
                print(f"EGM Sorgu Result for {item_text}: {result_text}")  # Print to console
                data_extracted = True
                break
            except Exception as e:
                last_exception = e
                logger.warning(f"Data extraction attempt {attempt + 1} failed for {item_text}: {e}")
                time.sleep(0.5)
        
        if not data_extracted:
            error_msg = f"Failed to extract data for {item_text} after 3 attempts: {last_exception}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False
        
        if result_label:
            result_label.config(text=f"EGM sorgu completed for {item_text}")
        return True

    except Exception as e:
        error_msg = f"EGM sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        return False