@echo off
REM Windows batch script for starting the project

color 0A
echo.
echo ╔════════════════════════════════════════════╗
echo ║       CareerAI - Project Launcher          ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  .env.local not found!
    echo.
    echo Creating .env.local from .env.local.example...
    if exist .env.local.example (
        copy .env.local.example .env.local
        echo ✓ Created .env.local
        echo.
        echo Please update .env.local with your credentials in the file.
        echo Then run this script again.
        pause
        exit /b 1
    ) else (
        echo ✗ .env.local.example not found!
        pause
        exit /b 1
    )
)

echo 📋 Checking dependencies...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo ✓ Node.js %%i

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do echo ✓ npm %%i

echo.
echo 📦 Installing dependencies...

REM Install dependencies
if not exist node_modules (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ✗ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)

echo.
echo 🚀 Starting application...
echo.
echo ═══════════════════════════════════════════
echo   Application will be available at:
echo   🌐 http://localhost:3000
echo ═══════════════════════════════════════════
echo.

REM Start the development server
call npm run dev

pause
