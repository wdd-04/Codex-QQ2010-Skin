@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0skin_install.ps1"
set "skinExit=%ERRORLEVEL%"
if not "%skinExit%"=="0" (
  echo.
  echo Installation failed. Review the message above.
) else (
  echo.
  echo Codex QQ2010 Skin is installed.
)
pause
exit /b %skinExit%
