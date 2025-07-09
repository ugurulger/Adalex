from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import sys
import json
import threading
from datetime import datetime

# Add backend folder to path to import UYAP functions
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

app = Flask(__name__)

# Global UYAP session management
uyap_sessions = {}
uyap_session_lock = threading.Lock()
CORS(app)  # Enable CORS for cross-origin requests

DB_PATH = "files.db"

# Column names for better data handling
COLUMNS = ['file_id', 'klasor', 'dosyaNo', 'borcluAdi', 'alacakliAdi', 'foyTuru', 'durum', 'takipTarihi', 'icraMudurlugu']

def get_all_files():
    """Get all files from the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
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
        return dict(zip(COLUMNS, file_row))
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
                transformed_item = {
                    "file_id": file_dict['file_id'],
                    "klasor": file_dict['klasor'],
                    "dosyaNo": file_dict['dosyaNo'],
                    "borcluAdi": file_dict['borcluAdi'],
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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Database API is running"})

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