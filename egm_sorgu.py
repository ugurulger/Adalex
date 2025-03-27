import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementNotInteractableException

# Constants
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5
EGM_BUTTON_CSS = "button.query-button [title='EGM-TNB']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
DATA_XPATH = (
    "/html/body/div[2]/div/div[2]/div/div/div/div/div[2]/div/div/div[9]/div/div[1]/div[1]/div/div/div[2]/"
    "div/div[2]/div/div[2]/div/div/div[1]/div/div[1]/div[2]/div[3]/div[2]/div/div/div/div/div/div[2]"
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def click_with_retry(driver, wait, css_selector, action_name, item_text, result_label=None, retries=RETRY_ATTEMPTS):
    """
    Click an element with retry logic, using both standard click and JavaScript fallback.
    """
    for attempt in range(retries):
        try:
            element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, css_selector)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            time.sleep(SLEEP_INTERVAL)
            element.click()
            logger.info(f"Clicked {action_name} for {item_text} (attempt {attempt + 1})")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException) as e:
            logger.warning(f"{action_name} click attempt {attempt + 1} failed for {item_text}: {e}")
            try:
                element = driver.find_element(By.CSS_SELECTOR, css_selector)
                driver.execute_script("arguments[0].click();", element)
                logger.info(f"Clicked {action_name} via JavaScript for {item_text} (attempt {attempt + 1})")
                return True
            except Exception as e2:
                logger.warning(f"JavaScript click also failed: {e2}")
            time.sleep(1)
    error_msg = f"Failed to click {action_name} for {item_text} after {retries} attempts"
    if result_label:
        result_label.config(text=error_msg)
    logger.error(error_msg)
    return False

def perform_egm_sorgu(driver, item_text, result_label=None):
    """
    Perform the EGM-TNB sorgu for a specific dropdown item and extract data.
    Steps:
        1. Click the EGM-TNB button.
        2. Click the "Sorgula" button.
        3. Extract data from the specified XPath (scrolling handled by centering data_element).
    Returns:
        Tuple (success: bool, data: dict) - Success status and extracted data as a structured dictionary.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    extracted_data = {
        "Dosya no": "",  # Arama yapılan dosya numarası (şimdilik boş, gerekirse ekleriz)
        "EGM": {
            item_text: {
                "Sonuc": "",
                "Araclar": []
            }
        }
    }

    try:
        # Step 1: Click the EGM-TNB button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking EGM-TNB button...")
        if not click_with_retry(driver, wait, EGM_BUTTON_CSS, "EGM-TNB button", item_text, result_label):
            return False, extracted_data

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking Sorgula button...")
        if not click_with_retry(driver, wait, SORGULA_BUTTON_CSS, "Sorgula button", item_text, result_label):
            return False, extracted_data
        # Pop-up'ın yüklenmesini dinamik olarak bekle
        wait.until(EC.presence_of_element_located((By.XPATH, DATA_XPATH)))

        # Step 3: Extract data from the specified XPath
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Extracting data...")
        try:
            # Tabloyu içeren ana elementi bul
            data_element = wait.until(EC.presence_of_element_located((By.XPATH, DATA_XPATH)))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", data_element)

            # data_element'in içeriğini logla
            logger.info(f"data_element content for {item_text}: {data_element.text}")

            # Tabloyu kontrol et
            raw_data = data_element.text.strip()
            if not raw_data:
                logger.warning(f"Extracted data is empty for {item_text}")
                extracted_data["EGM"][item_text]["Sonuc"] = "Kayıt bulunamadı"
            elif "Kayıt bulunamadı" in raw_data:
                extracted_data["EGM"][item_text]["Sonuc"] = raw_data
            else:
                extracted_data["EGM"][item_text]["Sonuc"] = "bulundu"
                # Tabloyu bul (zaten DATA_XPATH ile tabloyu hedefledik)
                tables = [data_element]  # DATA_XPATH zaten tabloyu hedefliyor
                logger.info(f"Found {len(tables)} tables for {item_text}")

                if tables:
                    # Her tabloyu kontrol et, veri içeren tabloyu bul
                    for idx, table in enumerate(tables):
                        logger.info(f"Table {idx} content for {item_text}: {table.text}")
                        # Tablo satırlarını bul (tbody içindeki tr etiketleri)
                        rows = table.find_elements(By.XPATH, ".//tbody//tr[contains(@class, 'dx-row dx-data-row')]")
                        if not rows:
                            # Daha genel bir XPath ile satırları bulmayı dene
                            rows = table.find_elements(By.XPATH, ".//tbody//tr")
                            if not rows:
                                logger.warning(f"No rows found in table {idx} for {item_text}")
                                continue
                            else:
                                logger.info(f"Found {len(rows)} rows in table {idx} using general tbody//tr XPath for {item_text}")
                        else:
                            logger.info(f"Found {len(rows)} rows in table {idx} with class 'dx-row dx-data-row' for {item_text}")

                        # rows listesinin tamamını logla
                        logger.info(f"All rows in table {idx} for {item_text}: {[row.text for row in rows]}")

                        if rows:
                            # Header satırını atla ve tüm veri satırlarını işle
                            for row_idx, row in enumerate(rows):
                                # İlk satır header olabilir, kontrol edelim
                                columns = row.find_elements(By.TAG_NAME, "td")
                                logger.info(f"Row {row_idx} in table {idx} has {len(columns)} columns: {[col.text for col in columns]}")
                                # Header satırını atlamak için bir kontrol: Sınıf veya içerik kontrolü
                                if "dx-header-row" in row.get_attribute("class") or (columns and columns[0].text.strip() == "No"):
                                    logger.info(f"Row {row_idx} in table {idx} is likely a header row, skipping")
                                    continue
                                if len(columns) >= 1:  # En az 1 sütun olmalı, diğerleri opsiyonel
                                    arac = {
                                        "No": columns[0].text.strip() if len(columns) > 0 else "",
                                        "Plaka": columns[1].text.strip() if len(columns) > 1 else "",
                                        "Marka": columns[2].text.strip() if len(columns) > 2 else "",
                                        "Model": columns[3].text.strip() if len(columns) > 3 else "",
                                        "Tipi": columns[4].text.strip() if len(columns) > 4 else "",
                                        "Renk": columns[5].text.strip() if len(columns) > 5 else "",
                                        "Cins": columns[6].text.strip() if len(columns) > 6 else "",
                                        "Mahrumiyet": ""  # Şimdilik boş, ikinci aşamada dolacak
                                    }
                                    extracted_data["EGM"][item_text]["Araclar"].append(arac)
                                else:
                                    logger.warning(f"Row {row_idx} in table {idx} does not have enough columns for {item_text}: {row.text}")

                if not extracted_data["EGM"][item_text]["Araclar"]:
                    logger.warning(f"No valid data rows found in any table for {item_text}")
                    extracted_data["EGM"][item_text]["Sonuc"] = "Tablo satırları bulunamadı"

                logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        except TimeoutException as e:
            error_msg = f"Failed to locate data element for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False, extracted_data
        except Exception as e:
            error_msg = f"Error extracting data for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            return False, extracted_data

        if result_label:
            result_label.config(text=f"EGM sorgu completed for {item_text}")
        logger.info(f"Waiting 10 seconds after processing {item_text}")
        time.sleep(10)  # Bu beklemeyi de dinamik hale getirebiliriz, ama şimdilik bıraktım
        return True, extracted_data

    except Exception as e:
        error_msg = f"EGM sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        return False, extracted_data