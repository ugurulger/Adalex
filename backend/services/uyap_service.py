import threading
from datetime import datetime
import sys
import os

# Global UYAP session management
uyap_sessions = {}
uyap_session_lock = threading.Lock()

def get_uyap_sessions():
    """Get the global UYAP sessions dictionary"""
    return uyap_sessions

def get_uyap_session_lock():
    """Get the global UYAP session lock"""
    return uyap_session_lock

def get_borclu_sorgu_by_tipi(borclu_id, sorgu_tipi):
    """Get specific query result for a borclu by query type"""
    try:
        import sqlite3
        import os
        import json
        
        # Update database path to point to the database directory
        DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'files.db')
        
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

# Business Logic Functions
def trigger_sorgulama_logic(dosya_no, sorgu_tipi, borclu_id):
    """Business logic for triggering UYAP sorgulama"""
    try:
        print(f"Triggering sorgulama: dosya_no={dosya_no}, sorgu_tipi={sorgu_tipi}, borclu_id={borclu_id}")
        
        # Check if UYAP session exists and is valid
        with uyap_session_lock:
            if not uyap_sessions:
                return {
                    'success': False,
                    'message': 'UYAP bağlantısı bulunamadı. Lütfen önce UYAP\'a giriş yapın.'
                }
            
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
                return {
                    'success': False,
                    'message': 'UYAP bağlantısı kesildi. Lütfen yeniden giriş yapın.'
                }
        
        # Map sorgu_tipi to selected_options format
        selected_options = {sorgu_tipi: True}
        
        # Import and run sorgulama_common
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
        
        from scrappers.queries.sorgulama_common import perform_sorgulama
        
        # Run the sorgulama
        perform_sorgulama(driver, dosya_no, selected_options)
        
        # Get the latest result from database
        # Map sorgu_tipi to database format
        db_sorgu_tipi = map_sorgu_tipi_to_db_format(sorgu_tipi)
        
        sorgu_data = get_borclu_sorgu_by_tipi(borclu_id, db_sorgu_tipi)
        
        return {
            'success': True,
            'message': f'{sorgu_tipi} sorgulaması başarıyla tamamlandı',
            'data': sorgu_data,
            'timestamp': datetime.now().isoformat()
        }
        
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
        
        return {
            'success': False,
            'message': f'Sorgulama hatası: {error_message}'
        }

def uyap_login_logic(pin_kodu):
    """Business logic for UYAP login"""
    try:
        print(f"UYAP Login attempt with PIN: {pin_kodu}")
        
        # Import UYAP login function
        from services.login_uyap import open_browser_and_login
        
        with uyap_session_lock:
            # Check if session already exists
            if pin_kodu in uyap_sessions:
                driver = uyap_sessions[pin_kodu]
                try:
                    # Test if driver is still active
                    driver.current_url
                    return {
                        'success': True,
                        'message': 'Already logged in to UYAP',
                        'session_id': pin_kodu
                    }
                except:
                    # Driver is dead, remove it
                    del uyap_sessions[pin_kodu]
            
            # Perform login
            driver = open_browser_and_login(pin_kodu)
            
            if driver:
                uyap_sessions[pin_kodu] = driver
                return {
                    'success': True,
                    'message': 'Successfully logged in to UYAP',
                    'session_id': pin_kodu
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to login to UYAP'
                }
                
    except Exception as e:
        print(f"UYAP Login error: {e}")
        return {
            'success': False,
            'message': f'Login error: {str(e)}'
        }

def uyap_logout_logic(session_id):
    """Business logic for UYAP logout"""
    try:
        print(f"UYAP Logout for session: {session_id}")
        
        with uyap_session_lock:
            if session_id in uyap_sessions:
                driver = uyap_sessions[session_id]
                try:
                    driver.quit()
                except:
                    pass
                del uyap_sessions[session_id]
                
                return {
                    'success': True,
                    'message': 'Successfully logged out from UYAP'
                }
            else:
                return {
                    'success': False,
                    'message': 'Session not found'
                }
                
    except Exception as e:
        print(f"UYAP Logout error: {e}")
        return {
            'success': False,
            'message': f'Logout error: {str(e)}'
        }

def uyap_search_files_logic(session_id):
    """Business logic for UYAP search files"""
    try:
        print(f"UYAP Search Files for session: {session_id}")
        
        with uyap_session_lock:
            if session_id not in uyap_sessions:
                return {
                    'success': False,
                    'message': 'Session not found. Please login first.'
                }
            
            driver = uyap_sessions[session_id]
            
            # Import search function
            from scrappers.first_setup.search_all_files import search_all_files
            
            # Perform search
            search_all_files(driver)
            
            return {
                'success': True,
                'message': 'File search completed successfully'
            }
                
    except Exception as e:
        print(f"UYAP Search Files error: {e}")
        return {
            'success': False,
            'message': f'Search error: {str(e)}'
        }

def uyap_extract_data_logic(session_id):
    """Business logic for UYAP extract data"""
    try:
        print(f"UYAP Extract Data for session: {session_id}")
        
        with uyap_session_lock:
            if session_id not in uyap_sessions:
                return {
                    'success': False,
                    'message': 'Session not found. Please login first.'
                }
            
            driver = uyap_sessions[session_id]
            
            # Import extract function
            from scrappers.first_setup.search_all_files_extract import extract_data_from_table
            
            # Perform extraction
            extracted_data = extract_data_from_table(driver)
            
            return {
                'success': True,
                'message': 'Data extraction completed successfully',
                'data': extracted_data
            }
                
    except Exception as e:
        print(f"UYAP Extract Data error: {e}")
        return {
            'success': False,
            'message': f'Extraction error: {str(e)}'
        }

def uyap_query_logic(session_id, dosya_no, selected_options):
    """Business logic for UYAP query"""
    try:
        print(f"UYAP Query for session: {session_id}, dosya_no: {dosya_no}, options: {selected_options}")
        
        with uyap_session_lock:
            if session_id not in uyap_sessions:
                return {
                    'success': False,
                    'message': 'Session not found. Please login first.'
                }
            
            driver = uyap_sessions[session_id]
            
            # Import query function
            from scrappers.queries.sorgulama_common import perform_sorgulama
            
            # Perform query
            result = perform_sorgulama(driver, dosya_no, selected_options)
            
            return {
                'success': True,
                'message': 'Query completed successfully',
                'result': result
            }
                
    except Exception as e:
        print(f"UYAP Query error: {e}")
        return {
            'success': False,
            'message': f'Query error: {str(e)}'
        }

def uyap_status_logic():
    """Business logic for UYAP status"""
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
            
            return {
                'success': True,
                'active_sessions': active_sessions,
                'total_sessions': len(active_sessions)
            }
                
    except Exception as e:
        print(f"UYAP Status error: {e}")
        return {
            'success': False,
            'message': f'Status error: {str(e)}'
        }

def map_sorgu_tipi_to_db_format(sorgu_tipi):
    """Map sorgu_tipi to database format"""
    if sorgu_tipi == 'MERNİS':
        return 'Mernis'
    elif sorgu_tipi == 'SGK':
        return 'SGK'  # Keep as SGK for consistency with backend
    elif sorgu_tipi == 'SGK Haciz':
        return 'SGK Haciz'  # Keep as SGK Haciz for consistency
    elif sorgu_tipi == 'EGM':
        return 'EGM'  # Keep as EGM for consistency
    elif sorgu_tipi == 'TAKBİS':
        return 'TAKBİS'  # Keep as TAKBİS for consistency
    elif sorgu_tipi == 'Banka':
        return 'Banka'
    elif sorgu_tipi == 'GSM':
        return 'GSM'  # Keep as GSM for consistency
    elif sorgu_tipi == 'GİB':
        return 'GİB'  # Keep as GİB for consistency
    elif sorgu_tipi == 'İSKİ':
        return 'İSKİ'  # Keep as İSKİ for consistency
    elif sorgu_tipi == 'Posta Çeki':
        return 'Posta Çeki'  # Keep as Posta Çeki for consistency with backend
    elif sorgu_tipi == 'Dış İşleri':
        return 'Dış İşleri'  # Keep as Dış İşleri for consistency with backend
    elif sorgu_tipi == 'İcra Dosyası':
        return 'icra_dosyasi_sorgulama'
    else:
        return sorgu_tipi 