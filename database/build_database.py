import sqlite3
from process_json_files import get_processed_data

DB_PATH = "files.db"

# Veritabanındaki 'files' tablosunu oluşturur
def create_table(conn):
    conn.execute("""
    CREATE TABLE IF NOT EXISTS files (
        file_id TEXT PRIMARY KEY,
        klasor TEXT,
        dosyaNo TEXT,
        borcluAdi TEXT,
        alacakliAdi TEXT,
        foyTuru TEXT,
        durum TEXT,
        takipTarihi TEXT,
        icraMudurlugu TEXT
    );
    """)

# Kayıtları upsert mantığıyla ekler/günceller
def upsert_records(conn, records):
    insert_sql = """
        INSERT INTO files (
            file_id, klasor, dosyaNo, borcluAdi,
            alacakliAdi, foyTuru, durum,
            takipTarihi, icraMudurlugu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    update_sql = """
        UPDATE files SET
            klasor = ?,
            borcluAdi = ?,
            alacakliAdi = ?,
            foyTuru = ?,
            durum = ?,
            takipTarihi = ?,
            icraMudurlugu = ?
        WHERE dosyaNo = ? AND icraMudurlugu = ?;
    """
    select_sql = """
        SELECT 1 FROM files WHERE dosyaNo = ? AND icraMudurlugu = ?;
    """

    for rec in records:
        # 1) dosyaNo ve icraMudurlugu kombinasyonunu kontrol et
        cur = conn.execute(select_sql, (rec['dosyaNo'], rec['icraMudurlugu']))
        exists = cur.fetchone()

        if exists:
            # 2) Kayıt varsa, güncelle
            conn.execute(update_sql, (
                rec['klasor'],
                rec['borcluAdi'],
                rec['alacakliAdi'],
                rec['foyTuru'],
                rec['durum'],
                rec['takipTarihi'],
                rec['icraMudurlugu'],
                rec['dosyaNo'],
                rec['icraMudurlugu']
            ))
        else:
            # 3) Kayıt yoksa, yeni kayıt ekle
            try:
                conn.execute(insert_sql, (
                    rec['file_id'],
                    rec['klasor'],
                    rec['dosyaNo'],
                    rec['borcluAdi'],
                    rec['alacakliAdi'],
                    rec['foyTuru'],
                    rec['durum'],
                    rec['takipTarihi'],
                    rec['icraMudurlugu'],
                ))
            except sqlite3.IntegrityError as e:
                # file_id çakışması durumunda hata mesajı logla
                print(f"Yeni kayıt eklenemedi, file_id çakıştı: {rec['file_id']} (dosyaNo: {rec['dosyaNo']}, icraMudurlugu: {rec['icraMudurlugu']}) - Hata: {str(e)}")

def main():
    # İşlenmiş verileri al
    records = get_processed_data()
    conn = sqlite3.connect(DB_PATH)
    create_table(conn)
    upsert_records(conn, records)
    conn.commit()
    conn.close()
    print(f"Veritabanı oluşturuldu/güncellendi: {DB_PATH} ({len(records)} kayıt)")

if __name__ == "__main__":
    main()