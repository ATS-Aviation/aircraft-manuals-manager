# Start Backend Server

$Host.UI.RawUI.WindowTitle = "Aircraft Manuals Manager - Backend"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path ".\backend")) {
    Write-Host "Error: Backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location backend

# Check if virtual environment exists
if (-not (Test-Path ".\venv")) {
    Write-Host "Error: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup-native.ps1 first." -ForegroundColor Yellow
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".\.env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating default .env file..." -ForegroundColor Yellow
    $envContent = @"
DATABASE_URL=postgresql://manuals_user:manuals_pass@localhost:5432/manuals_db
SECRET_KEY=change-this-to-a-random-secret-key-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@
    $envContent | Out-File -FilePath ".\.env" -Encoding UTF8
    Write-Host "  ✓ .env file created" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "Starting FastAPI server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend will be available at:" -ForegroundColor Green
Write-Host "  http://localhost:8000" -ForegroundColor Cyan
Write-Host "  http://localhost:8000/docs (API Documentation)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Cleanup on exit
Set-Location ..
