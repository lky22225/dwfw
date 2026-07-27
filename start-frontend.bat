@echo off
echo DwFw frontend server start...
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

cd /d %SCRIPT_DIR%frontend

echo Install npm dependencies...
call npm install

echo Start development server...
call npm start

pause



