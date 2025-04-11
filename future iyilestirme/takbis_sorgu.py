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
SLEEP_INTERVAL = 0.5
OVERLAY_SELECTOR = None  # Overlay için gerektiğinde güncellenebilir
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "takbis_sorgu.json")

# CSS and XPath Selectors
SELECTORS = {
    "takbis_button": ("CSS_SELECTOR", "button.query-button [title='TAKBİS']"),
    "sorgula_button": ("CSS_SELECTOR", "[aria-label='Sorgula']"),
    "sonuc": ("XPATH", "//div[contains(@class, 'dx-datagrid')]//div[contains(text(), 'Kayıt') or contains(text(), 'bulundu')]"),
    "tasinmazlar_table": ("XPATH", "//div[contains(@class, 'dx-datagrid-rowsview')]//table"),
    "hisse_popup_table": ("XPATH", "//div[contains(@class, 'dx-popup-content')]//table"),
    "takdiyat_popup_table": ("XPATH", "//div[contains(@class, 'dx-popup-content')]//table"),
    "genislet_hisse_button": ("XPATH", "//div[contains(@class, 'dx-datagrid')]//div[contains(@class, 'dx-button')]"),
    "genislet_takdiyat_button": ("XPATH", "//div[contains(@class, 'dx-datagrid')]//div[contains(@class, 'dx-button')]"),
    "close_button": ("CSS_SELECTOR", "[aria-label='Kapat']"),
}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def click_element_merged(driver, by, value, action_name="", item_text="", result_label=None, use_js_first=False):
    """
    Verilen locator (by, value) ile tanımlanan elementin tıklanabilir hale gelmesini bekler,
    sayfada ortalar ve tıklama işlemini gerçekleştirir. Normal click başarısız olursa JS fallback uygular.
    Overlay kontrolü de global OVERLAY_SELECTOR ile yapılır.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    for attempt in range(RETRY_ATTEMPTS):
        try:
            element = wait.until(EC.presence_of_element_located((by, value)))
            element = wait.until(EC.element_to_be_clickable((by, value)))
            element = wait.until(EC.visibility_of_element_located((by, value)))
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)

            if use_js_first:
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JS for {target} (attempt {attempt+1})")
            else:
                element.click()
                logger.info(f"Clicked {action_name} for {target} (attempt {attempt+1})")
            if OVERLAY_SELECTOR:
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)),
                             message="Overlay persists")
                logger.info("Overlay gone.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def save_to_json(extracted_data):
    """Extracted data'yı JSON dosyasına kaydeder veya günceller."""
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    existing_data = {}
    
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error reading JSON file, starting fresh: {e}")

    for dosya_no, items in extracted_data.items():
        if dosya_no not in existing_data:
            existing_data[dosya_no] = {}
        existing_data[dosya_no].update(items)

    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved to {JSON_FILE}")
    except IOError as e:
        logger.error(f"Error writing JSON file: {e}")

def switch_to_frame_if_exists(driver, wait):
    """İlk iframe'e geçiş yapar, yoksa default content'te kalır."""
    try:
        iframe = wait.until(EC.presence_of_element_located((By.TAG_NAME, "iframe")))
        driver.switch_to.frame(iframe)
        logger.info("Switched to iframe")
    except TimeoutException:
        logger.debug("No iframe found")
    return driver

def switch_to_default_content(driver):
    """Default content'e geri döner."""
    driver.switch_to.default_content()
    logger.debug("Switched to default content")
    return driver

def extract_table_data(driver, wait, table_selector, column_mappings, item_text, context=""):
    """Tablodan verileri dinamik olarak çıkarır."""
    try:
        driver = switch_to_frame_if_exists(driver, wait)
        table = wait.until(EC.presence_of_element_located(table_selector))
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", table)
        
        rows = table.find_elements(By.XPATH, ".//tbody//tr")
        if not rows:
            logger.warning(f"No rows found in table {table_selector[1]} for {item_text} {context}")
            return []

        data = []
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            row_data = {key: cols[idx].text.strip() for key, idx in column_mappings.items() if idx < len(cols)}
            if any(row_data.values()):
                data.append(row_data)
        
        logger.info(f"Extracted {len(data)} rows from table {table_selector[1]} for {item_text} {context}")
        return data
    except TimeoutException as e:
        logger.warning(f"Failed to extract table {table_selector[1]} for {item_text} {context}: {e}")
        return []
    finally:
        switch_to_default_content(driver)

def close_popup(driver, wait, item_text, popup_name, row_idx, hisse_idx=None):
    """En üstteki pop-up'ı kapatır."""
    try:
        driver = switch_to_frame_if_exists(driver, wait)
        close_buttons = driver.find_elements(*SELECTORS["close_button"])
        if not close_buttons:
            logger.warning(f"No close button found for {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""))
            return False

        close_button = close_buttons[-1]
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", close_button)
        click_element_merged(driver, *SELECTORS["close_button"], f"Close {popup_name}", f"{item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""), use_js_first=True)
        wait.until(EC.staleness_of(close_button))
        logger.info(f"Closed {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else ""))
        return True
    except TimeoutException as e:
        logger.warning(f"Timeout closing {popup_name} popup for {item_text}, row {row_idx}" + (f", hisse {hisse_idx}" if hisse_idx else "") + f": {e}")
        return False
    finally:
        switch_to_default_content(driver)

def perform_takbis_sorgu(driver, item_text, dosya_no, result_label=None):
    """TAKBIS sorgusu yapar ve verileri çıkarır."""
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {dosya_no: {item_text: {"TAKBIS": {"sonuc": "", "tasinmazlar": []}}}}

    try:
        # Step 1: TAKBIS butonuna tıkla
        if result_label:
            result_label.config(text=f"Clicking TAKBIS for {item_text}...")
        if not click_element_merged(driver, *SELECTORS["takbis_button"], "TAKBIS button", item_text, result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 2: Sorgula butonuna tıkla
        if result_label:
            result_label.config(text=f"Clicking Sorgula for {item_text}...")
        if not click_element_merged(driver, *SELECTORS["sorgula_button"], "Sorgula button", item_text, result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 3: Sonuç verisini çıkar
        if result_label:
            result_label.config(text=f"Extracting data for {item_text}...")
        try:
            driver = switch_to_frame_if_exists(driver, wait)
            sonuc_element = wait.until(EC.presence_of_element_located(SELECTORS["sonuc"]))
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = sonuc_element.text.strip()
            logger.info(f"Extracted 'sonuc' for {item_text}: {extracted_data[dosya_no][item_text]['TAKBIS']['sonuc']}")
        except TimeoutException as e:
            logger.warning(f"Failed to extract 'sonuc' for {item_text}: {e}")
            extracted_data[dosya_no][item_text]["TAKBIS"]["sonuc"] = "Kayıt bulunamadı"
        finally:
            switch_to_default_content(driver)

        # Step 4: Taşınmazlar tablosunu çıkar
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
            "bagimsiz_bolum": 9,
        }
        tasinmazlar = extract_table_data(driver, wait, SELECTORS["tasinmazlar_table"], tasinmaz_mappings, item_text)

        for idx, tasinmaz in enumerate(tasinmazlar, 1):
            # Hisse bilgisi için butona tıkla
            hisse_button_xpath = f"{SELECTORS['tasinmazlar_table'][1]}/tbody/tr[{idx}]/td[11]/div[1]"
            if click_element_merged(driver, By.XPATH, hisse_button_xpath, f"Hisse button (row {idx})", item_text, result_label):
                # Hisse tablosunu genişlet
                click_element_merged(driver, *SELECTORS["genislet_hisse_button"], "Hisse extend button", item_text, result_label)

                # Hisse bilgisi çıkar
                hisse_mappings = {
                    "no": 0,
                    "aciklama": 1,
                    "hisse_tipi": 2,
                    "durum": 3,
                }
                hisse_bilgisi = extract_table_data(driver, wait, SELECTORS["hisse_popup_table"], hisse_mappings, item_text, f"row {idx}")

                for h_idx, hisse in enumerate(hisse_bilgisi, 1):
                    # Takdiyat bilgisi için butona tıkla
                    takdiyat_button_xpath = f"{SELECTORS['hisse_popup_table'][1]}/tbody/tr[{h_idx}]/td[5]/div[1]"
                    if click_element_merged(driver, By.XPATH, takdiyat_button_xpath, f"Takdiyat button (row {idx}, hisse {h_idx})", item_text, result_label, use_js_first=True):
                        # Takdiyat tablosunu genişlet
                        click_element_merged(driver, *SELECTORS["genislet_takdiyat_button"], "Takdiyat extend button", item_text, result_label)

                        # Takdiyat bilgisi çıkar
                        takdiyat_mappings = {
                            "no": 0,
                            "tipi": 1,
                            "aciklama": 2,
                        }
                        takdiyat_bilgisi = extract_table_data(driver, wait, SELECTORS["takdiyat_popup_table"], takdiyat_mappings, item_text, f"row {idx}, hisse {h_idx}")
                        hisse["takdiyat_bilgisi"] = takdiyat_bilgisi

                        # Takdiyat pop-up'ını kapat
                        close_popup(driver, wait, item_text, "takdiyat", idx, h_idx)

                tasinmaz["hisse_bilgisi"] = hisse_bilgisi
                close_popup(driver, wait, item_text, "hisse", idx)

            extracted_data[dosya_no][item_text]["TAKBIS"]["tasinmazlar"] = tasinmazlar

        save_to_json(extracted_data)
        if result_label:
            result_label.config(text=f"TAKBIS sorgu completed for {item_text}")
        return True, extracted_data

    except Exception as e:
        logger.error(f"TAKBIS sorgu error for {item_text}: {e}")
        if result_label:
            result_label.config(text=f"Error: {e}")
        save_to_json(extracted_data)
        return False, extracted_data