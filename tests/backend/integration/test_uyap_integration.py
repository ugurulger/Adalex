import pytest
import sys
import os
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from services.uyap_service import (
    uyap_login_logic,
    uyap_logout_logic,
    trigger_sorgulama_logic,
    uyap_status_logic,
    get_uyap_sessions,
    get_uyap_session_lock
)

class TestUYAPIntegration:
    """Integration tests for UYAP service functionality"""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown for each test"""
        # Clear sessions before each test
        sessions = get_uyap_sessions()
        sessions.clear()
        yield
        # Clear sessions after each test
        sessions.clear()
    
    def test_uyap_login_success(self):
        """Test successful UYAP login"""
        with patch('services.uyap_service.open_browser_and_login') as mock_login:
            # Mock successful login
            mock_driver = Mock()
            mock_driver.current_url = "https://uyap.gov.tr"
            mock_login.return_value = mock_driver
            
            result = uyap_login_logic("9092")
            
            assert result['success'] is True
            assert result['message'] == 'Successfully logged in to UYAP'
            assert result['session_id'] == "9092"
            
            # Verify session was stored
            sessions = get_uyap_sessions()
            assert "9092" in sessions
            assert sessions["9092"] == mock_driver
    
    def test_uyap_login_failure(self):
        """Test failed UYAP login"""
        with patch('services.uyap_service.open_browser_and_login') as mock_login:
            # Mock failed login
            mock_login.return_value = None
            
            result = uyap_login_logic("9092")
            
            assert result['success'] is False
            assert result['message'] == 'Failed to login to UYAP'
            
            # Verify no session was stored
            sessions = get_uyap_sessions()
            assert "9092" not in sessions
    
    def test_uyap_login_existing_session(self):
        """Test login when session already exists and is valid"""
        # Setup existing session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        mock_driver.current_url = "https://uyap.gov.tr"
        sessions["9092"] = mock_driver
        
        result = uyap_login_logic("9092")
        
        assert result['success'] is True
        assert result['message'] == 'Already logged in to UYAP'
        assert result['session_id'] == "9092"
    
    def test_uyap_login_dead_session(self):
        """Test login when existing session is dead"""
        # Setup dead session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        mock_driver.current_url.side_effect = Exception("Driver dead")
        sessions["9092"] = mock_driver
        
        with patch('services.uyap_service.open_browser_and_login') as mock_login:
            # Mock successful new login
            new_mock_driver = Mock()
            new_mock_driver.current_url = "https://uyap.gov.tr"
            mock_login.return_value = new_mock_driver
            
            result = uyap_login_logic("9092")
            
            assert result['success'] is True
            assert result['message'] == 'Successfully logged in to UYAP'
            
            # Verify old session was removed and new one added
            assert sessions["9092"] == new_mock_driver
    
    def test_uyap_logout_success(self):
        """Test successful UYAP logout"""
        # Setup existing session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        sessions["9092"] = mock_driver
        
        result = uyap_logout_logic("9092")
        
        assert result['success'] is True
        assert result['message'] == 'Successfully logged out from UYAP'
        
        # Verify session was removed
        assert "9092" not in sessions
        mock_driver.quit.assert_called_once()
    
    def test_uyap_logout_session_not_found(self):
        """Test logout when session doesn't exist"""
        result = uyap_logout_logic("nonexistent")
        
        assert result['success'] is False
        assert result['message'] == 'Session not found'
    
    def test_uyap_status_active_sessions(self):
        """Test UYAP status with active sessions"""
        # Setup active sessions
        sessions = get_uyap_sessions()
        mock_driver1 = Mock()
        mock_driver1.current_url = "https://uyap.gov.tr"
        mock_driver2 = Mock()
        mock_driver2.current_url = "https://uyap.gov.tr"
        sessions["9092"] = mock_driver1
        sessions["9093"] = mock_driver2
        
        result = uyap_status_logic()
        
        assert result['success'] is True
        assert result['active_sessions'] == ["9092", "9093"]
        assert result['total_sessions'] == 2
    
    def test_uyap_status_dead_sessions_cleanup(self):
        """Test UYAP status cleanup of dead sessions"""
        # Setup mixed sessions (active and dead)
        sessions = get_uyap_sessions()
        mock_driver1 = Mock()
        mock_driver1.current_url = "https://uyap.gov.tr"
        mock_driver2 = Mock()
        mock_driver2.current_url.side_effect = Exception("Driver dead")
        sessions["9092"] = mock_driver1
        sessions["9093"] = mock_driver2
        
        result = uyap_status_logic()
        
        assert result['success'] is True
        assert result['active_sessions'] == ["9092"]
        assert result['total_sessions'] == 1
        
        # Verify dead session was removed
        assert "9093" not in sessions
        assert "9092" in sessions
    
    def test_trigger_sorgulama_no_session(self):
        """Test trigger sorgulama when no UYAP session exists"""
        result = trigger_sorgulama_logic("123", "Banka", "456")
        
        assert result['success'] is False
        assert "UYAP bağlantısı bulunamadı" in result['message']
    
    def test_trigger_sorgulama_dead_session(self):
        """Test trigger sorgulama with dead session"""
        # Setup dead session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        mock_driver.current_url.side_effect = Exception("Driver dead")
        sessions["9092"] = mock_driver
        
        result = trigger_sorgulama_logic("123", "Banka", "456")
        
        assert result['success'] is False
        assert "UYAP bağlantısı kesildi" in result['message']
        
        # Verify dead session was removed
        assert "9092" not in sessions
    
    @patch('services.uyap_service.perform_sorgulama')
    @patch('services.uyap_service.get_borclu_sorgu_by_tipi')
    def test_trigger_sorgulama_success(self, mock_get_sorgu, mock_perform_sorgulama):
        """Test successful trigger sorgulama"""
        # Setup active session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        mock_driver.current_url = "https://uyap.gov.tr"
        sessions["9092"] = mock_driver
        
        # Mock sorgulama results
        mock_get_sorgu.return_value = {
            "data": {"test": "data"},
            "timestamp": "2024-01-01T00:00:00"
        }
        
        result = trigger_sorgulama_logic("123", "Banka", "456")
        
        assert result['success'] is True
        assert "Banka sorgulaması başarıyla tamamlandı" in result['message']
        assert 'data' in result
        assert 'timestamp' in result
        
        # Verify perform_sorgulama was called
        mock_perform_sorgulama.assert_called_once()
    
    def test_trigger_sorgulama_exception_handling(self):
        """Test trigger sorgulama exception handling"""
        # Setup active session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        mock_driver.current_url = "https://uyap.gov.tr"
        sessions["9092"] = mock_driver
        
        with patch('services.uyap_service.perform_sorgulama') as mock_perform:
            # Mock different types of exceptions
            mock_perform.side_effect = Exception("Connection refused")
            
            result = trigger_sorgulama_logic("123", "Banka", "456")
            
            assert result['success'] is False
            assert "UYAP bağlantısı kesildi" in result['message']
    
    def test_session_lock_thread_safety(self):
        """Test that session operations are thread-safe"""
        lock = get_uyap_session_lock()
        
        # Verify lock is a threading.Lock
        assert hasattr(lock, 'acquire')
        assert hasattr(lock, 'release')
    
    def test_multiple_sessions_management(self):
        """Test managing multiple UYAP sessions"""
        # Login multiple sessions
        with patch('services.uyap_service.open_browser_and_login') as mock_login:
            mock_driver1 = Mock()
            mock_driver1.current_url = "https://uyap.gov.tr"
            mock_driver2 = Mock()
            mock_driver2.current_url = "https://uyap.gov.tr"
            
            mock_login.side_effect = [mock_driver1, mock_driver2]
            
            result1 = uyap_login_logic("9092")
            result2 = uyap_login_logic("9093")
            
            assert result1['success'] is True
            assert result2['success'] is True
            
            sessions = get_uyap_sessions()
            assert "9092" in sessions
            assert "9093" in sessions
            assert len(sessions) == 2
    
    def test_session_cleanup_on_exception(self):
        """Test that sessions are properly cleaned up on exceptions"""
        # Setup session
        sessions = get_uyap_sessions()
        mock_driver = Mock()
        sessions["9092"] = mock_driver
        
        # Simulate exception during operation
        with patch('services.uyap_service.perform_sorgulama') as mock_perform:
            mock_perform.side_effect = Exception("Test exception")
            
            result = trigger_sorgulama_logic("123", "Banka", "456")
            
            # Session should still exist after exception
            assert "9092" in sessions
            assert result['success'] is False 