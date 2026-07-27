@echo off
echo DwFw System start...
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Java and Maven set path (relative to script directory)
set JAVA_HOME=%SCRIPT_DIR%jdk-17.0.2
set PATH=%JAVA_HOME%\bin;%SCRIPT_DIR%apache-maven-3.9.6\bin;%PATH%

echo Start backend server in background...
start "DwFw Backend" cmd /k "cd /d %SCRIPT_DIR%backend && set JAVA_HOME=%SCRIPT_DIR%jdk-17.0.2 && set PATH=%JAVA_HOME%\bin;%SCRIPT_DIR%apache-maven-3.9.6\bin;%PATH% && mvn clean spring-boot:run"

echo Wait for a moment... (until the backend server starts)
timeout /t 15 /nobreak

echo Start frontend server...
start "DwFw Frontend" cmd /k "cd /d %SCRIPT_DIR%frontend && npm install && npm start"

echo.
echo System started!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Default login information:
echo Username: ADMIN
echo Password: 1
echo.

pause



