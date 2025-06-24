import json
import re
from pathlib import Path

# JSON dosyalarının olduğu klasör, script dosyasının bulunduğu klasördeki 'datalar' alt klasörü
DATA_DIR = Path("/Users/ugurulger/Desktop/extracted_data/datalar")

# İşlenecek ana extracted JSON dosyası
json_files = [
    "extracted_data_20250315.json",
]

# Gerektiğinde diğer sorgu JSON'larını da ekleyebilirsiniz

def load_json(name):
    path = DATA_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Dosya bulunamadı: {path}\nKlasör içeriği: {list(DATA_DIR.iterdir())}")
    text = path.read_text(encoding="utf-8")
    # Trailing comma temizleme
    text = re.sub(r',\s*}', '}', text)
    text = re.sub(r',\s*\]', ']', text)
    return json.loads(text)


def process_main_rows(extracted):
    """Ana listedeki kayıtları işleyip temel alanları çıkarır."""
    out = []
    for row_key, rec in extracted.items():
        genel = rec.get("Genel", {})
        dosya_no = genel.get("Dosya No", "").strip()
        klasor = row_key.replace("row", "")
        file_id = klasor  # sadece klasör ismi kullanılıyor

        taraflar = rec.get("Taraf Bilgileri", {})
        borclular = [v["Adi"] for v in taraflar.values() if v.get("Rol") == "Borçlu"]
        alacakli = next((v["Adi"] for v in taraflar.values() if v.get("Rol") == "Alacaklı"), "")

        # 'takipTarihi' alanından sadece tarih kısmını al (saat atla)
        raw_tarih = genel.get("Dosya Açılış Tarihi", "")
        takip_tarihi = raw_tarih.split()[0] if raw_tarih else ""

        out.append({
            "file_id": file_id,
            "klasor": klasor,
            "dosyaNo": dosya_no,
            "borcluAdi": ", ".join(borclular),
            "alacakliAdi": alacakli,
            "foyTuru": genel.get("Dosya Türü", ""),
            "durum": genel.get("Dosya Durumu", ""),
            "takipTarihi": takip_tarihi,
            "icraMudurlugu": genel.get("Birim", "")
        })
    return out


def get_processed_data():
    """Tüm ana JSON dosyası işlenmiş veri listesi döner."""
    processed = []
    for fname in json_files:
        extracted = load_json(fname)
        processed.extend(process_main_rows(extracted))
    return processed

if __name__ == "__main__":
    data = get_processed_data()
    print(f"{len(data)} kayıt işlendi.")
