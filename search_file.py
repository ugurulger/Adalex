import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def search_dosya(driver, dosya_adi, result_label=None):
    """
    Perform a search for the given Dosya Adı on the UYAP website.
    
    This function performs the following steps:
      1. Clicks the menu button via a JS selector.
      2. Clicks the 'Dosya Sorgula' menu item via a JS selector.
      3. Clicks the radio button identified by XPath.
      4. Fills the search input with the value of 'dosya_adi'.
      5. Waits 1 second then clicks the search button using a JS selector.
      6. Waits 1 second then clicks the element with id 'dosya-goruntule'.
    
    Args:
        driver: The Selenium WebDriver instance with the open browser.
        dosya_adi (str): The Dosya Adı to search (e.g., "2024/11090").
        result_label (optional): A GUI label to update with status messages.
    """
    try:
        wait = WebDriverWait(driver, 15)

        # Step 1: Click the menu button using JS selector
        if result_label:
            result_label.config(text="Clicking menu button...")
        menu_button = wait.until(lambda d: d.execute_script(
            "return document.querySelector('#sidebar-menu > li:nth-child(4) > button');"
        ))
        if menu_button:
            driver.execute_script("arguments[0].click();", menu_button)
            logger.info("Clicked menu button.")
            if result_label:
                result_label.config(text="Menu button clicked.")
        else:
            raise NoSuchElementException("Menu button not found using JS selector.")

        # Step 2: Click the 'Dosya Sorgula' menu item using JS selector
        if result_label:
            result_label.config(text="Clicking 'Dosya Sorgula' menu item...")
        dosya_sorgula_button = wait.until(lambda d: d.execute_script(
            "return document.querySelector(\"[id='29954-alt-menu'] > a:nth-child(1) > li > span > span\");"
        ))
        if dosya_sorgula_button:
            driver.execute_script("arguments[0].click();", dosya_sorgula_button)
            logger.info("Clicked 'Dosya Sorgula' menu item.")
            if result_label:
                result_label.config(text="'Dosya Sorgula' clicked.")
        else:
            raise NoSuchElementException("'Dosya Sorgula' menu item not found using JS selector.")

        # Step 3: Click the radio button using XPath (more reliable in this case)
        if result_label:
            result_label.config(text="Clicking radio button...")
        radio_button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "/html/body/div/div/div[1]/div[2]/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div[4]")
        ))
        radio_button.click()
        logger.info("Clicked radio button.")
        if result_label:
            result_label.config(text="Radio button clicked.")

        # Step 4: Fill the search input with the value from 'dosya_adi'
        if result_label:
            result_label.config(text="Filling search input...")
        input_element = wait.until(lambda d: d.execute_script(
            "return document.querySelector('#aranacak-kelimeler > div > div > div.dx-texteditor-input-container.dx-tag-container input');"
        ))
        if input_element:
            driver.execute_script(
                "arguments[0].value = arguments[1]; "
                "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
                input_element, dosya_adi
            )
            logger.info("Filled search input with dosya_adi.")
            if result_label:
                result_label.config(text="Search input filled.")
        else:
            raise NoSuchElementException("Search input not found using JS selector.")

        # Step 5: Wait 1 second then click the search button using the specified JS selector
        if result_label:
            result_label.config(text="Clicking search button...")
        time.sleep(1)
        search_button = wait.until(lambda d: d.execute_script(
            "return document.querySelector('#aranacak-kelimeler > div > div > div.dx-texteditor-buttons-container > div > div');"
        ))
        if search_button:
            driver.execute_script("arguments[0].click();", search_button)
            logger.info("Clicked search button.")
            if result_label:
                result_label.config(text="Search button clicked.")
        else:
            raise NoSuchElementException("Search button not found using JS selector.")

        # Step 6: Wait 1 second then click the element with id 'dosya-goruntule'
        if result_label:
            result_label.config(text="Clicking dosya-goruntule...")
        time.sleep(1)
        dosya_goruntule_button = wait.until(lambda d: d.execute_script(
            "return document.querySelector('#dosya-goruntule');"
        ))
        if dosya_goruntule_button:
            driver.execute_script("arguments[0].click();", dosya_goruntule_button)
            logger.info("Clicked dosya-goruntule.")
            if result_label:
                result_label.config(text="Dosya goruntule clicked.")
        else:
            raise NoSuchElementException("Element with id 'dosya-goruntule' not found using JS selector.")

        logger.info(f"Ready to proceed with search for Dosya Adı: {dosya_adi}")

    except TimeoutException:
        error_msg = "Timed out waiting for an element to be clickable or available."
        logger.error(error_msg)
        if result_label:
            result_label.config(text=error_msg)
    except NoSuchElementException as e:
        error_msg = f"Element not found: {e}"
        logger.error(error_msg)
        if result_label:
            result_label.config(text=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error during search: {e}"
        logger.error(error_msg)
        if result_label:
            result_label.config(text=error_msg)
