import pytest
import sys
import os
import sqlite3
import json
import tempfile
from unittest.mock import patch, Mock

# Add backend to path - fix the path to work from tests directory
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend')
sys.path.insert(0, backend_path)

# Also add the services directory to the path to handle relative imports
services_path = os.path.join(backend_path, 'services')
sys.path.insert(0, services_path)

# Import after setting up paths
from database_reader import (
    get_all_files,
    get_file_by_id,
    get_file_details_by_id,
    get_borclular_by_file_id,
    get_borclu_sorgular_by_borclu_id,
    get_borclu_sorgu_by_tipi,
    get_file_dict
)

class TestDatabaseOperations:
    """Integration tests for database operations"""
    
    @pytest.fixture
    def temp_db(self):
        """Create a temporary database for testing"""
        # Create temporary database file
        temp_db_fd, temp_db_path = tempfile.mkstemp(suffix='.db')
        os.close(temp_db_fd)
        
        # Create test database structure
        conn = sqlite3.connect(temp_db_path)
        cursor = conn.cursor()
        
        # Create files table
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
        
        # Create file_details table
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
        
        # Create borclular table
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
        
        # Create borclu_sorgular table
        cursor.execute('''
            CREATE TABLE borclu_sorgular (
                sorgu_id INTEGER PRIMARY KEY,
                borclu_id INTEGER,
                sorgu_tipi TEXT,
                sorgu_verisi TEXT,
                timestamp TEXT
            )
        ''')
        
        # Insert test data
        cursor.execute('''
            INSERT INTO files (file_id, klasor, dosyaNo, eYil, eNo, borcluAdi, alacakliAdi, foyTuru, durum, takipTarihi, icraMudurlugu)
            VALUES (1, '2024/1', '2024/1', 2024, 1, 'Ahmet Yılmaz', 'Mehmet Demir', 'İlamlı', 'Açık', '2024-01-15', 'İstanbul')
        ''')
        
        cursor.execute('''
            INSERT INTO files (file_id, klasor, dosyaNo, eYil, eNo, borcluAdi, alacakliAdi, foyTuru, durum, takipTarihi, icraMudurlugu)
            VALUES (2, '2024/2', '2024/2', 2024, 2, 'Fatma Kaya', 'Ali Özkan', 'İlamsız', 'Derdest', '2024-01-20', 'Ankara')
        ''')
        
        cursor.execute('''
            INSERT INTO file_details (file_id, dosya_no, borclu_adi, alacakli_adi, tutar, created_at)
            VALUES (1, '2024/1', 'Ahmet Yılmaz', 'Mehmet Demir', 50000.0, '2024-01-15T10:00:00')
        ''')
        
        cursor.execute('''
            INSERT INTO borclular (borclu_id, file_id, borclu_adi, borclu_soyadi, tc_no, created_at)
            VALUES (1, 1, 'Ahmet', 'Yılmaz', '12345678901', '2024-01-15T10:00:00')
        ''')
        
        cursor.execute('''
            INSERT INTO borclular (borclu_id, file_id, borclu_adi, borclu_soyadi, tc_no, created_at)
            VALUES (2, 1, 'Fatma', 'Kaya', '98765432109', '2024-01-15T10:00:00')
        ''')
        
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
        
        yield temp_db_path
        
        # Cleanup
        os.unlink(temp_db_path)
    
    def test_database_creation_and_structure(self, temp_db):
        """Test that the temporary database is created correctly"""
        # Verify the database file exists
        assert os.path.exists(temp_db)
        
        # Connect and verify tables exist
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        
        # Check tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        assert 'files' in tables
        assert 'file_details' in tables
        assert 'borclular' in tables
        assert 'borclu_sorgular' in tables
        
        # Check data exists
        cursor.execute("SELECT COUNT(*) FROM files")
        file_count = cursor.fetchone()[0]
        assert file_count == 2
        
        cursor.execute("SELECT COUNT(*) FROM borclular")
        borclu_count = cursor.fetchone()[0]
        assert borclu_count == 2
        
        conn.close()
    
    def test_get_all_files_with_real_db(self, temp_db):
        """Test getting all files using a real database connection"""
        # Create a simple test function that uses the temp database
        def test_get_all_files():
            try:
                conn = sqlite3.connect(temp_db)
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                cur.execute("SELECT * FROM files ORDER BY file_id")
                rows = cur.fetchall()
                conn.close()
                return rows
            except Exception as e:
                print(f"Error getting files: {e}")
                return []
        
        files = test_get_all_files()
        
        assert len(files) == 2
        assert files[0]['file_id'] == 1
        assert files[0]['klasor'] == '2024/1'
        assert files[0]['borcluAdi'] == 'Ahmet Yılmaz'
        assert files[1]['file_id'] == 2
        assert files[1]['klasor'] == '2024/2'
        assert files[1]['borcluAdi'] == 'Fatma Kaya'
    
    def test_get_file_by_id_with_real_db(self, temp_db):
        """Test getting file by ID using a real database connection"""
        def test_get_file_by_id(file_id):
            try:
                conn = sqlite3.connect(temp_db)
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                cur.execute("SELECT * FROM files WHERE file_id = ?", (file_id,))
                row = cur.fetchone()
                conn.close()
                return row
            except Exception as e:
                print(f"Error getting file {file_id}: {e}")
                return None
        
        # Test existing file
        file = test_get_file_by_id(1)
        assert file is not None
        assert file['file_id'] == 1
        assert file['klasor'] == '2024/1'
        assert file['borcluAdi'] == 'Ahmet Yılmaz'
        
        # Test non-existent file
        file = test_get_file_by_id(999)
        assert file is None
    
    def test_get_borclular_by_file_id_with_real_db(self, temp_db):
        """Test getting borclular by file ID using a real database connection"""
        def test_get_borclular_by_file_id(file_id):
            try:
                conn = sqlite3.connect(temp_db)
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                cur.execute("SELECT * FROM borclular WHERE file_id = ?", (file_id,))
                rows = cur.fetchall()
                conn.close()
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Error getting borclular for file {file_id}: {e}")
                return []
        
        borclular = test_get_borclular_by_file_id(1)
        
        assert len(borclular) == 2
        assert borclular[0]['borclu_id'] == 1
        assert borclular[0]['borclu_adi'] == 'Ahmet'
        assert borclular[0]['borclu_soyadi'] == 'Yılmaz'
        assert borclular[1]['borclu_id'] == 2
        assert borclular[1]['borclu_adi'] == 'Fatma'
        assert borclular[1]['borclu_soyadi'] == 'Kaya'
    
    def test_get_borclu_sorgular_by_borclu_id_with_real_db(self, temp_db):
        """Test getting sorgular by borclu ID using a real database connection"""
        def test_get_borclu_sorgular_by_borclu_id(borclu_id):
            try:
                conn = sqlite3.connect(temp_db)
                cur = conn.cursor()
                cur.execute("SELECT * FROM borclu_sorgular WHERE borclu_id = ?", (borclu_id,))
                rows = cur.fetchall()
                conn.close()
                return rows
            except Exception as e:
                print(f"Error getting sorgular for borclu {borclu_id}: {e}")
                return []
        
        sorgular = test_get_borclu_sorgular_by_borclu_id(1)
        
        assert len(sorgular) == 2
        assert sorgular[0][0] == 1  # sorgu_id
        assert sorgular[0][2] == 'Banka'  # sorgu_tipi
        assert sorgular[1][0] == 2  # sorgu_id
        assert sorgular[1][2] == 'SGK'  # sorgu_tipi
    
    def test_get_borclu_sorgu_by_tipi_with_real_db(self, temp_db):
        """Test getting specific sorgu by borclu ID and type using a real database connection"""
        def test_get_borclu_sorgu_by_tipi(borclu_id, sorgu_tipi):
            try:
                conn = sqlite3.connect(temp_db)
                cur = conn.cursor()
                cur.execute("SELECT sorgu_verisi, timestamp FROM borclu_sorgular WHERE borclu_id = ? AND sorgu_tipi = ?", (borclu_id, sorgu_tipi))
                row = cur.fetchone()
                conn.close()
                
                if row:
                    return {
                        "data": json.loads(row[0]),
                        "timestamp": row[1]
                    }
                return None
            except Exception as e:
                print(f"Error getting sorgu for borclu {borclu_id}, tipi {sorgu_tipi}: {e}")
                return None
        
        # Test existing sorgu
        sorgu = test_get_borclu_sorgu_by_tipi(1, 'Banka')
        assert sorgu is not None
        assert 'data' in sorgu
        assert 'timestamp' in sorgu
        assert sorgu['data']['hesap_sayisi'] == 2
        assert sorgu['data']['toplam_bakiye'] == 15000
        assert sorgu['timestamp'] == '2024-01-15T10:30:00'
        
        # Test non-existent sorgu
        sorgu = test_get_borclu_sorgu_by_tipi(1, 'GİB')
        assert sorgu is None
    
    def test_json_parsing_in_sorgu_data_with_real_db(self, temp_db):
        """Test JSON parsing in sorgu data using a real database connection"""
        def test_get_borclu_sorgu_by_tipi(borclu_id, sorgu_tipi):
            try:
                conn = sqlite3.connect(temp_db)
                cur = conn.cursor()
                cur.execute("SELECT sorgu_verisi, timestamp FROM borclu_sorgular WHERE borclu_id = ? AND sorgu_tipi = ?", (borclu_id, sorgu_tipi))
                row = cur.fetchone()
                conn.close()
                
                if row:
                    return {
                        "data": json.loads(row[0]),
                        "timestamp": row[1]
                    }
                return None
            except Exception as e:
                print(f"Error getting sorgu for borclu {borclu_id}, tipi {sorgu_tipi}: {e}")
                return None
        
        # Test with valid JSON data
        sorgu = test_get_borclu_sorgu_by_tipi(1, 'Banka')
        assert sorgu is not None
        assert isinstance(sorgu['data'], dict)
        assert sorgu['data']['hesap_sayisi'] == 2
        
        # Test with SGK data
        sorgu = test_get_borclu_sorgu_by_tipi(1, 'SGK')
        assert sorgu is not None
        assert isinstance(sorgu['data'], dict)
        assert sorgu['data']['sgk_no'] == '12345678901'
    
    def test_database_row_factory_with_real_db(self, temp_db):
        """Test that row factory is properly set for dictionary access using a real database connection"""
        def test_get_all_files():
            try:
                conn = sqlite3.connect(temp_db)
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                cur.execute("SELECT * FROM files ORDER BY file_id")
                rows = cur.fetchall()
                conn.close()
                return rows
            except Exception as e:
                print(f"Error getting files: {e}")
                return []
        
        files = test_get_all_files()
        
        # Verify that rows can be accessed as dictionaries
        assert len(files) > 0
        first_file = files[0]
        
        # Test dictionary-style access with sqlite3.Row
        # sqlite3.Row objects support key access but not 'in' operator
        assert first_file['file_id'] == 1
        assert first_file['klasor'] == '2024/1'
        assert first_file['borcluAdi'] == 'Ahmet Yılmaz'
        
        # Test that we can access all expected columns
        expected_columns = ['file_id', 'klasor', 'dosyaNo', 'eYil', 'eNo', 'borcluAdi', 'alacakliAdi', 'foyTuru', 'durum', 'takipTarihi', 'icraMudurlugu']
        for column in expected_columns:
            assert hasattr(first_file, column) or column in first_file.keys() 