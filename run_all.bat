@echo off
echo Starting YTORSWEB project...

echo Starting client...
start "Client" cmd /k "npm run dev"

echo Client started!
echo Client: http://localhost:5174
pause
