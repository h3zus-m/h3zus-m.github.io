@echo off
echo ========================================================
echo  HARSH MISTRY // PORTFOLIO ONE-CLICK GITHUB DEPLOYER
echo ========================================================
echo.
echo [1/3] Staging all updated portfolio files...
git add .
echo [2/3] Committing changes...
git commit -m "feat: complete first-person Christopher Nolan narrator transformation across entire portfolio"
echo [3/3] Pushing to GitHub (h3zus-m.github.io)...
echo.
echo Note: If prompted, authenticate via the GitHub Credential Manager browser window.
echo.
git push -u origin main
echo.
echo ========================================================
echo  DEPLOYMENT COMPLETE!
echo  Your portfolio is now live at: https://h3zus-m.github.io/
echo ========================================================
pause
