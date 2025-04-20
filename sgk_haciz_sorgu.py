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

# Global Sabitler
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5

SGK_HACIZ_BUTTON_CSS = "button.query-button [title='SGK Haciz']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
EXPAND_BUTTON_XPATH = "//*[@id='adaletDataGridContainer']/div/div[11]/div[1]/div[4]"
SONUC_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[4]/div[2]/div/div/div"
SGK_KAYIT_TABLE_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div[*]/div[*]/div/div/div/div[*]/div/div/div/div/table"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_haciz_sorgu.json")

def perform_sgk_haciz_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için SGK Haciz sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. SGK Haciz butonuna tıklar.
      2. "Sorgula" butonuna tıklar.
      3. Tabloyu genişletmek için expand butonuna tıklar.
      4. 'sonuc' ve 'SGK kayit' tablosundan verileri çıkarır.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
    """
    logger = get_logger()
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "SGK Haciz": {
                    "sonuc": "",
                    "SGK kayit": []
                }
            }
        }
    }

    try:
        time.sleep(SLEEP_INTERVAL)  # Küçük bir bekleme süresi ekleyelim
        # Adım 1: SGK Haciz butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing SGK Haciz sorgu for {item_text} - Clicking SGK Haciz button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SGK_HACIZ_BUTTON_CSS,
                                   action_name="SGK Haciz button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 2: "Sorgula" butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing SGK Haciz sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 3: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing SGK Haciz sorgu for {item_text} - Extracting data...")

        # Pop-up ve SONUC_XPATH için paralel bekleme
        try:
            result = wait.until(lambda d: check_result_or_popup(d, (By.XPATH, SONUC_XPATH), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["SGK Haciz"]["sonuc"] = result
                save_to_json(extracted_data)
                return False, extracted_data
            else:  # SONUC_XPATH elementi
                sonuc_element = result
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
                wait.until(EC.visibility_of_element_located((By.XPATH, SONUC_XPATH)))
                raw_sonuc = sonuc_element.text.strip()
                extracted_data[dosya_no][item_text]["SGK Haciz"]["sonuc"] = raw_sonuc
                logger.info(f"Extracted raw 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException:
            error_msg = f"Neither 'sonuc' element nor popup found for {item_text}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["SGK Haciz"]["sonuc"] = ""

        # Adım 4: Expand butonuna tıkla - Tabloyu genişlet
        if result_label:
            result_label.config(text=f"Expanding SGK kayit table for {item_text}...")
        if not click_element_merged(driver, By.XPATH, EXPAND_BUTTON_XPATH,
                                   action_name="Expand button", item_text=item_text, result_label=result_label):
            logger.warning(f"Failed to expand table for {item_text}, proceeding without expansion")
        else:
            time.sleep(SLEEP_INTERVAL)  # Küçük bir bekleme süresi ekleyelim

        # Adım 5: Extract 'SGK kayit' table
        try:
            kayit_table = wait.until(EC.presence_of_element_located((By.XPATH, SGK_KAYIT_TABLE_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", kayit_table)
            wait.until(EC.visibility_of_element_located((By.XPATH, SGK_KAYIT_TABLE_XPATH)))
            tbody_elements = kayit_table.find_elements(By.XPATH, ".//tbody[position() >= 2]")
            if not tbody_elements:
                logger.warning(f"No tbody elements found in 'SGK kayit' table for {item_text}")
            else:
                for tbody_index, tbody in enumerate(tbody_elements, start=2):
                    rows = tbody.find_elements(By.XPATH, ".//tr")
                    if not rows:
                        continue
                    for row in rows:
                        columns = row.find_elements(By.TAG_NAME, "td")
                        kayit_entry = {
                            "no": columns[0].text.strip() if len(columns) > 0 else "",
                            "kurum": columns[1].text.strip() if len(columns) > 1 else "",
                            "islem": columns[2].text.strip() if len(columns) > 2 else ""
                        }
                        if kayit_entry["no"] or kayit_entry["kurum"] or kayit_entry["islem"]:  # Skip empty rows
                            extracted_data[dosya_no][item_text]["SGK Haciz"]["SGK kayit"].append(kayit_entry)
                if not extracted_data[dosya_no][item_text]["SGK Haciz"]["SGK kayit"]:
                    logger.info(f"No valid SGK kayit data extracted for {item_text}")
        except TimeoutException as e:
            error_msg = f"Failed to locate 'SGK kayit' table for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["SGK Haciz"]["SGK kayit"] = []

        if result_label:
            result_label.config(text=f"SGK Haciz sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"SGK Haciz sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data