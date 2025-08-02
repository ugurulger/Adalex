# Adalex - İcra Dosyaları Yönetim Sistemi

Bu proje, icra dosyalarının yönetimi için geliştirilmiş bir web uygulamasıdır. Modern bir Next.js frontend ve güvenli bir Flask API backend kullanmaktadır.

## 🏗️ Proje Yapısı

```
Adalex/
├── database/                 # Veritabanı ve API katmanı
│   ├── files.db             # SQLite veritabanı
│   ├── api_endpoint.py      # Flask API sunucusu
│   ├── requirements.txt     # Python bağımlılıkları
│   └── app.py              # Eski Flask uygulaması
├── frontend/                  # Next.js frontend
│   ├── app/                # Next.js 13+ app router
│   ├── components/         # UI bileşenleri
│   └── package.json        # Node.js bağımlılıkları
└── start_services.sh       # Servisleri başlatma scripti
```

## 🚀 Kurulum ve Çalıştırma

### 1. Gereksinimler

- Python 3.8+
- Node.js 18+
- npm veya pnpm

### 2. Veritabanı API Kurulumu

```bash
cd database
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Frontend Kurulumu

```bash
cd frontend
npm install
# veya
pnpm install
```

### 4. Servisleri Başlatma

#### Otomatik Başlatma (Önerilen)
```bash
./start_services.sh
```

#### Manuel Başlatma

**Terminal 1 - Database API:**
```bash
cd database
source venv/bin/activate
python api_endpoint.py
```

**Terminal 2 - Next.js Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Erişim Noktaları

- **Frontend:** http://localhost:3000
- **Database API:** http://localhost:5001
- **API Health Check:** http://localhost:5001/health

## 🔌 API Endpoints

### Ana Endpoints

- `GET /api/icra-dosyalarim` - Tüm icra dosyalarını listele
- `GET /api/icra-dosyalarim/{file_id}` - Belirli bir dosyanın detaylarını getir
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}` - Borçlu detaylarını getir

### Örnek Kullanım

```bash
# Tüm dosyaları listele
curl http://localhost:5001/api/icra-dosyalarim

# Belirli bir dosyanın detaylarını getir
curl http://localhost:5001/api/icra-dosyalarim/1

# Borçlu detaylarını getir
curl http://localhost:5001/api/icra-dosyalarim/1/1_1
```

## 🔒 Güvenlik

- API CORS koruması etkin
- SQL injection koruması (parametrized queries)
- Hata mesajları production'da gizlenir
- Veritabanı bağlantıları güvenli şekilde yönetilir

## 📊 Veritabanı Şeması

### Ana Tablolar

- `files` - İcra dosyaları ana bilgileri
- `file_details` - Dosya detay bilgileri
- `borclular` - Borçlu bilgileri
- `borclu_sorgular` - Borçlu sorgu sonuçları

### Örnek Veri Yapısı

```json
{
  "file_id": 1,
  "klasor": "1",
  "dosyaNo": "001",
  "borcluAdi": "Ahmet Yılmaz",
  "alacakliAdi": "ABC Şirketi Ltd. Şti.",
  "foyTuru": "İlamsız İcra",
  "durum": "Açık",
  "takipTarihi": "15.01.2024",
  "icraMudurlugu": "İstanbul 1. İcra Müdürlüğü"
}
```

## 🛠️ Geliştirme

### Yeni API Endpoint Ekleme

1. `database/api_endpoint.py` dosyasına yeni route ekleyin
2. Gerekli veritabanı fonksiyonlarını tanımlayın
3. Frontend'de yeni endpoint'i kullanın

### Veritabanı Değişiklikleri

1. `database/files.db` dosyasını güncelleyin
2. `api_endpoint.py`'deki COLUMNS listesini güncelleyin
3. İlgili dönüşüm fonksiyonlarını güncelleyin

## 🐛 Sorun Giderme

### Database API Başlamıyor
- Python bağımlılıklarının kurulu olduğundan emin olun
- Port 5001'in boş olduğunu kontrol edin
- `files.db` dosyasının mevcut olduğunu kontrol edin

### Frontend Veri Alamıyor
- Database API'nin çalıştığından emin olun
- CORS ayarlarını kontrol edin
- Network sekmesinde API çağrılarını inceleyin

### Veritabanı Bağlantı Hatası
- `files.db` dosyasının okunabilir olduğunu kontrol edin
- SQLite3'in kurulu olduğunu kontrol edin

## 📝 Notlar

- Veritabanı API'si port 5001'de çalışır
- Frontend port 3000'de çalışır
- Tüm API çağrıları CORS ile korunur
- Hata durumlarında uygun HTTP status kodları döner 