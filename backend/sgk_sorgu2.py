import logging
import os
import time
import json
from pprint import pprint
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, StaleElementReferenceException,
    ElementNotInteractableException, ElementClickInterceptedException,
    NoSuchElementException
)
from sorgulama_common import handle_popup_if_present, click_element_merged, save_to_json
from database_helper import save_scraping_data_to_db_and_json

# Global Constants
TIMEOUT = 20
SLEEP_INTERVAL = 0.5
SGK_BUTTON_CSS = "button.query-button [title='SGK']"
ACTIVE_SUBPANEL_SELECTOR = "div.dx-multiview-item.dx-item-selected"
SGK_ITEMS = [
    "Kamu Çalışanı",
    "Kamu Emeklisi",
    "SSK Çalışanı",
    "SSK Emeklisi",
    "Bağkur Çalışanı",
    "Bağkur Emeklisi",
    "SSK İş Yeri Bilgisi"
]
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_sorgu.json")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_pdf_table_subtable(table_element):
    """
    pdfTable içerisindeki verileri ayrıştırır:
    - Tek hücreli ve "fw-bold text-center" içeren satırlar başlık olarak işlenir.
    - "fw-bold" içeren hücreler label, sonraki hücre value olarak alınır.
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
                new_heading = heading_text if heading_counts[heading_text] == 1 else f"{heading_text}_{heading_counts[heading_text]}"
                main_dict[new_heading] = {}
                current_subtable = main_dict[new_heading]
                continue
        i = 0
        while i < len(tds):
            label_cell = tds[i]
            label_class = label_cell.get_attribute("class") or ""
            label_text = label_cell.text.strip()
            if "fw-bold" in label_class and i + 1 < len(tds):
                current_subtable[label_text] = tds[i + 1].text.strip()
                i += 2
            else:
                i += 1
    return main_dict if main_dict else {}

def extract_data_from_card(driver, item_text, table_id, result_label=None):
    """
    Belirli bir tablodan veriyi çeker ve ayrıştırır.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    try:
        table = wait.until(EC.visibility_of_element_located((By.ID, table_id)))
        wait.until(EC.element_to_be_clickable((By.ID, table_id)))
        structured_data = parse_pdf_table_subtable(table)
        return structured_data if structured_data else "Tablo boş"
    except Exception as e:
        logger.warning(f"Veri çekme hatası {table_id} için: {e}")
        popup_message = handle_popup_if_present(driver, item_text, result_label)
        return popup_message if popup_message else "Card-body boş"

def perform_sgk_sorgu(driver, current, dosya_no, result_label=None):
    """
    SGK butonuna, aktif subpanel'e ve tüm başlıklarla sorgula butonlarına sırayla tıklar, verileri çeker.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {dosya_no: {current: {}}}

    # SGK butonuna tıkla
    logger.info(f"{current} için SGK butonuna tıklanıyor...")
    if result_label:
        result_label.config(text=f"SGK sorgu için {current} - SGK butonuna tıklanıyor...")
    if not click_element_merged(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS, "SGK button", current, result_label):
        logger.error("SGK butonuna tıklama başarısız.")
        logger.info("[SGK] Data to be saved:\n%s", json.dumps(extracted_data, ensure_ascii=False, indent=2))
        save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
        return False, extracted_data

    # Aktif subpanel'e tıkla (iki kez)
    logger.info(f"Aktif subpanel'e tıklanıyor...")
    if result_label:
        result_label.config(text=f"{current} için aktif subpanel'e tıklanıyor...")
    if not click_element_merged(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR, "Active subpanel focus", current, result_label):
        logger.warning("Subpanel focus başarısız; devam ediliyor...")
    time.sleep(0.5)
    if not click_element_merged(driver, By.CSS_SELECTOR, ACTIVE_SUBPANEL_SELECTOR, "Active subpanel focus", current, result_label):
        logger.warning("Subpanel ikinci focus başarısız; devam ediliyor...")

    # Her bir başlık ve sorgula butonu için işlemleri gerçekleştir
    base_xpath = "//*[contains(@id, 'dx-')]/div/div/div/div/div"
    table_ids = {
        "Kamu Çalışanı": "pdfDetayTable-kamu_calisan",
        "Kamu Emeklisi": "pdfDetayTable-kamu_emeklesi",
        "SSK Çalışanı": "pdfDetayTable-ssk_calisan",
        "SSK Emeklisi": "pdfDetayTable-ssk_emekli",
        "Bağkur Çalışanı": "pdfDetayTable-bagkur_calisan",
        "Bağkur Emeklisi": "pdfDetayTable-bagkur_emekli",
        "SSK İş Yeri Bilgisi": "pdfDetayTable-ssk_is_yeri_bilgileri"
    }
    for index, current_item in enumerate(SGK_ITEMS, 1):
        try:
            logger.info(f"{current_item} başlığına tıklanıyor...")
            if result_label:
                result_label.config(text=f"{current} için {current_item} başlığına tıklanıyor...")

            # Dinamik başlık XPath'i
            header_xpath = f"{base_xpath}[{index}]/details/summary"
            if not click_element_merged(driver, By.XPATH, header_xpath, f"Başlık ({current_item})", current, result_label, use_js_first=True):
                logger.warning(f"{current_item} başlığına tıklama başarısız.")
                continue

            # Bekleme, UI güncellemesi için
            time.sleep(SLEEP_INTERVAL)

            logger.info(f"{current_item} için Sorgula butonuna tıklanıyor...")
            if result_label:
                result_label.config(text=f"{current} için {current_item} sorgulanıyor...")

            # Dinamik sorgula butonu XPath'i
            sorgula_xpath = f"{base_xpath}[{index}]/details/div/div[1]/div/div/div"
            wait.until(EC.element_to_be_clickable((By.XPATH, sorgula_xpath)))
            if not click_element_merged(driver, By.XPATH, sorgula_xpath, f"Sorgula butonu ({current_item})", current, result_label, use_js_first=True):
                logger.warning(f"{current_item} için Sorgula butonuna tıklama başarısız.")
                continue

            # Tablo verisini çek
            table_id = table_ids[current_item]
            data = extract_data_from_card(driver, current, table_id, result_label)
            extracted_data[dosya_no][current][current_item] = {"sonuc": data}
            logger.info(f"Extracted data for '{current_item}': {data}")

            logger.info(f"{current_item} için Sorgula butonuna başarıyla tıklandı.")
            time.sleep(SLEEP_INTERVAL)

        except TimeoutException as e:
            logger.warning(f"{current_item} için tıklama hatası: {e}")
            if result_label:
                result_label.config(text=f"Hata: {current_item} için tıklama başarısız.")
            continue

    save_scraping_data_to_db_and_json(extracted_data, JSON_FILE)
    logger.info("[SGK] Data to be saved:\n%s", json.dumps(extracted_data, ensure_ascii=False, indent=2))
    return True, extracted_data