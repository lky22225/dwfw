@echo off
echo DwFw backend server start....
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Java and Maven set path (relative to script directory)
set JAVA_HOME=%SCRIPT_DIR%jdk-17.0.2
set PATH=%JAVA_HOME%\bin;%SCRIPT_DIR%apache-maven-3.9.6\bin;%PATH%

cd /d %SCRIPT_DIR%backend

echo Install Maven dependencies and start the server...
call mvn clean spring-boot:run

pause



