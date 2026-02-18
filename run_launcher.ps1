# CrystalTides Launcher - Fail-Safe Run Script
# Este script asegura que no haya instancias bloqueando archivos antes de compilar.

Write-Host ">>> Buscando procesos de launcher antiguos..." -ForegroundColor Cyan
$launcherProc = Get-Process launcher -ErrorAction SilentlyContinue
if ($launcherProc) {
    Write-Host ">>> Cerrando launcher activo para liberar archivos..." -ForegroundColor Yellow
    $launcherProc | Stop-Process -Force
    Start-Sleep -Seconds 1
}

Write-Host ">>> Iniciando Flutter Run..." -ForegroundColor Green
flutter pub get
flutter run -d windows
