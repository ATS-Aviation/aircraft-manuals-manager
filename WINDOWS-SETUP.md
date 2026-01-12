# Windows Setup Guide

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and restart your computer
   - Start Docker Desktop and wait for it to be ready
   - Verify installation by opening PowerShell and running: `docker --version`

2. **System Requirements**
   - Windows 10 64-bit (Pro, Enterprise, or Education) or Windows 11
   - WSL 2 feature enabled (Docker Desktop will help you enable this)
   - At least 4GB RAM available
   - Ports 80, 3000, 8000, and 5432 must be available

## Quick Start

### Step 1: Open PowerShell

Right-click on the Windows Start button and select **"Windows PowerShell"** or **"Terminal"**

### Step 2: Navigate to the Project Directory

```powershell
cd path\to\aircraft-manuals-manager
```

### Step 3: Allow Script Execution (First Time Only)

If this is your first time running PowerShell scripts, you may need to enable script execution:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Press **Y** when prompted.

### Step 4: Run the Start Script

```powershell
.\start.ps1
```

This will:
- Check if Docker is installed and running
- Start all services (Database, Backend, Frontend, Nginx)
- Wait for services to be ready
- Display access information
- Open the application in your browser

### Step 5: Access the Application

The script will automatically open http://localhost in your browser, or you can manually navigate to:

**URL:** http://localhost

**Default Credentials:**
- Username: `admin`
- Password: `admin`

⚠️ **Important:** Change the admin password after first login!

## Stopping the Services

To stop all services:

```powershell
.\stop.ps1
```

## Troubleshooting

### Script Execution Error

If you get an error like "cannot be loaded because running scripts is disabled":

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Try running the script again

### Docker Not Running

If you get "Docker is not running":

1. Open Docker Desktop from the Start menu
2. Wait for it to fully start (whale icon in system tray should be steady)
3. Run the script again

### Port Already in Use

If port 80 is already in use (common with IIS or other web servers):

1. **Option A:** Stop the conflicting service:
   ```powershell
   # Stop IIS if running
   iisreset /stop
   ```

2. **Option B:** Change the port in `docker-compose.yml`:
   ```yaml
   nginx:
     ports:
       - "8080:80"  # Change 80 to 8080
   ```
   Then access via http://localhost:8080

### WSL 2 Issues

If Docker Desktop shows WSL 2 errors:

1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart your computer
4. Start Docker Desktop again

## Manual Docker Commands

If you prefer to use Docker commands directly:

### Start Services
```powershell
docker compose up -d
```

### View Logs
```powershell
docker compose logs -f
```

### Stop Services
```powershell
docker compose down
```

### View Running Containers
```powershell
docker compose ps
```

### Restart a Specific Service
```powershell
docker compose restart backend
# or frontend, nginx, db
```

## Useful PowerShell Commands

### Check if Docker is Running
```powershell
docker ps
```

### View All Containers
```powershell
docker ps -a
```

### Remove All Stopped Containers
```powershell
docker compose down -v
```

### View Container Logs
```powershell
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
docker compose logs db
```

### Access Backend API Directly
Open in browser: http://localhost:8000/docs

### Access Frontend Directly
Open in browser: http://localhost:3000

## Development on Windows

### Backend Development
```powershell
cd backend
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://manuals_user:manuals_pass@localhost:5432/manuals_db"
$env:SECRET_KEY="change-this-to-a-random-secret-key"
uvicorn app.main:app --reload
```

### Frontend Development
```powershell
cd frontend
npm install
npm start
```

## Database Backup (Windows)

### Backup
```powershell
docker exec manuals-db pg_dump -U manuals_user manuals_db > backup.sql
```

### Restore
```powershell
Get-Content backup.sql | docker exec -i manuals-db psql -U manuals_user manuals_db
```

## Firewall Settings

If you need to access the application from other devices on your network:

1. Open **Windows Defender Firewall**
2. Click **"Advanced settings"**
3. Add an **Inbound Rule** for port 80 (or your custom port)
4. Allow the connection

## Performance Tips

1. **Enable WSL 2:** Make sure Docker Desktop is using WSL 2 backend (Settings > General)
2. **Allocate Resources:** In Docker Desktop Settings > Resources, allocate at least:
   - 2 CPUs
   - 4GB RAM
3. **Disable Antivirus Scanning:** Add the project folder to your antivirus exclusions for better performance

## Getting Help

### Check Service Status
```powershell
docker compose ps
```

### View Recent Logs
```powershell
docker compose logs --tail=50
```

### Restart Everything
```powershell
docker compose restart
```

### Complete Reset
```powershell
docker compose down -v
.\start.ps1
```

---

**Need more help?** Check the main README.md for detailed architecture and API documentation.
