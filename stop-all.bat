@echo off
title Stopping Jewellery Management System (JMS)
echo ======================================================================
echo           Stopping Jewellery Enterprise Management System
echo ======================================================================

echo.
echo Stopping Node.js processes (Backend & Frontend)...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Stopping Local PostgreSQL Database...
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" stop >nul 2>&1

echo.
echo ======================================================================
echo  All JMS Services have been stopped successfully.
echo ======================================================================
pause
