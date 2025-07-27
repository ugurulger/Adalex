import sqlite3
import json
import sys

DB_PATH = 'database/files.db'

if len(sys.argv) < 2:
    print('Usage: python check_sgk_db.py <borclu_id>')
    sys.exit(1)

borclu_id = sys.argv[1]

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT sorgu_verisi, timestamp FROM borclu_sorgular WHERE borclu_id = ? AND sorgu_tipi = ?", (borclu_id, 'SGK'))
row = cur.fetchone()
conn.close()

if row:
    print(f"SGK data for borclu_id={borclu_id}:")
    print(json.dumps(json.loads(row[0]), ensure_ascii=False, indent=2))
    print(f"Timestamp: {row[1]}")
else:
    print(f"No SGK data found for borclu_id={borclu_id}") 