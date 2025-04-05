import logging
import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 1.0  # Increased for stability
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
CLOSE_BUTTON_CSS = ".dx-closebutton"

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

def extract_table_data(driver, wait, table_xpath, column_mappings, item_text, row_idx=None):
    """Generic function to extract data from a table."""
    try:
        table = wait.until(EC.presence_of_element_located((By.XPATH, table_xpath)))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", table)
        time.sleep(SLEEP_INTERVAL)  # Extra wait for table load
        rows = table.find_elements(By.XPATH, ".//tbody//tr")
        if not rows:
            logger.warning(f"No rows found in table {table_xpath} for {item_text}")
            return []

        data = []
        for idx, row in enumerate(rows):
            if row_idx is not None and idx != row_idx - 1:
                continue
            columns = row.find_elements(By.TAG_NAME, "td")
            row_data = {}
            for key, xpath in column_mappings.items():
                col_idx = int(xpath.split('td[')[-1].split(']')[0]) - 1
                if col_idx < len(columns):
                    row_data[key] = columns[col_idx].text.strip()
            if any(row_data.values()):  # Skip empty rows
                data.append(row_data)
        return data
    except TimeoutException as e:
        logger.warning(f"Failed to locate table {table_xpath} for {item_text}: {e}")
        return []

def close_popup(driver, wait, item_text, popup_name, row_idx, hisse_idx=None):
    """Attempt to close a popup with retry logic."""
    try:
        close_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CLOSE_BUTTON_CSS)))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", close_button)
        time.sleep(SLEEP_INTERVAL)
        driver.execute_script("arguments[0].click();", close_button)
        logger.info(f"Closed {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""))
        return True
    except Exception as e:
        logger.warning(f"Failed to close {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else "") + f": {e}")
        return False

def perform_takbis_sorgu(driver, item_text, dosya_no, result_label=None):
    """Perform TAKBIS sorgu and extract nested data with popup handling."""
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
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = sonuc_element.text.strip()
            logger.info(f"Extracted 'sonuc' for {item_text}: {extracted_data[dosya_no][item_text]['TAKBIS']['sonuc']}")
        except TimeoutException as e:
            logger.error(f"Failed to locate 'sonuc' element for {item_text}: {e}")
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = ""
            save_to_json(extracted_data)
            return False, extracted_data

        # Extract 'tasinmazlar' table
        tasinmaz_mappings = {
            "no": "table/tbody/tr[1]/td[1]",
            "tapu_mudurlugu": "table/tbody/tr[1]/td[2]",
            "il_ilce": "table/tbody/tr[1]/td[3]",
            "mahalle": "table/tbody/tr[1]/td[4]",
            "vasfi": "table/tbody/tr[1]/td[5]",
            "yuzolcumu": "table/tbody/tr[1]/td[6]",
            "mevki": "table/tbody/tr[1]/td[7]",
            "ada_no": "table/tbody/tr[1]/td[8]",
            "parcel_no": "table/tbody/tr[1]/td[9]",
            "bagimsiz_bolum": "table/tbody/tr[1]/td[10]"
        }
        tasinmazlar = extract_table_data(driver, wait, TASINMAZLAR_TABLE_XPATH, tasinmaz_mappings, item_text)
        
        for idx, tasinmaz in enumerate(tasinmazlar, 1):
            # Click button in 11th column for 'hisse_bilgisi'
            hisse_button_xpath = f"{TASINMAZLAR_TABLE_XPATH}/tbody/tr[{idx}]/td[11]/div[1]"
            if click_with_retry(driver, wait, By.XPATH, hisse_button_xpath, f"Hisse button (row {idx})", item_text, result_label):
                time.sleep(SLEEP_INTERVAL)
                hisse_mappings = {
                    "no": "table/tbody/tr[1]/td[1]",
                    "aciklama": "table/tbody/tr[1]/td[2]",
                    "hisse_tipi": "table/tbody/tr[1]/td[3]",
                    "durum": "table/tbody/tr[1]/td[4]"
                }
                hisse_bilgisi = extract_table_data(driver, wait, HISSE_POPUP_TABLE_XPATH, hisse_mappings, item_text)
                
                for h_idx, hisse in enumerate(hisse_bilgisi, 1):
                    # Click button in 5th column for 'takdiyat_bilgisi'
                    takdiyat_button_xpath = f"{HISSE_POPUP_TABLE_XPATH}/tbody/tr[{h_idx}]/td[5]/div[1]"
                    if click_with_retry(driver, wait, By.XPATH, takdiyat_button_xpath, f"Takdiyat button (row {idx}, hisse {h_idx})", item_text, result_label, use_js_first=True):
                        time.sleep(SLEEP_INTERVAL)
                        takdiyat_mappings = {
                            "no": "table/tbody/tr[1]/td[1]",
                            "tipi": "table/tbody/tr[1]/td[2]",
                            "aciklama": "table/tbody/tr[1]/td[3]"
                        }
                        takdiyat_bilgisi = extract_table_data(driver, wait, TAKDIYAT_POPUP_TABLE_XPATH, takdiyat_mappings, item_text)
                        hisse["takdiyat_bilgisi"] = takdiyat_bilgisi

                        # Close second popup (takdiyat)
                        close_popup(driver, wait, item_text, "takdiyat", idx, h_idx)
                        time.sleep(SLEEP_INTERVAL)
                    hisse_bilgisi[h_idx - 1] = hisse
                
                tasinmaz["hisse_bilgisi"] = hisse_bilgisi

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