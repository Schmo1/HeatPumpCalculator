<#
.SYNOPSIS
  Fixes the Docker Desktop startup error "initializing Inference manager / secrets-engine:
  remove ...\engine.sock: The file cannot be accessed by the system".

.DESCRIPTION
  The cause is orphaned AF_UNIX socket files that Windows can no longer delete after an
  unclean Docker shutdown. They are located in
    %LOCALAPPDATA%\Docker\run
    %LOCALAPPDATA%\docker-secrets-engine
  The files themselves cannot be deleted – but the containing directories can be
  renamed. Docker recreates them on the next start.

  The script: stops Docker + WSL, renames the affected directories to *.brokenN
  and restarts Docker Desktop.

.NOTES
  Tip to avoid recurrence: shut down Docker Desktop cleanly via the tray icon ->
  "Quit Docker Desktop" instead of hard-killing the process or shutting down the
  machine while it is running.
#>

Write-Host "Stopping Docker processes and WSL..." -ForegroundColor Cyan
Get-Process "*docker*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
wsl --shutdown 2>&1 | Out-Null
Start-Sleep -Seconds 5

$targets = @(
  "$env:LOCALAPPDATA\Docker\run",
  "$env:LOCALAPPDATA\docker-secrets-engine"
)

foreach ($base in $targets) {
  if (Test-Path $base) {
    $parent = Split-Path $base
    $leaf   = Split-Path $base -Leaf
    $i = 1
    while (Test-Path (Join-Path $parent "$leaf.broken$i")) { $i++ }
    try {
      Rename-Item -LiteralPath $base -NewName "$leaf.broken$i" -ErrorAction Stop
      Write-Host "  $leaf -> $leaf.broken$i" -ForegroundColor Green
    } catch {
      Write-Host "  $leaf could not be renamed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

Write-Host "Restarting Docker Desktop..." -ForegroundColor Cyan
Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"

Write-Host "Waiting for the Docker daemon..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 6
  docker info *> $null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
}

if ($ready) {
  Write-Host "Docker is ready. You can now run 'docker compose up -d'." -ForegroundColor Green
} else {
  Write-Host "Docker is not ready yet - please wait a moment and check 'docker info' again." -ForegroundColor Yellow
}

# Cleaning up the harmless *.broken folders (which contain the undeletable sockets) is
# optional; they do no harm and can be removed manually once Windows allows it.
