from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import os
import sys

app = Flask(__name__)

# Global UYAP session management
uyap_sessions = {}
uyap_session_lock = threading.Lock()
CORS(app)  # Enable CORS for cross-origin requests

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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "UYAP Automation Service is running"})

if __name__ == '__main__':
    print("Starting UYAP Automation Service...")
    app.run(debug=True, port=5002, host='0.0.0.0') 