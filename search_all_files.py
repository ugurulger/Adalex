import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException, ElementNotInteractableException
from search_all_files_extract import extract_data_from_table

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def click_element(driver, by, value, timeout=15):
    """Waits for an element to be visible, scrolls it into view, and clicks it."""
    wait = WebDriverWait(driver, timeout)
    
    try:
        element = wait.until(EC.presence_of_element_located((by, value)))  
        element = wait.until(EC.visibility_of_element_located((by, value)))  
        element = wait.until(EC.element_to_be_clickable((by, value)))  

        # Scroll into view before clicking
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)

        # Try normal click
        try:
            element.click()
            logger.info(f"Clicked element: {value}")
        except Exception as e:
            logger.warning(f"Normal click failed for {value}. Trying JavaScript click. Error: {e}")
            driver.execute_script("arguments[0].click();", element)

        return True

    except TimeoutException:
        logger.error(f"Timeout: Element not clickable ({value})")
    except NoSuchElementException:
        logger.error(f"Element not found: {value}")
    except Exception as e:
        logger.error(f"Unexpected error clicking element ({value}): {e}")

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

def search_all_files(driver, result_label=None):
    """Automates the search process on UYAP."""
    try:
        wait = WebDriverWait(driver, 15)

        # Step 1: Open Menu
        if result_label: result_label.config(text="Opening menu...")
        click_element(driver, By.CSS_SELECTOR, "#sidebar-menu > li:nth-child(4) > button")

        # Step 2: Click 'Dosya Sorgula'
        if result_label: result_label.config(text="Navigating to 'Dosya Sorgula'...")
        click_element(driver, By.CSS_SELECTOR, "[id='29954-alt-menu'] > a:nth-child(1) > li > span > span")

        # Step 3: Click Radio Button with robust retry
        if result_label: result_label.config(text="Selecting radio button...")
        radio_button_xpath = "/html/body/div/div/div[1]/div[2]/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div[4]"
        
        for attempt in range(3):  # Retry up to 3 times
            if click_element(driver, By.XPATH, radio_button_xpath):
                logger.info("Radio button clicked successfully.")
                break
            else:
                logger.warning(f"Attempt {attempt + 1}: Radio button click failed. Retrying...")

        # Step 4: Click Search All Files Button
        if result_label: result_label.config(text="Clicking search button...")
        click_element(driver, By.CSS_SELECTOR, "#content-div2 > div.white-content > div > div:nth-child(3) > div > div.col-xl-6 > div > div.d-flex.gap-1 > button")

        # Step 4.5: Wait for the page to load after clicking the search button
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#yargi-turu-detayli-arama")))
            logger.info("Page loaded successfully. Continuing to next steps.")
        except TimeoutException:
            logger.error("Timeout waiting for Yargı Türü dropdown to appear.")

        # Step 5-7: Select dropdowns
        select_dropdown_option(driver, "#yargi-turu-detayli-arama", "İcra")
        select_dropdown_option(driver, "#yargi-birimi-detayli-arama", "İCRA DAİRESİ")
        select_dropdown_option(driver, "#mahkeme-detayli-arama", "Tümü")

        # Step 8: Click Search Button
        if result_label: result_label.config(text="Executing search...")
        click_element(driver, By.CSS_SELECTOR, "#content-div2 > div.white-content > div > div:nth-child(2) > div > div.col-xl-6.t-1 > div > div > div.hedef-card-footer > div.dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.dx-button-has-icon")

        logger.info("Search process completed successfully.")

        # ✅ Call extraction function **after search completes**
        extract_data_from_table(driver)

    except Exception as e:
        logger.error(f"Unexpected error during search: {e}")
        if result_label:
            result_label.config(text=f"Error: {e}")
