@echo off
cd /d "%~dp0"

echo ========================================
echo  VirtualFurniture local server
echo ========================================
echo.
echo  Browser: http://localhost:8080
echo  Keep this window open while using the site.
echo  Press Ctrl+C to stop.
echo.

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:8080/index.html"
  py -m http.server 8080
  goto :eof
)

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:8080/index.html"
  python -m http.server 8080
  goto :eof
)

where npx >nul 2>&1
if %ERRORLEVEL%==0 (
  start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:8080"
  npx --yes serve -l 8080
  goto :eof
)

echo [ERROR] Python or Node.js not found.
echo Install one of them, then run this file again.
echo Or run manually:
echo   python -m http.server 8080
echo Then open http://localhost:8080/index.html
echo.
pause
