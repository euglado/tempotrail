@echo off
cd /d "%~dp0"
node scripts/launch.mjs start
set "result=%errorlevel%"
pause
exit /b %result%
