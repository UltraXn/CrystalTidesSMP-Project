
param(
    [string]$SourcePng = "f:\Portafolio\crystaltides\apps\web-client\public\images\ui\logo.png",
    [string]$DestIco   = "f:\Portafolio\crystaltides\apps\launcher\native\app_icon.ico"
)

Write-Host "Creating High-Fidelity ICO (PNG Container method)..."

if (-not (Test-Path $SourcePng)) { throw "Source PNG not found" }

# Load bytes
$pngBytes = [System.IO.File]::ReadAllBytes($SourcePng)
$len = $pngBytes.Length

# ICO Header (6 bytes)
# Reserved (2) | Type (2) | Count (2)
$header = [byte[]]@(0, 0, 1, 0, 1, 0)

# Icon Directory Entry (16 bytes)
# Width(1) | Height(1) | Colors(1) | Res(1) | Planes(2) | BPP(2) | Size(4) | Offset(4)

# For 256px, width/height are set to 0
$width = 0   
$height = 0
$colors = 0  # True color
$res = 0
$planes = 1  # 2 bytes (1, 0)
$bpp = 32    # 2 bytes (32, 0)

# Size of image data (4 bytes, Little Endian)
$sizeBytes = [System.BitConverter]::GetBytes([int]$len)

# Offset of image data (4 bytes). Header(6) + 1 Entry(16) = 22
$offsetBytes = [System.BitConverter]::GetBytes([int]22)

# Assemble Entry
$entry = [byte[]]@(
    $width, $height, $colors, $res,
    1, 0,        # Planes
    32, 0        # BPP
) + $sizeBytes + $offsetBytes

# Write File
$fs = [System.IO.File]::Create($DestIco)
$fs.Write($header, 0, $header.Length)
$fs.Write($entry, 0, $entry.Length)
$fs.Write($pngBytes, 0, $pngBytes.Length)
$fs.Close()

Write-Host "Created $DestIco ($len bytes embedded)" -ForegroundColor Green
