$ModsDir = "C:\Users\nacho\AppData\Roaming\.minecraft\mods"
$SqlFile = "insert_mods.sql"
$ErrorActionPreference = "Stop"

# --- CONFIGURATION (UPDATE THESE) ---
# --- CONFIGURATION (UPDATE THESE) ---
$BucketName = "ctlauncher"
$R2PublicUrl = "https://pub-3a18f6cd71c44a49b8f2f2e48e14a744.r2.dev" 
$R2RemoteName = "r2" # The name of the remote configured in rclone

Write-Host "Starting Mod Sync with Cloudflare R2 Support..." -ForegroundColor Cyan
Write-Host "Source: $ModsDir"
Write-Host "Target Bucket: $BucketName"

Write-Host "Checking rclone installation..."
if (!(Get-Command rclone -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: rclone not found. Please install it (https://rclone.org/) and configure your R2 remote." -ForegroundColor Red
    exit 1
}

# 2. Process Files
$SqlContent = "-- SQL to update official_mods with Proxy URLs`n"
$SqlContent += "TRUNCATE TABLE official_mods;`n"
$Files = Get-ChildItem -LiteralPath $ModsDir -Filter *.jar

Write-Host "Found $( $Files.Count ) mods."

foreach ($File in $Files) {
    $FileName = $File.Name
    Write-Host "Processing $FileName... " -NoNewline
    
    try {
        $Hash = (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA1).Hash.ToLower()
    } catch {
        Write-Host "[Hash Error: $_]" -ForegroundColor Red
        continue
    }
    
    # URL de Cloudflare R2
    $EncodedName = [Uri]::EscapeDataString($FileName)
    $DownloadUrl = "$R2PublicUrl/$EncodedName"
    
    $NameSafe = $FileName.Replace("'", "''")
    $SqlContent += "INSERT INTO official_mods (name, version, download_url, sha1) VALUES ('$NameSafe', '1.0', '$DownloadUrl', '$Hash');`n"
    
    # Upload to R2 using rclone
    try {
        Write-Host "Uploading to R2... " -NoNewline
        rclone copyto $File.FullName "$($R2RemoteName):$($BucketName)/$($FileName)" --progress
        Write-Host "[OK]" -ForegroundColor Green
    } catch {
        Write-Host "[Error: $_]" -ForegroundColor Red
    }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$SqlFilePath = Join-Path $ScriptDir $SqlFile

Set-Content -Path $SqlFilePath -Value $SqlContent
Write-Host "`nDone! SQL script saved to $SqlFilePath" -ForegroundColor Cyan
Write-Host "Run this SQL in Supabase Dashboard to update the mod list with Proxy URLs." -ForegroundColor Yellow
