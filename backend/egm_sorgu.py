import logging
import time
import os
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException, ElementNotInteractableException
from sorgulama_common import click_element_merged, save_to_json, get_logger, check_result_or_popup

# Constants
TIMEOUT = 15
SLEEP_INTERVAL = 0.5
EGM_BUTTON_CSS = "button.query-button [title='EGM-TNB']"
SORGULA_BUTTON_CSS = ".dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.ms-auto"
DATA_XPATH = (
    "/html/body/div/div/div/div/div/div/div/div/div/div/div/div/div/div/div/div/div/"
    "div/div/div/div/div/div/div/div/div[1]/div[2]/div[3]/div[2]/div/div/div/div/div/div[2]"
)
MAHRUMIYET_POPUP_TABLE_XPATH = "/html/body/div/div/div/div/div/div/div/div/div[2]/div[1]/div/div/div[7]/div/div/div/div/table"
KAPAT_BUTTON_CSS = "[class*='dx-closebutton']"

# Configure logging
logger = get_logger()

# Benzersiz XPath oluştur. Mahrumiyet tablosu icin kullaniliyor
def get_element_xpath(element, driver):
    script = """
    function getXPath(element) {
        if (element.id !== '') return '//*[@id="' + element.id + '"]';
        if (element === document.body) return '/html/body';
        let ix = 0, siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            let sibling = siblings[i];
            if (sibling === element) 
                return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
        }
    }
    return getXPath(arguments[0]);
    """
    xpath = driver.execute_script(script, element)
    logger.info(f"Generated XPath: {xpath}")
    return xpath

def extract_mahrumiyet_data(driver, wait, arac, item_text):
    """
    Mahrumiyet tablosundaki tüm verileri, genişletme butonuna tıklayarak tek seferde çıkarır ve arac["Mahrumiyet"] listesine ekler.
    """
    logger = get_logger()
    all_mahrumiyet_data = []

    # Genişletme butonu XPath'i
    GENISLET_BUTTON_XPATH = "/html/body/div[*]/div/div[*]/div/div/div[*]/div/div/div[*]/div[*]/div/div/div[11]/div[1]/div[4]"

    try:
        # Mahrumiyet tablosunu bul
        mahrumiyet_table = wait.until(
            EC.presence_of_element_located((By.XPATH, MAHRUMIYET_POPUP_TABLE_XPATH))
        )
        logger.info(f"Mahrumiyet table located for vehicle {arac['No']} - {arac['Plaka']}")
        time.sleep(SLEEP_INTERVAL)  # Sabit bekleme, yükleme için
        # Genişletme butonuna tıklama
        try:
            logger.info(f"Expanding Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}")
            if not click_element_merged(driver, By.XPATH, GENISLET_BUTTON_XPATH,
                                       action_name="Expand button", 
                                       item_text=f"{item_text} - Vehicle {arac['No']}", 
                                       result_label=None):
                logger.warning(f"Failed to expand Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}, proceeding without expansion")
            else:
                # Genişletme sonrası tablonun yüklenmesini bekle
                time.sleep(SLEEP_INTERVAL)  # Sabit bekleme, yükleme için
                mahrumiyet_table = wait.until(
                    EC.presence_of_element_located((By.XPATH, MAHRUMIYET_POPUP_TABLE_XPATH))
                )
                logger.info(f"Mahrumiyet table reloaded after expansion for vehicle {arac['No']} - {arac['Plaka']}")
        except Exception as e:
            logger.warning(f"Error clicking expand button for vehicle {arac['No']} - {arac['Plaka']}: {e}")

        # Tablo satırlarını işle
        rows = mahrumiyet_table.find_elements(By.XPATH, ".//tbody//tr")
        if not rows:
            logger.warning(f"No rows found in Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}")
        else:
            logger.info(f"Found {len(rows)} rows in Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}")
            for row in rows:
                columns = row.find_elements(By.TAG_NAME, "td")
                if len(columns) >= 5:  # En az 5 sütun olmalı
                    mahrumiyet_kaydi = {
                        "Takyidat Sirasi": columns[0].text.strip(),
                        "Ekleyen Birim": columns[1].text.strip(),
                        "Ekleme Tarihi": columns[2].text.strip(),
                        "Serh Turu": columns[3].text.strip(),
                        "Kurum Adi": columns[4].text.strip()
                    }
                    if mahrumiyet_kaydi["Takyidat Sirasi"]:  # Boş kayıtları atla
                        all_mahrumiyet_data.append(mahrumiyet_kaydi)
                    else:
                        logger.debug(f"Skipped empty Mahrumiyet row for vehicle {arac['No']} - {arac['Plaka']}")
                else:
                    logger.warning(f"Row with insufficient columns in Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}: {row.text}")

        if not all_mahrumiyet_data:
            logger.info(f"No valid Mahrumiyet data extracted for vehicle {arac['No']} - {arac['Plaka']}")

        arac["Mahrumiyet"] = all_mahrumiyet_data
        logger.info(f"Extracted {len(all_mahrumiyet_data)} Mahrumiyet records for vehicle {arac['No']} - {arac['Plaka']}")

    except TimeoutException as e:
        logger.warning(f"Mahrumiyet table not found for vehicle {arac['No']} - {arac['Plaka']}: {e}")
        arac["Mahrumiyet"] = []
    except Exception as e:
        logger.warning(f"Error extracting Mahrumiyet data for vehicle {arac['No']} - {arac['Plaka']}: {e}")
        arac["Mahrumiyet"] = []

def close_mahrumiyet_popup(driver, wait, item_text, arac, result_label=None):
    """
    Close the Mahrumiyet pop-up using a simple CSS selector and verify closure.
    """
    logger.info(f"Closing Mahrumiyet pop-up for vehicle {arac['No']} - {arac['Plaka']}")
    try:
        click_element_merged(driver, By.CSS_SELECTOR, KAPAT_BUTTON_CSS, 
                            action_name="Kapat button", 
                            item_text=f"{item_text} - Vehicle {arac['No']}", 
                            result_label=result_label)
        time.sleep(1)
        try:
            wait.until(EC.invisibility_of_element_located((By.XPATH, MAHRUMIYET_POPUP_TABLE_XPATH)))
            logger.info(f"Mahrumiyet pop-up closed for vehicle {arac['No']} - {arac['Plaka']}")
        except TimeoutException as e:
            logger.warning(f"Timeout waiting for Mahrumiyet pop-up to close for vehicle {arac['No']} - {arac['Plaka']}: {e}")
            try:
                if driver.find_element(By.XPATH, MAHRUMIYET_POPUP_TABLE_XPATH).is_displayed():
                    logger.warning(f"Mahrumiyet pop-up still open for vehicle {arac['No']} - {arac['Plaka']}, attempting to close again")
                    click_element_merged(driver, By.CSS_SELECTOR, KAPAT_BUTTON_CSS, 
                                        action_name="Kapat button (retry)", 
                                        item_text=f"{item_text} - Vehicle {arac['No']}", 
                                        result_label=result_label)
                    time.sleep(1)
            except Exception:
                logger.info(f"Mahrumiyet pop-up finally closed for vehicle {arac['No']} - {arac['Plaka']}")
    except Exception as e:
        logger.warning(f"Failed to close Mahrumiyet pop-up for vehicle {arac['No']} - {arac['Plaka']}: {e}")

def perform_egm_sorgu(driver, item_text, dosya_no, result_label=None):
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
        dosya_no: {
            item_text: {
                "EGM": {
                    "Sonuc": "",
                    "Araclar": []
                }
            }
        }
    }

    try:
        # Step 1: Click the EGM-TNB button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking EGM-TNB button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, EGM_BUTTON_CSS, 
                                  action_name="EGM-TNB button", 
                                  item_text=item_text, 
                                  result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 2: Click the "Sorgula" button
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Clicking Sorgula button...")
        if not click_element_merged(driver, By.CSS_SELECTOR, SORGULA_BUTTON_CSS, 
                                  action_name="Sorgula button", 
                                  item_text=item_text, 
                                  result_label=result_label):
            save_to_json(extracted_data)
            return False, extracted_data

        # Step 3: Extract data from the specified XPath
        if result_label:
            result_label.config(text=f"Performing EGM sorgu for {item_text} - Extracting data...")
        try:
            # Pop-up ve DATA_XPATH için paralel bekleme
            result = wait.until(lambda d: check_result_or_popup(d, (By.XPATH, DATA_XPATH), item_text, result_label))
            if isinstance(result, str):  # Pop-up mesajı
                extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = result
                save_to_json(extracted_data)
                logger.info(f"Popup detected for {item_text}: {result}")
                return False, extracted_data
            else:  # DATA_XPATH elementi
                data_element = result
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", data_element)
                logger.info(f"data_element content for {item_text}: {data_element.text}")

                raw_data = data_element.text.strip()
                if not raw_data:
                    logger.warning(f"Extracted data is empty for {item_text}")
                    extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = "Kayıt bulunamadı"
                elif "araç kaydı yok" in raw_data:
                    extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = raw_data
                else:
                    extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = "bulundu"
                    tables = [data_element]
                    logger.info(f"Found {len(tables)} tables for {item_text}")

                    if tables:
                        for idx, table in enumerate(tables):
                            logger.info(f"Table {idx} content for {item_text}: {table.text}")
                            rows = table.find_elements(By.XPATH, ".//tbody//tr[contains(@class, 'dx-row dx-data-row')]")
                            if not rows:
                                rows = table.find_elements(By.XPATH, ".//tbody//tr")
                                if not rows:
                                    logger.warning(f"No rows found in table {idx} for {item_text}")
                                    continue
                                else:
                                    logger.info(f"Found {len(rows)} rows in table {idx} using general tbody//tr XPath for {item_text}")
                            else:
                                logger.info(f"Found {len(rows)} rows in table {idx} with class 'dx-row dx-data-row' for {item_text}")

                            rows_texts = [row.text for row in rows]
                            logger.info(f"All rows in table {idx} for {item_text}: {rows_texts}")

                            if rows_texts:
                                for row_idx in range(len(rows_texts)):
                                    try:
                                        table = driver.find_element(By.XPATH, DATA_XPATH)
                                        rows = table.find_elements(By.XPATH, ".//tbody//tr[contains(@class, 'dx-row dx-data-row')]") or table.find_elements(By.XPATH, ".//tbody//tr")
                                        if row_idx >= len(rows):
                                            logger.warning(f"Row {row_idx} no longer exists in table {idx} for {item_text}, skipping")
                                            continue
                                        row = rows[row_idx]
                                        columns = row.find_elements(By.TAG_NAME, "td")
                                        logger.info(f"Row {row_idx} in table {idx} has {len(columns)} columns: {[col.text for col in columns]}")
                                        if "dx-header-row" in row.get_attribute("class") or (columns and columns[0].text.strip() == "No"):
                                            logger.info(f"Row {row_idx} in table {idx} is likely a header row, skipping")
                                            continue
                                        if len(columns) >= 1:
                                            arac = {
                                                "No": columns[0].text.strip() if len(columns) > 0 else "",
                                                "Plaka": columns[1].text.strip() if len(columns) > 1 else "",
                                                "Marka": columns[2].text.strip() if len(columns) > 2 else "",
                                                "Model": columns[3].text.strip() if len(columns) > 3 else "",
                                                "Tipi": columns[4].text.strip() if len(columns) > 4 else "",
                                                "Renk": columns[5].text.strip() if len(columns) > 5 else "",
                                                "Cins": columns[6].text.strip() if len(columns) > 6 else "",
                                                "Mahrumiyet": []
                                            }
                                            try:
                                                # Sorgula butonunu bul
                                                sorgula_button = row.find_element(By.CSS_SELECTOR, "[aria-label='Sorgula']")
                                                logger.info(f"Clicking Sorgula button for vehicle {arac['No']} - {arac['Plaka']}")

                                                # XPath'i al
                                                xpath_selector = get_element_xpath(sorgula_button, driver)

                                                # Scroll ve tıklama
                                                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", sorgula_button)
                                                time.sleep(SLEEP_INTERVAL)
                                                click_element_merged(driver, By.XPATH, xpath_selector, 
                                                                    action_name="Sorgula button in row", 
                                                                    item_text=f"{item_text} - Vehicle {arac['No']}", 
                                                                    result_label=result_label)
                                            except Exception as e:
                                                logger.warning(f"Could not locate or click Sorgula button in row for vehicle {arac['No']} - {arac['Plaka']}: {e}")
                                                continue

                                            try:
                                                driver.switch_to.default_content()
                                                extract_mahrumiyet_data(driver, wait, arac, item_text)
                                                close_mahrumiyet_popup(driver, wait, item_text, arac, result_label)
                                            except TimeoutException as e:
                                                logger.warning(f"Failed to locate Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}: {e}")
                                                arac["Mahrumiyet"] = []
                                            except StaleElementReferenceException as e:
                                                logger.warning(f"Stale element error for Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}: {e}")
                                                try:
                                                    mahrumiyet_table = driver.find_element(By.XPATH, MAHRUMIYET_POPUP_TABLE_XPATH)
                                                    logger.info(f"Mahrumiyet table content (retry) for vehicle {arac['No']} - {arac['Plaka']}: {mahrumiyet_table.text}")
                                                    extract_mahrumiyet_data(driver, wait, arac, item_text)
                                                    close_mahrumiyet_popup(driver, wait, item_text, arac, result_label)
                                                except Exception as e2:
                                                    logger.warning(f"Retry failed for Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}: {e2}")
                                                    arac["Mahrumiyet"] = []
                                            except Exception as e:
                                                logger.warning(f"Error reading Mahrumiyet table for vehicle {arac['No']} - {arac['Plaka']}: {e}")
                                                arac["Mahrumiyet"] = []

                                            extracted_data[dosya_no][item_text]["EGM"]["Araclar"].append(arac)
                                    except Exception as e:
                                        logger.warning(f"Error processing row {row_idx} for {item_text}: {e}")
                                        continue

                    if not extracted_data[dosya_no][item_text]["EGM"]["Araclar"]:
                        logger.warning(f"No valid data rows found in any table for {item_text}")
                        extracted_data[dosya_no][item_text]["EGM"]["Sonuc"] = "Tablo satırları bulunamadı"

                    logger.info(f"Successfully extracted data for {item_text}: {extracted_data}")

        except TimeoutException as e:
            error_msg = f"Neither data element nor popup found for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            save_to_json(extracted_data)
            return False, extracted_data
        except Exception as e:
            error_msg = f"Error extracting data for {item_text}: {e}"
            if result_label:
                result_label.config(text=error_msg)
            logger.error(error_msg)
            save_to_json(extracted_data)
            return False, extracted_data

        if result_label:
            result_label.config(text=f"EGM sorgu completed for {item_text}")
        logger.info(f"Waiting 3 seconds after processing {item_text}")
        time.sleep(3)
        
        save_to_json(extracted_data)
        return True, extracted_data

    except Exception as e:
        error_msg = f"EGM sorgu error for {item_text}: {e}"
        if result_label:
            result_label.config(text=error_msg)
        logger.error(error_msg)
        save_to_json(extracted_data)
        return False, extracted_data