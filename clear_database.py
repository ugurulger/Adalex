#!/usr/bin/env python3
"""
Script to clear all data from the database tables
"""

import sqlite3
import os
import logging

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'files.db')

def clear_database():
    """Clear all data from database tables"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Get logger
        logger = logging.getLogger('clear_database')
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        logger.info(f"Connecting to database: {DB_PATH}")
        
        # Clear all tables in the correct order (respecting foreign key constraints)
        tables_to_clear = [
            'borclu_sorgular',  # Clear first due to foreign key constraints
            'borclular',        # Clear second due to foreign key constraints  
            'file_details',     # Clear third due to foreign key constraints
            'files'             # Clear last (main table)
        ]
        
        for table in tables_to_clear:
            try:
                cur.execute(f"DELETE FROM {table}")
                rows_deleted = cur.rowcount
                logger.info(f"Cleared {rows_deleted} rows from table '{table}'")
            except sqlite3.Error as e:
                logger.error(f"Error clearing table '{table}': {e}")
        
        # Commit the changes
        conn.commit()
        logger.info("Database cleared successfully!")
        
        # Verify tables are empty
        for table in tables_to_clear:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            logger.info(f"Table '{table}' now contains {count} rows")
        
        conn.close()
        
    except Exception as e:
        logger.error(f"Error clearing database: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    clear_database() 