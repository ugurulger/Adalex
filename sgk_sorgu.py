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
HEDEF_CARD_BODY_SELECTOR = (
    "div[id^='dx-'] > div > div:nth-child(1) > div:nth-child(3) > "
    "div:nth-child(4) > div:nth-child(2) > div > div > div > div > div.hedef-card-body"
)
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
        except Exception as e:
            logger.warning(f"Error reading JSON: {e}")
    for key, value in extracted_data.items():
        if key not in existing_data:
            existing_data[key] = {}
        existing_data[key].update(value)
    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved to {JSON_FILE}")
    except Exception as e:
        logger.error(f"Error writing JSON: {e}")

def click(driver, by, value, action_name="", item_text="", result_label=None, use_js=False):
    wait = WebDriverWait(driver, TIMEOUT)
    for attempt in range(3):
        try:
            element = wait.until(EC.element_to_be_clickable((by, value)))
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
            if use_js:
                driver.execute_script("arguments[0].click();", element)
            else:
                element.click()
            if OVERLAY_SELECTOR:
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)))
            logger.info(f"Clicked {action_name} for {item_text or value} (attempt {attempt+1}).")
            return True
        except (TimeoutException, StaleElementReferenceException,
                ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {item_text or value}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {item_text or value} after 3 attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def extract_data_from_card(driver):
    wait = WebDriverWait(driver, SHORT_TIMEOUT)
    try:
        parent_panel = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(@class, 'dx-item') and contains(@class, 'dx-multiview-item') and contains(@class, 'dx-item-selected')]")
        ))
        logger.info("Parent panel located.")
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", parent_panel)
        rows = parent_panel.find_elements(By.XPATH, ".//div[contains(@class, 'row')]")
        if not rows:
            logger.warning("No 'row' element found")
            return "No 'row' element found"
        card_body = None
        for index, row in enumerate(rows):
            try:
                card_body = row.find_element(By.CSS_SELECTOR, HEDEF_CARD_BODY_SELECTOR)
                logger.info(f"Card body found in row {index+1}.")
                break
            except Exception:
                continue
        if not card_body:
            for index, row in enumerate(rows):
                logger.info(f"Row {index+1} content: {row.get_attribute('outerHTML')}")
            logger.warning("Card body not found in any row.")
            return "Card body not found in any row"
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", card_body)
        wait.until(EC.visibility_of(card_body))
        try:
            table = card_body.find_element(By.ID, "pdftable")
            wait.until(EC.visibility_of(table))
            table_rows = table.find_elements(By.TAG_NAME, "tr")
            table_data = [
                [cell.text.strip() for cell in row.find_elements(By.TAG_NAME, "td") if cell.text.strip()]
                for row in table_rows if row.find_elements(By.TAG_NAME, "td")
            ]
            return table_data if table_data else "Table is empty"
        except Exception:
            card_text = card_body.text.strip()
            return card_text if card_text else "Card body is empty"
    except TimeoutException as e:
        logger.warning(f"Parent panel or card body not found: {e}")
        return "Parent panel or card body not found"

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    extracted_data = {dosya_no: {item_text: {}}}
    
    if result_label:
        result_label.config(text=f"Clicking SGK button for {item_text}...")
    if not click(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS, "SGK button", item_text, result_label):
        save_to_json(extracted_data)
        return False, extracted_data

    if not click(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR, "Active subpanel focus", item_text, result_label):
        logger.warning("Active subpanel focus failed; continuing anyway.")

    for current_item in DROPDOWN_ITEMS:
        if result_label:
            result_label.config(text=f"Opening SGK dropdown for {item_text} ({current_item})...")
        if not click(driver, By.CSS_SELECTOR, SGK_DROPDOWN_SELECTOR, "SGK dropdown", item_text, result_label):
            logger.warning(f"Dropdown did not open; skipping {current_item}.")
            continue

        xpath = f"//*[contains(@class, 'dx-list-item') and contains(text(), '{current_item}')]"
        if not click(driver, By.XPATH, xpath, "Dropdown item", current_item, result_label, use_js=True):
            logger.warning(f"Failed to click '{current_item}'; skipping.")
            continue

        if not click(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS, "Sorgula button", current_item, result_label):
            logger.warning(f"Sorgula click failed for {current_item}; skipping.")
            continue

        time.sleep(1)  # Sayfanın yüklenmesi için bekleme
        result = extract_data_from_card(driver)
        #time.sleep(5)
        extracted_data[dosya_no][item_text][current_item] = {"sonuc": result}
        logger.info(f"Data extracted for '{current_item}': {result}")
        #time.sleep(1)

    save_to_json(extracted_data)
    return True, extracted_data
