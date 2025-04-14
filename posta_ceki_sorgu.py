import logging
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
    ElementClickInterceptedException
)

# Global Sabitler
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5

POSTA_CEKI_BUTTON_CSS = "button.query-button [title='Posta Çeki']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
SONUC_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div[2]/div/div/div/div/div/div[2]"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "posta_ceki_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """
    Save or update extracted_data to posta_ceki_sorgu.json on the desktop.
    - Eğer dosya yoksa oluşturur.
    - Dosya varsa aynı dosya_no ve item_text'e sahip verileri güncelleyerek, yeni verileri ekler.
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
    Verilen locator (by, value) ile tanımlanan elementin tıklanabilir hale gelmesini bekler,
    sayfada ortalar ve tıklama işlemini gerçekleştirir.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    # Define multiple overlay selectors to catch variations
    overlay_selectors = [
        ".dx-loadindicator-wrapper dx-loadindicator-image",
        ".dx-loadpanel-content-wrapper",
        ".dx-loadpanel-indicator dx-loadindicator dx-widget",
        ".dx-overlay-wrapper dx-loadpanel-wrapper custom-loader dx-overlay-shader"
    ]
    for attempt in range(RETRY_ATTEMPTS):
        try:
            # Check all overlay selectors
            for overlay_sel in overlay_selectors:
                try:
                    wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, overlay_sel)), "Overlay persists")
                except TimeoutException:
                    logger.warning(f"Overlay {overlay_sel} still present, continuing.")

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

            # Check overlays again post-click
            for overlay_sel in overlay_selectors:
                try:
                    wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, overlay_sel)), "Overlay persists")
                except TimeoutException:
                    logger.warning(f"Post-click overlay {overlay_sel} still present.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def perform_posta_ceki_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için Posta Çeki sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. Posta Çeki butonuna tıklar.
      2. "Sorgula" butonuna tıklar.
      3. Belirtilen XPath'ten 'sonuc' verisini çıkarır.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "Posta Çeki": {
                    "sonuc": ""
                }
            }
        }
    }

    try:
        time.sleep(SLEEP_INTERVAL) # Küçük bir bekleme süresi ekleyelim
        # Adım 1: Posta Çeki butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Posta Çeki sorgu for {item_text} - Clicking Posta Çeki button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, POSTA_CEKI_BUTTON_CSS,
                                   action_name="Posta Çeki button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 2: "Sorgula" butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Posta Çeki sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 3: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing Posta Çeki sorgu for {item_text} - Extracting data...")

        # Extract 'sonuc'
        try:
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            wait.until(EC.visibility_of_element_located((By.XPATH, SONUC_XPATH)))
            raw_sonuc = sonuc_element.text.strip()
            extracted_data[dosya_no][item_text]["Posta Çeki"]["sonuc"] = raw_sonuc
        except TimeoutException as e:
            error_msg = f"Failed to locate 'sonuc' element for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["Posta Çeki"]["sonuc"] = ""

        if result_label:
            result_label.config(text=f"Posta Çeki sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"Posta Çeki sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data