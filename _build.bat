@echo off
cd /d "C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\ai-tools-hub"
call node_modules\.bin\opennextjs-cloudflare.cmd build
if %ERRORLEVEL% NEQ 0 (
  echo BUILD FAILED with error level %ERRORLEVEL%
  pause
  exit /b %ERRORLEVEL%
)
echo BUILD SUCCEEDED
pause
