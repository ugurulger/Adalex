import json
import re
from pathlib import Path

# JSON dosyalarının olduğu klasör
DATA_DIR = Path("/Users/ugurulger/Desktop/extracted_data/datalar")

# İşlenecek ana extracted JSON dosyası
json_files = [
    "extracted_data_20250315.json",
]

def clean_borclu_name(borclu_adi):
    """Borçlu adından ek bilgileri (TC kimlik, vb.) temizler"""
    if not borclu_adi:
        return ""
    
    # " - " ile ayrılmış kısımları al, ilk kısmı (isim) döndür
    parts = borclu_adi.split(" - ")
    clean_name = parts[0].strip()
    
    # Eğer isim boşsa, orijinal adı döndür
    return clean_name if clean_name else borclu_adi


def find_borclu_in_sorgu_data(sorgu_data, dosya_no, borclu_adi):
    """Sorgu verilerinde borçluyu temiz isimle arar"""
    if dosya_no not in sorgu_data:
        return {}
    
    # Önce tam eşleşme ara
    if borclu_adi in sorgu_data[dosya_no]:
        return sorgu_data[dosya_no][borclu_adi]
    
    # Tam eşleşme yoksa, JSON'daki uzun isimlerde temiz ismi ara
    clean_name = clean_borclu_name(borclu_adi)
    for key in sorgu_data[dosya_no].keys():
        # JSON'daki isimden temiz ismi çıkar
        json_clean_name = clean_borclu_name(key)
        if json_clean_name == clean_name:
            return sorgu_data[dosya_no][key]
    
    # Kısmi eşleşme ara
    for key in sorgu_data[dosya_no].keys():
        json_clean_name = clean_borclu_name(key)
        if clean_name in json_clean_name or json_clean_name in clean_name:
            return sorgu_data[dosya_no][key]
    
    return {}

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
    """Ana listedeki kayıtları ve detayları işler."""
    out_files = []
    out_details = []
    out_borclular = []
    out_sorgular = []

    # mernis_sorgu.json dosyasını yükle (eğer varsa)
    try:
        mernis_data = load_json("mernis_sorgu.json")
    except FileNotFoundError:
        mernis_data = {}
        print("Uyarı: mernis_sorgu.json dosyası bulunamadı, tcKimlik ve adres bilgileri boş olacak.")

    for row_key, rec in extracted.items():
        genel = rec.get("Genel", {})
        dosya_no = genel.get("Dosya No", "").strip()
        klasor = row_key.replace("row", "")
        file_id = klasor

        taraflar = rec.get("Taraf Bilgileri", {})
        borclular = [v for v in taraflar.values() if v.get("Rol") == "Borçlu"]
        alacakli = next((v for v in taraflar.values() if v.get("Rol") == "Alacaklı"), {})
        dosya_hesabi = rec.get("Dosya Hesabı", {})

        raw_tarih = genel.get("Dosya Açılış Tarihi", "")
        takip_tarihi = raw_tarih.split()[0] if raw_tarih else ""

        # files tablosu için veri
        out_files.append({
            "file_id": file_id,
            "klasor": klasor,
            "dosyaNo": dosya_no,
            "eYil": int(dosya_no.split("/")[0]) if "/" in dosya_no else None,
            "eNo": int(dosya_no.split("/")[1]) if "/" in dosya_no else None,
            "borcluAdi": ", ".join(b["Adi"] for b in borclular),
            "alacakliAdi": alacakli.get("Adi", ""),
            "foyTuru": genel.get("Dosya Türü", ""),
            "durum": genel.get("Dosya Durumu", ""),
            "takipTarihi": takip_tarihi,
            "icraMudurlugu": genel.get("Birim", "")
        })

        # file_details tablosu için veri
        out_details.append({
            "file_id": file_id,
            "takipSekli": rec.get("Dosya Bilgileri", {}).get("Şekli", ""),
            "takipYolu": rec.get("Dosya Bilgileri", {}).get("Yolu", ""),
            "takipTuru": rec.get("Dosya Bilgileri", {}).get("Türü", ""),
            "alacakliVekili": alacakli.get("Vekil", ""),
            "borcMiktari": dosya_hesabi.get("Takipte Kesinleşen Miktar", ""),
            "faizOrani": "",    # TBD
            "guncelBorc": dosya_hesabi.get("Bakiye Borç Miktarı", ""),
            "sonOdeme": ""      # TBD
        })

        # borcluList için veri
        for idx, borclu in enumerate(borclular, 1):
            borclu_id = f"{file_id}_{idx}"
            borclu_adi = borclu.get("Adi", "")

            # mernis_sorgu.json'dan tcKimlik ve adres bilgilerini al
            tc_kimlik = ""
            adres_str = ""
            mernis_borclu = find_borclu_in_sorgu_data(mernis_data, dosya_no, borclu_adi)
            if mernis_borclu:
                mernis_sonuc = mernis_borclu.get("MERNİS", {}).get("sonuc", {})
                
                # mernis_sonuc'un string olup olmadığını kontrol et
                if isinstance(mernis_sonuc, str):
                    try:
                        mernis_sonuc = json.loads(mernis_sonuc)
                    except json.JSONDecodeError:
                        mernis_sonuc = {}
                
                # Artık mernis_sonuc dictionary olmalı
                if isinstance(mernis_sonuc, dict):
                    try:
                        tc_kimlik = mernis_sonuc.get("Kimlik Bilgileri", {}).get("T.C Kimlik No", "")
                        adres_bilgileri = mernis_sonuc.get("Adres Bilgileri", {})
                        adres_str = f"{adres_bilgileri.get('Mahalle', '')}, {adres_bilgileri.get('Cadde/Sokak', '')} No: {adres_bilgileri.get('Dış Kapı No', '')}/{adres_bilgileri.get('İç Kapı No', '')} {adres_bilgileri.get('İl', '')}/{adres_bilgileri.get('İlçe', '')}".strip(", ")
                    except (AttributeError, TypeError):
                        # Eğer hala sorun varsa, boş değerler kullan
                        tc_kimlik = ""
                        adres_str = ""
                else:
                    # mernis_sonuc dictionary değilse, boş değerler kullan
                    tc_kimlik = ""
                    adres_str = ""

            out_borclular.append({
                "borclu_id": borclu_id,
                "file_id": file_id,
                "ad": borclu_adi,
                "tcKimlik": tc_kimlik,
                "telefon": "",  # TBD
                "adres": adres_str,
                "vekil": borclu.get("Vekil", "")
            })

            # Sorgu verileri (mernis_sorgu.json dahil)
            sorgu_files = [
                "mernis_sorgu.json", "sgk_sorgu.json", "egm_sorgu.json",
                "takbis_sorgu.json", "banka_sorgu.json", "icra_dosyasi_sorgu.json",
                "sgk_haciz_sorgu.json", "dis_isleri_sorgu.json", "gib_sorgu.json",
                "gsm_sorgu.json", "iski_sorgu.json", "posta_ceki_sorgu.json"
            ]
            for sorgu_file in sorgu_files:
                try:
                    sorgu_data = load_json(sorgu_file)
                    sorgu_key = sorgu_file.replace("_sorgu.json", "").capitalize()
                    borclu_sorgu = find_borclu_in_sorgu_data(sorgu_data, dosya_no, borclu_adi)
                    if borclu_sorgu:
                        out_sorgular.append({
                            "borclu_id": borclu_id,
                            "sorgu_tipi": sorgu_key,
                            "sorgu_verisi": json.dumps(borclu_sorgu, ensure_ascii=False)
                        })
                except FileNotFoundError:
                    continue  # Sorgu dosyası yoksa atla

    return {
        "files": out_files,
        "file_details": out_details,
        "borclular": out_borclular,
        "borclu_sorgular": out_sorgular
    }

def get_processed_data():
    """Tüm ana JSON dosyalarını işler ve yapılandırılmış veri döner."""
    processed = {
        "files": [],
        "file_details": [],
        "borclular": [],
        "borclu_sorgular": []
    }
    for fname in json_files:
        extracted = load_json(fname)
        data = process_main_rows(extracted)
        processed["files"].extend(data["files"])
        processed["file_details"].extend(data["file_details"])
        processed["borclular"].extend(data["borclular"])
        processed["borclu_sorgular"].extend(data["borclu_sorgular"])
    return processed


if __name__ == "__main__":
    data = get_processed_data()
    print(f"{len(data['files'])} dosya, {len(data['borclular'])} borçlu işlendi.")