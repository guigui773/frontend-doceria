#!/bin/bash

# Setup automatizado para teste local (Linux/macOS)
# Este script inicia um servidor HTTP local na porta 8000

echo ""
echo "================================================"
echo "  La Mafia dei Dolci - Servidor de Desenvolvimento"
echo "================================================"
echo ""

# Verificar se Python 3 está instalado
if command -v python3 &> /dev/null; then
    echo "[OK] Python 3 encontrado"
    echo ""
    echo "Iniciando servidor em http://localhost:8000"
    echo "Pressione Ctrl+C para parar"
    echo ""
    cd "$(dirname "$0")"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "[OK] Python encontrado"
    echo ""
    echo "Iniciando servidor em http://localhost:8000"
    echo "Pressione Ctrl+C para parar"
    echo ""
    cd "$(dirname "$0")"
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "[OK] Node.js encontrado"
    echo ""
    
    # Verificar se http-server está instalado
    if npm list -g http-server &> /dev/null; then
        echo "Iniciando servidor em http://localhost:8000"
        echo "Pressione Ctrl+C para parar"
        echo ""
        cd "$(dirname "$0")"
        http-server -p 8000
    else
        echo "[AVISO] http-server não instalado"
        echo ""
        echo "Para instalar, execute:"
        echo "  npm install -g http-server"
        echo ""
        echo "Depois tente novamente"
    fi
else
    echo "[ERRO] Python 3 ou Node.js não encontrado"
    echo ""
    echo "Por favor, instale um deles:"
    echo "  - Python 3: https://python.org"
    echo "  - Node.js: https://nodejs.org"
    echo ""
    echo "Após instalar, execute novamente:"
    echo "  ./start-server.sh"
fi
