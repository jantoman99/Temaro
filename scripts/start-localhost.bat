@echo off
setlocal

cd /d "%~dp0.."

echo.
echo Spoustim rezervacni system...
echo.
echo Po nacteni otevri v prohlizeci:
echo http://localhost:3000
echo.
echo Pro vypnuti zavri toto okno nebo stiskni Ctrl+C.
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo CHYBA: Windows nenasel prikaz npm.
  echo.
  echo Pravdepodobne neni nainstalovany Node.js, nebo neni dostupny v PATH.
  echo Nainstaluj Node.js LTS z https://nodejs.org/
  echo Pak zavri toto okno a zkus soubor spustit znovu.
  echo.
  pause
  exit /b 1
)

if not exist node_modules\.bin\next.cmd (
  echo Pripravuji projekt pro Windows spusteni.
  echo Instaluji balicky, muze to par minut trvat...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo CHYBA: Instalace balicku selhala.
    echo.
    pause
    exit /b 1
  )
)

call npm run dev

echo.
echo Server se ukoncil nebo nastala chyba.
echo.
pause
