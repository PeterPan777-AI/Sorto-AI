@echo off
REM Document Organizer Desktop Launcher for Windows
REM This script starts the application and opens it in your browser

title Document Organizer

echo ========================================
echo    Document Organizer
echo    Version 1.0.0
echo ========================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "APP_DIR=%SCRIPT_DIR%.."

REM Change to application directory
cd /d "%APP_DIR%"

echo Starting Document Organizer...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11 or later from python.org
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 22 or later from nodejs.org
    echo.
    pause
    exit /b 1
)

REM Run the Python launcher
python "%SCRIPT_DIR%launcher.py"

if errorlevel 1 (
    echo.
    echo Application exited with an error.
    echo Check the error message above for details.
    echo.
    pause
)

exit /b 0
