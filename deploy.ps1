Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " HARSH MISTRY // PORTFOLIO ONE-CLICK GITHUB DEPLOYER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Staging all updated portfolio files..." -ForegroundColor Yellow
git add .

Write-Host "[2/3] Committing changes..." -ForegroundColor Yellow
git commit -m "feat: complete first-person Christopher Nolan narrator transformation across entire portfolio"

Write-Host "[3/3] Pushing to GitHub (h3zus-m.github.io)..." -ForegroundColor Yellow
Write-Host "Note: If prompted, authenticate via the browser pop-up." -ForegroundColor DarkGray

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Red
    Write-Host " ERROR: PUSH FAILED!" -ForegroundColor Red
    Write-Host " Reason: The repository 'h3zus-m.github.io' does not exist yet on your GitHub account." -ForegroundColor Red
    Write-Host ""
    Write-Host " Fix in 30 seconds:" -ForegroundColor Yellow
    Write-Host " 1. Open https://github.com/new in your browser" -ForegroundColor White
    Write-Host " 2. Repository name: h3zus-m.github.io" -ForegroundColor White
    Write-Host " 3. Choose 'Public' and do NOT check 'Add a README file'" -ForegroundColor White
    Write-Host " 4. Click 'Create repository'" -ForegroundColor White
    Write-Host " 5. Run this script again!" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host " Live URL: https://h3zus-m.github.io/" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
