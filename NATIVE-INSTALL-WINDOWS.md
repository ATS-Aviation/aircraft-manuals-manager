# Native Installation on Windows (Without Docker)

This guide will help you install and run the Aircraft Manuals Manager directly on Windows without Docker.

## Prerequisites

You'll need to install the following software:

1. **Python 3.11+** - For the backend
2. **Node.js 18+** - For the frontend
3. **PostgreSQL 15+** - For the database
4. **Git** (optional) - For version control

## Installation Steps

### Step 1: Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (recommended: PostgreSQL 15 or 16)
3. During installation:
   - Remember the password you set for the `postgres` user
   - Default port: 5432
   - Install pgAdmin 4 (optional, for database management)

4. After installation, create the database:
   - Open **SQL Shell (psql)** from Start menu
   - Login with the postgres user
   - Run these commands:

```sql
CREATE DATABASE manuals_db;
CREATE USER manuals_user WITH PASSWORD 'manuals_pass';
GRANT ALL PRIVILEGES ON DATABASE manuals_db TO manuals_user;
\q
```

### Step 2: Install Python

1. Download Python from: https://www.python.org/downloads/
2. Run the installer
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. Verify installation:
```powershell
python --version
pip --version
```

### Step 3: Install Node.js

1. Download Node.js from: https://nodejs.org/
2. Run the installer (LTS version recommended)
3. Verify installation:
```powershell
node --version
npm --version
```

### Step 4: Setup Backend

1. Open PowerShell and navigate to the backend directory:
```powershell
cd path\to\aircraft-manuals-manager\backend
```

2. Create a virtual environment:
```powershell
python -m venv venv
```

3. Activate the virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```

4. Install dependencies:
```powershell
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://manuals_user:manuals_pass@localhost:5432/manuals_db
SECRET_KEY=your-secret-key-change-this-in-production-use-32-chars-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Step 5: Setup Frontend

1. Open a NEW PowerShell window and navigate to the frontend directory:
```powershell
cd path\to\aircraft-manuals-manager\frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

### Step 6: Start the Application

You have two options:

#### Option A: Use the Automated Script (Recommended)

Simply run:
```powershell
.\start-native.ps1
```

This will start all services automatically in separate windows.

#### Option B: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Step 7: Login

**Default Credentials:**
- Username: `admin`
- Password: `admin`

⚠️ Change the admin password after first login!

## Stopping the Application

- Press `Ctrl+C` in each terminal window
- Or close the PowerShell windows

## Troubleshooting

### PostgreSQL Connection Error

If you get "could not connect to server":
1. Verify PostgreSQL is running:
   - Open Services (services.msc)
   - Find "postgresql-x64-15" (or your version)
   - Make sure it's "Running"

2. Check your connection details in `.env` file
3. Test connection:
```powershell
psql -U manuals_user -d manuals_db -h localhost
```

### Python Virtual Environment Issues

If `.\venv\Scripts\Activate.ps1` fails:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

If port 8000 or 3000 is in use:

**Find what's using the port:**
```powershell
netstat -ano | findstr :8000
```

**Kill the process:**
```powershell
taskkill /PID <process_id> /F
```

### Module Not Found Errors

Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Frontend:
```powershell
cd frontend
npm install
```

## Database Management

### Backup Database
```powershell
pg_dump -U manuals_user -d manuals_db -f backup.sql
```

### Restore Database
```powershell
psql -U manuals_user -d manuals_db -f backup.sql
```

### Reset Database
```sql
-- In psql:
DROP DATABASE manuals_db;
CREATE DATABASE manuals_db;
GRANT ALL PRIVILEGES ON DATABASE manuals_db TO manuals_user;
```

## Performance

Native installation is generally faster than Docker because:
- No virtualization overhead
- Direct filesystem access
- Lower memory usage
- Faster startup times

## Development Mode

Both backend and frontend run in development mode by default:
- Backend: Auto-reloads on code changes (--reload flag)
- Frontend: Hot module replacement enabled

## Production Deployment

For production on Windows Server:

1. Use production WSGI server for backend:
```powershell
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

2. Build frontend for production:
```powershell
npm run build
```

3. Use IIS or Nginx to serve the built frontend and proxy to backend

4. Set up PostgreSQL with proper security settings

5. Use Windows Service to run backend automatically

## Nginx Setup (Optional)

If you want to set up Nginx on Windows:

1. Download Nginx for Windows: http://nginx.org/en/download.html
2. Extract to `C:\nginx`
3. Configure `C:\nginx\conf\nginx.conf` to proxy requests
4. Start Nginx:
```powershell
cd C:\nginx
start nginx
```

## Advantages of Native Installation

✅ Faster performance
✅ Direct access to all system resources
✅ Easier debugging
✅ Better for development
✅ Lower memory usage

## Disadvantages

❌ More complex initial setup
❌ Harder to replicate environment
❌ Manual dependency management
❌ Potential conflicts with other software

---

**Need help?** Check the logs in each terminal window for error messages.
