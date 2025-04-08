import logging
import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Constants
TIMEOUT = 15
SLEEP_INTERVAL = 0.5
SGK_BUTTON_CSS = "button.query-button[title='SGK']"  # SGK butonu
SGK_DROPDOWN_CSS = "div.row div.dx-dropdowneditor-input-wrapper.dx-selectbox-container div.dx-texteditor-buttons-container div.dx-dropdowneditor-button"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """Extracted data’yı JSON dosyasına kaydeder veya günceller."""
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"JSON dosyası okunamadı, sıfırdan başlıyor: {e}")
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
        logger.info(f"Veri {JSON_FILE} dosyasına kaydedildi/güncellendi")
    except IOError as e:
        logger.error(f"JSON dosyasına yazma hatası: {e}")

def perform_sgk_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    SGK sorgu işlemini gerçekleştirir (Veri işleme hariç).
    Steps:
        1. SGK butonuna tıkla.
        2. Dropdown’u aç ve tüm itemlere sırayla tıkla.
        3. Her item için Sorgula butonuna tıkla.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "SGK": {
                    "sonuc": "Veri işleme implemente edilmedi"
                }
            }
        }
    }

    try:
        # # Step 1: SGK butonuna tıkla
        # if result_label:
        #     result_label.config(text=f"SGK sorgu için {item_text} - SGK butonuna tıklanıyor...")
        from sorgulama_common import click_element
        # logger.info(f"SGK buton selector deneniyor: {SGK_BUTTON_CSS}")
        
        # SGK butonunun varlığını ve tıklanabilirliğini doğrula
        # try:
        #     sgk_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, SGK_BUTTON_CSS)))
        #     driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sgk_button)
        #     if not click_element(driver, By.CSS_SELECTOR, SGK_BUTTON_CSS):
        #         error_msg = f"SGK butonu tıklanamadı: {item_text}"
        #         if result_label:
        #             result_label.config(text=error_msg)
        #         logger.error(error_msg)
        #         save_to_json(extracted_data)
        #         return False, extracted_data
        # except TimeoutException as e:
        #     error_msg = f"SGK butonu bulunamadı veya yüklenmedi: {item_text}: {e}"
        #     if result_label:
        #         result_label.config(text=error_msg)
        #     logger.error(error_msg)
        #     save_to_json(extracted_data)
        #     return False, extracted_data

        # SGK butonuna tıkladıktan sonra dropdown’un yüklenmesi için ek bekleme
        time.sleep(5)
        logger.info(f"SGK butonuna tıkladıktan sonra 2 saniye beklendi: {item_text}")

        # Step 2: Dropdown’u aç ve tüm itemlere sırayla tıkla
        if result_label:
            result_label.config(text=f"SGK sorgu için {item_text} - Dropdown açılıyor...")
        logger.info(f"SGK dropdown selector deneniyor: {SGK_DROPDOWN_CSS}")

        # Dropdown’u aç
        if not click_element(driver, By.CSS_SELECTOR, SGK_DROPDOWN_CSS):
            error_msg = f"SGK dropdown açılamadı: {item_text}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            save_to_json(extracted_data)
            return False, extracted_data

        # Dropdown itemlerini bul
        dropdown_items_selector = ".dx-dropdowneditor-overlay .dx-list-item"
        try:
            items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, dropdown_items_selector)))
            logger.info(f"Bulunan dropdown item sayısı: {len(items)}")
            for index, item in enumerate(items):
                item_name = item.text.strip() or f"Item {index + 1}"
                logger.info(f"Dropdown item {index + 1}: {item_name}")
        except TimeoutException as e:
            error_msg = f"Dropdown itemleri yüklenemedi: {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            save_to_json(extracted_data)
            return False, extracted_data

        # Itemleri sırayla işle
        for index, dropdown_item in enumerate(items):
            item_name = dropdown_item.text.strip() or f"Item {index + 1}"
            if result_label:
                result_label.config(text=f"SGK sorgu için {item_text} - {item_name} işleniyor...")
            logger.info(f"Dropdown item işleniyor: {item_name}")

            # Her bir dropdown itemine tıkla
            if not click_element(driver, By.XPATH, f"//*[text()='{item_name}']"):
                logger.warning(f"Dropdown item '{item_name}' tıklanamadı, devam ediliyor...")
                continue

            # Step 3: Sorgula butonuna tıkla
            if result_label:
                result_label.config(text=f"SGK sorgu için {item_text} - {item_name} için Sorgula butonuna tıklanıyor...")
            if not click_element(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS):
                logger.warning(f"Sorgula butonu tıklanamadı: {item_name}, devam ediliyor...")
                continue

            # Veri işleme şimdilik boş
            logger.info(f"{item_name} için sorgulama tamamlandı (veri işleme yok)")
            time.sleep(1)  # Her sorgudan sonra kısa bir bekleme

            # Dropdown’u tekrar aç (bir sonraki item için)
            if index < len(items) - 1:
                if not click_element(driver, By.CSS_SELECTOR, SGK_DROPDOWN_CSS):
                    error_msg = f"SGK dropdown tekrar açılamadı: {item_text}"
                    if result_label:
                        result_label.config(text=error_msg)
                    logger.error(error_msg)
                    break

        # İşlem tamamlandı
        if result_label:
            result_label.config(text=f"SGK sorgu için {item_text} - Tüm itemler işlendi")
        logger.info(f"SGK sorgu tamamlandı: {item_text}")
        save_to_json(extracted_data)
        time.sleep(3)  # Diğer sorgularla uyumlu
        return True, extracted_data

    except Exception as e:
        error_msg = f"SGK sorgu hatası: {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data