@echo off
title Starting Jewellery Management System (JMS)
echo ======================================================================
echo           Starting Jewellery Enterprise Management System
echo ======================================================================

echo.
echo [1/3] Starting Local PostgreSQL Database...
netstat -ano | findstr 127.0.0.1:5432 >nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is already running on port 5432.
) else (
    "%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" -l "%~dp0pgsql\logfile.log" start
    timeout /t 3 /nobreak >nul
    echo [OK] PostgreSQL started.
)

echo.
echo [2/3] Starting Backend API Server (Port 5000)...
start "JMS Backend API (Port 5000)" cmd /k "cd /d "%~dp0jms-backend-main" && npm start"
timeout /t 4 /nobreak >nul

echo.
echo [3/3] Starting Frontend Application (Port 5173)...
start "JMS Frontend (Port 5173)" cmd /k "cd /d "%~dp0jms-frontend-main" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo  All Services Running!
echo  - Frontend Web UI : http://localhost:5173
echo  - Backend API     : http://localhost:5000/api/v1
echo  - Swagger Docs    : http://localhost:5000/docs
echo  - Health Status   : http://localhost:5000/health
echo ======================================================================
echo Opening browser...
start http://localhost:5173
