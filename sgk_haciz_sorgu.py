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

SGK_HACIZ_BUTTON_CSS = "button.query-button [title='SGK Haciz']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
EXPAND_BUTTON_XPATH = "//*[@id='adaletDataGridContainer']/div/div[11]/div[1]/div[4]"
SONUC_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[4]/div[2]/div/div/div"
SGK_KAYIT_TABLE_XPATH = "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div[*]/div[*]/div/div/div/div[*]/div/div/div/div/table"

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_haciz_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """
    Save or update extracted_data to sgk_haciz_sorgu.json on the desktop.
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
        time.sleep(SLEEP_INTERVAL) # Küçük bir bekleme süresi ekleyelim
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

        # Adım 3: Expand butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing SGK Haciz sorgu for {item_text} - Clicking Expand button...")
        if not click_element_merged(driver, By.XPATH, EXPAND_BUTTON_XPATH,
                                   action_name="Expand button", item_text=item_text, result_label=result_label):
            logger.warning(f"Failed to expand table for {item_text}, proceeding without expansion")
        else:
            time.sleep(SLEEP_INTERVAL) # Küçük bir bekleme süresi ekleyelim

        # Adım 4: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing SGK Haciz sorgu for {item_text} - Extracting data...")

        # Extract 'sonuc'
        try:
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            wait.until(EC.visibility_of_element_located((By.XPATH, SONUC_XPATH)))
            raw_sonuc = sonuc_element.text.strip()
            extracted_data[dosya_no][item_text]["SGK Haciz"]["sonuc"] = raw_sonuc
        except TimeoutException as e:
            error_msg = f"Failed to locate 'sonuc' element for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["SGK Haciz"]["sonuc"] = ""
            # Continue to try extracting SGK kayit even if sonuc fails

        # Extract 'SGK kayit' table
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