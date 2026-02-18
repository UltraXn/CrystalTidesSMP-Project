# Central Build Orchestrator
param([switch]$Clean)
$ErrorActionPreference = "Stop"
$launcherRoot = "C:\Users\nacho\Desktop\Portafolio\crystaltides\apps\launcher"

function Write-Phase($msg) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host " $msg" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
}

if ($Clean) {
    Write-Host ">>> FULL CLEAN: Removing ALL build artifacts..." -ForegroundColor Yellow
    $tempRoot = "C:\Users\nacho\.crystaltides_build_v2"
    if (Test-Path $tempRoot) { Remove-Item $tempRoot -Recurse -Force -ErrorAction SilentlyContinue }
    Remove-Item "$launcherRoot\CTSMP_Installer.exe" -Force -ErrorAction SilentlyContinue
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()

Write-Phase "1/3 BUILDING LAUNCHER"
$launcherArgs = @()
if ($Clean) { $launcherArgs += "-Clean" }
& "$launcherRoot\build-launcher.ps1" @launcherArgs

Write-Phase "2/3 BUILDING UNINSTALLER"
$uninstallerArgs = @()
if ($Clean) { $uninstallerArgs += "-Clean" }
& "$launcherRoot\build-uninstaller.ps1" @uninstallerArgs

Write-Phase "3/3 BUILDING INSTALLER"
$installerArgs = @()
if ($Clean) { $installerArgs += "-Clean" }
& "$launcherRoot\build-installer.ps1" @installerArgs

$sw.Stop()
$elapsed = $sw.Elapsed.ToString()

# Calculate Hash for Integrity verification
Write-Phase "FINAL STEPS"
$installerFile = "$launcherRoot\CTSMP_Installer.exe"
if (Test-Path $installerFile) {
    Write-Host "Calculating SHA-256 hash..." -ForegroundColor Cyan
    $hash = (Get-FileHash -Path $installerFile -Algorithm SHA256).Hash.ToLower()
    Write-Host ">>> SHA-256: $hash" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " FULL BUILD COMPLETED in $elapsed" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
