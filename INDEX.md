# Documentação do Projeto

Este projeto é um site estático para GitHub Pages com funcionalidades de menu, pedidos e administração local.

## Arquivos úteis
- `README.md` — visão geral do projeto
- `index.html` — vitrine pública e envio de pedidos
- `orders.html` — painel de pedidos
- `login.html` — login administrativo
- `admin.html` — painel de edição do cardápio
- `assets/config.js` — armazenamento local e lógica de negócios
- `assets/app.js`, `assets/admin.js`, `assets/orders.js` — scripts da aplicação
- `assets/style.css` — estilos

## Como usar
1. Inicie o servidor local com `start-server.bat` ou `start-server.sh`.
2. Abra `http://localhost:8000`.

## Sem Firebase
Este projeto foi ajustado para funcionar sem nenhuma integração Firebase.
Todos os dados são mantidos localmente no navegador.
