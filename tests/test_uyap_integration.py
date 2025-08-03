#!/usr/bin/env python3
"""
Test script for UYAP integration
Tests all UYAP API endpoints to ensure they're working correctly
"""

import requests
import json
import time

# Configuration
BACKEND_URL = "http://localhost:5001"
FRONTEND_URL = "http://localhost:3000"

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False

def test_frontend_health():
    """Test frontend health"""
    print("🔍 Testing frontend health...")
    try:
        response = requests.get(f"{FRONTEND_URL}")
        if response.status_code == 200 and "Hukuk Takip Sistemi" in response.text:
            print("✅ Frontend is healthy")
            return True
        else:
            print(f"❌ Frontend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend health check error: {e}")
        return False

def test_uyap_status():
    """Test UYAP status endpoint"""
    print("🔍 Testing UYAP status...")
    try:
        # Test backend directly
        response = requests.get(f"{BACKEND_URL}/api/uyap/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend UYAP status: {data}")
        else:
            print(f"❌ Backend UYAP status failed: {response.status_code}")
            return False
        
        # Test frontend proxy
        response = requests.get(f"{FRONTEND_URL}/api/uyap?action=status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Frontend UYAP status: {data}")
            return True
        else:
            print(f"❌ Frontend UYAP status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ UYAP status test error: {e}")
        return False

def test_uyap_login():
    """Test UYAP login endpoint"""
    print("🔍 Testing UYAP login...")
    try:
        # Test with default PIN
        data = {"pin_kodu": "9092"}
        response = requests.post(f"{FRONTEND_URL}/api/uyap", 
                               json={"action": "login", **data})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ UYAP login response: {result}")
            return result.get('success', False)
        else:
            print(f"❌ UYAP login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ UYAP login test error: {e}")
        return False

def test_uyap_logout():
    """Test UYAP logout endpoint"""
    print("🔍 Testing UYAP logout...")
    try:
        data = {"session_id": "9092"}
        response = requests.post(f"{FRONTEND_URL}/api/uyap", 
                               json={"action": "logout", **data})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ UYAP logout response: {result}")
            return True
        else:
            print(f"❌ UYAP logout failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ UYAP logout test error: {e}")
        return False

def test_uyap_query():
    """Test UYAP query endpoint"""
    print("🔍 Testing UYAP query...")
    try:
        data = {
            "session_id": "9092",
            "dosya_no": "2024/11086",
            "selected_options": ["egm", "takbis"]
        }
        response = requests.post(f"{FRONTEND_URL}/api/uyap", 
                               json={"action": "query", **data})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ UYAP query response: {result}")
            return True
        else:
            print(f"❌ UYAP query failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ UYAP query test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting UYAP Integration Tests")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Frontend Health", test_frontend_health),
        ("UYAP Status", test_uyap_status),
        ("UYAP Login", test_uyap_login),
        ("UYAP Logout", test_uyap_logout),
        ("UYAP Query", test_uyap_query),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! UYAP integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 