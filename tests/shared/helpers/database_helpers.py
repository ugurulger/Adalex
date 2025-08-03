import sqlite3
import tempfile
import os
from typing import Dict, Any, List, Optional

def create_test_database() -> str:
    """Create a temporary test database and return its path"""
    temp_db_fd, temp_db_path = tempfile.mkstemp(suffix='.db')
    os.close(temp_db_fd)
    
    conn = sqlite3.connect(temp_db_path)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE files (
            file_id INTEGER PRIMARY KEY,
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
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE file_details (
            file_id INTEGER PRIMARY KEY,
            dosya_no TEXT,
            borclu_adi TEXT,
            alacakli_adi TEXT,
            tutar REAL,
            created_at TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE borclular (
            borclu_id INTEGER PRIMARY KEY,
            file_id INTEGER,
            borclu_adi TEXT,
            borclu_soyadi TEXT,
            tc_no TEXT,
            created_at TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE borclu_sorgular (
            sorgu_id INTEGER PRIMARY KEY,
            borclu_id INTEGER,
            sorgu_tipi TEXT,
            sorgu_verisi TEXT,
            timestamp TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    
    return temp_db_path

def insert_test_data(db_path: str) -> None:
    """Insert test data into the database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Insert test files
    cursor.execute('''
        INSERT INTO files (file_id, klasor, dosyaNo, eYil, eNo, borcluAdi, alacakliAdi, foyTuru, durum, takipTarihi, icraMudurlugu)
        VALUES (1, '2024/1', '2024/1', 2024, 1, 'Ahmet Yılmaz', 'Mehmet Demir', 'İlamlı', 'Açık', '2024-01-15', 'İstanbul')
    ''')
    
    cursor.execute('''
        INSERT INTO files (file_id, klasor, dosyaNo, eYil, eNo, borcluAdi, alacakliAdi, foyTuru, durum, takipTarihi, icraMudurlugu)
        VALUES (2, '2024/2', '2024/2', 2024, 2, 'Fatma Kaya', 'Ali Özkan', 'İlamsız', 'Derdest', '2024-01-20', 'Ankara')
    ''')
    
    # Insert file details
    cursor.execute('''
        INSERT INTO file_details (file_id, dosya_no, borclu_adi, alacakli_adi, tutar, created_at)
        VALUES (1, '2024/1', 'Ahmet Yılmaz', 'Mehmet Demir', 50000.0, '2024-01-15T10:00:00')
    ''')
    
    # Insert borclular
    cursor.execute('''
        INSERT INTO borclular (borclu_id, file_id, borclu_adi, borclu_soyadi, tc_no, created_at)
        VALUES (1, 1, 'Ahmet', 'Yılmaz', '12345678901', '2024-01-15T10:00:00')
    ''')
    
    cursor.execute('''
        INSERT INTO borclular (borclu_id, file_id, borclu_adi, borclu_soyadi, tc_no, created_at)
        VALUES (2, 1, 'Fatma', 'Kaya', '98765432109', '2024-01-15T10:00:00')
    ''')
    
    # Insert sorgular
    cursor.execute('''
        INSERT INTO borclu_sorgular (sorgu_id, borclu_id, sorgu_tipi, sorgu_verisi, timestamp)
        VALUES (1, 1, 'Banka', '{"hesap_sayisi": 2, "toplam_bakiye": 15000}', '2024-01-15T10:30:00')
    ''')
    
    cursor.execute('''
        INSERT INTO borclu_sorgular (sorgu_id, borclu_id, sorgu_tipi, sorgu_verisi, timestamp)
        VALUES (2, 1, 'SGK', '{"sgk_no": "12345678901", "durum": "Aktif"}', '2024-01-15T11:00:00')
    ''')
    
    conn.commit()
    conn.close()

def cleanup_test_database(db_path: str) -> None:
    """Clean up test database file"""
    try:
        os.unlink(db_path)
    except FileNotFoundError:
        pass

def get_file_by_id(db_path: str, file_id: int) -> Optional[Dict[str, Any]]:
    """Get file by ID from test database"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM files WHERE file_id = ?", (file_id,))
    row = cursor.fetchone()
    conn.close()
    
    return dict(row) if row else None

def get_all_files(db_path: str) -> List[Dict[str, Any]]:
    """Get all files from test database"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM files ORDER BY file_id")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_borclular_by_file_id(db_path: str, file_id: int) -> List[Dict[str, Any]]:
    """Get borclular by file ID from test database"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM borclular WHERE file_id = ?", (file_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_sorgular_by_borclu_id(db_path: str, borclu_id: int) -> List[Dict[str, Any]]:
    """Get sorgular by borclu ID from test database"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM borclu_sorgular WHERE borclu_id = ?", (borclu_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def insert_test_file(db_path: str, file_data: Dict[str, Any]) -> int:
    """Insert a test file and return the file_id"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO files (klasor, dosyaNo, eYil, eNo, borcluAdi, alacakliAdi, foyTuru, durum, takipTarihi, icraMudurlugu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
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
    
    file_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return file_id

def delete_test_file(db_path: str, file_id: int) -> bool:
    """Delete a test file by ID"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM files WHERE file_id = ?", (file_id,))
    affected_rows = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected_rows > 0

def update_test_file(db_path: str, file_id: int, updates: Dict[str, Any]) -> bool:
    """Update a test file by ID"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Build update query dynamically
    set_clause = ", ".join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [file_id]
    
    cursor.execute(f"UPDATE files SET {set_clause} WHERE file_id = ?", values)
    affected_rows = cursor.rowcount
    conn.commit()
    conn.close()
    
    return affected_rows > 0

def get_database_stats(db_path: str) -> Dict[str, int]:
    """Get database statistics for testing"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    stats = {}
    
    # Count files
    cursor.execute("SELECT COUNT(*) FROM files")
    stats['files_count'] = cursor.fetchone()[0]
    
    # Count borclular
    cursor.execute("SELECT COUNT(*) FROM borclular")
    stats['borclular_count'] = cursor.fetchone()[0]
    
    # Count sorgular
    cursor.execute("SELECT COUNT(*) FROM borclu_sorgular")
    stats['sorgular_count'] = cursor.fetchone()[0]
    
    # Count file_details
    cursor.execute("SELECT COUNT(*) FROM file_details")
    stats['file_details_count'] = cursor.fetchone()[0]
    
    conn.close()
    return stats 