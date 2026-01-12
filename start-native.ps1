# Aircraft Manuals Manager - Native Start Script
# Starts backend and frontend in separate PowerShell windows

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Aircraft Manuals Manager - Native Start" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$currentPath = Get-Location

# Check if setup has been run
$setupComplete = $true

if (-not (Test-Path ".\backend\venv")) {
    Write-Host "Error: Backend virtual environment not found!" -ForegroundColor Red
    $setupComplete = $false
}

if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "Error: Frontend node_modules not found!" -ForegroundColor Red
    $setupComplete = $false
}

if (-not $setupComplete) {
    Write-Host ""
    Write-Host "Please run setup-native.ps1 first:" -ForegroundColor Yellow
    Write-Host "  .\setup-native.ps1" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgTest = psql -U postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ PostgreSQL is running" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Could not verify PostgreSQL status" -ForegroundColor Yellow
    Write-Host "    Make sure PostgreSQL is running and database is created" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start Backend in new window
Write-Host "Starting Backend server..." -ForegroundColor Yellow
$backendScript = Join-Path $currentPath "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`"" -WorkingDirectory $currentPath

Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "Starting Frontend server..." -ForegroundColor Yellow
$frontendScript = Join-Path $currentPath "start-frontend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`"" -WorkingDirectory $currentPath

Write-Host ""
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two PowerShell windows have been opened:" -ForegroundColor White
Write-Host "  1. Backend server  (FastAPI)" -ForegroundColor Gray
Write-Host "  2. Frontend server (React)" -ForegroundColor Gray
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Yellow
Write-Host "  Frontend:  " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:   " -NoNewline
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs:  " -NoNewline
Write-Host "http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Username: " -NoNewline
Write-Host "admin" -ForegroundColor Cyan
Write-Host "  Password: " -NoNewline
Write-Host "admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the servers:" -ForegroundColor Yellow
Write-Host "  - Press Ctrl+C in each PowerShell window, or" -ForegroundColor Gray
Write-Host "  - Close the PowerShell windows" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Wait for backend to be ready
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "  ✓ Backend is ready!" -ForegroundColor Green
        }
    } catch {
        Start-Sleep -Seconds 1
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host ""
    Write-Host "  ⚠ Backend took longer than expected to start" -ForegroundColor Yellow
    Write-Host "    Check the Backend PowerShell window for errors" -ForegroundColor Gray
}

# Wait for frontend to be ready
Write-Host "Waiting for frontend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$frontendReady = $false
$attempt = 0

while ($attempt -lt $maxAttempts -and -not $frontendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "  ✓ Frontend is ready!" -ForegroundColor Green
        }
    } catch {
        Start-Sleep -Seconds 1
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

Write-Host ""

if ($frontendReady -and $backendReady) {
    Write-Host ""
    Write-Host "All services are ready! Opening browser..." -ForegroundColor Green
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} elseif ($backendReady) {
    Write-Host "  ⚠ Frontend is starting up (may take a minute)" -ForegroundColor Yellow
    Write-Host "    Check the Frontend PowerShell window for progress" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} else {
    Write-Host "  ⚠ Services are starting up" -ForegroundColor Yellow
    Write-Host "    Check both PowerShell windows for any errors" -ForegroundColor Gray
    Write-Host "    You can manually open: http://localhost:3000" -ForegroundColor Gray
}

Write-Host ""
Write-Host "This window can be closed. The services will continue running." -ForegroundColor Gray
Write-Host ""
