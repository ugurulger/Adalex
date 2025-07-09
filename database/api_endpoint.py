from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
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

if __name__ == '__main__':
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print(f"Warning: Database file {DB_PATH} not found!")
    
    print("Starting Database API Server...")
    print(f"Database path: {DB_PATH}")
    app.run(debug=True, port=5001, host='0.0.0.0') 