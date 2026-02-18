# =============================================================================
# BUILD-INSTALLER.PS1 — Builds the Crystal Installer (requires launcher + uninstaller)
# =============================================================================
# Usage: .\build-installer.ps1 [-Clean]
# Prerequisites: Run build-launcher.ps1 and build-uninstaller.ps1 first,
#                or use the main build.ps1 for a full pipeline build.
# Output: CTSMP_Installer.exe in the launcher root
# =============================================================================

param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$launcherRoot = "C:\Users\nacho\Desktop\Portafolio\crystaltides\apps\launcher"
$installerRoot = "$launcherRoot\installer"
$bootstrapperRoot = "$launcherRoot\bootstrapper"
$nativeRoot = "$launcherRoot\native"
$env:Path += ";C:\Users\nacho\Desktop\Portafolio\tools\flutter\bin"
$tempRoot = "C:\Users\nacho\.crystaltides_build_v2"
$tempLauncher = "$tempRoot\launcher"
$tempInstaller = "$tempRoot\installer"
$tempBootstrapper = "$tempRoot\bootstrapper"

function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }

# --- VALIDATE PREREQUISITES ---
$gameDistDir = "$tempLauncher\build\windows\x64\runner\Release"
$finalUninstallerExe = "$tempRoot\cargo_target_unboot\release\crystal_uninstaller_boot.exe"
$nativeDll = "$tempRoot\cargo_target_core\release\crystal_native.dll"

if (!(Test-Path $gameDistDir)) {
    throw "Launcher not built yet! Run .\build-launcher.ps1 first."
}
if (!(Test-Path $finalUninstallerExe)) {
    throw "Uninstaller not built yet! Run .\build-uninstaller.ps1 first."
}

# --- CLEANUP ---
if ($Clean) {
    Write-Host ">>> CLEANING INSTALLER BUILD ARTIFACTS..." -ForegroundColor Yellow
    Remove-Item $tempInstaller -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $tempBootstrapper -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$tempRoot\cargo_target_boot" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$launcherRoot\CTSMP_Installer.exe" -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

# ==============================================================================
# PHASE 1: Include uninstaller in launcher distribution
# ==============================================================================
Write-Step "Packaging uninstaller into launcher distribution..."
Copy-Item $finalUninstallerExe "$gameDistDir\crystal_uninstaller.exe" -Force

# ==============================================================================
# PHASE 2: Build Installer UI (Flutter)
# ==============================================================================
Write-Step "Building Installer UI (Flutter)..."

New-Item -ItemType Directory -Force -Path $tempInstaller | Out-Null
robocopy "$installerRoot" "$tempInstaller" /MIR /XD "build" "ephemeral" ".dart_tool" "pubspec.lock" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy (Installer) failed with code $LASTEXITCODE" }

Set-Location $tempInstaller
$payloadAssetDir = "$tempInstaller\assets\payload"
if (!(Test-Path $payloadAssetDir)) { New-Item -ItemType Directory -Force -Path $payloadAssetDir | Out-Null }
Compress-Archive -Path "$gameDistDir\*" -DestinationPath "$payloadAssetDir\game_payload.zip" -Force

flutter pub get
flutter build windows --release
if (-not $?) { throw "Installer UI Build Failed" }

$installerDistDir = "$tempInstaller\build\windows\x64\runner\Release"
if (Test-Path $nativeDll) {
    Copy-Item $nativeDll "$installerDistDir\installer_native.dll" -Force
}

# ==============================================================================
# PHASE 3: Build Final Bootstrapper (Rust — produces CTSMP_Installer.exe)
# ==============================================================================
Write-Step "Building Final Bootstrapper..."

New-Item -ItemType Directory -Force -Path $tempBootstrapper | Out-Null
robocopy "$bootstrapperRoot" "$tempBootstrapper" /MIR /XD "target" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy (Final Bootstrapper) failed with code $LASTEXITCODE" }

$finalPayloadZip = "$tempBootstrapper\installer_payload.zip"
Compress-Archive -Path "$installerDistDir\*" -DestinationPath $finalPayloadZip -Force

Copy-Item "$nativeRoot\app_icon.ico" "$tempBootstrapper\app_icon.ico" -Force

Set-Location $tempBootstrapper
$env:CARGO_TARGET_DIR = "$tempRoot\cargo_target_boot"
cargo build --release
if (-not $?) { throw "Bootstrapper Build Failed" }

# ==============================================================================
# DELIVERY
# ==============================================================================
Write-Step "Delivery..."
$finalExe = "$env:CARGO_TARGET_DIR\release\crystal_bootstrapper.exe"
$destExe = "$launcherRoot\CTSMP_Installer.exe"

Copy-Item $finalExe $destExe -Force

Write-Host "`n[SUCCESS] Installer AVAILABLE at: $destExe" -ForegroundColor Green
Get-Item $destExe | Select-Object Name, Length, LastWriteTime
