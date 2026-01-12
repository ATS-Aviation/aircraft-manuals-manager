# Aircraft Manuals Manager - Native Setup Script for Windows
# This script checks prerequisites and sets up the development environment

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Aircraft Manuals Manager - Native Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$script:hasErrors = $false

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
if (Test-Command python) {
    $pythonVersion = python --version
    Write-Host "  ✓ $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python not found!" -ForegroundColor Red
    Write-Host "    Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "    Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    $script:hasErrors = $true
}

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    Write-Host "    Download from: https://nodejs.org/" -ForegroundColor Yellow
    $script:hasErrors = $true
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "  ✓ npm $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found!" -ForegroundColor Red
    Write-Host "    npm should come with Node.js" -ForegroundColor Yellow
    $script:hasErrors = $true
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
if (Test-Command psql) {
    $pgVersion = psql --version
    Write-Host "  ✓ $pgVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "    Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "    After installation, add PostgreSQL bin to PATH" -ForegroundColor Yellow
    $script:hasErrors = $true
}

if ($script:hasErrors) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  Please install missing prerequisites" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "All prerequisites are installed!" -ForegroundColor Green
Write-Host ""

# Setup Backend
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setting up Backend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".\backend") {
    Set-Location backend

    # Create virtual environment if it doesn't exist
    if (-not (Test-Path ".\venv")) {
        Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
        python -m venv venv
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Virtual environment created" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to create virtual environment" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
    } else {
        Write-Host "  ✓ Virtual environment already exists" -ForegroundColor Green
    }

    # Activate virtual environment and install dependencies
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    Write-Host "  (This may take a few minutes)" -ForegroundColor Gray

    & .\venv\Scripts\Activate.ps1
    pip install --upgrade pip --quiet
    pip install -r requirements.txt

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }

    # Create .env file if it doesn't exist
    if (-not (Test-Path ".\.env")) {
        Write-Host "Creating backend .env file..." -ForegroundColor Yellow
        $envContent = @"
DATABASE_URL=postgresql://manuals_user:manuals_pass@localhost:5432/manuals_db
SECRET_KEY=change-this-to-a-random-secret-key-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@
        $envContent | Out-File -FilePath ".\.env" -Encoding UTF8
        Write-Host "  ✓ Backend .env file created" -ForegroundColor Green
        Write-Host "  ⚠ Please review and update the SECRET_KEY in backend\.env" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Backend .env file already exists" -ForegroundColor Green
    }

    Set-Location ..
} else {
    Write-Host "  ✗ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup Frontend
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setting up Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".\frontend") {
    Set-Location frontend

    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    Write-Host "  (This may take a few minutes)" -ForegroundColor Gray

    npm install

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Node.js dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }

    # Create .env file if it doesn't exist
    if (-not (Test-Path ".\.env")) {
        Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
        $envContent = "REACT_APP_API_URL=http://localhost:8000"
        $envContent | Out-File -FilePath ".\.env" -Encoding UTF8
        Write-Host "  ✓ Frontend .env file created" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Frontend .env file already exists" -ForegroundColor Green
    }

    Set-Location ..
} else {
    Write-Host "  ✗ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Setup PostgreSQL Database:" -ForegroundColor White
Write-Host "   Open SQL Shell (psql) and run:" -ForegroundColor Gray
Write-Host "   CREATE DATABASE manuals_db;" -ForegroundColor Cyan
Write-Host "   CREATE USER manuals_user WITH PASSWORD 'manuals_pass';" -ForegroundColor Cyan
Write-Host "   GRANT ALL PRIVILEGES ON DATABASE manuals_db TO manuals_user;" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Update the SECRET_KEY in backend\.env" -ForegroundColor White
Write-Host ""
Write-Host "3. Start the application:" -ForegroundColor White
Write-Host "   .\start-native.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see NATIVE-INSTALL-WINDOWS.md" -ForegroundColor Gray
Write-Host ""
