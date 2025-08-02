import time
import os
import json
import sys

# Add backend directory to Python path for imports
backend_dir = os.path.join(os.path.dirname(__file__), '..', '..')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    StaleElementReferenceException,
    ElementNotInteractableException,
    ElementClickInterceptedException,
    NoSuchElementException,
    NoSuchFrameException
)
from scrappers.queries.sorgulama_common import handle_popup_if_present, click_element_merged, save_to_json, get_logger, check_result_or_popup
from services.database_writer import save_scraping_data_to_db_and_json

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5
SLEEP_INTERVAL_TINY = 0.2
TAKBIS_BUTTON_CSS = "button.query-button [title='TAKBİS']"
SORGULA_BUTTON_CSS = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.ms-auto"
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
GENISLET_HISSE_BUTTON_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div[11]/div[1]/div[4]"
GENISLET_TAKDIYAT_BUTTON_XPATH = "/html/body/div[*]/div/div[*]/div/div/div[*]/div/div/div[*]/div/div/div[11]/div[1]/div[4]"
CLOSE_BUTTON_CSS = "[aria-label='Kapat']"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "takbis_sorgu.json")


def extract_table_data(driver, wait, table_xpath, column_mappings, item_text):
    """Extract all rows from a table dynamically with retry logic."""
    logger = get_logger()
    for attempt in range(RETRY_ATTEMPTS):
        try:
            
            time.sleep(SLEEP_INTERVAL_TINY) #tiny delay to allow for any potential loading
            table = wait.until(EC.visibility_of_element_located((By.XPATH, table_xpath)))
            wait.until(lambda driver: table.find_elements(By.XPATH, ".//tbody//tr"))

            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", table)
            
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

    logger.error(f"Failed to extract table {table_xpath} for {item_text} after {RETRY_ATTEMPTS} attempts")
    return []

def close_popup(driver, wait, item_text, popup_name, row_idx, hisse_idx=None):
    """Attempt to close the topmost popup using aria-label='Kapat'."""
    logger = get_logger()
    try:

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

def perform_takbis_sorgu(driver, item_text, dosya_no, result_label=None):
    """Perform TAKBIS sorgu and extract nested data with dynamic row handling."""
    logger = get_logger()
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
        if not click_element_merged(driver, By.CSS_SELECTOR, TAKBIS_BUTTON_CSS,
                                   action_name="TAKBIS button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "takbis_sorgu.json"))
            return False, extracted_data

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing TAKBIS sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label, use_js_first=True):
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "takbis_sorgu.json"))
            return False, extracted_data

        # Step 3: Extract data
        if result_label:
            result_label.config(text=f"Performing TAKBIS sorgu for {item_text} - Extracting data...")

        # Pop-up ve SONUC_XPATH için paralel bekleme
        try:
            result = wait.until(lambda d: check_result_or_popup(d, (By.XPATH, SONUC_XPATH), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = result
                save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "takbis_sorgu.json"))
                return False, extracted_data
            else:  # SONUC_XPATH elementi
                sonuc_element = result
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
                wait.until(EC.visibility_of_element_located((By.XPATH, SONUC_XPATH)))
                raw_sonuc = sonuc_element.text.strip()
                extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = raw_sonuc
                logger.info(f"Extracted 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException as e:
            error_msg = f"Neither 'sonuc' element nor popup found for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = ""
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "takbis_sorgu.json"))
            return False, extracted_data

        # Initialize tasinmazlar
        tasinmazlar = []
        # Check if 'yok' is in the sonuc (case-insensitive)
        if 'yok' not in raw_sonuc.lower():
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
                if click_element_merged(driver, By.XPATH, hisse_button_xpath,
                                       action_name=f"Hisse button (row {idx})", item_text=item_text, result_label=result_label, use_js_first=True):
                    time.sleep(SLEEP_INTERVAL_TINY) #tiny delay to allow for any potential loading
                    
                    hisse_mappings = {
                        "no": 0,
                        "aciklama": 1,
                        "hisse_tipi": 2,
                        "durum": 3
                    }
                    
                    # Hisse tablosunu her popup açıldığında genişlet
                    if click_element_merged(driver, By.XPATH, GENISLET_HISSE_BUTTON_XPATH,
                                           action_name="Hisse table extend button", item_text=item_text, result_label=result_label):
                        logger.info(f"Extended hisse_bilgisi table for {item_text}, row {idx}")
                    else:
                        logger.warning(f"Failed to extend hisse_bilgisi table for {item_text}, row {idx}")
                    
                    # Extract hisse_bilgisi
                    hisse_bilgisi = extract_table_data(driver, wait, HISSE_POPUP_TABLE_XPATH, hisse_mappings, item_text)
                    
                    # Create a copy to store updated hisse_bilgisi
                    updated_hisse_bilgisi = hisse_bilgisi.copy()
                    
                    # Process each hisse_bilgisi row
                    for h_idx in range(len(hisse_bilgisi)):
                        # Click button in 5th column for 'takdiyat_bilgisi'
                        takdiyat_button_xpath = f"{HISSE_POPUP_TABLE_XPATH}/tbody/tr[{h_idx + 1}]/td[5]/div[1]"
                        if click_element_merged(driver, By.XPATH, takdiyat_button_xpath,
                                               action_name=f"Takdiyat button (row {idx}, hisse {h_idx + 1})", item_text=item_text,
                                               result_label=result_label, use_js_first=True):
                            time.sleep(SLEEP_INTERVAL_TINY) #tiny delay to allow for any potential loading
                            takdiyat_mappings = {
                                "no": 0,
                                "tipi": 1,
                                "aciklama": 2
                            }
                            
                            # Takdiyat tablosunu her popup açıldığında genişlet
                            if click_element_merged(driver, By.XPATH, GENISLET_TAKDIYAT_BUTTON_XPATH,
                                                   action_name="Takdiyat table extend button", item_text=item_text,
                                                   result_label=result_label):
                                logger.info(f"Extended takdiyat_bilgisi table for {item_text}, row {idx}, hisse {h_idx + 1}")
                            else:
                                logger.warning(f"Failed to extend takdiyat_bilgisi table for {item_text}, row {idx}, hisse {h_idx + 1}")
                            
                            # Extract takdiyat_bilgisi
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

        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "takbis_sorgu.json"))
        return True, extracted_data

    except Exception as e:
        error_msg = f"TAKBIS sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "takbis_sorgu.json"))
        return False, extracted_data