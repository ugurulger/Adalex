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

MERNIS_BUTTON_CSS = "button.query-button [title='MERNİS']"
SORGULA_BUTTON_CSS = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.ms-auto"
MERNIS_KIMLIK_TABLE_ID = "mernisKimlik"
MERNIS_ADRES_TABLE_ID = "mernisAdres"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "mernis_sorgu.json")

def parse_mernis_table(table_element):
    """
    Tabloyu ayrıştırır:
    - Başlık yoktur (fw-bold text-center hücreleri dikkate alınmaz).
    - fw-bold sınıfına sahip hücreyi label, hemen sonraki hücreyi value kabul eder.
    """
    result_dict = {}
    rows = table_element.find_elements(By.TAG_NAME, "tr")

    for row in rows:
        tds = row.find_elements(By.TAG_NAME, "td")
        i = 0
        while i < len(tds):
            label_cell = tds[i]
            label_class = label_cell.get_attribute("class") or ""
            label_text = label_cell.text.strip()
            if "fw-bold" in label_class:
                if i + 1 < len(tds):
                    value_text = tds[i + 1].text.strip()
                else:
                    value_text = ""
                if label_text:  # Boş label'ları eklememek için
                    result_dict[label_text] = value_text
                i += 2
            else:
                i += 1

    return result_dict if result_dict else {}

def extract_mernis_data(driver, item_text, result_label=None):
    """
    #mernisKimlik ve #mernisAdres tablolarından veriyi çeker ve yapılandırır.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    sonuc = {}

    # Kimlik Bilgileri tablosu (zaten check_result_or_popup ile kontrol edildi)
    try:
        kimlik_table = wait.until(EC.presence_of_element_located((By.ID, MERNIS_KIMLIK_TABLE_ID)))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", kimlik_table)
        wait.until(EC.visibility_of_element_located((By.ID, MERNIS_KIMLIK_TABLE_ID)))
        kimlik_data = parse_mernis_table(kimlik_table)
        sonuc["Kimlik Bilgileri"] = kimlik_data if kimlik_data else "Tablo boş"
    except TimeoutException as e:
        error_msg = f"Failed to locate #mernisKimlik table for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        sonuc["Kimlik Bilgileri"] = "Tablo bulunamadı"

    # Adres Bilgileri tablosu
    try:
        adres_table = wait.until(EC.presence_of_element_located((By.ID, MERNIS_ADRES_TABLE_ID)))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", adres_table)
        wait.until(EC.visibility_of_element_located((By.ID, MERNIS_ADRES_TABLE_ID)))
        adres_data = parse_mernis_table(adres_table)
        sonuc["Adres Bilgileri"] = adres_data if adres_data else "Tablo boş"
    except TimeoutException as e:
        error_msg = f"Failed to locate #mernisAdres table for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        sonuc["Adres Bilgileri"] = "Tablo bulunamadı"

    return sonuc

def perform_mernis_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için MERNİS sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. MERNİS butonuna tıklar.
      2. "Sorgula" butonuna tıklar.
      3. #mernisKimlik ve #mernisAdres tablolarından verileri çıkarır ve yapılandırır.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
    """
    logger = get_logger()
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "MERNİS": {
                    "sonuc": {}
                }
            }
        }
    }

    try:
        time.sleep(SLEEP_INTERVAL)  # Küçük bir bekleme süresi ekleyelim
        # Adım 1: MERNİS butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing MERNİS sorgu for {item_text} - Clicking MERNİS button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, MERNIS_BUTTON_CSS,
                                   action_name="MERNİS button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "mernis_sorgu.json"))
            return False, extracted_data

        # Adım 2: "Sorgula" butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing MERNİS sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "mernis_sorgu.json"))
            return False, extracted_data

        # Adım 3: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing MERNİS sorgu for {item_text} - Extracting data...")

        # Pop-up ve MERNIS_KIMLIK_TABLE_ID için paralel bekleme
        try:
            result = wait.until(lambda d: check_result_or_popup(d, (By.ID, MERNIS_KIMLIK_TABLE_ID), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["MERNİS"]["sonuc"] = {"Hata": result}
                save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "mernis_sorgu.json"))
                return False, extracted_data
            else:  # MERNIS_KIMLIK_TABLE_ID elementi
                # extract_mernis_data ile hem kimlik hem adres bilgilerini çıkar
                extracted_data[dosya_no][item_text]["MERNİS"]["sonuc"] = extract_mernis_data(driver, item_text, result_label)
        except TimeoutException:
            error_msg = f"Neither 'mernisKimlik' table nor popup found for {item_text}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["MERNİS"]["sonuc"] = {"Hata": "Tablo veya pop-up bulunamadı"}
            save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "mernis_sorgu.json"))
            return False, extracted_data

        if result_label:
            result_label.config(text=f"MERNİS sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "mernis_sorgu.json"))
        return True, extracted_data

    except Exception as e:
        error_msg = f"MERNİS sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "mernis_sorgu.json"))
        return False, extracted_data