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

REM --- Start Storage Nodes ---
echo  [1/3] Starting Storage Nodes (Ports 8001-8003)...
start "NimbusFS Node 1" cmd /k "cd /d %~dp0backend && python node_server.py --node node1 --port 8001"
start "NimbusFS Node 2" cmd /k "cd /d %~dp0backend && python node_server.py --node node2 --port 8002"
start "NimbusFS Node 3" cmd /k "cd /d %~dp0backend && python node_server.py --node node3 --port 8003"

REM Short delay for nodes to start
timeout /t 2 /nobreak >nul

REM --- Start Backend ---
echo  [2/3] Starting Main Backend (FastAPI on port 8000)...
start "NimbusFS Main Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8005"

REM Short delay to let backend spin up first
timeout /t 3 /nobreak >nul

REM --- Start Frontend ---
echo  [3/3] Starting Frontend (Vite on port 5173)...
start "NimbusFS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Short delay then open browser
timeout /t 4 /nobreak >nul

echo.
echo  ==========================================
echo  NimbusFS is running!
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:8005
echo  API Docs : http://localhost:8005/docs
echo  ==========================================
echo.
echo  Opening browser...
start "" "http://localhost:3000"

echo  Both servers are running in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
