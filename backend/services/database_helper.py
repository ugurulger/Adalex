import sqlite3
import json
import os
import logging
from pathlib import Path

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'files.db')

def get_logger():
    """Get logger for database operations"""
    logger = logging.getLogger('database_helper')
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

def create_database_if_not_exists():
    """Create database and tables if they don't exist"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Create files table
        cur.execute("""
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
        
        # Create file_details table
        cur.execute("""
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
        
        # Create borclular table
        cur.execute("""
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
        
        # Create borclu_sorgular table with timestamp column
        cur.execute("""
        CREATE TABLE IF NOT EXISTS borclu_sorgular (
            borclu_id TEXT,
            sorgu_tipi TEXT,
            sorgu_verisi TEXT,
            timestamp TEXT,
            PRIMARY KEY (borclu_id, sorgu_tipi),
            FOREIGN KEY (borclu_id) REFERENCES borclular(borclu_id)
        );
        """)
        
        # Create indexes
        cur.execute("CREATE INDEX IF NOT EXISTS idx_files_dosyaNo_icraMudurlugu ON files(dosyaNo, icraMudurlugu);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_borclular_file_id ON borclular(file_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_borclu_sorgular_borclu_id ON borclu_sorgular(borclu_id);")
        
        conn.commit()
        conn.close()
        logger = get_logger()
        logger.info(f"Database and tables created/verified at: {DB_PATH}")
        
    except Exception as e:
        logger = get_logger()
        logger.error(f"Error creating database: {e}")
        if conn:
            conn.close()

def get_database_connection():
    """Get database connection"""
    try:
        # Ensure database exists before connecting
        create_database_if_not_exists()
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable row factory for easier access
        return conn
    except Exception as e:
        logger = get_logger()
        logger.error(f"Database connection error: {e}")
        return None

def save_scraping_result_to_db(dosya_no, borclu_adi, sorgu_tipi, sorgu_verisi):
    """
    Save scraping result directly to borclu_sorgular table
    
    Args:
        dosya_no (str): File number
        borclu_adi (str): Debtor name
        sorgu_tipi (str): Query type (e.g., 'Banka', 'GIB', 'SGK')
        sorgu_verisi (dict): Query result data
    
    Returns:
        bool: True if successful, False otherwise
    """
    logger = get_logger()
    
    try:
        conn = get_database_connection()
        if not conn:
            logger.error("Failed to get database connection")
            return False
        
        # Find borclu_id based on dosya_no and borclu_adi
        cursor = conn.cursor()
        
        # First, find the file_id from dosya_no
        cursor.execute("""
            SELECT file_id FROM files WHERE dosyaNo = ?
        """, (dosya_no,))
        
        file_result = cursor.fetchone()
        if not file_result:
            logger.warning(f"File not found for dosya_no: {dosya_no}")
            conn.close()
            return False
        
        file_id = file_result['file_id']
        
        # Extract just the name part before the TC number (before the "-" character)
        borclu_name_only = borclu_adi.split(' - ')[0] if ' - ' in borclu_adi else borclu_adi
        
        # Then, find the borclu_id from file_id and borclu_adi
        cursor.execute("""
            SELECT borclu_id FROM borclular 
            WHERE file_id = ? AND ad LIKE ?
        """, (file_id, f"%{borclu_name_only}%"))
        
        borclu_result = cursor.fetchone()
        if not borclu_result:
            logger.warning(f"Debtor not found for file_id: {file_id}, borclu_adi: {borclu_adi}")
            conn.close()
            return False
        
        borclu_id = borclu_result['borclu_id']
        
        # Convert sorgu_verisi to JSON string
        sorgu_verisi_json = json.dumps(sorgu_verisi, ensure_ascii=False)
        
        # Get current timestamp
        from datetime import datetime
        current_timestamp = datetime.now().isoformat()
        
        # Insert or update the query result
        cursor.execute("""
            INSERT OR REPLACE INTO borclu_sorgular 
            (borclu_id, sorgu_tipi, sorgu_verisi, timestamp) 
            VALUES (?, ?, ?, ?)
        """, (borclu_id, sorgu_tipi, sorgu_verisi_json, current_timestamp))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully saved {sorgu_tipi} query result for borclu_id: {borclu_id} at {current_timestamp}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving scraping result to database: {e}")
        if conn:
            conn.close()
        return False

def save_scraping_data_to_db_and_json(scraping_data, filename=None):
    """
    Save scraping data to both database and JSON file (backup)
    
    Args:
        scraping_data (dict or list): The scraping result data
        filename (str): Optional JSON filename for backup
    
    Returns:
        bool: True if successful, False otherwise
    """
    logger = get_logger()
    # Print borclu_id and DB_PATH for debugging
    try:
        if isinstance(scraping_data, dict):
            for dosya_no, borclular in scraping_data.items():
                for borclu_id in borclular.keys():
                    print(f"[SAVE] borclu_id={borclu_id}, DB_PATH={os.path.abspath(os.path.join(os.path.dirname(__file__), '../files.db'))}")
    except Exception as e:
        print(f"[SAVE] Debug print error: {e}")
    # Save to JSON file first (backup)
    try:
        save_to_json_simple(scraping_data, filename)
        logger.info("Data saved to JSON file as backup")
    except Exception as e:
        logger.error(f"Failed to save data to JSON: {e}")
    
    # Save to database
    try:
        # Handle different data structures
        if isinstance(scraping_data, list):
            # New structure from search_all_files_extract.py (array of file objects)
            for file_data in scraping_data:
                dosya_no = file_data.get('dosyaNo', '')
                borclu_adi = file_data.get('borcluAdi', '')
                
                # Save file data to files table
                save_file_data_to_db(file_data)
                
                # Save debtor data to borclular table
                for borclu in file_data.get('borcluList', []):
                    save_borclu_data_to_db(borclu, file_data['file_id'])
                
                # Save query results if any
                if 'sorgular' in file_data:
                    for sorgu_tipi, sorgu_verisi in file_data['sorgular'].items():
                        success = save_scraping_result_to_db(dosya_no, borclu_adi, sorgu_tipi, sorgu_verisi)
                        if not success:
                            logger.warning(f"Failed to save {sorgu_tipi} for {borclu_adi} in {dosya_no}")
        
        elif isinstance(scraping_data, dict):
            # Old structure (nested dictionary)
            for dosya_no, borclular in scraping_data.items():
                for borclu_adi, sorgular in borclular.items():
                    for sorgu_tipi, sorgu_verisi in sorgular.items():
                        success = save_scraping_result_to_db(dosya_no, borclu_adi, sorgu_tipi, sorgu_verisi)
                        if not success:
                            logger.warning(f"Failed to save {sorgu_tipi} for {borclu_adi} in {dosya_no}")
                        
                        # MERNİS verilerinden T.C Kimlik No ve Adres bilgilerini otomatik kaydet
                        if sorgu_tipi == "MERNİS" and isinstance(sorgu_verisi, dict) and "sonuc" in sorgu_verisi:
                            process_mernis_data_for_borclu(dosya_no, borclu_adi, sorgu_verisi["sonuc"])
        
        logger.info("Data saved to database successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error saving data to database: {e}")
        return False

def save_file_data_to_db(file_data):
    """
    Save file data to the files and file_details tables
    
    Args:
        file_data (dict): File data with database schema fields
    """
    logger = get_logger()
    
    try:
        conn = get_database_connection()
        if not conn:
            logger.error("Failed to get database connection")
            return False
        
        cursor = conn.cursor()
        
        # Insert or update file data in files table
        cursor.execute("""
            INSERT OR REPLACE INTO files 
            (file_id, klasor, dosyaNo, eYil, eNo, borcluAdi, alacakliAdi, foyTuru, durum, 
             takipTarihi, icraMudurlugu) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            file_data.get('file_id'),
            file_data.get('klasor'),
            file_data.get('dosyaNo'),
            file_data.get('eYil'),
            file_data.get('eNo'),
            file_data.get('borcluAdi'),
            file_data.get('alacakliAdi'),
            file_data.get('foyTuru'),
            file_data.get('durum'),
            file_data.get('takipTarihi'),
            file_data.get('icraMudurlugu')
        ))
        
        # Insert or update file details in file_details table
        cursor.execute("""
            INSERT OR REPLACE INTO file_details 
            (file_id, takipSekli, takipYolu, takipTuru, alacakliVekili, borcMiktari, faizOrani, guncelBorc) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            file_data.get('file_id'),
            file_data.get('takipSekli'),
            file_data.get('takipYolu'),
            file_data.get('takipTuru'),
            file_data.get('alacakliVekili'),
            file_data.get('borcMiktari'),
            file_data.get('faizOrani'),
            file_data.get('guncelBorc')
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully saved file data for file_id: {file_data.get('file_id')}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving file data to database: {e}")
        if conn:
            conn.close()
        return False

def save_borclu_data_to_db(borclu_data, file_id):
    """
    Save debtor data to the borclular table
    
    Args:
        borclu_data (dict): Debtor data
        file_id (str): File ID
    """
    logger = get_logger()
    
    try:
        conn = get_database_connection()
        if not conn:
            logger.error("Failed to get database connection")
            return False
        
        cursor = conn.cursor()
        
        # Insert or update debtor data
        cursor.execute("""
            INSERT OR REPLACE INTO borclular 
            (borclu_id, file_id, ad, tcKimlik, telefon, adres, vekil) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            borclu_data.get('borclu_id'),
            file_id,
            borclu_data.get('ad'),
            borclu_data.get('tcKimlik'),
            borclu_data.get('telefon'),
            borclu_data.get('adres'),
            borclu_data.get('vekil')
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully saved debtor data for borclu_id: {borclu_data.get('borclu_id')}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving debtor data to database: {e}")
        if conn:
            conn.close()
        return False

def get_scraping_result_from_db(dosya_no, borclu_adi, sorgu_tipi):
    """
    Get scraping result from database
    
    Args:
        dosya_no (str): File number
        borclu_adi (str): Debtor name
        sorgu_tipi (str): Query type
    
    Returns:
        dict: Query result data or None if not found
    """
    logger = get_logger()
    
    try:
        conn = get_database_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        # Find borclu_id
        cursor.execute("""
            SELECT b.borclu_id, bs.sorgu_verisi
            FROM borclular b
            JOIN files f ON b.file_id = f.file_id
            JOIN borclu_sorgular bs ON b.borclu_id = bs.borclu_id
            WHERE f.dosyaNo = ? AND b.ad LIKE ? AND bs.sorgu_tipi = ?
        """, (dosya_no, f"%{borclu_adi}%", sorgu_tipi))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return json.loads(result['sorgu_verisi'])
        else:
            return None
            
    except Exception as e:
        logger.error(f"Error getting scraping result from database: {e}")
        return None

def process_mernis_data_for_borclu(dosya_no, borclu_adi, mernis_sonuc):
    """MERNİS verilerinden TC Kimlik ve adres bilgilerini veritabanına kaydet"""
    logger = get_logger()
    
    try:
        # TC Kimlik ve adres bilgilerini çıkar
        tc_kimlik = mernis_sonuc.get("Kimlik Bilgileri", {}).get("T.C Kimlik No", "").strip()
        adres_bilgileri = mernis_sonuc.get("Adres Bilgileri", {})
        
        # Adres parçalarını birleştir
        adres_parcalari = []
        if adres_bilgileri.get("Mahalle"): adres_parcalari.append(adres_bilgileri["Mahalle"])
        if adres_bilgileri.get("Cadde/Sokak"): adres_parcalari.append(adres_bilgileri["Cadde/Sokak"])
        
        # Kapı numarası
        dis_kapi = adres_bilgileri.get("Dış Kapı No", "")
        ic_kapi = adres_bilgileri.get("İç Kapı No", "")
        if dis_kapi and ic_kapi:
            adres_parcalari.append(f"No: {ic_kapi}/{dis_kapi}")
        elif dis_kapi:
            adres_parcalari.append(f"No: {dis_kapi}")
        elif ic_kapi:
            adres_parcalari.append(f"No: {ic_kapi}")
        
        # İl/İlçe
        ilce = adres_bilgileri.get("İlçe", "")
        il = adres_bilgileri.get("İl", "")
        if ilce and il:
            adres_parcalari.append(f"{ilce}/{il}")
        elif ilce:
            adres_parcalari.append(ilce)
        elif il:
            adres_parcalari.append(il)
        
        adres_str = " ".join(adres_parcalari)
        
        # Veritabanını güncelle
        if tc_kimlik or adres_str:
            conn = get_database_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT file_id FROM files WHERE dosyaNo = ?", (dosya_no,))
            file_id = cursor.fetchone()['file_id']
            borclu_name_only = borclu_adi.split(' - ')[0] if ' - ' in borclu_adi else borclu_adi
            
            cursor.execute("UPDATE borclular SET tcKimlik = ?, adres = ? WHERE file_id = ? AND ad LIKE ?", 
                         (tc_kimlik, adres_str, file_id, f"%{borclu_name_only}%"))
            conn.commit()
            conn.close()
            logger.info(f"Updated borclu data for {borclu_adi}")
            
    except Exception as e:
        logger.error(f"Error updating borclu data: {e}")

def save_to_json_simple(data, filename=None):
    """
    Simple JSON saving function without selenium dependencies
    
    Args:
        data: Data to save
        filename (str): JSON filename
    """
    if filename is None:
        # Create default filename
        from datetime import datetime
        filename = f"/tmp/extracted_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Save data to JSON file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

#This function is used to get or create file_id for search_all_files_extract.py
def get_or_create_file_id_for_extract(dosya_no, icra_mudurlugu):
    """
    Get existing file_id or create new one for search_all_files_extract.py
    
    Args:
        dosya_no (str): File number
        icra_mudurlugu (str): İcra Müdürlüğü
    
    Returns:
        tuple: (file_id, klasor, is_new_file)
    """
    logger = get_logger()
    
    try:
        conn = get_database_connection()
        if not conn:
            logger.error("Failed to get database connection")
            return None, None, False
        
        cursor = conn.cursor()
        
        # Check if file already exists
        cursor.execute("""
            SELECT file_id, klasor FROM files 
            WHERE dosyaNo = ? AND icraMudurlugu = ?
        """, (dosya_no, icra_mudurlugu))
        
        existing_file = cursor.fetchone()
        
        if existing_file:
            # File exists, return existing file_id and klasor
            logger.info(f"File already exists: dosya_no={dosya_no}, icra_mudurlugu={icra_mudurlugu}, file_id={existing_file['file_id']}")
            conn.close()
            return existing_file['file_id'], existing_file['klasor'], False
        
        # File doesn't exist, find the next available file_id
        cursor.execute("""
            SELECT file_id FROM files 
            ORDER BY CAST(file_id AS INTEGER) DESC 
            LIMIT 1
        """)
        
        last_file = cursor.fetchone()
        
        if last_file:
            # Get the next available file_id
            next_file_id = str(int(last_file['file_id']) + 1)
        else:
            # No files exist, start with 1
            next_file_id = "1"
        
        # klasor is the same as file_id for UI display
        klasor = next_file_id
        
        logger.info(f"Created new file_id: {next_file_id} for dosya_no={dosya_no}, icra_mudurlugu={icra_mudurlugu}")
        conn.close()
        return next_file_id, klasor, True
        
    except Exception as e:
        logger.error(f"Error getting or creating file_id: {e}")
        if conn:
            conn.close()
        return None, None, False

# This function is used to save extract data to database with automatic file_id and klasor generation
def save_extract_data_to_db(file_data_without_ids):
    """
    Save extract data to database with automatic file_id and klasor generation
    
    Args:
        file_data_without_ids (dict): File data without file_id and klasor
    
    Returns:
        dict: File data with generated file_id and klasor, or None if failed
    """
    logger = get_logger()
    
    try:
        dosya_no = file_data_without_ids.get('dosyaNo')
        icra_mudurlugu = file_data_without_ids.get('icraMudurlugu')
        
        if not dosya_no or not icra_mudurlugu:
            logger.error("dosyaNo or icraMudurlugu is missing")
            return None
        
        # Get or create file_id and klasor
        file_id, klasor, is_new_file = get_or_create_file_id_for_extract(dosya_no, icra_mudurlugu)
        
        if not file_id:
            logger.error("Failed to get or create file_id")
            return None
        
        # Add file_id and klasor to the data
        file_data = file_data_without_ids.copy()
        file_data['file_id'] = file_id
        file_data['klasor'] = klasor
        
        # Update borclu_id in borcluList to use the new file_id
        for i, borclu in enumerate(file_data.get('borcluList', [])):
            borclu['file_id'] = file_id
            borclu['borclu_id'] = f"{file_id}_{i + 1}"
        
        # Save to database
        if is_new_file:
            # New file - insert all data
            save_file_data_to_db(file_data)
            for borclu in file_data.get('borcluList', []):
                save_borclu_data_to_db(borclu, file_id)
        else:
            # Existing file - update data
            save_file_data_to_db(file_data)
            # Update borclular (delete old ones and insert new ones)
            conn = get_database_connection()
            if conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM borclular WHERE file_id = ?", (file_id,))
                conn.commit()
                conn.close()
                
                for borclu in file_data.get('borcluList', []):
                    save_borclu_data_to_db(borclu, file_id)
        
        logger.info(f"Successfully saved extract data for file_id: {file_id}")
        return file_data
        
    except Exception as e:
        logger.error(f"Error saving extract data to database: {e}")
        return None 