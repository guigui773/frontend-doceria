@echo off
REM Setup automatizado para teste local
REM Este script inicia um servidor HTTP local na porta 8000

echo.
echo ================================================
echo   La Mafia dei Dolci - Servidor de Desenvolvimento
echo ================================================
echo.

REM Verificar se Python 3 está instalado
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python encontrado
    echo.
    echo Iniciando servidor em http://localhost:8000
    echo Pressione Ctrl+C para parar
    echo.
    python -m http.server 8000
) else (
    REM Tentar py (alias do Python no Windows)
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Python encontrado (via py)
        echo.
        echo Iniciando servidor em http://localhost:8000
        echo Pressione Ctrl+C para parar
        echo.
        py -m http.server 8000
    ) else (
        echo [ERRO] Python nao encontrado
        echo.
        echo Por favor, instale Python 3 de: https://python.org
        echo.
        echo Ou use Node.js:
        echo   1. npm install -g http-server
        echo   2. http-server -p 8000
        echo.
        pause
    )
)
