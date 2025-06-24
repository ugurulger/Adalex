import sqlite3
import pandas as pd

DB_PATH = "files.db"

def show_tables():
    conn = sqlite3.connect(DB_PATH)
    
    print("\n=== Files Tablosu ===")
    df_files = pd.read_sql_query("SELECT * FROM files", conn)
    print(df_files.to_string(index=False))
    
    print("\n=== File Details Tablosu ===")
    df_details = pd.read_sql_query("SELECT * FROM file_details", conn)
    print(df_details.to_string(index=False))
    
    print("\n=== Borclular Tablosu ===")
    df_borclular = pd.read_sql_query("SELECT * FROM borclular", conn)
    print(df_borclular.to_string(index=False))
    
    print("\n=== Borclu Sorgular Tablosu (Örnek: İlk 5 Kayıt) ===")
    df_sorgular = pd.read_sql_query("SELECT * FROM borclu_sorgular LIMIT 5", conn)
    print(df_sorgular.to_string(index=False))
    
    conn.close()

if __name__ == "__main__":
    show_tables()