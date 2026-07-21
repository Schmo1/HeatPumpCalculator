<#
.SYNOPSIS
  Behebt den Docker-Desktop-Startfehler "initializing Inference manager / secrets-engine:
  remove ...\engine.sock: The file cannot be accessed by the system".

.DESCRIPTION
  Ursache sind verwaiste AF_UNIX-Socket-Dateien, die Windows nach einem unsauberen
  Docker-Beenden nicht mehr löschen kann. Sie liegen in
    %LOCALAPPDATA%\Docker\run
    %LOCALAPPDATA%\docker-secrets-engine
  Die Dateien selbst lassen sich nicht löschen – wohl aber die enthaltenden Verzeichnisse
  umbenennen. Docker legt sie beim nächsten Start neu an.

  Das Skript: beendet Docker + WSL, benennt die betroffenen Verzeichnisse in *.brokenN um
  und startet Docker Desktop neu.

.NOTES
  Tipp gegen Wiederkehr: Docker Desktop möglichst über das Tray-Icon -> "Quit Docker Desktop"
  sauber beenden, statt den Prozess hart zu killen oder den Rechner im laufenden Zustand
  abzuschalten.
#>

Write-Host "Beende Docker-Prozesse und WSL..." -ForegroundColor Cyan
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
      Write-Host "  $leaf konnte nicht umbenannt werden: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

Write-Host "Starte Docker Desktop neu..." -ForegroundColor Cyan
Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"

Write-Host "Warte auf den Docker-Daemon..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 6
  docker info *> $null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
}

if ($ready) {
  Write-Host "Docker ist bereit. Du kannst jetzt 'docker compose up -d' ausfuehren." -ForegroundColor Green
} else {
  Write-Host "Docker ist noch nicht bereit - bitte kurz warten und 'docker info' erneut pruefen." -ForegroundColor Yellow
}

# Aufraeumen der harmlosen *.broken-Ordner (enthalten die nicht loeschbaren Sockets) ist
# optional; sie stoeren nicht und koennen manuell entfernt werden, sobald Windows das zulaesst.
