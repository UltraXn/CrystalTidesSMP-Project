[CmdletBinding()]
param(
    [ValidateSet('all', 'pmd', 'checkstyle', 'spotbugs', 'format')]
    [string]$Tool = 'all'
)

$ErrorActionPreference = 'Continue'
$Root = $PSScriptRoot | Split-Path -Parent

$Modules = @(
    "plugins/crystalcore/pom.xml",
    "apps/game-bridge/java-agent/pom.xml",
    "mods/crystaltides-boost/pom.xml",
    "mcp-servers/oracle-mcp/src/oracle-db-mcp-java-toolkit/pom.xml"
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  CrystalTides Java Linter & Quality Suite   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if ($Tool -in @('all', 'format')) {
    Write-Host "`n[1/4] Running Spotless (Auto-format)..." -ForegroundColor Yellow
    foreach ($pom in $Modules) {
        $pomPath = Join-Path $Root $pom
        if (Test-Path $pomPath) {
            Write-Host " -> Formatting $pom" -ForegroundColor Gray
            mvn -f $pomPath spotless:apply -q
        }
    }
}

if ($Tool -in @('all', 'pmd')) {
    Write-Host "`n[2/4] Running PMD 7 (AST Code Smells & Dead Code)..." -ForegroundColor Yellow
    $pmdBin = Join-Path $Root ".tools/pmd-bin-7.10.0/bin/pmd.bat"
    $targetDirs = @(
        "plugins/crystalcore/src/main/java",
        "apps/game-bridge/java-agent/src/main/java",
        "mods/crystaltides-boost/common/src/main/java",
        "mods/crystaltides-boost/fabric/src/main/java",
        "mods/crystaltides-boost/neoforge/src/main/java",
        "mcp-servers/oracle-mcp/src/oracle-db-mcp-java-toolkit/src/main/java"
    ) | Where-Object { Test-Path (Join-Path $Root $_) }

    if (Test-Path $pmdBin) {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
        $env:PATH = "C:\Program Files\Java\jdk-21\bin;$env:PATH"
        $env:PMD_JAVA_OPTS = "-Xmx256m"
        $dirArgs = ($targetDirs | ForEach-Object { Join-Path $Root $_ }) -join ","
        & $pmdBin check -d $dirArgs --use-version java-21 -R category/java/errorprone.xml,category/java/bestpractices.xml --no-fail-on-violation -f text
    } else {
        Write-Warning "PMD binary not found at $pmdBin"
    }
}

if ($Tool -in @('all', 'checkstyle')) {
    Write-Host "`n[3/4] Running Checkstyle (Code Conventions)..." -ForegroundColor Yellow
    foreach ($pom in $Modules) {
        $pomPath = Join-Path $Root $pom
        if (Test-Path $pomPath) {
            Write-Host " -> Checking $pom" -ForegroundColor Gray
            mvn -f $pomPath checkstyle:check
        }
    }
}

if ($Tool -in @('all', 'spotbugs')) {
    Write-Host "`n[4/4] Running SpotBugs + FindSecBugs (Bytecode & Security Audit)..." -ForegroundColor Yellow
    foreach ($pom in $Modules) {
        $pomPath = Join-Path $Root $pom
        if (Test-Path $pomPath) {
            Write-Host " -> Analyzing $pom" -ForegroundColor Gray
            mvn -f $pomPath spotbugs:check
        }
    }
}

Write-Host "`nDone." -ForegroundColor Green
