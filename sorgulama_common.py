import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def click_element(driver, by, value, timeout=15):
    """Waits for an element to be clickable and performs a click with fallback."""
    wait = WebDriverWait(driver, timeout)
    for attempt in range(3):
        try:
            element = wait.until(EC.element_to_be_clickable((by, value)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            element.click()
            logger.info(f"Clicked element: {value}")
            return True
        except Exception as e:
            logger.warning(f"Click attempt {attempt + 1} failed for {value}: {e}")
            if isinstance(e, TimeoutException):
                logger.error(f"Timeout: Element not clickable ({value})")
                break
            elif isinstance(e, NoSuchElementException):
                logger.error(f"Element not found: {value}")
                break
            time.sleep(0.5)  # Brief pause before retry
    return False

def select_dropdown_option(driver, dropdown_selector, option_text):
    """Selects an option from a dropdown with robust error handling."""
    wait = WebDriverWait(driver, 10)
    try:
        if not click_element(driver, By.CSS_SELECTOR, dropdown_selector):
            return False
        option_xpath = f"//div[text()='{option_text}']"
        if not click_element(driver, By.XPATH, option_xpath):
            return False
        logger.info(f"Selected dropdown option: {option_text}")
        return True
    except Exception as e:
        logger.error(f"Failed to select option '{option_text}': {e}")
        return False

def perform_sorgulama(driver, dosya_no, selected_options, result_label=None):
    """
    Perform the sorgula process with robust steps and minimal code.
    
    Args:
        driver (webdriver.Chrome): The Selenium WebDriver instance.
        dosya_no (str): The dosya number from the sorgula entry field.
        selected_options (dict): Dictionary of selected options (e.g., {"EGM-TNB": True}).
        result_label (tk.Label, optional): GUI label to update with status messages.
    """
    wait = WebDriverWait(driver, 15)

    def update_status(message):
        if result_label:
            result_label.config(text=message)
        logger.info(message)

    # Steps 1-2: Navigate to Dosya Sorgula
    steps = [
        ("Opening menu...", "#sidebar-menu > li:nth-child(4) > button", By.CSS_SELECTOR),
        ("Navigating to 'Dosya Sorgula'...", "[id='29954-alt-menu'] > a:nth-child(1) > li > span > span", By.CSS_SELECTOR),
    ]
    for message, selector, by in steps:
        update_status(message)
        if not click_element(driver, by, selector):
            update_status(f"Failed: {message}")
            return

    # Step 3: Select radio button
    update_status("Selecting radio button...")
    radio_xpath = "/html/body/div/div/div[1]/div[2]/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div[4]"
    if not click_element(driver, By.XPATH, radio_xpath):
        update_status("Failed to select radio button.")
        return

    # Step 4: Fill search input
    update_status("Filling search input...")
    search_input_xpath = "//div[contains(@class, 'dx-texteditor-input-container')]//input[@aria-label='Arama Alanı']"
    try:
        search_input = wait.until(EC.visibility_of_element_located((By.XPATH, search_input_xpath)))
        search_input.clear()
        search_input.send_keys(dosya_no)
        logger.info(f"Filled search input with: {dosya_no}")
    except TimeoutException:
        update_status("Search input not found.")
        return

    # Step 5: Click search button
    update_status("Clicking search button...")
    search_button_xpath = "//div[@role='button' and @title='Arama Yap' and contains(@class, 'dx-button')]"
    if not click_element(driver, By.XPATH, search_button_xpath):
        update_status("Failed to click search button.")
        return

    # Step 6: Open dosya pop-up
    update_status("Opening dosya pop-up...")
    try:
        result_row = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".dx-datagrid-rowsview tbody tr")))
        if not click_element(driver, By.ID, "dosya-goruntule"):
            update_status("Failed to open dosya pop-up.")
            return
    except TimeoutException:
        update_status("Search result row not found.")
        return

    # Step 7: Click Borçlu Bilgileri tab
    update_status("Clicking 'Borçlu Bilgileri' tab...")
    borclu_tab_xpath = "//div[contains(@class, 'dx-tab-content')]//span[contains(text(), 'Borçlu Bilgileri')]"
    if not click_element(driver, By.XPATH, borclu_tab_xpath):
        update_status("Failed to click 'Borçlu Bilgileri' tab.")
        return

    # Step 8-9: Handle dropdown and process options
    update_status("Processing dropdown items...")
    dropdown_selector = ".dx-texteditor-buttons-container .dx-dropdowneditor-button"
    if not click_element(driver, By.CSS_SELECTOR, dropdown_selector):
        update_status("Failed to open dropdown menu.")
        return

    time.sleep(1)  # Wait for dropdown to load
    dropdown_items_selector = ".dx-dropdowneditor-overlay .dx-list-item"
    try:
        items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, dropdown_items_selector)))
        for index, item in enumerate(items):
            item_text = item.text.strip() or f"Item {index + 1}"
            update_status(f"Processing dropdown item: {item_text}")
            if not click_element(driver, By.XPATH, f"//*[text()='{item_text}']"):
                update_status(f"Failed to click item: {item_text}")
                continue

            # Process selected options
            for option, enabled in selected_options.items():
                if not enabled:
                    continue
                try:
                    if option == "EGM-TNB":
                        from egm_sorgu import perform_egm_sorgu
                        perform_egm_sorgu(driver, item_text, dosya_no, result_label)
                    elif option == "Banka":
                        from banka_sorgu import perform_banka_sorgu
                        perform_banka_sorgu(driver, item_text, dosya_no, result_label)
                    elif option == "TAKBİS":
                        from takbis_sorgu import perform_takbis_sorgu
                        perform_takbis_sorgu(driver, item_text, dosya_no, result_label)
                except (ImportError, Exception) as e:
                    logger.error(f"Failed to process {option} for {item_text}: {e}")

            if index < len(items) - 1:
                time.sleep(3)  # Wait before next item
                if not click_element(driver, By.CSS_SELECTOR, dropdown_selector):
                    update_status("Failed to re-open dropdown.")
                    break
        update_status("Dropdown items processing completed.")
    except TimeoutException:
        update_status("No dropdown items found.")