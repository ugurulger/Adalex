import logging
import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5
OVERLAY_SELECTOR = None  # Overlay için gerektiğinde güncellenebilir
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "egm_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Orijinal click_element_merged (değiştirilmedi)
def click_element_merged(driver, by, value, action_name="", item_text="", result_label=None, use_js_first=False):
    """
    Verilen locator (by, value) ile tanımlanan elementin tıklanabilir hale gelmesini bekler,
    sayfada ortalar ve tıklama işlemini gerçekleştirir. Normal click başarısız olursa JS fallback uygular.
    Overlay kontrolü de global OVERLAY_SELECTOR ile yapılır.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    for attempt in range(RETRY_ATTEMPTS):
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
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)),
                             message="Overlay persists")
                logger.info("Overlay gone.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def save_to_json(extracted_data):
    """Extracted data'yı JSON dosyasına kaydeder veya günceller."""
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    existing_data = {}
    
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.warning(f"Error reading JSON file {JSON_FILE}, starting fresh: {e}")

    for dosya_no, items in extracted_data.items():
        if dosya_no not in existing_data:
            existing_data[dosya_no] = {}
        existing_data[dosya_no].update(items)

    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved to {JSON_FILE}")
    except IOError as e:
        logger.error(f"Error writing JSON file {JSON_FILE}: {e}")

def switch_to_frame_if_exists(driver, wait):
    """İlk iframe'e geçiş yapar, yoksa default content'te kalır."""
    try:
        iframe = wait.until(EC.presence_of_element_located((By.TAG_NAME, "iframe")))
        driver.switch_to.frame(iframe)
        logger.debug("Switched to iframe")
        return driver, True
    except TimeoutException:
        logger.debug("No iframe found")
        return driver, False

def switch_to_default_content(driver):
    """Default content'e geri döner."""
    driver.switch_to.default_content()
    logger.debug("Switched to default content")
    return driver

def extract_mahrumiyet_data(driver, wait, arac, item_text):
    """Mahrumiyet tablosundan verileri çıkarır ve arac['Mahrumiyet'] listesine ekler."""
    try:
        table = wait.until(EC.presence_of_element_located(SELECTORS["mahrumiyet_table"]))
        all_mahrumiyet_data = []
        total_pages = 1

        try:
            pages_container = driver.find_element(By.XPATH, SELECTORS["mahrumiyet_pages"][1])
            page_info = pages_container.find_element(By.CLASS_NAME, "dx-info")
            total_pages = int(page_info.text.split("/")[-1].strip().split()[0])
            logger.info(f"Found {total_pages} Mahrumiyet pages for vehicle {arac['No']} - {arac['Plaka']}")
        except Exception as e:
            logger.debug(f"Single page assumed for Mahrumiyet data: {e}")

        for page in range(1, total_pages + 1):
            rows = table.find_elements(By.XPATH, ".//tbody//tr")
            for row in rows:
                cols = row.find_elements(By.TAG_NAME, "td")
                if len(cols) >= 5 and cols[0].text.strip():
                    mahrumiyet_kaydi = {
                        "Takyidat Sirasi": cols[0].text.strip(),
                        "Ekleyen Birim": cols[1].text.strip(),
                        "Ekleme Tarihi": cols[2].text.strip(),
                        "Serh Turu": cols[3].text.strip(),
                        "Kurum Adi": cols[4].text.strip(),
                    }
                    all_mahrumiyet_data.append(mahrumiyet_kaydi)

            if page < total_pages:
                try:
                    next_page = pages_container.find_element(By.XPATH, f".//div[@role='button' and @aria-label='Page {page + 1}']")
                    driver.execute_script("arguments[0].click();", next_page)
                    time.sleep(1)
                    table = wait.until(EC.presence_of_element_located(SELECTORS["mahrumiyet_table"]))
                except Exception as e:
                    logger.warning(f"Could not navigate to page {page + 1}: {e}")
                    break

        arac["Mahrumiyet"] = all_mahrumiyet_data
        logger.info(f"Extracted {len(all_mahrumiyet_data)} Mahrumiyet records for vehicle {arac['No']} - {arac['Plaka']}")
    except TimeoutException as e:
        logger.warning(f"Mahrumiyet table not found for vehicle {arac['No']} - {arac['Plaka']}: {e}")
        arac["Mahrumiyet"] = []

def close_mahrumiyet_popup(driver, wait, item_text, arac, result_label=None):
    """Mahrumiyet pop-up'ını kapatır."""
    try:
        if click_element_merged(driver, *SELECTORS["kapat_button"], "Kapat button", f"{item_text} - Vehicle {arac['No']}", result_label):
            wait.until(EC.invisibility_of_element_located(SELECTORS["mahrumiyet_table"]))
            logger.info(f"Mahrumiyet pop-up closed for vehicle {arac['No']} - {arac['Plaka']}")
    except TimeoutException as e:
        logger.warning(f"Failed to verify Mahrumiyet pop-up closure: {e}")
        if driver.find_elements(*SELECTORS["mahrumiyet_table"]):
            logger.info(f"Retrying to close Mahrumiyet pop-up for vehicle {arac['No']} - {arac['Plaka']}")
            click_element_merged(driver, *SELECTORS["kapat_button"], "Kapat button (retry)", f"{item_text} - Vehicle {arac['No']}", result_label)

# EGM için SELECTORS
SELECTORS = {
    "egm_button": (By.CSS_SELECTOR, "button.query-button [title='EGM-TNB']"),
    "sorgula_button": (By.CSS_SELECTOR, "[aria-label='Sorgula']"),
    "data_table": (By.XPATH, (
        "/html/body/div[2]/div/div[2]/div/div/div/div/div[2]/div/div/div[9]/div/div[1]/div[1]/div/div/div[2]/"
        "div/div[2]/div/div[2]/div/div/div[1]/div/div[1]/div[2]/div[3]/div[2]/div/div/div/div/div/div[2]"
    )),
    "mahrumiyet_table": (By.XPATH, "/html/body/div/div/div/div/div/div/div/div/div[2]/div[1]/div/div/div[7]/div/div/div/div/table"),
    "kapat_button": (By.CSS_SELECTOR, "[class*='dx-closebutton']"),
    "mahrumiyet_pages": (By.XPATH, "/html/body/div/div/div/div/div/div/div/div/div[2]/div[1]/div/div/div[11]/div[2]"),
}

def perform_egm_sorgu(driver, item_text, dosya_no, result_label=None):
    """EGM-TNB sorgusu yapar ve verileri çıkarır."""
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {dosya_no: {item_text: {"EGM": {"Sonuc": "", "Araclar": []}}}}

    try:
        # Iframe kontrolü
        driver, in_iframe = switch_to_frame_if_exists(driver, wait)

        # Step 1: EGM-TNB butonuna tıkla
        if result_label:
            result_label.config(text=f"Clicking EGM-TNB for {item_text}...")
        logger.debug(f"Attempting to click EGM-TNB button with selector: {SELECTORS['egm_button']}")
        if not click_element_merged(driver, *SELECTORS["egm_button"], "EGM-TNB button", item_text, result_label):
            logger.error("EGM-TNB button click failed")
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 2: Sorgula butonuna tıkla
        if result_label:
            result_label.config(text=f"Clicking Sorgula for {item_text}...")
        if not click_element_merged(driver, *SELECTORS["sorgula_button"], "Sorgula button", item_text, result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 3: Verileri çıkar
        if result_label:
            result_label.config(text=f"Extracting data for {item_text}...")
        table = wait.until(EC.presence_of_element_located(SELECTORS["data_table"]))
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", table)

        raw_data = table.text.strip()
        if not raw_data or "Kayıt bulunamadı" in raw_data:
            extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = "Kayıt bulunamadı"
        else:
            extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = "bulundu"
            rows = table.find_elements(By.XPATH, ".//tbody//tr[contains(@class, 'dx-row dx-data-row')]")
            if not rows:
                rows = table.find_elements(By.XPATH, ".//tbody//tr")

            for row in rows:
                cols = row.find_elements(By.TAG_NAME, "td")
                if len(cols) < 7 or not cols[0].text.strip():
                    continue

                arac = {
                    "No": cols[0].text.strip(),
                    "Plaka": cols[1].text.strip(),
                    "Marka": cols[2].text.strip(),
                    "Model": cols[3].text.strip(),
                    "Tipi": cols[4].text.strip(),
                    "Renk": cols[5].text.strip(),
                    "Cins": cols[6].text.strip(),
                    "Mahrumiyet": [],
                }

                try:
                    sorgula_button = row.find_element(By.CSS_SELECTOR, "[aria-label='Sorgula']")
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sorgula_button)
                    click_element_merged(driver, By.CSS_SELECTOR, "[aria-label='Sorgula']", "Vehicle Sorgula", f"{item_text} - Vehicle {arac['No']}")
                    extract_mahrumiyet_data(driver, wait, arac, item_text)
                    close_mahrumiyet_popup(driver, wait, item_text, arac, result_label)
                except Exception as e:
                    logger.warning(f"Failed to process Mahrumiyet for vehicle {arac['No']} - {arac['Plaka']}: {e}")
                    arac["Mahrumiyet"] = []

                extracted_data[dosya_no][item_text]["EGM"]["Araclar"].append(arac)

        if not extracted_data[dosya_no][item_text]["EGM"]["Araclar"]:
            extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = "Tablo satırları bulunamadı"

        save_to_json(extracted_data)
        if result_label:
            result_label.config(text=f"EGM sorgu completed for {item_text}")
        time.sleep(1)
        return True, extracted_data

    except Exception as e:
        logger.error(f"EGM sorgu error for {item_text}: {e}")
        if result_label:
            result_label.config(text=f"Error: {e}")
        save_to_json(extracted_data)
        return False, extracted_data

if __name__ == "__main__":
    # Test için örnek kullanım (isteğe bağlı)
    from selenium import webdriver
    driver = webdriver.Chrome()
    try:
        success, data = perform_egm_sorgu(driver, "FADİME KARAMAN - 30505166680", "2024/123")
        print("Success:", success)
        print("Data:", data)
    finally:
        driver.quit()