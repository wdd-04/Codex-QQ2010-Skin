[CmdletBinding()]
param(
  [switch]$RestartExisting
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$scripts = Join-Path $root 'scripts'
. (Join-Path $scripts 'common-windows.ps1')

$codex = Get-DreamSkinCodexInstall
$running = @(Get-DreamSkinCodexProcesses -Codex $codex)
if ($running.Count -gt 0) {
  $authorized = [bool]$RestartExisting
  if (-not $authorized) {
    $authorized = Confirm-DreamSkinRestart -Message 'Codex must restart once to install the QQ2010 skin. Unsaved input may be lost. Restart now?'
  }
  if (-not $authorized) {
    Write-Host 'Cancelled; Codex was not changed.'
    exit 0
  }
  Stop-DreamSkinCodex -Codex $codex -AllowForce
}

$powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
$install = Join-Path $scripts 'install-dream-skin.ps1'
$start = Join-Path $scripts 'start-dream-skin.ps1'
$verify = Join-Path $scripts 'verify-dream-skin.ps1'

& $powershell -NoProfile -ExecutionPolicy Bypass -File $install -SkipBaseTheme
if ($LASTEXITCODE -ne 0) { throw "Install failed with exit code $LASTEXITCODE." }

& $powershell -NoProfile -ExecutionPolicy Bypass -File $start
if ($LASTEXITCODE -ne 0) { throw "Launch failed with exit code $LASTEXITCODE." }

& $powershell -NoProfile -ExecutionPolicy Bypass -File $verify
if ($LASTEXITCODE -ne 0) { throw "Verification failed with exit code $LASTEXITCODE." }

Write-Host 'Codex QQ2010 Skin was installed and verified.'
