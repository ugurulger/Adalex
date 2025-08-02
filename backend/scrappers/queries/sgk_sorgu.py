import logging
import os
import time
import json
import sys

# Add backend directory to Python path for imports
backend_dir = os.path.join(os.path.dirname(__file__), '..', '..')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, StaleElementReferenceException,
    ElementNotInteractableException, ElementClickInterceptedException,
    NoSuchElementException
)
from scrappers.queries.sorgulama_common import handle_popup_if_present, click_element_merged, save_to_json
from services.database_helper import save_scraping_data_to_db_and_json

# Global Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SHORT_TIMEOUT = 5
SLEEP_INTERVAL = 0.5
SGK_BUTTON_CSS = "button.query-button [title='SGK']"
SGK_DROPDOWN_SELECTOR = (
    "div[id^='dx-'] > div > div:nth-child(1) > div:nth-child(3) > "
    "div:nth-child(1) > div > div > "
    "div.dx-dropdowneditor-input-wrapper.dx-selectbox-container > "
    "div > div.dx-texteditor-buttons-container > "
    "div.dx-widget.dx-button-normal.dx-dropdowneditor-button"
)
ACTIVE_SUBPANEL_SELECTOR = "div.dx-multiview-item.dx-item-selected"
SORGULA_BUTTON_CSS = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.ms-auto"
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_sorgu.json")
HEDEF_CARD_BODY_SELECTOR = (
    "div[id^='dx-'] > div > div:nth-child(1) > div:nth-child(3) > "
    "div:nth-child(4) > div:nth-child(2) > div > div > div > div > div.hedef-card-body"
)
PARENT_PANEL_XPATH = (
    "//*[contains(@class, 'dx-item') and contains(@class, 'dx-multiview-item') and contains(@class, 'dx-item-selected')]"
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

def card_body_finder(driver, item_text, result_label=None):
    """
    Hedef card-body öğesini arar ve aynı zamanda pop-up kontrolü yapar.
    - Eğer pop-up belirirse, pop-up mesajını döndürür ve aramayı sonlandırır.
    - Eğer card-body bulunursa, card-body elementini döndürür.
    - Belirtilen süre içinde ikisi de bulunamazsa hata mesajı döner.
    """
    wait = WebDriverWait(driver, SHORT_TIMEOUT)
    max_attempts = 9
    card_body = None

    for attempt in range(max_attempts):
        time.sleep(SLEEP_INTERVAL)  # Her denemeden önce bekle

        # Pop-up kontrolü
        popup_message = handle_popup_if_present(driver, item_text, result_label)
        if popup_message:
            logger.info(f"Popup detected during card_body_finder for {item_text}: {popup_message}")
            return popup_message  # Pop-up bulundu, aramayı sonlandır

        # Parent paneli arıyoruz
        try:
            parent_panel = wait.until(EC.presence_of_element_located((By.XPATH, PARENT_PANEL_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", parent_panel)
            rows = parent_panel.find_elements(By.XPATH, ".//div[contains(@class, 'row')]")
            if not rows:
                logger.warning("card_body_finder: Hiç 'row' elementi bulunamadı.")
                continue

            # Her row'da hedef-card-body araması
            for row in rows:
                try:
                    card_body = row.find_element(By.CSS_SELECTOR, HEDEF_CARD_BODY_SELECTOR)
                    logger.info(f"card_body_finder: hedef-card-body, deneme {attempt+1} başarılı.")
                    break  # Card-body bulundu
                except Exception:
                    continue

            if card_body:
                break  # Card-body bulundu, döngüden çık
            else:
                logger.info(f"card_body_finder: Deneme {attempt+1} başarısız, hedef-card-body bulunamadı.")
        except TimeoutException as e:
            logger.warning(f"card_body_finder: Parent panel bulunamadı: {e}")
            continue

    if card_body:
        return card_body  # Card-body elementini döndür
    else:
        logger.warning("card_body_finder: 9 deneme sonunda ne card-body ne popup bulundu.")
        return "Ne card-body ne popup bulundu"

def parse_pdf_table_subtable(table_element):
    """
    pdfTable içerisindeki verileri aşağıdaki mantıkla ayrıştırır:
      - Eğer satır tek hücre içeriyorsa ve bu hücre "fw-bold text-center" içeriyorsa, bu hücre başlıktır.
      - Aynı başlık ikinci kez gelirse 'Başlık_2', üçüncü kez gelirse 'Başlık_3' vb. olarak adlandırılır.
      - Diğer satırlarda "fw-bold" sınıfına sahip hücreyi label, hemen sonraki hücreyi value kabul eder.
    """
    main_dict = {}
    current_subtable = main_dict
    heading_counts = {}

    rows = table_element.find_elements(By.TAG_NAME, "tr")

    for row in rows:
        tds = row.find_elements(By.TAG_NAME, "td")

        if len(tds) == 1:
            td_class = tds[0].get_attribute("class") or ""
            if "fw-bold" in td_class and "text-center" in td_class:
                heading_text = tds[0].text.strip()
                heading_counts[heading_text] = heading_counts.get(heading_text, 0) + 1
                if heading_counts[heading_text] == 1:
                    main_dict[heading_text] = {}
                    current_subtable = main_dict[heading_text]
                else:
                    new_heading = f"{heading_text}_{heading_counts[heading_text]}"
                    main_dict[new_heading] = {}
                    current_subtable = main_dict[new_heading]
                continue

        i = 0
        while i < len(tds):
            label_cell = tds[i]
            label_class = label_cell.get_attribute("class") or ""
            label_text = label_cell.text.strip()
            if "fw-bold" in label_class:
                if i + 1 < len(tds):
                    value_text = tds[i+1].text.strip()
                else:
                    value_text = ""
                current_subtable[label_text] = value_text
                i += 2
            else:
                i += 1

    return main_dict if main_dict else {}

def extract_data_from_card(driver, item_text, result_label=None):
    """
    Hedef card-body'den veriyi çeker:
      - Eğer pop-up mesajı dönerse, onu kullanır.
      - Eğer card-body bulunursa, tabloyu ayrıştırır.
      - Hiçbir şey bulunamazsa, hata mesajı döner.
    """
    wait = WebDriverWait(driver, SHORT_TIMEOUT)
    result = card_body_finder(driver, item_text, result_label)

    if isinstance(result, str):
        return result  # Pop-up mesajı veya hata mesajı

    card_body = result
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", card_body)
    wait.until(EC.visibility_of(card_body))

    try:
        table = card_body.find_element(By.ID, "pdfTable")
        wait.until(EC.visibility_of_element_located((By.ID, "pdfTable")))
        structured_data = parse_pdf_table_subtable(table)
        return structured_data if structured_data else "Tablo boş"
    except Exception as e:
        card_text = card_body.text.strip()
        return card_text if card_text else "Card-body boş"

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için SGK sorgusunu gerçekleştirir ve verileri çıkarır.
    """
    extracted_data = {dosya_no: {item_text: {}}}
    
    if result_label:
        result_label.config(text=f"SGK sorgu için {item_text} - SGK butonuna tıklanıyor...")
    time.sleep(SLEEP_INTERVAL)
    if not click_element_merged(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS, "SGK button", item_text, result_label):
        save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "sgk_sorgu.json"))
        return False, extracted_data

    if not click_element_merged(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR, "Active subpanel focus", item_text, result_label):
        logger.warning("Subpanel focus başarısız; devam ediliyor")

    for current_item in DROPDOWN_ITEMS:
        if result_label:
            result_label.config(text=f"{item_text} için SGK dropdown açılıyor ({current_item})...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SGK_DROPDOWN_SELECTOR, "SGK dropdown", item_text, result_label):
            logger.warning(f"Dropdown açılamadı; {current_item} atlanıyor")
            continue

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
        
        sonuc = extract_data_from_card(driver, item_text, result_label)
        extracted_data[dosya_no][item_text][current_item] = {"sonuc": sonuc}
        logger.info(f"Extracted data for '{current_item}': {sonuc}")
    
    save_scraping_data_to_db_and_json(extracted_data, os.path.join(DESKTOP_PATH, "sgk_sorgu.json"))
    return True, extracted_data