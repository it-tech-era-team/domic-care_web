@echo off
title Domic Care Web Server
cd /d "%~dp0"
echo ===================================================
echo Starting Domic Care Web Server...
echo ===================================================
:run
call npm run dev
echo.
echo Notice: Server stopped or prompted for update.
echo Press any key to restart or close this window...
pause
goto run
