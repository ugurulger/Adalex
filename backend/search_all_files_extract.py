import logging
import time
import json
import os
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException, StaleElementReferenceException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_data_from_table(driver, ui_callback=None):
    try:
        wait, short_wait = WebDriverWait(driver, 15), WebDriverWait(driver, 2)
        all_data = {}  # Dictionary to store row data with keys like 'row1', 'row2', etc.
        processed_dosya_nos = set()  # Track processed rows across all pages
        max_pages_to_process = 3  # Limit to first 3 pages
        row_counter = 1  # Global counter for row numbering across all pages

        # Define output directory and daily JSON filename
        output_dir = "/Users/ugurulger/Desktop/extracted_data"
        os.makedirs(output_dir, exist_ok=True)
        today_date = datetime.now().strftime("%Y%m%d")  # Format: YYYYMMDD (e.g., 20250307)
        output_file = os.path.join(output_dir, f"extracted_data_{today_date}.json")

        # Get total pages from the page indicator
        try:
            page_indicator = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".dx-datagrid-pager .dx-info")))
            page_text = page_indicator.text.strip()
            total_pages = int(page_text.split("/")[-1].split()[0])  # Extract number after "/"
            logger.info(f"Detected total pages: {total_pages} from page indicator: {page_text}")
            max_pages = min(max_pages_to_process, total_pages)  # Don’t exceed total pages
        except (NoSuchElementException, ValueError, IndexError) as e:
            logger.warning(f"Could not determine total pages from indicator. Assuming {max_pages_to_process} pages. Error: {e}")
            max_pages = max_pages_to_process

        for page in range(1, max_pages + 1):
            logger.info(f"Processing Page {page} of {max_pages}...")

            # Wait for the table to load
            logger.info("Waiting for table to load...")
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#adaletDataGridContainer > div > div.dx-datagrid-rowsview > div > div > div > div > table")))
            logger.info(f"Table container found on Page {page}.")

            # Scroll down to load all table rows
            logger.info("Scrolling down the page to load all table rows...")
            last_height = driver.execute_script("return document.body.scrollHeight")
            for attempt in range(5):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                try:
                    short_wait.until(lambda d: d.execute_script("return document.body.scrollHeight") > last_height)
                    last_height = driver.execute_script("return document.body.scrollHeight")
                    logger.info(f"Scroll attempt {attempt + 1} triggered more content on Page {page}.")
                except TimeoutException:
                    logger.info(f"No more content loaded after scroll on Page {page}. Proceeding with available rows.")
                    break
                time.sleep(0.5)

            table = driver.find_element(By.CSS_SELECTOR, "#adaletDataGridContainer > div > div.dx-datagrid-rowsview > div > div > div > div > table")
            rows = table.find_elements(By.CSS_SELECTOR, "tbody > tr")
            total_rows = len(rows)
            if not rows:
                logger.error(f"No rows found in table on Page {page}.")
                break

            for row_index in range(total_rows):
                try:
                    # Re-fetch rows to avoid stale references
                    table = driver.find_element(By.CSS_SELECTOR, "#adaletDataGridContainer > div > div.dx-datagrid-rowsview > div > div > div > div > table")
                    rows = table.find_elements(By.CSS_SELECTOR, "tbody > tr")
                    row = rows[row_index]
                    logger.info(f"Processing Row {row_index + 1} of {total_rows} on Page {page}...")

                    # Extract 'Genel' data
                    cells = row.find_elements(By.TAG_NAME, "td")

                    dosya_no = cells[1].text.strip()
                    if not dosya_no or "/" not in dosya_no:
                        logger.debug(f"Row {row_index + 1} on Page {page} skipped: No valid 'Dosya No' found ({dosya_no}).")
                        continue

                    processed_dosya_nos.add(dosya_no)

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

                    # Click to open popup for this specific row
                    try:
                        dosya_goruntule = row.find_element(By.CSS_SELECTOR, "#dosya-goruntule")
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", dosya_goruntule)
                        wait.until(EC.element_to_be_clickable((By.ID, "dosya-goruntule")))
                        dosya_goruntule.click()
                        time.sleep(0.5)
                        logger.info(f"Clicked #dosya-goruntule for Row {row_index + 1} on Page {page} using WebDriverWait.")
                    except NoSuchElementException:
                        logger.warning(f"#dosya-goruntule not found in Row {row_index + 1} on Page {page}. Trying JavaScript click on row...")
                        driver.execute_script("arguments[0].click();", row)
                        time.sleep(0.5)
                        logger.info(f"JavaScript clicked row for Row {row_index + 1} on Page {page}.")
                    except ElementClickInterceptedException:
                        logger.warning(f"Click intercepted for #dosya-goruntule in Row {row_index + 1} on Page {page}. Trying JavaScript click...")
                        driver.execute_script("arguments[0].click();", dosya_goruntule)
                        time.sleep(0.5)
                        logger.info(f"JavaScript clicked #dosya-goruntule for Row {row_index + 1} on Page {page}.")
                    except TimeoutException:
                        logger.error(f"Timeout waiting for #dosya-goruntule to be clickable in Row {row_index + 1} on Page {page}. Pausing for manual inspection...")
                        driver.save_screenshot(f"popup_error_row_{row_index + 1}_page_{page}.png")
                        time.sleep(60)
                        raise Exception("Manual inspection required: #dosya-goruntule not clickable.")

                    # Wait for the tabs container to be visible
                    wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[1]/div")))
                    logger.info(f"Tabs container found for Row {row_index + 1} on Page {page}.")
                    time.sleep(0.5)

                    # Helper function to check and click tabs if they exist
                    def check_and_click_tab(tab_name):
                        try:
                            # Use a more reliable query selector for tab elements
                            tabs = driver.execute_script(
                                "return document.querySelectorAll('.dx-tabpanel-tabs .dx-tab')"
                            )
                            
                            if not tabs:
                                logger.warning("No tabs found with the selector. Check the page structure.")
                                return False

                            for tab in tabs:
                                # Get the text content of the tab
                                text = driver.execute_script(
                                    "return arguments[0].textContent || arguments[0].innerText || ''", tab
                                ).strip()
                                
                                if tab_name.lower() in text.lower():  # Case-insensitive match
                                    # Ensure the tab is visible and clickable
                                    driver.execute_script(
                                        "arguments[0].scrollIntoView({block: 'center'});", tab
                                    )
                                    # Add a small delay to ensure the element is ready
                                    time.sleep(0.5)
                                    # Attempt to click the tab
                                    driver.execute_script("arguments[0].click();", tab)
                                    logger.info(f"Clicked '{tab_name}' tab for Row {row_index + 1} on Page {page}")
                                    time.sleep(0.5)  # Wait for any post-click actions to complete
                                    return True
                            
                            logger.warning(f"'{tab_name}' tab not found for Row {row_index + 1} on Page {page}. Skipping...")
                            return False

                        except Exception as e:
                            logger.error(f"Error checking/clicking '{tab_name}' tab: {e}")
                            return False

                    # Check and extract 'Dosya Bilgileri' if tab exists
                    if check_and_click_tab("Dosya Bilgileri"):
                        wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[2]/div/div/div[1]/div/div[1]/div[1]/div/div/div[2]/table/tbody")))
                        logger.info(f"'Dosya Bilgileri' content loaded for Row {row_index + 1} on Page {page}.")

                        dosya_bilgileri = {"Türü": "Not found", "Yolu": "Not found", "Şekli": "Not found"}
                        base_xpath = "//div/div[2]/div/div/div/div/div[2]/div/div/div[1]/div/div[1]/div[1]/div/div/div[2]/table/tbody"

                        turi_label_xpath = f"{base_xpath}/tr[1]/td[1]"
                        turi_value_xpath = f"{base_xpath}/tr[1]/td[2]"
                        if driver.find_elements(By.XPATH, turi_label_xpath):
                            turi_label = driver.find_element(By.XPATH, turi_label_xpath).text.strip()
                            if turi_label == "Türü":
                                dosya_bilgileri["Türü"] = driver.find_element(By.XPATH, turi_value_xpath).text.strip() if driver.find_elements(By.XPATH, turi_value_xpath) else "Not found"

                        yolu_label_xpath = f"{base_xpath}/tr[2]/td[1]"
                        yolu_value_xpath = f"{base_xpath}/tr[2]/td[2]"
                        if driver.find_elements(By.XPATH, yolu_label_xpath):
                            yolu_label = driver.find_element(By.XPATH, yolu_label_xpath).text.strip()
                            if yolu_label == "Yolu":
                                dosya_bilgileri["Yolu"] = driver.find_element(By.XPATH, yolu_value_xpath).text.strip() if driver.find_elements(By.XPATH, yolu_value_xpath) else "Not found"

                        sekli_label_xpath = f"{base_xpath}/tr[3]/td[1]"
                        sekli_value_xpath = f"{base_xpath}/tr[3]/td[2]"
                        if driver.find_elements(By.XPATH, sekli_label_xpath):
                            sekli_label = driver.find_element(By.XPATH, sekli_label_xpath).text.strip()
                            if sekli_label == "Şekli":
                                dosya_bilgileri["Şekli"] = driver.find_element(By.XPATH, sekli_value_xpath).text.strip() if driver.find_elements(By.XPATH, sekli_value_xpath) else "Not found"

                        row_data["Dosya Bilgileri"] = dosya_bilgileri
                        logger.info(f"Dosya Bilgileri extracted for Row {row_index + 1} on Page {page}: {row_data['Dosya Bilgileri']}")
                    else:
                        logger.warning(f"Skipping 'Dosya Bilgileri' extraction due to missing tab on Page {page}.")

                    # Check and extract 'Dosya Hesabı' if tab exists
                    if check_and_click_tab("Dosya Hesabı"):
                        wait.until(EC.presence_of_element_located((By.XPATH, "//div/div[2]/div/div/div/div/div[2]/div/div/div[2]/div/div[1]/div[1]/div/div/div[2]/div/table/tbody")))
                        logger.info(f"'Dosya Hesabı' content loaded for Row {row_index + 1} on Page {page}.")

                        base_xpath = "//div/div[2]/div/div/div/div/div[2]/div/div/div[2]/div/div[1]/div[1]/div/div/div[2]/div/table/tbody"
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
                        logger.info(f"Dosya Hesabı extracted for Row {row_index + 1} on Page {page}: {row_data['Dosya Hesabı']}")
                    else:
                        logger.warning(f"Skipping 'Dosya Hesabı' extraction due to missing tab on Page {page}.")





                    # Check and extract 'Taraf Bilgileri' if tab exists
                    if check_and_click_tab("Taraf Bilgileri"):
                        try:
                            #time.sleep(2)  # Wait for tab content to load
                            wait = WebDriverWait(driver, 15)
                            target_table = wait.until(
                                lambda driver: driver.execute_script(
                                    "const tables = document.querySelectorAll('table');"
                                    "for (const t of tables) {"
                                    "  const rect = t.getBoundingClientRect();"
                                    "  if (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth) {"
                                    "    const tbody = t.querySelector('tbody');"
                                    "    if (tbody) {"
                                    "      const firstRow = tbody.querySelector('tr');"
                                    "      if (firstRow) {"
                                    "        const cells = Array.from(firstRow.querySelectorAll('td')).map(td => td.textContent || td.innerText || '').slice(0, 4);"
                                    "        if (cells.length >= 4 && !cells.join(' ').includes('Dosya') && !['Rol', 'Tipi', 'Adı', 'Vekil'].every(h => cells.includes(h))) {"
                                    "          return t;"
                                    "        }"
                                    "      }"
                                    "    }"
                                    "  }"
                                    "}"
                                    "return null;"
                                )
                            )
                            if not target_table:
                                raise Exception("No suitable 'Taraf Bilgileri' table found")

                            logger.info(f"Found 'Taraf Bilgileri' table for Row {row_index + 1} on Page {page}")

                            rows = driver.execute_script("return arguments[0].querySelector('tbody').querySelectorAll('tr');", target_table)
                            taraf_data = {
                                f"Taraf{i}": {
                                    "Rol": driver.execute_script("return arguments[0].textContent || arguments[0].innerText || ''", c[0]).strip(),
                                    "Tipi": driver.execute_script("return arguments[0].textContent || arguments[0].innerText || ''", c[1]).strip(),
                                    "Adi": driver.execute_script("return arguments[0].textContent || arguments[0].innerText || ''", c[2]).strip(),
                                    "Vekil": driver.execute_script("return arguments[0].textContent || arguments[0].innerText || ''", c[3]).strip()
                                }
                                for i, r in enumerate(rows, 1)
                                if len(c := driver.execute_script("return arguments[0].querySelectorAll('td')", r)) >= 4
                                and any(driver.execute_script("return arguments[0].textContent || arguments[0].innerText || ''", cell).strip() for cell in c[:4])
                            }

                            if not taraf_data:
                                logger.warning(f"No rows found in 'Taraf Bilgileri' table for Row {row_index + 1} on Page {page}")

                            row_data["Taraf Bilgileri"] = taraf_data
                            logger.info(f"Taraf Bilgileri extracted for Row {row_index + 1} on Page {page}: {row_data['Taraf Bilgileri']}")

                        except Exception as e:
                            logger.error(f"Error extracting 'Taraf Bilgileri' for Row {row_index + 1} on Page {page}: {e}")
                    else:
                        logger.warning(f"Skipping 'Taraf Bilgileri' extraction for Row {row_index + 1} on Page {page}")


                    # Store the row data in all_data with rowN key
                    all_data[f"row{row_counter}"] = row_data
                    row_counter += 1

                    # Update UI with the new row's Genel data
                    if ui_callback:
                        genel_data = row_data["Genel"]
                        ui_callback(row_counter - 1, genel_data)

                    # Close the popup
                    wait = WebDriverWait(driver, 10)
                    close_button_selector = "div[aria-label='Kapat'].dx-button-danger"

                    # Wait for the overlay to disappear
                    overlay_selector = ".dx-overlay-wrapper.dx-loadpanel-wrapper"
                    try:
                        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, overlay_selector)))
                        logger.info("Overlay disappeared, proceeding to close popup.")
                    except TimeoutException:
                        logger.warning("Overlay did not disappear within 10 seconds, attempting to close anyway.")

                    # Now click the close button
                    close_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, close_button_selector)))
                    close_button.click()
                    logger.info(f"Closed popup for Row {row_index + 1} on Page {page}.")
                    time.sleep(1)  # Small delay to ensure UI updates

                except StaleElementReferenceException:
                    logger.warning(f"Stale element reference detected at Row {row_index + 1} on Page {page}. Re-fetching table...")
                    time.sleep(1)
                    continue

            # Move to the next page if not the last page
            if page < max_pages:
                try:
                    # Find all page numbers and click the next one
                    page_numbers = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".dx-page")))
                    current_page = page  # Since we're on page 'page' after processing
                    next_page_num = current_page + 1

                    if next_page_num <= total_pages:
                        for page_elem in page_numbers:
                            page_text = page_elem.get_attribute("aria-label").split("Page ")[1] if page_elem.get_attribute("aria-label") else page_elem.text
                            if int(page_text) == next_page_num:
                                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", page_elem)
                                page_elem.click()
                                logger.info(f"Clicked Page {next_page_num} to move to Page {page + 1}.")
                                time.sleep(2)  # Wait for page load
                                break
                    else:
                        logger.warning(f"No more pages to navigate after Page {page}. Reached or exceeded total pages {total_pages}.")
                        break
                except (NoSuchElementException, TimeoutException, ValueError) as e:
                    logger.warning(f"Could not find or click next page after Page {page}. Assuming end of pagination. Error: {e}")
                    break
                except ElementClickInterceptedException:
                    logger.warning(f"Click intercepted for next page after Page {page}. Trying JavaScript click...")
                    for page_elem in page_numbers:
                        page_text = page_elem.get_attribute("aria-label").split("Page ")[1] if page_elem.get_attribute("aria-label") else page_elem.text
                        if int(page_text) == next_page_num:
                            driver.execute_script("arguments[0].click();", page_elem)
                            logger.info(f"JavaScript clicked Page {next_page_num} to move to Page {page + 1}.")
                            time.sleep(2)
                            break
                    else:
                        logger.warning(f"Could not find Page {next_page_num} after Page {page}. Assuming end of pagination.")
                        break

        # Save all extracted data to JSON (overwrite if exists)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Saved all data to {output_file} (overwritten if existed)")

        # Print all extracted data at the end
        logger.info(f"Finished processing {len(all_data)} rows across {min(page, max_pages)} pages. Printing all data now:")
        for row_key, row_data in all_data.items():
            print(f"\n{row_key}:")
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

        return all_data

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