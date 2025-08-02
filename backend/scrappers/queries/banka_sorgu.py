import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    StaleElementReferenceException,
    ElementNotInteractableException,
    ElementClickInterceptedException,
    NoSuchElementException
)
from ..sorgulama_common import handle_popup_if_present, click_element_merged, save_to_json, get_logger, check_result_or_popup
from ...services.database_helper import save_scraping_data_to_db_and_json

# Global Sabitler
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5

BANKA_BUTTON_CSS = "button.query-button [title='Banka']"
SORGULA_BUTTON_CSS = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.ms-auto"
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

def perform_banka_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için Banka sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. Banka butonuna tıklar.
      2. "Sorgula" butonuna tıklar.
      3. 'sonuc' ve 'bankalar' XPath’lerinden verileri çıkarır.
         - Pop-up ve SONUC_XPATH için paralel bekleme yapılır.
         - 'bankalar' için önce expand butonuna tıklanır.
         - Çıkarılan veriler banka_sorgu.json dosyasına kaydedilir.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
    """
    logger = get_logger()
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
        time.sleep(SLEEP_INTERVAL)  # Küçük bir bekleme süresi ekleyelim
        # Adım 1: Banka butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Clicking Banka button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, BANKA_BUTTON_CSS,
                                   action_name="Banka button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
            return False, extracted_data

        # Adım 2: "Sorgula" butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
            return False, extracted_data

        # Adım 3: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Extracting data...")

        # Pop-up ve SONUC_XPATH için paralel bekleme
        try:
            result = wait.until(lambda d: check_result_or_popup(d, (By.XPATH, SONUC_XPATH), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = result
                save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
                return False, extracted_data
            else:  # SONUC_XPATH elementi
                sonuc_element = result
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
                raw_sonuc = sonuc_element.text.strip()
                extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = raw_sonuc
                logger.info(f"Extracted raw 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException:
            error_msg = f"Neither 'sonuc' element nor popup found for {item_text}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = ""
            save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
            return False, extracted_data

        # Bankalar tablosunu genişletme ve veri çıkarma
        try:
            if result_label:
                result_label.config(text=f"Expanding bankalar table for {item_text}...")
            if not click_element_merged(driver, By.XPATH, GENISLET_BUTTON_XPATH,
                                       action_name="Expand button", item_text=item_text, result_label=result_label):
                logger.warning(f"Failed to expand table for {item_text}, proceeding without expansion")
            else:
                time.sleep(SLEEP_INTERVAL)

            bankalar_table = wait.until(EC.presence_of_element_located((By.XPATH, BANKALAR_TABLE_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", bankalar_table)
            rows = bankalar_table.find_elements(By.XPATH, ".//tbody//tr")
            if not rows:
                logger.warning(f"No rows found in 'bankalar' table for {item_text}")
            else:
                for row in rows:
                    columns = row.find_elements(By.TAG_NAME, "td")
                    if len(columns) >= 2:
                        banka = {
                            "no": columns[0].text.strip(),
                            "kurum": columns[1].text.strip()
                        }
                        if banka["no"] and banka["kurum"]:
                            extracted_data[dosya_no][item_text]["Banka"]["bankalar"].append(banka)
                    else:
                        logger.warning(f"Row with insufficient columns in 'bankalar' table for {item_text}: {row.text}")

                if not extracted_data[dosya_no][item_text]["Banka"]["bankalar"]:
                    logger.info(f"No valid banka data extracted for {item_text}")
        except TimeoutException as e:
            logger.warning(f"Failed to locate 'bankalar' table for {item_text}: {e}")
        except Exception as e:
            logger.warning(f"Error extracting 'bankalar' table for {item_text}: {e}")

        if result_label:
            result_label.config(text=f"Banka sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        # Save to both database and JSON file (backup)
        save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
        return True, extracted_data

    except Exception as e:
        error_msg = f"Banka sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
        return False, extracted_data