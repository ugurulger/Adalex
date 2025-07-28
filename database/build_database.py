import sqlite3
from process_json_files import get_processed_data

DB_PATH = "files.db"

def create_tables(conn):
    """Tüm gerekli tabloları oluşturur ve indeksler ekler."""
    # files tablosu
    conn.execute("""
    CREATE TABLE IF NOT EXISTS files (
        file_id TEXT PRIMARY KEY,
        klasor TEXT,
        dosyaNo TEXT,
        eYil INTEGER,
        eNo INTEGER,
        borcluAdi TEXT,
        alacakliAdi TEXT,
        foyTuru TEXT,
        durum TEXT,
        takipTarihi TEXT,
        icraMudurlugu TEXT
    );
    """)
    # file_details tablosu
    conn.execute("""
    CREATE TABLE IF NOT EXISTS file_details (
        file_id TEXT PRIMARY KEY,
        takipSekli TEXT,
        takipYolu TEXT,
        takipTuru TEXT,
        alacakliVekili TEXT,
        borcMiktari TEXT,
        faizOrani TEXT,
        guncelBorc TEXT,
        sonOdeme TEXT,
        FOREIGN KEY (file_id) REFERENCES files(file_id)
    );
    """)
    # borclular tablosu
    conn.execute("""
    CREATE TABLE IF NOT EXISTS borclular (
        borclu_id TEXT PRIMARY KEY,
        file_id TEXT,
        ad TEXT,
        tcKimlik TEXT,
        telefon TEXT,
        adres TEXT,
        vekil TEXT,
        FOREIGN KEY (file_id) REFERENCES files(file_id)
    );
    """)
    # borclu_sorgular tablosu
    conn.execute("""
    CREATE TABLE IF NOT EXISTS borclu_sorgular (
        borclu_id TEXT,
        sorgu_tipi TEXT,
        sorgu_verisi TEXT,
        timestamp TEXT,
        PRIMARY KEY (borclu_id, sorgu_tipi),
        FOREIGN KEY (borclu_id) REFERENCES borclular(borclu_id)
    );
    """)
    # İndeksler
    conn.execute("CREATE INDEX IF NOT EXISTS idx_files_dosyaNo_icraMudurlugu ON files(dosyaNo, icraMudurlugu);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_borclular_file_id ON borclular(file_id);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_borclu_sorgular_borclu_id ON borclu_sorgular(borclu_id);")

def upsert_files(conn, records):
    insert_sql = """
    INSERT INTO files (
        file_id, klasor, dosyaNo, eYil, eNo, borcluAdi,
        alacakliAdi, foyTuru, durum,
        takipTarihi, icraMudurlugu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    update_sql = """
    UPDATE files SET
        klasor = ?,
        eYil = ?,
        eNo = ?,
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
        cur = conn.execute(select_sql, (rec['dosyaNo'], rec['icraMudurlugu']))
        exists = cur.fetchone()
        if exists:
            conn.execute(update_sql, (
                rec['klasor'], rec.get('eYil'), rec.get('eNo'), rec['borcluAdi'], rec['alacakliAdi'],
                rec['foyTuru'], rec['durum'], rec['takipTarihi'],
                rec['icraMudurlugu'], rec['dosyaNo'], rec['icraMudurlugu']
            ))
        else:
            try:
                conn.execute(insert_sql, (
                    rec['file_id'], rec['klasor'], rec['dosyaNo'],
                    rec.get('eYil'), rec.get('eNo'), rec['borcluAdi'], rec['alacakliAdi'], rec['foyTuru'],
                    rec['durum'], rec['takipTarihi'], rec['icraMudurlugu']
                ))
            except sqlite3.IntegrityError as e:
                print(f"Files: Kayıt eklenemedi, file_id çakıştı: {rec['file_id']} - Hata: {str(e)}")

def upsert_file_details(conn, records):
    insert_sql = """
    INSERT INTO file_details (
        file_id, takipSekli, takipYolu, takipTuru, alacakliVekili,
        borcMiktari, faizOrani, guncelBorc, sonOdeme
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    update_sql = """
    UPDATE file_details SET
        takipSekli = ?,
        takipYolu = ?,
        takipTuru = ?,
        alacakliVekili = ?,
        borcMiktari = ?,
        faizOrani = ?,
        guncelBorc = ?,
        sonOdeme = ?
    WHERE file_id = ?;
    """
    select_sql = """
    SELECT 1 FROM file_details WHERE file_id = ?;
    """

    for rec in records:
        cur = conn.execute(select_sql, (rec['file_id'],))
        exists = cur.fetchone()
        if exists:
            conn.execute(update_sql, (
                rec['takipSekli'], rec['takipYolu'], rec['takipTuru'], rec['alacakliVekili'],
                rec['borcMiktari'], rec['faizOrani'],
                rec['guncelBorc'], rec['sonOdeme'],
                rec['file_id']
            ))
        else:
            try:
                conn.execute(insert_sql, (
                    rec['file_id'], rec['takipSekli'], rec['takipYolu'], rec['takipTuru'], rec['alacakliVekili'],
                    rec['borcMiktari'], rec['faizOrani'],
                    rec['guncelBorc'], rec['sonOdeme']
                ))
            except sqlite3.IntegrityError as e:
                print(f"File_details: Kayıt eklenemedi, file_id çakıştı: {rec['file_id']} - Hata: {str(e)}")

def upsert_borclular(conn, records):
    insert_sql = """
    INSERT INTO borclular (
        borclu_id, file_id, ad, tcKimlik,
        telefon, adres, vekil
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
    """
    update_sql = """
    UPDATE borclular SET
        ad = ?,
        tcKimlik = ?,
        telefon = ?,
        adres = ?,
        vekil = ?
    WHERE borclu_id = ?;
    """
    select_sql = """
    SELECT 1 FROM borclular WHERE borclu_id = ?;
    """

    for rec in records:
        cur = conn.execute(select_sql, (rec['borclu_id'],))
        exists = cur.fetchone()
        if exists:
            conn.execute(update_sql, (
                rec['ad'], rec['tcKimlik'], rec['telefon'],
                rec['adres'], rec['vekil'], rec['borclu_id']
            ))
        else:
            try:
                conn.execute(insert_sql, (
                    rec['borclu_id'], rec['file_id'], rec['ad'],
                    rec['tcKimlik'], rec['telefon'], rec['adres'],
                    rec['vekil']
                ))
            except sqlite3.IntegrityError as e:
                print(f"Borclular: Kayıt eklenemedi, borclu_id çakıştı: {rec['borclu_id']} - Hata: {str(e)}")

def upsert_borclu_sorgular(conn, records):
    insert_sql = """
    INSERT INTO borclu_sorgular (
        borclu_id, sorgu_tipi, sorgu_verisi, timestamp
    ) VALUES (?, ?, ?, ?);
    """
    update_sql = """
    UPDATE borclu_sorgular SET
        sorgu_verisi = ?,
        timestamp = ?
    WHERE borclu_id = ? AND sorgu_tipi = ?;
    """
    select_sql = """
    SELECT 1 FROM borclu_sorgular WHERE borclu_id = ? AND sorgu_tipi = ?;
    """

    for rec in records:
        cur = conn.execute(select_sql, (rec['borclu_id'], rec['sorgu_tipi']))
        exists = cur.fetchone()
        if exists:
            conn.execute(update_sql, (
                rec['sorgu_verisi'], rec['timestamp'], rec['borclu_id'], rec['sorgu_tipi']
            ))
        else:
            try:
                conn.execute(insert_sql, (
                    rec['borclu_id'], rec['sorgu_tipi'], rec['sorgu_verisi'], rec['timestamp']
                ))
            except sqlite3.IntegrityError as e:
                print(f"Borclu_sorgular: Kayıt eklenemedi, borclu_id: {rec['borclu_id']}, sorgu_tipi: {rec['sorgu_tipi']} - Hata: {str(e)}")

def main():
    data = get_processed_data()
    conn = sqlite3.connect(DB_PATH)
    create_tables(conn)
    upsert_files(conn, data["files"])
    upsert_file_details(conn, data["file_details"])
    upsert_borclular(conn, data["borclular"])
    upsert_borclu_sorgular(conn, data["borclu_sorgular"])
    conn.commit()
    conn.close()
    print(f"Veritabanı oluşturuldu/güncellendi: {DB_PATH}")
    print(f"{len(data['files'])} dosya, {len(data['file_details'])} detay, {len(data['borclular'])} borçlu, {len(data['borclu_sorgular'])} sorgu işlendi.")

if __name__ == "__main__":
    main()