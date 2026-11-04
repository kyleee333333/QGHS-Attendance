$ErrorActionPreference = "Continue"
Write-Host "QGHS CONNECT - Windows 11 launch readiness check" -ForegroundColor Cyan
Write-Host "This script only checks prerequisites; it does not install software or modify student data."

function Check-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { Write-Host "[MISSING] $name" -ForegroundColor Red; return }
  try { $v = & $name --version 2>&1 | Select-Object -First 1; Write-Host "[FOUND] $name : $v" -ForegroundColor Green }
  catch { Write-Host "[FOUND] $name (version check failed)" -ForegroundColor Yellow }
}
Check-Command "node"
Check-Command "npm"
Check-Command "pnpm"
Check-Command "git"

Write-Host "64-bit Microsoft Access ODBC driver:" -ForegroundColor Cyan
$driverKey = "HKLM:\SOFTWARE\ODBC\ODBCINST.INI\ODBC Drivers"
try {
  $drivers = Get-ItemProperty -Path $driverKey -ErrorAction Stop
  $driver = $drivers.PSObject.Properties | Where-Object { $_.Name -like "*Access Driver*" }
  if ($driver) { $driver | ForEach-Object { Write-Host "[FOUND] $($_.Name) = $($_.Value)" -ForegroundColor Green } }
  else { Write-Host "[MISSING] Microsoft Access ODBC driver (64-bit)" -ForegroundColor Red }
} catch { Write-Host "[MISSING] Could not read 64-bit ODBC driver registry key" -ForegroundColor Red }

Write-Host "Repository status:" -ForegroundColor Cyan
if (Test-Path ".git") { git status --short; git branch --show-current }
else { Write-Host "[INFO] Run this script from the cloned repository root." -ForegroundColor Yellow }

Write-Host "Next: run pnpm install, pnpm --filter @qghs/api typecheck, and pnpm --filter @qghs/api build."
Write-Host "Do not connect real student data until the school approves privacy and security controls."