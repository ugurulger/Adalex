import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";

// NOT: DB_PATH'ı kendi bilgisayarınızdaki dosya yoluna göre ayarlayın
const DB_PATH = "/Users/ugurulger/Desktop/Takipcim/database/files.db"; // Örnek: "/Users/kullanici/files.db"

export async function GET(req: NextRequest) {
  try {
    const db = new sqlite3.Database(DB_PATH);
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          f.file_id,
          f.klasor,
          f.dosyaNo,
          f.borcluAdi,
          f.alacakliAdi,
          f.foyTuru,
          f.icraMudurlugu,
          f.durum,
          f.takipTarihi
        FROM files f
        ORDER BY f.file_id
        LIMIT 1000`,
        [],
        (err, rows) => {
          db.close();
          if (err) {
            resolve(NextResponse.json({ error: String(err) }, { status: 500 }));
          } else {
            resolve(NextResponse.json(rows));
          }
        }
      );
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
} 