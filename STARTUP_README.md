# Adalex Service Startup Guide

## Quick Start

To start all services (backend API and frontend development server) with a single command:

```bash
./start_service.sh
```

## What the script does:

1. **Checks Prerequisites**: Verifies that all required directories and dependencies exist
2. **Port Management**: Automatically kills any existing processes on ports 5001 (backend) and 3000 (frontend)
3. **Starts Backend**: Activates Python virtual environment and starts the Flask API server on port 5001
4. **Starts Frontend**: Runs the Next.js development server on port 3000
5. **Status Monitoring**: Provides colored status messages and confirms services are running
6. **Clean Shutdown**: Gracefully stops all services when you press Ctrl+C

## Services Started:

- **Backend API Server**: http://localhost:5001
- **Frontend Development Server**: http://localhost:3000

## Prerequisites:

Before running the script, ensure you have:

1. **Python 3.x** installed
2. **Node.js** and **npm** installed
3. **Backend dependencies** installed:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r api/requirements.txt
   ```
4. **Frontend dependencies** installed:
   ```bash
   cd frontend
   npm install
   ```

## Troubleshooting:

- If you get permission errors, make sure the script is executable:
  ```bash
  chmod +x start_service.sh
  ```

- If ports are already in use, the script will automatically attempt to kill existing processes

- If services fail to start, check the error messages for specific issues

## Manual Startup (Alternative):

If you prefer to start services manually:

**Backend:**
```bash
cd backend
source venv/bin/activate
python api/api_endpoint.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```
