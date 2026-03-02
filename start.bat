@echo off
REM Quick Start Script for Time Pass Game (Windows)

echo.
echo 🎮 Time Pass Game - Quick Start
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

echo ✅ npm version:
npm --version

echo.
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Starting development server...
echo    The game will open at http://localhost:3000
echo.
echo 📝 Controls:
echo    - Move finger left/right to switch lanes
echo    - Move finger up to jump
echo    - Avoid obstacles and get the highest score!
echo.

call npm run dev
pause
