# Quick Start - Native Installation

## Prerequisites Installation

### 1. Install Python 3.11+
- Download: https://www.python.org/downloads/
- ✅ Check "Add Python to PATH" during installation

### 2. Install Node.js 18+
- Download: https://nodejs.org/ (LTS version)

### 3. Install PostgreSQL 15+
- Download: https://www.postgresql.org/download/windows/
- Remember the password you set for `postgres` user

## Database Setup

Open **SQL Shell (psql)** from Start menu and run:

```sql
CREATE DATABASE manuals_db;
CREATE USER manuals_user WITH PASSWORD 'manuals_pass';
GRANT ALL PRIVILEGES ON DATABASE manuals_db TO manuals_user;
\q
```

## Application Setup

Open PowerShell in the project directory:

### 1. Allow Script Execution (First Time)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Run Setup
```powershell
.\setup-native.ps1
```

This will:
- Check all prerequisites
- Create Python virtual environment
- Install backend dependencies
- Install frontend dependencies
- Create .env configuration files

### 3. Start the Application
```powershell
.\start-native.ps1
```

This will:
- Start backend server (port 8000)
- Start frontend server (port 3000)
- Open browser automatically

## Access the Application

**URL:** http://localhost:3000

**Default Login:**
- Username: `admin`
- Password: `admin`

## Stopping the Application

- Press `Ctrl+C` in each PowerShell window
- Or simply close the PowerShell windows

## Troubleshooting

### "Script cannot be loaded"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PostgreSQL not running
- Open Services (`services.msc`)
- Find "postgresql-x64-15" (or your version)
- Start the service

### Port already in use
```powershell
# Find process using port 8000 or 3000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

### Backend database connection error
Check if:
1. PostgreSQL service is running
2. Database and user were created
3. Connection details in `backend\.env` are correct

Test connection:
```powershell
psql -U manuals_user -d manuals_db -h localhost
```

## Manual Start (Alternative)

If you prefer to start services manually:

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

## Useful Commands

### View Backend API Documentation
http://localhost:8000/docs

### Reinstall Backend Dependencies
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Reinstall Frontend Dependencies
```powershell
cd frontend
npm install
```

### Database Backup
```powershell
pg_dump -U manuals_user -d manuals_db -f backup.sql
```

### Database Restore
```powershell
psql -U manuals_user -d manuals_db -f backup.sql
```

## File Structure

```
aircraft-manuals-manager/
├── backend/
│   ├── venv/                 # Python virtual environment
│   ├── .env                  # Backend configuration
│   └── ...
├── frontend/
│   ├── node_modules/         # Node dependencies
│   ├── .env                  # Frontend configuration
│   └── ...
├── setup-native.ps1          # Setup script
├── start-native.ps1          # Start all services
├── start-backend.ps1         # Start backend only
├── start-frontend.ps1        # Start frontend only
└── NATIVE-INSTALL-WINDOWS.md # Detailed guide
```

## Next Steps

After successful login:
1. Change admin password
2. Add customers/airlines
3. Add aircraft types
4. Configure manual applications

For detailed information, see `NATIVE-INSTALL-WINDOWS.md`
