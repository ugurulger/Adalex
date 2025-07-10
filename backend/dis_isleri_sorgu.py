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
from sorgulama_common import handle_popup_if_present, click_element_merged, save_to_json, get_logger, check_result_or_popup
from database_helper import save_scraping_data_to_db_and_json

# Global Sabitler
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5

DIS_ISLERI_BUTTON_CSS = "button.query-button [title='Dış İşleri']"
SORGULA_BUTTON_CSS = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.ms-auto"
SONUC_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[2]/div[2]/div/div/div"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json")

def perform_dis_isleri_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için Dış İşleri sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. Dış İşleri butonuna tıklar.
      2. "Sorgula" butonuna tıklar.
      3. Belirtilen XPath'ten 'sonuc' verisini veya pop-up'ı kontrol eder.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
    """
    logger = get_logger()
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "Dış İşleri": {
                    "sonuc": ""
                }
            }
        }
    }

    try:
        time.sleep(SLEEP_INTERVAL)  # Küçük bir bekleme süresi ekleyelim
        # Adım 1: Dış İşleri butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Dış İşleri sorgu for {item_text} - Clicking Dış İşleri button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, DIS_ISLERI_BUTTON_CSS,
                                   action_name="Dış İşleri button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json"))
            return False, extracted_data

        # Adım 2: "Sorgula" butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Dış İşleri sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json"))
            return False, extracted_data

        # Adım 3: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing Dış İşleri sorgu for {item_text} - Extracting data...")

        # Pop-up ve SONUC_XPATH için paralel bekleme
        try:
            result = wait.until(lambda d: check_result_or_popup(d, (By.XPATH, SONUC_XPATH), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["Dış İşleri"]["sonuc"] = result
                save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json"))
                return False, extracted_data
            else:  # SONUC_XPATH elementi
                sonuc_element = result
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
                wait.until(EC.visibility_of_element_located((By.XPATH, SONUC_XPATH)))
                raw_sonuc = sonuc_element.text.strip()
                extracted_data[dosya_no][item_text]["Dış İşleri"]["sonuc"] = raw_sonuc
                logger.info(f"Extracted raw 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException:
            error_msg = f"Neither 'sonuc' element nor popup found for {item_text}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["Dış İşleri"]["sonuc"] = ""
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json"))
            return False, extracted_data

        if result_label:
            result_label.config(text=f"Dış İşleri sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json"))
        return True, extracted_data

    except Exception as e:
        error_msg = f"Dış İşleri sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "dis_isleri_sorgu.json"))
        return False, extracted_data