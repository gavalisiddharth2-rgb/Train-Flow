@echo off
echo Starting Train Management System Server...
echo Make sure your MySQL server is running!
echo =======================================

:: Check if node_modules exists, if not, prompt to install
if not exist "node_modules\" (
    echo [WARNING] Dependencies not found. Running npm install...
    call npm install
)

:: Run the database setup script automatically
echo [INFO] Checking and initializing Database...
node setup_db.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Cannot start the server until the database issue is fixed.
    pause
    exit /b
)

:: Open the frontend in the default browser
start http://localhost:3000

:: Start the Node.js backend
node server.js

pause
