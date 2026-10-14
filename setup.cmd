@echo off
cd /d "%~dp0"
node scripts/launch.mjs setup
set "result=%errorlevel%"
if not "%result%"=="0" echo Kurulum basarisiz / Setup failed. See README.
pause
exit /b %result%
