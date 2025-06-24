from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3

app = Flask(__name__)

DB_PATH = "files.db"

# Column names for better data handling
COLUMNS = ['file_id', 'klasor', 'dosyaNo', 'borcluAdi', 'alacakliAdi', 'foyTuru', 'durum', 'takipTarihi', 'icraMudurlugu']

def get_all_files():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM files ORDER BY file_id")
    rows = cur.fetchall()
    conn.close()
    return rows

def get_file_by_id(file_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM files WHERE file_id = ?", (file_id,))
    row = cur.fetchone()
    conn.close()
    return row

def get_file_details_by_id(file_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM file_details WHERE file_id = ?", (file_id,))
    row = cur.fetchone()
    conn.close()
    return row

def get_borclular_by_file_id(file_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM borclular WHERE file_id = ?", (file_id,))
    rows = cur.fetchall()
    conn.close()
    return rows

def get_borclu_sorgular_by_borclu_id(borclu_id):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM borclu_sorgular WHERE borclu_id = ?", (borclu_id,))
    rows = cur.fetchall()
    conn.close()
    return rows

def get_files_by_borclu(borclu_adi):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM files WHERE borcluAdi = ? ORDER BY file_id", (borclu_adi,))
    rows = cur.fetchall()
    conn.close()
    return rows

def get_file_dict(file_row):
    """Convert a file row to a dictionary with column names"""
    if file_row:
        return dict(zip(COLUMNS, file_row))
    return None

@app.route('/')
def index():
    files = get_all_files()
    return render_template('index.html', files=files, columns=COLUMNS)

@app.route('/api/files')
def api_files():
    """AJAX endpoint for getting updated files data"""
    files = get_all_files()
    return jsonify({
        'files': [dict(zip(COLUMNS, file)) for file in files],
        'count': len(files)
    })

@app.route('/file/<file_id>')
def file_detail(file_id):
    file_row = get_file_by_id(file_id)
    if not file_row:
        return "File not found", 404
    
    file_dict = get_file_dict(file_row)
    file_details = get_file_details_by_id(file_id)
    borclular = get_borclular_by_file_id(file_id)
    
    return render_template('file_detail.html', 
                         file=file_dict, 
                         file_row=file_row,
                         file_details=file_details,
                         borclular=borclular)

@app.route('/api/file/<file_id>')
def api_file_detail(file_id):
    """AJAX endpoint for getting updated file detail data"""
    file_row = get_file_by_id(file_id)
    if not file_row:
        return jsonify({'error': 'File not found'}), 404
    
    file_dict = get_file_dict(file_row)
    file_details = get_file_details_by_id(file_id)
    borclular = get_borclular_by_file_id(file_id)
    
    return jsonify({
        'file': file_dict,
        'file_details': file_details,
        'borclular': borclular
    })

@app.route('/borclu/<borclu_adi>')
def borclu_files(borclu_adi):
    files = get_files_by_borclu(borclu_adi)
    return render_template('borclu_files.html', files=files, borclu_adi=borclu_adi, columns=COLUMNS)

@app.route('/api/borclu/<borclu_adi>')
def api_borclu_files(borclu_adi):
    """AJAX endpoint for getting updated borclu files data"""
    files = get_files_by_borclu(borclu_adi)
    return jsonify({
        'files': [dict(zip(COLUMNS, file)) for file in files],
        'borclu_adi': borclu_adi,
        'count': len(files)
    })

@app.route('/borclu_sorgular/<borclu_id>')
def borclu_sorgular(borclu_id):
    sorgular = get_borclu_sorgular_by_borclu_id(borclu_id)
    return render_template('borclu_sorgular.html', sorgular=sorgular, borclu_id=borclu_id)

@app.route('/api/borclu_sorgular/<borclu_id>')
def api_borclu_sorgular(borclu_id):
    """AJAX endpoint for getting updated borclu sorgular data"""
    sorgular = get_borclu_sorgular_by_borclu_id(borclu_id)
    return jsonify({
        'sorgular': sorgular,
        'borclu_id': borclu_id,
        'count': len(sorgular)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) 