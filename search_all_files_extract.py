import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_data_from_table(driver):
    try:
        wait, short_wait = WebDriverWait(driver, 15), WebDriverWait(driver, 2)

        # Wait for the table to load
        logger.info("Waiting for table to load...")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#adaletDataGridContainer > div > div.dx-datagrid-rowsview > div > div > div > div > table")))
        logger.info("Table container found on page.")

        # Scroll down to load all table rows
        logger.info("Scrolling down the page to load all table rows...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        for attempt in range(5):
            if time.time() - time.time() > 10:
                logger.warning("Max scroll timeout reached. Proceeding with available rows.")
                break
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            try:
                short_wait.until(lambda d: d.execute_script("return document.body.scrollHeight") > last_height)
                last_height = driver.execute_script("return document.body.scrollHeight")
                logger.info(f"Scroll attempt {attempt + 1} triggered more content.")
            except TimeoutException:
                logger.info("No more content loaded after scroll. Proceeding with available rows.")
                break
            time.sleep(0.5)

        # Process the first row
        extracted_data, row_index = [], 1

        table = driver.find_element(By.CSS_SELECTOR, "#adaletDataGridContainer > div > div.dx-datagrid-rowsview > div > div > div > div > table")
        rows = table.find_elements(By.CSS_SELECTOR, "tbody > tr")
        if not rows:
            logger.error("No rows found in table.")
            return extracted_data

        logger.info(f"Processing Row {row_index} of {len(rows)}...")
        row = rows[row_index - 1]

        # Extract 'Genel' data
        cells = row.find_elements(By.TAG_NAME, "td")
        if len(cells) < 5:
            logger.warning(f"Row {row_index} has fewer than 5 columns: {len(cells)}. Skipping.")
            return extracted_data

        dosya_no = cells[1].text.strip()
        if not dosya_no or not "/" in dosya_no:
            logger.debug(f"Row {row_index} skipped: No valid 'Dosya No' found ({dosya_no}). Likely not a data row.")
            return extracted_data

        dosya_durumu = cells[3].find_element(By.CSS_SELECTOR, "div.label-light").text.strip() if cells[3].find_elements(By.CSS_SELECTOR, "div.label-light") else cells[3].text.strip()

        row_data = {
            "Genel": {
                "Birim": cells[0].text.strip(),
                "Dosya No": dosya_no,
                "Dosya Türü": cells[2].text.strip(),
                "Dosya Durumu": dosya_durumu,
                "Dosya Açılış Tarihi": cells[4].text.strip()
            },
            "Dosya Bilgileri": {},
            "Dosya Hesabı": {},
            "Taraf Bilgileri": {}
        }

        extracted_data.append(row_data)

        # Click to open popup
        try:
            dosya_goruntule = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#dosya-goruntule")))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dosya_goruntule)
            dosya_goruntule.click()
            logger.info(f"Clicked #dosya-goruntule for Row {row_index} using WebDriverWait.")
        except ElementClickInterceptedException:
            logger.warning(f"Click intercepted for #dosya-goruntule in Row {row_index}. Trying JavaScript click...")
            dosya_goruntule = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#dosya-goruntule")))
            driver.execute_script("arguments[0].click();", dosya_goruntule)
            logger.info(f"JavaScript clicked #dosya-goruntule for Row {row_index}.")
        except NoSuchElementException:
            logger.error(f"#dosya-goruntule not found in Row {row_index}. Skipping popup.")
            return extracted_data
        except TimeoutException:
            logger.error(f"Timeout waiting for #dosya-goruntule to be clickable in Row {row_index}. Pausing for manual inspection...")
            driver.save_screenshot(f"popup_error_row_{row_index}_button.png")
            time.sleep(60)
            raise Exception("Manual inspection required: #dosya-goruntule not found or not clickable. Check popup and provide correct selector.")

        # Wait for the tabs container to be visible
        wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[1]/div")))
        logger.info(f"Tabs container found for Row {row_index}.")
        time.sleep(0.5)
                                                            
        # Helper function to check and click tabs if they exist
        def check_and_click_tab(tab_name):
            try:
                tabs = driver.execute_script("return document.querySelectorAll('div.dx-item-content.dx-tab-content span.dx-tab-text')")
                for tab in tabs:
                    text = driver.execute_script("return arguments[0].textContent || arguments[0].innerText", tab)
                    if tab_name in text:
                        driver.execute_script("arguments[0].click();", driver.execute_script("return arguments[0].parentElement.parentElement", tab))
                        logger.info(f"Clicked '{tab_name}' tab for Row {row_index} (text: {text}).")
                        time.sleep(0.5)
                        return True
                logger.warning(f"'{tab_name}' tab not found for Row {row_index}. Skipping...")
                return False
            except Exception as e:
                logger.error(f"Error checking/clicking '{tab_name}' tab: {e}")
                return False

        # Check and extract 'Dosya Bilgileri' if tab exists
        if check_and_click_tab("Dosya Bilgileri"):
            wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[2]/div/div/div[1]/div/div[1]/div[1]/div/div/div[2]/table/tbody")))
            logger.info(f"'Dosya Bilgileri' content loaded for Row {row_index}.")

            # Extract 'Dosya Bilgileri' data with conditions and flexible paths
            dosya_bilgileri = {"Türü": "Not found", "Yolu": "Not found", "Şekli": "Not found"}  # Default values

            # Base XPath for flexibility
            base_xpath = "//div/div[2]/div/div/div/div/div[2]/div/div/div[1]/div/div[1]/div[1]/div/div/div[2]/table/tbody"

            # Check and extract Türü
            turi_label_xpath = f"{base_xpath}/tr[1]/td[1]"
            turi_value_xpath = f"{base_xpath}/tr[1]/td[2]"
            if driver.find_elements(By.XPATH, turi_label_xpath):
                turi_label = driver.find_element(By.XPATH, turi_label_xpath).text.strip()
                if turi_label == "Türü":
                    dosya_bilgileri["Türü"] = driver.find_element(By.XPATH, turi_value_xpath).text.strip() if driver.find_elements(By.XPATH, turi_value_xpath) else "Not found"

            # Check and extract Yolu
            yolu_label_xpath = f"{base_xpath}/tr[2]/td[1]"
            yolu_value_xpath = f"{base_xpath}/tr[2]/td[2]"
            if driver.find_elements(By.XPATH, yolu_label_xpath):
                yolu_label = driver.find_element(By.XPATH, yolu_label_xpath).text.strip()
                if yolu_label == "Yolu":
                    dosya_bilgileri["Yolu"] = driver.find_element(By.XPATH, yolu_value_xpath).text.strip() if driver.find_elements(By.XPATH, yolu_value_xpath) else "Not found"

            # Check and extract Şekli
            sekli_label_xpath = f"{base_xpath}/tr[3]/td[1]"
            sekli_value_xpath = f"{base_xpath}/tr[3]/td[2]"
            if driver.find_elements(By.XPATH, sekli_label_xpath):
                sekli_label = driver.find_element(By.XPATH, sekli_label_xpath).text.strip()
                if sekli_label == "Şekli":
                    dosya_bilgileri["Şekli"] = driver.find_element(By.XPATH, sekli_value_xpath).text.strip() if driver.find_elements(By.XPATH, sekli_value_xpath) else "Not found"

            row_data["Dosya Bilgileri"] = dosya_bilgileri
            logger.info(f"Dosya Bilgileri extracted for Row {row_index}: {row_data['Dosya Bilgileri']}")
        else:
            logger.warning("Skipping 'Dosya Bilgileri' extraction due to missing tab.")

        # Check and extract 'Dosya Hesabı' if tab exists
        if check_and_click_tab("Dosya Hesabı"):
            wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[2]/div/div/div[2]/div/div[1]/div[1]/div/div/div[2]/div/table/tbody")))
            logger.info(f"'Dosya Hesabı' content loaded for Row {row_index}.")

            # Base XPath for flexibility
            base_xpath = "//div/div[2]/div/div/div/div/div[2]/div/div/div[2]/div/div[1]/div[1]/div/div/div[2]/div/table/tbody"

            # Extract 'Dosya Hesabı' data
            takipte_kesinlesen_miktar = driver.find_element(By.XPATH, f"{base_xpath}/tr[1]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[1]/td[2]") else ""
            toplam_faiz_miktari = driver.find_element(By.XPATH, f"{base_xpath}/tr[2]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[2]/td[2]") else ""
            vekalet_ucreti = driver.find_element(By.XPATH, f"{base_xpath}/tr[3]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[3]/td[2]") else ""
            masraf_miktari = driver.find_element(By.XPATH, f"{base_xpath}/tr[4]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[4]/td[2]") else ""
            tahsil_harci = driver.find_element(By.XPATH, f"{base_xpath}/tr[5]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[5]/td[2]") else ""
            toplam_alacak = driver.find_element(By.XPATH, f"{base_xpath}/tr[6]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[6]/td[2]") else ""
            yatan_para = driver.find_element(By.XPATH, f"{base_xpath}/tr[7]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[7]/td[2]") else ""
            bakiye_borc_miktari = driver.find_element(By.XPATH, f"{base_xpath}/tr[8]/td[2]").text.strip() if driver.find_elements(By.XPATH, f"{base_xpath}/tr[8]/td[2]") else ""

            row_data["Dosya Hesabı"] = {
                "Takipte Kesinleşen Miktar": takipte_kesinlesen_miktar,
                "Toplam Faiz Miktarı": toplam_faiz_miktari,
                "Vekalet Ücreti": vekalet_ucreti,
                "Masraf Miktarı": masraf_miktari,
                "Tahsil Harcı": tahsil_harci,
                "Toplam Alacak": toplam_alacak,
                "Yatan Para": yatan_para,
                "Bakiye Borç Miktarı": bakiye_borc_miktari
            }
            logger.info(f"Dosya Hesabı extracted for Row {row_index}: {row_data['Dosya Hesabı']}")
        else:
            logger.warning("Skipping 'Dosya Hesabı' extraction due to missing tab.")

        # Check and extract 'Taraf Bilgileri' if tab exists
        if check_and_click_tab("Taraf Bilgileri"):
            wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[2]/div/div//div/div[1]/div[1]/div/div/div[2]/div/div/div[6]/div/div/div/div/table/tbody")))
            logger.info(f"'Taraf Bilgileri' content loaded for Row {row_index}.")

            # Extract 'Taraf Bilgileri' data dynamically for all Taraf entries
            taraf_data = {}
            taraf_index = 1
            while True:
                try:
                    # Define the base XPath and format it with taraf_index
                    base_xpath = f"//div/div[2]/div/div/div/div/div[2]/div/div//div/div[1]/div[1]/div/div/div[2]/div/div/div[6]/div/div/div/div/table/tbody/tr[{taraf_index}]"
                    rol_xpath = f"{base_xpath}/td[1]"
                    tipi_xpath = f"{base_xpath}/td[2]"
                    adi_xpath = f"{base_xpath}/td[3]"
                    vekil_xpath = f"{base_xpath}/td[4]"

                    rol = driver.find_element(By.XPATH, rol_xpath).text.strip() if driver.find_elements(By.XPATH, rol_xpath) else ""
                    tipi = driver.find_element(By.XPATH, tipi_xpath).text.strip() if driver.find_elements(By.XPATH, tipi_xpath) else ""
                    adi = driver.find_element(By.XPATH, adi_xpath).text.strip() if driver.find_elements(By.XPATH, adi_xpath) else ""
                    vekil = driver.find_element(By.XPATH, vekil_xpath).text.strip() if driver.find_elements(By.XPATH, vekil_xpath) else ""

                    if not rol and not tipi and not adi and not vekil:
                        break  # No more Taraf entries found

                    taraf_data[f"Taraf{taraf_index}"] = {
                        "Rol": rol,
                        "Tipi": tipi,
                        "Adi": adi,
                        "Vekil": vekil
                    }
                    logger.debug(f"Extracted Taraf{taraf_index}: {taraf_data[f'Taraf{taraf_index}']}")
                    taraf_index += 1
                except NoSuchElementException:
                    break  # Stop if no more Taraf entries exist

            row_data["Taraf Bilgileri"] = taraf_data
            logger.info(f"Taraf Bilgileri extracted for Row {row_index}: {row_data['Taraf Bilgileri']}")
        else:
            logger.warning("Skipping 'Taraf Bilgileri' extraction due to missing tab.")

        # Print extracted data
        print(f"\nRow {row_index}:")
        print("  Genel:")
        for key, value in row_data["Genel"].items():
            print(f"    {key}: {value}")
        if row_data["Dosya Bilgileri"]:
            print("  Dosya Bilgileri:")
            for key, value in row_data["Dosya Bilgileri"].items():
                print(f"    {key}: {value}")
        if row_data["Dosya Hesabı"]:
            print("  Dosya Hesabı:")
            for key, value in row_data["Dosya Hesabı"].items():
                print(f"    {key}: {value}")
        if row_data["Taraf Bilgileri"]:
            print("  Taraf Bilgileri:")
            for taraf, details in row_data["Taraf Bilgileri"].items():
                print(f"    {taraf}:")
                for detail_key, detail_value in details.items():
                    print(f"      {detail_key}: {detail_value}")

        # Leave popup open for debugging
        logger.info("Leaving popup open as requested for debugging.")

        # Stop after processing Row 1
        logger.info("Stopping after Row 1 for testing the tab clicks and data extraction.")
        return extracted_data

    except TimeoutException:
        logger.error("Timeout waiting for table to load.")
        raise
    except NoSuchElementException:
        logger.error("Table or table elements not found on the page.")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during table extraction: {e}")
        raise

if __name__ == "__main__":
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    try:
        driver.get("https://avukatbeta.uyap.gov.tr/")
        extract_data_from_table(driver)
    finally:
        driver.quit()