$ErrorActionPreference = "Stop"

$jdk = "C:\Program Files\Java\jdk-21\bin"
if (-not (Test-Path "$jdk\javac.exe")) {
    $jdk = "C:\Program Files\Common Files\Oracle\Java\javapath"
}

$agentDir = $PSScriptRoot
Write-Host "Compiling Java Agent using JDK at: $jdk"
# Start from a clean output dir so classes from deleted sources never end up in the jar
if (Test-Path "$agentDir\target\classes") {
    Remove-Item -Recurse -Force "$agentDir\target\classes"
}
New-Item -ItemType Directory -Force -Path "$agentDir\target\classes" | Out-Null

$sources = Get-ChildItem -Path "$agentDir\src\main\java" -Recurse -Filter *.java | ForEach-Object { $_.FullName }

& "$jdk\javac.exe" --release 17 -d "$agentDir\target\classes" $sources
if ($LASTEXITCODE -ne 0) {
    Write-Error "javac compilation failed"
    exit 1
}

$jarTool = "C:\Program Files\Java\jdk-21\bin\jar.exe"
# --date fija el timestamp de las entradas: jar reproducible, porque el launcher embebe este
# binario y fija su SHA-256 (launcher-lite/src-tauri/assets/MANIFEST.md)
& $jarTool --create --date="2000-01-01T00:00:00Z" --file "$agentDir\target\game-bridge-1.0-SNAPSHOT.jar" --manifest="$agentDir\src\main\resources\META-INF\MANIFEST.MF" -C "$agentDir\target\classes" .
if ($LASTEXITCODE -ne 0) {
    Write-Error "jar creation failed"
    exit 1
}

Write-Host "SUCCESS: Generated $agentDir\target\game-bridge-1.0-SNAPSHOT.jar"
Get-Item "$agentDir\target\game-bridge-1.0-SNAPSHOT.jar" | Select-Object Name, Length, LastWriteTime
