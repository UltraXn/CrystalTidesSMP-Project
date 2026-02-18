# =============================================================================
# BUILD-LAUNCHER.PS1 — Builds the Crystal Launcher (Flutter + Rust Native DLL)
# =============================================================================
# Usage: .\build-launcher.ps1 [-Clean]
# Output: launcher release in temp build dir
# =============================================================================

param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$launcherRoot = "C:\Users\nacho\Desktop\Portafolio\crystaltides\apps\launcher"
$nativeRoot = "$launcherRoot\native"
$env:Path += ";C:\Users\nacho\Desktop\Portafolio\tools\flutter\bin"
$tempRoot = "C:\Users\nacho\.crystaltides_build_v2"
$tempLauncher = "$tempRoot\launcher"
$tempNative = "$tempRoot\native"

function Write-Step { param([string]$msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }

# --- CLEANUP ---
if ($Clean) {
    Write-Host ">>> CLEANING LAUNCHER BUILD ARTIFACTS..." -ForegroundColor Yellow
    Remove-Item $tempLauncher -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $tempNative -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$tempRoot\cargo_target_core" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

# ==============================================================================
# PHASE 1: Build Native DLL (Rust core library)
# ==============================================================================
Write-Step "Building Core Rust Library (CrystalNative.dll)..."
New-Item -ItemType Directory -Force -Path $tempNative | Out-Null
robocopy "$nativeRoot" "$tempNative" /MIR /XD "target" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy (Native Core) failed with code $LASTEXITCODE" }

Set-Location $tempNative
$env:CARGO_TARGET_DIR = "$tempRoot\cargo_target_core"
cargo build --release --lib
if (-not $?) { throw "Core Lib Build Failed" }
$nativeDll = "$env:CARGO_TARGET_DIR\release\CrystalNative.dll"

# ==============================================================================
# PHASE 2: Build Main Launcher (Flutter)
# ==============================================================================
Write-Step "Building Game Client (Main Launcher)..."

New-Item -ItemType Directory -Force -Path $tempLauncher | Out-Null
robocopy "$launcherRoot" "$tempLauncher" /MIR /XD "build" "ephemeral" ".dart_tool" "pubspec.lock" "installer" "bootstrapper" "native" "scripts" "uninstaller" "uninstaller_bootstrapper" > $null
if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with code $LASTEXITCODE" }

# Place CrystalNative.dll where CMake expects it
$nativeDllDest = "$tempLauncher\native\target\release"
if (!(Test-Path $nativeDllDest)) { New-Item -ItemType Directory -Force -Path $nativeDllDest | Out-Null }
Copy-Item $nativeDll "$nativeDllDest\crystal_native.dll" -Force
Write-Host "  -> crystal_native.dll placed at $nativeDllDest" -ForegroundColor DarkGray

Set-Location $tempLauncher
flutter pub get
flutter build windows --release
if (-not $?) { throw "Game Client Build Failed" }

$gameDistDir = "$tempLauncher\build\windows\x64\runner\Release"
if (Test-Path "$gameDistDir\launcher.exe") {
    if (Test-Path "$gameDistDir\crystal_launcher.exe") {
        Remove-Item "$gameDistDir\crystal_launcher.exe" -Force
    }
    Rename-Item "$gameDistDir\launcher.exe" "$gameDistDir\crystal_launcher.exe" -Force
}

# Copy native DLL into the distribution
Copy-Item $nativeDll "$gameDistDir\crystal_native.dll" -Force

Write-Host "`n[SUCCESS] Launcher built at: $gameDistDir" -ForegroundColor Green
