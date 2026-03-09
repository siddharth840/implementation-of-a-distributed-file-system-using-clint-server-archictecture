@echo off
title NimbusFS Launcher
color 0A

echo.
echo  ███╗   ██╗██╗███╗   ███╗██████╗ ██╗   ██╗███████╗███████╗███████╗
echo  ████╗  ██║██║████╗ ████║██╔══██╗██║   ██║██╔════╝██╔════╝██╔════╝
echo  ██╔██╗ ██║██║██╔████╔██║██████╔╝██║   ██║███████╗█████╗  ███████╗
echo  ██║╚██╗██║██║██║╚██╔╝██║██╔══██╗██║   ██║╚════██║██╔══╝  ╚════██║
echo  ██║ ╚████║██║██║ ╚═╝ ██║██████╔╝╚██████╔╝███████║██║     ███████║
echo  ╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝ ╚══════╝╚═╝     ╚══════╝
echo.
echo  Distributed File System - Starting up...
echo  ==========================================
echo.

REM Navigate to project root
cd /d "%~dp0"

REM --- Start Backend ---
echo  [1/2] Starting Backend (FastAPI on port 8000)...
start "NimbusFS Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Short delay to let backend spin up first
timeout /t 3 /nobreak >nul

REM --- Start Frontend ---
echo  [2/2] Starting Frontend (Vite on port 5173)...
start "NimbusFS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Short delay then open browser
timeout /t 4 /nobreak >nul

echo.
echo  ==========================================
echo  NimbusFS is running!
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:8000
echo  API Docs : http://localhost:8000/docs
echo  ==========================================
echo.
echo  Opening browser...
start "" "http://localhost:3000"

echo  Both servers are running in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
