import logging, time, os, json
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
DOSYA_SORGULA_SELECTOR  = "[id='29954-alt-menu'] > a:nth-child(1) > li > span > span"
RADIO_BUTTON_XPATH      = "/html/body/div/div/div[1]/div[2]/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div[4]"
SEARCH_INPUT_XPATH      = "//div[contains(@class, 'dx-texteditor-input-container')]//input[@aria-label='Arama Alanı']"
SEARCH_BUTTON_XPATH     = "//div[@role='button' and @title='Arama Yap' and contains(@class, 'dx-button')]"
RESULT_ROW_SELECTOR     = ".dx-datagrid-rowsview tbody tr"
DOSYA_GORUNTULE_ID      = "dosya-goruntule"
BORCLU_TAB_XPATH        = "//div[contains(@class, 'dx-tab-content')]//span[contains(text(), 'Borçlu Bilgileri')]"
DROPDOWN_SELECTOR       = ".dx-texteditor-buttons-container .dx-dropdowneditor-button"
DROPDOWN_ITEMS_SELECTOR = ".dx-dropdowneditor-overlay .dx-list-item"

# Ek Hızlandırma Bekleme Süreleri
DROPDOWN_LOAD_SLEEP = 0.1   # Dropdown menü açıldıktan sonra bekleme süresi
NEXT_ITEM_SLEEP     = 5     # Bir sonraki dropdown öğesine geçmeden önce bekleme süresi

# SGK butonu (bu dosyada fonksiyon içerisinden çağrılacak)
SGK_BUTTON_CSS = "button.query-button[title='SGK']"

# Dosya yolu ayarları
DESKTOP_PATH = os.path.join(os.path.expanduser("~"), "Desktop", "extracted_data")
JSON_FILE = os.path.join(DESKTOP_PATH, "sgk_sorgu.json")

# Logging yapılandırması
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_json(data):
    """
    data sözlüğünü JSON dosyasına kaydeder veya, dosya varsa, mevcut veriler ile günceller.
    """
    os.makedirs(DESKTOP_PATH, exist_ok=True)
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
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
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved in {JSON_FILE}")
    except IOError as e:
        logger.error(f"JSON write error: {e}")

def click_element_merged(driver, by, value, action_name="", item_text="", result_label=None, use_js_first=False):
    """
    Verilen locator (by, value) ile tanımlanan elementin tıklanabilir hale gelmesini bekler,
    sayfada ortalar ve tıklama işlemini gerçekleştirir.
    """
    wait = WebDriverWait(driver, TIMEOUT)
    target = item_text if item_text else value
    # Define multiple overlay selectors to catch variations
    overlay_selectors = [
        ".dx-loadindicator-wrapper dx-loadindicator-image",
        ".dx-loadpanel-content-wrapper",
        ".dx-loadpanel-indicator dx-loadindicator dx-widget",
        ".dx-overlay-wrapper dx-loadpanel-wrapper custom-loader dx-overlay-shader"
    ]
    for attempt in range(RETRY_ATTEMPTS):
        try:
            # Check all overlay selectors
            for overlay_sel in overlay_selectors:
                try:
                    wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, overlay_sel)), "Overlay persists")
                except TimeoutException:
                    logger.warning(f"Overlay {overlay_sel} still present, continuing.")

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

            # Check overlays again post-click
            for overlay_sel in overlay_selectors:
                try:
                    wait.until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, overlay_sel)), "Overlay persists")
                except TimeoutException:
                    logger.warning(f"Post-click overlay {overlay_sel} still present.")
            return True
        except (TimeoutException, StaleElementReferenceException, ElementNotInteractableException, ElementClickInterceptedException) as e:
            logger.warning(f"{action_name} click attempt {attempt+1} failed for {target}: {e}")
            time.sleep(SLEEP_INTERVAL)
    err = f"Failed to click {action_name} for {target} after {RETRY_ATTEMPTS} attempts"
    if result_label:
        result_label.config(text=err)
    logger.error(err)
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
    wait = WebDriverWait(driver, TIMEOUT)
    def status(msg):
        if result_label:
            result_label.config(text=msg)
        logger.info(msg)
    # Adım 1-2: Menüden Dosya Sorgula’ya geçiş
    for msg, selector, by in [( "Opening menu...", MENU_BUTTON_SELECTOR, By.CSS_SELECTOR ),
                              ( "Navigating to 'Dosya Sorgula'...", DOSYA_SORGULA_SELECTOR, By.CSS_SELECTOR )]:
        status(msg)
        if not click_element_merged(driver, by, selector, action_name=msg):
            status(f"Failed: {msg}")
            return
    # Adım 3: Radyo butonunun seçilmesi
    status("Selecting radio button...")
    if not click_element_merged(driver, By.XPATH, RADIO_BUTTON_XPATH, action_name="Select radio button"):
        status("Failed to select radio button.")
        return
    # Adım 4: Arama kutusunun doldurulması
    status("Filling search input...")
    try:
        inp = wait.until(EC.visibility_of_element_located((By.XPATH, SEARCH_INPUT_XPATH)))
        inp.clear()
        inp.send_keys(dosya_no)
        logger.info(f"Filled search input: {dosya_no}")
    except TimeoutException:
        status("Search input not found.")
        return
    # Adım 5: Arama butonuna tıklanması
    status("Clicking search button...")
    if not click_element_merged(driver, By.XPATH, SEARCH_BUTTON_XPATH, action_name="Search button"):
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
                        if opt == "EGM-TNB":
                            from egm_sorgu import perform_egm_sorgu; perform_egm_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "Banka":
                            from banka_sorgu import perform_banka_sorgu; perform_banka_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "TAKBİS":
                            from takbis_sorgu import perform_takbis_sorgu; perform_takbis_sorgu(driver, current, dosya_no, result_label)
                        elif opt == "SGK":
                            from sgk_sorgu import perform_sgk_sorgu; perform_sgk_sorgu(driver, current, dosya_no, result_label)
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
                        # elif opt == "Dış İşleri":
                        #     from dis_isleri_sorgu import perform_dis_isleri_sorgu; perform_dis_isleri_sorgu(driver, current, dosya_no, result_label)
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
    except TimeoutException:
        status("No dropdown items found.")