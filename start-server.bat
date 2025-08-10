@echo off
echo Installing dependencies...
call npm install

echo.
echo ========================================
echo Starting ONYXIA Admin Server...
echo ========================================
echo.

echo Admin Panel: http://localhost:3000

echo.
echo Default Credentials:
echo Username: admin
echo Password: securepassword123
echo.

node server.js
