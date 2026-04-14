# La Mafia dei Dolci Frontend

Site estatico com vitrine de produtos, carrinho, acompanhamento de pedidos e paginas administrativas.

O frontend continua compativel com GitHub Pages, mas agora pode usar Supabase para persistencia real de:
- cardapio
- pedidos
- login administrativo
- imagens dos produtos

## Estrutura

- `index.html`: cardapio publico e envio de pedidos
- `orders.html`: painel de pedidos
- `login.html`: acesso administrativo
- `admin.html`: gestao do cardapio
- `assets/`: estilos, scripts e imagens
- `assets/supabase-config.js`: configuracao publica do Supabase
- `supabase/schema.sql`: tabelas, policies e bucket
- `SUPABASE_SETUP.md`: passo a passo da integracao

## Como abrir localmente

Abra `index.html` no navegador ou sirva a pasta com um servidor estatico.

## Publicacao no GitHub Pages

1. Faça push do projeto para a branch `main`.
2. No GitHub, abra `Settings > Pages`.
3. Em `Build and deployment`, escolha `Deploy from a branch`.
4. Selecione a branch `main` e a pasta `/ (root)`.

## Configuracao do Supabase

Veja [SUPABASE_SETUP.md](/c:/Users/guijb/Downloads/frontend/SUPABASE_SETUP.md:1).

Sem preencher `assets/supabase-config.js`, o site ainda consegue abrir o cardapio base, mas a persistencia continua limitada ao navegador local.
