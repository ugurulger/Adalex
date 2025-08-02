from flask import Blueprint, jsonify, request
import sqlite3
import os
import json
from datetime import datetime

# Add current directory to path to import backend functions
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from services.database_reader import (
    get_all_files, get_file_by_id, get_file_details_by_id,
    get_borclular_by_file_id, get_borclu_sorgular_by_borclu_id,
    get_borclu_sorgu_by_tipi, get_file_dict
)

database_routes = Blueprint('database_routes', __name__)

@database_routes.route('/api/icra-dosyalarim', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>', methods=['GET'])
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
            "takipYolu": file_details.get('takipYolu', '') if file_details else '',
            "takipTuru": file_details.get('takipTuru', '') if file_details else '',
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>', methods=['GET'])
def api_borclu_detail(file_id, borclu_id):
    """Get detailed information for a specific borclu"""
    try:
        print(f"API: Fetching borclu detail for file_id: {file_id}, borclu_id: {borclu_id}")
        
        # Get borclu information
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'database', 'files.db'))
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

# Sorgulama endpoints
@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/banka-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/gib-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/sgk-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/sgk-haciz-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/egm-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/takbis-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/icra-dosyasi-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/adres-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/telefon-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/arac-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/gayrimenkul-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/dis-isleri-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/iski-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/posta-ceki-sorgulama', methods=['GET'])
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

@database_routes.route('/api/icra-dosyalarim/<file_id>/<borclu_id>/alacakli-dosyalari', methods=['GET'])
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

@database_routes.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Database API is running"}) 