# Install the Pitch_WF kit for Claude Code on Windows (PowerShell). Draft, not run yet.
#   powershell -ExecutionPolicy Bypass -File scripts\install.ps1
# Needs the short-loop workflow installed first (its WORKFLOW.md section 3 sets WORKFLOW_DIR).
# - copies the kit's commands to %USERPROFILE%\.claude\commands\ (copies: run this again after a git pull)
# - sets the user environment variable PITCH_WF to this kit's folder
$ErrorActionPreference = "Stop"
$Kit  = Split-Path -Parent $PSScriptRoot
$Cmds = Join-Path $env:USERPROFILE ".claude\commands"

$Wf = $env:WORKFLOW_DIR
if (-not $Wf) { $Wf = [Environment]::GetEnvironmentVariable("WORKFLOW_DIR", "User") }
if (-not $Wf -or -not (Test-Path (Join-Path $Wf "templates\commands"))) {
    Write-Host "WORKFLOW_DIR is not set, or is not the workflow folder: '$Wf'."
    Write-Host "Install the short-loop workflow first (its WORKFLOW.md section 3), then run this again."
    exit 1
}

New-Item -ItemType Directory -Force -Path $Cmds | Out-Null
Copy-Item (Join-Path $Kit "commands\*.md") "$Cmds\"
Get-ChildItem -File -Filter *.md (Join-Path $Kit "commands") | ForEach-Object { Write-Host "installed /$($_.BaseName)" }
if (-not (Test-Path (Join-Path $Cmds "start.md"))) {
    Write-Host "/start is not installed: run the workflow's WORKFLOW.md section 3 steps in $Wf"
}

[Environment]::SetEnvironmentVariable("PITCH_WF", $Kit, "User")
Write-Host "PITCH_WF set to $Kit (restart Claude Desktop and terminals to pick it up)"
