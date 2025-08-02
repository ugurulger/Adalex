import sqlite3
import os
import json
from datetime import datetime

# Update database path to point to the database directory
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'files.db')

# Column names for better data handling
COLUMNS = ['file_id', 'klasor', 'dosyaNo', 'eYil', 'eNo', 'borcluAdi', 'alacakliAdi', 'foyTuru', 'durum', 'takipTarihi', 'icraMudurlugu']


def get_all_files():
    """Get all files from the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable row factory for easier access
        cur = conn.cursor()
        cur.execute("SELECT * FROM files ORDER BY file_id")
        rows = cur.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"Error getting files: {e}")
        return []

def get_file_by_id(file_id):
    """Get a specific file by ID"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable row factory for easier access
        cur = conn.cursor()
        cur.execute("SELECT * FROM files WHERE file_id = ?", (file_id,))
        row = cur.fetchone()
        conn.close()
        return row
    except Exception as e:
        print(f"Error getting file {file_id}: {e}")
        return None

def get_file_details_by_id(file_id):
    """Get file details by file ID"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM file_details WHERE file_id = ?", (file_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception as e:
        print(f"Error getting file details for {file_id}: {e}")
        return None

def get_borclular_by_file_id(file_id):
    """Get all borclular (debtors) for a specific file"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM borclular WHERE file_id = ?", (file_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Error getting borclular for file {file_id}: {e}")
        return []

def get_borclu_sorgular_by_borclu_id(borclu_id):
    """Get all queries for a specific borclu"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT * FROM borclu_sorgular WHERE borclu_id = ?", (borclu_id,))
        rows = cur.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"Error getting sorgular for borclu {borclu_id}: {e}")
        return []

def get_borclu_sorgu_by_tipi(borclu_id, sorgu_tipi):
    """Get specific query result for a borclu by query type"""
    try:
        conn = sqlite3.connect(DB_PATH)
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

def get_file_dict(file_row):
    """Convert a file row to a dictionary with column names"""
    if file_row:
        # Since we're using sqlite3.Row, we can convert directly to dict
        return dict(file_row)
    return None