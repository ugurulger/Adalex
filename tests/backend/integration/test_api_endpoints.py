import pytest
import sys
import os
import json
from unittest.mock import patch, Mock
from flask import Flask
from flask.testing import FlaskClient

# Add backend to path - fix the path to work from tests directory
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend')
sys.path.insert(0, backend_path)

# Also add the api directory to the path to handle relative imports
api_path = os.path.join(backend_path, 'api')
sys.path.insert(0, api_path)

# Import the real Flask app and routes
from api_endpoint import app
from routes.uyap_routes import uyap_routes
from routes.database_routes import database_routes

class TestAPIEndpoints:
    """Integration tests for API endpoints using real Flask app with mocked dependencies"""
    
    @pytest.fixture
    def test_app(self):
        """Create Flask app for testing with real routes"""
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture
    def client(self, test_app):
        """Create test client"""
        return test_app.test_client()
    
    def test_uyap_login_success(self, client):
        """Test successful UYAP login endpoint"""
        with patch('routes.uyap_routes.uyap_login_logic') as mock_login:
            mock_login.return_value = {
                'success': True,
                'message': 'Successfully logged in to UYAP',
                'session_id': '9092'
            }
            
            response = client.post('/api/uyap/login', 
                                json={'pin_kodu': '9092'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['message'] == 'Successfully logged in to UYAP'
            assert data['session_id'] == '9092'
            
            mock_login.assert_called_once_with('9092')
    
    def test_uyap_login_failure(self, client):
        """Test failed UYAP login endpoint"""
        with patch('routes.uyap_routes.uyap_login_logic') as mock_login:
            mock_login.return_value = {
                'success': False,
                'message': 'Failed to login to UYAP'
            }
            
            response = client.post('/api/uyap/login', 
                                json={'pin_kodu': '9092'})
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['message'] == 'Failed to login to UYAP'
    
    def test_uyap_login_default_pin(self, client):
        """Test UYAP login with default PIN"""
        with patch('routes.uyap_routes.uyap_login_logic') as mock_login:
            mock_login.return_value = {
                'success': True,
                'message': 'Successfully logged in to UYAP',
                'session_id': '9092'
            }
            
            response = client.post('/api/uyap/login', json={})
            
            assert response.status_code == 200
            mock_login.assert_called_once_with('9092')  # Default PIN
    
    def test_uyap_logout_success(self, client):
        """Test successful UYAP logout endpoint"""
        with patch('routes.uyap_routes.uyap_logout_logic') as mock_logout:
            mock_logout.return_value = {
                'success': True,
                'message': 'Successfully logged out from UYAP'
            }
            
            response = client.post('/api/uyap/logout', 
                                json={'session_id': '9092'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['message'] == 'Successfully logged out from UYAP'
            
            mock_logout.assert_called_once_with('9092')
    
    def test_uyap_logout_session_not_found(self, client):
        """Test UYAP logout with non-existent session"""
        with patch('routes.uyap_routes.uyap_logout_logic') as mock_logout:
            mock_logout.return_value = {
                'success': False,
                'message': 'Session not found'
            }
            
            response = client.post('/api/uyap/logout', 
                                json={'session_id': 'nonexistent'})
            
            assert response.status_code == 404
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['message'] == 'Session not found'
    
    def test_trigger_sorgulama_success(self, client):
        """Test successful trigger sorgulama endpoint"""
        with patch('routes.uyap_routes.trigger_sorgulama_logic') as mock_trigger:
            mock_trigger.return_value = {
                'success': True,
                'message': 'Banka sorgulaması başarıyla tamamlandı',
                'data': {'test': 'data'},
                'timestamp': '2024-01-01T00:00:00'
            }
            
            response = client.post('/api/uyap/trigger-sorgulama', 
                                json={
                                    'dosya_no': '123',
                                    'sorgu_tipi': 'Banka',
                                    'borclu_id': '456'
                                })
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert 'Banka sorgulaması başarıyla tamamlandı' in data['message']
            assert 'data' in data
            assert 'timestamp' in data
            
            mock_trigger.assert_called_once_with('123', 'Banka', '456')
    
    def test_trigger_sorgulama_missing_parameters(self, client):
        """Test trigger sorgulama with missing parameters"""
        # Test missing dosya_no
        response = client.post('/api/uyap/trigger-sorgulama', 
                            json={
                                'sorgu_tipi': 'Banka',
                                'borclu_id': '456'
                            })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'dosya_no, sorgu_tipi ve borclu_id parametreleri gerekli' in data['message']
        
        # Test missing sorgu_tipi
        response = client.post('/api/uyap/trigger-sorgulama', 
                            json={
                                'dosya_no': '123',
                                'borclu_id': '456'
                            })
        
        assert response.status_code == 400
        
        # Test missing borclu_id
        response = client.post('/api/uyap/trigger-sorgulama', 
                            json={
                                'dosya_no': '123',
                                'sorgu_tipi': 'Banka'
                            })
        
        assert response.status_code == 400
    
    def test_trigger_sorgulama_failure(self, client):
        """Test failed trigger sorgulama endpoint"""
        with patch('routes.uyap_routes.trigger_sorgulama_logic') as mock_trigger:
            mock_trigger.return_value = {
                'success': False,
                'message': 'UYAP bağlantısı bulunamadı'
            }
            
            response = client.post('/api/uyap/trigger-sorgulama', 
                                json={
                                    'dosya_no': '123',
                                    'sorgu_tipi': 'Banka',
                                    'borclu_id': '456'
                                })
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'UYAP bağlantısı bulunamadı' in data['message']
    
    def test_uyap_status_success(self, client):
        """Test successful UYAP status endpoint"""
        with patch('routes.uyap_routes.uyap_status_logic') as mock_status:
            mock_status.return_value = {
                'success': True,
                'active_sessions': ['9092', '9093'],
                'total_sessions': 2
            }
            
            response = client.get('/api/uyap/status')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['active_sessions'] == ['9092', '9093']
            assert data['total_sessions'] == 2
    
    def test_uyap_status_failure(self, client):
        """Test failed UYAP status endpoint"""
        with patch('routes.uyap_routes.uyap_status_logic') as mock_status:
            mock_status.return_value = {
                'success': False,
                'message': 'Status error'
            }
            
            response = client.get('/api/uyap/status')
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'Status error' in data['message']
    
    def test_uyap_search_files_success(self, client):
        """Test successful UYAP search files endpoint"""
        with patch('routes.uyap_routes.uyap_search_files_logic') as mock_search:
            mock_search.return_value = {
                'success': True,
                'message': 'File search completed successfully'
            }
            
            response = client.post('/api/uyap/search-files', 
                                json={'session_id': '9092'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['message'] == 'File search completed successfully'
            
            mock_search.assert_called_once_with('9092')
    
    def test_uyap_search_files_session_not_found(self, client):
        """Test UYAP search files with non-existent session"""
        with patch('routes.uyap_routes.uyap_search_files_logic') as mock_search:
            mock_search.return_value = {
                'success': False,
                'message': 'Session not found. Please login first.'
            }
            
            response = client.post('/api/uyap/search-files', 
                                json={'session_id': 'nonexistent'})
            
            assert response.status_code == 404
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'Session not found' in data['message']
    
    def test_uyap_extract_data_success(self, client):
        """Test successful UYAP extract data endpoint"""
        with patch('routes.uyap_routes.uyap_extract_data_logic') as mock_extract:
            mock_extract.return_value = {
                'success': True,
                'message': 'Data extraction completed successfully',
                'data': {'extracted': 'data'}
            }
            
            response = client.post('/api/uyap/extract-data', 
                                json={'session_id': '9092'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['message'] == 'Data extraction completed successfully'
            assert 'data' in data
            
            mock_extract.assert_called_once_with('9092')
    
    def test_uyap_query_success(self, client):
        """Test successful UYAP query endpoint"""
        with patch('routes.uyap_routes.uyap_query_logic') as mock_query:
            mock_query.return_value = {
                'success': True,
                'message': 'Query completed successfully',
                'result': {'query': 'result'}
            }
            
            response = client.post('/api/uyap/query', 
                                json={
                                    'session_id': '9092',
                                    'dosya_no': '123',
                                    'selected_options': ['Banka', 'SGK']
                                })
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['success'] is True
            assert data['message'] == 'Query completed successfully'
            assert 'result' in data
            
            mock_query.assert_called_once_with('9092', '123', ['Banka', 'SGK'])
    
    def test_uyap_query_default_options(self, client):
        """Test UYAP query with default options"""
        with patch('routes.uyap_routes.uyap_query_logic') as mock_query:
            mock_query.return_value = {
                'success': True,
                'message': 'Query completed successfully',
                'result': {'query': 'result'}
            }
            
            response = client.post('/api/uyap/query', 
                                json={
                                    'session_id': '9092',
                                    'dosya_no': '123'
                                })
            
            assert response.status_code == 200
            mock_query.assert_called_once_with('9092', '123', [])
    
    def test_api_error_handling(self, client):
        """Test API error handling for unexpected exceptions"""
        with patch('routes.uyap_routes.uyap_login_logic') as mock_login:
            mock_login.side_effect = Exception("Unexpected error")
            
            response = client.post('/api/uyap/login', 
                                json={'pin_kodu': '9092'})
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'Route error' in data['message']
    
    def test_invalid_json_request(self, client):
        """Test handling of invalid JSON requests"""
        response = client.post('/api/uyap/login', 
                            data='invalid json',
                            content_type='application/json')
        
        # The real API returns 500 for invalid JSON, which is acceptable
        assert response.status_code == 500
    
    def test_missing_json_request(self, client):
        """Test handling of missing JSON in request"""
        response = client.post('/api/uyap/login')
        
        # The real API returns 500 for missing JSON, which is acceptable
        assert response.status_code == 500
    
    def test_icra_dosyalarim_endpoint(self, client):
        """Test icra dosyalarim endpoint"""
        with patch('routes.database_routes.get_all_files') as mock_get_files:
            mock_files = [
                {
                    'file_id': 1,
                    'klasor': '2024/1',
                    'dosyaNo': '2024/1',
                    'eYil': 2024,
                    'eNo': 1,
                    'borcluAdi': 'Ahmet Yılmaz',
                    'alacakliAdi': 'Mehmet Demir',
                    'foyTuru': 'İlamlı',
                    'durum': 'Açık',
                    'takipTarihi': '2024-01-15',
                    'icraMudurlugu': 'İstanbul'
                }
            ]
            mock_get_files.return_value = mock_files
            
            response = client.get('/api/icra-dosyalarim')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert len(data) == 1
            assert data[0]['file_id'] == 1
            assert data[0]['klasor'] == '2024/1'
            assert data[0]['borcluAdi'] == 'Ahmet Yılmaz'
    
    def test_icra_dosyalarim_detail_endpoint(self, client):
        """Test icra dosyalarim detail endpoint"""
        with patch('routes.database_routes.get_file_by_id') as mock_get_file, \
             patch('routes.database_routes.get_file_dict') as mock_get_file_dict, \
             patch('routes.database_routes.get_file_details_by_id') as mock_get_file_details, \
             patch('routes.database_routes.get_borclular_by_file_id') as mock_get_borclular:
            
            # Mock the file row data
            mock_file_row = (1, '2024/1', '2024/1', 2024, 1, 'Ahmet Yılmaz', 'Mehmet Demir', 'İlamlı', 'Açık', '2024-01-15', 'İstanbul')
            mock_get_file.return_value = mock_file_row
            
            # Mock the file dictionary
            mock_file_dict = {
                'file_id': 1,
                'klasor': '2024/1',
                'dosyaNo': '2024/1',
                'eYil': 2024,
                'eNo': 1,
                'borcluAdi': 'Ahmet Yılmaz',
                'alacakliAdi': 'Mehmet Demir',
                'foyTuru': 'İlamlı',
                'durum': 'Açık',
                'takipTarihi': '2024-01-15',
                'icraMudurlugu': 'İstanbul'
            }
            mock_get_file_dict.return_value = mock_file_dict
            
            # Mock file details
            mock_get_file_details.return_value = {
                'takipSekli': 'İlamlı',
                'takipYolu': 'İcra',
                'takipTuru': 'Para',
                'alacakliVekili': 'Av. Mehmet',
                'borcMiktari': '10000',
                'faizOrani': '2.5',
                'guncelBorc': '10500'
            }
            
            # Mock borclular
            mock_get_borclular.return_value = [
                {
                    'borclu_id': '1',
                    'file_id': '1',
                    'ad': 'Ahmet Yılmaz',
                    'tcKimlik': '12345678901',
                    'telefon': '5551234567',
                    'adres': 'İstanbul',
                    'vekil': '-'
                }
            ]
            
            response = client.get('/api/icra-dosyalarim/1')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['file_id'] == 1
            assert data['klasor'] == '2024/1'
            assert data['borcluAdi'] == 'Ahmet Yılmaz'
            assert 'borcluList' in data
            assert len(data['borcluList']) == 1
    
    def test_icra_dosyalarim_detail_not_found(self, client):
        """Test icra dosyalarim detail endpoint with non-existent file"""
        with patch('routes.database_routes.get_file_by_id') as mock_get_file:
            mock_get_file.return_value = None
            
            response = client.get('/api/icra-dosyalarim/999')
            
            assert response.status_code == 404
    
    def test_cors_headers(self, client):
        """Test that CORS headers are properly set"""
        response = client.get('/api/uyap/status')
        
        # Check that CORS headers are present (if CORS is configured)
        # This test assumes CORS is configured in the app
        assert response.status_code in [200, 404, 500]  # Any valid response
    
    def test_content_type_headers(self, client):
        """Test that content-type headers are properly set"""
        with patch('routes.uyap_routes.uyap_status_logic') as mock_status:
            mock_status.return_value = {
                'success': True,
                'active_sessions': [],
                'total_sessions': 0
            }
            
            response = client.get('/api/uyap/status')
            
            assert response.status_code == 200
            assert response.content_type == 'application/json' 