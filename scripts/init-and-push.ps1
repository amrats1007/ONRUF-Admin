param(
  [string]$RepoUrl,
  [string]$MainBranch = "main",
  [string]$CommitMessage = "Initial commit"
)

if (-not $RepoUrl) {
  Write-Host "Usage: .\scripts\init-and-push.ps1 -RepoUrl https://github.com/USER/REPO.git" -ForegroundColor Yellow
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found in PATH."; exit 1
}

Write-Host "Initializing git repository..." -ForegroundColor Cyan
if (-not (Test-Path .git)) { git init }

# Ensure git user config exists (optional stub)
if (-not (git config user.name)) { git config user.name "onruf-dev" }
if (-not (git config user.email)) { git config user.email "dev@onruf.local" }

Write-Host "Adding files..." -ForegroundColor Cyan
git add .

if (-not (git rev-parse --verify HEAD 2>$null)) {
  git commit -m $CommitMessage
} else {
  git commit -m $CommitMessage --allow-empty
}

git branch -M $MainBranch

if (-not (git remote | Select-String origin)) {
  git remote add origin $RepoUrl
} else {
  git remote set-url origin $RepoUrl
}

Write-Host "Pushing to $RepoUrl" -ForegroundColor Cyan
try {
  git push -u origin $MainBranch
  Write-Host "Push completed." -ForegroundColor Green
} catch {
  Write-Error "Failed to push. Details: $($_.Exception.Message)"
}
