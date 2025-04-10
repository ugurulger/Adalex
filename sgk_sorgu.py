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

# Sabit dropdown item listesi (önceki loglardan aldım)
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

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {dosya_no: {item_text: {"SGK": []}}}
    
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
        
        # Extract data (placeholder)
        extracted_item = {"dropdown_item": current_text, "data": "extracted_placeholder"}
        extracted_data[dosya_no][item_text]["SGK"].append(extracted_item)
        logger.info(f"Extracted data for '{current_text}'")
        time.sleep(1)
    
    save_to_json(extracted_data)
    return True, extracted_data