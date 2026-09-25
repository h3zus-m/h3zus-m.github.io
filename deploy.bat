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
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================
    echo  ERROR: PUSH FAILED!
    echo  Reason: The repository 'h3zus-m.github.io' does not exist yet on your GitHub account.
    echo.
    echo  Fix in 30 seconds:
    echo  1. Open https://github.com/new in your browser
    echo  2. Repository name: h3zus-m.github.io
    echo  3. Choose 'Public' and do NOT check 'Add a README file'
    echo  4. Click 'Create repository'
    echo  5. Run this script again!
    echo ========================================================
    pause
    exit /b 1
)
echo.
echo ========================================================
echo  DEPLOYMENT COMPLETE!
echo  Your portfolio is now live at: https://h3zus-m.github.io/
echo ========================================================
pause
