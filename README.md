# La Mafia dei Dolci Frontend

Projeto frontend simples para cardápio, pedidos e administração local.

Este projeto funciona como um site estático e é compatível com GitHub Pages.
Todos os dados do cardápio, pedidos e sessão de administrador são salvos no navegador usando localStorage.

## Arquivos principais
- `index.html`: cardápio público e envio de pedidos
- `orders.html`: painel de pedidos
- `login.html`: login administrativo
- `admin.html`: gestão do cardápio
- `assets/`: scripts, estilos e imagens
- `data/menu.json`: menu inicial
- `assets/config.js`: lógica de armazenamento local

## Como executar localmente
1. Abra `start-server.bat` (Windows) ou `start-server.sh` (Linux/macOS)
2. Acesse `http://localhost:8000`

## Publicação no GitHub Pages
1. Envie o projeto para a branch `main` no GitHub.
2. No repositório GitHub, vá em `Settings > Pages`.
3. Em `Build and deployment`, escolha `Deploy from a branch`.
4. Selecione branch `main` e pasta `/ (root)`.

## Observações
- Não é necessário Firebase para este frontend.
- O app salva dados localmente no navegador.
- O login de administrador é controlado por credenciais locais definidas no navegador.
