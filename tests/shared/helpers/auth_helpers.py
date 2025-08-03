import json
import os
from typing import Dict, Any, Optional

def create_test_user(username: str = "test_user", pincode: str = "9092", role: str = "admin") -> Dict[str, Any]:
    """Create a test user for authentication testing"""
    return {
        "id": 1,
        "username": username,
        "pincode": pincode,
        "role": role,
        "created_at": "2024-01-15T10:00:00"
    }

def create_test_session(user_id: int = 1, session_id: str = "9092") -> Dict[str, Any]:
    """Create a test session for UYAP integration testing"""
    return {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": "2024-01-15T10:00:00",
        "expires_at": "2024-01-15T18:00:00",
        "is_active": True
    }

def validate_pincode(pincode: str) -> bool:
    """Validate PIN code format for UYAP login"""
    if not pincode:
        return False
    
    # PIN should be 4 digits
    if not pincode.isdigit() or len(pincode) != 4:
        return False
    
    return True

def authenticate_user(username: str, pincode: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with username and PIN code"""
    if not username or not pincode:
        return None
    
    if not validate_pincode(pincode):
        return None
    
    # Mock authentication - in real app this would check against database
    if username == "test_user" and pincode == "9092":
        return create_test_user(username, pincode)
    
    return None

def get_user_permissions(user_id: int) -> Dict[str, bool]:
    """Get user permissions for authorization testing"""
    # Mock permissions based on user role
    if user_id == 1:  # admin user
        return {
            "can_create_cases": True,
            "can_edit_cases": True,
            "can_delete_cases": True,
            "can_execute_queries": True,
            "can_view_reports": True,
            "can_manage_users": True
        }
    else:  # regular user
        return {
            "can_create_cases": True,
            "can_edit_cases": True,
            "can_delete_cases": False,
            "can_execute_queries": True,
            "can_view_reports": True,
            "can_manage_users": False
        }

def check_permission(user_id: int, permission: str) -> bool:
    """Check if user has specific permission"""
    permissions = get_user_permissions(user_id)
    return permissions.get(permission, False)

def create_auth_headers(user_id: int = 1) -> Dict[str, str]:
    """Create authentication headers for API testing"""
    # Mock JWT token - in real app this would be generated
    token = f"mock_jwt_token_for_user_{user_id}"
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def load_test_users() -> Dict[str, Any]:
    """Load test users from fixtures"""
    fixture_path = os.path.join(os.path.dirname(__file__), '..', 'fixtures', 'test_data.json')
    try:
        with open(fixture_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('users', [])
    except FileNotFoundError:
        return []

def get_test_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get test user by ID"""
    users = load_test_users()
    for user in users:
        if user.get('id') == user_id:
            return user
    return None

def get_test_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get test user by username"""
    users = load_test_users()
    for user in users:
        if user.get('username') == username:
            return user
    return None 