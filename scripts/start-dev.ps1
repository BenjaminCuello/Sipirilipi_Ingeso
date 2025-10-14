<#
starts dev environment for the project (backend + frontend)
Usage: Open PowerShell as needed and run:
  powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1

What it does:
- ensures you're on branch Sprint1---Bastian
- checks Postgres on localhost:5433 and starts a Docker container if missing
- installs npm deps for backend and frontend if needed
- runs prisma migrate dev in backend
- launches backend and frontend in new PowerShell windows
- performs a health check on http://127.0.0.1:4000/api/health
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log($msg) { Write-Host "[start-dev] $msg" }

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repoRoot

Write-Log "Checking git branch..."
try {
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
} catch {
  Write-Log "Git not available or not a repo: $_"
  $branch = ''
}
if ($branch -ne 'Sprint1---Bastian') {
  Write-Log "Switching to branch Sprint1---Bastian"
  git fetch origin
  git checkout Sprint1---Bastian
}

# Postgres check
$pgPort = 5433
Write-Log "Checking Postgres on port $pgPort..."
if (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port $pgPort -WarningAction SilentlyContinue).TcpTestSucceeded) {
  if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Log "Postgres not reachable; attempting to start Docker container 'sipiri-pg'..."
    $exists = docker ps -a --format '{{.Names}}' | Select-String '^sipiri-pg$'
    if (-not $exists) {
      docker run --name sipiri-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pyme -p 5433:5432 -d postgres:15 | Out-Null
      Write-Log "Started docker container 'sipiri-pg'"
    } else {
      docker start sipiri-pg | Out-Null
      Write-Log "Started existing container 'sipiri-pg'"
    }
    Write-Log "Waiting for Postgres to accept connections..."
    while (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port $pgPort -WarningAction SilentlyContinue).TcpTestSucceeded) { Write-Host -NoNewline '.'; Start-Sleep -Seconds 1 }
    Write-Host
    Write-Log "Postgres is up"
  } else {
    Write-Log "Postgres not reachable and Docker not found. Please start Postgres on port $pgPort or install Docker. Exiting."
    exit 1
  }
} else {
  Write-Log "Postgres reachable"
}

# Install backend deps
Write-Log "Installing backend dependencies if needed..."
if (-not (Test-Path "$repoRoot\backend\node_modules")) {
  Push-Location "$repoRoot\backend"; npm install; Pop-Location
} else { Write-Log "backend/node_modules exists, skipping npm install" }

# Install frontend deps
Write-Log "Installing frontend dependencies if needed..."
if (-not (Test-Path "$repoRoot\frontend\node_modules")) {
  Push-Location "$repoRoot\frontend"; npm install; Pop-Location
} else { Write-Log "frontend/node_modules exists, skipping npm install" }

# Run prisma migrate dev
Write-Log "Applying Prisma migrations (prisma migrate dev)..."
Push-Location "$repoRoot\backend"
npx prisma migrate dev --schema prisma\schema.prisma
Pop-Location

# Launch backend in new PowerShell window
Write-Log "Launching backend in a new window..."
Start-Process -FilePath 'powershell' -ArgumentList "-NoExit","-Command","Set-Location '$repoRoot\\backend'; npm run dev" -WindowStyle Normal

# Launch frontend in new PowerShell window
Write-Log "Launching frontend in a new window..."
Start-Process -FilePath 'powershell' -ArgumentList "-NoExit","-Command","Set-Location '$repoRoot\\frontend'; npm run dev" -WindowStyle Normal

Write-Log "Waiting 5 seconds for servers to come up..."
Start-Sleep -Seconds 5

Write-Log "Checking backend health endpoint..."
try {
  $res = Invoke-RestMethod http://127.0.0.1:4000/api/health -TimeoutSec 5 -ErrorAction Stop
  Write-Log "Health OK: $($res | ConvertTo-Json -Compress)"
} catch {
  Write-Log "Health check failed: $_"
}

Write-Log "All done. Frontend: http://localhost:5173 | Backend: http://localhost:4000"
Write-Log "If the UI doesn't show products, create one via the 'Nuevo producto' button or via API POST to /api/products"
