<#
.SYNOPSIS
  Installs a self-contained Android build toolchain (JDK 17 + Android SDK) so the LevelUp
  APK can be built locally, without Android Studio or any cloud service.

.DESCRIPTION
  Everything goes into one folder (default: %LOCALAPPDATA%\LevelUp\android-toolchain).
  No admin rights, no system-wide installs, no PATH or environment changes.
  Delete the folder to remove it all. Safe to re-run: finished steps are skipped and
  interrupted downloads resume.

  Archives are fetched with scripts/fast-download.mjs (parallel byte ranges), which is
  several times faster than sdkmanager on throttled connections. sdkmanager then verifies
  the installation and installs anything it doesn't recognise.

  Installs: Microsoft Build of OpenJDK 17, Android command-line tools, platform-tools,
  platforms;android-37.0, build-tools;37.0.0 + 36.0.0, ndk;27.1.12297006, cmake;3.22.1.

  NOTE: running this script accepts the Android SDK License Agreement
  (https://developer.android.com/studio/terms) on your behalf.

.EXAMPLE
  pnpm --filter @levelup/mobile setup:android
#>
param(
  [string]$Root = (Join-Path $env:LOCALAPPDATA "LevelUp\android-toolchain")
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Jdk = Join-Path $Root "jdk-17"
$Sdk = Join-Path $Root "sdk"
$Downloads = Join-Path $Root "downloads"
$Downloader = Join-Path $PSScriptRoot "fast-download.mjs"
New-Item -ItemType Directory -Force -Path $Root, $Sdk, $Downloads | Out-Null

$SdkPackages = @(
  "cmdline-tools;latest",
  "platform-tools",
  "platforms;android-37.0",
  "build-tools;37.0.0",
  "build-tools;36.0.0",   # requested by a native library alongside 37
  "ndk;27.1.12297006",
  "cmake;3.22.1"
)

function Get-PackageDir([string]$Package) { Join-Path $Sdk ($Package -replace ";", "\") }

function Expand-Into([string]$Zip, [string]$Target) {
  # Extract to a staging folder, then move the archive's single top-level folder
  # (or its loose contents) to the target path.
  $staging = "$Target._staging"
  if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
  New-Item -ItemType Directory -Force -Path $staging | Out-Null
  # Windows' own bsdtar by full path: another tar on PATH (e.g. Git's) misreads "C:" as a host.
  & (Join-Path $env:SystemRoot "System32\tar.exe") -xf $Zip -C $staging
  if ($LASTEXITCODE -ne 0) { throw "Extraction failed: $Zip" }
  $entries = @(Get-ChildItem $staging -Force)
  $source = if ($entries.Count -eq 1 -and $entries[0].PSIsContainer) { $entries[0].FullName } else { $staging }
  New-Item -ItemType Directory -Force -Path (Split-Path $Target) | Out-Null
  if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
  Move-Item $source $Target
  if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
}

Write-Host "LevelUp Android toolchain -> $Root"

# 1. Work out what is missing and where to download it from.
$base = "https://dl.google.com/android/repository/"
$manifestFile = Join-Path $Downloads "repository2-3.xml"
& curl.exe -fsSL -o $manifestFile "${base}repository2-3.xml"
if ($LASTEXITCODE -ne 0) { throw "Could not download the Android SDK manifest." }
[xml]$manifest = Get-Content -Raw -Encoding UTF8 $manifestFile
$jobs = @()
if (-not (Test-Path (Join-Path $Jdk "bin\java.exe"))) {
  $jdkUrl = "https://aka.ms/download-jdk/microsoft-jdk-17-windows-x64.zip"
  $jdkSha256 = ((& curl.exe -fsSL "$jdkUrl.sha256sum.txt") -split "\s+")[0]
  $jobs += [pscustomobject]@{
    Name = "jdk-17"; Url = $jdkUrl; Checksum = $(if ($jdkSha256) { "sha256:$jdkSha256" } else { "" })
    Zip = Join-Path $Downloads "microsoft-jdk-17.zip"; Target = $Jdk
  }
}
foreach ($package in $SdkPackages) {
  $dir = Get-PackageDir $package
  if (Test-Path (Join-Path $dir "source.properties")) { continue }
  $node = $manifest.GetElementsByTagName("remotePackage") | Where-Object { $_.path -eq $package }
  if (-not $node) { throw "Package $package not found in the SDK manifest." }
  $archive = @($node.archives.archive) |
    Where-Object { $_.'host-os' -eq "windows" -or -not $_.'host-os' } | Select-Object -First 1
  $sha1 = @($archive.complete.checksum)[0]
  if ($sha1 -isnot [string]) { $sha1 = $sha1.'#text' }
  $jobs += [pscustomobject]@{
    Name = $package; Url = $base + $archive.complete.url; Checksum = "sha1:$sha1"
    Zip = Join-Path $Downloads ($archive.complete.url -replace "[/\\]", "_"); Target = $dir
  }
}

# 2. Download everything in parallel.
if ($jobs.Count -gt 0) {
  Write-Host "Downloading: $($jobs.Name -join ', ')"
  # Every archive is checksum-verified by the downloader before it is kept.
  $processes = foreach ($job in $jobs) {
    $arguments = @("`"$Downloader`"", "`"$($job.Url)`"", "`"$($job.Zip)`"", "8")
    if ($job.Checksum) { $arguments += $job.Checksum }
    Start-Process -FilePath "node" -ArgumentList $arguments -NoNewWindow -PassThru
  }
  $processes | Wait-Process
  foreach ($job in $jobs) {
    if (-not (Test-Path $job.Zip)) { throw "Download failed for $($job.Name). Re-run this script to resume." }
  }

  # 3. Extract into the standard SDK layout.
  foreach ($job in $jobs) {
    Write-Host "Installing $($job.Name)"
    Expand-Into $job.Zip $job.Target
  }
} else {
  Write-Host "All archives already installed."
}

# 4. Register the packages as sdkmanager would (package.xml from Google's manifest) and
#    record licence acceptance in sdk\licenses. Without this, Gradle doesn't recognise the
#    extracted packages, refuses to build, and tries to download them again.
#    (Recent command-line tools replace sdkmanager with the "Android CLI", whose
#    --licenses no longer writes the files Gradle checks.)
Write-Host "Registering SDK packages and accepting Android SDK licences"
& node (Join-Path $PSScriptRoot "register-sdk-packages.mjs") $Sdk $manifestFile @SdkPackages
if ($LASTEXITCODE -ne 0) { throw "Registering SDK packages failed." }

# 5. Verify the layout every Android build relies on.
$missing = $SdkPackages | Where-Object { -not (Test-Path (Join-Path (Get-PackageDir $_) "source.properties")) }
if (-not (Test-Path (Join-Path $Jdk "bin\java.exe"))) { $missing += "jdk-17" }
if ($missing) { throw "Incomplete toolchain, missing: $($missing -join ', '). Re-run this script." }

Write-Host ""
Write-Host "Toolchain ready."
Write-Host "  JAVA_HOME    = $Jdk"
Write-Host "  ANDROID_HOME = $Sdk"
Write-Host "Build the APK with: pnpm --filter @levelup/mobile build:apk"
