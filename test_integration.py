#!/usr/bin/env python3
"""
Integration Test Script for Adalex Database System
Tests both the database API and the Next.js API endpoints to ensure everything is working correctly.
"""

import requests
import json
import time
import sys

def test_database_api():
    """Test the database API directly"""
    print("🔍 Testing Database API...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Database API health check passed")
        else:
            print(f"❌ Database API health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Database API is not running on port 5001")
        return False
    except requests.exceptions.Timeout:
        print("❌ Database API health check timed out")
        return False
    
    # Test main endpoint
    try:
        response = requests.get("http://localhost:5001/api/icra-dosyalarim", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Database API main endpoint working - {len(data)} files found")
            if len(data) > 0:
                print(f"   Sample file: {data[0].get('dosyaNo', 'N/A')} - {data[0].get('borcluAdi', 'N/A')}")
        else:
            print(f"❌ Database API main endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database API main endpoint error: {e}")
        return False
    
    # Test detail endpoint
    try:
        response = requests.get("http://localhost:5001/api/icra-dosyalarim/1", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Database API detail endpoint working")
            print(f"   File details: {data.get('dosyaNo', 'N/A')} - {data.get('alacakliVekili', 'N/A')}")
        else:
            print(f"❌ Database API detail endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database API detail endpoint error: {e}")
        return False
    
    return True

def test_nextjs_api():
    """Test the Next.js API endpoints"""
    print("\n🔍 Testing Next.js API...")
    
    # Test main endpoint
    try:
        response = requests.get("http://localhost:3001/api/icra-dosyalarim", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Next.js API main endpoint working - {len(data)} files found")
            if len(data) > 0:
                print(f"   Sample file: {data[0].get('dosyaNo', 'N/A')} - {data[0].get('borcluAdi', 'N/A')}")
        else:
            print(f"❌ Next.js API main endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Next.js API is not running on port 3001")
        return False
    except Exception as e:
        print(f"❌ Next.js API main endpoint error: {e}")
        return False
    
    # Test detail endpoint
    try:
        response = requests.get("http://localhost:3001/api/icra-dosyalarim/1", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Next.js API detail endpoint working")
            print(f"   File details: {data.get('dosyaNo', 'N/A')} - {data.get('alacakliVekili', 'N/A')}")
        else:
            print(f"❌ Next.js API detail endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Next.js API detail endpoint error: {e}")
        return False
    
    return True

def test_data_consistency():
    """Test that data is consistent between database API and Next.js API"""
    print("\n🔍 Testing Data Consistency...")
    
    try:
        # Get data from both APIs
        db_response = requests.get("http://localhost:5001/api/icra-dosyalarim", timeout=5)
        nextjs_response = requests.get("http://localhost:3001/api/icra-dosyalarim", timeout=5)
        
        if db_response.status_code == 200 and nextjs_response.status_code == 200:
            db_data = db_response.json()
            nextjs_data = nextjs_response.json()
            
            if len(db_data) == len(nextjs_data):
                print(f"✅ Data consistency check passed - {len(db_data)} files in both APIs")
                
                # Check if first file has same basic info
                if len(db_data) > 0 and len(nextjs_data) > 0:
                    db_file = db_data[0]
                    nextjs_file = nextjs_data[0]
                    
                    if (db_file.get('file_id') == nextjs_file.get('file_id') and 
                        db_file.get('dosyaNo') == nextjs_file.get('dosyaNo')):
                        print("✅ First file data matches between APIs")
                    else:
                        print("⚠️  First file data doesn't match between APIs")
                        return False
            else:
                print(f"❌ Data inconsistency - DB: {len(db_data)} files, Next.js: {len(nextjs_data)} files")
                return False
        else:
            print("❌ Could not fetch data for consistency check")
            return False
            
    except Exception as e:
        print(f"❌ Data consistency check error: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("🚀 Adalex Integration Test")
    print("=" * 50)
    
    # Check if services are running
    print("Checking if services are running...")
    
    # Test database API
    db_ok = test_database_api()
    
    # Test Next.js API
    nextjs_ok = test_nextjs_api()
    
    # Test data consistency
    consistency_ok = test_data_consistency()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    if db_ok:
        print("✅ Database API: Working")
    else:
        print("❌ Database API: Failed")
    
    if nextjs_ok:
        print("✅ Next.js API: Working")
    else:
        print("❌ Next.js API: Failed")
    
    if consistency_ok:
        print("✅ Data Consistency: Working")
    else:
        print("❌ Data Consistency: Failed")
    
    if db_ok and nextjs_ok and consistency_ok:
        print("\n🎉 All tests passed! Your integration is working perfectly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the services and try again.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1) 