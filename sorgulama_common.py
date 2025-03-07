import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
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

def select_dropdown_option(driver, dropdown_selector, option_text):
    """Helper function to select an option from a dropdown."""
    try:
        wait = WebDriverWait(driver, 10)
        dropdown = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, dropdown_selector)))
        dropdown.click()
        option = wait.until(EC.element_to_be_clickable((By.XPATH, f"//div[text()='{option_text}']")))
        option.click()
        logger.info(f"Selected dropdown option: {option_text}")
        return True
    except (TimeoutException, NoSuchElementException) as e:
        logger.error(f"Failed to select option '{option_text}': {e}")
        return False

def perform_sorgulama(driver, sorgula_input, selected_options, result_label=None):
    """
    Perform the sorgula process using the provided input and selected options.
    Executes steps to open the menu, navigate to 'Dosya Sorgula', click the radio button,
    fill in the search input field with sorgula_input, click the search button,
    and lastly open the dosya pop-up from the first search result row.
    
    Args:
        driver (webdriver.Chrome): The Selenium WebDriver instance.
        sorgula_input (str): The user input from the sorgula entry field.
        selected_options (dict): Dictionary of selected options.
        result_label (tk.Label, optional): GUI label to update with status messages.
    """
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
    import time

    try:
        wait = WebDriverWait(driver, 15)

        # Step 1: Open Menu
        if result_label:
            result_label.config(text="Opening menu...")
        click_element(driver, By.CSS_SELECTOR, "#sidebar-menu > li:nth-child(4) > button")

        # Step 2: Click 'Dosya Sorgula'
        if result_label:
            result_label.config(text="Navigating to 'Dosya Sorgula'...")
        click_element(driver, By.CSS_SELECTOR, "[id='29954-alt-menu'] > a:nth-child(1) > li > span > span")

        # Step 3: Click Radio Button with robust retry
        if result_label:
            result_label.config(text="Selecting radio button...")
        radio_button_xpath = "/html/body/div/div/div[1]/div[2]/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div[4]"
        for attempt in range(3):
            if click_element(driver, By.XPATH, radio_button_xpath):
                break
            else:
                if result_label:
                    result_label.config(text=f"Attempt {attempt + 1}: Radio button click failed. Retrying...")

        # Step 4: Fill search input field with sorgula_input AFTER confirming element exists
        if result_label:
            result_label.config(text="Filling search input...")
        search_input_xpath = ("//div[contains(@class, 'dx-texteditor-input-container') and "
                              "contains(@class, 'dx-tag-container')]//input[@aria-label='Arama Alanı']")
        try:
            search_input = wait.until(EC.visibility_of_element_located((By.XPATH, search_input_xpath)))
        except TimeoutException:
            error_msg = "Search input element not found. Aborting sorgula process."
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return

        search_input.clear()
        search_input.send_keys(sorgula_input)
        logger.info(f"Filled search input with: {sorgula_input}")

        # Added delay of 0.5 seconds after filling the search input
        time.sleep(0.5)

        # Step 5: Click the search button using a robust XPath
        if result_label:
            result_label.config(text="Clicking search button...")
        search_button_xpath = (
            "//div[@role='button' and @title='Arama Yap' "
            "and contains(@class, 'dx-button') and contains(@aria-label, 'fe icon-search')]"
        )
        if not click_element(driver, By.XPATH, search_button_xpath):
            error_msg = "Search button not clickable. Aborting sorgula process."
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return

        # Step 6: Open the dosya pop-up from the first search result row
        if result_label:
            result_label.config(text="Opening dosya pop-up...")
        dosya_clicked = False
        last_exception = None
        for attempt in range(3):
            try:
                # Locate the first result row in the search results table
                result_row = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".dx-datagrid-rowsview tbody tr")))
                dosya_goruntule = result_row.find_element(By.CSS_SELECTOR, "#dosya-goruntule")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dosya_goruntule)
                wait.until(EC.element_to_be_clickable((By.ID, "dosya-goruntule")))
                dosya_goruntule.click()
                logger.info("Clicked 'dosya-goruntule' to open pop-up.")
                dosya_clicked = True
                break
            except Exception as e:
                last_exception = e
                logger.warning(f"Dosya pop-up attempt {attempt + 1} failed: {e}")
                time.sleep(0.5)
        if not dosya_clicked:
            error_msg = f"Failed to open dosya pop-up after 3 attempts: {last_exception}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return

        # Step 7: Click the "Borçlu Bilgileri" tab inside the pop-up
        if result_label:
            result_label.config(text="Clicking 'Borçlu Bilgileri' tab...")
        borclu_tab_xpath = (
            "//div[contains(@class, 'dx-item-content') and contains(@class, 'dx-tab-content')]"
            "//span[contains(text(), 'Borçlu Bilgileri')]"
        )
        for attempt in range(3):
            try:
                borclu_tab = wait.until(EC.visibility_of_element_located((By.XPATH, borclu_tab_xpath)))
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", borclu_tab)
                wait.until(EC.element_to_be_clickable((By.XPATH, borclu_tab_xpath)))
                borclu_tab.click()
                logger.info("Clicked 'Borçlu Bilgileri' tab.")
                break
            except Exception as e:
                logger.warning(f"'Borçlu Bilgileri' tab click attempt {attempt + 1} failed: {e}")
                time.sleep(0.5)
        else:
            error_msg = "Failed to click 'Borçlu Bilgileri' tab after 3 attempts."
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)

    except Exception as e:
        if result_label:
            result_label.config(text=f"Sorgula error: {e}")
        raise  # Re-raise the exception to be handled by higher-level code

# Optionally, you may keep this standalone function for reuse elsewhere:
def open_dosya_popup(driver, row, result_label=None):
    """
    Clicks the 'dosya-goruntule' button within a given row to open a pop-up.

    Args:
        driver (webdriver.Chrome): The Selenium WebDriver instance.
        row (WebElement): The row element containing the dosya button.
        result_label (tk.Label, optional): GUI label for displaying status messages.
    """
    wait = WebDriverWait(driver, 15)
    try:
        if result_label:
            result_label.config(text="Opening dosya pop-up...")
        dosya_goruntule = row.find_element(By.CSS_SELECTOR, "#dosya-goruntule")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dosya_goruntule)
        wait.until(EC.element_to_be_clickable((By.ID, "dosya-goruntule")))
        dosya_goruntule.click()
        logger.info("Clicked 'dosya-goruntule' to open pop-up.")
    except Exception as e:
        logger.error(f"Failed to open dosya pop-up: {e}")
        if result_label:
            result_label.config(text=f"Dosya pop-up error: {e}")