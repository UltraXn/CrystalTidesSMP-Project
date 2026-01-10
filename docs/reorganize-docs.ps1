# CrystalTides Documentation Reorganization Script
# Run this from: f:\Portafolio\crystaltides\docs

Write-Host "🚀 Starting CrystalTides Documentation Reorganization..." -ForegroundColor Cyan

# Step 1: Create directory structure
Write-Host "`n📁 Creating directory structure..." -ForegroundColor Yellow

$directories = @(
    "getting-started",
    "architecture",
    "components",
    "features",
    "operations",
    "api"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ⊙ Exists: $dir" -ForegroundColor Gray
    }
}

# Step 2: Move existing files to new structure
Write-Host "`n📦 Moving existing files..." -ForegroundColor Yellow

$moves = @{
    # Architecture
    "CRYSTAL_BRIDGE.md" = "architecture\CRYSTAL_BRIDGE.md"
    "ARCHITECTURE.md" = "architecture\OVERVIEW.md"
    
    # Components
    "LAUNCHER.md" = "components\LAUNCHER.md"
    "GAME_BRIDGE.md" = "components\GAME_AGENT.md"
    "FRONTEND_ARCHITECTURE.md" = "components\WEB_CLIENT.md"
    "DISCORD_INTEGRATION.md" = "components\DISCORD_BOT.md"
    
    # Features
    "GACHA_SYSTEM.md" = "features\GACHA_SYSTEM.md"
    "FORUM_SYSTEM.md" = "features\FORUM_SYSTEM.md"
    "USER_PROFILES.md" = "features\USER_PROFILES.md"
    "STAFF_HUB.md" = "features\STAFF_HUB.md"
    "GOOGLE_INTEGRATION.md" = "features\GOOGLE_INTEGRATION.md"
    
    # Operations
    "CI_CD.md" = "operations\CI_CD.md"
    "SECURITY_AUDIT.md" = "operations\SECURITY.md"
    "CODE_QUALITY.md" = "operations\CODE_QUALITY.md"
    "GCP_DEPLOYMENT.md" = "operations\GCP_DEPLOYMENT.md"
}

foreach ($source in $moves.Keys) {
    $destination = $moves[$source]
    
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $destination -Force
        Write-Host "  ✓ Moved: $source → $destination" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Not found: $source" -ForegroundColor Yellow
    }
}

# Step 3: Move roadmap folder
Write-Host "`n📋 Organizing roadmap..." -ForegroundColor Yellow

if (Test-Path "roadmap") {
    Write-Host "  ✓ Roadmap folder already in place" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Roadmap folder not found" -ForegroundColor Yellow
}

# Step 4: Summary
Write-Host "`n✅ Reorganization Complete!" -ForegroundColor Cyan
Write-Host "`nNew structure:" -ForegroundColor White
Write-Host "  docs/" -ForegroundColor Gray
Write-Host "  ├── README.md" -ForegroundColor White
Write-Host "  ├── MASTER_PRD.md" -ForegroundColor White
Write-Host "  ├── getting-started/" -ForegroundColor Cyan
Write-Host "  ├── architecture/" -ForegroundColor Cyan
Write-Host "  ├── components/" -ForegroundColor Cyan
Write-Host "  ├── features/" -ForegroundColor Cyan
Write-Host "  ├── operations/" -ForegroundColor Cyan
Write-Host "  ├── api/" -ForegroundColor Cyan
Write-Host "  └── roadmap/" -ForegroundColor Cyan

Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review moved files" -ForegroundColor White
Write-Host "  2. Create missing documentation (RUST_JAVA_BRIDGE.md, SUPABASE_INTEGRATION.md, etc.)" -ForegroundColor White
Write-Host "  3. Update internal links in moved files" -ForegroundColor White
Write-Host "  4. Commit changes to git" -ForegroundColor White

Write-Host "`n🎉 Done!" -ForegroundColor Green
