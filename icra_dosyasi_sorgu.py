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
OVERLAY_SELECTOR = ".dx-loadpanel-indicator dx-loadindicator dx-widget"

# İcra Dosyası butonu ve diğer selector'lar
ICRA_DOSYASI_BUTTON_CSS = "button.query-button [title='İcra Dosyası']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
SONUC_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div[2]/div/div[*]/div"
)  # Yer tutucu, gerçek XPath gerekli
ICRA_DOSYALARI_TABLE_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div[*]/div[*]/div/div[*]/div/div[*]/div/div/div/div/table"
)  # Yer tutucu, gerçek XPath gerekli
GENISLET_BUTTON_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div[*]/div[*]/div/div[*]/div/div[11]/div[1]/div[4]"
)  # Yer tutucu, gerçek XPath gerekli

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "icra_dosyasi_sorgu.json")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(extracted_data):
    """
    Save or update extracted_data to icra_dosyasi_sorgu.json on the desktop.
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
    for attempt in range(RETRY_ATTEMPTS):
        try:

            if OVERLAY_SELECTOR:
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, OVERLAY_SELECTOR)), "Overlay persists")
                logger.info("ilk overlay gone.")

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
                logger.info("ikinci overlay gone.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def perform_icra_dosyasi_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için İcra Dosyası sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. İcra Dosyası butonuna tıklar.
      2. Sorgula butonuna tıklar.
      3. Sonuç ve icra dosyaları tablosundan verileri çıkarır.
         - Tabloyu doğrular, genişletir ve verileri toplar.
         - Veriler icra_dosyasi_sorgu.json dosyasına kaydedilir.
    
    Args:
        driver: Selenium WebDriver nesnesi.
        item_text (str): Dropdown öğesinin metni.
        dosya_no (str): Dosya numarası.
        result_label: Durum mesajlarını göstermek için opsiyonel UI etiketi.
    
    Returns:
        Tuple[bool, dict]: İşlem durumu (True/False) ve çıkarılan veriler.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        dosya_no: {
            item_text: {
                "İcra Dosyası": {
                    "sonuc": "",
                    "icra_dosyalari": []
                }
            }
        }
    }

    try:
        # Adım 1: İcra Dosyası butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing İcra Dosyası sorgu for {item_text} - Clicking İcra Dosyası button...")
            
        if not click_element_merged(
            driver, By.CSS_SELECTOR, ICRA_DOSYASI_BUTTON_CSS,
            action_name="İcra Dosyası button", item_text=item_text, result_label=result_label
        ):
            logger.error("Failed to click İcra Dosyası button")
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 2: Sorgula butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing İcra Dosyası sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(
            driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
            action_name="Sorgula button", item_text=item_text, result_label=result_label
        ):
            logger.error("Failed to click Sorgula button")
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 3: Veri çıkarma
        if result_label:
            result_label.config(text=f"Performing İcra Dosyası sorgu for {item_text} - Extracting data...")

        # Sonuç alanını çıkar
        try:
            sonuc_element = wait.until(EC.presence_of_element_located((By.XPATH, SONUC_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
            extracted_data[dosya_no][item_text]["İcra Dosyası"]["sonuc"] = sonuc_element.text.strip()
            logger.info(f"Extracted raw 'sonuc' for {item_text}: {extracted_data[dosya_no][item_text]['İcra Dosyası']['sonuc']}")
        except TimeoutException as e:
            error_msg = f"Failed to locate 'sonuc' element for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            extracted_data[dosya_no][item_text]["İcra Dosyası"]["sonuc"] = ""

        # İcra dosyaları tablosunu doğrula ve verileri çıkar
        try:
            if result_label:
                result_label.config(text=f"Verifying icra_dosyalari table for {item_text}...")
            icra_dosyalari_table = wait.until(EC.presence_of_element_located((By.XPATH, ICRA_DOSYALARI_TABLE_XPATH)))

            # Yanlış tabloyu kontrol et (tbody/tr[2]/td/b var mı?)
            if icra_dosyalari_table.find_elements(By.XPATH, ".//tbody/tr[2]/td/b"):
                error_msg = f"Table for {item_text} contains tbody/tr[2]/td/b, indicating wrong table"
                if result_label:
                    result_label.config(text=error_msg)
                logger.info(error_msg)
                save_to_json(extracted_data)
                return False, extracted_data

            # Doğru tabloyu kontrol et (tbody/tr[1]/td[1] var mı?)
            if not icra_dosyalari_table.find_elements(By.XPATH, ".//tbody/tr[1]/td[1]"):
                error_msg = f"Table for {item_text} does not contain tbody/tr[1]/td[1]"
                if result_label:
                    result_label.config(text=error_msg)
                logger.error(error_msg)
                save_to_json(extracted_data)
                return False, extracted_data

            # Tablo doğrulandı, genişlet butonuna tıkla
            if result_label:
                result_label.config(text=f"Expanding icra_dosyalari table for {item_text}...")
            if not click_element_merged(
                driver, By.XPATH, GENISLET_BUTTON_XPATH,
                action_name="Expand button", item_text=item_text, result_label=result_label
            ):
                logger.warning(f"Failed to expand table for {item_text}, proceeding without expansion")
            else:
                # Genişletme sonrası tablonun yüklendiğinden emin ol
                wait.until(EC.visibility_of_element_located((By.XPATH, ICRA_DOSYALARI_TABLE_XPATH + "//tbody/tr[td]")))

            # Veriyi çıkar
            if result_label:
                result_label.config(text=f"Extracting icra_dosyalari table for {item_text}...")
            for _ in range(RETRY_ATTEMPTS):  # Stale hatasına karşı tekrar dene
                try:
                    icra_dosyalari_table = wait.until(EC.presence_of_element_located((By.XPATH, ICRA_DOSYALARI_TABLE_XPATH)))
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", icra_dosyalari_table)
                    rows = icra_dosyalari_table.find_elements(By.XPATH, ".//tbody/tr[td]")
                    if not rows:
                        logger.warning(f"No valid data rows found in 'icra_dosyalari' table for {item_text}")
                    else:
                        for row in rows:
                            columns = row.find_elements(By.TAG_NAME, "td")
                            if len(columns) >= 7:  # 7 sütun bekleniyor
                                icra_dosyasi = {
                                    "No": columns[0].text.strip(),
                                    "Birim Adi/Dosya": columns[1].text.strip(),
                                    "Takip Türü": columns[2].text.strip(),
                                    "Takip Yolu/Şekli": columns[3].text.strip(),
                                    "Durumu": columns[4].text.strip(),
                                    "Açılış": columns[5].text.strip(),
                                    "Kapanış": columns[6].text.strip()
                                }
                                if icra_dosyasi["No"]:
                                    extracted_data[dosya_no][item_text]["İcra Dosyası"]["icra_dosyalari"].append(icra_dosyasi)
                            else:
                                logger.warning(f"Row with insufficient columns for {item_text}: {[col.text for col in columns]}")

                        if not extracted_data[dosya_no][item_text]["İcra Dosyası"]["icra_dosyalari"]:
                            logger.info(f"No valid icra_dosyasi data extracted for {item_text}")
                    break  # Başarılıysa döngüden çık
                except StaleElementReferenceException:
                    logger.warning(f"Stale element detected for {item_text}, retrying...")
                    continue

        except TimeoutException as e:
            error_msg = f"Failed to locate 'icra_dosyalari' table for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            save_to_json(extracted_data)
            return False, extracted_data
        except Exception as e:
            logger.warning(f"Error extracting 'icra_dosyalari' table for {item_text}: {e}")

        if result_label:
            result_label.config(text=f"İcra Dosyası sorgu completed for {item_text}")
        logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"İcra Dosyası sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data