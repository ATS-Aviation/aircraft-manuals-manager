# Start Frontend Server

$Host.UI.RawUI.WindowTitle = "Aircraft Manuals Manager - Frontend"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend Server" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if frontend directory exists
if (-not (Test-Path ".\frontend")) {
    Write-Host "Error: Frontend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path ".\node_modules")) {
    Write-Host "Error: node_modules not found!" -ForegroundColor Red
    Write-Host "Please run setup-native.ps1 first." -ForegroundColor Yellow
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".\.env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating default .env file..." -ForegroundColor Yellow
    $envContent = "REACT_APP_API_URL=http://localhost:8000"
    $envContent | Out-File -FilePath ".\.env" -Encoding UTF8
    Write-Host "  ✓ .env file created" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting React development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend will be available at:" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Set environment variable to avoid automatic browser opening
$env:BROWSER = "none"

# Start the server
npm start

# Cleanup on exit
Set-Location ..
