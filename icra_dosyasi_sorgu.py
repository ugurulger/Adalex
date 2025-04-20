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
    ElementClickInterceptedException,
    NoSuchElementException
)
from sorgulama_common import handle_popup_if_present, click_element_merged, save_to_json, get_logger, check_result_or_popup

# Global Sabitler
TIMEOUT = 15
RETRY_ATTEMPTS = 3
SLEEP_INTERVAL = 0.5

ICRA_DOSYASI_BUTTON_CSS = "button.query-button [title='İcra Dosyası']"
SORGULA_BUTTON_CSS = "[aria-label='Sorgula']"
SONUC_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[1]/div[2]/div[3]/div[2]/div/div[*]/div"
)
ICRA_DOSYALARI_TABLE_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div[*]/div[*]/div/div[*]/div/div[*]/div/div/div/div/table"
)
GENISLET_BUTTON_XPATH = (
    "/html/body/div[*]/div/div[*]/div/div/div/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div/div/div[*]/div/div[*]/div/div[*]/div/div/div[*]/div/div[*]/div[*]/div[*]/div[*]/div/div[*]/div/div[11]/div[1]/div[4]"
)

# Desktop path for JSON file
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "icra_dosyasi_sorgu.json")

def perform_icra_dosyasi_sorgu(driver, item_text, dosya_no, result_label=None):
    """
    Belirli bir dropdown öğesi için İcra Dosyası sorgusunu gerçekleştirir ve verileri çıkarır.
    Adımlar:
      1. İcra Dosyası butonuna tıklar.
      2. Sorgula butonuna tıklar.
      3. Sonuç ve icra dosyaları tablosundan verileri çıkarır.
         - Tabloyu doğrular, genişletir ve verileri toplar.
         - Veriler icra_dosyasi_sorgu.json dosyasına kaydedilir.
    
    Returns:
      Tuple (success: bool, data: dict) - İşlem durumu ve çıkarılan veriler.
    """
    logger = get_logger()
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
        if not click_element_merged(driver, By.CSS_SELECTOR, ICRA_DOSYASI_BUTTON_CSS,
                                   action_name="İcra Dosyası button", item_text=item_text, result_label=result_label):
            logger.error("Failed to click İcra Dosyası button")
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 2: Sorgula butonuna tıkla
        if result_label:
            result_label.config(text=f"Performing İcra Dosyası sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS,
                                   action_name="Sorgula button", item_text=item_text, result_label=result_label):
            logger.error("Failed to click Sorgula button")
            save_to_json(extracted_data)
            return False, extracted_data

        # Adım 3: Veri çıkarma
        if result_label:
            result_label.config(text=f"Performing İcra Dosyası sorgu for {item_text} - Extracting data...")

        # Pop-up ve SONUC_XPATH için paralel bekleme
        try:
            result = wait.until(lambda d: check_result_or_popup(d, (By.XPATH, SONUC_XPATH), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["İcra Dosyası"]["sonuc"] = result
                save_to_json(extracted_data)
                return False, extracted_data
            else:  # SONUC_XPATH elementi
                sonuc_element = result
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sonuc_element)
                wait.until(EC.visibility_of_element_located((By.XPATH, SONUC_XPATH)))
                raw_sonuc = sonuc_element.text.strip()
                extracted_data[dosya_no][item_text]["İcra Dosyası"]["sonuc"] = raw_sonuc
                logger.info(f"Extracted raw 'sonuc' for {item_text}: {raw_sonuc}")
        except TimeoutException:
            error_msg = f"Neither 'sonuc' element nor popup found for {item_text}"
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
            if not click_element_merged(driver, By.XPATH, GENISLET_BUTTON_XPATH,
                                       action_name="Expand button", item_text=item_text, result_label=result_label):
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