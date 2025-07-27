import logging, time, os, json, inspect
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (TimeoutException, NoSuchElementException,
                                        StaleElementReferenceException, ElementNotInteractableException,
                                        ElementClickInterceptedException)

# Global Constants
TIMEOUT = 15                # Elementlerin beklenme süresi (saniye)
RETRY_ATTEMPTS = 3          # Tıklama işlemleri için maksimum deneme sayısı
SLEEP_INTERVAL = 0.5        # Her deneme sonrası bekleme süresi (saniye)

# Global Selectors / Address Paths (tüm adres path'ler merkezi olarak burada tanımlanır)
MENU_BUTTON_SELECTOR    = "#sidebar-menu > li:nth-child(4) > button"
DOSYA_SORGULA_SELECTOR  = "//span[@class='menu-text' and text()='Dosya Sorgula']"
SEARCH_BUTTON_CSS       = "[aria-label='Sorgula']"
RESULT_ROW_SELECTOR     = ".dx-datagrid-rowsview tbody tr"
DOSYA_GORUNTULE_ID      = "dosya-goruntule"
BORCLU_TAB_XPATH        = "//div[contains(@class, 'dx-tab-content')]//span[contains(text(), 'Borçlu Bilgileri')]"
DROPDOWN_SELECTOR       = "#borclu-isim [aria-label='Select']"
DROPDOWN_ITEMS_SELECTOR = ".dx-overlay-wrapper.dx-popup-wrapper.dx-dropdowneditor-overlay.dx-dropdownlist-popup-wrapper.dx-selectbox-popup-wrapper .dx-list-items .dx-list-item"
CLOSE_BUTTON_CSS        = "div[role='button'][aria-label='Kapat'].dx-button"
CLEAR_SEARCH_CSS        = ".dx-tag-remove-button"

# Ek Hızlandırma Bekleme Süreleri
DROPDOWN_LOAD_SLEEP = 1   # Dropdown menü açıldıktan sonra bekleme süresi
NEXT_ITEM_SLEEP     = 5     # Bir sonraki dropdown öğesine geçmeden önce bekleme süresi

# Dosya yolu ayarları
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")

def get_logger():
    """Çağrıldığı modülün adıyla logger oluşturur."""
    # Çağrı zincirinde sorgulama_common dışındaki ilk modülü bul
    for frame_info in inspect.stack():
        module_name = frame_info[0].f_globals.get('__name__')
        if module_name != 'sorgulama_common':
            if module_name == '__main__':
                module_name = 'sorgulama_common'  # __main__ yerine sorgulama_common kullan
            break
    else:
        module_name = 'sorgulama_common'  # Varsayılan olarak kendi modülü
    logger = logging.getLogger(module_name)
    # Propagasyonu kapat
    logger.propagate = False
    # Eğer logger'ın handler'ı yoksa, yeni bir handler ekle
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

def save_to_json(data, filename=None):
    """
    data sözlüğünü JSON dosyasına kaydeder veya, dosya varsa, mevcut veriler ile günceller.
    filename verilmezse, çağrıldığı modülün adına göre dosya adı oluşturulur.
    """
    logger = get_logger()
    # Çağrıcı modülün adını al
    caller_module = inspect.stack()[1][0].f_globals.get('__name__')
    if caller_module == '__main__':
        caller_module = 'sorgulama_common'
    
    # Eğer filename verilmediyse, modül adına göre dosya adı oluştur
    if filename is None:
        filename = os.path.join(DESKTOP_PATH, f"{caller_module}.json")
    
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except (json.JSONDecodeError, IOError):
            existing = {}
    else:
        existing = {}
    # Yeni verileri mevcut veriyle merge et
    for key, value in data.items():
        if key not in existing:
            existing[key] = {}
        existing[key].update(value)
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved in {filename}")
    except IOError as e:
        logger.error(f"JSON write error: {e}")

def select_dropdown_option(driver, dropdown_selector, option_text):
    """Dropdown'dan bir seçenek seçer."""
    logger = get_logger()
    try:
        # Dropdown'u aç
        if not click_element_merged(driver, By.CSS_SELECTOR, dropdown_selector, action_name="Dropdown aç"):
            return False
        # Seçeneği seç
        if not click_element_merged(driver, By.XPATH, f"//div[text()='{option_text}']", action_name="Seçenek seç"):
            return False
        logger.info(f"Seçilen dropdown seçeneği: {option_text}")
        return True
    except Exception as e:
        logger.error(f"Seçenek '{option_text}' seçilemedi: {e}")
        return False

def click_element_merged(driver, by, value, action_name="", item_text="", result_label=None, use_js_first=False):
    """
    Verilen locator (by, value) ile tanımlanan elementin tıklanabilir hale gelmesini bekler,
    sayfada ortalar ve tıklama işlemini gerçekleştirir.
    """
    logger = get_logger()
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    overlay_selector = ".dx-overlay-wrapper.dx-loadpanel-wrapper.custom-loader.dx-overlay-shader"

    for attempt in range(RETRY_ATTEMPTS):
        try:
            # Check overlay before click
            try:
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, overlay_selector)), "Overlay persists")
            except TimeoutException:
                logger.warning("Overlay still present before click, continuing.")
            
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

            # Check overlay after click
            try:
                wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, overlay_selector)), "Overlay persists")
            except TimeoutException:
                logger.warning("Overlay still present after click.")
            
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
    return False

def handle_popup_if_present(driver, item_text, result_label=None):
    """
    Check for a popup, extract its message if present, and close the popup.
    Returns the popup message if a popup was handled, None if no popup was found.
    """
    logger = get_logger()
    # Pop-up ile ilgili sabitler
    POPUP_CSS = ".dx-overlay-content.dx-popup-normal.dx-popup-flex-height.dx-resizable"
    POPUP_MESSAGE_XPATH = (
        "/html/body/div[contains(@class, 'dx-overlay-wrapper') and contains(@class, 'dx-popup-wrapper') and "
        "contains(@class, 'custom-popup-alert')]/div/div/div/div/p"
    )
    TAMAM_BUTTON_CSS = "[aria-label='Tamam']"

    try:
        # Hızlıca pop-up elementini ara
        popup_elements = driver.find_elements(By.CSS_SELECTOR, POPUP_CSS)
        if not popup_elements:
            logger.info(f"No popup detected for {item_text}")
            return None

        # Pop-up varsa, görünür olup olmadığını kontrol et (dx-state-invisible olmamalı)
        popup = popup_elements[0]
        if "dx-state-invisible" in popup.get_attribute("class"):
            logger.info(f"Popup detected but invisible for {item_text}")
            return None

        logger.info(f"Popup detected for {item_text}")

        # Mesajı çıkar
        wait = WebDriverWait(driver, TIMEOUT)
        try:
            message_element = wait.until(EC.presence_of_element_located((By.XPATH, POPUP_MESSAGE_XPATH)))
            popup_message = message_element.text.strip()
            logger.info(f"Extracted popup message for {item_text}: {popup_message}")
        except TimeoutException:
            logger.warning(f"Could not locate popup message for {item_text}")
            popup_message = "Popup message could not be extracted"
        
        time.sleep(SLEEP_INTERVAL) #Tamam'a tiklamadan once biraz bekle
        # 'Tamam' butonuna tıkla
        if not click_element_merged(driver, By.CSS_SELECTOR, TAMAM_BUTTON_CSS,
                                   action_name="Tamam button", item_text=item_text, result_label=result_label):
            logger.error(f"Failed to close popup for {item_text}")
            popup_message += " (Failed to close popup)"
        
        # result_label'ı güncelle
        if result_label:
            result_label.config(text=f"Popup detected for {item_text}: {popup_message}")
        
        return popup_message  # Mesajı döndür

    except Exception as e:
        logger.info(f"No popup detected for {item_text}: {e}")
        return None # Hata durumunda pop-up yok kabul et

def check_result_or_popup(driver, result_locator, item_text, result_label=None):
    """
    Belirtilen result_locator ile sonucu veya pop-up'ı kontrol eder.
    Returns:
      - Sonuç elementi (WebElement) varsa onu döner.
      - Pop-up mesajı (str) varsa onu döner.
      - Hiçbiri yoksa False döner.
    """
    logger = get_logger()
    try:
        element = driver.find_element(*result_locator)
        if element.is_displayed():
            return element
    except NoSuchElementException:
        pass
    popup_message = handle_popup_if_present(driver, item_text, result_label)
    if popup_message:
        return popup_message
    return False

def perform_sorgulama(driver, dosya_no, selected_options, result_label=None):
    """
    Dosya sorgulama işlemini gerçekleştirir. Aşamalar:
      1. Menüden Dosya Sorgula’ya geçiş,
      2. Radyo butonunun seçimi,
      3. Arama kutusunun doldurulması,
      4. Arama butonuna tıklanması,
      5. Dosya pop-up’ının açılması,
      6. 'Borçlu Bilgileri' sekmesinin tıklanması,
      7. Dropdown menüden seçeneklerin işlenmesi.
    """
    logger = get_logger()
    wait = WebDriverWait(driver, TIMEOUT)
    def status(msg):
        if result_label:
            result_label.config(text=msg)
        logger.info(msg)
    # Adım 1-2: Menüden Dosya Sorgula’ya geçiş
    for msg, selector, by in [( "Opening menu...", MENU_BUTTON_SELECTOR, By.CSS_SELECTOR ),
                              ( "Navigating to 'Dosya Sorgula'...", DOSYA_SORGULA_SELECTOR, By.XPATH )]:
        status(msg)
        if not click_element_merged(driver, by, selector, action_name=msg):
            status(f"Failed: {msg}")
            return

    # Adım 3: Dropdown menülerden seçim yapılması
    select_dropdown_option(driver, "#yargi-turu-detayli-arama", "İcra")
    select_dropdown_option(driver, "#yargi-birimi-detayli-arama", "İCRA DAİRESİ")
    select_dropdown_option(driver, "#mahkeme-detayli-arama", "Tümü")
    time.sleep(1)  # Dropdown menülerinin yüklenmesi için bekleme

    # Adim 4.1 Dosya numarasının arama kutusuna yazılması - part1
    ARA_BUTTON_CSS = "[aria-label='Dosya Yıl']"
    select_dropdown_option(driver, ARA_BUTTON_CSS, dosya_no.split('/')[0])  # dosya_no'nun ilk kısmını seç
    time.sleep(1)  # Dropdown menülerinin yüklenmesi için bekleme

    # Adım 4.2 Dosya numarasının arama kutusuna yazılması - part2
    DOSYA_NUMARA_CSS = "[aria-label='Dosya No'] .dx-texteditor-input-container input"
    inp = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, DOSYA_NUMARA_CSS)))

    # Dosya numarasının split edilmiş halini yazma
    inp.clear()
    logger.info("Input cleared")
    dosya_no_value = dosya_no.split('/')[1]
    inp.send_keys(dosya_no_value)
    logger.info(f"Filled search input: {dosya_no}")
    time.sleep(1)  # Arama kutusunun doldurulması için bekleme

    #Adım 5: Arama butonuna tıklanması
    status("Clicking search button...")
    if not click_element_merged(driver, By.CSS_SELECTOR, SEARCH_BUTTON_CSS, action_name="Search button"):
        status("Failed to click search button.")
        return
    # Adım 6: Dosya pop-up’ının açılması
    status("Opening dosya pop-up...")
    try:
        time.sleep(4) #gecici olarak 1sn eklendi. Buraya daha sonra etkili bir filtre koyulacak
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, RESULT_ROW_SELECTOR)))
        if not click_element_merged(driver, By.ID, DOSYA_GORUNTULE_ID, action_name="Open dosya pop-up"):
            status("Failed to open dosya pop-up.")
            return
    except TimeoutException:
        status("Search result row not found.")
        return
    # Adım 7: 'Borçlu Bilgileri' sekmesinin tıklanması
    status("Clicking 'Borçlu Bilgileri' tab...")
    if not click_element_merged(driver, By.XPATH, BORCLU_TAB_XPATH, action_name="'Borçlu Bilgileri' tab"):
        status("Failed to click 'Borçlu Bilgileri' tab.")
        return
    # Adım 8-9: Dropdown menü işlemleri
    status("Processing dropdown items...")
    if not click_element_merged(driver, By.CSS_SELECTOR, DROPDOWN_SELECTOR, action_name="Open dropdown", item_text="Dropdown"):
        status("Failed to open dropdown menu.")
        return
    time.sleep(DROPDOWN_LOAD_SLEEP)  # Dropdown öğelerinin yüklenmesi için bekleme
    try:
        items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, DROPDOWN_ITEMS_SELECTOR)))
        for index, item in enumerate(items):
            current = item.text.strip() or f"Item {index+1}"
            status(f"Processing dropdown item: {current}")
            if not click_element_merged(driver, By.XPATH, f"//*[text()='{current}']",
                                        action_name="Select dropdown item", item_text=current):
                status(f"Failed to click item: {current}")
                continue
            # Seçilen option'lar işleniyor; ilgili modüller dışarıdan import ediliyor.
            for opt, enabled in selected_options.items():
                if enabled:
                    try:
                        if opt == "EGM" or opt == "EGM-TNB":
                            from egm_sorgu import perform_egm_sorgu; perform_egm_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "Banka":
                            from banka_sorgu import perform_banka_sorgu; perform_banka_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "TAKBİS":
                            from takbis_sorgu import perform_takbis_sorgu; perform_takbis_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "SGK":
                            # GEÇİCİ: sgk_sorgu2.py'den yeni fonksiyonu test etmek için
                            from sgk_sorgu2 import perform_sgk_sorgu
                            perform_sgk_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "İcra Dosyası":
                            from icra_dosyasi_sorgu import perform_icra_dosyasi_sorgu; perform_icra_dosyasi_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "MERNİS":
                            from mernis_sorgu import perform_mernis_sorgu; perform_mernis_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "İSKİ":
                            from iski_sorgu import perform_iski_sorgu; perform_iski_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "GİB":
                            from gib_sorgu import perform_gib_sorgu; perform_gib_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "GSM":
                            from gsm_sorgu import perform_gsm_sorgu; perform_gsm_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "Dış İşleri":
                            from dis_isleri_sorgu import perform_dis_isleri_sorgu; perform_dis_isleri_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "Posta Çeki":
                            from posta_ceki_sorgu import perform_posta_ceki_sorgu; perform_posta_ceki_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "SGK Haciz":
                            from sgk_haciz_sorgu import perform_sgk_haciz_sorgu; perform_sgk_haciz_sorgu(driver, current, dosya_no, result_label)
                    except Exception as ex:
                        logger.error(f"Failed to process {opt} for {current}: {ex}")
            if index < len(items)-1:
                time.sleep(NEXT_ITEM_SLEEP)
                if not click_element_merged(driver, By.CSS_SELECTOR, DROPDOWN_SELECTOR, action_name="Re-open dropdown", item_text="Dropdown"):
                    status("Failed to re-open dropdown.")
                    break
        status("Dropdown items processing completed.")
        # Adım 10: Pop-up penceresini kapat
        status("Closing popup window...")
        if not click_element_merged(driver, By.CSS_SELECTOR, CLOSE_BUTTON_CSS, action_name="Close popup"):
            status("Failed to close popup window.")
            return
        # # Adım 11: Arama çubuğunu temizle
        # status("Clearing search bar...")
        # if not click_element_merged(driver, By.CSS_SELECTOR, CLEAR_SEARCH_CSS, action_name="Clear search bar"):
        #     status("Failed to clear search bar.")
        #     return
        # else:
        #     status("Search bar cleared successfully.")
    except TimeoutException:
        status("No dropdown items found.")