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

def handle_popup_if_present(driver, item_text, result_label=None):
    """
    Check for a popup, extract its message if present, and close the popup.
    Returns the popup message if a popup was handled, None if no popup was found.
    """
    # Pop-up ile ilgili sabitler
    POPUP_CSS = ".dx-overlay-content.dx-popup-normal.dx-popup-flex-height.dx-resizable"
    POPUP_MESSAGE_XPATH = (
        "/html/body/div[contains(@class, 'dx-overlay-wrapper') and contains(@class, 'dx-popup-wrapper') and "
        "contains(@class, 'custom-popup-alert')]/div/div/div/div/p"
    )
    TAMAM_BUTTON_CSS = "[aria-label='Tamam']"

    try:
        # Hızlıca pop-up elementini ara
        popup_elements = driver.find_elements(By.CSS_SELECTOR, POPUP_CSS)
        if not popup_elements:
            logger.info(f"No popup detected for {item_text}")
            return None

        # Pop-up varsa, görünür olup olmadığını kontrol et (dx-state-invisible olmamalı)
        popup = popup_elements[0]
        if "dx-state-invisible" in popup.get_attribute("class"):
            logger.info(f"Popup detected but invisible for {item_text}")
            return None

        logger.info(f"Popup detected for {item_text}")

        # Mesajı çıkar
        wait = WebDriverWait(driver, TIMEOUT)
        try:
            message_element = wait.until(EC.presence_of_element_located((By.XPATH, POPUP_MESSAGE_XPATH)))
            popup_message = message_element.text.strip()
            logger.info(f"Extracted popup message for {item_text}: {popup_message}")
        except TimeoutException:
            logger.warning(f"Could not locate popup message for {item_text}")
            popup_message = "Popup message could not be extracted"

        # 'Tamam' butonuna tıkla
        if not click_element_merged(driver, By.CSS_SELECTOR, TAMAM_BUTTON_CSS,
                                   action_name="Tamam button", item_text=item_text, result_label=result_label):
            logger.error(f"Failed to close popup for {item_text}")
            popup_message += " (Failed to close popup)"
        
        # result_label'ı güncelle
        if result_label:
            result_label.config(text=f"Popup detected for {item_text}: {popup_message}")
        
        return popup_message  # Mesajı döndür

    except Exception as e:
        logger.info(f"No popup detected for {item_text}: {e}")
        return None  # Hata durumunda pop-up yok kabul et

def perform_banka_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için Banka sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. Banka butonuna tıklar.
      2. "Sorgula" butonuna tıklar.
      3. 'sonuc' ve 'bankalar' XPath’lerinden verileri çıkarır.
         - Pop-up kontrolü, SONUC_XPATH bulunamadığında yapılır.
         - 'bankalar' için önce expand butonuna tıklanır.
         - Çıkarılan veriler banka_sorgu.json dosyasına kaydedilir.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
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
        time.sleep(SLEEP_INTERVAL) # Küçük bir bekleme süresi ekleyelim
        # Adım 1: Banka butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Clicking Banka button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, BANKA_BUTTON_CSS,
                                   action_name="Banka button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 2: "Sorgula" butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 3: Veri çıkarma işlemi
        if result_label:
            result_label.config(text=f"Performing Banka sorgu for {item_text} - Extracting data...")

        try:
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            raw_sonuc = sonuc_element.text.strip()
            extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = raw_sonuc
            logger.info(f"Extracted raw 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException:
            logger.warning(f"Failed to locate 'sonuc' element for {item_text}, checking for popup...")
            # Pop-up kontrolü
            if result_label:
                result_label.config(text=f"Checking for popup for {item_text}...")
            popup_message = handle_popup_if_present(driver, item_text, result_label)
            if popup_message:
                # Pop-up varsa mesajı kaydet ve işlemi sonlandır
                extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = popup_message
                save_to_json(extracted_data)
                return False, extracted_data
            else:
                # Pop-up yoksa hata mesajını kaydet
                error_msg = f"Failed to locate 'sonuc' element for {item_text}: TimeoutException"
                if result_label:
                    result_label.config(text=error_msg)
                logger.error(error_msg)
                extracted_data[dosya_no][item_text]["Banka"]["sonuc"] = ""
                save_to_json(extracted_data)
                return False, extracted_data

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

        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"Banka sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data