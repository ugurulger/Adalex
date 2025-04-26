from sorgulama_common import get_logger, click_element_merged
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

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

def search_all_files(driver, result_label=None):
    """UYAP'ta tüm dosyaları arama işlemini otomatikleştirir."""
    logger = get_logger()
    try:
        wait = WebDriverWait(driver, 15)

        # Adım 1: Menüyü aç
        if result_label: result_label.config(text="Menü açılıyor...")
        click_element_merged(driver, By.CSS_SELECTOR, "#sidebar-menu > li:nth-child(4) > button", action_name="Menü aç")

        # Adım 2: 'Dosya Sorgula'ya tıkla
        if result_label: result_label.config(text="'Dosya Sorgula'ya gidiliyor...")
        click_element_merged(driver, By.CSS_SELECTOR, "[id='29954-alt-menu'] > a:nth-child(1) > li > span > span", action_name="'Dosya Sorgula' tıkla")

        # Adım 3: Radyo butonunu seç
        if result_label: result_label.config(text="Radyo butonu seçiliyor...")
        radio_button_xpath = "/html/body/div/div/div[1]/div[2]/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div[4]"
        click_element_merged(driver, By.XPATH, radio_button_xpath, action_name="Radyo buton seç")

        # Adım 4: Arama butonuna tıkla
        if result_label: result_label.config(text="Arama butonuna tıklanıyor...")
        click_element_merged(driver, By.CSS_SELECTOR, "#content-div2 > div.white-content > div > div:nth-child(3) > div > div.col-xl-6 > div > div.d-flex.gap-1 > button", action_name="Arama buton tıkla")

        # Adım 4.5: Sayfanın yüklenmesini bekle
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#yargi-turu-detayli-arama")))
            logger.info("Sayfa başarıyla yüklendi. Sonraki adımlara geçiliyor.")
        except TimeoutException:
            logger.error("Yargı Türü dropdown'u görünmedi.")

        # Adım 5-7: Dropdown'lardan seçim yap
        select_dropdown_option(driver, "#yargi-turu-detayli-arama", "İcra")
        select_dropdown_option(driver, "#yargi-birimi-detayli-arama", "İCRA DAİRESİ")
        select_dropdown_option(driver, "#mahkeme-detayli-arama", "Tümü")

        # Adım 8: Arama işlemini başlat
        if result_label: result_label.config(text="Arama gerçekleştiriliyor...")
        click_element_merged(driver, By.CSS_SELECTOR, "#content-div2 > div.white-content > div > div:nth-child(2) > div > div.col-xl-6.t-1 > div > div > div.hedef-card-footer > div.dx-widget.dx-button.dx-button-mode-contained.dx-button-default.dx-button-has-text.dx-button-has-icon", action_name="Aramayı başlat")

        logger.info("Arama işlemi başarıyla tamamlandı.")
        if result_label: result_label.config(text="Arama tamamlandı. Veri çıkarımı için hazır.")

    except Exception as e:
        logger.error(f"Arama sırasında beklenmeyen hata: {e}")
        if result_label:
            result_label.config(text=f"Hata: {e}")