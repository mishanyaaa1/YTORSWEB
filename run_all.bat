@echo off
setlocal enableextensions
title VezdehodZapchasti - Start All

echo ==============================================
echo  Starting API and Frontend (dev mode)
echo  - API:     http://localhost:3001
echo  - Frontend: http://localhost:5174
echo ==============================================

REM Start API server in a new window (install deps, run migrations, seed, start)
start "API Server" cmd /c "cd server && npm install --no-audit --no-fund && npm run migrate && npm run seed && npm run start"

REM Start Vite dev server in a new window
start "Web Client" cmd /c "npm install --no-audit --no-fund && npm run dev -- --host --port 5174 --strictPort"

echo Launch commands sent. If windows did not open, run this file as Administrator.
echo Frontend: http://localhost:5174/
echo API:      http://localhost:3001/api/health
pause


