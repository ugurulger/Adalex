import logging
import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementNotInteractableException

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5
BANKA_BUTTON_CSS = "button.query-button [title='Banka']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
SONUC_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/"
    "div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div[2]/div[1]"
)
BANKALAR_TABLE_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/"
    "div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div[2]/div[2]/div/div[7]/div/div/div/div/table"
)
GENISLET_BUTTON_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/"
    "div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div[2]/div[2]/div/div[11]/div[1]/div[4]"
)

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "banka_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """
    Save or update extracted_data to banka_sorgu.json on the desktop.
    - If file doesn't exist, create it.
    - If file exists, update it by merging new data, replacing entries with same dosya_no and item_text.
    """
    # Ensure the directory exists
    os.makedirs(DESKTOP_PATH, exist_ok=True)

    # If file exists, load existing data
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error reading existing JSON file, starting fresh: {e}")
            existing_data = {}
    else:
        existing_data = {}

    # Extract dosya_no and item_text from extracted_data
    for dosya_no, items in extracted_data.items():
        if dosya_no not in existing_data:
            existing_data[dosya_no] = {}
        # Update only the specific item_text under this dosya_no
        existing_data[dosya_no].update(items)

    # Save back to JSON file
    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved/updated in {JSON_FILE}")
    except IOError as e:
        logger.error(f"Error writing to JSON file: {e}")

def click_with_retry(driver, wait, locator, locator_value, action_name, item_text, result_label=None, retries=RETRY_ATTEMPTS):
    for attempt in range(retries):
        try:
            element = wait.until(EC.element_to_be_clickable((locator, locator_value)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            time.sleep(SLEEP_INTERVAL)  # Allow time for rendering
            element.click()
            logger.info(f"Clicked {action_name} for {item_text} (attempt {attempt + 1})")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException) as e:
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

def perform_banka_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Perform the Banka sorgu for a specific dropdown item and extract data.
    Steps:
        1. Click the Banka button.
        2. Click the "Sorgula" button.
        3. Extract data from the specified XPath for 'sonuc' and 'bankalar'.
           - Before extracting 'bankalar', click the expand button to widen the table.
           - Save the extracted data to banka_sorgu.json.
    Returns:
        Tuple (success: bool, data: dict) - Success status and extracted data as a structured dictionary.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "Banka": {
                    "sonuc": "",
                    "bankalar": []
                }
            }
        }
    }

    try:
        # Step 1: Click the Banka button
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Clicking Banka button...")
        if not click_with_retry(driver, wait, By.CSS_SELECTOR, BANKA_BUTTON_CSS, "Banka button", item_text, result_label):
            save_to_json(extracted_data)  # Hata olsa bile veriyi kaydet
            return False, extracted_data

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Clicking Sorgula button...")
        if not click_with_retry(driver, wait, By.CSS_SELECTOR, SORGULA_BUTTON_CSS, "Sorgula button", item_text, result_label):
            save_to_json(extracted_data)  # Hata olsa bile veriyi kaydet
            return False, extracted_data

        # Wait dynamically for the data to load
        wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))

        # Step 3: Extract data
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Extracting data...")

        # Extract 'sonuc' (raw text only)
        try:
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            raw_sonuc = sonuc_element.text.strip()
            extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = raw_sonuc
            logger.info(f"Extracted raw 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException as e:
            error_msg = f"Failed to locate 'sonuc' element for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = ""  # Hata durumunda boş bırak
            save_to_json(extracted_data)  # Hata olsa bile veriyi kaydet
            return False, extracted_data

        # Extract 'bankalar' from the table
        try:
            # Click the expand button before extracting the table
            if result_label:
                result_label.config(text=f"Expanding bankalar table for {item_text}...")
            if not click_with_retry(driver, wait, By.XPATH, GENISLET_BUTTON_XPATH, "Expand button", item_text, result_label):
                logger.warning(f"Failed to expand table for {item_text}, proceeding without expansion")
            else:
                time.sleep(1)  # Give time for the table to expand

            bankalar_table = wait.until(EC.presence_of_element_located((By.XPATH, BANKALAR_TABLE_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", bankalar_table)
            rows = bankalar_table.find_elements(By.XPATH, ".//tbody//tr")
            if not rows:
                logger.warning(f"No rows found in 'bankalar' table for {item_text}")
            else:
                for row in rows:
                    columns = row.find_elements(By.TAG_NAME, "td")
                    if len(columns) >= 2:  # En az 2 sütun olmalı (no ve kurum)
                        banka = {
                            "no": columns[0].text.strip(),
                            "kurum": columns[1].text.strip()
                        }
                        # Boş satırları filtrele
                        if banka["no"] and banka["kurum"]:
                            extracted_data[dosya_no][item_text]["Banka"]["bankalar"].append(banka)
                            logger.info(f"Extracted banka: {banka} for {item_text}")
                    else:
                        logger.warning(f"Row with insufficient columns found in 'bankalar' table for {item_text}: {row.text}")

                if not extracted_data[dosya_no][item_text]["Banka"]["bankalar"]:
                    logger.info(f"No valid banka data extracted for {item_text}")
        except TimeoutException as e:
            logger.warning(f"Failed to locate 'bankalar' table for {item_text}: {e}")
        except Exception as e:
            logger.warning(f"Error extracting 'bankalar' table for {item_text}: {e}")

        if result_label:
            result_label.config(text=f"Banka sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")
        time.sleep(3)  # EGM'deki gibi 3 saniye bekleme

        # Save to JSON file
        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"Banka sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)  # Hata olsa bile veriyi kaydet
        return False, extracted_data