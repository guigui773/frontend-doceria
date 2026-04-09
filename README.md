# La Mafia dei Dolci Frontend

Site estático com vitrine de produtos, carrinho, acompanhamento de pedidos e páginas administrativas simples.

## Estrutura

- `index.html`: cardápio público e envio de pedidos
- `orders.html`: consulta de pedidos
- `login.html`: acesso administrativo
- `admin.html`: gestão do cardápio e pedidos
- `assets/`: estilos, scripts e imagens
- `data/menu.json`: cardápio inicial

## Como abrir localmente

Basta abrir `index.html` no navegador ou servir a pasta com um servidor estático.

## Publicação no GitHub Pages

1. Crie um repositório vazio no GitHub.
2. Conecte este projeto ao repositório remoto.
3. Faça o primeiro push para a branch principal.
4. No GitHub, abra `Settings > Pages`.
5. Em `Build and deployment`, escolha `Deploy from a branch`.
6. Selecione a branch `main` e a pasta `/ (root)`.

## Observação

O arquivo `assets/config.js` usa credenciais administrativas locais em memória do navegador. Para um site em produção, o ideal é migrar login e pedidos para um backend real.
