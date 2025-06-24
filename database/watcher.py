import time
import os
import subprocess
import sys
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# JSON dosyalarının olduğu klasör
DATA_DIR = Path("/Users/ugurulger/Desktop/extracted_data/datalar")

# İzlenecek JSON dosyaları
WATCH_FILES = [
    "extracted_data_20250315.json",
    "mernis_sorgu.json",
    "sgk_sorgu.json",
    "egm_sorgu.json",
    "takbis_sorgu.json",
    "banka_sorgu.json",
    "gsm_sorgu.json",
    "gib_sorgu.json",
    "iski_sorgu.json",
    "posta_ceki_sorgu.json",
    "dis_isleri_sorgu.json",
    "sgk_haciz_sorgu.json",
    "icra_dosyasi_sorgu.json"
]

class JSONFileHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_modified = {}
        self.processing = False
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        # Sadece izlenen dosyaları kontrol et
        file_name = os.path.basename(event.src_path)
        if file_name not in WATCH_FILES:
            return
        
        # Dosya yolu kontrolü
        if not event.src_path.startswith(str(DATA_DIR)):
            return
        
        # Aynı dosya için çok sık tetiklenmeyi önle
        current_time = time.time()
        if file_name in self.last_modified:
            if current_time - self.last_modified[file_name] < 2:  # 2 saniye bekle
                return
        
        self.last_modified[file_name] = current_time
        
        # Eğer zaten işlem yapılıyorsa bekle
        if self.processing:
            print(f"⚠️  {file_name} değişti ama başka bir işlem devam ediyor...")
            return
        
        print(f"🔄 {file_name} değişti! İşlemler başlatılıyor...")
        self.run_processing_scripts()
    
    def run_processing_scripts(self):
        """3 işlem scriptini sırayla çalıştırır"""
        self.processing = True
        
        try:
            scripts = [
                ("process_json_files.py", "JSON dosyalarını işleme"),
                ("build_database.py", "Veritabanını oluşturma"),
                ("view_db.py", "Veritabanını görüntüleme")
            ]
            
            for script_name, description in scripts:
                print(f"📝 {description} başlatılıyor...")
                
                try:
                    result = subprocess.run(
                        [sys.executable, script_name],
                        capture_output=True,
                        text=True,
                        cwd=os.getcwd(),
                        timeout=60  # 60 saniye timeout
                    )
                    
                    if result.returncode == 0:
                        print(f"✅ {description} başarıyla tamamlandı")
                        if result.stdout.strip():
                            print(f"   Çıktı: {result.stdout.strip()}")
                    else:
                        print(f"❌ {description} hatası:")
                        print(f"   Hata: {result.stderr.strip()}")
                        
                except subprocess.TimeoutExpired:
                    print(f"⏰ {description} zaman aşımına uğradı")
                except Exception as e:
                    print(f"❌ {description} çalıştırılırken hata: {e}")
                
                # Scriptler arası kısa bekleme
                time.sleep(1)
            
            print("🎉 Tüm işlemler tamamlandı!")
            
        except Exception as e:
            print(f"❌ Genel hata: {e}")
        finally:
            self.processing = False

def check_files_exist():
    """İzlenecek dosyaların varlığını kontrol eder"""
    missing_files = []
    for file_name in WATCH_FILES:
        file_path = DATA_DIR / file_name
        if not file_path.exists():
            missing_files.append(file_name)
    
    if missing_files:
        print("⚠️  Bazı dosyalar bulunamadı:")
        for file_name in missing_files:
            print(f"   - {file_name}")
        print(f"📁 Beklenen klasör: {DATA_DIR}")
        print("   Bu dosyalar izlenmeyecek.")
    
    return len(missing_files) == 0

def main():
    print("🔍 JSON Dosya İzleyici Başlatılıyor...")
    print(f"📁 İzlenen klasör: {DATA_DIR}")
    print("📋 İzlenen dosyalar:")
    for file_name in WATCH_FILES:
        file_path = DATA_DIR / file_name
        status = "✅" if file_path.exists() else "❌"
        print(f"   {status} {file_name}")
    
    print("\n🚀 İzleme başlatılıyor... (Ctrl+C ile durdurun)")
    
    # Dosya varlığını kontrol et
    check_files_exist()
    
    # Observer'ı başlat
    event_handler = JSONFileHandler()
    observer = Observer()
    observer.schedule(event_handler, str(DATA_DIR), recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️  İzleme durduruluyor...")
        observer.stop()
    
    observer.join()
    print("👋 İzleyici kapatıldı.")

if __name__ == "__main__":
    main() 