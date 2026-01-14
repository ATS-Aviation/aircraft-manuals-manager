# Running Database Migrations on Windows

This guide explains how to initialize and migrate the database for the Aircraft Manuals Manager on Windows.

## Prerequisites

- Python 3.10+ installed
- PostgreSQL installed and running (or Docker)
- Project dependencies installed

## Option 1: Using Docker (Recommended)

If you're running the application with Docker, migrations are handled automatically when the containers start.

### Run Migrations Manually in Docker

```powershell
# Make sure containers are running
docker compose up -d

# Run the database initialization script
docker compose exec backend python init_db.py
```

### Reset Database (Docker)

```powershell
# Stop and remove containers with volumes
docker compose down -v

# Start fresh
docker compose up -d
```

## Option 2: Native Windows Installation

### Step 1: Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and remember your password
3. Add PostgreSQL to PATH (usually `C:\Program Files\PostgreSQL\16\bin`)

### Step 2: Create the Database

Open PowerShell and run:

```powershell
# Connect to PostgreSQL (you'll be prompted for the postgres password)
psql -U postgres

# In the psql prompt, create database and user:
CREATE DATABASE manuals_db;
CREATE USER manuals_user WITH PASSWORD 'manuals_pass';
GRANT ALL PRIVILEGES ON DATABASE manuals_db TO manuals_user;
\c manuals_db
GRANT ALL ON SCHEMA public TO manuals_user;
\q
```

### Step 3: Set Up Python Environment

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder or set environment variables:

```powershell
# Option A: Create .env file
Copy-Item .env.example .env

# Edit the .env file with your database credentials
notepad .env
```

Or set environment variables directly in PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://manuals_user:manuals_pass@localhost:5432/manuals_db"
$env:SECRET_KEY = "your-secret-key-min-32-characters-long"
```

### Step 5: Run Migrations

```powershell
# Make sure you're in the backend directory with venv activated
cd backend
.\venv\Scripts\Activate

# Run the database initialization script
python init_db.py
```

Expected output:
```
Admin user created: username=admin, password=admin
```

Or if already initialized:
```
Admin user already exists
```

## Troubleshooting

### Connection Refused Error

If you see `connection refused`:

1. Make sure PostgreSQL service is running:
   ```powershell
   # Check PostgreSQL service status
   Get-Service -Name postgresql*

   # Start the service if stopped
   Start-Service -Name postgresql-x64-16
   ```

2. Verify PostgreSQL is listening on port 5432:
   ```powershell
   netstat -an | findstr 5432
   ```

### Authentication Failed

If you see `authentication failed`:

1. Check your `.env` file has the correct credentials
2. Verify the user was created in PostgreSQL:
   ```powershell
   psql -U postgres -c "\du"
   ```

### Database Does Not Exist

If you see `database "manuals_db" does not exist`:

```powershell
psql -U postgres -c "CREATE DATABASE manuals_db;"
```

### Permission Denied

If you see permission errors:

```powershell
psql -U postgres -d manuals_db -c "GRANT ALL ON SCHEMA public TO manuals_user;"
psql -U postgres -d manuals_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO manuals_user;"
```

### Module Not Found Error

If you see `ModuleNotFoundError`:

```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Verifying the Migration

After running migrations, verify the tables were created:

### Using Docker

```powershell
docker compose exec db psql -U manuals_user -d manuals_db -c "\dt"
```

### Native Installation

```powershell
psql -U manuals_user -d manuals_db -c "\dt"
```

Expected tables:
- `users`
- `customers`
- `aircraft`
- `manual_apps`

## Re-running Migrations

The `init_db.py` script is idempotent - it's safe to run multiple times:

- Tables are created using `create_all()` which skips existing tables
- The admin user is only created if it doesn't exist

To completely reset and re-run:

```powershell
# Drop and recreate database
psql -U postgres -c "DROP DATABASE manuals_db;"
psql -U postgres -c "CREATE DATABASE manuals_db;"
psql -U postgres -d manuals_db -c "GRANT ALL ON SCHEMA public TO manuals_user;"

# Run migrations again
python init_db.py
```

## Default Admin Credentials

After successful migration, you can log in with:

- **Username:** `admin`
- **Password:** `admin`

**Important:** Change the admin password after first login!
