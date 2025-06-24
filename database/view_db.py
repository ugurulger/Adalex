import sqlite3
import pandas as pd

DB_PATH = "files.db"

def show_table():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM files", conn)
    conn.close()
    # Tabloyu ekrana basıyoruz
    print(df.to_string(index=False))

if __name__ == "__main__":
    show_table()
