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

def card_body_finder(driver):
    """
    Sayfa tamamen yüklenmemişse, maksimum 5 deneme yaparak
    hedef card-body öğesini arar ve bulmaya çalışır.
    """
    wait = WebDriverWait(driver, SHORT_TIMEOUT)
    max_attempts = 9
    card_body = None

    for attempt in range(max_attempts):

        time.sleep(SLEEP_INTERVAL)  # Her denemeden önce bekle

        # Parent paneli arıyoruz
        try:
            parent_panel = wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(@class, 'dx-item') and contains(@class, 'dx-multiview-item') and contains(@class, 'dx-item-selected')]")
            ))
        except TimeoutException as e:
            logger.warning(f"card_body_finder: Parent panel bulunamadı: {e}")
            continue

        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", parent_panel)
        rows = parent_panel.find_elements(By.XPATH, ".//div[contains(@class, 'row')]")
        if not rows:
            logger.warning("card_body_finder: Hiç 'row' elementi bulunamadı.")
            continue

        # Her row'da hedef-card-body araması
        for index, row in enumerate(rows):
            try:
                card_body = row.find_element(By.CSS_SELECTOR, HEDEF_CARD_BODY_SELECTOR)
                logger.info(f"card_body_finder: hedef-card-body, deneme {attempt+1} başarılı.")
                break  # Card-body bulundu, döngüden çık
            except Exception:
                continue

        if card_body is not None:
            break
        else:
            logger.info(f"card_body_finder: Deneme {attempt+1} başarısız, hedef-card-body bulunamadı.")

    if card_body is None:
        logger.warning("card_body_finder: 5 deneme sonunda hedef-card-body bulunamadı.")
    return card_body


def parse_pdf_table_subtable(table_element):
    """
    pdfTable içerisindeki verileri aşağıdaki mantıkla ayrıştırır:
      - Eğer satır tek hücre içeriyorsa ve bu hücre "fw-bold text-center" içeriyorsa, bu hücre başlıktır.
      - Aynı başlık ikinci kez gelirse 'Başlık_2', üçüncü kez gelirse 'Başlık_3' vb. olarak adlandırılır.
      - Diğer satırlarda "fw-bold" sınıfına sahip hücreyi label, hemen sonraki hücreyi value kabul eder.
    """
    main_dict = {}
    current_subtable = main_dict  # İlk başta ana sözlüğe ekliyoruz
    heading_counts = {}  # Aynı başlık tekrarında sayıyı tutar

    rows = table_element.find_elements(By.TAG_NAME, "tr")

    for row in rows:
        tds = row.find_elements(By.TAG_NAME, "td")

        # 1) Tek hücre + fw-bold + text-center → Başlık
        if len(tds) == 1:
            td_class = tds[0].get_attribute("class") or ""
            if "fw-bold" in td_class and "text-center" in td_class:
                heading_text = tds[0].text.strip()
                # Sayıyı artır
                heading_counts[heading_text] = heading_counts.get(heading_text, 0) + 1
                if heading_counts[heading_text] == 1:
                    # İlk kez görüyorsak, orijinal heading'i ekleyelim
                    main_dict[heading_text] = {}
                    current_subtable = main_dict[heading_text]
                else:
                    # İkinci, üçüncü kez görüyorsak, heading_text_2 vb. olarak ekleyelim
                    new_heading = f"{heading_text}_{heading_counts[heading_text]}"
                    main_dict[new_heading] = {}
                    current_subtable = main_dict[new_heading]
                continue

        # 2) Diğer satırlarda "fw-bold" sınıfına sahip hücre label, hemen yanındaki hücre value
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

    return main_dict


def extract_data_from_card(driver):
    """
    Hedef card-body'den veriyi çeker:
      - Eğer pdftable (id="pdfTable") varsa, parse_pdf_table_subtable ile tabloyu
        ayrıştırıp tekrarlayan başlıkları numaralandıran bir yapı döndürür.
      - Eğer pdftable yoksa, fallback olarak card-body'nin text'ini döndürür.
    """
    wait = WebDriverWait(driver, SHORT_TIMEOUT)
    card_body = card_body_finder(driver)
    if card_body is None:
        return "Herhangi bir row içinde hedef-card-body bulunamadı"
    
    # Card-body bulundu, ekrana kaydırıp görünürlüğünü teyit ediyoruz.
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
    extracted_data = {dosya_no: {item_text: {}}}
    
    if result_label:
        result_label.config(text=f"SGK sorgu için {item_text} - SGK butonuna tıklanıyor...")
    time.sleep(SLEEP_INTERVAL) #gecici bir cozum daha kalici bir cozum bulunacak
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
        
        sonuc = extract_data_from_card(driver)
        extracted_data[dosya_no][item_text][current_item] = {"sonuc": sonuc}
        logger.info(f"Extracted data for '{current_item}': {sonuc}")
    
    save_to_json(extracted_data)
    return True, extracted_data