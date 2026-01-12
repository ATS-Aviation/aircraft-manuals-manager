# Aircraft Manuals Manager - Stop Services Script

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Aircraft Manuals Manager - Stop Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker Compose version
$composeCommand = "docker compose"
try {
    docker compose version | Out-Null
} catch {
    try {
        docker-compose version | Out-Null
        $composeCommand = "docker-compose"
    } catch {
        Write-Host "ERROR: Docker Compose is not available!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Stopping all services..." -ForegroundColor Yellow
Write-Host ""

if ($composeCommand -eq "docker compose") {
    docker compose down
} else {
    docker-compose down
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  All services stopped successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start again, run: " -NoNewline
    Write-Host ".\start.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To remove all data (including database):" -ForegroundColor Yellow
    Write-Host "  $composeCommand down -v" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to stop services!" -ForegroundColor Red
    Write-Host "You may need to stop them manually." -ForegroundColor Yellow
    Write-Host ""
}
