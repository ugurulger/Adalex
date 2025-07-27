from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import sys
import json
import threading
from datetime import datetime

# Add backend folder to path to import UYAP functions
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

app = Flask(__name__)

# Global UYAP session management
uyap_sessions = {}
uyap_session_lock = threading.Lock()
CORS(app)  # Enable CORS for cross-origin requests

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'files.db')

# Column names for better data handling
COLUMNS = ['file_id', 'klasor', 'dosyaNo', 'eYil', 'eNo', 'borcluAdi', 'alacakliAdi', 'foyTuru', 'durum', 'takipTarihi', 'icraMudurlugu']

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
        print(f"Database and tables created/verified at: {DB_PATH}")
        
    except Exception as e:
        print(f"Error creating database: {e}")
        if conn:
            conn.close()

# Initialize database on startup
create_database_if_not_exists()

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

def get_file_dict(file_row):
    """Convert a file row to a dictionary with column names"""
    if file_row:
        # Since we're using sqlite3.Row, we can convert directly to dict
        return dict(file_row)
    return None

@app.route('/api/icra-dosyalarim', methods=['GET'])
def api_icra_dosyalarim():
    """Main endpoint for getting all icra dosyalari list"""
    try:
        print("API: Fetching icra dosyalari list from database")
        
        files = get_all_files()
        print(f"Found {len(files)} files in database")
        
        # Transform database data to match the expected API response format
        listData = []
        for file_row in files:
            file_dict = get_file_dict(file_row)
            if file_dict:
                # Get all borclular for this file to show complete list
                borclular = get_borclular_by_file_id(file_dict['file_id'])
                
                # Create borclu names list
                if borclular and len(borclular) > 1:
                    # Multiple borclular - show all names in correct order
                    borclu_names = [borclu.get('ad', '') for borclu in sorted(borclular, key=lambda x: x.get('borclu_id', '')) if borclu.get('ad')]
                    borcluAdi = ', '.join(borclu_names)
                else:
                    # Single borclu or no borclular - use the original field
                    borcluAdi = file_dict['borcluAdi']
                
                transformed_item = {
                    "file_id": file_dict['file_id'],
                    "klasor": file_dict['klasor'],
                    "dosyaNo": file_dict['dosyaNo'],
                    "eYil": file_dict['eYil'],
                    "eNo": file_dict['eNo'],
                    "borcluAdi": borcluAdi,
                    "alacakliAdi": file_dict['alacakliAdi'],
                    "foyTuru": file_dict['foyTuru'],
                    "durum": file_dict['durum'],
                    "takipTarihi": file_dict['takipTarihi'],
                    "icraMudurlugu": file_dict['icraMudurlugu'],
                }
                listData.append(transformed_item)
        
        print(f"Transformed {len(listData)} files for API response")
        if listData:
            print("First item structure:", listData[0])
        
        return jsonify(listData)
        
    except Exception as error:
        print(f"Error in api_icra_dosyalarim: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>', methods=['GET'])
def api_icra_dosya_detail(file_id):
    """Get detailed information for a specific file"""
    try:
        print(f"API: Fetching file detail for file_id: {file_id}")
        
        file_row = get_file_by_id(file_id)
        if not file_row:
            return jsonify({"error": "File not found"}), 404
        
        file_dict = get_file_dict(file_row)
        file_details = get_file_details_by_id(file_id)
        borclular = get_borclular_by_file_id(file_id)
        
        # Map file_details by column name
        response_data = {
            "file_id": file_dict['file_id'],
            "klasor": file_dict['klasor'],
            "dosyaNo": file_dict['dosyaNo'],
            "eYil": file_dict['eYil'],
            "eNo": file_dict['eNo'],
            "borcluAdi": file_dict['borcluAdi'],
            "alacakliAdi": file_dict['alacakliAdi'],
            "foyTuru": file_dict['foyTuru'],
            "durum": file_dict['durum'],
            "takipTarihi": file_dict['takipTarihi'],
            "icraMudurlugu": file_dict['icraMudurlugu'],
            "takipSekli": file_details.get('takipSekli', '') if file_details else '',
            "alacakliVekili": file_details.get('alacakliVekili', '') if file_details else '',
            "borcMiktari": file_details.get('borcMiktari', '') if file_details else '',
            "faizOrani": file_details.get('faizOrani', '') if file_details else '',
            "guncelBorc": file_details.get('guncelBorc', '') if file_details else '',
            "borcluList": [
                {
                    "borclu_id": borclu.get('borclu_id', ''),
                    "file_id": borclu.get('file_id', ''),
                    "ad": borclu.get('ad', ''),
                    "tcKimlik": borclu.get('tcKimlik', ''),
                    "telefon": borclu.get('telefon', ''),
                    "adres": borclu.get('adres', ''),
                    "vekil": borclu.get('vekil', '-')
                }
                for borclu in borclular
            ]
        }
        
        print(f"Successfully retrieved file detail for file_id: {file_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_icra_dosya_detail: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>', methods=['GET'])
def api_borclu_detail(file_id, borclu_id):
    """Get detailed information for a specific borclu"""
    try:
        print(f"API: Fetching borclu detail for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # Get borclu information
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT * FROM borclular WHERE file_id = ? AND borclu_id = ?", (file_id, borclu_id))
        borclu_row = cur.fetchone()
        conn.close()
        
        if not borclu_row:
            return jsonify({"error": "Borclu not found"}), 404
        
        # Get sorgular for this borclu
        sorgular = get_borclu_sorgular_by_borclu_id(borclu_id)
        
        response_data = {
            "borclu": {
                "borclu_id": borclu_row[0],
                "file_id": borclu_row[1],
                "ad": borclu_row[2],
                "tcKimlik": borclu_row[3],
                "telefon": borclu_row[4],
                "adres": borclu_row[5],
                "vekil": borclu_row[6] if len(borclu_row) > 6 else "-"
            },
            "sorgular": sorgular
        }
        
        print(f"Successfully retrieved borclu detail for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_borclu_detail: {error}")
        return jsonify({"error": "Internal server error"}), 500

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

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/banka-sorgulama', methods=['GET'])
def api_banka_sorgulama(file_id, borclu_id):
    """Get bank query results for a specific borclu"""
    try:
        print(f"API: Fetching banka sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For banka sorgulama, we look for Banka data which contains bank information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'Banka')
        
        if sorgu_result is None:
            return jsonify({"error": "Bank query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "bankaSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved banka sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_banka_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/gib-sorgulama', methods=['GET'])
def api_gib_sorgulama(file_id, borclu_id):
    """Get GIB query results for a specific borclu"""
    try:
        print(f"API: Fetching GIB sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For GİB sorgulama, we look for GİB data which contains GİB information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'GİB')
        
        if sorgu_result is None:
            return jsonify({"error": "GIB query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "gibSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved GIB sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_gib_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/sgk-sorgulama', methods=['GET'])
def api_sgk_sorgulama(file_id, borclu_id):
    """Get SGK query results for a specific borclu"""
    try:
        print(f"API: Fetching SGK sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'SGK')
        
        if sorgu_result is None:
            return jsonify({"error": "SGK query data not found"}), 404
        
        # The data is already in the correct structure from the database
        sgk_data = sorgu_result["data"]
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "sskCalisani": sgk_data.get("sskCalisani", {"sonuc": {}}),
            "bagkurCalisani": sgk_data.get("bagkurCalisani", {"sonuc": {}}),
            "sskIsYeriBilgisi": sgk_data.get("sskIsYeriBilgisi", {"sonuc": {}}),
            "kamuCalisani": sgk_data.get("kamuCalisani", {"sonuc": {}}),
            "kamuEmeklisi": sgk_data.get("kamuEmeklisi", {"sonuc": {}}),
            "sskEmeklisi": sgk_data.get("sskEmeklisi", {"sonuc": {}}),
            "bagkurEmeklisi": sgk_data.get("bagkurEmeklisi", {"sonuc": {}}),
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved SGK sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_sgk_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/sgk-haciz-sorgulama', methods=['GET'])
def api_sgk_haciz_sorgulama(file_id, borclu_id):
    """Get SGK haciz query results for a specific borclu"""
    try:
        print(f"API: Fetching SGK haciz sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'SGK Haciz')
        
        if sorgu_result is None:
            return jsonify({"error": "SGK haciz query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "sgkSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved SGK haciz sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_sgk_haciz_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/egm-sorgulama', methods=['GET'])
def api_egm_sorgulama(file_id, borclu_id):
    """Get EGM query results for a specific borclu"""
    try:
        print(f"API: Fetching EGM sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'egm_sorgulama')
        
        if sorgu_result is None:
            return jsonify({"error": "EGM query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "egmSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved EGM sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_egm_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/takbis-sorgulama', methods=['GET'])
def api_takbis_sorgulama(file_id, borclu_id):
    """Get TAKBIS query results for a specific borclu"""
    try:
        print(f"API: Fetching TAKBIS sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'takbis_sorgulama')
        
        if sorgu_result is None:
            return jsonify({"error": "TAKBIS query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "takbisSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved TAKBIS sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_takbis_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/icra-dosyasi-sorgulama', methods=['GET'])
def api_icra_dosyasi_sorgulama(file_id, borclu_id):
    """Get icra dosyasi query results for a specific borclu"""
    try:
        print(f"API: Fetching icra dosyasi sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'icra_dosyasi_sorgulama')
        
        if sorgu_result is None:
            return jsonify({"error": "İcra dosyasi query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "icraDosyasiSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved icra dosyasi sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_icra_dosyasi_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/adres-sorgulama', methods=['GET'])
def api_adres_sorgulama(file_id, borclu_id):
    """Get address query results for a specific borclu"""
    try:
        print(f"API: Fetching adres sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For adres sorgulama, we look for MERNİS data which contains address information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'MERNİS')
        
        if sorgu_result is None:
            return jsonify({"error": "Address query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "adresSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved adres sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_adres_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/telefon-sorgulama', methods=['GET'])
def api_telefon_sorgulama(file_id, borclu_id):
    """Get phone query results for a specific borclu"""
    try:
        print(f"API: Fetching telefon sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For telefon sorgulama, we look for GSM data which contains phone information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'GSM')
        
        if sorgu_result is None:
            return jsonify({"error": "Phone query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "gsmSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved telefon sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_telefon_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/arac-sorgulama', methods=['GET'])
def api_arac_sorgulama(file_id, borclu_id):
    """Get vehicle query results for a specific borclu"""
    try:
        print(f"API: Fetching arac sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For arac sorgulama, we look for EGM data which contains vehicle information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'EGM')
        
        if sorgu_result is None:
            return jsonify({"error": "Vehicle query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "aracSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved arac sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_arac_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/gayrimenkul-sorgulama', methods=['GET'])
def api_gayrimenkul_sorgulama(file_id, borclu_id):
    """Get real estate query results for a specific borclu"""
    try:
        print(f"API: Fetching gayrimenkul sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For gayrimenkul sorgulama, we look for TAKBIS data which contains real estate information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'TAKBIS')
        
        if sorgu_result is None:
            return jsonify({"error": "Real estate query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "gayrimenkulSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved gayrimenkul sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_gayrimenkul_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/dis-isleri-sorgulama', methods=['GET'])
def api_dis_isleri_sorgulama(file_id, borclu_id):
    """Get foreign affairs query results for a specific borclu"""
    try:
        print(f"API: Fetching dis isleri sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'Dış İşleri')
        
        if sorgu_result is None:
            return jsonify({"error": "Foreign affairs query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "disIsleriSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved dis isleri sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_dis_isleri_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/iski-sorgulama', methods=['GET'])
def api_iski_sorgulama(file_id, borclu_id):
    """Get ISKI query results for a specific borclu"""
    try:
        print(f"API: Fetching ISKI sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # For İSKİ sorgulama, we look for İSKİ data which contains İSKİ information
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'İSKİ')
        
        if sorgu_result is None:
            return jsonify({"error": "ISKI query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "iskiSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved ISKI sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_iski_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/posta-ceki-sorgulama', methods=['GET'])
def api_posta_ceki_sorgulama(file_id, borclu_id):
    """Get post office check query results for a specific borclu"""
    try:
        print(f"API: Fetching posta ceki sorgulama for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # The backend saves data with sorgu_tipi = "Posta Çeki" (with space)
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'Posta Çeki')
        
        if sorgu_result is None:
            return jsonify({"error": "Post office check query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "postaCekiSorguSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved posta ceki sorgulama for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_posta_ceki_sorgulama: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/alacakli-dosyalari', methods=['GET'])
def api_alacakli_dosyalari(file_id, borclu_id):
    """Get creditor files query results for a specific borclu"""
    try:
        print(f"API: Fetching alacakli dosyalari for file_id: {file_id}, borclu_id: {borclu_id}")
        
        sorgu_result = get_borclu_sorgu_by_tipi(borclu_id, 'İcra Dosyası')
        
        if sorgu_result is None:
            return jsonify({"error": "Creditor files query data not found"}), 404
        
        response_data = {
            "file_id": int(file_id),
            "borclu_id": borclu_id,  # Keep as string to match frontend expectation
            "alacakliDosyalariSonucu": sorgu_result["data"],
            "timestamp": sorgu_result["timestamp"]
        }
        
        print(f"Successfully retrieved alacakli dosyalari for borclu_id: {borclu_id}")
        return jsonify(response_data)
        
    except Exception as error:
        print(f"Error in api_alacakli_dosyalari: {error}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Database API is running"})

@app.route('/api/uyap/trigger-sorgulama', methods=['POST'])
def trigger_sorgulama():
    """Trigger UYAP sorgulama for a specific dosya and query type"""
    try:
        data = request.get_json()
        dosya_no = data.get('dosya_no')
        sorgu_tipi = data.get('sorgu_tipi')
        borclu_id = data.get('borclu_id')
        
        if not all([dosya_no, sorgu_tipi, borclu_id]):
            return jsonify({
                'success': False,
                'message': 'dosya_no, sorgu_tipi ve borclu_id parametreleri gerekli'
            }), 400
        
        print(f"Triggering sorgulama: dosya_no={dosya_no}, sorgu_tipi={sorgu_tipi}, borclu_id={borclu_id}")
        
        # Check if UYAP session exists and is valid
        with uyap_session_lock:
            if not uyap_sessions:
                return jsonify({
                    'success': False,
                    'message': 'UYAP bağlantısı bulunamadı. Lütfen önce UYAP\'a giriş yapın.'
                }), 400
            
            # Get the first available session
            session_id = list(uyap_sessions.keys())[0]
            driver = uyap_sessions[session_id]
            
            # Validate that the driver is still active
            try:
                # Test if driver is still responsive
                driver.current_url
            except Exception as e:
                # Driver is dead, remove it and return error
                del uyap_sessions[session_id]
                return jsonify({
                    'success': False,
                    'message': 'UYAP bağlantısı kesildi. Lütfen yeniden giriş yapın.'
                }), 400
        
        # Map sorgu_tipi to selected_options format
        selected_options = {sorgu_tipi: True}
        
        # Import and run sorgulama_common
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
        
        from sorgulama_common import perform_sorgulama
        
        # Run the sorgulama
        perform_sorgulama(driver, dosya_no, selected_options)
        
        # Get the latest result from database
        # Map sorgu_tipi to database format
        db_sorgu_tipi = sorgu_tipi
        if sorgu_tipi == 'MERNİS':
            db_sorgu_tipi = 'Mernis'
        elif sorgu_tipi == 'SGK':
            db_sorgu_tipi = 'SGK'  # Keep as SGK for consistency with backend
        elif sorgu_tipi == 'SGK Haciz':
            db_sorgu_tipi = 'SGK Haciz'  # Keep as SGK Haciz for consistency
        elif sorgu_tipi == 'EGM':
            db_sorgu_tipi = 'EGM'  # Keep as EGM for consistency
        elif sorgu_tipi == 'TAKBİS':
            db_sorgu_tipi = 'TAKBİS'  # Keep as TAKBİS for consistency
        elif sorgu_tipi == 'Banka':
            db_sorgu_tipi = 'Banka'
        elif sorgu_tipi == 'GSM':
            db_sorgu_tipi = 'GSM'  # Keep as GSM for consistency
        elif sorgu_tipi == 'GİB':
            db_sorgu_tipi = 'GİB'  # Keep as GİB for consistency
        elif sorgu_tipi == 'İSKİ':
            db_sorgu_tipi = 'İSKİ'  # Keep as İSKİ for consistency
        elif sorgu_tipi == 'Posta Çeki':
            db_sorgu_tipi = 'Posta Çeki'  # Keep as Posta Çeki for consistency with backend
        elif sorgu_tipi == 'Dış İşleri':
            db_sorgu_tipi = 'Dış İşleri'  # Keep as Dış İşleri for consistency with backend
        elif sorgu_tipi == 'İcra Dosyası':
            db_sorgu_tipi = 'icra_dosyasi_sorgulama'
        
        sorgu_data = get_borclu_sorgu_by_tipi(borclu_id, db_sorgu_tipi)
        
        return jsonify({
            'success': True,
            'message': f'{sorgu_tipi} sorgulaması başarıyla tamamlandı',
            'data': sorgu_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Trigger sorgulama error: {e}")
        
        # Provide user-friendly error messages
        error_message = str(e)
        
        if 'Connection refused' in error_message or 'Max retries exceeded' in error_message:
            error_message = 'UYAP bağlantısı kesildi. Lütfen UYAP\'ı yeniden bağlayın.'
        elif 'session' in error_message.lower() and 'not found' in error_message.lower():
            error_message = 'UYAP oturumu bulunamadı. Lütfen yeniden giriş yapın.'
        elif 'timeout' in error_message.lower():
            error_message = 'Sorgulama zaman aşımına uğradı. Lütfen tekrar deneyin.'
        elif 'element' in error_message.lower() and 'not found' in error_message.lower():
            error_message = 'UYAP sayfasında beklenen element bulunamadı. Sayfa yapısı değişmiş olabilir.'
        
        return jsonify({
            'success': False,
            'message': f'Sorgulama hatası: {error_message}'
        }), 500

# ============================================================================
# UYAP API ENDPOINTS
# ============================================================================

@app.route('/api/uyap/login', methods=['POST'])
def uyap_login():
    """Login to UYAP system"""
    try:
        data = request.get_json()
        pin_kodu = data.get('pin_kodu', '9092')  # Default PIN
        
        print(f"UYAP Login attempt with PIN: {pin_kodu}")
        
        # Import UYAP login function
        from login_uyap import open_browser_and_login
        
        with uyap_session_lock:
            # Check if session already exists
            if pin_kodu in uyap_sessions:
                driver = uyap_sessions[pin_kodu]
                try:
                    # Test if driver is still active
                    driver.current_url
                    return jsonify({
                        'success': True,
                        'message': 'Already logged in to UYAP',
                        'session_id': pin_kodu
                    })
                except:
                    # Driver is dead, remove it
                    del uyap_sessions[pin_kodu]
            
            # Perform login
            driver = open_browser_and_login(pin_kodu)
            
            if driver:
                uyap_sessions[pin_kodu] = driver
                return jsonify({
                    'success': True,
                    'message': 'Successfully logged in to UYAP',
                    'session_id': pin_kodu
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to login to UYAP'
                }), 500
                
    except Exception as e:
        print(f"UYAP Login error: {e}")
        return jsonify({
            'success': False,
            'message': f'Login error: {str(e)}'
        }), 500

@app.route('/api/uyap/logout', methods=['POST'])
def uyap_logout():
    """Logout from UYAP system"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        print(f"UYAP Logout for session: {session_id}")
        
        with uyap_session_lock:
            if session_id in uyap_sessions:
                driver = uyap_sessions[session_id]
                try:
                    driver.quit()
                except:
                    pass
                del uyap_sessions[session_id]
                
                return jsonify({
                    'success': True,
                    'message': 'Successfully logged out from UYAP'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Session not found'
                }), 404
                
    except Exception as e:
        print(f"UYAP Logout error: {e}")
        return jsonify({
            'success': False,
            'message': f'Logout error: {str(e)}'
        }), 500

@app.route('/api/uyap/search-files', methods=['POST'])
def uyap_search_files():
    """Search all files in UYAP"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        print(f"UYAP Search Files for session: {session_id}")
        
        with uyap_session_lock:
            if session_id not in uyap_sessions:
                return jsonify({
                    'success': False,
                    'message': 'Session not found. Please login first.'
                }), 404
            
            driver = uyap_sessions[session_id]
            
            # Import search function
            from search_all_files import search_all_files
            
            # Perform search
            search_all_files(driver)
            
            return jsonify({
                'success': True,
                'message': 'File search completed successfully'
            })
                
    except Exception as e:
        print(f"UYAP Search Files error: {e}")
        return jsonify({
            'success': False,
            'message': f'Search error: {str(e)}'
        }), 500

@app.route('/api/uyap/extract-data', methods=['POST'])
def uyap_extract_data():
    """Extract data from UYAP search results"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        print(f"UYAP Extract Data for session: {session_id}")
        
        with uyap_session_lock:
            if session_id not in uyap_sessions:
                return jsonify({
                    'success': False,
                    'message': 'Session not found. Please login first.'
                }), 404
            
            driver = uyap_sessions[session_id]
            
            # Import extract function
            from search_all_files_extract import extract_data_from_table
            
            # Perform extraction
            extracted_data = extract_data_from_table(driver)
            
            return jsonify({
                'success': True,
                'message': 'Data extraction completed successfully',
                'data': extracted_data
            })
                
    except Exception as e:
        print(f"UYAP Extract Data error: {e}")
        return jsonify({
            'success': False,
            'message': f'Extraction error: {str(e)}'
        }), 500

@app.route('/api/uyap/query', methods=['POST'])
def uyap_query():
    """Perform specific queries (EGM, TAKBIS, etc.)"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        dosya_no = data.get('dosya_no')
        selected_options = data.get('selected_options', [])
        
        print(f"UYAP Query for session: {session_id}, dosya_no: {dosya_no}, options: {selected_options}")
        
        with uyap_session_lock:
            if session_id not in uyap_sessions:
                return jsonify({
                    'success': False,
                    'message': 'Session not found. Please login first.'
                }), 404
            
            driver = uyap_sessions[session_id]
            
            # Import query function
            from sorgulama_common import perform_sorgulama
            
            # Perform query
            result = perform_sorgulama(driver, dosya_no, selected_options)
            
            return jsonify({
                'success': True,
                'message': 'Query completed successfully',
                'result': result
            })
                
    except Exception as e:
        print(f"UYAP Query error: {e}")
        return jsonify({
            'success': False,
            'message': f'Query error: {str(e)}'
        }), 500

@app.route('/api/uyap/status', methods=['GET'])
def uyap_status():
    """Get UYAP session status"""
    try:
        with uyap_session_lock:
            active_sessions = []
            for session_id, driver in uyap_sessions.items():
                try:
                    # Test if driver is still active
                    driver.current_url
                    active_sessions.append(session_id)
                except:
                    # Remove dead sessions
                    del uyap_sessions[session_id]
            
            return jsonify({
                'success': True,
                'active_sessions': active_sessions,
                'total_sessions': len(active_sessions)
            })
                
    except Exception as e:
        print(f"UYAP Status error: {e}")
        return jsonify({
            'success': False,
            'message': f'Status error: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print(f"Warning: Database file {DB_PATH} not found!")
    
    print("Starting Database API Server...")
    print(f"Database path: {DB_PATH}")
    app.run(debug=True, port=5001, host='0.0.0.0') 