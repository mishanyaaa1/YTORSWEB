@echo off
echo Starting YTORSWEB project...

echo Starting server...
start "Server" cmd /k "cd server && npm start"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Starting client...
start "Client" cmd /k "npm run dev"

echo All services started!
echo Server: http://localhost:3001
echo Client: http://localhost:5174
pause
