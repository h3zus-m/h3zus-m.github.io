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

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host " Live URL: https://h3zus-m.github.io/" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
