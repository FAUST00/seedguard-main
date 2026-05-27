@echo off
REM SeedGuard Build Script for Windows
echo.
echo Building SeedGuard v2.0.0...
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

REM Build the Next.js app
echo.
echo Building Next.js application...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo Failed to build application
    pause
    exit /b 1
)

REM Export to static files
echo.
echo Exporting to static files...
call npm run export

if %ERRORLEVEL% neq 0 (
    echo Failed to export files
    pause
    exit /b 1
)

echo.
echo Done! Build complete!
echo Package is ready for deployment.
echo Check the 'out' directory for the built files.
echo.
pause
