# =============================================================================
# BUILD-UNINSTALLER.PS1 — Builds the Crystal Uninstaller + Bootstrapper
# =============================================================================
# Usage: .\build-uninstaller.ps1 [-Clean]
# Output: uninstaller bootstrapper exe in temp build dir
# =============================================================================

param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$launcherRoot = "C:\Users\nacho\Desktop\Portafolio\crystaltides\apps\launcher"
$uninstallerRoot = "$launcherRoot\uninstaller"
$uninstallerBootRoot = "$launcherRoot\uninstaller_bootstrapper"
$nativeRoot = "$launcherRoot\native"
$env:Path += ";C:\Users\nacho\Desktop\Portafolio\tools\flutter\bin"
$tempRoot = "C:\Users\nacho\.crystaltides_build_v2"
$tempNative = "$tempRoot\native"
$tempUninstaller = "$tempRoot\uninstaller"
$tempUninstallerBoot = "$tempRoot\uninstaller_boot"

function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }

# --- CLEANUP ---
if ($Clean) {
    Write-Host ">>> CLEANING UNINSTALLER BUILD ARTIFACTS..." -ForegroundColor Yellow
    Remove-Item $tempUninstaller -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $tempUninstallerBoot -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$tempRoot\cargo_target_unboot" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

# ==============================================================================
# PHASE 1: Build Native DLL (needed by uninstaller for FFI)
# ==============================================================================
Write-Step "Building Core Rust Library (crystal_native.dll)..."
New-Item -ItemType Directory -Force -Path $tempNative | Out-Null
robocopy "$nativeRoot" "$tempNative" /MIR /XD "target" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy (Native Core) failed with code $LASTEXITCODE" }

Set-Location $tempNative
$env:CARGO_TARGET_DIR = "$tempRoot\cargo_target_core"
cargo build --release --lib
if (-not $?) { throw "Core Lib Build Failed" }
$nativeDll = "$env:CARGO_TARGET_DIR\release\crystal_native.dll"

# ==============================================================================
# PHASE 2: Build Uninstaller Flutter UI
# ==============================================================================
Write-Step "Building Uninstaller (Flutter)..."

New-Item -ItemType Directory -Force -Path $tempUninstaller | Out-Null
robocopy "$uninstallerRoot" "$tempUninstaller" /MIR /XD "build" "ephemeral" ".dart_tool" "pubspec.lock" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy (Uninstaller) failed with code $LASTEXITCODE" }

Set-Location $tempUninstaller
flutter pub get
flutter build windows --release
if (-not $?) { throw "Uninstaller Build Failed" }

$uninstallerDistDir = "$tempUninstaller\build\windows\x64\runner\Release"
Copy-Item $nativeDll "$uninstallerDistDir\installer_native.dll" -Force
if (Test-Path "$uninstallerDistDir\uninstaller.exe") {
    Rename-Item "$uninstallerDistDir\uninstaller.exe" "$uninstallerDistDir\crystal_uninstaller.exe" -Force
}

# ==============================================================================
# PHASE 3: Build Uninstaller Bootstrapper (single-file .exe wrapper)
# ==============================================================================
Write-Step "Building Uninstaller Bootstrapper..."

New-Item -ItemType Directory -Force -Path $tempUninstallerBoot | Out-Null
robocopy "$uninstallerBootRoot" "$tempUninstallerBoot" /MIR /XD "target" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy (Uninstaller Bootstrapper) failed with code $LASTEXITCODE" }

$uninstallerPayloadZip = "$tempUninstallerBoot\uninstaller_payload.zip"
Compress-Archive -Path "$uninstallerDistDir\*" -DestinationPath $uninstallerPayloadZip -Force

Set-Location $tempUninstallerBoot
$env:CARGO_TARGET_DIR = "$tempRoot\cargo_target_unboot"
cargo build --release
if (-not $?) { throw "Uninstaller Bootstrapper Build Failed" }

$finalUninstallerExe = "$env:CARGO_TARGET_DIR\release\crystal_uninstaller_boot.exe"
Write-Host "`n[SUCCESS] Uninstaller built at: $finalUninstallerExe" -ForegroundColor Green
