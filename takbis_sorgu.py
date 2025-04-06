import logging
import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException, NoSuchFrameException

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 1.0
TAKBIS_BUTTON_CSS = "button.query-button [title='TAKBİS']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
SONUC_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/"
    "div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div/div/div[2]/div[1]/div/div/div/div"
)
TASINMAZLAR_TABLE_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/"
    "div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div/div/div[2]/div[2]/div/div/div[7]/div/div/div/div/table"
)
HISSE_POPUP_TABLE_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div[*]/div/div/div/div/table"
TAKDIYAT_POPUP_TABLE_XPATH = "/html/body/div[*]/div/div[*]/div/div/div[*]/div/div/div[*]/div/div/div[*]/div/div/div/div/table"
CLOSE_BUTTON_CSS = "[aria-label='Kapat']"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "takbis_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """Save or update extracted_data to takbis_sorgu.json on the desktop."""
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

def click_with_retry(driver, wait, locator, locator_value, action_name, item_text, result_label=None, retries=RETRY_ATTEMPTS, use_js_first=False):
    """Click an element with retry logic, optionally using JS first."""
    for attempt in range(retries):
        try:
            element = wait.until(EC.element_to_be_clickable((locator, locator_value)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            time.sleep(SLEEP_INTERVAL)
            if use_js_first:
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JavaScript for {item_text} (attempt {attempt + 1})")
            else:
                element.click()
                logger.info(f"Clicked {action_name} for {item_text} (attempt {attempt + 1})")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt + 1} failed for {item_text}: {e}")
            try:
                time.sleep(SLEEP_INTERVAL)
                element = driver.find_element(locator, locator_value)
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JavaScript for {item_text} (attempt {attempt + 1})")
                return True
            except Exception as e2:
                logger.warning(f"JavaScript click also failed: {e2}")
            time.sleep(SLEEP_INTERVAL)
    error_msg = f"Failed to click {action_name} for {item_text} after {retries} attempts"
    if result_label:
        result_label.config(text=error_msg)
    logger.error(error_msg)
    return False

def switch_to_frame_if_exists(driver, wait):
    """Check if there are any iframes and switch to the first one if it exists."""
    try:
        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        if iframes:
            driver.switch_to.frame(iframes[0])
            logger.info("Switched to iframe")
        else:
            logger.info("No iframe found, staying in default content")
    except Exception as e:
        logger.warning(f"Failed to switch to iframe: {e}")
    finally:
        return driver

def switch_to_default_content(driver):
    """Switch back to the default content."""
    try:
        driver.switch_to.default_content()
        logger.info("Switched back to default content")
    except Exception as e:
        logger.warning(f"Failed to switch to default content: {e}")

def extract_table_data(driver, wait, table_xpath, column_mappings, item_text):
    """Extract all rows from a table dynamically with retry logic."""
    for attempt in range(RETRY_ATTEMPTS):
        try:
            # Switch to iframe if exists
            driver = switch_to_frame_if_exists(driver, wait)

            table = wait.until(EC.presence_of_element_located((By.XPATH, table_xpath)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", table)
            time.sleep(SLEEP_INTERVAL)
            rows = table.find_elements(By.XPATH, ".//tbody//tr")
            if not rows:
                logger.warning(f"No rows found in table {table_xpath} for {item_text}")
                return []

            data = []
            for row in rows:
                columns = row.find_elements(By.TAG_NAME, "td")
                row_data = {}
                for key, col_idx in column_mappings.items():
                    if col_idx < len(columns):
                        row_data[key] = columns[col_idx].text.strip()
                if any(row_data.values()):  # Skip empty rows
                    data.append(row_data)
            logger.info(f"Extracted {len(data)} rows from table {table_xpath} for {item_text}")
            return data
        except (TimeoutException, StaleElementReferenceException) as e:
            logger.warning(f"Failed to extract table {table_xpath} for {item_text} on attempt {attempt + 1}: {e}")
            time.sleep(SLEEP_INTERVAL)
        finally:
            switch_to_default_content(driver)
    logger.error(f"Failed to extract table {table_xpath} for {item_text} after {RETRY_ATTEMPTS} attempts")
    return []

def close_popup(driver, wait, item_text, popup_name, row_idx, hisse_idx=None):
    """Attempt to close the topmost popup using aria-label='Kapat'."""
    try:
        # Switch to iframe if exists
        driver = switch_to_frame_if_exists(driver, wait)

        # Find all close buttons and target the last one (topmost popup)
        close_buttons = driver.find_elements(By.CSS_SELECTOR, CLOSE_BUTTON_CSS)
        if not close_buttons:
            logger.warning(f"No close buttons found for {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""))
            return False

        # Target the last close button (topmost popup)
        close_button = close_buttons[-1]
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", close_button)
        time.sleep(SLEEP_INTERVAL)
        driver.execute_script("arguments[0].click();", close_button)
        # Verify popup is closed by checking if the close button is no longer visible
        wait.until(EC.staleness_of(close_button))
        logger.info(f"Closed {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""))
        return True
    except TimeoutException:
        logger.warning(f"Timeout while waiting for {popup_name} popup to close for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""))
        return False
    except Exception as e:
        logger.warning(f"Failed to close {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else "") + f": {e}")
        return False
    finally:
        switch_to_default_content(driver)

def perform_takbis_sorgu(driver, item_text, dosya_no, result_label=None):
    """Perform TAKBIS sorgu and extract nested data with dynamic row handling."""
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "TAKBIS": {
                    "sonuc": "",
                    "tasinmazlar": []
                }
            }
        }
    }

    try:
        # Step 1: Click the TAKBIS button
        if result_label:
            result_label.config(text=f"Performing TAKBIS sorgu for {item_text} - Clicking TAKBIS button...")
        if not click_with_retry(driver, wait, By.CSS_SELECTOR, TAKBIS_BUTTON_CSS, "TAKBIS button", item_text, result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing TAKBIS sorgu for {item_text} - Clicking Sorgula button...")
        if not click_with_retry(driver, wait, By.CSS_SELECTOR, SORGULA_BUTTON_CSS, "Sorgula button", item_text, result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Wait for data to load
        wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))

        # Step 3: Extract data
        if result_label:
            result_label.config(text=f"Performing TAKBIS sorgu for {item_text} - Extracting data...")

        # Extract 'sonuc'
        try:
            # Switch to iframe if exists
            driver = switch_to_frame_if_exists(driver, wait)
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = sonuc_element.text.strip()
            logger.info(f"Extracted 'sonuc' for {item_text}: {extracted_data[dosya_no][item_text]['TAKBIS']['sonuc']}")
        except TimeoutException as e:
            logger.error(f"Failed to locate 'sonuc' element for {item_text}: {e}")
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = ""
            save_to_json(extracted_data)
            return False, extracted_data
        finally:
            switch_to_default_content(driver)

        # Extract 'tasinmazlar' table
        tasinmaz_mappings = {
            "no": 0,
            "tapu_mudurlugu": 1,
            "il_ilce": 2,
            "mahalle": 3,
            "vasfi": 4,
            "yuzolcumu": 5,
            "mevki": 6,
            "ada_no": 7,
            "parcel_no": 8,
            "bagimsiz_bolum": 9
        }
        tasinmazlar = extract_table_data(driver, wait, TASINMAZLAR_TABLE_XPATH, tasinmaz_mappings, item_text)
        
        for idx, tasinmaz in enumerate(tasinmazlar, 1):
            # Click button in 11th column for 'hisse_bilgisi'
            hisse_button_xpath = f"{TASINMAZLAR_TABLE_XPATH}/tbody/tr[{idx}]/td[11]/div[1]"
            if click_with_retry(driver, wait, By.XPATH, hisse_button_xpath, f"Hisse button (row {idx})", item_text, result_label):
                time.sleep(SLEEP_INTERVAL)
                hisse_mappings = {
                    "no": 0,
                    "aciklama": 1,
                    "hisse_tipi": 2,
                    "durum": 3
                }
                # Extract hisse_bilgisi initially
                hisse_bilgisi = extract_table_data(driver, wait, HISSE_POPUP_TABLE_XPATH, hisse_mappings, item_text)
                
                # Create a copy to store updated hisse_bilgisi
                updated_hisse_bilgisi = hisse_bilgisi.copy()
                
                # Process each hisse_bilgisi row
                for h_idx in range(len(hisse_bilgisi)):
                    # Click button in 5th column for 'takdiyat_bilgisi'
                    takdiyat_button_xpath = f"{HISSE_POPUP_TABLE_XPATH}/tbody/tr[{h_idx + 1}]/td[5]/div[1]"
                    if click_with_retry(driver, wait, By.XPATH, takdiyat_button_xpath, f"Takdiyat button (row {idx}, hisse {h_idx + 1})", item_text, result_label, use_js_first=True):
                        time.sleep(SLEEP_INTERVAL)
                        takdiyat_mappings = {
                            "no": 0,
                            "tipi": 1,
                            "aciklama": 2
                        }
                        takdiyat_bilgisi = extract_table_data(driver, wait, TAKDIYAT_POPUP_TABLE_XPATH, takdiyat_mappings, item_text)
                        updated_hisse_bilgisi[h_idx]["takdiyat_bilgisi"] = takdiyat_bilgisi

                        # Close second popup (takdiyat)
                        close_popup(driver, wait, item_text, "takdiyat", idx, h_idx + 1)
                        time.sleep(SLEEP_INTERVAL)
                
                tasinmaz["hisse_bilgisi"] = updated_hisse_bilgisi

                # Close first popup (hisse)
                close_popup(driver, wait, item_text, "hisse", idx)
                time.sleep(SLEEP_INTERVAL)
            
            tasinmazlar[idx - 1] = tasinmaz

        extracted_data[dosya_no][item_text]["TAKBIS"]["tasinmazlar"] = tasinmazlar
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")
        time.sleep(3)

        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"TAKBIS sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data