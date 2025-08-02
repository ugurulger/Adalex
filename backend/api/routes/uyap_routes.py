from flask import Blueprint, jsonify, request
import sys
import os

# Add current directory to path to import backend functions
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from services.uyap_service import (
    trigger_sorgulama_logic, uyap_login_logic, uyap_logout_logic,
    uyap_search_files_logic, uyap_extract_data_logic, uyap_query_logic,
    uyap_status_logic
)

uyap_routes = Blueprint('uyap_routes', __name__)

@uyap_routes.route('/api/uyap/trigger-sorgulama', methods=['POST'])
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
        
        # Call business logic
        result = trigger_sorgulama_logic(dosya_no, sorgu_tipi, borclu_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
        
    except Exception as e:
        print(f"Trigger sorgulama route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500

@uyap_routes.route('/api/uyap/login', methods=['POST'])
def uyap_login():
    """Login to UYAP system"""
    try:
        data = request.get_json()
        pin_kodu = data.get('pin_kodu', '9092')  # Default PIN
        
        # Call business logic
        result = uyap_login_logic(pin_kodu)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
                
    except Exception as e:
        print(f"UYAP Login route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500

@uyap_routes.route('/api/uyap/logout', methods=['POST'])
def uyap_logout():
    """Logout from UYAP system"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        # Call business logic
        result = uyap_logout_logic(session_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
                
    except Exception as e:
        print(f"UYAP Logout route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500

@uyap_routes.route('/api/uyap/search-files', methods=['POST'])
def uyap_search_files():
    """Search all files in UYAP"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        # Call business logic
        result = uyap_search_files_logic(session_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
                
    except Exception as e:
        print(f"UYAP Search Files route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500

@uyap_routes.route('/api/uyap/extract-data', methods=['POST'])
def uyap_extract_data():
    """Extract data from UYAP search results"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        # Call business logic
        result = uyap_extract_data_logic(session_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
                
    except Exception as e:
        print(f"UYAP Extract Data route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500

@uyap_routes.route('/api/uyap/query', methods=['POST'])
def uyap_query():
    """Perform specific queries (EGM, TAKBIS, etc.)"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        dosya_no = data.get('dosya_no')
        selected_options = data.get('selected_options', [])
        
        # Call business logic
        result = uyap_query_logic(session_id, dosya_no, selected_options)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
                
    except Exception as e:
        print(f"UYAP Query route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500

@uyap_routes.route('/api/uyap/status', methods=['GET'])
def uyap_status():
    """Get UYAP session status"""
    try:
        # Call business logic
        result = uyap_status_logic()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
                
    except Exception as e:
        print(f"UYAP Status route error: {e}")
        return jsonify({
            'success': False,
            'message': f'Route error: {str(e)}'
        }), 500 