# ⚖️ Adalex — Legal Automation Platform for Law Offices

Adalex is a specialized software tool designed to automate and streamline legal workflows in law offices. It helps lawyers efficiently manage their cases, clients, and legal documents by integrating data scraping from official government websites and providing a centralized dashboard for day-to-day operations.

> **Status**: 🛠 In Development – Core functionality implemented and demo-ready. Final features like document management and notifications are in progress.

---

## 🚀 Key Features

- 🔍 **Web Scraping Integration**: Automatically retrieves case and client data from government portals.
- 🧑‍⚖️ **Client & Case Management**: Organize and manage clients, case details, and legal timelines.
- 📂 **Document Center**: Upload and categorize legal documents per case.
- 🗓️ **Activity Timeline**: Monitor and track all legal activities in one place.
- 📬 **Notifications System** *(coming soon)*: Alert lawyers of critical case changes or deadlines.

---

## 🧪 Quality Assurance (SQA Focus)

This project is being built with a strong emphasis on testability, quality control, and reliability:

- ✅ **Automated Testing Suite** using `PyTest`
- 🔁 **Test Coverage** across core modules (scraping, data handling, basic UI flows)
- 🐞 **Issue Tracking** and QA status documented in [GitHub Issues](https://github.com/ugurulger/Adalex/issues)
- ⏱️ **CI/CD Pipeline** *(planned)* using GitHub Actions for automatic test runs on push

---

## 🧰 Tech Stack

- **Language**: Python 3.x  
- **Backend Framework**: Flask *(or specify if different)*  
- **Database**: SQLite (for dev), PostgreSQL (optional for prod)  
- **Web Scraping**: BeautifulSoup & Requests *(or Selenium if used)*  
- **Testing Tools**: Playwrite, PyTest, unittest  
- **Version Control**: Git & GitHub

## 📸 Demo & Screenshots

> **Note**: The data shown in this demo is completely fictional and does not belong to any real person. All names, identification numbers, addresses, and other personal information are made up for demonstration purposes only.
![Adalex Demo](AdalexDemo.gif)
*Demo showcasing the Adalex platform in action*

## 🔮 Roadmap

- [x] Core web scraping engine
- [x] Case/client management system
- [ ] Notification system for legal deadlines
- [ ] User roles and permissions
- [ ] CI/CD test automation

## 🏗️ Project Structure

```
Adalex/
├── backend/                    # Flask API Backend
│   ├── api/                   # API layer
│   │   ├── api_endpoint.py   # Main API server
│   │   ├── requirements.txt  # Python dependencies
│   │   └── routes/           # API routes
│   │       ├── database_routes.py
│   │       └── uyap_routes.py
│   ├── scrappers/            # Web scraping modules
│   │   ├── first_setup/      # Initial setup scripts
│   │   └── queries/          # Query modules
│   │       ├── banka_sorgu.py
│   │       ├── dis_isleri_sorgu.py
│   │       ├── egm_sorgu.py
│   │       ├── gib_sorgu.py
│   │       ├── gsm_sorgu.py
│   │       ├── icra_dosyasi_sorgu.py
│   │       ├── iski_sorgu.py
│   │       ├── mernis_sorgu.py
│   │       ├── posta_ceki_sorgu.py
│   │       ├── sgk_haciz_sorgu.py
│   │       ├── sgk_sorgu.py
│   │       ├── sgk_sorgu2.py
│   │       ├── sorgulama_common.py
│   │       └── takbis_sorgu.py
│   └── services/             # Service layer
│       ├── database_reader.py
│       ├── database_writer.py
│       ├── login_uyap.py
│       └── uyap_service.py
├── database/                 # Database operations
│   ├── build_database.py    # Database creation
│   ├── clear_database.py    # Database cleanup
│   ├── datastructure.json   # Data structure definitions
│   └── process_json_files.py
├── frontend/                 # Next.js Frontend
│   ├── app/                 # Next.js 13+ app router
│   │   ├── api/            # API routes
│   │   ├── dava-dosyalarim/
│   │   ├── icra-dosyalarim/
│   │   │   ├── components/ # UI components
│   │   │   └── ...
│   │   └── layout.tsx
│   ├── components/          # General UI components
│   │   └── ui/             # Shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Helper libraries
│   ├── styles/             # CSS styles
│   ├── types/              # TypeScript type definitions
│   └── package.json        # Node.js dependencies
├── tests/                   # Test files
│   ├── backend/            # Backend tests
│   │   └── integration/    # Integration tests
│   ├── config/             # Test configurations
│   ├── frontend/           # Frontend tests
│   │   ├── e2e/           # End-to-end tests
│   │   ├── integration/    # Integration tests
│   │   └── mocks/         # Mock files
│   ├── shared/             # Shared test files
│   │   ├── fixtures/      # Test data
│   │   └── helpers/       # Test helpers
│   └── test_integration.py
├── start_services.sh       # Service startup script
└── stop_services.sh        # Service shutdown script
```

## 🚀 Installation and Setup

### 1. Requirements

- Python 3.8+
- Node.js 18+
- npm or pnpm

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
pip install -r api/requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
# or
pnpm install
```

### 4. Database Setup

```bash
cd database
python build_database.py
```

### 5. Starting Services

#### Automatic Startup (Recommended)
```bash
./start_services.sh
```

#### Manual Startup

**Terminal 1 - Backend API:**
```bash
cd backend
source venv/bin/activate
python api/api_endpoint.py
```

**Terminal 2 - Next.js Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **API Health Check:** http://localhost:5001/health

## 🔌 API Endpoints

### Main Endpoints

- `GET /api/icra-dosyalarim` - List all execution files
- `GET /api/icra-dosyalarim/{file_id}` - Get details of a specific file
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}` - Get debtor details
- `POST /api/uyap/trigger-sorgulama` - Trigger UYAP query

### Query Endpoints

- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/banka-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/dis-isleri-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/gib-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/sgk-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/telefon-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/adres-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/arac-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/gayrimenkul-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/iski-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/posta-ceki-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/sgk-haciz-sorgulama`
- `GET /api/icra-dosyalarim/{file_id}/{borclu_id}/alacakli-dosyalari`

### Example Usage

```bash
# List all files
curl http://localhost:5001/api/icra-dosyalarim

# Get details of a specific file
curl http://localhost:5001/api/icra-dosyalarim/1

# Get debtor details
curl http://localhost:5001/api/icra-dosyalarim/1/1_1

# Bank query
curl http://localhost:5001/api/icra-dosyalarim/1/1_1/banka-sorgulama
```

## 🔒 Security

- API CORS protection enabled
- SQL injection protection (parametrized queries)
- Error messages hidden in production
- Database connections managed securely
- UYAP integration with secure authentication

## 📊 Database Schema

### Main Tables

- `files` - Main execution file information
- `file_details` - File detail information
- `borclular` - Debtor information
- `borclu_sorgular` - Debtor query results

### Example Data Structure

> **Note**: The data shown in this example is completely fictional and does not belong to any real person. All names, identification numbers, addresses, and other personal information are made up for demonstration purposes only.

```json
{
  "klasor": "5",
  "dosyaNo": "2024/78901",
  "borcluAdi": "Ahmet Yılmaz, Fatma Yılmaz",
  "alacakliAdi": "ABC Teknoloji Ltd. Şti.",
  "foyTuru": "İlamlı İcra",
  "durum": "Derdest",
  "takipTarihi": "15.03.2024",
  "icraMudurlugu": "İstanbul 3. İcra Müdürlüğü",
  "takipSekli": "5 İlamsız Takiplerde Ödeme Emri - Eski No: 123",
  "takipYolu": "Genel Haciz Yoluyla Takip",
  "takipTuru": "İlamsız Takip",
  "alacakliVekili": "Av. Mehmet Kaya",
  "borcMiktari": "125.750,00 TL",
  "faizOrani": "%18 (Yıllık)",
  "borcluList": [
    {
      "ad": "Ahmet Yılmaz",
      "tcKimlik": "12345678901",
      "telefon": "0532 123 45 67",
      "adres": "ÇANKAYA MAH., 456 SK. No: 12/3 BEŞİKTAŞ/İSTANBUL",
      "vekil": "Av. Ayşe Demir",
      "Adres": {
        "sonuc": {
          "Kimlik Bilgileri": { /* ... */ },
          "Adres Bilgileri": { /* ... */ }
        }
      },
      "SGK": {
        "SSK Çalışanı": { /* ... */ },
        "Kamu Çalışanı": { /* ... */ },
        "SSK Emeklisi": { /* ... */ }
      },
      "EGM": {
        "Sonuc": [ /* ... */ ],
        "Araclar": [ /* ... */ ]
      },
      "Gayrimenkul": {
        "sonuc": [ /* ... */ ],
        "tasinmazlar": [ /* ... */ ]
      },
      "Banka": {
        "sonuc": [ /* ... */ ],
        "bankalar": [ /* ... */ ]
      },
      "Alacakli Dosyalari": {
        "sonuc": [ /* ... */ ],
        "icra_dosyalari": [ /* ... */ ]
      },
      "SGK Haciz": {
        "sonuc": [ /* ... */ ],
        "SGK kayit": [ /* ... */ ]
      },
      "Dis isler": {
        "sonuc": [ /* ... */ ]
      },
      "GIB": {
        "sonuc": [ /* ... */ ],
        "GİB Adres": [ /* ... */ ]
      },
      "GSM": {
        "sonuc": [ /* ... */ ],
        "GSM Adres": [ /* ... */ ]
      },
      "ISKI": {
        "sonuc": [ /* ... */ ]
      },
      "Posta Ceki": {
        "sonuc": [ /* ... */ ]
      }
    }
  ]
}
```

## 🧪 Testing

### Backend Tests

```bash
cd tests/backend
python -m pytest integration/
```

### Frontend Tests

```bash
cd tests/frontend
npm test
```

### E2E Tests

```bash
cd tests/frontend
npm run test:e2e
```

## 🛠️ Development

### Adding New API Endpoint

1. Create new route file under `backend/api/routes/`
2. Register the route in `backend/api/api_endpoint.py`
3. Define necessary service functions under `backend/services/`
4. Use the new endpoint in frontend

### Adding New Query Module

1. Create new query module under `backend/scrappers/queries/`
2. Use common functions in `sorgulama_common.py`
3. Add the relevant API route
4. Create new query component in frontend

### Database Changes

1. Update `database/datastructure.json` file
2. Run `database/build_database.py` script
3. Update relevant service functions

## 🐛 Troubleshooting

### Backend API Not Starting
- Ensure Python dependencies are installed
- Check that port 5001 is free
- Verify virtual environment is active

### Frontend Not Receiving Data
- Ensure backend API is running
- Check CORS settings
- Examine API calls in Network tab

### Database Connection Error
- Run `database/build_database.py` script
- Check that database file is readable
- Verify SQLite3 is installed

### UYAP Integration Issues
- Check that UYAP credentials are correct
- Review `backend/services/login_uyap.py` file
- Check network connection

## 📝 Notes

- Backend API runs on port 5001
- Frontend runs on port 3000
- All API calls are protected with CORS
- Appropriate HTTP status codes returned in error cases
- Valid credentials required for UYAP integration
- Test files provide comprehensive test coverage 