Param(
    [switch]$UseDocker
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "[demo] Starting Sipirilipi demo..." -ForegroundColor Cyan

if ($UseDocker) {
    Write-Host "[demo] Using docker-compose.dev.yml" -ForegroundColor Cyan
    docker compose -f "docker-compose.dev.yml" up --build
    return
}

# Helper to run a command in a given working directory
function Invoke-InDir {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Command
    )
    Push-Location $Path
    try {
        Write-Host "[demo] $Path > $Command" -ForegroundColor Yellow
        iex $Command
    }
    finally {
        Pop-Location
    }
}

# Start backend (installs deps, runs migrations + seed y luego levanta API)
Start-Job -ScriptBlock {
    $root = Split-Path $MyInvocation.MyCommand.Path -Parent
    Set-Location (Join-Path $root "..\backend")
    Write-Host "[demo] Backend starting..." -ForegroundColor Cyan
    npm run demo
} | Out-Null

Start-Sleep -Seconds 5

# Start frontend (Vite dev server)
Start-Job -ScriptBlock {
    $root = Split-Path $MyInvocation.MyCommand.Path -Parent
    Set-Location (Join-Path $root "..\frontend")
    Write-Host "[demo] Frontend starting..." -ForegroundColor Cyan
    npm run dev
} | Out-Null

Write-Host "[demo] Backend on http://localhost:4000/api" -ForegroundColor Green
Write-Host "[demo] Frontend on http://localhost:5173" -ForegroundColor Green
Write-Host "[demo] Use Get-Job / Receive-Job to see logs, or stop jobs with Stop-Job / Remove-Job." -ForegroundColor DarkGray

