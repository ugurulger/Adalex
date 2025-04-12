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

# Orijinal click_element_merged fonksiyonu aynen korundu.
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
        parent_panel = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(@class, 'dx-item') and contains(@class, 'dx-multiview-item') and contains(@class, 'dx-item-selected')]")
        ))
        logger.info("Parent panel bulundu.")
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", parent_panel)
        rows = parent_panel.find_elements(By.XPATH, ".//div[contains(@class, 'row')]")
        logger.info(f"Toplam {len(rows)} adet 'row' bulundu.")
        if not rows:
            logger.warning("Hiç 'row' elementi bulunamadı")
            return "Hiç 'row' elementi bulunamadı"
        
        card_body = None
        for index, row in enumerate(rows):
            try:
                card_body = row.find_element(By.CSS_SELECTOR, HEDEF_CARD_BODY_SELECTOR)
                logger.info(f"hedef-card-body, {index+1}. row'da bulundu.")
                break
            except Exception:
                continue
        
        if not card_body:
            logger.warning("Herhangi bir row içinde hedef-card-body bulunamadı")
            return "Herhangi bir row içinde hedef-card-body bulunamadı"
        
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", card_body)
        wait.until(EC.visibility_of(card_body))
        
        try:
            table = card_body.find_element(By.ID, "pdftable")
            wait.until(EC.visibility_of_element_located((By.ID, "pdftable")))
            table_rows = table.find_elements(By.TAG_NAME, "tr")
            table_data = [
                [cell.text.strip() for cell in row.find_elements(By.TAG_NAME, "td") if cell.text.strip()]
                for row in table_rows if row.find_elements(By.TAG_NAME, "td")
            ]
            return table_data if table_data else "Tablo boş"
        except Exception:
            card_text = card_body.text.strip()
            return card_text if card_text else "Card-body boş"
    
    except TimeoutException as e:
        logger.warning(f"Hedef card-body veya üst yapı bulunamadı: {e}")
        return "Hedef card-body veya üst yapı bulunamadı"

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    extracted_data = {dosya_no: {item_text: {}}}
    
    if result_label:
        result_label.config(text=f"SGK sorgu için {item_text} - SGK butonuna tıklanıyor...")
    if not click_element_merged(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS, "SGK button", item_text, result_label):
        save_to_json(extracted_data)
        return False, extracted_data

    if not click_element_merged(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR, "Active subpanel focus", item_text, result_label):
        logger.warning("Subpanel focus başarısız; devam ediliyor")

    # Her item için dropdown kontrollerini akıllıca gerçekleştir:
    for current_item in DROPDOWN_ITEMS:
        if result_label:
            result_label.config(text=f"{item_text} için SGK dropdown açılıyor ({current_item})...")
        # Dropdown'u aç
        if not click_element_merged(driver, By.CSS_SELECTOR, SGK_DROPDOWN_SELECTOR, "SGK dropdown", item_text, result_label):
            logger.warning(f"Dropdown açılamadı; {current_item} atlanıyor")
            continue

        # Mevcut dropdown itemlerini kontrol et.
        # normalize-space() kullanılarak boşluklar temizleniyor
        xpath_item = f"//*[contains(@class, 'dx-list-item') and contains(normalize-space(text()), '{current_item}')]"
        available_items = driver.find_elements(By.XPATH, xpath_item)
        if not available_items:
            logger.warning(f"Dropdown listesinde '{current_item}' bulunamadı; atlanıyor.")
            continue

        if not click_element_merged(driver, By.XPATH, xpath_item, "Dropdown item", current_item, result_label, use_js_first=True):
            logger.warning(f"'{current_item}' üzerinde tıklama başarısız; atlanıyor.")
            continue

        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS, "Sorgula button", current_item, result_label):
            logger.warning(f"Sorgula başarısız; {current_item} atlanıyor")
            continue
        
        time.sleep(3)  # Sayfa yüklenmesi için ek bekleme
        sonuc = extract_data_from_card(driver)
        #time.sleep(5)
        extracted_data[dosya_no][item_text][current_item] = {"sonuc": sonuc}
        logger.info(f"Extracted data for '{current_item}': {sonuc}")
        #time.sleep(1)
    
    save_to_json(extracted_data)
    return True, extracted_data