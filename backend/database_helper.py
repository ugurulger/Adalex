import sqlite3
import json
import os
import logging
from pathlib import Path

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'files.db')

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

def get_database_connection():
    """Get database connection"""
    try:
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
        
        # Insert or update the query result
        cursor.execute("""
            INSERT OR REPLACE INTO borclu_sorgular 
            (borclu_id, sorgu_tipi, sorgu_verisi) 
            VALUES (?, ?, ?)
        """, (borclu_id, sorgu_tipi, sorgu_verisi_json))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Successfully saved {sorgu_tipi} query result for borclu_id: {borclu_id}")
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
    
    # Save to JSON file first (backup)
    try:
        save_to_json_simple(scraping_data, filename)
        logger.info("Data saved to JSON file as backup")
    except Exception as e:
        logger.warning(f"Failed to save to JSON file: {e}")
    
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
            (file_id, klasor, dosyaNo, borcluAdi, alacakliAdi, foyTuru, durum, 
             takipTarihi, icraMudurlugu) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            file_data.get('file_id'),
            file_data.get('klasor'),
            file_data.get('dosyaNo'),
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
            (file_id, takipSekli, alacakliVekili, borcMiktari, faizOrani, guncelBorc) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            file_data.get('file_id'),
            file_data.get('takipSekli'),
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