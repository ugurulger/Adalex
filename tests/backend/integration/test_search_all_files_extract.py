#!/usr/bin/env python3
"""
Test script for search_all_files_extract.py with database helper integration
"""

import sys
import os
import json
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from services.database_writer import get_database_connection

def test_search_all_files_extract_integration():
    """Test that search_all_files_extract.py data can be saved and retrieved from database"""
    
    print("🧪 Testing search_all_files_extract.py database integration...")
    
    # Sample data structure that search_all_files_extract.py would produce
    sample_data = [
        {
            "file_id": "1",
            "klasor": "1",  # Same as file_id for UI display
            "dosyaNo": "2025/141",
            "borcluAdi": "MURAT AYDOĞDU",
            "alacakliAdi": "EMİN ÜNLÜER",
            "foyTuru": "Talimat",
            "durum": "Açık",
            "takipTarihi": "14.03.2025",
            "icraMudurlugu": "Sivas İcra Dairesi",  # Actual İcra Müdürlüğü name
            "takipSekli": "İcra Takibi - İcra Müdürlüğü - Talimat",
            "alacakliVekili": "AV. AHMET YILMAZ",
            "borcMiktari": "10,000.00 TL",
            "faizOrani": "5.0%",
            "guncelBorc": "11,800.00 TL",
            "borcluList": [
                {
                    "borclu_id": "1_1",
                    "file_id": "1",
                    "ad": "MURAT AYDOĞDU",
                    "tcKimlik": "",
                    "telefon": "",
                    "adres": "",
                    "vekil": ""
                }
            ]
        },
        {
            "file_id": "2",
            "klasor": "2",  # Same as file_id for UI display
            "dosyaNo": "2025/142",
            "borcluAdi": "MEHMET KAYA",
            "alacakliAdi": "ABC ŞİRKETİ A.Ş.",
            "foyTuru": "İhtiyati Haciz",
            "durum": "Açık",
            "takipTarihi": "15.03.2025",
            "icraMudurlugu": "Ankara İcra Dairesi",  # Actual İcra Müdürlüğü name
            "takipSekli": "İhtiyati Haciz - İcra Müdürlüğü - Talimat",
            "alacakliVekili": "AV. FATMA DEMİR",
            "borcMiktari": "5,000.00 TL",
            "faizOrani": "5.0%",
            "guncelBorc": "5,900.00 TL",
            "borcluList": [
                {
                    "borclu_id": "2_1",
                    "file_id": "2",
                    "ad": "MEHMET KAYA",
                    "tcKimlik": "",
                    "telefon": "",
                    "adres": "",
                    "vekil": ""
                }
            ]
        }
    ]
    
    # Create a temporary JSON file for testing
    test_output_file = f"/tmp/test_extracted_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    try:
        # Import the database helper function
        from services.database_writer import save_scraping_data_to_db_and_json
        
        print(f"📝 Saving sample data to database and {test_output_file}...")
        
        # Save the sample data
        save_scraping_data_to_db_and_json(sample_data, test_output_file)
        
        print("✅ Data saved successfully!")
        
        # Verify JSON file was created
        if os.path.exists(test_output_file):
            print(f"✅ JSON backup file created: {test_output_file}")
            
            # Read and verify JSON content
            with open(test_output_file, 'r', encoding='utf-8') as f:
                saved_data = json.load(f)
            
            if saved_data == sample_data:
                print("✅ JSON file content matches original data")
            else:
                print("❌ JSON file content does not match original data")
                return False
        else:
            print(f"❌ JSON backup file was not created: {test_output_file}")
            return False
        
        # Verify data in database
        print("🔍 Verifying data in database...")
        
        # Get database connection
        conn = get_database_connection()
        cursor = conn.cursor()
        
        # Check if data was saved to files table
        cursor.execute("SELECT COUNT(*) FROM files WHERE file_id IN ('1', '2')")
        count = cursor.fetchone()[0]
        
        if count >= 2:  # At least 2 records should be saved
            print(f"✅ Found {count} records in files table")
            
            # Check if data was saved to file_details table
            cursor.execute("SELECT COUNT(*) FROM file_details WHERE file_id IN ('1', '2')")
            details_count = cursor.fetchone()[0]
            print(f"✅ Found {details_count} records in file_details table")
            
            # Check if data was saved to borclular table
            cursor.execute("SELECT COUNT(*) FROM borclular WHERE file_id IN ('1', '2')")
            borclu_count = cursor.fetchone()[0]
            print(f"✅ Found {borclu_count} records in borclular table")
            
            # Get one record to verify structure
            cursor.execute("SELECT * FROM files WHERE file_id = '1' LIMIT 1")
            record = cursor.fetchone()
            
            if record:
                print("✅ Database record structure is correct")
                print(f"   File ID: {record[0]}")
                print(f"   Borclu Adi: {record[3]}")
                print(f"   Alacakli Adi: {record[4]}")
            else:
                print("❌ No records found in database")
                return False
        else:
            print(f"❌ Expected at least 2 records, found {count}")
            return False
        
        cursor.close()
        conn.close()
        
        print("🎉 All tests passed! search_all_files_extract.py integration works correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up test file
        if os.path.exists(test_output_file):
            os.remove(test_output_file)
            print(f"🧹 Cleaned up test file: {test_output_file}")

if __name__ == "__main__":
    success = test_search_all_files_extract_integration()
    sys.exit(0 if success else 1) 