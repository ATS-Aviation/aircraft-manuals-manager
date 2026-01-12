# Aircraft Manuals Manager - PowerShell Deployment Script

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Aircraft Manuals Manager - Quick Start" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop for Windows from:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Try docker compose (V2) first, then fall back to docker-compose (V1)
$composeCommand = "docker compose"
try {
    docker compose version | Out-Null
    Write-Host "Using Docker Compose V2" -ForegroundColor Green
} catch {
    try {
        docker-compose version | Out-Null
        $composeCommand = "docker-compose"
        Write-Host "Using Docker Compose V1" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Docker Compose is not available!" -ForegroundColor Red
        exit 1
    }
}

# Start services
Write-Host ""
Write-Host "Executing: $composeCommand up -d" -ForegroundColor Yellow
if ($composeCommand -eq "docker compose") {
    docker compose up -d
} else {
    docker-compose up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to start services!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if containers are running
Write-Host ""
Write-Host "Checking container status..." -ForegroundColor Yellow
if ($composeCommand -eq "docker compose") {
    docker compose ps
} else {
    docker-compose ps
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Services Started Successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at: " -NoNewline
Write-Host "http://localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Yellow
Write-Host "  Username: " -NoNewline -ForegroundColor White
Write-Host "admin" -ForegroundColor Cyan
Write-Host "  Password: " -NoNewline -ForegroundColor White
Write-Host "admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:        " -NoNewline -ForegroundColor White
Write-Host "$composeCommand logs -f" -ForegroundColor Cyan
Write-Host "  Stop services:    " -NoNewline -ForegroundColor White
Write-Host "$composeCommand down" -ForegroundColor Cyan
Write-Host "  Restart services: " -NoNewline -ForegroundColor White
Write-Host "$composeCommand restart" -ForegroundColor Cyan
Write-Host "  View status:      " -NoNewline -ForegroundColor White
Write-Host "$composeCommand ps" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to open the application in your browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost"
