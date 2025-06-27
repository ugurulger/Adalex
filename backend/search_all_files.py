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
        click_element_merged(driver, By.XPATH, "//span[@class='menu-text' and text()='Dosya Sorgula']", action_name="'Dosya Sorgula' tıkla")

        # Adım 3: Dropdown'lardan seçim yap
        select_dropdown_option(driver, "#yargi-turu-detayli-arama", "İcra")
        select_dropdown_option(driver, "#yargi-birimi-detayli-arama", "İCRA DAİRESİ")
        select_dropdown_option(driver, "#mahkeme-detayli-arama", "Tümü")

        # Adım 4: Arama işlemini başlat
        ARAMA_SELECTOR = "[aria-label='Sorgula']"
        if result_label: result_label.config(text="Arama gerçekleştiriliyor...")
        click_element_merged(driver, By.CSS_SELECTOR, ARAMA_SELECTOR, action_name="Arama buton tıkla")

        logger.info("Arama işlemi başarıyla tamamlandı.")
        if result_label: result_label.config(text="Arama tamamlandı. Veri çıkarımı için hazır.")

    except Exception as e:
        logger.error(f"Arama sırasında beklenmeyen hata: {e}")
        if result_label:
            result_label.config(text=f"Hata: {e}")