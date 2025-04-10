import logging
import os
import time
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, StaleElementReferenceException,
    ElementNotInteractableException, ElementClickInterceptedException
)

# Global Constants
TIMEOUT = 15
SHORT_TIMEOUT = 5
SLEEP_INTERVAL = 0.5
OVERLAY_SELECTOR = ".dx-loadpanel-indicator.dx-loadindicator.dx-widget"
SGK_BUTTON_CSS = "button.query-button [title='SGK']"
SGK_DROPDOWN_SELECTOR = (
    "div[id^='dx-'] > div > div:nth-child(1) > div:nth-child(3) > "
    "div:nth-child(1) > div > div > "
    "div.dx-dropdowneditor-input-wrapper.dx-selectbox-container > "
    "div > div.dx-texteditor-buttons-container > "
    "div.dx-widget.dx-button-normal.dx-dropdowneditor-button"
)
ACTIVE_SUBPANEL_SELECTOR = "div.dx-multiview-item.dx-item-selected"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_sorgu.json")

# Sabit dropdown item listesi
DROPDOWN_ITEMS = [
    "Kamu Çalışanı",
    "Kamu Emeklisi",
    "SSK Çalışanı",
    "SSK Emeklisi",
    "Bağkur Çalışanı",
    "Bağkur Emeklisi",
    "SSK İş Yeri Bilgisi"
]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    existing_data = {}
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error reading JSON: {e}")
    
    for dosya_no, items in extracted_data.items():
        if dosya_no not in existing_data:
            existing_data[dosya_no] = {}
        existing_data[dosya_no].update(items)
    
    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved to {JSON_FILE}")
    except IOError as e:
        logger.error(f"Error writing JSON: {e}")

def click_element_merged(driver, by, value, action_name="", item_text="", result_label=None, use_js_first=False):
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    for attempt in range(3):
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
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)), "Overlay persists")
                logger.info("Overlay gone.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after 3 attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def extract_data_from_card(driver):
    """
    Hedef card-body'den veriyi çeker: pdftable varsa tabloyu, yoksa card-body içindeki metni döner.
    """
    wait = WebDriverWait(driver, SHORT_TIMEOUT)
    try:
        # Hedef card-body'yi bul
        card_body = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "hedef-card-body")))
        # Card-body'ye scroll yap
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", card_body)
        # Card-body'nin görünür olmasını bekle
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "hedef-card-body")))
        
        # pdftable varsa tabloyu çek
        try:
            table = card_body.find_element(By.ID, "pdftable")
            wait.until(EC.visibility_of_element_located((By.ID, "pdftable")))
            rows = table.find_elements(By.TAG_NAME, "tr")
            table_data = []
            for row in rows:
                cells = row.find_elements(By.TAG_NAME, "td")
                row_data = [cell.text.strip() for cell in cells if cell.text.strip()]  # Boş hücreleri atla
                if row_data:  # Boş satırları atla
                    table_data.append(row_data)
            return table_data if table_data else "Tablo boş"
        except:
            # pdftable yoksa card-body içindeki tüm metni çek
            card_text = card_body.text.strip()
            return card_text if card_text else "Card-body boş"
    
    except TimeoutException:
        logger.warning("Hedef card-body bulunamadı")
        return "Hedef card-body bulunamadı"

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {dosya_no: {item_text: {}}}
    
    # Step 1: Click SGK button
    if result_label:
        result_label.config(text=f"SGK sorgu için {item_text} - SGK butonuna tıklanıyor...")
    if not click_element_merged(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS, 
                               action_name="SGK button", item_text=item_text, result_label=result_label):
        save_to_json(extracted_data)
        return False, extracted_data

    # Step 2: Focus active subpanel
    if not click_element_merged(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR, 
                               action_name="Active subpanel focus", item_text=item_text, result_label=result_label):
        logger.warning("Subpanel focus başarısız; devam ediliyor")

    # Step 3: Process each dropdown item with reopen
    for current_text in DROPDOWN_ITEMS:
        # Open SGK dropdown each time
        if result_label:
            result_label.config(text=f"{item_text} için SGK dropdown açılıyor ({current_text})...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SGK_DROPDOWN_SELECTOR, 
                                   action_name="SGK dropdown", item_text=item_text, result_label=result_label):
            logger.warning(f"Dropdown açılamadı; {current_text} atlanıyor")
            continue

        # Click the item with JS first for reliability
        if not click_element_merged(driver, By.XPATH, f"//*[contains(@class, 'dx-list-item') and contains(text(), '{current_text}')]",
                                   action_name="Dropdown item", item_text=current_text, result_label=result_label, use_js_first=True):
            logger.warning(f"Failed to click '{current_text}'; skipping")
            continue
        
        # Click Sorgula button
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS, 
                                   action_name="Sorgula button", item_text=current_text, result_label=result_label):
            logger.warning(f"Sorgula başarısız; {current_text} atlanıyor")
            continue
        
        # Veriyi çek
        sonuc = extract_data_from_card(driver)
        time.sleep(5)
        # Extracted data'ya ekle
        if item_text not in extracted_data[dosya_no]:
            extracted_data[dosya_no][item_text] = {}
        extracted_data[dosya_no][item_text][current_text] = {"sonuc": sonuc}
        logger.info(f"Extracted data for '{current_text}': {sonuc}")
        time.sleep(1)
    
    save_to_json(extracted_data)
    return True, extracted_data