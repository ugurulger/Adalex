import logging, time, os, json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, StaleElementReferenceException,
    ElementNotInteractableException, ElementClickInterceptedException
)

# Global Constants
TIMEOUT = 15                # Seconds to wait for elements
RETRY_ATTEMPTS = 3          # Maximum click attempts
SLEEP_INTERVAL = 0.5        # Seconds between attempts
OVERLAY_SELECTOR = ".dx-loadpanel-indicator.dx-loadindicator.dx-widget"

# SGK button selector
SGK_BUTTON_CSS = "button.query-button [title='SGK']"

# Updated SGK dropdown selector (using attribute selector to avoid a fixed dynamic ID)
SGK_DROPDOWN_SELECTOR = (
    "div[id^='dx-'] > div > div:nth-child(1) > div:nth-child(3) > "
    "div:nth-child(1) > div > div > "
    "div.dx-dropdowneditor-input-wrapper.dx-selectbox-container > "
    "div > div.dx-texteditor-buttons-container > "
    "div.dx-widget.dx-button-normal.dx-dropdowneditor-button"
)

# New: Active subpanel selector – clicking somewhere in this container appears to focus the correct panel.
ACTIVE_SUBPANEL_SELECTOR = "div.dx-multiview-item.dx-item-selected"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_sorgu.json")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """
    Saves or updates extracted_data to a JSON file on the desktop.
    """
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error reading existing JSON file, starting fresh: {e}")
            existing_data = {}
    else:
        existing_data = {}
    for dosya_no, items in extracted_data.items():
        if dosya_no not in existing_data:
            existing_data[dosya_no] = {}
        existing_data[dosya_no].update(items)
    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved/updated in {JSON_FILE}")
    except IOError as e:
        logger.error(f"Error writing to JSON file: {e}")

def click_element_merged(driver, by, value, action_name="", item_text="", result_label=None, use_js_first=False):
    """
    Waits for an element (by, value) to be clickable, scrolls it into view,
    and attempts a click; if normal clicking fails, uses a JavaScript fallback.
    Also waits for any overlay to vanish.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    for attempt in range(RETRY_ATTEMPTS):
        try:
            element = wait.until(EC.element_to_be_clickable((by, value)))
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
            time.sleep(SLEEP_INTERVAL)
            if use_js_first:
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JS for {target} (attempt {attempt+1})")
            else:
                element.click()
                logger.info(f"Clicked {action_name} for {target} (attempt {attempt+1})")
            if OVERLAY_SELECTOR:
                wait.until_not(EC.presence_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)), "Overlay persists")
                logger.info("Overlay gone.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            try:
                time.sleep(SLEEP_INTERVAL)
                element = driver.find_element(by, value)
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JS fallback for {target} (attempt {attempt+1})")
                if OVERLAY_SELECTOR:
                    wait.until_not(EC.presence_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)), "Overlay persists")
                    logger.info("Overlay gone (fallback).")
                return True
            except Exception as js_e:
                logger.warning(f"JS fallback failed for {target}: {js_e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Performs SGK query steps:
      1. Click the SGK button.
      2. Click an empty area in the active subpanel to focus the correct panel.
      3. Click the SGK dropdown within that active panel.
      
    Returns:
      Tuple (success: bool, data: dict) - the status and extracted data.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "SGK": {}
            }
        }
    }
    try:
        # Step 1: Click SGK button
        if result_label:
            result_label.config(text=f"Performing SGK query for {item_text} - Clicking SGK button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS,
                                    action_name="SGK button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 2: Click an empty area in the active subpanel
        if result_label:
            result_label.config(text=f"Focusing active subpanel for {item_text}...")
        # This step is to force the active panel to be the one we need.
        if not click_element_merged(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR,
                                    action_name="Active subpanel focus", item_text=item_text, result_label=result_label):
            logger.warning("Could not explicitly focus the active subpanel; proceeding anyway")
        # Wait briefly to let the panel update
        time.sleep(SLEEP_INTERVAL)

        # Step 3: Click the SGK dropdown within the active subpanel
        if result_label:
            result_label.config(text=f"Performing SGK query for {item_text} - Opening SGK dropdown...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SGK_DROPDOWN_SELECTOR,
                                    action_name="SGK dropdown", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Additional SGK query steps can be added here...
        return True, extracted_data

    except Exception as e:
        error_msg = f"SGK query error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data

