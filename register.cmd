@echo off
cd /d "%~dp0"
node scripts/launch.mjs register
set "result=%errorlevel%"
pause
exit /b %result%
